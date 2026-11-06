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
    "related": [
      "library",
      "react",
      "meta-framework"
    ]
  },
  {
    "full": "",
    "flow": [],
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
    "src": "02-03 · 02-05",
    "level": "실전",
    "def": "코드 변환을 포함해 배포할 파일을 만드는 과정.",
    "easy": "반죽을 구워 팔 수 있는 빵으로 완성하는 단계예요.",
    "ex": "AI가 만든 코드가 컴파일을 포함한 빌드에 성공해 배포 파일이 생기는지 확인해요.",
    "flow": [
      "코드 변환",
      "파일 묶기",
      "배포 파일"
    ],
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
    "related": [
      "api",
      "status-code",
      "json"
    ]
  },
  {
    "full": "JavaScript Object Notation",
    "flow": [],
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
    "src": "02-03 · 02-04 · 02-05",
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
    "related": [
      "json",
      "mock-data",
      "state"
    ]
  }
]);

