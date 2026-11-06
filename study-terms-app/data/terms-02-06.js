// 02-06 에이전트·MCP·스킬 — 교육자료 PDF 기반. 처음 나온 자료에만 두고, 다시 나온 자료는 src에 함께 적는다.
addSection('02-06', "에이전트·MCP·스킬", [
  {
    "id": "token",
    "term": "Token",
    "ko": "토큰",
    "full": "",
    "src": "02-06 · 03-01 · 03-02",
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
    "src": "02-06 · 03-02",
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
    "src": "02-06",
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
    "src": "02-06",
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
    "src": "02-06",
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
    "src": "02-06",
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
  }
]);

