// 02-05 네트워크·보안·배포 — 교육자료 PDF 기반. 처음 나온 자료에만 두고, 다시 나온 자료는 src에 함께 적는다.
addSection('02-05', "네트워크·보안·배포", [
  {
    "id": "ip-address",
    "term": "IP address",
    "ko": "IP 주소",
    "full": "Internet Protocol address",
    "src": "02-05",
    "level": "입문",
    "def": "인터넷의 모든 컴퓨터에 붙은 번호 주소.",
    "easy": "집마다 있는 번지수처럼, 컴퓨터마다 붙은 번호예요.",
    "ex": "142.250.72.14 같은 숫자가 서버의 IP 주소예요.",
    "flow": [
      "도메인 입력",
      "DNS 조회",
      "IP 연결"
    ],
    "related": [
      "domain",
      "dns",
      "port"
    ]
  },
  {
    "id": "domain",
    "term": "Domain",
    "ko": "도메인",
    "full": "",
    "src": "02-05",
    "level": "입문",
    "def": "사람이 외우기 쉽게 만든 이름 형태의 인터넷 주소.",
    "easy": "전화번호 대신 '김밥천국'이라고 부르는 가게 이름이에요.",
    "ex": "mysite.com 같은 주소를 1년에 만 원 안팎으로 등록해서 서비스에 연결해요.",
    "flow": [],
    "related": [
      "dns",
      "ip-address",
      "hosting"
    ]
  },
  {
    "id": "dns",
    "term": "DNS",
    "ko": "DNS",
    "full": "Domain Name System",
    "src": "02-05",
    "level": "입문",
    "def": "도메인 이름을 IP 주소로 바꿔 주는 시스템.",
    "easy": "이름을 알려 주면 번호를 찾아 주는 전화번호부예요.",
    "ex": "도메인을 서버에 연결할 때 DNS 설정을 바꾸고, 반영까지 몇 분에서 몇 시간 기다려요.",
    "flow": [
      "도메인 질문",
      "DNS가 IP 응답",
      "서버 접속"
    ],
    "related": [
      "domain",
      "ip-address",
      "https"
    ]
  },
  {
    "id": "port",
    "term": "Port",
    "ko": "포트",
    "full": "",
    "src": "02-05",
    "level": "입문",
    "def": "한 컴퓨터 안에서 프로그램마다 받는 창구 번호(0~65535).",
    "easy": "건물 주소가 IP라면, 건물 안의 호실 번호가 포트예요.",
    "ex": "localhost:3000 주소에서 3000이 포트 번호이고, 웹은 보통 80번과 443번을 써요.",
    "flow": [],
    "related": [
      "localhost",
      "firewall",
      "ip-address"
    ]
  },
  {
    "id": "firewall",
    "term": "Firewall",
    "ko": "방화벽",
    "full": "",
    "src": "02-05",
    "level": "입문",
    "def": "필요 없는 포트를 닫아 아무나 못 들어오게 막는 보안 장치.",
    "easy": "건물 문을 지키는 경비 아저씨처럼, 들어올 사람을 가려요.",
    "ex": "내 컴퓨터에선 되는데 밖에선 안 열릴 때, 포트가 방화벽에 막혔는지 의심해 봐요.",
    "flow": [],
    "related": [
      "port",
      "tunnel",
      "localhost"
    ]
  },
  {
    "id": "tunnel",
    "term": "Tunnel",
    "ko": "터널",
    "full": "",
    "src": "02-05",
    "level": "실전",
    "def": "포트를 열지 않고 내 컴퓨터의 서버를 바깥과 연결해 주는 방법.",
    "easy": "닫힌 문 옆에 임시 비밀 통로를 뚫어 손님을 들이는 것 같아요.",
    "ex": "ngrok 같은 도구로 내 컴퓨터에서 도는 앱을 친구에게 잠깐 보여 줘요.",
    "flow": [
      "내 서버 실행",
      "터널 연결",
      "임시 주소 공유"
    ],
    "related": [
      "localhost",
      "port",
      "firewall"
    ]
  },
  {
    "id": "devtools-network",
    "term": "DevTools Network tab",
    "ko": "개발자도구 네트워크 탭",
    "full": "",
    "src": "02-05",
    "level": "입문",
    "def": "브라우저에서 주고받은 요청·응답과 상태 코드를 보여 주는 도구.",
    "easy": "브라우저와 서버가 나눈 대화를 녹음해 둔 기록이에요.",
    "ex": "우클릭 후 검사에서 네트워크 탭을 열고 빨간 줄(4xx, 5xx)을 찾으면 문제 단서가 보여요.",
    "flow": [],
    "related": [
      "status-code",
      "http",
      "cors"
    ]
  },
  {
    "id": "https",
    "term": "HTTPS",
    "ko": "HTTPS",
    "full": "HyperText Transfer Protocol Secure",
    "src": "02-05",
    "level": "입문",
    "def": "HTTP 대화를 암호화하고 전송 중 변조를 확인하는 방식.",
    "easy": "엽서 대신 내용을 잠근 봉투에 담아 보내는 것과 같아요.",
    "ex": "공개 주소가 https로 열리는지, 인증서 경고가 없는지 배포 후에 확인해요.",
    "flow": [],
    "related": [
      "http",
      "dns",
      "domain"
    ]
  },
  {
    "id": "hosting",
    "term": "Hosting",
    "ko": "호스팅",
    "full": "",
    "src": "02-05",
    "level": "입문",
    "def": "늘 켜져 있는 컴퓨터를 빌려 서비스를 올려 두는 것.",
    "easy": "내 가게를 24시간 열어 둘 수 있게 상가 한 칸을 빌리는 일이에요.",
    "ex": "Vercel이나 Render 같은 곳에 앱을 올리면 노트북을 꺼도 서비스가 계속 열려 있어요.",
    "flow": [],
    "related": [
      "deploy",
      "domain",
      "auto-deploy"
    ]
  },
  {
    "id": "baas",
    "term": "BaaS",
    "ko": "BaaS",
    "full": "Backend as a Service",
    "src": "02-05",
    "level": "실전",
    "def": "이미 준비된 백엔드 기능을 연결해 쓰는 서비스 방식.",
    "easy": "주방을 직접 짓지 않고, 만들어진 주방을 빌려 요리하는 것 같아요.",
    "ex": "Supabase를 연결해서 직접 서버를 만들지 않고 Todo 앱의 저장과 로그인을 맡겨요.",
    "flow": [],
    "related": [
      "database",
      "front-back",
      "api"
    ]
  },
  {
    "id": "git-push",
    "term": "git push",
    "ko": "푸시",
    "full": "",
    "src": "02-05 · 02-07",
    "level": "입문",
    "def": "커밋한 기록을 GitHub 같은 원격 저장소로 보내는 것.",
    "easy": "내 노트북에 쓴 일기를 클라우드 일기장에 올려 두는 일이에요.",
    "ex": "배포 브랜치로 push하면 연결된 플랫폼이 새 코드를 받아 자동으로 배포해요.",
    "flow": [
      "수정·저장",
      "커밋",
      "푸시"
    ],
    "related": [
      "commit",
      "git-branch",
      "git-repository"
    ]
  },
  {
    "id": "git-branch",
    "term": "Branch",
    "ko": "브랜치",
    "full": "",
    "src": "02-05 · 02-07",
    "level": "입문",
    "def": "코드 작업을 나누어 진행하는 갈래이자 배포할 코드 줄기.",
    "easy": "나무 줄기에서 갈라진 가지처럼 따로 작업하는 길이에요.",
    "ex": "배포 플랫폼에 연결한 브랜치에 push해야 공개 서비스에 변경이 반영돼요.",
    "flow": [],
    "related": [
      "git-push",
      "git-repository",
      "auto-deploy"
    ]
  },
  {
    "id": "git-repository",
    "term": "Repository",
    "ko": "저장소",
    "full": "",
    "src": "02-05",
    "level": "입문",
    "def": "코드와 변경 기록을 올려 두는 곳.",
    "easy": "내 코드와 수정 이력을 모아 두는 서랍장이에요.",
    "ex": "GitHub 저장소를 Vercel에 연결하면 플랫폼이 코드를 가져가 배포해요.",
    "flow": [],
    "related": [
      "commit",
      "git-push",
      "git-branch"
    ]
  },
  {
    "id": "auto-deploy",
    "term": "Auto deploy",
    "ko": "자동 배포",
    "full": "",
    "src": "02-05",
    "level": "실전",
    "def": "연결한 브랜치에 push하면 플랫폼이 빌드와 배포까지 해 주는 것.",
    "easy": "편지를 우체통에 넣으면 알아서 배달까지 되는 것과 같아요.",
    "ex": "코드를 고치고 커밋한 뒤 push하면 Vercel이 새 버전을 알아서 공개해요.",
    "flow": [
      "코드 수정",
      "커밋·푸시",
      "자동 배포"
    ],
    "related": [
      "git-push",
      "build",
      "git-branch"
    ]
  },
  {
    "id": "api-key",
    "term": "API key",
    "ko": "API 키",
    "full": "",
    "src": "02-05 · 02-07",
    "level": "입문",
    "def": "외부 서비스를 쓸 때 신원을 확인하는 비밀 열쇠 문자열.",
    "easy": "남에게 주면 안 되는 우리 집 현관 열쇠예요.",
    "ex": "API 키가 GitHub에 올라가면 봇이 훔쳐 가서 요금 폭탄을 맞을 수 있어요.",
    "flow": [],
    "related": [
      "env",
      "gitignore",
      "api"
    ]
  },
  {
    "id": "cors",
    "term": "CORS",
    "ko": "CORS",
    "full": "Cross-Origin Resource Sharing",
    "src": "02-05",
    "level": "실전",
    "def": "출처가 다른 서버의 응답을 화면 코드가 읽도록 서버가 허용하는 규칙.",
    "easy": "다른 동네 도서관 책을 빌리려면 그 도서관이 허락해 줘야 해요.",
    "ex": "화면은 뜨는데 API 응답을 못 읽고 CORS 오류가 나면 백엔드에서 프론트 주소를 허용해요.",
    "flow": [],
    "related": [
      "api",
      "front-back",
      "devtools-network"
    ]
  },
  {
    "id": "cookie",
    "term": "Cookie",
    "ko": "쿠키",
    "full": "",
    "src": "02-05",
    "level": "실전",
    "def": "사이트가 준 번호를 브라우저가 보관했다가 방문 때마다 보내는 작은 데이터.",
    "easy": "가게가 번호를 적어 준 작은 카드를 지갑에 두고 갈 때마다 보여 주는 것 같아요.",
    "ex": "로그인하면 서버가 세션 번호를 쿠키로 주고, 이후 요청마다 브라우저가 함께 보내요.",
    "flow": [
      "로그인",
      "쿠키 받기",
      "요청마다 전송"
    ],
    "related": [
      "auth",
      "password-hash",
      "http"
    ]
  },
  {
    "id": "free-tier",
    "term": "Free tier",
    "ko": "무료 티어",
    "full": "",
    "src": "02-05",
    "level": "입문",
    "def": "무료 한도 안에서만 쓸 수 있는 요금제.",
    "easy": "시식 코너처럼 정해진 양까지만 공짜로 먹을 수 있어요.",
    "ex": "트래픽이 늘거나 한도를 넘으면 유료가 되니 가입 전에 공식 요금 페이지를 확인해요.",
    "flow": [],
    "related": [
      "hosting",
      "deploy",
      "api-key"
    ]
  }
]);
