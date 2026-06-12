# Design prototype — NOTES

**Question:** Which visual direction should the portfolio commit to?

Ten radically different variants of the landing page, switchable via
`?variant=` and the floating bottom bar (or ←/→ arrow keys):

| Key | Name              | Character                                                              |
| --- | ----------------- | ---------------------------------------------------------------------- |
| `a` | Terminal Archive  | Dark engineering document. Warm black + amber, IBM Plex Mono/Sans. SQL-query hero, dense project index table, counters. Motion: deliberate restraint. |
| `b` | Editorial Ink     | Warm paper + Klein blue, Fraunces + Hanken Grotesk. Line-masked text reveals, cursor-following data-visual preview over the project list, magnetic contact button. |
| `c` | Swiss Poster      | Cold gray + signal red, Archivo Expanded 900 + Fragment Mono. 16vw name with clip-path reveal, marquee strip, scroll-pinned horizontal project gallery, invert hovers. |
| `d` | Phosphor Shell    | Interactive terminal session. Green phosphor on near-black, JetBrains Mono, commands type themselves on scroll, glow over scanline kitsch. |
| `e` | Engineering Paper | Berkeley-Graphics spec sheet. Warm paper, dense bordered tables, registration marks, dimension lines, APPROVED stamp, signal red. Near-zero motion. |
| `f` | Quiet Craft       | rauno.me-school dark minimalism. Geist, near-monochrome, one load stagger, text-scramble nav, sibling-dimming lists. |
| `g` | Kinetic Type      | Variable font (Anybody) as the interface: letters swell toward cursor, headlines stretch with scroll, titles pulse on hover. |
| `h` | Data Journal      | Financial-Times language. Salmon paper, Source Serif 4, claret/oxford/teal charts that draw themselves, ticker strip, newspaper stillness. |
| `i` | Bauhaus           | Muted Itten triad, poster geometry, shape parallax, circle→square morph hovers with overshoot, rotated marquee divider. |
| `j` | Riso Zine         | Risograph overprint (blue × fluo pink via multiply, ink swap to green × orange), static grain, misregistration steps-hover, sticker badges. |

Round 3 — syntheses of the favorites (a, c, d, g, i, j):

| Key | Name              | Synthesis                                                              |
| --- | ----------------- | ---------------------------------------------------------------------- |
| `k` | Kinetic Terminal  | a × d × c × g. Dark amber terminal world: boot sequence, typed SQL hero, name in variable Martian Mono with per-letter cursor swell, stats marquee, scroll-pinned job queue with status badges, counters. |
| `l` | Overprint Engine  | j × i × c × g. Poster-scale riso print: per-letter ink misregistration that splits away from the cursor, stamp-in load, shape parallax, rotated marquee, ink-swap sections, width-stretch title hovers, hard-shadow buttons. |

## Run

```
python3 -m http.server 4317 --directory prototype
```

→ http://localhost:4317 (loads variant `a`; switch with the bottom bar or arrow keys)

## Verdict

_(fill in after review — which variant wins, or which pieces of which variants
to combine; the winning direction becomes the design spec in
`docs/superpowers/specs/`, then this folder gets deleted)_

- Winner:
- Steal from the others:
- Rejected because:
