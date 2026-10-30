// 백엔드 API. 화면(public/)은 여기 /api 주소에만 요청하고, DB는 이 서버만 만진다.
// 값은 모두 ? 자리표시자(파라미터화 쿼리)로 넘겨 SQL 주입을 막는다.
process.env.TZ = process.env.TZ || 'Asia/Seoul'; // 날짜 기준: 한국 시간
const path = require('path');
const express = require('express');
const db = require('./db');

const app = express();
app.disable('x-powered-by'); // 서버 종류를 알리지 않는다

// 기본은 내 컴퓨터에서만 접속(127.0.0.1). 같은 와이파이의 다른 기기가 들어오지 못하게 한다.
const HOST = process.env.HOST || '127.0.0.1';
const LOOPBACK = ['127.0.0.1', 'localhost', '::1'];

// 내 컴퓨터 전용으로 띄웠을 때는 주소창의 이름(Host)도 localhost 계열만 받는다.
// 다른 사이트가 DNS를 바꿔치기해 이 서버에 접근하는 공격(DNS rebinding)을 막는다.
app.use((req, res, next) => {
  if (!LOOPBACK.includes(HOST)) return next();
  const hostname = (req.hostname || '').replace(/^\[|\]$/g, '');
  if (!LOOPBACK.includes(hostname)) return res.status(403).json({ error: '허용되지 않은 주소예요' });
  next();
});

// 기본 보안 헤더
app.use((req, res, next) => {
  res.set({
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'Referrer-Policy': 'no-referrer',
    'Content-Security-Policy': [
      "default-src 'self'",
      "script-src 'self'",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://cdn.jsdelivr.net",
      "font-src https://fonts.gstatic.com https://cdn.jsdelivr.net",
      "img-src 'self' data:",
      "connect-src 'self'",
      "frame-ancestors 'none'",
      "base-uri 'none'",
      "form-action 'self'",
    ].join('; '),
  });
  next();
});

app.use(express.json({ limit: '20kb' }));
app.use(express.static(path.join(__dirname, '..', 'public')));

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const TIME_RE = /^([01]\d|2[0-3]):[0-5]\d$/;
const STATUSES = ['todo', 'done', 'partial', 'missed'];

function todayStr() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

// '2026-10-30' → 1(월) … 7(일)
function weekdayOf(date) {
  const [y, m, d] = date.split('-').map(Number);
  const day = new Date(y, m - 1, d).getDay();
  return day === 0 ? 7 : day;
}

function cleanTime(v) {
  if (v === undefined || v === null || v === '') return null;
  if (!TIME_RE.test(v)) throw new Error('시간은 HH:MM 형식이어야 해요');
  return v;
}

// 시작·종료 시간 짝 검사. required 면 둘 다 필수.
function checkTimes(start, end, required) {
  if (required && (!start || !end)) throw new Error('루틴은 시작·종료 시간이 모두 필요해요');
  if (end && !start) throw new Error('종료 시간만 있을 수는 없어요. 시작 시간도 넣어 주세요');
  if (start && end && end <= start) throw new Error('종료 시간은 시작 시간보다 늦어야 해요 (자정을 넘는 일정은 아직 지원하지 않아요)');
}

function cleanTitle(v) {
  const t = typeof v === 'string' ? v.trim() : '';
  if (!t) throw new Error('제목을 입력해 주세요');
  if (t.length > 200) throw new Error('제목이 너무 길어요');
  return t;
}

function cleanDays(v) {
  const days = [...new Set((Array.isArray(v) ? v : []).map(Number))].filter((n) => n >= 1 && n <= 7).sort();
  if (days.length === 0) throw new Error('반복 요일을 하나 이상 골라 주세요');
  return days.join(',');
}

function fail(res, err, code = 400) {
  res.status(code).json({ error: err.message || String(err) });
}

// ── 날짜별 타임라인 ──────────────────────────────────────────

// 그 날짜에 해당하는 루틴을 할 일로 만든다. 이미 있으면 (routine_id, date) 중복 금지로 건너뛴다.
// 루틴을 만들기 전 날짜에는 만들지 않는다.
const insertFromRoutine = db.prepare(`
  INSERT OR IGNORE INTO todos (routine_id, title, date, start_time, end_time, is_important)
  SELECT id, title, @date, start_time, end_time, is_important
  FROM routines
  WHERE (',' || repeat_days || ',') LIKE '%,' || @weekday || ',%'
    AND date(created_at) <= @date
    AND (ended_on IS NULL OR @date <= ended_on)
`);

const selectDay = db.prepare(`
  SELECT t.*,
         rf.reason_id, rf.reason_note, rf.actual, rf.next_action,
         prev.next_action AS last_next_action,
         prev.date AS last_next_date
  FROM todos t
  LEFT JOIN reflections rf ON rf.todo_id = t.id
  -- 같은 루틴의, 이 날짜보다 이전 기록 중 '다음엔 이렇게'가 있는 가장 최근 것
  LEFT JOIN todos prev_t ON prev_t.id = (
    SELECT t2.id
      FROM reflections r2
      JOIN todos t2 ON r2.todo_id = t2.id
     WHERE t.routine_id IS NOT NULL
       AND t2.routine_id = t.routine_id
       AND t2.date < t.date
       AND r2.next_action IS NOT NULL AND r2.next_action <> ''
     ORDER BY t2.date DESC
     LIMIT 1)
  LEFT JOIN (
    SELECT t3.id, t3.date, r3.next_action
      FROM todos t3 JOIN reflections r3 ON r3.todo_id = t3.id
  ) prev ON prev.id = prev_t.id
  WHERE t.date = ? AND t.status <> 'skipped'
  ORDER BY t.start_time IS NULL, t.start_time, t.id
`);

app.get('/api/days/:date', (req, res) => {
  const { date } = req.params;
  if (!DATE_RE.test(date)) return fail(res, new Error('날짜 형식이 올바르지 않아요'));
  insertFromRoutine.run({ date, weekday: String(weekdayOf(date)) });
  res.json({ date, today: todayStr(), todos: selectDay.all(date) });
});

// ── 할 일 ────────────────────────────────────────────────────

app.post('/api/todos', (req, res) => {
  try {
    const { date, is_important } = req.body;
    if (!DATE_RE.test(date || '')) throw new Error('날짜 형식이 올바르지 않아요');
    const title = cleanTitle(req.body.title);
    const start = cleanTime(req.body.start_time);
    const end = cleanTime(req.body.end_time);
    checkTimes(start, end, false);
    const info = db
      .prepare('INSERT INTO todos (title, date, start_time, end_time, is_important) VALUES (?, ?, ?, ?, ?)')
      .run(title, date, start, end, is_important ? 1 : 0);
    res.status(201).json(db.prepare('SELECT * FROM todos WHERE id = ?').get(info.lastInsertRowid));
  } catch (err) {
    fail(res, err);
  }
});

app.patch('/api/todos/:id', (req, res) => {
  try {
    const todo = db.prepare('SELECT * FROM todos WHERE id = ?').get(req.params.id);
    if (!todo) return fail(res, new Error('할 일을 찾을 수 없어요'), 404);
    const b = req.body;
    const next = { ...todo };
    if ('title' in b) next.title = cleanTitle(b.title);
    if ('start_time' in b) next.start_time = cleanTime(b.start_time);
    if ('end_time' in b) next.end_time = cleanTime(b.end_time);
    if ('is_important' in b) next.is_important = b.is_important ? 1 : 0;
    if ('status' in b) {
      if (!STATUSES.includes(b.status)) throw new Error('상태 값이 올바르지 않아요');
      next.status = b.status;
      next.completed_at = b.status === 'todo' ? null : new Date().toISOString();
    }
    checkTimes(next.start_time, next.end_time, false);
    db.prepare(
      `UPDATE todos SET title = ?, start_time = ?, end_time = ?, is_important = ?, status = ?, completed_at = ?
       WHERE id = ?`
    ).run(next.title, next.start_time, next.end_time, next.is_important, next.status, next.completed_at, todo.id);
    // 완료나 미기록으로 바꾸면 회고는 필요 없으니 지운다
    if (next.status === 'done' || next.status === 'todo') {
      db.prepare('DELETE FROM reflections WHERE todo_id = ?').run(todo.id);
    }
    res.json(db.prepare('SELECT * FROM todos WHERE id = ?').get(todo.id));
  } catch (err) {
    fail(res, err);
  }
});

// 한 번짜리 할 일은 진짜로 지운다.
// 루틴에서 만들어진 할 일은 지우면 다시 생기므로, 그 날만 'skipped'로 숨긴다.
app.delete('/api/todos/:id', (req, res) => {
  const todo = db.prepare('SELECT * FROM todos WHERE id = ?').get(req.params.id);
  if (!todo) return fail(res, new Error('할 일을 찾을 수 없어요'), 404);
  if (todo.routine_id === null) {
    db.prepare('DELETE FROM todos WHERE id = ?').run(todo.id);
  } else {
    db.prepare("UPDATE todos SET status = 'skipped' WHERE id = ?").run(todo.id);
    db.prepare('DELETE FROM reflections WHERE todo_id = ?').run(todo.id);
  }
  res.status(204).end();
});

// ── 회고 ─────────────────────────────────────────────────────

app.put('/api/todos/:id/reflection', (req, res) => {
  try {
    const todo = db.prepare('SELECT * FROM todos WHERE id = ?').get(req.params.id);
    if (!todo) return fail(res, new Error('할 일을 찾을 수 없어요'), 404);
    if (!['partial', 'missed'].includes(todo.status)) {
      throw new Error("회고는 '일부만'이나 '못 함' 항목에만 남길 수 있어요");
    }
    const text = (v) => (typeof v === 'string' && v.trim() ? v.trim().slice(0, 500) : null);
    let reasonId = req.body.reason_id ? Number(req.body.reason_id) : null;
    if (reasonId && !db.prepare('SELECT 1 FROM reasons WHERE id = ?').get(reasonId)) reasonId = null;
    db.prepare(
      `INSERT INTO reflections (todo_id, reason_id, reason_note, actual, next_action)
       VALUES (?, ?, ?, ?, ?)
       ON CONFLICT (todo_id) DO UPDATE SET
         reason_id = excluded.reason_id, reason_note = excluded.reason_note,
         actual = excluded.actual, next_action = excluded.next_action`
    ).run(todo.id, reasonId, text(req.body.reason_note), text(req.body.actual), text(req.body.next_action));
    res.json(db.prepare('SELECT * FROM reflections WHERE todo_id = ?').get(todo.id));
  } catch (err) {
    fail(res, err);
  }
});

// 기간 조회 (루틴 달성 기록용). 자동 생성은 하지 않고 있는 그대로만 읽는다.
app.get('/api/range', (req, res) => {
  const { from, to } = req.query;
  if (!DATE_RE.test(from || '') || !DATE_RE.test(to || '')) return fail(res, new Error('날짜 형식이 올바르지 않아요'));
  res.json(
    db.prepare('SELECT id, routine_id, date, status FROM todos WHERE date BETWEEN ? AND ? AND routine_id IS NOT NULL').all(from, to)
  );
});

app.get('/api/reasons', (req, res) => {
  res.json(db.prepare('SELECT * FROM reasons ORDER BY id').all());
});

// ── 루틴 ─────────────────────────────────────────────────────

// 루틴이 바뀌면, 내일 이후에 미리 만들어 둔 손대지 않은 할 일을 지워 새 내용으로 다시 생기게 한다.
// 오늘과 지난 기록은 그대로 둔다.
const clearFuture = db.prepare(
  "DELETE FROM todos WHERE routine_id = ? AND date > ? AND status = 'todo'"
);

app.get('/api/routines', (req, res) => {
  res.json(db.prepare('SELECT * FROM routines WHERE ended_on IS NULL ORDER BY start_time, id').all());
});

app.post('/api/routines', (req, res) => {
  try {
    const b = req.body;
    const title = cleanTitle(b.title);
    const start = cleanTime(b.start_time);
    const end = cleanTime(b.end_time);
    checkTimes(start, end, true);
    const info = db
      .prepare('INSERT INTO routines (title, start_time, end_time, repeat_days, is_important) VALUES (?, ?, ?, ?, ?)')
      .run(title, start, end, cleanDays(b.repeat_days), b.is_important ? 1 : 0);
    res.status(201).json(db.prepare('SELECT * FROM routines WHERE id = ?').get(info.lastInsertRowid));
  } catch (err) {
    fail(res, err);
  }
});

app.patch('/api/routines/:id', (req, res) => {
  try {
    const r = db.prepare('SELECT * FROM routines WHERE id = ? AND ended_on IS NULL').get(req.params.id);
    if (!r) return fail(res, new Error('루틴을 찾을 수 없어요'), 404);
    const b = req.body;
    const next = { ...r };
    if ('title' in b) next.title = cleanTitle(b.title);
    if ('start_time' in b) next.start_time = cleanTime(b.start_time);
    if ('end_time' in b) next.end_time = cleanTime(b.end_time);
    if ('repeat_days' in b) next.repeat_days = cleanDays(b.repeat_days);
    if ('is_important' in b) next.is_important = b.is_important ? 1 : 0;
    checkTimes(next.start_time, next.end_time, true);
    db.transaction(() => {
      db.prepare(
        'UPDATE routines SET title = ?, start_time = ?, end_time = ?, repeat_days = ?, is_important = ? WHERE id = ?'
      ).run(next.title, next.start_time, next.end_time, next.repeat_days, next.is_important, r.id);
      clearFuture.run(r.id, todayStr());
    })();
    res.json(db.prepare('SELECT * FROM routines WHERE id = ?').get(r.id));
  } catch (err) {
    fail(res, err);
  }
});

// 반복 종료: 오늘까지만 생기고 내일부터는 생기지 않는다. 오늘과 과거 기록·회고는 그대로 둔다.
app.post('/api/routines/:id/end', (req, res) => {
  const r = db.prepare('SELECT * FROM routines WHERE id = ? AND ended_on IS NULL').get(req.params.id);
  if (!r) return fail(res, new Error('루틴을 찾을 수 없어요'), 404);
  const today = todayStr();
  db.transaction(() => {
    db.prepare('UPDATE routines SET ended_on = ? WHERE id = ?').run(today, r.id);
    clearFuture.run(r.id, today);
  })();
  res.json(db.prepare('SELECT * FROM routines WHERE id = ?').get(r.id));
});

// 없는 API 주소
app.use('/api', (req, res) => res.status(404).json({ error: '없는 주소예요' }));

// 예상하지 못한 오류: 내부 정보(파일 경로, 코드 위치)는 숨기고 짧은 안내만 돌려준다
app.use((err, req, res, next) => {
  const status = err.status || err.statusCode || 500;
  if (status >= 500) console.error(err);
  res.status(status).json({ error: status === 400 ? '요청 형식이 올바르지 않아요' : status === 413 ? '요청이 너무 커요' : '서버에서 문제가 생겼어요' });
});

const PORT = Number(process.env.PORT) || 3000;
app.listen(PORT, HOST, () => {
  console.log(`루틴 플래너: http://localhost:${PORT}`);
});
