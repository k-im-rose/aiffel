// 저장소 ② Supabase(Postgres) (배포할 때). SUPABASE_URL과 SUPABASE_SECRET_KEY가 있으면 이쪽을 쓴다.
// 비밀 키는 이 서버(Render 환경변수)에만 있고 브라우저에는 절대 가지 않는다.
// 표에는 RLS를 켜 두고 공개 정책을 만들지 않는다 → 공개 키로는 아무것도 못 읽고, 이 서버만 접근한다 (supabase/schema.sql).
const { createClient } = require('@supabase/supabase-js');

function configured() {
  return !!(process.env.SUPABASE_URL && process.env.SUPABASE_SECRET_KEY);
}

// Supabase 오류는 서버 로그에만 남기고, 화면에는 짧은 말만 보낸다
function check({ data, error }) {
  if (error) {
    const err = new Error('DB 요청에 실패했어요');
    err.cause = error;
    throw err;
  }
  return data;
}

function createStore() {
  const sb = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SECRET_KEY, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  });
  return {
    mode: 'supabase',

    async syncCatalog({ sections, terms }) {
      check(await sb.from('sections').upsert(sections));
      check(await sb.from('terms').upsert(terms));
    },

    async listSections() {
      return check(await sb.from('sections').select('id, title').order('id'));
    },

    async listTerms() {
      return check(await sb.from('terms').select('*').order('position'));
    },

    async termExists(id) {
      return !!check(await sb.from('terms').select('id').eq('id', id).maybeSingle());
    },

    async listNotes(owner) {
      return check(await sb.from('notes').select('term_id, mine, status, updated_at').eq('owner_id', owner));
    },

    async upsertNote(owner, termId, { mine, status }) {
      return check(
        await sb
          .from('notes')
          .upsert({ owner_id: owner, term_id: termId, mine, status, updated_at: new Date().toISOString() })
          .select('term_id, mine, status, updated_at')
          .single()
      );
    },

    async deleteNote(owner, termId) {
      const rows = check(await sb.from('notes').delete().eq('owner_id', owner).eq('term_id', termId).select('term_id'));
      return rows.length > 0;
    },

    // 로그인할 때: 이 기기의 기록을 계정으로 옮긴다. 계정에 이미 있는 용어는 계정 쪽을 남긴다
    async mergeNotes(from, to) {
      const rows = check(await sb.from('notes').select('term_id, mine, status, updated_at').eq('owner_id', from));
      if (rows.length) {
        check(await sb.from('notes').upsert(rows.map((r) => ({ ...r, owner_id: to })), { onConflict: 'owner_id,term_id', ignoreDuplicates: true }));
        check(await sb.from('notes').delete().eq('owner_id', from));
      }
      return rows.length;
    },
  };
}

// 로그인 확인용 클라이언트. 요청마다 새로 만들어 사용자끼리 세션이 섞이지 않게 한다.
// storage를 넘기면 PKCE 로그인에 쓰는 code_verifier를 그 안에 둔다 (서버는 그것을 쿠키로 브라우저에 맡긴다)
function authClient(storage) {
  return createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SECRET_KEY, {
    auth: { persistSession: !!storage, autoRefreshToken: false, detectSessionInUrl: false, flowType: 'pkce', storage },
  });
}

module.exports = { configured, createStore, authClient };
