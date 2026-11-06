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
    "src": "03-02"
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
    "src": "03-02"
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
    "src": "03-02"
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
    "src": "03-02"
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
  }
]);
