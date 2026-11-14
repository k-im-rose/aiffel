// 02-05 네트워크·보안·배포 — 교육자료 PDF 기반. 처음 나온 자료에만 두고, 다시 나온 자료는 src에 함께 적는다.
addSection('02-05', "네트워크·보안·배포", [
  {
    "id": "ip-address",
    "term": "IP address",
    "ko": "IP 주소",
    "full": "Internet Protocol address",
    "src": "02-05 · 03-05",
    "level": "입문",
    "def": "인터넷의 모든 컴퓨터에 붙은 번호 주소.",
    "easy": "집마다 있는 번지수처럼, 컴퓨터마다 붙은 번호예요.",
    "ex": "142.250.72.14 같은 숫자가 서버의 IP 주소예요.",
    "flow": [
      "도메인 입력",
      "DNS 조회",
      "IP 연결"
    ],
    "use": "서버에 접속하거나 방화벽·DNS를 설정할 때 만나요. ssh로 서버에 들어갈 때나 도메인을 서버에 연결할 때 IP 주소를 써요.",
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
    "use": "서비스를 배포한 뒤 mysite.com 같은 내 주소를 붙이고 싶을 때 만나요. 도메인을 사서 호스팅 플랫폼과 DNS 설정으로 연결해요.",
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
    "use": "도메인을 샀는데 사이트가 안 열릴 때 DNS 설정을 확인해요. A 레코드나 CNAME을 호스팅 플랫폼이 알려 준 값으로 맞추고 반영을 기다려요.",
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
    "src": "02-05 · 03-03",
    "level": "입문",
    "def": "한 컴퓨터 안에서 프로그램마다 받는 창구 번호(0~65535).",
    "easy": "건물 주소가 IP라면, 건물 안의 호실 번호가 포트예요.",
    "ex": "localhost:3000 주소에서 3000이 포트 번호이고, 웹은 보통 80번과 443번을 써요.",
    "flow": [],
    "use": "npm run dev를 하면 localhost:3000처럼 포트 번호가 나와요. 'port already in use' 오류가 나면 이미 같은 포트를 쓰는 프로그램이 있다는 뜻이에요.",
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
    "use": "서버를 배포했는데 밖에서 접속이 안 될 때 방화벽에서 포트가 막혔는지 확인해요. 클라우드 서버를 만들 때 열 포트를 직접 정하기도 해요.",
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
    "src": "02-04 · 02-05 · 03-03",
    "level": "실전",
    "def": "포트를 열지 않고 내 컴퓨터의 서버를 바깥과 연결해 주는 방법.",
    "easy": "닫힌 문 옆에 임시 비밀 통로를 뚫어 손님을 들이는 것 같아요.",
    "ex": "ngrok 같은 도구로 내 컴퓨터에서 도는 앱을 친구에게 잠깐 보여 줘요.",
    "flow": [
      "내 서버 실행",
      "터널 연결",
      "임시 주소 공유"
    ],
    "use": "내 컴퓨터에서 개발 중인 화면을 팀원이나 휴대폰에서 잠깐 보여 줘야 할 때 써요. 배포 없이도 임시 공개 주소를 얻을 수 있어요.",
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
    "use": "화면에 데이터가 안 뜰 때 F12로 네트워크 탭을 열어요. 어떤 API 요청이 실패했는지, 상태 코드와 응답 내용이 뭔지 바로 확인할 수 있어요.",
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
    "use": "배포한 사이트 주소가 https://로 시작하는지, 브라우저에 '안전하지 않음' 경고가 없는지 확인해요. 로그인이나 결제가 있는 서비스는 필수예요.",
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
    "use": "내 컴퓨터에서만 돌던 앱을 모두가 접속하게 하려면 호스팅이 필요해요. Vercel, Render 같은 곳에 올려 공개 주소를 받는 단계에서 만나요.",
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
    "use": "서버를 직접 만들기 부담스러울 때 Supabase나 Firebase를 골라요. 로그인과 데이터 저장을 빠르게 붙이고 싶은 입문 프로젝트에서 자주 써요.",
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
    "cmd": true,
    "use": "코드를 커밋한 뒤 git push로 GitHub에 올려요. Vercel이나 Render가 연결돼 있으면 push가 곧 배포 시작 신호가 돼요.",
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
    "use": "새 기능을 시험할 때 main을 건드리지 않고 브랜치를 따로 만들어요. 배포 플랫폼은 어느 브랜치를 배포할지 설정에서 정해요.",
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
    "src": "02-05 · 03-07",
    "level": "입문",
    "def": "코드와 변경 기록을 올려 두는 곳.",
    "easy": "내 코드와 수정 이력을 모아 두는 서랍장이에요.",
    "ex": "GitHub 저장소를 Vercel에 연결하면 플랫폼이 코드를 가져가 배포해요.",
    "flow": [],
    "use": "git init이나 GitHub에서 저장소를 만들며 시작해요. 배포 플랫폼에 프로젝트를 연결할 때도 어떤 저장소를 쓸지 고르게 돼요.",
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
    "use": "Vercel이나 Render에 GitHub 저장소를 연결해 두면 push 때마다 새 버전이 올라가요. 배포가 안 바뀌면 push한 브랜치와 빌드 로그를 확인해요.",
    "related": [
      "git-push",
      "build",
      "git-branch"
    ]
  },
  {
    "full": "Application Programming Interface key",
    "flow": [],
    "use": "OpenAI, Supabase 같은 서비스를 연동할 때 발급받아 .env에 넣어요. 코드나 GitHub에 올리면 유출되니 서버에서만 쓰고 공개 저장소에는 절대 올리지 않아요.",
    "related": [
      "env",
      "gitignore",
      "api"
    ],
    "ex": "Supabase의 publishable 키는 브라우저에서 쓸 수 있지만 데이터 접근 정책이 필요해요. secret 키는 서버에서만 보관하고 공개하지 않아요.",
    "easy": "방문자용 출입증도 있고 관리자용 만능 열쇠도 있어요. 어떤 종류인지에 따라 보관할 곳과 허용 범위가 달라요.",
    "level": "입문",
    "id": "api-key",
    "term": "API key",
    "ko": "API 키",
    "src": "02-05 · 02-07 · 03-03 · 03-05",
    "def": "API를 호출하는 앱이나 프로젝트를 식별하고 접근을 제어하는 문자열이에요. 서버 전용 비밀 키와 공개 가능한 키를 구분해야 해요."
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
    "use": "프런트(localhost:3000)가 다른 주소의 API를 부를 때 콘솔에 'blocked by CORS policy'가 뜨면 만나요. 서버에서 프런트 주소를 허용하도록 고쳐야 해요.",
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
    "use": "로그인 상태를 유지할 때 서버가 쿠키를 내려줘요. 개발자도구 Application 탭에서 쿠키를 확인하고, 로그인이 풀리면 쿠키 설정부터 살펴봐요.",
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
    "src": "02-04 · 02-05 · 03-05",
    "level": "입문",
    "def": "무료 한도 안에서만 쓸 수 있는 요금제.",
    "easy": "시식 코너처럼 정해진 양까지만 공짜로 먹을 수 있어요.",
    "ex": "트래픽이 늘거나 한도를 넘으면 유료가 되니 가입 전에 공식 요금 페이지를 확인해요.",
    "flow": [],
    "use": "Vercel, Supabase, Render 같은 서비스에 가입할 때 무료 한도가 어디까지인지 확인해요. 한도를 넘으면 서비스가 멈추거나 요금이 붙을 수 있어요.",
    "related": [
      "hosting",
      "deploy",
      "api-key"
    ]
  },
  {
    "id": "lan-wan",
    "term": "LAN / WAN",
    "ko": "내부망 / 외부망",
    "full": "Local Area Network / Wide Area Network",
    "src": "02-05",
    "level": "입문",
    "def": "집·회사 안에서 공유기로 묶인 좁은 네트워크(LAN)와 그 바깥의 넓은 네트워크(WAN).",
    "easy": "우리 아파트 단지 안 길이 LAN이고, 단지 밖으로 이어진 큰 도로가 WAN이에요.",
    "ex": "집 안 노트북과 휴대폰은 같은 LAN에서 192.168.0.x 주소로 통신하고, 인터넷으로 나갈 때는 공유기를 거쳐 WAN으로 나가요.",
    "flow": [],
    "use": "집이나 회사 컴퓨터에서 서버를 열 때 같은 네트워크 안에서만 되는지 밖에서도 되는지 구분해야 해요. 휴대폰으로 개발 중인 화면을 볼 때도 만나요.",
    "related": [
      "private-ip",
      "nat",
      "ip-address"
    ]
  },
  {
    "id": "private-ip",
    "term": "Private IP / Public IP",
    "ko": "사설 IP / 공인 IP",
    "full": "",
    "src": "02-05",
    "level": "실전",
    "def": "내부망 안에서만 쓰는 주소(사설 IP)와 인터넷 어디서나 찾을 수 있는 주소(공인 IP).",
    "easy": "사설 IP는 집 안에서 부르는 '큰방·작은방'이고, 공인 IP는 우편물이 찾아오는 집 주소예요.",
    "ex": "내 노트북의 192.168.0.5는 사설 IP라서 친구에게 알려 줘도 바깥에서는 내 컴퓨터를 찾지 못해요.",
    "flow": [],
    "use": "ipconfig나 ifconfig로 확인한 192.168.x.x 주소가 사설 IP예요. 같은 와이파이의 휴대폰은 이 주소로 접속하지만 바깥에서는 안 열려요.",
    "related": [
      "ip-address",
      "nat",
      "lan-wan"
    ]
  },
  {
    "id": "nat",
    "term": "NAT",
    "ko": "주소 변환",
    "full": "Network Address Translation",
    "src": "02-05",
    "level": "실전",
    "def": "공유기가 내부 기기의 사설 주소와 외부 통신에 쓰는 공인 주소를 바꿔 연결해 주는 기능.",
    "easy": "아파트 경비실이 '몇 동 몇 호' 택배를 받아 대신 전해 주는 것 같아요. 모르는 손님은 어느 집으로 보낼지 몰라요.",
    "ex": "내가 먼저 보낸 요청의 응답은 돌아오지만, 바깥에서 갑자기 들어온 요청은 NAT가 어느 기기로 보낼지 몰라 막혀요.",
    "flow": [],
    "use": "집 컴퓨터에서 서버를 돌렸는데 밖에서 접속이 안 될 때 원인으로 만나요. 공유기가 외부 요청을 막고 있어 포트 포워딩 같은 설정이 따로 필요해요.",
    "related": [
      "private-ip",
      "port-forwarding",
      "lan-wan"
    ]
  },
  {
    "id": "port-forwarding",
    "term": "Port Forwarding",
    "ko": "포트 포워딩",
    "full": "",
    "src": "02-05",
    "level": "실전",
    "def": "공유기의 특정 포트로 들어온 외부 요청을 내부의 정해진 컴퓨터·포트로 넘겨 주도록 설정하는 것.",
    "easy": "경비실에 '3000번으로 오는 손님은 101호로 보내 주세요'라고 미리 말해 두는 거예요.",
    "ex": "집 서버를 공개하려고 공유기에서 포트 포워딩을 설정하면, 그 포트가 인터넷에 노출되니 위험도 함께 따져야 해요.",
    "flow": [],
    "use": "집 컴퓨터를 서버로 쓰고 싶을 때 공유기 관리 화면에서 설정해요. 포트가 인터넷에 열리니 비밀번호와 보안 설정을 꼭 점검해야 해요.",
    "related": [
      "nat",
      "port",
      "ddns"
    ]
  },
  {
    "id": "ddns",
    "term": "DDNS",
    "ko": "동적 DNS",
    "full": "Dynamic Domain Name System",
    "src": "02-05",
    "level": "실전",
    "def": "자주 바뀌는 집 회선의 공인 IP를 도메인 이름에 자동으로 다시 연결해 주는 서비스.",
    "easy": "이사를 자주 다니는 친구의 새 주소를 전화번호부가 알아서 고쳐 주는 거예요.",
    "ex": "포트 포워딩으로 집 서버를 열고, DDNS로 바뀌는 IP에도 같은 주소로 접속하게 해요.",
    "flow": [],
    "use": "집 인터넷의 공인 IP가 바뀌어도 같은 주소로 접속하고 싶을 때 써요. 공유기나 DDNS 서비스에서 도메인을 등록해 집 서버를 운영할 때 만나요.",
    "related": [
      "dns",
      "port-forwarding",
      "private-ip"
    ]
  },
  {
    "id": "packet",
    "term": "Packet",
    "ko": "패킷",
    "full": "",
    "src": "02-05",
    "level": "실전",
    "def": "네트워크로 보낼 데이터를 잘게 나눈 조각. 각 조각에 받는 곳 주소가 붙어 따로 이동한다.",
    "easy": "큰 퍼즐을 조각조각 나눠 택배 상자 여러 개로 보내고, 받는 쪽에서 다시 맞추는 거예요.",
    "ex": "사진 한 장을 보낼 때도 여러 패킷으로 나뉘어 이동한 뒤 받는 컴퓨터에서 다시 합쳐져요.",
    "flow": [],
    "use": "네트워크가 느리거나 끊길 때 '패킷 손실'이라는 말로 만나요. ping 명령으로 응답 시간과 손실 여부를 확인할 수 있어요.",
    "related": [
      "tcp-ip",
      "ip-address",
      "http"
    ]
  },
  {
    "id": "tcp-ip",
    "term": "TCP/IP",
    "ko": "TCP/IP",
    "full": "Transmission Control Protocol / Internet Protocol",
    "src": "02-05",
    "level": "심화",
    "def": "IP가 패킷을 목적지 주소로 보내고, TCP가 빠짐없이 순서대로 도착했는지 확인하는 인터넷의 기본 통신 규칙.",
    "easy": "IP는 택배 주소를 보고 배달하는 기사님, TCP는 상자가 다 왔는지 번호를 세어 보는 사람이에요.",
    "ex": "HTTP 요청도 TCP/IP 위에서 패킷으로 나뉘어 오가고, 빠진 조각은 TCP가 다시 보내 달라고 해요.",
    "flow": [],
    "use": "웹 요청이 인터넷에서 어떻게 오가는지 설명할 때 바탕이 돼요. 서버 접속이 안 될 때 어느 단계에서 막혔는지 따져 보는 기준이 돼요.",
    "related": [
      "packet",
      "http",
      "ip-address"
    ]
  },
  {
    "id": "encryption",
    "term": "Encryption",
    "ko": "암호화",
    "full": "",
    "src": "02-05",
    "level": "입문",
    "def": "정해진 키가 있어야만 읽을 수 있도록 데이터를 알아볼 수 없는 형태로 바꾸는 것.",
    "easy": "친구와 둘만 아는 비밀 암호로 쪽지를 써서, 중간에 누가 봐도 못 읽게 하는 거예요.",
    "ex": "HTTPS는 브라우저와 서버 사이의 대화를 암호화해서, 중간에서 엿봐도 내용을 알 수 없게 해요.",
    "flow": [],
    "use": "비밀번호와 개인정보를 다룰 때 암호화가 필요하다고 AI가 알려 줘요. 통신은 HTTPS로, 저장하는 데이터는 알맞은 방식으로 보호해야 해요.",
    "related": [
      "https",
      "tls",
      "plaintext"
    ]
  },
  {
    "id": "tls",
    "term": "TLS / SSL",
    "ko": "전송 계층 보안",
    "full": "Transport Layer Security / Secure Sockets Layer",
    "src": "02-05",
    "level": "실전",
    "def": "HTTPS에서 대화를 암호화하고 상대 서버를 확인하는 보안 기술. 연결 전 인증서를 확인하고 키를 정하는 과정을 TLS 핸드셰이크라고 한다.",
    "easy": "편지를 보내기 전에 받는 사람 신분증을 확인하고, 둘만 여는 자물쇠를 정한 뒤 봉투를 잠그는 거예요.",
    "ex": "https://mysite.com에 접속하면 TLS 핸드셰이크로 인증서를 확인한 뒤에야 HTTP 요청이 오가요. SSL은 TLS의 옛 이름이에요.",
    "flow": [
      "인증서 확인",
      "키 마련",
      "암호화 통신"
    ],
    "use": "사이트에 https가 안 될 때나 '인증서 오류'가 뜰 때 만나요. 배포 플랫폼이 TLS 인증서를 자동으로 붙여 주는지 확인해요.",
    "related": [
      "https",
      "certificate",
      "encryption"
    ]
  },
  {
    "id": "certificate",
    "term": "Certificate",
    "ko": "인증서",
    "full": "",
    "src": "02-05",
    "level": "실전",
    "def": "도메인 이름·공개키·유효기간이 담기고 인증기관(CA)의 서명이 붙은 전자 증명서. 접속한 서버가 그 도메인의 서버인지 확인하는 데 쓴다.",
    "easy": "가게 벽에 걸린 영업 허가증이에요. 나라에서 도장을 찍어 줘서 진짜 그 가게인지 믿을 수 있어요.",
    "ex": "배포 플랫폼이 인증서를 자동으로 발급·갱신해 주니, 공개 주소에서 인증서 경고가 없는지만 확인해요.",
    "flow": [],
    "use": "브라우저에 '연결이 비공개로 설정되어 있지 않음' 경고가 뜨면 인증서 문제예요. 만료됐거나 도메인이 맞지 않는지 확인해요.",
    "related": [
      "tls",
      "https",
      "public-key"
    ]
  },
  {
    "id": "public-key",
    "term": "Public Key / Private Key",
    "ko": "공개키 / 개인키",
    "full": "",
    "src": "02-05",
    "level": "심화",
    "def": "누구에게나 알려도 되는 공개키와 주인만 가진 개인키를 한 쌍으로 쓰는 암호 방식. 공개키로 잠근 것은 짝인 개인키로만 연다.",
    "easy": "누구나 넣을 수 있는 우체통 투입구(공개키)와 주인만 가진 우체통 열쇠(개인키)예요.",
    "ex": "TLS 연결 중 서버는 인증서의 공개키에 짝이 맞는 개인키를 가지고 있음을 보여 줘요.",
    "flow": [],
    "use": "GitHub에 SSH 키를 등록할 때 공개키(.pub 파일)를 올리고 개인키는 내 컴퓨터에만 둬요. 개인키가 유출되면 계정이 위험해져요.",
    "related": [
      "certificate",
      "tls",
      "encryption"
    ]
  },
  {
    "id": "origin",
    "term": "Origin",
    "ko": "출처",
    "full": "",
    "src": "02-05",
    "level": "실전",
    "def": "웹 주소의 프로토콜·호스트·포트 조합. 셋 중 하나라도 다르면 다른 출처로 본다.",
    "easy": "같은 건물(호스트)이라도 다른 문(포트)이나 다른 길(프로토콜)로 오면 다른 손님으로 보는 거예요.",
    "ex": "화면은 https://mysite.com, API는 https://api.mysite.com이면 호스트가 달라 다른 출처라서 CORS 허용이 필요해요.",
    "flow": [],
    "use": "CORS 오류 메시지에 'origin'이 나올 때 만나요. 프런트와 API의 주소, 포트가 다르면 다른 출처라서 서버에서 허용 목록에 넣어야 해요.",
    "related": [
      "cors",
      "port",
      "domain"
    ]
  },
  {
    "id": "rate-limit",
    "term": "Rate Limit",
    "ko": "요청 횟수 제한",
    "full": "",
    "src": "02-05 · 02-07 · 03-05",
    "level": "실전",
    "def": "정해진 시간 안에 보낼 수 있는 요청 수의 한도. 넘으면 서버가 429 Too Many Requests 등으로 거절한다.",
    "easy": "놀이기구를 한 사람이 계속 타지 못하게 '한 시간에 세 번까지'로 정해 둔 거예요.",
    "ex": "짧은 시간에 API를 너무 자주 부르면 429가 오고, Supabase 기본 메일은 몇 통 넘게 보내면 over_email_send_rate_limit 오류가 나요.",
    "flow": [],
    "use": "API를 반복 호출하는 코드를 돌리다 429 오류가 나면 만나요. OpenAI나 Supabase 같은 서비스는 한도가 있어서, 잠시 기다렸다 다시 요청하게 만들어야 해요.",
    "related": [
      "status-code",
      "api",
      "smtp"
    ]
  },
  {
    "id": "xss",
    "term": "XSS",
    "ko": "크로스 사이트 스크립팅",
    "full": "Cross-Site Scripting",
    "src": "02-05",
    "level": "실전",
    "def": "사용자 입력에 스크립트를 숨겨 넣어 다른 사람의 브라우저에서 실행되게 하는 공격.",
    "easy": "게시판 글에 몰래 '읽는 사람 지갑을 열어라'는 마법 주문을 써 두면, 읽는 사람마다 당하는 거예요.",
    "ex": "댓글 칸에 <script>를 넣었을 때 그대로 화면에 실행되지 않도록 입력을 검증하고 출력할 때 처리해 달라고 AI에게 요구해요.",
    "flow": [],
    "use": "댓글이나 게시글처럼 사용자가 쓴 글을 화면에 보여주는 기능을 만들 때 점검해요. AI에게 '입력값을 안전하게 처리해 줘'라고 확인을 요청해요.",
    "related": [
      "sql-injection",
      "server-side-validation",
      "vulnerability"
    ]
  },
  {
    "id": "vulnerability",
    "term": "Vulnerability",
    "ko": "취약점",
    "full": "",
    "src": "02-05 · 02-07",
    "level": "입문",
    "def": "공격자가 악용할 수 있는 프로그램의 보안 허점. 알려진 취약점은 업데이트(패치)로 막는다.",
    "easy": "잠기지 않는 창문 같은 허점이에요. 도둑이 알기 전에 고쳐 두어야 해요.",
    "ex": "이미 공개된 취약점을 패치하지 않고 방치했다가 대규모 개인정보 유출로 이어진 사고들이 있어요.",
    "flow": [],
    "use": "npm install 뒤 'vulnerabilities found' 경고가 뜨거나 npm audit을 돌릴 때 만나요. 보안 업데이트로 패치할 수 있는지 확인해요.",
    "related": [
      "xss",
      "sql-injection",
      "dependency"
    ]
  },
  {
    "id": "plaintext",
    "term": "Plaintext",
    "ko": "평문",
    "full": "",
    "src": "02-04 · 02-05 · 03-04",
    "level": "입문",
    "def": "암호화나 해시를 거치지 않아 그대로 읽을 수 있는 원래 데이터.",
    "easy": "봉투 없이 그대로 보내는 엽서 글씨처럼, 누구나 바로 읽을 수 있어요.",
    "ex": "비밀번호를 평문으로 저장한 서비스가 털리면 공격자가 그 값을 바로 써 버릴 수 있어요.",
    "flow": [],
    "use": "코드 리뷰에서 비밀번호나 API 키가 평문으로 저장되거나 로그에 찍히는지 확인해요. 사용자 비밀번호는 해시로 바꿔 저장해야 해요.",
    "related": [
      "password-hash",
      "encryption",
      "salt"
    ]
  },
  {
    "id": "salt",
    "term": "Salt",
    "ko": "솔트",
    "full": "",
    "src": "02-04 · 02-05",
    "level": "실전",
    "def": "비밀번호를 해시하기 전에 사람마다 섞는 무작위 값. 같은 비밀번호라도 해시 결과가 달라진다.",
    "easy": "똑같은 반죽이라도 사람마다 다른 양념을 한 꼬집 넣으면 맛(결과)이 모두 달라져요.",
    "ex": "AI에게 '비밀번호는 솔트를 섞어 bcrypt로 해시해서 저장해 줘'라고 요구해요.",
    "flow": [],
    "use": "회원가입 기능을 만들 때 비밀번호를 bcrypt 같은 라이브러리로 해시하며 쓰여요. 직접 구현하기보다 검증된 라이브러리가 솔트를 알아서 처리해 줘요.",
    "related": [
      "password-hash",
      "plaintext",
      "auth"
    ]
  },
  {
    "id": "phishing",
    "term": "Phishing",
    "ko": "피싱",
    "full": "",
    "src": "02-05",
    "level": "입문",
    "def": "진짜와 비슷한 가짜 사이트나 메시지로 속여 비밀번호·개인정보를 빼내는 공격.",
    "easy": "은행 직원인 척 전화해서 비밀번호를 물어보는 사기꾼과 같아요.",
    "ex": "가짜 도메인의 피싱 사이트도 HTTPS 인증서를 받을 수 있으니, 자물쇠 표시뿐 아니라 도메인 철자도 확인해요.",
    "flow": [],
    "use": "가짜 로그인 페이지로 GitHub이나 클라우드 계정을 노리는 메일이 많아요. 링크를 누르기 전에 주소를 확인하고, 키나 토큰은 절대 입력하지 않아요.",
    "related": [
      "https",
      "domain",
      "certificate"
    ]
  },
  {
    "id": "api-spec",
    "term": "API Specification (OpenAPI)",
    "ko": "API 명세",
    "full": "Application Programming Interface Specification",
    "src": "02-05",
    "level": "실전",
    "def": "엔드포인트 목록과 각 요청·응답의 JSON 모양을 적어 둔 문서. 프론트와 백엔드가 같은 문서를 기준으로 짜서 계약 불일치를 막는다. OpenAPI는 이를 적는 표준 형식이다.",
    "easy": "친구와 편지 주고받기 전에 '봉투엔 이름, 안엔 날짜와 내용'처럼 쓰는 양식을 먼저 정해 두는 거예요.",
    "ex": "화면에 undefined가 뜨면 API 명세의 응답 예시와 실제 응답 모양을 비교하고, 기능이 바뀌면 명세부터 고쳐요.",
    "flow": [
      "명세 작성",
      "양쪽 구현",
      "명세로 확인"
    ],
    "use": "프런트와 백엔드를 따로 만들거나 AI에게 API 구현을 시킬 때 먼저 명세를 써요. 응답 모양이 어긋나 undefined가 뜨는 문제를 줄여 줘요.",
    "related": [
      "endpoint",
      "json",
      "front-back"
    ]
  },
  {
    "id": "vertical-slice",
    "term": "Vertical Slice",
    "ko": "수직 슬라이스",
    "full": "",
    "src": "02-05",
    "level": "실전",
    "def": "화면·API·저장을 층별로 따로 만들지 않고, 한 기능을 끝까지 관통해 완성하고 바로 테스트하는 방식.",
    "easy": "케이크를 층마다 따로 굽지 않고, 한 조각을 위에서 아래까지 잘라 맛보는 거예요.",
    "ex": "회원가입 한 기능만 화면→API→DB 저장까지 완성해 확인하고, 그다음 기능으로 넘어가요.",
    "flow": [
      "한 기능 선택",
      "화면·API·저장",
      "바로 테스트"
    ],
    "use": "AI에게 큰 앱을 한꺼번에 시키면 꼬이기 쉬워서, 기능 하나씩 화면부터 DB까지 만들게 해요. 한 단계마다 작동을 확인하며 진행할 때 써요.",
    "related": [
      "mvp",
      "api-spec",
      "front-back"
    ]
  },
  {
    "id": "undefined",
    "term": "undefined",
    "ko": "정의되지 않은 값",
    "full": "",
    "src": "02-05",
    "level": "입문",
    "def": "JavaScript에서 값이 아직 없거나 없는 속성을 읽었을 때 나오는 값.",
    "easy": "선물 상자를 열었는데 텅 비어 있는 거예요. 상자는 있는데 안에 든 게 없어요.",
    "ex": "프론트가 기대한 데이터 모양과 백엔드 응답이 달라 없는 칸을 읽으면 화면에 undefined가 떠요.",
    "flow": [],
    "use": "브라우저 화면이나 콘솔에 undefined가 보이면 데이터가 없거나 이름이 틀렸다는 신호예요. console.log로 값을 찍어 원인을 찾아요.",
    "related": [
      "json",
      "api-spec",
      "devtools-console"
    ]
  },
  {
    "id": "checkpoint",
    "term": "Checkpoint",
    "ko": "체크포인트",
    "full": "",
    "src": "02-05 · 02-07",
    "level": "입문",
    "def": "잘 작동하는 상태를 커밋 등으로 남겨 문제가 생기면 돌아갈 수 있게 해 둔 지점.",
    "easy": "게임 중간 저장 지점이에요. 실수해도 처음부터가 아니라 여기서 다시 시작해요.",
    "ex": "AI에게 한 단계를 시킬 때마다 실행·확인 후 커밋해 체크포인트를 남겨 둬요.",
    "flow": [],
    "use": "AI에게 여러 번 수정을 시키다 보면 잘 되던 코드가 망가질 때가 있어요. 작동 확인 후 git commit으로 체크포인트를 남기면 git log로 돌아갈 지점을 찾을 수 있어요.",
    "related": [
      "commit",
      "git-reset-revert",
      "git-branch"
    ]
  },
  {
    "id": "spin-down",
    "term": "Spin-down (Cold Start)",
    "ko": "잠듦(콜드 스타트)",
    "full": "",
    "src": "02-05",
    "level": "실전",
    "def": "무료 서버가 한동안 요청이 없으면 꺼졌다가, 다음 요청이 오면 다시 켜지느라 첫 응답이 느려지는 현상.",
    "easy": "손님이 없으면 불을 끄고 쉬는 가게예요. 손님이 오면 불 켜고 준비하느라 잠깐 기다려요.",
    "ex": "Render 무료 웹 서비스는 15분 동안 요청이 없으면 잠들고, 다음 요청에 다시 켜지는 데 1분쯤 걸릴 수 있어요.",
    "flow": [],
    "use": "Render 무료 서비스를 배포했는데 오랜만에 접속하면 로딩이 한참 걸리는 현상으로 만나요. 오류가 아니라 서버가 깨어나는 중이니 잠시 기다려 봐요.",
    "related": [
      "free-tier",
      "hosting",
      "deploy"
    ]
  },
  {
    "id": "virtual-machine",
    "term": "Virtual Machine (VM)",
    "ko": "가상 머신",
    "full": "Virtual Machine",
    "src": "02-05",
    "level": "실전",
    "def": "실제 컴퓨터 한 대 안에 소프트웨어로 만든 독립된 가상의 컴퓨터. 운영체제를 깔고 서버처럼 쓴다.",
    "easy": "큰 집 안에 칸막이를 쳐서 만든 작은 방이에요. 방마다 따로 살림을 차릴 수 있어요.",
    "ex": "Oracle Always Free처럼 리눅스 VM을 받으면 서버 설정을 직접 만지며 공부할 수 있어요.",
    "flow": [],
    "use": "AWS나 Oracle Cloud에서 서버를 빌릴 때 VM 인스턴스를 만들어요. ssh로 접속해 직접 설치하고 설정하는 방식이라 서버 공부에 좋아요.",
    "related": [
      "hosting",
      "deploy",
      "terminal"
    ]
  },
  {
    "id": "bandwidth",
    "term": "Bandwidth",
    "ko": "대역폭",
    "full": "",
    "src": "02-05 · 03-02",
    "level": "입문",
    "def": "일정 시간 동안 주고받을 수 있는 데이터의 양.",
    "easy": "도로의 차선 수예요. 차선이 넓을수록 한 번에 많은 차가 지나가요.",
    "ex": "호스팅 요금표에서 대역폭 한도를 넘으면 접속이 막히거나 요금이 붙을 수 있으니 확인해요.",
    "flow": [],
    "use": "호스팅 요금제를 고를 때 '월 대역폭 100GB' 같은 한도를 봐요. 이미지나 영상이 많은 서비스는 한도를 빨리 넘을 수 있어요.",
    "related": [
      "free-tier",
      "hosting",
      "packet"
    ]
  },
  {
    "id": "billing-alert",
    "term": "Billing / Budget Alert",
    "ko": "요금 알림",
    "full": "",
    "src": "02-05",
    "level": "입문",
    "def": "사용 요금이 정한 금액을 넘으면 알려 주는 설정. 알려 주기만 하고 자동으로 막아 주지는 않는다.",
    "easy": "용돈을 반 넘게 쓰면 엄마가 '조심해' 하고 알려 주는 거예요. 지갑을 잠가 주지는 않아요.",
    "ex": "클라우드에 '한 달 1만 원 넘으면 알려 줘'를 걸어 두면 키 유출이나 무한 반복으로 요금이 급증할 때 빨리 알아차려요.",
    "flow": [],
    "use": "AWS나 Google Cloud를 쓰기 시작할 때 가장 먼저 설정해요. 키가 유출되거나 코드가 무한 반복되어 요금이 폭탄으로 나오는 걸 일찍 알 수 있어요.",
    "related": [
      "free-tier",
      "api-key",
      "env"
    ]
  },
  {
    "id": "public-env-prefix",
    "term": "NEXT_PUBLIC_ / VITE_",
    "ko": "공개 환경변수 접두사",
    "full": "",
    "src": "02-05",
    "level": "실전",
    "def": "이 접두사가 붙은 환경변수는 빌드할 때 화면 코드에 그대로 들어가 브라우저에 공개된다.",
    "easy": "이름표에 '공개'라고 붙인 쪽지는 진열장에 걸려서 누구나 볼 수 있어요.",
    "ex": "VITE_API_URL 같은 공개 주소는 괜찮지만, 비밀 키에 NEXT_PUBLIC_·VITE_를 붙이면 개발자도구로 다 보여요.",
    "flow": [],
    "use": ".env에 변수를 추가할 때 NEXT_PUBLIC_이나 VITE_를 붙이면 브라우저에 공개돼요. 비밀 키에는 절대 붙이지 말고 서버에서만 읽게 해요.",
    "related": [
      "env",
      "api-key",
      "build"
    ]
  },
  {
    "id": "vercel",
    "term": "Vercel",
    "ko": "버셀",
    "full": "",
    "src": "02-05",
    "level": "입문",
    "def": "GitHub 저장소를 연결해 프론트와 Next.js 서버 기능까지 배포해 주는 호스팅 플랫폼.",
    "easy": "그림을 걸어 주는 전시장인데, 그림을 바꾸면 알아서 새 그림으로 바꿔 걸어 줘요.",
    "ex": "Next.js 앱을 Vercel에 연결하면 push할 때마다 자동 배포되고 내프로젝트.vercel.app 주소가 생겨요.",
    "flow": [],
    "use": "Next.js 앱을 GitHub에 올린 뒤 Vercel에 연결하면 몇 분 안에 공개 주소가 생겨요. 환경변수는 Vercel 프로젝트 설정에서 따로 등록해요.",
    "related": [
      "hosting",
      "nextjs",
      "auto-deploy"
    ]
  },
  {
    "id": "netlify",
    "term": "Netlify",
    "ko": "네트리파이",
    "full": "",
    "src": "02-05",
    "level": "입문",
    "def": "정적 사이트와 일부 프레임워크의 서버 기능을 GitHub와 연결해 배포하는 호스팅 플랫폼.",
    "easy": "Vercel과 비슷한 다른 전시장이에요. 규칙과 잘하는 것이 조금씩 달라요.",
    "ex": "화면만 있는 포트폴리오를 Netlify에 연결해 배포하고, 무료 요금제의 상업적 이용 조건을 확인해요.",
    "flow": [],
    "use": "화면 중심의 정적 사이트를 올릴 때 Vercel과 함께 후보로 만나요. GitHub을 연결하고 빌드 명령과 배포 폴더를 설정하면 배포돼요.",
    "related": [
      "static-hosting",
      "hosting",
      "vercel"
    ]
  },
  {
    "id": "railway",
    "term": "Railway",
    "ko": "레일웨이",
    "full": "",
    "src": "02-05",
    "level": "입문",
    "def": "Express·FastAPI 등으로 만든 백엔드 API 서버를 시작 명령으로 실행해 주는 클라우드 플랫폼.",
    "easy": "부엌(서버)을 통째로 빌려 주는 공유 주방이에요. 요리법(코드)만 가져가면 돼요.",
    "ex": "화면은 Vercel에, 직접 만든 API 서버는 Railway에 올리고 CORS로 두 주소를 이어요.",
    "flow": [],
    "use": "프런트는 Vercel에 두고, Express 같은 백엔드 API는 Railway에 올릴 때 써요. 시작 명령(npm start)과 환경변수를 설정해 서버를 띄워요.",
    "related": [
      "hosting",
      "deploy",
      "front-back"
    ]
  },
  {
    "id": "firebase",
    "term": "Firebase",
    "ko": "파이어베이스",
    "full": "",
    "src": "02-05",
    "level": "입문",
    "def": "구글의 BaaS. 로그인(인증)·Firestore 데이터 저장·호스팅 등을 무료 한도 안에서 쓸 수 있다.",
    "easy": "주방과 창고를 다 갖춰 둔 구글의 공유 주방이에요. 재료만 넣으면 돼요.",
    "ex": "Spark 요금제는 카드 없이 시작하지만, 서버 코드를 돌리는 Cloud Functions는 Blaze 요금제가 필요해요.",
    "flow": [],
    "use": "빠르게 로그인과 데이터 저장이 필요한 프로젝트에서 Supabase와 함께 후보로 만나요. 웹 앱에 Firebase 설정값을 붙여 연결해요.",
    "related": [
      "baas",
      "supabase",
      "free-tier"
    ]
  },
  {
    "id": "ngrok",
    "term": "ngrok",
    "ko": "엔그록",
    "full": "",
    "src": "02-05 · 03-03",
    "level": "입문",
    "def": "한 줄 명령으로 내 컴퓨터의 서버에 임시 공개 주소를 붙여 주는 터널 도구.",
    "easy": "내 방 문 앞까지 이어지는 임시 비밀 통로를 순식간에 만들어 주는 마법 지팡이예요.",
    "ex": "localhost:3000에서 도는 앱을 ngrok으로 열어 친구에게 잠깐 보여 주되, 무료 사용량 한도를 확인해요.",
    "flow": [],
    "cmd": true,
    "use": "localhost에서 개발 중인 화면을 팀원에게 보여 주거나 웹훅을 테스트할 때 써요. ngrok http 3000을 실행하면 임시 공개 주소가 나와요.",
    "related": [
      "tunnel",
      "localhost",
      "port"
    ]
  }
]);

