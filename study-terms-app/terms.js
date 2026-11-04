// 시작용 20개 용어. 원본은 용어집.md, 카드 구성은 DESIGN.md "용어 하나에 필요한 내용"을 따른다.
// id는 저장된 내 설명과 이어지는 열쇠라서 바꾸지 않는다.
// full: 약어의 영문 풀네임만 쓴다. 풀네임이 없는 용어는 비워 두면 카드에서 그 줄이 숨겨진다.
// 섹션: 핵심 20개는 여기, 자료별 용어는 terms-02-0N.js가 addSection()으로 붙인다.
// 각 용어: id·term·ko·full·src·def·easy(쉬운 비유)·ex(실제 장면)·flow·related·level. 빈 칸은 화면에서 숨긴다.
const TERMS = [
  {
    id: 'genai', no: '001', term: 'GenAI', ko: '생성형 AI', full: 'Generative AI', src: '01-04',
    flow: ['학습한 데이터', '패턴 이해', '새 결과물'],
    def: '글·이미지·코드처럼 새 결과물을 만들어 내는 AI.',
    easy: '말만 하면 새 글이나 그림을 뚝딱 만들어 주는 손재주 좋은 친구 같아요.', level: '입문',
    ex: { title: 'ChatGPT·Claude', body: '요청 한 줄로 이메일 초안이나 웹페이지 코드를 새로 만들어 냅니다.' },
    related: ['hallucination', 'prompt', 'agent'],
  },
  {
    id: 'hallucination', no: '002', term: 'Hallucination', ko: '환각', full: '', src: '01-04',
    flow: ['질문', '그럴듯한 답', '사실 확인'],
    def: 'AI가 없는 사실이나 파일명을 사실처럼 지어내는 현상. 그럴듯함과 정확함은 다르다.',
    easy: '모르는 걸 물으면 아는 척 지어내는 친구처럼, 틀린 걸 진짜처럼 말해요.', level: '입문',
    ex: { title: '없는 함수', body: 'AI가 존재하지 않는 함수를 알려 줘서 실행하면 오류가 납니다. 그래서 결과는 직접 확인해야 합니다.' },
    related: ['genai', 'vibe-coding'],
  },
  {
    id: 'vibe-coding', no: '003', term: 'Vibe coding', ko: '바이브 코딩', full: '', src: '01-04',
    flow: ['의도 말하기', 'AI가 생성', '확인·재지시'],
    def: '만들 것을 말로 설명하면 AI가 코드를 짜고, 사람은 결과를 확인하며 다시 지시하는 개발 방식.',
    easy: '요리사에게 \'매콤한 볶음밥\'이라고 말로 주문하고, 맛보며 고쳐 달라는 것과 같아요.', level: '입문',
    ex: { title: '할 일 앱', body: '"할 일을 추가하고 완료 표시하게 해 줘"라고 말하고, 화면을 직접 눌러 본 뒤 고칠 점을 다시 지시합니다.' },
    related: ['prompt', 'harness', 'commit'],
  },
  {
    id: 'prompt', no: '004', term: 'Prompt', ko: '프롬프트', full: '', src: '02-01',
    flow: ['만들 것', '조건', '지킬 것'],
    def: 'AI에게 보내는 지시문. 만들 것과 조건, 지킬 것을 함께 말한다.',
    easy: '심부름 쪽지예요. 무엇을, 어떻게, 하지 말 것까지 적을수록 정확해져요.', level: '입문',
    ex: { title: '좋은 프롬프트', body: '"신청 버튼을 누르면 남은 자리가 줄게 해 줘. 비밀값은 코드에 넣지 마."' },
    related: ['vibe-coding', 'genai'],
  },
  {
    id: 'agent', no: '005', term: 'Agent', ko: '에이전트', full: '', src: '01-04 · 02-06',
    flow: ['목표', '도구 사용', '결과 확인'],
    def: '목표를 주면 필요한 도구를 골라 쓰고, 결과를 보며 끝까지 해내는 AI.',
    easy: '시키면 알아서 장 보고 요리까지 끝내 오는 똑똑한 심부름꾼이에요.', level: '입문',
    ex: { title: 'Claude Code', body: '"빈 프로젝트 세워 줘" 한마디에 폴더를 만들고, 파일을 쓰고, 실행해서 확인까지 합니다.' },
    related: ['harness', 'agent-loop', 'tool-use'],
  },
  {
    id: 'harness', no: '006', term: 'Harness', ko: '하네스', full: '', src: '02-06',
    flow: ['모델', '하네스', '에이전트'],
    def: 'AI 모델이 실제로 일하도록 감싸 주는 작업 환경. 파일 접근, 도구 권한, 안전장치를 맡는다.',
    easy: '말(모델)에 씌우는 마구처럼, 모델의 힘을 일에 연결하고 안전하게 잡아 줘요.', level: '실전',
    ex: { title: 'Claude Code', body: '모델이 파일을 읽고 명령을 실행하게 해 주고, 위험한 작업은 사용자 승인을 받게 합니다.' },
    related: ['agent', 'tool-use'],
  },
  {
    id: 'agent-loop', no: '007', term: 'Agent loop', ko: '에이전트 루프', full: '', src: '02-06',
    flow: ['계획', '실행', '관찰·반성'],
    def: '계획 → 실행 → 관찰 → 반성을 목표를 이룰 때까지 반복하는 것. 한 번 답하고 끝나는 챗봇과의 차이.',
    easy: '퍼즐 조각을 끼워 보고, 안 맞으면 다시 생각해서 또 끼워 보는 반복이에요.', level: '실전',
    ex: { title: '오류 고치기', body: '코드를 고치고, 실행해 보고, 실패하면 오류를 읽고 다시 고치기를 통과할 때까지 반복합니다.' },
    related: ['agent', 'tool-use'],
  },
  {
    id: 'tool-use', no: '008', term: 'Tool use', ko: '도구 호출', full: '', src: '02-06',
    flow: ['모델 판단', '도구 부르기', '결과 받기'],
    def: '모델이 검색·파일 읽기·코드 실행 같은 바깥 도구를 정해진 방식으로 부르는 것.',
    easy: '계산이 필요할 때 계산기를 꺼내 쓰듯, AI가 필요한 도구를 꺼내 써요.', level: '실전',
    ex: { title: '파일 읽기', body: '"PRD.md 읽어 줘"라고 하면 모델이 파일 읽기 도구를 불러 내용을 가져옵니다.' },
    related: ['mcp', 'harness'],
  },
  {
    id: 'mcp', no: '009', term: 'MCP', ko: '연결 규격', full: 'Model Context Protocol', src: '02-06',
    flow: ['AI 앱', 'MCP', '외부 도구'],
    def: 'AI 앱과 외부 데이터·도구를 같은 방식으로 잇는 표준 규격. "AI를 위한 USB-C".',
    easy: '어떤 기기든 꽂으면 되는 USB-C 단자처럼, AI와 도구를 같은 모양으로 이어 줘요.', level: '실전',
    ex: { title: 'Supabase MCP', body: '연결해 두면 Claude Code가 내 DB에 표와 정책을 직접 만듭니다.' },
    related: ['tool-use', 'skill'],
  },
  {
    id: 'skill', no: '010', term: 'Skill', ko: '스킬', full: '', src: '02-06',
    flow: ['작업 방법 정리', '폴더에 저장', '필요할 때 사용'],
    def: '자주 하는 작업 방법을 한 번 적어 두고 계속 꺼내 쓰는 재사용 설명서. 폴더 하나로 되어 있다.',
    easy: '자주 만드는 요리의 레시피 카드예요. 한 번 적어 두면 계속 꺼내 봐요.', level: '실전',
    ex: { title: 'frontend-design', body: '화면을 만들 때 뻔한 AI 디자인을 피하는 지침을 AI가 따르게 합니다.' },
    related: ['mcp', 'harness'],
  },
  {
    id: 'web-layers', no: '011', term: 'HTML·CSS·JS', ko: '웹페이지의 세 겹', full: 'HyperText Markup Language · Cascading Style Sheets · JavaScript', src: '02-02',
    flow: ['구조 HTML', '표현 CSS', '동작 JS'],
    def: '웹페이지를 구조(HTML)·표현(CSS)·동작(JS) 세 겹으로 나눠 보는 관점. 어디를 고칠지 짚기 쉬워진다.',
    easy: '집으로 치면 HTML은 뼈대, CSS는 벽지와 가구, JS는 전기 스위치예요.', level: '입문',
    ex: { title: '버튼 하나', body: '버튼이 있는 건 HTML, 노란색인 건 CSS, 누르면 저장되는 건 JS 덕분입니다.' },
    related: ['front-back'],
  },
  {
    id: 'front-back', no: '012', term: 'Front / Back', ko: '프론트엔드 / 백엔드', full: 'Frontend / Backend', src: '02-02 · 02-03',
    flow: ['화면', 'API', '서버·DB'],
    def: '사용자가 보고 누르는 쪽이 프론트엔드, 화면 뒤에서 저장·로그인·권한을 처리하는 쪽이 백엔드.',
    easy: '식당에서 손님이 앉는 홀이 프론트엔드, 요리하는 주방이 백엔드예요.', level: '입문',
    ex: { title: '식당', body: '손님이 보는 홀이 프론트엔드, 주문을 받아 요리하는 주방이 백엔드입니다.' },
    related: ['api', 'database', 'web-layers'],
  },
  {
    id: 'api', no: '013', term: 'API', ko: '프로그램 사이의 약속', full: 'Application Programming Interface', src: '02-03',
    flow: ['요청', '처리', '응답'],
    def: '프로그램끼리 기능이나 데이터를 주고받을 때 따르는 약속. 주소·방법·입력·응답 형식을 정한다.',
    easy: '식당 메뉴판이에요. 손님은 메뉴판에 적힌 대로만 주문할 수 있어요.', level: '입문',
    ex: { title: '할 일 저장', body: '화면이 서버 주소로 새 할 일을 보내면, 서버가 저장하고 결과를 돌려줍니다.' },
    related: ['front-back', 'database'],
  },
  {
    id: 'database', no: '014', term: 'Database', ko: '데이터베이스', full: '', src: '02-03 · 02-04',
    flow: ['저장', '조회', '수정·삭제'],
    def: '데이터를 저장해 두고 필요할 때 찾아 꺼내는 저장소. 새로고침해도 데이터가 남게 해 준다.',
    easy: '물건을 칸칸이 정리해 두는 창고예요. 필요할 때 찾아 꺼내요.', level: '입문',
    ex: { title: 'Supabase', body: 'Todo 앱의 할 일이 Supabase 표에 저장돼서, 다시 열어도 그대로 남아 있습니다.' },
    related: ['api', 'auth'],
  },
  {
    id: 'auth', no: '015', term: 'Auth', ko: '인증 / 인가', full: 'Authentication / Authorization', src: '02-04 · 02-05',
    flow: ['로그인', '누구인지 확인', '권한 확인'],
    def: '인증은 누구인지 확인하는 것, 인가는 그 사람에게 무엇을 허용할지 정하는 것.',
    easy: '놀이공원 입구에서 표 확인(인증), 손목띠 색으로 탈 기구 정하기(인가)예요.', level: '실전',
    ex: { title: '수강 신청 앱', body: '로그인(인증)한 사용자라도 남의 신청 내역은 볼 수 없습니다(인가).' },
    related: ['database', 'env'],
  },
  {
    id: 'env', no: '016', term: '.env', ko: '환경변수', full: 'Environment variables', src: '02-04 · 02-05',
    flow: ['비밀값', '.env 파일', '.gitignore'],
    def: 'API 키 같은 비밀값을 코드 밖에 따로 보관하는 자리. Git에 올라가지 않게 막아 둔다.',
    easy: '비밀번호 쪽지를 일기장(코드)에 끼우지 않고 금고에 따로 두는 거예요.', level: '실전',
    ex: { title: 'Supabase 키', body: '키를 .env에 넣고 .gitignore에 등록해서 GitHub에 올라가지 않게 합니다.' },
    related: ['commit', 'deploy', 'auth'],
  },
  {
    id: 'commit', no: '017', term: 'Commit', ko: '커밋', full: '', src: '02-04',
    flow: ['작업', '동작 확인', '커밋'],
    def: '지금 잘 되는 상태에 이름을 붙여 되돌릴 지점을 남기는 기록.',
    easy: '게임의 세이브 포인트예요. 망하면 그 지점부터 다시 할 수 있어요.', level: '입문',
    ex: { title: '바이브 코딩 중', body: '화면이 뜨는 순간 커밋해 두면, AI가 망가뜨려도 그 지점으로 돌아갈 수 있습니다.' },
    related: ['env', 'deploy'],
  },
  {
    id: 'deploy', no: '018', term: 'Deploy', ko: '배포', full: '', src: '02-02 · 02-05',
    flow: ['내 컴퓨터', '호스팅', '공개 주소'],
    def: '내 컴퓨터에서만 보이던 것을 인터넷 주소로 올려 누구나 접속하게 하는 일.',
    easy: '내 방에서 그린 그림을 동네 게시판에 붙여 모두가 보게 하는 거예요.', level: '입문',
    ex: { title: 'GitHub Pages', body: '냥이의 라면가게를 올려 k-im-rose.github.io 주소로 누구나 열 수 있게 했습니다.' },
    related: ['commit', 'env'],
  },
  {
    id: 'prd', no: '019', term: 'PRD', ko: '기획서 한 장', full: 'Product Requirements Document', src: '02-02 · 02-03',
    flow: ['누구의 불편', '무엇을 만들까', '성공 조건'],
    def: '무엇을·누구를 위해·어떤 규칙으로 만들지 정리한 기획서 한 장. 기술 선택은 넣지 않는다.',
    easy: '집을 짓기 전에 그리는 설계도 한 장이에요.', level: '입문',
    ex: { title: '이 용어장', body: '코드보다 먼저 Must 3개, Won\'t 6개, 성공 조건 3개를 PRD에 정했습니다.' },
    related: ['mvp', 'vibe-coding'],
  },
  {
    id: 'mvp', no: '020', term: 'MVP', ko: '최소 작동 버전', full: 'Minimum Viable Product', src: '02-07',
    flow: ['핵심 하나', '끝까지 동작', '써 보고 키우기'],
    def: '사용자가 핵심 결과 하나를 처음부터 끝까지 얻을 수 있는 가장 작은 작동 버전.',
    easy: '자동차 대신 먼저 만든 스케이트보드예요. 작아도 끝까지 굴러가요.', level: '입문',
    ex: { title: '스케이트보드', body: '자동차 바퀴 하나로는 아무 데도 못 가지만, 스케이트보드는 작아도 끝까지 굴러갑니다.' },
    related: ['prd'],
  },
];

const SECTIONS = [{ id: 'core', title: '핵심 20개', note: '시작용', ids: TERMS.map(t => t.id) }];
function addSection(id, title, list) {
  let no = TERMS.length;
  const ids = [];
  for (const t of list) {
    if (TERMS.some(x => x.id === t.id)) continue; // 이미 있는 용어는 건너뛴다
    no += 1;
    TERMS.push({ full: '', flow: [], related: [], ex: '', easy: '', level: '', ...t, no: String(no).padStart(3, '0'), src: t.src || id });
    ids.push(t.id);
  }
  SECTIONS.push({ id, title, ids });
}
