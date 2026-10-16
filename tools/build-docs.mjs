#!/usr/bin/env node
/* Generate the Khelo documentation site into docs/. Edit this file, not the
   HTML it writes. */

import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { readTokens } from './lib/css-tokens.mjs';
import { parseHex, contrast, resolve } from './lib/color.mjs';

const VERSION = JSON.parse(readFileSync('package.json', 'utf8')).version;
const NAV = [
  ['index.html', 'Overview'],
  ['principles.html', 'Principles'],
  ['foundations.html', 'Foundations'],
  ['components.html', 'Components'],
  ['agents.html', 'For agents'],
];

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const tokens = (theme) => readTokens(['src/tokens/shared.css', ...['palette', 'gradients', 'semantic', 'elevation'].map((n) => `src/tokens/${theme}/${n}.css`)]);
const T = { mela: tokens('mela'), raat: tokens('raat') };
const val = (theme, n) => resolve(T[theme], T[theme].get(n));

/* Khelo's drawn icons, inlined so CSS reaches their fills. */
const ICONS = Object.fromEntries(readdirSync('src/icons').filter((f) => f.endsWith('.svg'))
  .map((f) => [f.replace('.svg', ''), readFileSync(`src/icons/${f}`, 'utf8').trim()]));
const icon = (name, cls = '') => {
  if (!ICONS[name]) throw new Error(`no icon: ${name}`);
  return cls ? ICONS[name].replace('class="kh-icon"', `class="kh-icon ${cls}"`) : ICONS[name];
};

function page({ file, title, lede, body }) {
  const nav = NAV.map(([href, label]) =>
    `<a class="kh-link kh-link--quiet" href="${href}"${href === file ? ' aria-current="page"' : ''}>${label}</a>`).join('\n      ');
  return `<!DOCTYPE html>
<html lang="en" class="khelo-mela">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<meta name="theme-color" content="#fbf0d9">
<meta name="color-scheme" content="light dark">
<title>${esc(title)} — Khelo Design System</title>
<meta name="description" content="${esc(lede)}">
<link rel="stylesheet" href="khelo.css">
<link rel="stylesheet" href="site.css">
</head>
<body class="kh-canvas">
<a class="kh-visually-hidden" href="#main">Skip to content</a>
<span class="kh-kangura" aria-hidden="true"></span>
<div class="site">
  <header class="site-head">
    <a class="site-mark kh-sign" href="index.html">Khelo <span lang="hi">खेलो</span></a>
    <nav class="site-nav" aria-label="Sections">
      ${nav}
    </nav>
    <div class="theme-switch" role="group" aria-label="Aesthetic">
      <button class="kh-chip" type="button" data-theme-btn="mela" aria-pressed="true">${icon('surya', 'kh-icon--s')} Mela</button>
      <button class="kh-chip" type="button" data-theme-btn="raat" aria-pressed="false">${icon('chand', 'kh-icon--s')} Raat</button>
    </div>
  </header>
  <main id="main">
${body}
  </main>
  <footer class="site-foot">
    <span class="kh-toran" aria-hidden="true"></span>
    <p class="kh-caption">Khelo Design System v${VERSION} · MIT · fonts under SIL OFL-1.1</p>
    <p class="kh-caption">No analytics. No cookies. Nothing here is loaded over a network, and nothing here wants you to stay.</p>
  </footer>
</div>
<script src="site.js"></script>
</body>
</html>
`;
}

const section = (id, kicker, heading, ...blocks) => `    <section class="sec" id="${id}">
      <p class="kh-caps">${esc(kicker)}</p>
      <h2 class="kh-h2">${heading}</h2>
${blocks.join('\n')}
    </section>`;
const p = (html, cls = 'kh-body') => `      <p class="${cls}">${html}</p>`;
const snippet = (code) => `      <div class="snippet"><pre tabindex="0"><code>${esc(code)}</code></pre><button class="kh-btn kh-btn--sm kh-btn--ghost snippet__copy" type="button" data-copy>Copy</button></div>`;
const spec = ({ label, demo, note, code }) => `      <div class="spec">
        <p class="kh-caps">${esc(label)}</p>
        <div class="spec__demo">${demo}</div>
${note ? `        <p class="kh-body kh-secondary">${note}</p>` : ''}
${code ? snippet(code) : ''}
      </div>`;

/* ------------------------------------------------------------------ */
/* Shared demo fragments                                               */
/* ------------------------------------------------------------------ */

const miniApp = (theme) => `<div class="khelo-${theme} mini kh-canvas">
          <span class="${theme === 'raat' ? 'kh-lights' : 'kh-toran'}" aria-hidden="true"></span>
          <div class="mini__body">
            <p class="kh-caps">${theme === 'raat' ? 'Khelo Raat · night' : 'Khelo Mela · day'}</p>
            <div class="mini__head">${icon(theme === 'raat' ? 'chand' : 'surya', 'kh-icon--l')}<p class="kh-poster mini__title">${theme === 'raat' ? 'Raat' : 'Mela'}</p></div>
            <p class="kh-body">${theme === 'raat' ? 'The fair after dark. Lamplight on neel.' : 'The fair by day. Sun on paper.'}</p>
            <div class="row">
              <button class="kh-btn" type="button">Let’s play</button>
              <button class="kh-btn kh-btn--ghost" type="button">Not now</button>
            </div>
            <div class="row">
              <span class="kh-sticker">नमस्ते</span>
              <span class="kh-sticker kh-sticker--firozi">Hello</span>
              <span class="kh-sticker kh-sticker--rani">Shabash!</span>
            </div>
          </div>
        </div>`;

const PRINCIPLES = [
  ['patang', 'Play is invited, never pulled.', 'Nothing animates on its own, nothing nudges, nothing says “come back”. Delight is something a person causes, by touching.'],
  ['genda', 'The reward is the thing itself.', 'No points, streaks, levels, badges, ranks or mystery boxes. If the activity is not worth doing without a score, a score will not fix it.'],
  ['chand', 'Things end.', 'Finite sets with the total in view, a real “that’s all” and no infinite feed. Stopping is rest, never framed as loss.'],
  ['kulhad', 'Mistakes are cheap and warm.', 'Undo is always there. No red, no shake, no buzzer. A wrong answer is something to look at, not a punishment.'],
  ['lattu', 'Motion answers a touch.', 'Like a lattu, it moves only when you set it going. A press squishes for a tenth of a second and settles. Every easing ends at rest; nothing bounces; reduced motion removes it all.'],
  ['morpankh', 'Color is celebration, not alarm.', 'Truck-art saturation lives on large, still surfaces. The ink you read stays calm and passes AA everywhere.'],
];

/* ------------------------------------------------------------------ */
/* index.html                                                          */
/* ------------------------------------------------------------------ */

const index = page({
  file: 'index.html',
  title: 'Overview',
  lede: 'Khelo is a design system for play, without compulsion. Loud surfaces, calm behavior.',
  body: `    <section class="hero">
      <div class="hero__copy">
        <span class="kh-sticker kh-sticker--rani" lang="hi">खेलो · let’s play</span>
        <h1 class="kh-poster hero__title">Khelo</h1>
        <p class="kh-lead">A design system for <strong>play</strong>, fun and ease, painted in the colors of Indian truck art and Bollywood posters. It refuses the compulsion machinery of gamified apps.</p>
        <div class="row">
          <a class="kh-btn kh-btn--lg" href="components.html">See it play</a>
          <a class="kh-btn kh-btn--lg kh-btn--ghost" href="principles.html">Read the rules</a>
        </div>
      </div>
      <div class="hero__art" aria-hidden="true">
        <div class="kh-panel tailgate">
          <div class="kh-panel__body">
            <div class="tailgate__eye">${icon('nazar', 'kh-icon--l')}</div>
            <div class="tailgate__row">${icon('kamal', 'kh-icon--xl')}<p class="kh-poster tailgate__title">Horn<br>OK<br>Please</p>${icon('kamal', 'kh-icon--xl')}</div>
            <span class="kh-bel" aria-hidden="true"></span>
            <p class="kh-sign tailgate__line" lang="hi">बुरी नज़र वाले तेरा मुँह काला</p>
          </div>
        </div>
      </div>
    </section>

${section('aesthetics', 'Two aesthetics', 'Mela by day, Raat by night',
  p('Same tokens, same components, same markup. Put <code>khelo-mela</code> or <code>khelo-raat</code> on <code>&lt;html&gt;</code>. With no stored choice, Khelo follows the operating system’s light or dark setting, live, until the person picks one.'),
  `      <div class="pair">
        ${miniApp('mela')}
        ${miniApp('raat')}
      </div>`)}

${section('strategy', 'The strategy', 'Loud surfaces, <em>calm behavior</em>',
  p('Most “playful” apps are loud in the wrong place. Their colors are polite, but their behavior shouts: streak counters, red badges, confetti on open, timers, a feed with no bottom. Khelo turns that around. The color, lettering and ornament are as loud as a painted truck on the Grand Trunk Road. The behavior is as quiet as Ahimsa.'),
  `      <div class="grid3">
        <div class="kh-card"><p class="kh-caps">Loud</p><h3 class="kh-h3">What you see</h3><p class="kh-body">Saturated truck-art hues, block-lettered titles, sticker shadows, temple borders, mango-leaf torans, string lights.</p></div>
        <div class="kh-card"><p class="kh-caps">Calm</p><h3 class="kh-h3">What it does</h3><p class="kh-body">Nothing moves unless pressed. Nothing appears unasked. Nothing counts you, ranks you or keeps you.</p></div>
        <div class="kh-card"><p class="kh-caps">Kind</p><h3 class="kh-h3">How it ends</h3><p class="kh-body">Every activity is finite, shows its total and finishes with a real ending you are glad to reach.</p></div>
      </div>`)}

${section('principles', 'Six rules', 'Play without the hook',
  `      <div class="grid3">
${PRINCIPLES.map(([g, h, b]) => `        <div class="kh-panel"><div class="kh-panel__body"><p class="principle__glyph">${icon(g, 'kh-icon--l')}</p><h3 class="kh-h3">${h}</h3><p class="kh-body kh-secondary">${b}</p></div></div>`).join('\n')}
      </div>`,
  `      <p><a class="kh-link" href="principles.html">The full list of what Khelo refuses →</a></p>`)}

${section('roots', 'Where it comes from', 'Painted trucks, poster halls, a city campaign',
  `      <div class="grid3">
        <div class="kh-band kh-band--genda"><h3 class="kh-h3">Truck art</h3><p class="kh-body">Hand-painted lorries of North India and Pakistan: temple borders, flowering vines, lotuses, peacocks and parrots, the evil-eye charm, and the tailgate’s cheerful “Horn OK Please”. Ornament as generosity.</p></div>
        <div class="kh-band kh-band--rani"><h3 class="kh-h3">Old Bollywood posters</h3><p class="kh-body">Hand-painted hoardings with block-lettered titles, the letters standing out from the wall on a painted extrusion. That is where Khelo’s block lettering comes from.</p></div>
        <div class="kh-band kh-band--mor"><h3 class="kh-h3">A street campaign</h3><p class="kh-body">The 2025 New York mayoral campaign of Zohran Mamdani: flat, confident color blocks, warm hand-made energy and many languages side by side. Khelo sets Hindi next to English as a peer.</p></div>
      </div>`)}
`,
});

/* ------------------------------------------------------------------ */
/* principles.html                                                     */
/* ------------------------------------------------------------------ */

const REFUSED = [
  ['Streaks', 'Turns a habit into a debt you pay daily, under threat of loss.', 'Show what was made, not how many days in a row.'],
  ['Points, XP, levels', 'Swaps the joy of the thing for a number that only goes up.', 'Let the thing itself be the reward: the drawing, the song, the solved puzzle.'],
  ['Leaderboards and ranks', 'Makes play into a comparison someone has to lose.', 'Play together. Show a group’s shared creation, not each person’s place in it.'],
  ['Mystery boxes and spins', 'Variable rewards are the slot-machine mechanism, the strongest hook there is.', 'Make outcomes predictable. Surprise belongs in the content, never in the payout.'],
  ['Lives, energy, hearts', 'Rations play to make waiting hurt, then sells the cure.', 'Let people play as long as they like, and make stopping easy.'],
  ['Countdown timers and FOMO', 'Artificial scarcity creates urgency that was never real.', 'Nothing expires to make you hurry. If there is a time limit, it belongs to the game and is stated up front.'],
  ['Infinite feeds and autoplay-next', 'Removes the natural stopping point on purpose.', 'Finite sets with the total visible, and a real ending: <code>.kh-end</code>.'],
  ['Push nudges and red badges', 'Reaches into someone’s day to pull them back.', 'Nothing appears unasked. News waits behind a control the person presses.'],
  ['Confetti on open, celebration loops', 'Rewards opening the app, not doing anything.', 'Delight follows a person’s own action, briefly, then settles.'],
  ['Loss framing and guilt copy', '“Don’t lose your progress!” “Your owl is sad.”', 'Say goodbye kindly. Progress is kept, not hostage.'],
];

const principles = page({
  file: 'principles.html',
  title: 'Principles',
  lede: 'The rules Khelo plays by, and the gamification patterns it refuses.',
  body: `    <section class="hero hero--slim">
      <div class="hero__copy">
        <span class="kh-sticker">the rules of the game</span>
        <h1 class="kh-poster">Play, <em>not</em> the hook.</h1>
        <p class="kh-lead">Gamification borrowed the look of play and the mechanics of the casino. Khelo keeps the first and refuses the second. These rules live in the docs, not in a gate: they are commitments a team makes, checked by people in review.</p>
      </div>
    </section>

${section('six', 'Six rules', 'What Khelo promises',
  `      <ol class="rules">
${PRINCIPLES.map(([g, h, b], i) => `        <li class="kh-card"><span class="rules__n kh-sign" aria-hidden="true">${i + 1}</span><div><h3 class="kh-h3">${h}</h3><p class="kh-body kh-secondary">${b}</p></div></li>`).join('\n')}
      </ol>`)}

${section('refused', 'Refused', 'Ten mechanics Khelo will not draw',
  p('Each is a known compulsion pattern. None of them has a component, a token or an icon in this system, and that is on purpose: if you need one, you are designing something other than play.'),
  `      <div class="refuse">
${REFUSED.map(([name, why, instead]) => `        <div class="refuse__row">
          <h3 class="kh-h3 refuse__name">${icon('cross', 'kh-icon--s')} ${name}</h3>
          <p class="kh-body"><strong>Why not:</strong> ${why}</p>
          <p class="kh-body"><strong>Instead:</strong> ${instead}</p>
        </div>`).join('\n')}
      </div>`)}

${section('test', 'The test', 'Would they be glad they stopped?',
  `      <div class="kh-band kh-band--firozi">
        <p class="kh-lead">Ahimsa asks: <em>did the person cause this, here, now?</em> Khelo adds a second question for every play loop: <strong>when someone puts this down, are they glad they played, and glad they stopped?</strong> If the honest answer to the second half is no, the design is pulling.</p>
      </div>`)}

${section('inherited', 'From Ahimsa', 'Laws carried over unchanged',
  `      <ul class="kh-body list">
        <li>No red. There is no danger token. A thing that needs a look is warm saffron and dashed, never alarm.</li>
        <li>Nothing appears unasked: no modal on load, no <code>role="alert"</code>, no autoplay, no <code>setInterval</code>. The attention gate runs here too.</li>
        <li>Components read semantic tokens only, so markup moves between Mela and Raat untouched.</li>
        <li>Corners stay rounded. Every easing ends at 1.0.</li>
        <li>Nothing is loaded over a network. The offline gate runs here too.</li>
        <li>No pure black, no pure white.</li>
      </ul>`)}
`,
});

/* ------------------------------------------------------------------ */
/* foundations.html                                                    */
/* ------------------------------------------------------------------ */

const HUES = [
  ['marigold', 'Genda', 'marigold', 'The garland. The primary sticker.'],
  ['haldi', 'Haldi', 'turmeric', 'Selection: what you picked.'],
  ['kesar', 'Kesar', 'saffron', 'A thing that needs a look. Never alarm.'],
  ['rani', 'Rani', 'hot pink', 'The loud voice: “let’s go”.'],
  ['firozi', 'Firozi', 'turquoise', 'Calm, cool panels.'],
  ['tota', 'Tota', 'parrot green', 'Done. Finished, not “winning”.'],
  ['mor', 'Mor', 'peacock blue', 'Links and focus.'],
];
const ink = (hex) => {
  const bg = parseHex(hex), d = parseHex('#2a1840'), l = parseHex('#fff9ee');
  return contrast(d, bg) >= contrast(l, bg) ? '#2a1840' : '#fff9ee';
};
const ramp = (theme, slug) => [100, 300, 500, 700].map((s) => {
  const h = val(theme, `--${slug}-${s}`);
  return `<div class="sw" style="background:${h};color:${ink(h)}"><span>${s}</span><code>${h}</code></div>`;
}).join('');
const neutrals = {
  mela: ['--paper-50', '--paper-100', '--paper-200', '--paper-300', '--kajal-300', '--kajal-500', '--kajal-700', '--kajal-900'],
  raat: ['--lamp-50', '--lamp-100', '--lamp-300', '--lamp-500', '--sky-700', '--sky-800', '--sky-900', '--sky-950'],
};
const neutralRow = (theme) => neutrals[theme].map((n) => {
  const h = val(theme, n);
  return `<div class="sw" style="background:${h};color:${ink(h)}"><span>${n.slice(2)}</span><code>${h}</code></div>`;
}).join('');

const foundations = page({
  file: 'foundations.html',
  title: 'Foundations',
  lede: 'Color, type, shadow, pattern and motion in Khelo.',
  body: `    <section class="hero hero--slim">
      <div class="hero__copy">
        <span class="kh-sticker kh-sticker--firozi">the paint box</span>
        <h1 class="kh-poster">Foundations</h1>
        <p class="kh-lead">Seven truck-art hues, two grounds, three faces, block lettering, drawn art, one kind of shadow, five borders and one motion.</p>
      </div>
    </section>

${section('color', 'Color', 'Seven hues, painted twice',
  p('Each hue has a Hindi name and a ramp. In <strong>Mela</strong>, 100 is a pale wash and 700 is a deep shade that holds text on paper. In <strong>Raat</strong> the ramp turns over: 100 is a dim wash for a night surface and 500 is the lamp-lit glow. Components never use a step directly; they read semantic tokens such as <code>--accent-primary</code> and <code>--wash-genda</code>.'),
  `      <div class="hues">
${HUES.map(([slug, name, en, role]) => `        <div class="hue">
          <div class="hue__name"><span class="kh-sign">${name}</span> <span class="kh-caption">${en} · <code>--${slug}-*</code></span><p class="kh-caption">${role}</p></div>
          <div class="hue__ramps">
            <div class="ramp khelo-mela" aria-label="${name}, Mela">${ramp('mela', slug)}</div>
            <div class="ramp khelo-raat" aria-label="${name}, Raat">${ramp('raat', slug)}</div>
          </div>
        </div>`).join('\n')}
        <div class="hue">
          <div class="hue__name"><span class="kh-sign">Grounds and ink</span><p class="kh-caption">Mela: paper and kajal (aubergine, not black). Raat: lamplight on neel sky (not white on black).</p></div>
          <div class="hue__ramps">
            <div class="ramp ramp--8">${neutralRow('mela')}</div>
            <div class="ramp ramp--8">${neutralRow('raat')}</div>
          </div>
        </div>
      </div>`,
  p('Every pair of ink and ground, every filled control and every poster band at every gradient stop is measured by <code>tools/check-contrast.mjs</code>. Loud is allowed. Unreadable is not.', 'kh-body kh-secondary'))}

${section('bands', 'Poster bands', 'Big fields of color, ink included',
  p('A band is a large, still poster surface that carries its own measured ink. Use one behind a headline or a short line, not behind long reading.'),
  `      <div class="grid2">
        <div class="kh-band kh-band--genda"><p class="kh-h2">Genda</p><p class="kh-body"><code>.kh-band--genda</code></p></div>
        <div class="kh-band kh-band--rani"><p class="kh-h2">Rani</p><p class="kh-body"><code>.kh-band--rani</code></p></div>
        <div class="kh-band kh-band--firozi"><p class="kh-h2">Firozi</p><p class="kh-body"><code>.kh-band--firozi</code></p></div>
        <div class="kh-band kh-band--mor"><p class="kh-h2">Mor</p><p class="kh-body"><code>.kh-band--mor</code></p></div>
      </div>`)}

${section('type', 'Type', 'The poster, the sign painter and the reader',
  `      <div class="type-specimen kh-card">
        <p class="kh-caps">Rozha One · display · <code>--font-display</code></p>
        <p class="kh-poster">Dil Se Khelo</p>
        <p class="kh-poster" lang="hi">दिल से खेलो</p>
        <p class="kh-body kh-secondary">A Bollywood-poster serif from the Indian Type Foundry. For a few words, large, in block lettering: a solid face on a painted extrusion that runs down and right (<code>--shadow-block</code>). Mela paints a kajal face on a marigold side with a burnt-saffron base; Raat lights the face and paints the side pink.</p>
      </div>
      <div class="type-specimen kh-card">
        <p class="kh-caps">Yatra One · lettering · <code>--font-sign</code></p>
        <p class="kh-h2 kh-sign">Horn OK Please · <span lang="hi">धीरे चलें</span></p>
        <p class="kh-body kh-secondary">A sign painter’s hand, for stickers, tile titles and labels. Short, and never for paragraphs.</p>
      </div>
      <div class="type-specimen kh-card">
        <p class="kh-caps">Baloo 2 · reading · <code>--font-body</code></p>
        <p class="kh-lead">Everything you actually read is set in Baloo 2: rounded, warm, Devanagari-native.</p>
        <p class="kh-lead" lang="hi">जो कुछ भी आप पढ़ते हैं, वह बालू में है — गोल, गरम, और देवनागरी में सहज।</p>
        <p class="kh-body kh-secondary">Hindi is set as a peer of English, never as a translation footnote. The scale is in rem, so a person’s own text size setting always wins.</p>
      </div>`)}

${section('illustration', 'Illustration', 'Draw it. Never an emoji.',
  p('An emoji is drawn by someone else’s platform. It looks different on every device and brings that platform’s voice into yours. Khelo’s art is drawn in one hand: a 48-unit grid, an ink outline that follows the text color, round joins, and flat fills from the seven hues. The motifs come from everyday Indian play and life.'),
  `      <div class="icons">
${['patang', 'lattu', 'kulhad', 'genda', 'kamal', 'morpankh', 'dhol', 'rangoli', 'nazar', 'chitthi', 'surya', 'chand'].map((n) => `        <figure class="kh-card kh-card--flat icon-cell">${icon(n, 'kh-icon--xl')}<figcaption class="kh-caption"><code>${n}</code></figcaption></figure>`).join('\n')}
      </div>`,
  p('Fills come from <code>--icon-genda</code>, <code>--icon-rani</code> and the rest, so the same file is painted by day and lamplit by night. Decorative art is <code>aria-hidden</code>; meaning lives in the words next to it. Drawing a new one? Keep the outline, keep the fills flat, keep it to two or three hues, and draw something a person in India would have played with or seen today.', 'kh-body kh-secondary'),
  snippet(`<svg class="kh-icon" viewBox="0 0 48 48" fill="none" stroke="currentColor"
     stroke-width="2.5" stroke-linejoin="round" aria-hidden="true">
  <path class="kh-f-rani"  d="M24 4 L40 22 H8 Z"/>
  <path class="kh-f-genda" d="M8 22 H40 L24 40 Z"/>
</svg>`))}

${section('shadow', 'Shadow', 'Stickers, not clouds',
  p('Khelo has one kind of shadow: a hard offset with no blur, like a sticker on a truck panel. A blurred shadow says “floating, look at me”. A sticker says “here, solid, yours”. In Raat a dark shadow would vanish on the sky, so the offset glows pink like neon on a wall.'),
  `      <div class="row row--gap">
        <div class="kh-card shadow-demo" style="box-shadow:var(--shadow-sticker-s)"><code>--shadow-sticker-s</code></div>
        <div class="kh-card shadow-demo" style="box-shadow:var(--shadow-sticker)"><code>--shadow-sticker</code></div>
        <div class="kh-card shadow-demo" style="box-shadow:var(--shadow-sticker-l)"><code>--shadow-sticker-l</code></div>
        <div class="kh-card shadow-demo" style="box-shadow:var(--shadow-pressed)"><code>--shadow-pressed</code></div>
      </div>`)}

${section('pattern', 'Ornament', 'Painted edges',
  p('Borders from Indian ornament, as static SVG inlined as tokens. They frame edges and fill empty grounds. They never sit behind body text, they never move, and they drop out in forced colors.'),
  `      <div class="patterns">
        <div class="kh-card"><span class="kh-kangura" aria-hidden="true"></span><p class="kh-body"><code>.kh-kangura</code> · the stepped temple border of a Kanjeevaram sari’s edge and a truck’s roofline</p></div>
        <div class="kh-card"><span class="kh-bel" aria-hidden="true"></span><p class="kh-body"><code>.kh-bel</code> · the flowering vine on a truck’s side panels</p></div>
        <div class="kh-card"><span class="kh-toran" aria-hidden="true"></span><p class="kh-body"><code>.kh-toran</code> · mango leaves and marigolds strung over a doorway</p></div>
        <div class="kh-card"><span class="kh-lights" aria-hidden="true"></span><p class="kh-body"><code>.kh-lights</code> · bulbs on a wire, made for Raat</p></div>
        <div class="kh-card kh-dots dots-demo"><p class="kh-body"><code>.kh-dots</code> · the grid a rangoli is drawn on</p></div>
      </div>`)}

${section('motion', 'Motion', 'The squish',
  p('Press any button on this page. It sinks into its shadow in 110ms and comes back when you let go. That is the whole motion vocabulary: it answers a touch, it is over before you notice it, and the curve ends at exactly 1.0. Nothing bounces, wobbles, pulses or loops. With reduced motion turned on, it simply doesn’t move.'),
  `      <div class="row row--gap">
        <button class="kh-btn kh-btn--lg" type="button">Press me</button>
        <button class="kh-btn kh-btn--lg kh-btn--play" type="button">And me</button>
      </div>`,
  snippet(`--ease-squish: cubic-bezier(0.25, 0.8, 0.3, 1);
--dur-press: 110ms;
--dur-settle: 220ms;`))}
`,
});

/* ------------------------------------------------------------------ */
/* components.html                                                     */
/* ------------------------------------------------------------------ */

const DOTS = 7;
const rangoli = `<div class="rangoli" data-rangoli>
          <div class="rangoli__palette" role="group" aria-label="Paint color">
            <button class="kh-chip" type="button" data-paint="genda" aria-pressed="true">Genda</button>
            <button class="kh-chip" type="button" data-paint="rani" aria-pressed="false">Rani</button>
            <button class="kh-chip" type="button" data-paint="firozi" aria-pressed="false">Firozi</button>
            <button class="kh-chip" type="button" data-paint="tota" aria-pressed="false">Tota</button>
          </div>
          <div class="rangoli__grid kh-dots" role="group" aria-label="Rangoli, ${DOTS} by ${DOTS}">
${Array.from({ length: DOTS * DOTS }, (_, i) => `            <button class="rangoli__dot" type="button" aria-label="Dot ${Math.floor(i / DOTS) + 1}, ${(i % DOTS) + 1}" aria-pressed="false"></button>`).join('\n')}
          </div>
          <div class="row"><button class="kh-btn kh-btn--sm kh-btn--ghost" type="button" data-rangoli-clear>Start again</button></div>
        </div>`;

const CARDS = ['आम · Mango', 'पतंग · Kite', 'चाय · Chai', 'मोर · Peacock', 'तारा · Star'];
const finite = `<div class="finite" data-finite data-total="${CARDS.length}">
          <div class="row"><ol class="kh-steps" aria-label="Progress">
${CARDS.map((_, i) => `            <li${i === 0 ? ' aria-current="step"' : ''}><span class="kh-visually-hidden">Word ${i + 1}</span></li>`).join('\n')}
          </ol><span class="kh-steps__label" data-finite-label>1 of ${CARDS.length}</span></div>
          <div class="finite__stage">
${CARDS.map((c, i) => `            <div class="kh-band kh-band--${['genda', 'rani', 'firozi', 'mor', 'genda'][i]} finite__card"${i ? ' hidden' : ''}><p class="kh-h2">${c}</p><p class="kh-body">Word ${i + 1} of ${CARDS.length}</p></div>`).join('\n')}
            <div class="kh-end" hidden data-finite-end>
              <p class="kh-end__mark">${icon('chand', 'kh-icon--xl')}</p>
              <h3 class="kh-h3">That’s all five.</h3>
              <p class="kh-body">Nice work. There’s no more today, and that’s the point.</p>
              <div class="row row--center"><button class="kh-btn kh-btn--ghost" type="button" data-finite-restart>Go through again</button></div>
            </div>
          </div>
          <div class="row"><button class="kh-btn" type="button" data-finite-next>Next</button></div>
        </div>`;

const components = page({
  file: 'components.html',
  title: 'Components',
  lede: 'Buttons, chips, tiles, stickers, cards, forms, notices and finite progress.',
  body: `    <section class="hero hero--slim">
      <div class="hero__copy">
        <span class="kh-sticker kh-sticker--tota">touch everything</span>
        <h1 class="kh-poster">Components</h1>
        <p class="kh-lead">Everything on this page is safe to press. Nothing here counts you.</p>
      </div>
    </section>

${section('buttons', 'Actions', 'Buttons are stickers',
  spec({
    label: 'Button',
    demo: `<div class="row row--gap"><button class="kh-btn" type="button">Let’s play</button><button class="kh-btn kh-btn--play" type="button">Shabash!</button><button class="kh-btn kh-btn--ghost" type="button">Maybe later</button><button class="kh-btn" type="button" disabled>Not yet</button></div>
        <div class="row row--gap"><button class="kh-btn kh-btn--sm" type="button">Small</button><button class="kh-btn kh-btn--lg" type="button">Large</button></div>`,
    note: 'Marigold is the primary action; rani is the one loud “go”. Use at most one rani button per view. Disabled goes dashed and flat, not grayed into invisibility.',
    code: `<button class="kh-btn">Let’s play</button>
<button class="kh-btn kh-btn--play">Shabash!</button>
<button class="kh-btn kh-btn--ghost">Maybe later</button>`,
  }),
  spec({
    label: 'Chip',
    demo: `<div class="row" role="group" aria-label="Pick a snack" data-chips><button class="kh-chip" type="button" aria-pressed="true">Samosa</button><button class="kh-chip" type="button" aria-pressed="false">Jalebi</button><button class="kh-chip" type="button" aria-pressed="false">Pani puri</button><button class="kh-chip" type="button" aria-pressed="false">Chai</button></div>`,
    note: 'A choice among a few. <code>aria-pressed</code> carries the state, and selection also thickens the outline, so it never relies on color alone.',
    code: '<button class="kh-chip" aria-pressed="true">Samosa</button>',
  }),
  spec({ label: 'Link', demo: `<p class="kh-body">Read <a class="kh-link" href="principles.html">the rules of the game</a> first.</p>`, code: '<a class="kh-link" href="…">the rules</a>' }))}

${section('tiles', 'Choosing', 'Tiles',
  spec({
    label: 'Tile',
    demo: `<div class="tiles" data-tiles>
          <button class="kh-tile" type="button" aria-pressed="false"><span class="kh-tile__glyph">${icon('patang')}</span><span class="kh-tile__title">Patang</span><span class="kh-tile__mark">Kites</span></button>
          <button class="kh-tile kh-tile--rani" type="button" aria-pressed="true"><span class="kh-tile__glyph">${icon('dhol')}</span><span class="kh-tile__title">Gaana</span><span class="kh-tile__mark">Songs</span></button>
          <button class="kh-tile kh-tile--firozi" type="button" aria-pressed="false"><span class="kh-tile__glyph">${icon('lattu')}</span><span class="kh-tile__title">Lattu</span><span class="kh-tile__mark">Spinning tops</span></button>
          <button class="kh-tile kh-tile--tota" type="button" aria-pressed="false"><span class="kh-tile__glyph">${icon('rangoli')}</span><span class="kh-tile__title">Rangoli</span><span class="kh-tile__mark">Patterns</span></button>
        </div>`,
    note: 'One big choice. A selected tile turns haldi yellow and gains a drawn check beside its label, so the state reads without color.',
    code: `<button class="kh-tile kh-tile--rani" aria-pressed="true">
  <span class="kh-tile__glyph"><svg class="kh-icon" …>…</svg></span>
  <span class="kh-tile__title">Gaana</span>
  <span class="kh-tile__mark">Songs</span>
</button>`,
  }))}

${section('surfaces', 'Surfaces', 'Cards, panels, bands and stickers',
  `      <div class="grid3">
        <div class="kh-card"><p class="kh-caps">.kh-card</p><h3 class="kh-h3">A sticker card</h3><p class="kh-body kh-secondary">Ink outline, hard shadow, big round corners.</p></div>
        <div class="kh-panel"><div class="kh-panel__body"><p class="kh-caps">.kh-panel</p><h3 class="kh-h3">A truck panel</h3><p class="kh-body kh-secondary">Framed top and bottom in the kangura temple border.</p></div></div>
        <div class="kh-band kh-band--rani"><p class="kh-caps">.kh-band--rani</p><h3 class="kh-h3">A poster band</h3><p class="kh-body">Carries its own measured ink.</p></div>
      </div>`,
  spec({
    label: 'Sticker',
    demo: '<div class="row row--gap"><span class="kh-sticker">Naya!</span><span class="kh-sticker kh-sticker--rani">Shabash</span><span class="kh-sticker kh-sticker--firozi">Thanda</span><span class="kh-sticker kh-sticker--tota">Ho gaya</span><span class="kh-sticker kh-sticker--mor" lang="hi">दोस्त</span></div>',
    note: 'A label slapped on at a slight angle. The tilt is fixed, never animated. Stickers name things. They never count things: there is no unread badge in Khelo.',
    code: '<span class="kh-sticker kh-sticker--rani">Shabash</span>',
  }))}

${section('forms', 'Input', 'Forms',
  `      <div class="grid2">
        <div class="kh-card">
          <div class="kh-field"><label class="kh-label" for="nm">Your name</label><input class="kh-input" id="nm" placeholder="Anything you like"><span class="kh-hint">Only shown to your friends.</span></div>
          <div class="kh-field" style="margin-top:var(--space-4)"><label class="kh-label" for="ans">What has keys but opens no locks?</label><input class="kh-input" id="ans" value="A door" aria-invalid="true" aria-describedby="ans-h"><span class="kh-hint" id="ans-h">Not quite. Have another go, or peek at the answer.</span></div>
        </div>
        <div class="kh-card">
          <label class="kh-switch"><input type="checkbox" checked> Sounds</label><br>
          <label class="kh-switch"><input type="checkbox"> Play with friends</label>
          <p class="kh-body kh-secondary">A wrong answer goes dashed saffron and says something kind. No red, no shake, no buzzer.</p>
        </div>
      </div>`)}

${section('feedback', 'Feedback', 'Notices that wait where you left them',
  `      <div class="stack">
        <div class="kh-notice kh-notice--done"><span class="kh-notice__glyph">${icon('genda')}</span><div><strong>Saved.</strong> Your rangoli is in your sketchbook.</div><div class="kh-notice__actions"><button class="kh-btn kh-btn--sm kh-btn--ghost" type="button">Undo</button></div></div>
        <div class="kh-notice"><span class="kh-notice__glyph">${icon('chitthi')}</span><div><strong>A new set of riddles is ready.</strong> Open it whenever you like. It will be here.</div></div>
        <div class="kh-notice kh-notice--note"><span class="kh-notice__glyph">${icon('kulhad')}</span><div><strong>That one didn’t save.</strong> Nothing is lost. Try again when you’re ready.</div><div class="kh-notice__actions"><button class="kh-btn kh-btn--sm" type="button">Try again</button></div></div>
      </div>`,
  p('Notices live in the page where the person caused them. They are never toasts, never modals and never announced assertively.', 'kh-body kh-secondary'))}

${section('finite', 'Finite play', 'Progress that ends',
  p('<code>.kh-steps</code> shows where you are in a <em>finite</em> set, with the total always in view. <code>.kh-end</code> is the ending: rest, not loss. Try it.'),
  `      <div class="kh-card">
        ${finite}
      </div>`,
  snippet(`<ol class="kh-steps" aria-label="Progress">
  <li data-done></li><li aria-current="step"></li><li></li>
</ol>
<span class="kh-steps__label">2 of 3</span>
<div class="kh-end">…That’s all…</div>`))}

${section('playground', 'Playground', 'A rangoli, for nothing',
  p('Tap dots to paint them. There is no score, no timer and no “share to unlock”. When it looks nice, you’re done.'),
  `      <div class="kh-card">
        ${rangoli}
      </div>`)}
`,
});

/* ------------------------------------------------------------------ */
/* agents.html and SKILL.md — one source, so the two never drift.      */
/* ------------------------------------------------------------------ */

const ICON_NAMES = Object.keys(ICONS).sort();

const SETUP = `khelo/
  dist/khelo.css        Mela + Raat, flattened, self-contained
  dist/CHECKSUMS        sha256, for a pinned vendored copy
  fonts/                6 woff2 + 3 OFL license texts — copy all of it
  src/icons/*.svg       the drawn icons — inline them, never <img>
  SKILL.md              this brief`;

const STARTER = `<!DOCTYPE html>
<html lang="en" class="khelo-mela">   <!-- or khelo-raat; follow the OS until chosen -->
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <link rel="stylesheet" href="khelo.css">
</head>
<body class="kh-canvas">
  <span class="kh-kangura" aria-hidden="true"></span>
  <main>
    <h1 class="kh-poster">Khelo</h1>
    <p class="kh-lead">Five riddles. Take your time.</p>
    <button class="kh-btn">Let’s play</button>
    <button class="kh-btn kh-btn--ghost">Not now</button>
  </main>
</body>
</html>`;

const TOKENS = `surfaces   --surface-canvas-flat  --surface-elevated  --surface-sunk  --gradient-canvas
text       --text-heading  --text-body  --text-secondary  --text-muted  --text-inverse
borders    --border-control  --border-soft  --focus-ring
accents    --accent-primary / --on-primary     --accent-play / --on-play
           --accent-secondary (links)  --accent-calm  --accent-done  --accent-note
           --selected-fill / --on-selected
washes     --wash-genda|rani|firozi|tota|mor|haldi
bands      --band-genda|rani|firozi|mor  with  --band-<name>-ink
lettering  --block-face  --block-side  --block-base  --shadow-block  --shadow-block-quiet
shadow     --shadow-sticker-s  --shadow-sticker  --shadow-sticker-l  --shadow-pressed
icons      --icon-genda|kesar|rani|firozi|tota|mor
patterns   --pattern-kangura|bel|toran|lights|dots
space      --space-1..9           radius  --radius-s|m|l|pill     stroke  --stroke  --stroke-bold
type       --font-display (Rozha One)  --font-sign (Yatra One)  --font-body (Baloo 2)
           --size-caption|body|lead|h3|h2|h1|poster  --leading-tight|body  --measure
motion     --ease-squish  --ease-settle  --dur-press  --dur-settle     target  --hit`;

const CLASSES = `page       .kh-canvas  .kh-visually-hidden
type       .kh-poster  .kh-block  .kh-h1  .kh-h2  .kh-h3  .kh-sign  .kh-lead  .kh-body
           .kh-secondary  .kh-caption  .kh-caps
actions    .kh-btn [--play --ghost --sm --lg]  .kh-chip (aria-pressed)  .kh-link [--quiet]
choosing   .kh-tile [--rani --firozi --tota --mor] (aria-pressed)
           .kh-tile__glyph  .kh-tile__title  .kh-tile__mark
surfaces   .kh-card [--flat]  .kh-panel  .kh-panel__body
           .kh-band--genda|rani|firozi|mor (with .kh-band)
           .kh-sticker [--rani --firozi --tota --mor]
forms      .kh-field  .kh-label  .kh-hint  .kh-input (aria-invalid)  .kh-switch
feedback   .kh-notice [--done --note]  .kh-notice__glyph  .kh-notice__actions
finite     .kh-steps (li[data-done], li[aria-current="step"])  .kh-steps__label
           .kh-end  .kh-end__mark
icons      .kh-icon [--s --l --xl]   fills: .kh-f-genda|kesar|rani|firozi|tota|mor
ornament   .kh-kangura [--down]  .kh-bel  .kh-toran  .kh-lights  .kh-dots`;

const RULES = [
  ['Emit nothing that appears on its own.', 'No modal on load, no toast, no banner, no push, no <code>alert()</code>, no <code>role="alert"</code>, no <code>aria-live="assertive"</code>, no <code>setInterval</code>, no autoplay, no <code>autofocus</code>. A notice sits in the page where the person caused it.'],
  ['Build no compulsion mechanics, even when asked.', 'No streaks, points, XP, levels, leaderboards, ranks, mystery boxes, spins, lives or energy, countdown timers, unread-count badges, confetti on open or “don’t lose your progress” copy. If a request needs one, say so instead of building it.'],
  ['Make it end.', 'Show a finite set with its total in view (<code>.kh-steps</code>) and finish with a real ending (<code>.kh-end</code>). No infinite scroll, no autoplay-next.'],
  ['No red, no punishment.', 'A wrong answer is <code>aria-invalid="true"</code> on <code>.kh-input</code> (dashed saffron) plus a kind hint and a way to try again. Offer undo after anything that changes something.'],
  ['No emoji, ever.', `Inline an icon from <code>src/icons/</code> (${ICON_NAMES.filter((n) => !['check', 'cross'].includes(n)).join(', ')}), <code>aria-hidden="true"</code>, with the meaning in the text beside it. If none fits, draw one in the same hand: 48-unit grid, 2.5 <code>currentColor</code> outline, round joins, flat <code>kh-f-*</code> fills, symmetric unless the object is not.`],
  ['Indian ornament, not party decoration.', 'Borders are kangura, bel, toran, lights or dots: decorative, <code>aria-hidden</code>, never behind text, never animated. No bunting, balloons, confetti or rainbow gradients.'],
  ['One block-lettered title per view.', '<code>.kh-poster</code> or <code>.kh-block</code>, a few words. Long reading is Baloo 2 on a plain surface, never on a band.'],
  ['Motion answers a press, and only a press.', 'The squish is built into the components. Add no keyframe animation, idle movement or looping effect. Every easing ends at 1.0, and reduced motion removes it.'],
  ['Reference semantic tokens only.', 'Never a palette step like <code>--rani-500</code>, so markup works unchanged in Mela and Raat.'],
  ['Every interactive element is a real element', 'with an accessible name, reachable by keyboard, at a 44px target. State lives in <code>aria-pressed</code> or <code>aria-current</code>, never in color alone.'],
  ['Never load anything over a network,', 'and never disable pinch zoom.'],
];

const VOICE = `Let’s play / Not now                 not  PLAY NOW!!
That’s all five. Nice work.          not  Come back tomorrow to keep your streak!
Not quite. Have another go.          not  Wrong! You lost a life.
A new set is ready whenever you are. not  Don’t miss out — 3 hours left!
Stopping here? Your rangoli is kept. not  Are you sure you want to quit?
Shabash!  (after something they did) not  Shabash! Tap to claim your reward`;

const VOICE_NOTE = 'Warm, plain and a little playful. Sentence case. An exclamation mark may cheer something the person just did; it never summons them. Hindi sits beside English as a peer, never as decoration.';

const agents = page({
  file: 'agents.html',
  title: 'For agents',
  lede: 'The short brief for an agent building with Khelo: what to load, the vocabulary, and the rules.',
  body: `    <section class="hero hero--slim">
      <div class="hero__copy">
        <span class="kh-sticker kh-sticker--mor">the short brief</span>
        <h1 class="kh-poster">For agents</h1>
        <p class="kh-lead">If you are an agent building an interface with Khelo, you need four things: what to load, the token and class vocabulary, the icons, and the rules you must not break. All of it is also in <code>SKILL.md</code>.</p>
      </div>
    </section>

${section('setup', 'Setup', 'What to load',
  snippet(SETUP),
  p('Link <code>khelo.css</code>, put <code>khelo-mela</code> or <code>khelo-raat</code> on <code>&lt;html&gt;</code>, and copy <code>fonts/</code> next to it. With no stored choice, use Raat when <code>prefers-color-scheme</code> is dark.'),
  snippet(STARTER))}

${section('tokens', 'Vocabulary', 'Tokens: semantics only',
  snippet(TOKENS),
  `      <div class="kh-card kh-card--flat">
        <p class="kh-caps">Three that will catch you out</p>
        <p class="kh-body"><code>--text-muted</code> is for rules, dots and idle marks. Never set type in it; use <code>--text-secondary</code>.</p>
        <p class="kh-body"><code>--border-control</code>, not <code>--border-soft</code>, for the edge of anything interactive.</p>
        <p class="kh-body" style="margin:0">On a band, use <code>.kh-band--&lt;name&gt;</code>, which brings its measured ink. Never put your own text color on a band.</p>
      </div>`)}

${section('classes', 'Vocabulary', 'The class list, complete',
  snippet(CLASSES),
  p('Variants are <code>--modifier</code>; state is an ARIA attribute. Anything not on this list does not exist. In particular there is no <code>.kh-badge</code>, <code>.kh-streak</code>, <code>.kh-score</code>, <code>.kh-toast</code> or <code>.kh-modal</code>, and there will not be.'))}

${section('icons', 'Art', 'Icons: inline the file',
  `      <div class="icons">
${ICON_NAMES.map((n) => `        <figure class="kh-card kh-card--flat icon-cell">${icon(n, 'kh-icon--l')}<figcaption class="kh-caption"><code>${n}</code></figcaption></figure>`).join('\n')}
      </div>`,
  snippet(`<!-- paste the contents of src/icons/patang.svg -->
<span class="kh-tile__glyph"><svg class="kh-icon" viewBox="0 0 48 48" …>…</svg></span>`))}

${section('rules', 'Constraints', 'Not negotiable',
  `      <ol class="agent-rules">
${RULES.map(([h, b]) => `        <li class="kh-body"><strong>${h}</strong> ${b}</li>`).join('\n')}
      </ol>`,
  p('If a requirement you have been given conflicts with one of these, say so rather than resolving it quietly. The conflict is usually the most useful thing you have found.'))}

${section('voice', 'Copy', 'Write it like this',
  snippet(VOICE),
  p(VOICE_NOTE))}
`,
});

const md = (html) => html.replace(/<code>(.*?)<\/code>/g, '`$1`').replace(/<[^>]+>/g, '')
  .replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&');
writeFileSync('SKILL.md', `---
name: khelo-design
description: Build a playful interface with the Khelo design system — Indian truck-art color, Bollywood block lettering and drawn icons, with no compulsion mechanics. Two aesthetics, Mela (day) and Raat (night). Use when generating UI for games, learning, hobbies or anything meant to be fun without being addictive.
---

<!-- Generated by tools/build-docs.mjs, alongside docs/agents.html. Edit there. -->

# Khelo Design System

A design system for play, fun and ease. **Loud surfaces, calm behavior**:
the color, lettering and ornament are as loud as a painted truck; the
behavior never pulls, counts or keeps anyone.

## Setup

\`\`\`
${SETUP}
\`\`\`

Link \`khelo.css\`, put \`khelo-mela\` or \`khelo-raat\` on \`<html>\`, copy
\`fonts/\`. With no stored choice, use Raat when \`prefers-color-scheme\` is
dark.

\`\`\`html
${STARTER}
\`\`\`

## Tokens

Reference semantics only, never a palette step.

\`\`\`
${TOKENS}
\`\`\`

- \`--text-muted\` is for rules, dots and idle marks. Never type; use \`--text-secondary\`.
- \`--border-control\`, not \`--border-soft\`, for the edge of anything interactive.
- On a band, use \`.kh-band--<name>\`, which brings its measured ink.

## Classes

\`\`\`
${CLASSES}
\`\`\`

Anything not on this list does not exist. There is no \`.kh-badge\`,
\`.kh-streak\`, \`.kh-score\`, \`.kh-toast\` or \`.kh-modal\`.

## Icons

Inline \`src/icons/<name>.svg\`: ${ICON_NAMES.map((n) => `\`${n}\``).join(', ')}.

## Hard constraints

${RULES.map(([h, b], i) => `${i + 1}. **${md(h)}** ${md(b)}`).join('\n')}

If a requirement conflicts with one of these, say so rather than resolving
it quietly.

Full documentation: <https://khelo-design.riverma.com>

## Voice

\`\`\`
${VOICE}
\`\`\`

${VOICE_NOTE}
`);
console.log('SKILL.md');

for (const [name, html] of Object.entries({ 'index.html': index, 'principles.html': principles, 'foundations.html': foundations, 'components.html': components, 'agents.html': agents })) {
  writeFileSync(`docs/${name}`, html);
  console.log(`docs/${name}`);
}
