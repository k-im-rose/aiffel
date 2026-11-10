"""표 이미지(Census Table 1)를 OCR로 읽어 행·열을 연결하고 table.csv와 document.md를 만든다.

사용:
    python ocr_table.py              # input/census-table.png → outputs/ocr/

흐름:
    1. PaddleOCR(영어)로 글자 영역과 문자열을 읽는다 → 원시 JSON, 텍스트·좌표 CSV, 영역 시각화
    2. 글자 영역의 y 중심으로 행을, x 위치로 열(지역명 | 면적 | 인구)을 정한다
    3. 숫자를 정리하고(쉼표·공백 제거) 표의 합계로 검산한다
    4. review.json에 사람이 원본과 대조해 적은 수정 내역을 적용한다 (자동으로 고치지 않는다)
    5. table.csv, document.md, 수정·확인 위치를 원본 위에 표시한 review_marks.png를 저장한다
"""
import csv
import hashlib
import json
import platform
import re
import shutil
import sys
from datetime import datetime, timezone
from pathlib import Path

import cv2
import numpy as np

HERE = Path(__file__).resolve().parent
SRC = HERE / "input" / "census-table.png"
OUT = HERE / "outputs" / "ocr"
REVIEW = HERE / "review.json"

# 열 경계 (원본 이미지 x 좌표, 세로 괘선 위치를 보고 정함)
COL_AREA_X = 670   # 이보다 왼쪽은 지역명
COL_POP_X = 860    # 이보다 오른쪽은 인구
HEADER_MAX_Y = 100  # 이보다 위는 열 제목
FOOTNOTE_MIN_Y = 450  # 이보다 아래는 각주
ROW_TOL = 12        # y 중심이 이만큼 안에 있으면 같은 행


def sha256(path):
    return hashlib.sha256(Path(path).read_bytes()).hexdigest()


def run_ocr():
    from paddleocr import PaddleOCR

    ocr = PaddleOCR(lang="en", use_doc_orientation_classify=False,
                    use_doc_unwarping=False, use_textline_orientation=False)
    res = ocr.predict(str(SRC))[0]
    res.save_to_json(str(OUT / "raw_ocr.json"))
    raw = json.loads((OUT / "raw_ocr.json").read_text())
    raw["input_path"] = str(SRC.relative_to(HERE))  # 내 컴퓨터의 절대 경로를 남기지 않는다
    (OUT / "raw_ocr.json").write_text(json.dumps(raw, ensure_ascii=False, indent=2))
    res.save_to_img(str(OUT))  # 글자 영역 시각화 (*_ocr_res_img.png)
    for f in OUT.glob("*_ocr_res_img.*"):
        f.rename(OUT / ("ocr_regions" + f.suffix))
    d = res.json["res"]
    lines = []
    for i, (t, s, b) in enumerate(zip(d["rec_texts"], d["rec_scores"], d["rec_boxes"])):
        x1, y1, x2, y2 = (int(v) for v in b)
        lines.append({"id": i, "text": t, "score": round(float(s), 4), "box": [x1, y1, x2, y2]})
    return lines


def place(lines):
    """글자 영역을 머리말·본문·각주로 나누고, 본문은 행과 열에 배치한다."""
    header, body, foot = [], [], []
    for ln in lines:
        x1, y1, x2, y2 = ln["box"]
        yc = (y1 + y2) / 2
        if yc < HEADER_MAX_Y:
            header.append(ln)
        elif yc > FOOTNOTE_MIN_Y:
            foot.append(ln)
        else:
            body.append(ln)
    rows = []
    for ln in sorted(body, key=lambda l: (l["box"][1] + l["box"][3]) / 2):
        yc = (ln["box"][1] + ln["box"][3]) / 2
        if rows and abs(rows[-1]["yc"] - yc) <= ROW_TOL:
            rows[-1]["cells"].append(ln)
        else:
            rows.append({"yc": yc, "cells": [ln]})
    table = []
    for r in rows:
        row = {"label": None, "area": None, "pop": None}
        for c in r["cells"]:
            x1 = c["box"][0]
            col = "label" if x1 < COL_AREA_X else ("area" if x1 < COL_POP_X else "pop")
            if row[col] is not None:
                sys.exit(f"한 칸에 글자 영역이 두 개 들어왔습니다: {row[col]['text']!r}, {c['text']!r}")
            row[col] = c
        table.append(row)
    return header, table, foot


def level_of(label_cell):
    """지역명의 들여쓰기(x 시작점)로 위계를 정한다."""
    x1 = label_cell["box"][0]
    if x1 > 85:
        return "total"      # 굵게 가운데 놓인 전체 합계 행
    if x1 > 50:
        return "sub"        # 들여쓴 하위 지역 (Outlying possessions의 내역)
    return "main"


def clean_label(t):
    return t.rstrip(". ").strip()


def to_int(t):
    """'101, 115, 487' → 101115487. 숫자가 아닌 글자가 섞이면 None."""
    if t is None:
        return None
    s = re.sub(r"[,\s]", "", t)
    return int(s) if s.isdigit() else None


def main():
    if OUT.exists():
        shutil.rmtree(OUT)
    OUT.mkdir(parents=True)
    shutil.copy2(SRC, OUT / SRC.name)

    lines = run_ocr()
    with open(OUT / "ocr_lines.csv", "w", newline="") as f:
        w = csv.writer(f)
        w.writerow(["id", "text", "score", "x1", "y1", "x2", "y2"])
        for ln in lines:
            w.writerow([ln["id"], ln["text"], ln["score"], *ln["box"]])

    header, table, foot = place(lines)
    review = json.loads(REVIEW.read_text())
    fixes = {(f["row"], f["col"]): f for f in review["corrections"]}
    blanks = {(b["row"], b["col"]): b for b in review["blank_cells"]}

    rows = []
    for r in table:
        if r["label"] is None:
            sys.exit(f"지역명이 없는 행이 있습니다: {r}")
        name = clean_label(r["label"]["text"])
        row = {"region": name, "level": level_of(r["label"]), "cells": {}}
        for col in ("area", "pop"):
            cell = r[col]
            key = (name, col)
            raw = cell["text"] if cell else None
            value = to_int(raw) if raw else None
            status, note = "ok", ""
            if key in fixes:
                fx = fixes[key]
                if raw != fx["raw"]:
                    sys.exit(f"review.json의 원시값이 이번 OCR 결과와 다릅니다: {key} {raw!r} != {fx['raw']!r}")
                value, status, note = fx["value"], fx.get("status", "corrected"), fx["reason"]
            elif cell is None:
                if key not in blanks:
                    sys.exit(f"OCR이 값을 읽지 못한 칸이 review.json에 없습니다: {key}")
                status, note = "blank", blanks[key]["reason"]
            row["cells"][col] = {"raw": raw, "value": value, "status": status, "note": note,
                                 "score": cell["score"] if cell else None, "box": cell["box"] if cell else None}
        rows.append(row)

    # 검산: 하위 지역 합 = Outlying possessions, 본토 + 해외 = 전체
    def total(rs, col):
        return sum(r["cells"][col]["value"] or 0 for r in rs)

    by = {r["region"]: r for r in rows}
    subs = [r for r in rows if r["level"] == "sub"]
    checks = []
    for col, label in (("area", "면적"), ("pop", "인구")):
        out = by["Outlying possessions"]["cells"][col]["value"]
        main_ = by["United States, exclusive of outlying possessions"]["cells"][col]["value"]
        grand = by["United States, with outlying possessions"]["cells"][col]["value"]
        raw_subs = sum(to_int(r["cells"][col]["raw"]) or 0 for r in subs)
        checks.append({"what": f"{label}: 하위 지역 8곳의 합 = Outlying possessions",
                       "raw_ocr": raw_subs, "after_review": total(subs, col), "expected": out,
                       "raw_ok": raw_subs == out, "ok": total(subs, col) == out})
        checks.append({"what": f"{label}: 본토 + Outlying possessions = 전체",
                       "raw_ocr": None, "after_review": main_ + out, "expected": grand,
                       "raw_ok": None, "ok": main_ + out == grand})

    # table.csv: 숫자는 쉼표 없이 저장
    with open(OUT / "table.csv", "w", newline="") as f:
        w = csv.writer(f)
        w.writerow(["region", "level", "parent", "gross_area_sq_mi", "population_1910", "population_note", "review"])
        for r in rows:
            a, p = r["cells"]["area"], r["cells"]["pop"]
            parent = "Outlying possessions" if r["level"] == "sub" else ""
            pop_note = next((fx.get("footnote", "") for (rg, c), fx in fixes.items() if rg == r["region"] and c == "pop"), "")
            flags = [f"{c}:{x['status']}" for c, x in (("area", a), ("pop", p)) if x["status"] != "ok"]
            w.writerow([r["region"], r["level"], parent, a["value"] if a["value"] is not None else "",
                        p["value"], pop_note, ";".join(flags)])

    write_document(rows, checks, header, foot, review)
    write_marks(rows)

    import paddle
    import paddleocr
    manifest = {
        "run_at": datetime.now(timezone.utc).isoformat(timespec="seconds"),
        "command": "python ocr_table.py",
        "source": review["source"],
        "input": {"file": str(SRC.relative_to(HERE)), "sha256": sha256(SRC), "size_px": list(cv2.imread(str(SRC)).shape[1::-1])},
        "ocr": {"engine": "PaddleOCR", "pipeline": "OCR (text detection + recognition)", "lang": "en",
                "models": ["PP-OCRv6_medium_det", "PP-OCRv6_medium_rec"],
                "options": {"use_doc_orientation_classify": False, "use_doc_unwarping": False, "use_textline_orientation": False}},
        "structure": {"method": "글자 영역 좌표로 행(y 중심 ±12px)과 열(x 670, 860 경계)을 나눔",
                      "header_max_y": HEADER_MAX_Y, "footnote_min_y": FOOTNOTE_MIN_Y},
        "review": "review.json (사람이 원본과 대조해 적은 수정 내역, 자동 수정 없음)",
        "packages": {"python": platform.python_version(), "paddlepaddle": paddle.__version__,
                     "paddleocr": paddleocr.__version__, "opencv": cv2.__version__, "numpy": np.__version__},
        "run_location": {"where": "local (own computer, no cloud)", "os": platform.platform(), "machine": platform.machine()},
    }
    (OUT / "manifest.json").write_text(json.dumps(manifest, ensure_ascii=False, indent=2))
    for c in checks:
        print(("OK " if c["ok"] else "FAIL ") + c["what"], c["after_review"], "/", c["expected"],
              "(원시 OCR 그대로면", c["raw_ocr"], ")" if c["raw_ocr"] is not None else "")
    print("저장:", OUT)


def fmt(n):
    return "" if n is None else f"{n:,}"


def write_document(rows, checks, header, foot, review):
    src = review["source"]
    L = []
    L.append(f"# {src['title']}\n")
    L.append(f"- 원문: {src['document']}")
    L.append(f"- 위치: {src['page']}")
    L.append(f"- 이용 조건: {src['license']}")
    L.append(f"- 입력 이미지: `{SRC.name}` (과제 제공, 원문에서 표 부분만 200 dpi로 추출)")
    L.append("- 만든 방법: PaddleOCR(영어)로 글자를 읽고, 글자 영역 좌표로 행과 열을 연결한 뒤 원본과 대조해 고침\n")
    L.append("## 표\n")
    L.append("| Area | Gross area (land and water) in square miles | Population: 1910 |")
    L.append("|---|---:|---:|")
    marks = {(f["row"], f["col"]): f["footnote_mark"] for f in review["corrections"] if f.get("footnote_mark")}
    for r in rows:
        name = r["region"]
        if r["level"] == "total":
            name = f"**{name}**"
        elif r["level"] == "sub":
            name = "&nbsp;&nbsp;&nbsp;&nbsp;" + name
        a, p = r["cells"]["area"], r["cells"]["pop"]
        av = "—" if a["status"] == "blank" else fmt(a["value"])
        pv = fmt(p["value"]) + (f" ({marks[(r['region'], 'pop')]})" if (r["region"], "pop") in marks else "")
        if r["level"] == "total":
            av, pv = f"**{av}**", f"**{pv}**"
        L.append(f"| {name} | {av} | {pv} |")
    L.append("")
    for fn in review["footnotes"]:
        L.append(f"- ({fn['mark']}) {fn['text']}")
    L.append("- — : 원본에 값이 없고 점선만 있는 칸")
    L.append("")
    L.append("## 검토 기록\n")
    L.append("### 원본과 대조해 고친 칸\n")
    L.append("| 행 | 열 | 원시 인식 | 원본 대조 후 | OCR 점수 | 원본 위치 (x1, y1, x2, y2) | 근거 |")
    L.append("|---|---|---|---|---:|---|---|")
    colname = {"area": "Gross area", "pop": "Population: 1910"}
    for r in rows:
        for c in ("area", "pop"):
            x = r["cells"][c]
            if x["status"] in ("corrected", "check"):
                L.append(f"| {r['region']} | {colname[c]} | `{x['raw']}` | {fmt(x['value'])} | {x['score']:.3f} | {tuple(x['box'])} | {x['note']} |")
    L.append("")
    L.append("### 값이 없는 칸\n")
    for r in rows:
        for c in ("area", "pop"):
            x = r["cells"][c]
            if x["status"] == "blank":
                L.append(f"- {r['region']} / {colname[c]}: {x['note']}")
    L.append("")
    L.append("### 합계 검산\n")
    L.append("| 검산 | 원시 OCR 값으로 | 검토 후 | 표에 적힌 값 | 결과 |")
    L.append("|---|---:|---:|---:|---|")
    for c in checks:
        raw = fmt(c["raw_ocr"]) if c["raw_ocr"] is not None else "–"
        if c["raw_ok"] is False:
            raw += " ✗"
        L.append(f"| {c['what']} | {raw} | {fmt(c['after_review'])} | {fmt(c['expected'])} | {'일치' if c['ok'] else '불일치'} |")
    L.append("")
    L.append("### 확인 필요\n")
    pend = [(r["region"], c, r["cells"][c]) for r in rows for c in ("area", "pop") if r["cells"][c]["status"] == "check"]
    if pend:
        for rg, c, x in pend:
            L.append(f"- {rg} / {colname[c]}: {x['note']}")
    else:
        L.append(review["check_needed_summary"])
    L.append("")
    L.append("### 표기 메모\n")
    for m in review["notes"]:
        L.append(f"- {m}")
    (OUT / "document.md").write_text("\n".join(L) + "\n")


def write_marks(rows):
    """원본 위에 칸 상태를 표시한다: 빨강 = 고친 칸, 주황 = 확인 필요, 회색 점선 = 값 없음, 초록 = 그대로 확인."""
    img = cv2.imread(str(SRC))
    color = {"ok": (60, 160, 60), "corrected": (40, 40, 220), "check": (0, 140, 255)}
    for r in rows:
        for c in ("area", "pop"):
            x = r["cells"][c]
            if x["box"] is None:
                continue
            x1, y1, x2, y2 = x["box"]
            th = 1 if x["status"] == "ok" else 3
            cv2.rectangle(img, (x1 - 3, y1 - 2), (x2 + 3, y2 + 2), color[x["status"]], th)
            if x["status"] == "corrected":
                cv2.putText(img, "fixed", (x1 - 58, y2 - 4), cv2.FONT_HERSHEY_SIMPLEX, 0.5, color["corrected"], 2)
    # 값이 없는 칸 (Military 행의 면적 열): 행의 y 범위와 열 경계로 표시
    for r in rows:
        if r["cells"]["area"]["status"] == "blank":
            y1, y2 = r["cells"]["pop"]["box"][1], r["cells"]["pop"]["box"][3]
            for xx in range(COL_AREA_X + 20, COL_POP_X - 10, 12):
                cv2.line(img, (xx, y1 - 2), (xx + 6, y1 - 2), (120, 120, 120), 2)
                cv2.line(img, (xx, y2 + 2), (xx + 6, y2 + 2), (120, 120, 120), 2)
            cv2.putText(img, "blank", (COL_AREA_X + 70, y2 - 4), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (120, 120, 120), 2)
    cv2.imwrite(str(OUT / "review_marks.png"), img)


if __name__ == "__main__":
    main()
