#!/usr/bin/env node
// 명령줄(CLI) 입구. 웹 화면과 같은 로컬 SQLite 저장소(server/store/sqlite.js)를 그대로 쓴다.
// 사용: node todo.js list | add "<내용>" | done <번호> | summary
// DB 파일은 앱과 같이 todo.db, 연습용은 DB_FILE=demo.db 처럼 바꿔서 쓴다.
process.env.TZ = process.env.TZ || 'Asia/Seoul'; // 날짜 기준: 한국 시간
const store = require('./server/store/sqlite');

const pad = (n) => String(n).padStart(2, '0');
function todayStr() {
  const d = new Date();
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}
// '2026-10-30' → 1(월) … 7(일)
function weekdayOf(date) {
  const [y, m, d] = date.split('-').map(Number);
  const day = new Date(y, m - 1, d).getDay();
  return day === 0 ? 7 : day;
}

const MARK = { done: 'x', partial: '~', missed: '-', todo: ' ' };
function line(t) {
  const time = t.start_time ? `${t.start_time} ` : '';
  const star = t.is_important ? ' ★' : '';
  return `[${MARK[t.status] || ' '}] ${t.id}. ${time}${t.title}${star}`;
}

function fail(msg) {
  console.error(msg);
  process.exit(1);
}

const commands = {
  // 오늘 할 일 목록 (루틴 항목은 웹 화면에서 날짜를 열 때처럼 자동으로 만들어진다)
  async list() {
    const today = todayStr();
    const todos = await store.dayTodos(today, weekdayOf(today));
    console.log(`${today} 할 일 ${todos.length}개`);
    for (const t of todos) console.log(line(t));
  },

  // 오늘 날짜에 한 번짜리 할 일 추가
  async add(title) {
    title = (title || '').trim();
    if (!title) fail('사용법: node todo.js add "<내용>"');
    if (title.length > 100) fail('할 일 이름은 100자 이하로 적어 주세요');
    const t = await store.insertTodo({ title, date: todayStr(), start_time: null, end_time: null, is_important: false });
    console.log(`추가했어요: ${line(t)}`);
  },

  // 완료 처리. 웹 화면처럼 완료 시각을 남기고, 필요 없어진 회고는 지운다
  async done(idArg) {
    const id = Number(idArg);
    if (!Number.isInteger(id) || id < 1) fail('사용법: node todo.js done <번호>');
    const todo = await store.getTodo(id);
    if (!todo || todo.status === 'skipped') fail(`${id}번 할 일을 찾을 수 없어요`);
    const saved = await store.updateTodo(id, { ...todo, status: 'done', completed_at: new Date().toISOString() });
    await store.deleteReflection(id);
    console.log(`완료했어요: ${line(saved)}`);
  },

  // 오늘 날짜 할 일 중 완료한 것 요약
  async summary() {
    const today = todayStr();
    const todos = await store.dayTodos(today, weekdayOf(today));
    const done = todos.filter((t) => t.status === 'done');
    console.log(`${today} 완료 ${done.length}개 / 전체 ${todos.length}개`);
    for (const t of done) console.log(`- ${t.title}`);
  },
};

const [cmd, ...args] = process.argv.slice(2);
if (!commands[cmd]) {
  console.log('사용법: node todo.js <명령>');
  console.log('  list              오늘 할 일 목록');
  console.log('  add "<내용>"      오늘 할 일 추가');
  console.log('  done <번호>       완료 처리');
  console.log('  summary           오늘 완료 요약');
  process.exit(cmd ? 1 : 0);
}
commands[cmd](...args).catch((e) => fail(e.message));
