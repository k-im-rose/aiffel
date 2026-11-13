// 02-01 바이브 코딩 작업대 — 교육자료 PDF 기반. 처음 나온 자료에만 두고, 다시 나온 자료는 src에 함께 적는다.
addSection('02-01', "바이브 코딩 작업대", [
  {
    "id": "terminal",
    "term": "Terminal",
    "ko": "터미널",
    "full": "",
    "src": "02-01 · 02-06 · 03-03",
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
    "full": "",
    "flow": [],
    "related": [
      "npm",
      "nvm",
      "web-layers"
    ],
    "ex": "Next.js 프로젝트를 만들고 실행하려면 Node.js가 필요해요.",
    "easy": "장난감이 움직이려면 필요한 건전지 같아요.",
    "level": "입문",
    "id": "nodejs",
    "term": "Node.js",
    "ko": "노드제이에스",
    "src": "02-01 · 03-07",
    "def": "브라우저 밖에서 JavaScript 프로그램을 실행하는 환경(런타임)이에요. V8 엔진과 파일·네트워크 같은 기능을 함께 제공해요."
  },
  {
    "full": "",
    "flow": [],
    "related": [
      "nodejs",
      "nvm",
      "sudo-eacces"
    ],
    "ex": "Node.js를 설치하면 npm도 함께 들어와 npm --version으로 확인해요.",
    "easy": "필요한 부품을 대신 사다 주는 부품 가게예요.",
    "level": "입문",
    "id": "npm",
    "term": "npm",
    "ko": "엔피엠",
    "src": "02-01",
    "def": "JavaScript 패키지를 설치·관리하고 프로젝트에 정한 명령을 실행하는 도구예요."
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
    "src": "02-01 · 03-07",
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
  },
  {
    "id": "claude-code",
    "term": "Claude Code",
    "ko": "클로드 코드",
    "full": "",
    "src": "02-01 · 02-02 · 02-03 · 02-04 · 02-06 · 02-07 · 03-01",
    "level": "입문",
    "def": "자연어로 지시하면 직접 파일을 만들고 고치고 명령을 실행하는 에이전틱 코딩 도구. Claude Desktop 안의 그래픽 화면과 터미널의 claude 명령, 두 모습으로 쓴다.",
    "easy": "말로 부탁하면 직접 연필을 들고 숙제를 고쳐 주는 짝꿍이에요. 고친 뒤에는 꼭 함께 확인해요.",
    "ex": "프로젝트 폴더에서 claude를 실행하고 \"index.html에 첫 화면을 만들어 줘\"라고 입력하면 파일이 생겨요.",
    "flow": [],
    "related": [
      "agent",
      "harness",
      "cli",
      "terminal"
    ]
  },
  {
    "id": "powershell",
    "term": "PowerShell",
    "ko": "파워셸",
    "full": "",
    "src": "02-01 · 02-03",
    "level": "입문",
    "def": "Windows에서 쓰는 셸. 명령 프롬프트(cmd)나 WSL과 명령 문법이 달라 섞어 입력하지 않는다.",
    "easy": "Windows 컴퓨터의 말을 알아듣는 통역사예요. macOS의 통역사(zsh)와 말투가 조금 달라요.",
    "ex": "Windows에서는 빈 파일을 만들 때 touch 대신 New-Item index.html -ItemType File 같은 PowerShell 명령을 써요.",
    "flow": [],
    "related": [
      "shell",
      "terminal",
      "wsl"
    ]
  },
  {
    "id": "wsl",
    "term": "WSL",
    "ko": "윈도우용 리눅스 환경",
    "full": "Windows Subsystem for Linux",
    "src": "02-01 · 03-01",
    "level": "실전",
    "def": "Windows 안에서 리눅스 환경을 돌려 리눅스 명령과 도구를 쓰게 해 주는 기능.",
    "easy": "Windows 집 안에 리눅스 방을 하나 따로 들인 거예요.",
    "ex": "macOS·Linux·WSL에서는 nvm 공식 설치 스크립트를 터미널에서 실행해 설치해요.",
    "flow": [],
    "related": [
      "powershell",
      "shell",
      "nvm"
    ]
  },
  {
    "id": "lts",
    "term": "LTS",
    "ko": "장기 지원 버전",
    "full": "Long Term Support",
    "src": "02-01 · 02-04",
    "level": "입문",
    "def": "오랫동안 보안·버그 수정을 받도록 지정된 안정 버전.",
    "easy": "새로 나온 맛보다, 오래 팔고 문제가 생기면 고쳐 주는 기본 맛 과자예요.",
    "ex": "nvm install --lts는 현재 LTS Node.js를 설치하고, nvm use --lts는 지금 터미널에서 그 버전을 써요.",
    "flow": [],
    "related": [
      "nodejs",
      "nvm"
    ]
  },
  {
    "id": "gui",
    "term": "GUI",
    "ko": "그래픽 사용자 인터페이스",
    "full": "Graphical User Interface",
    "src": "02-01",
    "level": "입문",
    "def": "글자 명령 대신 창·버튼·아이콘을 마우스로 눌러 쓰는 화면 방식.",
    "easy": "글자로 주문하는 대신 그림 메뉴판을 손가락으로 누르는 거예요.",
    "ex": "Claude Desktop은 GUI라 diff를 눈으로 보기 쉬워요. Cursor 같은 GUI 에디터를 써도 돼요.",
    "flow": [],
    "related": [
      "cli",
      "ui",
      "ide"
    ]
  },
  {
    "id": "utf-8",
    "term": "UTF-8",
    "ko": "유니코드 문자 인코딩",
    "full": "Unicode Transformation Format 8-bit",
    "src": "02-01",
    "level": "실전",
    "def": "한글을 포함한 세계 거의 모든 글자를 컴퓨터가 저장하는 숫자로 바꾸는 표준 문자 인코딩.",
    "easy": "글자마다 번호를 매긴 세계 공용 글자 사전이에요. 같은 사전을 써야 글자가 안 깨져요.",
    "ex": "HTML 머리에 <meta charset=\"UTF-8\">이 있어야 한국어 문서가 깨지지 않고 보여요.",
    "flow": [],
    "related": [
      "web-layers",
      "html-tag"
    ]
  },
  {
    "id": "kernel",
    "term": "Kernel",
    "ko": "커널",
    "full": "",
    "src": "02-01 · 02-02",
    "level": "실전",
    "def": "프로그램이 CPU 시간·메모리·파일·네트워크 같은 자원을 쓰게 중개하는 운영체제의 중심.",
    "easy": "학교 행정실이에요. 교실·체육관·컴퓨터실을 누가 언제 쓸지 나눠 줘요.",
    "ex": "셸이 명령을 해석해 프로그램을 실행하면, 커널이 그 프로그램에 메모리와 CPU 시간을 나눠 줘요.",
    "flow": [],
    "related": [
      "shell",
      "process",
      "memory",
      "cpu-core"
    ]
  },
  {
    "id": "memory",
    "term": "Memory",
    "ko": "메모리",
    "full": "",
    "src": "02-01 · 02-02 · 02-04 · 03-02 · 03-03",
    "level": "입문",
    "def": "실행 중인 프로그램이 데이터를 잠시 올려 두고 쓰는 작업 공간(RAM). 빠르지만 전원이 꺼지면 내용이 사라진다.",
    "easy": "공부할 때 펼쳐 두는 책상 위예요. 넓을수록 여러 책을 펼칠 수 있지만, 퇴근하면 치워져요.",
    "ex": "프로세스는 각자 독립된 메모리를 쓰고, 같은 프로세스 안의 스레드끼리는 메모리를 공유해요.",
    "flow": [],
    "related": [
      "process",
      "thread",
      "kernel",
      "database"
    ]
  },
  {
    "id": "shell-prompt",
    "term": "Shell Prompt",
    "ko": "셸 프롬프트",
    "full": "",
    "src": "02-01",
    "level": "입문",
    "def": "셸이 명령을 받을 준비가 됐음을 알리는 표시. 끝에 $나 > 같은 기호가 붙는다.",
    "easy": "선생님이 \"자, 말해 보세요\" 하고 기다리는 신호예요.",
    "ex": "Claude Code CLI 대화 중이라면 /exit로 나와 셸 프롬프트가 보일 때 node --version을 입력해요.",
    "flow": [],
    "related": [
      "shell",
      "terminal",
      "prompt"
    ]
  },
  {
    "id": "ls",
    "term": "ls",
    "ko": "목록 보기",
    "full": "",
    "src": "02-01",
    "level": "입문",
    "def": "현재 폴더 안의 파일·폴더 이름을 보여 주는 명령.",
    "easy": "서랍을 열어 안에 무엇이 들었는지 훑어보는 거예요.",
    "ex": "mv로 파일을 옮긴 뒤 ls assets/images로 정말 옮겨졌는지 확인해요.",
    "flow": [],
    "related": [
      "pwd",
      "cd",
      "mv"
    ]
  },
  {
    "id": "mkdir",
    "term": "mkdir",
    "ko": "폴더 만들기",
    "full": "",
    "src": "02-01 · 02-07 · 03-07",
    "level": "입문",
    "def": "새 폴더를 만드는 명령.",
    "easy": "책상 서랍에 새 칸막이를 하나 끼우는 거예요.",
    "ex": "mkdir my-first-web으로 첫 프로젝트 폴더를 만들고 cd로 들어가요.",
    "flow": [],
    "related": [
      "cd",
      "ls",
      "path"
    ]
  },
  {
    "id": "touch",
    "term": "touch",
    "ko": "빈 파일 만들기",
    "full": "",
    "src": "02-01",
    "level": "입문",
    "def": "빈 파일을 만들거나 이미 있는 파일의 수정 시각을 갱신하는 명령. Windows PowerShell에서는 New-Item을 쓴다.",
    "easy": "빈 공책 한 권을 책장에 꽂아 두는 거예요.",
    "ex": "macOS 터미널에서 touch index.html로 빈 HTML 파일을 만들어요.",
    "flow": [],
    "related": [
      "mkdir",
      "ls",
      "powershell"
    ]
  },
  {
    "id": "file-extension",
    "term": "File Extension",
    "ko": "확장자",
    "full": "",
    "src": "02-01 · 02-03 · 02-06 · 03-07",
    "level": "입문",
    "def": "파일 이름 끝의 .html·.png·.md처럼 파일 종류를 알려 주는 부분.",
    "easy": "도시락 뚜껑에 붙인 \"김밥\", \"샌드위치\" 이름표예요.",
    "ex": "AI에게 폴더 정리를 맡길 때 \"이름을 추측하지 말고 확장자로 분류해\"라고 규칙을 줘요. .md로 저장할 때 .txt가 덧붙지 않았는지도 확인해요.",
    "flow": [],
    "related": [
      "path",
      "markdown"
    ]
  },
  {
    "id": "curl",
    "term": "curl",
    "ko": "컬",
    "full": "",
    "src": "02-01 · 03-03",
    "level": "실전",
    "def": "터미널에서 주소(URL)로 요청을 보내 내용을 받아 오는 명령. 설치 스크립트를 내려받을 때 자주 쓴다.",
    "easy": "주소만 적어 주면 그 집에 가서 편지를 받아 오는 심부름꾼이에요.",
    "ex": "curl -o- …/install.sh | bash처럼 받은 스크립트를 바로 실행하는 명령은 링크의 태그와 공식 릴리스 페이지를 확인한 뒤 실행해요.",
    "flow": [],
    "related": [
      "url",
      "terminal",
      "nvm"
    ]
  },
  {
    "id": "url",
    "term": "URL",
    "ko": "웹 주소",
    "full": "Uniform Resource Locator",
    "src": "02-01 · 02-02 · 02-04 · 02-05 · 02-06 · 02-07 · 03-05 · 03-07",
    "level": "입문",
    "def": "인터넷에서 페이지나 파일의 위치를 가리키는 주소.",
    "easy": "인터넷 세상의 집 주소예요. 주소만 알면 누구든 찾아올 수 있어요.",
    "ex": "GitHub Pages로 배포하면 https://아이디.github.io/my-game/ 같은 URL이 생겨 링크로 공유할 수 있어요.",
    "flow": [],
    "related": [
      "domain",
      "routing",
      "http",
      "endpoint"
    ]
  },
  {
    "id": "sandbox",
    "term": "Sandbox",
    "ko": "샌드박스",
    "full": "",
    "src": "02-01",
    "level": "실전",
    "def": "프로그램이 정해진 범위 밖의 파일·네트워크를 건드리지 못하게 가둬 두고 실행하는 장치.",
    "easy": "모래놀이 상자예요. 상자 안에서는 마음껏 놀아도 밖으로 모래가 넘치지 않아요.",
    "ex": "작업 폴더를 고른다고 바깥 파일 접근이 막히지는 않아요. 실제 범위는 운영체제 권한, Claude Code 권한 설정, 샌드박스 설정에 따라 달라져요.",
    "flow": [],
    "related": [
      "permission-mode",
      "claude-code",
      "path"
    ]
  }
]);

