// 백엔드 API. 화면(public/)은 /api 주소에만 요청하고, DB는 이 서버만 만진다.
// 저장소는 두 가지: SUPABASE_URL·SUPABASE_SECRET_KEY가 있으면 Supabase, 없으면 로컬 SQLite.
const path = require('path');
const express = require('express');
const supabase = require('./store/supabase');
const { buildCatalog } = require('./terms');

const store = supabase.configured() ? supabase.createStore() : require('./store/sqlite').createStore();
const app = express();
app.use(express.json({ limit: '20kb' }));

const MAX_NOTE = 2000; // 내 설명 최대 글자 수
const DEVICE_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

// 로그인 전까지 사람 구분: 브라우저가 처음에 만든 무작위 ID(UUID)를 X-Device-Id 헤더로 보낸다
function deviceId(req, res) {
  const id = req.get('X-Device-Id') || '';
  if (!DEVICE_RE.test(id)) {
    res.status(400).json({ error: '기기 ID가 올바르지 않아요' });
    return null;
  }
  return id.toLowerCase();
}

// 요청 값 검사. 화면에서 막아도 서버에서 한 번 더 막는다 (설명 없이 '마치기' 금지)
function validNote(body) {
  const mine = typeof body.mine === 'string' ? body.mine : null;
  const status = body.status;
  if (mine === null) return { error: '내 설명(mine)은 글자여야 해요' };
  if (mine.length > MAX_NOTE) return { error: `내 설명은 ${MAX_NOTE}자까지 쓸 수 있어요` };
  if (![0, 1, 2].includes(status)) return { error: '상태(status)는 0, 1, 2 중 하나여야 해요' };
  if (status === 2 && !mine.trim()) return { error: "내 설명을 먼저 써야 '마치기'로 저장할 수 있어요" };
  return { value: { mine, status } };
}

const wrap = (fn) => (req, res, next) => Promise.resolve(fn(req, res)).catch(next);

app.get('/api/health', (req, res) => res.json({ ok: true, store: store.mode }));

// 조회(Read): 섹션과 용어 전체
app.get('/api/terms', wrap(async (req, res) => {
  const [sections, terms] = await Promise.all([store.listSections(), store.listTerms()]);
  res.json({ sections, terms });
}));

// 조회(Read): 내 기록
app.get('/api/notes', wrap(async (req, res) => {
  const id = deviceId(req, res);
  if (!id) return;
  res.json({ notes: await store.listNotes(id) });
}));

// 생성·수정(Create/Update): 내 설명과 상태 저장
app.put('/api/notes/:termId', wrap(async (req, res) => {
  const id = deviceId(req, res);
  if (!id) return;
  if (!(await store.termExists(req.params.termId))) return res.status(404).json({ error: '없는 용어예요' });
  const { error, value } = validNote(req.body || {});
  if (error) return res.status(400).json({ error });
  res.json({ note: await store.upsertNote(id, req.params.termId, value) });
}));

// 삭제(Delete): 그 용어의 내 기록 지우기 (처음 상태로)
app.delete('/api/notes/:termId', wrap(async (req, res) => {
  const id = deviceId(req, res);
  if (!id) return;
  const deleted = await store.deleteNote(id, req.params.termId);
  res.json({ deleted });
}));

app.use('/api', (req, res) => res.status(404).json({ error: '없는 API 주소예요' }));

// 화면 파일. CSS·JS는 ?v= 번호로 새 파일을 받으므로 오래 캐시해도 되지만, index.html은 매번 확인한다
app.use(express.static(path.join(__dirname, '..', 'public'), {
  setHeaders(res, file) {
    if (file.endsWith('.html')) res.setHeader('Cache-Control', 'no-cache');
  },
}));

app.use((err, req, res, next) => {
  console.error(err.cause || err);
  res.status(500).json({ error: '서버에서 문제가 생겼어요. 잠시 뒤 다시 시도해 주세요' });
});

async function start(port = Number(process.env.PORT) || 3000) {
  await store.syncCatalog(buildCatalog()); // 용어 원본 → DB (켜질 때마다 맞춘다)
  return new Promise((resolve) => {
    const server = app.listen(port, process.env.HOST || '127.0.0.1', () => {
      console.log(`아, 그게 뭐더라? · ${store.mode} · http://localhost:${server.address().port}`);
      resolve(server);
    });
  });
}

if (require.main === module) start();
module.exports = { app, start, validNote };
