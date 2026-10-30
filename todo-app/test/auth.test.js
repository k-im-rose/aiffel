// 로그인 쿠키 처리 점검. 가짜 Supabase 서버를 띄워 '토큰 거절'과 '연결 장애'를 흉내 낸다.
const { test, before, after } = require('node:test');
const assert = require('node:assert/strict');
const http = require('node:http');

let mode = 'reject'; // reject: 401/400, down: 500
const fake = http.createServer((req, res) => {
  res.writeHead(mode === 'reject' ? (req.url.startsWith('/auth/v1/user') ? 401 : 400) : 500, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ code: 'x', message: 'x' }));
});

let auth;
before(async () => {
  await new Promise((r) => fake.listen(0, '127.0.0.1', r));
  process.env.SUPABASE_URL = `http://127.0.0.1:${fake.address().port}`;
  process.env.SUPABASE_ANON_KEY = 'test-anon-key';
  auth = require('../server/auth');
});
after(() => fake.close());

function fakeRes() {
  const calls = { cleared: 0, set: 0 };
  return { calls, cookie: () => calls.set++, clearCookie: () => calls.cleared++ };
}
const req = { headers: { cookie: 'rp_access=expired; rp_refresh=old' } };

test('깨진 쿠키는 건너뛰고 나머지 쿠키는 읽는다', () => {
  const c = auth.readCookies({ headers: { cookie: 'other=%E0%A4%A; rp_access=ok%20token' } });
  assert.equal(c.rp_access, 'ok token');
  assert.equal(c.other, undefined);
});

test('토큰이 거절되면 쿠키를 지우고 로그아웃', async () => {
  mode = 'reject';
  const res = fakeRes();
  assert.equal(await auth.resolveUser(req, res), null);
  assert.ok(res.calls.cleared > 0);
});

test('Supabase와 잠깐 연결이 안 되면 로그아웃하지 않고 503', async () => {
  mode = 'down';
  const res = fakeRes();
  await assert.rejects(auth.resolveUser(req, res), (err) => err.status === 503);
  assert.equal(res.calls.cleared, 0);
});

test('Supabase 서버에 아예 닿지 않아도 로그아웃하지 않고 503', async () => {
  const { port } = fake.address();
  await new Promise((r) => fake.close(r)); // 서버를 내려 연결 자체가 실패하게 한다
  const res = fakeRes();
  await assert.rejects(auth.resolveUser(req, res), (err) => err.status === 503);
  assert.equal(res.calls.cleared, 0);
  await new Promise((r) => fake.listen(port, '127.0.0.1', r));
});
