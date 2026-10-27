(() => {
const $ = s => document.querySelector(s);
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const lerp = (a, b, t) => a + (b - a) * t;
const rnd = (a, b) => a + Math.random() * (b - a);
const won = n => n.toLocaleString('ko-KR') + '원';
const batchim = w => { const c = w.charCodeAt(w.length - 1); return c >= 0xAC00 && c <= 0xD7A3 && (c - 0xAC00) % 28 !== 0; };
const iRang = w => w + (batchim(w) ? '이랑' : '랑');
const iGa = w => w + (batchim(w) ? '이' : '가');
const eunNeun = w => w + (batchim(w) ? '은' : '는');
const eulReul = w => w + (batchim(w) ? '을' : '를');

/* ---------- Game data ---------- */
const TOPS = [
  { id: 'egg',    name: '계란',     c: '#ffd23f', day: 1 },
  { id: 'pa',     name: '파',       c: '#6cc04a', day: 1 },
  { id: 'cheese', name: '치즈',     c: '#ffcf33', day: 2 },
  { id: 'tteok',  name: '떡',       c: '#f4efe4', day: 3 },
  { id: 'mandu',  name: '만두',     c: '#efdcb8', day: 3 },
  { id: 'chili',  name: '고춧가루', c: '#e2412b', day: 4 },
];
const TOP = Object.fromEntries(TOPS.map(t => [t.id, t]));
// recipe order, the way ramen is really cooked: soup, noodles, slow-cooking add-ins, egg, then finishing toppings
const RECIPE = [
  { n: '①', items: ['soup'] },
  { n: '②', items: ['noodle'] },
  { n: '③', items: ['tteok', 'mandu'] },
  { n: '④', items: ['egg'] },
  { n: '⑤', items: ['pa', 'cheese', 'chili'] },
];
const STEP_OF = Object.fromEntries(RECIPE.flatMap((r, i) => r.items.map(id => [id, i])));
const ITEM_NAME = id => id === 'soup' ? '스프' : id === 'noodle' ? '면' : TOP[id].name;
const SPICE_SAY = ['', '한 번', '두 번', '세 번'];
const WATER = [
  { name: '적게', say: '조금만',   lo: .26, hi: .48 },
  { name: '보통', say: '보통으로', lo: .48, hi: .70 },
  { name: '많이', say: '넉넉하게', lo: .70, hi: .92 },
];
const ZONES = [0, .25, .5, .72, .9, 1.0001];
const STAGE_NAMES = ['덜 익음', '꼬들꼬들', '적당히', '푹 익음', '불어 터짐'];
const DONE_SAY = [null, '꼬들꼬들하게', '적당히 익혀서', '푹 익혀서'];
const stageOf = c => { for (let i = 0; i < 5; i++) if (c < ZONES[i + 1]) return i; return 4; };
const CTYPES = [
  { name: '곰돌이', body: 0xc99a6e, head: 0xd8a878, acc: 0xf6dfc4, kind: 'bear' },
  { name: '토순이', body: 0xc6b4ff, head: 0xfffafc, acc: 0xffb3cf, kind: 'bunny' },
  { name: '개굴이', body: 0x7fcd78, head: 0x9adf8c, acc: 0xffffff, kind: 'frog' },
  { name: '삐약이', body: 0xffd84d, head: 0xffe36b, acc: 0xff9d3a, kind: 'chick' },
];
const DAY_LEN = 120;
const goalOf = d => 20000 + (d - 1) * 6000;

const G = {
  screen: 'title', day: 1, total: 0, earned: 0, timeLeft: DAY_LEN, served: 0, starSum: 0, orderNo: 0,
  customer: null, spawnT: 1.2, bowl: null, pot: null,
};
function freshPot() {
  return { water: 0, pouring: false, flame: false, temp: 0, noodles: false, drop: 0, cook: 0, soup: false, soupMix: 0, toppings: new Set(), chili: 0, log: [], wrongOrder: 0, orderNote: '' };
}
G.pot = freshPot();

/* ---------- Audio ---------- */
let actx = null, muted = false;
try { muted = localStorage.getItem('nyangiMuted') === '1'; } catch (e) {}
// phones only allow sound after a touch, and iPhone's silent switch mutes web audio unless the page asks for media playback
function audioUnlock() {
  try {
    if (navigator.audioSession) navigator.audioSession.type = 'playback';
    actx = actx || new (window.AudioContext || window.webkitAudioContext)();
    if (actx.state !== 'running') actx.resume();
    if (!audioUnlock.done) {
      const b = actx.createBuffer(1, 1, 22050), src = actx.createBufferSource();
      src.buffer = b; src.connect(actx.destination); src.start(0); audioUnlock.done = true;
    }
    musicStart();
  } catch (e) {}
}
['pointerdown', 'touchend', 'keydown', 'click'].forEach(ev => window.addEventListener(ev, audioUnlock, { capture: true, passive: true }));

// background music: an original, bouncy but soft loop made in the browser (no audio file, no licence needed)
const MIDI = n => 440 * Math.pow(2, (n - 69) / 12);
const SONG = {
  step: 60 / 116 / 2,
  mel: [72, 76, 79, 76, 84, 0, 79, 0, 77, 81, 84, 81, 77, 0, 76, 77, 79, 0, 74, 79, 83, 81, 79, 77, 76, 79, 72, 0, 76, 0, 0, 0,
        72, 76, 79, 76, 84, 0, 79, 0, 81, 0, 77, 81, 84, 0, 81, 0, 79, 77, 76, 74, 79, 0, 74, 0, 72, 0, 76, 0, 72, 0, 0, 0],
  chords: [[60, 64, 67], [53, 57, 60], [55, 59, 62], [60, 64, 67]],
  bass: [48, 41, 43, 48],
};
let music = null;
function musicStart() {
  if (music || !actx) return;
  const gain = actx.createGain(); gain.gain.value = muted ? 0 : 1; gain.connect(actx.destination);
  const hat = actx.createBuffer(1, actx.sampleRate * .05, actx.sampleRate), hd = hat.getChannelData(0);
  for (let i = 0; i < hd.length; i++) hd[i] = (Math.random() * 2 - 1) * (1 - i / hd.length);
  music = { gain, i: 0, next: actx.currentTime + .1 };
  const note = (f, t, vol, dur, type = 'sine') => {
    const o = actx.createOscillator(), g = actx.createGain();
    o.type = type; o.frequency.setValueAtTime(f, t);
    g.gain.setValueAtTime(.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + .005); g.gain.exponentialRampToValueAtTime(.0001, t + dur);
    o.connect(g); g.connect(gain); o.start(t); o.stop(t + dur + .05);
  };
  const tickHat = t => {
    const src = actx.createBufferSource(), f = actx.createBiquadFilter(), g = actx.createGain();
    src.buffer = hat; f.type = 'highpass'; f.frequency.value = 7000; g.gain.value = .02;
    src.connect(f); f.connect(g); g.connect(gain); src.start(t);
  };
  const tick = () => {
    if (!actx || actx.state !== 'running') return;
    if (music.next < actx.currentTime) music.next = actx.currentTime + .05;
    while (music.next < actx.currentTime + .25) {
      const t = music.next, i = music.i % SONG.mel.length, bar = Math.floor(i / 8) % 4, m = SONG.mel[i];
      // short plucked melody: bouncy, never sustained
      if (m) { note(MIDI(m), t, .032, .22, 'triangle'); note(MIDI(m), t, .018, .32); }
      // oom-pah: bass on the beat (root, fifth), soft chord on the off-beat
      if (i % 2 === 0) note(MIDI(SONG.bass[bar] + ((i / 2) % 2 ? 7 : 0)), t, .045, .18);
      if (i % 4 === 2) SONG.chords[bar].forEach(c => note(MIDI(c), t, .008, .12, 'triangle'));
      if (i % 2 === 1) tickHat(t);
      music.i++; music.next += SONG.step;
    }
  };
  setInterval(tick, 60);
}
// a voice-like sound: a few buzzy voices through vowel filters ("아"), following a pitch curve
function voice(pts, dur, vol, voices = 3, sobs = 0) {
  if (muted || !actx) return;
  const t0 = actx.currentTime, out = actx.createGain();
  out.gain.setValueAtTime(.0001, t0); out.gain.exponentialRampToValueAtTime(vol, t0 + .06);
  if (sobs) for (let k = 0; k < sobs; k++) {
    const a = t0 + k * dur / sobs;
    out.gain.setTargetAtTime(vol, a, .02); out.gain.setTargetAtTime(vol * .15, a + dur / sobs * .6, .04);
  }
  out.gain.exponentialRampToValueAtTime(.0001, t0 + dur);
  [800, 1200].forEach((ff, j) => {
    const f = actx.createBiquadFilter(); f.type = 'bandpass'; f.frequency.value = ff; f.Q.value = 5;
    const g = actx.createGain(); g.gain.value = j ? .5 : 1; f.connect(g); g.connect(out);
    for (let v = 0; v < voices; v++) {
      const o = actx.createOscillator(); o.type = 'sawtooth';
      const det = 1 + (v - (voices - 1) / 2) * .03;
      pts.forEach(([p, f0], n) => n ? o.frequency.linearRampToValueAtTime(f0 * det, t0 + p * dur) : o.frequency.setValueAtTime(f0 * det, t0));
      const vib = actx.createOscillator(), vg = actx.createGain(); vib.frequency.value = 6 + v; vg.gain.value = 8;
      vib.connect(vg); vg.connect(o.frequency); vib.start(t0); vib.stop(t0 + dur);
      o.connect(f); o.start(t0); o.stop(t0 + dur + .05);
    }
  });
  out.connect(actx.destination);
}
// day won: a little "와~!" cheer from a few voices plus a bright fanfare
function cheer() {
  voice([[0, 330], [.25, 520], [1, 470]], 1.1, .09, 4);
  [523, 659, 784, 1047].forEach((f, i) => sfx(f, .25, 'triangle', .05, 0, .15 + i * .09));
}
// day lost: a soft "엉엉" sob that wobbles downward
function sob() { voice([[0, 520], [.5, 420], [1, 340]], 1.6, .08, 1, 3); }
function setMuted(m) {
  muted = m;
  try { localStorage.setItem('nyangiMuted', m ? '1' : '0'); } catch (e) {}
  if (music && actx) music.gain.gain.setTargetAtTime(m ? 0 : 1, actx.currentTime, .05);
  const b = $('#mute'); b.classList.toggle('off', m);
  b.setAttribute('aria-label', m ? '소리 켜기' : '소리 끄기'); b.setAttribute('aria-pressed', String(m));
}

function sfx(f = 600, d = .08, type = 'sine', vol = .07, slide = 0, delay = 0) {
  if (muted) return;
  try {
    actx = actx || new (window.AudioContext || window.webkitAudioContext)();
    const t0 = actx.currentTime + delay, o = actx.createOscillator(), g = actx.createGain();
    o.type = type; o.frequency.setValueAtTime(f, t0);
    if (slide) o.frequency.exponentialRampToValueAtTime(Math.max(40, f + slide), t0 + d);
    g.gain.setValueAtTime(vol, t0); g.gain.exponentialRampToValueAtTime(.0001, t0 + d);
    o.connect(g); g.connect(actx.destination); o.start(t0); o.stop(t0 + d + .03);
  } catch (e) {}
}
const chime = () => { sfx(880, .18, 'sine', .07); sfx(1320, .25, 'sine', .06, 0, .12); };

// kitchen ambience built from filtered noise: pouring water, gas flame hiss, simmering, plus bubble pops
let amb = null;
function ambInit() {
  if (amb || !actx) return;
  try {
    const len = actx.sampleRate * 2, buf = actx.createBuffer(1, len, actx.sampleRate), d = buf.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
    const master = actx.createGain(); master.gain.value = 1; master.connect(actx.destination);
    const chain = (type, freq, q, wobble = 0) => {
      const src = actx.createBufferSource(); src.buffer = buf; src.loop = true;
      src.playbackRate.value = .8 + Math.random() * .4;
      const f = actx.createBiquadFilter(); f.type = type; f.frequency.value = freq; f.Q.value = q;
      const g = actx.createGain(); g.gain.value = 0;
      let last = f;
      // optional wobble: a slow tremolo that turns steady noise into a bubbling "보글보글"
      if (wobble) {
        const mod = actx.createGain(); mod.gain.value = .55;
        const lfo = actx.createOscillator(), depth = actx.createGain();
        lfo.frequency.value = wobble; depth.gain.value = .45; lfo.connect(depth); depth.connect(mod.gain); lfo.start();
        f.connect(mod); last = mod;
      }
      src.connect(f); last.connect(g); g.connect(master); src.start();
      return { f, g };
    };
    amb = { master, pour: chain('bandpass', 700, .5, 3.5), gas: chain('lowpass', 380, .7), simmer: chain('bandpass', 520, .9),
            boil: chain('bandpass', 320, .8, 7), popT: 0, dripT: 0 };
  } catch (e) { amb = null; }
}
function pop(size) {
  if (muted || !actx) return;
  const t0 = actx.currentTime, o = actx.createOscillator(), g = actx.createGain();
  const f = 180 + Math.random() * 320 * (1.4 - size);
  o.type = 'sine'; o.frequency.setValueAtTime(f, t0); o.frequency.exponentialRampToValueAtTime(f * 1.9, t0 + .045);
  g.gain.setValueAtTime(.0001, t0); g.gain.exponentialRampToValueAtTime(.045 * size, t0 + .008); g.gain.exponentialRampToValueAtTime(.0001, t0 + .07);
  o.connect(g); g.connect(amb ? amb.master : actx.destination); o.start(t0); o.stop(t0 + .09);
}
function ambUpdate(dt, p, on) {
  if (!actx) return;
  ambInit(); if (!amb) return;
  const t = actx.currentTime, set = (node, v) => node.g.gain.setTargetAtTime(v, t, .12);
  amb.master.gain.setTargetAtTime(muted ? 0 : 1, t, .05);
  const wet = on && p.water > .05;
  const heat = wet ? clamp((p.temp - .55) / .45, 0, 1) : 0;
  // pouring: a soft, low water rush with a few trickle drops (not a hiss), pitch rising as the pot fills
  const pouring = on && p.pouring && p.water < 1;
  set(amb.pour, pouring ? .07 : 0);
  amb.pour.f.frequency.setTargetAtTime(550 + (p.water || 0) * 450, t, .1);
  if (pouring && !muted) {
    amb.dripT -= dt * 9;
    while (amb.dripT <= 0) {
      const t0 = actx.currentTime, o = actx.createOscillator(), g = actx.createGain(), f = 600 + Math.random() * 500 + (p.water || 0) * 300;
      o.frequency.setValueAtTime(f, t0); o.frequency.exponentialRampToValueAtTime(f * 1.4, t0 + .04);
      g.gain.setValueAtTime(.0001, t0); g.gain.exponentialRampToValueAtTime(.012, t0 + .006); g.gain.exponentialRampToValueAtTime(.0001, t0 + .06);
      o.connect(g); g.connect(amb.master); o.start(t0); o.stop(t0 + .08);
      amb.dripT += Math.random();
    }
  }
  set(amb.gas, on && p.flame ? .05 : 0);
  set(amb.simmer, heat * heat * .08);
  // a full rolling boil gets its own bubbling layer once the water is really boiling
  set(amb.boil, wet && p.temp >= .98 ? .14 : 0);
  amb.simmer.f.frequency.setTargetAtTime(420 + heat * 300 + Math.random() * 120, t, .05);
  // bubble pops get busier as the water comes to a rolling boil
  if (heat > .15 && !muted) {
    amb.popT -= dt * heat * heat * 26;
    while (amb.popT <= 0) { pop(.4 + Math.random() * .6); amb.popT += Math.random(); }
  }
}

/* ---------- Three setup ---------- */
const stage = $('#stage');
const renderer = new THREE.WebGLRenderer({ canvas: $('#gl'), antialias: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(36, 1, .1, 120);
const LOOK = new THREE.Vector3(0, 1.75, 0);
// Nyangi stands in front of the shop on the title/talk screens, then walks to the stove when the shop opens
const KGAME = new THREE.Vector3(-2.9, 0, .45), KFRONT = new THREE.Vector3(0, 0, 2.3);
const CAM = { gp: new THREE.Vector3(), gl: new THREE.Vector3(), cp: new THREE.Vector3(), cl: new THREE.Vector3(), half: 2.8, khalf: 3 };
const _look = new THREE.Vector3();
let camT = 0, camShift = 0;

function resize() {
  const w = stage.clientWidth, h = stage.clientHeight;
  if (!w || !h) return;
  renderer.setSize(w, h, false);
  camera.aspect = w / h;
  const vt = Math.tan(THREE.MathUtils.degToRad(camera.fov / 2));
  const d = Math.max(4.9 / (vt * camera.aspect), 2.9 / vt), pitch = .46;
  CAM.gl.copy(LOOK); CAM.gp.set(0, LOOK.y + d * Math.sin(pitch), d * Math.cos(pitch));
  const d2 = Math.max(3.4 / (vt * camera.aspect), 3.5 / vt), p2 = .06;
  CAM.half = d2 * vt;
  CAM.cl.set(0, 1.55, 2.3); CAM.cp.set(0, 1.55 + d2 * Math.sin(p2), 2.3 + d2 * Math.cos(p2));
  // stand Nyangi close enough to the camera that she fills about 40% of the screen height
  const kd = Math.min(d2, 2.6 / (.8 * vt));
  KFRONT.z = CAM.cp.z - kd;
  CAM.khalf = kd * vt;
  camera.updateProjectionMatrix();
  applyCam();
}
function applyCam() {
  const e = camT * camT * (3 - 2 * camT), s = camShift * (1 - e);
  camera.position.lerpVectors(CAM.cp, CAM.gp, e); camera.position.y += s;
  _look.lerpVectors(CAM.cl, CAM.gl, e); _look.y += s;
  camera.lookAt(_look);
}
new ResizeObserver(resize).observe(stage);

// sky
(() => {
  const c = document.createElement('canvas'); c.width = 4; c.height = 256;
  const x = c.getContext('2d'), g = x.createLinearGradient(0, 0, 0, 256);
  g.addColorStop(0, '#f3c4e6'); g.addColorStop(.5, '#ffdcec'); g.addColorStop(1, '#ffe9f2');
  x.fillStyle = g; x.fillRect(0, 0, 4, 256);
  scene.background = new THREE.CanvasTexture(c);
})();

scene.add(new THREE.HemisphereLight(0xffffff, 0xffc4dc, .46));
const sun = new THREE.DirectionalLight(0xffffff, .5);
sun.position.set(4, 9, 7); sun.castShadow = true;
sun.shadow.mapSize.set(1024, 1024);
Object.assign(sun.shadow.camera, { left: -8, right: 8, top: 8, bottom: -8, near: 1, far: 30 });
sun.shadow.bias = -.0005; sun.shadow.normalBias = .035; sun.shadow.radius = 4;
scene.add(sun);
const fill = new THREE.DirectionalLight(0xfff0f6, .2); fill.position.set(-5, 3, 8); scene.add(fill);

const SPH = new THREE.SphereGeometry(1, 36, 24);
const M = (color, o = {}) => new THREE.MeshStandardMaterial(Object.assign({ color, roughness: .62, metalness: 0 }, o));
function add(parent, geo, mat, pos = [0, 0, 0], scl = 1, rot = [0, 0, 0], shadow = true) {
  const m = new THREE.Mesh(geo, mat);
  m.position.set(pos[0], pos[1], pos[2]);
  typeof scl === 'number' ? m.scale.setScalar(scl) : m.scale.set(scl[0], scl[1], scl[2]);
  m.rotation.set(rot[0], rot[1], rot[2]);
  m.castShadow = shadow; m.receiveShadow = shadow;
  parent.add(m); return m;
}
// place a flattened part on an ellipsoid surface, facing outward along the surface normal
function onEll(parent, C, R, x, y, geo, mat, scl, lift = 0) {
  const z = R[2] * Math.sqrt(Math.max(0, 1 - (x / R[0]) ** 2 - (y / R[1]) ** 2));
  const n = new THREE.Vector3(x / R[0] ** 2, y / R[1] ** 2, z / R[2] ** 2).normalize();
  const m = add(parent, geo, mat, [C[0] + x + n.x * lift, C[1] + y + n.y * lift, C[2] + z + n.z * lift], scl, [0, 0, 0], false);
  m.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), n);
  return m;
}
function rod(parent, a, b, r, mat) {
  const d = new THREE.Vector3().subVectors(b, a), len = d.length();
  const m = new THREE.Mesh(new THREE.CylinderGeometry(r, r, len, 8), mat);
  m.position.copy(a).add(b).multiplyScalar(.5);
  m.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), d.normalize());
  parent.add(m); return m;
}
function canvasTex(w, h, draw) {
  const c = document.createElement('canvas'); c.width = w; c.height = h;
  draw(c.getContext('2d'), w, h);
  const t = new THREE.CanvasTexture(c); t.anisotropy = 4; return t;
}

/* ---------- World ---------- */
// floor: faint rose pattern, with a lace-edged rug under the stall
function roseTex(bg, petal, line, leafC, reps) {
  const t = canvasTex(256, 256, (x, w) => {
    x.fillStyle = bg; x.fillRect(0, 0, w, w);
    const rose = (cx, cy, r, rot) => {
      x.save(); x.translate(cx, cy); x.rotate(rot);
      x.fillStyle = leafC;
      for (const a of [.6, 2.4]) { x.save(); x.rotate(a); x.beginPath(); x.ellipse(r * 1.45, 0, r * .75, r * .32, 0, 0, 7); x.fill(); x.restore(); }
      x.fillStyle = petal;
      for (let i = 0; i < 5; i++) { const a = i / 5 * Math.PI * 2; x.beginPath(); x.arc(Math.cos(a) * r * .5, Math.sin(a) * r * .5, r * .62, 0, 7); x.fill(); }
      x.strokeStyle = line; x.lineWidth = 2.2; x.lineCap = 'round';
      x.beginPath();
      for (let k = 0; k <= 60; k++) { const a = k / 60 * Math.PI * 5, rr = r * .78 * (k / 60); x.lineTo(Math.cos(a) * rr, Math.sin(a) * rr); }
      x.stroke();
      x.restore();
    };
    rose(64, 64, 22, .3); rose(192, 192, 22, 1.4); rose(192, 64, 12, 2.2); rose(64, 192, 12, .9);
  });
  t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(reps, reps);
  return t;
}
add(scene, new THREE.CircleGeometry(60, 64), M(0xffffff, { roughness: 1, map: roseTex('#ffd3e4', '#ffc6db', '#ffb3cd', '#f2cdd6', 30) }), [0, 0, 0], 1, [-Math.PI / 2, 0, 0]).castShadow = false;
add(scene, new THREE.CircleGeometry(5.6, 64), M(0xffffff, { roughness: 1, map: roseTex('#ffc4da', '#ffb6d0', '#ffa2c3', '#efc0cc', 4) }), [0, .01, .3], 1, [-Math.PI / 2, 0, 0]).castShadow = false;
{
  const lace = M(0xfff0f6, { roughness: .9 });
  for (let i = 0; i < 72; i++) { const a = i / 72 * Math.PI * 2; add(scene, SPH, lace, [Math.cos(a) * 5.6, .012, .3 + Math.sin(a) * 5.6], [.2, .02, .2], [0, 0, 0], false).receiveShadow = true; }
}

const cloudMat = M(0xfff6fa, { roughness: 1, emissive: 0xffe3ef, emissiveIntensity: .35 });
const cloudMat2 = M(0xffd9ec, { roughness: 1, emissive: 0xffc9e2, emissiveIntensity: .3 });
const clouds = [];
function cloud(x, y, z, s, mat) {
  const g = new THREE.Group(); g.position.set(x, y, z); g.scale.setScalar(s);
  [[0, 0, 0, 1], [.9, -.15, .1, .75], [-.9, -.18, .05, .72], [.45, .42, 0, .7], [-.42, .38, .1, .66], [1.6, -.32, 0, .5], [-1.6, -.32, 0, .5]]
    .forEach(([a, b, c, r]) => add(g, SPH, mat, [a, b, c], r, [0, 0, 0], false));
  scene.add(g); clouds.push({ g, x, ph: Math.random() * 6 }); return g;
}
cloud(-9, 2.2, -10, 1.6, cloudMat); cloud(-3.5, 5.4, -12, 1.4, cloudMat2); cloud(3.5, 6.2, -11, 1.5, cloudMat);
cloud(9.5, 3, -10, 1.7, cloudMat2); cloud(-12, 6.5, -14, 1.5, cloudMat2); cloud(13, 7, -15, 1.5, cloudMat);
cloud(-7.5, .4, -5, 1.1, cloudMat); cloud(7.8, .5, -5.5, 1.2, cloudMat); cloud(0, .3, -9, 1.3, cloudMat2);

const floaters = [];
(() => {
  const st = new THREE.Shape();
  for (let i = 0; i < 10; i++) {
    const a = Math.PI / 2 + i * Math.PI / 5, r = i % 2 ? .1 : .23;
    i ? st.lineTo(Math.cos(a) * r, Math.sin(a) * r) : st.moveTo(Math.cos(a) * r, Math.sin(a) * r);
  }
  const hs = new THREE.Shape();
  hs.moveTo(0, -.3); hs.bezierCurveTo(-.05, -.25, -.4, -.05, -.4, .12); hs.bezierCurveTo(-.4, .32, -.12, .38, 0, .2);
  hs.bezierCurveTo(.12, .38, .4, .32, .4, .12); hs.bezierCurveTo(.4, -.05, .05, -.25, 0, -.3);
  const ex = { depth: .08, bevelEnabled: true, bevelThickness: .04, bevelSize: .04, bevelSegments: 3 };
  const sg = new THREE.ExtrudeGeometry(st, ex); sg.center();
  const hg = new THREE.ExtrudeGeometry(hs, ex); hg.center();
  const sm = M(0xffe27a, { emissive: 0xffc93a, emissiveIntensity: .35, roughness: .4 });
  const hm = M(0xff8fbf, { emissive: 0xff6fa8, emissiveIntensity: .25, roughness: .45 });
  [[-5.5, 4.2, -3, 's'], [-6.6, 2.4, -2, 'h'], [5.6, 4.4, -3, 's'], [6.4, 2.7, -2, 'h'], [-2.2, 4.6, -4, 's'], [2.4, 4.9, -5, 's'],
   [-4.4, 1.2, -3.5, 's'], [4.8, 1.5, -3.5, 's'], [0, 5.6, -6, 'h'], [-8, 4.8, -6, 's'], [8.4, 5, -6, 's']]
    .forEach(([x, y, z, k], i) => {
      const m = add(scene, k === 's' ? sg : hg, k === 's' ? sm : hm, [x, y, z], k === 's' ? 1.3 : 1.1, [0, 0, rnd(-.4, .4)], false);
      floaters.push({ m, y, ph: i * 1.3 });
    });
})();

// counter + stove
const counterTex = canvasTex(256, 128, (x, w, h) => {
  x.fillStyle = '#ffb5d3'; x.fillRect(0, 0, w, h);
  x.fillStyle = '#fff3f8';
  for (let r = 0; r < 4; r++) for (let c = 0; c < 8; c++) { x.beginPath(); x.arc(c * 32 + (r % 2 ? 16 : 0) + 8, r * 32 + 16, 6, 0, 7); x.fill(); }
});
counterTex.wrapS = counterTex.wrapT = THREE.RepeatWrapping; counterTex.repeat.set(2, 1.5);
add(scene, new THREE.BoxGeometry(3.2, 1.2, 1.7), M(0xffffff, { map: counterTex, roughness: .8 }), [0, .6, 0]);
add(scene, new THREE.BoxGeometry(3.45, .12, 1.95), M(0xfff7fb, { roughness: .5 }), [0, 1.26, 0]);
add(scene, new THREE.BoxGeometry(1.8, .2, 1.32), M(0xf3eef6, { roughness: .4 }), [0, 1.42, 0]);
add(scene, new THREE.TorusGeometry(.46, .05, 10, 40), M(0x6c6170, { roughness: .5 }), [0, 1.53, .05], 1, [-Math.PI / 2, 0, 0]);
for (let i = 0; i < 4; i++) { const a = i * Math.PI / 2 + Math.PI / 4; add(scene, new THREE.BoxGeometry(.06, .16, .34), M(0x6c6170, { roughness: .5 }), [Math.cos(a) * .6, 1.6, .05 + Math.sin(a) * .6], 1, [0, -a, 0]); }
for (const s of [-1, 1]) add(scene, new THREE.CylinderGeometry(.08, .08, .07, 18), M(0xff7fb3), [s * .65, 1.42, .69], 1, [Math.PI / 2, 0, 0]);
const knob = scene.children[scene.children.length - 1];

// shop street behind the stall: the ramen shop in the middle, neighbours on both sides
const signTexes = [];
function drawLabel(x, w, h, o) {
  x.clearRect(0, 0, w, h);
  x.fillStyle = o.bg; x.strokeStyle = o.edge; x.lineWidth = 12;
  x.beginPath(); x.roundRect ? x.roundRect(8, 8, w - 16, h - 16, 40) : x.rect(8, 8, w - 16, h - 16); x.fill(); x.stroke();
  x.fillStyle = o.fg; x.font = `${o.size || 84}px Jua, "Apple SD Gothic Neo", "Noto Sans KR", "Malgun Gothic", sans-serif`; x.textAlign = 'center'; x.textBaseline = 'middle';
  x.fillText(o.text, w / 2, h / 2 + 6);
  if (o.dots) { x.fillStyle = o.edge; for (const cx of [52, w - 52]) { x.beginPath(); x.arc(cx, h / 2, 14, 0, 7); x.fill(); } }
}
function labelMat(o) {
  const t = canvasTex(512, 160, (x, w, h) => drawLabel(x, w, h, o));
  signTexes.push([t, o]);
  return M(0xffffff, { map: t, roughness: .7 });
}
function shop(o) {
  const g = new THREE.Group(); g.position.set(o.x, 0, o.z); scene.add(g);
  const { w, h } = o, front = .8;
  add(g, new THREE.BoxGeometry(w, h, 1.6), M(o.wall, { roughness: .85 }), [0, h / 2, 0]);
  add(g, new THREE.BoxGeometry(w + .3, .28, 1.9), M(o.roof, { roughness: .6 }), [0, h + .14, 0]);
  add(g, new THREE.BoxGeometry(w + .1, .3, 1.7), M(0xffffff, { roughness: .7 }), [0, .15, 0]);
  add(g, new THREE.BoxGeometry(w * .26, 1.55, .08), M(o.door, { roughness: .6 }), [0, .85, front]);
  const glass = M(0xd6f0ff, { roughness: .15, emissive: 0x9cc8e6, emissiveIntensity: .35 });
  for (const s of [-1, 1]) {
    add(g, new THREE.BoxGeometry(w * .24, .95, .06), glass, [s * w * .3, 1.25, front]);
    add(g, new THREE.BoxGeometry(w * .26, .08, .14), M(0xffffff), [s * w * .3, .74, front + .03]);
  }
  // striped awning with a scalloped edge
  const n = Math.max(6, Math.round(w / .38)), sw = (w + .2) / n;
  const aA = M(o.awn, { roughness: .7 }), aB = M(0xffffff, { roughness: .7 });
  for (let i = 0; i < n; i++) {
    const x = -w / 2 - .1 + sw * (i + .5), m = i % 2 ? aB : aA;
    add(g, new THREE.BoxGeometry(sw, .05, .85), m, [x, 2.3, front + .32], 1, [.5, 0, 0]);
    add(g, SPH, m, [x, 2.1, front + .69], [sw / 2, .09, .05], [0, 0, 0], false);
  }
  const sw2 = o.signW || w * .8, side = M(o.roof);
  add(g, new THREE.BoxGeometry(sw2, sw2 * .3125, .1), [side, side, side, side, labelMat(o.label), side], [0, h - .62, front + .06]);
  return g;
}
const ramenShop = shop({ x: 0, z: -4.6, w: 4.6, h: 4.6, wall: 0xfff1e4, roof: 0xff6f9f, awn: 0xff6f9f, door: 0xc8806b, signW: 3.6,
  label: { text: '냥이 라면', bg: '#ffffff', fg: '#e2477f', edge: '#ff8dbd', dots: true } });
shop({ x: -5.4, z: -5.2, w: 3.4, h: 3.7, wall: 0xffe9bf, roof: 0xf4a259, awn: 0xf4a259, door: 0xb07a5a, label: { text: '빵집', bg: '#fffaf0', fg: '#c46b22', edge: '#f4a259' } });
shop({ x: -9.4, z: -5.6, w: 3.4, h: 4.1, wall: 0xdcf5e9, roof: 0x52b788, awn: 0x52b788, door: 0x7a9e8a, label: { text: '꽃집', bg: '#f6fffa', fg: '#2f8a5f', edge: '#52b788' } });
shop({ x: 5.4, z: -5.2, w: 3.4, h: 3.9, wall: 0xece4ff, roof: 0x9b7bff, awn: 0x9b7bff, door: 0x8d7ab8, label: { text: '아이스크림', bg: '#fbf8ff', fg: '#6f4fd6', edge: '#9b7bff', size: 64 } });
shop({ x: 9.4, z: -5.6, w: 3.4, h: 3.5, wall: 0xdff0ff, roof: 0x4aa3e8, awn: 0x4aa3e8, door: 0x6b8fb0, label: { text: '문구점', bg: '#f7fbff', fg: '#2f78b8', edge: '#4aa3e8' } });
// ramen shop details: noren curtain and lanterns
for (let i = -1; i <= 1; i++) add(ramenShop, new THREE.BoxGeometry(.36, .5, .03), M(0xff8dbd, { roughness: .8 }), [i * .4, 1.42, .86]);
for (const s of [-1, 1]) {
  add(ramenShop, SPH, M(0xff5a5a, { roughness: .5, emissive: 0xff3b3b, emissiveIntensity: .35 }), [s * 1.95, 2.75, 1.05], [.2, .26, .2]);
  for (const dy of [-.27, .27]) add(ramenShop, new THREE.CylinderGeometry(.11, .11, .06, 16), M(0xffcf4a), [s * 1.95, 2.75 + dy, 1.05]);
}
// sidewalk, trees and lamp posts
add(scene, new THREE.BoxGeometry(26, .05, 1.8), M(0xfff4f8, { roughness: .9 }), [0, .025, -3.1]).castShadow = false;
const trunk = M(0xc99a82), leaf = M(0xa8e6b8, { roughness: .9 }), leaf2 = M(0x8fd9a8, { roughness: .9 });
for (const x of [-7.4, -3.2, 3.2, 7.4]) {
  add(scene, new THREE.CylinderGeometry(.09, .12, 1.3, 10), trunk, [x, .65, -3.3]);
  add(scene, SPH, leaf, [x, 1.65, -3.3], .55);
  add(scene, SPH, leaf2, [x - .3, 1.45, -3.2], .38);
  add(scene, SPH, leaf2, [x + .32, 1.5, -3.25], .36);
}
for (const x of [-11.5, 11.5]) {
  add(scene, new THREE.CylinderGeometry(.05, .06, 2.6, 10), M(0xffb3d1), [x, 1.3, -3.4]);
  add(scene, SPH, M(0xfff6d6, { emissive: 0xffe9a8, emissiveIntensity: .6 }), [x, 2.7, -3.4], .18);
}
// Google Fonts splits Korean into many small files, so ask for exactly the sign letters, then redraw
if (document.fonts && document.fonts.load) {
  const redraw = () => signTexes.forEach(([t, o]) => { drawLabel(t.image.getContext('2d'), 512, 160, o); t.needsUpdate = true; });
  const letters = signTexes.map(([, o]) => o.text).join('');
  Promise.all([document.fonts.load('84px Jua', letters), document.fonts.ready]).then(redraw, redraw);
  if (document.fonts.addEventListener) document.fonts.addEventListener('loadingdone', redraw);
}

// customer table
// customer table: low and set forward, so the bowl sits in front of the customer instead of in their face
const TABLE = new THREE.Vector3(3.05, .68, 1.3);
add(scene, new THREE.CylinderGeometry(.6, .6, .08, 40), M(0xffffff, { roughness: .5 }), [TABLE.x, TABLE.y - .04, TABLE.z]);
add(scene, new THREE.CylinderGeometry(.08, .12, .62, 16), M(0xffb3d1), [TABLE.x, .33, TABLE.z]);
add(scene, new THREE.CylinderGeometry(.38, .38, .04, 32), M(0xffb3d1), [TABLE.x, .02, TABLE.z]);

/* ---------- Pot ---------- */
const POT = { x: 0, y: 1.68, z: .05, h: .55 };
const pot = new THREE.Group(); pot.position.set(POT.x, POT.y, POT.z); scene.add(pot);
const potPink = M(0xff9cc6, { roughness: .35 });
add(pot, new THREE.CylinderGeometry(.79, .73, .62, 48, 1, true), potPink, [0, .31, 0]);
add(pot, new THREE.CylinderGeometry(.75, .69, .6, 48, 1, true), M(0xf6f0f3, { side: THREE.BackSide, roughness: .3 }), [0, .32, 0], 1, [0, 0, 0], false);
add(pot, new THREE.CylinderGeometry(.73, .73, .04, 48), M(0xeee6ea), [0, .02, 0]);
add(pot, new THREE.TorusGeometry(.77, .04, 10, 56), potPink, [0, .62, 0], 1, [Math.PI / 2, 0, 0]);
for (const s of [-1, 1]) add(pot, new THREE.TorusGeometry(.13, .035, 8, 20, Math.PI), M(0xff7fb3), [s * .86, .5, 0], 1, [Math.PI / 2, 0, s * Math.PI / 2]);

const waterMat = M(0xcfeeff, { transparent: true, opacity: .62, roughness: .15 });
const water = add(pot, new THREE.CylinderGeometry(.7, .67, 1, 48), waterMat, [0, .04, 0], [1, .001, 1], [0, 0, 0], false);
water.visible = false;
const surf = new THREE.Group(); pot.add(surf);

// noodles
const noodleTex = canvasTex(128, 128, (x, w, h) => {
  x.fillStyle = '#f5c84c'; x.fillRect(0, 0, w, h);
  x.strokeStyle = '#d9a52b'; x.lineWidth = 3;
  for (let r = 0; r < 12; r++) { x.beginPath(); for (let i = 0; i <= w; i += 4) x.lineTo(i, r * 11 + 5 + Math.sin(i * .25 + r) * 3); x.stroke(); }
});
const noodleMat = M(0xf7d36a, { roughness: .5 });
const noodles = new THREE.Group(); surf.add(noodles); noodles.visible = false;
const block = add(noodles, new THREE.BoxGeometry(.8, .16, .58), M(0xffffff, { map: noodleTex, roughness: .6 }), [0, .02, 0], 1, [0, .3, 0], false);
const curls = new THREE.Group(); noodles.add(curls);
const curlGeo = new THREE.TorusGeometry(.1, .027, 8, 24, Math.PI * 1.55);
for (let i = 0; i < 22; i++) {
  const a = rnd(0, Math.PI * 2), r = Math.sqrt(Math.random()) * .5;
  add(curls, curlGeo, noodleMat, [Math.cos(a) * r, rnd(-.01, .03), Math.sin(a) * r], 1, [Math.PI / 2 + rnd(-.35, .35), rnd(-.3, .3), rnd(0, 6.3)], false);
}

// toppings
const topMesh = {};
(() => {
  const mk = id => { const g = new THREE.Group(); g.visible = false; g.userData.pop = 0; surf.add(g); topMesh[id] = g; return g; };
  let g = mk('egg');
  add(g, SPH, M(0xffffff, { roughness: .4 }), [.26, .02, .2], [.25, .05, .21], [0, 0, 0], false);
  add(g, SPH, M(0xffb21f, { roughness: .3 }), [.27, .05, .21], [.1, .06, .1], [0, 0, 0], false);
  g = mk('pa');
  const ring = new THREE.TorusGeometry(.04, .016, 6, 14), pm = M(0x69c048), pm2 = M(0xc6ec8f);
  for (let i = 0; i < 14; i++) { const a = rnd(0, 6.3), r = rnd(.1, .55); add(g, ring, i % 3 ? pm : pm2, [Math.cos(a) * r, .045, Math.sin(a) * r], 1, [Math.PI / 2 + rnd(-.3, .3), 0, 0], false); }
  g = mk('cheese');
  add(g, new THREE.BoxGeometry(.4, .025, .4), M(0xffd23f, { roughness: .45 }), [-.02, .07, -.06], 1, [0, .75, .06], false);
  g = mk('tteok');
  const tg = new THREE.CylinderGeometry(.06, .06, .22, 14), tm = M(0xfbf7ee, { roughness: .5 });
  [[-.36, -.12, .2], [-.25, -.28, 1.2], [-.44, .05, 2.1], [-.18, -.4, .6]].forEach(([x, z, r]) => add(g, tg, tm, [x, .04, z], 1, [0, r, Math.PI / 2], false));
  g = mk('mandu');
  const dm = M(0xf3e5c8, { roughness: .55 });
  [[.36, -.22, .4], [.18, -.38, -.5]].forEach(([x, z, r]) => {
    add(g, SPH, dm, [x, .04, z], [.15, .08, .1], [0, r, 0], false);
    add(g, SPH, dm, [x, .1, z], [.12, .04, .025], [0, r, 0], false);
  });
  g = mk('chili');
  const sp = new THREE.BoxGeometry(.03, .012, .03), cm = M(0xc5221a);
  for (let i = 0; i < 40; i++) { const a = rnd(0, 6.3), r = Math.sqrt(Math.random()) * .62; add(g, sp, cm, [Math.cos(a) * r, .03, Math.sin(a) * r], 1, [0, rnd(0, 3), 0], false); }
})();

// bubbles & steam
const bubbleMat = new THREE.MeshStandardMaterial({ color: 0xffffff, transparent: true, opacity: .75, roughness: .1 });
const bubbles = [];
for (let i = 0; i < 28; i++) { const m = add(pot, SPH, bubbleMat, [0, 0, 0], .04, [0, 0, 0], false); m.visible = false; bubbles.push({ m, life: 0, max: 1 }); }
const steamTex = canvasTex(64, 64, (x) => {
  const g = x.createRadialGradient(32, 32, 0, 32, 32, 32);
  g.addColorStop(0, 'rgba(255,255,255,.9)'); g.addColorStop(1, 'rgba(255,255,255,0)');
  x.fillStyle = g; x.fillRect(0, 0, 64, 64);
});
const steams = [];
for (let i = 0; i < 14; i++) {
  const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: steamTex, transparent: true, opacity: 0, depthWrite: false }));
  pot.add(s); steams.push({ s, life: 0, max: 1.6, x: 0, z: 0 });
}
// sprinkle particles (world space)
const sprGeo = new THREE.BoxGeometry(.035, .035, .035);
const sprinkles = [];
for (let i = 0; i < 70; i++) { const m = new THREE.Mesh(sprGeo, M(0xffffff)); m.visible = false; scene.add(m); sprinkles.push({ m, vy: 0, on: false }); }
function sprinkle(color, n = 22) {
  let k = 0;
  for (const p of sprinkles) {
    if (p.on) continue;
    const a = rnd(0, 6.3), r = Math.sqrt(Math.random()) * .45;
    p.m.material.color.setHex(color); p.m.position.set(POT.x + Math.cos(a) * r, POT.y + 1.1 + rnd(0, .5), POT.z + Math.sin(a) * r);
    p.m.rotation.set(rnd(0, 3), rnd(0, 3), 0); p.vy = rnd(-.5, 0); p.on = true; p.m.visible = true;
    if (++k >= n) break;
  }
}

// flame
const flame = new THREE.Group(); flame.position.set(0, 1.52, .05); scene.add(flame); flame.visible = false;
const fOut = new THREE.MeshBasicMaterial({ color: 0x5aa8ff, transparent: true, opacity: .85 });
const fIn = new THREE.MeshBasicMaterial({ color: 0xcfe9ff, transparent: true, opacity: .9 });
const flames = [];
for (let i = 0; i < 12; i++) {
  const a = i / 12 * Math.PI * 2;
  const g = new THREE.Group(); g.position.set(Math.cos(a) * .5, 0, Math.sin(a) * .5); flame.add(g);
  add(g, new THREE.ConeGeometry(.065, .17, 10), fOut, [0, .085, 0], 1, [0, 0, 0], false);
  add(g, new THREE.ConeGeometry(.032, .09, 8), fIn, [0, .05, 0], 1, [0, 0, 0], false);
  flames.push(g);
}
const flameLight = new THREE.PointLight(0xffa860, 0, 3); flameLight.position.set(0, 1.7, .6); scene.add(flameLight);

// piggy bank on the counter, right of the stove: paid coins fly in with a clink
const piggy = new THREE.Group(); piggy.position.set(1.28, 1.32, .38); piggy.rotation.y = -.55; scene.add(piggy);
(() => {
  const pk = M(0xffa9cb, { roughness: .45 }), dk = M(0xff7fb0, { roughness: .45 }), K = M(0x1a1418, { roughness: .2 });
  const pb = new THREE.Group(); pb.position.y = .3; piggy.add(pb); piggy.userData.body = pb;
  add(pb, SPH, pk, [0, 0, 0], [.3, .25, .26]);
  add(pb, new THREE.CylinderGeometry(.09, .1, .08, 20), dk, [.3, -.02, 0], 1, [0, 0, Math.PI / 2]);
  for (const s of [-1, 1]) {
    add(pb, SPH, K, [.345, -.02, s * .035], .017, [0, 0, 0], false);
    add(pb, SPH, K, [.2, .1, s * .13], .028, [0, 0, 0], false);
    add(pb, new THREE.ConeGeometry(.07, .12, 12), dk, [.08, .23, s * .13], 1, [s * .3, 0, -.4]);
    for (const f of [-1, 1]) add(pb, new THREE.CylinderGeometry(.05, .05, .12, 12), dk, [f * .14, -.24, s * .13]);
  }
  add(pb, new THREE.BoxGeometry(.04, .02, .14), K, [0, .245, 0], 1, [0, 0, 0], false);
  add(pb, new THREE.TorusGeometry(.04, .012, 6, 14, Math.PI * 1.5), dk, [-.3, .03, 0], 1, [0, Math.PI / 2, 0]);
})();
piggy.updateMatrixWorld(true);
const SLOT = new THREE.Vector3(0, .58, 0).applyMatrix4(piggy.matrixWorld);
const coinGeo = new THREE.CylinderGeometry(.085, .085, .025, 20), coinMat = M(0xffcf3f, { roughness: .3, metalness: .35, emissive: 0x5a3c00, emissiveIntensity: .25 });
const coins = [];
for (let i = 0; i < 6; i++) { const m = new THREE.Mesh(coinGeo, coinMat); m.visible = false; m.castShadow = true; scene.add(m); coins.push({ m, t: 0, on: false, from: new THREE.Vector3() }); }
// one coin per 1,000 won (at least one, at most six), dropped one after another
function payCoins(won) {
  const n = clamp(Math.round(won / 1000), 1, 6);
  for (let i = 0; i < n; i++) {
    const c = coins.at(i);
    c.from.set(TABLE.x + rnd(-.25, .25), TABLE.y + .3, TABLE.z + rnd(-.2, .2));
    c.t = -i * .14; c.on = true; c.m.visible = false;
  }
}
function clink() {
  sfx(2093, .14, 'triangle', .05); sfx(3136, .1, 'sine', .03, 0, .012); sfx(4186, .05, 'sine', .015, 0, .02);
}

// kettle
const kettle = new THREE.Group(); scene.add(kettle);
const kMat = M(0x8fdcc7, { roughness: .35 });
add(kettle, new THREE.CylinderGeometry(.24, .29, .36, 28), kMat);
add(kettle, SPH, kMat, [0, .17, 0], [.24, .1, .24]);
add(kettle, SPH, M(0xff8dbd), [0, .28, 0], .05);
const spout = add(kettle, new THREE.CylinderGeometry(.035, .055, .34, 12), kMat, [.32, .06, 0], 1, [0, 0, -.95]);
const spoutTip = new THREE.Object3D(); spoutTip.position.set(0, .17, 0); spout.add(spoutTip);
add(kettle, new THREE.TorusGeometry(.14, .032, 8, 18, Math.PI), kMat, [-.27, .02, 0], 1, [0, 0, Math.PI / 2]);
const KREST = new THREE.Vector3(-1.2, 1.5, .5), KPOUR = new THREE.Vector3(-.85, POT.y + 1.2, .05);
kettle.position.copy(KREST); kettle.userData.p = 0;
const stream = new THREE.Mesh(new THREE.CylinderGeometry(.035, .035, 1, 10), new THREE.MeshStandardMaterial({ color: 0xa8dcff, transparent: true, opacity: .8, roughness: .1 }));
stream.visible = false; scene.add(stream);

// bowl for serving
function makeBowl() {
  const g = new THREE.Group();
  const pts = [[0, 0], [.32, 0], [.36, .04], [.5, .2], [.58, .38], [.6, .42]].map(p => new THREE.Vector2(p[0], p[1]));
  add(g, new THREE.LatheGeometry(pts, 40), M(0xffffff, { side: THREE.DoubleSide, roughness: .35 }));
  add(g, new THREE.TorusGeometry(.6, .025, 8, 40), M(0xff8dbd), [0, .42, 0], 1, [Math.PI / 2, 0, 0]);
  const soup = add(g, new THREE.CylinderGeometry(.55, .55, .02, 40), M(waterMat.color.getHex(), { roughness: .2 }), [0, .37, 0], 1, [0, 0, 0], false);
  const top = surf.clone(); top.position.set(0, .36, 0); top.scale.setScalar(.78); g.add(top);
  return g;
}

/* ---------- Nyangi ---------- */
const nyangi = (() => {
  const root = new THREE.Group(), body = new THREE.Group(); root.add(body);
  // soft, velvety plush materials to match the reference render
  const W = M(0xfffcfd, { roughness: .92, emissive: 0x1c1418, emissiveIntensity: 1 }),
        P = M(0xff8cbf, { roughness: .78, emissive: 0x2a0816, emissiveIntensity: 1 }),
        PB = M(0xff5a9f, { roughness: .6, emissive: 0x2a0010, emissiveIntensity: 1 }),
        PL = M(0xff7fb4, { roughness: .55 }),
        K = M(0x1a1418, { roughness: .2 }), Y = M(0xffc62e, { roughness: .4 }),
        BL = M(0xff9cc2, { transparent: true, opacity: .55, roughness: .95 }), WH = new THREE.MeshBasicMaterial({ color: 0xffffff });
  const lathe = (pts, seg = 40) => new THREE.LatheGeometry(pts.map(p => new THREE.Vector2(p[0], p[1])), seg);
  // legs and feet
  for (const s of [-1, 1]) {
    add(body, SPH, W, [s * .22, .13, .07], [.24, .14, .3]);
    add(body, new THREE.CylinderGeometry(.17, .19, .36, 24), W, [s * .21, .33, 0]);
  }
  // one-piece pink romper: smooth pear-shaped body
  const torsoProfile = [[0, .38], [.3, .4], [.42, .47], [.5, .62], [.52, .78], [.49, .95], [.44, 1.1], [.37, 1.24], [.22, 1.35], [0, 1.38]];
  add(body, lathe(torsoProfile), P);
  // two white buttons on the chest
  for (const s of [-1, 1]) {
    const r = .545, x = s * .16, z = Math.sqrt(r * r - x * x);
    const b = add(body, SPH, PB, [x, .98, z + .005], [.06, .06, .028], [0, 0, 0], false);
    b.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), new THREE.Vector3(x, 0, z).normalize());
  }
  // white apron over the romper: skirt + bib, pink frill along the hem, waist tie and a heart pocket
  const AP = M(0xffffff, { roughness: .85, side: THREE.DoubleSide, emissive: 0x1c1418, emissiveIntensity: 1 });
  const arc = (pts, half) => new THREE.LatheGeometry(pts.map(p => new THREE.Vector2(p[0], p[1])), 24, -half, half * 2);
  add(body, arc([[.45, .42], [.53, .62], [.548, .78], [.52, .9]], 1.05), AP);
  add(body, arc([[.52, .9], [.49, 1.02], [.44, 1.14], [.39, 1.24]], .6), AP);
  const frill = M(0xff8cbf, { roughness: .7 });
  for (let a = -1.05; a <= 1.051; a += .105) add(body, SPH, frill, [Math.sin(a) * .455, .42, Math.cos(a) * .455], [.05, .04, .05], [0, 0, 0], false);
  add(body, new THREE.TorusGeometry(.525, .028, 8, 48), AP, [0, .9, 0], 1, [Math.PI / 2, 0, 0]);
  const heart = new THREE.Shape();
  heart.moveTo(0, -.3); heart.bezierCurveTo(-.05, -.25, -.4, -.05, -.4, .12); heart.bezierCurveTo(-.4, .32, -.12, .38, 0, .2);
  heart.bezierCurveTo(.12, .38, .4, .32, .4, .12); heart.bezierCurveTo(.4, -.05, .05, -.25, 0, -.3);
  const hg = new THREE.ExtrudeGeometry(heart, { depth: .04, bevelEnabled: true, bevelThickness: .02, bevelSize: .02, bevelSegments: 2 }); hg.center();
  add(body, hg, frill, [.17, .64, .545], .32, [0, .3, 0], false);
  // arms: pink puff sleeve, white arm, round paw
  const arms = [];
  for (const s of [-1, 1]) {
    const pv = new THREE.Group(); pv.position.set(s * .42, 1.16, 0); body.add(pv);
    add(pv, SPH, P, [0, -.04, 0], [.21, .19, .2]);
    add(pv, new THREE.CylinderGeometry(.12, .13, .36, 20), W, [0, -.27, 0]);
    add(pv, SPH, W, [0, -.48, 0], [.16, .15, .15]);
    pv.rotation.z = s * .5; arms.push(pv);
  }
  // head: wide, soft oval
  const head = new THREE.Group(); head.position.set(0, 2.02, 0); body.add(head);
  const HR = [1.22, .87, .93], O = [0, 0, 0];
  add(head, SPH, W, O, HR);
  // ears: short, wide-based rounded triangles
  const earGeo = lathe([[.42, 0], [.41, .12], [.36, .25], [.27, .37], [.16, .46], [.06, .51], [0, .52]], 32);
  for (const s of [-1, 1]) add(head, earGeo, W, [s * .7, .56, .04], [1.12, 1.15, .8], [0, 0, -s * .38]);
  // chef hat: band plus a puffy crown, set a little to the left so the bow stays visible
  const hat = new THREE.Group(); hat.position.set(-.12, .74, -.05); hat.rotation.set(-.08, 0, .12); hat.scale.setScalar(1.15); head.add(hat);
  const HW = M(0xffffff, { roughness: .9, emissive: 0x1c1418, emissiveIntensity: 1 });
  add(hat, new THREE.CylinderGeometry(.42, .46, .3, 32), HW, [0, .1, 0]);
  add(hat, new THREE.TorusGeometry(.44, .03, 8, 40), M(0xff8cbf), [0, .02, 0], 1, [Math.PI / 2, 0, 0]);
  [[0, .48, 0, .42], [-.3, .38, .05, .28], [.3, .38, .05, .28], [0, .38, .3, .28], [0, .4, -.28, .28], [-.18, .58, .15, .22], [.18, .6, -.12, .22]]
    .forEach(([x, y, z, r]) => add(hat, SPH, HW, [x, y, z], r));
  // bow on her left ear (viewer's right)
  const bow = new THREE.Group(); bow.position.set(.6, .8, .2); bow.rotation.set(.2, -.15, -.32); bow.scale.setScalar(1.12); head.add(bow);
  add(bow, SPH, PB, [0, 0, .05], [.17, .16, .15]);
  add(bow, SPH, PL, [0, .02, .14], [.08, .07, .04], [0, 0, 0], false);
  for (const s of [-1, 1]) {
    add(bow, SPH, PB, [s * .33, .01, 0], [.34, .27, .16], [0, 0, s * .32]);
    add(bow, SPH, PL, [s * .3, .06, .09], [.17, .1, .07], [0, 0, s * .32], false);
  }
  // face: features sit low and wide on the head, like the reference photos
  for (const s of [-1, 1]) {
    onEll(head, O, HR, s * .6, -.2, SPH, K, [.085, .118, .05]);
    onEll(head, O, HR, s * .6 + .025, -.15, SPH, WH, [.018, .024, .02], .045);
    onEll(head, O, HR, s * .82, -.4, SPH, BL, [.14, .09, .02], .012);
  }
  onEll(head, O, HR, 0, -.34, SPH, Y, [.1, .066, .06], .01);
  // whiskers: three short ones per side, starting near the edge of the face
  for (const s of [-1, 1]) {
    [[-.17, -.08], [-.31, -.31], [-.45, -.54]].forEach(([y0, y1]) => {
      const x0 = .96, z0 = HR[2] * Math.sqrt(Math.max(0, 1 - (x0 / HR[0]) ** 2 - (y0 / HR[1]) ** 2));
      rod(head, new THREE.Vector3(s * x0, y0, z0 + .005), new THREE.Vector3(s * 1.36, y1, z0 - .2), .014, K);
    });
  }
  root.position.set(-2.9, 0, .45); root.rotation.y = .42; root.scale.setScalar(.8);
  root.traverse(o => { if (o.isMesh) o.castShadow = true; });
  scene.add(root);
  return { root, body, head, arms, mood: 'idle', moodT: 0 };
})();
function nyangiMood(m, t = 1.2) { nyangi.mood = m; nyangi.moodT = t; nyangi.moodLen = t; }

// tap Nyangi for a little reaction: a spin, a happy hop or a wiggle, with a floating heart
const ray = new THREE.Raycaster(), ndc = new THREE.Vector2();
let pokeN = 0;
$('#gl').addEventListener('pointerdown', e => {
  const r = e.currentTarget.getBoundingClientRect();
  ndc.set((e.clientX - r.left) / r.width * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
  ray.setFromCamera(ndc, camera);
  if (!ray.intersectObject(nyangi.root, true).length) return;
  const move = ['spin', 'happy', 'wiggle'][pokeN++ % 3];
  nyangiMood(move, move === 'spin' ? .9 : 1);
  sfx(520, .14, 'sine', .07, 420); sfx(1040, .12, 'triangle', .03, 0, .1);
  const h = document.createElement('div'); h.className = 'heart'; h.textContent = '♥';
  h.style.left = e.clientX - r.left + 'px'; h.style.top = e.clientY - r.top + 'px';
  stage.appendChild(h); setTimeout(() => h.remove(), 1300);
});

/* ---------- Customers ---------- */
const STAND = new THREE.Vector3(3.05, 0, .05);
function makeCustomer(T) {
  const g = new THREE.Group(), b = new THREE.Group(); g.add(b);
  const MB = M(T.body), MH = M(T.head), MA = M(T.acc), K = M(0x1f1720, { roughness: .22 }),
        BL = M(0xff9ec2, { transparent: true, opacity: .65 }), WH = new THREE.MeshBasicMaterial({ color: 0xffffff });
  for (const s of [-1, 1]) add(b, SPH, MB, [s * .2, .12, .05], [.18, .12, .24]);
  add(b, SPH, MB, [0, .64, 0], [.5, .56, .45]);
  if (T.kind === 'bear' || T.kind === 'chick') add(b, SPH, MA, [0, .58, .18], [.32, .36, .3]);
  const arms = [];
  for (const s of [-1, 1]) arms.push(add(b, SPH, MB, [s * .48, .68, .05], [.13, .25, .13], [0, 0, s * .45]));
  const head = new THREE.Group(); head.position.set(0, 1.5, 0); b.add(head);
  const HR = [.62, .55, .56], O = [0, 0, 0];
  add(head, SPH, MH, O, HR);
  if (T.kind === 'bear') {
    for (const s of [-1, 1]) { add(head, SPH, MH, [s * .42, .42, -.05], [.17, .17, .12]); add(head, SPH, MA, [s * .42, .42, .05], [.09, .09, .05]); }
    onEll(head, O, HR, 0, -.17, SPH, MA, [.2, .14, .12]);
    onEll(head, O, HR, 0, -.1, SPH, K, [.06, .045, .04], .1);
  } else if (T.kind === 'bunny') {
    for (const s of [-1, 1]) {
      add(head, SPH, MH, [s * .22, .75, -.05], [.12, .38, .1], [0, 0, -s * .15]);
      add(head, SPH, MA, [s * .22, .75, .03], [.06, .27, .04], [0, 0, -s * .15]);
    }
    onEll(head, O, HR, 0, -.1, SPH, MA, [.05, .035, .03], .01);
  } else if (T.kind === 'frog') {
    for (const s of [-1, 1]) {
      add(head, SPH, MH, [s * .3, .43, .1], .2);
      add(head, SPH, MA, [s * .3, .46, .27], [.12, .12, .06], [0, 0, 0], false);
      add(head, SPH, K, [s * .3, .46, .32], [.06, .07, .03], [0, 0, 0], false);
    }
    add(head, new THREE.TorusGeometry(.18, .022, 8, 20, Math.PI), K, [0, -.08, .52], 1, [0, 0, Math.PI], false);
  } else if (T.kind === 'chick') {
    [[-.07, .62, .3], [.06, .66, -.3], [0, .6, 0]].forEach(([x, y, r]) => add(head, SPH, MH, [x, y, 0], [.06, .13, .06], [0, 0, r]));
    onEll(head, O, HR, 0, -.12, SPH, MA, [.12, .07, .1], .03);
  }
  if (T.kind !== 'frog') for (const s of [-1, 1]) {
    onEll(head, O, HR, s * .22, .04, SPH, K, [.06, .08, .04]);
    onEll(head, O, HR, s * .22 + .02, .08, SPH, WH, [.016, .02, .015], .035);
  }
  for (const s of [-1, 1]) onEll(head, O, HR, s * .38, -.13, SPH, BL, [.1, .06, .02], .01);
  g.traverse(o => { if (o.isMesh) o.castShadow = true; });
  g.scale.setScalar(.95);
  scene.add(g);
  return { g, b, head, arms };
}

function makeOrder() {
  const avail = TOPS.filter(t => t.day <= G.day).map(t => t.id);
  const maxN = Math.min(avail.length, 1 + Math.ceil(G.day / 2));
  const n = Math.floor(Math.random() * (maxN + 1));
  for (let i = avail.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [avail[i], avail[j]] = [avail[j], avail[i]]; }
  const pick = avail.slice(0, n).sort((a, b) => TOPS.indexOf(TOP[a]) - TOPS.indexOf(TOP[b]));
  // spicy level: how many times to sprinkle chili (1~3), only when chili is ordered
  const spice = pick.includes('chili') ? 1 + Math.floor(Math.random() * 3) : 0;
  return { water: Math.floor(Math.random() * 3), done: 1 + Math.floor(Math.random() * 3), toppings: pick, spice };
}
function orderLine(o) {
  const tp = o.toppings.map(id => id === 'chili' ? `고춧가루 ${SPICE_SAY[o.spice]}` : TOP[id].name);
  const a = !tp.length ? '아무것도 넣지 말고' : tp.length === 1 ? `${tp[0]} 넣고` : tp.slice(0, -1).map(iRang).join(' ') + ` ${tp[tp.length - 1]} 넣고`;
  return `“${a} ${DONE_SAY[o.done]}, 물은 ${WATER[o.water].say} 부탁해요!”`;
}

function spawnCustomer() {
  const T = CTYPES[Math.floor(Math.random() * CTYPES.length)];
  const parts = makeCustomer(T);
  const pmax = Math.max(45, 70 - G.day * 4);
  const c = Object.assign(parts, { T, order: makeOrder(), state: 'enter', x: 6.5, patience: 1, pmax, timer: 0, ph: Math.random() * 6 });
  parts.g.position.set(c.x, 0, STAND.z);
  G.customer = c; G.orderNo++;
  sfx(660, .12, 'triangle', .06); sfx(990, .18, 'triangle', .05, 0, .1);
}
function showTicket(c) {
  const o = c.order;
  $('#tName').textContent = `${c.T.name} 손님`;
  $('#tNo').textContent = `주문 ${String(G.orderNo).padStart(2, '0')}`;
  $('#tSay').textContent = orderLine(o);
  $('#tWater').textContent = WATER[o.water].name;
  $('#tDone').textContent = STAGE_NAMES[o.done];
  $('#tTops').textContent = o.toppings.length ? o.toppings.map(id => id === 'chili' ? `고춧가루 ×${o.spice}` : TOP[id].name).join(', ') : '없음';
  $('#ticket').hidden = false;
  const W = WATER[o.water], z = $('#gWater .zone');
  z.hidden = false; z.style.left = W.lo * 100 + '%'; z.style.width = (W.hi - W.lo) * 100 + '%';
  const cz = $('#gCook .zone');
  cz.hidden = false; cz.style.left = ZONES[o.done] * 100 + '%'; cz.style.width = (ZONES[o.done + 1] - ZONES[o.done]) * 100 + '%';
}
function hideTicket() { $('#ticket').hidden = true; $('#gWater .zone').hidden = true; $('#gCook .zone').hidden = true; }
function customerLeave(text) {
  const c = G.customer; if (!c) return;
  c.state = 'leave'; hideTicket();
  if (text) say(text, null, 2);
}

/* ---------- Judging ---------- */
function judge(o, p) {
  let s = 0; const notes = [];
  const W = WATER[o.water];
  if (p.water >= W.lo && p.water <= W.hi) s += 1;
  else { if (Math.abs(p.water - (W.lo + W.hi) / 2) < .2) s += .4; notes.push(p.water < W.lo ? '물이 너무 적어요' : '물이 너무 많아요'); }
  const st = stageOf(p.cook);
  if (st === o.done) s += 1;
  else if (st === 0) notes.push('면이 덜 익었어요');
  else if (st === 4) notes.push('면이 다 불었어요');
  else { if (Math.abs(st - o.done) === 1) s += .5; notes.push(st < o.done ? '면이 좀 덜 익었어요' : '면이 너무 익었어요'); }
  const want = new Set(o.toppings), miss = [], extra = [];
  want.forEach(id => { if (!p.toppings.has(id)) miss.push(id); });
  p.toppings.forEach(id => { if (!want.has(id)) extra.push(id); });
  const spiceOff = want.has('chili') && p.toppings.has('chili') && p.chili !== o.spice;
  s += Math.max(0, 1 - .4 * (miss.length + extra.length + (spiceOff ? 1 : 0)));
  if (miss.length) notes.push(`${iGa(TOP[miss[0]].name)} 빠졌어요`);
  if (spiceOff) notes.push(p.chili > o.spice ? '너무 매워요' : '덜 매워요');
  if (p.wrongOrder) { s -= Math.min(1, .5 * p.wrongOrder); notes.unshift(p.orderNote); }
  if (extra.length) notes.push(`${eunNeun(TOP[extra[0]].name)} 안 시켰어요`);
  if (!p.soup) { s -= 1.2; notes.unshift('스프를 안 넣었어요!'); }
  const stars = s >= 2.75 ? 3 : s >= 1.9 ? 2 : s >= 1 ? 1 : 0;
  return { stars, notes };
}

function serve() {
  if (G.screen !== 'play') return;
  const c = G.customer, p = G.pot;
  if (!c || c.state !== 'wait') return toast('아직 주문한 손님이 없어요');
  if (!p.noodles) return toast('면을 넣어야 서빙할 수 있어요');
  if (G.bowl) return;
  const res = judge(c.order, p);
  const bowl = makeBowl();
  bowl.position.set(POT.x, POT.y + .5, POT.z); scene.add(bowl);
  G.bowl = { g: bowl, t: 0, res, c };
  c.state = 'served'; hideTicket();
  G.pot = freshPot(); syncPotMeshes();
  sfx(520, .15, 'triangle', .07, 300);
}
function landBowl(b) {
  const { res, c } = b;
  const price = 3000 + 500 * c.order.toppings.length;
  const pay = Math.round(price * [0, .5, .85, 1][res.stars] / 100) * 100;
  const total = pay;
  G.earned += total; G.total += total; G.served++; G.starSum += res.stars;
  const lines = {
    3: ['완벽해요! 최고의 라면!', '바로 이 맛이에요!', '냥이 라면 최고예요!'][Math.floor(Math.random() * 3)],
    2: `맛있어요! 그런데 ${res.notes[0] || '조금 아쉬워요'}`,
    1: `${res.notes[0] || '음...'}...`,
    0: '이건 못 먹겠어요...',
  };
  say(lines[res.stars], res.stars, 2.4);
  if (total) { coin(`+${won(total)}`); payCoins(total); }
  if (res.stars >= 2) { nyangiMood('happy', 1.4); chime(); } else { nyangiMood('sad', 1.4); sfx(300, .3, 'sawtooth', .04, -120); }
  c.state = 'eat'; c.timer = .9; c.mood = res.stars;
}

/* ---------- HUD helpers ---------- */
let toastT = 0, bubbleT = 0, nyangiSayT = 0;
function toast(msg) { const t = $('#toast'); t.textContent = msg; t.hidden = false; toastT = 1.8; sfx(240, .1, 'square', .03); }
function say(text, stars, dur) {
  const b = $('#bubble'); b.innerHTML = '';
  if (stars != null) { const s = document.createElement('span'); s.className = 'st'; s.textContent = '★'.repeat(stars) + '☆'.repeat(3 - stars); b.appendChild(s); }
  b.appendChild(document.createTextNode(text)); b.hidden = false; bubbleT = dur;
}
function coin(text) {
  const c = G.customer; if (!c) return;
  const p = toScreen(new THREE.Vector3(c.g.position.x, 2.2, c.g.position.z));
  const el = document.createElement('div'); el.className = 'coin'; el.textContent = text;
  el.style.left = p.x + 'px'; el.style.top = p.y + 'px'; stage.appendChild(el);
  setTimeout(() => el.remove(), 1500);
}
const _v = new THREE.Vector3();
function toScreen(v) { _v.copy(v).project(camera); return { x: (_v.x + 1) / 2 * stage.clientWidth, y: (1 - _v.y) / 2 * stage.clientHeight }; }

/* ---------- Controls ---------- */
const topsEl = $('#tops');
TOPS.forEach((t, i) => {
  const b = document.createElement('button');
  b.className = 'key'; b.type = 'button'; b.id = 'top-' + t.id; b.dataset.id = t.id;
  b.innerHTML = `<i class="sw" style="--c:${t.c}"></i>${t.name}${t.id === 'chili' ? '<b class="cnt"></b>' : ''}<small class="lock"></small>`;
  b.addEventListener('click', () => toggleTop(t.id));
  topsEl.appendChild(b);
});
// what this order needs, in recipe order (soup and noodles always)
function needed() {
  const c = G.customer;
  return ['soup', 'noodle'].concat(c && c.state === 'wait' ? c.order.toppings : []);
}
// record an ingredient going in; adding it before an earlier recipe step it needs counts as a wrong order
function checkOrder(id) {
  const p = G.pot, req = needed();
  if (req.includes(id) && !p.log.includes(id)) {
    const skipped = req.filter(x => x !== id && !p.log.includes(x) && STEP_OF[x] < STEP_OF[id]);
    if (skipped.length) {
      p.wrongOrder++;
      if (!p.orderNote) p.orderNote = `${iGa(ITEM_NAME(id))} 너무 일찍 들어갔어요`;
      toast(`순서가 틀렸어요! ${eulReul(ITEM_NAME(skipped[0]))} 먼저 넣어야 해요`);
      sfx(220, .2, 'square', .03, -60);
    }
  }
  p.log.push(id);
}
// the first recipe step that still has something this order needs, and what is left in it
function nextStep() {
  const req = needed(), log = G.pot.log;
  for (let i = 0; i < RECIPE.length; i++) {
    const left = RECIPE[i].items.filter(x => req.includes(x) && !log.includes(x));
    if (left.length) return { i, left };
  }
  return null;
}
// recipe card above the cooking buttons: needed steps show their items, the next one glows, finished ones get a check
const recipeEl = $('#recipe');
recipeEl.innerHTML = RECIPE.map((r, i) => `${i ? '<i class="rarrow" aria-hidden="true">›</i>' : ''}<span class="rstep" id="rs${i}"></span>`).join('');
function renderRecipe() {
  const req = needed(), log = G.pot.log, nx = nextStep();
  RECIPE.forEach((r, i) => {
    const el = $('#rs' + i), mine = r.items.filter(x => req.includes(x));
    const label = mine.length ? mine.map(x => x === 'chili' && G.customer ? `고춧가루×${G.customer.order.spice}` : ITEM_NAME(x)).join('·') : '';
    el.textContent = `${r.n}${label ? ' ' + label : ''}`;
    el.className = 'rstep' + (!mine.length ? ' skip' : mine.every(x => log.includes(x)) ? ' done' : '') + (nx && nx.i === i ? ' next' : '');
  });
}
function toggleTop(id) {
  if (G.screen !== 'play' || TOP[id].day > G.day) return;
  const p = G.pot;
  if (p.toppings.has(id) && id !== 'chili') { toast('한 번 넣은 토핑은 뺄 수 없어요'); return; }
  {
    if (id === 'chili') p.chili++;
    if (!p.toppings.has(id)) checkOrder(id);
    p.toppings.add(id); topMesh[id].userData.pop = 0;
    sprinkle(id === 'chili' ? 0xd2281c : id === 'pa' ? 0x6cc04a : 0xffffff, id === 'chili' ? 26 : id === 'pa' ? 10 : 0);
    sfx(700, .07, 'triangle', .06, 200);
  }
  syncPotMeshes();
}
function setPour(on) {
  if (on && G.screen !== 'play') return;
  if (G.pot.pouring === on) return;
  G.pot.pouring = on; $('#bWater').classList.toggle('held', on);
}
const bW = $('#bWater');
bW.addEventListener('pointerdown', e => { e.preventDefault(); try { bW.setPointerCapture(e.pointerId); } catch (_) {} setPour(true); });
['pointerup', 'pointercancel', 'lostpointercapture'].forEach(ev => bW.addEventListener(ev, () => setPour(false)));
bW.addEventListener('contextmenu', e => e.preventDefault());
bW.addEventListener('keydown', e => { if ((e.key === ' ' || e.key === 'Enter') && !e.repeat) { e.preventDefault(); e.stopPropagation(); setPour(true); } });
bW.addEventListener('keyup', e => { if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); e.stopPropagation(); setPour(false); } });
function toggleFire() {
  if (G.screen !== 'play') return;
  G.pot.flame = !G.pot.flame;
  sfx(G.pot.flame ? 180 : 140, .18, 'sawtooth', .035, G.pot.flame ? 220 : -60);
}
function addNoodles() {
  const p = G.pot;
  if (G.screen !== 'play' || p.noodles) return;
  if (p.water <= .05) return toast('먼저 물을 부어 주세요');
  if (p.temp < .98) toast('아직 안 끓어서 면이 천천히 익어요');
  checkOrder('noodle');
  p.noodles = true; p.drop = 0; p.cook = 0; syncPotMeshes(); sfx(200, .2, 'sine', .08, -100);
}
function addSoup() {
  const p = G.pot;
  if (G.screen !== 'play' || p.soup) return;
  checkOrder('soup');
  p.soup = true; sprinkle(0xe8732c, 30); sfx(900, .15, 'triangle', .05, -500);
}
function trash() {
  if (G.screen !== 'play') return;
  G.pot = freshPot(); syncPotMeshes(); sfx(160, .25, 'sawtooth', .04, -80);
}
$('#bFire').addEventListener('click', toggleFire);
$('#bNoodle').addEventListener('click', addNoodles);
$('#bSoup').addEventListener('click', addSoup);
$('#bTrash').addEventListener('click', trash);
$('#bServe').addEventListener('click', serve);
$('#mute').addEventListener('click', () => setMuted(!muted));
setMuted(muted);
// keys mirror the on-screen layout: top row = cooking steps, middle row = toppings, bottom = trash/serve.
// e.code keeps them working with the Korean keyboard layout too.
const STEP_KEYS = { KeyQ: 'water', KeyW: 'fire', KeyE: 'noodle', KeyR: 'soup' };
const TOP_KEYS = ['KeyA', 'KeyS', 'KeyD', 'KeyF', 'KeyG', 'KeyH'];
window.addEventListener('keydown', e => {
  if (e.metaKey || e.ctrlKey || e.altKey) return;
  const k = e.key.toLowerCase(), code = e.code;
  if (G.screen !== 'play') {
    const free = document.activeElement === document.body;
    if (G.screen === 'how') {
      if (k === 'escape') closeHow();
      else if (k === 'arrowright' && free) tutGo(1);
      else if (k === 'arrowleft' && free) tutGo(-1);
    } else if (k === 'enter' && free) (G.screen === 'title' ? startDay : nextDay)();
    return;
  }
  if (e.target && e.target.id === 'bWater') return;
  if (e.target && e.target.tagName === 'BUTTON' && (k === ' ' || k === 'enter')) return;
  const step = STEP_KEYS[code];
  if (step === 'water') { e.preventDefault(); setPour(true); }
  else if (e.repeat) return;
  else if (step === 'fire') toggleFire();
  else if (step === 'noodle') addNoodles();
  else if (step === 'soup') addSoup();
  else if (code === 'KeyZ') trash();
  else if (code === 'Space') { e.preventDefault(); serve(); }
  else if (TOP_KEYS.includes(code)) toggleTop(TOPS[TOP_KEYS.indexOf(code)].id);
});
window.addEventListener('keyup', e => { if (STEP_KEYS[e.code] === 'water') setPour(false); });
window.addEventListener('blur', () => setPour(false));

/* ---------- Day flow ---------- */
let best = 0;
try { best = +localStorage.getItem('nyangiRamenBest') || 0; } catch (e) {}
if (best > 1) $('#bestLine').textContent = `최고 기록: ${best}일차까지 영업했어요`;

function setScreen(s) {
  G.screen = s; stage.dataset.screen = s;
  $('#scrTitle').hidden = s !== 'title'; $('#scrHow').hidden = s !== 'how'; $('#scrResult').hidden = s !== 'result';
  $('#panel').hidden = s !== 'play'; $('#hud').hidden = s !== 'play';
}

function startDay() {
  setScreen('play'); G.earned = 0; G.served = 0; G.starSum = 0; G.timeLeft = DAY_LEN; G.spawnT = .4;
  G.pot = freshPot(); syncPotMeshes();
  $('#sDay').textContent = `${G.day}일차`; $('#sGoal').textContent = won(goalOf(G.day));
  TOPS.forEach(t => {
    const b = $('#top-' + t.id), locked = t.day > G.day;
    b.disabled = locked; b.querySelector('.lock').textContent = locked ? `${t.day}일차` : TOP_KEYS[TOPS.indexOf(t)].slice(3);
    b.querySelector('.lock').className = locked ? 'lock' : 'lock kbd';
  });
  chime(); nyangiMood('happy', 1);
  const intro = {
    1: '스프 → 면 → 계란 → 파 순서야! 위에 레시피 카드를 봐!',
    2: '오늘부터 치즈! 치즈는 파랑 같이 마지막에 넣어!',
    3: '오늘부터 떡이랑 만두! 면이랑 같이 넣어야 잘 익어!',
    4: '오늘부터 고춧가루! 맵기만큼 마지막에 뿌려 줘!',
  }[G.day] || '손님이 더 바빠졌어! 순서 지키면서 힘내자!';
  $('#nyangiSay').textContent = intro; $('#nyangiSay').hidden = false; nyangiSayT = 4.5;
}
let passed = false;
function endDay() {
  setScreen('result'); setPour(false); G.pot.flame = false;
  const goal = goalOf(G.day); passed = G.earned >= goal;
  const n = G.served ? Math.round(G.starSum / G.served) : 0;
  $('#rTitle').textContent = `${G.day}일차 영업 끝!`;
  $('#rStars').textContent = '★'.repeat(n) + '☆'.repeat(3 - n);
  $('#rEarn').textContent = won(G.earned); $('#rGoal').textContent = won(goal);
  $('#rBar').style.width = Math.min(100, G.earned / goal * 100) + '%';
  $('#rServed').textContent = `${G.served}명`;
  $('#rTotal').textContent = won(G.total);
  const newTops = TOPS.filter(t => t.day === G.day + 1).map(t => t.name);
  $('#rVerdict').textContent = passed
    ? (newTops.length ? `우와, 목표 달성! 정말 잘했어! 내일은 ${newTops.join(', ')} 토핑이 새로 생겨.` : '우와, 목표 달성! 내일은 손님들이 조금 더 까다로워질 거야.')
    : `아쉽다! ${won(goal - G.earned)}만 더 벌면 됐어. 같은 날을 다시 해 볼까?`;
  $('#btnNext').textContent = passed ? '다음 날 영업하기' : '다시 도전하기';
  if (passed) { try { if (G.day + 1 > best) { best = G.day + 1; localStorage.setItem('nyangiRamenBest', best); } } catch (e) {} nyangiMood('happy', 3); cheer(); }
  else { nyangiMood('sad', 2.4); sob(); }
  $('#btnNext').focus({ preventScroll: true });
}
function nextDay() { if (passed) G.day++; startDay(); }
$('#btnStart').addEventListener('click', startDay);

/* ---------- How to play: Nyangi explains step by step ---------- */
const COOK_SEGS = '<div class="segs"><i style="width:25%;background:#e9dfe5"></i><i style="width:25%;background:#ffe58f"></i><i style="width:22%;background:#ffc560"></i><i style="width:18%;background:#ff9b52"></i><i style="width:10%;background:#c9a99a"></i></div>';
const TUT = [
  { say: '안녕! 나는 냥이야. 2분 동안 라면을 팔아서 목표만큼 돈을 모아 보자!',
    demo: '<span class="pill"><b>1일차</b>남은 시간 2:00</span><span class="pill">오늘 목표<b>20,000원</b></span>' },
  { say: '손님이 오면 주문서를 꼭 봐! 물, 익힘, 토핑을 기억해야 해.',
    demo: '<div class="mini-ticket"><b>곰돌이 손님</b><dl><dt>물</dt><dd class="hl">보통</dd><dt>익힘</dt><dd class="hl">꼬들꼬들</dd><dt>토핑</dt><dd class="hl">계란</dd></dl></div>' },
  { say: '물 붓기 버튼을 꾹 누르고 있다가, 분홍 칸에 오면 손을 떼!',
    demo: '<span class="key col press">물 붓기<small>꾹 누르기</small></span><div class="demo-gauge"><span>물 양</span><div class="bar"><b class="fill anim-water"></b><i class="zone" style="left:48%;width:22%"></i></div></div>' },
  { say: '불을 켜고 보글보글 끓으면, 스프 먼저! 그다음에 면을 넣어.',
    demo: '<span class="key on">불 켜기</span><i class="arrow">→</i><span class="key">스프</span><i class="arrow">→</i><span class="key">면 넣기</span>' },
  { say: '재료는 넣는 순서가 있어! 위에 있는 레시피 카드에서 반짝이는 차례대로 넣어 줘.',
    demo: '<div class="recipe demo-recipe"><span class="rstep done">① 스프</span><i class="rarrow">›</i><span class="rstep done">② 면</span><i class="rarrow">›</i><span class="rstep skip">③</span><i class="rarrow">›</i><span class="rstep next">④ 계란</span><i class="rarrow">›</i><span class="rstep">⑤ 파</span></div>' },
  { say: '손님이 원한 토핑만 골라서 올려 줘. 한 번 넣으면 뺄 수 없으니 잘 보고 넣어!',
    demo: '<span class="key on"><i class="sw" style="--c:#ffd23f"></i>계란</span><span class="key"><i class="sw" style="--c:#6cc04a"></i>파</span><span class="key"><i class="sw" style="--c:#ffcf33"></i>치즈</span>' },
  { say: '익힘 막대가 분홍 칸에 오면 서빙! 별 세 개를 받아 보자!',
    demo: `<div class="demo-gauge"><span>익힘</span><div class="bar">${COOK_SEGS}<i class="zone" style="left:25%;width:25%"></i><b class="marker anim-cook"></b></div></div><span class="key serve">서빙하기</span><span class="demo-stars">★★★</span>` },
];
let tutI = 0;
function renderTut() {
  const t = TUT[tutI];
  $('#howSay').textContent = t.say;
  $('#howDemo').innerHTML = t.demo;
  $('#howStep').textContent = `${tutI + 1} / ${TUT.length}`;
  $('#howDots').innerHTML = TUT.map((_, i) => `<i class="${i === tutI ? 'on' : ''}"></i>`).join('');
  $('#howPrev').disabled = tutI === 0;
  $('#howNext').textContent = tutI === TUT.length - 1 ? '시작하기!' : '다음';
  nyangiMood('happy', .7); sfx(660 + tutI * 60, .1, 'triangle', .05);
}
function tutGo(d) {
  if (d > 0 && tutI === TUT.length - 1) return startDay();
  tutI = clamp(tutI + d, 0, TUT.length - 1); renderTut();
}
function openHow() { tutI = 0; setScreen('how'); renderTut(); $('#howNext').focus({ preventScroll: true }); }
function closeHow() { setScreen('title'); $('#btnHow').focus({ preventScroll: true }); }
$('#btnHow').addEventListener('click', openHow);
$('#howNext').addEventListener('click', () => tutGo(1));
$('#howPrev').addEventListener('click', () => tutGo(-1));
$('#howClose').addEventListener('click', closeHow);
$('#btnNext').addEventListener('click', nextDay);

/* ---------- Visual sync ---------- */
const COL_WATER = new THREE.Color(0xcfeeff), COL_SOUP = new THREE.Color(0xf08a3c), COL_CHILI = new THREE.Color(0xd8452b);
const COL_RAW = new THREE.Color(0xf2c443), COL_DONE = new THREE.Color(0xffe39a), COL_OVER = new THREE.Color(0xfff4d8);
const _c = new THREE.Color();
function syncPotMeshes() {
  const p = G.pot;
  noodles.visible = p.noodles;
  TOPS.forEach(t => { topMesh[t.id].visible = p.toppings.has(t.id); });
}

/* ---------- Loop ---------- */
let last = performance.now(), time = 0;
function update(dt) {
  time += dt;
  const p = G.pot, play = G.screen === 'play';

  if (play) {
    G.timeLeft = Math.max(0, G.timeLeft - dt);
    // pot physics
    if (p.pouring) {
      const before = p.water;
      p.water = Math.min(1, p.water + .3 * dt);
      if (p.water >= 1 && before < 1) toast('물이 넘쳐요!');
      p.temp = Math.max(0, p.temp - (p.water - before) * 1.4);
    }
    if (p.flame) p.temp = Math.min(1, p.temp + .65 / (.25 + p.water) * dt);
    else p.temp = Math.max(0, p.temp - .05 * dt);
    const boiling = p.temp >= .98 && p.water > .05;
    if (p.noodles) {
      p.drop = Math.min(1, p.drop + dt / .45);
      const rate = boiling ? 1 / 16 : p.temp > .5 ? 1 / 30 : 0;
      p.cook = Math.min(1, p.cook + rate * dt);
    }
    if (p.soup && p.water > .05) p.soupMix = Math.min(1, p.soupMix + dt / 1.2);

    // customers
    if (!G.customer && G.timeLeft > 0) { G.spawnT -= dt; if (G.spawnT <= 0) spawnCustomer(); }
    const c = G.customer;
    if (c && c.state === 'wait') {
      c.patience -= dt / c.pmax;
      if (c.patience <= 0) { customerLeave('너무 오래 걸려요!'); nyangiMood('sad', 1.4); sfx(300, .3, 'sawtooth', .04, -120); }
      else if (G.timeLeft <= 0) customerLeave('벌써 문 닫아요?');
    }
    if (G.timeLeft <= 0 && !G.customer && !G.bowl) endDay();
  }

  // customer motion
  const c = G.customer;
  if (c) {
    const walk = c.state === 'enter' || c.state === 'leave';
    if (c.state === 'enter') {
      c.x -= 7 * dt;
      if (c.x <= STAND.x) { c.x = STAND.x; c.state = 'wait'; showTicket(c); say('안녕하세요! 라면 주세요', null, 1.6); }
    } else if (c.state === 'eat') {
      c.timer -= dt;
      if (c.timer <= 0) { c.state = 'leave'; if (G.bowl) { scene.remove(G.bowl.g); G.bowl = null; } }
    } else if (c.state === 'leave') {
      c.x += 7 * dt;
      if (c.x > 8) { scene.remove(c.g); G.customer = null; G.spawnT = rnd(.25, .6); }
    }
    c.g.position.x = c.x;
    const yaw = c.state === 'enter' ? -1.2 : c.state === 'leave' ? 1.3 : -.35;
    c.g.rotation.y = lerp(c.g.rotation.y, yaw, Math.min(1, dt * 8));
    c.b.position.y = walk ? Math.abs(Math.sin(time * 11)) * .14 : c.state === 'eat' ? Math.abs(Math.sin(time * 8)) * .06 : Math.sin(time * 2.4 + c.ph) * .025;
    c.head.rotation.z = c.state === 'wait' && c.patience < .3 ? Math.sin(time * 18) * .06 : lerp(c.head.rotation.z, 0, dt * 6);
    c.head.rotation.x = c.state === 'eat' ? .25 + Math.sin(time * 8) * .1 : c.state === 'leave' && c.mood === 0 ? .3 : 0;
    c.arms[0].rotation.z = walk ? -.45 + Math.sin(time * 11) * .3 : -.45;
    c.arms[1].rotation.z = c.state === 'wait' && bubbleT > 0 ? 2.4 + Math.sin(time * 9) * .3 : walk ? .45 - Math.sin(time * 11) * .3 : .45;
    if (c.state === 'wait') {
      const pat = $('#tPat'); pat.style.width = (c.patience * 100).toFixed(1) + '%';
      pat.style.background = c.patience < .3 ? '#ff6a6a' : c.patience < .6 ? '#ffc25a' : 'var(--mint)';
    }
  }

  // bowl flight
  if (G.bowl) {
    const b = G.bowl;
    if (b.t < 1) {
      b.t = Math.min(1, b.t + dt / .5);
      const e = b.t;
      b.g.position.set(lerp(POT.x, TABLE.x, e), lerp(POT.y + .5, TABLE.y, e) + Math.sin(Math.PI * e) * 1.1, lerp(POT.z, TABLE.z, e));
      b.g.scale.setScalar(lerp(1, .78, e));
      b.g.rotation.y = e * Math.PI * 2;
      if (b.t >= 1) landBowl(b);
    }
  }

  // coins flying into the piggy bank
  for (const c of coins) {
    if (!c.on) continue;
    c.t += dt / .55;
    if (c.t < 0) continue;
    const e = Math.min(1, c.t);
    c.m.visible = true;
    c.m.position.lerpVectors(c.from, SLOT, e); c.m.position.y += Math.sin(Math.PI * e) * 1.1;
    c.m.rotation.set(time * 12, 0, Math.PI / 2 * (1 - e));
    if (c.t >= 1) { c.on = false; c.m.visible = false; clink(); piggy.userData.bounce = 1; }
  }
  if (piggy.userData.bounce > 0) {
    piggy.userData.bounce = Math.max(0, piggy.userData.bounce - dt * 4);
    const q = Math.sin(piggy.userData.bounce * Math.PI) * .14;
    piggy.userData.body.scale.set(1 + q * .7, 1 - q, 1 + q * .7);
  }

  // pot visuals
  const wh = p.water * POT.h;
  water.visible = p.water > .005;
  water.scale.y = Math.max(.001, wh);
  water.position.y = .04 + wh / 2;
  surf.position.y = .04 + wh + .005;
  _c.copy(COL_WATER).lerp(COL_SOUP, p.soupMix);
  if (p.toppings.has('chili')) _c.lerp(COL_CHILI, .6 * Math.max(.4, p.soupMix));
  waterMat.color.copy(_c); waterMat.opacity = lerp(.6, .93, p.soupMix);
  if (p.noodles) {
    const e = 1 - Math.pow(1 - p.drop, 3);
    noodles.position.y = (1 - e) * 1.2;
    block.visible = p.cook < .3; block.scale.setScalar(Math.max(.01, 1 - p.cook * 3));
    curls.visible = p.cook > .015;
    const cs = clamp(p.cook * 3.2, .05, 1) * (1 + Math.max(0, p.cook - .72) * 1.1);
    curls.scale.set(cs, 1, cs);
    if (p.cook < .5) _c.copy(COL_RAW).lerp(COL_DONE, p.cook / .5); else _c.copy(COL_DONE).lerp(COL_OVER, (p.cook - .5) / .5);
    noodleMat.color.copy(_c);
    curls.rotation.y += dt * (p.temp >= .98 ? .5 : .05);
  }
  TOPS.forEach(t => {
    const g = topMesh[t.id]; if (!g.visible) return;
    g.userData.pop = Math.min(1, g.userData.pop + dt * 4);
    const k = g.userData.pop, s = k < 1 ? 1 + Math.sin(k * Math.PI) * .35 : 1;
    g.scale.setScalar(s); g.position.y = (1 - k) * .6 + (p.temp >= .98 ? Math.sin(time * 9 + t.day) * .012 : 0);
  });
  // bubbles
  const surfY = .04 + wh;
  const bubRate = p.water > .05 && p.temp > .72 ? (p.temp - .72) * 110 : 0;
  let toSpawn = bubRate * dt + (Math.random() < (bubRate * dt) % 1 ? 1 : 0);
  for (const b of bubbles) {
    if (b.life > 0) {
      b.life -= dt; const f = 1 - b.life / b.max;
      b.m.position.y = surfY + Math.sin(f * Math.PI) * .05;
      b.m.scale.setScalar(.02 + f * .05);
      if (b.life <= 0) b.m.visible = false;
    } else if (toSpawn >= 1) {
      toSpawn--; const a = rnd(0, 6.3), r = Math.sqrt(Math.random()) * .6;
      b.m.position.set(Math.cos(a) * r, surfY, Math.sin(a) * r); b.max = b.life = rnd(.3, .6); b.m.visible = true;
    }
  }
  // steam
  const steamAmt = p.water > .05 ? clamp((p.temp - .45) * 1.8, 0, 1) : 0;
  for (const s of steams) {
    if (s.life > 0) {
      s.life -= dt; const f = 1 - s.life / s.max;
      s.s.position.set(s.x + Math.sin(time + s.x * 9) * .08, surfY + .1 + f * 1.5, s.z);
      s.s.scale.setScalar(.35 + f * .8);
      s.s.material.opacity = Math.sin(f * Math.PI) * .45 * steamAmt;
    } else if (steamAmt > 0 && Math.random() < dt * 9 * steamAmt) {
      s.x = rnd(-.4, .4); s.z = rnd(-.3, .3); s.max = s.life = rnd(1.2, 1.9);
    } else s.s.material.opacity = 0;
  }
  // sprinkles
  const surfWorld = POT.y + surfY + .01;
  for (const sp of sprinkles) {
    if (!sp.on) continue;
    sp.vy -= 9 * dt; sp.m.position.y += sp.vy * dt; sp.m.rotation.x += dt * 6;
    if (sp.m.position.y <= surfWorld) { sp.on = false; sp.m.visible = false; }
  }
  // flame
  flame.visible = p.flame;
  flameLight.intensity = p.flame ? .7 + Math.sin(time * 30) * .08 : 0;
  if (p.flame) flames.forEach((f, i) => { f.scale.set(1, .85 + Math.sin(time * 28 + i * 2.1) * .2 + Math.random() * .08, 1); });
  knob.rotation.z = lerp(knob.rotation.z, p.flame ? -1.2 : 0, dt * 10);
  // kettle
  kettle.userData.p = clamp(kettle.userData.p + (p.pouring ? 1 : -1) * dt * 7, 0, 1);
  const kp = kettle.userData.p, ke = kp * kp * (3 - 2 * kp);
  kettle.position.lerpVectors(KREST, KPOUR, ke);
  kettle.rotation.z = -.95 * ke;
  if (p.pouring && kp > .9 && p.water < 1) {
    const tip = spoutTip.getWorldPosition(new THREE.Vector3());
    const bottom = POT.y + surfY;
    const len = Math.max(.01, tip.y - bottom);
    stream.visible = true; stream.position.set(tip.x, bottom + len / 2, tip.z); stream.scale.set(1, len, 1);
  } else stream.visible = false;
  ambUpdate(dt, p, play);

  // camera + Nyangi: close-up in front of the shop off-duty, at the stove while the shop is open
  camT = clamp(camT + (play ? 1 : -1) * dt / 1.3, 0, 1);
  const talkShift = G.screen === 'how' || G.screen === 'result' ? -.5 * CAM.khalf : 0;
  camShift = lerp(camShift, talkShift, Math.min(1, dt * 4));
  applyCam();
  const k = nyangi, kWalk = camT * camT * (3 - 2 * camT), walking = camT > 0 && camT < 1;
  k.root.position.lerpVectors(KFRONT, KGAME, kWalk);
  k.root.rotation.y = .42 * kWalk;
  k.moodT = Math.max(0, k.moodT - dt); if (k.moodT <= 0) k.mood = 'idle';
  const happy = k.mood === 'happy', sad = k.mood === 'sad', spin = k.mood === 'spin', wiggle = k.mood === 'wiggle';
  const moodP = k.moodLen ? 1 - k.moodT / k.moodLen : 1;
  k.body.position.y = Math.sin(time * 2.2) * .03 + (happy ? Math.abs(Math.sin(time * 9)) * .32 : spin ? Math.sin(moodP * Math.PI) * .5 : walking ? Math.abs(Math.sin(time * 11)) * .12 : 0);
  k.body.rotation.y = spin ? moodP * Math.PI * 2 : 0;
  k.body.rotation.z = wiggle ? Math.sin(time * 14) * .16 : lerp(k.body.rotation.z, 0, Math.min(1, dt * 8));
  const waving = happy || spin || wiggle || G.screen !== 'play' || (c && c.state === 'enter');
  // the wave stays out to the side, just below shoulder-height of the big head, so the paw is never hidden behind it
  const rArm = waving ? 1.95 + Math.sin(time * 8) * .2 : p.pouring || p.flame ? 1.1 + Math.sin(time * 5) * .15 : .55 + Math.sin(time * 2) * .05;
  k.arms[1].rotation.z = lerp(k.arms[1].rotation.z, rArm, Math.min(1, dt * 10));
  k.arms[0].rotation.z = lerp(k.arms[0].rotation.z, happy ? -1.95 - Math.sin(time * 8 + 1) * .2 : sad ? -.25 : -.55, Math.min(1, dt * 10));
  k.arms[1].rotation.x = lerp(k.arms[1].rotation.x, waving ? .45 : 0, Math.min(1, dt * 10));
  k.arms[0].rotation.x = lerp(k.arms[0].rotation.x, happy ? .45 : 0, Math.min(1, dt * 10));
  // a raised arm reaches a little further, like a stretch, so the paw clears the cheek
  k.arms[1].scale.setScalar(lerp(k.arms[1].scale.x, waving ? 1.3 : 1, Math.min(1, dt * 10)));
  k.arms[0].scale.setScalar(lerp(k.arms[0].scale.x, happy ? 1.3 : 1, Math.min(1, dt * 10)));
  k.head.rotation.y = sad ? Math.sin(time * 14) * .2 : lerp(k.head.rotation.y, play ? .22 : Math.sin(time * .8) * .12, dt * 4);
  k.head.rotation.x = lerp(k.head.rotation.x, sad ? .22 : play && p.noodles ? .12 : 0, dt * 5);
  k.head.rotation.z = Math.sin(time * 1.6) * .04;

  // ambience
  const calm = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches ? .2 : 1;
  clouds.forEach(o => { o.g.position.x = o.x + Math.sin(time * .07 * calm + o.ph) * .8; });
  floaters.forEach(f => { f.m.position.y = f.y + Math.sin(time * 1.3 * calm + f.ph) * .15; f.m.rotation.y = Math.sin(time * .9 * calm + f.ph) * .5; });

  updateHud(dt);
}

let hudAcc = 0;
function updateHud(dt) {
  const p = G.pot, play = G.screen === 'play';
  // pot tag
  const tag = $('#potTag');
  if (play) {
    let txt, cls = '';
    const boiling = p.temp >= .98 && p.water > .05;
    if (p.pouring) txt = `물 ${Math.round(p.water * 100)}%`;
    else if (p.water <= .02) txt = p.flame ? '빈 냄비가 뜨거워요!' : '물을 부어 주세요', cls = p.flame ? 'warn' : '';
    else if (!p.noodles && !p.flame && !boiling) txt = '불을 켜 주세요';
    else if (!p.noodles && !boiling) txt = `데우는 중 ${Math.round(p.temp * 100)}%`;
    else if (!p.noodles) txt = p.soup ? '보글보글! 면을 넣어요' : '보글보글! 스프부터 넣어요', cls = 'good';
    else {
      const st = stageOf(p.cook);
      const nx = nextStep();
      txt = STAGE_NAMES[st] + (nx ? ` · 다음: ${nx.left.map(ITEM_NAME).join('·')}` : '') + (boiling ? '' : p.flame ? ' · 데우는 중' : ' · 불을 켜요');
      if (G.customer && G.customer.state === 'wait' && st === G.customer.order.done) cls = 'good';
      if (st === 4) cls = 'warn';
    }
    tag.textContent = txt; tag.className = cls; tag.hidden = false;
    const s = toScreen(new THREE.Vector3(POT.x, POT.y + 1.05, POT.z));
    tag.style.left = s.x + 'px'; tag.style.top = s.y + 'px';
  } else tag.hidden = true;
  // bubble
  if (bubbleT > 0) {
    bubbleT -= dt;
    const c = G.customer, b = $('#bubble');
    if (!c || bubbleT <= 0) { b.hidden = true; bubbleT = 0; }
    else { const s = toScreen(new THREE.Vector3(c.g.position.x, 2.75, c.g.position.z)); b.style.left = s.x + 'px'; b.style.top = s.y + 'px'; }
  }
  if (toastT > 0) { toastT -= dt; if (toastT <= 0) $('#toast').hidden = true; }
  if (nyangiSayT > 0) {
    nyangiSayT -= dt;
    const el = $('#nyangiSay');
    if (nyangiSayT <= 0 || G.screen !== 'play') { el.hidden = true; nyangiSayT = 0; }
    else { const s = toScreen(new THREE.Vector3(nyangi.root.position.x, 2.75, nyangi.root.position.z)); el.style.left = s.x + 'px'; el.style.top = s.y + 'px'; }
  }

  hudAcc += dt; if (hudAcc < .05) return; hudAcc = 0;
  renderRecipe();
  const cnt = $('#top-chili .cnt'); if (cnt) cnt.textContent = p.chili ? `×${p.chili}` : '';
  // gauges
  $('#gWater .fill').style.width = p.water * 100 + '%';
  $('#gWater em').textContent = Math.round(p.water * 100) + '%';
  $('#gHeat .fill').style.width = p.temp * 100 + '%';
  $('#gHeat em').textContent = p.water > .05 && p.temp >= .98 ? '보글보글' : p.temp > .05 ? Math.round(p.temp * 100) + '%' : '차가움';
  const mk = $('#gCook .marker');
  mk.hidden = !p.noodles; mk.style.left = p.cook * 100 + '%';
  $('#gCook em').textContent = p.noodles ? STAGE_NAMES[stageOf(p.cook)] : '-';
  // buttons
  const boiling = p.temp >= .98 && p.water > .05;
  $('#bWater').disabled = !play;
  $('#bFire').disabled = !play; $('#bFire').classList.toggle('on', p.flame);
  $('#fireLbl').textContent = p.flame ? '불 끄기' : '불 켜기';
  $('#bNoodle').disabled = !play || p.noodles; $('#bNoodle').classList.toggle('on', p.noodles || (boiling && false));
  $('#bNoodle').querySelector('small').firstChild.textContent = p.noodles ? '넣었어요 ' : boiling ? '지금 넣어요 ' : '끓으면 ';
  $('#bSoup').disabled = !play || p.soup; $('#bSoup').classList.toggle('on', p.soup);
  TOPS.forEach(t => { const b = $('#top-' + t.id); b.classList.toggle('on', p.toppings.has(t.id)); if (!play) b.disabled = true; else b.disabled = t.day > G.day; });
  $('#bTrash').disabled = !play;
  $('#bServe').disabled = !play || !p.noodles || !G.customer || G.customer.state !== 'wait';
  // stats
  const tl = Math.ceil(G.timeLeft);
  $('#sTime').textContent = `${Math.floor(tl / 60)}:${String(tl % 60).padStart(2, '0')}`;
  $('#sMoney').textContent = won(G.earned);
  $('#sBar').style.width = Math.min(100, G.earned / goalOf(G.day) * 100) + '%';
}

function frame(now) {
  const dt = Math.min(.1, (now - last) / 1000); last = now;
  update(dt);
  renderer.render(scene, camera);
  requestAnimationFrame(frame);
}
setScreen('title');
resize();
updateHud(1);
requestAnimationFrame(frame);
})();
