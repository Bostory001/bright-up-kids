# visual-proof craft — script, scene data, every shot type and part

The look: maths and simple physics explained the way a good teacher draws it. One idea per shot, built on screen from flat shapes on a dark ground (3 px strokes, translucent fills). **Colour = meaning**: every quantity keeps one ink for the whole clip. The equation assembles **out of the shapes it describes**: a term appears on its shape and flies into its slot, strictly left to right. One thing moves at a time. Canvas 2D only (no WebGL, blur, grain or blend modes).

Good for: maths and physics facts that can be checked and drawn — Pythagoras, sums of odd numbers, angles in a triangle, ratios, function graphs, areas and lengths compared. Not for: news or measured data as charts (use a chart skill), stories with characters, formulas that need full TeX (roots, sums, matrices).

## 1. Script (`captions.js`)
- One chunk per spoken line: `{ t, key, say?, sfx? }`. `key` is unique (`h1 n1 a1 a2 …`) and scene.js times refer to it.
- `t` is the subtitle (at most 68 characters, 2 lines; digits and `+ = ×` are fine; `[word]` = accent ink). `say` is what the voice reads when it differs: **numbers and symbols as Thai words** (`"สี่คูณสี่ เท่ากับสิบหก"`, `"เอ็นกำลังสอง"`).
- 5–7 shots for 25–35 s, each **2.5–7 s** on screen (one or two lines). A hook question in the first line, the general result last.
- Thai about 14 characters per second. A natural closing that states the result, not "comment below".
- The maths must be right. Check every equation by calculation before you write it; say "for every counting number n" only when it is proven or well known.

## 2. Scene (`scene.js`)
```js
window.VP_SCENE = {
  palette: "navy",                     // navy | charcoal | plum | paper
  ink: { a: "teal", b: "gold", c: "coral" },   // quantity → ink (teal gold coral violet sky lime; neutrals line sum soft)
  camera: "push", enter: "trace", transition: "fade", ground: "plain",   // defaults; shots override camera / enter
  caption: { show: true, accent: "gold" },
  shots: { s1: { type: "build", title: "…", figure: [ … ], eq: [ … ] }, s2: { … } }   // one key per shot id in captions.js
};
```
**Times** (`at`, `until`, `move`, `signAt`, `markAt`, …): `"a1"` (line a1 starts), `"a1+0.4"`, `"a1-0.2"`, `"a1@0.5"` (half-way through the spoken line — survives a voice change), or a number = seconds into the shot. Items without `at` build one after another from the shot start.

**Figure units:** x right, y **down**; angles in degrees counter-clockwise as seen on screen. The view fits all items (or set `view: [x, y, w, h]`). Strokes and labels are in px, so a figure looks the same at any scale.

### 8 shot types
| type | keys | use |
|---|---|---|
| `build` | `figure`, `eq`, `eq2` | build a figure part by part; terms fly into the equation |
| `rearrange` | `figure` (items with `to: { dx, dy, rot, pivot, at }`), `move` | dissection / rearrangement proofs; `until` fades a piece out |
| `compare` | `left` / `right: { figure, label, view }`, `sign` (= < > ≠ ≈), `signAt` | area / length compare; both sides share one scale |
| `equation` | big `eq` (+ `eq2`), optional small `figure`, `focus` | the result line, terms highlighted with their shapes |
| `array` | `array: { n, as: "dots" \| "cells", q: [...], at: [...], labels, sfx: [...] }` | L-shaped rings → square numbers, counting |
| `numberline` | `line: { from, to, step, labels }`, `marks`, `jumps`, `bars` | odd / even steps, ratio bars |
| `steps` | `steps: [{ eq \| text, at, q, sfx }]` (2–5 rows) | derivation list; older rows dim |
| `qed` | big `eq` (+ `eq2`), `note`, `markAt`, `noteAt` | final card: underline sweep + ∎ |

Common shot keys: `title` (≤ 28 characters), `camera` (`still push pull drift focus tilt`), `enter` (`trace grow drop fade`), `figure`, `view`, `eq`, `eq2`, `focus: [{ at, until, ids | q }]` (dims the rest; `q` highlights every shape **and** term of that quantity), `carry: true` (the figure is already built: continue the previous picture), `look: [x, y]` (focus camera target), `note`.

### Equation tokens
Operators `"+" "−" "=" "×" "÷" "(" ")" "…" "," "<" ">" "≠" "≈" "?" "→"`, numbers, or `{ t: "a", sup: 2, sub, frac: ["1", "2"], q: "a", at, from: "<item id>", id, it, sfx }`. Single letters are italic (`it: true` forces it, e.g. `"2n"`). A term with `from` appears on its shape and flies into its slot. Terms appear strictly left to right, and an operator appears when the term after it lands. At most 15 tokens per row; use `eq2` for a second row.

### 30 parts (`node "$VP" catalog` prints the keys of each)
- shapes: `poly tri rtri square sqside rect circle ngon sector`
- lines: `seg arrow arc jump graph`
- marks: `angle right brace dim ticks mark label point dot`
- grids / counts: `grid dots cells gnomon bar numline axes`

Every item: `id part q at until dur enter to sfx w fill size`. `rtri` colours and labels each side (`qa qb qc`, `la lb lc`); `sqside` raises a square on a segment; `gnomon` is the 2n−1 L-ring; `graph` draws `y = a·f(b·x) + c` for `fn` in `x x2 x3 sqrt sin cos exp inv abs`.

### Variety (do not make every clip the same)
4 palettes · 6 inks (+3 neutrals) · 6 cameras · 4 enters · 4 transitions (`fade slide wipe cut`) · 3 grounds (`plain grid dots`) · 8 shot types · 30 parts. Mix shot types: a `build` hook, a `numberline` or `array` middle, `steps` for the pattern, `qed` to close.

## 3. Rules the checker enforces or warns about
Unknown names → error with "did you mean" · emoji → error · title ≤ 28, step text ≤ 34, note ≤ 40, subtitles ≤ 68 characters · ≤ 15 tokens per row · terms timed out of reading order → warning · every shot ≥ 2.5 s on screen → warning · `from` must name an item in the same shot · type-specific required keys · shot 1 should finish its figure within 1.5 s → warning.

## 4. Layout (1080×1920, fixed by the kit)
Title y 330, 52 px · the figure fills x 70–1010 from y 372 down to just above the equation (or to y 1372 with no equation) · equation 168 px (big shots 196 px), last baseline y 1318; a row that would shrink below 80 % breaks before its last "=" instead · subtitles y 1392–1524, 50 px, 2 lines max · nothing below y 900 passes x 960 (equation rows ≤ 840 px wide). All text is painted on the canvas: check frames with `snapshot`.

## 5. Sound
`sfx` on a caption line (`"pop@0.5"`) or on scene items (`{ t: "16", sfx: "ding" }`, `array.sfx: ["pop", "tick", …]`, a step row). Names: `pop tick ding chime sparkle` work best (`node "$VP" sfx --list`). A `qed` shot adds a chime on its ∎. About 10 cues per 30 s are kept; quiet beats loud. Music: `video.json → music { mood: "calm", level 0.1 }`.

## 6. Worked demo (the 28 s template, "1 + 3 + 5 + 7 = 4²")
1. `s1 build` — four rows of cells (1, 3, 5, 7) appear at once; the terms fly out of their rows into `1 + 3 + 5 + 7 = ?`.
2. `s2 numberline` — marks on 1, 3, 5, 7 and three `+2` jumps.
3. `s3 array` — one dot, then L-shaped rings of 3, 5 and 7 dots, each term flying from its ring.
4. `s4 steps` — `1 = 1²`, `1 + 3 = 2²`, `… = 3²`, `… = 4²`.
5. `s5 build` — the 4×4 dots with two braces of 4; `4² = 16` with focus on the braces.
6. `s6 qed` — `1 + 3 + 5 + … + (2n − 1) = n²` and the note "สำหรับทุกจำนวนนับ n".

## 7. Known limits
No TeX: equations are canvas text in Newsreader (powers, subscripts, simple fractions; no roots, sums or matrices). Shapes do not morph into each other (move / rotate / fade only). Sub-step timing inside a line is a fraction of the line (`@`), not word timing, so a term can lead or trail its word by about 0.3 s. Square figures are limited by height (about 55–70 % of the width); `compare` sides are smaller.
<!-- genhaha:ed4a029a9d2b -->
