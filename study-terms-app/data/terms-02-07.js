// 02-07 메인퀘스트: 저장·로그인·Git — 교육자료 PDF 기반. 처음 나온 자료에만 두고, 다시 나온 자료는 src에 함께 적는다.
addSection('02-07', "메인퀘스트: 저장·로그인·Git", [
  {
    "id": "supabase",
    "term": "Supabase",
    "ko": "수파베이스",
    "full": "",
    "src": "02-04 · 02-07",
    "level": "입문",
    "def": "DB·회원가입·로그인·권한이 함께 오는, 무료로 시작할 수 있는 백엔드 서비스(BaaS).",
    "easy": "서버를 직접 안 짓고 빌려 쓰는 완성된 주방 같아요. 재료 창고와 문지기까지 있어요.",
    "ex": "Supabase 프로젝트를 만들면 표와 로그인 기능이 한꺼번에 생겨요.",
    "flow": [],
    "use": "서버를 직접 만들기 부담될 때 DB와 로그인을 한꺼번에 빌려 쓰려고 가입해요. 프로젝트 URL과 키를 .env에 넣어 앱과 연결해요.",
    "related": [
      "database",
      "auth",
      "mcp"
    ]
  },
  {
    "id": "lock",
    "term": "Lock",
    "ko": "잠금·조건부 갱신",
    "full": "",
    "src": "02-07",
    "level": "심화",
    "def": "동시 요청이 같은 자리를 못 차지하게 기다리게 하거나, 조건이 맞을 때만 저장하는 방법.",
    "easy": "화장실 문을 잠그면 한 명씩 들어가요. 안에 있는 동안 다음 사람은 기다려요.",
    "ex": "마지막 한 자리에 열 명이 눌러도 딱 한 명만 신청되게 막아요.",
    "flow": [
      "동시 요청",
      "한 명만 통과",
      "나머지 거부"
    ],
    "use": "신청·결제·재고처럼 여러 사람이 동시에 누르는 기능에서 중복 처리를 막으려고 써요. AI에게 동시에 눌러도 괜찮은지 검토해 달라고 요청해요.",
    "related": [
      "transaction",
      "db-function",
      "constraint"
    ]
  },
  {
    "full": "",
    "flow": [],
    "use": "표를 만들 때 NOT NULL, UNIQUE, CHECK 같은 규칙을 걸어요. 화면 검증이 뚫려도 DB가 잘못된 값을 막아 주는 마지막 안전장치예요.",
    "related": [
      "transaction",
      "rls",
      "db-function"
    ],
    "ex": "수량이 음수가 되지 않게 CHECK를, 같은 신청이 중복되지 않게 UNIQUE를 둘 수 있어요. 여러 행에 걸친 정원 제한은 잠금이나 원자적 갱신 등을 함께 설계해요.",
    "easy": "놀이공원 키 제한선처럼 기준에 안 맞으면 입구에서 막아요.",
    "level": "실전",
    "id": "constraint",
    "term": "Constraint",
    "ko": "제약",
    "src": "02-04 · 02-07",
    "def": "DB가 잘못된 저장을 스스로 거부하는 규칙."
  },
  {
    "id": "db-function",
    "term": "Database Function",
    "ko": "DB 함수",
    "full": "",
    "src": "02-07",
    "level": "실전",
    "def": "DB 안에서 실행되는 로직으로, 정원 확인 같은 규칙을 화면이 아닌 DB에서 강제하는 것.",
    "easy": "가게 안쪽 계산대 규칙이에요. 손님이 뭘 하든 계산대에서 꼭 확인해요.",
    "ex": "신청은 무조건 정원을 확인하는 DB 함수를 거치게 해요.",
    "flow": [],
    "use": "Supabase에서 SQL로 함수를 만들어 rpc로 부를 때 만나요. 여러 단계를 DB 안에서 한 번에 처리해 규칙을 우회하지 못하게 해요.",
    "related": [
      "lock",
      "rls",
      "supabase"
    ]
  },
  {
    "id": "session-token",
    "term": "Session / Token",
    "ko": "세션과 토큰",
    "full": "",
    "src": "02-04 · 02-05 · 02-07",
    "level": "실전",
    "def": "로그인 상태를 유지하는 정보(세션)와 인증 상태를 확인하는 증표(토큰).",
    "easy": "놀이공원 손목밴드예요. 한 번 확인받으면 하루 종일 보여 주면 돼요.",
    "ex": "인증 토큰은 채팅이나 로그에 붙여넣지 않아요.",
    "flow": [
      "로그인",
      "토큰 받기",
      "요청에 첨부"
    ],
    "use": "로그인 기능을 만들거나 API 요청에 증표를 실어 보낼 때 만나요. 토큰이 .env나 코드에 노출되지 않았는지, 채팅에 붙여넣지 않았는지 확인해요.",
    "related": [
      "auth",
      "api-key",
      "supabase"
    ]
  },
  {
    "id": "smtp",
    "term": "SMTP",
    "ko": "커스텀 SMTP",
    "full": "Simple Mail Transfer Protocol",
    "src": "02-07",
    "level": "실전",
    "def": "이메일을 보내는 규약으로, 실제 사용자에게 확인 메일을 보내려면 따로 설정하는 것.",
    "easy": "기본 우체통은 시험용이라 몇 통만 넣을 수 있어요. 큰 우체국을 따로 연결해야 해요.",
    "ex": "내장 메일은 시간당 몇 통만 나가서 Resend 같은 서비스를 연결해요.",
    "flow": [],
    "use": "회원가입 확인 메일이나 비밀번호 재설정 메일이 안 갈 때 설정해요. Supabase 내장 메일은 한도가 작아서 Resend 같은 서비스의 SMTP 정보를 넣어요.",
    "related": [
      "supabase",
      "auth",
      "redirect-url"
    ]
  },
  {
    "id": "redirect-url",
    "term": "Site URL / Redirect URL",
    "ko": "리다이렉트 주소",
    "full": "",
    "src": "02-07",
    "level": "실전",
    "def": "인증 후 돌아올 주소로, 배포 주소로 바꿔야 확인 메일 링크가 제대로 돌아오는 설정.",
    "easy": "택배의 도착 주소예요. 옛날 집 주소면 엉뚱한 곳으로 가요.",
    "ex": "확인 메일 링크가 localhost로 가면 Site URL을 배포 주소로 바꿔요.",
    "flow": [],
    "use": "로그인 후 localhost로 돌아가거나 확인 메일 링크가 엉뚱한 주소로 갈 때 고쳐요. 배포하면 Supabase의 Site URL을 실제 서비스 주소로 바꿔요.",
    "related": [
      "supabase",
      "auth",
      "deploy"
    ]
  },
  {
    "full": "",
    "flow": [],
    "use": "HTML·CSS·JS만 있는 화면을 GitHub Pages나 Netlify 같은 곳에 올릴 때 써요. 서버 코드가 필요하면 정적 호스팅만으로는 안 되고 백엔드를 따로 둬요.",
    "related": [
      "github-pages",
      "web-layers",
      "deploy"
    ],
    "ex": "화면 파일은 GitHub Pages 같은 정적 호스팅에 올리고, 저장·로그인은 필요할 때 Supabase 같은 외부 API와 연결할 수 있어요.",
    "easy": "미리 인쇄한 전단지를 쌓아 두고 나눠 주는 가게예요. 주문받아 만들지 않아요.",
    "level": "입문",
    "id": "static-hosting",
    "term": "Static Hosting",
    "ko": "정적 호스팅",
    "src": "02-07",
    "def": "미리 만든 HTML·CSS·JS·이미지 파일을 호스팅 서버나 CDN에서 전달하는 방식이에요. 별도의 앱 서버를 직접 운영하지 않아도 정적 파일을 배포할 수 있어요."
  },
  {
    "id": "staging-area",
    "term": "Staging Area",
    "ko": "스테이징 영역",
    "full": "",
    "src": "02-07",
    "level": "실전",
    "def": "다음 커밋에 넣기로 골라 둔 변경 묶음을 모아 두는 곳.",
    "easy": "이삿짐 상자에 넣을 물건만 골라서 현관에 모아 둔 모습이에요.",
    "ex": "git add LoginForm.tsx로 의도한 파일만 골라 커밋해요.",
    "flow": [
      "수정하기",
      "add로 고르기",
      "commit"
    ],
    "use": "git add로 파일을 올려 두고 git status로 확인한 뒤 commit하는 흐름에서 만나요. 한 커밋에 일부 파일만 담고 싶을 때 이 개념이 필요해요.",
    "related": [
      "commit",
      "git-branch",
      "git-reset-revert"
    ]
  },
  {
    "id": "git-reset-revert",
    "term": "Reset / Revert",
    "ko": "리셋과 리버트",
    "full": "",
    "src": "02-07",
    "level": "심화",
    "def": "reset --hard는 지정한 커밋으로 강제로 되돌리는 위험한 명령이고, revert는 취소 커밋을 새로 남기는 안전한 방법.",
    "easy": "reset은 지우개로 지우기, revert는 '취소했어요' 메모를 새로 붙이기예요.",
    "ex": "이미 푸시한 변경을 취소할 때는 revert로 기록을 남겨요.",
    "flow": [],
    "cmd": true,
    "use": "잘못 커밋한 변경을 되돌려야 할 때 선택해요. 이미 push한 기록은 git revert로 안전하게 취소하고, reset --hard는 AI가 마음대로 쓰지 못하게 해요.",
    "related": [
      "commit",
      "git-push",
      "git-branch"
    ]
  },
  {
    "id": "doom-loop",
    "term": "Doom Loop",
    "ko": "둠 루프",
    "full": "",
    "src": "02-07",
    "level": "실전",
    "def": "AI가 고쳤다는데 안 고쳐지고, 프롬프트를 더할수록 다른 기능까지 깨지는 늪.",
    "easy": "구멍 난 곳을 테이프로 계속 막다가 다른 곳에서 새는 물통 같아요.",
    "ex": "막힘이 30분을 넘으면 마지막 작동 지점으로 되돌리고 새 대화를 시작해요.",
    "flow": [
      "버그 하나",
      "땜질 반복",
      "되돌리고 리셋"
    ],
    "use": "AI가 같은 오류를 계속 고쳤다고 하면서 더 꼬일 때 겪어요. 이럴 땐 git으로 마지막 정상 상태로 돌아가고 새 대화에서 문제를 짧게 다시 설명해요.",
    "related": [
      "vibe-coding",
      "prompt",
      "commit"
    ]
  },
  {
    "id": "moscow",
    "term": "MoSCoW",
    "ko": "모스코 우선순위",
    "full": "Must / Should / Could / Won't",
    "src": "02-07",
    "level": "입문",
    "def": "기능을 꼭(Must)·있으면 좋음(Should)·나중에(Could)·지금은 안 함(Won't) 네 칸으로 나눠 우선순위를 정하는 방법.",
    "easy": "소풍 가방에 꼭 챙길 것, 있으면 좋은 것, 다음에 챙길 것, 이번엔 안 가져갈 것을 나누는 거예요.",
    "ex": "MVP에서는 Must만 만들고, Won't 목록을 일부러 5개 이상 적어 둬요.",
    "flow": [],
    "use": "프로젝트 시작 전 PRD나 기능 목록을 정리할 때 써요. AI에게 만들 범위를 알려 줄 때 Must만 먼저 말하면 범위가 퍼지지 않아요.",
    "related": [
      "mvp",
      "prd",
      "scope-creep"
    ]
  },
  {
    "id": "scope-creep",
    "term": "Scope Creep",
    "ko": "스코프 크립",
    "full": "",
    "src": "02-07",
    "level": "입문",
    "def": "\"이것만 더\"를 받아들이다 만들 범위가 슬금슬금 늘어나 일이 끝나지 않는 현상. 반대로 범위를 일부러 줄이는 것은 스코프 컷.",
    "easy": "모래성에 탑 하나만 더, 하나만 더 올리다가 결국 다 무너지는 거예요.",
    "ex": "새 기능 요청은 바로 넣지 말고 Won't 목록이나 대기 목록으로 보내요.",
    "flow": [],
    "use": "AI가 편해서 기능을 계속 더 붙이다 프로젝트가 끝나지 않을 때 겪어요. PRD에 Won't 목록을 두고 요청이 올 때마다 범위 안인지 확인해요.",
    "related": [
      "moscow",
      "mvp",
      "prd"
    ]
  },
  {
    "id": "problem-statement",
    "term": "Problem Statement",
    "ko": "문제 정의 한 문장",
    "full": "",
    "src": "02-07",
    "level": "입문",
    "def": "해결책이 아니라 \"누가, 언제, 무엇을 못 해서, 어떤 불편을 겪는지\"를 한 문장으로 적은 것.",
    "easy": "\"배가 아파요\"처럼 어디가 불편한지부터 말하는 거예요. 약 이름은 그다음이에요.",
    "ex": "\"단골손님이 재방문할 때 종이 쿠폰을 잃어버려 적립 혜택을 놓친다\"처럼 앱·AI 같은 수단은 빼고 적어요.",
    "flow": [],
    "use": "프로젝트를 시작하며 PRD 맨 위에 적거나 AI에게 앱 아이디어를 설명할 때 써요. 문제가 분명하면 AI가 엉뚱한 기능을 만들 가능성이 줄어요.",
    "related": [
      "prd",
      "mvp",
      "moscow"
    ]
  },
  {
    "id": "atomic-operation",
    "term": "Atomic Operation",
    "ko": "원자적 처리",
    "full": "",
    "src": "02-07",
    "level": "심화",
    "def": "중간에 끼어들 틈 없이 한 번에 전부 되거나 전부 안 되는 하나의 동작으로 처리하는 것.",
    "easy": "과자 한 봉지를 뜯어 반만 주는 일이 없게, 봉지째 주거나 아예 안 주는 거예요.",
    "ex": "\"현재 신청 수 < 정원\"일 때만 저장하는 원자적 저장을 DB 함수로 만들어 동시 신청에도 정원을 지켜요.",
    "flow": [],
    "use": "동시에 여러 사람이 신청하거나 결제하는 기능에서 중복·초과를 막으려고 써요. 확인과 저장을 따로 하지 않고 한 번에 처리하는 코드인지 살펴봐요.",
    "related": [
      "transaction",
      "lock",
      "db-function"
    ]
  },
  {
    "id": "ai-slop",
    "term": "AI Slop",
    "ko": "AI 슬롭",
    "full": "",
    "src": "02-07",
    "level": "입문",
    "def": "AI가 기본값으로 뽑아낸, 어디서 본 듯한 밋밋하고 뻔한 결과물을 낮춰 부르는 말.",
    "easy": "공장에서 똑같이 찍어 낸 그림처럼 개성이 없는 거예요.",
    "ex": "보라 그라데이션에 기본 폰트인 화면을 frontend-design 스킬로 주제에 맞게 다듬어요.",
    "flow": [],
    "use": "AI가 만든 화면이 다 비슷해 보일 때 이 말을 써요. 구체적인 색·폰트·분위기 지침을 주거나 디자인 스킬을 써서 기본값 느낌을 벗어나요.",
    "related": [
      "skill",
      "vibe-coding",
      "prompt"
    ]
  },
  {
    "id": "grants",
    "term": "Grants",
    "ko": "테이블 접근 권한",
    "full": "",
    "src": "02-07",
    "level": "심화",
    "def": "어떤 역할이 표를 조회·수정할 수 있는지 정하는 DB 권한. RLS는 그중 어떤 행을 다룰지 다시 제한한다.",
    "easy": "도서관 출입증(grants)이 있어야 들어가고, 그 안에서 볼 수 있는 책장(RLS)이 또 정해져 있어요.",
    "ex": "설정에 따라 비로그인 사용자도 데이터를 읽을 수 있어서, grants와 RLS를 함께 확인해요.",
    "flow": [],
    "use": "Supabase에서 표를 만든 뒤 anon, authenticated 같은 역할이 접근할 수 있는지 SQL로 설정해요. 데이터가 안 보이거나 너무 많이 보일 때 RLS와 함께 확인해요.",
    "related": [
      "rls",
      "auth",
      "supabase"
    ]
  },
  {
    "id": "working-tree",
    "term": "Working Tree",
    "ko": "작업 트리",
    "full": "",
    "src": "02-07",
    "level": "실전",
    "def": "지금 편집기에서 바꾸고 저장한 파일들이 있는, 아직 커밋되지 않은 작업 공간.",
    "easy": "책상 위에 펼쳐 놓고 고치는 중인 원고예요.",
    "ex": "확신이 없는 버튼 색 변경은 커밋하지 않고 작업 트리에 그대로 둬요.",
    "flow": [],
    "use": "파일을 고친 뒤 git status를 치면 Changes not staged 같은 문구로 만나요. 커밋하기 전의 변경이 여기에 있어서 지우거나 되돌리기 전에 꼭 확인해요.",
    "related": [
      "staging-area",
      "commit",
      "git-restore"
    ]
  },
  {
    "id": "git-status",
    "term": "git status / git log",
    "ko": "상태·기록 확인",
    "full": "",
    "src": "02-07",
    "level": "입문",
    "def": "git status는 지금 무엇이 바뀌었고 무엇이 스테이징됐는지, git log는 지금까지의 커밋 기록을 보여 주는 명령.",
    "easy": "숙제 하기 전에 책상 위와 지난 일기장을 먼저 훑어보는 거예요.",
    "ex": "되돌리기 명령 전에 git log --oneline, git status, git diff로 내가 어디에 서 있는지 확인해요.",
    "flow": [],
    "cmd": true,
    "use": "AI가 코드를 고친 뒤나 되돌리기 전에 현재 상태를 확인하려고 쳐요. git status로 바뀐 파일을, git log --oneline으로 커밋 기록을 한눈에 봐요.",
    "related": [
      "commit",
      "staging-area",
      "diff"
    ]
  },
  {
    "id": "git-restore",
    "term": "git restore",
    "ko": "변경 버리기",
    "full": "",
    "src": "02-07",
    "level": "실전",
    "def": "작업 트리에서 아직 커밋하지 않은 변경을 버리고 파일을 마지막 커밋 상태로 돌리는 명령.",
    "easy": "고치던 그림을 지우개로 지우고 마지막으로 저장한 그림으로 돌아가는 거예요.",
    "ex": "사라질 내용을 git diff로 먼저 본 뒤 git restore 파일명을 실행해요.",
    "flow": [],
    "cmd": true,
    "use": "AI가 고친 파일이 마음에 안 들어 커밋 전으로 되돌리고 싶을 때 써요. 버린 변경은 복구가 어려워서 git diff로 먼저 확인한 뒤 실행해요.",
    "related": [
      "working-tree",
      "git-reset-revert",
      "diff"
    ]
  },
  {
    "id": "force-push",
    "term": "Force Push",
    "ko": "강제 푸시",
    "full": "",
    "src": "02-07",
    "level": "심화",
    "def": "원격 저장소의 기록을 내 로컬 기록으로 강제로 덮어써 푸시하는 것. 남이 가져간 기록까지 바뀔 수 있다.",
    "easy": "반 친구들이 같이 쓰는 공책의 페이지를 내 마음대로 찢고 새로 붙이는 거예요.",
    "ex": "AI에게 \"강제 푸시나 reset --hard는 내가 승인하기 전에는 실행하지 마\"라고 규칙을 줘요.",
    "flow": [],
    "use": "git push --force를 쓰는 장면에서 만나요. 팀원의 기록이 사라질 수 있어서 AI에게 승인 없이 실행하지 않도록 규칙을 정해 둬요.",
    "related": [
      "git-push",
      "git-reset-revert",
      "git-branch"
    ]
  },
  {
    "id": "git-merge",
    "term": "Merge / Conflict",
    "ko": "병합과 충돌",
    "full": "",
    "src": "02-07",
    "level": "실전",
    "def": "병합은 다른 브랜치의 변경을 합치는 것, 충돌은 같은 곳을 서로 다르게 고쳐 Git이 자동으로 합치지 못하는 상태.",
    "easy": "두 사람이 같은 문장을 다르게 고치면 어느 쪽을 쓸지 사람이 정해야 해요.",
    "ex": "별도 브랜치의 실험이 통과하면 diff를 읽고 합치고, 충돌이 나면 멈추고 사람이 확인해요.",
    "flow": [],
    "use": "브랜치에서 작업을 끝내고 main에 합칠 때, 또는 PR을 merge할 때 만나요. 충돌 표시(<<<<<<<)가 파일에 보이면 어느 쪽을 남길지 직접 결정해요.",
    "related": [
      "git-branch",
      "diff",
      "commit"
    ]
  },
  {
    "id": "refactoring",
    "term": "Refactoring",
    "ko": "리팩터링",
    "full": "",
    "src": "02-07",
    "level": "실전",
    "def": "겉으로 하는 일은 그대로 두고 코드 구조를 읽기 쉽고 고치기 쉽게 다시 정리하는 것.",
    "easy": "장난감 상자 속 물건은 그대로인데 칸을 나눠 다시 정리하는 거예요.",
    "ex": "큰 리팩터링은 정상 작동하는 기본 브랜치를 두고 별도 브랜치에서 해요.",
    "flow": [],
    "use": "기능은 되는데 코드가 길고 꼬였을 때 AI에게 정리를 시킬 때 써요. 동작이 바뀌지 않았는지 테스트나 직접 실행으로 확인하고 별도 브랜치에서 진행해요.",
    "related": [
      "git-branch",
      "commit",
      "diff"
    ]
  },
  {
    "id": "rubber-duck-debugging",
    "term": "Rubber Duck Debugging",
    "ko": "러버덕 디버깅",
    "full": "",
    "src": "02-07",
    "level": "입문",
    "def": "막힌 문제를 누군가(고무 오리)에게 처음부터 말로 설명하다가 스스로 빈틈을 찾는 디버깅 방법.",
    "easy": "인형에게 숙제를 설명하다가 \"아, 여기가 틀렸구나!\" 하고 깨닫는 거예요.",
    "ex": "막히면 \"무엇을 하려 했고, 어디까지 됐고, 어디서 막혔는지\"를 AI에게 또박또박 적어 설명해요.",
    "flow": [],
    "use": "오류가 안 풀릴 때 AI에게 질문을 쓰다가 스스로 원인을 알게 되는 장면에서 만나요. 하려던 일, 현재 상태, 막힌 곳을 순서대로 적어 봐요.",
    "related": [
      "doom-loop",
      "mre",
      "prompt"
    ]
  },
  {
    "id": "mre",
    "term": "MRE",
    "ko": "최소 재현 예시",
    "full": "Minimal Reproducible Example",
    "src": "02-07",
    "level": "실전",
    "def": "남이 그대로 돌려도 같은 문제가 나는, 가능한 한 짧은 코드.",
    "easy": "차 전체가 아니라 \"브레이크 밟을 때 나는 소리\"만 떼어 들려주는 거예요.",
    "ex": "커뮤니티에 물을 때 목표 한 줄, MRE, 정확한 에러 텍스트, 이미 시도한 것을 함께 올려요.",
    "flow": [],
    "use": "GitHub 이슈나 커뮤니티에 오류를 질문할 때 첨부해요. 프로젝트 전체 대신 문제가 재현되는 짧은 코드만 주면 답을 훨씬 빨리 받아요.",
    "related": [
      "rubber-duck-debugging",
      "edge-case",
      "devtools-console"
    ]
  },
  {
    "id": "edge-functions",
    "term": "Edge Functions",
    "ko": "엣지 함수",
    "full": "",
    "src": "02-07",
    "level": "심화",
    "def": "BaaS 위에서 직접 짠 서버 코드를 돌릴 수 있게 해 주는 기능. 서버를 따로 두지 않고 비밀 키가 필요한 처리를 맡길 수 있다.",
    "easy": "가게를 차리지 않고도 큰 상가에 작은 주방 칸 하나를 빌려 요리하는 거예요.",
    "ex": "Supabase에는 DB·로그인과 함께 우리가 짠 서버 로직을 돌리는 Edge Functions와 DB 함수가 딸려 와요.",
    "flow": [],
    "use": "Supabase에서 비밀 키가 필요한 외부 API 호출이나 결제 처리처럼 브라우저에서 하면 안 되는 일을 맡길 때 써요. 배포는 supabase functions deploy로 해요.",
    "related": [
      "baas",
      "supabase",
      "db-function"
    ]
  }
]);

