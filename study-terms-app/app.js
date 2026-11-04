// 내 말로 용어장 — 화면 동작
// 저장: 내 설명과 상태만 localStorage에 남긴다. 용어 데이터는 terms.js.

const STORE_KEY = 'study-terms:v1';
const STATUS_TAG = ['알아보기', '다시 보기', '✓ 마치기'];
const CHO = 'ㄱㄲㄴㄷㄸㄹㅁㅂㅃㅅㅆㅇㅈㅉㅊㅋㅌㅍㅎ';
const byId = Object.fromEntries(TERMS.map(t => [t.id, t]));
const $ = id => document.getElementById(id);

// ---- 저장 ----
let canSave = true;
function load() {
  try {
    const data = JSON.parse(localStorage.getItem(STORE_KEY));
    if (data && data.notes) return data;
  } catch (e) { /* 읽기 실패는 빈 기록으로 시작 */ }
  return { notes: {}, ui: {} };
}
const store = load();
function persist() {
  try {
    localStorage.setItem(STORE_KEY, JSON.stringify(store));
    canSave = true;
  } catch (e) {
    canSave = false;
  }
  return canSave;
}
function note(id) {
  if (!store.notes[id]) store.notes[id] = { mine: '', status: 0 };
  return store.notes[id];
}

// ---- 검색 (대소문자 무시 + 초성) ----
function toCho(text) {
  let out = '';
  for (const ch of text) {
    const code = ch.charCodeAt(0) - 0xAC00;
    out += code >= 0 && code <= 11171 ? CHO[Math.floor(code / 588)] : ch;
  }
  return out;
}
function isChoQuery(q) { return /^[ㄱ-ㅎ]+$/.test(q); }
function findIn(text, q) {
  const hay = isChoQuery(q) ? toCho(text) : text.toLowerCase();
  return hay.indexOf(isChoQuery(q) ? q : q.toLowerCase());
}
function esc(s) {
  return s.replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}
function highlight(text, q) {
  const i = q ? findIn(text, q) : -1;
  if (i < 0) return esc(text);
  return esc(text.slice(0, i)) + '<mark>' + esc(text.slice(i, i + q.length)) + '</mark>' + esc(text.slice(i + q.length));
}
// 제목·한글 이름에서 못 찾으면 어디서 찾았는지 알려 준다
function matchTerm(t, q) {
  if (!q) return { ok: true, hint: '' };
  if (findIn(t.term, q) >= 0 || findIn(t.ko, q) >= 0) return { ok: true, hint: '' };
  if (findIn(t.full, q) >= 0) return { ok: true, hint: '영문' };
  if (findIn(t.def, q) >= 0) return { ok: true, hint: '뜻' };
  if (findIn(t.ex.title + ' ' + t.ex.body, q) >= 0) return { ok: true, hint: '예시' };
  if (findIn(note(t.id).mine, q) >= 0) return { ok: true, hint: '내 설명' };
  return { ok: false };
}

// ---- 화면 상태 ----
let current = byId[store.ui.last] ? store.ui.last : TERMS[0].id;
let filter = ['all', '0', '1', '2'].includes(store.ui.filter) ? store.ui.filter : 'all';
let showExample = false;
let visible = [];

function query() { return $('q').value.trim(); }

function renderList() {
  const q = query();
  visible = [];
  const rows = [];
  for (const t of TERMS) {
    const st = note(t.id).status;
    if (filter !== 'all' && String(st) !== filter) continue;
    const m = matchTerm(t, q);
    if (!m.ok) continue;
    visible.push(t.id);
    rows.push(
      `<li><button type="button" class="row" data-id="${t.id}" aria-current="${t.id === current}">` +
      `<span class="row-no">${t.no}</span>` +
      `<span><span class="row-name">${highlight(t.term, q)}</span>` +
      `<span class="row-ko">${highlight(t.ko, q)}${m.hint ? `<span class="row-hint">· ${m.hint}에서 찾음</span>` : ''}</span></span>` +
      `<span class="tag state state-${st}">${STATUS_TAG[st]}</span>` +
      `</button></li>`
    );
  }
  $('list').innerHTML = rows.join('');
  $('empty').hidden = visible.length > 0;

  const counts = { all: TERMS.length, 0: 0, 1: 0, 2: 0 };
  TERMS.forEach(t => counts[note(t.id).status]++);
  document.querySelectorAll('.chip').forEach(b => {
    b.setAttribute('aria-pressed', String(b.dataset.filter === filter));
    b.querySelector('span').textContent = counts[b.dataset.filter];
  });
  $('prog').textContent = `${counts[2]} / ${TERMS.length}`;
  $('bar').style.width = Math.round(counts[2] / TERMS.length * 100) + '%';
}

function termSize(word) {
  const n = word.length;
  if (n <= 4) return 'clamp(64px, 12vw, 112px)';
  if (n <= 7) return 'clamp(52px, 10vw, 92px)';
  if (n <= 11) return 'clamp(40px, 7.5vw, 68px)';
  return 'clamp(34px, 6.5vw, 56px)';
}

function renderCard() {
  const t = byId[current];
  const n = note(t.id);
  $('c-no').textContent = `CONCEPT ${t.no}`;
  $('c-src').textContent = `출처 ${t.src}`;
  $('c-term').textContent = t.term;
  $('c-term').style.setProperty('--term-size', termSize(t.term));
  document.querySelector('.note-ko').style.setProperty('--term-size', termSize(t.term));
  $('c-ko').textContent = t.ko;
  $('c-full').textContent = t.full;
  // 화살표는 다음 상자와 묶어서, 줄이 바뀌어도 화살표만 남지 않게 한다
  $('c-flow').innerHTML = t.flow.map((s, i) =>
    `<span class="flow-step">${i ? '<span class="flow-arrow" aria-hidden="true">→</span>' : ''}<span class="flow-box">${esc(s)}</span></span>`
  ).join('');

  $('c-def-label').textContent = showExample ? 'IN PRACTICE' : 'DEFINITION';
  $('c-def').innerHTML = showExample
    ? `<span class="ex-title">${esc(t.ex.title)}</span><span class="ex-text">${esc(t.ex.body)}</span>`
    : esc(t.def);
  $('c-ex-btn').textContent = showExample ? '정의로 돌아가기 ↙' : '예시 보기 ↗';

  if (document.activeElement !== $('mine')) $('mine').value = n.mine;
  document.querySelectorAll('.st').forEach(b => b.setAttribute('aria-pressed', String(Number(b.dataset.status) === n.status)));
  $('c-rel').innerHTML = t.related.map(id => `<button type="button" data-id="${id}">${esc(byId[id].ko)}</button>`).join('');
}

function setMsg(text) { $('msg').textContent = text; }
function setSaved(ok) {
  $('saved').textContent = ok ? '저장됨 ✓' : '이 브라우저에서는 저장할 수 없어요';
}

function select(id, openCard) {
  current = id;
  showExample = false;
  store.ui.last = id;
  persist();
  setMsg('');
  $('saved').textContent = '';
  renderCard();
  renderList();
  if (openCard) {
    document.body.classList.add('view-card');
    window.scrollTo(0, 0);
  }
}

// ---- 이벤트 ----
$('list').addEventListener('click', e => {
  const row = e.target.closest('.row');
  if (row) select(row.dataset.id, true);
});

$('q').addEventListener('input', renderList);
$('q').addEventListener('keydown', e => {
  if (e.key === 'Enter' && visible.length) {
    e.preventDefault();
    select(visible[0], true);
  } else if (e.key === 'Escape') {
    $('q').value = '';
    renderList();
  }
});

document.addEventListener('keydown', e => {
  const typing = ['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName);
  if (e.key === '/' && !typing) {
    e.preventDefault();
    document.body.classList.remove('view-card');
    $('q').focus();
    $('q').select();
  }
});

document.querySelectorAll('.chip').forEach(b => b.addEventListener('click', () => {
  filter = b.dataset.filter;
  store.ui.filter = filter;
  persist();
  renderList();
}));

$('show-all').addEventListener('click', () => {
  $('q').value = '';
  filter = 'all';
  store.ui.filter = filter;
  persist();
  renderList();
  $('q').focus();
});

$('c-ex-btn').addEventListener('click', () => {
  showExample = !showExample;
  renderCard();
});

$('c-rel').addEventListener('click', e => {
  const b = e.target.closest('button');
  if (!b) return;
  if (filter !== 'all' && String(note(b.dataset.id).status) !== filter) {
    filter = 'all';
    store.ui.filter = filter;
  }
  select(b.dataset.id, true);
});

let saveTimer;
$('mine').addEventListener('input', () => {
  const n = note(current);
  n.mine = $('mine').value;
  if (n.status === 2 && !n.mine.trim()) {
    n.status = 1;
    setMsg("설명이 비어서 '다시 보기'로 바꿨어요.");
    renderCard();
    renderList();
  } else {
    setMsg('');
  }
  $('saved').textContent = '저장 중…';
  clearTimeout(saveTimer);
  saveTimer = setTimeout(() => setSaved(persist()), 400);
});

document.querySelectorAll('.st').forEach(b => b.addEventListener('click', () => {
  const n = note(current);
  const next = Number(b.dataset.status);
  if (next === 2 && !n.mine.trim()) {
    setMsg('내 설명을 먼저 써야 마칠 수 있어요.');
    $('mine').focus();
    return;
  }
  n.status = next;
  setMsg('');
  setSaved(persist());
  renderCard();
  renderList();
}));

$('back').addEventListener('click', () => {
  document.body.classList.remove('view-card');
  const row = document.querySelector(`.row[data-id="${current}"]`);
  if (row) row.scrollIntoView({ block: 'center' });
});

// ---- 시작 ----
renderCard();
renderList();
if (window.matchMedia('(min-width: 821px)').matches) $('q').focus();
