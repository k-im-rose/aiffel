# Census Table 1 — 면적과 인구 (1910년 인구조사)

- 원문: 미국 인구조사국, Thirteenth Census of the United States, 1910 인구조사 보고서 (1913년 발행)
- 위치: PDF 2쪽, 인쇄 22쪽, Table 1
- 이용 조건: 미국 연방정부 발행 자료, 퍼블릭 도메인
- 입력 이미지: `census-table.png` (과제 제공, 원문에서 표 부분만 200 dpi로 추출)
- 만든 방법: PaddleOCR(영어)로 글자를 읽고, 글자 영역 좌표로 행과 열을 연결한 뒤 원본과 대조해 고침

## 표

| Area | Gross area (land and water) in square miles | Population: 1910 |
|---|---:|---:|
| **United States, with outlying possessions** | **3,743,306** | **101,115,487** |
| United States, exclusive of outlying possessions | 3,026,789 | 91,972,266 |
| Outlying possessions | 716,517 | 9,143,221 |
| &nbsp;&nbsp;&nbsp;&nbsp;Alaska | 590,884 | 64,356 |
| &nbsp;&nbsp;&nbsp;&nbsp;Hawaii | 6,449 | 191,909 |
| &nbsp;&nbsp;&nbsp;&nbsp;Porto Rico | 3,435 | 1,118,012 |
| &nbsp;&nbsp;&nbsp;&nbsp;Military and naval service abroad | — | 55,608 |
| &nbsp;&nbsp;&nbsp;&nbsp;Philippine Islands | 115,026 | 7,635,426 (1) |
| &nbsp;&nbsp;&nbsp;&nbsp;Panama Canal Zone | 436 | 62,810 (2) |
| &nbsp;&nbsp;&nbsp;&nbsp;Guam (population estimated) | 210 | 9,000 |
| &nbsp;&nbsp;&nbsp;&nbsp;Samoa (population estimated) | 77 | 6,100 |

- (1) Population in 1903. (Philippine Islands의 인구는 1910년이 아니라 1903년 값)
- (2) Population in 1912. (Panama Canal Zone의 인구는 1912년 값)
- — : 원본에 값이 없고 점선만 있는 칸

## 검토 기록

### 원본과 대조해 고친 칸

| 행 | 열 | 원시 인식 | 원본 대조 후 | OCR 점수 | 원본 위치 (x1, y1, x2, y2) | 근거 |
|---|---|---|---|---:|---|---|
| Philippine Islands | Population: 1910 | `17,635,426` | 7,635,426 | 0.989 | (921, 340, 1035, 365) | 원본에서 7,635,426 앞의 작은 위첨자 1(각주 번호)을 숫자로 붙여 읽음. 확대 대조와 합계 검산(하위 지역 합 = 9,143,221)으로 확인 |
| Panama Canal Zone | Population: 1910 | `262,810` | 62,810 | 0.945 | (952, 363, 1035, 388) | 원본에서 62,810 앞의 작은 위첨자 2(각주 번호)를 숫자로 붙여 읽음. 확대 대조와 합계 검산으로 확인 |

### 값이 없는 칸

- Military and naval service abroad / Gross area: 원본에 숫자가 없고 지역명에서 이어진 점선만 있음. 해외 복무 군인은 면적이 없는 항목이라 0이 아니라 빈칸으로 둠

### 합계 검산

| 검산 | 원시 OCR 값으로 | 검토 후 | 표에 적힌 값 | 결과 |
|---|---:|---:|---:|---|
| 면적: 하위 지역 8곳의 합 = Outlying possessions | 716,517 | 716,517 | 716,517 | 일치 |
| 면적: 본토 + Outlying possessions = 전체 | – | 3,743,306 | 3,743,306 | 일치 |
| 인구: 하위 지역 8곳의 합 = Outlying possessions | 19,343,221 ✗ | 9,143,221 | 9,143,221 | 일치 |
| 인구: 본토 + Outlying possessions = 전체 | – | 101,115,487 | 101,115,487 | 일치 |

### 확인 필요

남은 '확인 필요' 칸은 없습니다. 칸 22개(숫자 21개, 빈칸 1개)를 모두 원본 확대 이미지와 하나씩 대조했고, 면적·인구 모두 하위 지역 합과 전체 합계가 표에 적힌 값과 일치합니다.

### 표기 메모

- 원본은 천 단위 쉼표 뒤에 띄어쓰기가 있습니다(예: 101, 115, 487). OCR은 띄어쓰기를 들쭉날쭉하게 읽었지만(101, 115, 487 / 3,743,306) 숫자는 맞았습니다. CSV에는 쉼표와 띄어쓰기를 빼고 숫자만 저장했습니다.
- 지역명 끝의 점선(.......)은 OCR이 '.' 한 개로 읽거나 빼고 읽었습니다. 지역명 끝의 점은 지웠습니다.
- 'Porto Rico'는 1910년 당시 공식 표기라 그대로 두었습니다(현재 표기는 Puerto Rico).
- 들여쓰기는 OCR 글자 영역의 x 시작점으로 구분했습니다. x가 85보다 크면 전체 합계 행(가운데 정렬된 굵은 글씨), 50~85는 Outlying possessions의 하위 지역, 50 미만은 본 항목입니다.
- Philippine Islands와 Panama Canal Zone의 인구는 각주대로 1910년 값이 아닙니다. 그런데도 원본 표의 Population: 1910 합계(9,143,221)에 그대로 더해져 있습니다. 표를 쓸 때는 이 두 값의 기준 연도가 다르다는 점을 함께 적어야 합니다.
