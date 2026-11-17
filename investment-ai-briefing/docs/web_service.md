# 그내종 웹서비스 설계 (MVP)

## 0. 화면 구조

```
/login (화면 시안) → /onboarding (최초 투자 프로필) → / (메인) → /report/<run_id> (날짜별 일일 보고서)
                                                       └→ /mypage (프로필·메모·점검 목록·지난 브리핑·계정)
```

| 주소 | 파일 | 쓰는 API | 동작 상태 |
|---|---|---|---|
| `/` | `web/index.html`, `web/main.js` | meta, profile, briefings, checks | 실제 동작. 프로필에 종목이 없으면 `/onboarding`으로 보낸다 |
| `/report/<run_id>` | `web/report.html`, `web/report.js` | briefings/{id}, media, memos, checks | 실제 동작 (이전 한 페이지 화면의 내용·기능 전부) |
| `/mypage` | `web/mypage.html`, `web/mypage.js`, `web/profile.js` | profile, memos, checks, briefings | 실제 동작. 계정 칸은 후속 개발 |
| `/onboarding` | `web/onboarding.html`, `web/onboarding.js`, `web/profile.js` | profile | 실제 동작. 종목 1개 이상과 투자 이유가 있어야 저장 |
| `/login` | `web/login.html` | 없음 | 화면만. 입력칸·버튼 비활성, 아무것도 보내지 않음 ([auth_design.md](auth_design.md)) |
| `/records` | `web/records.html`, `web/records.js` | records | 실제 동작. 승인판이 아닌 실행과 관문 미통과 이유 |
| `/styleguide` | `web/styleguide.html` | 없음 | 디자인 견본 ([design_system.md](design_system.md)) |

- **공통:** `web/common.js`(API·머리말·메모와 점검 항목 그리기), `web/style.css`(디자인 토큰).
- **이전 화면:** `web/v1_single_page/`에 보존한다. 서버는 이 폴더를 내보내지 않는다.
- **날짜별 승인판:** 일반 목록(`GET /api/briefings`)은 `<out_root>/releases.json`에 승인된 실행만, 날짜마다 하나씩 돌려준다. 나머지 실행은 `GET /api/records`(개발·평가 기록, 승인 관문 미통과 이유 포함)로만 보인다. `GET /api/briefings/{id}`는 둘 다 열 수 있고 `release.status`(approved/record)를 붙인다. 승인은 `app/release.py` (정규 실행은 관문 통과 시 자동, 그 밖은 사람이 명령으로).
- **달력:** 지금은 최신순 목록이다. 목록 API가 날짜를 돌려주므로 달력 선택은 화면만 더하면 된다.

## 1. 데이터 구조

### AI 생성 콘텐츠 (읽기 전용): `<out_root>/<run_id>/briefing.json`
파이프라인이 브리핑을 만들 때 `--export`로 함께 만든다 (`app/export_web.py`). `schema_version: 1`.

| 필드 | 내용 | 원천 |
|---|---|---|
| `date`, `title`, `mode`(regular/test), `generated_at`, `cutoff_at` | 날짜·제목·생성 시각·수집 마감 시각 | run.json, script.json |
| `audio` | `file`, `seconds`, `bytes` | tts |
| `checks` | 출처 대조 최종 결과(`fact_check`: 주장 수, 어긋난 주장, `evidence` 근거 수준별 문장 수, `removed_unverifiable`, `official_check: not_done`, `scope`), 원문 대조 통계, 중요 뉴스 사용 비율 | factcheck, corroborate, editor |
| `stories[]` | `headline`, `section`, `facts[]`(원문 대조 여부, `basis`: original / partial / summary_only), `facts_removed`(확인 불가로 뺀 사실), `interpretation`(AI 해석), `economy_impact`, `thesis_impact[]`(종목별 strengthens/risk/unclear와 이유), `related_holdings`, `follow_up`, `unverified[]`, `sources[]` | plan.json(편성·검증) + 웹 추가 단계 |
| `not_aired` | `relevant_but_cut`, `important_but_weak`, `industry_watch`, `idea_hypotheses`(AI 탐색 가설 0~5개) | 편집 제외 사유, 중요 뉴스 누락 기록, 탐색 후보 |
| `concept` | 800선 용어, `bok_quote`(첫 문장), `book_page`, `plain`, `in_today_news`, `for_investing` | 비공개 색인 + 웹 추가 단계 |
| `quiz` | `question`, `choices`, `answer`, `explanation`, `based_on` | 웹 추가 단계 |
| `ai_checks[]` | `id`, `target`, `task`, `reason`, `when`(출처에 날짜가 있을 때만 날짜), `sources[]` | 웹 추가 단계 |
| `number_check` | 개념·퀴즈·추천에 나온 숫자 중 그날 출처에 없는 것 | 자동 점검 |

**웹 추가 단계 (Sonnet 1회)**
- **입력:** 사실 검증을 마친 편성표, 원문 대조 결과, 프로필의 투자 이유·위험, 800선 후보 용어(대본에 실제로 나온 것), 사용자의 기존 점검 목록.
- **출력 검증:**
  - 개념은 후보 용어 안에서만 고른다.
  - 출처 id는 실제로 있는 것만 남긴다.
  - 사용자 목록과 비슷한 추천은 뺀다.
  - 출처에 없는 날짜는 "시점 미확인"으로 바꾼다.

### 사용자 데이터 (읽기·쓰기): `userdata/` (데모는 `demo/userdata/`)

| 파일 | 내용 |
|---|---|
| `profile.json` | 기존 프로필 구조를 재사용한다 (`stocks[]`: name, ticker, status, thesis, keywords, aliases, **risks**, **ask_ai**(AI에게 특히 확인받고 싶은 것, 새 칸. 판정·편집·웹 단계 지시문에 들어간다), known_relations / `interest_industries`, `macro_topics`). 내부용 칸(`user_id`, `prompt_*`)은 웹 저장 시 보존한다. 파이프라인의 기본 프로필이라 다음 브리핑부터 반영된다 |
| `memos.json` | `{id, date, text, created_at, updated_at}` |
| `checks.json` | `{id, text, origin: user\|ai, done, important?, created_at, updated_at, done_at, briefing_date, ai_ref?}`. `important`는 메인 화면에 먼저 보일 항목이다. `ai_ref`는 사용자가 AI 추천을 직접 추가했을 때만 생긴다 |

## 2. API (로컬 서버 `app/web_server.py`)

| 메서드 | 경로 | 하는 일 |
|---|---|---|
| GET | `/api/meta` | 서비스명, 모드(demo/real), 오늘 날짜 |
| GET | `/api/briefings` | 날짜별 승인판 목록 |
| GET | `/api/records` | 개발·평가 기록 (승인판이 아닌 실행, 관문 미통과 이유) |
| GET | `/api/briefings/{run_id}` | briefing.json (AI 추천마다 `already_added` 표시) |
| GET | `/media/{run_id}/briefing.mp3` | 오디오 (Range 지원) |
| GET·PUT | `/api/profile` | 프로필 읽기·저장 (검증 후 저장) |
| GET·POST | `/api/memos[?date=]` | 메모 목록·작성 |
| PUT·DELETE | `/api/memos/{id}` | 메모 수정·삭제 |
| GET·POST | `/api/checks` | 점검 목록·추가 (AI 추천은 `origin: ai`와 `ai_ref`, 같은 추천은 409) |
| PUT·DELETE | `/api/checks/{id}` | 수정·완료 체크·중요 표시·삭제 |

**접근 제한**
- **정적 파일:** `app/web_server.py`의 `STATIC` 목록에 있는 `web/` 파일만 내보낸다. `/report/<run_id>`는 실행 id 형식이 맞을 때만 보고서 화면을 준다.
- **브리핑 폴더:** `briefing.json`과 `briefing.mp3`만 내보낸다.
- **실행 id:** 정규식(`^\d{8}(_[a-z0-9]+)?$`)으로 확인해 경로 이탈을 막는다.
- **확인한 차단 경로 (모두 404):** `private/`, `evaluation/`, `candidates.json`, `run.json`, `../` 경로.

## 3. 모바일 배포 때 재사용할 것과 바꿀 것

| 재사용 | 바꿀 것 |
|---|---|
| 화면(web/), API 경로와 JSON 모양, briefing.json 형식, 파이프라인 전체 | `JsonStore` → DB (사용자별), 인증(로그인), HTTPS, MP3 저장소(예: Cloudflare R2), 예약 실행(맥 launchd → 서버). 단계별 계획은 [auth_design.md](auth_design.md) |

**지금 아이폰에서 되는 것과 안 되는 것**
- **되는 것:** 같은 와이파이에서 `--host 0.0.0.0`으로 열면 아이폰 사파리에서 듣기와 메모를 시험할 수 있다. 인증이 없으므로 집 안 테스트에만 쓴다.
- **안 되는 것:** 밖에서는 접속할 수 없다.
- **비공개 팟캐스트 피드:** 코드(`app/podcast_feed.py`)만 있고 연결하지 않았다.
