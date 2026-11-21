# Chalkboard kit — `chalk-kit.js` (global `Chalk`, built on `stick2d-kit.js`)

SVG + GSAP only (no images, no WebGL, no CDN). A green chalkboard with a wooden frame, chalk tray, faint old smudges and half-wiped sums;
digits and signs are **written stroke by stroke** with a chalk stub that follows the line and a little chalk dust; lines, arrows, circles,
boxes, braces, underlines; a felt eraser wipes the page; a chalk-drawn stick teacher (Stick2D "ink" rig in the chalk layer) lip-syncs the narration.
Every frame is a pure function of the paused GSAP timeline (jitter comes from a seeded hash, never `Math.random`), so HyperFrames can seek anywhere.

Load order in `index.html`: `gsap.min.js` → `timing.js` → `captions.js` → `motion.js` → `stick2d-kit.js` → `chalk-kit.js`, then `look.css` + `chalk.css`
(body class `theme-chalk`); `<div id="stage">` must exist. `stick2d-kit.js` is the shared Stick2D kit, unchanged.

```js
const tl = gsap.timeline({ paused: true });
const M = Motion(tl);                       // motion.js: at(key) line start · end(key) · atW(key, "word") when a word is spoken · TOTAL · subtitles()
const C = Chalk(tl, M);                     // builds the board + the chalk layer (rough-chalk filter)
const { at, end, atW, TOTAL } = M, P = C.P; // P.white yellow pink blue green (chalk colours) · P.board
```

## Writing — `C.write(text, x, y, size, t, dur, o)`

`y` = top of the letters, `size` = letter height in px. Returns `{ x0, x1, w, end }` so the next piece can start where this one ended
(`const a = C.write("5", 430, 820, 120, t, 0.5); C.write("วินาที", a.x1 + 24, 830, 96, t + 0.45, 0.9)`).

| option | what |
| --- | --- |
| `color` | `P.white` (default) `P.yellow` `P.pink` `P.blue` `P.green` |
| `anchor` | `"start"` (default) · `"middle"` · `"end"` — x is the left edge / centre / right edge |
| `w` | stroke width (default `size × 0.085`) |
| `stub: false` | no chalk stub following the stroke · `noDust: true` no dust puffs |
| `page` | write into a given page group instead of the current one |

- **Handwritten (stroke by stroke):** `0-9 + = × ? … . -` and spaces. **Everything else (Thai, Latin letters)** is Kanit wiped in from left to
  right with the stub sliding along — it reads as "written" but not letter by letter, so keep Thai on the board to a word or two.
- `C.measure(text, size)` → width in px (for boxes / centring). Thai width is an estimate (`characters × size × 0.41`).

## Shapes (all reveal along the path over `(t, dur)`; `o = { color, w, opacity, page }`)

| call | what |
| --- | --- |
| `C.line(x1, y1, x2, y2, t, dur, o)` | slightly wobbly chalk line |
| `C.arrow(x1, y1, x2, y2, t, dur, o)` | line + head (`o.head` length, default 26) |
| `C.arc(x1, y1, x2, y2, lift, t, dur, o)` | curved link (pairs, jumps); `lift` bows it sideways |
| `C.circle(cx, cy, rx, ry, t, dur, o)` | hand-drawn ring that overshoots its start a little (circle an answer) |
| `C.underline(x, y, w, t, dur, o)` | wavy underline |
| `C.box(x, y, w, h, t, dur, o)` | sketchy double-stroke box (`o.double: false` = single) |
| `C.brace(x1, x2, y, h, t, dur, o)` | horizontal curly brace under a row: ends at y over x1–x2, tip pointing down to y + h (write the total under it: "50 คู่") |
| `C.path(d, t, dur, o)` | any svg path drawn as chalk (graphs, a triangle, a planet orbit) |
| `C.dust(x, y, t, n, spread)` · `C.sparkle(x, y, t, size, color)` | chalk dust puff · four-point sparkle (the result) |
| `C.ground(x1, x2, y)` | the chalk floor line under the teacher |

## Pages and the eraser

`C.erase(t, dur = 1.2, { y0: 270, bandH: 260, bands: 3 })` — a felt eraser zig-zags over the writing area in 3 bands (y 270–1050), the current page
disappears behind it and the next `write()` goes on a fresh page. Pale streaks stay on the board, like a real wiped board.
`C.page(id)` starts a new page by hand. Plan one page per idea: write → explain → erase → next.

## Teacher — `C.teacher(o)` (a Stick2D character drawn in chalk)

```js
const T = C.teacher({ x: 905, y: 1232, s: 0.6 });   // right edge, feet on the chalk floor; s 0.55–0.65
C.ground(780, 1040, 1236);
T.stick(); T.enter(0.12); T.sway(0.5, TOTAL, 1.6, 1.4);
const talk = { gestures: ["talk2", "idle", "talk3", "idle"], end: "idle" };
T.say("h1", talk);                                  // EVERY caption line: mouth flaps on the real voice timing
T.face(atW("f1", "ได้"), "shock"); T.pose("fist", atW("f1", "ห้าพัน"), 0.3); T.hop(t, 30);
```
Faces: neutral happy grin surprised sad angry smug worried shock think · Poses: idle talk1 talk2 talk3 point pointUp shrug hips up hold facepalm fist grab ·
`T.stick()` = a wooden pointer in the right hand · also `lean head walk wave hold` (see the header of `stick2d-kit.js`).

## 16:9 (1920 × 1080)

The kit reads the frame from `#root data-width / data-height` (`C.W`, `C.H`, `C.wide`, `C.area`) and adds class `wide` / `tall` to `<html>`. In 16:9 it draws a wide board: wooden frame, chalk ledge along the bottom edge (y 1008), smudges and ghost sums re-spread, the eraser band over y 70–805 and x 40–1880, and `C.teacher()` defaults to `{ x: 1740, y: 800, s: 0.62 }` (9:16: `{ x: 905, y: 1232, s: 0.55 }`). Coordinates you pass are always absolute, so write the 16:9 clip with these lanes (`new --aspect 16:9` gives a working demo, `demo-wide/index.html`):

| zone | notes |
| --- | --- |
| board frame | x 30–1890, y 30–1008 (wood around it, ledge below) |
| **writing area** | **x 70–1850, y 70–800**; `1+2+3+…+100` fits ≈ 1180 px at size 150; the result at 280 |
| teacher | x ≈ 1616–1864, y ≈ 366–800 (ground line y 806): nothing of the board text in x > 1590 below y 330 |
| subtitle | from y 840, x 260–1660, 60 px, ≤ 2 rows, ends by y 990 |
| safe area | no phone UI: all text x 90–1830, y 60–1000 (`check` / `safe` measure it) |

## Lanes (1080 × 1920)

| zone | y | notes |
| --- | --- | --- |
| board frame | 38–1560 | wood around it, chalk tray at y ≈ 1530 |
| **writing area** | **270–1000** | all board text; long sums at size ≈ 100 fit ~850 px wide |
| teacher | x ≈ 780–1040, y ≈ 820–1236 | keep board text out of x > 780 below y 820 |
| subtitle | from 1262, ≤ 3 rows, ends by 1520 | chalk white Kanit 800, dark-green stroke, `[accent]` yellow |
| phone UI | text only y 250–1520, left of x 960 below y 900 | `check` measures it |

`chalkboard check` reads `window.__chalk` (every `C.write` box, every `T.say` key, the teacher box) and warns on text outside these lanes.

## Rules
- Times only from `at / end / atW` (+ small offsets); no `Math.random` / `Date.now`.
- One `T.say(key)` per caption line (one narrator; no `who`).
- Board text ≥ 60 px tall (phone); digits on the board, numbers as Thai words in captions.js.
- Erase at the end of a line (`end(key) + 0.02`), start the next page's writing ≥ 0.4 s after the erase begins (the top band is clean by then).
- A variable named `top` in index.html clashes with `window.top` (SyntaxError → black clip): use another name.
- Subtitle words that must not break across rows: `window.SUB_GLUE = ["หนึ่งร้อย", …]` before `M.subtitles()`.
<!-- genhaha:781c07c7ad6b -->
