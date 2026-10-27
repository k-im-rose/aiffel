(() => {
const $ = s => document.querySelector(s);
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const lerp = (a, b, t) => a + (b - a) * t;
const rnd = (a, b) => a + Math.random() * (b - a);
const won = n => n.toLocaleString('ko-KR') + '원';
const batchim = w => { const c = w.charCodeAt(w.length - 1); return c >= 0xAC00 && c <= 0xD7A3 && (c - 0xAC00) % 28 !== 0; };
const iGa = w => w + (batchim(w) ? '이' : '가');
const eunNeun = w => w + (batchim(w) ? '은' : '는');


/* ---------- Game data ---------- */
const TOPS = [
  { id: 'egg',    name: '계란',     c: '#ffd23f', day: 1 },
  { id: 'pa',     name: '파',       c: '#6cc04a', day: 1 },
  { id: 'cheese', name: '치즈',     c: '#ffa94d', day: 2 },
  { id: 'tteok',  name: '떡',       c: '#f4efe4', day: 3 },
  { id: 'mandu',  name: '만두',     c: '#d9b88f', day: 3 },
  { id: 'chili',  name: '고춧가루', c: '#e2412b', day: 4, fg: '#fff' },
];
const TOP = Object.fromEntries(TOPS.map(t => [t.id, t]));
const WATER = [
  { name: '적게', lo: .26, hi: .48 },
  { name: '보통', lo: .48, hi: .70 },
  { name: '많이', lo: .70, hi: .92 },
];
const ZONES = [0, .25, .5, .72, .9, 1.0001];
const STAGE_NAMES = ['덜 익음', '꼬들꼬들', '적당히', '푹 익음', '불어 터짐'];
const stageOf = c => { for (let i = 0; i < 5; i++) if (c < ZONES[i + 1]) return i; return 4; };
const CTYPES = [
  { name: '곰돌이', body: 0xc99a6e, head: 0xd8a878, acc: 0xf6dfc4, kind: 'bear' },
  { name: '토순이', body: 0xc6b4ff, head: 0xfffafc, acc: 0xffb3cf, kind: 'bunny' },
  { name: '개굴이', body: 0x7fcd78, head: 0x9adf8c, acc: 0xffffff, kind: 'frog' },
  { name: '삐약이', body: 0xffd84d, head: 0xffe36b, acc: 0xff9d3a, kind: 'chick' },
];
const DAY_LEN = 180;
// balance for five tables and several pots (the README explains the numbers)
const FIRST_GUEST = 2, LAST_CALL = 25;                   // no new guests in the last 25 s, so the last one can still be served
const gapOf = d => Math.max(12, 22 - 2 * (d - 1));        // seconds between guests: 22 → 20 → 18 → 16 → 14 → 12
const patienceOf = d => Math.max(65, 95 - 5 * (d - 1));   // seconds a seated guest waits: 95 → 90 → 85 → ... → 65
const potsOf = d => d >= 2 ? 3 : 2;                       // two burners on day 1, the third opens on day 2
const guestsOf = d => 1 + Math.floor((DAY_LEN - LAST_CALL - FIRST_GUEST) / gapOf(d));
const avgTopsOf = d => Math.min(TOPS.filter(t => t.day <= d).length, 1 + Math.ceil(d / 2)) / 2;
// goal: 60% of the day's guests served, each paying about 90% of the price (3,000원 + 500원 per topping; there is no tip)
const goalOf = d => Math.round(.6 * guestsOf(d) * .9 * (3000 + 500 * avgTopsOf(d)) / 1000) * 1000;

const G = {
  screen: 'title', day: 1, total: 0, earned: 0, timeLeft: DAY_LEN, served: 0, missed: 0, starSum: 0, orderNo: 0,
  guests: [], bowls: [], spawnT: FIRST_GUEST, sel: 0, pick: -1, pourPot: -1,
};
function freshPot() {
  return { water: 0, pouring: false, flame: false, temp: 0, noodles: false, drop: 0, cook: 0, soup: false, soupMix: 0, toppings: new Set() };
}

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
    const chain = (type, freq, q) => {
      const src = actx.createBufferSource(); src.buffer = buf; src.loop = true;
      src.playbackRate.value = .8 + Math.random() * .4;
      const f = actx.createBiquadFilter(); f.type = type; f.frequency.value = freq; f.Q.value = q;
      const g = actx.createGain(); g.gain.value = 0;
      src.connect(f); f.connect(g); g.connect(master); src.start();
      return { f, g };
    };
    amb = { master, pour: chain('bandpass', 1900, 1.1), gas: chain('lowpass', 380, .7), simmer: chain('bandpass', 520, .9), popT: 0 };
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
// a = { pouring, water, flames, heat }: the selected pot's pouring plus the hottest pot's simmer
function ambUpdate(dt, a, on) {
  if (!actx) return;
  ambInit(); if (!amb) return;
  const t = actx.currentTime, set = (node, v) => node.g.gain.setTargetAtTime(v, t, .12);
  amb.master.gain.setTargetAtTime(muted ? 0 : 1, t, .05);
  const heat = on ? a.heat : 0;
  set(amb.pour, on && a.pouring ? .16 : 0);
  amb.pour.f.frequency.setTargetAtTime(1500 + a.water * 900, t, .1);
  set(amb.gas, on && a.flames ? .035 + .015 * a.flames : 0);
  set(amb.simmer, heat * heat * .1);
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
const LOOK = new THREE.Vector3(0, 1.1, -1.7);
// Nyangi stands in front of the shop on the title/talk screens, then walks to the stove when the shop opens
const KGAME = new THREE.Vector3(-3.25, 0, 1.2), KFRONT = new THREE.Vector3(0, 0, 2.3);
const CAM = { gp: new THREE.Vector3(), gl: new THREE.Vector3(), cp: new THREE.Vector3(), cl: new THREE.Vector3(), half: 2.8, khalf: 3, w: 1, h: 1 };
const _look = new THREE.Vector3();
let camT = 0, camShift = 0, hudH = 130;

function resize() {
  const w = stage.clientWidth, h = stage.clientHeight;
  if (!w || !h) return;
  renderer.setSize(w, h, false);
  CAM.w = w; CAM.h = h;
  camera.aspect = w / h;
  hudH = $('#hud').offsetHeight || hudH;
  // while playing, the order tickets cover the top of the stage, so frame the shop in the space below them
  const vt = Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)), room = clamp((h - hudH) / h, .4, 1);
  const d = Math.max(5.3 / (vt * camera.aspect), 2.9 / (vt * room)), pitch = .72;
  CAM.gl.copy(LOOK); CAM.gp.set(0, LOOK.y + d * Math.sin(pitch), LOOK.z + d * Math.cos(pitch));
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
  const off = hudH / 2 * e;
  if (off > .5) camera.setViewOffset(CAM.w, CAM.h, 0, -off, CAM.w, CAM.h); else if (camera.view && camera.view.enabled) camera.clearViewOffset();
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

// counter + a three-burner stove (the pots themselves are built further down)
const POT_X = [-1.45, 0, 1.45], POT_Y = 1.68, POT_Z = .05, POT_S = .84, POT_H = .55;
const counterTex = canvasTex(256, 128, (x, w, h) => {
  x.fillStyle = '#ffb5d3'; x.fillRect(0, 0, w, h);
  x.fillStyle = '#fff3f8';
  for (let r = 0; r < 4; r++) for (let c = 0; c < 8; c++) { x.beginPath(); x.arc(c * 32 + (r % 2 ? 16 : 0) + 8, r * 32 + 16, 6, 0, 7); x.fill(); }
});
counterTex.wrapS = counterTex.wrapT = THREE.RepeatWrapping; counterTex.repeat.set(3.2, 1.5);
add(scene, new THREE.BoxGeometry(5.2, 1.2, 1.7), M(0xffffff, { map: counterTex, roughness: .8 }), [0, .6, 0]);
add(scene, new THREE.BoxGeometry(5.45, .12, 1.95), M(0xfff7fb, { roughness: .5 }), [0, 1.26, 0]);
add(scene, new THREE.BoxGeometry(4.4, .2, 1.32), M(0xf3eef6, { roughness: .4 }), [0, 1.42, 0]);

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
const ramenShop = shop({ x: 0, z: -5.6, w: 4.6, h: 4.6, wall: 0xfff1e4, roof: 0xff6f9f, awn: 0xff6f9f, door: 0xc8806b, signW: 3.6,
  label: { text: '냥이 라면', bg: '#ffffff', fg: '#e2477f', edge: '#ff8dbd', dots: true } });
shop({ x: -5.4, z: -6.2, w: 3.4, h: 3.7, wall: 0xffe9bf, roof: 0xf4a259, awn: 0xf4a259, door: 0xb07a5a, label: { text: '빵집', bg: '#fffaf0', fg: '#c46b22', edge: '#f4a259' } });
shop({ x: -9.4, z: -6.6, w: 3.4, h: 4.1, wall: 0xdcf5e9, roof: 0x52b788, awn: 0x52b788, door: 0x7a9e8a, label: { text: '꽃집', bg: '#f6fffa', fg: '#2f8a5f', edge: '#52b788' } });
shop({ x: 5.4, z: -6.2, w: 3.4, h: 3.9, wall: 0xece4ff, roof: 0x9b7bff, awn: 0x9b7bff, door: 0x8d7ab8, label: { text: '아이스크림', bg: '#fbf8ff', fg: '#6f4fd6', edge: '#9b7bff', size: 64 } });
shop({ x: 9.4, z: -6.6, w: 3.4, h: 3.5, wall: 0xdff0ff, roof: 0x4aa3e8, awn: 0x4aa3e8, door: 0x6b8fb0, label: { text: '문구점', bg: '#f7fbff', fg: '#2f78b8', edge: '#4aa3e8' } });
// ramen shop details: noren curtain and lanterns
for (let i = -1; i <= 1; i++) add(ramenShop, new THREE.BoxGeometry(.36, .5, .03), M(0xff8dbd, { roughness: .8 }), [i * .4, 1.42, .86]);
for (const s of [-1, 1]) {
  add(ramenShop, SPH, M(0xff5a5a, { roughness: .5, emissive: 0xff3b3b, emissiveIntensity: .35 }), [s * 1.95, 2.75, 1.05], [.2, .26, .2]);
  for (const dy of [-.27, .27]) add(ramenShop, new THREE.CylinderGeometry(.11, .11, .06, 16), M(0xffcf4a), [s * 1.95, 2.75 + dy, 1.05]);
}
// sidewalk, trees and lamp posts
add(scene, new THREE.BoxGeometry(26, .05, 1.8), M(0xfff4f8, { roughness: .9 }), [0, .025, -4.1]).castShadow = false;
const trunk = M(0xc99a82), leaf = M(0xa8e6b8, { roughness: .9 }), leaf2 = M(0x8fd9a8, { roughness: .9 });
for (const x of [-7.4, -3.2, 3.2, 7.4]) {
  add(scene, new THREE.CylinderGeometry(.09, .12, 1.3, 10), trunk, [x, .65, -4.6]);
  add(scene, SPH, leaf, [x, 1.65, -4.6], .55);
  add(scene, SPH, leaf2, [x - .3, 1.45, -4.5], .38);
  add(scene, SPH, leaf2, [x + .32, 1.5, -4.55], .36);
}
for (const x of [-11.5, 11.5]) {
  add(scene, new THREE.CylinderGeometry(.05, .06, 2.6, 10), M(0xffb3d1), [x, 1.3, -4.5]);
  add(scene, SPH, M(0xfff6d6, { emissive: 0xffe9a8, emissiveIntensity: .6 }), [x, 2.7, -4.5], .18);
}
// Google Fonts splits Korean into many small files, so ask for exactly the sign letters, then redraw
if (document.fonts && document.fonts.load) {
  const redraw = () => signTexes.forEach(([t, o]) => { drawLabel(t.image.getContext('2d'), 512, 160, o); t.needsUpdate = true; });
  const letters = signTexes.map(([, o]) => o.text).join('');
  Promise.all([document.fonts.load('84px Jua', letters), document.fonts.ready]).then(redraw, redraw);
  if (document.fonts.addEventListener) document.fonts.addEventListener('loadingdone', redraw);
}


// five tables in a half circle behind the stove, numbered 1-5 from left to right; each has a stool and a coloured cloth
const SEAT_COL = ['#f28bb5', '#f0a95c', '#5cbfa2', '#7ea6e8', '#a991e3'];
const LANE_Z = -3.9;
const tableTop = M(0xffffff, { roughness: .5 }), tableLeg = M(0xffb3d1), stoolMat = M(0xff9cc6, { roughness: .5 }), pickMat = M(0xe2477f, { roughness: .6 });
const SEATS = [155, 122.5, 90, 57.5, 25].map((deg, i) => {
  const a = deg * Math.PI / 180, tx = 4 * Math.cos(a), tz = -.4 - 2.4 * Math.sin(a);
  const dir = new THREE.Vector3(tx, 0, tz + .4).normalize();
  const pos = new THREE.Vector3(tx, 0, tz).addScaledVector(dir, .62);
  add(scene, new THREE.CylinderGeometry(.48, .48, .08, 36), tableTop, [tx, .68, tz]);
  add(scene, new THREE.CylinderGeometry(.4, .4, .02, 36), M(new THREE.Color(SEAT_COL[i]).getHex(), { roughness: .85 }), [tx, .73, tz], 1, [0, 0, 0], false);
  add(scene, new THREE.CylinderGeometry(.07, .1, .66, 14), tableLeg, [tx, .34, tz]);
  add(scene, new THREE.CylinderGeometry(.32, .32, .04, 28), tableLeg, [tx, .02, tz]);
  add(scene, new THREE.CylinderGeometry(.27, .24, .4, 24), stoolMat, [pos.x, .2, pos.z]);
  const ring = add(scene, new THREE.TorusGeometry(.6, .045, 8, 44), pickMat, [pos.x, .03, pos.z], 1, [-Math.PI / 2, 0, 0], false);
  ring.visible = false;
  return { i, col: SEAT_COL[i], table: new THREE.Vector3(tx, .74, tz), pos, yaw: Math.atan2(-dir.x, -dir.z),
    side: tx < -.1 ? -1 : tx > .1 ? 1 : 0, guest: null, ring };
});

/* ---------- Pots: one per burner, each with its own water, noodles, toppings, bubbles, steam and flame ---------- */
const potPink = M(0xff9cc6, { roughness: .35 }), potIn = M(0xf6f0f3, { side: THREE.BackSide, roughness: .3 }), potBase = M(0xeee6ea);
const potHandle = M(0xff7fb3), grateMat = M(0x6c6170, { roughness: .5 });
const noodleTex = canvasTex(128, 128, (x, w, h) => {
  x.fillStyle = '#f5c84c'; x.fillRect(0, 0, w, h);
  x.strokeStyle = '#d9a52b'; x.lineWidth = 3;
  for (let r = 0; r < 12; r++) { x.beginPath(); for (let i = 0; i <= w; i += 4) x.lineTo(i, r * 11 + 5 + Math.sin(i * .25 + r) * 3); x.stroke(); }
});
const blockMat = M(0xffffff, { map: noodleTex, roughness: .6 });
const curlGeo = new THREE.TorusGeometry(.1, .027, 8, 24, Math.PI * 1.55);
const bubbleMat = new THREE.MeshStandardMaterial({ color: 0xffffff, transparent: true, opacity: .75, roughness: .1 });
const steamTex = canvasTex(64, 64, (x) => {
  const g = x.createRadialGradient(32, 32, 0, 32, 32, 32);
  g.addColorStop(0, 'rgba(255,255,255,.9)'); g.addColorStop(1, 'rgba(255,255,255,0)');
  x.fillStyle = g; x.fillRect(0, 0, 64, 64);
});
const fOut = new THREE.MeshBasicMaterial({ color: 0x5aa8ff, transparent: true, opacity: .85 });
const fIn = new THREE.MeshBasicMaterial({ color: 0xcfe9ff, transparent: true, opacity: .9 });

function makeToppings(surf) {
  const topMesh = {};
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
  return topMesh;
}

function makePot(i) {
  const x = POT_X[i];
  // burner ring, grate prongs and the knob on the front of the stove
  add(scene, new THREE.TorusGeometry(.42, .05, 10, 40), grateMat, [x, 1.53, POT_Z], 1, [-Math.PI / 2, 0, 0]);
  for (let k = 0; k < 4; k++) { const a = k * Math.PI / 2 + Math.PI / 4; add(scene, new THREE.BoxGeometry(.06, .16, .3), grateMat, [x + Math.cos(a) * .52, 1.6, POT_Z + Math.sin(a) * .52], 1, [0, -a, 0]); }
  const knob = add(scene, new THREE.CylinderGeometry(.08, .08, .07, 18), potHandle, [x, 1.42, .69], 1, [Math.PI / 2, 0, 0]);

  const g = new THREE.Group(); g.position.set(x, POT_Y, POT_Z); g.scale.setScalar(POT_S); scene.add(g);
  add(g, new THREE.CylinderGeometry(.79, .73, .62, 48, 1, true), potPink, [0, .31, 0]);
  add(g, new THREE.CylinderGeometry(.75, .69, .6, 48, 1, true), potIn, [0, .32, 0], 1, [0, 0, 0], false);
  add(g, new THREE.CylinderGeometry(.73, .73, .04, 48), potBase, [0, .02, 0]);
  add(g, new THREE.TorusGeometry(.77, .04, 10, 56), potPink, [0, .62, 0], 1, [Math.PI / 2, 0, 0]);
  for (const s of [-1, 1]) add(g, new THREE.TorusGeometry(.13, .035, 8, 20, Math.PI), potHandle, [s * .86, .5, 0], 1, [Math.PI / 2, 0, s * Math.PI / 2]);

  const waterMat = M(0xcfeeff, { transparent: true, opacity: .62, roughness: .15 });
  const water = add(g, new THREE.CylinderGeometry(.7, .67, 1, 48), waterMat, [0, .04, 0], [1, .001, 1], [0, 0, 0], false);
  water.visible = false;
  const surf = new THREE.Group(); g.add(surf);
  const noodleMat = M(0xf7d36a, { roughness: .5 });
  const noodles = new THREE.Group(); surf.add(noodles); noodles.visible = false;
  const block = add(noodles, new THREE.BoxGeometry(.8, .16, .58), blockMat, [0, .02, 0], 1, [0, .3, 0], false);
  const curls = new THREE.Group(); noodles.add(curls);
  for (let k = 0; k < 22; k++) {
    const a = rnd(0, Math.PI * 2), r = Math.sqrt(Math.random()) * .5;
    add(curls, curlGeo, noodleMat, [Math.cos(a) * r, rnd(-.01, .03), Math.sin(a) * r], 1, [Math.PI / 2 + rnd(-.35, .35), rnd(-.3, .3), rnd(0, 6.3)], false);
  }
  const topMesh = makeToppings(surf);

  const bubbles = [];
  for (let k = 0; k < 24; k++) { const m = add(g, SPH, bubbleMat, [0, 0, 0], .04, [0, 0, 0], false); m.visible = false; bubbles.push({ m, life: 0, max: 1 }); }
  const steams = [];
  for (let k = 0; k < 12; k++) {
    const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: steamTex, transparent: true, opacity: 0, depthWrite: false }));
    g.add(s); steams.push({ s, life: 0, max: 1.6, x: 0, z: 0 });
  }
  const flame = new THREE.Group(); flame.position.set(x, 1.52, POT_Z); flame.scale.setScalar(POT_S); scene.add(flame); flame.visible = false;
  const flames = [];
  for (let k = 0; k < 12; k++) {
    const a = k / 12 * Math.PI * 2;
    const fg = new THREE.Group(); fg.position.set(Math.cos(a) * .5, 0, Math.sin(a) * .5); flame.add(fg);
    add(fg, new THREE.ConeGeometry(.065, .17, 10), fOut, [0, .085, 0], 1, [0, 0, 0], false);
    add(fg, new THREE.ConeGeometry(.032, .09, 8), fIn, [0, .05, 0], 1, [0, 0, 0], false);
    flames.push(fg);
  }
  const flameLight = new THREE.PointLight(0xffa860, 0, 2.6); flameLight.position.set(x, 1.7, .6); scene.add(flameLight);
  return { i, x, g, knob, waterMat, water, surf, noodleMat, noodles, block, curls, topMesh, bubbles, steams, flame, flames, flameLight, s: freshPot() };
}
const POTS = POT_X.map((_, i) => makePot(i));
// a pink ring on the stove marks the pot you are cooking in
const potRing = add(scene, new THREE.TorusGeometry(.74, .035, 8, 56), pickMat, [POT_X[0], 1.535, POT_Z], 1, [-Math.PI / 2, 0, 0], false);

// sprinkle particles (world space)
const sprGeo = new THREE.BoxGeometry(.035, .035, .035);
const sprinkles = [];
for (let i = 0; i < 70; i++) { const m = new THREE.Mesh(sprGeo, M(0xffffff)); m.visible = false; scene.add(m); sprinkles.push({ m, vy: 0, on: false, floor: 0 }); }
function sprinkle(P, color, n = 22) {
  let k = 0;
  const floor = POT_Y + (.05 + P.s.water * POT_H) * POT_S;
  for (const p of sprinkles) {
    if (p.on) continue;
    const a = rnd(0, 6.3), r = Math.sqrt(Math.random()) * .4;
    p.m.material.color.setHex(color); p.m.position.set(P.x + Math.cos(a) * r, POT_Y + 1.05 + rnd(0, .5), POT_Z + Math.sin(a) * r);
    p.m.rotation.set(rnd(0, 3), rnd(0, 3), 0); p.vy = rnd(-.5, 0); p.on = true; p.m.visible = true; p.floor = floor;
    if (++k >= n) break;
  }
}

// piggy bank on the right end of the counter: paid coins fly in from the guest's table with a clink
const piggy = new THREE.Group(); piggy.position.set(2.45, 1.32, .62); piggy.rotation.y = -.75; scene.add(piggy);
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
for (let i = 0; i < 18; i++) { const m = new THREE.Mesh(coinGeo, coinMat); m.visible = false; m.castShadow = true; scene.add(m); coins.push({ m, t: 0, on: false, from: new THREE.Vector3() }); }
// one coin per 1,000 won (at least one, at most six), dropped one after another
function payCoins(won, seat) {
  const n = clamp(Math.round(won / 1000), 1, 6), free = coins.filter(c => !c.on).slice(0, n);
  free.forEach((c, i) => {
    c.from.set(seat.table.x + rnd(-.2, .2), seat.table.y + .3, seat.table.z + rnd(-.2, .2));
    c.t = -i * .14; c.on = true; c.m.visible = false;
  });
}
function clink() {
  sfx(2093, .14, 'triangle', .05); sfx(3136, .1, 'sine', .03, 0, .012); sfx(4186, .05, 'sine', .015, 0, .02);
}

// kettle: rests on the left of the counter and swings over whichever pot you fill
const kettle = new THREE.Group(); scene.add(kettle);
const kMat = M(0x8fdcc7, { roughness: .35 });
add(kettle, new THREE.CylinderGeometry(.24, .29, .36, 28), kMat);
add(kettle, SPH, kMat, [0, .17, 0], [.24, .1, .24]);
add(kettle, SPH, M(0xff8dbd), [0, .28, 0], .05);
const spout = add(kettle, new THREE.CylinderGeometry(.035, .055, .34, 12), kMat, [.32, .06, 0], 1, [0, 0, -.95]);
const spoutTip = new THREE.Object3D(); spoutTip.position.set(0, .17, 0); spout.add(spoutTip);
add(kettle, new THREE.TorusGeometry(.14, .032, 8, 18, Math.PI), kMat, [-.27, .02, 0], 1, [0, 0, Math.PI / 2]);
const KREST = new THREE.Vector3(-2.47, 1.5, .7), KPOUR = new THREE.Vector3();
kettle.position.copy(KREST); kettle.userData.p = 0;
const stream = new THREE.Mesh(new THREE.CylinderGeometry(.035, .035, 1, 10), new THREE.MeshStandardMaterial({ color: 0xa8dcff, transparent: true, opacity: .8, roughness: .1 }));
stream.visible = false; scene.add(stream);

// bowl for serving
function makeBowl(P) {
  const g = new THREE.Group();
  const pts = [[0, 0], [.32, 0], [.36, .04], [.5, .2], [.58, .38], [.6, .42]].map(p => new THREE.Vector2(p[0], p[1]));
  add(g, new THREE.LatheGeometry(pts, 40), M(0xffffff, { side: THREE.DoubleSide, roughness: .35 }));
  add(g, new THREE.TorusGeometry(.6, .025, 8, 40), M(0xff8dbd), [0, .42, 0], 1, [Math.PI / 2, 0, 0]);
  add(g, new THREE.CylinderGeometry(.55, .55, .02, 40), M(P.waterMat.color.getHex(), { roughness: .2 }), [0, .37, 0], 1, [0, 0, 0], false);
  const top = P.surf.clone(); top.position.set(0, .36, 0); top.scale.setScalar(.78); g.add(top);
  // the clone shares the pot's noodle material, which changes colour once the pot is reused, so give the bowl its own
  const nm = P.noodleMat.clone();
  top.traverse(o => { if (o.material === P.noodleMat) o.material = nm; });
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

// tap a pot to cook in it, tap a seated guest to pick their order, or tap Nyangi for a little reaction
const ray = new THREE.Raycaster(), ndc = new THREE.Vector2();
let pokeN = 0;
$('#gl').addEventListener('pointerdown', e => {
  const r = e.currentTarget.getBoundingClientRect();
  ndc.set((e.clientX - r.left) / r.width * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
  ray.setFromCamera(ndc, camera);
  const hits = [];
  const test = (obj, fn) => { const h = ray.intersectObject(obj, true)[0]; if (h) hits.push({ d: h.distance, fn }); };
  test(nyangi.root, () => pokeNyangi(e, r));
  if (G.screen === 'play') {
    POTS.forEach(P => { if (P.g.visible) test(P.g, () => selectPot(P.i)); });
    G.guests.forEach(c => { if (c.state === 'wait') test(c.g, () => pickGuest(c.seat.i)); });
  }
  if (hits.length) hits.sort((a, b) => a.d - b.d)[0].fn();
});
function pokeNyangi(e, r) {
  const move = ['spin', 'happy', 'wiggle'][pokeN++ % 3];
  nyangiMood(move, move === 'spin' ? .9 : 1);
  sfx(520, .14, 'sine', .07, 420); sfx(1040, .12, 'triangle', .03, 0, .1);
  const h = document.createElement('div'); h.className = 'heart'; h.textContent = '♥';
  h.style.left = e.clientX - r.left + 'px'; h.style.top = e.clientY - r.top + 'px';
  stage.appendChild(h); setTimeout(() => h.remove(), 1300);
}

/* ---------- Customers ---------- */
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
  return { water: Math.floor(Math.random() * 3), done: 1 + Math.floor(Math.random() * 3), toppings: pick };
}

// guests walk in along the street, then straight to their table, and leave the same way
const _wp = (x, z) => new THREE.Vector3(x, 0, z);
const angTo = (a, b, t) => { let d = (b - a) % (Math.PI * 2); if (d > Math.PI) d -= Math.PI * 2; if (d < -Math.PI) d += Math.PI * 2; return a + d * t; };
function spawnGuest() {
  const free = SEATS.filter(s => !s.guest);
  if (!free.length) return false;
  const seat = free[Math.floor(Math.random() * free.length)];
  const T = CTYPES[Math.floor(Math.random() * CTYPES.length)];
  const parts = makeCustomer(T);
  const side = seat.side || (Math.random() < .5 ? -1 : 1);
  const c = Object.assign(parts, { T, seat, side, order: makeOrder(), state: 'enter', patience: 1, pmax: patienceOf(G.day), timer: 0,
    ph: Math.random() * 6, sit: 0, no: ++G.orderNo, path: [_wp(seat.pos.x, LANE_Z), seat.pos.clone()] });
  parts.g.position.set(side * 9.5, 0, LANE_Z); parts.g.rotation.y = -side * Math.PI / 2;
  seat.guest = c; G.guests.push(c);
  sfx(660, .12, 'triangle', .06); sfx(990, .18, 'triangle', .05, 0, .1);
  return true;
}
function guestArrived(c) {
  if (c.state === 'enter') {
    c.state = 'wait';
    say(c.seat, '안녕하세요! 라면 주세요', null, 1.6);
    if (pickedGuest() == null) pickGuest(c.seat.i, true);
  } else if (c.state === 'leave') {
    scene.remove(c.g); if (c.bowl) scene.remove(c.bowl);
    c.seat.guest = null; c.seat.tagEl.hidden = true; c.seat.bubbleEl.hidden = true; c.seat.bubbleT = 0;
    G.guests.splice(G.guests.indexOf(c), 1);
  }
}
function guestLeave(c, text) {
  if (c.state === 'leave') return;
  c.state = 'leave';
  c.path = [_wp(c.seat.pos.x, LANE_Z), _wp(c.side * 9.5, LANE_Z)];
  if (text) say(c.seat, text, null, 2);
  if (G.pick === c.seat.i) autoPick();
}
const pickedGuest = () => { const s = SEATS[G.pick], c = s && s.guest; return c && c.state === 'wait' ? c : null; };
function pickGuest(i, quiet) {
  const c = SEATS[i] && SEATS[i].guest;
  if (G.screen !== 'play' || !c || c.state !== 'wait') return;
  if (G.pick !== i && !quiet) sfx(820, .07, 'triangle', .05, 120);
  G.pick = i;
}
// after serving or losing the picked guest, pick whoever has been waiting the longest
function autoPick() {
  const w = G.guests.filter(c => c.state === 'wait' && c.seat.i !== G.pick).sort((a, b) => a.patience - b.patience)[0];
  G.pick = w ? w.seat.i : -1;
}
function selectPot(i) {
  if (G.screen !== 'play' || i >= potsOf(G.day) || i === G.sel) return;
  setPour(false);
  G.sel = i; sfx(560, .07, 'triangle', .05, 160);
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
  s += Math.max(0, 1 - .4 * (miss.length + extra.length));
  if (miss.length) notes.push(`${iGa(TOP[miss[0]].name)} 빠졌어요`);
  if (extra.length) notes.push(`${eunNeun(TOP[extra[0]].name)} 안 시켰어요`);
  if (!p.soup) { s -= 1.2; notes.unshift('스프를 안 넣었어요!'); }
  const stars = s >= 2.75 ? 3 : s >= 1.9 ? 2 : s >= 1 ? 1 : 0;
  return { stars, notes };
}

// the picked pot goes to the picked guest
function serve() {
  if (G.screen !== 'play') return;
  const P = POTS[G.sel], p = P.s, c = pickedGuest();
  if (!c) return toast(G.guests.some(g => g.state === 'wait') ? '위의 주문서를 눌러 손님을 골라요' : '아직 주문한 손님이 없어요');
  if (!p.noodles) return toast(`${P.i + 1}번 냄비에 면이 없어요`);
  if (G.pourPot === P.i) setPour(false);
  const res = judge(c.order, p);
  const bowl = makeBowl(P);
  bowl.position.set(P.x, POT_Y + .5, POT_Z); scene.add(bowl);
  G.bowls.push({ g: bowl, t: 0, res, c, from: bowl.position.clone() });
  c.state = 'served'; c.bowl = bowl;
  P.s = freshPot(); syncPotMeshes(P);
  sfx(520, .15, 'triangle', .07, 300);
  autoPick();
}
function landBowl(b) {
  const { res, c } = b;
  const price = 3000 + 500 * c.order.toppings.length;
  const total = Math.round(price * [0, .5, .85, 1][res.stars] / 100) * 100;
  G.earned += total; G.total += total; G.served++; G.starSum += res.stars;
  const lines = {
    3: ['완벽해요! 최고의 라면!', '바로 이 맛이에요!', '냥이 라면 최고예요!'][Math.floor(Math.random() * 3)],
    2: `맛있어요! 그런데 ${res.notes[0] || '조금 아쉬워요'}`,
    1: `${res.notes[0] || '음...'}...`,
    0: '이건 못 먹겠어요...',
  };
  say(c.seat, lines[res.stars], res.stars, 2.4);
  if (total) { coin(c.seat, `+${won(total)}`); payCoins(total, c.seat); }
  if (res.stars >= 2) { nyangiMood('happy', 1.4); chime(); } else { nyangiMood('sad', 1.4); sfx(300, .3, 'sawtooth', .04, -120); }
  c.state = 'eat'; c.timer = 1.6; c.mood = res.stars;
}

/* ---------- HUD helpers ---------- */
let toastT = 0;
function toast(msg) { const t = $('#toast'); t.textContent = msg; t.hidden = false; toastT = 1.8; sfx(240, .1, 'square', .03); }
function mkTag(cls, html) {
  const el = document.createElement('div'); el.className = 'tag ' + cls; el.hidden = true;
  if (html != null) el.innerHTML = html;
  $('#tags').appendChild(el); return el;
}
SEATS.forEach(s => { s.tagEl = mkTag('seatTag', s.i + 1); s.tagEl.style.setProperty('--c', s.col); s.bubbleEl = mkTag('cbubble'); s.bubbleT = 0; });
POTS.forEach(P => { P.tagEl = mkTag('potTag', `<b>${P.i + 1}</b><span class="txt"></span>`); P.tagTxt = P.tagEl.querySelector('.txt'); });
function say(seat, text, stars, dur) {
  const b = seat.bubbleEl; b.innerHTML = '';
  if (stars != null) { const s = document.createElement('span'); s.className = 'st'; s.textContent = '★'.repeat(stars) + '☆'.repeat(3 - stars); b.appendChild(s); }
  b.appendChild(document.createTextNode(text)); b.hidden = false; seat.bubbleT = dur;
}
function coin(seat, text) {
  const p = toScreen(new THREE.Vector3(seat.pos.x, 2.2, seat.pos.z));
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
  b.innerHTML = `<i class="sw" style="--c:${t.c}"></i>${t.name}<small class="lock"></small>`;
  b.addEventListener('click', () => toggleTop(t.id));
  topsEl.appendChild(b);
});
const POT_KEYS = ['KeyX', 'KeyC', 'KeyV'];
POTS.forEach(P => {
  const b = document.createElement('button');
  b.className = 'key pot'; b.type = 'button'; b.id = 'pot-' + P.i;
  b.innerHTML = `<span class="pno">${P.i + 1}</span><span class="pinfo"><span>냄비 ${P.i + 1}</span><small><span class="ps">비었어요</span> <span class="kbd">${POT_KEYS[P.i].slice(3)}</span></small></span>`;
  b.addEventListener('click', () => selectPot(P.i));
  $('#pots').appendChild(b); P.btn = b; P.btnTxt = b.querySelector('.ps');
});
const ORDER_KEYS = ['Digit1', 'Digit2', 'Digit3', 'Digit4', 'Digit5'];
SEATS.forEach(s => {
  const b = document.createElement('button');
  b.type = 'button'; b.style.setProperty('--c', s.col);
  b.addEventListener('click', () => pickGuest(s.i));
  $('#orders').appendChild(b); s.orderEl = b; s.orderKey = '';
});
const chip = id => `<i class="chip" style="--c:${TOP[id].c};${TOP[id].fg ? 'color:' + TOP[id].fg : ''}" title="${TOP[id].name}">${TOP[id].name[0]}</i>`;
function orderCard(no, name, o, sel) {
  return `<span class="o-head"><span class="o-no">${no}</span><span class="o-name">${name}</span></span>` +
    (o ? `<span class="o-pat"><i></i></span>` +
      `<span class="o-row"><i class="o-lbl">물</i> <b>${WATER[o.water].name}</b></span>` +
      `<span class="o-row"><i class="o-lbl sm-hide">익힘</i> <b>${STAGE_NAMES[o.done]}</b></span>` +
      `<span class="o-tops">${o.toppings.length ? o.toppings.map(chip).join('') : '<span class="none">토핑 없음</span>'}</span>` : '');
}
function renderOrder(s) {
  const c = s.guest, st = !c || c.state === 'leave' ? 'empty' : c.state;
  const sel = st === 'wait' && G.pick === s.i;
  const key = `${c ? c.no : 0}|${st}|${sel}`;
  if (key !== s.orderKey) {
    s.orderKey = key;
    const b = s.orderEl;
    b.className = 'order' + (st === 'wait' ? '' : st === 'served' || st === 'eat' ? ' done' : ' empty') + (sel ? ' sel' : '');
    b.disabled = st !== 'wait';
    b.setAttribute('aria-pressed', String(sel));
    if (st === 'wait') {
      const o = c.order;
      b.innerHTML = orderCard(s.i + 1, c.T.name, o) + `<span class="kbd">${s.i + 1}</span>`;
      b.setAttribute('aria-label', `${s.i + 1}번 ${c.T.name} 손님: 물 ${WATER[o.water].name}, ${STAGE_NAMES[o.done]}, 토핑 ${o.toppings.length ? o.toppings.map(id => TOP[id].name).join(' ') : '없음'}`);
    } else {
      const note = st === 'enter' ? '오는 중' : st === 'served' || st === 'eat' ? '냠냠' : '빈 자리';
      b.innerHTML = orderCard(s.i + 1, c && st !== 'empty' ? c.T.name : '', null) + `<span class="o-note">${note}</span>`;
      b.setAttribute('aria-label', `${s.i + 1}번 자리 ${note}`);
    }
    s.patEl = b.querySelector('.o-pat i');
  }
  if (st === 'wait' && s.patEl) {
    s.patEl.style.width = (c.patience * 100).toFixed(1) + '%';
    s.patEl.style.background = c.patience < .3 ? '#ff6a6a' : c.patience < .6 ? '#ffc25a' : 'var(--mint)';
  }
}

const curPot = () => POTS[G.sel];
function toggleTop(id) {
  if (G.screen !== 'play' || TOP[id].day > G.day) return;
  const P = curPot(), p = P.s;
  if (p.toppings.has(id)) { toast('한 번 넣은 토핑은 뺄 수 없어요'); return; }
  p.toppings.add(id); P.topMesh[id].userData.pop = 0;
  sprinkle(P, id === 'chili' ? 0xd2281c : id === 'pa' ? 0x6cc04a : 0xffffff, id === 'chili' ? 26 : id === 'pa' ? 10 : 0);
  sfx(700, .07, 'triangle', .06, 200);
  syncPotMeshes(P);
}
// only the picked pot fills while the water key is held; switching pots lets go
function setPour(on) {
  if (!on) {
    if (G.pourPot >= 0) POTS[G.pourPot].s.pouring = false;
    G.pourPot = -1; $('#bWater').classList.remove('held'); return;
  }
  if (G.screen !== 'play' || G.pourPot === G.sel) return;
  setPour(false);
  G.pourPot = G.sel; curPot().s.pouring = true; $('#bWater').classList.add('held');
}
const bW = $('#bWater');
bW.addEventListener('pointerdown', e => { e.preventDefault(); try { bW.setPointerCapture(e.pointerId); } catch (_) {} setPour(true); });
['pointerup', 'pointercancel', 'lostpointercapture'].forEach(ev => bW.addEventListener(ev, () => setPour(false)));
bW.addEventListener('contextmenu', e => e.preventDefault());
bW.addEventListener('keydown', e => { if ((e.key === ' ' || e.key === 'Enter') && !e.repeat) { e.preventDefault(); e.stopPropagation(); setPour(true); } });
bW.addEventListener('keyup', e => { if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); e.stopPropagation(); setPour(false); } });
function toggleFire() {
  if (G.screen !== 'play') return;
  const p = curPot().s;
  p.flame = !p.flame;
  sfx(p.flame ? 180 : 140, .18, 'sawtooth', .035, p.flame ? 220 : -60);
}
function addNoodles() {
  const P = curPot(), p = P.s;
  if (G.screen !== 'play' || p.noodles) return;
  if (p.water <= .05) return toast('먼저 물을 부어 주세요');
  if (p.temp < .98) toast('아직 안 끓어서 면이 천천히 익어요');
  p.noodles = true; p.drop = 0; p.cook = 0; syncPotMeshes(P); sfx(200, .2, 'sine', .08, -100);
}
function addSoup() {
  const P = curPot(), p = P.s;
  if (G.screen !== 'play' || p.soup) return;
  p.soup = true; sprinkle(P, 0xe8732c, 30); sfx(900, .15, 'triangle', .05, -500);
}
function trash() {
  if (G.screen !== 'play') return;
  const P = curPot();
  if (G.pourPot === P.i) setPour(false);
  P.s = freshPot(); syncPotMeshes(P); sfx(160, .25, 'sawtooth', .04, -80);
}
$('#bFire').addEventListener('click', toggleFire);
$('#bNoodle').addEventListener('click', addNoodles);
$('#bSoup').addEventListener('click', addSoup);
$('#bTrash').addEventListener('click', trash);
$('#bServe').addEventListener('click', serve);
$('#mute').addEventListener('click', () => setMuted(!muted));
setMuted(muted);
// a mouse or finger click should not leave focus on the button, so Space keeps meaning "serve"
document.addEventListener('click', e => { const b = e.target.closest && e.target.closest('button'); if (b && e.detail > 0 && G.screen === 'play') b.blur(); });
// keys mirror the on-screen layout: number row = order tickets on top, Q W E R = cooking steps, A–H = toppings,
// bottom row = Z trash, X C V pick a pot, Space serves. e.code keeps them working with the Korean keyboard layout too.
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
  const step = STEP_KEYS[code], num = ORDER_KEYS.indexOf(code.replace('Numpad', 'Digit'));
  if (step === 'water') { e.preventDefault(); setPour(true); }
  else if (e.repeat) return;
  else if (step === 'fire') toggleFire();
  else if (step === 'noodle') addNoodles();
  else if (step === 'soup') addSoup();
  else if (code === 'KeyZ') trash();
  else if (code === 'Space') { e.preventDefault(); serve(); }
  else if (TOP_KEYS.includes(code)) toggleTop(TOPS[TOP_KEYS.indexOf(code)].id);
  else if (POT_KEYS.includes(code)) selectPot(POT_KEYS.indexOf(code));
  else if (num >= 0) pickGuest(num);
});
window.addEventListener('keyup', e => { if (STEP_KEYS[e.code] === 'water') setPour(false); });
window.addEventListener('blur', () => setPour(false));

/* ---------- Day flow ---------- */
let best = 0;
try { best = +localStorage.getItem('nyangiRushBest') || 0; } catch (e) {}
if (best > 1) $('#bestLine').textContent = `최고 기록: ${best}일차까지 영업했어요`;

function setScreen(s) {
  G.screen = s; stage.dataset.screen = s;
  $('#scrTitle').hidden = s !== 'title'; $('#scrHow').hidden = s !== 'how'; $('#scrResult').hidden = s !== 'result';
  $('#panel').hidden = s !== 'play'; $('#hud').hidden = s !== 'play'; $('#tags').hidden = s !== 'play';
}

function startDay() {
  G.guests.forEach(c => { scene.remove(c.g); if (c.bowl) scene.remove(c.bowl); });
  G.bowls.forEach(b => scene.remove(b.g));
  G.guests = []; G.bowls = [];
  SEATS.forEach(s => { s.guest = null; s.tagEl.hidden = true; s.bubbleEl.hidden = true; s.bubbleT = 0; s.orderKey = ''; });
  setScreen('play'); G.earned = 0; G.served = 0; G.missed = 0; G.starSum = 0; G.timeLeft = DAY_LEN; G.spawnT = FIRST_GUEST;
  G.sel = 0; G.pick = -1; setPour(false);
  POTS.forEach(P => {
    P.s = freshPot(); syncPotMeshes(P);
    const open = P.i < potsOf(G.day);
    P.g.visible = open; P.btn.disabled = !open; P.tagEl.hidden = !open;
    P.btn.querySelector('small').innerHTML = open ? `<span class="ps">비었어요</span> <span class="kbd">${POT_KEYS[P.i].slice(3)}</span>` : '<span class="ps">2일차부터</span>';
    P.btnTxt = P.btn.querySelector('.ps');
  });
  $('#sDay').textContent = `${G.day}일차`; $('#sGoal').textContent = won(goalOf(G.day));
  TOPS.forEach(t => {
    const b = $('#top-' + t.id), locked = t.day > G.day;
    b.disabled = locked; b.querySelector('.lock').textContent = locked ? `${t.day}일차` : TOP_KEYS[TOPS.indexOf(t)].slice(3);
    b.querySelector('.lock').className = locked ? 'lock' : 'lock kbd';
  });
  chime(); nyangiMood('happy', 1);
}
let passed = false;
function endDay() {
  setScreen('result'); setPour(false); POTS.forEach(P => { P.s.flame = false; });
  const goal = goalOf(G.day); passed = G.earned >= goal;
  const n = G.served ? Math.round(G.starSum / G.served) : 0;
  $('#rTitle').textContent = `${G.day}일차 영업 끝!`;
  $('#rStars').textContent = '★'.repeat(n) + '☆'.repeat(3 - n);
  $('#rEarn').textContent = won(G.earned); $('#rGoal').textContent = won(goal);
  $('#rBar').style.width = Math.min(100, G.earned / goal * 100) + '%';
  $('#rServed').textContent = `${G.served}명`;
  $('#rMissed').textContent = `${G.missed}명`;
  $('#rTotal').textContent = won(G.total);
  const newTops = TOPS.filter(t => t.day === G.day + 1).map(t => t.name);
  const news = [potsOf(G.day + 1) > potsOf(G.day) ? '냄비가 하나 더 생기고' : '', newTops.length ? `${newTops.join(', ')} 토핑이 새로 생겨` : ''].filter(Boolean);
  $('#rVerdict').textContent = passed
    ? (news.length ? `우와, 목표 달성! 내일은 ${news.join(', ')}.` : '우와, 목표 달성! 내일은 손님이 더 자주 올 거야.')
    : `아쉽다! ${won(goal - G.earned)}만 더 벌면 됐어. 같은 날을 다시 해 볼까?`;
  $('#btnNext').textContent = passed ? '다음 날 영업하기' : '다시 도전하기';
  if (passed) { try { if (G.day + 1 > best) { best = G.day + 1; localStorage.setItem('nyangiRushBest', best); } } catch (e) {} nyangiMood('happy', 3); cheer(); }
  else { nyangiMood('sad', 2.4); sob(); }
  $('#btnNext').focus({ preventScroll: true });
}
function nextDay() { if (passed) G.day++; startDay(); }
$('#btnStart').addEventListener('click', startDay);

/* ---------- How to play: Nyangi explains step by step ---------- */
const COOK_SEGS = '<div class="segs"><i style="width:25%;background:#e9dfe5"></i><i style="width:25%;background:#ffe58f"></i><i style="width:22%;background:#ffc560"></i><i style="width:18%;background:#ff9b52"></i><i style="width:10%;background:#c9a99a"></i></div>';
const demoOrder = (i, sel) => `<span class="order${sel ? ' sel' : ''}" style="--c:${SEAT_COL[i]}">${orderCard(i + 1, '토순이', { water: 1, done: 1, toppings: ['egg', 'pa'] })}</span>`;
const demoPot = (i, txt, sel, solo) => `<span class="key pot${sel ? ' sel' : ''}${solo ? ' solo' : ''}"><span class="pno">${i + 1}</span><span class="pinfo"><span>냄비 ${i + 1}</span><small>${txt}</small></span></span>`;
const TUT = [
  { say: '안녕! 나는 냥이야. 오늘은 손님이 아주 많이 와! 3분 동안 목표만큼 돈을 모아 보자!',
    demo: () => `<span class="pill"><b>1일차</b>남은 시간 3:00</span><span class="pill">목표<b>${won(goalOf(1))}</b></span>` },
  { say: '테이블이 다섯 개야. 손님이 앉으면 위에 번호가 같은 주문서가 생겨!',
    demo: () => `<span class="tag seatTag" style="--c:${SEAT_COL[2]}">3</span><i class="arrow">→</i>${demoOrder(2, false)}` },
  { say: '주문서를 누르면 그 손님이 골라져. 분홍 칸은 그 손님이 원하는 물이랑 익힘이야!',
    demo: () => `${demoOrder(2, true)}<div class="demo-gauge"><span>물 양</span><div class="bar"><i class="zone" style="left:48%;width:22%"></i></div><span>익힘</span><div class="bar">${COOK_SEGS}<i class="zone" style="left:25%;width:25%"></i></div></div>` },
  { say: '냄비가 여러 개야! 냄비 번호를 눌러 고른 다음 요리해. 한 냄비가 끓는 동안 다른 냄비도 시작하면 빨라!',
    demo: () => demoPot(0, '꼬들꼬들', false) + demoPot(1, '물 60%', true) + demoPot(2, '비었어요', false) },
  { say: '물 붓기 버튼을 꾹 누르고 있다가, 분홍 칸에 오면 손을 떼! 불을 켜고 보글보글 끓으면 면이랑 스프를 넣어.',
    demo: () => '<span class="key col press">물 붓기<small>꾹 누르기</small></span><div class="demo-gauge"><span>물 양</span><div class="bar"><b class="fill anim-water"></b><i class="zone" style="left:48%;width:22%"></i></div></div><span class="key on">불 켜기</span><i class="arrow">→</i><span class="key">면 넣기</span><i class="arrow">→</i><span class="key">스프</span>' },
  { say: '주문서에 있는 토핑만 골라서 올려 줘. 한 번 넣으면 뺄 수 없으니 잘 보고 넣어!',
    demo: () => `<span class="key on"><i class="sw" style="--c:${TOP.egg.c}"></i>계란</span><span class="key on"><i class="sw" style="--c:${TOP.pa.c}"></i>파</span><span class="key"><i class="sw" style="--c:${TOP.cheese.c}"></i>치즈</span>` },
  { say: '익힘 막대가 분홍 칸에 오면 서빙! 고른 냄비의 라면이 고른 손님에게 가. 별 세 개를 받아 보자!',
    demo: () => `${demoPot(0, '꼬들꼬들', true, true)}<i class="arrow">+</i>${demoOrder(2, true)}<i class="arrow">→</i><span class="key serve">서빙하기</span><span class="demo-stars">★★★</span>` },
];
let tutI = 0;
function renderTut() {
  const t = TUT[tutI];
  $('#howSay').textContent = t.say;
  $('#howDemo').innerHTML = t.demo();
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
function syncPotMeshes(P) {
  P.noodles.visible = P.s.noodles;
  TOPS.forEach(t => { P.topMesh[t.id].visible = P.s.toppings.has(t.id); });
}

/* ---------- Loop ---------- */
let last = performance.now(), time = 0;
function potPhysics(p, dt) {
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
}
function potVisual(P, dt) {
  const p = P.s, wh = p.water * POT_H;
  P.water.visible = p.water > .005;
  P.water.scale.y = Math.max(.001, wh);
  P.water.position.y = .04 + wh / 2;
  P.surf.position.y = .04 + wh + .005;
  _c.copy(COL_WATER).lerp(COL_SOUP, p.soupMix);
  if (p.toppings.has('chili')) _c.lerp(COL_CHILI, .6 * Math.max(.4, p.soupMix));
  P.waterMat.color.copy(_c); P.waterMat.opacity = lerp(.6, .93, p.soupMix);
  if (p.noodles) {
    const e = 1 - Math.pow(1 - p.drop, 3);
    P.noodles.position.y = (1 - e) * 1.2;
    P.block.visible = p.cook < .3; P.block.scale.setScalar(Math.max(.01, 1 - p.cook * 3));
    P.curls.visible = p.cook > .015;
    const cs = clamp(p.cook * 3.2, .05, 1) * (1 + Math.max(0, p.cook - .72) * 1.1);
    P.curls.scale.set(cs, 1, cs);
    if (p.cook < .5) _c.copy(COL_RAW).lerp(COL_DONE, p.cook / .5); else _c.copy(COL_DONE).lerp(COL_OVER, (p.cook - .5) / .5);
    P.noodleMat.color.copy(_c);
    P.curls.rotation.y += dt * (p.temp >= .98 ? .5 : .05);
  }
  TOPS.forEach(t => {
    const g = P.topMesh[t.id]; if (!g.visible) return;
    g.userData.pop = Math.min(1, g.userData.pop + dt * 4);
    const k = g.userData.pop, s = k < 1 ? 1 + Math.sin(k * Math.PI) * .35 : 1;
    g.scale.setScalar(s); g.position.y = (1 - k) * .6 + (p.temp >= .98 ? Math.sin(time * 9 + t.day) * .012 : 0);
  });
  // bubbles
  const surfY = .04 + wh;
  const bubRate = p.water > .05 && p.temp > .72 ? (p.temp - .72) * 90 : 0;
  let toSpawn = bubRate * dt + (Math.random() < (bubRate * dt) % 1 ? 1 : 0);
  for (const b of P.bubbles) {
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
  for (const s of P.steams) {
    if (s.life > 0) {
      s.life -= dt; const f = 1 - s.life / s.max;
      s.s.position.set(s.x + Math.sin(time + s.x * 9) * .08, surfY + .1 + f * 1.5, s.z);
      s.s.scale.setScalar(.35 + f * .8);
      s.s.material.opacity = Math.sin(f * Math.PI) * .4 * steamAmt;
    } else if (steamAmt > 0 && Math.random() < dt * 7 * steamAmt) {
      s.x = rnd(-.4, .4); s.z = rnd(-.3, .3); s.max = s.life = rnd(1.2, 1.9);
    } else s.s.material.opacity = 0;
  }
  // flame
  P.flame.visible = p.flame && P.g.visible;
  P.flameLight.intensity = P.flame.visible ? .6 + Math.sin(time * 30 + P.i) * .06 : 0;
  if (P.flame.visible) P.flames.forEach((f, i) => { f.scale.set(1, .85 + Math.sin(time * 28 + i * 2.1) * .2 + Math.random() * .08, 1); });
  P.knob.rotation.z = lerp(P.knob.rotation.z, p.flame ? -1.2 : 0, dt * 10);
}
function updateGuest(c, dt) {
  const walk = c.state === 'enter' || c.state === 'leave';
  if (walk) {
    const tgt = c.path[0], pos = c.g.position;
    const dx = tgt.x - pos.x, dz = tgt.z - pos.z, dist = Math.hypot(dx, dz), step = 5.5 * dt;
    if (dist > .01) c.g.rotation.y = angTo(c.g.rotation.y, Math.atan2(dx, dz), Math.min(1, dt * 10));
    if (dist <= step) { pos.x = tgt.x; pos.z = tgt.z; c.path.shift(); if (!c.path.length) return guestArrived(c); }
    else { pos.x += dx / dist * step; pos.z += dz / dist * step; }
  } else c.g.rotation.y = angTo(c.g.rotation.y, c.seat.yaw, Math.min(1, dt * 8));
  if (c.state === 'eat') { c.timer -= dt; if (c.timer <= 0) guestLeave(c); }
  // hop up onto the stool while at the table
  c.sit = clamp(c.sit + (walk ? -1 : 1) * dt * 5, 0, 1);
  c.g.position.y = c.sit * .4;
  c.b.position.y = walk ? Math.abs(Math.sin(time * 11)) * .14 : c.state === 'eat' ? Math.abs(Math.sin(time * 8)) * .06 : Math.sin(time * 2.4 + c.ph) * .025;
  c.head.rotation.z = c.state === 'wait' && c.patience < .3 ? Math.sin(time * 18) * .06 : lerp(c.head.rotation.z, 0, dt * 6);
  c.head.rotation.x = c.state === 'eat' ? .25 + Math.sin(time * 8) * .1 : c.state === 'leave' && c.mood === 0 ? .3 : 0;
  c.arms[0].rotation.z = walk ? -.45 + Math.sin(time * 11) * .3 : -.45;
  c.arms[1].rotation.z = c.state === 'wait' && c.seat.bubbleT > 0 ? 2.4 + Math.sin(time * 9) * .3 : walk ? .45 - Math.sin(time * 11) * .3 : .45;
}
const _tip = new THREE.Vector3();
function update(dt) {
  time += dt;
  const play = G.screen === 'play', P = curPot(), p = P.s;

  if (play) {
    G.timeLeft = Math.max(0, G.timeLeft - dt);
    POTS.forEach(Q => potPhysics(Q.s, dt));
    // a new guest every gapOf(day) seconds (±20%) while a table is free, until last call
    if (G.timeLeft > LAST_CALL) { G.spawnT -= dt; if (G.spawnT <= 0) G.spawnT = spawnGuest() ? gapOf(G.day) * rnd(.8, 1.2) : 1; }
    G.guests.slice().forEach(c => {
      if (c.state === 'wait') {
        c.patience -= dt / c.pmax;
        if (c.patience <= 0) { G.missed++; guestLeave(c, '너무 오래 걸려요!'); nyangiMood('sad', 1.4); sfx(300, .3, 'sawtooth', .04, -120); }
        else if (G.timeLeft <= 0) { G.missed++; guestLeave(c, '벌써 문 닫아요?'); }
      } else if (c.state === 'enter' && G.timeLeft <= 0) guestLeave(c);
    });
    if (pickedGuest() == null && G.guests.some(c => c.state === 'wait')) autoPick();
    if (G.timeLeft <= 0 && !G.guests.length && !G.bowls.length) endDay();
  }

  G.guests.slice().forEach(c => updateGuest(c, dt));

  // bowl flight: from the pot to the guest's table, shrinking to fit the table
  G.bowls.slice().forEach(b => {
    b.t = Math.min(1, b.t + dt / .6);
    const e = b.t, to = b.c.seat.table;
    b.g.position.set(lerp(b.from.x, to.x, e), lerp(b.from.y, to.y, e) + Math.sin(Math.PI * e) * 1.3, lerp(b.from.z, to.z, e));
    b.g.rotation.y = e * Math.PI * 2; b.g.scale.setScalar(lerp(1, .62, e));
    if (b.t >= 1) { G.bowls.splice(G.bowls.indexOf(b), 1); landBowl(b); }
  });

  // coins flying into the piggy bank
  for (const c of coins) {
    if (!c.on) continue;
    c.t += dt / .7;
    if (c.t < 0) continue;
    const e = Math.min(1, c.t);
    c.m.visible = true;
    c.m.position.lerpVectors(c.from, SLOT, e); c.m.position.y += Math.sin(Math.PI * e) * 1.3;
    c.m.rotation.set(time * 12, 0, Math.PI / 2 * (1 - e));
    if (c.t >= 1) { c.on = false; c.m.visible = false; clink(); piggy.userData.bounce = 1; }
  }
  if (piggy.userData.bounce > 0) {
    piggy.userData.bounce = Math.max(0, piggy.userData.bounce - dt * 4);
    const q = Math.sin(piggy.userData.bounce * Math.PI) * .14;
    piggy.userData.body.scale.set(1 + q * .7, 1 - q, 1 + q * .7);
  }

  POTS.forEach(Q => potVisual(Q, dt));
  potRing.position.x = lerp(potRing.position.x, P.x, Math.min(1, dt * 14));
  potRing.visible = play;
  SEATS.forEach(s => { s.ring.visible = play && s.i === G.pick && !!pickedGuest(); });
  // sprinkles
  for (const sp of sprinkles) {
    if (!sp.on) continue;
    sp.vy -= 9 * dt; sp.m.position.y += sp.vy * dt; sp.m.rotation.x += dt * 6;
    if (sp.m.position.y <= sp.floor) { sp.on = false; sp.m.visible = false; }
  }
  // kettle swings over the pot being filled
  const KP = POTS[G.pourPot >= 0 ? G.pourPot : G.sel], kp0 = KP.s;
  KPOUR.set(KP.x - .8, POT_Y + 1.1, POT_Z);
  kettle.userData.p = clamp(kettle.userData.p + (kp0.pouring ? 1 : -1) * dt * 6, 0, 1);
  const kp = kettle.userData.p, ke = kp * kp * (3 - 2 * kp);
  kettle.position.lerpVectors(KREST, KPOUR, ke);
  kettle.rotation.z = -.95 * ke;
  if (kp0.pouring && kp > .9 && kp0.water < 1) {
    spoutTip.getWorldPosition(_tip);
    const bottom = POT_Y + (.04 + kp0.water * POT_H) * POT_S;
    const len = Math.max(.01, _tip.y - bottom);
    stream.visible = true; stream.position.set(_tip.x, bottom + len / 2, _tip.z); stream.scale.set(1, len, 1);
  } else stream.visible = false;
  const live = POTS.filter(Q => Q.g.visible);
  ambUpdate(dt, {
    pouring: kp0.pouring && kp0.water < 1, water: kp0.water,
    flames: live.filter(Q => Q.s.flame).length,
    heat: Math.max(0, ...live.map(Q => Q.s.water > .05 ? clamp((Q.s.temp - .55) / .45, 0, 1) : 0)),
  }, play);

  // camera + Nyangi: close-up in front of the shop off-duty, at the stove while the shop is open
  camT = clamp(camT + (play ? 1 : -1) * dt / 1.3, 0, 1);
  const talkShift = G.screen === 'how' || G.screen === 'result' ? -.5 * CAM.khalf : 0;
  camShift = lerp(camShift, talkShift, Math.min(1, dt * 4));
  applyCam();
  const k = nyangi, kWalk = camT * camT * (3 - 2 * camT), walking = camT > 0 && camT < 1;
  k.root.position.lerpVectors(KFRONT, KGAME, kWalk);
  k.root.scale.setScalar(lerp(.8, .66, kWalk));
  k.root.rotation.y = lerp(k.root.rotation.y, (.42 + G.sel * .12) * kWalk, Math.min(1, dt * 6));
  k.moodT = Math.max(0, k.moodT - dt); if (k.moodT <= 0) k.mood = 'idle';
  const happy = k.mood === 'happy', sad = k.mood === 'sad', spin = k.mood === 'spin', wiggle = k.mood === 'wiggle';
  const moodP = k.moodLen ? 1 - k.moodT / k.moodLen : 1;
  k.body.position.y = Math.sin(time * 2.2) * .03 + (happy ? Math.abs(Math.sin(time * 9)) * .32 : spin ? Math.sin(moodP * Math.PI) * .5 : walking ? Math.abs(Math.sin(time * 11)) * .12 : 0);
  k.body.rotation.y = spin ? moodP * Math.PI * 2 : 0;
  k.body.rotation.z = wiggle ? Math.sin(time * 14) * .16 : lerp(k.body.rotation.z, 0, Math.min(1, dt * 8));
  const waving = happy || spin || wiggle || !play || G.guests.some(c => c.state === 'enter');
  const busy = G.pourPot >= 0 || POTS.some(Q => Q.s.flame);
  const rArm = waving ? 2.55 + Math.sin(time * 8) * .35 : busy ? 1.1 + Math.sin(time * 5) * .15 : .55 + Math.sin(time * 2) * .05;
  k.arms[1].rotation.z = lerp(k.arms[1].rotation.z, rArm, Math.min(1, dt * 10));
  k.arms[0].rotation.z = lerp(k.arms[0].rotation.z, happy ? -2.4 + Math.sin(time * 8 + 1) * .3 : sad ? -.25 : -.55, Math.min(1, dt * 10));
  k.head.rotation.y = sad ? Math.sin(time * 14) * .2 : lerp(k.head.rotation.y, play ? .22 : Math.sin(time * .8) * .12, dt * 4);
  k.head.rotation.x = lerp(k.head.rotation.x, sad ? .22 : play && p.noodles ? .12 : 0, dt * 5);
  k.head.rotation.z = Math.sin(time * 1.6) * .04;

  // ambience
  const calm = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches ? .2 : 1;
  clouds.forEach(o => { o.g.position.x = o.x + Math.sin(time * .07 * calm + o.ph) * .8; });
  floaters.forEach(f => { f.m.position.y = f.y + Math.sin(time * 1.3 * calm + f.ph) * .15; f.m.rotation.y = Math.sin(time * .9 * calm + f.ph) * .5; });

  updateHud(dt);
}

// pot status: a long line for the tag over the picked pot, a short word for the others and the pot buttons
function potStatus(P) {
  const p = P.s, boiling = p.temp >= .98 && p.water > .05, c = pickedGuest();
  if (p.pouring) return { txt: `물 ${Math.round(p.water * 100)}%`, short: `물 ${Math.round(p.water * 100)}%` };
  if (p.water <= .02) return p.flame ? { txt: '빈 냄비가 뜨거워요!', short: '빈 냄비!', cls: 'warn' } : { txt: '물을 부어 주세요', short: '비었어요' };
  if (!p.noodles && !p.flame && !boiling) return { txt: '불을 켜 주세요', short: '불 꺼짐' };
  if (!p.noodles && !boiling) return { txt: `데우는 중 ${Math.round(p.temp * 100)}%`, short: '데우는 중' };
  if (!p.noodles) return { txt: '보글보글! 면을 넣어요', short: '보글보글', cls: 'good' };
  const st = stageOf(p.cook);
  let cls = '';
  if (c && st === c.order.done) cls = 'good';
  if (st === 4) cls = 'warn';
  return { txt: STAGE_NAMES[st] + (p.soup ? '' : ' · 스프!') + (boiling ? '' : p.flame ? ' · 데우는 중' : ' · 불을 켜요'), short: STAGE_NAMES[st], cls };
}
function place(el, x, y, z) { const s = toScreen(_v.set(x, y, z)); el.style.left = s.x + 'px'; el.style.top = s.y + 'px'; }
let hudAcc = 0;
function updateHud(dt) {
  const P = curPot(), p = P.s, play = G.screen === 'play', guest = pickedGuest(), narrow = stage.clientWidth < 900;
  if (play) {
    // pot tags
    POTS.forEach(Q => {
      if (!Q.g.visible) { Q.tagEl.hidden = true; return; }
      const st = potStatus(Q), sel = Q === P;
      Q.tagTxt.textContent = sel ? st.txt : narrow ? '' : st.short;
      Q.tagEl.className = 'tag potTag' + (sel ? ' sel' : '') + (st.cls && (sel || !narrow) ? ' ' + st.cls : '');
      Q.tagEl.hidden = false;
      // the picked pot's tag floats above it; the others show their number on the pot's front so they never overlap
      if (sel || !narrow) place(Q.tagEl, Q.x, POT_Y + (sel ? 1.15 : .82), POT_Z); else place(Q.tagEl, Q.x, POT_Y + .12, POT_Z + .8);
    });
    // seat numbers and speech bubbles over the guests
    SEATS.forEach(s => {
      const c = s.guest;
      s.tagEl.hidden = !c || c.state === 'leave';
      if (c) {
        const gp = c.g.position;
        s.tagEl.classList.toggle('sel', s.i === G.pick && c.state === 'wait');
        place(s.tagEl, gp.x, gp.y + 2.25, gp.z);
        if (s.bubbleT > 0) { s.bubbleT -= dt; place(s.bubbleEl, gp.x, gp.y + 2.25, gp.z); s.bubbleEl.style.marginTop = (s.tagEl.hidden ? 0 : -34) + 'px'; }
      }
      if (!c || s.bubbleT <= 0) { s.bubbleEl.hidden = true; s.bubbleT = 0; }
    });
  }
  if (toastT > 0) { toastT -= dt; if (toastT <= 0) $('#toast').hidden = true; }

  hudAcc += dt; if (hudAcc < .05) return; hudAcc = 0;
  // gauges (picked pot) and pink target zones (picked guest's order)
  $('#gWater .fill').style.width = p.water * 100 + '%';
  $('#gWater em').textContent = Math.round(p.water * 100) + '%';
  $('#gHeat .fill').style.width = p.temp * 100 + '%';
  $('#gHeat em').textContent = p.water > .05 && p.temp >= .98 ? '보글보글' : p.temp > .05 ? Math.round(p.temp * 100) + '%' : '차가움';
  const mk = $('#gCook .marker');
  mk.hidden = !p.noodles; mk.style.left = p.cook * 100 + '%';
  $('#gCook em').textContent = p.noodles ? STAGE_NAMES[stageOf(p.cook)] : '-';
  const wz = $('#gWater .zone'), cz = $('#gCook .zone');
  wz.hidden = cz.hidden = !guest;
  if (guest) {
    const W = WATER[guest.order.water], d = guest.order.done;
    wz.style.left = W.lo * 100 + '%'; wz.style.width = (W.hi - W.lo) * 100 + '%';
    cz.style.left = ZONES[d] * 100 + '%'; cz.style.width = (ZONES[d + 1] - ZONES[d]) * 100 + '%';
  }
  // buttons
  const boiling = p.temp >= .98 && p.water > .05;
  $('#bWater').disabled = !play;
  $('#bFire').disabled = !play; $('#bFire').classList.toggle('on', p.flame);
  $('#fireLbl').textContent = p.flame ? '불 끄기' : '불 켜기';
  $('#bNoodle').disabled = !play || p.noodles; $('#bNoodle').classList.toggle('on', p.noodles);
  $('#bNoodle').querySelector('small').firstChild.textContent = p.noodles ? '넣었어요 ' : boiling ? '지금 넣어요 ' : '끓으면 ';
  $('#bSoup').disabled = !play || p.soup; $('#bSoup').classList.toggle('on', p.soup);
  TOPS.forEach(t => { const b = $('#top-' + t.id); b.classList.toggle('on', p.toppings.has(t.id)); b.disabled = !play || t.day > G.day; });
  $('#bTrash').disabled = !play;
  $('#bServe').disabled = !play || !p.noodles || !guest;
  $('#serveLbl').textContent = guest ? `${guest.seat.i + 1}번에 서빙` : '서빙하기';
  POTS.forEach(Q => {
    Q.btn.classList.toggle('sel', Q === P);
    if (Q.g.visible && Q.btnTxt) Q.btnTxt.textContent = potStatus(Q).short;
  });
  if (play) SEATS.forEach(renderOrder);
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
