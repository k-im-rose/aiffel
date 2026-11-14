// 백엔드 API. 화면(public/)은 /api 주소에만 요청하고, DB는 이 서버만 만진다.
// 저장소는 두 가지: SUPABASE_URL·SUPABASE_SECRET_KEY가 있으면 Supabase, 없으면 로컬 SQLite.
const path = require('path');
const express = require('express');
const supabase = require('./store/supabase');
const { buildCatalog } = require('./terms');

const store = supabase.configured() ? supabase.createStore() : require('./store/sqlite').createStore();
const auth = supabase.configured() ? require('./auth') : null; // 구글 로그인은 Supabase 모드에서만
const app = express();
app.set('trust proxy', 1); // Render 앞단을 거쳐 와도 https 주소로 로그인 돌아올 곳을 만든다
app.disable('x-powered-by');
app.use(express.json({ limit: '20kb' }));

const MAX_NOTE = 5000; // 내 설명 최대 글자 수
const DEVICE_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

// 기기 ID: 브라우저가 처음에 만든 무작위 ID(UUID). X-Device-Id 헤더로 보낸다
function deviceId(req, res) {
  const id = req.get('X-Device-Id') || '';
  if (!DEVICE_RE.test(id)) {
    res.status(400).json({ error: '기기 ID가 올바르지 않아요' });
    return null;
  }
  return id.toLowerCase();
}

// 기록의 주인: 구글로 로그인했으면 'user:<계정 ID>', 아니면 'device:<기기 ID>'
// 앞말을 붙여 두 종류가 섞이지 않게 한다 (남의 계정 ID를 기기 ID로 보내도 그 계정 기록은 못 읽는다)
async function owner(req, res) {
  const user = auth && (await auth.resolveUser(req, res));
  if (user) return `user:${user.id}`;
  const id = deviceId(req, res);
  return id && `device:${id}`;
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

app.get('/api/health', (req, res) => res.json({ ok: true, store: store.mode, login: !!auth }));

// ---- 구글 로그인 ----
// 지금 누구인지. 로그인 기능이 없으면(로컬 SQLite) available: false
app.get('/api/auth/me', wrap(async (req, res) => {
  const user = auth && (await auth.resolveUser(req, res));
  res.json({
    available: !!auth,
    user: user ? { email: user.email, name: user.user_metadata?.full_name || user.user_metadata?.name || '' } : null,
  });
}));

// 구글 로그인 시작 → 구글 화면으로 보낸다
app.get('/api/auth/google', wrap(async (req, res) => {
  if (!auth) return res.status(404).json({ error: '이 서버에서는 로그인을 쓸 수 없어요' });
  res.redirect(await auth.startGoogle(res, `${req.protocol}://${req.get('host')}/api/auth/callback`));
}));

// 구글 → Supabase를 거쳐 돌아오는 곳. 결과는 주소의 ?login=ok / fail 로 화면에 알린다
app.get('/api/auth/callback', wrap(async (req, res) => {
  if (!auth) return res.redirect('/');
  const ok = !req.query.error && (await auth.finishGoogle(req, res, String(req.query.code || '')));
  res.redirect(ok ? '/?login=ok' : '/?login=fail');
}));

app.post('/api/auth/logout', wrap(async (req, res) => {
  if (auth) await auth.signOut(req, res);
  res.json({ ok: true });
}));

// 로그인 직후: 이 기기에 남긴 기록을 계정으로 옮긴다 (계정에 이미 있는 용어는 계정 쪽을 남김)
app.post('/api/notes/merge', wrap(async (req, res) => {
  const user = auth && (await auth.resolveUser(req, res));
  if (!user) return res.status(401).json({ error: '로그인이 필요해요' });
  const id = deviceId(req, res);
  if (!id) return;
  res.json({ moved: await store.mergeNotes(`device:${id}`, `user:${user.id}`) });
}));

// 조회(Read): 섹션과 용어 전체
app.get('/api/terms', wrap(async (req, res) => {
  const [sections, terms] = await Promise.all([store.listSections(), store.listTerms()]);
  res.json({ sections, terms });
}));

// 조회(Read): 내 기록
app.get('/api/notes', wrap(async (req, res) => {
  const id = await owner(req, res);
  if (!id) return;
  res.json({ notes: await store.listNotes(id) });
}));

// 생성·수정(Create/Update): 내 설명과 상태 저장
app.put('/api/notes/:termId', wrap(async (req, res) => {
  const id = await owner(req, res);
  if (!id) return;
  if (!(await store.termExists(req.params.termId))) return res.status(404).json({ error: '없는 용어예요' });
  const { error, value } = validNote(req.body || {});
  if (error) return res.status(400).json({ error });
  res.json({ note: await store.upsertNote(id, req.params.termId, value) });
}));

// 삭제(Delete): 그 용어의 내 기록 지우기 (처음 상태로)
app.delete('/api/notes/:termId', wrap(async (req, res) => {
  const id = await owner(req, res);
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
  if (err.status === 503) return res.status(503).json({ error: err.message });
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
