// =====================================================
// 도시 파쿠르 러너 — 게임 로직과 그리기
// 밸런스 수치는 config.js 의 CONFIG 를 사용합니다.
// =====================================================
(function () {
  'use strict';

  var C = CONFIG;
  var W = C.canvas.width;
  var H = C.canvas.height;
  var GROUND = C.groundY;

  var canvas = document.getElementById('game');
  var ctx = canvas.getContext('2d');
  canvas.width = W;
  canvas.height = H;

  // ---------- 유틸 ----------
  function rand(a, b) { return a + Math.random() * (b - a); }
  function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }
  function overlap(a, b) {
    return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
  }
  // 가중치에 따라 하나 고르기 ({이름: 가중치})
  function pickWeighted(table) {
    var total = 0, k;
    for (k in table) total += table[k];
    var r = Math.random() * total;
    for (k in table) { r -= table[k]; if (r <= 0) return k; }
    return k;
  }

  // 최고 점수 (저장이 막힌 환경에서도 오류 없이 동작)
  function loadBest() {
    try { return Number(localStorage.getItem('parkourBest')) || 0; } catch (e) { return 0; }
  }
  function saveBest(v) {
    try { localStorage.setItem('parkourBest', String(v)); } catch (e) { /* 무시 */ }
  }

  // ---------- 상태 ----------
  var state = 'title'; // title | play | pause | over
  var g = null;        // 현재 판의 데이터
  var best = loadBest();
  var keys = {};

  function newGame() {
    g = {
      time: 0,
      dist: 0,
      hearts: C.hearts.start,
      coinScore: 0,
      breakScore: 0,
      combo: 1,
      passCount: 0,
      obstacles: [],
      coins: [],
      items: [],
      particles: [],
      popups: [],
      nextObstacle: C.spawn.firstDelay,
      itemTimer: C.items.interval,
      effects: { star: 0, magnet: 0, double: 0 },
      shake: 0,
      scroll: 0,
      stage: 0,       // 몇 번째 스테이지인지 (0부터, 계속 증가)
      prevStage: 0,   // 배경 전환 중 이전 스테이지
      stageFade: 0,   // 스테이지가 바뀐 뒤 지난 시간
      player: {
        y: GROUND,        // 발 위치
        vy: 0,
        onGround: true,
        jumpCount: 0,
        sliding: false,
        slideTime: 0,
        slideLock: false, // 최대 시간을 다 쓰면 ↓를 뗄 때까지 다시 못 숙임
        tackleTime: 0,
        tackleCd: 0,
        hurtTime: 0,
        falling: false,   // 틈에 빠지는 중
        anim: 0
      }
    };
  }

  function speedNow() {
    var lv = Math.floor(g.time / C.speed.stepInterval);
    return Math.min(C.speed.base + lv * C.speed.step, C.speed.max);
  }

  function distScore() { return Math.floor(g.dist / C.score.pixelsPerPoint); }

  // 스테이지 번호 → 테마 이름 (순서대로 순환)
  function themeOf(stage) { return C.stages.order[stage % C.stages.order.length]; }
  var THEME_NAMES = { city: '도시 · 밤', jungle: '정글', sky: '구름 위 하늘' };
  function totalScore() {
    return Math.floor((distScore() + g.coinScore + g.breakScore) * g.combo);
  }

  // 플레이어 충돌 박스
  function playerBox() {
    var p = g.player;
    var push = p.tackleTime > 0 ? C.tackle.pushX * Math.sin((p.tackleTime / C.tackle.duration) * Math.PI) : 0;
    var w = p.sliding ? C.player.slideWidth : C.player.width;
    var h = p.sliding ? C.player.slideHeight : C.player.height;
    return { x: C.player.x - w / 2 + push, y: p.y - h, w: w, h: h };
  }

  // ---------- 장애물·코인·아이템 생성 ----------
  function unlockedTable() {
    var t = {}, k;
    for (k in C.obstacles) {
      if (g.time >= C.obstacles[k].unlock) t[k] = C.obstacles[k].weight;
    }
    return t;
  }

  function makeObstacle(type, x) {
    var o = C.obstacles[type];
    // stage: 생성될 때의 테마로 모양을 그림 (판정은 테마와 상관없이 같음)
    var ob = { type: type, x: x, passed: false, hit: false, dead: false, stage: themeOf(g.stage) };
    if (type === 'gap') {
      ob.w = Math.round(rand(o.minWidth, o.maxWidth));
      ob.y = GROUND; ob.h = 0;
    } else if (type === 'sign') {
      // 위쪽 구조물에 매달린 간판: 화면 위부터 머리 높이까지 막음
      ob.w = o.width; ob.y = 0; ob.h = GROUND - o.clearance;
      ob.label = ['CAFE', 'SALE', 'PC방', '24H', '분식'][Math.floor(Math.random() * 5)];
    } else {
      ob.w = o.width; ob.h = o.height; ob.y = GROUND - o.height;
    }
    ob.breakable = (type === 'box' || type === 'barricade');
    ob.stompable = (type === 'box' || type === 'hydrant'); // 위에서 밟을 수 있음
    return ob;
  }

  function spawnObstacle() {
    var type = pickWeighted(unlockedTable());
    var x = W + 40;
    var ob = makeObstacle(type, x);
    g.obstacles.push(ob);

    // 다음 장애물까지 간격
    var gap = rand(C.spawn.minGap, C.spawn.maxGap) + speedNow() * C.spawn.speedGapFactor;
    g.nextObstacle = ob.w + gap;

    var freeStart = x + ob.w + 70;
    var freeEnd = x + ob.w + gap - 70;

    // 아이템 차례면 다음 빈 공간에 아이템을 둔다
    if (g.itemTimer <= 0) {
      spawnItem((freeStart + freeEnd) / 2);
      g.itemTimer = C.items.interval + rand(-C.items.jitter, C.items.jitter);
      return;
    }

    if (Math.random() > C.coins.patternChance) return;
    var cc = C.coins;
    var span = (cc.count - 1) * cc.spacing;
    var i;
    // 낮은 장애물·틈 위에는 아치, 그 외엔 사이 공간에 줄
    var canArch = (type === 'hydrant' || type === 'box' || type === 'gap');
    if (canArch && Math.random() < cc.archChance) {
      var cx = x + ob.w / 2;
      for (i = 0; i < cc.count; i++) {
        var t = i / (cc.count - 1);
        g.coins.push({
          x: cx - span / 2 + i * cc.spacing,
          y: GROUND - 40 - Math.sin(t * Math.PI) * cc.archHeight
        });
      }
    } else if (freeEnd - freeStart > span) {
      var sx = freeStart + (freeEnd - freeStart - span) / 2;
      for (i = 0; i < cc.count; i++) {
        g.coins.push({ x: sx + i * cc.spacing, y: GROUND - 28 });
      }
    }
  }

  function spawnItem(x) {
    var weights = {}, k;
    for (k in C.items.weights) weights[k] = C.items.weights[k];
    if (g.hearts >= C.hearts.max) delete weights.heart; // 하트가 가득이면 하트는 제외
    g.items.push({ type: pickWeighted(weights), x: x, y: GROUND - C.items.heightAboveGround, t: 0 });
  }

  // ---------- 점수·피격 ----------
  function addPopup(text, x, y, color) {
    g.popups.push({ text: text, x: x, y: y, life: 0.8, color: color || '#fff' });
  }

  function burst(x, y, color, n) {
    for (var i = 0; i < n; i++) {
      g.particles.push({
        x: x, y: y, vx: rand(-260, 260), vy: rand(-380, -60),
        life: rand(0.4, 0.8), color: color, size: rand(3, 7)
      });
    }
  }

  // 장애물을 통과(또는 파괴)했을 때 콤보 진행
  function countPass(ob) {
    if (ob.passed) return;
    ob.passed = true;
    if (ob.hit) return;
    g.passCount++;
    if (g.passCount % C.score.comboEvery === 0 && g.combo < C.score.comboMax) {
      g.combo = Math.min(C.score.comboMax, Math.round((g.combo + C.score.comboStep) * 10) / 10);
      addPopup('콤보 x' + g.combo.toFixed(1), C.player.x, GROUND - 120, '#ffd84a');
    }
  }

  function destroy(ob) {
    ob.dead = true;
    g.breakScore += C.score.destroy;
    countPass(ob);
    var col = ob.type === 'box' ? '#c98b4a' : ob.type === 'barricade' ? '#ff8a1f' : '#cfd6e0';
    burst(ob.x + ob.w / 2, Math.max(ob.y, GROUND - 120) + 20, col, 14);
    addPopup('+' + C.score.destroy, ob.x + ob.w / 2, GROUND - 90, '#ff9b6b');
    g.shake = 0.15;
  }

  function damage() {
    var p = g.player;
    g.hearts--;
    g.shake = 0.3;
    burst(C.player.x, p.y - 30, '#ff5d6c', 10);
    if (g.hearts <= 0) {
      // 마지막 피격은 콤보를 초기화하지 않고 그대로 최종 배율로 사용
      gameOver();
      return;
    }
    p.hurtTime = C.player.hurtInvincible;
    g.combo = 1;
    g.passCount = 0;
  }

  function gameOver() {
    state = 'over';
    g.final = totalScore();
    g.newBest = g.final > best;
    if (g.newBest) { best = g.final; saveBest(best); }
  }

  // ---------- 입력 ----------
  function onJump() {
    var p = g.player;
    if (p.falling) return;
    if (p.onGround) {
      p.vy = -C.player.jumpPower;
      p.onGround = false;
      p.jumpCount = 1;
      p.sliding = false;
    } else if (p.jumpCount < 2) {
      p.vy = -C.player.doubleJumpPower;
      p.jumpCount = 2;
      burst(C.player.x, p.y, '#bfe9ff', 6);
    }
  }

  function onTackle() {
    var p = g.player;
    if (p.falling || p.tackleCd > 0) return;
    p.tackleTime = C.tackle.duration;
    p.tackleCd = C.tackle.cooldown;
    p.sliding = false;
  }

  var JUMP_KEYS = { Space: 1, ArrowUp: 1 };
  var TACKLE_KEYS = { ArrowRight: 1, ShiftLeft: 1, ShiftRight: 1 };

  window.addEventListener('keydown', function (e) {
    var code = e.code;
    if (JUMP_KEYS[code] || code === 'ArrowDown' || code === 'ArrowRight' || code === 'ArrowLeft') e.preventDefault();
    var first = !keys[code];
    keys[code] = true;
    if (!first) return; // 꾹 누를 때 반복 입력 무시

    if (state === 'title' || state === 'over') {
      if (code === 'Space' || code === 'Enter') { newGame(); state = 'play'; }
      return;
    }
    if (code === 'Escape') {
      state = state === 'play' ? 'pause' : state === 'pause' ? 'play' : state;
      return;
    }
    if (state !== 'play') return;
    if (JUMP_KEYS[code]) onJump();
    if (TACKLE_KEYS[code]) onTackle();
  });
  window.addEventListener('keyup', function (e) { keys[e.code] = false; });
  // 창을 벗어나면 자동 일시정지
  window.addEventListener('blur', function () {
    for (var k in keys) keys[k] = false;
    if (state === 'play') state = 'pause';
  });

  // ---------- 업데이트 ----------
  function update(dt) {
    var p = g.player;
    var P = C.player;
    g.time += dt;
    p.anim += dt;

    // 효과 시간 감소
    var k;
    for (k in g.effects) g.effects[k] = Math.max(0, g.effects[k] - dt);
    var star = g.effects.star > 0;
    p.hurtTime = Math.max(0, p.hurtTime - dt);
    p.tackleCd = Math.max(0, p.tackleCd - dt);
    p.tackleTime = Math.max(0, p.tackleTime - dt);
    var tackling = p.tackleTime > 0;
    g.itemTimer -= dt;
    g.shake = Math.max(0, g.shake - dt);

    // 화면 이동량 (틈에 빠지는 중엔 멈춤)
    var speed = speedNow() * (tackling ? C.tackle.speedMul : 1);
    if (p.falling) speed = 0;
    var dx = speed * dt;
    g.scroll += dx;
    g.dist += dx;

    // 일정 거리마다 다음 스테이지
    g.stageFade += dt;
    var st = Math.floor(distScore() / C.stages.length);
    if (st > g.stage) {
      g.prevStage = g.stage;
      g.stage = st;
      g.stageFade = 0;
    }

    // 숙이기
    var down = keys.ArrowDown;
    if (!down) { p.slideLock = false; p.slideTime = 0; }
    if (down && p.onGround && !p.slideLock && !tackling) {
      p.sliding = true;
      p.slideTime += dt;
      if (p.slideTime >= P.slideMax) { p.sliding = false; p.slideLock = true; }
    } else {
      p.sliding = false;
    }

    // 중력 (공중 태클 중엔 수평 돌진)
    var prevFeet = p.y;
    if (tackling && !p.onGround && !p.falling) {
      p.vy = 0;
    } else {
      var grav = P.gravity * (down && !p.onGround ? P.fastFallMul : 1);
      p.vy += grav * dt;
    }
    p.y += p.vy * dt;

    // 발밑이 틈인지 확인 (무적 별 상태면 틈 위도 달릴 수 있음)
    var footX = C.player.x;
    var overGap = false;
    var i, ob;
    if (!star) {
      for (i = 0; i < g.obstacles.length; i++) {
        ob = g.obstacles[i];
        if (ob.type === 'gap' && !ob.dead && footX > ob.x + 4 && footX < ob.x + ob.w - 4) { overGap = true; break; }
      }
    }

    if (p.falling) {
      if (p.y > GROUND + 130) {
        // 틈에 빠짐: 하트 -1 후 위에서 다시 떨어지며 복귀
        p.falling = false;
        for (i = 0; i < g.obstacles.length; i++) {
          if (g.obstacles[i].type === 'gap' && g.obstacles[i].x < footX + 10 && g.obstacles[i].x + g.obstacles[i].w > footX - 10) {
            g.obstacles[i].dead = true;
          }
        }
        damage();
        if (state !== 'play') return;
        p.y = GROUND - 180; p.vy = 0; p.onGround = false; p.jumpCount = 1;
      }
    } else if (p.y >= GROUND && prevFeet <= GROUND + 1 && !overGap) {
      p.y = GROUND; p.vy = 0; p.onGround = true; p.jumpCount = 0;
    } else if (overGap && p.y > GROUND + 4) {
      p.falling = true; p.onGround = false; p.sliding = false;
      if (gapUnder(footX)) gapUnder(footX).hit = true;
    } else if (p.y < GROUND || overGap) {
      p.onGround = false;
    }

    // 물체 이동
    for (i = 0; i < g.obstacles.length; i++) g.obstacles[i].x -= dx;
    for (i = 0; i < g.coins.length; i++) g.coins[i].x -= dx;
    for (i = 0; i < g.items.length; i++) { g.items[i].x -= dx; g.items[i].t += dt; }

    // 장애물 생성
    g.nextObstacle -= dx;
    if (g.nextObstacle <= 0) spawnObstacle();

    // 장애물 충돌
    var box = playerBox();
    var prevBottom = prevFeet;
    for (i = 0; i < g.obstacles.length; i++) {
      ob = g.obstacles[i];
      if (ob.dead || ob.type === 'gap') continue;
      var obox = { x: ob.x + 3, y: ob.y + 3, w: ob.w - 6, h: ob.h - 3 };
      if (!overlap(box, obox)) continue;
      if (star) { destroy(ob); continue; }
      if (ob.breakable && tackling) { destroy(ob); continue; }
      // 위에서 밟기: 상자는 부서지고, 소화전은 튕겨 오름
      if (ob.stompable && p.vy > 0 && prevBottom <= ob.y + 12) {
        p.vy = -C.player.jumpPower * 0.7;
        p.jumpCount = 1;
        p.onGround = false;
        if (ob.type === 'box') destroy(ob);
        continue;
      }
      if (p.hurtTime > 0) { ob.hit = true; continue; }
      ob.hit = true;
      damage();
      if (state !== 'play') return;
    }

    // 통과 판정 (콤보)
    for (i = 0; i < g.obstacles.length; i++) {
      ob = g.obstacles[i];
      if (!ob.passed && !ob.dead && ob.x + ob.w < box.x) countPass(ob);
    }

    // 코인 (자석이면 끌어당김)
    var pcx = box.x + box.w / 2, pcy = box.y + box.h / 2;
    var coinVal = C.score.coin * (g.effects.double > 0 ? 2 : 1);
    for (i = 0; i < g.coins.length; i++) {
      var c = g.coins[i];
      if (g.effects.magnet > 0) {
        var ddx = pcx - c.x, ddy = pcy - c.y;
        var d = Math.sqrt(ddx * ddx + ddy * ddy);
        if (d < C.items.magnetRadius && d > 1) {
          var step = Math.min(d, C.items.magnetPull * dt);
          c.x += ddx / d * step; c.y += ddy / d * step;
        }
      }
      var r = C.coins.radius;
      if (overlap(box, { x: c.x - r, y: c.y - r, w: r * 2, h: r * 2 })) {
        c.taken = true;
        g.coinScore += coinVal;
        addPopup('+' + coinVal, c.x, c.y - 10, '#ffe066');
      }
    }

    // 아이템 획득
    for (i = 0; i < g.items.length; i++) {
      var it = g.items[i];
      var ir = C.items.radius;
      var iy = it.y + Math.sin(it.t * 4) * 6;
      if (!overlap(box, { x: it.x - ir, y: iy - ir, w: ir * 2, h: ir * 2 })) continue;
      it.taken = true;
      burst(it.x, iy, '#ffffff', 10);
      if (it.type === 'heart') {
        g.hearts = Math.min(C.hearts.max, g.hearts + 1);
        addPopup('하트 +1', it.x, iy - 20, '#ff6b81');
      } else if (it.type === 'star') {
        g.effects.star = C.items.starDuration;
        addPopup('무적!', it.x, iy - 20, '#ffe14d');
      } else if (it.type === 'magnet') {
        g.effects.magnet = C.items.magnetDuration;
        addPopup('자석!', it.x, iy - 20, '#7fd1ff');
      } else if (it.type === 'double') {
        g.effects.double = C.items.doubleDuration;
        addPopup('코인 x2!', it.x, iy - 20, '#ffd84a');
      }
    }

    // 파티클·팝업
    for (i = 0; i < g.particles.length; i++) {
      var pt = g.particles[i];
      pt.vy += 900 * dt; pt.x += pt.vx * dt - dx; pt.y += pt.vy * dt; pt.life -= dt;
    }
    for (i = 0; i < g.popups.length; i++) { g.popups[i].y -= 50 * dt; g.popups[i].life -= dt; }

    // 화면 밖·사용한 것 정리
    g.obstacles = g.obstacles.filter(function (o) { return !o.dead && o.x + o.w > -60; });
    g.coins = g.coins.filter(function (o) { return !o.taken && o.x > -30; });
    g.items = g.items.filter(function (o) { return !o.taken && o.x > -30; });
    g.particles = g.particles.filter(function (o) { return o.life > 0; });
    g.popups = g.popups.filter(function (o) { return o.life > 0; });
  }

  function gapUnder(x) {
    for (var i = 0; i < g.obstacles.length; i++) {
      var o = g.obstacles[i];
      if (o.type === 'gap' && x > o.x && x < o.x + o.w) return o;
    }
    return null;
  }

  // =====================================================
  // 그리기
  // =====================================================
  var FONT = '"Apple SD Gothic Neo", "Malgun Gothic", "Noto Sans KR", sans-serif';
  var OUTLINE = '#1c2033';

  // 둥근 사각형 경로
  function rrect(x, y, w, h, r) {
    r = Math.min(r, w / 2, h / 2);
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }

  // 바닥 그림자
  function shadow(cx, w, alpha) {
    ctx.fillStyle = 'rgba(0,0,0,' + (alpha || 0.25) + ')';
    ctx.beginPath(); ctx.ellipse(cx, GROUND + 3, w / 2, 4, 0, 0, Math.PI * 2); ctx.fill();
  }

  // ---------- 배경 ----------
  // 그라디언트는 한 번만 만들어 재사용
  var skyGrad = ctx.createLinearGradient(0, 0, 0, GROUND);
  skyGrad.addColorStop(0, '#2c3550');
  skyGrad.addColorStop(0.55, '#4f5874');
  skyGrad.addColorStop(1, '#a8877e');
  var hazeGrad = ctx.createLinearGradient(0, GROUND - 220, 0, GROUND);
  hazeGrad.addColorStop(0, 'rgba(168,135,126,0)');
  hazeGrad.addColorStop(1, 'rgba(168,135,126,0.35)');
  var groundGrad = ctx.createLinearGradient(0, GROUND, 0, GROUND + 51);
  groundGrad.addColorStop(0, '#6b7084');
  groundGrad.addColorStop(1, '#565a6d');
  var pitGrad = ctx.createLinearGradient(0, GROUND, 0, H);
  pitGrad.addColorStop(0, '#191b29');
  pitGrad.addColorStop(1, '#07080d');
  var moonGlow = ctx.createRadialGradient(770, 96, 20, 770, 96, 110);
  moonGlow.addColorStop(0, 'rgba(240,225,200,0.22)');
  moonGlow.addColorStop(1, 'rgba(240,225,200,0)');
  var vignette = ctx.createRadialGradient(W / 2, H / 2, H * 0.45, W / 2, H / 2, W * 0.7);
  vignette.addColorStop(0, 'rgba(0,0,0,0)');
  vignette.addColorStop(1, 'rgba(0,0,0,0.28)');

  // 건물 한 겹. 창문 불빛은 생성할 때 한 번만 정해서 스크롤해도 깜빡이지 않음
  function makeSkyline(opt) {
    var list = [], x = 0;
    for (var i = 0; i < opt.count; i++) {
      var w = Math.round(rand(opt.minW, opt.maxW));
      var h = Math.round(rand(opt.minH, opt.maxH));
      var b = { x: x, w: w, h: h, roof: Math.random(), windows: [] };
      if (opt.lit) {
        for (var wy = 16; wy < h - 20; wy += 22) {
          for (var wx = 10; wx < w - 16; wx += 18) {
            if (Math.random() < opt.lit) b.windows.push(wx, wy);
          }
        }
      }
      list.push(b);
      x += w + Math.round(rand(opt.minSpace, opt.maxSpace));
    }
    return { list: list, length: x, opt: opt };
  }

  var farCity = makeSkyline({ count: 22, minW: 50, maxW: 110, minH: 150, maxH: 260, minSpace: 0, maxSpace: 12,
    color: '#5a6280', parallax: 0.08 });
  var midCity = makeSkyline({ count: 16, minW: 70, maxW: 130, minH: 110, maxH: 220, minSpace: 10, maxSpace: 40,
    color: '#414a66', edge: 'rgba(255,255,255,0.04)', lit: 0.16, windowColor: 'rgba(255,222,170,0.22)', parallax: 0.2 });
  var nearCity = makeSkyline({ count: 12, minW: 90, maxW: 160, minH: 70, maxH: 170, minSpace: 40, maxSpace: 90,
    color: '#2d3349', edge: 'rgba(255,255,255,0.05)', lit: 0.22, windowColor: 'rgba(255,208,150,0.42)', parallax: 0.45 });

  var clouds = [];
  for (var ci = 0; ci < 6; ci++) clouds.push({ x: ci * 230 + rand(0, 80), y: rand(50, 190), w: rand(90, 170) });

  // 지붕 장식 (물탱크·안테나·계단식 옥상)
  function drawRoof(b, x, top, color) {
    ctx.fillStyle = color;
    if (b.roof < 0.25 && b.w > 60) {
      var tx = x + b.w * 0.6;
      ctx.fillRect(tx + 2, top - 8, 3, 8);
      ctx.fillRect(tx + 19, top - 8, 3, 8);
      rrect(tx, top - 26, 24, 19, 4); ctx.fill();
    } else if (b.roof < 0.5) {
      ctx.fillRect(x + b.w * 0.3, top - 30, 2, 30);
      ctx.fillRect(x + b.w * 0.3 - 6, top - 22, 14, 2);
    } else if (b.roof < 0.7) {
      ctx.fillRect(x + b.w * 0.2, top - 14, b.w * 0.5, 14);
    } else {
      ctx.fillRect(x - 3, top, b.w + 6, 4);
    }
  }

  function drawSkyline(layer, scroll) {
    var o = layer.opt, len = layer.length;
    var start = -((scroll * o.parallax) % len);
    for (var rep = 0; rep < 2; rep++) {
      for (var i = 0; i < layer.list.length; i++) {
        var b = layer.list[i];
        var x = Math.round(start + rep * len + b.x);
        if (x > W + 10 || x + b.w < -10) continue;
        var top = GROUND - b.h;
        ctx.fillStyle = o.color;
        ctx.fillRect(x, top, b.w, b.h);
        drawRoof(b, x, top, o.color);
        if (o.edge) { ctx.fillStyle = o.edge; ctx.fillRect(x, top, 3, b.h); }
        if (b.windows.length) {
          ctx.fillStyle = o.windowColor;
          for (var k = 0; k < b.windows.length; k += 2) ctx.fillRect(x + b.windows[k], top + b.windows[k + 1], 8, 10);
        }
      }
    }
  }

  // 가로등 (불빛은 고정, 깜빡이지 않음)
  function drawLamps(scroll) {
    var gap = 420, off = (scroll * 0.7) % gap;
    for (var x = -off + 60; x < W + 40; x += gap) {
      var lx = Math.round(x);
      var glow = ctx.createRadialGradient(lx + 18, GROUND - 150, 4, lx + 18, GROUND - 150, 80);
      glow.addColorStop(0, 'rgba(255,220,160,0.22)');
      glow.addColorStop(1, 'rgba(255,220,160,0)');
      ctx.fillStyle = glow;
      ctx.fillRect(lx - 70, GROUND - 240, 180, 180);
      ctx.fillStyle = '#20253a';
      ctx.fillRect(lx - 2, GROUND - 160, 4, 160);
      ctx.fillRect(lx - 2, GROUND - 162, 22, 3);
      rrect(lx + 10, GROUND - 160, 16, 7, 3); ctx.fill();
      ctx.fillStyle = '#f5ddb0';
      ctx.fillRect(lx + 12, GROUND - 154, 12, 2);
    }
  }

  function drawCityBg(scroll) {
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, W, GROUND);
    // 달
    ctx.fillStyle = moonGlow;
    ctx.fillRect(650, 0, 240, 220);
    ctx.fillStyle = '#efe3cc';
    ctx.beginPath(); ctx.arc(770, 96, 30, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = 'rgba(0,0,0,0.05)';
    ctx.beginPath(); ctx.arc(760, 90, 7, 0, Math.PI * 2); ctx.arc(781, 106, 5, 0, Math.PI * 2); ctx.fill();
    // 구름
    ctx.fillStyle = 'rgba(235,220,215,0.08)';
    var loopW = W + 400;
    for (var i = 0; i < clouds.length; i++) {
      var c = clouds[i];
      var cx = ((c.x - scroll * 0.03) % loopW + loopW) % loopW - 200;
      ctx.beginPath();
      ctx.ellipse(cx, c.y, c.w / 2, 14, 0, 0, Math.PI * 2);
      ctx.ellipse(cx - c.w * 0.18, c.y - 9, c.w * 0.25, 13, 0, 0, Math.PI * 2);
      ctx.ellipse(cx + c.w * 0.15, c.y - 7, c.w * 0.2, 11, 0, 0, Math.PI * 2);
      ctx.fill();
    }
    drawSkyline(farCity, scroll);
    ctx.fillStyle = hazeGrad;
    ctx.fillRect(0, GROUND - 220, W, 220);
    drawSkyline(midCity, scroll);
    drawSkyline(nearCity, scroll);
    drawLamps(scroll);
  }

  function drawCityGround(scroll) {
    var x;
    // 보도
    ctx.fillStyle = groundGrad;
    ctx.fillRect(0, GROUND, W, 51);
    ctx.fillStyle = '#a3a8b8';
    ctx.fillRect(0, GROUND, W, 5);
    ctx.fillStyle = '#7b8093';
    ctx.fillRect(0, GROUND + 5, W, 3);
    ctx.fillStyle = 'rgba(0,0,0,0.14)';
    var tile = 64;
    for (x = -(scroll % tile); x < W; x += tile) ctx.fillRect(Math.round(x), GROUND + 8, 2, 20);
    for (x = -(scroll % tile) + 32; x < W; x += tile) ctx.fillRect(Math.round(x), GROUND + 30, 2, 21);
    ctx.fillRect(0, GROUND + 28, W, 2);
    // 연석과 차도
    ctx.fillStyle = '#8c91a3';
    ctx.fillRect(0, GROUND + 51, W, 4);
    ctx.fillStyle = '#33374a';
    ctx.fillRect(0, GROUND + 55, W, H - GROUND - 55);
    ctx.fillStyle = 'rgba(225,215,175,0.3)';
    for (x = -(scroll % 180); x < W; x += 180) ctx.fillRect(Math.round(x), GROUND + 78, 80, 4);
  }

  // 도시: 건물 사이 틈
  function drawCityPit(o) {
    ctx.fillStyle = pitGrad;
    ctx.fillRect(o.x, GROUND, o.w, H - GROUND);
    // 안쪽 벽면 (왼쪽은 밝게, 오른쪽은 어둡게)
    ctx.fillStyle = 'rgba(255,255,255,0.06)';
    ctx.fillRect(o.x, GROUND, 10, H - GROUND);
    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    ctx.fillRect(o.x + o.w - 10, GROUND, 10, H - GROUND);
    ctx.fillStyle = 'rgba(255,255,255,0.035)';
    for (var by = GROUND + 16; by < H; by += 16) ctx.fillRect(o.x + 10, by, o.w - 20, 2);
    // 가장자리 경고 표시
    ctx.fillStyle = '#d9b44a';
    ctx.fillRect(o.x - 5, GROUND, 5, 5);
    ctx.fillRect(o.x + o.w, GROUND, 5, 5);
  }

  // ---------- 장애물 ----------
  // 태클로 부술 수 있다는 빨간 X (흰 테두리로 잘 보이게)
  function drawX(cx, cy, s) {
    ctx.save();
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(cx - s, cy - s); ctx.lineTo(cx + s, cy + s);
    ctx.moveTo(cx + s, cy - s); ctx.lineTo(cx - s, cy + s);
    ctx.strokeStyle = 'rgba(255,255,255,0.9)'; ctx.lineWidth = 9; ctx.stroke();
    ctx.strokeStyle = '#e8262e'; ctx.lineWidth = 5; ctx.stroke();
    ctx.restore();
  }

  function drawCityObstacle(o) {
    var x = Math.round(o.x), y = o.y, w = o.w, h = o.h;
    var grad;
    ctx.lineJoin = 'round';
    if (o.type === 'hydrant') {
      shadow(x + w / 2, w + 6);
      grad = ctx.createLinearGradient(x, 0, x + w, 0);
      grad.addColorStop(0, '#e2575b'); grad.addColorStop(1, '#a8283a');
      ctx.fillStyle = grad;
      rrect(x + 5, y + 12, w - 10, h - 16, 3); ctx.fill();
      ctx.fillStyle = '#c3343f';
      ctx.beginPath(); ctx.arc(x + w / 2, y + 13, w / 2 - 4, Math.PI, 0); ctx.fill();
      ctx.fillStyle = '#d9b44a';
      rrect(x + w / 2 - 3, y + 1, 6, 6, 2); ctx.fill();
      ctx.fillStyle = '#9a2431';
      rrect(x, y + 19, w, 9, 3); ctx.fill();
      ctx.fillStyle = '#d9b44a';
      ctx.beginPath(); ctx.arc(x + 3, y + 23.5, 2.5, 0, Math.PI * 2); ctx.arc(x + w - 3, y + 23.5, 2.5, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = 'rgba(255,255,255,0.22)';
      ctx.fillRect(x + 8, y + 30, 3, h - 38);
      ctx.fillStyle = '#7a1b27';
      rrect(x + 1, y + h - 6, w - 2, 6, 2); ctx.fill();
    } else if (o.type === 'box') {
      shadow(x + w / 2, w + 8);
      ctx.fillStyle = '#c48a52';
      rrect(x, y, w, h, 3); ctx.fill();
      ctx.fillStyle = '#d9a46d';
      ctx.fillRect(x + 2, y + 2, w - 4, 7);               // 윗면 밝게
      ctx.fillStyle = 'rgba(0,0,0,0.12)';
      ctx.fillRect(x + w - 8, y + 9, 6, h - 11);          // 오른쪽 그늘
      ctx.fillStyle = '#e7d5a6';
      ctx.fillRect(x + w / 2 - 4, y, 8, h);               // 테이프
      ctx.fillStyle = '#f4f1e8';
      ctx.fillRect(x + 5, y + h - 14, 12, 8);             // 송장
      ctx.strokeStyle = '#7a5130'; ctx.lineWidth = 2;
      rrect(x + 1, y + 1, w - 2, h - 2, 3); ctx.stroke();
      drawX(x + w / 2, y + h / 2 + 2, 9);
    } else if (o.type === 'sign') {
      var boardTop = y + h - 70;
      // 고가 구조물
      ctx.fillStyle = '#3c4256';
      ctx.fillRect(x - 24, 0, w + 48, 20);
      ctx.fillStyle = '#4d5469';
      ctx.fillRect(x - 24, 16, w + 48, 4);
      ctx.fillStyle = '#7b8196';
      for (var rv = x - 16; rv < x + w + 24; rv += 16) ctx.fillRect(rv, 7, 3, 3);
      // 쇠사슬
      ctx.strokeStyle = '#8d93a6'; ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(x + 12, 20); ctx.lineTo(x + 12, boardTop);
      ctx.moveTo(x + w - 12, 20); ctx.lineTo(x + w - 12, boardTop);
      ctx.stroke();
      // 간판
      ctx.fillStyle = '#1f2840';
      rrect(x, boardTop, w, 70, 6); ctx.fill();
      ctx.strokeStyle = OUTLINE; ctx.lineWidth = 2; ctx.stroke();
      ctx.save();
      ctx.shadowColor = 'rgba(120,220,230,0.6)'; ctx.shadowBlur = 8;
      ctx.strokeStyle = '#8ad7de'; ctx.lineWidth = 2.5;
      rrect(x + 5, boardTop + 5, w - 10, 50, 4); ctx.stroke();
      ctx.shadowColor = 'rgba(255,150,200,0.6)';
      ctx.fillStyle = '#f5a8cf';
      ctx.font = 'bold 18px ' + FONT;
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText(o.label, x + w / 2, boardTop + 31);
      ctx.restore();
      // 아래 경고 줄무늬 (숙이라는 표시)
      ctx.save();
      rrect(x, boardTop + 60, w, 10, 3); ctx.clip();
      ctx.fillStyle = '#e3c04b'; ctx.fillRect(x, boardTop + 60, w, 10);
      ctx.fillStyle = '#2a2a2a';
      for (var sx = x - 10; sx < x + w; sx += 14) {
        ctx.beginPath();
        ctx.moveTo(sx, boardTop + 70); ctx.lineTo(sx + 7, boardTop + 60);
        ctx.lineTo(sx + 13, boardTop + 60); ctx.lineTo(sx + 6, boardTop + 70); ctx.fill();
      }
      ctx.restore();
    } else if (o.type === 'barricade') {
      shadow(x + w / 2, w + 20, 0.3);
      // 기둥과 받침
      ctx.fillStyle = '#5b6073';
      ctx.fillRect(x - 3, y + 6, 4, h - 6);
      ctx.fillRect(x + w - 1, y + 6, 4, h - 6);
      ctx.fillStyle = '#3a3e4e';
      rrect(x - 10, GROUND - 7, 20, 7, 2); ctx.fill();
      rrect(x + w - 10, GROUND - 7, 20, 7, 2); ctx.fill();
      // 줄무늬 패널
      var py = y + 10, ph = h - 26;
      ctx.save();
      rrect(x, py, w, ph, 3); ctx.clip();
      ctx.fillStyle = '#f1ede4';
      ctx.fillRect(x, py, w, ph);
      ctx.fillStyle = '#e8792e';
      for (var s = -w; s < ph + w; s += 30) {
        ctx.beginPath();
        ctx.moveTo(x, py + s); ctx.lineTo(x + w, py + s - 22);
        ctx.lineTo(x + w, py + s - 7); ctx.lineTo(x, py + s + 15);
        ctx.fill();
      }
      ctx.fillStyle = 'rgba(0,0,0,0.1)';
      ctx.fillRect(x + w - 7, py, 7, ph);
      ctx.restore();
      ctx.strokeStyle = OUTLINE; ctx.lineWidth = 2;
      rrect(x, py, w, ph, 3); ctx.stroke();
      // '공사중' 표지
      ctx.fillStyle = '#e3c04b';
      rrect(x - 6, py + 26, w + 12, 22, 3); ctx.fill();
      ctx.stroke();
      ctx.fillStyle = '#2a2a2a';
      ctx.font = 'bold 12px ' + FONT;
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText('공사중', x + w / 2, py + 37);
      // 경고등 (천천히 은은하게)
      var pulse = 0.55 + 0.25 * Math.sin(performance.now() / 500);
      ctx.fillStyle = 'rgba(255,190,70,' + (pulse * 0.35) + ')';
      ctx.beginPath(); ctx.arc(x + w / 2, y + 2, 12, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = 'rgba(255,200,80,' + pulse + ')';
      ctx.beginPath(); ctx.arc(x + w / 2, y + 2, 6, 0, Math.PI * 2); ctx.fill();
      drawX(x + w / 2, py + ph / 2 + 20, 13);
    }
  }

  // =====================================================
  // 스테이지별 배경·바닥·장애물 (정글, 구름 위 하늘)
  // =====================================================

  // 번호로 고정된 랜덤값 (매 프레임 같은 값이라 깜빡이지 않음)
  // 경로에 원 추가 (moveTo로 끊어서 원끼리 선으로 이어지지 않게)
  function circ(x, y, r) { ctx.moveTo(x + r, y); ctx.arc(x, y, r, 0, Math.PI * 2); }

  function hash(n) { var s = Math.sin(n * 127.1 + 311.7) * 43758.5453; return s - Math.floor(s); }

  // 배경 소품 목록: x 간격과 크기만 미리 정해 두고 반복해서 그림
  function makeProps(count, minGap, maxGap, minH, maxH, minR, maxR) {
    var list = [], x = 0;
    for (var i = 0; i < count; i++) {
      list.push({ x: x, h: rand(minH, maxH), r: rand(minR, maxR), s: Math.random() });
      x += rand(minGap, maxGap);
    }
    return { list: list, length: x };
  }

  function eachProp(layer, scroll, parallax, margin, fn) {
    var len = layer.length, start = -((scroll * parallax) % len);
    for (var rep = 0; rep < 2; rep++) {
      for (var i = 0; i < layer.list.length; i++) {
        var x = start + rep * len + layer.list[i].x;
        if (x > -margin && x < W + margin) fn(layer.list[i], Math.round(x));
      }
    }
  }

  // ---------- 정글 ----------
  var jungleSky = ctx.createLinearGradient(0, 0, 0, GROUND);
  jungleSky.addColorStop(0, '#2f4b4b');
  jungleSky.addColorStop(0.6, '#5d7f6f');
  jungleSky.addColorStop(1, '#b7b88f');
  var jungleHaze = ctx.createLinearGradient(0, GROUND - 200, 0, GROUND);
  jungleHaze.addColorStop(0, 'rgba(183,184,143,0)');
  jungleHaze.addColorStop(1, 'rgba(183,184,143,0.35)');
  var jungleSun = ctx.createRadialGradient(760, 110, 10, 760, 110, 120);
  jungleSun.addColorStop(0, 'rgba(245,235,190,0.3)');
  jungleSun.addColorStop(1, 'rgba(245,235,190,0)');
  var jungleDirt = ctx.createLinearGradient(0, GROUND, 0, H);
  jungleDirt.addColorStop(0, '#6a4f36');
  jungleDirt.addColorStop(1, '#3e2e20');
  var waterGrad = ctx.createLinearGradient(0, GROUND + 12, 0, H);
  waterGrad.addColorStop(0, '#3c6e68');
  waterGrad.addColorStop(1, '#173331');

  var jungleMid = makeProps(14, 70, 130, 130, 230, 34, 56);
  var jungleNear = makeProps(9, 150, 250, 170, 290, 50, 80);
  var jungleVines = makeProps(10, 90, 170, 60, 170, 0, 0);
  var jungleBush = makeProps(12, 80, 160, 0, 0, 22, 40);

  function drawTree(x, h, r, trunk, leaf) {
    var top = GROUND - h;
    ctx.fillStyle = trunk;
    ctx.fillRect(x - r * 0.14, top, r * 0.28, h);
    ctx.fillStyle = leaf;
    ctx.beginPath();
    circ(x, top, r);
    circ(x - r * 0.75, top + r * 0.3, r * 0.75);
    circ(x + r * 0.75, top + r * 0.25, r * 0.8);
    ctx.fill();
    ctx.fillStyle = 'rgba(255,255,220,0.05)';
    ctx.beginPath(); circ(x - r * 0.25, top - r * 0.3, r * 0.55); ctx.fill();
  }

  function drawJungleBg(scroll) {
    var x;
    ctx.fillStyle = jungleSky;
    ctx.fillRect(0, 0, W, GROUND);
    ctx.fillStyle = jungleSun;
    ctx.fillRect(620, 0, 280, 240);
    ctx.fillStyle = '#efe5bf';
    ctx.beginPath(); circ(760, 110, 26); ctx.fill();
    // 먼 언덕
    var off = scroll * 0.06;
    ctx.fillStyle = '#5f8070';
    ctx.beginPath(); ctx.moveTo(0, GROUND);
    for (x = 0; x <= W; x += 10) {
      ctx.lineTo(x, GROUND - 160 - Math.sin((x + off) * 0.005) * 45 - Math.sin((x + off) * 0.013 + 1) * 18);
    }
    ctx.lineTo(W, GROUND); ctx.fill();
    ctx.fillStyle = jungleHaze;
    ctx.fillRect(0, GROUND - 200, W, 200);
    // 나무 두 겹
    eachProp(jungleMid, scroll, 0.22, 120, function (t, px) { drawTree(px, t.h, t.r, '#3f5a49', '#46695a'); });
    eachProp(jungleNear, scroll, 0.45, 160, function (t, px) { drawTree(px, t.h, t.r, '#2c4034', '#2f4f3d'); });
    // 덤불
    eachProp(jungleBush, scroll, 0.7, 60, function (b, px) {
      ctx.fillStyle = '#2a4532';
      ctx.beginPath();
      ctx.arc(px, GROUND, b.r, Math.PI, 0);
      ctx.arc(px + b.r * 0.9, GROUND, b.r * 0.7, Math.PI, 0);
      ctx.fill();
    });
    // 위에서 늘어진 덩굴
    eachProp(jungleVines, scroll, 0.6, 40, function (v, px) {
      ctx.strokeStyle = '#2b4a36'; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.moveTo(px, 0); ctx.quadraticCurveTo(px + 14, v.h * 0.5, px + 4, v.h); ctx.stroke();
      ctx.fillStyle = '#365d42';
      for (var ly = 24; ly < v.h; ly += 28) {
        ctx.beginPath(); ctx.ellipse(px + 9 + (ly % 56 ? 6 : -6), ly, 7, 4, ly % 56 ? 0.5 : -0.5, 0, Math.PI * 2); ctx.fill();
      }
    });
  }

  function drawJungleGround(scroll) {
    var x;
    ctx.fillStyle = jungleDirt;
    ctx.fillRect(0, GROUND, W, H - GROUND);
    // 흙 속 돌멩이 (타일 번호로 위치 고정)
    var tile = 90, first = Math.floor(scroll / tile);
    ctx.fillStyle = 'rgba(0,0,0,0.16)';
    for (var i = first; i < first + W / tile + 2; i++) {
      x = i * tile - scroll;
      ctx.beginPath();
      ctx.ellipse(x + hash(i) * 60, GROUND + 28 + hash(i + 7) * 55, 5 + hash(i + 3) * 6, 3 + hash(i + 5) * 2, 0, 0, Math.PI * 2);
      ctx.fill();
    }
    // 잔디
    ctx.fillStyle = '#5c8b47';
    ctx.fillRect(0, GROUND, W, 9);
    ctx.fillStyle = '#466f37';
    ctx.fillRect(0, GROUND + 9, W, 3);
    ctx.fillStyle = '#6b9c54';
    var gt = 22, gf = Math.floor(scroll / gt);
    for (i = gf; i < gf + W / gt + 2; i++) {
      x = i * gt - scroll;
      var gh = 4 + hash(i) * 6;
      ctx.beginPath(); ctx.moveTo(x, GROUND + 1); ctx.lineTo(x + 4, GROUND - gh); ctx.lineTo(x + 8, GROUND + 1); ctx.fill();
    }
  }

  // 정글: 물웅덩이
  function drawJunglePit(o) {
    ctx.fillStyle = '#3a2a1c';
    ctx.fillRect(o.x, GROUND, o.w, H - GROUND);
    ctx.fillStyle = waterGrad;
    ctx.fillRect(o.x, GROUND + 14, o.w, H - GROUND - 14);
    // 잔잔한 물결
    var t = performance.now() / 1000;
    ctx.fillStyle = 'rgba(220,240,230,0.18)';
    for (var i = 0; i < 4; i++) {
      var wx = o.x + 10 + ((t * 14 + i * 41) % Math.max(1, o.w - 40));
      ctx.fillRect(wx, GROUND + 22 + i * 16, 18, 2);
    }
    // 둑의 풀
    ctx.fillStyle = '#5c8b47';
    ctx.fillRect(o.x - 4, GROUND, 6, 10);
    ctx.fillRect(o.x + o.w - 2, GROUND, 6, 10);
  }

  function drawJungleObstacle(o) {
    var x = Math.round(o.x), y = o.y, w = o.w, h = o.h, grad, i;
    ctx.lineJoin = 'round';
    if (o.type === 'hydrant') {
      // 나무 그루터기
      shadow(x + w / 2, w + 10);
      grad = ctx.createLinearGradient(x, 0, x + w, 0);
      grad.addColorStop(0, '#8c6744'); grad.addColorStop(1, '#5a3f28');
      ctx.fillStyle = grad;
      rrect(x + 1, y + 8, w - 2, h - 8, 3); ctx.fill();
      ctx.fillStyle = '#5a3f28';
      ctx.beginPath(); ctx.moveTo(x - 5, GROUND); ctx.lineTo(x + 3, GROUND - 14); ctx.lineTo(x + 8, GROUND); ctx.fill();
      ctx.beginPath(); ctx.moveTo(x + w + 5, GROUND); ctx.lineTo(x + w - 3, GROUND - 12); ctx.lineTo(x + w - 8, GROUND); ctx.fill();
      ctx.fillStyle = 'rgba(0,0,0,0.18)';
      ctx.fillRect(x + 8, y + 16, 2, h - 22);
      ctx.fillRect(x + 18, y + 20, 2, h - 26);
      ctx.fillStyle = '#c9a074';
      ctx.beginPath(); ctx.ellipse(x + w / 2, y + 8, w / 2 - 1, 6, 0, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = '#9c7650'; ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.ellipse(x + w / 2, y + 8, w / 4, 3, 0, 0, Math.PI * 2); ctx.stroke();
      ctx.fillStyle = '#6a9a4e';
      ctx.beginPath(); ctx.ellipse(x + 6, y + h - 5, 9, 5, 0, 0, Math.PI * 2); ctx.fill();
    } else if (o.type === 'box') {
      // 나무 상자
      shadow(x + w / 2, w + 8);
      ctx.fillStyle = '#a8763f';
      rrect(x, y, w, h, 2); ctx.fill();
      ctx.fillStyle = 'rgba(0,0,0,0.18)';
      ctx.fillRect(x, y + h / 3, w, 2);
      ctx.fillRect(x, y + h * 2 / 3, w, 2);
      ctx.strokeStyle = '#6b4622'; ctx.lineWidth = 4;
      rrect(x + 2, y + 2, w - 4, h - 4, 2); ctx.stroke();
      ctx.lineWidth = 3;
      ctx.beginPath(); ctx.moveTo(x + 4, y + h - 4); ctx.lineTo(x + w - 4, y + 4); ctx.stroke();
      ctx.fillStyle = '#d8c3a0';
      ctx.fillRect(x + 4, y + 4, 3, 3); ctx.fillRect(x + w - 7, y + 4, 3, 3);
      ctx.fillRect(x + 4, y + h - 7, 3, 3); ctx.fillRect(x + w - 7, y + h - 7, 3, 3);
      drawX(x + w / 2, y + h / 2, 9);
    } else if (o.type === 'sign') {
      // 덩굴에 매달린 통나무
      var logTop = y + h - 40;
      ctx.strokeStyle = '#3d6b45'; ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(x + 14, 0); ctx.quadraticCurveTo(x + 4, logTop / 2, x + 14, logTop + 6);
      ctx.moveTo(x + w - 14, 0); ctx.quadraticCurveTo(x + w - 4, logTop / 2, x + w - 14, logTop + 6);
      ctx.stroke();
      ctx.fillStyle = '#4f8656';
      for (i = 40; i < logTop - 10; i += 36) {
        ctx.beginPath(); ctx.ellipse(x + 18, i, 7, 4, 0.6, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.ellipse(x + w - 18, i + 18, 7, 4, -0.6, 0, Math.PI * 2); ctx.fill();
      }
      grad = ctx.createLinearGradient(0, logTop, 0, logTop + 40);
      grad.addColorStop(0, '#8c6744'); grad.addColorStop(1, '#5a3f28');
      ctx.fillStyle = grad;
      rrect(x - 6, logTop, w + 6, 40, 18); ctx.fill();
      ctx.strokeStyle = OUTLINE; ctx.lineWidth = 2; ctx.stroke();
      ctx.fillStyle = 'rgba(0,0,0,0.15)';
      ctx.fillRect(x + 6, logTop + 12, w - 30, 2);
      ctx.fillRect(x + 14, logTop + 25, w - 34, 2);
      ctx.fillStyle = '#c9a074';
      ctx.beginPath(); ctx.ellipse(x + w - 4, logTop + 20, 9, 18, 0, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = '#9c7650'; ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.ellipse(x + w - 4, logTop + 20, 4, 9, 0, 0, Math.PI * 2); ctx.stroke();
    } else if (o.type === 'barricade') {
      // 대나무 울타리
      shadow(x + w / 2, w + 16, 0.3);
      for (i = 0; i < 3; i++) {
        var bx = x + i * 14, top = y + (i === 1 ? 0 : 12);
        grad = ctx.createLinearGradient(bx, 0, bx + 14, 0);
        grad.addColorStop(0, '#93b86a'); grad.addColorStop(1, '#5f8442');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.moveTo(bx, GROUND); ctx.lineTo(bx, top + 8); ctx.lineTo(bx + 14, top); ctx.lineTo(bx + 14, GROUND);
        ctx.fill();
        ctx.strokeStyle = OUTLINE; ctx.lineWidth = 1.5; ctx.stroke();
        ctx.fillStyle = '#4e7036';
        for (var ny = top + 36; ny < GROUND - 10; ny += 36) ctx.fillRect(bx + 1, ny, 12, 3);
      }
      ctx.fillStyle = '#cdb07c';
      ctx.fillRect(x - 3, y + 50, w + 6, 6);
      ctx.fillRect(x - 3, GROUND - 60, w + 6, 6);
      ctx.fillStyle = '#4f8656';
      ctx.beginPath(); ctx.ellipse(x + 4, y + 10, 10, 4, -0.7, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.ellipse(x + w - 2, y + 18, 10, 4, 0.7, 0, Math.PI * 2); ctx.fill();
      drawX(x + w / 2, y + h / 2 + 10, 13);
    }
  }

  // ---------- 구름 위 하늘 ----------
  var skyGradDay = ctx.createLinearGradient(0, 0, 0, GROUND);
  skyGradDay.addColorStop(0, '#5f82b4');
  skyGradDay.addColorStop(0.6, '#9db9d9');
  skyGradDay.addColorStop(1, '#e3d8cf');
  var skySun = ctx.createRadialGradient(220, 100, 10, 220, 100, 130);
  skySun.addColorStop(0, 'rgba(255,250,235,0.45)');
  skySun.addColorStop(1, 'rgba(255,250,235,0)');
  var cloudGround = ctx.createLinearGradient(0, GROUND, 0, H);
  cloudGround.addColorStop(0, '#f4f1f6');
  cloudGround.addColorStop(1, '#cfc8de');
  var skyPit = ctx.createLinearGradient(0, GROUND, 0, H);
  skyPit.addColorStop(0, '#b4cbe6');
  skyPit.addColorStop(1, '#dde7f2');

  var skyFar = makeProps(10, 120, 200, 0, 40, 50, 80);
  var skyMid = makeProps(8, 160, 260, 60, 220, 22, 40);
  var skyBirds = makeProps(6, 220, 400, 70, 200, 0, 0);
  var skyNear = makeProps(10, 100, 180, 0, 26, 28, 46);

  // 몽실몽실한 구름 한 덩이
  function puff(x, y, r) {
    ctx.beginPath();
    circ(x, y, r);
    circ(x - r * 0.9, y + r * 0.25, r * 0.7);
    circ(x + r * 0.9, y + r * 0.3, r * 0.65);
    circ(x + r * 0.3, y - r * 0.35, r * 0.75);
    ctx.fill();
  }

  function drawSkyBg(scroll) {
    ctx.fillStyle = skyGradDay;
    ctx.fillRect(0, 0, W, GROUND);
    ctx.fillStyle = skySun;
    ctx.fillRect(80, 0, 280, 240);
    ctx.fillStyle = '#fbf6ea';
    ctx.beginPath(); circ(220, 100, 24); ctx.fill();
    // 먼 구름 언덕
    ctx.fillStyle = 'rgba(255,255,255,0.32)';
    eachProp(skyFar, scroll, 0.05, 120, function (c, px) { puff(px, GROUND - 70 - c.h, c.r); });
    ctx.fillRect(0, GROUND - 70, W, 70);
    // 떠다니는 구름
    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    eachProp(skyMid, scroll, 0.15, 80, function (c, px) { puff(px, GROUND - 120 - c.h, c.r); });
    // 멀리 나는 새
    ctx.strokeStyle = 'rgba(60,70,100,0.35)'; ctx.lineWidth = 1.5;
    eachProp(skyBirds, scroll, 0.3, 20, function (b, px) {
      ctx.beginPath();
      ctx.moveTo(px - 6, b.h - 3); ctx.quadraticCurveTo(px - 3, b.h - 4, px, b.h);
      ctx.quadraticCurveTo(px + 3, b.h - 4, px + 6, b.h - 3);
      ctx.stroke();
    });
    // 가까운 구름
    ctx.fillStyle = 'rgba(255,255,255,0.7)';
    eachProp(skyNear, scroll, 0.4, 80, function (c, px) { puff(px, GROUND - 8 - c.h, c.r); });
  }

  function drawSkyGround(scroll) {
    var i, x;
    ctx.fillStyle = cloudGround;
    ctx.fillRect(0, GROUND, W, H - GROUND);
    // 윗면의 몽실한 굴곡 (발이 묻히지 않게 바닥선 근처까지만)
    ctx.fillStyle = '#f7f4f8';
    var tile = 36, first = Math.floor(scroll / tile);
    for (i = first; i < first + W / tile + 2; i++) {
      x = i * tile - scroll;
      var r = 12 + hash(i) * 8;
      ctx.beginPath(); circ(x + 18, GROUND + r - 4, r); ctx.fill();
    }
    // 아래쪽 은은한 그늘
    ctx.fillStyle = 'rgba(170,160,205,0.22)';
    tile = 80; first = Math.floor(scroll / tile);
    for (i = first; i < first + W / tile + 2; i++) {
      x = i * tile - scroll;
      ctx.beginPath(); ctx.ellipse(x + 40, GROUND + 74 + hash(i) * 10, 34, 8, 0, 0, Math.PI * 2); ctx.fill();
    }
  }

  // 하늘: 구름 사이로 보이는 아래 하늘
  function drawSkyPit(o) {
    ctx.fillStyle = skyPit;
    ctx.fillRect(o.x, GROUND - 6, o.w, H - GROUND + 6);
    ctx.fillStyle = 'rgba(255,255,255,0.55)';
    puff(o.x + o.w * 0.45, GROUND + 70, 9);
    ctx.fillStyle = 'rgba(150,140,190,0.25)';
    ctx.fillRect(o.x, GROUND - 2, 6, H - GROUND);
    ctx.fillRect(o.x + o.w - 6, GROUND - 2, 6, H - GROUND);
  }

  function drawSkyObstacle(o) {
    var x = Math.round(o.x), y = o.y, w = o.w, h = o.h, grad, i;
    ctx.lineJoin = 'round';
    if (o.type === 'hydrant') {
      // 심술 난 먹구름
      shadow(x + w / 2, w + 14, 0.18);
      ctx.fillStyle = '#7f889e';
      ctx.beginPath();
      circ(x + w / 2, y + h - 14, 16);
      circ(x + 3, y + h - 9, 10);
      circ(x + w - 3, y + h - 9, 10);
      circ(x + w / 2 + 2, y + 16, 14);
      ctx.fill();
      ctx.fillStyle = 'rgba(255,255,255,0.15)';
      ctx.beginPath(); circ(x + w / 2 - 3, y + 12, 7); ctx.fill();
      ctx.fillStyle = '#2d3242';
      ctx.fillRect(x + 9, y + 24, 3, 4); ctx.fillRect(x + 19, y + 24, 3, 4);
      ctx.strokeStyle = '#2d3242'; ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.moveTo(x + 7, y + 21); ctx.lineTo(x + 13, y + 23); ctx.moveTo(x + 24, y + 21); ctx.lineTo(x + 18, y + 23); ctx.stroke();
    } else if (o.type === 'box') {
      // 선물 상자
      shadow(x + w / 2, w + 8, 0.18);
      ctx.fillStyle = '#e3a0b4';
      rrect(x, y + 6, w, h - 6, 3); ctx.fill();
      ctx.fillStyle = '#eeb3c4';
      rrect(x - 2, y + 4, w + 4, 9, 3); ctx.fill();
      ctx.fillStyle = '#f1d97a';
      ctx.fillRect(x + w / 2 - 4, y + 4, 8, h - 4);
      ctx.beginPath();
      ctx.ellipse(x + w / 2 - 8, y + 2, 8, 5, -0.4, 0, Math.PI * 2);
      ctx.ellipse(x + w / 2 + 8, y + 2, 8, 5, 0.4, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#a8637a'; ctx.lineWidth = 2;
      rrect(x, y + 6, w, h - 6, 3); ctx.stroke();
      drawX(x + w / 2, y + h / 2 + 5, 9);
    } else if (o.type === 'sign') {
      // 낮게 떠 있는 열기구 바구니
      var basketTop = y + h - 36;
      var cy = basketTop - 140, cx = x + w / 2;
      ctx.save();
      ctx.beginPath(); ctx.ellipse(cx, cy, 66, 88, 0, 0, Math.PI * 2); ctx.clip();
      for (i = -4; i <= 4; i++) {
        ctx.fillStyle = i % 2 ? '#e39c7b' : '#f2e2c6';
        ctx.fillRect(cx + i * 16 - 8, cy - 90, 16, 180);
      }
      ctx.fillStyle = 'rgba(0,0,0,0.1)';
      ctx.fillRect(cx + 20, cy - 90, 50, 180);
      ctx.restore();
      ctx.strokeStyle = OUTLINE; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.ellipse(cx, cy, 66, 88, 0, 0, Math.PI * 2); ctx.stroke();
      ctx.strokeStyle = '#6e5a48'; ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(cx - 40, cy + 70); ctx.lineTo(x + 6, basketTop);
      ctx.moveTo(cx + 40, cy + 70); ctx.lineTo(x + w - 6, basketTop);
      ctx.moveTo(cx - 12, cy + 86); ctx.lineTo(cx - 12, basketTop);
      ctx.moveTo(cx + 12, cy + 86); ctx.lineTo(cx + 12, basketTop);
      ctx.stroke();
      ctx.fillStyle = '#a5784a';
      rrect(x + 2, basketTop, w - 4, 36, 5); ctx.fill();
      ctx.strokeStyle = OUTLINE; ctx.lineWidth = 2; ctx.stroke();
      ctx.fillStyle = 'rgba(0,0,0,0.15)';
      for (i = basketTop + 9; i < basketTop + 34; i += 9) ctx.fillRect(x + 4, i, w - 8, 2);
      ctx.fillStyle = '#7c5a36';
      rrect(x, basketTop - 2, w, 6, 3); ctx.fill();
    } else if (o.type === 'barricade') {
      // 얼음 기둥
      shadow(x + w / 2, w + 16, 0.2);
      grad = ctx.createLinearGradient(x, 0, x + w, 0);
      grad.addColorStop(0, '#d9f0f7'); grad.addColorStop(1, '#8fbfd6');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.moveTo(x, GROUND); ctx.lineTo(x, y + 26); ctx.lineTo(x + w * 0.45, y);
      ctx.lineTo(x + w, y + 20); ctx.lineTo(x + w, GROUND); ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = '#5f8fa8'; ctx.lineWidth = 2; ctx.stroke();
      ctx.strokeStyle = 'rgba(255,255,255,0.6)'; ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(x + w * 0.45, y + 4); ctx.lineTo(x + w * 0.4, GROUND - 4);
      ctx.moveTo(x + 8, y + 60); ctx.lineTo(x + 20, y + 90);
      ctx.moveTo(x + w - 10, y + 150); ctx.lineTo(x + w - 20, y + 180);
      ctx.stroke();
      drawX(x + w / 2, y + h / 2 + 10, 13);
    }
  }

  // ---------- 스테이지 공통 ----------
  var THEMES = {
    city:   { bg: drawCityBg,   ground: drawCityGround,   pit: drawCityPit,   obstacle: drawCityObstacle },
    jungle: { bg: drawJungleBg, ground: drawJungleGround, pit: drawJunglePit, obstacle: drawJungleObstacle },
    sky:    { bg: drawSkyBg,    ground: drawSkyGround,    pit: drawSkyPit,    obstacle: drawSkyObstacle }
  };

  function drawTheme(name, scroll) {
    THEMES[name].bg(scroll);
    THEMES[name].ground(scroll);
  }

  // 배경·바닥 (스테이지가 바뀌면 새 배경이 서서히 겹쳐짐) + 틈
  function drawWorld(scroll) {
    if (!g) { drawTheme('city', scroll); return; }
    var cur = themeOf(g.stage), prev = themeOf(g.prevStage);
    var t = g.stageFade / C.stages.fadeTime;
    if (t < 1 && prev !== cur) {
      drawTheme(prev, scroll);
      ctx.globalAlpha = t;
      drawTheme(cur, scroll);
      ctx.globalAlpha = 1;
    } else {
      drawTheme(cur, scroll);
    }
    for (var i = 0; i < g.obstacles.length; i++) {
      var o = g.obstacles[i];
      if (o.type !== 'gap') continue;
      THEMES[o.stage].pit(o);
      // 무적 별이면 빛 다리
      if (g.effects.star > 0) {
        ctx.fillStyle = 'rgba(255,225,120,0.55)';
        rrect(o.x - 4, GROUND - 2, o.w + 8, 7, 3); ctx.fill();
      }
    }
  }

  function drawObstacle(o) { THEMES[o.stage].obstacle(o); }

  // 스테이지 시작 안내
  function drawStageBanner() {
    var t = g.stageFade;
    if (t > 2.6) return;
    var a = t < 0.4 ? t / 0.4 : t > 2.2 ? (2.6 - t) / 0.4 : 1;
    ctx.globalAlpha = clamp(a, 0, 1);
    panel(W / 2 - 130, 128, 260, 70, 14);
    text('STAGE ' + (g.stage + 1), W / 2, 150, 14, '#c9cde0', 'center', 'normal');
    text(THEME_NAMES[themeOf(g.stage)], W / 2, 176, 24, '#fff', 'center');
    ctx.globalAlpha = 1;
  }

  // ---------- 코인·아이템 ----------
  function drawCoin(c) {
    var t = performance.now() / 380 + c.x * 0.015;
    var sx = Math.max(0.15, Math.abs(Math.cos(t)));
    var r = C.coins.radius;
    ctx.fillStyle = '#c48a14';
    ctx.beginPath(); ctx.ellipse(c.x, c.y, r * sx, r, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#f2c23a';
    ctx.beginPath(); ctx.ellipse(c.x, c.y, Math.max(1, (r - 2) * sx), r - 2, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = 'rgba(255,245,200,0.7)';
    ctx.fillRect(c.x - 1.5 * sx, c.y - r * 0.5, 3 * sx, r);
  }

  function heartPath(cx, cy, s) {
    ctx.beginPath();
    ctx.moveTo(cx, cy + s * 0.9);
    ctx.bezierCurveTo(cx - s * 1.4, cy - s * 0.1, cx - s * 0.6, cy - s * 1.1, cx, cy - s * 0.35);
    ctx.bezierCurveTo(cx + s * 0.6, cy - s * 1.1, cx + s * 1.4, cy - s * 0.1, cx, cy + s * 0.9);
    ctx.closePath();
  }

  function starPath(cx, cy, r) {
    ctx.beginPath();
    for (var i = 0; i < 10; i++) {
      var a = -Math.PI / 2 + i * Math.PI / 5;
      var rr = i % 2 ? r * 0.45 : r;
      ctx.lineTo(cx + Math.cos(a) * rr, cy + Math.sin(a) * rr);
    }
    ctx.closePath();
  }

  // 아이템 아이콘 (HUD에서도 재사용)
  function drawItemIcon(type, x, y, r) {
    ctx.lineJoin = 'round';
    if (type === 'heart') {
      ctx.fillStyle = '#ef5470'; heartPath(x, y, r * 0.9); ctx.fill();
      ctx.strokeStyle = '#9c2840'; ctx.lineWidth = 1.5; ctx.stroke();
    } else if (type === 'star') {
      ctx.fillStyle = '#f7d354'; starPath(x, y, r); ctx.fill();
      ctx.strokeStyle = '#c98b1c'; ctx.lineWidth = 1.5; ctx.stroke();
    } else if (type === 'magnet') {
      ctx.lineCap = 'butt';
      ctx.lineWidth = r * 0.45;
      ctx.strokeStyle = '#d9404f';
      ctx.beginPath();
      ctx.moveTo(x - r * 0.6, y + r * 0.45); ctx.lineTo(x - r * 0.6, y - r * 0.1);
      ctx.arc(x, y - r * 0.1, r * 0.6, Math.PI, 0);
      ctx.lineTo(x + r * 0.6, y + r * 0.45);
      ctx.stroke();
      ctx.fillStyle = '#dfe6ee';
      ctx.fillRect(x - r * 0.83, y + r * 0.35, r * 0.46, r * 0.35);
      ctx.fillRect(x + r * 0.37, y + r * 0.35, r * 0.46, r * 0.35);
    } else if (type === 'double') {
      ctx.fillStyle = '#c48a14';
      ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#f2c23a';
      ctx.beginPath(); ctx.arc(x, y, r - 2, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#7a4b00';
      ctx.font = 'bold ' + Math.round(r * 0.95) + 'px ' + FONT;
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText('x2', x, y + 1);
    }
  }

  function drawItem(it) {
    var y = it.y + Math.sin(it.t * 3) * 5;
    var r = C.items.radius;
    ctx.fillStyle = 'rgba(255,245,220,' + (0.16 + 0.06 * Math.sin(it.t * 3)) + ')';
    ctx.beginPath(); ctx.arc(it.x, y, r + 9, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,0.45)'; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.arc(it.x, y, r + 5, 0, Math.PI * 2); ctx.stroke();
    drawItemIcon(it.type, it.x, y, r);
  }

  // ---------- 플레이어 ----------
  // 관절 위치: 각도 0 = 아래, + = 앞쪽
  function joint(x, y, ang, len) { return [x + Math.sin(ang) * len, y + Math.cos(ang) * len]; }

  // 테두리가 있는 두 마디 팔다리
  function limb(x1, y1, x2, y2, x3, y3, w, color) {
    ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.lineTo(x3, y3);
    ctx.strokeStyle = OUTLINE; ctx.lineWidth = w + 3; ctx.stroke();
    ctx.strokeStyle = color; ctx.lineWidth = w; ctx.stroke();
  }

  function drawLeg(hx, hy, thigh, bend, color) {
    var k = joint(hx, hy, thigh, 13);
    var f = joint(k[0], k[1], thigh - bend, 13);
    limb(hx, hy, k[0], k[1], f[0], f[1], 7, color);
    // 운동화
    ctx.fillStyle = OUTLINE;
    rrect(f[0] - 4, f[1] - 3, 11, 6, 3); ctx.fill();
    ctx.fillStyle = '#eef0f4';
    rrect(f[0] - 3, f[1] - 2, 9, 4, 2); ctx.fill();
  }

  function drawArm(sx, sy, upper, bend, color) {
    var e = joint(sx, sy, upper, 10);
    var h = joint(e[0], e[1], upper + bend, 10);
    limb(sx, sy, e[0], e[1], h[0], h[1], 6, color);
  }

  function drawPlayer() {
    var p = g.player;
    var b = playerBox();
    var cx = b.x + b.w / 2;
    var feetY = p.y;
    var now = performance.now() / 1000;
    var star = g.effects.star > 0;
    var tackling = p.tackleTime > 0;

    // 그림자 (높이 뜰수록 작고 옅게)
    if (!p.falling && !gapUnder(cx)) {
      var up = clamp((GROUND - feetY) / 220, 0, 1);
      shadow(cx, (p.sliding ? 50 : 34) * (1 - up * 0.5), 0.28 * (1 - up * 0.6));
    }

    ctx.save();
    // 피격 무적: 반투명으로 깜빡임 (완전히 사라지지 않게)
    if (p.hurtTime > 0 && Math.floor(p.hurtTime * 10) % 2 === 0) ctx.globalAlpha = 0.35;

    // 태클 속도선
    if (tackling) {
      ctx.strokeStyle = 'rgba(255,255,255,0.45)'; ctx.lineWidth = 2; ctx.lineCap = 'round';
      for (var l = 0; l < 4; l++) {
        var ly = b.y + 10 + l * 12;
        ctx.beginPath(); ctx.moveTo(b.x - 10 - l * 5, ly); ctx.lineTo(b.x - 44 - l * 8, ly); ctx.stroke();
      }
    }
    if (star) { ctx.shadowColor = 'rgba(255,220,110,0.9)'; ctx.shadowBlur = 16; }

    var hoodie = star ? '#f4c04e' : '#e8743a';
    var hoodieDark = star ? '#cf9a2c' : '#b8562a';
    var pants = '#36427a', pantsBack = '#283260';

    // 자세별 각도
    var hipX = cx, hipY = feetY - 26, lean, legs, arms;
    if (p.sliding) {
      hipX = cx + 6; hipY = feetY - 9; lean = -1.2;
      legs = [[1.35, 0.3], [1.5, 0]];
      arms = [[-0.4, 0], [0.9, 0.8]];
    } else if (tackling) {
      lean = 0.5;
      legs = [[-0.8, 0.3], [0.9, 0.7]];
      arms = [[-0.5, 1.1], [1.6, 0.2]];
    } else if (!p.onGround) {
      lean = 0.15;
      legs = [[-0.4, 0.7], [0.75, 1.4]];
      arms = [[-0.9, 0.8], [0.9, 0.9]];
    } else {
      var ph = p.anim * 13;
      lean = 0.15;
      hipY -= Math.abs(Math.sin(ph)) * 2;
      legs = [
        [Math.sin(ph + Math.PI) * 0.75, 0.3 + 0.9 * Math.max(0, Math.cos(ph + Math.PI))],
        [Math.sin(ph) * 0.75, 0.3 + 0.9 * Math.max(0, Math.cos(ph))]
      ];
      arms = [[Math.sin(ph) * 0.7, 1.1], [Math.sin(ph + Math.PI) * 0.7, 1.1]];
    }
    // 어깨 위치 (몸통을 lean 만큼 기울였을 때)
    var shX = hipX + Math.sin(lean) * 21, shY = hipY - Math.cos(lean) * 21;

    // 뒤쪽 팔·다리
    drawArm(shX, shY, arms[0][0], arms[0][1], hoodieDark);
    drawLeg(hipX, hipY, legs[0][0], legs[0][1], pantsBack);
    drawLeg(hipX, hipY, legs[1][0], legs[1][1], pants);

    // 몸통과 머리
    ctx.save();
    ctx.translate(hipX, hipY);
    ctx.rotate(lean);
    ctx.lineWidth = 2; ctx.strokeStyle = OUTLINE;
    // 후드
    ctx.fillStyle = hoodieDark;
    ctx.beginPath(); ctx.arc(-4, -30, 9, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    // 상체
    ctx.fillStyle = hoodie;
    rrect(-11, -27, 22, 30, 8); ctx.fill(); ctx.stroke();
    ctx.fillStyle = hoodieDark;
    rrect(-6, -10, 13, 6, 2); ctx.fill();          // 주머니
    ctx.fillStyle = '#f3efe6';
    ctx.fillRect(3, -24, 2, 8);                    // 후드 끈
    // 머리
    ctx.fillStyle = '#f4c9a0';
    ctx.beginPath(); ctx.arc(2, -37, 10.5, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    ctx.fillStyle = '#2e2530';
    ctx.beginPath(); ctx.arc(1, -39, 10.5, Math.PI * 0.92, Math.PI * 1.98); ctx.fill();
    ctx.beginPath(); ctx.moveTo(-9, -40); ctx.lineTo(-11, -33); ctx.lineTo(-5, -38); ctx.fill();
    ctx.fillStyle = '#1c1c24';
    ctx.fillRect(7, -38, 2.5, 3.5);                // 눈
    ctx.fillStyle = 'rgba(240,120,120,0.35)';
    ctx.beginPath(); ctx.arc(6, -32, 2.5, 0, Math.PI * 2); ctx.fill();
    // 머리띠와 휘날리는 끈
    var wave = Math.sin(now * 12) * 3;
    ctx.strokeStyle = '#3aa6d8'; ctx.lineWidth = 3; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(-9, -43); ctx.lineTo(12, -43); ctx.stroke();
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(-9, -43); ctx.quadraticCurveTo(-16, -44 + wave, -23, -41 - wave);
    ctx.moveTo(-9, -42); ctx.quadraticCurveTo(-15, -39 - wave, -21, -36 + wave);
    ctx.stroke();
    ctx.restore();

    // 앞쪽 팔
    drawArm(shX, shY, arms[1][0], arms[1][1], hoodie);

    // 슬라이딩 먼지 (규칙적으로 움직여 깜빡이지 않음)
    if (p.sliding) {
      ctx.shadowBlur = 0;
      ctx.fillStyle = 'rgba(210,210,220,0.35)';
      for (var d = 0; d < 3; d++) {
        var dp = (p.anim * 3 + d / 3) % 1;
        ctx.beginPath(); ctx.arc(cx + 30 - dp * 60, feetY - 4 - dp * 6, 3 + dp * 5, 0, Math.PI * 2); ctx.fill();
      }
    }
    ctx.restore();
  }

  // ---------- HUD ----------
  function text(str, x, y, size, color, align, weight) {
    ctx.font = (weight || 'bold') + ' ' + size + 'px ' + FONT;
    ctx.textAlign = align || 'left';
    ctx.textBaseline = 'middle';
    ctx.lineJoin = 'round';
    ctx.lineWidth = 3;
    ctx.strokeStyle = 'rgba(10,12,25,0.45)';
    ctx.strokeText(str, x, y);
    ctx.fillStyle = color || '#fff';
    ctx.fillText(str, x, y);
  }

  function panel(x, y, w, h, r) {
    ctx.fillStyle = 'rgba(16,19,36,0.55)';
    rrect(x, y, w, h, r || 10); ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,0.08)'; ctx.lineWidth = 1; ctx.stroke();
  }

  function bar(x, y, w, h, ratio, color) {
    ctx.fillStyle = 'rgba(255,255,255,0.14)';
    rrect(x, y, w, h, h / 2); ctx.fill();
    if (ratio > 0) {
      ctx.fillStyle = color;
      rrect(x, y, Math.max(h, w * clamp(ratio, 0, 1)), h, h / 2); ctx.fill();
    }
  }

  var EFFECT_INFO = {
    star:   { label: '무적', max: C.items.starDuration,   color: '#f7d354' },
    magnet: { label: '자석', max: C.items.magnetDuration, color: '#86c8ec' },
    double: { label: '코인 x2', max: C.items.doubleDuration, color: '#f2c23a' }
  };

  function drawHUD() {
    var i, p = g.player;

    // 왼쪽 위: 하트·콤보·속도
    panel(12, 12, 196, 98);
    for (i = 0; i < C.hearts.max; i++) {
      heartPath(34 + i * 34, 34, 11);
      ctx.fillStyle = i < g.hearts ? '#ef5470' : 'rgba(255,255,255,0.12)';
      ctx.fill();
      if (i < g.hearts) { ctx.strokeStyle = '#8f2238'; ctx.lineWidth = 1.5; ctx.stroke(); }
    }
    text('콤보', 24, 64, 14, '#c9cde0', 'left', 'normal');
    text('x' + g.combo.toFixed(1), 196, 64, 16, g.combo > 1 ? '#f7d354' : '#fff', 'right');
    var prog = g.combo >= C.score.comboMax ? 1 : (g.passCount % C.score.comboEvery) / C.score.comboEvery;
    bar(24, 76, 172, 6, prog, '#f7d354');
    var lv = Math.round((speedNow() - C.speed.base) / C.speed.step) + 1;
    text('STAGE ' + (g.stage + 1) + ' ' + THEME_NAMES[themeOf(g.stage)] + ' · 속도 Lv.' + lv, 24, 96, 12, '#aeb3c8', 'left', 'normal');

    // 오른쪽 위: 점수
    panel(W - 232, 12, 220, 64);
    text('점', W - 26, 39, 14, '#aeb3c8', 'right', 'normal');
    text(totalScore().toLocaleString(), W - 46, 36, 26, '#fff', 'right');
    text(distScore() + 'm · 코인 ' + g.coinScore + ' · 파괴 ' + g.breakScore, W - 26, 62, 12, '#aeb3c8', 'right', 'normal');

    // 위 가운데: 아이템 효과 남은 시간
    var active = [];
    for (var k in EFFECT_INFO) if (g.effects[k] > 0) active.push(k);
    var bw = 150, startX = W / 2 - (active.length * (bw + 10) - 10) / 2;
    for (i = 0; i < active.length; i++) {
      var info = EFFECT_INFO[active[i]];
      var left = g.effects[active[i]];
      var bx = startX + i * (bw + 10);
      panel(bx, 14, bw, 40, 10);
      drawItemIcon(active[i], bx + 21, 34, 11);
      text(info.label, bx + 40, 27, 13, '#fff', 'left');
      text(left.toFixed(1) + 's', bx + bw - 12, 27, 12, '#c9cde0', 'right', 'normal');
      bar(bx + 40, 39, bw - 52, 5, left / info.max, info.color);
    }

    // 왼쪽 아래: 태클 게이지
    var ready = p.tackleCd <= 0;
    panel(12, H - 46, 170, 34, 9);
    text(ready ? '태클 준비' : '태클 충전', 24, H - 29, 13, ready ? '#ff8c7a' : '#aeb3c8', 'left');
    bar(96, H - 33, 74, 8, 1 - p.tackleCd / C.tackle.cooldown, ready ? '#ef6a55' : '#8a5a5a');

    drawStageBanner();

    // 슬라이딩 남은 시간
    if (p.sliding) bar(C.player.x - 24, p.y - 46, 48, 5, 1 - p.slideTime / C.player.slideMax, '#86c8ec');
  }

  // ---------- 화면별 오버레이 ----------
  function dim(a) { ctx.fillStyle = 'rgba(12,14,30,' + a + ')'; ctx.fillRect(0, 0, W, H); }

  function card(x, y, w, h) {
    ctx.save();
    ctx.shadowColor = 'rgba(0,0,0,0.4)'; ctx.shadowBlur = 30; ctx.shadowOffsetY = 8;
    ctx.fillStyle = 'rgba(24,28,50,0.92)';
    rrect(x, y, w, h, 18); ctx.fill();
    ctx.restore();
    ctx.strokeStyle = 'rgba(255,255,255,0.08)'; ctx.lineWidth = 1;
    rrect(x, y, w, h, 18); ctx.stroke();
  }

  // 키 모양 표시
  function keycap(label, rightX, y) {
    ctx.font = 'bold 14px ' + FONT;
    var w = ctx.measureText(label).width + 20;
    ctx.fillStyle = '#353b5c';
    rrect(rightX - w, y - 13, w, 26, 6); ctx.fill();
    ctx.fillStyle = '#272c48';
    ctx.fillRect(rightX - w + 4, y + 9, w - 8, 3);
    ctx.fillStyle = '#e6e9f5';
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(label, rightX - w / 2, y - 1);
  }

  // 부드럽게 숨 쉬는 안내 문구 (켜졌다 꺼지는 깜빡임 대신)
  function prompt(str, y) {
    ctx.globalAlpha = 0.6 + 0.4 * Math.sin(performance.now() / 450);
    text(str, W / 2, y, 20, '#fff', 'center');
    ctx.globalAlpha = 1;
  }

  function drawTitle() {
    dim(0.35);
    card(W / 2 - 270, 64, 540, 400);
    text('도시 파쿠르 러너', W / 2, 120, 46, '#f7d354', 'center');
    text('장애물을 넘고, 숙이고, 부수며 최대한 멀리 달리세요!', W / 2, 162, 15, '#c9cde0', 'center', 'normal');
    var lines = [
      ['Space / ↑', '점프 · 공중에서 한 번 더 누르면 2단 점프'],
      ['↓', '숙이기 (최대 1.5초)'],
      ['→ / Shift', '태클 · 빨간 X 장애물 파괴'],
      ['Esc', '일시정지']
    ];
    for (var i = 0; i < lines.length; i++) {
      var ly = 214 + i * 40;
      keycap(lines[i][0], W / 2 - 70, ly);
      text(lines[i][1], W / 2 - 56, ly, 15, '#e6e9f5', 'left', 'normal');
    }
    prompt('Space 를 눌러 시작', 400);
    if (best > 0) text('최고 점수 ' + best.toLocaleString(), W / 2, 436, 14, '#f7d354', 'center', 'normal');
  }

  function drawPause() {
    dim(0.45);
    card(W / 2 - 170, H / 2 - 70, 340, 130);
    text('일시정지', W / 2, H / 2 - 22, 36, '#fff', 'center');
    text('Esc 를 눌러 계속하기', W / 2, H / 2 + 24, 15, '#c9cde0', 'center', 'normal');
  }

  function drawGameOver() {
    dim(0.5);
    card(W / 2 - 230, 54, 460, 430);
    text('게임 오버', W / 2, 104, 40, '#f27b8e', 'center');
    var rows = [
      ['달린 거리', distScore() + '점'],
      ['코인 점수', g.coinScore + '점'],
      ['파괴 점수', g.breakScore + '점'],
      ['콤보 배율', '× ' + g.combo.toFixed(1)],
      ['도달 스테이지', 'STAGE ' + (g.stage + 1) + ' · ' + THEME_NAMES[themeOf(g.stage)]]
    ];
    for (var i = 0; i < rows.length; i++) {
      var ry = 150 + i * 29;
      text(rows[i][0], W / 2 - 150, ry, 16, '#aeb3c8', 'left', 'normal');
      text(rows[i][1], W / 2 + 150, ry, 17, '#fff', 'right');
    }
    ctx.fillStyle = 'rgba(255,255,255,0.12)'; ctx.fillRect(W / 2 - 150, 296, 300, 1);
    text('최종 점수', W / 2, 324, 14, '#aeb3c8', 'center', 'normal');
    text(g.final.toLocaleString(), W / 2, 358, 38, '#f7d354', 'center');
    text(g.newBest ? '★ 최고 기록 달성! ★' : '최고 점수 ' + best.toLocaleString(), W / 2, 396, 15, g.newBest ? '#f7d354' : '#aeb3c8', 'center');
    prompt('Space 를 눌러 다시 시작', 448);
  }

  function render() {
    // 타이틀 화면에서는 배경만 천천히 흐름
    var scroll = g ? g.scroll : performance.now() * 0.05;
    ctx.save();
    if (g && g.shake > 0 && state === 'play') {
      ctx.translate(rand(-4, 4) * g.shake * 3, rand(-4, 4) * g.shake * 3);
    }
    drawWorld(scroll);
    if (g) {
      var i;
      for (i = 0; i < g.obstacles.length; i++) if (g.obstacles[i].type !== 'gap') drawObstacle(g.obstacles[i]);
      for (i = 0; i < g.coins.length; i++) drawCoin(g.coins[i]);
      for (i = 0; i < g.items.length; i++) drawItem(g.items[i]);
      drawPlayer();
      for (i = 0; i < g.particles.length; i++) {
        var pt = g.particles[i];
        ctx.globalAlpha = clamp(pt.life * 2, 0, 1);
        ctx.fillStyle = pt.color;
        ctx.beginPath(); ctx.arc(pt.x, pt.y, pt.size / 2, 0, Math.PI * 2); ctx.fill();
      }
      ctx.globalAlpha = 1;
      for (i = 0; i < g.popups.length; i++) {
        var pp = g.popups[i];
        ctx.globalAlpha = clamp(pp.life * 2, 0, 1);
        text(pp.text, pp.x, pp.y, 16, pp.color, 'center');
      }
      ctx.globalAlpha = 1;
    }
    ctx.fillStyle = vignette;
    ctx.fillRect(0, 0, W, H);
    ctx.restore();
    if (g) drawHUD();

    if (state === 'title') drawTitle();
    else if (state === 'pause') drawPause();
    else if (state === 'over') drawGameOver();
  }

  // ---------- 메인 루프 ----------
  var last = performance.now();
  function loop(now) {
    var dt = Math.min((now - last) / 1000, 1 / 30); // 프레임이 끊겨도 한 번에 너무 많이 움직이지 않게
    last = now;
    if (state === 'play') update(dt);
    render();
    requestAnimationFrame(loop);
  }
  requestAnimationFrame(loop);

  // 테스트·디버그용으로 상태를 살짝 노출
  window.__runner = {
    get state() { return state; }, get game() { return g; },
    keys: keys, make: makeObstacle, step: function (dt) { update(dt); }
  };
})();
