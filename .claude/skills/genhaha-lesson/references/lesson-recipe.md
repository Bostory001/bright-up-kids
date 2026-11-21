# Lesson script recipe (30-60 s)

## Shape

| Time | Beat | Block |
|---|---|---|
| 0-2 s | Hook: a question the viewer half knows ("ใช้ and, but, so ถูกจริงไหม?") | `hook` (keyword pair) |
| 2-8 s | What is it: one definition, at most 3 short chips | `define` (+ chips) |
| 8-12 s | A memory trick if there is one (FANBOYS) | `tiles` |
| 12-35 s | Items: one scene each, 4-6 s: term = meaning, one-line use, an English example with a Thai gloss | `define` + `example` · `compare` · `steps` |
| 35-40 s | A tip or a common mistake | `tip` |
| last 3 s | Save and follow, with the keyword once more | `outro` |

## Rules

- **One idea per 3-5 s.** Something changes every 1-2 s (a tile, chip, card or highlight), a new composition every 2-4 s.
- **Hook in the first 2 s**: a question or a surprise, never "สวัสดีครับ วันนี้เราจะ...".
- **Examples are English, short (4-7 words), natural**, with a Thai gloss under the card. Highlight only the word being taught (`[and]`).
- **Thai ~14.4 chars/s** (the default `voice.rate`). Length: 30 s ≈ 430 chars, 45 s ≈ 650, 60 s ≈ 860 chars of spoken Thai including spaces. Examples read by the English voice are not counted toward the pace.
- **English terms stay English** in the subtitle and on screen; mark the key term `[term]` so it is blue in the karaoke line.
- **Ending**: a save / follow line, or a natural question; vary it from clip to clip, do not repeat the same phrase.
- Facts must be right: check grammar rules and meanings; put a source in `video.json → sources` if you quote one.
- Full English lesson: `new --lang en`, English captions, no `voice: "en"` needed; glosses become the translation you want to teach.

## Caption fields (captions.js)

`t` subtitle ([brackets] = blue word) · `key` · `say` · `voice` (`"en"` reads that line with the English voice) · `sfx` · `pause`. `sfx` examples: `"pop@0.05"`, `"tick@w:for"`, `"ding@w:comma"`. Sounds: tick, pop, blip, ding, chime, whoosh (`lesson.mjs sfx --list`).
<!-- genhaha:ed34a05c8342 -->
