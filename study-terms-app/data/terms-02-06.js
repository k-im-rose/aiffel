// 02-06 에이전트·MCP·스킬 — 교육자료 PDF 기반. 처음 나온 자료에만 두고, 다시 나온 자료는 src에 함께 적는다.
addSection('02-06', "에이전트·MCP·스킬", [
  {
    "id": "token",
    "term": "Token",
    "ko": "토큰",
    "full": "",
    "src": "02-06 · 03-01 · 03-02 · 03-03 · 03-05 · 03-06",
    "level": "입문",
    "def": "AI가 글을 읽고 쓰는 단위이자 요금을 계산하는 단위.",
    "easy": "AI가 글을 읽는 글자 조각이에요. 조각 수만큼 값을 내요.",
    "ex": "에이전트는 채팅보다 토큰을 훨씬 많이 써서 요금이 크게 나올 수 있어요.",
    "flow": [],
    "related": [
      "context-window",
      "agent-loop",
      "agent"
    ]
  },
  {
    "id": "context-window",
    "term": "Context Window",
    "ko": "컨텍스트 창",
    "full": "",
    "src": "02-06 · 03-02 · 03-03 · 03-06",
    "level": "실전",
    "def": "한 번 호출에서 모델이 참고할 수 있는 입력과 출력의 총량 한도.",
    "easy": "AI 책상의 크기예요. 책상이 꽉 차면 더 못 올려요.",
    "ex": "대화가 길어져 컨텍스트 창이 차기 시작하면 AI가 앞내용을 놓쳐요.",
    "flow": [],
    "related": [
      "token",
      "context-rot",
      "agent"
    ]
  },
  {
    "id": "context-rot",
    "term": "Context Rot",
    "ko": "컨텍스트 부패",
    "full": "",
    "src": "02-06",
    "level": "실전",
    "def": "대화가 길어지면 앞서 정한 것을 잊고 앞뒤가 안 맞게 되는 현상.",
    "easy": "이야기가 길어지면 처음 말을 까먹는 것과 같아요.",
    "ex": "한 가지 일이 끝나면 새 대화로 시작해 컨텍스트 부패를 피해요.",
    "flow": [],
    "related": [
      "context-window",
      "token",
      "hallucination"
    ]
  },
  {
    "id": "react-pattern",
    "term": "ReAct",
    "ko": "ReAct",
    "full": "Reasoning + Acting",
    "src": "02-06",
    "level": "심화",
    "def": "생각하고 행동한 뒤 관찰한 결과로 다시 생각하기를 번갈아 하는 방식.",
    "easy": "탐정처럼 단서를 찾고 그 단서로 다음 추리를 해요.",
    "ex": "로그인 오류를 고칠 때 먼저 오류 로그를 읽고 원인을 확인한 뒤 수정해요.",
    "flow": [
      "생각",
      "행동",
      "관찰"
    ],
    "related": [
      "agent-loop",
      "agent",
      "tool-use"
    ]
  },
  {
    "full": "",
    "flow": [],
    "related": [
      "skill",
      "project-root",
      "agent"
    ],
    "ex": "해당 도구가 규칙 파일을 실제로 읽는지 확인해요. 02-06 실습처럼 CLAUDE.md에서 @AGENTS.md로 불러오게 설정하는 방법도 있어요.",
    "easy": "AI에게 주는 우리 집 규칙표예요. 매번 말하지 않아도 돼요.",
    "level": "입문",
    "id": "rules-file",
    "term": "AGENTS.md / CLAUDE.md",
    "ko": "규칙 파일",
    "src": "02-06",
    "def": "프로젝트 규칙과 실행 방법을 적어 AI 코딩 도구가 참고하게 하는 파일이에요. 지원하는 파일명과 읽는 범위는 도구·버전·설정마다 달라요."
  },
  {
    "id": "progressive-disclosure",
    "term": "Progressive Disclosure",
    "ko": "점진 공개",
    "full": "",
    "src": "02-06",
    "level": "심화",
    "def": "평소엔 스킬의 이름과 설명만 읽다가 필요할 때만 본문을 읽는 구조.",
    "easy": "책 목차만 훑다가 필요한 쪽만 펼쳐 읽는 것과 같아요.",
    "ex": "SKILL.md의 description만 보고 AI가 지금 이 스킬을 꺼낼지 판단해요.",
    "flow": [
      "이름만 읽기",
      "맞으면 호출",
      "본문 읽기"
    ],
    "related": [
      "skill",
      "token",
      "rules-file"
    ]
  },
  {
    "id": "subagent",
    "term": "Subagent",
    "ko": "서브에이전트",
    "full": "",
    "src": "02-06",
    "level": "심화",
    "def": "지휘하는 AI가 하위 AI에게 일을 나눠 맡기고 요약만 받는 방식.",
    "easy": "대장이 부하에게 조사를 시키고 보고서만 받는 것과 같아요.",
    "ex": "하위 AI가 따로 조사한 뒤 요약만 돌려줘서 메인 대화가 덜 길어져요.",
    "flow": [
      "일 나누기",
      "따로 작업",
      "요약 받기"
    ],
    "related": [
      "agent",
      "token",
      "plugin"
    ]
  },
  {
    "id": "slash-command",
    "term": "Slash Command",
    "ko": "슬래시 명령",
    "full": "",
    "src": "02-06 · 02-07",
    "level": "실전",
    "def": "슬래시로 시작해 정해진 동작을 바로 부르는 단축 명령.",
    "easy": "자주 쓰는 일을 한 번에 부르는 단축키예요.",
    "ex": "Claude Code에서 /plugin install로 플러그인을 설치해요.",
    "flow": [],
    "related": [
      "plugin",
      "hook",
      "cli"
    ]
  },
  {
    "id": "hook",
    "term": "Hook",
    "ko": "훅",
    "full": "",
    "src": "02-06",
    "level": "심화",
    "def": "정해진 순간에 자동으로 실행되는 동작.",
    "easy": "문이 열릴 때 자동으로 울리는 초인종 같아요.",
    "ex": "특정 작업 전후에 자동으로 검사를 돌리도록 훅을 걸어요.",
    "flow": [],
    "related": [
      "slash-command",
      "plugin",
      "harness"
    ]
  },
  {
    "id": "plugin",
    "term": "Plugin",
    "ko": "플러그인",
    "full": "",
    "src": "02-06 · 02-07",
    "level": "실전",
    "def": "스킬, 서브에이전트, 슬래시 명령, 훅, MCP 연결을 한 꾸러미로 묶은 것.",
    "easy": "도구를 한 상자에 담은 세트예요. 상자째 설치해요.",
    "ex": "팀의 코드 리뷰 방식을 플러그인으로 묶어 설치 한 번으로 공유해요.",
    "flow": [],
    "related": [
      "skill",
      "slash-command",
      "hook"
    ]
  },
  {
    "id": "permission-mode",
    "term": "Permission Mode",
    "ko": "권한 모드",
    "full": "",
    "src": "02-06",
    "level": "실전",
    "def": "AI가 행동 전 얼마나 사람에게 물을지 정하는 방식.",
    "easy": "심부름 전에 매번 물을지 알아서 할지 정하는 규칙이에요.",
    "ex": "중요한 폴더에서는 매번 확인 모드로 두고 자동 수락은 켜지 않아요.",
    "flow": [],
    "related": [
      "harness",
      "tool-use",
      "commit"
    ]
  },
  {
    "id": "read-only",
    "term": "Read-only",
    "ko": "읽기 전용 연결",
    "full": "",
    "src": "02-06",
    "level": "입문",
    "def": "데이터를 조회만 하고 쓰기나 삭제는 하지 못하게 연결하는 것.",
    "easy": "구경만 하고 만지지는 못하는 전시관 같아요.",
    "ex": "MCP는 먼저 읽기 도구부터 연결하고 삭제와 배포는 승인을 받게 해요.",
    "flow": [],
    "related": [
      "mcp",
      "auth",
      "database"
    ]
  },
  {
    "id": "mcp-server",
    "term": "MCP Server",
    "ko": "MCP 서버",
    "full": "",
    "src": "02-06",
    "level": "실전",
    "def": "Notion이나 파일 시스템 같은 바깥 기능을 MCP 방식으로 내놓는 쪽.",
    "easy": "여러 도구를 같은 콘센트 모양으로 맞춰 주는 어댑터예요.",
    "ex": "공식 레지스트리에서 찾되 검증 안 된 서버는 함부로 붙이지 않아요.",
    "flow": [],
    "related": [
      "mcp",
      "read-only",
      "tool-use"
    ]
  },
  {
    "id": "open-weight",
    "term": "Open-weight Model",
    "ko": "오픈웨이트 모델",
    "full": "",
    "src": "02-06 · 03-03 · 03-05 · 03-06",
    "level": "심화",
    "def": "가중치를 공개해 내 컴퓨터에서도 돌릴 수 있는 모델.",
    "easy": "요리법을 공개해서 누구나 집에서 만들 수 있는 음식 같아요.",
    "ex": "오픈웨이트라도 공짜는 아니라서 실행 비용과 라이선스를 확인해요.",
    "flow": [],
    "related": [
      "local-model",
      "token",
      "genai"
    ]
  },
  {
    "full": "",
    "flow": [],
    "related": [
      "open-weight",
      "genai",
      "token"
    ],
    "ex": "계약서 같은 민감한 자료는 로컬 모델로, 어려운 작업은 클라우드로 나눠 써요.",
    "easy": "모델 계산을 내 컴퓨터에서 해요. 모델 파일이 준비돼 있으면 오프라인으로도 쓸 수 있지만, 연결한 검색·도구·클라우드 기능은 데이터를 밖으로 보낼 수 있어요.",
    "level": "실전",
    "id": "local-model",
    "term": "Local Model",
    "ko": "로컬 모델",
    "src": "02-06 · 03-03",
    "def": "Ollama 같은 도구로 내 컴퓨터에서 직접 돌리는 AI 모델."
  },
  {
    "id": "spec-driven",
    "term": "Spec-driven Development",
    "ko": "명세 주도 개발",
    "full": "",
    "src": "02-06 · 02-07",
    "level": "심화",
    "def": "코드 전에 요구사항, 설계, 할 일을 문서로 정하고 AI가 그대로 만들게 하는 방식.",
    "easy": "레고 설명서를 먼저 만들고 그대로 조립하는 방식이에요.",
    "ex": "PRD를 먼저 쓰고 AI가 문서를 보며 단계별로 구현하게 해요.",
    "flow": [
      "명세 쓰기",
      "계획 짜기",
      "구현"
    ],
    "related": [
      "prd",
      "vibe-coding",
      "rules-file"
    ]
  },
  {
    "id": "ide",
    "term": "IDE",
    "ko": "코드 편집기",
    "full": "Integrated Development Environment",
    "src": "02-06",
    "level": "입문",
    "def": "코드를 쓰고 고치고 실행하는 도구가 모인 편집기.",
    "easy": "코딩 전용 작업대예요. 도구가 다 모여 있어요.",
    "ex": "Cursor 같은 편집기형 도구는 AI가 고친 부분을 눈으로 보고 승인해요.",
    "flow": [],
    "related": [
      "terminal",
      "harness",
      "agent"
    ]
  },
  {
    "id": "gh-cli",
    "term": "gh",
    "ko": "GitHub CLI",
    "full": "GitHub CLI",
    "src": "02-06",
    "level": "실전",
    "def": "GitHub 작업을 명령줄에서 하게 해 주는 공식 도구.",
    "easy": "GitHub 심부름을 글자 명령으로 시키는 리모컨이에요.",
    "ex": "AI에게 gh로 이슈 목록을 가져오라고 요청해요.",
    "flow": [],
    "related": [
      "cli",
      "skill",
      "mcp"
    ]
  },
  {
    "id": "project-root",
    "term": "Project Root",
    "ko": "프로젝트 루트",
    "full": "",
    "src": "02-06",
    "level": "입문",
    "def": "프로젝트 폴더의 맨 위 위치.",
    "easy": "집으로 치면 현관이에요. 모든 방으로 가는 출발점이에요.",
    "ex": "루트에 규칙 파일을 두고 터미널 명령도 루트에서 실행해요.",
    "flow": [],
    "related": [
      "rules-file",
      "terminal",
      "diff"
    ]
  },
  {
    "id": "loop-statement",
    "term": "Loop (while)",
    "ko": "반복문",
    "full": "",
    "src": "02-06",
    "level": "입문",
    "def": "조건이 맞는 동안 같은 코드를 되풀이해 실행하는 문법.",
    "easy": "\"다 먹을 때까지 한 숟갈 더\"처럼, 끝날 조건이 될 때까지 같은 일을 계속해요.",
    "ex": "에이전트는 반복문처럼 목표를 이룰 때까지 계획-실행-관찰-반성을 되풀이해요.",
    "flow": [],
    "related": [
      "agent-loop",
      "agent",
      "react-pattern"
    ]
  },
  {
    "id": "single-multi-turn",
    "term": "Single-turn / Multi-turn",
    "ko": "단일 턴 / 멀티턴",
    "full": "",
    "src": "02-06",
    "level": "입문",
    "def": "단일 턴은 한 번 묻고 한 번 답하면 끝나는 대화, 멀티턴은 앞서 주고받은 내용을 이어 가는 대화.",
    "easy": "단일 턴은 쪽지 한 장 주고받기, 멀티턴은 앞 얘기를 기억하며 이어 가는 수다예요.",
    "ex": "초기 GPT는 단일 턴이라 방금 한 말도 기억 못 했고, ChatGPT부터 멀티턴 대화로 코드를 부탁할 수 있게 됐어요.",
    "flow": [],
    "related": [
      "context-window",
      "llm",
      "agent"
    ]
  },
  {
    "id": "code-completion",
    "term": "Code Completion",
    "ko": "코드 자동완성",
    "full": "",
    "src": "02-06",
    "level": "입문",
    "def": "편집기에서 쓰고 있는 코드의 다음 줄이나 나머지를 AI가 미리 채워 주는 기능.",
    "easy": "휴대폰 자판이 다음 단어를 추천하듯, 코드 다음 줄을 추천해 줘요.",
    "ex": "GitHub Copilot은 처음에 다음 줄을 채워 주는 자동완성으로 시작했어요.",
    "flow": [],
    "related": [
      "ide",
      "agent",
      "vibe-coding"
    ]
  },
  {
    "id": "registry",
    "term": "Registry",
    "ko": "레지스트리",
    "full": "",
    "src": "02-06",
    "level": "실전",
    "def": "패키지나 MCP 서버처럼 내려받아 쓸 것들을 등록해 두고 찾게 하는 공식 목록 저장소.",
    "easy": "앱스토어처럼 한곳에 모아 둔 목록에서 골라 받는 곳이에요.",
    "ex": "붙일 MCP 서버는 공식 MCP 레지스트리에서 찾고, 회사가 직접 낸 공식 서버부터 써요.",
    "flow": [],
    "related": [
      "mcp-server",
      "npm",
      "plugin-marketplace"
    ]
  },
  {
    "id": "browser-automation",
    "term": "Browser Automation",
    "ko": "브라우저 자동화",
    "full": "",
    "src": "02-06",
    "level": "실전",
    "def": "프로그램이 실제 웹브라우저를 열어 클릭·입력·화면 캡처를 대신 하게 하는 것. Playwright가 대표 도구.",
    "easy": "로봇 손이 마우스와 키보드를 대신 눌러 주는 거예요.",
    "ex": "Playwright MCP를 붙이면 AI가 브라우저로 내 앱을 열어 버튼을 눌러 보고 화면을 확인해요.",
    "flow": [],
    "related": [
      "mcp-server",
      "tool-use",
      "web-scraping"
    ]
  },
  {
    "id": "web-scraping",
    "term": "Web Scraping",
    "ko": "스크래핑",
    "full": "",
    "src": "02-06",
    "level": "실전",
    "def": "웹페이지를 읽어 필요한 정보만 뽑아 데이터로 정리하는 일.",
    "easy": "전단지에서 가격만 오려 공책에 붙이는 일을 컴퓨터가 대신해요.",
    "ex": "웹사이트를 훑어 상품·가격·이미지를 표로 정리해 달라고 자연어로 시켜요. 사이트 이용 규칙은 먼저 확인해요.",
    "flow": [],
    "related": [
      "browser-automation",
      "mcp-server",
      "json"
    ]
  },
  {
    "id": "re-prompting",
    "term": "Re-prompting",
    "ko": "재프롬프트",
    "full": "",
    "src": "02-06",
    "level": "입문",
    "def": "같은 작업 설명을 매번 처음부터 다시 적어 AI에게 시키는 문제. 지겹고 결과도 그때그때 달라진다.",
    "easy": "새 짝꿍에게 매일 아침 똑같은 규칙을 처음부터 다시 설명하는 거예요.",
    "ex": "\"우리 말투로 다듬어 줘\"를 매번 설명하는 대신 스킬로 한 번 적어 둬요.",
    "flow": [],
    "related": [
      "skill",
      "prompt",
      "rules-file"
    ]
  },
  {
    "id": "frontmatter",
    "term": "Frontmatter",
    "ko": "프론트매터(머리말)",
    "full": "",
    "src": "02-06",
    "level": "실전",
    "def": "파일 맨 위 --- 사이에 이름·설명 같은 정보를 적어 두는 머리말 부분.",
    "easy": "공책 표지에 적은 이름표예요. 표지만 보고 무슨 공책인지 알아요.",
    "ex": "SKILL.md 프론트매터의 name·description만 보고 AI가 언제 이 스킬을 꺼낼지 판단해요.",
    "flow": [],
    "related": [
      "skill",
      "progressive-disclosure",
      "rules-file"
    ]
  },
  {
    "id": "byok-byom",
    "term": "BYOK / BYOM",
    "ko": "내 키·내 모델 쓰기",
    "full": "Bring Your Own Key / Bring Your Own Model",
    "src": "02-06",
    "level": "실전",
    "def": "도구는 그대로 쓰고, AI 모델 API 키나 쓸 모델은 사용자가 직접 골라 연결하는 방식.",
    "easy": "놀이기구는 빌리고 건전지는 내 것을 끼우는 거예요.",
    "ex": "Cline처럼 BYOK 도구는 프로그램은 무료지만 내 API 키로 쓴 만큼 요금이 나가요.",
    "flow": [],
    "related": [
      "api-key",
      "harness",
      "open-weight"
    ]
  },
  {
    "id": "fork",
    "term": "Fork",
    "ko": "포크",
    "full": "",
    "src": "02-06",
    "level": "실전",
    "def": "남의 프로젝트(저장소)를 통째로 복사해 따로 고쳐 나가는 것.",
    "easy": "친구 레시피를 베껴 와서 내 입맛대로 바꾼 새 레시피예요.",
    "ex": "Cursor는 VS Code를 포크해 AI 기능을 넣은 편집기예요.",
    "flow": [],
    "related": [
      "git-repository",
      "github",
      "ide"
    ]
  },
  {
    "id": "frontier-model",
    "term": "Frontier Model",
    "ko": "프런티어 모델",
    "full": "",
    "src": "02-06",
    "level": "입문",
    "def": "그 시점에 가장 앞선 성능을 내는 최첨단 최상위 AI 모델.",
    "easy": "달리기 대회에서 맨 앞에서 뛰는 선두 그룹이에요.",
    "ex": "오픈웨이트 모델이 코딩 실력에서 프런티어 모델에 바짝 붙었지만, 가장 어려운 벤치마크 최상단은 아직 폐쇄 모델이에요.",
    "flow": [],
    "related": [
      "open-weight",
      "llm",
      "benchmark"
    ]
  },
  {
    "id": "benchmark",
    "term": "Benchmark",
    "ko": "벤치마크",
    "full": "",
    "src": "02-06 · 03-06",
    "level": "실전",
    "def": "같은 문제 세트로 성능을 재서 모델이나 도구를 비교하는 시험. SWE-bench Verified는 실제 코드 이슈 해결로 코딩 실력을 잰다.",
    "easy": "모두 같은 시험지로 시험을 보고 점수를 비교하는 거예요.",
    "ex": "벤치마크 점수는 모델뿐 아니라 하네스에 따라서도 크게 달라지니, 내 작업에서 직접 시험해 봐요.",
    "flow": [],
    "related": [
      "frontier-model",
      "harness",
      "open-weight"
    ]
  },
  {
    "id": "plan-act-mode",
    "term": "Plan / Act Mode",
    "ko": "계획 모드 / 실행 모드",
    "full": "",
    "src": "02-06 · 02-07",
    "level": "실전",
    "def": "AI가 먼저 계획만 세워 보여 주고, 사람이 확인한 뒤에 실제 수정·실행으로 넘어가게 나눈 작업 방식.",
    "easy": "요리하기 전에 순서를 먼저 말해 보고, \"좋아\" 하면 그때 불을 켜는 거예요.",
    "ex": "Claude Code에서 /plan을 치고 PRD를 붙여 넣어, 코드 전에 저장할 데이터와 정원 지키는 방법부터 계획하게 해요.",
    "flow": [],
    "related": [
      "permission-mode",
      "prd",
      "agent-loop"
    ]
  },
  {
    "id": "agent-team",
    "term": "Agent Team",
    "ko": "에이전트 팀",
    "full": "",
    "src": "02-06",
    "level": "심화",
    "def": "지휘하는 AI가 조사·구현·검증 같은 일을 여러 전문 에이전트에게 나눠 병렬로 맡기고 조율하는 방식(오케스트레이션).",
    "easy": "반장이 모둠 친구들에게 역할을 나눠 주고 결과를 모으는 거예요.",
    "ex": "편하지만 토큰을 훨씬 많이 써서, 처음엔 에이전트 하나로 충분해요.",
    "flow": [],
    "related": [
      "subagent",
      "agent",
      "token"
    ]
  },
  {
    "id": "plugin-marketplace",
    "term": "Plugin Marketplace",
    "ko": "플러그인 마켓플레이스",
    "full": "",
    "src": "02-06 · 02-07",
    "level": "실전",
    "def": "플러그인을 모아 둔 목록으로, 등록해 두면 그 안의 플러그인을 골라 설치할 수 있다.",
    "easy": "장난감 가게를 먼저 찾아 두면, 거기서 원하는 장난감을 골라 살 수 있어요.",
    "ex": "/plugin marketplace add로 마켓플레이스를 등록한 뒤 frontend-design 플러그인을 켜요.",
    "flow": [],
    "related": [
      "plugin",
      "registry",
      "skill"
    ]
  },
  {
    "id": "compound-engineering",
    "term": "Compound Engineering",
    "ko": "컴파운드 엔지니어링",
    "full": "",
    "src": "02-06",
    "level": "심화",
    "def": "일할 때마다 얻은 교훈을 규칙 파일·스킬로 남겨, 다음 일이 이전 일 위에 쌓이게 하는 개발 방식.",
    "easy": "틀린 문제를 오답 노트에 적어 두면 다음 시험이 점점 쉬워지는 것과 같아요.",
    "ex": "버그를 한 번 고치면 그 교훈을 AGENTS.md에 적어 AI가 다음부터 스스로 지키게 해요.",
    "flow": [],
    "related": [
      "rules-file",
      "skill",
      "agent"
    ]
  },
  {
    "id": "ralph-loop",
    "term": "Ralph Loop",
    "ko": "랄프 루프",
    "full": "",
    "src": "02-06",
    "level": "심화",
    "def": "같은 스펙을 에이전트에게 계속 다시 주고, 한 번에 한 가지씩 하고 커밋하기를 목표까지 반복하게 설계하는 방식. 진행 상황은 대화가 아니라 파일과 git에 쌓는다.",
    "easy": "숙제 목록을 보며 한 칸씩 끝내고 체크하기를 다 할 때까지 되풀이하는 거예요.",
    "ex": "스펙 파일과 git 기록을 근거로 매 바퀴를 돌리고, 멈출 기준과 검토는 사람이 정해요.",
    "flow": [],
    "related": [
      "agent-loop",
      "context-rot",
      "spec-driven"
    ]
  },
  {
    "id": "entry-point",
    "term": "Entry Point",
    "ko": "진입점",
    "full": "",
    "src": "02-06",
    "level": "실전",
    "def": "프로그램을 실행할 때 처음 불리는 파일이나 함수. 같은 로직에 다른 입구를 하나 더 달 수 있다.",
    "easy": "건물로 들어가는 문이에요. 정문 말고 옆문을 하나 더 달 수도 있어요.",
    "ex": "기존 Todo 로직을 재사용해 node todo.js list처럼 터미널에서 부를 진입점만 얇게 더해요.",
    "flow": [],
    "related": [
      "cli",
      "nodejs",
      "package-json"
    ]
  },
  {
    "id": "npx",
    "term": "npx",
    "ko": "엔피엑스",
    "full": "",
    "src": "02-06",
    "level": "실전",
    "def": "npm 패키지에 든 명령을 따로 전역 설치하지 않고 바로 실행하는 도구.",
    "easy": "장난감을 사지 않고 잠깐 빌려서 한 번 갖고 노는 거예요.",
    "ex": "MCP 설정에 \"command\": \"npx\"를 적어 파일시스템 MCP 서버를 바로 실행해요.",
    "flow": [],
    "related": [
      "npm",
      "nodejs",
      "mcp-server"
    ]
  },
  {
    "id": "binary-file",
    "term": "Binary File",
    "ko": "이진 파일",
    "full": "",
    "src": "02-06",
    "level": "실전",
    "def": "사람이 읽는 글자가 아니라 0과 1의 데이터로 저장돼, 그 형식을 아는 프로그램으로만 제대로 읽을 수 있는 파일.",
    "easy": "암호 상자예요. 맞는 열쇠(프로그램)가 있어야 안을 읽을 수 있어요.",
    "ex": "todo.db는 이진 파일이라 파일을 읽는 MCP로는 내용을 세지 못하고, 앱 명령을 돌려야 해요.",
    "flow": [],
    "related": [
      "sqlite",
      "database",
      "cli"
    ]
  },
  {
    "id": "lint",
    "term": "Lint",
    "ko": "린트",
    "full": "",
    "src": "02-06",
    "level": "실전",
    "def": "코드를 실행하기 전에 오류 가능성이나 팀 규칙(컨벤션) 위반을 자동으로 찾아 주는 검사.",
    "easy": "받아쓰기 공책을 선생님이 빨간 펜으로 미리 훑어 주는 거예요.",
    "ex": "코드를 고칠 때마다 팀 린트·컨벤션을 다시 알려 주는 일은 좋은 스킬 후보예요.",
    "flow": [],
    "related": [
      "skill",
      "rules-file",
      "build"
    ]
  }
]);

