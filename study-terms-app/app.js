// 아, 그게 뭐더라? — 화면 동작
// 저장: 내 설명과 상태만 localStorage에 남긴다. 용어 데이터는 terms.js와 terms-02-0N.js.

const STORE_KEY = 'study-terms:v1';
const STATUS_TAG = ['알아보기', '다시 보기', '✓ 마치기'];
const CHO = 'ㄱㄲㄴㄷㄸㄹㅁㅂㅃㅅㅆㅇㅈㅉㅊㅋㅌㅍㅎ';
// 섹션을 자료 순서로 정렬하고, 번호(WORD 001…)와 전체 목록 순서도 섹션 순서를 따른다
SECTIONS.sort((x, y) => x.id.localeCompare(y.id));
{
  let n = 0;
  const order = {};
  for (const sec of SECTIONS) for (const id of sec.ids) order[id] = ++n;
  TERMS.sort((x, y) => order[x.id] - order[y.id]);
  TERMS.forEach(t => { t.no = String(order[t.id]).padStart(3, '0'); });
}
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
function exText(t) {
  return typeof t.ex === 'string' ? t.ex : `${t.ex.title} — ${t.ex.body}`;
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
  if (findIn(t.easy || '', q) >= 0 || findIn(exText(t), q) >= 0) return { ok: true, hint: '설명' };
  if (findIn(note(t.id).mine, q) >= 0) return { ok: true, hint: '내 설명' };
  return { ok: false };
}

// ---- 화면 상태 ----
let current = byId[store.ui.last] ? store.ui.last : TERMS[0].id;
let filter = ['all', '0', '1', '2'].includes(store.ui.filter) ? store.ui.filter : 'all';
let view = store.ui.view === 'all' ? 'all' : 'sections';
const open = store.ui.open || { [SECTIONS[0].id]: true }; // 처음엔 첫 섹션만 펼친다
let visible = [];

function query() { return $('q').value.trim(); }

function rowHtml(t, q, hint) {
  const st = note(t.id).status;
  return `<li><button type="button" class="row" data-id="${t.id}" aria-current="${t.id === current}">` +
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
function setSaved(ok) {
  $('saved').textContent = ok ? '저장됨 ✓' : '이 브라우저에서는 저장할 수 없어요';
}

function select(id, openCard) {
  current = id;
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
fixNoteWidth();
renderCard();
renderList();
if (window.matchMedia('(min-width: 821px)').matches) $('q').focus();
