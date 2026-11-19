#!/usr/bin/env node
// SQLite backup / restore for the event server.
//   node scripts/db-backup.js backup  [dir]        online backup (safe while the server runs) -> dir/scamurai-<time>.db
//   node scripts/db-backup.js restore <file>       restore a backup (STOP the server first)
//   node scripts/db-backup.js verify  <file>       integrity check + row counts
// Env: DATA_DIR (default ./data), same as server.js. Backups contain personal data: keep them private.
'use strict';
const fs = require('fs');
const path = require('path');
const Database = require('better-sqlite3');

const DATA_DIR = process.env.DATA_DIR || path.join(__dirname, '..', 'data');
const LIVE = path.join(DATA_DIR, 'scamurai.db');

function verify(file) {
  const db = new Database(file, { readonly: true, fileMustExist: true });
  try {
    const ic = db.pragma('integrity_check', { simple: true });
    if (ic !== 'ok') throw new Error(`integrity_check failed: ${ic}`);
    const counts = {};
    for (const { name } of db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'").all())
      counts[name] = db.prepare(`SELECT COUNT(*) n FROM "${name}"`).get().n;
    if (!Object.keys(counts).length) throw new Error('backup has no tables');
    return counts;
  } finally { db.close(); }
}

async function backup(dir = path.join(DATA_DIR, 'backups')) {
  if (!fs.existsSync(LIVE)) throw new Error(`no database at ${LIVE}`);
  fs.mkdirSync(dir, { recursive: true, mode: 0o700 });
  const dest = path.join(dir, `scamurai-${new Date().toISOString().replace(/[:.]/g, '-')}.db`);
  const db = new Database(LIVE, { readonly: true, fileMustExist: true });
  try { await db.backup(dest); } finally { db.close(); }
  fs.chmodSync(dest, 0o600);
  return { file: dest, counts: verify(dest) };
}

function restore(file) {
  if (!file) throw new Error('usage: restore <backup-file>');
  const counts = verify(file);                       // refuse a bad backup before touching the live DB
  fs.mkdirSync(DATA_DIR, { recursive: true });
  let saved = null;
  if (fs.existsSync(LIVE)) {                         // keep what was there, never destroy it
    saved = `${LIVE}.before-restore-${Date.now()}`;
    fs.copyFileSync(LIVE, saved);
  }
  for (const ext of ['-wal', '-shm']) fs.rmSync(LIVE + ext, { force: true });
  const tmp = `${LIVE}.restoring`;
  fs.copyFileSync(file, tmp);
  fs.renameSync(tmp, LIVE);
  return { file: LIVE, previous: saved, counts: verify(LIVE) };
}

module.exports = { backup, restore, verify };

if (require.main === module) {
  const [cmd, arg] = process.argv.slice(2);
  Promise.resolve().then(() => cmd === 'backup' ? backup(arg) : cmd === 'restore' ? restore(arg) : cmd === 'verify' ? { file: arg, counts: verify(arg) } : Promise.reject(new Error('usage: db-backup.js backup [dir] | restore <file> | verify <file>')))
    .then(r => console.log(JSON.stringify(r, null, 2)))
    .catch(e => { console.error('ERROR:', e.message); process.exit(1); });
}
