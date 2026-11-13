// 01-03 퀘스트 시스템 — 교육자료 PDF 기반. 처음 나온 자료에만 두고, 다시 나온 자료는 src에 함께 적는다.
addSection('01-03', "퀘스트 시스템", [
  {
    "id": "pair-programming",
    "term": "Pair Programming",
    "ko": "페어 프로그래밍",
    "full": "",
    "src": "01-03",
    "level": "입문",
    "def": "두 사람이 한 화면에서 함께 코드를 짜는 방식. 드라이버(Driver)는 직접 코드를 치고, 네비게이터(Navigator)는 코드를 함께 보며 방향을 조언한다.",
    "easy": "운전하는 사람과 옆자리에서 길을 알려 주는 사람이 함께 가는 거예요.",
    "ex": "퀘스트에서 Driver는 화면을 공유하며 코드를 치고, Navigator는 키보드에 손대지 않고 방향만 조언해요. 완성한 코드는 GitHub에 올려요.",
    "flow": [],
    "related": [
      "code-review",
      "github"
    ]
  },
  {
    "id": "code-review",
    "term": "Code Review",
    "ko": "코드 리뷰",
    "full": "",
    "src": "01-03 · 02-06",
    "level": "입문",
    "def": "다른 사람이 짠 코드를 동료가 정해진 기준으로 읽고, 버그 가능성과 개선점을 근거와 함께 알려 주는 일. 동료끼리 서로 하면 피어 리뷰(peer review)라고 한다.",
    "easy": "친구가 쓴 글을 기준표를 보며 읽고, 고칠 곳과 잘한 곳을 쪽지로 알려 주는 거예요.",
    "ex": "코드피어리뷰 퀘스트에서 Reviewer는 Coder의 README.md에 문제점·참고 사항·개선점을 적어 전해요. 칭찬도 아끼지 않아요.",
    "flow": [],
    "related": [
      "pair-programming",
      "readme",
      "diff"
    ]
  },
  {
    "id": "readme",
    "term": "README",
    "ko": "리드미 파일",
    "full": "",
    "src": "01-03 · 02-06 · 03-07",
    "level": "입문",
    "def": "저장소 맨 위에 두는 안내 문서. 프로젝트가 무엇이고 왜 만들었는지, 어떻게 쓰는지 적는다. 보통 마크다운(README.md)으로 쓴다.",
    "easy": "새 장난감 상자 맨 위에 놓인 '먼저 읽어 주세요' 설명서예요.",
    "ex": "스킬을 만들어 제출할 때 저장소 최상단 README.md에 어떤 불편을 어떻게 없앴는지 적어요.",
    "flow": [],
    "related": [
      "markdown",
      "git-repository",
      "github",
      "rules-file"
    ]
  }
]);
