/* WCAG 2.x contrast math. Works in the browser (window.Contrast) and in Node (require). */
(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api; else root.Contrast = api;
})(this, function () {
  const norm = h => {
    h = String(h).trim();
    if (/^#[0-9a-f]{3}$/i.test(h)) h = '#' + [...h.slice(1)].map(c => c + c).join('');
    return /^#[0-9a-f]{6}$/i.test(h) ? h.toLowerCase() : null;
  };
  const lum = h => {
    const c = [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16) / 255)
      .map(v => v <= 0.04045 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4));
    return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
  };
  const ratio = (a, b) => { const x = lum(a), y = lum(b); return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05); };
  const mix = (h, t, p) => '#' + [1, 3, 5].map(i =>
    Math.round(parseInt(h.slice(i, i + 2), 16) * (1 - p) + t * p).toString(16).padStart(2, '0')).join('');
  /* Blend toward black or white until the target is met; keeps the hue. */
  const suggest = (fg, bg, target) => {
    if (ratio(fg, bg) >= target) return fg;
    const to = lum(bg) > 0.179 ? 0 : 255;
    for (let k = 1; k <= 100; k++) { const c = mix(fg, to, k / 100); if (ratio(c, bg) >= target) return c; }
    return to ? '#ffffff' : '#000000';
  };
  return { norm, lum, ratio, mix, suggest };
});
