// 구글 로그인 (Supabase Auth). Supabase 모드에서만 쓴다.
// 토큰은 브라우저 JS가 읽을 수 없는 httpOnly 쿠키에만 둔다 → 화면 코드는 키·토큰을 전혀 모른다.
// 흐름: /api/auth/google → 구글 로그인 → Supabase → /api/auth/callback?code=… → 서버가 code를 세션으로 바꿔 쿠키에 담는다
const { authClient } = require('./store/supabase');

const ACCESS = 'st_access';
const REFRESH = 'st_refresh';
const VERIFIER = 'st_pkce'; // PKCE: 로그인을 시작한 브라우저만 code를 세션으로 바꿀 수 있게 하는 값
const SECURE = process.env.NODE_ENV === 'production';
const BASE = { httpOnly: true, sameSite: 'lax', secure: SECURE, path: '/' };

function readCookies(req) {
  const out = {};
  for (const part of (req.headers.cookie || '').split(';')) {
    const i = part.indexOf('=');
    if (i <= 0) continue;
    try {
      out[part.slice(0, i).trim()] = decodeURIComponent(part.slice(i + 1).trim());
    } catch {
      // 인코딩이 깨진 쿠키는 건너뛴다
    }
  }
  return out;
}

function setSession(res, session) {
  res.cookie(ACCESS, session.access_token, { ...BASE, maxAge: session.expires_in * 1000 });
  res.cookie(REFRESH, session.refresh_token, { ...BASE, maxAge: 30 * 24 * 3600 * 1000 });
}

function clearSession(res) {
  res.clearCookie(ACCESS, BASE);
  res.clearCookie(REFRESH, BASE);
}

// supabase-js가 PKCE 값을 넣고 꺼내는 저장소. 요청 하나 동안만 쓰는 메모리 상자
function memoryStorage(initial = {}) {
  const box = new Map(Object.entries(initial));
  return {
    box,
    getItem: (k) => (box.has(k) ? box.get(k) : null),
    setItem: (k, v) => void box.set(k, v),
    removeItem: (k) => void box.delete(k),
  };
}

// Supabase가 토큰을 '거절'한 것(4xx)과 잠깐 연결이 안 된 것(네트워크·5xx)을 구분한다.
// 연결 문제일 때 쿠키를 지우면 괜히 로그아웃되므로, 쿠키는 두고 503을 돌려준다.
const rejected = (error) => error.status >= 400 && error.status < 500;
function unavailable() {
  return Object.assign(new Error('로그인 서버에 연결하지 못했어요'), { status: 503 });
}

// 쿠키의 토큰을 Supabase에 확인한다. 만료됐으면 refresh 토큰으로 새로 받는다. 로그인 전이면 null
async function resolveUser(req, res) {
  const c = readCookies(req);
  if (!c[ACCESS] && !c[REFRESH]) return null;
  const sb = authClient();
  if (c[ACCESS]) {
    const { data, error } = await sb.auth.getUser(c[ACCESS]);
    if (!error && data.user) return data.user;
    if (error && !rejected(error)) throw unavailable();
  }
  if (c[REFRESH]) {
    const { data, error } = await sb.auth.refreshSession({ refresh_token: c[REFRESH] });
    if (!error && data.session) {
      setSession(res, data.session);
      return data.user;
    }
    if (error && !rejected(error)) throw unavailable();
  }
  clearSession(res);
  return null;
}

// 구글 로그인 주소를 만들고, PKCE 값은 쿠키로 이 브라우저에 맡긴다
async function startGoogle(res, redirectTo) {
  const storage = memoryStorage();
  const { data, error } = await authClient(storage).auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo, skipBrowserRedirect: true },
  });
  if (error) throw Object.assign(new Error('구글 로그인을 시작하지 못했어요'), { cause: error });
  // supabase-js는 흐름별 칸과 고정 칸(…-auth-token-code-verifier)에 같은 값을 넣는다. 고정 칸만 맡긴다
  const [key, verifier] = [...storage.box].find(([k]) => k.endsWith('-auth-token-code-verifier')) || [];
  if (!verifier) throw new Error('PKCE 값을 만들지 못했어요');
  res.cookie(VERIFIER, JSON.stringify([key, verifier]), { ...BASE, maxAge: 10 * 60 * 1000 });
  return data.url;
}

// 구글에서 돌아온 code를 세션으로 바꿔 쿠키에 담는다. 성공하면 true
async function finishGoogle(req, res, code) {
  let saved = null;
  try { saved = JSON.parse(readCookies(req)[VERIFIER] || 'null'); } catch { /* 아래에서 실패 처리 */ }
  res.clearCookie(VERIFIER, BASE);
  if (!Array.isArray(saved) || !code) return false;
  const storage = memoryStorage({ [saved[0]]: saved[1] });
  const { data, error } = await authClient(storage).auth.exchangeCodeForSession(code);
  if (error || !data.session) {
    console.error('구글 로그인 실패', error);
    return false;
  }
  setSession(res, data.session);
  return true;
}

// 로그아웃: Supabase 쪽 세션도 끝낸다 (실패해도 쿠키는 지운다)
async function signOut(req, res) {
  const token = readCookies(req)[ACCESS];
  if (token) {
    try { await authClient().auth.admin.signOut(token); } catch { /* 쿠키는 아래에서 지운다 */ }
  }
  clearSession(res);
}

module.exports = { resolveUser, startGoogle, finishGoogle, signOut };
