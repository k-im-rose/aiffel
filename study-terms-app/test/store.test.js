// 저장소 시험: 로그인할 때 기기 기록을 계정으로 옮기기, 로그인 추가 전 DB 옮기기
const test = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const path = require('path');
const { DatabaseSync } = require('node:sqlite');

process.env.DB_FILE = 'test-store.db';
const dbPath = path.resolve(__dirname, '..', process.env.DB_FILE);
fs.rmSync(dbPath, { force: true });

// 로그인 추가 전 모양(device_id 칸)의 DB를 먼저 만들어 둔다
const old = new DatabaseSync(dbPath);
old.exec(`CREATE TABLE notes (device_id TEXT NOT NULL, term_id TEXT NOT NULL, mine TEXT NOT NULL DEFAULT '',
  status INTEGER NOT NULL DEFAULT 0, updated_at TEXT NOT NULL DEFAULT (datetime('now')), PRIMARY KEY (device_id, term_id));
  INSERT INTO notes (device_id, term_id, mine, status) VALUES ('11111111-1111-4111-8111-111111111111', 'mcp', '옛 기록', 1);`);
old.close();

const { createStore } = require('../server/store/sqlite');
const { buildCatalog } = require('../server/terms');
const store = createStore();
const DEV = 'device:11111111-1111-4111-8111-111111111111';
const USER = 'user:33333333-3333-4333-8333-333333333333';

test.before(() => store.syncCatalog(buildCatalog()));
test.after(() => fs.rmSync(dbPath, { force: true }));

test('옛 DB의 기록은 device: 주인으로 옮겨짐', async () => {
  const notes = await store.listNotes(DEV);
  assert.deepEqual(notes.map((n) => [n.term_id, n.mine]), [['mcp', '옛 기록']]);
});

test('로그인하면 기기 기록이 계정으로 옮겨지고, 계정에 있던 용어는 계정 쪽이 남음', async () => {
  await store.upsertNote(USER, 'mcp', { mine: '계정 기록', status: 2 });
  await store.upsertNote(DEV, 'api', { mine: '기기 기록', status: 1 });
  const moved = await store.mergeNotes(DEV, USER);
  assert.equal(moved, 1);
  const mine = (await store.listNotes(USER)).map((n) => [n.term_id, n.mine]).sort();
  assert.deepEqual(mine, [['api', '기기 기록'], ['mcp', '계정 기록']]);
  assert.deepEqual(await store.listNotes(DEV), []);
});
