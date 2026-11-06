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
    "src": "02-04",
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
    "src": "02-04 · 02-05",
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
  }
]);

