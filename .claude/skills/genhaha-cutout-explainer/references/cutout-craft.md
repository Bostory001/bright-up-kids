# Cutout explainer craft — the scene script, the catalog, shot cookbook, lessons

You write only two things: the script (`captions.js`) and the **scene script** inside `index.html` (one `K.scene(...)` block per `<section data-shot>`). Never edit `engine/*` (kit, motion, validate, css). Everything is a pure function of the GSAP timeline: no `Math.random` / `Date.now` (use `K.rng(seed)`), no CDN, no images.

## 1. The look in one paragraph
Flat pastel "felt cutout" shapes (no outlines, a slightly darker lower layer instead), a soft drop shadow under every piece, a felt grain + fibre + vignette over everything, polka / stripe / checker backgrounds, capsule (pill) labels in Kanit ExtraBold, phone / UI cards, one round-head presenter with big round glasses, white gloves and a yellow dress. Things pop in with an overshoot (`back.out`), important things wiggle or bounce, scenes change with a diagonal wipe, a curtain from the middle, a pop or a plain cut. World = the screen, 1080 x 1920, no 3D camera. The presenter's feet are on y 1300; subtitles start at y 1330; art area = y 250-1250 (presenter bottom-left, right side free).

## 2. Files in a project
| File | Role |
|---|---|
| `captions.js` | the script by shot: `{ id, start, end, chunks: [{ t, key, emo, pause, sfx, say }] }` |
| `index.html` | `#root` + one `<section id="sc-<id>" class="clip" data-shot="<id>">` per shot + the scene script |
| `timing.js` | written by `cutout voice`: line times, per-character times, loudness `envelope` (30 per second) |
| `video.json` | name, voice (`rate` 14.4), music mood, sfx scene cut, thumbnail, `publish.ai_disclosure` |
| `engine/` | `cutout-kit.js`, `motion.js`, `validate.js`, `cutout.css` — do not edit |
| `vendor/gsap.min.js`, `look.css`, `assets/fonts/Kanit-*.ttf` | local, offline |

Script order in `index.html` (do not change): `vendor/gsap.min.js`, `timing.js`, `captions.js`, `engine/validate.js`, `engine/motion.js`, `engine/cutout-kit.js`. The page script ends with `M.subtitles(); window.__timelines["main"] = tl; tl.seek(0); K.finish();`.

## 3. captions.js
One chunk = one spoken line = one karaoke line. `t` is shown AND spoken (`say` = spoken text when it differs, e.g. numbers). Thai narration: numbers as Thai words; about **14.4 characters per second** (`voice` applies the tempo). Spaces inside `t` are **phrase breaks** (put them between meaning groups): a phrase is never cut across rows. `[word]` = accent colour in the subtitle. `pause` = silence before the line (a beat). `sfx` = cue name(s): `"boom"`, `"pop@w:word"`, `"ding@0.4"` (`cutout sfx --list`). Keep a line <= ~26 Thai letters (max 2 subtitle rows at 840 px; longer shrinks the font). `key` must be unique; times in the scene script come from keys.

## 4. Scene script API
```js
const tl = gsap.timeline({ paused: true });
const M = Motion(tl);  const K = Cutout(tl, M);  const { at, atW, end } = M;  const P = K.prop;
const L = K.scene("hook", "room", { enter: "cut|wipe|curtain|pop", bgOpts: { color: "#3de0a2" }, push: 1.035 | false, wipeColor: "#ffd23a" });
const it = L.add(P("bulb", { on: true }), 880, 400, { s: 1.15, rot: 0, t: at("h1"), anim: "pop|drop|fade|slide:l|r|u|d|none", shadow: false });
```
- `t`: a number **smaller than the scene start** = seconds from the scene start (`t: 0.2`); larger = clip seconds (`t: at("p1")`, `t: atW("p1", "ไม่มี")`). `at(key)` line start, `end(key)` line end, `atW(key, word)` the moment that word is spoken.
- Items are drawn around their own (0,0): place with `x, y, s (scale), rot`. Typical prop is 200-440 px at `s: 1`.
- Item moves: `K.wiggle(it, t, n, amp)` · `K.bounce(it, t, h, n)` · `K.idle(it, t0, t1)` · `K.scale(it, t, d, s)` · `K.move(it, t, d, x, y)` · `K.hide(it, t)` / `K.unhide` · `K.fade(els, t, v)` · `K.swap(it, ".glow, .on", t, false)` (hide parts) · `K.tint(els, t, "#8fa04a")` · `it.q(sel)` / `it.qa(sel)` to reach parts (e.g. `.glow .flame .steam .food .mer`).
- Screen fx: `K.dim(t0, t1, 0.6, "#0a0e2a")` (lights out) · `K.glow(x, y, r, { t0, t1, color })` (warm flicker) · `K.shake(t, amp)` (one per shock beat) · `K.flash(t)` · `K.blackout(skyline, t0, t1, seed)` / `K.lightup(...)` · `K.counter(textEl, t0, t1, from, to, v => Math.round(v) + "°")`.
- UI: `K.pill(L, "label", x, y, { t, bg, fg, size, rot })` capsule label · `K.card(L, { w, h, head, headColor, inner, x, y, t })` · `K.txt(str, x, y, size, fill, { stroke, sw })` svg text.
- Ready-made shots: `K.closeup(L, { prop, props, x, y, s: 2.1, t, label })` · `K.split(L, { a: { fill }, b: { fill }, t, y: 960, tilt: 90 })` -> `{ a, b }` sub-layers with `.add(...)` (diagonal split, `a` = top) · `K.matrix(L, { y, in, cards: [{ title, icon: svg, color, t: atW(...), iconS, size }] })` (2x2 flip cards, max 4) · `K.choice(L, { y, t, cards: [{ label, svg, color, iconS }], title })` (1-4 option cards that bounce).
- Presenter: `const h = L.char({ x: 215, y: 1300, s: 0.95, flip, seed })` · `h.say("key")` (mouth + arms follow that line) · `h.face(t, "shock")` · `h.pose("point", t, 0.3)` · `h.tilt(t, 8)` · `h.hop(t)` · `h.moveTo(t, d, x)` · `h.hide(t)` / `h.reveal(t)` · `h.scaleTo(t, d, s)`.
- **Mouth**: after `cutout voice` the mouth reads the real voice loudness (`timing.js -> envelope`, 30 per second): closed / small / mid / wide per frame, so it follows the syllables. Before the voice exists (preview) it flaps on a seeded pattern. Blinks are seeded.
- Subtitles: `M.subtitles()` — words appear as spoken, the spoken word is yellow, <= 2 rows, phrases kept whole, wraps only between dictionary words, shrinks 70 -> 46 px if needed.
- Your own prop: after the kit script add `<script>Cutout.PROPS.kettle2 = (o = {}) => \`<rect .../>\`;</script>` (draw around 0,0, return an svg string; give parts classes you want to animate). Do it only when no catalog prop fits.

## 5. Catalog (the check lists the valid names; typos get "Did you mean")
**44 props** (opts in brackets): `phone` (screen dead|battery|lock|alarm|app|bank|map, pct, color) · `clock` (h, m, dead) · `bulb` (on; `.glow .on`) · `switch` (on) · `fridge` (open; `.food`) · `thermo` (level 0-1, color; `.mer`) · `car` (color, face) · `trafficlight` (lit r|y|g|none) · `atm` (text, red, dead) · `hospital` · `battery` (pct 0-1, color) · `bolt` · `plug` (out, rot) · `star` · `moon` · `sun` · `cloud` · `calendar` (top, day) · `coin` (label) · `pizza` (slices, cut) · `ruler` (len, label) · `bridge` (bend, load) · `cpu` (label) · `map` (w, h, pin) · `earth` · `qmark` · `xmark` · `check` · `wifi` (color) · `tree` · `house` · `skyline` (w, lit 0-1, seed; `.w` windows for blackout) · `bubble` (text, kind think|say) · `bed` · `window` (night) · `plant` · `food` (kind fish|milk|egg|apple) · `faucet` (drop; `.drop`) · `bucket` (water 0-1) · `table` (w) · `candle` (flame; `.flame`) · `bell` · `kettle` (color, on; `.steam`) · `honk` (text).
**9 backgrounds**: `sky` (sky + grass, horizon y 1010) · `polka` (color, dot) · `plain` (color) · `checker` (a, b, size) · `night` (stars, ground) · `factory` · `room` (wall, floor; floor from y 1010) · `grid` (city plan) · `dark` (color).
**9 faces**: `neutral happy cheer shock worry sad think smug sleepy`.
**15 arm poses**: `idle talk talk2 point pointUp pointL think shock cheer shrug hips hold wave facepalm down` (or `{ A: [shoulder, elbow], B: [...] }` degrees, outward positive).
**4 enters**: `cut wipe curtain pop`. **8 anims**: `pop drop fade none slide:l slide:r slide:u slide:d`.

## 6. Shot cookbook (one idea per shot, 3-6 s, average ~4 s)
| Shot | Recipe |
|---|---|
| Wake-up POV (the hook: an ordinary thing is wrong) | `room` + `bed` + `clock` + `bulb` (`K.swap` the glow off) + `phone` pop + `shock` face |
| Micro-interaction close-up | `K.closeup` on `polka`: one big prop + `wifi`/`xmark` + a pill |
| A value that flows | `thermo` + `K.counter` (4 -> 32) + `K.tint` on food + a pill "ภายในหนึ่งวัน" |
| System breaks | `sky` + a road rect + `car` x2 + `honk` + `K.shake` + `trafficlight` |
| Split-screen divergence | `K.split` (A: ATM x / B: hospital + battery check) |
| The big "city goes dark" | `night` + `skyline` + `K.blackout` + `K.dim` + stars pop in (`K.wiggle`) |
| Concept grid | `K.matrix` (the "?" cards flip on the spoken word) + a title pill |
| Outro question | `K.choice` (3 cards) + pill + presenter `cheer` / `think` |
Story rhythm that works: abnormal everyday hook -> first funny consequence -> structural consequences (city, systems, hospital) -> a flip (the good side / a different view) -> a 2x2 summary -> an invitation to choose or comment, worded differently every clip.

## 7. Lessons (from the R&D build)
- Shots >= 2.5 s; one picture, one idea; the presenter in most shots, but a close-up or split can drop him.
- Text only in y 250-1520; a pill centre at y >= 320 (the pop overshoots); nothing right of x 960 below y 900. Subtitle rows are <= 840 px wide so they stay left of x 960.
- Pops use `scale` on the inner group with `svgOrigin: "0 0"`; never put `svgOrigin` + scale on the outermost scene group (it leaves a permanent offset). State at time ~0 is set immediately, not by a zero-length set at t = 0.
- Do not name a CSS class `.head` (the engine uses `ckhead`). Counters use a setter-driven clock, not `onUpdate` (it does not run on seek).
- The lower part of the frame (below the subtitles, y > 1500) is empty in many shots: put floor decoration there (rug, grass, shadow) or move the art down a little.
- HyperFrames' own checks warn about contrast on flat colours and caption cross-fades: the CLI hides those; they are normal.
- Add SFX sparingly: `sfx` on 3-6 lines (`pop`, `ding`, `boom`, `sparkle`); `scene_cut: "whoosh"` already marks every cut. Music `playful` at level 0.12.
- Weak spots to tell the user: shapes are simple geometry (not hand-painted felt); one presenter only; arms are FK (hands do not grip props); no real cloth texture (just grain).

## 8. Facts and safety
What-if explainers sell on correct everyday logic (what really stops without power, water, money...). Use only facts you are confident of, in plain words; say "บางที่ / มักจะ" for things that vary; list in the summary any claim you could not verify. No real people, brands or logos, no invented statistics or quotes. Fiction framing ("ถ้า…") is fine; set `publish.ai_disclosure`.
<!-- genhaha:5f8f980bb7f3 -->
