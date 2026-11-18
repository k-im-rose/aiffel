# 그내종 디자인 시스템

미니멀한 개인 투자 리서치 보고서. 모든 화면(메인, 일일 보고서, 마이페이지, 최초 설정, 로그인 시안, 개발·평가 기록)이 `web/style.css` 한 파일을 쓴다.
견본 화면: 로컬 서버의 `/styleguide`

## 1. 확정 원칙

| 원칙 | 구현 |
|---|---|
| 고딕체 중심 | `--font-serif` 변수 이름은 그대로 두고 값을 Noto Sans KR로 바꿨다(2026-11). 제목·본문 모두 고딕. 이전 명조 버전은 `docs/design_backup/style.serif.css`에 보존 |
| 색 세 가지 | 화이트 `--color-bg` #FFFFFF, 차콜 `--color-ink` #222222, 테라코타 `--color-accent` #B8755B. 그 밖에는 무채색 회색 세 단계(보조 글자, 상태 표시, 구분선)만 |
| 충분한 여백 | 간격 토큰 `--space-1`~`--space-8`. 섹션 사이 72px (아이폰 폭 56px) |
| 얇은 구분선 | `--rule-thin`(회색 1px), `--rule-strong`(차콜 1px, 영역 시작), `--rule-accent`(테라코타 1px, 인용·중요 안내) |
| 과한 볼드·장식 없음 | 굵기는 400과 600 두 가지. 600은 제목·브랜드·강조에만. 아이콘·그림자·둥근 모서리·카드 배경 없음. 접기 표시도 기호 대신 +/− 글자 |
| 본문 가독성 우선 | 보고서 본문 폭 `--measure` 680px, 줄간격 1.85, 한국어 단어 단위 줄바꿈(`keep-all`) |
| 모션은 숫자·그래프에만 | `.motion-number` (240ms, 위로 4px 떠오르며 나타남). 지금은 메인의 미완료 항목 수에만 쓴다. 동작 줄이기 설정이면 없음 |
| 위에서 아래로 읽기 | 보고서 섹션은 모두 세로 한 줄. 나란히 놓는 배치 없음. 내용 길이만큼 늘어난다 |

## 2. 토큰 (`web/style.css` 1절)

| 묶음 | 토큰 |
|---|---|
| 색 | `--color-bg`, `--color-ink`, `--color-accent`, `--color-ink-2`, `--color-ink-3`, `--color-rule` |
| 글꼴 | `--font-serif`, `--font-body`, `--font-head`, `--weight-regular`, `--weight-strong` |
| 크기 | `--fs-brand` 52, `--fs-display` 30, `--fs-h2` 24, `--fs-h3` 20, `--fs-lead` 19, `--fs-body` 17, `--fs-ui` 15, `--fs-meta` 13, `--fs-status` 12, `--fs-number` 40 (px) |
| 줄간격 | `--lh-body` 1.85, `--lh-head` 1.45 |
| 간격 | `--space-1` 4 · 2 8 · 3 12 · 4 20 · 5 28 · 6 40 · 7 56 · 8 72, `--gutter` 24 (아이폰 16) |
| 폭 | `--measure` 680, `--wide` 960 |
| 선 | `--rule-thin`, `--rule-strong`, `--rule-accent` |
| 모션 | `--motion-short` 240ms, `--ease` |

아이폰 폭(640px 이하)에서는 7절에서 토큰 값만 줄인다.

## 3. 컴포넌트와 쓰이는 곳

| 클래스 | 역할 | 화면 |
|---|---|---|
| `.brand`, `.brand-name`, `.brand-sub`, `.brand-intro`, `.site-nav` | 머리말: '그내종.' 크게, 아래 '그래서 내 종목은?', 오른쪽 두 줄 소개 (세로 구분선 없음), 메뉴 | 전 화면 (`common.js`가 그림) |
| `.notice`, `.notice-strong`, `.notice-record` | 안내문 (데모 안내, 로그인 시안 경고, 개발·평가 기록 표시) | 전 화면, 로그인, 보고서 |
| `.lede`, `.report-head`, `.when` | 화면 첫머리 | 메인·마이페이지·설정·로그인·기록 / 보고서 |
| `.eyebrow` | 섹션 위 작은 테라코타 라벨 (보고서는 01~08 번호) | 전 화면 |
| `.latest` | 메인의 최신 보고서 영역 (카드 대신 차콜 위 선) | 메인 |
| `.list-row` | 날짜 · 제목 · 재생 시간 한 줄 | 메인·마이페이지 지난 브리핑 |
| `.kv` | 정의 목록 | 메인 프로필 요약 |
| `.entry`, `.story`, `.tag`, `.fact-basis` | 이야기 한 편, 사실의 근거 수준 표시 | 보고서 2 |
| `.stock-block`, `.stance` | 종목별 영향과 확인할 것 | 보고서 3 |
| `details`/`summary` | 접는 목록 (+/−) | 보고서 출처·방송 밖 뉴스, 완료 항목 |
| `.concept-term`, `blockquote` | 경제 개념 용어와 800선 첫 문장 인용 | 보고서 5 |
| `.quiz-q`, `.choice`, `.result` | 퀴즈 | 보고서 6 |
| `.item`, `.check-line`, `.mark`, `.actions` | 메모·점검 항목 한 건 | 보고서 7·8, 마이페이지, 메인, 기록 |
| `.field`, `fieldset`, `.row`, `.form-actions`, `.grow` | 입력 양식 | 프로필(마이페이지·최초 설정), 로그인 시안, 메모·점검 입력 |
| `button`, `button.text` | 테두리 글자 버튼, 밑줄 글자 버튼 | 전 화면 |
| `.meta`, `.status`, `.num`, `.big-num`, `.motion-number`, `.pre` | 글자 역할 | 전 화면 |

화면 HTML에는 인라인 스타일이 없다 (견본 화면 `/styleguide`의 색·크기 견본만 예외). 모든 시각 규칙은 `style.css`에 있다.

## 4. 레퍼런스를 받으면 할 일

1. 레퍼런스에서 글꼴, 글자 크기 비율, 간격 리듬, 선 굵기, 브랜드 영역 배치를 읽는다.
2. `style.css` 1절 토큰 값을 바꾼다. 글꼴을 바꾸면 각 HTML의 Google Fonts 링크도 바꾼다.
3. 레퍼런스와 다른 컴포넌트만 5절 규칙을 고친다. 클래스 이름과 HTML 구조, JS, API는 바꾸지 않는다.
4. `/styleguide`에서 전체를 한 번에 보고, 실제 화면(메인, 보고서, 마이페이지, 최초 설정)을 데스크톱과 아이폰 폭(375px)에서 확인한다.
5. 확인 기준: 다른 유채색이 없는지, 가로 스크롤이 없는지, 본문 한 줄 길이, 모션이 숫자·그래프에만 있는지.
