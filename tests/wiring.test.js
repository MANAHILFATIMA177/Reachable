/* Catches the most common breakage: JS looks up an id the HTML no longer has. */
const fs = require('fs'), assert = require('assert');
const html = fs.readFileSync(__dirname + '/../index.html', 'utf8');
const js = fs.readFileSync(__dirname + '/../js/app.js', 'utf8') + fs.readFileSync(__dirname + '/../js/quiz.js', 'utf8');
const ids = new Set([...html.matchAll(/\bid="([^"]+)"/g)].map(m => m[1]));
const used = new Set([...js.matchAll(/\$\('#([A-Za-z][\w-]*)'\)/g)].map(m => m[1]));
const missing = [...used].filter(i => !ids.has(i));
// Ids that scripts create themselves at runtime are allowed to be absent from the HTML.
const runtime = new Set(['fgh', 'bgh']);
const real = missing.filter(i => !runtime.has(i));
assert.deepStrictEqual(real, [], 'ids used in JS but missing from index.html: ' + real.join(', '));
assert.ok(/<html[^>]*\blang="/.test(html), 'html needs a lang attribute');
assert.ok(/<title>[^<]+<\/title>/.test(html), 'page needs a title');
assert.ok(/class="skip"/.test(html), 'skip link present');
console.log('wiring tests passed (' + used.size + ' ids checked)');
