// 02-02 HTML·CSS·JavaScript — 교육자료 PDF 기반. 처음 나온 자료에만 두고, 다시 나온 자료는 src에 함께 적는다.
addSection('02-02', "HTML·CSS·JavaScript", [
  {
    "full": "",
    "flow": [],
    "related": [
      "web-layers",
      "dom",
      "event-listener"
    ],
    "ex": "h1은 가장 높은 단계의 제목, button은 누르는 버튼을 나타내요. 실제 글자 크기나 색은 CSS로 바꿀 수 있어요.",
    "easy": "물건에 붙이는 이름표. 이름표를 보면 무엇인지 알 수 있어요.",
    "level": "입문",
    "id": "html-tag",
    "term": "Tag",
    "ko": "태그",
    "src": "02-02",
    "def": "HTML에서 정보에 \"이건 제목\", \"이건 버튼\"처럼 의미를 붙이는 표시."
  },
  {
    "id": "box-model",
    "term": "Box Model",
    "ko": "박스모델",
    "full": "",
    "src": "02-02",
    "level": "입문",
    "def": "화면 요소를 content, padding, border, margin 순으로 겹친 상자로 보는 모델.",
    "easy": "선물 상자. 물건, 완충재, 포장지, 상자 사이 간격이 겹겹이에요.",
    "ex": "카드가 답답해 보일 때 안쪽 여백과 바깥 여백 중 어디를 고칠지 짚어요.",
    "flow": [
      "content",
      "padding",
      "border",
      "margin"
    ],
    "related": [
      "padding",
      "margin",
      "web-layers"
    ]
  },
  {
    "id": "padding",
    "term": "padding",
    "ko": "패딩",
    "full": "",
    "src": "02-02",
    "level": "입문",
    "def": "상자 안쪽 여백으로, 버튼 글자와 테두리 사이의 공간.",
    "easy": "옷 속 솜. 두꺼울수록 안의 몸이 테두리에서 멀어져요.",
    "ex": "버튼 글자가 테두리에 붙어 보이면 안쪽 여백을 늘려 달라고 AI에게 말해요.",
    "flow": [],
    "related": [
      "box-model",
      "margin"
    ]
  },
  {
    "id": "margin",
    "term": "margin",
    "ko": "마진",
    "full": "",
    "src": "02-02",
    "level": "입문",
    "def": "상자 바깥쪽 여백으로, 카드와 카드 사이의 간격.",
    "easy": "책상 사이 거리. 옆 사람과 떨어진 정도예요.",
    "ex": "카드끼리 붙어 답답하면 바깥 간격을 늘려 달라고 요청해요.",
    "flow": [],
    "related": [
      "box-model",
      "padding"
    ]
  },
  {
    "id": "flexbox",
    "term": "display: flex",
    "ko": "플렉스 배치",
    "full": "",
    "src": "02-02",
    "level": "실전",
    "def": "요소를 나란히 놓고 정렬하는 CSS 레이아웃 방식.",
    "easy": "줄 세우기. 아이들을 한 줄로 세우고 가운데로 모아요.",
    "ex": "버튼을 가로로 놓고 사이 간격을 일정하게 벌릴 때 쓰는 방식이에요.",
    "flow": [],
    "related": [
      "box-model",
      "responsive",
      "web-layers"
    ]
  },
  {
    "id": "responsive",
    "term": "Responsive Width",
    "ko": "반응형(모바일 폭)",
    "full": "",
    "src": "02-02",
    "level": "입문",
    "def": "작은 화면에서도 깨지지 않고 읽히도록 만드는 것.",
    "easy": "물을 담는 컵에 맞춰 모양이 변하는 젤리. 어느 컵에도 들어가요.",
    "ex": "브라우저 폭을 모바일 크기까지 줄여 버튼이 누르기 편한지 확인해요.",
    "flow": [],
    "related": [
      "flexbox",
      "box-model",
      "front-back"
    ]
  },
  {
    "id": "dom",
    "term": "DOM",
    "ko": "DOM",
    "full": "Document Object Model",
    "src": "02-02",
    "level": "실전",
    "def": "JavaScript가 클래스·속성·상태를 바꾸는 대상인 화면 요소 구조.",
    "easy": "나무 모양 가계도. 가지마다 화면 조각이 하나씩 달려 있어요.",
    "ex": "JavaScript가 DOM의 클래스를 바꾸면 CSS가 달라진 모습을 보여 줘요.",
    "flow": [],
    "related": [
      "html-tag",
      "event-listener",
      "web-layers"
    ]
  },
  {
    "id": "event-listener",
    "term": "Event Listener",
    "ko": "이벤트 리스너",
    "full": "",
    "src": "02-02",
    "level": "입문",
    "def": "클릭 같은 사용자의 행동에 반응해 실행되는 코드.",
    "easy": "현관 초인종. 누르면 안에서 반응해요.",
    "ex": "버튼을 누르면 인사말 창이 뜨게 하는 코드가 이벤트 리스너예요.",
    "flow": [
      "사용자 클릭",
      "리스너 감지",
      "화면 변경"
    ],
    "related": [
      "dom",
      "html-tag",
      "web-layers"
    ]
  },
  {
    "id": "ajax",
    "term": "AJAX",
    "ko": "AJAX",
    "full": "",
    "src": "02-02",
    "level": "실전",
    "def": "페이지를 새로 고치지 않고 서버와 데이터를 주고받는 기법.",
    "easy": "식당에서 손님이 안 일어나도 직원이 반찬을 계속 가져다줘요.",
    "ex": "구글 지도는 끄는 동안 뒤에서 새 지도 조각을 받아와 이어 붙여요.",
    "flow": [
      "지도 끌기",
      "뒤에서 요청",
      "조각 붙임"
    ],
    "related": [
      "async",
      "api",
      "front-back"
    ]
  },
  {
    "full": "",
    "flow": [
      "작업 걸기",
      "다른 일",
      "결과 처리"
    ],
    "related": [
      "event-loop",
      "single-thread",
      "ajax"
    ],
    "ex": "await는 결과가 준비될 때까지 현재 async 함수의 이어지는 실행을 잠시 멈춰요. 그동안 메인 스레드는 다른 작업을 처리할 수 있어요. async를 붙였다고 모든 계산이 자동으로 병렬 실행되지는 않아요.",
    "easy": "카페 진동벨. 기다리는 동안 자리에서 할 일을 해요.",
    "level": "실전",
    "id": "async",
    "term": "Asynchronous",
    "ko": "비동기",
    "src": "02-02",
    "def": "오래 걸리는 작업을 걸어두고 다른 일을 하다가 끝나면 결과를 처리하는 방식."
  },
  {
    "full": "",
    "flow": [],
    "related": [
      "async",
      "event-loop",
      "process"
    ],
    "ex": "fetch로 서버 응답을 기다리는 동안에는 버튼도 반응할 수 있어요. 반면 긴 동기 계산이 메인 스레드를 붙잡으면 버튼 반응과 화면 갱신이 늦어질 수 있어요.",
    "easy": "계산대에 직원이 한 명뿐인 가게. 한 손님씩 차례로 받아요.",
    "level": "심화",
    "id": "single-thread",
    "term": "Single Thread",
    "ko": "싱글 스레드",
    "src": "02-02",
    "def": "JavaScript의 메인 스레드는 한 번에 하나의 작업을 처리해요. 비동기 작업을 기다리는 동안에는 다른 작업을 처리할 수 있어요."
  },
  {
    "id": "event-loop",
    "term": "Event Loop",
    "ko": "이벤트 루프",
    "full": "",
    "src": "02-02",
    "level": "심화",
    "def": "끝난 비동기 작업의 결과를 대기줄에서 꺼내 처리하는 구조.",
    "easy": "번호표 대기줄을 계속 확인하는 창구 직원이에요.",
    "ex": "fetch 요청이 끝나면 결과가 대기줄에 올라가고 일꾼이 차례로 처리해요.",
    "flow": [
      "작업 완료",
      "대기줄 등록",
      "결과 처리"
    ],
    "related": [
      "async",
      "single-thread",
      "ajax"
    ]
  },
  {
    "full": "",
    "flow": [],
    "related": [
      "single-thread",
      "async"
    ],
    "ex": "Chrome은 페이지 등을 여러 프로세스로 나눠 실행해 오류의 영향을 줄여요. 한 탭에 여러 프로세스를 쓰거나 여러 탭이 프로세스를 공유할 수도 있어요.",
    "easy": "각자 문을 잠그고 쓰는 작업실이에요. 옆방 물건은 못 만져요.",
    "level": "심화",
    "id": "process",
    "term": "Process",
    "ko": "프로세스",
    "src": "02-02",
    "def": "실행 중인 프로그램 하나로, 독립된 메모리를 쓰는 단위."
  },
  {
    "id": "state",
    "term": "State",
    "ko": "상태",
    "full": "",
    "src": "02-02 · 02-03",
    "level": "입문",
    "def": "점수, 진행 중·종료, 이김·짐처럼 앱의 지금 상황을 나타내는 값.",
    "easy": "게임 점수판. 지금 몇 대 몇인지 알려 줘요.",
    "ex": "게임을 보이는 것, 상태, 규칙으로 나눠 적어 AI에게 요청해요.",
    "flow": [],
    "related": [
      "web-layers",
      "dom",
      "vibe-coding"
    ]
  },
  {
    "id": "devtools-console",
    "term": "DevTools Console",
    "ko": "개발자도구 콘솔",
    "full": "",
    "src": "02-02",
    "level": "입문",
    "def": "브라우저 개발자도구에서 오류 메시지를 확인하는 곳.",
    "easy": "자동차 계기판의 경고등. 고장 난 곳을 알려 줘요.",
    "ex": "실습에서 Console에 오류가 없는지 확인하고 있으면 AI에게 붙여 넣어요.",
    "flow": [],
    "related": [
      "web-layers",
      "dom"
    ]
  },
  {
    "id": "github",
    "term": "GitHub",
    "ko": "깃허브",
    "full": "",
    "src": "02-02",
    "level": "입문",
    "def": "코드를 올려 두는 온라인 저장소 서비스.",
    "easy": "사진을 올려 두는 클라우드 앨범의 코드 버전이에요.",
    "ex": "게임 폴더를 공개 저장소로 올려 GitHub Pages 배포의 출발점으로 삼아요.",
    "flow": [],
    "related": [
      "github-pages",
      "commit",
      "deploy"
    ]
  },
  {
    "id": "github-pages",
    "term": "GitHub Pages",
    "ko": "깃허브 페이지",
    "full": "",
    "src": "02-02 · 02-07",
    "level": "입문",
    "def": "HTML·CSS·JS 페이지를 무료로 웹에 올려 주는 서비스.",
    "easy": "내 그림을 동네 게시판에 무료로 붙여 주는 서비스예요.",
    "ex": "저장소에서 Pages를 켜면 아이디.github.io/저장소/ 주소가 생겨요.",
    "flow": [
      "저장소 업로드",
      "Pages 켜기",
      "주소 생성"
    ],
    "related": [
      "github",
      "deploy",
      "web-layers"
    ]
  },
  {
    "id": "edge-case",
    "term": "Edge Case",
    "ko": "예외 상황",
    "full": "",
    "src": "02-02",
    "level": "실전",
    "def": "시간이 끝난 뒤 클릭처럼 규칙이 어긋나는 드문 경우.",
    "easy": "달리기 경기에서 출발 신호 전에 먼저 뛰어나가 버린 선수예요.",
    "ex": "PRD에 같은 칸을 두 번 누르면 어떻게 할지 미리 적어 둬요.",
    "flow": [],
    "related": [
      "prd",
      "vibe-coding"
    ]
  }
]);

