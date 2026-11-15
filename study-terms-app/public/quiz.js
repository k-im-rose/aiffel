// 아, 그게 뭐더라? — 퀴즈 화면 동작
// 설명(DEFINITION)을 보고 사지선다로 용어 맞히기. 문제는 교안에 나온 용어 전부(src 기준)로 만든다.
// 기록은 서버에 남기지 않는다. 내 설명은 /api/notes에서 읽기만 한다. 브라우저에는 마지막으로 고른 교안만 남긴다.

const Q = window.QuizCore;
const DEVICE_KEY = 'study-terms:device';
const QUIZ_KEY = 'study-terms:quiz';
const BATCH = 10;
const LETTERS = ['A', 'B', 'C', 'D'];
const $ = id => document.getElementById(id);

let TERMS = [];
let SECTIONS = [];
let byId = {};
let NOTES = {};

// 이번 판 상태
const run = { section: null, queue: [], index: 0, retry: false, wrong: [], batch: [], current: null, answered: false, usedHint: false };

// ---- 브라우저 저장 (마지막으로 고른 교안만) ----
function readQuizUi() { try { return JSON.parse(localStorage.getItem(QUIZ_KEY)) || {}; } catch (e) { return {}; } }
function writeQuizUi(v) { try { localStorage.setItem(QUIZ_KEY, JSON.stringify(v)); } catch (e) { /* 저장 못 해도 퀴즈는 된다 */ } }
function deviceId() {
  let id = null;
  try { id = localStorage.getItem(DEVICE_KEY); } catch (e) { /* 아래에서 새로 만든다 */ }
  if (!id) {
    id = crypto.randomUUID();
    try { localStorage.setItem(DEVICE_KEY, id); } catch (e) { /* 이번 방문에만 쓴다 */ }
  }
  return id;
}

async function api(path) {
  const res = await fetch(path, { signal: AbortSignal.timeout(8000), headers: { 'X-Device-Id': deviceId() } });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(body.error || '요청에 실패했어요');
  return body;
}

function esc(s) {
  return String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}
// ○○○는 회색 칸으로 보이게
function withMask(s) { return esc(s).replaceAll(Q.MASK, `<mark class="qz-mask" aria-label="가린 이름">${Q.MASK}</mark>`); }
function showOnly(id) {
  for (const v of ['qz-loading', 'qz-start', 'qz-play', 'qz-break']) $(v).hidden = v !== id;
  window.scrollTo(0, 0);
}
function sectionName(id) {
  if (id === 'all') return '전체 교안';
  return `${id} 교안`;
}

// ---- 1. 교안 고르기 ----
function renderStart() {
  const last = readQuizUi().section;
  const rows = SECTIONS.map(s => ({ id: s.id, title: s.title, count: Q.termsForSection(TERMS, s.id).length }))
    .filter(s => s.count > 0)
    .reverse(); // 최근 교안이 위로
  rows.push({ id: 'all', title: '모든 교안의 용어를 섞어서', count: TERMS.length });
  $('qz-sections').innerHTML = rows.map(s => `
    <li><button type="button" class="qz-sec${s.id === last ? ' last' : ''}" data-section="${esc(s.id)}">
      <span class="qz-sec-no">${s.id === 'all' ? '전체' : esc(s.id)}</span>
      <span class="qz-sec-title">${esc(s.title)}${s.id === last ? ' <small>· 지난번에 푼 교안</small>' : ''}</span>
      <span class="qz-sec-count">${s.count}문제</span>
    </button></li>`).join('');
  showOnly('qz-start');
}

function startSection(sectionId) {
  const pool = Q.termsForSection(TERMS, sectionId);
  if (!pool.length) return renderStart();
  writeQuizUi({ section: sectionId });
  history.replaceState(null, '', `?s=${encodeURIComponent(sectionId)}`);
  Object.assign(run, { section: sectionId, queue: Q.shuffle(pool), index: 0, retry: false, wrong: [], batch: [] });
  nextQuestion();
}

// ---- 2. 문제 풀기 ----
function pool() { return Q.termsForSection(TERMS, run.section); }

function nextQuestion() {
  if (run.index >= run.queue.length) return renderBreak(true);
  if (run.batch.length >= BATCH) return renderBreak(false);
  const answer = run.queue[run.index];
  run.current = Q.buildQuestion(answer, pool(), TERMS);
  run.answered = false;
  run.usedHint = false;
  renderQuestion();
}

function renderQuestion() {
  const q = run.current;
  const total = run.queue.length;
  const n = run.index + 1;
  $('qz-meta').innerHTML = run.retry
    ? `틀린 문제 다시 풀기 · <strong>${n}</strong> / ${total}`
    : `${esc(sectionName(run.section))}에 나온 용어 ${total}개 중 <strong>${n}번째</strong> · 이번 묶음 ${run.batch.length + 1} / ${Math.min(BATCH, total - (run.index - run.batch.length))}`;
  $('qz-bar').style.width = `${Math.round((run.index / total) * 100)}%`;
  $('qz-q').innerHTML = withMask(q.prompt);
  $('qz-hint').hidden = !q.hint;
  $('qz-hint-btn').hidden = false;
  $('qz-hint-btn').setAttribute('aria-expanded', 'false');
  $('qz-hint-body').hidden = true;
  $('qz-hint-text').innerHTML = withMask(q.hint);
  $('qz-opts').innerHTML = q.options.map((t, i) => `
    <button type="button" class="qz-opt" data-id="${esc(t.id)}">
      <b>${LETTERS[i]}</b><span class="qz-opt-name">${esc(t.term)}<small>${esc(t.ko)}</small></span><span class="qz-res"></span>
    </button>`).join('');
  $('qz-exp').hidden = true;
  showOnly('qz-play');
}

function openHint() {
  run.usedHint = true;
  $('qz-hint-body').hidden = false;
  $('qz-hint-btn').hidden = true;
  $('qz-hint-btn').setAttribute('aria-expanded', 'true');
}

function choose(id) {
  if (run.answered) return;
  run.answered = true;
  const q = run.current;
  const ans = q.answer;
  const ok = id === ans.id;
  const letter = LETTERS[q.options.findIndex(t => t.id === ans.id)];
  for (const b of $('qz-opts').querySelectorAll('.qz-opt')) {
    b.disabled = true;
    if (b.dataset.id === ans.id) { b.classList.add('right'); b.querySelector('.qz-res').textContent = '정답'; }
    else if (b.dataset.id === id) { b.classList.add('wrong'); b.querySelector('.qz-res').textContent = '내가 고른 답'; }
  }
  run.batch.push({ term: ans, ok, hint: run.usedHint });
  if (!ok) run.wrong.push(ans);

  const head = ok ? (run.usedHint ? '힌트를 보고 맞혔어요.' : '힌트 없이 맞혔어요!') : '아쉬워요.';
  $('qz-verdict').textContent = `${head} 정답은 ${letter}. ${ans.term} · ${ans.ko}`;

  const easy = Q.splitEasy(ans.easy);
  $('qz-easy-title').textContent = `쉽게 말하면 · ${ans.term} · ${ans.ko}`;
  $('qz-easy').textContent = easy.body + (easy.analogy ? `\n비유하면: ${easy.analogy}` : '');

  const picked = byId[id];
  $('qz-diff').hidden = ok || !picked;
  if (!ok && picked) {
    $('qz-diff-title').textContent = `내가 고른 ${picked.term} · ${picked.ko}의 뜻`;
    $('qz-diff-body').textContent = Q.firstSentence(picked);
  }

  const mine = (NOTES[ans.id] || {}).mine || '';
  $('qz-mine').textContent = mine.trim() || '아직 써 둔 내 설명이 없어요. 용어 카드에서 나의 언어로 써 보세요.';
  $('qz-mine').classList.toggle('is-empty', !mine.trim());

  const rel = (ans.related || []).map(r => byId[r]).filter(Boolean).slice(0, 3);
  $('qz-rel-box').hidden = !rel.length;
  $('qz-rel').innerHTML = rel.map(t => `
    <li><a href="./#${encodeURIComponent(t.id)}" target="_blank" rel="noopener">${esc(t.term)}</a>
      <span class="qz-rel-src">${esc(t.section_id)}</span> — ${esc(Q.firstSentence(t))}</li>`).join('');

  $('qz-card-link').href = `./#${encodeURIComponent(ans.id)}`;
  $('qz-exp').hidden = false;
  $('qz-next').focus({ preventScroll: true });
  $('qz-exp').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function goNext() {
  run.index += 1;
  nextQuestion();
}

// ---- 3. 쉬어 가기 · 끝 ----
function renderBreak(done) {
  const b = run.batch;
  const right = b.filter(x => x.ok).length;
  const clean = b.filter(x => x.ok && !x.hint).length;
  const missed = b.filter(x => !x.ok).map(x => x.term);
  const leftCount = run.queue.length - run.index;

  $('qz-break-title').textContent = done
    ? (run.retry ? '틀린 문제까지 다 풀었어요' : `${sectionName(run.section)}을 다 풀었어요`)
    : `${b.length}문제를 풀었어요`;
  $('qz-break-score').innerHTML = b.length
    ? `${b.length}문제 중 <strong>${right}개</strong> 맞혔어요 (힌트 없이 ${clean}개)`
    : '';
  $('qz-break-missed-box').hidden = !missed.length;
  $('qz-break-missed').innerHTML = missed.map(t =>
    `<li><a href="./#${encodeURIComponent(t.id)}" target="_blank" rel="noopener">${esc(t.term)}</a> <span class="qz-rel-src">${esc(t.ko)}</span></li>`).join('');

  const acts = [];
  if (!done) acts.push(`<button type="button" class="qz-btn main" data-act="continue">다음 ${Math.min(BATCH, leftCount)}문제 →</button>`);
  if (done && !run.retry && run.wrong.length) acts.push(`<button type="button" class="qz-btn main" data-act="retry">틀린 ${run.wrong.length}문제 다시 풀기</button>`);
  acts.push(`<button type="button" class="qz-btn" data-act="sections">${done ? '다른 교안 고르기' : '그만하고 교안 고르기'}</button>`);
  $('qz-break-actions').innerHTML = acts.join('');
  $('qz-break-left').textContent = done ? '' : `이 교안에 남은 문제 ${leftCount}개`;
  showOnly('qz-break');
}

function onBreakAction(act) {
  if (act === 'continue') { run.batch = []; return nextQuestion(); }
  if (act === 'retry') {
    Object.assign(run, { queue: Q.shuffle(run.wrong), index: 0, retry: true, wrong: [], batch: [] });
    return nextQuestion();
  }
  history.replaceState(null, '', location.pathname);
  renderStart();
}

// ---- 시작 ----
async function load() {
  showOnly('qz-loading');
  $('qz-loading').innerHTML = '<p>문제를 준비하는 중이에요…</p>';
  try {
    const data = await api('/api/terms');
    TERMS = data.terms;
    SECTIONS = data.sections;
    byId = Object.fromEntries(TERMS.map(t => [t.id, t]));
  } catch (e) {
    $('qz-loading').innerHTML = '<p><strong>용어를 불러오지 못했어요.</strong> 서버 연결을 확인해 주세요.</p>' +
      '<button type="button" class="qz-btn" onclick="location.reload()">다시 시도</button>';
    return;
  }
  try {
    NOTES = Object.fromEntries((await api('/api/notes')).notes.map(n => [n.term_id, n]));
  } catch (e) { NOTES = {}; /* 내 설명을 못 불러와도 퀴즈는 된다 */ }

  const want = new URLSearchParams(location.search).get('s');
  if (want && (want === 'all' || SECTIONS.some(s => s.id === want))) startSection(want);
  else renderStart();
}

$('qz-sections').addEventListener('click', e => {
  const b = e.target.closest('[data-section]');
  if (b) startSection(b.dataset.section);
});
$('qz-opts').addEventListener('click', e => {
  const b = e.target.closest('.qz-opt');
  if (b) choose(b.dataset.id);
});
$('qz-hint-btn').addEventListener('click', openHint);
$('qz-next').addEventListener('click', goNext);
$('qz-break-actions').addEventListener('click', e => {
  const b = e.target.closest('[data-act]');
  if (b) onBreakAction(b.dataset.act);
});
$('qz-quit').addEventListener('click', () => { history.replaceState(null, '', location.pathname); renderStart(); });

// 키보드: A~D 또는 1~4로 고르기, H로 힌트, Enter로 다음 문제
document.addEventListener('keydown', e => {
  if ($('qz-play').hidden || e.metaKey || e.ctrlKey || e.altKey) return;
  const k = e.key.toLowerCase();
  if (!run.answered) {
    const i = 'abcd'.indexOf(k) >= 0 ? 'abcd'.indexOf(k) : '1234'.indexOf(k);
    if (i >= 0 && run.current.options[i]) { e.preventDefault(); choose(run.current.options[i].id); }
    else if (k === 'h' && !$('qz-hint').hidden) { e.preventDefault(); openHint(); }
  } else if (e.key === 'Enter' && document.activeElement?.tagName !== 'A') {
    e.preventDefault();
    goNext();
  }
});

load();
