// 저장소 ① 로컬 SQLite (내 컴퓨터에서 실행할 때). Node 내장 node:sqlite를 쓴다.
const path = require('path');
const { DatabaseSync } = require('node:sqlite');

const DB_FILE = path.resolve(__dirname, '..', '..', process.env.DB_FILE || 'study-terms.db');

function open() {
  const db = new DatabaseSync(DB_FILE);
  db.exec(`
    CREATE TABLE IF NOT EXISTS sections (
      id    TEXT PRIMARY KEY,
      title TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS terms (
      id         TEXT PRIMARY KEY,
      section_id TEXT NOT NULL REFERENCES sections(id),
      position   INTEGER NOT NULL,
      term       TEXT NOT NULL,
      ko         TEXT NOT NULL,
      full_name  TEXT NOT NULL DEFAULT '',
      src        TEXT NOT NULL,
      level      TEXT NOT NULL DEFAULT '',
      def        TEXT NOT NULL,
      easy       TEXT NOT NULL DEFAULT '',
      ex         TEXT NOT NULL DEFAULT '',
      related    TEXT NOT NULL DEFAULT '[]'
    );
    CREATE TABLE IF NOT EXISTS notes (
      device_id  TEXT NOT NULL,
      term_id    TEXT NOT NULL REFERENCES terms(id),
      mine       TEXT NOT NULL DEFAULT '',
      status     INTEGER NOT NULL DEFAULT 0 CHECK (status IN (0, 1, 2)),
      updated_at TEXT NOT NULL DEFAULT (datetime('now')),
      PRIMARY KEY (device_id, term_id)
    );
  `);
  return db;
}

function createStore() {
  const db = open();
  return {
    mode: 'local',

    async syncCatalog({ sections, terms }) {
      const upSec = db.prepare('INSERT INTO sections (id, title) VALUES (?, ?) ON CONFLICT(id) DO UPDATE SET title = excluded.title');
      const upTerm = db.prepare(`
        INSERT INTO terms (id, section_id, position, term, ko, full_name, src, level, def, easy, ex, related)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(id) DO UPDATE SET section_id = excluded.section_id, position = excluded.position, term = excluded.term,
          ko = excluded.ko, full_name = excluded.full_name, src = excluded.src, level = excluded.level, def = excluded.def,
          easy = excluded.easy, ex = excluded.ex, related = excluded.related`);
      db.exec('BEGIN');
      try {
        for (const s of sections) upSec.run(s.id, s.title);
        for (const t of terms) {
          upTerm.run(t.id, t.section_id, t.position, t.term, t.ko, t.full_name, t.src, t.level, t.def, t.easy, t.ex, JSON.stringify(t.related));
        }
        db.exec('COMMIT');
      } catch (e) {
        db.exec('ROLLBACK');
        throw e;
      }
    },

    async listSections() {
      return db.prepare('SELECT id, title FROM sections ORDER BY id').all();
    },

    async listTerms() {
      return db.prepare('SELECT * FROM terms ORDER BY position').all().map((t) => ({ ...t, related: JSON.parse(t.related) }));
    },

    async termExists(id) {
      return !!db.prepare('SELECT 1 FROM terms WHERE id = ?').get(id);
    },

    async listNotes(deviceId) {
      return db.prepare('SELECT term_id, mine, status, updated_at FROM notes WHERE device_id = ?').all(deviceId);
    },

    async upsertNote(deviceId, termId, { mine, status }) {
      return db.prepare(`
        INSERT INTO notes (device_id, term_id, mine, status, updated_at) VALUES (?, ?, ?, ?, datetime('now'))
        ON CONFLICT(device_id, term_id) DO UPDATE SET mine = excluded.mine, status = excluded.status, updated_at = excluded.updated_at
        RETURNING term_id, mine, status, updated_at`).get(deviceId, termId, mine, status);
    },

    async deleteNote(deviceId, termId) {
      return db.prepare('DELETE FROM notes WHERE device_id = ? AND term_id = ?').run(deviceId, termId).changes > 0;
    },
  };
}

module.exports = { createStore };
