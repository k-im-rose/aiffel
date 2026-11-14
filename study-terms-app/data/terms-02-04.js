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
    "stage": "만들기",
    "use": "화면이 서버에 데이터를 달라고 요청할 때 맞춰야 하는 주소예요. 404 같은 오류가 나면 이 주소가 맞는지부터 봐요.",
    "ai": "AI에게 기능을 시킬 때 \"주소와 하는 일을 표로 정리해 줘\"라고 하면 어떤 창구가 있는지 한눈에 보여요.",
    "word": "End: 끝\nPoint: 지점\nEndpoint: 요청이 닿는 서버 쪽 끝 주소",
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
    "stage": "만들기",
    "use": "서버 주소를 어떤 규칙으로 지을지 정할 때 이 말을 만나요. 규칙이 있으면 기능이 늘어도 주소가 덜 헷갈려요.",
    "ai": "\"REST 규칙에 맞게 주소를 설계해 줘\"라고 시키면 돼요. 결과에서 주소가 /getProducts처럼 동사로 지어졌는지는 사람이 훑어보세요.",
    "word": "Representational: 대표해서 나타내는\nState: 상태\nTransfer: 전달, 옮기다\nREST: 자원의 상태를 주고받는 설계 방식",
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
    "full": "Hypertext Transfer Protocol Method",
    "src": "02-04",
    "level": "입문",
    "def": "요청이 서버에 무엇을 하려는지 나타내는 동작 이름.",
    "easy": "편지 겉봉에 적는 '가져다줘', '새로 접수해줘' 같은 용건이에요.",
    "ex": "GET은 상품 목록을 읽고, POST는 새 주문을 만들 때 써요.",
    "flow": [],
    "stage": "실행·확인",
    "use": "서버에 요청을 보낼 때 읽기인지 새로 만들기인지 구분하는 이름이에요. 405 오류가 나면 이 이름이 안 맞는 경우가 많아요.",
    "ai": "기능이 안 될 때 \"이 요청이 GET인지 POST인지 확인해 줘\"라고 물어보세요. AI가 방식을 헷갈려 쓰는 일이 있어요.",
    "word": "Hypertext: 링크로 이어진 문서\nTransfer: 전송\nProtocol: 규약, 통신 약속\nMethod: 방법, 방식\nHTTP Method: 요청이 무엇을 할지 알리는 방식",
    "code": "// 서버에 새 글 보내기(POST 요청)\nconst url = \"https://example.com/api/posts\";\nawait fetch(url, { method: \"POST\" });",
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
    "stage": "만들기",
    "use": "할 일 앱 같은 첫 프로젝트에서 추가·보기·수정·삭제 기능을 만들 때 쓰는 말이에요. 이 네 가지가 되면 앱의 뼈대는 갖춘 거예요.",
    "ai": "\"CRUD가 모두 되는 ○○ 앱을 만들어 줘\"라고 시키면 돼요. 만든 뒤에는 네 동작을 직접 눌러 보며 하나씩 확인하세요.",
    "word": "Create: 만들다\nRead: 읽다\nUpdate: 고치다, 최신으로 바꾸다\nDelete: 지우다\nCRUD: 위 네 동작의 앞글자",
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
    "stage": "오류 해결",
    "use": "결제나 수량처럼 조작되면 안 되는 값을 만들 때 만나요. 화면에서 값을 바꿔 속이는 걸 서버가 다시 확인해서 막아요.",
    "ai": "AI는 화면에서만 확인하고 끝내는 경우가 있어요. \"가격과 수량은 서버에서도 다시 검사해 줘\"라고 꼭 시키세요.",
    "word": "Server-side: 서버 쪽에서\nValidation: 검증, 맞는지 확인하는 것",
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
    "stage": "만들기",
    "use": "앱에 저장할 데이터의 칸을 미리 정할 때 쓰는 말이에요. 처음에 잘 짜 두면 나중에 데이터를 옮기며 고생하지 않아요.",
    "ai": "\"이 앱에 필요한 표와 항목을 제안해 줘\"라고 시키면 초안이 나와요. 데이터가 쌓이기 전에 꼭 직접 읽어 보고 고치세요.",
    "word": "Schema: 도식, 틀을 그린 설계도",
    "code": "-- 표의 모양(스키마) 정하기\nCREATE TABLE todos (id INTEGER, title TEXT);",
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
    "stage": "만들기",
    "use": "저장된 데이터를 조건으로 골라 보거나 고칠 때 쓰는 말이에요. DB 화면에서 직접 데이터를 확인할 때 만나요.",
    "ai": "AI가 준 SQL을 그대로 실행하기 전에 \"이 명령이 뭘 하는지 설명해 줘\"라고 물어보세요. 특히 지우는 명령은 꼭 확인해야 해요.",
    "word": "Structured: 구조화된, 틀이 짜인\nQuery: 질의, 물어보는 것\nLanguage: 언어\nSQL: 데이터베이스에 묻고 시키는 언어",
    "code": "-- 할 일 표에서 전부 가져오기\nSELECT * FROM todos;",
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
    "stage": "준비",
    "use": "프로젝트에 쓸 데이터 저장소를 고를 때 SQL과 비교하며 만나요. 데이터 모양이 자주 바뀔 때 후보가 돼요.",
    "ai": "입문 프로젝트는 대개 직접 고를 필요가 없어요. 헷갈리면 \"이 앱에 SQL과 NoSQL 중 뭐가 맞는지 이유와 함께 알려 줘\"라고 물어보세요.",
    "word": "Not: ~이 아닌\nOnly: 오직\nSQL: 구조화된 질의 언어\nNoSQL: SQL만 쓰는 것은 아닌 DB",
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
    "stage": "만들기",
    "use": "데이터를 표로 볼 때 가로줄은 한 건, 세로줄은 항목이에요. 저장소 화면에서 데이터를 볼 때 이 말이 나와요.",
    "ai": "\"users 표에 열 하나 추가해 줘\"처럼 표 이름과 열을 정확히 말하세요. 말이 흐릿하면 엉뚱한 곳을 고치기 쉬워요.",
    "word": "Table: 표\nRow: 가로줄, 행\nColumn: 기둥, 세로줄(열)",
    "related": [
      "schema",
      "primary-key",
      "sql"
    ]
  },
  {
    "full": "",
    "flow": [],
    "stage": "오류 해결",
    "use": "표에서 각 줄을 구분하는 번호예요. duplicate key 같은 오류 메시지가 뜰 때 이 말을 만나요.",
    "ai": "표를 만들 때 \"각 줄을 구분하는 id 열을 둬 줘\"라고 시키세요. 키 오류가 나면 메시지를 그대로 붙여 넣고 원인을 물어보세요.",
    "word": "Primary: 으뜸의, 첫째의\nKey: 열쇠, 찾는 데 쓰는 값\nForeign: 외부의, 다른 곳의",
    "code": "-- id를 기본키로 지정하기\nCREATE TABLE users (id INTEGER PRIMARY KEY);",
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
    "stage": "만들기",
    "use": "회원, 주문, 상품처럼 표가 여러 개인 앱을 설계할 때 만나요. 표끼리 어떻게 이어지는지가 1:N, N:M이에요.",
    "ai": "\"회원과 주문과 상품이 어떻게 이어지는지 그림이나 표로 보여 줘\"라고 시키세요. 관계를 잘못 잡으면 나중에 고치기 어려워요.",
    "word": "Relationship: 관계, 서로 이어진 사이",
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
    "stage": "오류 해결",
    "use": "데이터가 많아져 목록이나 검색이 느려질 때 해결책으로 나와요. 책의 찾아보기처럼 위치를 미리 적어 둬요.",
    "ai": "\"검색이 느린데 색인을 추가해야 할지 알려 줘\"라고 물어보세요. 무작정 많이 달라고 하면 오히려 저장이 느려질 수 있어요.",
    "word": "Index: 색인, 찾아보기",
    "code": "-- 이메일로 빨리 찾게 색인 만들기\nCREATE INDEX idx_email ON users(email);",
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
    "stage": "만들기",
    "use": "결제처럼 여러 단계가 한 묶음인 기능을 만들 때 써요. 중간에 오류가 나도 반만 처리된 데이터가 남지 않게 해요.",
    "ai": "여러 단계가 이어지는 기능은 \"중간에 실패하면 전부 취소되게 해 줘\"라고 시키세요. AI가 단계를 따로따로 저장해 버릴 때가 있어요.",
    "word": "Transaction: 거래, 여러 단계가 묶인 처리",
    "code": "-- 여러 작업을 한 묶음으로 처리\nBEGIN;\nUPDATE items SET stock = stock - 1;\nCOMMIT;",
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
    "stage": "만들기",
    "use": "표를 설계할 때 같은 정보를 여러 곳에 적지 않도록 정리하는 일이에요. 한 곳만 고치고 나머지가 틀어지는 걸 막아요.",
    "ai": "AI가 짠 표에서 같은 정보가 여러 곳에 반복되는지 보세요. \"중복되는 정보는 한 곳에만 두게 정리해 줘\"라고 시키면 돼요.",
    "word": "Normalize: 표준 형태로 맞추다\nNormalization: 정규화, 중복 없이 표준 형태로 정리하기",
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
    "stage": "배포·공유",
    "use": "이미 쓰는 중인 서비스의 표 구조를 바꿔야 할 때 해요. 바꾼 내용을 파일로 남기면 되돌리기도 쉬워요.",
    "ai": "데이터가 든 DB를 바꾸는 일은 위험해요. 실행 전에 \"되돌리는 방법도 같이 알려 줘\"라고 하고 백업부터 해 두세요.",
    "word": "Migration: 이주, 다른 곳으로 옮겨 가기",
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
    "stage": "만들기",
    "use": "회원가입과 로그인을 만들 때 비밀번호를 저장하는 방식이에요. 원문이 아니라 알아볼 수 없게 바꾼 값을 저장해요.",
    "ai": "AI가 비밀번호를 그대로 저장하는 코드를 만들지 않았는지 꼭 확인하세요. \"비밀번호는 해시로 저장해 줘\"라고 분명히 시키세요.",
    "word": "Password: 비밀번호\nHash: 잘게 다져 뒤섞다\nPassword Hash: 비밀번호를 되돌릴 수 없게 바꾼 값",
    "code": "// 비밀번호를 해시로 바꿔 저장하기\nconst hash = await bcrypt.hash(password, 10);",
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
    "full": "Structured Query Language Injection",
    "src": "02-04 · 02-05",
    "level": "실전",
    "def": "입력값이 DB 명령으로 실행되도록 끼워 넣어 DB를 조작하는 공격.",
    "easy": "이름 칸에 '이 서류를 모두 파쇄해'라고 써서 직원이 따라 하게 만드는 일이에요.",
    "ex": "로그인 창에 특정 문자를 넣어 비밀번호 없이 들어가는 공격이 이 원리예요.",
    "flow": [],
    "stage": "오류 해결",
    "use": "검색창이나 로그인 칸에 이상한 명령을 넣어 DB를 망가뜨리는 공격이에요. 보안 점검 때 가장 먼저 나오는 항목이에요.",
    "ai": "AI가 입력값을 문자열에 그냥 이어 붙여 쿼리를 만들었는지 확인하세요. \"SQL 주입에 안전한지 점검해 줘\"라고 시키면 돼요.",
    "word": "SQL: 데이터베이스 질의 언어\nInjection: 주입, 안으로 집어넣는 것\nSQL Injection: DB 명령 속에 몰래 끼워 넣는 공격",
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
    "stage": "만들기",
    "use": "코드에서 DB에 값을 넣거나 찾을 때 쓰는 안전한 방식이에요. 사용자가 쓴 글이 명령으로 실행되는 걸 막아요.",
    "ai": "\"입력값을 쿼리에 직접 끼우지 말고 안전한 방식으로 바꿔 줘\"라고 시키세요. 코드에 ${}로 값을 끼운 곳이 보이면 바꿔 달라고 하세요.",
    "word": "Parameter: 매개변수, 따로 넘기는 값\nQuery: 질의, 물어보는 것\nParameterized Query: 입력을 값으로만 따로 넘기는 질의",
    "code": "// ?에 값을 따로 넘겨 안전하게 조회\ndb.query(\"SELECT * FROM users WHERE id = ?\", [id]);",
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
    "stage": "배포·공유",
    "use": "데이터를 지우거나 구조를 바꾸기 전, 서비스를 열기 전에 챙겨요. 사고가 나도 사본이 있으면 되살릴 수 있어요.",
    "ai": "AI가 데이터를 지우거나 바꾸는 작업을 하기 전에 \"먼저 백업부터 하고 시작해 줘\"라고 시키세요. 복구가 실제로 되는지도 한 번 해 보세요.",
    "word": "Backup: 만일을 위해 따로 두는 예비 사본",
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
    "stage": "준비",
    "use": "첫 프로젝트에서 설치 없이 파일 하나로 데이터 저장을 시작할 때 써요. 작은 연습용 앱에 잘 맞아요.",
    "ai": "혼자 연습하는 앱에 알맞아요. 여러 사람이 쓰는 서비스로 키울 때는 \"다른 DB로 옮기려면 어떻게 해?\"라고 미리 물어보세요.",
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
    "stage": "준비",
    "use": "서비스에 쓸 DB를 처음 고를 때 가장 먼저 후보가 돼요. 무료 DB 서비스 뒤에서도 많이 돌아가고 있어요.",
    "ai": "어떤 DB를 쓸지 모르겠다면 \"이 앱은 PostgreSQL이면 충분한지 알려 줘\"라고 물어보세요. 직접 설치할 일은 거의 없어요.",
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
    "stage": "오류 해결",
    "use": "남의 데이터가 보이거나, 반대로 내 데이터가 하나도 안 보일 때 확인해요. 누가 어떤 줄을 볼 수 있는지 정하는 규칙이에요.",
    "ai": "켜 놓고 규칙을 안 쓰면 데이터가 안 보여요. \"로그인한 사람은 자기 데이터만 보게 규칙을 써 줘\"라고 시키고 직접 확인하세요.",
    "word": "Row: 행, 줄\nLevel: 수준, 단계\nSecurity: 보안\nRLS: 행 단위로 접근을 막는 보안",
    "code": "-- 표에 행 수준 보안 켜기\nALTER TABLE notes ENABLE ROW LEVEL SECURITY;",
    "related": [
      "auth",
      "database",
      "server-side-validation"
    ]
  },
  {
    "full": "",
    "flow": [],
    "stage": "배포·공유",
    "use": "코드를 처음 GitHub에 올리기 전에 올리면 안 되는 파일을 적어 두는 곳이에요. 비밀 키가 새는 사고를 막아요.",
    "ai": "AI가 비밀 키 파일을 올리지 않게 \"프로젝트에 맞는 .gitignore를 만들어 줘\"라고 시키세요. 올리기 전에 목록에 .env가 있는지 꼭 보세요.",
    "word": "Ignore: 무시하다, 못 본 척하다\ngitignore: Git이 못 본 척할 파일 목록",
    "code": "# .gitignore 안에 적는 모양\nnode_modules/\n.env",
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
    "stage": "실행·확인",
    "use": "서버를 켠 뒤 브라우저 주소창에 http://localhost:3000처럼 쳐서 내 컴퓨터에서 앱을 열어 볼 때 써요.",
    "ai": "주소가 안 열리면 \"서버가 켜져 있는지, 어느 포트인지 확인해 줘\"라고 시키세요. 이 주소는 내 컴퓨터에서만 열려서 남에게 줘도 안 보여요.",
    "word": "Local: 지역의, 내가 있는 곳의\nHost: 주인, 서비스를 맡아 주는 컴퓨터\nlocalhost: 내 컴퓨터 자신을 가리키는 이름",
    "code": "# 브라우저 주소창에 입력하는 주소\nhttp://localhost:3000",
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
    "stage": "만들기",
    "use": "재고가 있는지, 최종 가격이 얼마인지 같은 서비스의 핵심 규칙을 정할 때 써요. 이 규칙은 서버에 있어야 안전해요.",
    "ai": "AI가 가격이나 권한 계산을 화면 코드에 넣기도 해요. \"핵심 규칙은 서버에서 처리하게 해 줘\"라고 분명히 시키세요.",
    "word": "Business: 사업, 업무\nLogic: 논리, 규칙에 맞는 판단\nBusiness Logic: 서비스 규칙을 판단하는 처리",
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
    "stage": "만들기",
    "use": "혼자 화면부터 서버, 저장소까지 앱 전체를 만들 때 쓰는 말이에요. AI와 함께하면 입문자도 해 볼 수 있어요.",
    "ai": "직접 다룰 일은 거의 없는 말이에요. 앱 전체를 한 번에 시키기보다 \"화면부터 먼저, 그다음 서버\"처럼 나눠서 시키는 게 좋아요.",
    "word": "Full: 가득 찬, 전부의\nStack: 쌓아 올린 더미\nFull Stack: 화면부터 서버까지 전부 다루는 것",
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
    "stage": "만들기",
    "use": "새 프로젝트에서 .ts 파일이 보이면 만나는 언어예요. 값의 종류를 적어 두어서 실수를 실행 전에 알려 줘요.",
    "ai": "AI가 타입 오류를 \"any\"로 덮어 버리는 일이 있어요. 오류가 나면 \"any 쓰지 말고 제대로 고쳐 줘\"라고 시키세요.",
    "code": "// 값의 종류(타입)를 적어 두기\nconst age: number = 20;",
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
    "stage": "만들기",
    "use": "JavaScript로 서버를 처음 만들 때 가장 자주 쓰는 도구예요. 작은 API 서버를 몇 줄로 만들 수 있어요.",
    "ai": "\"Express로 할 일 목록 API 만들어 줘\"처럼 시키면 돼요. 코드를 읽어 보고 입력값 검사가 빠지지 않았는지 확인하세요.",
    "code": "// 서버 만들고 3000번 포트로 열기\nconst app = express();\napp.listen(3000);",
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
    "stage": "준비",
    "use": "백엔드가 커지거나 여럿이 함께 만들 때 프레임워크를 고르며 만나요. 폴더 구조가 미리 정해져 있어요.",
    "ai": "입문 단계에서는 직접 고를 일이 드물어요. AI에게 시키면 정해진 구조를 따라 만들어서 코드를 읽을 때 위치를 찾기 쉬워요.",
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
    "stage": "준비",
    "use": "Python으로 로그인과 관리자 화면까지 있는 서비스를 만들 때 고르는 도구예요. 기본 기능이 많이 들어 있어요.",
    "ai": "\"Django로 시작하는 프로젝트를 만들고 실행 방법도 알려 줘\"라고 시키세요. 기능이 많아서 처음엔 폴더가 복잡해 보여도 괜찮아요.",
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
    "stage": "준비",
    "use": "파일 하나로 작은 서버를 빠르게 띄울 때 쓰는 Python 도구예요. 실험용 서버나 AI 모델을 서버로 만들 때 나와요.",
    "ai": "\"Flask로 간단한 API 서버 만들어 줘\"라고 시키세요. 작게 시작하기 좋지만 로그인 같은 기능은 직접 붙여야 해요.",
    "code": "# 가장 작은 웹 서버 만들기\nfrom flask import Flask\napp = Flask(__name__)",
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
    "stage": "준비",
    "use": "Python으로 API 서버를 빠르게 만들 때 요즘 많이 쓰는 도구예요. 서버를 켜면 시험해 볼 수 있는 문서 화면도 생겨요.",
    "ai": "\"FastAPI로 만들고 /docs에서 시험하는 방법도 알려 줘\"라고 시키세요. 만든 주소를 그 화면에서 눌러 바로 확인할 수 있어요.",
    "code": "# API 서버 만들기\nfrom fastapi import FastAPI\napp = FastAPI()",
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
    "stage": "준비",
    "use": "돈이나 예약처럼 틀리면 안 되는 데이터를 어떤 DB가 안전하게 지키는지 비교할 때 나와요. 보통 SQL DB가 이 약속을 지켜요.",
    "ai": "직접 다룰 일은 거의 없어요. 결제나 예약 앱이라면 \"이 DB가 데이터를 안전하게 지키는지 알려 줘\"라고 물어보세요.",
    "word": "Atomicity: 원자성, 더 쪼갤 수 없는 성질\nConsistency: 일관성, 규칙이 늘 맞는 성질\nIsolation: 고립, 서로 떨어져 간섭 없는 성질\nDurability: 지속성, 오래 견디는 성질\nACID: 트랜잭션이 지킬 네 성질",
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
    "stage": "만들기",
    "use": "주문 목록에 회원 이름을 같이 띄우는 것처럼 여러 표의 데이터를 한 번에 가져올 때 써요. SQL에서 나오는 말이에요.",
    "ai": "\"주문 목록과 회원 이름을 함께 보여 줘\"처럼 원하는 결과를 말하세요. 결과 개수가 이상하게 많거나 적으면 이어 붙인 방식을 AI에게 물어보세요.",
    "word": "Join: 합치다, 잇다",
    "code": "-- 두 표를 키로 이어서 조회\nSELECT * FROM orders\nJOIN users ON users.id = orders.user_id;",
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
    "stage": "준비",
    "use": "서비스가 커져서 한 가지 DB로 부족할 때 구조를 논의하며 나오는 말이에요. 용도마다 다른 DB를 섞어 써요.",
    "ai": "입문 단계에서는 직접 다룰 일이 거의 없어요. 처음에는 DB 하나로 시작하고, 필요가 생기면 그때 나누자고 AI에게 말하세요.",
    "word": "Polyglot: 여러 언어를 쓰는 (사람)\nPersistence: 지속성, 데이터를 계속 남겨 두는 것\nPolyglot Persistence: 여러 종류의 DB를 섞어 쓰는 것",
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
    "stage": "준비",
    "use": "저장할 데이터의 모양이 제각각이거나 자주 바뀌는 앱의 저장소를 고를 때 후보로 나와요. JSON을 그대로 저장해요.",
    "ai": "\"이 앱은 문서형 DB가 맞을지 표 형태가 맞을지 알려 줘\"라고 물어보세요. 연습용 앱은 표 형태로 시작해도 충분해요.",
    "word": "Document: 문서\nDatabase: 데이터를 모아 둔 저장소",
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
    "stage": "준비",
    "use": "Node.js 튜토리얼에서 자주 보이는 문서형 DB예요. 무료 클러스터를 만들고 연결 주소를 받아서 앱에 연결해요.",
    "ai": "연결 주소에 비밀번호가 들어 있어요. 코드에 쓰지 말고 .env에 넣었는지, GitHub에 올라가지 않는지 꼭 확인하세요.",
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
    "stage": "준비",
    "use": "로그인 정보나 장바구니처럼 빨리 넣고 빼야 하는 데이터를 저장할 때 고려해요. 이름표 하나에 값 하나만 저장해요.",
    "ai": "직접 다룰 일은 거의 없어요. 복잡한 조건으로 찾아야 하는 데이터에는 맞지 않으니 AI에게 \"이 데이터에 맞는 저장소가 뭔지\" 물어보세요.",
    "word": "Key: 열쇠, 찾는 이름\nValue: 값, 저장된 내용\nStore: 저장소",
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
    "full": "Remote Dictionary Server",
    "level": "실전",
    "def": "데이터를 메모리에 두는 매우 빠른 키-값 저장소로, 캐시·세션 저장에 많이 쓰는 것.",
    "easy": "서랍(DB)을 열지 않고 바로 보는 책상 위 메모지예요.",
    "ex": "자주 확인하는 로그인 증표나 장바구니를 Redis에 두면 매번 DB를 뒤지지 않아 빨라요.",
    "flow": [],
    "stage": "배포·공유",
    "use": "로그인 정보나 자주 쓰는 데이터를 빠르게 꺼내려고 서버에 붙이는 저장소예요. 배포 서비스에 주소를 넣어 연결해요.",
    "ai": "연결 주소와 비밀번호는 코드가 아니라 환경변수에 넣었는지 확인하세요. 입문 앱에서는 꼭 필요하지 않은 경우가 많아요.",
    "word": "Remote: 멀리 떨어진\nDictionary: 사전, 이름으로 찾는 모음\nServer: 서버\nRedis: 멀리서 쓰는 사전 같은 빠른 저장소",
    "code": "# 값 저장하고 꺼내 보기\nredis-cli set name kim\nredis-cli get name",
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
    "stage": "오류 해결",
    "use": "페이지가 느리거나, 고쳤는데 화면이 그대로일 때 이 말을 만나요. 한 번 가져온 걸 기억해 두고 다시 꺼내 쓰는 거예요.",
    "ai": "고친 게 안 보이면 AI에게 묻기 전에 강력 새로고침부터 해 보세요. 그래도 같으면 \"캐시 때문인지 확인해 줘\"라고 시키세요.",
    "word": "Cache: 숨겨 둔 저장물, 비축해 둔 것",
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
    "stage": "준비",
    "use": "로그나 통계처럼 아주 큰 데이터를 분석하는 시스템을 알아볼 때 나와요. DB 종류를 구분할 때 이름만 알면 돼요.",
    "ai": "입문 프로젝트에서 직접 다룰 일은 거의 없어요. 이름과 쓰임만 알아 두면 충분해요.",
    "word": "Column: 기둥, 세로줄(열)\nDatabase: 데이터를 모아 둔 저장소",
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
    "stage": "준비",
    "use": "친구 관계나 추천처럼 연결을 따라가는 기능을 설계할 때 후보로 나와요. 대상과 관계를 점과 선으로 저장해요.",
    "ai": "직접 다룰 일은 거의 없어요. 일반적인 앱은 표로 충분해서, AI가 그래프 DB를 쓰자고 하면 정말 필요한지 이유를 물어보세요.",
    "word": "Graph: 점과 선으로 나타낸 도표\nDatabase: 데이터를 모아 둔 저장소",
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
    "stage": "만들기",
    "use": "로그인한 뒤 서버가 내주는 증표로, 서버에 요청을 보낼 때 함께 보내요. 개발자 도구에서 긴 문자열로 보이는 게 이거예요.",
    "ai": "로그인 방식은 직접 만들지 말고 \"검증된 라이브러리로 만들어 줘\"라고 시키세요. 증표의 만료 시간과 보관 위치도 꼭 확인하세요.",
    "word": "JSON: 데이터를 적는 글자 형식\nWeb: 웹\nToken: 증표, 표식\nJWT: 로그인 증표로 쓰는 서명된 문자열",
    "code": "// 로그인한 사용자용 JWT 만들기\nconst token = jwt.sign({ id: 1 }, \"your-secret\");",
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
    "stage": "만들기",
    "use": "회원가입 화면을 만들거나 데이터를 저장할 때 조심해야 하는 정보예요. 이름, 이메일, 전화번호처럼 사람을 알아볼 수 있는 것들이에요.",
    "ai": "AI 대화창에 실제 사용자 정보를 붙여 넣지 마세요. 그리고 로그에 이런 정보가 찍히지 않는지 \"개인정보가 로그에 남는지 점검해 줘\"라고 시키세요.",
    "word": "Personally: 개인적으로, 사람 하나하나에게\nIdentifiable: 식별할 수 있는\nInformation: 정보\nPII: 특정 사람을 알아볼 수 있는 정보",
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
    "stage": "만들기",
    "use": "가입 화면과 표를 설계할 때 정말 필요한 정보만 받는지 따져 볼 때 써요. 안 모은 정보는 새어 나갈 수도 없어요.",
    "ai": "AI는 편하다고 입력 칸을 잔뜩 만들 때가 있어요. \"꼭 필요한 항목만 남겨 줘\"라고 시키세요.",
    "word": "Data: 데이터, 자료\nMinimization: 최소화, 가장 작게 줄이는 것",
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
    "stage": "만들기",
    "use": "쇼핑몰 같은 서비스에 카드 결제를 붙일 때 연결하는 업체예요. 카드번호를 내 서버에서 직접 받지 않아도 돼요.",
    "ai": "결제 코드는 AI가 만들어도 꼭 시험 결제로 확인하세요. 결제 키를 코드에 직접 쓰지 않았는지도 살펴보세요.",
    "word": "Payment: 지불, 결제\nGateway: 관문, 출입문\nPG: 결제의 관문 역할을 해 주는 회사",
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
    "stage": "배포·공유",
    "use": "백업이 왜 필요한지 설명할 때 위험의 예로 나와요. 파일을 잠가 놓고 돈을 요구하는 악성 프로그램이에요.",
    "ai": "직접 다룰 일은 거의 없어요. 대비책으로 중요한 데이터는 다른 곳에도 사본을 두고, 정말 복구되는지 확인해 두세요.",
    "word": "Ransom: 몸값\nWare: ~용품, 소프트웨어를 뜻하는 말\nRansomware: 몸값을 요구하는 악성 프로그램",
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
    "stage": "배포·공유",
    "use": "서비스 데이터나 작업 폴더를 어디에 백업할지 정할 때 기준으로 삼는 규칙이에요. 3벌, 2종류, 1벌은 다른 장소예요.",
    "ai": "\"우리 프로젝트에 3-2-1 규칙을 적용하려면 어떻게 하면 돼?\"라고 물어보세요. 한곳에만 둔 사본은 사고가 나면 같이 사라져요.",
    "word": "Backup: 만일을 위해 따로 두는 예비 사본\nRule: 규칙",
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
    "stage": "배포·공유",
    "use": "DB 서비스의 요금제를 비교할 때 표에서 만나요. 잘못 지운 데이터를 몇 시간 전 상태로 되돌릴 수 있는지를 말해요.",
    "ai": "직접 다룰 일은 거의 없어요. 서비스를 열기 전에 쓰는 DB가 이 기능을 지원하는지, 켜져 있는지 확인하세요.",
    "word": "Point-in-Time: 특정한 한 시점\nRecovery: 복구, 되찾음\nPITR: 원하는 시점으로 되돌리는 복구",
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
    "stage": "준비",
    "use": "회사 프로젝트나 호스팅 서비스에서 흔히 쓰는 DB예요. 문서나 이력서에서도 자주 보여서 이름을 알아 두면 좋아요.",
    "ai": "입문 단계에서는 직접 고를 일이 드물어요. AI가 MySQL로 만들었다면 같은 SQL 지식으로 다룰 수 있어요.",
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
    "stage": "준비",
    "use": "무료로 PostgreSQL을 클라우드에서 써 보고 싶을 때 가입하는 서비스예요. 연결 문자열을 받아 앱에 연결해요.",
    "ai": "받은 연결 문자열에 비밀번호가 들어 있어요. 코드에 쓰지 말고 .env에 넣으라고 AI에게 분명히 시키세요.",
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
    "stage": "준비",
    "use": "SQLite로 만든 앱을 클라우드에 올리고 싶을 때 후보로 나와요. 작은 프로젝트의 DB를 호스팅할 곳을 알아볼 때 비교해요.",
    "ai": "입문 단계에서 꼭 쓸 일은 없어요. 앱이 SQLite 기반이라면 \"배포할 때 DB는 어디에 두면 좋을까?\"라고 물어보세요.",
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
    "cmd": true,
    "stage": "준비",
    "use": "배포 서비스가 Dockerfile을 요구하거나, 설치 없이 프로그램을 띄워 보고 싶을 때 만나요. 실행 환경을 통째로 포장해요.",
    "ai": "\"이 앱을 Docker로 실행하는 파일을 만들어 줘\"라고 시키세요. 직접 깊이 다룰 일은 적지만, 실행 오류가 나면 메시지를 붙여 물어보세요.",
    "word": "Docker: 부두 노동자, 짐(컨테이너)을 싣고 내리는 사람",
    "code": "# 도커가 잘 설치됐는지 확인하기\ndocker run hello-world",
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
    "stage": "배포·공유",
    "use": "내가 만든 서버를 인터넷에 올려 둘 때 쓰는 호스팅 서비스예요. GitHub와 연결하면 코드를 올릴 때마다 자동으로 다시 배포돼요.",
    "ai": "\"Render에 배포하려면 설정할 것을 순서대로 알려 줘\"라고 시키세요. 환경변수와 시작 명령을 빠뜨리면 배포가 실패해요.",
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
    "stage": "오류 해결",
    "use": "npm install 도중 빌드 실패와 함께 node-gyp라는 말이 뜰 때 만나요. 컴퓨터에 빌드 도구가 없어서 생기는 오류예요.",
    "ai": "오류 메시지 전체를 AI에게 붙여 넣고 \"내 컴퓨터 환경에 맞는 해결법을 알려 줘\"라고 하세요. 운영체제를 같이 알려 주면 정확해요.",
    "code": "# 네이티브 모듈 빌드 도구 설치하기\nnpm install -g node-gyp",
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
    "stage": "오류 해결",
    "use": "서버를 켰는데 listen EADDRINUSE 메시지가 뜰 때 만나요. 예전에 켠 서버가 아직 안 꺼져서 같은 자리를 쓰고 있다는 뜻이에요.",
    "ai": "\"3000번 포트를 쓰는 프로그램을 찾아서 끄는 방법을 알려 줘\"라고 시키세요. 무엇을 끄는지 확인하고 나서 실행하세요.",
    "word": "Address: 주소\nIn use: 사용 중\nEADDRINUSE: 쓰려는 주소(포트)가 이미 사용 중이라는 오류 이름",
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
    "stage": "실행·확인",
    "use": "앱이 데이터를 불러오지 못할 때 먼저 확인하는 것이 서버가 켜져 있는지예요. 브라우저의 요청을 받아 답을 돌려줘요.",
    "ai": "화면은 뜨는데 데이터가 안 나오면 \"서버가 켜져 있는지, 오류 로그는 없는지 확인해 줘\"라고 시키세요.",
    "word": "Serve: 제공하다, 음식을 내다\nServer: 요청에 응답을 내주는 쪽",
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
    "stage": "만들기",
    "use": "아이디어가 정말 되는지 빠르게 확인하려고 대충 먼저 만들어 볼 때 쓰는 말이에요. 완성도보다 확인이 목적이에요.",
    "ai": "\"가장 핵심 기능만 되는 시제품을 만들어 줘\"라고 시키세요. 시제품을 그대로 서비스로 쓰면 보안이 부족할 수 있어요.",
    "word": "Proto: 처음의, 원형의\nType: 형, 모양\nPrototype: 처음 만든 시험용 모형",
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
    "stage": "배포·공유",
    "use": "서비스를 올린 뒤 호스팅이나 DB의 무료 한도를 확인할 때 만나요. 접속자가 늘면 한도를 넘어 요금이 나올 수 있어요.",
    "ai": "직접 다룰 일은 거의 없어요. 배포한 뒤에는 서비스 화면의 사용량을 가끔 확인하고, 한도 알림을 켜 두세요.",
    "word": "Traffic: 교통, 오가는 흐름",
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
    "stage": "준비",
    "use": "라이브러리를 설치하기 전에 라이선스를 확인할 때 만나요. 코드를 공개해서 누구나 보고 쓰고 고칠 수 있어요.",
    "ai": "AI가 처음 보는 패키지를 깔자고 하면 인기와 관리 상태를 확인하세요. 라이선스가 내 용도에 맞는지도 물어볼 수 있어요.",
    "word": "Open: 열린\nSource: 원천, 소스 코드\nOpen Source: 소스 코드를 공개한 소프트웨어",
    "related": [
      "postgresql",
      "open-weight",
      "library"
    ]
  }
]);

