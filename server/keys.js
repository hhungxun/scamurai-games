'use strict';
// Loads the private answer key (never served, never committed). Build it with: node scripts/build-keys.js
const fs = require('fs');
const path = require('path');

function loadKeys(file = process.env.KEYS_FILE || path.join(__dirname, 'private', 'keys.json')) {
  let raw;
  try { raw = fs.readFileSync(file, 'utf8'); }
  catch { return null; }
  const k = JSON.parse(raw);
  if (!k || k.version !== 1 || !k.games) throw new Error(`Bad keys file: ${file}`);
  return k;
}
module.exports = { loadKeys };
