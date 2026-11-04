// 아, 그게 뭐더라? — 화면 동작
// 데이터: 용어는 GET /api/terms, 내 기록은 /api/notes (서버 → DB). 브라우저에는 화면 상태(펼친 섹션 등)만 남긴다.

const UI_KEY = 'study-terms:ui';
const OLD_KEY = 'study-terms:v1';   // API 이전 버전: 기록을 브라우저에 저장하던 곳 (처음 한 번 서버로 옮긴다)
const DEVICE_KEY = 'study-terms:device';
const STATUS_TAG = ['알아보기', '다시보기', '✓ 마치기'];
const CHO = 'ㄱㄲㄴㄷㄸㄹㅁㅂㅃㅅㅆㅇㅈㅉㅊㅋㅌㅍㅎ';
let TERMS = [];
let SECTIONS = [];
let byId = {};
const $ = id => document.getElementById(id);

// ---- 브라우저 저장 (화면 상태만) ----
function readJSON(key) {
  try { return JSON.parse(localStorage.getItem(key)); } catch (e) { return null; }
}
function writeJSON(key, value) {
  try { localStorage.setItem(key, JSON.stringify(value)); } catch (e) { /* 저장 못 해도 화면은 계속 쓴다 */ }
}
// 로그인 전까지 사람 구분용 무작위 ID. 이 브라우저에서 한 번 만들고 계속 쓴다
function deviceId() {
  let id = null;
  try { id = localStorage.getItem(DEVICE_KEY); } catch (e) { /* 아래에서 새로 만든다 */ }
  if (!id) {
    id = crypto.randomUUID();
    try { localStorage.setItem(DEVICE_KEY, id); } catch (e) { /* 이번 방문에만 쓴다 */ }
  }
  return id;
}
const DEVICE = deviceId();
const store = { notes: {}, ui: readJSON(UI_KEY) || (readJSON(OLD_KEY) || {}).ui || {} };
function persist() { writeJSON(UI_KEY, store.ui); }
function note(id) {
  if (!store.notes[id]) store.notes[id] = { mine: '', status: 0 };
  return store.notes[id];
}

// ---- API ----
async function api(path, options = {}) {
  const res = await fetch(path, {
    signal: AbortSignal.timeout(options.timeout || 8000), // 응답이 너무 늦으면 실패로 보고 알려 준다
    ...options,
    headers: { 'Content-Type': 'application/json', 'X-Device-Id': DEVICE, ...(options.headers || {}) },
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw Object.assign(new Error(body.error || '요청에 실패했어요'), { status: res.status });
  return body;
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
function exText(t) { return t.ex || ''; }
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
  if (findIn(t.easy || '', q) >= 0 || findIn(exText(t), q) >= 0) return { ok: true, hint: '설명' };
  if (findIn(note(t.id).mine, q) >= 0) return { ok: true, hint: '내 설명' };
  return { ok: false };
}

// ---- 화면 상태 ----
let current = null;
let filter = ['all', '0', '1', '2'].includes(store.ui.filter) ? store.ui.filter : 'all';
let view = store.ui.view === 'all' ? 'all' : 'sections';
const open = store.ui.open || {}; // 처음 방문이면 boot()에서 첫 섹션만 펼친다
let visible = [];

function query() { return $('q').value.trim(); }

function rowHtml(t, q, hint) {
  const st = note(t.id).status;
  return `<li><button type="button" class="row" data-id="${t.id}" aria-current="${t.id === current && !document.body.classList.contains('no-card')}">` +
    `<span class="row-no">${t.no}</span>` +
    `<span><span class="row-name">${highlight(t.term, q)}</span>` +
    `<span class="row-ko">${highlight(t.ko, q)}${hint ? `<span class="row-hint">· ${hint}에서 찾음</span>` : ''}</span></span>` +
    `<span class="tag state state-${st}">${STATUS_TAG[st]}</span>` +
    `</button></li>`;
}

// 검색 중이거나 '전체 목록'이면 한 줄 목록, 아니면 자료별 섹션(펼치고 접기)
function renderList() {
  const q = query();
  visible = [];
  const pass = id => {
    const t = byId[id];
    if (filter !== 'all' && String(note(id).status) !== filter) return null;
    return matchTerm(t, q);
  };
  const rows = [];
  if (q || view === 'all') {
    for (const t of TERMS) {
      const m = pass(t.id);
      if (!m || !m.ok) continue;
      visible.push(t.id);
      rows.push(rowHtml(t, q, m.hint));
    }
  } else {
    for (const sec of SECTIONS) {
      const ids = sec.ids.filter(id => { const m = pass(id); return m && m.ok; });
      if (filter !== 'all' && !ids.length) continue;
      const done = sec.ids.filter(id => note(id).status === 2).length;
      const isOpen = !!open[sec.id];
      rows.push(
        `<li><button type="button" class="sec-head" data-sec="${sec.id}" aria-expanded="${isOpen}">` +
        `<span class="sec-title"><span class="sec-caret" aria-hidden="true">${isOpen ? '▾' : '▸'}</span>` +
        `<span class="sec-no">${sec.id}</span>${esc(sec.title)}</span>` +
        `<span class="sec-count">${done} / ${sec.ids.length}</span></button></li>`
      );
      if (!isOpen) continue;
      for (const id of ids) {
        visible.push(id);
        rows.push(rowHtml(byId[id], '', ''));
      }
    }
  }
  $('list').innerHTML = rows.join('');
  $('empty').hidden = visible.length > 0 || (!q && view === 'sections' && rows.length > 0);

  const counts = { all: TERMS.length, 0: 0, 1: 0, 2: 0 };
  TERMS.forEach(t => counts[note(t.id).status]++);
  document.querySelectorAll('.chip').forEach(b => {
    b.setAttribute('aria-pressed', String(b.dataset.filter === filter));
    b.querySelector('span').textContent = counts[b.dataset.filter];
  });
  document.querySelectorAll('.view-btn').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.view === view)));
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

function setSub(el, text) {
  el.hidden = !text;
  el.querySelector('.def-v').textContent = text || '';
}

function renderCard() {
  const t = byId[current];
  const n = note(t.id);
  $('c-no').textContent = `WORD ${t.no}`;
  $('c-src').textContent = `출처 ${t.src}`;
  $('c-level').textContent = t.level || '';
  $('c-level').hidden = !t.level;
  $('c-term').textContent = t.term;
  $('c-term').style.setProperty('--term-size', termSize(t.term));
  document.querySelector('.note-ko').style.setProperty('--term-size', termSize(t.term));
  $('c-ko').textContent = t.ko;
  $('c-full').textContent = t.full;
  $('c-full').hidden = !t.full;
  // 개념 흐름(t.flow)은 화면에 보이지 않는다. 뜻을 알기 어려워 쉬운 설명·예시로 대신한다. 데이터는 남겨 둔다

  $('c-def').textContent = t.def;
  setSub($('c-easy'), t.easy);
  setSub($('c-ex'), exText(t));

  if (document.activeElement !== $('mine')) $('mine').value = n.mine;
  document.querySelectorAll('.st').forEach(b => b.setAttribute('aria-pressed', String(Number(b.dataset.status) === n.status)));
  const rel = t.related.filter(id => byId[id] && id !== t.id);
  $('c-rel').innerHTML = rel.map(id => `<button type="button" data-id="${id}">${esc(byId[id].ko)}</button>`).join('');
  $('c-related').hidden = !rel.length;
}

function setMsg(text) { $('msg').textContent = text; }
function setSaved(state) {
  $('saved').textContent = { saving: '저장 중…', ok: '저장됨 ✓', fail: '저장하지 못했어요 · 다시 시도 중' }[state] || '';
  $('saved').classList.toggle('is-error', state === 'fail');
}

// 내 기록을 서버에 저장 (PUT). 실패하면 잠시 뒤 다시 시도한다
const saveTimers = {};
function saveNote(id, delay = 500) {
  clearTimeout(saveTimers[id]);
  setSaved('saving');
  saveTimers[id] = setTimeout(async () => {
    const n = note(id);
    try {
      await api(`/api/notes/${encodeURIComponent(id)}`, { method: 'PUT', body: JSON.stringify({ mine: n.mine, status: n.status }) });
      if (id === current) setSaved('ok');
    } catch (e) {
      if (e.status === 400) { setMsg(e.message); setSaved(''); return; } // 서버가 거절한 값은 다시 보내지 않는다
      if (id === current) setSaved('fail');
      saveNote(id, 3000);
    }
  }, delay);
}

function select(id, openCard) {
  current = id;
  document.body.classList.remove('no-card');
  // 그 용어가 든 섹션을 펼쳐 둔다 (연결할 용어로 넘어갔을 때 목록에서도 보이게)
  const sec = SECTIONS.find(x => x.ids.includes(id));
  if (sec) { open[sec.id] = true; store.ui.open = open; }
  store.ui.last = id;
  persist();
  setMsg('');
  $('saved').textContent = '';
  renderCard();
  renderList();
  if (openCard) openCardView(id);
  // PC: 방문 기록은 쌓지 않고 주소만 그 용어로 바꾼다 (주소를 복사해 공유할 수 있게)
  else if (!isPhone()) history.replaceState(null, '', '#' + id);
}

// 휴대폰: 카드를 열 때 방문 기록을 남겨서 브라우저 뒤로 가기(사파리 스와이프 포함)로 목록에 돌아오게 한다
function isPhone() { return window.matchMedia('(max-width: 820px)').matches; }
// 뒤로 가기 때 사파리가 스크롤 위치를 늦게(애니메이션으로) 되돌리면 그동안 누른 것이 무시된다. 스크롤은 직접 맞춘다
if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
function openCardView(id) {
  if (!isPhone()) { history.replaceState(null, '', '#' + id); return; }
  document.body.classList.add('view-card');
  window.scrollTo(0, 0);
  if (!(history.state && history.state.card === id)) history.pushState({ card: id }, '', '#' + id);
}
function showListView() {
  document.body.classList.remove('view-card');
  const row = document.querySelector(`.row[data-id="${current}"]`);
  if (row) row.scrollIntoView({ block: 'center' });
}
window.addEventListener('popstate', e => {
  const id = e.state && e.state.card;
  if (id && byId[id]) {
    current = id;
    renderCard();
    renderList();
    document.body.classList.add('view-card');
    window.scrollTo(0, 0);
  } else {
    showListView();
  }
});

// ---- 이벤트 ----
$('list').addEventListener('click', e => {
  const head = e.target.closest('.sec-head');
  if (head) {
    open[head.dataset.sec] = !open[head.dataset.sec];
    store.ui.open = open;
    persist();
    renderList();
    return;
  }
  const row = e.target.closest('.row');
  if (row) select(row.dataset.id, true);
});

document.querySelectorAll('.view-btn').forEach(b => b.addEventListener('click', () => {
  view = b.dataset.view;
  store.ui.view = view;
  persist();
  renderList();
}));

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

$('c-rel').addEventListener('click', e => {
  const b = e.target.closest('button');
  if (!b) return;
  if (filter !== 'all' && String(note(b.dataset.id).status) !== filter) {
    filter = 'all';
    store.ui.filter = filter;
  }
  select(b.dataset.id, true);
});

$('mine').addEventListener('input', () => {
  const n = note(current);
  n.mine = $('mine').value;
  if (n.status === 2 && !n.mine.trim()) {
    n.status = 1;
    setMsg("설명이 비어서 '다시보기'로 바꿨어요.");
    renderCard();
    renderList();
  } else {
    setMsg('');
  }
  saveNote(current);
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
  saveNote(current, 0);
  renderCard();
  renderList();
}));

// 삭제(DELETE): 이 용어의 내 설명과 상태를 지우고 처음(알아보기)으로
$('reset').addEventListener('click', async () => {
  const n = note(current);
  if (!n.mine && n.status === 0) return setMsg('지울 기록이 없어요.');
  if (!confirm('이 용어에 쓴 내 설명과 상태를 지울까요?')) return;
  clearTimeout(saveTimers[current]);
  try {
    await api(`/api/notes/${encodeURIComponent(current)}`, { method: 'DELETE' });
    store.notes[current] = { mine: '', status: 0 };
    $('mine').value = '';
    setMsg('기록을 지웠어요.');
    setSaved('');
    renderCard();
    renderList();
  } catch (e) {
    setMsg('지우지 못했어요. 잠시 뒤 다시 시도해 주세요.');
  }
});

// 홈 = 필터 '전체' + 자료별 보기 + 섹션 모두 닫힘 + 검색어 없음 + 맨 위. 제목을 누르면 여기로 온다
function goHome() {
  $('q').value = '';
  filter = 'all';
  view = 'sections';
  for (const k of Object.keys(open)) delete open[k];
  Object.assign(store.ui, { filter, view, open });
  persist();
  history.replaceState(null, '', location.pathname + location.search);
  document.body.classList.remove('view-card');
  document.body.classList.add('no-card'); // PC: 홈에서는 카드 자리를 비워 둔다
  renderList();
  window.scrollTo(0, 0);
}
document.querySelector('.home').addEventListener('click', e => {
  e.preventDefault();
  goHome();
});

// '← 목록'도 브라우저 뒤로 가기와 같은 길로 간다 (방문 기록이 어긋나지 않게)
$('back').addEventListener('click', () => {
  if (history.state && history.state.card) history.back();
  else showListView();
});

// 노란 메모칸 너비를 가장 긴 용어에 맞춰 고정한다 (용어가 바뀌어도 칸 크기가 흔들리지 않게)
// 휴대폰에서는 처음에 카드가 숨겨져 있으므로, 화면 밖 body에 붙인 복제본으로 잰다
const NOTE_MAX = 340;   // 아주 긴 풀네임은 이 너비 안에서 줄을 바꾼다
const NOTE_SCALE = 1.5; // 잰 너비보다 절반만큼 넓게 (PC에서 칸이 작아 보이지 않게)
function fixNoteWidth() {
  const probe = document.querySelector('.note-ko').cloneNode(true);
  probe.style.cssText = 'position:absolute; visibility:hidden; left:-9999px; top:0; width:auto; max-width:none;';
  probe.querySelectorAll('[id]').forEach(el => el.removeAttribute('id'));
  probe.querySelector('em').hidden = false;
  document.body.appendChild(probe);
  let max = 0;
  for (const t of TERMS) {
    probe.querySelector('strong').textContent = t.ko;
    probe.querySelector('em').textContent = t.full;
    max = Math.max(max, probe.getBoundingClientRect().width);
  }
  probe.remove();
  if (max > 0) document.documentElement.style.setProperty('--note-w', Math.ceil(Math.min(max, NOTE_MAX) * NOTE_SCALE) + 'px');
}

// ---- 시작 ----
// 서버 용어(position 순)를 화면 모양으로 바꾼다: 번호(no), 풀네임(full), 섹션별 묶음
function useCatalog({ sections, terms }) {
  TERMS = terms.map(t => ({ ...t, full: t.full_name, no: String(t.position).padStart(3, '0') }));
  byId = Object.fromEntries(TERMS.map(t => [t.id, t]));
  SECTIONS = sections.map(s => ({ ...s, ids: TERMS.filter(t => t.section_id === s.id).map(t => t.id) }));
}

// API 이전 버전에서 브라우저에 남긴 기록을 한 번만 서버로 옮긴다
async function migrateOldNotes() {
  const old = readJSON(OLD_KEY);
  if (!old || !old.notes) return;
  for (const [id, n] of Object.entries(old.notes)) {
    if (!byId[id] || (!n.mine && !n.status) || store.notes[id]) continue;
    const status = n.status === 2 && !String(n.mine || '').trim() ? 1 : n.status;
    try {
      await api(`/api/notes/${encodeURIComponent(id)}`, { method: 'PUT', body: JSON.stringify({ mine: n.mine || '', status }) });
      store.notes[id] = { mine: n.mine || '', status };
    } catch (e) { return; } // 실패하면 다음 방문 때 다시 옮긴다
  }
  try { localStorage.removeItem(OLD_KEY); } catch (e) { /* 다음에 다시 지운다 */ }
}

function showLoadError() {
  $('list').innerHTML = '';
  $('empty').hidden = false;
  $('empty').innerHTML = '<p><strong>서버에 연결하지 못했어요.</strong><br>무료 서버라 처음 열 때 30초쯤 걸릴 수 있어요.</p>' +
    '<button type="button" class="line-btn" onclick="location.reload()">다시 시도</button>';
}

async function boot() {
  document.body.classList.add('loading', 'no-card');
  try {
    const [catalog, mine] = await Promise.all([api('/api/terms', { timeout: 60000 }), api('/api/notes', { timeout: 60000 })]);
    useCatalog(catalog);
    for (const n of mine.notes) store.notes[n.term_id] = { mine: n.mine, status: n.status };
    await migrateOldNotes();
  } catch (e) {
    document.body.classList.remove('loading');
    showLoadError();
    return;
  }
  document.body.classList.remove('loading');
  if (!store.ui.open) { open[SECTIONS[0].id] = true; store.ui.open = open; }
  current = byId[store.ui.last] ? store.ui.last : TERMS[0].id;
  // 주소에 #용어id가 있으면 그 카드로 연다 (휴대폰에서는 뒤로 가기로 목록에 돌아오게 기록을 한 칸 둔다)
  const startId = decodeURIComponent(location.hash.slice(1));
  if (byId[startId]) {
    current = startId;
    if (isPhone()) {
      history.replaceState(null, '', location.pathname + location.search);
      history.pushState({ card: startId }, '', '#' + startId);
      document.body.classList.add('view-card');
    }
  }
  document.body.classList.remove('no-card');
  fixNoteWidth();
  renderCard();
  renderList();
  if (window.matchMedia('(min-width: 821px)').matches) $('q').focus();
}
boot();
