// =====================================================
// 게임 밸런스 설정 — 수치는 모두 이 파일에서만 조절합니다.
// 단위: 거리 px, 시간 초, 속도 px/초
// =====================================================
var CONFIG = {
  // 화면 크기 (내부 해상도, 실제 표시는 창 크기에 맞춰 늘어남)
  canvas: { width: 960, height: 540 },

  // 바닥 높이 (캔버스 위에서부터의 y 좌표)
  groundY: 440,

  // 달리기 속도
  speed: {
    base: 360,        // 시작 속도
    step: 45,         // 단계마다 증가량
    stepInterval: 30, // 몇 초마다 빨라지는지
    max: 650          // 최고 속도
  },

  // 플레이어
  player: {
    x: 180,             // 화면상 x 위치 (고정)
    width: 34,          // 서 있을 때 충돌 박스
    height: 60,
    slideWidth: 52,     // 숙였을 때 충돌 박스
    slideHeight: 28,
    gravity: 2300,
    jumpPower: 760,     // 1단 점프 초기 속도
    doubleJumpPower: 640, // 2단 점프 초기 속도
    fastFallMul: 2.2,   // 공중에서 ↓ 누르면 중력 배수
    slideMax: 1.5,      // 최대 슬라이딩 시간
    hurtInvincible: 1.5 // 피격 후 무적 시간
  },

  // 태클
  tackle: {
    duration: 0.4,  // 돌진 시간
    cooldown: 1.5,  // 쿨타임 (사용 시점부터)
    speedMul: 1.6,  // 돌진 중 화면 이동 속도 배수
    pushX: 40       // 돌진 중 앞으로 튀어나가는 거리(연출)
  },

  // 스테이지: length(m)마다 다음 스테이지로, 마지막 다음엔 처음부터 다시 순환
  stages: {
    length: 200,
    order: ['city', 'jungle', 'sky'], // 도시(밤) → 정글 → 구름 위 하늘
    fadeTime: 1.2                     // 배경이 바뀌는 데 걸리는 시간
  },

  // 하트
  hearts: { start: 3, max: 5 },

  // 장애물 종류별 크기와 등장 조건
  obstacles: {
    hydrant:   { width: 30, height: 46, unlock: 0,  weight: 3 },
    box:       { width: 44, height: 40, unlock: 0,  weight: 3 },
    sign:      { width: 78, clearance: 44, unlock: 30, weight: 2 }, // clearance: 간판 아래 빈 공간 높이
    gap:       { minWidth: 110, maxWidth: 170, unlock: 30, weight: 2 },
    barricade: { width: 42, height: 250, unlock: 60, weight: 2 }
  },

  // 장애물 간격
  spawn: {
    firstDelay: 500,   // 시작 후 첫 장애물까지 거리
    minGap: 330,       // 장애물 사이 최소 간격
    maxGap: 620,       // 장애물 사이 최대 간격
    speedGapFactor: 0.6 // 속도가 빠를수록 간격을 넓히는 비율 (속도 × 이 값만큼 추가)
  },

  // 점수
  score: {
    pixelsPerPoint: 30, // 몇 px 달릴 때마다 거리 점수 1점
    coin: 10,           // 코인 1개
    destroy: 20,        // 장애물 파괴
    comboStep: 0.1,     // 콤보 증가량
    comboEvery: 10,     // 피격 없이 몇 개 통과마다 콤보 증가
    comboMax: 2.0
  },

  // 코인 배치
  coins: {
    patternChance: 0.75, // 장애물 사이에 코인이 놓일 확률
    archChance: 0.45,    // 그중 아치 모양 비율 (나머지는 일자 줄)
    count: 5,            // 한 줄에 놓이는 개수
    spacing: 38,         // 코인 간격
    radius: 9,
    archHeight: 110      // 아치 최고 높이
  },

  // 아이템
  items: {
    interval: 15,  // 등장 주기
    jitter: 2,     // 주기 랜덤 오차 (±)
    radius: 16,
    heightAboveGround: 110,
    // 등장 가중치
    weights: { heart: 2, star: 2, magnet: 3, double: 3 },
    starDuration: 5,
    magnetDuration: 8,
    magnetRadius: 230,
    magnetPull: 950,  // 코인이 끌려오는 속도
    doubleDuration: 10
  }
};
