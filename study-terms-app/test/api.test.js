// API 시험: 버리는 SQLite 파일로 서버를 띄우고 CRUD와 규칙을 확인한다.
// 실행: npm test
const test = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const path = require('path');

process.env.DB_FILE = 'test-tmp.db';
delete process.env.SUPABASE_URL;
const dbPath = path.resolve(__dirname, '..', process.env.DB_FILE);
fs.rmSync(dbPath, { force: true });

const { start } = require('../server/index');
const A = '11111111-1111-4111-8111-111111111111';
const B = '22222222-2222-4222-8222-222222222222';
let server, base;

test.before(async () => {
  server = await start(0);
  base = `http://127.0.0.1:${server.address().port}`;
});
test.after(() => {
  server.close();
  fs.rmSync(dbPath, { force: true });
});

const call = (method, url, device, body) =>
  fetch(base + url, {
    method,
    headers: { 'Content-Type': 'application/json', ...(device ? { 'X-Device-Id': device } : {}) },
    body: body ? JSON.stringify(body) : undefined,
  }).then(async (r) => ({ status: r.status, body: await r.json() }));

test('용어 목록: 534개, 섹션 순서대로 번호', async () => {
  const r = await call('GET', '/api/terms');
  assert.equal(r.status, 200);
  assert.equal(r.body.terms.length, 534);
  assert.deepEqual(r.body.sections.slice(0, 5).map((s) => s.id), ['01-01', '01-02', '01-03', '01-04', '01-05']);
  assert.deepEqual(r.body.terms.slice(0, 2).map((t) => [t.id, t.position]), [['markdown', 1], ['cloud', 2]]);
  const genai = r.body.terms.find((t) => t.id === 'genai');
  assert.equal(genai.section_id, '01-04');
});

test('기기 ID가 없거나 이상하면 거절', async () => {
  assert.equal((await call('GET', '/api/notes')).status, 400);
  assert.equal((await call('GET', '/api/notes', 'not-a-uuid')).status, 400);
});

test('저장(PUT) → 조회(GET)', async () => {
  const put = await call('PUT', '/api/notes/mcp', A, { mine: 'AI에 도구를 꽂는 공통 콘센트', status: 2 });
  assert.equal(put.status, 200);
  assert.equal(put.body.note.status, 2);
  const got = await call('GET', '/api/notes', A);
  assert.deepEqual(got.body.notes.map((n) => [n.term_id, n.status]), [['mcp', 2]]);
});

test("설명 없이 '마치기'는 서버가 거절", async () => {
  const r = await call('PUT', '/api/notes/api', A, { mine: '   ', status: 2 });
  assert.equal(r.status, 400);
});

test('없는 용어, 잘못된 상태는 거절', async () => {
  assert.equal((await call('PUT', '/api/notes/nope', A, { mine: '', status: 1 })).status, 404);
  assert.equal((await call('PUT', '/api/notes/api', A, { mine: '', status: 5 })).status, 400);
});

test('다른 기기에는 내 기록이 보이지 않음', async () => {
  const r = await call('GET', '/api/notes', B);
  assert.deepEqual(r.body.notes, []);
});

test('지우기(DELETE) → 다시 조회하면 없음', async () => {
  const del = await call('DELETE', '/api/notes/mcp', A);
  assert.equal(del.body.deleted, true);
  const got = await call('GET', '/api/notes', A);
  assert.deepEqual(got.body.notes, []);
});

test('로컬(SQLite) 서버에는 로그인이 없음', async () => {
  const me = await call('GET', '/api/auth/me');
  assert.deepEqual(me.body, { available: false, user: null });
  assert.equal((await call('GET', '/api/auth/google')).status, 404);
  assert.equal((await call('POST', '/api/notes/merge', A)).status, 401);
});
