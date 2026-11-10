"""원본 대조용 확대 이미지를 만든다. yolo_service.py를 실행한 뒤에 돌린다.

    python make_findings.py

findings/ 에 저장:
    bus_person3_back_foot.jpg   원본 | 마스크 겹침 | 마스크 (person #3의 발 부분 4배 확대)
    bus_sign_candidate.jpg      왼쪽 끝 표지판: 원본과 conf 0.05 후보 박스
    my_cup_mask.jpg             자기 사진의 컵: 원본 | cup 마스크 겹침 (3배 확대)
    my_bag_missed.jpg           자기 사진의 어깨 가방: 원본 | person 마스크 겹침 (2배 확대)
"""
import json
from pathlib import Path

import cv2
import numpy as np

HERE = Path(__file__).resolve().parent
OUT = HERE / "outputs" / "yolo" / "bus"
DST = HERE / "findings"
DST.mkdir(exist_ok=True)

orig = cv2.imread(str(HERE / "input" / "bus.jpg"))


def zoom(img, y0, y1, x0, x1, k=4):
    return cv2.resize(img[y0:y1, x0:x1], None, fx=k, fy=k, interpolation=cv2.INTER_NEAREST)


def title(img, text):
    img = img.copy()
    cv2.rectangle(img, (0, 0), (img.shape[1], 34), (255, 255, 255), -1)
    cv2.putText(img, text, (8, 25), cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 0, 0), 2)
    return img


# 1) person #3의 뒷발: 마스크에 들어갔는지 확인
mask = cv2.imread(str(OUT / "conf0.25" / "masks" / "mask_03_person.png"), 0)
over = orig.copy()
over[mask > 0] = (over[mask > 0] * 0.5 + np.array([255, 0, 255]) * 0.5).astype(np.uint8)
y0, y1, x0, x1 = 760, 880, 220, 340  # 원본 좌표 (x 220~340, y 760~880)
panel = np.hstack([
    title(zoom(orig, y0, y1, x0, x1), "original"),
    title(zoom(over, y0, y1, x0, x1), "mask overlay"),
    title(zoom(cv2.cvtColor(mask, cv2.COLOR_GRAY2BGR), y0, y1, x0, x1), "mask #3"),
])
cv2.imwrite(str(DST / "bus_person3_back_foot.jpg"), panel)

# 2) 왼쪽 끝 표지판: 0.25 아래 후보로만 나온 박스
cmp = json.loads((OUT / "compare.json").read_text())
sign = next(b for b in cmp["candidates_below_low_conf_0.05"] if b["class"] == "stop sign")
x1b, y1b, x2b, y2b = (int(v) for v in sign["xyxy"])
boxed = orig.copy()
cv2.rectangle(boxed, (x1b, y1b), (x2b, y2b), (0, 0, 255), 2)
y0, y1, x0, x1 = 220, 360, 0, 120
panel = np.hstack([
    title(zoom(orig, y0, y1, x0, x1), "original"),
    title(zoom(boxed, y0, y1, x0, x1), f"'stop sign' {sign['score']:.2f}"),
])
cv2.imwrite(str(DST / "bus_sign_candidate.jpg"), panel)


# 3) 자기 사진: 컵 마스크와 놓친 어깨 가방
MY = HERE / "outputs" / "yolo" / "my_photo" / "conf0.25"
mine = cv2.imread(str(HERE / "input" / "my_photo.jpg"))


def over_mask(img, mask_file, color):
    m = cv2.imread(str(MY / "masks" / mask_file), 0)
    v = img.copy()
    v[m > 0] = (v[m > 0] * 0.5 + np.array(color) * 0.5).astype(np.uint8)
    return v


y0, y1, x0, x1 = 580, 720, 460, 580  # 컵 주변
cv2.imwrite(str(DST / "my_cup_mask.jpg"), np.hstack([
    title(zoom(mine, y0, y1, x0, x1, 3), "original"),
    title(zoom(over_mask(mine, "mask_02_cup.png", (255, 0, 255)), y0, y1, x0, x1, 3), "cup mask 0.34"),
]))
y0, y1, x0, x1 = 560, 900, 300, 480  # 왼쪽 허리의 검은 가방
cv2.imwrite(str(DST / "my_bag_missed.jpg"), np.hstack([
    title(zoom(mine, y0, y1, x0, x1, 2), "original"),
    title(zoom(over_mask(mine, "mask_01_person.png", (0, 200, 0)), y0, y1, x0, x1, 2), "person mask"),
]))
print("저장:", DST)
