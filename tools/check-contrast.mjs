#!/usr/bin/env node
/* Khelo contrast gate. Adapted from Ahimsa's: both aesthetics, every
   poster band at every gradient stop, every filled control, and the
   non-text 3:1 rule (WCAG 1.4.11). Loud color is allowed; unreadable
   color is not. */

import { readTokens } from './lib/css-tokens.mjs';
import { parseHex, over, contrast, gradientStops, resolve } from './lib/color.mjs';

const AA = 4.5, AA_LARGE = 3.0, NON_TEXT = 3.0;
const THEMES = ['mela', 'raat'];
const INK = ['--text-heading', '--text-body', '--text-secondary'];
const GROUNDS = ['--surface-canvas-flat', '--surface-elevated', '--surface-sunk'];
const WASHES = ['--wash-genda', '--wash-rani', '--wash-firozi', '--wash-tota', '--wash-mor', '--wash-haldi'];
const FILLS = [
  ['--on-primary', '--accent-primary', 'primary button'],
  ['--on-play', '--accent-play', 'play button'],
  ['--on-selected', '--selected-fill', 'selected tile and chip'],
];
const ACCENT_TEXT = ['--accent-secondary', '--accent-done', '--accent-note', '--accent-calm'];
const BANDS = ['genda', 'rani', 'firozi', 'mor'];

const rows = [], fails = [];
const check = (theme, a, b, ra, rb, floor, why) => {
  const r = contrast(over(ra, rb), rb);
  rows.push([theme, a, b, r, floor]);
  if (r < floor) fails.push(`${theme}  ${a} on ${b}  ${r.toFixed(2)}:1  needs ${floor}  (${why})`);
};

for (const theme of THEMES) {
  const t = readTokens(['src/tokens/shared.css', ...['palette', 'gradients', 'semantic', 'elevation'].map((n) => `src/tokens/${theme}/${n}.css`)]);
  const get = (n) => {
    const v = parseHex(resolve(t, t.get(n)));
    if (!v) { fails.push(`${theme}  ${n} does not resolve to a color`); return parseHex('#888888'); }
    return v;
  };

  for (const g of [...GROUNDS, ...WASHES]) for (const i of INK) check(theme, i, g, get(i), get(g), AA, 'text');
  for (const g of GROUNDS) check(theme, '--block-face', g, get('--block-face'), get(g), AA_LARGE, 'block-lettered display title');
  for (const g of GROUNDS) for (const a of ACCENT_TEXT) check(theme, a, g, get(a), get(g), AA, 'accent used as text: links, done, note');
  for (const [ink, fill, why] of FILLS) check(theme, ink, fill, get(ink), get(fill), AA, why);
  for (const g of [...GROUNDS, ...WASHES]) check(theme, '--border-control', g, get('--border-control'), get(g), NON_TEXT, 'control edge, 1.4.11');
  for (const g of GROUNDS) check(theme, '--focus-ring', g, get('--focus-ring'), get(g), NON_TEXT, 'focus ring, 1.4.11');

  for (const b of BANDS) {
    const ink = get(`--band-${b}-ink`);
    for (const stop of gradientStops(t.get(`--band-${b}`) || '')) {
      check(theme, `--band-${b}-ink`, `band-${b} @ ${stop}`, ink, parseHex(stop), AA, 'poster band');
    }
  }

  /* Inherited from Ahimsa: no pure black ground, no pure white ink. */
  const sum = (c) => c.r + c.g + c.b;
  for (const n of [...GROUNDS, ...INK]) {
    const c = get(n);
    if (sum(c) <= 12) fails.push(`${theme}  ${n} is effectively pure black`);
    if (sum(c) >= 750) fails.push(`${theme}  ${n} is effectively pure white`);
  }
}

if (process.argv.includes('--report')) {
  for (const [th, a, b, r, f] of rows) console.log(`${th.padEnd(6)}${a.padEnd(20)}${b.padEnd(32)}${r.toFixed(2).padStart(6)}  ${f}${r < f ? '  <-- FAIL' : ''}`);
  console.log('');
}
if (fails.length) {
  console.error(`FAIL — ${fails.length} contrast violation(s):`);
  for (const f of fails) console.error(`   ${f}`);
  process.exit(1);
}
console.log(`OK — ${rows.length} contrast pairs pass for Mela and Raat.`);
