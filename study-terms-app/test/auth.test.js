// 실제 계정·외부 서버 없이 인증 장애가 기록의 주인을 바꾸지 않는지 확인한다.
const test = require('node:test');
const assert = require('node:assert/strict');

process.env.DB_FILE = ':memory:';
const supabase = require('../server/store/supabase');
const storage = require('../server/store/sqlite').createStore();
let getResult, refreshResult, getCalls = 0, refreshCalls = 0;
supabase.configured = () => true;
supabase.createStore = () => storage;
supabase.authClient = () => ({ auth: {
  getUser: async () => { getCalls++; return getResult; },
  refreshSession: async () => { refreshCalls++; return refreshResult; },
} });
const auth = require('../server/auth');
const account = { id: '33333333-3333-4333-8333-333333333333' };
const req = cookie => ({ headers: { cookie } });
function response() {
  return { cleared: [], cookies: [], clearCookie(name) { this.cleared.push(name); },
    cookie(name, value) { this.cookies.push([name, value]); } };
}
const failure = status => ({ data: { user: null, session: null }, error: { status } });
function reset() { getCalls = refreshCalls = 0; getResult = failure(401); refreshResult = failure(400); }
test.beforeEach(reset);

test('로그인 쿠키가 없으면 인증 서버를 호출하지 않는다', async () => {
  assert.equal(await auth.resolveUser(req(''), response()), null);
  assert.equal(getCalls + refreshCalls, 0);
});

test('정상 access 토큰은 계정 주인을 그대로 반환한다', async () => {
  getResult = { data: { user: account }, error: null };
  const res = response();
  assert.equal(await auth.resolveUser(req('st_access=test'), res), account);
  assert.equal(refreshCalls, 0);
  assert.deepEqual(res.cleared, []);
});

for (const status of [408, 429, 500, 0]) {
  test(`인증 확인 ${status}: 쿠키·refresh 토큰을 건드리지 않고 503`, async () => {
    getResult = failure(status);
    const res = response();
    await assert.rejects(auth.resolveUser(req('st_access=test; st_refresh=test'), res), { status: 503 });
    assert.equal(refreshCalls, 0);
    assert.deepEqual(res.cleared, []);
    assert.deepEqual(res.cookies, []);
  });
}

for (const cookie of ['st_access=test; st_refresh=test', 'st_refresh=test']) {
  test(`토큰 갱신 429는 세션을 유지한다 (${cookie.includes('st_access') ? '만료 access' : 'refresh만'})`, async () => {
    refreshResult = failure(429);
    const res = response();
    await assert.rejects(auth.resolveUser(req(cookie), res), { status: 503 });
    assert.equal(refreshCalls, 1);
    assert.deepEqual(res.cleared, []);
  });
}

test('실제 만료 토큰은 갱신 성공 후 새 쿠키를 설정한다', async () => {
  refreshResult = { data: { user: account, session: { access_token: 'new-access', refresh_token: 'new-refresh', expires_in: 3600 } }, error: null };
  const res = response();
  assert.equal(await auth.resolveUser(req('st_access=expired; st_refresh=valid'), res), account);
  assert.deepEqual(res.cookies, [['st_access', 'new-access'], ['st_refresh', 'new-refresh']]);
  assert.deepEqual(res.cleared, []);
});

test('access·refresh가 모두 실제 거절되면 쿠키를 지운다', async () => {
  const res = response();
  assert.equal(await auth.resolveUser(req('st_access=invalid; st_refresh=invalid'), res), null);
  assert.deepEqual(res.cleared, ['st_access', 'st_refresh']);
});

test('30명 동시 인증 제한에서도 API가 계정/기기 기록을 읽거나 수정하지 않는다', async t => {
  t.mock.method(console, 'error', () => {});
  getResult = failure(429);
  const device = '44444444-4444-4444-8444-444444444444';
  const deviceOwner = `device:${device}`;
  const accountOwner = `user:${account.id}`;
  const server = await require('../server/index').start(0);
  const base = `http://127.0.0.1:${server.address().port}`;
  await storage.upsertNote(deviceOwner, 'genai', { mine: '기기 원본', status: 1 });
  await storage.upsertNote(accountOwner, 'genai', { mine: '계정 원본', status: 2 });
  const beforeDevice = await storage.listNotes(deviceOwner);
  const beforeAccount = await storage.listNotes(accountOwner);
  try {
    await Promise.all(Array.from({ length: 30 }, async () => {
      for (const [method, path] of [['GET', '/api/notes'], ['PUT', '/api/notes/genai'], ['DELETE', '/api/notes/genai'], ['POST', '/api/notes/merge'], ['GET', '/api/auth/me']]) {
        const res = await fetch(base + path, { method,
          headers: { Cookie: 'st_access=test; st_refresh=test', 'X-Device-Id': device, 'Content-Type': 'application/json' },
          body: method === 'PUT' ? JSON.stringify({ mine: '잘못 덮어쓸 내용', status: 2 }) : undefined });
        assert.equal(res.status, 503);
        assert.equal(res.headers.get('set-cookie'), null);
        assert.match((await res.json()).error, /로그인 서버/);
      }
    }));
    assert.equal(refreshCalls, 0);
    assert.deepEqual(await storage.listNotes(deviceOwner), beforeDevice);
    assert.deepEqual(await storage.listNotes(accountOwner), beforeAccount);
  } finally { await new Promise(resolve => server.close(resolve)); }
});
