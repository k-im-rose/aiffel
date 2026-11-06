// 03-01 인공지능의 학습 — 교육자료 PDF 기반. 처음 나온 자료에만 두고, 다시 나온 자료는 src에 함께 적는다.
addSection('03-01', "인공지능의 학습", [
  {
    "full": "",
    "flow": [
      "데이터 주기",
      "규칙 스스로 찾기",
      "새 입력에 적용"
    ],
    "related": [
      "deep-learning",
      "training",
      "supervised-learning"
    ],
    "ex": "스팸을 '무료'·'당첨' 같은 금지어로 막으면 '무.료'로 빠져나가요. 그래서 스팸 예시를 많이 보여 주고 배우게 해요.",
    "easy": "'귀가 뾰족하면 고양이' 같은 규칙을 다 적는 대신, 개·고양이 사진을 잔뜩 보여 주고 알아서 구분법을 익히게 해요.",
    "level": "입문",
    "id": "machine-learning",
    "term": "Machine Learning",
    "ko": "머신러닝",
    "def": "사람이 규칙을 하나하나 짜 넣는 대신, 데이터(예시)를 보고 기계가 규칙을 스스로 찾게 하는 방식.",
    "src": "03-01"
  },
  {
    "full": "",
    "flow": [],
    "related": [
      "machine-learning",
      "neural-network",
      "genai"
    ],
    "ex": "사진을 알아보고, 글을 쓰고, 번역하는 요즘 AI는 거의 다 딥러닝으로 만들어요.",
    "easy": "AI라는 큰 범위 안에 머신러닝이, 그 안에 딥러닝이 있어요. 오늘 다루는 대표적인 생성형 AI도 대개 딥러닝으로 만들어요.",
    "level": "입문",
    "id": "deep-learning",
    "term": "Deep Learning",
    "ko": "딥러닝",
    "def": "머신러닝 안에서, 신경망을 여러 층 깊게 쌓아 복잡한 패턴을 배우는 방식. 요즘 생성형 AI도 대개 딥러닝 위에 서 있다.",
    "src": "03-01"
  },
  {
    "id": "neural-network",
    "term": "Neural Network",
    "ko": "신경망",
    "full": "",
    "level": "입문",
    "def": "숫자를 받아 층을 차례로 지나며 계산해 답을 내는 모델 구조. '예측 → 오차 → 조정'이 실제로 일어나는 곳이 이 층들이다.",
    "easy": "여러 단계의 검사대가 줄지어 있어요. 앞쪽은 선·모서리를, 뒤쪽은 눈·귀 같은 모양을 알아봐요.",
    "ex": "손글씨 사진의 784개 숫자를 넣으면 층을 지나 '이건 7일 확률 95%'가 나와요.",
    "flow": ["입력 층", "숨은 층들", "출력 층"],
    "related": ["deep-learning", "parameter", "backpropagation"]
  },
  {
    "full": "",
    "flow": [
      "예측",
      "오차 계산",
      "가중치 조정",
      "반복"
    ],
    "related": [
      "loss",
      "gradient-descent",
      "parameter"
    ],
    "ex": "03-01 카페 실습 예시에서는 30일치 기록으로 600번 학습해, 숨은 규칙 ‘매출 = 2 × 방문객 + 1’에 가까운 2.07과 0.79를 얻었어요. 데이터·초깃값·실행 조건에 따라 결과는 달라질 수 있어요.",
    "easy": "받아쓰기를 하고 → 채점하고 → 틀린 만큼 고치고, 또 받아쓰기. 이걸 수백 번 반복하면 실력이 늘어요.",
    "level": "입문",
    "id": "training",
    "term": "Training",
    "ko": "학습(훈련)",
    "def": "모델이 데이터로 예측하고, 틀린 정도(오차)를 계산하고, 내부 숫자(가중치)를 조금 고치는 일을 반복하는 과정.",
    "src": "03-01"
  },
  {
    "id": "supervised-learning",
    "term": "Supervised Learning",
    "ko": "지도학습",
    "full": "",
    "level": "입문",
    "def": "입력과 정답을 짝지은 예시로 배우는 방식. 정답 없이 묶는 비지도학습, 시행착오와 보상으로 배우는 강화학습과 구분한다.",
    "easy": "문제집 뒤에 정답이 붙어 있어서, 풀고 맞춰 보며 배우는 공부예요.",
    "ex": "매출이 적힌 카페 기록, 정답 숫자가 붙은 손글씨, '개/고양이' 이름표가 붙은 사진이 모두 지도학습 데이터예요.",
    "flow": [],
    "related": ["machine-learning", "regression", "classification"]
  },
  {
    "full": "",
    "flow": [],
    "related": [
      "training",
      "gradient-descent",
      "llm"
    ],
    "ex": "카페 모델은 파라미터가 2개(w, b), ResNet18은 약 1,100만 개, LLM은 수십억~수천억 개예요.",
    "easy": "라디오 다이얼 같아요. 소리가 또렷해질 때까지 조금씩 돌려 맞춰요. 거대 언어 모델은 이 다이얼이 수천억 개예요.",
    "level": "입문",
    "id": "parameter",
    "term": "Parameter",
    "ko": "파라미터(가중치·편향)",
    "def": "학습하며 조정되는 모델 내부의 숫자. 가중치(weight)와 편향(bias)이 있고, 학습의 결과물은 규칙집이 아니라 이 숫자들에 압축된 패턴이다.",
    "src": "02-06 · 03-01"
  },
  {
    "full": "",
    "flow": [],
    "related": [
      "training",
      "gradient-descent",
      "regression"
    ],
    "ex": "예측이 5이고 정답이 7이면 절대오차는 2, 제곱오차는 4예요. 03-01 카페 실습은 각 예시의 제곱오차를 평균 낸 MSE를 사용해요.",
    "easy": "과녁에서 화살이 얼마나 빗나갔는지 재는 자예요. 작을수록 잘 맞힌 거예요.",
    "level": "실전",
    "id": "loss",
    "term": "Loss",
    "ko": "손실(오차)",
    "def": "예측이 목표에서 얼마나 벗어났는지를 정한 기준으로 계산한 값이에요. 학습은 이 값을 줄이도록 진행해요. 회귀에는 MSE·MAE 등 여러 손실을 쓸 수 있어요.",
    "src": "03-01"
  },
  {
    "id": "gradient-descent",
    "term": "Gradient Descent",
    "ko": "경사하강",
    "full": "",
    "level": "실전",
    "def": "오차를 언덕으로 보고, 오차가 가장 낮은 골짜기를 향해 가중치를 한 걸음씩 옮기는 방법.",
    "easy": "눈을 감고 산을 내려갈 때, 발밑이 기울어진 아래쪽으로 한 발씩 내딛는 거예요.",
    "ex": "예측이 5 → 5.3 → 5.6…처럼 정답 7에 조금씩 다가가요.",
    "flow": ["기울기 구하기", "반대 방향으로 한 걸음", "반복"],
    "related": ["gradient", "learning-rate", "backpropagation", "loss"]
  },
  {
    "full": "",
    "flow": [],
    "related": [
      "gradient-descent",
      "perceptron",
      "neural-network",
      "pytorch"
    ],
    "ex": "PyTorch에서 loss.backward()는 기울기를 계산하고, optimizer.step()은 그 기울기를 이용해 파라미터를 갱신해요.",
    "easy": "결과가 달라지려면 각 조절 손잡이를 어느 쪽으로 얼마나 움직여야 할지 되짚어 계산해요. 실제로 손잡이를 돌리는 단계는 따로 있어요.",
    "level": "심화",
    "id": "backpropagation",
    "term": "Backpropagation",
    "ko": "역전파",
    "def": "손실이 각 파라미터의 작은 변화에 얼마나 민감한지, 미분의 연쇄법칙으로 뒤에서 앞으로 계산하는 방법이에요. 계산한 기울기로 파라미터를 갱신하는 일과는 구분해요.",
    "src": "03-01"
  },
  {
    "full": "",
    "flow": [],
    "related": [
      "gradient-descent",
      "training"
    ],
    "ex": "03-01 카페 실습 코드에서는 학습률 lr = 0.03으로 600번 반복했어요. 다른 문제에서도 이 값이 최선이라는 뜻은 아니에요.",
    "easy": "산을 내려갈 때의 보폭이에요. 너무 크면 골짜기를 건너뛰고, 너무 작으면 해가 져요.",
    "level": "실전",
    "id": "learning-rate",
    "term": "Learning Rate",
    "ko": "학습률",
    "def": "경사하강에서 한 번에 가중치를 얼마나 크게 고칠지 정하는 값. 한 걸음의 크기.",
    "src": "03-01"
  },
  {
    "id": "regression",
    "term": "Regression",
    "ko": "회귀",
    "full": "",
    "level": "입문",
    "def": "매출·온도처럼 연속된 숫자를 예측하는 문제.",
    "easy": "'내일 몇 명 올까?'처럼 답이 숫자로 나오는 문제예요.",
    "ex": "하루 방문객 수로 그날 매출을 예측하는 카페 실습이 회귀예요.",
    "flow": [],
    "related": ["classification", "supervised-learning", "loss"]
  },
  {
    "id": "classification",
    "term": "Classification",
    "ko": "분류",
    "full": "",
    "level": "입문",
    "def": "입력이 어느 범주에 속하는지 고르는 문제. 모델은 후보마다 확률을 매기고 가장 높은 것을 답으로 고른다.",
    "easy": "'이건 사과야, 배야?'처럼 정해진 보기 중에서 고르는 문제예요.",
    "ex": "손글씨가 0~9 중 무엇인지, 메일이 스팸인지, 사진이 개인지 고양이인지 고르는 일이에요.",
    "flow": [],
    "related": ["softmax", "regression", "mnist"]
  },
  {
    "full": "",
    "flow": [
      "점수(로짓)",
      "exp로 모두 양수",
      "합으로 나눠 확률"
    ],
    "related": [
      "classification",
      "next-token",
      "llm"
    ],
    "ex": "점수 [2.0, 1.0, 0.1]은 약 [0.66, 0.24, 0.10]이 돼요. 높은 값이어도 틀릴 수 있으므로, 사람에게 넘길 기준은 검증 데이터로 평가해 정해요.",
    "easy": "1등만 1점, 나머지 0점으로 자르는 게 아니라, 2·3등에도 점수를 조금씩 나눠 주는 부드러운 채점이에요.",
    "level": "실전",
    "id": "softmax",
    "term": "Softmax",
    "ko": "소프트맥스",
    "def": "후보 점수를 양수이고 합이 1인 확률 분포로 바꾸는 계산이에요. 모델의 확신 정도로 쓰지만 실제 정답률과 일치한다는 보장은 없어요.",
    "src": "03-01"
  },
  {
    "id": "vector",
    "term": "Vector",
    "ko": "벡터",
    "full": "",
    "level": "입문",
    "def": "순서 있는 숫자의 묶음. 공간 속의 점(또는 화살표)으로 볼 수 있고, 두 벡터가 비슷한지는 거리나 방향(각도)으로 잰다.",
    "easy": "지도 위의 좌표예요. 서울과 인천은 가깝고, 서울과 부산은 멀죠.",
    "ex": "점 A=(2, 3)과 B=(2, 4)는 거리 1이라 비슷하고, C=(9, 1)은 멀어서 달라요.",
    "flow": [],
    "related": ["embedding", "tensor", "token"]
  },
  {
    "id": "embedding",
    "term": "Embedding",
    "ko": "임베딩",
    "full": "",
    "src": "03-01 · 03-02",
    "level": "실전",
    "def": "토큰을 뜻이 담긴 벡터로 바꾼 것. 비슷한 맥락에서 쓰이는 단어일수록 비슷한 벡터가 되게 맞춘다.",
    "easy": "단어마다 '뜻 지도'의 주소를 붙여 줘요. 뜻이 비슷한 단어끼리 옆집에 살아요.",
    "ex": "문서 검색에서 '휴가'를 찾으면 벡터가 가까운 '연차' 문서도 함께 찾아 줘요.",
    "flow": ["글", "토큰으로 자르기", "벡터로 바꾸기"],
    "related": ["vector", "token", "llm"]
  },
  {
    "id": "tensor",
    "term": "Tensor",
    "ko": "텐서",
    "full": "",
    "level": "실전",
    "def": "숫자를 몇 방향으로 늘어놓았는지를 일반화한 말. 숫자 하나(스칼라, 0차), 한 줄(벡터, 1차), 격자(행렬, 2차), 격자를 겹친 것(3차 이상)을 모두 포함한다.",
    "easy": "숫자 한 알 → 한 줄 목걸이 → 바둑판 → 바둑판을 여러 장 쌓은 탑. 다 텐서예요.",
    "ex": "손글씨 한 장은 28×28 행렬(784개 숫자), 컬러 사진은 높이×너비×3(빨강·초록·파랑) 텐서로 모델에 들어가요.",
    "flow": ["스칼라", "벡터", "행렬", "텐서"],
    "related": ["vector", "pytorch", "mnist"]
  },
  {
    "full": "",
    "flow": [],
    "related": [
      "classification",
      "tensor",
      "softmax"
    ],
    "ex": "03-01 자료집은 간단한 신경망의 정확도 96%대를 예로 들어요. 학습 데이터를 10%로 줄여 결과를 비교해 볼 수 있어요. 정확도는 모델 구성과 학습 조건에 따라 달라져요.",
    "easy": "AI 공부를 시작할 때 처음 푸는 연습 문제집이에요.",
    "level": "입문",
    "id": "mnist",
    "term": "MNIST",
    "ko": "손글씨 숫자 데이터셋",
    "def": "손으로 쓴 숫자 0~9를 모은 7만 장짜리 데이터셋. 한 장은 28×28 밝기 숫자이고, 기계학습의 'Hello World'로 불린다.",
    "src": "03-01"
  },
  {
    "full": "",
    "flow": [],
    "related": [
      "training",
      "hallucination",
      "parameter"
    ],
    "ex": "기출문제는 잘 풀어도 새 문제에서 틀린다면 일반화가 부족할 수 있어요. 유창하게 답하는 것과 새 문제를 정확히 푸는 것은 달라요.",
    "easy": "기출문제 답만 외운 친구는 새 문제에서 막히고, 원리를 익힌 친구는 처음 보는 문제도 풀어요.",
    "level": "실전",
    "id": "generalization",
    "term": "Generalization",
    "ko": "일반화",
    "def": "훈련에서 직접 보지 못한 새 데이터에서도 잘 작동하는 능력이에요. 외운 예시에만 잘 답하는 것과 구분하고, 새 데이터에서의 성능으로 평가해요.",
    "src": "03-01"
  },
  {
    "full": "Large Language Model",
    "flow": [],
    "related": [
      "next-token",
      "pretraining",
      "token"
    ],
    "ex": "ChatGPT·Claude 같은 챗봇 속에 언어 모델이 있어요. 큰 모델을 처음부터 학습하려면 많은 계산 자원이 필요하지만, 필요한 장비와 비용은 모델 규모·학습 조건에 따라 달라요.",
    "easy": "세상의 글을 엄청나게 읽고 '다음에 올 말 맞히기'를 연습한 아주 큰 모델이에요.",
    "level": "입문",
    "id": "llm",
    "term": "LLM",
    "ko": "대형 언어 모델",
    "src": "03-01 · 03-02",
    "def": "대규모 텍스트 등으로 언어의 패턴을 학습한 큰 언어 모델이에요. 이 수업의 GPT식 생성 모델은 주로 다음 토큰을 예측해요. BERT처럼 가린 토큰을 맞히며 학습하는 언어 모델도 있어요."
  },
  {
    "id": "next-token",
    "term": "Next-token Prediction",
    "ko": "다음 토큰 예측",
    "full": "",
    "src": "03-01 · 03-02",
    "level": "입문",
    "def": "앞의 토큰들을 보고 다음에 올 토큰의 확률을 매겨 고르는 일. 거대 언어 모델이 하는 일의 핵심이며, 1951년 섀넌의 '다음 글자 맞히기' 게임의 기계 버전이다.",
    "easy": "'옛날 옛적에 호랑이가…' 다음 말을 맞히는 끝말 이어 가기 게임이에요.",
    "ex": "모델이 다음 토큰 후보 수만 개에 softmax로 확률을 매기고 하나를 골라 문장을 이어 써요.",
    "flow": [],
    "related": ["llm", "softmax", "token"]
  },
  {
    "full": "",
    "flow": [],
    "related": [
      "fine-tuning",
      "llm",
      "transfer-learning"
    ],
    "ex": "흔히 쓰는 ImageNet-1K 사전학습 ResNet18은 약 120만 장의 훈련 이미지로 배운 특징을 활용해요. 새 작업에서 이 특징을 물려받아 쓸 수 있어요.",
    "easy": "학교에서 기초 과목을 두루 배워 두는 단계예요. 직업 교육(파인튜닝)은 그다음이에요.",
    "level": "실전",
    "id": "pretraining",
    "term": "Pretraining",
    "ko": "사전학습",
    "src": "03-01 · 03-02",
    "def": "후속 작업에 활용할 기반 표현과 패턴을 미리 학습하는 단계예요. 이미지·텍스트 등 다양한 데이터로 수행하며, 데이터 규모와 학습 방법은 모델마다 달라요."
  },
  {
    "full": "",
    "flow": [
      "사전학습 모델 가져오기",
      "학습할 부분 정하기",
      "추가 학습·평가"
    ],
    "related": [
      "transfer-learning",
      "pretraining",
      "gpu"
    ],
    "ex": "03-01 실습은 ResNet18의 앞쪽 가중치를 고정하고 마지막 분류 층을 개·고양이용으로 학습하는 전이학습 예시예요. 파인튜닝 전체가 마지막 층만 학습하는 방식으로 한정되지는 않아요.",
    "easy": "요리를 다 배운 셰프에게 우리 가게 메뉴만 새로 알려 주는 거예요. 칼질부터 다시 가르치지 않아요.",
    "level": "실전",
    "id": "fine-tuning",
    "term": "Fine-tuning",
    "ko": "파인튜닝",
    "src": "03-01 · 03-02",
    "def": "사전학습한 모델을 특정 작업이나 데이터에 맞춰 추가로 학습시키는 일이에요. 전체 또는 일부 가중치, 추가한 작은 학습 모듈 등을 조정할 수 있어요."
  },
  {
    "id": "transfer-learning",
    "term": "Transfer Learning",
    "ko": "전이학습",
    "full": "",
    "level": "실전",
    "def": "한 문제에서 배운 특징을 다른 문제에 물려 쓰는 학습 방식. 파인튜닝은 그 대표적인 방법이다.",
    "easy": "자전거를 탈 줄 알면 오토바이 균형 잡기도 금방 배워요. 이미 배운 감각을 옮겨 쓰는 거예요.",
    "ex": "이미지를 보는 앞쪽 층의 '선·모서리 보는 눈'은 개든 고양이든 자동차든 똑같이 쓸모 있어요.",
    "flow": [],
    "related": ["fine-tuning", "pretraining"]
  },
  {
    "full": "Graphics Processing Unit",
    "flow": [],
    "related": [
      "colab",
      "fine-tuning",
      "pytorch"
    ],
    "ex": "카페 모델은 노트북에서 즉시 끝나지만, ResNet18 파인튜닝은 Colab의 무료 T4 GPU를 빌려 돌려요.",
    "easy": "CPU가 똑똑한 요리사 몇 명이라면, GPU는 감자 깎기만 하는 조수 수천 명이에요. 감자가 많으면 GPU가 이겨요.",
    "level": "입문",
    "id": "gpu",
    "term": "GPU",
    "ko": "그래픽 처리 장치",
    "def": "많은 계산을 병렬로 처리하는 데 특화된 장치예요. 큰 행렬 곱셈 같은 딥러닝 계산을 빠르게 할 수 있지만, CPU와의 속도 차이는 작업 크기·장비·구현에 따라 달라요.",
    "src": "03-01"
  },
  {
    "id": "pytorch",
    "term": "PyTorch",
    "ko": "파이토치",
    "full": "",
    "level": "실전",
    "def": "딥러닝에서 가장 널리 쓰는 파이썬 라이브러리. 텐서를 CPU·GPU에서 같은 코드로 다루고, 자동 미분(autograd)으로 기울기를 계산해 준다.",
    "easy": "학습에 필요한 계산기와 공구가 다 들어 있는 공구 상자예요.",
    "ex": "loss.backward() 한 줄이면 각 파라미터의 기울기를 알아서 구해요. 실무에서는 torch.optim.SGD 같은 도구로 갱신 코드도 짧게 줄여요.",
    "flow": [],
    "related": ["tensor", "backpropagation", "library"]
  },
  {
    "id": "colab",
    "term": "Google Colab",
    "ko": "구글 코랩",
    "full": "",
    "level": "입문",
    "def": "브라우저에서 파이썬 노트북을 열어 실행하는 구글 서비스. 런타임 유형을 T4 GPU로 바꾸면 무료 GPU를 빌려 쓸 수 있다.",
    "easy": "내 컴퓨터에 없는 좋은 계산기를 인터넷으로 잠깐 빌려 쓰는 곳이에요.",
    "ex": "런타임 → 런타임 유형 변경 → T4 GPU. 무료 GPU는 상황에 따라 배정돼서, 자리가 없으면 잠시 뒤 다시 시도해요.",
    "flow": [],
    "related": ["gpu", "colab-mcp", "pytorch"],
    "src": "01-03 · 03-01"
  },
  {
    "id": "colab-mcp",
    "term": "Colab MCP",
    "ko": "코랩 MCP 서버",
    "full": "",
    "level": "실전",
    "def": "에이전트가 Colab 노트북에 연결해 셀을 넣고, 코드를 실행하고, 결과를 가져오게 해 주는 구글 공식 MCP 서버.",
    "easy": "에이전트에게 Colab 리모컨을 쥐여 주는 거예요. 내가 버튼을 안 눌러도 에이전트가 대신 돌려요.",
    "ex": "claude mcp add colab -- uvx git+https://github.com/googlecolab/colab-mcp 로 연결하고 'nvidia-smi로 GPU 연결을 확인해 줘'라고 시켜요.",
    "flow": ["노트북 열고 T4 선택", "에이전트에 연결 요청", "GPU 확인", "학습 실행"],
    "related": ["colab", "mcp-server", "uv"]
  },
  {
    "full": "",
    "flow": [],
    "related": [
      "colab-mcp",
      "npm",
      "cli"
    ],
    "ex": "Colab MCP 준비물이 Python, git, uv예요. uvx로 colab-mcp를 바로 띄워요.",
    "easy": "파이썬 프로그램을 뜯지 않고 바로 꺼내 쓰게 해 주는 배달 상자예요.",
    "level": "실전",
    "id": "uv",
    "term": "uv",
    "ko": "유브이",
    "def": "파이썬 패키지와 실행 환경을 설치·관리하는 도구예요. uvx는 필요한 도구를 임시 격리 환경에 준비해 실행하므로, 프로젝트 환경에 미리 직접 설치하지 않고 쓸 수 있어요.",
    "src": "03-01"
  },
  {
    "id": "perceptron",
    "term": "Perceptron",
    "ko": "퍼셉트론",
    "full": "",
    "level": "입문",
    "def": "1958년 로젠블랫이 만든 초기 학습 모델. 예측해 보고, 틀리면 틀린 정도만큼 내부 숫자(가중치)를 살짝 고치는 규칙으로 배운다. 한 겹뿐이라 복잡한 패턴은 못 배웠고, 이 한계를 역전파가 풀었다.",
    "easy": "받아쓰기를 틀릴 때마다 틀린 만큼만 고쳐 가며 실력을 키우는 아이예요. 다만 아주 쉬운 문제까지만 풀 수 있었어요.",
    "ex": "카페 실습의 weight 하나·bias 하나 모델이 퍼셉트론의 친척뻘이에요. 퍼셉트론은 0과 1을 갈랐고, 카페 모델은 매출 같은 숫자를 예측해요.",
    "flow": ["예측", "틀린 만큼 가중치 고치기", "반복"],
    "related": ["backpropagation", "neural-network", "parameter"]
  },
  {
    "full": "",
    "flow": [],
    "related": [
      "gradient-descent",
      "backpropagation",
      "learning-rate"
    ],
    "ex": "loss.backward()로 기울기를 계산하고 optimizer.step()으로 갱신해요. 다음 반복 전에는 보통 optimizer.zero_grad()로 기울기를 초기화해요.",
    "easy": "언덕에서 발밑이 어느 쪽으로 얼마나 기울었는지예요. 그 반대쪽으로 걸으면 아래로 내려가요.",
    "level": "실전",
    "id": "gradient",
    "term": "Gradient",
    "ko": "기울기",
    "src": "03-01 · 03-02",
    "def": "손실을 각 파라미터로 편미분한 값을 모은 것이에요. 파라미터가 조금 바뀔 때 손실이 어느 방향으로 얼마나 변하는지 나타내요."
  },
  {
    "id": "mse",
    "term": "MSE",
    "ko": "평균제곱오차",
    "full": "Mean Squared Error",
    "level": "실전",
    "def": "각 예시에서 예측과 정답의 차이를 제곱해 평균 낸 손실. 크게 틀린 예시일수록 제곱 때문에 벌점이 훨씬 커진다. 숫자를 맞히는 회귀에서 흔히 쓴다.",
    "easy": "과녁에서 1칸 빗나가면 벌점 1점, 3칸 빗나가면 벌점 9점이에요. 많이 빗나갈수록 벌점이 확 커져요.",
    "ex": "카페 실습의 loss = ((pred - y) ** 2).mean() 한 줄이 MSE예요. 학습이 진행되면 loss 그래프가 급히 떨어졌다가 평평해져요.",
    "flow": [],
    "related": ["loss", "regression", "gradient-descent"]
  },
  {
    "id": "autograd",
    "term": "autograd",
    "ko": "자동 미분",
    "full": "",
    "level": "실전",
    "def": "계산 과정을 기록해 두었다가, 각 파라미터가 오차에 얼마나 기여했는지(기울기)를 자동으로 계산해 주는 기능. PyTorch에서는 loss.backward() 한 줄로 역전파를 대신 밟아 준다.",
    "easy": "수학 문제를 풀며 풀이 과정을 다 적어 두면, 어느 줄이 답을 얼마나 틀리게 했는지 자동으로 표시해 주는 거예요.",
    "ex": "requires_grad=True로 만든 w, b는 loss.backward()를 부르면 w.grad, b.grad에 기울기가 채워져요. 다음 스텝 전에는 grad.zero_()로 비워요.",
    "flow": [],
    "related": ["backpropagation", "gradient", "pytorch"]
  },
  {
    "id": "logit",
    "term": "Logit",
    "ko": "로짓 (raw 점수)",
    "full": "",
    "level": "심화",
    "def": "softmax에 넣기 전, 모델이 후보마다 매긴 날것의 점수. 음수나 1보다 큰 값도 될 수 있고, softmax를 거쳐야 합이 1인 확률이 된다.",
    "easy": "심사위원이 매긴 날 점수예요. 이 점수를 '몇 %'로 바꿔 주는 게 softmax예요.",
    "ex": "후보 셋의 로짓 [2.0, 1.0, 0.1]은 softmax를 거쳐 약 [0.66, 0.24, 0.10]이 돼요.",
    "flow": [],
    "related": ["softmax", "classification", "cross-entropy"]
  },
  {
    "id": "cross-entropy",
    "term": "Cross-Entropy Loss",
    "ko": "교차 엔트로피 손실",
    "full": "",
    "level": "심화",
    "def": "분류에서 쓰는 표준 손실. 모델이 정답 후보에 준 확률이 낮을수록 커진다(정답 확률에 -log를 취한 값). PyTorch의 CrossEntropyLoss는 로짓을 받아 softmax 계산까지 함께 한다.",
    "easy": "정답에 '10%쯤?'이라고 자신 없게 답하면 벌점이 크고, '90%!'라고 하면 벌점이 작아요.",
    "ex": "MNIST 분류기 프롬프트의 '손실 함수는 표준 분류 방식(CrossEntropyLoss)을 쓰고'가 이 손실이에요. 정답 7의 확률이 0.9면 손실은 약 0.1, 0.1이면 약 2.3이에요.",
    "flow": [],
    "related": ["loss", "softmax", "classification", "logit"]
  },
  {
    "id": "layer-freezing",
    "term": "Freeze",
    "ko": "층 고정 (얼리기)",
    "full": "",
    "level": "실전",
    "def": "사전학습된 모델의 일부 층 가중치를 학습 중에 바뀌지 않게 고정하는 것. 보통 보편적인 특징을 보는 앞쪽 층을 얼리고 뒤쪽 판단 층만 새로 학습해 데이터와 계산을 아낀다.",
    "easy": "잘 지어진 집의 기초 공사는 그대로 두고, 방 인테리어만 내 취향으로 바꾸는 거예요.",
    "ex": "ResNet18의 앞쪽 층은 얼려 두고 마지막 분류 층만 개/고양이 2개로 바꿔 학습해요. PyTorch에서는 얼릴 층의 requires_grad를 False로 둬요.",
    "flow": [],
    "related": ["fine-tuning", "transfer-learning", "parameter"]
  },
  {
    "id": "tpu",
    "term": "TPU",
    "ko": "텐서 처리 장치",
    "full": "Tensor Processing Unit",
    "level": "실전",
    "def": "구글이 딥러닝의 행렬·텐서 계산을 빠르게 하려고 만든 전용 칩. GPU처럼 학습과 추론을 가속하는 데 쓴다.",
    "easy": "GPU가 여러 일을 돕는 조수 수천 명이라면, TPU는 딥러닝 계산만 하도록 맞춘 전문 팀이에요.",
    "ex": "Colab 무료 요금제에서는 보통 T4 GPU가 주어지고, TPU나 더 강한 A100·H100은 유료(Pro/Pro+)에서 열려요.",
    "flow": [],
    "related": ["gpu", "tensor", "colab"]
  },
  {
    "id": "unsupervised-learning",
    "term": "Unsupervised Learning",
    "ko": "비지도학습",
    "full": "",
    "level": "입문",
    "def": "정답(라벨) 없이 데이터만 보고 비슷한 것끼리 묶거나 숨은 구조를 찾는 학습 방식. 입력과 정답의 쌍으로 배우는 지도학습과 대비된다.",
    "easy": "이름표 없는 단추 더미를 색깔·모양이 비슷한 것끼리 스스로 나눠 담는 거예요.",
    "ex": "구매 기록만 보고 비슷한 손님끼리 그룹을 나누는 일은, 정해진 '정답 그룹'이 없으니 비지도학습이에요.",
    "flow": [],
    "related": ["supervised-learning", "reinforcement-learning", "machine-learning"]
  },
  {
    "id": "batch",
    "term": "Batch",
    "ko": "배치 (한 묶음)",
    "full": "",
    "level": "실전",
    "def": "여러 데이터를 한 번에 묶어 모델에 넣는 단위. 텐서에 '몇 번째 데이터인지' 차원이 하나 더 붙고, 보통 한 묶음의 손실 평균으로 가중치를 한 번 조정한다. 한 묶음의 개수를 배치 크기라 한다.",
    "easy": "쿠키를 한 개씩 굽지 않고 오븐 판에 여러 개 올려 한 번에 굽는 거예요.",
    "ex": "컬러 사진 한 장은 높이×너비×3 텐서지만, 32장을 한 번에 넣으면 32×높이×너비×3이 돼요. GPU 메모리가 모자라면 배치 크기를 줄여요.",
    "flow": [],
    "related": ["tensor", "gpu", "training"]
  },
  {
    "id": "optimizer",
    "term": "Optimizer (SGD)",
    "ko": "옵티마이저",
    "full": "Stochastic Gradient Descent (SGD)",
    "level": "실전",
    "def": "계산된 기울기를 받아 파라미터를 실제로 갱신해 주는 도구. 손으로 쓴 'w -= lr * w.grad'를 대신해 주며, 가장 기본이 SGD(확률적 경사하강)이고 Adam 같은 변형도 많다.",
    "easy": "지도(기울기)를 보고 실제로 발걸음을 옮겨 주는 길잡이예요.",
    "ex": "실무에서는 갱신 루프를 손으로 쓰지 않고 torch.optim.SGD(model.parameters(), lr=0.03)를 만든 뒤 optimizer.step()과 optimizer.zero_grad()로 줄여요.",
    "flow": [],
    "related": ["gradient-descent", "learning-rate", "pytorch"]
  },
  {
    "id": "cuda",
    "term": "CUDA",
    "ko": "쿠다 (GPU 계산 플랫폼)",
    "full": "Compute Unified Device Architecture",
    "level": "실전",
    "def": "엔비디아 GPU에서 범용 계산을 돌리게 해 주는 플랫폼. PyTorch에서는 장치 이름 'cuda'로 GPU를 가리키며, 데이터와 모델을 그 장치에 올려야 GPU로 계산한다.",
    "easy": "GPU라는 공장에 일을 맡길 때 쓰는 출입증이자 작업 지시서예요.",
    "ex": "device = \"cuda\" if torch.cuda.is_available() else \"cpu\" 한 줄로, GPU가 있으면 쓰고 없으면 CPU로 돌려요.",
    "flow": [],
    "related": ["gpu", "pytorch", "nvidia-smi"]
  },
  {
    "id": "nvidia-smi",
    "term": "nvidia-smi",
    "ko": "GPU 상태 확인 명령",
    "full": "NVIDIA System Management Interface",
    "level": "실전",
    "def": "엔비디아 GPU의 이름, 메모리 사용량, 사용률, 그 GPU를 쓰는 프로세스를 보여 주는 명령줄 도구.",
    "easy": "GPU의 건강검진표예요. 지금 일하고 있는지, 기억 공간이 얼마나 찼는지 보여 줘요.",
    "ex": "Colab에 연결한 뒤 에이전트에게 'nvidia-smi로 GPU가 연결됐는지 확인해 줘'라고 해요. 학습 중에도 사용률을 보면 코드가 정말 GPU를 쓰는지 알 수 있어요.",
    "flow": [],
    "related": ["gpu", "cuda", "colab-mcp"]
  },
  {
    "id": "pip",
    "term": "pip",
    "ko": "파이썬 패키지 설치 도구",
    "full": "",
    "level": "입문",
    "def": "파이썬 라이브러리를 내려받아 설치하는 기본 명령. npm이 Node.js 패키지를 설치하듯 pip는 파이썬 패키지를 설치한다.",
    "easy": "파이썬 앱스토어에서 필요한 앱을 받아 오는 버튼이에요.",
    "ex": "pip install torch matplotlib로 실습 준비를 해요. Colab 셀에서는 앞에 !를 붙여 !pip install sentence-transformers처럼 써요.",
    "flow": [],
    "related": ["npm", "uv", "dependency"],
    "src": "03-01 · 03-02"
  },
  {
    "id": "matplotlib",
    "term": "Matplotlib",
    "ko": "맷플롯립 (그래프 라이브러리)",
    "full": "",
    "level": "입문",
    "def": "파이썬에서 데이터와 학습 결과를 그래프로 그리는 라이브러리. 보통 import matplotlib.pyplot as plt로 불러 쓴다.",
    "easy": "숫자 표를 그림으로 바꿔 주는 크레파스 상자예요.",
    "ex": "카페 실습에서 plt.scatter로 30일치 점을 찍고, plt.plot(losses)로 loss가 줄어드는 곡선을 그려요.",
    "flow": [],
    "related": ["pytorch", "colab", "loss"]
  },
  {
    "id": "torchvision",
    "term": "torchvision",
    "ko": "토치비전",
    "full": "",
    "level": "실전",
    "def": "PyTorch의 이미지용 짝 라이브러리. 유명 이미지 데이터셋, 이미지 변환 도구, ResNet 같은 사전학습 모델을 바로 불러 쓰게 해 준다.",
    "easy": "PyTorch 공구 상자 옆에 붙은 '사진 전용 서랍'이에요.",
    "ex": "'torchvision의 사전학습된 ResNet18을 불러와 개 vs 고양이 분류로 파인튜닝해 주세요'처럼 에이전트에게 시켜요.",
    "flow": [],
    "related": ["pytorch", "fine-tuning", "mnist"]
  },
  {
    "id": "numpy",
    "term": "NumPy",
    "ko": "넘파이",
    "full": "",
    "level": "실전",
    "def": "파이썬에서 숫자 배열(벡터·행렬)을 빠르게 계산하는 기본 라이브러리. PyTorch 텐서와 서로 바꾸기 쉬워 그래프 그리기나 결과 정리에 자주 쓴다.",
    "easy": "숫자 줄과 숫자 판을 한꺼번에 계산해 주는 큰 계산기예요.",
    "ex": "x.cpu().numpy()로 텐서를 넘파이 배열로 바꿔 그래프에 넘겨요. 03-02 실습에서는 np.argsort로 유사도 점수를 순위대로 세워요.",
    "flow": [],
    "related": ["tensor", "pytorch", "matplotlib"],
    "src": "03-01 · 03-02"
  }
]);

