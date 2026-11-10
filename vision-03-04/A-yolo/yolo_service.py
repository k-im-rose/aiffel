"""사진을 넣으면 YOLO detection 박스와 segmentation 마스크를 보여 주고 저장하는 작은 서비스.

사용:
    python yolo_service.py input/bus.jpg input/my_photo.jpg
    python yolo_service.py input/bus.jpg --conf 0.25 0.50 --classes person bus

결과 (사진 이름별 폴더):
    outputs/yolo/<사진>/conf0.25/det.jpg      박스·클래스·점수를 그린 이미지
    outputs/yolo/<사진>/conf0.25/det.json     박스 좌표(JSON)
    outputs/yolo/<사진>/conf0.25/seg.jpg      마스크를 원본에 반투명으로 겹친 이미지
    outputs/yolo/<사진>/conf0.25/seg.json     마스크별 클래스·점수·박스·면적
    outputs/yolo/<사진>/conf0.25/masks/       마스크 한 개당 흑백 PNG 한 장
    outputs/yolo/<사진>/panel_conf0.25.jpg    원본 | 박스 | 마스크 나란히
    outputs/yolo/<사진>/compare.jpg           두 임계값의 박스 결과 나란히
    outputs/yolo/<사진>/compare.json          높은 임계값에서 사라진 박스 목록
    outputs/yolo/manifest.json                입력·모델·버전·실행 위치·설정 기록
    outputs/yolo/code/yolo_service.py         이 실행에 쓴 코드 사본
"""
import argparse
import hashlib
import json
import os
import platform
import shutil
import sys
from datetime import datetime, timezone
from pathlib import Path

import cv2
import numpy as np
import torch
import ultralytics
from ultralytics import YOLO

HERE = Path(__file__).resolve().parent
DET_MODEL = "yolo26n.pt"
SEG_MODEL = "yolo26n-seg.pt"
IMGSZ = 640
DEVICE = "cpu"


def sha256(path):
    h = hashlib.sha256()
    with open(path, "rb") as f:
        for chunk in iter(lambda: f.read(1 << 20), b""):
            h.update(chunk)
    return h.hexdigest()


def class_ids(model, names):
    """클래스 이름 목록을 모델의 클래스 번호로 바꾼다. 없는 이름이면 멈춘다."""
    if not names:
        return None
    lookup = {v: k for k, v in model.names.items()}
    missing = [n for n in names if n not in lookup]
    if missing:
        sys.exit(f"모델 클래스 목록에 없는 이름: {missing}\n가능한 이름: {sorted(lookup)}")
    return [lookup[n] for n in names]


def boxes_to_list(result):
    out = []
    for i, b in enumerate(result.boxes):
        x1, y1, x2, y2 = (round(float(v), 1) for v in b.xyxy[0])
        cls = int(b.cls[0])
        out.append({
            "id": i,
            "class": result.names[cls],
            "class_id": cls,
            "score": round(float(b.conf[0]), 4),
            "xyxy": [x1, y1, x2, y2],
        })
    return out


def label(img, text):
    """이미지 왼쪽 위에 흰 바탕 검은 글씨로 제목을 붙인다."""
    img = img.copy()
    (w, h), _ = cv2.getTextSize(text, cv2.FONT_HERSHEY_SIMPLEX, 0.9, 2)
    cv2.rectangle(img, (0, 0), (w + 16, h + 16), (255, 255, 255), -1)
    cv2.putText(img, text, (8, h + 8), cv2.FONT_HERSHEY_SIMPLEX, 0.9, (0, 0, 0), 2)
    return img


def overlay_masks(orig, result, alpha=0.5):
    """마스크를 원본 크기로 맞춰 반투명 색으로 겹치고, 윤곽선과 번호를 그린다."""
    out = orig.copy()
    h, w = orig.shape[:2]
    binaries = []
    if result.masks is None:
        return out, binaries
    rng = np.random.default_rng(0)
    for i, m in enumerate(result.masks.data.cpu().numpy()):
        mask = cv2.resize(m, (w, h), interpolation=cv2.INTER_LINEAR) > 0.5
        binaries.append(mask)
        color = rng.integers(60, 255, 3).tolist()
        out[mask] = (out[mask] * (1 - alpha) + np.array(color) * alpha).astype(np.uint8)
        contours, _ = cv2.findContours(mask.astype(np.uint8), cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
        cv2.drawContours(out, contours, -1, color, 2)
    for i, b in enumerate(result.boxes):
        x1, y1 = (int(v) for v in b.xyxy[0][:2])
        name = result.names[int(b.cls[0])]
        text = f"#{i} {name} {float(b.conf[0]):.2f}"
        (tw, th), _ = cv2.getTextSize(text, cv2.FONT_HERSHEY_SIMPLEX, 0.6, 1)
        cv2.rectangle(out, (x1, y1), (x1 + tw + 8, y1 + th + 10), (255, 255, 255), -1)
        cv2.putText(out, text, (x1 + 4, y1 + th + 5), cv2.FONT_HERSHEY_SIMPLEX, 0.6, (0, 0, 0), 1)
    return out, binaries


def run_one(image_path, conf, det, seg, classes_det, classes_seg, out_dir):
    orig = cv2.imread(str(image_path))
    if orig is None:
        sys.exit(f"사진을 열 수 없습니다: {image_path}")
    d = out_dir / f"conf{conf:.2f}"
    (d / "masks").mkdir(parents=True, exist_ok=True)

    common = dict(imgsz=IMGSZ, device=DEVICE, conf=conf, verbose=False)
    r_det = det.predict(str(image_path), classes=classes_det, **common)[0]
    r_seg = seg.predict(str(image_path), classes=classes_seg, **common)[0]

    det_list = boxes_to_list(r_det)
    det_img = r_det.plot()
    cv2.imwrite(str(d / "det.jpg"), det_img)
    (d / "det.json").write_text(json.dumps(
        {"image": image_path.name, "model": DET_MODEL, "conf": conf, "image_size": list(orig.shape[1::-1]),
         "boxes": det_list}, ensure_ascii=False, indent=2))

    seg_img, binaries = overlay_masks(orig, r_seg)
    cv2.imwrite(str(d / "seg.jpg"), seg_img)
    seg_list = boxes_to_list(r_seg)
    for item, mask in zip(seg_list, binaries):
        name = f"mask_{item['id']:02d}_{item['class']}.png"
        cv2.imwrite(str(d / "masks" / name), mask.astype(np.uint8) * 255)
        item["mask_file"] = f"masks/{name}"
        item["mask_area_px"] = int(mask.sum())
        x1, y1, x2, y2 = item["xyxy"]
        box_area = max((x2 - x1) * (y2 - y1), 1)
        item["mask_fill_of_box"] = round(item["mask_area_px"] / box_area, 3)  # 박스 중 마스크가 차지한 비율
    (d / "seg.json").write_text(json.dumps(
        {"image": image_path.name, "model": SEG_MODEL, "conf": conf, "image_size": list(orig.shape[1::-1]),
         "masks": seg_list}, ensure_ascii=False, indent=2))

    panel = np.hstack([label(orig, "original"), label(det_img, f"detect conf={conf:.2f}"),
                       label(seg_img, f"segment conf={conf:.2f}")])
    cv2.imwrite(str(out_dir / f"panel_conf{conf:.2f}.jpg"), panel)
    print(f"  conf={conf:.2f}: 박스 {len(det_list)}개, 마스크 {len(seg_list)}개")
    return det_img, det_list, seg_list


def main():
    ap = argparse.ArgumentParser(description="YOLO 박스·마스크 사진 서비스")
    ap.add_argument("images", nargs="+", type=Path, help="입력 사진 경로")
    ap.add_argument("--conf", nargs=2, type=float, default=[0.25, 0.50], help="비교할 두 점수 임계값")
    ap.add_argument("--classes", nargs="*", default=None, help="관찰할 클래스 이름 (생략하면 전체 80개)")
    ap.add_argument("--out", type=Path, default=HERE / "outputs" / "yolo")
    ap.add_argument("--source-note", action="append", default=[],
                    help="입력 사진 출처를 manifest에 남긴다. 형식: 파일이름=설명")
    args = ap.parse_args()

    # 입력 경로를 먼저 절대 경로로 바꾼 뒤, 모델 파일은 이 폴더에 두고 쓴다 (없으면 처음 실행 때 자동 다운로드)
    args.images = [p.resolve() for p in args.images]
    args.out = args.out.resolve()
    os.chdir(HERE)
    det = YOLO(DET_MODEL)
    seg = YOLO(SEG_MODEL)
    classes_det = class_ids(det, args.classes)
    classes_seg = class_ids(seg, args.classes)
    lo, hi = sorted(args.conf)
    notes = dict(n.split("=", 1) for n in args.source_note)

    args.out.mkdir(parents=True, exist_ok=True)
    inputs = []
    for img in args.images:
        print(f"{img.name}")
        out_dir = args.out / img.stem
        res = {c: run_one(img, c, det, seg, classes_det, classes_seg, out_dir) for c in (lo, hi)}

        # 낮은 임계값에서만 나온 박스 = 높은 임계값에서 사라진 박스 (점수가 lo 이상 hi 미만)
        dropped = [b for b in res[lo][1] if b["score"] < hi]
        # 낮은 임계값보다도 아래에 있던 후보 (참고용, conf=0.05로 한 번 더 예측)
        below = det.predict(str(img), imgsz=IMGSZ, device=DEVICE, conf=0.05, classes=classes_det, verbose=False)[0]
        below_low = [b for b in boxes_to_list(below) if b["score"] < lo]
        (out_dir / "compare.json").write_text(json.dumps(
            {"image": img.name, "model": DET_MODEL, "low_conf": lo, "high_conf": hi,
             "count_low": len(res[lo][1]), "count_high": len(res[hi][1]),
             "dropped_at_high": dropped,
             "lowest_score_kept_at_high": min((b["score"] for b in res[hi][1]), default=None),
             "candidates_below_low_conf_0.05": below_low}, ensure_ascii=False, indent=2))
        cv2.imwrite(str(out_dir / "compare.jpg"),
                    np.hstack([label(res[lo][0], f"conf={lo:.2f}: {len(res[lo][1])} boxes"),
                               label(res[hi][0], f"conf={hi:.2f}: {len(res[hi][1])} boxes")]))
        print(f"  {hi:.2f}에서 사라진 박스: {[(b['class'], b['score']) for b in dropped]}")

        h, w = cv2.imread(str(img)).shape[:2]
        rp = img.resolve()
        inputs.append({"file": str(rp.relative_to(HERE) if rp.is_relative_to(HERE) else rp),
                       "sha256": sha256(img), "size_px": [w, h], "source": notes.get(img.name, "")})

    code_dir = args.out / "code"
    code_dir.mkdir(exist_ok=True)
    shutil.copy2(__file__, code_dir / Path(__file__).name)

    manifest = {
        "run_at": datetime.now(timezone.utc).isoformat(timespec="seconds"),
        "command": "python " + " ".join([Path(sys.argv[0]).name] + sys.argv[1:]),
        "inputs": inputs,
        "models": [{"task": "detect", "file": DET_MODEL, "sha256": sha256(HERE / DET_MODEL)},
                   {"task": "segment", "file": SEG_MODEL, "sha256": sha256(HERE / SEG_MODEL)}],
        "settings": {"imgsz": IMGSZ, "device": DEVICE, "conf": [lo, hi],
                     "classes": args.classes or "all (80 COCO classes)"},
        "packages": {"python": platform.python_version(), "ultralytics": ultralytics.__version__,
                     "torch": torch.__version__, "opencv": cv2.__version__, "numpy": np.__version__},
        "run_location": {"where": "local (own computer, no cloud)", "os": platform.platform(),
                         "machine": platform.machine(), "processor": platform.processor()},
    }
    (args.out / "manifest.json").write_text(json.dumps(manifest, ensure_ascii=False, indent=2))
    print(f"저장: {args.out}")


if __name__ == "__main__":
    main()
