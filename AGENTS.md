# Working in Khelo

A design system for play: tokens, a framework-free CSS component layer, drawn
icons and a documentation site. No runtime dependencies, and it must keep none.
The site is served by GitHub Pages from `docs/` at
<https://khelo-design.riverma.com>.

```bash
npm run build && npm run check
```

Generated, never hand-edited: `dist/*`, `docs/*.html`, `docs/khelo.css`,
`docs/fonts/*`, `SKILL.md`. `SKILL.md` and `docs/agents.html` come from the
same constants in `tools/build-docs.mjs`, so they cannot drift. Edit `src/`, `fonts/` and `tools/build-docs.mjs`.
`docs/site.css` and `docs/site.js` are hand-written.

## Rules that are not style preferences

- **No compulsion mechanics.** No streaks, points, XP, levels, leaderboards,
  ranks, mystery boxes, spins, lives or energy, countdown timers, infinite
  feeds, autoplay-next, push nudges, unread-count badges, confetti on open or
  guilt copy. There is no component, token or icon for any of them. See
  `docs/principles.html`. This is enforced in review, not by a gate.
- **Things end.** Finite sets show their total (`.kh-steps`) and finish with
  `.kh-end`.
- **Motion answers a touch.** It lasts under 400ms and every easing ends at
  1.0. No idle, looping or ambient animation.
- Inherited from Ahimsa: no red or danger token; nothing appears unasked;
  components read semantic tokens only; corners stay rounded; no network
  loads; no pure black or white.
- Every poster band ships with its own ink and passes AA at every stop.
- **No emoji, anywhere.** Use the drawn icons in `src/icons/`, or draw a
  new one in the same hand: 48-unit grid, 2.5 currentColor outline, round
  joins, flat `kh-f-*` fills.
- **Indian ornament, not party decoration.** Borders are kangura, bel,
  toran, lights or dots. No bunting, confetti, balloons or rainbow
  gradients. Big titles use block lettering (`--shadow-block`).

## Releases

Semantic versioning, starting at 0.1.0 while it is being shaped. Keep
`package.json` and `CHANGELOG.md` in step. Never push without an explicit
go-ahead, share screenshots of visual changes first, and review the diff for
secrets before any push. Commit messages are plain, with no AI attribution
trailers.
