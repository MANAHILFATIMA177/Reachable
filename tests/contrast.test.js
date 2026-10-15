const assert = require('assert');
const C = require('../js/contrast.js');
assert.strictEqual(C.ratio('#000000', '#ffffff').toFixed(2), '21.00');
assert.ok(C.ratio('#767676', '#ffffff') >= 4.5);
assert.ok(C.ratio('#777777', '#ffffff') < 4.5);
assert.ok(C.ratio(C.suggest('#aaaaaa', '#ffffff', 4.5), '#ffffff') >= 4.5);
assert.strictEqual(C.norm('#FFF'), '#ffffff');
console.log('contrast tests passed');
/* More edge cases */
assert.strictEqual(C.norm('nope'), null);
assert.strictEqual(C.norm('#12345'), null);
assert.strictEqual(C.ratio('#123456', '#fedcba').toFixed(4), C.ratio('#fedcba', '#123456').toFixed(4));
assert.strictEqual(C.ratio('#ffffff', '#ffffff').toFixed(2), '1.00');
const dark = C.suggest('#555555', '#000000', 4.5);
assert.ok(C.ratio(dark, '#000000') >= 4.5, 'suggest works on dark backgrounds');
assert.strictEqual(C.suggest('#000000', '#ffffff', 4.5), '#000000', 'passing colors are unchanged');
const tint = C.suggest('#ff9999', '#ffffff', 4.5);
assert.ok(parseInt(tint.slice(1, 3), 16) > parseInt(tint.slice(3, 5), 16), 'hue is kept (still reddish)');
console.log('contrast edge cases passed');
