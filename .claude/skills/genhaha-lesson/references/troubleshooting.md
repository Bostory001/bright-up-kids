# Troubleshooting

| Symptom | Cause / fix |
| --- | --- |
| `edge-tts is not available` | `python3 -m pip install --user edge-tts`, or a venv + `LS_PYTHON=<venv>/bin/python`, or install `uv` (then nothing else: `lesson.mjs` runs `uv run --with edge-tts`). `doctor` shows which one is used. |
| `edge-tts failed … No audio was received` | The free Edge read-aloud service is unofficial and drops a line now and then. `voice` already retries the missing lines 3 times; run it again. Cached lines (`assets/voice/line-*`) are reused. `pip install -U edge-tts` if Microsoft changed the protocol. |
| A name / number / English word is read wrong | Add `say` to that chunk with a phonetic spelling, re-run `voice`. English example sentences: give the chunk `voice: "en"`. |
| Voice too fast / slow | `video.json → voice.rate` (target chars/s; Thai default 14.4; `null` = natural), re-run `voice`. |
| Clip too short | Add `pause` (seconds) to the line before an example, raise `gap_shot` (0.6 s) or `tail`; do not slow the voice. |
| Karaoke words pop at the wrong time | `voice` prints how many lines got WordBoundary timings; lines below 50 % character match are spread evenly. Keep `say` close to `t`. |
| `section #sc-x: no caption for shot "x"` | Every `<section data-shot>` needs a shot with that id in captions.js. |
| `no caption key "b3"` in the browser | `B()` key not in captions.js. |
| `atW: "word" not in line` | The word must be an exact substring of the line (brackets removed). For a word that is also inside an earlier word (`or` inside `for`), pass a longer piece such as `" or"`. |
| `Lesson: no section #sc-x` | The `L.block("#sc-x", …)` selector has no `<section>` in index.html. |
| Block text too wide / off the card | Keep a term ≤ ~10 letters (size shrinks automatically), set `size`, or shorten the sub-line; text never wraps in terms and meanings. |
| Safe-area hits | Keep content between y 250 and 1250; the subtitle lane is y 1290–1500. Use `y` on the block to move it up. |
| `timeline not registered` | A JavaScript error in index.html (the message lists it). |
| Chrome not found | Install Google Chrome / Chromium, or `CHROME_PATH=/path/to/chrome`. |
| Render is slow | About 1.5× faster than real time on an Apple-silicon Mac for a 40 s clip. `--quality draft` for test renders. |
| Audio silent | Look for `audio mean … dB` in the render output; `assets/voice/voiceover.wav` must exist (run `voice`). |
| Music too loud / not wanted | `video.json → music.level` (0.06–0.12) or `music.mood: "none"`, then `render --audio-only`. |
| Your own track | Put a track you have the rights to at `assets/music/bgm.wav` (or `.mp3`), set `music.mood: "file"`. |
<!-- genhaha:ed34a05c8342 -->
