(() => {
'use strict';
const Q = [
 { q: 'What is the minimum contrast ratio for normal-size text at level AA?', o: ['3:1', '4.5:1', '7:1'], a: 1, e: 'AA needs 4.5:1 (3:1 for large text); 7:1 is AAA.' },
 { q: 'A clickable div has no keyboard access. What is the best fix?', o: ['Add tabindex="5"', 'Add aria-label to the div', 'Use a native button'], a: 2, e: 'A button brings focus, Enter, Space and its role for free (SC 2.1.1, 4.1.2).' },
 { q: 'A field is marked invalid only with a red border. Which criterion fails?', o: ['1.4.1 Use of Color', '2.4.7 Focus Visible', '3.1.1 Language of Page'], a: 0, e: 'Color must not be the only cue. Add error text and an icon.' },
 { q: 'How should "Added to cart" be announced without moving focus?', o: ['Set a title attribute', 'Put it in a role="status" region', 'Move focus to the message'], a: 1, e: 'A status region is read politely without stealing focus (SC 4.1.3).' },
 { q: 'Which text counts as "large" for contrast purposes?', o: ['16px regular', '18.66px bold or 24px regular', 'Any heading'], a: 1, e: 'Large means at least 24px regular or 18.66px bold, regardless of element type.' },
 { q: 'You close a modal dialog. Where should focus go?', o: ['The top of the page', 'Nowhere, it is lost', 'The control that opened it'], a: 2, e: 'Returning focus to the opener keeps keyboard users oriented.' }
];
const $ = id => document.getElementById(id), form = $('quizForm'), res = $('qres');
const esc = h => String(h).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const best = () => { try { return +localStorage.getItem('ilab:quizBest') || 0; } catch { return 0; } };
form.innerHTML = Q.map((x, i) => '<fieldset><legend>' + (i + 1) + '. ' + esc(x.q) + '</legend>'
  + x.o.map((o, j) => '<div class="field"><label><input type="radio" name="q' + i + '" value="' + j + '"> ' + esc(o) + '</label></div>').join('')
  + '<p class="fb" id="fb' + i + '"></p></fieldset>').join('');
$('qcheck').onclick = () => {
  let s = 0;
  Q.forEach((x, i) => {
    const r = form.querySelector('input[name=q' + i + ']:checked'), fb = $('fb' + i);
    if (!r) { fb.textContent = 'Not answered.'; return; }
    if (+r.value === x.a) { s++; fb.textContent = '\u2714 Correct. ' + x.e; } else fb.textContent = '\u2716 Not quite. ' + x.e;
  });
  const b = Math.max(s, best()); try { localStorage.setItem('ilab:quizBest', b); } catch { /* blocked */ }
  res.textContent = 'You scored ' + s + ' of ' + Q.length + '. Best score: ' + b + '.';
};
$('qreset').onclick = () => { form.reset(); Q.forEach((x, i) => $('fb' + i).textContent = ''); res.textContent = 'Quiz reset.'; };
})();
