(() => {
'use strict';
const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
const esc = h => String(h).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const store = {
  get(k, d) { try { const v = localStorage.getItem('ilab:' + k); return v === null ? d : JSON.parse(v); } catch { return d; } },
  set(k, v) { try { localStorage.setItem('ilab:' + k, JSON.stringify(v)); } catch { /* storage can be blocked */ } }
};
const live = $('#live');
const say = m => { live.textContent = ''; setTimeout(() => live.textContent = m, 60); };

/* Theme: saved choice, else OS preference */
const ts = $('#theme');
ts.value = store.get('theme', matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
const setTheme = () => { document.documentElement.dataset.theme = ts.value; store.set('theme', ts.value); };
setTheme(); ts.onchange = setTheme;

/* Router: hash selects a module, focus moves to its heading on change */
const mods = $$('[data-mod]'), links = $$('#nav a');
function route(focus) {
  const m = mods.find(x => x.id === location.hash.slice(1)) || mods[0];
  mods.forEach(x => x.hidden = x !== m);
  links.forEach(a => a.getAttribute('href') === '#' + m.id ? a.setAttribute('aria-current', 'page') : a.removeAttribute('aria-current'));
  const h = $('h2', m); document.title = h.textContent + ' · Reachable';
  if (focus) { h.focus(); scrollTo(0, 0); }
}
addEventListener('hashchange', () => route(true)); route(false);
$('.skip').onclick = e => { e.preventDefault(); $('#main').focus(); };

/* Dialog: native showModal() traps focus and handles Esc */
const dlg = $('#dlg'), op = $('#openDlg');
op.onclick = () => dlg.showModal(); $('#closeDlg').onclick = () => dlg.close(); dlg.addEventListener('close', () => op.focus());

/* Menu button (ARIA Authoring Practices pattern) */
const mb = $('#menubtn'), ml = $('#menulist'), mi = $$('[role=menuitem]', ml);
const openM = i => { ml.hidden = false; mb.setAttribute('aria-expanded', 'true'); mi[i].focus(); };
const closeM = f => { ml.hidden = true; mb.setAttribute('aria-expanded', 'false'); if (f) mb.focus(); };
mb.onclick = () => ml.hidden ? openM(0) : closeM(true);
mb.onkeydown = e => { if (e.key === 'ArrowDown') { e.preventDefault(); openM(0); } else if (e.key === 'ArrowUp') { e.preventDefault(); openM(mi.length - 1); } };
ml.onkeydown = e => {
  const i = mi.indexOf(document.activeElement); let n = -1;
  if (e.key === 'ArrowDown') n = (i + 1) % mi.length; else if (e.key === 'ArrowUp') n = (i - 1 + mi.length) % mi.length;
  else if (e.key === 'Home') n = 0; else if (e.key === 'End') n = mi.length - 1;
  else if (e.key === 'Escape') { closeM(true); return; } else if (e.key === 'Tab') { closeM(false); return; }
  if (n > -1) { e.preventDefault(); mi[n].focus(); }
};
mi.forEach(m => m.onclick = () => { closeM(true); say('Chose ' + m.textContent); });

/* Form: errors are text, tied to fields, and summarized with focus */
$('#frm').onsubmit = e => {
  e.preventDefault(); const errs = [];
  [['fname', 'Enter your name.'], ['femail', 'Enter an email address like name@example.com.']].forEach(([id, m]) => {
    const f = $('#' + id), er = $('#' + id + '-err');
    const ok = f.value.trim() && (id !== 'femail' || /^\S+@\S+\.\S+$/.test(f.value));
    f.setAttribute('aria-invalid', String(!ok)); er.textContent = ok ? '' : 'Error: ' + m; if (!ok) errs.push([id, m]);
  });
  const sum = $('#esum');
  if (errs.length) {
    sum.innerHTML = '<h4>' + errs.length + (errs.length > 1 ? ' problems' : ' problem') + ' to fix</h4><ul>' +
      errs.map(([id, m]) => '<li><a href="#' + id + '">' + esc(m) + '</a></li>').join('') + '</ul>';
    sum.hidden = false; sum.focus();
  } else { sum.hidden = true; say('Form sent.'); }
};
$('#esum').onclick = e => { if (e.target.tagName === 'A') { e.preventDefault(); $(e.target.getAttribute('href')).focus(); } };

/* Key log, plus the deliberate trap used by the Before sample */
const klog = $('#klog');
const nm = el => (el.getAttribute && el.getAttribute('aria-label')) || (el.labels && el.labels[0] && el.labels[0].textContent.trim()) || (el.textContent || '').trim().slice(0, 28);
document.addEventListener('keydown', e => {
  const el = document.activeElement, li = document.createElement('li');
  li.textContent = e.key + ' on <' + el.tagName.toLowerCase() + '>' + (el.getAttribute('role') ? ' role=' + el.getAttribute('role') : '') + ' "' + nm(el) + '"';
  klog.prepend(li); while (klog.children.length > 8) klog.lastChild.remove();
  if (el.classList && el.classList.contains('trap')) { if (e.key === 'Tab') e.preventDefault(); if (e.key === 'Escape') el.blur(); }
});

/* ---------- Contrast module ---------- */
const C = window.Contrast;
const TESTS = [['Normal text AA', 4.5], ['Large text AA', 3], ['UI component or graphic (SC 1.4.11)', 3], ['Normal text AAA', 7], ['Large text AAA', 4.5]];
function pair(a, b) {
  const pk = $('#' + a), tx = $('#' + b);
  pk.oninput = () => { tx.value = pk.value; upd(); };
  tx.oninput = () => { const n = C.norm(tx.value); if (n) { pk.value = n; upd(); } };
}
pair('fgc', 'fgh'); pair('bgc', 'bgh');
function upd() {
  const f = C.norm($('#fgh').value), b = C.norm($('#bgh').value); if (!f || !b) return;
  const r = C.ratio(f, b);
  $('#ratio').textContent = (Math.floor(r * 100) / 100).toFixed(2);
  $('#results').innerHTML = TESTS.map(([n, t]) => { const ok = r >= t;
    return '<li><span class="pf" style="color:var(--' + (ok ? 'ok' : 'bad') + ')">' + (ok ? '\u2714 Pass' : '\u2716 Fail') + '</span> ' + n + ' (needs ' + t + ':1)</li>'; }).join('');
  $('#pv').style.cssText = 'color:' + f + ';background:' + b;
}
upd();
$('#sugg').onclick = () => {
  const f = C.norm($('#fgh').value), b = C.norm($('#bgh').value);
  if (!f || !b) { $('#sugout').textContent = 'Enter two valid hex colors first.'; return; }
  const s = C.suggest(f, b, 4.5); $('#fgh').value = s; $('#fgc').value = s; upd(); $('#sugout').textContent = 'Text color set to ' + s + '.';
};
$('#swap').onclick = () => { const a = $('#fgh').value; $('#fgh').value = $('#bgh').value; $('#bgh').value = a;
  [['fgc', 'fgh'], ['bgc', 'bgh']].forEach(([p, t]) => { const n = C.norm($('#' + t).value); if (n) $('#' + p).value = n; }); upd(); };

/* ---------- Sample UI: Before demonstrates 13 failures, After fixes each ---------- */
const IMG = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='80' height='60'%3E%3Crect width='80' height='60' fill='%23c8a27a'/%3E%3C/svg%3E";
function sample(g, p) {
  const add = "document.getElementById('" + p + "st').textContent='Added to cart'";
  if (g) return '<div class="sm good"><header style="display:flex;justify-content:space-between;align-items:center"><h2>Sunrise Bakery</h2><button type="button" aria-label="Search">\uD83D\uDD0D</button></header>'
    + '<h3>Our loaves</h3><img src="' + IMG + '" alt="Sourdough loaf with a scored crust" width="80" height="60">'
    + '<p>Baked at dawn, sold out by noon. <a href="#" onclick="return false">Read our baking guide</a></p>'
    + '<button type="button" onclick="' + add + '">Add to cart</button> <span id="' + p + 'st" role="status"></span>'
    + '<form onsubmit="return false"><label for="' + p + 'e">Email</label><input id="' + p + 'e" type="email" aria-invalid="true" aria-describedby="' + p + 'ee" value="bob@"><span id="' + p + 'ee" class="er">\u26A0 Error: enter a full email address.</span></form>'
    + '<table><caption>Prices</caption><thead><tr><th scope="col">Loaf</th><th scope="col">Price</th></tr></thead><tbody><tr><td>Sourdough</td><td>$7</td></tr></tbody></table></div>';
  return '<div class="sm bad"><div class="hd"><h2>Sunrise Bakery</h2><button type="button">\uD83D\uDD0D</button></div>'
    + '<h5>Our loaves</h5><img src="' + IMG + '">'
    + '<p class="lc">Baked at dawn, sold out by noon. To learn more <a href="#" onclick="return false" tabindex="5">click here</a></p>'
    + '<div class="clk" onclick="' + add + '">Add to cart</div><span id="' + p + 'st"></span>'
    + '<form onsubmit="return false"><input class="redb" placeholder="Email" value="bob@"><br><br><input class="trap" value="Tab is trapped here. Press Esc to leave."></form>'
    + '<table><tr><td>Loaf</td><td>Price</td></tr><tr><td>Sourdough</td><td>$7</td></tr></table></div>';
}

/* Zoom stage */
const stage = $('#stage');
const renderStage = () => { const g = $('#ver').value === 'g'; stage.innerHTML = sample(g, g ? 'mg' : 'mb'); applyStage(); };
function applyStage() {
  const z = +$('#zoom').value; $('#zo').textContent = z + '%'; stage.style.fontSize = (16 * z / 100) + 'px';
  stage.style.width = $('#rf').checked ? '320px' : ''; stage.classList.toggle('sp', $('#sp').checked);
  stage.style.filter = $('#cb').value ? 'url(#' + $('#cb').value + ')' : '';
  const scroll = stage.scrollWidth > stage.parentElement.clientWidth + 1 || ($('#rf').checked && stage.scrollWidth > 322);
  $('#mres').textContent = (scroll ? 'Warning: content scrolls horizontally here, which fails reflow (SC 1.4.10) at 320px or 400% zoom.' : 'No horizontal scrolling detected.')
    + ($('#sp').checked ? ' Check for clipped or overlapping text.' : '');
}
['ver', 'zoom', 'rf', 'sp', 'cb'].forEach(id => $('#' + id).addEventListener(id === 'zoom' ? 'input' : 'change', id === 'ver' ? renderStage : applyStage));
renderStage();

/* ---------- Fix module: [title, SC, name, level, how to test, fix, before, after] ---------- */
const IS = [
['Low-contrast text', '1.4.3', 'Contrast (Minimum)', 'AA', 'Use the checker: #aaa on white is about 2.3:1.', 'Use at least 4.5:1 for normal text.', '<p style="color:#aaa">', '<p style="color:#444">'],
['Image without alt text', '1.1.1', 'Non-text Content', 'A', 'Inspect the img: no alt, so the file name may be read.', 'Describe meaningful images; alt="" for decorative ones.', '<img src="loaf.png">', '<img src="loaf.png" alt="Sourdough loaf">'],
['Clickable div', '2.1.1', 'Keyboard', 'A', 'Press Tab: the div never gets focus.', 'Use a native button.', '<div onclick="add()">Add</div>', '<button type="button" onclick="add()">Add</button>'],
['Placeholder-only field', '3.3.2', 'Labels or Instructions', 'A', 'Type: the hint vanishes and nothing names the field.', 'Add a visible label tied by for and id.', '<input placeholder="Email">', '<label for="e">Email</label><input id="e">'],
['Error shown by color only', '1.4.1', 'Use of Color', 'A', 'Apply the achromatopsia filter: only a red border remains.', 'Add error text and an icon; link with aria-describedby.', '<input class="redb">', '<input aria-invalid="true" aria-describedby="m"><span id="m">Error: ...</span>'],
['No visible focus indicator', '2.4.7', 'Focus Visible', 'AA', 'Tab through: you cannot see where focus is.', 'Never remove the outline without a replacement.', '*:focus{outline:none}', ':focus-visible{outline:3px solid #0a4fa3}'],
['Positive tabindex', '2.4.3', 'Focus Order', 'A', 'Tab: the link with tabindex=5 is reached out of order.', 'Use 0 or -1 only; follow DOM order.', '<a tabindex="5">', '<a href="#">'],
['Vague link text', '2.4.4', 'Link Purpose (In Context)', 'A', 'List links: "click here" says nothing.', 'Describe the destination in the link text.', '<a>click here</a>', '<a>Read our baking guide</a>'],
['Icon-only button without a name', '4.1.2', 'Name, Role, Value', 'A', 'The accessibility tree shows an empty name.', 'Add aria-label or visible text.', '<button>\uD83D\uDD0D</button>', '<button aria-label="Search">\uD83D\uDD0D</button>'],
['Table without headers', '1.3.1', 'Info and Relationships', 'A', 'Cells are read without column context.', 'Use th with scope, plus a caption.', '<td>Loaf</td>', '<th scope="col">Loaf</th>'],
['Fixed pixel width', '1.4.10', 'Reflow', 'AA', 'Tick 320px in Module 2: horizontal scroll appears.', 'Use max-width and relative units.', 'width:600px', 'max-width:100%'],
['Status not announced', '4.1.3', 'Status Messages', 'AA', 'Press Add to cart: nothing is spoken.', 'Put the message in a role="status" region.', '<span id="st"></span>', '<span id="st" role="status"></span>'],
['Keyboard trap', '2.1.2', 'No Keyboard Trap', 'A', 'Focus the last field and press Tab: focus never leaves.', 'Never intercept Tab without an exit.', 'onkeydown: Tab -> preventDefault', '(no handler)'],
['Missing page language', '3.1.1', 'Language of Page', 'A', 'A screen reader reads the page with the wrong accent.', 'Set lang on the html element.', '<html>', '<html lang="en">'],
['No page title', '2.4.2', 'Page Titled', 'A', 'Check the browser tab and what is announced on load.', 'Give every page a unique, descriptive title.', '<title></title>', '<title>Cart · Sunrise Bakery</title>'],
['No skip link', '2.4.1', 'Bypass Blocks', 'A', 'Press Tab once on load: you must cross every nav link first.', 'Add a first-focusable skip link to the main landmark.', '<body><nav>...</nav>', '<a href="#main">Skip to main content</a>'],
['Inputs without autocomplete', '1.3.5', 'Identify Input Purpose', 'AA', 'Inspect name, email and address fields for autocomplete tokens.', 'Add the matching autocomplete value.', '<input type="email">', '<input type="email" autocomplete="email">'],
['Visible label differs from accessible name', '2.5.3', 'Label in Name', 'A', 'Say "Click Search" to voice control: nothing happens.', 'Start the accessible name with the visible text.', '<button aria-label="Find">Search</button>', '<button>Search</button>'],
['Skipped heading level', '1.3.1', 'Info and Relationships', 'A', 'The headings list jumps from h2 to h5. Best practice unless structure is misrepresented.', 'Use levels that reflect the outline.', '<h2>..</h2><h5>..</h5>', '<h2>..</h2><h3>..</h3>'],
['Orientation locked', '1.3.4', 'Orientation', 'AA', 'Rotate your phone: the page refuses to rotate.', 'Support portrait and landscape unless essential.', '@media (orientation:portrait){body{display:none}}', '(no orientation lock)']];
$('#wb').innerHTML = sample(false, 'b'); $('#wa').innerHTML = sample(true, 'a');
$$('input[name=view]').forEach(r => r.onchange = () => { const v = $('input[name=view]:checked').value; $('#wb').hidden = v === 'a'; $('#wa').hidden = v === 'b'; });
let prog = store.get('issues', { found: [], fixed: [] });
$('#issues').innerHTML = IS.map((x, i) => '<article class="card"><h4>' + (i + 1) + '. ' + esc(x[0]) + '</h4><p>SC ' + x[1] + ' ' + x[2] + ' (Level ' + x[3] + ')</p>'
  + '<label><input type="checkbox" data-k="found" data-i="' + i + '"> Found<span class="sr">: ' + esc(x[0]) + '</span></label> '
  + '<label><input type="checkbox" data-k="fixed" data-i="' + i + '"> Fixed<span class="sr">: ' + esc(x[0]) + '</span></label>'
  + (i >= 13 && i !== 18 ? '<p class="note">Page-level issue: not shown in the sample, so check your own pages.</p>' : '') + '<details><summary>Test and fix</summary><p><strong>Test:</strong> ' + esc(x[4]) + '</p><p><strong>Fix:</strong> ' + esc(x[5]) + '</p>'
  + '<p>Before:</p><pre><code>' + esc(x[6]) + '</code></pre><p>After:</p><pre><code>' + esc(x[7]) + '</code></pre></details></article>').join('');
function paintProg() {
  $$('#issues input').forEach(c => c.checked = prog[c.dataset.k].includes(+c.dataset.i));
  $('#prog').textContent = prog.found.length + ' of ' + IS.length + ' issues found, ' + prog.fixed.length + ' fixed'; $('#pbar').max = IS.length; $('#pbar').value = prog.found.length;
}
$('#issues').addEventListener('change', e => {
  const c = e.target, a = prog[c.dataset.k], i = +c.dataset.i;
  if (c.checked) { if (!a.includes(i)) a.push(i); } else prog[c.dataset.k] = a.filter(v => v !== i);
  store.set('issues', prog); paintProg();
});
$('#rst').onclick = () => { prog = { found: [], fixed: [] }; store.set('issues', prog); paintProg(); say('Progress reset.'); };
paintProg();

/* ---------- Audit module ---------- */
const CK = [['Perceivable', '1.1.1', 'Non-text Content'], ['Perceivable', '1.3.1', 'Info and Relationships'], ['Perceivable', '1.4.1', 'Use of Color'], ['Perceivable', '1.4.3', 'Contrast (Minimum)'], ['Perceivable', '1.4.4', 'Resize Text'], ['Perceivable', '1.4.10', 'Reflow'], ['Perceivable', '1.4.11', 'Non-text Contrast'], ['Perceivable', '1.4.12', 'Text Spacing'],
['Operable', '2.1.1', 'Keyboard'], ['Operable', '2.1.2', 'No Keyboard Trap'], ['Operable', '2.4.3', 'Focus Order'], ['Operable', '2.4.4', 'Link Purpose (In Context)'], ['Operable', '2.4.7', 'Focus Visible'],
['Understandable', '3.1.1', 'Language of Page'], ['Understandable', '3.3.1', 'Error Identification'], ['Understandable', '3.3.2', 'Labels or Instructions'],
['Robust', '4.1.2', 'Name, Role, Value'], ['Robust', '4.1.3', 'Status Messages'],
['Operable', '2.4.1', 'Bypass Blocks'], ['Operable', '2.4.2', 'Page Titled'], ['Perceivable', '1.3.5', 'Identify Input Purpose'], ['Operable', '2.5.3', 'Label in Name'], ['Operable', '2.4.11', 'Focus Not Obscured (Minimum)'], ['Operable', '2.5.8', 'Target Size (Minimum)'], ['Understandable', '3.3.8', 'Accessible Authentication (Minimum)']];
const PR = ['Perceivable', 'Operable', 'Understandable', 'Robust'];
let ck = store.get('audit', {});
$('#chk').innerHTML = PR.map(P => '<h3>' + P + '</h3>' + CK.map((c, i) => c[0] !== P ? '' :
  '<fieldset><legend>SC ' + c[1] + ' ' + c[2] + '</legend>' + [['pass', 'Pass'], ['fail', 'Fail'], ['na', 'Not applicable']].map(([v, l]) =>
    '<label><input type="radio" name="c' + i + '" value="' + v + '"' + (ck[i] && ck[i].v === v ? ' checked' : '') + '> ' + l + '</label> ').join('')
  + '<div class="field"><label for="n' + i + '">Notes for SC ' + c[1] + '</label><input type="text" id="n' + i + '" style="width:100%" value="' + esc(ck[i] ? ck[i].n || '' : '') + '"></div></fieldset>').join('')).join('');
$('#chk').addEventListener('input', () => {
  ck = {}; CK.forEach((c, i) => { const r = $('input[name=c' + i + ']:checked'); ck[i] = { v: r ? r.value : '', n: $('#n' + i).value }; }); store.set('audit', ck);
});
$('#target').value = store.get('target', ''); $('#target').addEventListener('input', e => store.set('target', e.target.value));
function report() {
  const L = ['# Reachable audit report', '', 'Page audited: ' + ($('#target').value.trim() || '(not specified)'), 'Generated: ' + new Date().toLocaleString(), '']; const fails = [];
  PR.forEach(P => {
    let p = 0, f = 0, na = 0, u = 0;
    CK.forEach((c, i) => { if (c[0] !== P) return; const v = ($('input[name=c' + i + ']:checked') || {}).value;
      if (v === 'pass') p++; else if (v === 'fail') { f++; fails.push('SC ' + c[1] + ' ' + c[2] + ': ' + ($('#n' + i).value || '(no notes)')); } else if (v === 'na') na++; else u++; });
    L.push('- **' + P + ':** ' + p + ' pass, ' + f + ' fail, ' + na + ' n/a, ' + u + ' not rated' + (p + f ? ' (pass rate ' + Math.round(100 * p / (p + f)) + '% of rated items)' : ''));
  });
  L.push('', '## Failed items', ...(fails.length ? fails.map(x => '- ' + x) : ['None recorded']), '', '_Automated tools catch only some issues; confirm with manual and assistive technology tests._');
  return L.join('\n');
}
const show = () => { const r = $('#rep'); r.textContent = report(); return r.textContent; };
$('#gen').onclick = () => { show(); $('#rep').focus(); };
$('#cpy').onclick = async () => { const t = show(); try { await navigator.clipboard.writeText(t); say('Report copied.'); } catch { say('Copy was blocked. Select the report text and copy it manually.'); } };
$('#dl').onclick = () => { const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([show()], { type: 'text/markdown' })); a.download = 'a11y-audit.md'; a.click(); URL.revokeObjectURL(a.href); say('Report downloaded.'); };
$('#prt').onclick = () => { show(); print(); };

/* ---------- My results: a hand-in summary for learners ---------- */
const QTOTAL = 6;
function resultsText() {
  const p = store.get('issues', { found: [], fixed: [] }), a = store.get('audit', {}), q = store.get('quizBest', 0);
  const rated = Object.values(a).filter(x => x && x.v).length, name = $('#rname').value.trim() || '(no name)', note = $('#rnote').value.trim();
  return ['# Reachable workshop results', '', 'Name: ' + name, 'Date: ' + new Date().toLocaleDateString(), '',
    '- **Fix the UI:** ' + p.found.length + ' of ' + IS.length + ' issues found, ' + p.fixed.length + ' fixed',
    '- **Quick quiz:** best score ' + q + ' of ' + QTOTAL,
    '- **Audit:** ' + rated + ' of ' + CK.length + ' criteria rated', '',
    '## My takeaway', note || '(not written yet)'].join('\n');
}
const refreshR = () => { $('#rtext').textContent = resultsText(); };
$('#rname').value = store.get('rname', ''); $('#rnote').value = store.get('rnote', '');
['rname', 'rnote'].forEach(id => $('#' + id).addEventListener('input', e => { store.set(id, e.target.value); refreshR(); }));
addEventListener('hashchange', refreshR); refreshR();
$('#rcopy').onclick = async () => { try { await navigator.clipboard.writeText(resultsText()); $('#rmsg').textContent = 'Summary copied.'; } catch { $('#rmsg').textContent = 'Copy failed. Select the text above and copy it by hand.'; } };
$('#rdl').onclick = () => { const u = URL.createObjectURL(new Blob([resultsText()], { type: 'text/markdown' })), l = document.createElement('a');
  l.href = u; l.download = 'reachable-results.md'; l.click(); URL.revokeObjectURL(u); $('#rmsg').textContent = 'Download started.'; };
$('#rprt').onclick = () => print();
})();
