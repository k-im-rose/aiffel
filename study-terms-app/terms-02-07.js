// 02-07 메인퀘스트: 저장·로그인·Git — 교육자료 PDF 기반. 처음 나온 자료에만 두고, 다시 나온 자료는 src에 함께 적는다.
addSection('02-07', "메인퀘스트: 저장·로그인·Git", [
  {
    "id": "supabase",
    "term": "Supabase",
    "ko": "수파베이스",
    "full": "",
    "src": "02-07",
    "level": "입문",
    "def": "DB·회원가입·로그인·권한이 함께 오는, 무료로 시작할 수 있는 백엔드 서비스(BaaS).",
    "easy": "서버를 직접 안 짓고 빌려 쓰는 완성된 주방 같아요. 재료 창고와 문지기까지 있어요.",
    "ex": "Supabase 프로젝트를 만들면 표와 로그인 기능이 한꺼번에 생겨요.",
    "flow": [],
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
    "related": [
      "transaction",
      "db-function",
      "constraint"
    ]
  },
  {
    "id": "constraint",
    "term": "Constraint",
    "ko": "제약",
    "full": "",
    "src": "02-07",
    "level": "실전",
    "def": "DB가 잘못된 저장을 스스로 거부하는 규칙.",
    "easy": "놀이공원 키 제한선처럼 기준에 안 맞으면 입구에서 막아요.",
    "ex": "정원을 넘는 신청은 DB가 저장 자체를 거부하게 해요.",
    "flow": [],
    "related": [
      "transaction",
      "rls",
      "db-function"
    ]
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
    "src": "02-07",
    "level": "실전",
    "def": "로그인 상태를 유지하는 정보(세션)와 인증 상태를 확인하는 증표(토큰).",
    "easy": "놀이공원 손목밴드예요. 한 번 확인받으면 하루 종일 보여 주면 돼요.",
    "ex": "인증 토큰은 채팅이나 로그에 붙여넣지 않아요.",
    "flow": [
      "로그인",
      "토큰 받기",
      "요청에 첨부"
    ],
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
    "related": [
      "supabase",
      "auth",
      "deploy"
    ]
  },
  {
    "id": "static-hosting",
    "term": "Static Hosting",
    "ko": "정적 호스팅",
    "full": "",
    "src": "02-07",
    "level": "입문",
    "def": "서버 없이 HTML/CSS/JS 파일만 올려서 보여 주는 배포 방식.",
    "easy": "미리 인쇄한 전단지를 쌓아 두고 나눠 주는 가게예요. 주문받아 만들지 않아요.",
    "ex": "HTML·CSS·JS 한 벌이라서 서버 없이 정적 호스팅에 올려요.",
    "flow": [],
    "related": [
      "github-pages",
      "web-layers",
      "deploy"
    ]
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
    "related": [
      "vibe-coding",
      "prompt",
      "commit"
    ]
  }
]);
