# Troubleshooting

| Symptom | Cause / fix |
| --- | --- |
| `edge-tts is not available` | `python3 -m pip install --user edge-tts`, or a venv + `CB_PYTHON=<venv>/bin/python`, or install `uv` (then nothing else: `chalkboard.mjs` runs `uv run --with edge-tts`). `doctor` shows which one is used. |
| `edge-tts failed … No audio was received` | The free Edge read-aloud service is unofficial and drops a line now and then. `voice` already retries the missing lines 3 times; run it again. Cached lines (`assets/voice/line-*`) are reused. `pip install -U edge-tts` if Microsoft changed the protocol. |
| A name / number / English word is read wrong | Add `say` to that chunk with a phonetic spelling, re-run `voice`. English example sentences: give the chunk `voice: "en"`. |
| Voice too fast / slow | `video.json → voice.rate` (target chars/s; Thai default 14.4; `null` = natural), re-run `voice`. |
| Clip too short | Add `pause` (seconds) to the line before an example, raise `gap_shot` (0.6 s) or `tail`; do not slow the voice. |
| Karaoke words pop at the wrong time | `voice` prints how many lines got WordBoundary timings; lines below 50 % character match are spread evenly. Keep `say` close to `t`. |
| `no caption key "b3"` in the browser / blank clip | `T.say("b3")`, `at("b3")` or `atW("b3", …)` names a key that is not in captions.js. `check` lists every missing key. |
| `atW: "word" not in line` | The word must be an exact substring of the line (brackets removed). For a word that is also inside an earlier word (`or` inside `for`), pass a longer piece such as `" or"`. |
| The teacher's mouth never moves | The line has no `T.say(key)` (`check` lists unsaid lines), or `timing.js` is empty (run `voice`). |
| `timeline not registered` | A JavaScript error in index.html (the message lists it). |
| Chrome not found | Install Google Chrome / Chromium, or `CHROME_PATH=/path/to/chrome`. |
| Render is slow | About real time on an Apple-silicon Mac (the chalk filter covers the whole frame; a 28 s clip renders in ~30 s). `--quality draft` for test renders. |
| Audio silent | Look for `audio mean … dB` in the render output; `assets/voice/voiceover.wav` must exist (run `voice`). |
| Music too loud / not wanted | `video.json → music.level` (0.06–0.12) or `music.mood: "none"`, then `render --audio-only`. |
| Your own track | Put a track you have the rights to at `assets/music/bgm.wav` (or `.mp3`), set `music.mood: "file"`. |
| Board text missing in frames / only the board shows | A JavaScript error stopped the scene code (`check` prints page errors), or a write is timed after the line (`atW` word not found → it falls back to the line start; `check` lists `atW` warnings). |
| Board text overlaps the teacher or the subtitle | Writing area is y 270–1000; keep text out of x > 780 below y 820. `check` prints each `C.write` that leaves the lanes. |
| Old writing still visible after an erase | Text written outside the 3 eraser bands (y 270–1050) is only hidden when the erase ends; for a page that goes lower, pass `C.erase(t, 1.2, { y0: 270, bandH: 300 })`. Faint streaks that stay are intended. |
| Digits look blocky / Thai letters look typed | Only `0-9 + = × ? … . -` are handwritten; other characters are Kanit wiped in. Keep Thai on the board short. |
| Safe-area hits | All text between y 250 and 1520 and left of x 960 below y 900 — the subtitle too (from y 1262, 3 rows). Split long lines. |
| A Thai word breaks across subtitle rows | Add it to `window.SUB_GLUE = ["หนึ่งร้อย", …]` before `M.subtitles()`, or put it in `[brackets]`. |
| Unknown face or pose | Faces: neutral happy grin surprised sad angry smug worried shock think. Poses: idle talk1 talk2 talk3 point pointUp shrug hips up hold facepalm fist grab. |
| HyperFrames `off_pivot_rotation` warning on `g.ch …` | The teacher's arm rotates about the shoulder on purpose; the dial heuristic misreads it. Safe to ignore. `gsap_tween_tail`: a pose overlaps the next one, end the first earlier. |
| Black clip, `SyntaxError` | A variable named `top` (clashes with `window.top`) or another script error in index.html. |
<!-- genhaha:781c07c7ad6b -->
