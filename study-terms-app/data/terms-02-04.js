// 02-04 백엔드와 데이터베이스 — 교육자료 PDF 기반. 처음 나온 자료에만 두고, 다시 나온 자료는 src에 함께 적는다.
addSection('02-04', "백엔드와 데이터베이스", [
  {
    "id": "endpoint",
    "term": "Endpoint",
    "ko": "엔드포인트",
    "full": "",
    "src": "02-04 · 02-05",
    "level": "입문",
    "def": "백엔드가 프론트에 열어 주는 창구로, 주소(URL)와 동작의 조합인 것.",
    "easy": "식당 주문 창구. 창구마다 받아 주는 주문이 정해져 있어요.",
    "ex": "GET /products는 상품 목록을, POST /login은 로그인 처리를 맡는 창구예요.",
    "flow": [],
    "related": [
      "api",
      "http-method",
      "rest"
    ]
  },
  {
    "id": "rest",
    "term": "REST",
    "ko": "REST",
    "full": "Representational State Transfer",
    "src": "02-04",
    "level": "실전",
    "def": "자원을 주소(명사)로 구분하고 정해진 동작으로 다루는 API 설계 방식.",
    "easy": "물건마다 사물함 번호가 있고, 꺼내기·넣기 같은 동작은 정해져 있어요.",
    "ex": "/getProducts 대신 /products 같은 명사 주소를 쓰고 동작은 메서드로 나눠요.",
    "flow": [],
    "related": [
      "endpoint",
      "http-method",
      "api"
    ]
  },
  {
    "id": "http-method",
    "term": "HTTP Method",
    "ko": "HTTP 메서드",
    "full": "",
    "src": "02-04",
    "level": "입문",
    "def": "요청이 서버에 무엇을 하려는지 나타내는 동작 이름.",
    "easy": "편지 겉봉에 적는 '가져다줘', '새로 접수해줘' 같은 용건이에요.",
    "ex": "GET은 상품 목록을 읽고, POST는 새 주문을 만들 때 써요.",
    "flow": [],
    "related": [
      "endpoint",
      "crud",
      "rest"
    ]
  },
  {
    "id": "crud",
    "term": "CRUD",
    "ko": "CRUD",
    "full": "Create Read Update Delete",
    "src": "02-04",
    "level": "입문",
    "def": "데이터에 하는 만들기·읽기·고치기·지우기 네 가지 기본 동작.",
    "easy": "일기장에 쓰고, 읽고, 고치고, 지우는 네 가지 일이에요.",
    "ex": "Todo 앱은 할 일 추가·목록 보기·완료 표시·삭제로 CRUD를 연습해요.",
    "flow": [
      "만들기",
      "읽기",
      "고치기",
      "지우기"
    ],
    "related": [
      "http-method",
      "sql",
      "endpoint"
    ]
  },
  {
    "id": "server-side-validation",
    "term": "Server-side Validation",
    "ko": "서버 측 검증",
    "full": "",
    "src": "02-04 · 02-05",
    "level": "실전",
    "def": "가격·수량·권한 같은 검증을 조작 가능한 프론트가 아닌 백엔드에서 다시 하는 것.",
    "easy": "시험 답안은 학생이 아니라 선생님이 채점해야 믿을 수 있어요.",
    "ex": "화면에 10,000원이 떠 있어도 서버가 최종 가격을 자기 데이터로 다시 계산해요.",
    "flow": [],
    "related": [
      "front-back",
      "sql-injection",
      "auth"
    ]
  },
  {
    "id": "schema",
    "term": "Schema",
    "ko": "스키마",
    "full": "",
    "src": "02-04",
    "level": "입문",
    "def": "표에 어떤 항목이 들어가는지 정해 둔 데이터의 모양 규칙.",
    "easy": "교실 출석부 양식. 칸이 정해져 있어서 마음대로 적을 수 없어요.",
    "ex": "AI에게 상품과 주문에 필요한 표와 열을 스키마로 제안해 달라고 해요.",
    "flow": [],
    "related": [
      "table-row-column",
      "database",
      "migration"
    ]
  },
  {
    "id": "sql",
    "term": "SQL",
    "ko": "SQL",
    "full": "Structured Query Language",
    "src": "02-04",
    "level": "입문",
    "def": "데이터베이스에 조회·추가·수정·삭제를 요청하는 질의 언어.",
    "easy": "도서관 사서에게 '파란 표지 책만 가져다주세요' 하고 말하는 언어예요.",
    "ex": "SELECT 이름, 가격 FROM 상품 WHERE 분류 = '케이크'로 조건에 맞는 것만 꺼내요.",
    "flow": [],
    "related": [
      "crud",
      "schema",
      "parameterized-query"
    ]
  },
  {
    "id": "nosql",
    "term": "NoSQL",
    "ko": "NoSQL",
    "full": "Not Only SQL",
    "src": "02-04",
    "level": "실전",
    "def": "엄격한 표 대신 유연한 모양으로 대규모·빠르게 변하는 데이터를 다루는 DB 계열.",
    "easy": "정리 칸이 없는 큰 장난감 상자. 모양이 달라도 막 넣을 수 있어요.",
    "ex": "친구의 친구를 따라가는 소셜 관계나 장바구니 같은 데이터에 어울려요.",
    "flow": [],
    "related": [
      "sql",
      "database",
      "schema"
    ]
  },
  {
    "id": "table-row-column",
    "term": "Table / Row / Column",
    "ko": "테이블·행·열",
    "full": "",
    "src": "02-04",
    "level": "입문",
    "def": "표 하나는 한 종류의 데이터, 행은 한 건, 열은 항목을 뜻하는 것.",
    "easy": "엑셀 시트 하나가 표, 가로줄이 행, 세로줄이 열이에요.",
    "ex": "상품 표에서 딸기 케이크 한 줄이 행이고, 이름·가격·분류가 열이에요.",
    "flow": [],
    "related": [
      "schema",
      "primary-key",
      "sql"
    ]
  },
  {
    "full": "",
    "flow": [],
    "related": [
      "table-row-column",
      "db-relation",
      "normalization"
    ],
    "ex": "회원 표의 id는 기본키, 주문 표의 member_id는 회원을 참조하는 외래키예요. 키는 숫자뿐 아니라 문자열이나 여러 열의 조합일 수도 있어요.",
    "easy": "학생 명부의 고유한 학생 번호로 학생을 구분하고, 수강 신청서에는 그 번호를 적어 누구의 신청인지 연결해요.",
    "level": "입문",
    "id": "primary-key",
    "term": "Key (ID)",
    "ko": "키(고유 번호)",
    "src": "02-04",
    "def": "행을 식별하거나 표 사이의 관계를 나타낼 때 쓰는 값이에요. 기본키는 행을 고유하게 식별하고, 외래키는 다른 키를 참조해 관계를 나타내요."
  },
  {
    "id": "db-relation",
    "term": "Relationship (1:N, N:M)",
    "ko": "표 관계(1:N, N:M)",
    "full": "",
    "src": "02-04",
    "level": "실전",
    "def": "표끼리 잇는 모양으로, 한쪽이 여러 개를 갖는 1:N과 양쪽이 여러 개를 갖는 N:M이 있는 것.",
    "easy": "엄마 한 명에 아이 여럿이 1:N, 학생과 수업은 서로 여럿이라 N:M이에요.",
    "ex": "회원 1명은 주문 여러 건을 갖고, 학생과 수업은 연결 표로 이어요.",
    "flow": [],
    "related": [
      "primary-key",
      "normalization",
      "table-row-column"
    ]
  },
  {
    "id": "index",
    "term": "Index",
    "ko": "색인(인덱스)",
    "full": "",
    "src": "02-04",
    "level": "실전",
    "def": "값에서 행 위치를 미리 정리해 두어 검색을 빠르게 하는 구조.",
    "easy": "두꺼운 책 맨 뒤의 찾아보기. 바로 그 쪽으로 가요.",
    "ex": "검색이 느릴 때 자주 찾는 이메일 칸에 색인을 넣어 달라고 AI에게 말해요.",
    "flow": [],
    "related": [
      "table-row-column",
      "database",
      "migration"
    ]
  },
  {
    "full": "",
    "flow": [
      "빼기",
      "넣기",
      "함께 확정"
    ],
    "related": [
      "database",
      "backup",
      "sql"
    ],
    "ex": "계좌 이체의 출금과 입금을 한 묶음으로 처리해요. 동시 신청의 정원 초과를 막으려면 트랜잭션과 함께 적절한 잠금·격리 수준·원자적 조건부 갱신 등을 설계해야 해요.",
    "easy": "송금할 때 빼기와 넣기를 한 세트로 묶어요. 반쪽만 되면 안 되니까요.",
    "level": "심화",
    "id": "transaction",
    "term": "Transaction",
    "ko": "트랜잭션",
    "src": "02-04 · 02-07",
    "def": "여러 작업을 전부 되거나 전부 안 되게 하나로 묶는 단위."
  },
  {
    "full": "",
    "flow": [],
    "related": [
      "primary-key",
      "db-relation",
      "schema"
    ],
    "ex": "회원의 현재 연락처는 회원 표 한 곳에서 관리해요. 주문 당시의 배송 주소처럼 과거 사실을 보존해야 하는 정보는 주문에 별도로 남길 수 있어요.",
    "easy": "같은 연락처를 열 군데 적지 않고 주소록 한 곳에만 적어 두는 거예요.",
    "level": "심화",
    "id": "normalization",
    "term": "Normalization",
    "ko": "정규화",
    "src": "02-04",
    "def": "같은 정보를 한 곳에만 적고 나머지는 가리키게 해 중복을 없애는 정리."
  },
  {
    "id": "migration",
    "term": "Migration",
    "ko": "마이그레이션",
    "full": "",
    "src": "02-04",
    "level": "심화",
    "def": "데이터가 든 DB의 구조를 안전하게 바꾸는 작업.",
    "easy": "이사할 때 짐을 잃어버리지 않게 순서대로 옮기는 일이에요.",
    "ex": "표에 칸을 추가할 때 이력으로 관리하고, 칸 삭제 전엔 백업부터 해요.",
    "flow": [],
    "related": [
      "schema",
      "backup",
      "commit"
    ]
  },
  {
    "id": "password-hash",
    "term": "Password Hash",
    "ko": "비밀번호 해시",
    "full": "",
    "src": "02-04 · 02-05",
    "level": "실전",
    "def": "비밀번호를 단방향으로 변환해 저장하는 값.",
    "easy": "비밀번호를 믹서로 갈아 둔 것. 원래 모양으로는 못 되돌려요.",
    "ex": "칸 이름을 password_hash로 두고 bcrypt나 Argon2로 해시해 저장해요.",
    "flow": [],
    "related": [
      "auth",
      "sql-injection",
      "env"
    ]
  },
  {
    "id": "sql-injection",
    "term": "SQL Injection",
    "ko": "SQL 주입",
    "full": "",
    "src": "02-04 · 02-05",
    "level": "실전",
    "def": "입력값이 DB 명령으로 실행되도록 끼워 넣어 DB를 조작하는 공격.",
    "easy": "이름 칸에 '이 서류를 모두 파쇄해'라고 써서 직원이 따라 하게 만드는 일이에요.",
    "ex": "로그인 창에 특정 문자를 넣어 비밀번호 없이 들어가는 공격이 이 원리예요.",
    "flow": [],
    "related": [
      "parameterized-query",
      "server-side-validation",
      "sql"
    ]
  },
  {
    "id": "parameterized-query",
    "term": "Parameterized Query",
    "ko": "파라미터화 쿼리",
    "full": "",
    "src": "02-04",
    "level": "실전",
    "def": "명령과 사용자 입력을 따로 전달해 입력을 데이터로만 취급하는 방어법.",
    "easy": "레시피와 재료를 따로 건네요. 재료가 레시피를 바꿀 수 없어요.",
    "ex": "DB에 넣는 값을 문자열로 이어 붙이지 말고 파라미터화 쿼리로 처리해 달라고 요청해요.",
    "flow": [],
    "related": [
      "sql-injection",
      "sql",
      "server-side-validation"
    ]
  },
  {
    "id": "backup",
    "term": "Backup",
    "ko": "백업",
    "full": "",
    "src": "02-04 · 03-03",
    "level": "입문",
    "def": "데이터가 사라질 때를 대비해 사본을 따로 보관하는 것.",
    "easy": "소중한 그림을 복사해서 다른 서랍에 넣어 두는 거예요.",
    "ex": "원본과 다른 곳에 여러 벌 두고, 복구가 실제로 되는지 가끔 열어 봐요.",
    "flow": [],
    "related": [
      "migration",
      "transaction",
      "database"
    ]
  },
  {
    "id": "sqlite",
    "term": "SQLite",
    "ko": "SQLite",
    "full": "",
    "src": "02-04",
    "level": "입문",
    "def": "서버 없이 DB 전체가 파일 하나인 가벼운 데이터베이스.",
    "easy": "서랍장 대신 공책 한 권. 들고 다니며 바로 써요.",
    "ex": "Todo 앱 연습에서 todo.db 파일 하나에 할 일을 저장해요.",
    "flow": [],
    "related": [
      "postgresql",
      "database",
      "gitignore"
    ]
  },
  {
    "id": "postgresql",
    "term": "PostgreSQL",
    "ko": "PostgreSQL",
    "full": "",
    "src": "02-04",
    "level": "실전",
    "def": "첫 서비스의 기본값으로 권장되는 오픈소스 관계형 DB.",
    "easy": "시장에서 가장 많이 쓰는 튼튼한 표준 창고예요.",
    "ex": "Supabase가 무료 클라우드 PostgreSQL을 제공해서 실습에 써요.",
    "flow": [],
    "related": [
      "sql",
      "sqlite",
      "database"
    ]
  },
  {
    "id": "rls",
    "term": "RLS",
    "ko": "행 수준 보안",
    "full": "Row Level Security",
    "src": "02-04 · 02-07",
    "level": "실전",
    "def": "누가 어떤 행을 읽고 바꿀 수 있는지 제한하는 DB 규칙.",
    "easy": "사물함마다 자물쇠가 있어서 내 열쇠로는 내 칸만 열려요.",
    "ex": "RLS 정책으로 로그인한 사용자가 자기 할 일만 조회하고 수정하게 해요.",
    "flow": [],
    "related": [
      "auth",
      "database",
      "server-side-validation"
    ]
  },
  {
    "full": "",
    "flow": [],
    "related": [
      "env",
      "commit",
      "sqlite"
    ],
    "ex": ".env와 로컬 DB를 .gitignore에 적어요. 이미 Git이 추적하는 파일은 따로 추적을 해제해야 하고, 과거에 노출된 비밀 키는 교체해야 해요.",
    "easy": "가방에 넣지 않을 물건 목록. 목록에 적힌 건 안 가져가요.",
    "level": "입문",
    "id": "gitignore",
    "term": "gitignore",
    "ko": ".gitignore 파일",
    "src": "02-04 · 02-05 · 02-07",
    "def": "Git이 아직 추적하지 않는 파일 중 기본적으로 추가하지 않을 파일 패턴을 지정하는 파일이에요."
  },
  {
    "id": "localhost",
    "term": "localhost",
    "ko": "로컬호스트",
    "full": "",
    "src": "02-04 · 02-05 · 03-03",
    "level": "입문",
    "def": "내 컴퓨터에서 돌아가는 앱을 브라우저로 여는 주소.",
    "easy": "내 방 안에서만 열리는 우리 집 문패예요.",
    "ex": "개발 중인 Todo 앱을 브라우저에서 localhost 주소로 열어 확인해요.",
    "flow": [],
    "related": [
      "deploy",
      "front-back",
      "sqlite"
    ]
  },
  {
    "id": "business-logic",
    "term": "Business Logic",
    "ko": "비즈니스 로직",
    "full": "",
    "level": "입문",
    "def": "재고·최종 가격·권한처럼 서비스가 지켜야 할 규칙을 판단하는 처리.",
    "easy": "식당 주방의 레시피예요. 손님이 아니라 주방이 정해진 대로 만들어요.",
    "ex": "할인을 적용한 최종 가격이 얼마인지, 이 사용자가 글을 지울 권한이 있는지 백엔드가 판단해요.",
    "flow": [],
    "related": [
      "server-side-validation",
      "front-back",
      "endpoint"
    ]
  },
  {
    "id": "full-stack",
    "term": "Full Stack",
    "ko": "풀스택",
    "full": "",
    "src": "02-04 · 02-05",
    "level": "입문",
    "def": "화면(프론트)과 서버 쪽 처리(백엔드)를 함께 다루는 것.",
    "easy": "가게에서 홀 서빙도 하고 주방 요리도 하는 사람이에요.",
    "ex": "프론트와 백엔드를 JavaScript로 통일한 풀스택이면 언어 하나만 익혀도 돼요.",
    "flow": [],
    "related": [
      "front-back",
      "nodejs",
      "deploy"
    ]
  },
  {
    "id": "typescript",
    "term": "TypeScript",
    "ko": "타입스크립트",
    "full": "",
    "level": "실전",
    "def": "JavaScript에 값의 종류(타입)를 적는 기능을 더한 언어.",
    "easy": "상자마다 '숫자만', '글자만' 이름표를 붙여 두면 잘못 넣을 때 미리 알려 줘요.",
    "ex": "Express나 NestJS로 백엔드를 짤 때 JavaScript 대신 TypeScript를 써서 실수를 먼저 잡아요.",
    "flow": [],
    "related": [
      "nodejs",
      "nestjs",
      "web-layers"
    ]
  },
  {
    "id": "express",
    "term": "Express",
    "ko": "익스프레스",
    "full": "",
    "src": "02-04 · 02-05",
    "level": "실전",
    "def": "Node.js 위에서 쓰는 가볍고 기본적인 백엔드 웹 프레임워크.",
    "easy": "작은 주방의 기본 도구 세트예요. 필요한 도구만 하나씩 더해요.",
    "ex": "프론트와 백엔드를 JavaScript로 통일할 때 Express로 /todos 같은 API 창구를 만들어요.",
    "flow": [],
    "related": [
      "nodejs",
      "framework",
      "endpoint"
    ]
  },
  {
    "id": "nestjs",
    "term": "NestJS",
    "ko": "네스트제이에스",
    "full": "",
    "level": "실전",
    "def": "TypeScript 기반으로 폴더와 역할 구조가 미리 잡혀 있는 Node.js 백엔드 프레임워크.",
    "easy": "칸막이와 이름표가 미리 붙은 정리함이에요. 어디에 뭘 둘지 정해져 있어요.",
    "ex": "백엔드가 커져 여러 사람이 함께 고칠 때 정해진 구조를 따르려고 NestJS를 골라요.",
    "flow": [],
    "related": [
      "typescript",
      "express",
      "framework"
    ]
  },
  {
    "id": "django",
    "term": "Django",
    "ko": "장고",
    "full": "",
    "level": "실전",
    "def": "로그인·관리자 화면 등 필요한 기능이 대부분 들어 있는 Python 종합형 웹 프레임워크.",
    "easy": "재료와 도구가 다 들어 있는 밀키트예요. 꺼내서 바로 요리를 시작해요.",
    "ex": "Python으로 회원·관리자 기능까지 갖춘 서비스를 빠르게 만들 때 Django를 골라요.",
    "flow": [],
    "related": [
      "flask",
      "fastapi",
      "framework"
    ]
  },
  {
    "id": "flask",
    "term": "Flask",
    "ko": "플라스크",
    "full": "",
    "level": "입문",
    "def": "꼭 필요한 기능만 담은 가벼운 Python 웹 프레임워크.",
    "easy": "냄비 하나로 시작하는 캠핑 요리예요. 필요하면 도구를 하나씩 더해요.",
    "ex": "@app.route(\"/todos\")로 주소를 정해 두면, 그 주소로 요청이 올 때 아래 함수가 실행돼 결과를 돌려줘요.",
    "flow": [],
    "related": [
      "django",
      "fastapi",
      "endpoint"
    ]
  },
  {
    "id": "fastapi",
    "term": "FastAPI",
    "ko": "패스트API",
    "full": "",
    "src": "02-04 · 02-05",
    "level": "실전",
    "def": "API 서버를 빠르게 만들 수 있어 요즘 많이 쓰는 Python 웹 프레임워크.",
    "easy": "주문 창구를 빨리 여는 데 특화된 Python용 조립 키트예요.",
    "ex": "AI 기능을 붙이기 좋은 Python으로 백엔드를 짤 때 FastAPI로 별도 API 서버를 만들어요.",
    "flow": [],
    "related": [
      "flask",
      "django",
      "api"
    ]
  },
  {
    "id": "acid",
    "term": "ACID",
    "ko": "ACID(트랜잭션의 네 가지 약속)",
    "full": "Atomicity Consistency Isolation Durability",
    "level": "심화",
    "def": "트랜잭션이 지키는 원자성·일관성·고립성·지속성 네 가지 성질.",
    "easy": "송금은 '전부 되거나 전부 안 되거나', 그리고 끝났다고 하면 정전이 나도 그대로 남는다는 약속이에요.",
    "ex": "돈·주문·예약처럼 틀리면 큰일인 데이터는 ACID가 강한 SQL DB에 둬요. ACID는 실수로 지운 걸 되돌려 주지 않으니 백업은 따로 챙겨요.",
    "flow": [
      "원자성",
      "일관성",
      "고립성",
      "지속성"
    ],
    "related": [
      "transaction",
      "backup",
      "sql"
    ]
  },
  {
    "id": "join",
    "term": "Join",
    "ko": "조인(표 잇기)",
    "full": "",
    "level": "실전",
    "def": "키를 기준으로 여러 표의 행을 이어 붙여 함께 조회하는 SQL 동작.",
    "easy": "주문서에 적힌 '1번 회원'을 보고 회원 명부에서 1번 이름을 찾아 옆에 붙여 읽는 거예요.",
    "ex": "주문 표와 회원 표를 회원 번호로 조인해 누가 무엇을 샀는지 한 번에 봐요. NoSQL은 이런 표 잇기를 일부 포기하기도 해요.",
    "flow": [],
    "related": [
      "primary-key",
      "db-relation",
      "sql"
    ]
  },
  {
    "id": "polyglot-persistence",
    "term": "Polyglot Persistence",
    "ko": "폴리글랏(용도별 DB 섞어 쓰기)",
    "full": "",
    "level": "심화",
    "def": "데이터 성격에 맞춰 SQL과 여러 NoSQL을 용도별로 골라 함께 쓰는 방식.",
    "easy": "국은 국그릇, 밥은 밥그릇처럼 음식마다 맞는 그릇을 골라 써요.",
    "ex": "주문은 SQL DB에, 장바구니는 키-값 DB에, 친구 관계는 그래프 DB에 나눠 저장해요.",
    "flow": [],
    "related": [
      "sql",
      "nosql",
      "database"
    ]
  },
  {
    "id": "document-db",
    "term": "Document Database",
    "ko": "문서형 DB",
    "full": "",
    "level": "실전",
    "def": "JSON처럼 자유로운 문서 덩어리로 저장해 형태가 자주 바뀌는 데이터에 맞는 NoSQL 갈래.",
    "easy": "칸이 정해진 출석부 대신, 아무 내용이나 적을 수 있는 쪽지를 한 장씩 모아 둬요.",
    "ex": "프로필·상품 카탈로그처럼 항목이 제각각인 데이터를 MongoDB 같은 문서형 DB에 담아요.",
    "flow": [],
    "related": [
      "nosql",
      "mongodb",
      "json"
    ]
  },
  {
    "id": "mongodb",
    "term": "MongoDB",
    "ko": "몽고DB",
    "full": "",
    "level": "실전",
    "def": "JSON처럼 생긴 문서 단위로 데이터를 저장하는 대표적인 문서형 NoSQL DB.",
    "easy": "모양이 제각각인 쪽지를 봉투째 보관하는 서류함이에요.",
    "ex": "상품마다 항목이 다른 카탈로그나 자주 바뀌는 프로필을 MongoDB에 문서로 저장해요.",
    "flow": [],
    "related": [
      "document-db",
      "nosql",
      "json"
    ]
  },
  {
    "id": "key-value-db",
    "term": "Key-Value Store",
    "ko": "키-값 DB",
    "full": "",
    "level": "실전",
    "def": "'키 → 값' 한 쌍으로만 저장해 아주 단순하고 빠른 NoSQL 갈래.",
    "easy": "사물함 번호만 대면 그 칸 물건을 바로 꺼내 주는 보관함이에요.",
    "ex": "Redis나 DynamoDB에 장바구니·세션·캐시처럼 빨리 넣고 꺼낼 데이터를 저장해요.",
    "flow": [],
    "related": [
      "redis",
      "cache",
      "nosql"
    ]
  },
  {
    "id": "redis",
    "term": "Redis",
    "ko": "레디스",
    "full": "",
    "level": "실전",
    "def": "데이터를 메모리에 두는 매우 빠른 키-값 저장소로, 캐시·세션 저장에 많이 쓰는 것.",
    "easy": "서랍(DB)을 열지 않고 바로 보는 책상 위 메모지예요.",
    "ex": "자주 확인하는 로그인 증표나 장바구니를 Redis에 두면 매번 DB를 뒤지지 않아 빨라요.",
    "flow": [],
    "related": [
      "key-value-db",
      "cache",
      "session-token"
    ]
  },
  {
    "id": "cache",
    "term": "Cache",
    "ko": "캐시",
    "full": "",
    "src": "02-04 · 03-02",
    "level": "실전",
    "def": "자주 쓰는 데이터를 더 빠른 곳에 잠시 복사해 두고 다시 꺼내 쓰는 것.",
    "easy": "자주 쓰는 연필을 필통에 넣지 않고 책상 위에 꺼내 두는 거예요.",
    "ex": "로그인 증표나 자주 보는 목록을 캐시에 두면 매번 DB를 뒤지지 않아 빨라져요.",
    "flow": [],
    "related": [
      "redis",
      "key-value-db",
      "kv-cache"
    ]
  },
  {
    "id": "column-db",
    "term": "Column Database",
    "ko": "컬럼형 DB",
    "full": "",
    "level": "심화",
    "def": "데이터를 열(항목) 중심으로 저장해 대량 분석에 강한 NoSQL 갈래.",
    "easy": "학생별로가 아니라 '키만', '몸무게만' 세로로 모아 둬서 평균 구하기가 빨라요.",
    "ex": "Cassandra나 HBase 같은 컬럼형 DB로 대규모 로그와 통계를 분석해요.",
    "flow": [],
    "related": [
      "nosql",
      "table-row-column",
      "database"
    ]
  },
  {
    "id": "graph-db",
    "term": "Graph Database",
    "ko": "그래프 DB",
    "full": "",
    "level": "실전",
    "def": "점(대상)과 선(관계)으로 저장해 연결을 따라가는 데 강한 NoSQL 갈래.",
    "easy": "친구들을 점으로 찍고 친한 사이를 선으로 이은 지도예요.",
    "ex": "Neo4j 같은 그래프 DB로 '친구의 친구의 친구'를 찾는 소셜 기능을 만들어요.",
    "flow": [],
    "related": [
      "nosql",
      "db-relation",
      "database"
    ]
  },
  {
    "id": "jwt",
    "term": "JWT",
    "ko": "JSON 웹 토큰",
    "full": "JSON Web Token",
    "level": "실전",
    "def": "사용자 정보와 만료 시각을 JSON으로 담고 위조를 막는 서명을 붙인 토큰 형식.",
    "easy": "도장이 찍힌 입장권이에요. 도장이 진짜인지만 보면 매번 명단을 뒤지지 않아도 돼요.",
    "ex": "로그인 상태를 세션으로 유지할지 JWT 같은 토큰으로 유지할지 정하고, 발급·검증·만료는 검증된 인증 도구에 맡겨요.",
    "flow": [],
    "related": [
      "session-token",
      "auth",
      "json"
    ]
  },
  {
    "id": "pii",
    "src": "02-04 · 03-03 · 03-06 · 03-07",
    "term": "PII",
    "ko": "개인정보(개인 식별 정보)",
    "full": "Personally Identifiable Information",
    "level": "입문",
    "def": "이름·이메일·전화번호처럼 특정 사람을 알아볼 수 있게 하는 정보.",
    "easy": "이름표나 집 주소처럼 '이게 누구인지' 알려 주는 정보예요.",
    "ex": "DB에 회원 이름·이메일이 쌓이면 자산이자 책임이 돼요. 유출되면 다른 서비스 계정까지 위험해질 수 있어요.",
    "flow": [],
    "related": [
      "data-minimization",
      "password-hash",
      "auth"
    ]
  },
  {
    "id": "data-minimization",
    "term": "Data Minimization",
    "ko": "최소 수집",
    "full": "",
    "level": "입문",
    "def": "서비스 목적에 꼭 필요한 개인정보만 모으는 원칙.",
    "easy": "소풍 가방엔 꼭 필요한 것만 넣어요. 안 가져간 물건은 잃어버릴 일도 없어요.",
    "ex": "이메일 하나면 되는데 전화번호·생년월일까지 받고 있지 않은지 가입 화면을 점검해요.",
    "flow": [],
    "related": [
      "pii",
      "auth",
      "password-hash"
    ]
  },
  {
    "id": "payment-gateway",
    "term": "PG",
    "ko": "결제대행사",
    "full": "Payment Gateway",
    "level": "입문",
    "def": "카드 결제를 대신 처리해 주는 서비스로, 내 서비스가 카드번호를 직접 저장하지 않게 해 주는 것.",
    "easy": "가게가 돈 받는 일을 믿을 만한 은행 창구에 맡기는 거예요.",
    "ex": "결제는 PG에 맡기고 카드번호 같은 민감정보는 내 DB에 저장하지 않아요.",
    "flow": [],
    "related": [
      "pii",
      "data-minimization",
      "api"
    ]
  },
  {
    "id": "ransomware",
    "term": "Ransomware",
    "ko": "랜섬웨어",
    "full": "",
    "level": "입문",
    "def": "파일을 암호화해 못 쓰게 만든 뒤 풀어 주는 대가로 돈을 요구하는 악성 프로그램.",
    "easy": "도둑이 일기장에 자물쇠를 채우고 열쇠값을 내라고 하는 거예요.",
    "ex": "한 장소의 데이터를 통째로 잃는 사고에 대비해 백업 한 벌은 다른 장소에 둬요.",
    "flow": [],
    "related": [
      "backup-3-2-1",
      "backup",
      "firewall"
    ]
  },
  {
    "id": "backup-3-2-1",
    "term": "3-2-1 Backup Rule",
    "ko": "3-2-1 백업 규칙",
    "full": "",
    "level": "입문",
    "def": "최소 3벌을 두고, 서로 다른 매체 2종에, 1벌은 다른 장소에 보관하는 백업 원칙.",
    "easy": "소중한 사진을 휴대폰, 외장하드, 할머니 댁 컴퓨터에 하나씩 두는 거예요.",
    "ex": "노트북 원본, 외장하드 사본, 클라우드 사본 하나를 두고 복구가 실제로 되는지 가끔 열어 봐요.",
    "flow": [
      "3벌",
      "2종 매체",
      "1벌은 다른 장소"
    ],
    "related": [
      "backup",
      "ransomware",
      "pitr"
    ]
  },
  {
    "id": "pitr",
    "term": "PITR",
    "ko": "특정 시점 복구",
    "full": "Point-in-Time Recovery",
    "level": "심화",
    "def": "DB를 과거의 원하는 시각 상태로 되돌리는 복구 기능.",
    "easy": "게임에서 '어제 오후 3시 저장 지점'으로 돌아가듯 원하는 순간으로 되감아요.",
    "ex": "무료 DB 비교표의 'PITR 1일'은 최근 하루 안의 시점으로만 되돌릴 수 있다는 뜻이에요.",
    "flow": [],
    "related": [
      "backup",
      "migration",
      "neon"
    ]
  },
  {
    "id": "mysql",
    "term": "MySQL",
    "ko": "마이SQL",
    "full": "",
    "level": "실전",
    "def": "PostgreSQL과 함께 널리 쓰이는 오픈소스 관계형 DB.",
    "easy": "PostgreSQL과 나란히 많이 쓰는 또 하나의 튼튼한 표준 창고예요.",
    "ex": "회사들이 실제로 쓰는 MySQL도 내 컴퓨터에 무료로 설치해 연습할 수 있어요.",
    "flow": [],
    "related": [
      "postgresql",
      "sql",
      "sqlite"
    ]
  },
  {
    "id": "neon",
    "term": "Neon",
    "ko": "네온",
    "full": "",
    "level": "실전",
    "def": "무료로 시작할 수 있는 클라우드 PostgreSQL 서비스로, DB 브랜치 기능을 제공하는 것.",
    "easy": "코드처럼 DB에도 갈림길을 만들어 따로 실험해 볼 수 있는 창고예요.",
    "ex": "순수 Postgres와 브랜치를 써 보고 싶을 때 후보로 봐요. 무료 요금제는 쓰지 않을 때 컴퓨트가 멈출 수 있어요.",
    "flow": [],
    "related": [
      "postgresql",
      "free-tier",
      "pitr"
    ]
  },
  {
    "id": "turso",
    "term": "Turso",
    "ko": "터소",
    "full": "",
    "level": "실전",
    "def": "SQLite를 기반으로 한 클라우드 DB 서비스.",
    "easy": "들고 다니던 공책(SQLite)을 인터넷 창고에 올려 어디서나 펴 보는 거예요.",
    "ex": "SQLite 기반의 가벼운 서비스를 클라우드에서 실험할 때 후보로 봐요.",
    "flow": [],
    "related": [
      "sqlite",
      "free-tier",
      "database"
    ]
  },
  {
    "id": "docker",
    "term": "Docker",
    "ko": "도커",
    "full": "",
    "level": "실전",
    "def": "프로그램과 실행 환경을 '컨테이너'로 묶어 어디서나 같은 방식으로 띄우는 도구.",
    "easy": "필요한 걸 다 담은 도시락통이에요. 어느 책상에서 열어도 같은 밥이 나와요.",
    "ex": "DB 설치가 번거로우면 Docker로 PostgreSQL을 명령 한 줄로 띄우고, 필요 없으면 컨테이너째 지워요.",
    "flow": [],
    "related": [
      "postgresql",
      "dependency",
      "deploy"
    ]
  },
  {
    "id": "render",
    "term": "Render",
    "ko": "렌더",
    "full": "",
    "src": "02-04 · 02-05",
    "level": "입문",
    "def": "직접 만든 백엔드 서버 코드를 올려 실행해 주는 클라우드 호스팅 서비스.",
    "easy": "내 컴퓨터를 꺼도 대신 가게 문을 열어 두는 임대 가게예요.",
    "ex": "Todo 앱 백엔드를 Render에 올리려면 코드 보관 위치·환경변수·시작 명령을 준비해요.",
    "flow": [],
    "related": [
      "hosting",
      "deploy",
      "env"
    ]
  },
  {
    "id": "node-gyp",
    "term": "node-gyp",
    "ko": "네이티브 모듈 빌드 도구",
    "full": "",
    "level": "심화",
    "def": "C/C++로 된 Node.js 네이티브 모듈을 내 컴퓨터에서 컴파일하는 도구로, 빌드 도구가 없으면 설치 중 오류가 나는 것.",
    "easy": "조립식 가구를 받았는데 드라이버가 없어서 조립을 못 하는 상황이에요.",
    "ex": "npm install에서 better-sqlite3 빌드 에러(node-gyp)가 나면 맥은 Xcode Command Line Tools, 윈도우는 빌드 툴과 Python을 설치해요.",
    "flow": [],
    "related": [
      "npm",
      "dependency",
      "build"
    ]
  },
  {
    "id": "eaddrinuse",
    "term": "EADDRINUSE",
    "ko": "포트 사용 중 오류",
    "full": "Error: Address Already In Use",
    "level": "입문",
    "def": "쓰려는 포트를 다른 프로그램이 이미 쓰고 있어 서버를 켤 수 없다는 오류.",
    "easy": "주차하려는 칸에 이미 다른 차가 서 있는 상황이에요.",
    "ex": "이전에 켠 개발 서버가 아직 떠 있으면 생겨요. 그 창을 끄거나 다른 포트로 실행해요.",
    "flow": [],
    "related": [
      "port",
      "dev-server",
      "localhost"
    ]
  },
  {
    "id": "server",
    "term": "Server",
    "ko": "서버",
    "full": "",
    "src": "02-04 · 02-05 · 03-03",
    "level": "입문",
    "def": "브라우저 같은 클라이언트의 요청을 받아 처리하고 응답을 돌려주는 컴퓨터나 프로그램.",
    "easy": "식당 주방이에요. 홀에서 들어온 주문을 받아 요리해서 내보내요.",
    "ex": "브라우저가 '상품 목록 줘'라고 요청하면 서버가 DB에서 꺼내 결과를 응답으로 돌려줘요.",
    "flow": [
      "요청 받기",
      "처리",
      "응답"
    ],
    "related": [
      "front-back",
      "endpoint",
      "hosting"
    ]
  },
  {
    "id": "prototype",
    "term": "Prototype",
    "ko": "프로토타입(시제품)",
    "full": "",
    "src": "02-04 · 02-05",
    "level": "입문",
    "def": "아이디어가 실제로 되는지 빠르게 확인하려고 만든 초기 시험판.",
    "easy": "진짜 집을 짓기 전에 종이로 만들어 보는 모형 집이에요.",
    "ex": "작은 앱이나 프로토타입은 설치 없이 파일 하나로 쓰는 SQLite로 가볍게 시작해요.",
    "flow": [],
    "related": [
      "mvp",
      "sqlite",
      "free-tier"
    ]
  },
  {
    "id": "traffic",
    "term": "Traffic",
    "ko": "트래픽",
    "full": "",
    "src": "02-04 · 02-05",
    "level": "입문",
    "def": "서비스로 오가는 요청과 데이터의 양.",
    "easy": "가게 앞을 지나다니는 손님 수예요. 많아지면 계산대가 바빠져요.",
    "ex": "트래픽이 늘면 무료 한도를 넘어 유료로 넘어가니 요금·용량 알림을 켜 둬요.",
    "flow": [],
    "related": [
      "free-tier",
      "hosting",
      "rate-limit"
    ]
  },
  {
    "id": "open-source",
    "term": "Open Source",
    "ko": "오픈소스",
    "full": "",
    "src": "02-04 · 02-06 · 03-03 · 03-05 · 03-06",
    "level": "입문",
    "def": "소스 코드를 공개해 누구나 보고 쓰고 고칠 수 있게 한 소프트웨어.",
    "easy": "레시피를 모두에게 공개한 요리예요. 누구나 따라 만들고 고쳐 볼 수 있어요.",
    "ex": "PostgreSQL·MySQL·SQLite는 오픈소스라 내 컴퓨터에 무료로 설치해 쓸 수 있어요.",
    "flow": [],
    "related": [
      "postgresql",
      "open-weight",
      "library"
    ]
  }
]);

