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

    async listNotes(deviceId) {
      return check(await sb.from('notes').select('term_id, mine, status, updated_at').eq('device_id', deviceId));
    },

    async upsertNote(deviceId, termId, { mine, status }) {
      return check(
        await sb
          .from('notes')
          .upsert({ device_id: deviceId, term_id: termId, mine, status, updated_at: new Date().toISOString() })
          .select('term_id, mine, status, updated_at')
          .single()
      );
    },

    async deleteNote(deviceId, termId) {
      const rows = check(await sb.from('notes').delete().eq('device_id', deviceId).eq('term_id', termId).select('term_id'));
      return rows.length > 0;
    },
  };
}

module.exports = { configured, createStore };
