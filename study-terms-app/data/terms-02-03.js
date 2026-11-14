// 02-03 프레임워크와 화면 구성 — 교육자료 PDF 기반. 처음 나온 자료에만 두고, 다시 나온 자료는 src에 함께 적는다.
addSection('02-03', "프레임워크와 화면 구성", [
  {
    "id": "framework",
    "term": "Framework",
    "ko": "프레임워크",
    "full": "",
    "src": "02-03",
    "level": "입문",
    "def": "반복 작업에 필요한 기능과 프로그램 구성 규칙을 함께 제공하는 도구.",
    "easy": "조립 설명서가 들어 있는 가구 키트. 순서대로 맞추면 돼요.",
    "ex": "카드 목록을 여러 번 보여주거나 검색어에 맞춰 화면을 바꿀 때 프레임워크의 규칙을 따라요.",
    "flow": [],
    "use": "새 프로젝트를 시작할 때 Next.js나 Express 같은 프레임워크를 고르면 폴더 구조와 작성 규칙이 정해져요. AI에게 코드를 시킬 때도 어떤 프레임워크인지 알려 줘야 해요.",
    "related": [
      "library",
      "react",
      "meta-framework"
    ]
  },
  {
    "full": "",
    "flow": [],
    "use": "npm install로 설치해 import해서 쓰는 도구가 대부분 라이브러리예요. 필요한 기능만 골라 쓰기 때문에, 오류가 나면 어떤 라이브러리 버전인지부터 확인해요.",
    "related": [
      "framework",
      "react",
      "dependency"
    ],
    "ex": "React는 UI 라이브러리예요. 컴포넌트 렌더링은 React가 관리하고, 라우팅 같은 앱 구성은 다른 도구와 조합할 수 있어요.",
    "easy": "도구함 속 드라이버. 필요할 때 꺼내 쓰면 끝이에요.",
    "level": "입문",
    "id": "library",
    "term": "Library",
    "ko": "라이브러리",
    "src": "02-03",
    "def": "필요한 기능을 내 코드에서 가져다 쓰는 도구."
  },
  {
    "id": "react",
    "term": "React",
    "ko": "리액트",
    "full": "",
    "src": "02-03",
    "level": "입문",
    "def": "컴포넌트를 조합해 화면을 만드는 UI 라이브러리.",
    "easy": "레고 블록으로 화면을 조립하게 해 주는 도구예요.",
    "ex": "카드 컴포넌트와 상품 배열로 같은 모양의 상품 카드를 여러 개 보여줘요.",
    "flow": [],
    "use": "프런트엔드 프로젝트를 만들거나 AI가 만든 화면 코드를 읽을 때 가장 자주 만나요. .jsx 파일과 useState 같은 코드가 보이면 React를 쓰고 있다는 뜻이에요.",
    "related": [
      "component",
      "nextjs",
      "state"
    ]
  },
  {
    "id": "nextjs",
    "term": "Next.js",
    "ko": "넥스트제이에스",
    "full": "",
    "src": "02-03",
    "level": "실전",
    "def": "React에 라우팅, 서버 렌더링, 서버 기능을 더한 메타프레임워크.",
    "easy": "React라는 자동차에 내비게이션과 트렁크를 달아 준 모델이에요.",
    "ex": "수제 디저트 쇼핑몰 실습에서 Claude Code로 Next.js 상품 목록 화면을 만들어요.",
    "flow": [],
    "use": "npx create-next-app으로 프로젝트를 만들면 시작해요. 화면과 서버 기능을 한 프로젝트에서 만들고 Vercel에 바로 배포할 수 있어서 AI 코딩 실습에 자주 쓰여요.",
    "related": [
      "react",
      "meta-framework",
      "ssr"
    ]
  },
  {
    "id": "meta-framework",
    "term": "Meta-framework",
    "ko": "메타프레임워크",
    "full": "",
    "src": "02-03",
    "level": "실전",
    "def": "UI 도구 위에 라우팅과 서버 렌더링 등 앱 구성 기능을 묶은 도구.",
    "easy": "기본 햄버거에 세트 메뉴까지 묶어 파는 가게예요.",
    "ex": "Next.js, Nuxt, SvelteKit이 각각 React, Vue, Svelte 위에 올라가는 메타프레임워크예요.",
    "flow": [],
    "use": "React만으로는 주소 연결이나 서버 렌더링을 직접 정해야 해서, 보통 Next.js 같은 메타프레임워크를 골라요. 기술 스택을 비교하고 고를 때 이 구분이 필요해요.",
    "related": [
      "nextjs",
      "framework",
      "routing"
    ]
  },
  {
    "id": "vite",
    "term": "Vite",
    "ko": "비트",
    "full": "",
    "src": "02-03",
    "level": "실전",
    "def": "개발 서버를 제공하고 배포할 파일을 만드는 개발·빌드 도구.",
    "easy": "공사 중인 집을 바로 구경하게 해 주고 완성본도 포장해 줘요.",
    "ex": "React와 Vite를 함께 쓰면 브라우저용 목록 화면을 빠르게 띄워 볼 수 있어요.",
    "flow": [],
    "use": "npm create vite@latest로 프로젝트를 만들고 npm run dev로 개발 서버를 켤 때 만나요. 코드를 저장하면 브라우저에 바로 반영돼서 화면 작업이 빨라져요.",
    "related": [
      "dev-server",
      "build",
      "react"
    ]
  },
  {
    "id": "component",
    "term": "Component",
    "ko": "컴포넌트",
    "full": "",
    "src": "02-03",
    "level": "입문",
    "def": "카드, 검색창처럼 따로 구성하고 재사용할 수 있는 화면 단위.",
    "easy": "레고 블록 하나. 같은 블록을 여러 개 꽂아 써요.",
    "ex": "상품 카드 컴포넌트 하나로 상품 6개를 같은 모양으로 보여줘요.",
    "flow": [],
    "use": "React 코드에서 파일 하나가 화면 조각 하나인 경우가 많아요. AI에게 '카드를 컴포넌트로 분리해 줘'처럼 요청해 코드를 정리하고 재사용할 때 써요.",
    "related": [
      "react",
      "state",
      "declarative-ui"
    ]
  },
  {
    "id": "routing",
    "term": "Routing",
    "ko": "라우팅",
    "full": "",
    "src": "02-03",
    "level": "입문",
    "def": "주소(URL)에 맞는 화면을 연결하는 기능.",
    "easy": "건물 안내판. 층수를 보고 알맞은 방으로 보내 줘요.",
    "ex": "Next.js App Router는 화면 파일을 둔 위치에 따라 주소를 연결해요.",
    "flow": [],
    "use": "새 페이지를 추가하거나 '/products/1' 같은 주소가 어떤 화면을 여는지 확인할 때 만나요. 주소를 쳤는데 404가 뜨면 라우팅 설정부터 살펴봐요.",
    "related": [
      "nextjs",
      "meta-framework",
      "component"
    ]
  },
  {
    "id": "declarative-ui",
    "term": "Declarative UI",
    "ko": "선언형 UI",
    "full": "",
    "src": "02-03",
    "level": "실전",
    "def": "상태 값에 따라 무엇을 보여줄지만 적고 화면 갱신은 도구에 맡기는 방식.",
    "easy": "식당에서 메뉴만 말하면 요리는 주방이 알아서 해 줘요.",
    "ex": "검색어를 상태로 두면 카드 목록과 결과 수가 같은 값에 맞춰 함께 바뀌어요.",
    "flow": [
      "상태 변경",
      "도구가 계산",
      "화면 갱신"
    ],
    "use": "React 코드를 읽을 때 '상태가 바뀌면 화면이 알아서 바뀐다'는 흐름을 이해하는 바탕이에요. 화면을 직접 고치는 코드를 AI가 쓰면 이 방식에 맞게 고치게 해요.",
    "related": [
      "state",
      "react",
      "component"
    ]
  },
  {
    "id": "ssr",
    "term": "SSR",
    "ko": "서버 렌더링",
    "full": "Server-Side Rendering",
    "src": "02-03",
    "level": "실전",
    "def": "서버에서 화면에 보여 줄 HTML을 만들어 보내는 방식.",
    "easy": "주방에서 음식을 접시에 다 담아서 내오는 방식이에요.",
    "ex": "공개 상품 페이지의 검색 노출을 고려해 Next.js로 서버에서 HTML을 만들어요.",
    "flow": [
      "서버가 HTML 생성",
      "브라우저로 전송",
      "화면 표시"
    ],
    "use": "Next.js에서 페이지가 서버에서 만들어지는지 브라우저에서 만들어지는지 정할 때 만나요. 검색 노출이나 첫 화면 속도가 중요한 공개 페이지에서 따져 봐요.",
    "related": [
      "nextjs",
      "meta-framework",
      "http"
    ]
  },
  {
    "id": "build",
    "term": "Build",
    "ko": "빌드",
    "full": "",
    "src": "02-03 · 02-05 · 03-07",
    "level": "실전",
    "def": "코드 변환을 포함해 배포할 파일을 만드는 과정.",
    "easy": "반죽을 구워 팔 수 있는 빵으로 완성하는 단계예요.",
    "ex": "AI가 만든 코드가 컴파일을 포함한 빌드에 성공해 배포 파일이 생기는지 확인해요.",
    "flow": [
      "코드 변환",
      "파일 묶기",
      "배포 파일"
    ],
    "use": "배포 전에 npm run build를 실행해 오류가 없는지 확인해요. Vercel 같은 플랫폼도 배포할 때 빌드를 먼저 돌려서, 여기서 실패하면 배포가 멈춰요.",
    "related": [
      "vite",
      "deploy",
      "dev-server"
    ]
  },
  {
    "id": "dev-server",
    "term": "Dev server",
    "ko": "개발 서버",
    "full": "",
    "src": "02-03",
    "level": "입문",
    "def": "개발 중 화면을 주소로 접속해 브라우저에서 확인하게 해 주는 서버.",
    "easy": "공사 중인 집의 모델하우스. 주소로 찾아가 구경해요.",
    "ex": "파일을 직접 열지 않고 안내받은 개발 서버 주소를 브라우저로 열어요.",
    "flow": [
      "서버 실행",
      "주소 접속",
      "화면 확인"
    ],
    "use": "npm run dev나 npm start를 실행하면 터미널에 localhost:3000 같은 주소가 나와요. 코드를 고친 뒤 이 주소로 결과를 바로 확인하며 개발해요.",
    "related": [
      "vite",
      "build",
      "nextjs"
    ]
  },
  {
    "id": "package-json",
    "term": "package.json",
    "ko": "패키지 제이슨",
    "full": "",
    "src": "02-03",
    "level": "입문",
    "def": "프로젝트의 의존성과 실행 명령이 적힌 파일.",
    "easy": "요리책 맨 앞의 재료 목록과 조리 순서표예요.",
    "ex": "package.json의 의존성과 실행 명령에서 Next.js를 쓰는지 확인해요.",
    "flow": [],
    "use": "프로젝트 폴더를 열면 가장 먼저 보는 파일이에요. npm install로 설치할 목록과 npm run dev, build 같은 실행 명령이 여기에 적혀 있어요.",
    "related": [
      "dependency",
      "json",
      "dev-server"
    ]
  },
  {
    "id": "dependency",
    "term": "Dependency",
    "ko": "의존성",
    "full": "",
    "src": "02-03",
    "level": "입문",
    "def": "프로젝트가 쓰는 외부 패키지.",
    "easy": "케이크를 만들 때 사 와야 하는 밀가루와 계란이에요.",
    "ex": "package.json의 의존성 목록에서 Next.js 같은 설치된 도구를 확인해요.",
    "flow": [],
    "use": "npm install을 하면 package.json의 dependencies에 기록돼요. 다른 컴퓨터나 배포 서버에서 같은 코드를 돌리려면 이 목록이 맞아야 해요.",
    "related": [
      "package-json",
      "library",
      "framework"
    ]
  },
  {
    "id": "http",
    "term": "HTTP",
    "ko": "에이치티티피",
    "full": "HyperText Transfer Protocol",
    "src": "02-03 · 02-05",
    "level": "입문",
    "def": "웹에서 요청과 응답을 주고받을 때 쓰는 통신 규칙.",
    "easy": "편지 쓰는 법. 보내는 형식이 같아야 서로 읽어요.",
    "ex": "프런트엔드가 HTTP 규칙에 따라 백엔드에 상품 목록을 요청하고 응답을 받아요.",
    "flow": [
      "요청 보냄",
      "서버 처리",
      "응답 받음"
    ],
    "use": "브라우저와 서버가 통신하는 모든 장면에 나와요. API를 만들거나 호출할 때 GET, POST 같은 방식과 주소를 정하며 HTTP 규칙을 따라요.",
    "related": [
      "api",
      "status-code",
      "json"
    ]
  },
  {
    "full": "JavaScript Object Notation",
    "flow": [],
    "use": "API 응답을 확인하거나 package.json 같은 설정 파일을 읽고 쓸 때 늘 만나요. 쉼표나 따옴표가 하나만 틀려도 JSON 오류가 나서 파일이 안 읽혀요.",
    "related": [
      "api",
      "mock-data",
      "boolean"
    ],
    "ex": "상품 하나를 {}로 묶고 여러 상품을 []에 나열한 JSON 배열을 data/products.json에 저장해요.",
    "easy": "이름표가 붙은 물건 목록. 이름표만 보면 뭔지 알아요.",
    "level": "입문",
    "id": "json",
    "term": "JSON",
    "ko": "제이슨",
    "src": "02-03 · 02-04 · 02-05 · 03-03 · 03-04 · 03-05 · 03-07",
    "def": "객체·배열·문자열·숫자·불리언·null을 정해진 문법으로 적는 데이터 교환 형식이에요. 객체는 이름과 값의 쌍으로 구성해요."
  },
  {
    "id": "status-code",
    "term": "Status code",
    "ko": "상태 코드",
    "full": "",
    "src": "02-03 · 02-05",
    "level": "실전",
    "def": "서버가 처리 결과를 알리려고 응답에 담아 보내는 코드.",
    "easy": "택배 배송 상태 알림. 성공인지 실패인지 숫자로 알려줘요.",
    "ex": "GET /api/products 요청에 서버가 상태 코드와 상품 데이터를 함께 응답해요.",
    "flow": [
      "요청",
      "처리 결과",
      "코드 응답"
    ],
    "use": "API가 안 될 때 가장 먼저 보는 단서예요. 200은 성공, 404는 주소 없음, 500은 서버 오류처럼 번호만 봐도 어디가 문제인지 짐작할 수 있어요.",
    "related": [
      "http",
      "api",
      "json"
    ]
  },
  {
    "id": "mock-data",
    "term": "Mock data",
    "ko": "목업 데이터",
    "full": "",
    "src": "02-03 · 02-07",
    "level": "입문",
    "def": "실제 데이터 연결 전에 화면을 확인하려고 쓰는 예시 데이터.",
    "easy": "진열대에 먼저 놓아 보는 모형 과자예요.",
    "ex": "긴 상품명, 품절 상품, 빈 배열을 담은 목업 데이터로 화면을 먼저 확인해요.",
    "flow": [
      "목업 준비",
      "화면 확인",
      "API로 교체"
    ],
    "use": "백엔드가 아직 없을 때 data/products.json 같은 가짜 데이터로 화면부터 만들어요. 실제 API로 바꾸기 전에 화면이 잘 보이는지 확인하는 데 써요.",
    "related": [
      "json",
      "api",
      "front-back"
    ]
  },
  {
    "id": "boolean",
    "term": "Boolean",
    "ko": "불리언",
    "full": "",
    "src": "02-03",
    "level": "입문",
    "def": "true와 false 두 값으로 나타내는 데이터.",
    "easy": "전등 스위치. 켜짐 아니면 꺼짐, 둘 중 하나예요.",
    "ex": "soldOut이 true이면 품절 표시를 하고 false이면 판매 중으로 보여줘요.",
    "flow": [],
    "use": "isLoggedIn, soldOut처럼 켜짐·꺼짐을 나타내는 변수에 써요. if 조건문이나 화면 표시 여부를 정할 때 거의 모든 코드에서 만나요.",
    "related": [
      "json",
      "mock-data",
      "state"
    ]
  },
  {
    "id": "graphql",
    "term": "GraphQL",
    "ko": "그래프큐엘",
    "full": "",
    "src": "02-03",
    "level": "심화",
    "def": "클라이언트가 필요한 데이터의 모양을 질의(query)로 적어 보내면 서버가 딱 그만큼만 돌려주는 API 방식. 보통 주소 하나로 여러 데이터를 요청한다.",
    "easy": "뷔페에서 담을 음식을 쪽지에 적어 내면, 그대로만 담아 주는 거예요.",
    "ex": "{ products { name price } }처럼 이름과 가격만 요청하면 다른 필드는 오지 않아요.",
    "flow": [],
    "use": "API 방식을 고르거나 문서에 /graphql 주소와 query가 나올 때 만나요. REST와 달리 필요한 필드만 골라 요청해서 데이터 낭비를 줄여요.",
    "related": [
      "api",
      "rest",
      "rpc",
      "soap"
    ]
  },
  {
    "id": "rpc",
    "term": "RPC",
    "ko": "원격 프로시저 호출",
    "full": "Remote Procedure Call",
    "src": "02-03",
    "level": "심화",
    "def": "다른 컴퓨터(서버)에 있는 함수를 같은 프로그램 안의 함수처럼 이름으로 불러 실행하는 API 방식.",
    "easy": "멀리 사는 친구에게 전화로 \"이거 계산 좀 해 줘\"라고 부탁하고 답만 받는 거예요.",
    "ex": "REST가 \"/api/products 주소에 GET\"처럼 자원을 다룬다면, RPC는 getProducts()처럼 할 일의 이름을 불러요.",
    "flow": [],
    "use": "API 설계 방식을 비교할 때 REST, GraphQL과 함께 나와요. 함수 이름으로 서버 기능을 부르는 방식이라 내부 서비스끼리 통신하는 곳에서 주로 쓰여요.",
    "related": [
      "api",
      "rest",
      "graphql",
      "db-function"
    ]
  },
  {
    "id": "soap",
    "term": "SOAP",
    "ko": "솝",
    "full": "Simple Object Access Protocol",
    "src": "02-03",
    "level": "심화",
    "def": "XML 형식의 정해진 봉투에 요청과 응답을 담아 주고받는 API 규약. 규칙이 엄격하다.",
    "easy": "칸이 다 정해진 공문서 양식이에요. 형식을 꼭 지켜야 접수돼요.",
    "ex": "API 방식 비교에서 REST·GraphQL·RPC와 함께 나오는 오래된 방식이에요. 새 웹 API는 JSON을 쓰는 REST가 더 흔해요.",
    "flow": [],
    "use": "오래된 기업 시스템이나 공공 API 문서에서 XML과 함께 만날 수 있어요. 새로 만들 때는 거의 쓰지 않지만 연동 문서를 읽을 때 알아 두면 좋아요.",
    "related": [
      "api",
      "rest",
      "json"
    ]
  },
  {
    "id": "modularization",
    "term": "Modularization",
    "ko": "모듈화",
    "full": "",
    "src": "02-03",
    "level": "실전",
    "def": "프로그램을 역할과 경계가 있는 단위로 나누는 것. 경계를 잘 정하면 한 부분을 고칠 때 다른 부분에 미치는 영향이 줄어든다. 내부 세부를 감추는 정보 은닉과 짝을 이룬다.",
    "easy": "레고 블록이에요. 블록 하나를 바꿔 끼워도 나머지 성은 그대로예요.",
    "ex": "일정 화면을 검색창과 일정 카드로 나누고, 각각 어떤 데이터를 받아 무엇을 보여줄지 정해요.",
    "flow": [],
    "use": "코드가 한 파일에 길게 쌓였을 때 AI에게 '역할별로 나눠 줘'라고 요청하며 써요. 나눠 두면 한 부분을 고쳐도 다른 곳이 덜 망가져요.",
    "related": [
      "component",
      "abstraction",
      "separation-of-concerns"
    ]
  },
  {
    "id": "virtual-dom",
    "term": "Virtual DOM",
    "ko": "가상 DOM",
    "full": "",
    "src": "02-03",
    "level": "심화",
    "def": "실제 화면(DOM)을 바로 고치지 않고, 메모리에 화면의 사본을 만들어 바뀐 부분을 비교한 뒤 필요한 곳만 실제 화면에 반영하는 방식.",
    "easy": "그림을 바로 고치지 않고 투명 종이에 먼저 그려 본 뒤, 달라진 곳만 덧칠하는 거예요.",
    "ex": "React는 상태가 바뀌면 이전 화면과 차이를 계산해 바뀐 카드만 다시 그려요.",
    "flow": [],
    "use": "React가 왜 빠르게 화면을 바꾸는지 설명할 때 나와요. 직접 다룰 일은 적지만, 상태를 바꿨는데 화면이 다시 그려지는 원리를 이해하는 데 도움이 돼요.",
    "related": [
      "dom",
      "react",
      "declarative-ui"
    ]
  },
  {
    "id": "compile",
    "term": "Compile",
    "ko": "컴파일",
    "full": "",
    "src": "02-03",
    "level": "실전",
    "def": "사람이 쓴 코드를 실행 가능한 형태로 변환하는 작업. 컴파일에 성공해도 원하는 화면과 기능이 완성됐다는 뜻은 아니다.",
    "easy": "편지를 외국 친구가 읽을 수 있게 번역하는 거예요. 번역이 됐다고 내용까지 맞는 건 아니에요.",
    "ex": "AI가 만든 React 코드가 컴파일에 성공해도, 요청한 상품 정보가 화면에 제대로 뜨는지는 따로 확인해요.",
    "flow": [],
    "use": "npm run build나 TypeScript 검사에서 오류가 나면 컴파일 단계에서 막힌 거예요. 컴파일 성공은 시작일 뿐이라 브라우저에서 직접 눌러 보고 확인해야 해요.",
    "related": [
      "build",
      "framework"
    ]
  },
  {
    "id": "server-client-component",
    "term": "Server / Client Component",
    "ko": "서버·클라이언트 컴포넌트",
    "full": "",
    "src": "02-03",
    "level": "심화",
    "def": "서버에서 실행해 화면 HTML을 만들어 보내는 화면 단위(서버 컴포넌트)와, 브라우저에서 실행돼 클릭 같은 상호작용을 처리하는 화면 단위(클라이언트 컴포넌트).",
    "easy": "주방에서 다 만들어 내오는 요리와, 식탁에서 손님이 직접 굽는 고기의 차이예요.",
    "ex": "Next.js 문서는 화면 파일의 위치로 주소를 연결하는 라우팅과 함께 서버·클라이언트 컴포넌트를 설명해요.",
    "flow": [],
    "use": "Next.js App Router에서 파일 맨 위에 'use client'를 쓸지 고민할 때 만나요. 클릭이나 입력 처리가 필요한 화면만 클라이언트로 두면 돼요.",
    "related": [
      "component",
      "ssr",
      "nextjs"
    ]
  },
  {
    "id": "seo",
    "term": "SEO",
    "ko": "검색 노출",
    "full": "Search Engine Optimization",
    "src": "02-03",
    "level": "실전",
    "def": "검색 서비스가 페이지 내용을 잘 읽고 검색 결과에 보여 주도록 만드는 일.",
    "easy": "도서관 책등에 제목을 크게 써 붙여서 찾는 사람이 쉽게 고르게 하는 거예요.",
    "ex": "공개 상품 페이지의 검색 노출을 고려해, 서버에서 상품 내용이 담긴 HTML을 만들 수 있는 Next.js를 골라요.",
    "flow": [],
    "use": "블로그나 쇼핑몰처럼 검색으로 사람들이 들어와야 하는 공개 페이지를 만들 때 따져요. 제목·설명 태그와 서버 렌더링 여부가 검색 노출에 영향을 줘요.",
    "related": [
      "ssr",
      "nextjs"
    ]
  },
  {
    "id": "vue-svelte-angular",
    "term": "Vue / Svelte / Angular",
    "ko": "다른 UI 프레임워크",
    "full": "",
    "src": "02-03",
    "level": "실전",
    "def": "React처럼 화면을 컴포넌트로 만들고 데이터 변화에 맞춰 갱신하는 UI 프레임워크들. Vue는 점진적으로 도입하기 쉽고, Svelte는 컴파일러로 코드를 변환하며, Angular는 장기 유지보수 도구를 함께 갖췄다.",
    "easy": "같은 자전거라도 브랜드마다 타는 느낌과 부품이 다른 것과 같아요.",
    "ex": "프레임워크를 고를 때 React·Vue·Svelte·Angular 중 후보 2~3개를 같은 요구사항으로 비교하고 채택·기각 이유를 적어요.",
    "flow": [],
    "use": "프로젝트 기술을 고르거나 다른 사람의 코드를 받았을 때 만나요. 문법은 달라도 컴포넌트로 화면을 만든다는 큰 틀은 React와 같아요.",
    "related": [
      "react",
      "framework",
      "meta-framework"
    ]
  }
]);

