# Khelo Design System

*Khelo* (खेलो) is Hindi for "play". It is a design system for play, fun and
ease.

Documentation: <https://khelo-design.riverma.com>

**Loud surfaces, calm behavior.** The color, lettering and ornament come from
Indian truck art and Bollywood posters, with the bold, multilingual, color-block
energy of a street campaign. The behavior keeps Ahimsa's calm: nothing moves
unless pressed, nothing appears unasked, and nothing counts, ranks or keeps you.

| Aesthetic | Class | Feel |
|---|---|---|
| Khelo Mela | `khelo-mela` | The fair by day: truck-art color on cream paper, kajal ink |
| Khelo Raat | `khelo-raat` | The fair by night: lamplit color on a deep neel sky |

With no stored choice, follow the operating system's light or dark setting.

## Use

```html
<html lang="en" class="khelo-mela">
<link rel="stylesheet" href="dist/khelo.css">
<button class="kh-btn">Let's play</button>
```

## Work on it

```bash
npm run build   # dist/khelo.css, docs/khelo.css, docs/fonts/, docs/*.html
npm run check   # contrast · attention · offline
npm run serve   # http://127.0.0.1:8174
```

Fonts: Rozha One, Yatra One and Baloo 2, all SIL OFL-1.1, self-hosted with
Latin and Devanagari subsets.

## For agents

`SKILL.md` is the short brief: what to load, the vocabulary and the rules.
The same brief is at `docs/agents.html`.

## Art

No emoji. Khelo ships drawn icons in `src/icons/` (kite, top, kulhad,
marigold, lotus, peacock feather, dhol, rangoli and more): a 48-unit grid,
an ink outline that follows the text color, flat fills from the palette.
Inline them so `src/components/icons.css` can paint them for Mela or Raat,
and draw new ones in the same hand.
