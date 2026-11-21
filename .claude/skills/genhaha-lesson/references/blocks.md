# Scene blocks (template/lesson.js)

Every block is a pure function of time (GSAP timeline, no Math.random / Date.now). It builds its DOM inside a `<section>` and fades out ~0.5 s before the section ends (not in the last section). Times are absolute seconds: `B("a1")` = line start, `B("a1","and")` = when that word is spoken. Default `t` = section start + 0.3 s. `[brackets]` colour a word.

```js
const L = Lesson(tl, M);            // after Motion(tl)
const B = (k, w) => (w ? M.atW(k, w) : M.at(k));
```

| Block | Options | Look |
|---|---|---|
| `L.hook(sec, {eyebrow, a, b, sub?, t, tb, ts, y, size})` | two huge words, `a` black, `b` blue | "and / but" |
| `L.define(sec, {eyebrow, term, tone:"blue"\|"ink", meaning, sub?, chips?:[{text,t,line?}], example?:{text,gloss,t,hit}, tm, ts, y, size})` | term, `= meaning`, grey sub-line, optional pill chips and example card | "and = และ / เพิ่มข้อมูล" |
| `L.tiles(sec, {eyebrow, title?, items:[{k,label?,t,lt?}], kind:"letters"\|"chips", y})` | letter tiles (white, black outline) or word chips, per-item reveal | F A N B O Y S |
| `L.example(sec, {eyebrow?, label, text, gloss?, hit, t, y})` | white card, black border, hard offset shadow, highlighted word in orange-red | "I like tea and coffee." |
| `L.compare(sec, {eyebrow, title?, a:{term,meaning,example?}, b:{…}, ta, tb, y})` | A vs B cards with a VS badge | make vs do |
| `L.steps(sec, {eyebrow, title?, items:[{text,sub?,t}], y})` | numbered 1-2-3 rows | study steps |
| `L.tip(sec, {eyebrow:"TIP", title, sub?, card?:{label,text,gloss?,hit,t}, y})` | callout with title, sub and a card | comma tip |
| `L.outro(sec, {eyebrow:"SAVE & FOLLOW", word, sub?, pills?, tp, y})` | keyword, sub-line, SAVE / FOLLOW pills | FANBOYS |
| `L.dots([secs])` | progress dots (bottom, y 1500), one per section | |
| `L.grid()` | slow graph-paper drift | |

Layout: eyebrow at y 300 (blue, letter-spaced caps), content column from `y` (default 430-540) down to at most y 1250, subtitle lane y 1290-1500, dots y 1500. Terms and meanings never wrap: keep a term to about 10 letters, a meaning to about 12 Thai characters, a sub-line to about 24 characters. Look: cream #f4f1ea with grid, ink #101114, blue #3446e8 (`--blue` in look.css), hit #e8553a only inside example cards, Kanit font files in `assets/fonts`. No emoji, no gradients, no blur, no photos.

To add a scene: one `<section id="sc-x" class="clip" data-shot="x" …>` per shot (the numbers are rewritten by `voice`), a shot with that id in captions.js, and one `L.<block>("#sc-x", {...})` call.
<!-- genhaha:ed34a05c8342 -->
