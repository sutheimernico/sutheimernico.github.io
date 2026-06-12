# Design prototype — NOTES

**Question:** Which visual direction should the portfolio commit to?

Three radically different variants of the landing page, switchable via
`?variant=` and the floating bottom bar (or ←/→ arrow keys):

| Key | Name             | Character                                                              |
| --- | ---------------- | ---------------------------------------------------------------------- |
| `a` | Terminal Archive | Dark engineering document. Warm black + amber, IBM Plex Mono/Sans. SQL-query hero, dense project index table, counters. Motion: deliberate restraint. |
| `b` | Editorial Ink    | Warm paper + Klein blue, Fraunces + Hanken Grotesk. Line-masked text reveals, cursor-following data-visual preview over the project list, magnetic contact button. |
| `c` | Swiss Poster     | Cold gray + signal red, Archivo Expanded 900 + Fragment Mono. 16vw name with clip-path reveal, marquee strip, scroll-pinned horizontal project gallery, invert hovers. |

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
