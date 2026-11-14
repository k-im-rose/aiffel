---
name: add-terms
description: 새 교육자료 PDF(예 03-05.pdf)의 용어를 아그뭐에 추가하고 배포까지 한다. "03-05 용어 추가해줘", "오늘 자료 용어 업데이트", "다운로드에 새 PDF 넣었어" 같은 요청에 쓴다.
---

# 새 교육자료 용어 추가 (아그뭐)

인자: 자료 번호(예 `03-05`). 없으면 `~/Downloads`와 `~/Downloads/교안/`에서 가장 최근 `NN-NN.pdf`를 찾는다.
용어 기준·말투·파일 규칙은 `AGENTS.md`를 따른다. 아래는 그 규칙을 매일 같은 순서로 돌리는 절차다.

스크립트 위치: `.claude/skills/add-terms/scripts/` (아래에서 `$SK`). 작업 폴더는 `study-terms-app/`.

## 1. PDF 옮기고 글 뽑기

```bash
mv -n ~/Downloads/NN-NN.pdf "$HOME/Downloads/교안/"   # 이미 교안에 있으면 건너뜀
swift $SK/pdf-text.swift "$HOME/Downloads/교안/NN-NN.pdf" > <scratchpad>/NN-NN.txt
```
- PDF 모음 폴더는 `~/Downloads/교안/`이다. 사용자가 이미 넣어 두기도 한다. 다운로드와 교안 양쪽에 다른 같은 이름 파일이 있으면 옮기지 말고 묻는다.
- 뽑은 글은 Read로 **처음부터 끝까지** 읽는다 (지나가듯 나온 용어도 넣는 앱이라 건너뛰지 않는다).

## 2. 기존 용어와 대조

```bash
node $SK/list-terms.js . > <scratchpad>/existing.txt
```
- 목록을 보고 PDF 용어를 **새 용어**와 **이미 있는 용어**(같은 개념이면 이름이 달라도)로 나눈다.
- 넣는 것: 실전 개발·AI 용어, 모델·도구·데이터셋·라이선스 이름. 빼는 것: 사람·회사 이름, 과정 운영 용어(배점, 제출란 등).
- 이미 있는 용어는 PDF에 실제로 다시 나온 것만 고른다.

## 3. 새 용어 파일 쓰기: `data/terms-NN-NN.js`

앞 자료 파일(예 `data/terms-03-04.js`)과 같은 모양으로 쓴다.
```js
// NN-NN 섹션 제목 — 교육자료 PDF 기반. 처음 나온 자료에만 두고, 다시 나온 자료는 src에 함께 적는다.
addSection('NN-NN', "섹션 제목", [
  { "id": "kebab-case", "term": "English", "ko": "한국어", "full": "약어 풀네임 또는 빈칸",
    "level": "입문|실전|심화", "def": "PDF 설명 기반 뜻", "easy": "초등학생 눈높이 비유 (~예요)",
    "ex": "실제 장면 (자료의 예시·실습 장면이면 더 좋다)",
    "stage": "준비|만들기|실행·확인|오류 해결|배포·공유", "use": "공부하는 사람이 실제로 겪는 장면 1~2문장 (~해요)",
    "ai": "AI 코딩 도구로 할 때 주의할 점·신경 쓸 일 없음·이렇게 시키면 좋음 중 하나", "cmd": true,
    "word": "영어 단어 뜻 (줄마다 \"조각: 뜻\")", "code": "실제 코드 모양 (코드로 생기는 용어만)", "related": ["기존 또는 새 id"] },
]);
```
- id는 한 번 정하면 바꾸지 않는다 (저장된 내 설명과 이어짐). 기존 id와 겹치지 않게.
- `src`는 쓰지 않는다 (섹션 번호가 자동으로 들어감).
- `full`: 약어면 영문 풀네임을 꼭 채운다. 줄임말에서 온 터미널 명령(ls → list, mkdir → make directory)도 포함.
- `cmd: true`: 터미널에 직접 치는 명령어(ls, git, npm, pip, curl 등)일 때만 넣는다. 카드에 `>_ 터미널` 칩이 붙는다.
- `stage`: 이 용어를 가장 자주 만나는 개발 단계 하나 (준비·만들기·실행·확인·오류 해결·배포·공유). 카드에 단계 줄로 보인다.
- `use`: 카드의 '언제 쓰냐면' 줄. 실제로 겪는 장면 하나, 문장 속 다른 전문 용어는 최대 1개. def·easy·ex를 되풀이하지 않는다.
- `ai`: 카드의 'AI를 쓰면' 줄. 특정 도구 이름(Claude Code·Codex 등)은 쓰지 않고, 주어 'AI가'는 되도록 뺀다. 읽는 사람이 할 일은 '~하세요'로.
- `word`: 노란 상자의 영어 단어 뜻. 한 단어면 `fetch: 가져오다, 가서 가지고 오다` 한 줄. 조각·여러 단어·약어면 조각마다 한 줄 `Non: ~이 아닌`, 마지막 줄에 전체 뜻 `Nondeterminism: 결과가 하나로 정해져 있지 않다는 개념`. 고유 이름(제품·언어·회사)과 한국어 용어는 생략.
- `code`: '언제 쓰냐면' 안 회색 상자. 함수·명령어·설정처럼 이름이 실제 코드에 그대로 나오는 용어만. 첫 줄은 무엇을 하는지 한국어 주석, 그 아래 1~3줄. 개념 용어는 생략.
- 기존 용어의 full·cmd·use를 한꺼번에 고칠 때는 `node $SK/set-fields.js data patch.json` (patch: `{ "id": { "full": "...", "cmd": true, "stage": "...", "use": "...", "ai": "...", "word": "...", "code": "..." } }`).
- 섹션 제목은 자료 주제를 짧게 (예 "로컬 LLM과 실행 위치", "문서 인식과 객체 탐지").
- 숫자·사례는 PDF에 있는 것만 쓰고, 자료의 가상 예시라면 그렇다고 밝힌다.

## 4. 기존 용어 출처 덧붙이기

```bash
node $SK/add-src.js data NN-NN id1 id2 id3 ...
```
- `없음`이 나오면 id 오타다. 고쳐서 다시 실행한다.

## 5. 점검과 시험

```bash
node $SK/check.js . NN-NN    # 총 개수, 중복 id, 끊긴 related, 섹션 WORD 범위
```
- 끊긴 related가 있으면 고친다.
- 총 개수(N)로 갱신: `test/api.test.js`(제목과 `terms.length`), `AGENTS.md` 개요의 개수·자료 범위, `README.md`의 `마치기 3 / N`과 `용어 N개:` 줄, `PRD.md` 개수 이력(`→ NN-NN 추가로 N개.`).
- `README.md` "수정 기록" 맨 위에 `### YYYY-MM-DD · NN-NN 용어 K개 추가 (N개)` 항목: 새 섹션과 WORD 범위, 대표 용어, 출처를 덧붙인 기존 용어 수.
- `npm test` 통과를 확인한다.

## 6. 커밋 → PR → merge

브랜치 `study-terms-app`에서 `git fetch` 후 `origin/main`을 fast-forward로 맞추고 시작한다.
- 커밋 제목: `study-terms-app: NN-NN 용어 K개 추가 (N개)`
- `gh pr create --base main --head study-terms-app` 후 `gh pr merge --merge` (사용자가 PR merge까지 맡겼다).

## 7. 배포 확인

main에 merge하면 Render가 자동 배포한다 (GitHub의 Render 앱 연결, 2~3분).
```bash
curl -s https://aiffel-study-terms.onrender.com/api/terms | python3 -I -c "import sys,json; print(len(json.load(sys.stdin)['terms']))"
```
- 백그라운드로 20초 간격, 최대 10분 확인해서 N이 나오면 끝이다.
- 10분이 지나도 옛 개수면 Render 자동 배포가 다시 끊긴 것이다. Render 대시보드 Events에서 새 배포가 시작됐는지 보고, 사용자에게 알린다 (GitHub 설정 → Applications에 Render 앱이 있는지가 첫 확인 지점).

## 마무리 보고

옮긴 PDF 위치, 새 섹션 이름과 WORD 범위, 대표 용어, 출처를 붙인 기존 용어 수, 시험 결과, PR 링크, 사이트 반영 여부를 짧게 알린다.
