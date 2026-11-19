// Proves a backup taken from a live (WAL) database restores to identical data, and that a bad backup is refused.
'use strict';
const fs = require('fs'), os = require('os'), path = require('path'), assert = require('assert');
const Database = require('better-sqlite3');
const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'scamurai-bk-'));
process.env.DATA_DIR = dir;
const { backup, restore, verify } = require('../scripts/db-backup.js');

(async () => {
  const live = path.join(dir, 'scamurai.db');
  const db = new Database(live); db.pragma('journal_mode = WAL');
  db.exec('CREATE TABLE rounds(id TEXT PRIMARY KEY, score REAL); CREATE TABLE participants(id TEXT PRIMARY KEY, name TEXT)');
  for (let i = 0; i < 50; i++) db.prepare('INSERT INTO rounds VALUES(?,?)').run('r' + i, i * 2);
  db.prepare('INSERT INTO participants VALUES(?,?)').run('p1', 'Ada');
  const before = db.prepare('SELECT * FROM rounds ORDER BY id').all();

  const b = await backup(path.join(dir, 'bk'));            // taken while the DB is open and has un-checkpointed WAL data
  assert.deepStrictEqual(b.counts, { rounds: 50, participants: 1 });
  assert.strictEqual(fs.statSync(b.file).mode & 0o077, 0, 'backup must not be group/world readable');

  db.exec('DELETE FROM rounds; DROP TABLE participants'); db.close();   // disaster
  const r = restore(b.file);
  assert.ok(r.previous && fs.existsSync(r.previous), 'previous DB kept');
  const back = new Database(live, { readonly: true });
  assert.deepStrictEqual(back.prepare('SELECT * FROM rounds ORDER BY id').all(), before);
  assert.strictEqual(back.prepare('SELECT name FROM participants').get().name, 'Ada');
  back.close();

  const bad = path.join(dir, 'bad.db'); fs.writeFileSync(bad, 'not a database');
  assert.throws(() => restore(bad)); assert.throws(() => verify(bad));
  const still = new Database(live, { readonly: true });
  assert.strictEqual(still.prepare('SELECT COUNT(*) n FROM rounds').get().n, 50, 'live DB untouched by a refused restore');
  still.close();
  fs.rmSync(dir, { recursive: true, force: true });
  console.log('backup/restore: all checks passed');
})().catch(e => { console.error(e); process.exit(1); });
