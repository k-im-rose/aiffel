// 03-02 트랜스포머와 언어 모델 — 교육자료 PDF 기반. 처음 나온 자료에만 두고, 다시 나온 자료는 src에 함께 적는다.
addSection('03-02', "트랜스포머와 언어 모델", [
  {
    "full": "Convolutional Neural Network",
    "flow": [],
    "related": [
      "neural-network",
      "skip-connection",
      "transformer"
    ],
    "ex": "손글씨 숫자 인식은 CNN의 초기 대표 활용 사례예요. LeCun 등의 1989년 연구가 있고, 이후 수표 판독 같은 실제 업무에도 활용됐어요.",
    "easy": "돋보기 하나로 사진을 구석구석 훑으며 '여기 동그라미 있다, 여기 모서리 있다' 찾는 거예요.",
    "level": "실전",
    "id": "cnn",
    "term": "CNN",
    "ko": "합성곱 신경망",
    "def": "작은 필터를 이동시키며 국소 무늬를 찾는 신경망이에요. 같은 필터를 여러 위치에 재사용해 파라미터를 줄이고 비슷한 무늬를 찾아요.",
    "src": "03-02 · 03-05"
  },
  {
    "id": "relu",
    "term": "ReLU",
    "ko": "렐루 (활성화 함수)",
    "full": "Rectified Linear Unit",
    "level": "심화",
    "def": "층의 계산 결과가 음수면 0으로 누르고 양수면 그대로 통과시키는 활성화 함수. 이 꺾임이 없으면 층을 아무리 쌓아도 전체가 하나의 직선처럼 뭉개진다.",
    "easy": "빼기 점수는 0점으로 치고, 더하기 점수만 그대로 적는 채점 규칙이에요.",
    "ex": "2012년 이미지 대회에서 딥러닝을 부활시킨 신경망이 ReLU를 써서 학습이 잘됐어요.",
    "flow": [],
    "related": ["neural-network", "cnn"]
  },
  {
    "id": "dropout",
    "term": "Dropout",
    "ko": "드롭아웃",
    "full": "",
    "level": "심화",
    "def": "학습할 때마다 뉴런 일부를 무작위로 꺼서 0만 내보내게 하는 방법. 특정 뉴런에 답을 외워 넣지 못하게 해 과적합을 막는다.",
    "easy": "모둠 숙제를 할 때마다 몇 명을 랜덤으로 쉬게 해서, 한 친구에게만 기대지 않게 하는 거예요.",
    "ex": "학습 중에만 뉴런을 끄고, 실제로 쓸 때는 모든 뉴런을 켜요.",
    "flow": [],
    "related": ["overfitting", "neural-network"]
  },
  {
    "id": "overfitting",
    "term": "Overfitting",
    "ko": "과적합",
    "full": "",
    "level": "실전",
    "def": "모델이 훈련 데이터를 이해하는 대신 통째로 외워서, 훈련 성적은 좋은데 처음 보는 데이터에서는 무너지는 현상.",
    "easy": "문제집 답만 외워서 같은 문제는 다 맞히는데, 숫자만 바뀌면 못 푸는 거예요.",
    "ex": "훈련 정확도는 99%인데 시험 데이터 정확도가 70%라면 과적합을 의심해요.",
    "flow": [],
    "related": ["generalization", "dropout", "training"]
  },
  {
    "full": "",
    "flow": [],
    "related": [
      "gradient",
      "backpropagation",
      "skip-connection",
      "rnn"
    ],
    "ex": "역전파 중 기울기가 아주 작아지면 앞쪽 층이 거의 학습하지 못할 수 있어요. RNN에서는 시간 축을 따라 같은 문제가 생겨요. 깊은 모델의 훈련 성능 저하가 항상 기울기 소실 때문인 것은 아니에요.",
    "easy": "귓속말 전달 놀이에서 줄이 너무 길면 맨 앞 사람에게는 말이 거의 안 들리는 거예요.",
    "level": "심화",
    "id": "vanishing-gradient",
    "term": "Vanishing Gradient",
    "ko": "기울기 소실",
    "def": "층이 깊어지면 출력 쪽에서 계산한 학습 신호(기울기)가 앞쪽 층까지 거슬러 오는 동안 거의 0으로 사라지는 문제. 1보다 작은 값이 여러 번 곱해지기 때문이다.",
    "src": "03-02"
  },
  {
    "full": "Residual Connection",
    "flow": [
      "입력 x",
      "층이 잔차 F(x) 계산",
      "F(x) + x 출력"
    ],
    "related": [
      "vanishing-gradient",
      "cnn",
      "transfer-learning"
    ],
    "ex": "ResNet은 152층 모델도 학습할 수 있음을 보였어요. ResNet 앙상블은 ILSVRC 2015 분류 과제의 ImageNet 테스트에서 top-5 오류율 3.57%를 기록했어요.",
    "easy": "계단으로만 가면 지치니까 옆에 미끄럼틀 지름길을 놓아 준 거예요.",
    "level": "심화",
    "id": "skip-connection",
    "term": "Skip Connection",
    "ko": "잔차 연결 (건너뛰기 연결)",
    "def": "입력을 몇 개 층을 건너뛰어 출력에 그대로 더해 주는 지름길. 층은 나머지(잔차)만 배우면 되고, 학습 신호가 깎이지 않고 앞쪽 층까지 흐른다. 이 구조로 만든 신경망이 ResNet이다.",
    "src": "03-01 · 03-02"
  },
  {
    "full": "",
    "flow": [],
    "related": [
      "embedding",
      "vector"
    ],
    "ex": "03-02의 단어 유사도 실습 출력에서는 ‘바다–해변’이 76.7점, ‘바다–고양이’가 13.7점이었어요. 사용한 임베딩 모델과 점수 환산에 따른 예시 값이에요.",
    "easy": "두 화살표가 같은 쪽을 가리키는지 보는 거예요. 길이는 달라도 방향이 같으면 '비슷하다'예요.",
    "level": "실전",
    "id": "cosine-similarity",
    "term": "Cosine Similarity",
    "ko": "코사인 유사도",
    "def": "두 벡터가 이루는 각도로 얼마나 비슷한지 재는 값. 같은 방향이면 크고, 다른 방향이면 작다.",
    "src": "03-02"
  },
  {
    "id": "rnn",
    "term": "RNN",
    "ko": "순환 신경망",
    "full": "Recurrent Neural Network",
    "level": "실전",
    "def": "단어를 앞에서 뒤로 하나씩 읽으며, 지금까지 읽은 내용을 요약한 기억(은닉 상태)을 다음 단어로 넘기는 신경망. 문장이 길면 앞 정보가 흐려지고, 순서대로만 계산해 병렬 처리가 어렵다.",
    "easy": "책을 한 줄씩 읽으며 머릿속 메모를 고쳐 쓰는 거예요. 책이 길면 앞 내용을 까먹어요.",
    "ex": "'나는 어제 도서관에서 책을 빌렸다'에서 '빌렸다'까지 가는 동안 '나는'을 잊지 않아야 해요.",
    "flow": ["단어 하나 읽기", "은닉 상태 갱신", "다음 단어로"],
    "related": ["lstm", "vanishing-gradient", "encoder-decoder", "transformer"]
  },
  {
    "id": "lstm",
    "term": "LSTM",
    "ko": "장단기 메모리",
    "full": "Long Short-Term Memory",
    "level": "심화",
    "def": "RNN 옆에 셀 상태라는 장기 기억 통로를 두고, 무엇을 기억·잊기·내보낼지 게이트로 조절하는 신경망. 앞 정보를 RNN보다 멀리 나르지만, 순서대로 처리하는 한계는 그대로다.",
    "easy": "메모장에 '이건 꼭 기억, 이건 지워도 됨' 스티커를 붙여 가며 읽는 거예요.",
    "ex": "트랜스포머가 나오기 전 번역기에 많이 쓰였고, 지금은 순차 처리가 느려 잘 쓰지 않아요.",
    "flow": [],
    "related": ["rnn", "skip-connection", "transformer"]
  },
  {
    "full": "",
    "flow": [
      "인코더가 입력 읽기",
      "뜻 전달",
      "디코더가 출력 생성"
    ],
    "related": [
      "rnn",
      "attention",
      "transformer",
      "bert",
      "gpt"
    ],
    "ex": "트랜스포머도 왼쪽 기둥이 인코더, 오른쪽 기둥이 디코더예요. BERT는 인코더만, GPT는 디코더만 남겼어요.",
    "easy": "통역사가 연설을 듣고(인코더) 다른 말로 다시 말해 주는(디코더) 거예요.",
    "level": "실전",
    "id": "encoder-decoder",
    "term": "Encoder-Decoder",
    "ko": "인코더-디코더",
    "def": "인코더가 입력 문장을 읽어 뜻을 압축하고, 디코더가 그것을 실마리로 출력 문장을 한 단어씩 만드는 구조. 처음에는 문장 전체를 벡터 하나(문맥 벡터)에 담아, 문장이 길면 앞부분이 뭉개졌다(고정벡터 병목).",
    "src": "03-02"
  },
  {
    "id": "attention",
    "src": "03-02 · 03-05",
    "term": "Attention",
    "ko": "어텐션",
    "full": "",
    "level": "실전",
    "def": "토큰 하나를 처리할 때 다른 토큰들을 둘러보며 '지금 누구를 얼마나 참고할지' 가중치를 매기고, 그 비율대로 정보를 섞는 방법. 원문 전체를 벡터 하나로 줄이던 병목을 깼다.",
    "easy": "숙제할 때 교과서 전체를 펼쳐 두고, 지금 문제에 필요한 쪽을 골라 더 오래 보는 거예요.",
    "ex": "'학교'를 번역할 차례면 원문의 'school'에 큰 가중치가 실려요. 2017년 논문 'Attention Is All You Need'가 어텐션만으로 트랜스포머를 만들었어요.",
    "flow": [],
    "related": ["query-key-value", "transformer", "multi-head-attention", "encoder-decoder"]
  },
  {
    "full": "",
    "flow": [],
    "related": [
      "attention",
      "multi-head-attention",
      "llm",
      "encoder-decoder"
    ],
    "ex": "GPT·Claude 같은 LLM, 이미지 모델(ViT), 음성 인식(Whisper)이 모두 트랜스포머 위에 서 있어요.",
    "easy": "한 명씩 차례로 말하던 회의를, 모두가 서로를 동시에 볼 수 있는 원탁 회의로 바꾼 거예요.",
    "level": "실전",
    "id": "transformer",
    "term": "Transformer",
    "ko": "트랜스포머",
    "def": "어텐션을 중심으로 토큰 사이의 관계를 계산하는 신경망 구조예요. 원형은 RNN·CNN 없이 어텐션과 피드포워드 층 등을 사용해요. 학습 때 여러 위치를 병렬 계산할 수 있지만, GPT식 생성은 보통 토큰을 차례로 만들어요.",
    "src": "03-02 · 03-05"
  },
  {
    "id": "query-key-value",
    "term": "Query / Key / Value",
    "ko": "쿼리 / 키 / 밸류 (Q·K·V)",
    "full": "",
    "level": "심화",
    "def": "어텐션이 쓰는 세 가지 벡터. Query는 지금 토큰이 묻는 것, Key는 다른 토큰이 내미는 단서, Value는 실제로 가져올 정보다. 모든 Q를 모든 K와 맞대 점수를 내고, softmax로 비율을 정해 V를 섞는다.",
    "easy": "도서관에서 질문 카드(Q)를 책마다 붙은 색인표(K)에 맞춰 보고, 잘 맞는 책의 내용(V)을 많이 가져오는 거예요.",
    "ex": "'은행에 예금했다'에서는 '예금'이, '강가의 은행나무'에서는 '강가'와 '나무'가 강한 단서가 되어 같은 '은행'을 다르게 읽어요.",
    "flow": ["Q와 K로 점수 계산", "softmax로 비율", "비율대로 V 섞기"],
    "related": ["attention", "softmax", "vector"]
  },
  {
    "id": "multi-head-attention",
    "term": "Multi-Head Attention",
    "ko": "멀티헤드 어텐션",
    "full": "",
    "level": "심화",
    "def": "어텐션을 여러 벌(헤드) 병렬로 두어, 한 문장을 여러 관점으로 동시에 보는 방법. 트랜스포머 블록마다 반복된다.",
    "easy": "같은 그림을 친구 여러 명이 각자 다른 색안경을 끼고 동시에 보는 거예요.",
    "ex": "어떤 헤드는 주어와 동사의 짝을, 다른 헤드는 괄호 안 예외 문구를 붙잡는 식이라고 보면 돼요.",
    "flow": [],
    "related": ["attention", "transformer", "causal-mask", "kv-cache"]
  },
  {
    "full": "",
    "flow": [],
    "related": [
      "multi-head-attention",
      "next-token",
      "gpt"
    ],
    "ex": "GPT가 글을 이어 쓸 때 정답의 뒷부분을 미리 훔쳐보지 못하는 이유예요.",
    "easy": "받아쓰기 시험에서 아직 안 불러 준 뒷문장은 종이로 가려 두는 거예요.",
    "level": "심화",
    "id": "causal-mask",
    "term": "Causal Mask",
    "ko": "인과 마스크",
    "def": "현재 위치가 미래 토큰을 참고하지 못하게 가리는 장치예요. 보통 softmax 전에 미래 위치의 점수를 음의 무한대로 처리해, softmax 뒤의 어텐션 가중치가 0이 되게 해요.",
    "src": "03-02"
  },
  {
    "id": "kv-cache",
    "src": "03-02 · 03-03",
    "term": "KV Cache",
    "ko": "KV 캐시",
    "full": "",
    "level": "심화",
    "def": "답을 한 토큰씩 이어 쓸 때, 앞 토큰들의 Key와 Value를 다시 계산하지 않도록 메모리에 쌓아 두고 꺼내 쓰는 임시 보관함. 문맥이 길수록 차지하는 메모리가 커진다.",
    "easy": "어제 푼 계산은 공책에 적어 두고, 오늘은 그 답을 보고 이어서 푸는 거예요.",
    "ex": "모델 카드에서 MHA·MQA·GQA 같은 약어는 헤드들이 KV를 얼마나 나눠 쓰는지에 따른 설계 이름이에요.",
    "flow": [],
    "related": ["query-key-value", "multi-head-attention", "context-window"]
  },
  {
    "id": "positional-encoding",
    "term": "Positional Encoding",
    "ko": "위치 인코딩",
    "full": "",
    "level": "심화",
    "def": "어텐션은 토큰의 순서를 모르기 때문에, 각 토큰에 위치 정보를 따로 넣어 주는 방법. 방식(RoPE·ALiBi 등)에 따라 모델이 다룰 수 있는 문장 길이가 달라진다.",
    "easy": "카드를 섞어도 원래 순서를 알 수 있게 카드마다 번호표를 붙이는 거예요.",
    "ex": "'학생이 교사를 칭찬했다'와 '교사가 학생을 칭찬했다'를 구별하려면 위치 정보가 필요해요.",
    "flow": [],
    "related": ["transformer", "attention", "context-window"]
  },
  {
    "id": "tokenizer",
    "src": "03-02 · 03-03",
    "term": "Tokenizer",
    "ko": "토크나이저",
    "full": "",
    "level": "실전",
    "def": "글을 모델이 다루는 토큰으로 쪼개는 도구. 어떤 언어를 많이 보고 만들었느냐에 따라 같은 문장도 토큰 수가 달라진다.",
    "easy": "긴 김밥을 한입 크기로 써는 칼이에요. 칼마다 써는 크기가 달라요.",
    "ex": "같은 뜻이라도 한국어 문장은 22토큰, 영어 문장은 16토큰으로 나왔어요. 한국어를 많이 본 토크나이저는 '계약', '기간'처럼 뜻 단위로 잘라요.",
    "flow": [],
    "related": ["token", "context-window"]
  },
  {
    "id": "bert",
    "term": "BERT",
    "ko": "버트",
    "full": "Bidirectional Encoder Representations from Transformers",
    "level": "실전",
    "def": "트랜스포머의 인코더만 남겨, 가린 단어를 앞뒤 문맥을 모두 보고 맞히도록 사전학습한 모델(2018년). 문장의 뜻을 이해하는 분류·검색 과제에 강하다.",
    "easy": "문장 중간에 뚫린 빈칸을 앞뒤를 다 읽고 채우는 문제를 잔뜩 푼 모델이에요.",
    "ex": "'나는 [   ]을 마셨다'의 빈칸을 앞뒤 문맥으로 맞혀요. 글을 이어 쓰는 건 GPT 쪽이 더 자연스러워요.",
    "flow": [],
    "related": ["gpt", "encoder-decoder", "pretraining"]
  },
  {
    "id": "gpt",
    "term": "GPT",
    "ko": "지피티 (GPT 계열)",
    "full": "Generative Pre-trained Transformer",
    "level": "입문",
    "def": "트랜스포머의 디코더만 남겨, 앞 문맥을 보고 다음 토큰 하나를 예측하는 일을 반복하는 모델 계열. 뽑은 토큰을 다시 문맥에 붙여 또 다음을 예측하며 글을 이어 쓴다.",
    "easy": "끝말잇기처럼 앞에 나온 말을 보고 다음 말을 하나씩 이어 붙이는 모델이에요.",
    "ex": "GPT-2는 15억, GPT-3는 1,750억 개 파라미터로 키우면서 새 능력이 생겼어요.",
    "flow": ["앞 문맥 읽기", "다음 토큰 예측", "문맥에 붙이기", "반복"],
    "related": ["next-token", "bert", "llm", "scaling-law"]
  },
  {
    "id": "scaling-law",
    "term": "Scaling Law",
    "ko": "스케일링 법칙",
    "full": "",
    "level": "심화",
    "def": "모델 크기·데이터 양·계산량을 몇 배로 늘릴 때마다 손실이 정해진 비율만큼 매끈하게 줄어든다는 관계(2020년, 멱법칙). 성능 향상이 예측 가능한 공학 문제임을 보여 줬다.",
    "easy": "공부 시간을 두 배로 늘릴 때마다 틀리는 개수가 일정하게 줄어드는 규칙을 찾은 거예요.",
    "ex": "이 법칙을 믿고 GPT-3를 1,750억 개 파라미터까지 키웠어요.",
    "flow": [],
    "related": ["gpt", "llm", "loss", "parameter"]
  },
  {
    "id": "in-context-learning",
    "term": "In-context Learning",
    "ko": "인컨텍스트 러닝",
    "full": "",
    "level": "실전",
    "def": "모델 가중치를 바꾸지 않고, 입력 창(컨텍스트) 안에 예시 몇 개를 적어 주는 것만으로 새 과제를 해내는 능력. 예시를 몇 개 주느냐에 따라 퓨샷(few-shot)이라 부른다.",
    "easy": "'이렇게 하는 거야' 하고 예시 두세 개만 보여 줘도 바로 따라 하는 거예요.",
    "ex": "영어→프랑스어 예시 두세 쌍을 보여 주고 새 문장을 주면, 파인튜닝 없이 번역해요. 지금 프롬프트를 쓰는 방식의 뿌리예요.",
    "flow": [],
    "related": ["prompt", "fine-tuning", "context-window"]
  },
  {
    "full": "",
    "flow": [],
    "related": [
      "rlhf",
      "supervised-learning",
      "alignment"
    ],
    "ex": "LLM 정렬에서는 언어 모델 자신이 정책이 되고, 사람이 좋아하는 답에 보상을 줘요.",
    "easy": "강아지가 앉으면 간식을 줘서, 시키지 않아도 앉는 법을 익히게 하는 거예요.",
    "level": "실전",
    "id": "reinforcement-learning",
    "term": "Reinforcement Learning",
    "ko": "강화학습",
    "def": "환경에서 행동하고 보상을 받는 경험을 바탕으로, 앞으로 얻을 보상이 커지도록 행동 선택 방법을 배우는 방식이에요. 행동 주체는 에이전트, 행동을 고르는 규칙이나 확률 분포는 정책(policy)이에요.",
    "src": "03-02"
  },
  {
    "full": "",
    "flow": [
      "사전학습",
      "SFT",
      "RLHF 또는 DPO"
    ],
    "related": [
      "sft",
      "rlhf",
      "dpo",
      "pretraining"
    ],
    "ex": "정렬 전 모델은 '프랑스의 수도를 알려 줘'에 '이탈리아의 수도도 알려 줘'처럼 질문을 이어 쓰기도 했어요.",
    "easy": "아는 건 많은데 말귀를 못 알아듣던 친구에게 대화 예절을 가르치는 거예요.",
    "level": "실전",
    "id": "alignment",
    "term": "Alignment",
    "ko": "정렬",
    "def": "AI의 행동이 의도한 목표·가치·요구사항에 맞도록 만드는 연구와 작업이에요. 대화형 LLM에서는 지시를 잘 따르고 정직하며 안전하게 답하도록 다듬는 일이 포함돼요. 이 과정에서 지식과 능력도 달라질 수 있어요.",
    "src": "03-02"
  },
  {
    "full": "Supervised Fine-Tuning",
    "flow": [],
    "related": [
      "alignment",
      "fine-tuning",
      "rlhf"
    ],
    "ex": "질문에 질문으로 답하지 말고, 지시가 오면 수행하도록 바꿔 줘요.",
    "easy": "선생님이 쓴 모범 답안을 보고 '이렇게 대답하는 거구나' 따라 쓰며 배우는 거예요.",
    "level": "심화",
    "id": "sft",
    "term": "SFT",
    "ko": "지시학습 (지도 미세조정)",
    "def": "입력과 바람직한 출력의 짝으로 사전학습 모델을 추가 학습시키는 방법이에요. 지시 수행·출력 형식·특정 작업을 가르칠 수 있어요. 새 사실을 학습하기도 하지만 정확한 지식 갱신이 보장되지는 않아요.",
    "src": "03-02"
  },
  {
    "id": "rlhf",
    "term": "RLHF",
    "ko": "사람 피드백 강화학습",
    "full": "Reinforcement Learning from Human Feedback",
    "level": "심화",
    "def": "같은 질문에 모델이 낸 여러 답을 사람이 비교해 더 나은 쪽을 고르고, 그 선호로 보상 모델을 학습시킨 뒤 점수가 높아지는 쪽으로 언어 모델을 다듬는 방법. 원래 모델에서 너무 멀어지지 않게 KL 제약을 함께 건다.",
    "easy": "그림 두 장 중 더 좋은 쪽을 골라 주면, 화가가 그 취향을 배워 가는 거예요.",
    "ex": "RLHF로 정렬한 13억 개짜리 InstructGPT의 답을, 1,750억 개짜리 원본보다 사람들이 더 좋아했어요.",
    "flow": ["답 여러 개 생성", "사람이 비교", "보상 모델 학습", "모델 다듬기"],
    "related": ["reinforcement-learning", "alignment", "dpo", "sft"]
  },
  {
    "full": "Direct Preference Optimization",
    "flow": [],
    "related": [
      "rlhf",
      "alignment"
    ],
    "ex": "단순하고 안정적이라 여러 오픈 모델이 RLHF 대신 DPO를 택했어요.",
    "easy": "심판을 따로 두지 않고, '이게 더 좋아' 표시만 보고 바로 고쳐 나가는 거예요.",
    "level": "심화",
    "id": "dpo",
    "term": "DPO",
    "ko": "직접 선호 최적화",
    "def": "선호 응답과 덜 선호하는 응답의 쌍으로, 기준 모델에 비해 선호 응답이 상대적으로 더 선택되도록 학습하는 방법이에요. 별도 보상 모델이나 PPO 같은 강화학습 루프 없이 선호 목적을 최적화해요.",
    "src": "03-02"
  },
  {
    "full": "",
    "flow": [
      "잡음",
      "잡음 예측해 조금 지우기",
      "반복",
      "그림"
    ],
    "related": [
      "transformer",
      "genai"
    ],
    "ex": "지금 널리 쓰이는 이미지·영상 생성 AI가 확산 모델 위에 서 있어요.",
    "easy": "뿌옇게 김 서린 유리를 조금씩 닦아서 그림이 드러나게 하는 거예요.",
    "level": "실전",
    "id": "diffusion-model",
    "term": "Diffusion Model",
    "ko": "확산 모델",
    "def": "잡음에서 출발해 단계적으로 잡음을 줄이며 데이터를 생성하는 모델이에요. 대표적인 이미지 확산 모델은 단계마다 잡음 등을 예측하도록 학습하고, U-Net이나 트랜스포머 같은 구조를 사용할 수 있어요.",
    "src": "03-02 · 03-05"
  },
  {
    "full": "",
    "flow": [],
    "related": [
      "context-window",
      "context-rot",
      "token"
    ],
    "ex": "긴 문서의 중간 정보를 놓칠 수 있으므로 중요한 내용의 위치를 조정하거나 나눠 넣고 결과를 확인해요. 큰 컨텍스트 창이 정확한 정보 활용까지 보장하지는 않아요.",
    "easy": "긴 이야기를 들으면 처음과 끝은 기억나는데 중간은 흐릿한 것과 같아요.",
    "level": "실전",
    "id": "lost-in-the-middle",
    "term": "Lost in the Middle",
    "ko": "중간 정보 놓침",
    "def": "긴 입력을 다루는 일부 모델·과제에서 중요한 정보가 처음이나 끝보다 중간에 있을 때 활용 성능이 낮아지는 경향이에요. 모델·과제·입력 구성에 따라 정도가 달라요.",
    "src": "03-02"
  },
  {
    "id": "sos-token",
    "term": "SOS",
    "ko": "문장 시작 토큰",
    "full": "Start of Sequence (Start of Sentence)",
    "level": "심화",
    "def": "디코더에게 '이제 문장을 쓰기 시작해'라고 알리는 특별한 첫 토큰. 디코더는 이 토큰에서 출발해 다음 토큰을 하나씩 만들고, 끝을 알리는 EOS(End of Sequence) 토큰이 나오면 멈춘다. 모델에 따라 <s>, BOS라고도 쓴다. (교육자료 PDF가 아니라 03-02 수업 설명에서 나온 용어)",
    "easy": "달리기 출발선의 '탕!' 신호예요. 신호가 울리면 출발하고, 결승선(EOS)에 닿으면 멈춰요.",
    "ex": "번역할 때 디코더에 [SOS]를 먼저 넣으면 첫 단어 '나는'을 만들고, '나는'을 다시 넣어 다음 단어를 만드는 식으로 이어 가요.",
    "flow": ["SOS 넣기", "다음 토큰 생성", "반복", "EOS에서 멈춤"],
    "related": ["encoder-decoder", "causal-mask", "next-token", "token"]
  },
  {
    "id": "bleu",
    "term": "BLEU",
    "ko": "블루 (번역 품질 점수)",
    "full": "Bilingual Evaluation Understudy",
    "level": "실전",
    "def": "기계번역 결과가 사람이 쓴 정답 번역과 단어·구절(n-gram)이 얼마나 겹치는지로 매기는 자동 품질 점수. 높을수록 정답 번역에 가깝지만, 뜻은 맞는데 표현이 다른 번역은 낮게 나올 수 있다.",
    "easy": "모범 답안과 내 답안에 같은 낱말 조각이 얼마나 많이 들어 있는지 세어 점수를 매기는 거예요.",
    "ex": "트랜스포머 원 논문은 GPU 여덟 장으로 3.5일 학습해 기계번역 품질 점수(BLEU)에서 당시 최고 기록에 도달했어요.",
    "flow": [],
    "related": ["transformer", "encoder-decoder", "attention"]
  },
  {
    "id": "imagenet",
    "term": "ImageNet (ILSVRC)",
    "ko": "이미지넷 (이미지 분류 대회)",
    "full": "ImageNet Large Scale Visual Recognition Challenge (ILSVRC)",
    "level": "실전",
    "def": "라벨이 붙은 수백만 장의 이미지를 모은 대규모 데이터셋과, 그 데이터로 누가 가장 정확히 분류하나 겨루던 대회(ILSVRC). 정답 후보 5개 안에 정답이 없을 확률인 top-5 오류율로 성적을 쟀다.",
    "easy": "사진 수백만 장에 '고양이', '자동차' 이름표를 붙여 둔 거대한 사진 문제집이에요. 해마다 누가 가장 많이 맞히나 시합도 열렸어요.",
    "ex": "2012년 CNN이 top-5 오류율 15.3%로 2위(26.2%)를 크게 앞서며 딥러닝 부활의 방아쇠가 됐어요. 2015년 ResNet은 3.57%까지 내렸어요.",
    "flow": [],
    "related": ["cnn", "skip-connection", "mnist"]
  },
  {
    "id": "vit",
    "term": "ViT",
    "ko": "비전 트랜스포머",
    "full": "Vision Transformer",
    "level": "심화",
    "def": "이미지를 16×16 같은 작은 조각(패치)으로 잘라 조각 하나하나를 단어 토큰처럼 줄 세운 뒤, 합성곱 없이 트랜스포머로 처리하는 이미지 모델(2020년). CNN을 앞서려면 훨씬 많은 학습 데이터가 필요했다.",
    "easy": "사진을 퍼즐 조각으로 잘라 한 줄로 늘어놓고, 조각끼리 '너 나랑 관련 있니?' 물어보며 무슨 사진인지 알아내는 거예요.",
    "ex": "논문 제목이 'An Image is Worth 16x16 Words'예요. 사진 한 장을 16×16 조각 단어로 된 문장처럼 읽는다는 뜻이에요.",
    "flow": [],
    "related": ["transformer", "cnn", "attention", "token"]
  },
  {
    "id": "u-net",
    "src": "03-02 · 03-05",
    "term": "U-Net",
    "ko": "유넷",
    "full": "",
    "level": "심화",
    "def": "이미지를 점점 작게 줄였다가 다시 키우면서, 줄일 때 본 정보를 키우는 쪽에 이어 붙이는 U자 모양의 합성곱 신경망. 확산 모델에서 매 단계 걷어 낼 잡음을 예측하는 일꾼으로 오래 쓰였다.",
    "easy": "그림을 작게 요약했다가 다시 크게 그릴 때, 처음 봤던 자세한 부분을 옆에서 보여 주며 다시 그리는 거예요.",
    "ex": "확산 모델 안에서 '이 단계에서 지울 잡음은 이만큼'을 예측하던 자리를 2022년 DiT가 트랜스포머로 바꿨어요.",
    "flow": [],
    "related": ["diffusion-model", "cnn", "dit"]
  },
  {
    "id": "dit",
    "src": "03-02 · 03-05",
    "term": "DiT",
    "ko": "확산 트랜스포머",
    "full": "Diffusion Transformer",
    "level": "심화",
    "def": "확산 모델에서 잡음을 예측하던 U-Net 자리에 트랜스포머를 넣은 구조(2022년). ViT처럼 압축된 이미지 표현을 패치로 잘라 토큰으로 세우며, 계산량을 키울수록 품질이 매끈하게 좋아졌다.",
    "easy": "뿌연 그림을 닦아 내던 일꾼을, 퍼즐 조각끼리 서로 살펴보는 트랜스포머 일꾼으로 바꾼 거예요.",
    "ex": "지금 널리 쓰이는 이미지 생성 모델과 영상 생성 모델이 이 뼈대 위에 서 있어요.",
    "flow": [],
    "related": ["diffusion-model", "u-net", "vit", "scaling-law"]
  },
  {
    "id": "kl-divergence",
    "term": "KL Divergence",
    "ko": "KL 발산 (KL 제약)",
    "full": "Kullback-Leibler Divergence",
    "level": "심화",
    "def": "두 확률 분포가 얼마나 다른지 재는 값. 같으면 0이고 다를수록 커진다. RLHF에서는 손질 중인 모델이 원래 모델에서 너무 멀어지지 않게 이 값만큼 벌점을 주는 'KL 제약'으로 쓴다.",
    "easy": "글씨를 예쁘게 고치되, 원래 글씨체에서 너무 달라지면 벌점을 주는 규칙이에요.",
    "ex": "보상 점수만 좇으면 보상 모델의 허점을 파고드는 답으로 폭주해서, KL 고삐로 원래 모델 근처에 붙잡아 둬요.",
    "flow": [],
    "related": ["rlhf", "dpo", "alignment"]
  },
  {
    "id": "word2vec",
    "term": "word2vec",
    "ko": "워드투벡",
    "full": "",
    "level": "심화",
    "def": "주변 단어를 맞히도록 신경망을 학습시켜 단어마다 벡터를 만드는 방법(2013년). 비슷한 자리에 쓰이는 단어가 비슷한 벡터를 갖게 되고, 이렇게 만든 임베딩이 언어 신경망의 표준 입력이 됐다.",
    "easy": "늘 같이 노는 친구를 보면 그 아이를 알 수 있듯, 옆에 자주 오는 단어로 그 단어의 '뜻 주소'를 정해 줘요.",
    "ex": "'커피를 ___ 마셨다'의 빈칸 채우기를 수없이 연습시키면, '왕 - 남자 + 여자'가 '여왕' 근처에 도착하는 벡터 공간이 생겨요.",
    "flow": [],
    "related": ["embedding", "vector", "fasttext"]
  },
  {
    "id": "fasttext",
    "term": "FastText",
    "ko": "패스트텍스트",
    "full": "",
    "level": "심화",
    "def": "word2vec의 후속 격인 단어 벡터 방법. 단어를 더 작은 글자 조각으로도 나눠 배워, 처음 보는 단어나 활용형이 많은 언어에서도 벡터를 만들 수 있다.",
    "easy": "'먹었다'를 '먹', '었', '다' 조각으로도 기억해서, 처음 보는 '먹었니'도 뜻을 짐작해요.",
    "ex": "꼬맨틀 게임은 FastText로 위키백과와 웹 문서를 학습한 단어 벡터로, 던진 단어가 정답과 얼마나 가까운지 점수를 매겨요.",
    "flow": [],
    "related": ["word2vec", "embedding", "cosine-similarity"]
  },
  {
    "id": "sentence-transformers",
    "term": "Sentence Transformers (MiniLM)",
    "ko": "문장 임베딩 모델",
    "full": "",
    "level": "실전",
    "def": "문장이나 단어를 맥락을 반영한 벡터 하나로 바꿔 주는 파이썬 라이브러리와 그 모델들. MiniLM은 그중 작고 빨라 CPU에서도 돌리기 좋은 모델 계열이다.",
    "easy": "문장 전체를 읽고 '뜻 지도'의 주소 하나로 바꿔 주는 번역기예요.",
    "ex": "paraphrase-multilingual-MiniLM-L12-v2 모델로 단어들을 벡터로 바꾸고, 코사인 유사도로 '바다'와 가까운 순위를 매겨요.",
    "flow": [],
    "related": ["embedding", "cosine-similarity", "word2vec"]
  },
  {
    "id": "scaled-dot-product-attention",
    "term": "Scaled Dot-Product Attention",
    "ko": "스케일드 점곱 어텐션",
    "full": "",
    "level": "심화",
    "def": "트랜스포머의 기본 어텐션 계산. Q와 K를 내적해 점수표를 만들고, 벡터 길이(차원)의 제곱근으로 나눠 점수가 과하게 벌어지지 않게 한 뒤, softmax로 비율을 정해 V를 섞는다.",
    "easy": "질문 카드와 색인표가 얼마나 맞는지 점수를 매기는데, 카드가 길수록 점수가 너무 부풀지 않게 한 번 줄여 주는 거예요.",
    "ex": "식으로는 softmax(QKᵀ/√d)·V예요. 디코더에서는 여기에 causal mask를 더해 아직 만들지 않은 미래 위치를 가려요.",
    "flow": ["Q·K 점수", "√d로 나누기", "softmax", "V 섞기"],
    "related": ["query-key-value", "attention", "softmax", "causal-mask"]
  },
  {
    "id": "dense-attention",
    "term": "Dense Attention",
    "ko": "밀집 어텐션 (제곱 비용)",
    "full": "",
    "level": "심화",
    "def": "모든 토큰이 다른 모든 토큰과 점수를 맞대 보는 일반적인 어텐션. 비교 계산이 토큰 수의 제곱에 가깝게 늘어, 입력이 두 배면 이 계산은 네 배 가까이 된다.",
    "easy": "친구가 10명이면 서로 한 번씩 인사하는 횟수가 약 100번, 20명이면 약 400번이 돼요. 사람이 두 배면 인사는 네 배예요.",
    "ex": "긴 문서를 통째로 넣으면 비교 계산과 메모리가 크게 늘어요. 다만 응답 시간이나 요금이 꼭 네 배가 되는 건 아니고, 실제 요금은 모델별 토큰 단가와 캐시 정책을 따라요.",
    "flow": [],
    "related": ["attention", "token", "context-window", "kv-cache"]
  },
  {
    "id": "neuron",
    "term": "Neuron",
    "ko": "뉴런",
    "full": "",
    "level": "입문",
    "def": "신경망 한 층 안에서 입력을 받아 곱하고 더해 값을 하나 내놓는 가장 작은 계산 단위. 한 층에는 이런 뉴런이 수백, 수천 개 들어 있다.",
    "easy": "큰 공장(신경망)의 작업자 한 명이에요. 받은 숫자들을 계산해서 숫자 하나를 다음 칸으로 넘겨요.",
    "ex": "dropout은 학습할 때마다 이 뉴런 가운데 일부를 무작위로 골라 0만 내보내게 해요.",
    "flow": [],
    "related": ["neural-network", "perceptron", "relu", "dropout"]
  },
  {
    "id": "emergent-ability",
    "term": "Emergent Ability",
    "ko": "창발 능력",
    "full": "",
    "level": "심화",
    "def": "모델을 크게 키웠을 때, 아무도 명시적으로 가르치지 않았는데 새로 나타나는 능력. GPT-3에서 드러난 인컨텍스트 러닝이 대표적인 예다.",
    "easy": "레고 블록 몇 개로는 아무것도 안 되는데, 잔뜩 모아 조립하니 움직이는 로봇이 되는 것 같은 일이에요.",
    "ex": "1,750억 개 파라미터의 GPT-3는 파인튜닝 없이 프롬프트의 예시 몇 개만 보고 새 과제를 해냈어요. 지금 프롬프트로 일을 시키는 방식의 뿌리예요.",
    "flow": [],
    "related": ["scaling-law", "in-context-learning", "gpt"]
  },
  {
    "id": "model-card",
    "src": "03-02 · 03-05",
    "term": "Model Card",
    "ko": "모델 카드",
    "full": "",
    "level": "실전",
    "def": "모델의 용도, 학습 데이터, 구조, 성능, 한계, 라이선스 등을 정리한 설명서. 모델을 고르거나 내려받기 전에 확인한다.",
    "easy": "과자 봉지 뒤의 성분표와 주의사항 같은 거예요. 쓰기 전에 읽어 봐요.",
    "ex": "모델 카드에서 MHA·MQA·GQA나 위치 인코딩 방식 같은 낯선 약어를 만나도, 트랜스포머 구조를 알면 자리를 잡을 수 있어요.",
    "flow": [],
    "related": ["open-weight", "local-model", "context-window"]
  },
  {
    "id": "vision-language-model",
    "term": "VLM",
    "ko": "시각-언어 모델",
    "full": "Vision-Language Model",
    "level": "실전",
    "def": "이미지와 글을 함께 입력받아 이해하고 답하는 모델. 그림 패치와 글자 토큰을 한 줄에 세워 어텐션을 돌린다. 여기에 로봇 동작까지 내놓게 하면 VLA(Vision-Language-Action) 모델이라 부른다.",
    "easy": "그림책을 보여 주며 '이 그림에 뭐가 있어?'라고 물으면 대답해 주는 친구예요.",
    "ex": "문서 사진을 넣고 '이 영수증 합계가 얼마예요?'라고 물으면 그림과 글을 함께 보고 답해요.",
    "flow": [],
    "related": ["vit", "transformer", "token"]
  },
  {
    "id": "spectrogram",
    "term": "Spectrogram",
    "ko": "스펙트로그램",
    "full": "",
    "level": "심화",
    "def": "오디오를 짧은 구간으로 잘라, 시간에 따라 주파수별 소리 세기를 그림처럼 나타낸 것. 음성 모델은 이 조각들을 토큰처럼 줄 세워 트랜스포머에 넣는다.",
    "easy": "소리를 '높은 음·낮은 음이 언제 얼마나 컸는지' 색칠한 그림으로 바꾼 거예요.",
    "ex": "Whisper 같은 음성 인식 모델은 스펙트로그램 조각의 줄을 읽어 글자의 줄을 내놓아요. 번역과 다르지 않은 문제가 되는 거예요.",
    "flow": [],
    "related": ["transformer", "encoder-decoder", "token"]
  },
  {
    "id": "hf-transformers",
    "src": "03-02 · 03-05",
    "term": "Transformers (Hugging Face)",
    "ko": "트랜스포머스 라이브러리",
    "full": "",
    "level": "실전",
    "def": "공개된 사전학습 모델과 토크나이저를 이름 하나로 내려받아 쓰게 해 주는 파이썬 라이브러리. Hugging Face가 만들었다.",
    "easy": "모델 이름만 말하면 원하는 모델을 바로 빌려 주는 도서관 대출 창구예요.",
    "ex": "from transformers import AutoTokenizer 후 AutoTokenizer.from_pretrained(\"monologg/koelectra-small-v3-discriminator\")로 한국어 토크나이저를 불러 토큰을 세어요.",
    "flow": [],
    "related": ["tokenizer", "pytorch", "open-weight"]
  },
  {
    "id": "tiktoken",
    "term": "tiktoken",
    "ko": "틱토큰",
    "full": "",
    "level": "실전",
    "def": "OpenAI 모델 계열이 쓰는 방식으로 글을 토큰으로 쪼개고 개수를 세는 파이썬 라이브러리. 모델을 내려받지 않고도 토큰 수를 미리 확인할 수 있다.",
    "easy": "글을 보내기 전에 '몇 조각이 되나' 세어 보는 조각 계산기예요.",
    "ex": "tiktoken.get_encoding(\"o200k_base\")로 세어 보니 같은 뜻인데 한국어 문장은 22토큰, 영어 문장은 16토큰이었어요.",
    "flow": [],
    "related": ["tokenizer", "token", "context-window"]
  }
]);
