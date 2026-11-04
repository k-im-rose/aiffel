// 02-01 바이브 코딩 작업대 — 교육자료 PDF 기반. 처음 나온 자료에만 두고, 다시 나온 자료는 src에 함께 적는다.
addSection('02-01', "바이브 코딩 작업대", [
  {
    "id": "terminal",
    "term": "Terminal",
    "ko": "터미널",
    "full": "",
    "src": "02-01 · 02-06",
    "level": "입문",
    "def": "키 입력을 전달하고 실행 결과를 보여 주는 창.",
    "easy": "글자로 말을 걸고 답을 받는 채팅창 같아요.",
    "ex": "node --version 같은 명령은 Claude Code 입력란이 아니라 터미널에 입력해요.",
    "flow": [],
    "related": [
      "shell",
      "cli",
      "pwd"
    ]
  },
  {
    "id": "shell",
    "term": "Shell",
    "ko": "셸",
    "full": "",
    "src": "02-01",
    "level": "입문",
    "def": "입력한 명령을 해석해 프로그램을 실행하는 도구.",
    "easy": "말을 알아듣고 심부름꾼에게 전해 주는 통역사예요.",
    "ex": "macOS는 보통 zsh, 이 실습의 Windows는 PowerShell을 셸로 써요.",
    "flow": [
      "명령 입력",
      "셸이 해석",
      "프로그램 실행"
    ],
    "related": [
      "terminal",
      "cli"
    ]
  },
  {
    "id": "cli",
    "term": "CLI",
    "ko": "명령줄 인터페이스",
    "full": "Command Line Interface",
    "src": "02-01 · 02-06",
    "level": "입문",
    "def": "터미널에서 글자 명령으로 프로그램을 쓰는 방식.",
    "easy": "버튼 대신 글자로 주문하는 방식이에요.",
    "ex": "터미널에서 claude 명령을 실행해 Claude Code를 CLI로 써요.",
    "flow": [],
    "related": [
      "terminal",
      "shell",
      "agent"
    ]
  },
  {
    "id": "diff",
    "term": "diff",
    "ko": "변경내역",
    "full": "",
    "src": "02-01 · 02-06",
    "level": "입문",
    "def": "파일이 무엇이 어떻게 바뀌었는지 비교해 보여 주는 것.",
    "easy": "틀린 그림 찾기처럼 달라진 곳만 콕 집어 보여 줘요.",
    "ex": "Claude Desktop은 AI가 고친 내용을 diff로 보여 줘서 검토하기 쉬워요.",
    "flow": [],
    "related": [
      "git",
      "commit"
    ]
  },
  {
    "id": "nodejs",
    "term": "Node.js",
    "ko": "노드제이에스",
    "full": "",
    "src": "02-01",
    "level": "입문",
    "def": "웹 도구가 돌아가는 JavaScript 실행 엔진.",
    "easy": "장난감이 움직이려면 필요한 건전지 같아요.",
    "ex": "Next.js 프로젝트를 만들고 실행하려면 Node.js가 필요해요.",
    "flow": [],
    "related": [
      "npm",
      "nvm",
      "web-layers"
    ]
  },
  {
    "id": "npm",
    "term": "npm",
    "ko": "엔피엠",
    "full": "Node Package Manager",
    "src": "02-01",
    "level": "입문",
    "def": "Node.js 위에서 패키지를 설치하고 관리하는 도구.",
    "easy": "필요한 부품을 대신 사다 주는 부품 가게예요.",
    "ex": "Node.js를 설치하면 npm도 함께 들어와 npm --version으로 확인해요.",
    "flow": [],
    "related": [
      "nodejs",
      "nvm",
      "sudo-eacces"
    ]
  },
  {
    "id": "nvm",
    "term": "nvm",
    "ko": "노드 버전 관리자",
    "full": "Node Version Manager",
    "src": "02-01",
    "level": "실전",
    "def": "Node.js 버전을 설치하고 바꿔 쓰게 해 주는 도구.",
    "easy": "신발장처럼 상황마다 맞는 버전으로 갈아 신게 해요.",
    "ex": "nvm install --lts로 설치하고 nvm use로 프로젝트에 맞는 버전을 골라요.",
    "flow": [
      "nvm 설치",
      "버전 설치",
      "nvm use"
    ],
    "related": [
      "nodejs",
      "npm",
      "sudo-eacces"
    ]
  },
  {
    "id": "git",
    "term": "Git",
    "ko": "깃",
    "full": "",
    "src": "02-01",
    "level": "입문",
    "def": "파일 변경 이력을 남기는 장치.",
    "easy": "게임 저장 기능처럼 언제든 예전 상태로 돌아가게 해요.",
    "ex": "변경을 기록해 두면 AI가 고친 내용을 비교하고 되돌릴 수 있어요.",
    "flow": [],
    "related": [
      "commit",
      "diff",
      "terminal"
    ]
  },
  {
    "id": "command-not-found",
    "term": "command not found",
    "ko": "명령어를 찾을 수 없음",
    "full": "",
    "src": "02-01",
    "level": "입문",
    "def": "명령이 설치되지 않았거나 인식되지 않을 때 나오는 오류.",
    "easy": "없는 가게에 주문한 것처럼 못 알아듣겠다는 대답이에요.",
    "ex": "node --version에서 이 오류가 나면 그 한 줄을 그대로 AI에게 보여 줘요.",
    "flow": [],
    "related": [
      "terminal",
      "nodejs",
      "git"
    ]
  },
  {
    "id": "pwd",
    "term": "pwd",
    "ko": "현재 폴더 확인",
    "full": "print working directory",
    "src": "02-01",
    "level": "입문",
    "def": "지금 있는 폴더의 전체 경로를 출력하는 명령.",
    "easy": "지도 앱의 '내 위치' 버튼 같아요.",
    "ex": "위치가 불안하면 pwd부터 실행해 어느 폴더인지 확인해요.",
    "flow": [],
    "related": [
      "cd",
      "path",
      "terminal"
    ]
  },
  {
    "id": "cd",
    "term": "cd",
    "ko": "폴더 이동",
    "full": "change directory",
    "src": "02-01",
    "level": "입문",
    "def": "지정한 폴더로 이동하는 명령.",
    "easy": "집 안에서 다른 방으로 걸어가는 것과 같아요.",
    "ex": "cd ..로 한 단계 위 폴더로 돌아가고, 이동 뒤엔 pwd로 확인해요.",
    "flow": [
      "cd 이동",
      "pwd 확인",
      "ls 목록"
    ],
    "related": [
      "pwd",
      "path",
      "mv"
    ]
  },
  {
    "id": "mv",
    "term": "mv",
    "ko": "이동·이름 바꾸기",
    "full": "move",
    "src": "02-01",
    "level": "실전",
    "def": "파일이나 폴더를 옮기거나 이름을 바꾸는 명령.",
    "easy": "책상 위 물건을 서랍으로 옮기는 일이에요.",
    "ex": "같은 이름이 있으면 덮어쓸 수 있어서 이동 전에 대상을 확인해요.",
    "flow": [],
    "related": [
      "path",
      "dry-run",
      "cd"
    ]
  },
  {
    "id": "path",
    "term": "Path",
    "ko": "경로",
    "full": "",
    "src": "02-01",
    "level": "입문",
    "def": "파일이나 폴더의 위치를 나타내는 주소.",
    "easy": "우리 집 주소처럼 파일이 어디 있는지 알려 줘요.",
    "ex": "현재 작업 폴더는 상대 경로의 기준일 뿐 보안 경계가 아니에요.",
    "flow": [],
    "related": [
      "pwd",
      "cd",
      "mv"
    ]
  },
  {
    "id": "dry-run",
    "term": "dry-run",
    "ko": "드라이런",
    "full": "",
    "src": "02-01",
    "level": "실전",
    "def": "실제 변경 없이 무엇을 할지 미리 보여 주는 실행 계획.",
    "easy": "연습 경기처럼 진짜 하기 전에 미리 해 보는 거예요.",
    "ex": "AI에게 파일별 현재 위치와 제안 위치를 보여 달라고 하고 승인한 뒤 실행해요.",
    "flow": [
      "계획 확인",
      "승인",
      "실행"
    ],
    "related": [
      "mv",
      "agent",
      "tool-use"
    ]
  },
  {
    "id": "sudo-eacces",
    "term": "sudo / EACCES",
    "ko": "관리자 권한과 권한 오류",
    "full": "",
    "src": "02-01",
    "level": "실전",
    "def": "쓰기 권한 부족 오류와 관리자 권한으로 실행하는 명령.",
    "easy": "잠긴 방에 들어가려고 관리자 열쇠를 빌리는 일이에요.",
    "ex": "시스템 위치에 설치하면 EACCES가 나기 쉬워 sudo npm install -g는 쓰지 않아요.",
    "flow": [],
    "related": [
      "nvm",
      "npm",
      "terminal"
    ]
  }
]);
