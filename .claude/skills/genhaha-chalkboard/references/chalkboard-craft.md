# Chalkboard — script and board craft

The look: a green school chalkboard in a wooden frame (chalk tray, faint smudges and half-wiped old sums), chalk writing that appears
**stroke by stroke** with a small chalk stub and dust, circles / arrows / boxes / braces drawn by hand, a felt eraser wiping the board
between ideas, and a small chalk-drawn stick teacher at the right edge whose mouth moves with the voice. One teacher voice explains,
the subtitle sits under the writing. Best for a quick maths trick, a science "why", a language tip, a rule of thumb: one idea, ≤ 32 s.
Not for news, horror, or anything that needs pictures of real things.

## Script (captions.js)
- **One narrator = the teacher.** No `who`; `video.json → voice.voice` is the voice (free edge-tts: `th-TH-NiwatNeural` man or
  `th-TH-PremwadeeNeural` woman). Speak like a friendly teacher (ครับ/ค่ะ to match the voice), short sentences.
- **Hook = the problem in the first line**, as a question or a challenge ("บวกเลขหนึ่งถึงหนึ่งร้อย ต้องใช้เวลานานแค่ไหนนะ"); the board
  writes the problem while it is said. Then the trick, two or three worked steps, the result, a short natural closing.
- **Numbers as Thai words in the script** ("หนึ่งร้อยเอ็ด"), **digits on the board** (`C.write("101", …)`). `atW(key, "หนึ่งร้อย")` finds the word.
- **Real facts only.** Arithmetic must be right (check it); science and history checkable, no invented numbers, studies or quotes.
  **Legends and anecdotes get "ว่ากันว่า"** (the Gauss school story, Newton's apple, Archimedes' "Eureka"), never told as fact.
  Sources in `video.json → sources`.
- **Length ≤ 32 s by default** (≈ 380–420 Thai characters at 14.4 chars/s), unless the user asks for longer. 6–9 lines, 5–7 shots.
- One chunk ≤ ~55 Thai characters (the subtitle has 3 rows from y 1262; `check` warns over 60). Split a long worked example into two lines.
- `[brackets]` = yellow accent words in the subtitle (the key number, the trick's name).
- **Natural, different closing:** the result plus a small twist or question that fits this topic ("ลองกับหนึ่งถึงสองร้อยดูสิ ได้เท่าไหร่"),
  or the legend line. Never the same stock line in every clip, no "เมนต์มาเลย". No emoji anywhere.

## Board (index.html)
- **Writing area y 270–1000.** The teacher stands at x ≈ 905 (feet y 1232, `s: 0.6`); keep board text out of x > 780 below y 820.
  The subtitle starts at y 1262. `check` reads every `C.write` box and warns when one leaves these lanes.
- **Digits and signs are handwritten** (`0-9 + = × ? … . -`), so sums, equations, tables, timers and counts look best.
  **Thai is wiped in, not handwritten:** keep Thai on the board to a word or two ("วินาที", "คู่", a name). Say the rest.
- **Size:** ≥ 60 px for anything the viewer must read; the key result big (180–230 px) inside a `C.box` with a few `C.sparkle`s.
  A long line like `1+2+3+…+100` fits ~850 px wide at size 100.
- **Write on the word.** Start each write at `atW(key, "word")` (or `at(key) + 0.2`), duration ≈ 0.25–0.4 s per digit; the stub and dust come free.
  Chain pieces with the returned `x1` (`const a = C.write("5", …); C.write("วินาที", a.x1 + 24, …)`).
- **Point at things:** `C.arrow` onto the first number, `C.arc` linking a pair, `C.circle` around the answer, `C.underline` under a key word,
  `C.brace` under a row with the count below it.
- **One page per idea.** `C.erase(end(key) + 0.02, 0.9–1.1)` at the end of a line; the next page's writing starts ≥ 0.4 s after the erase begins
  (the eraser clears the top band first). Do not erase in the middle of a sentence. 2–3 pages per clip is plenty.
- **Teacher acts with the words:** `T.say(key, talk)` on every line (`check` lists lines nobody says), a face on the meaning word
  (`think` on the question, `smug` on the trick, `surprised` on the count, `shock` → `grin` on the result), `T.pose("fist", …)` + `T.hop` on the answer.
- Colours: white for the problem, yellow for results, pink for marks (arcs, boxes, underlines), blue for the second row / a name. One accent per idea.
- No emoji, no glass cards, no shake, no letter-spaced Thai; the board itself is the whole picture (no AI images, no photos).

## 16:9 (1920x1080) wide classroom board
`new --aspect 16:9`. The same script and the same kit calls; only the coordinates change. Writing area **x 70–1850, y 70–800**; teacher at the right (`C.teacher({ x: 1740, y: 800, s: 0.62 })`, `C.ground(1600, 1880, 806)`), nothing of the writing in x > 1590 below y 330; subtitle from y 840 (60 px, x 260–1660, ≤ 2 rows, up to ~80 Thai characters per line is fine); text inside x 90–1830, y 60–1000. Use the width: 5 columns of numbers at x 250–1330, a whole equation on one line at size 150, a clock on the left and the number beside it, the result at 280 in a box. The problem stays at the top (y 100–430) while the worked part is drawn below it, or erase first. Digits ≥ 90 px, Thai words ≥ 80 px. `check` knows both frames (board text lanes, safe area, subtitle length).

## Known weak spots (first version)
- **The teacher is small** (≈ 410 px tall at `s: 0.6`); faces read on a phone but not from across a room. `s` up to 0.65 works if no board text sits
  in x > 760 below y 780; larger hits the subtitle lane. A close-up of the teacher is not built in.
- **Erasing leaves faint streaks** on purpose (`ghostBands`, like a real wiped board), and they add up: after three erases the board looks
  greyer. Keep it to 2–3 erases per clip; for more pages, start new writing in a different band rather than erasing every time.
- During the 1 s erase the old page is still visible in the lower bands while the new page starts at the top — that is the look; do not
  write in the lower bands until the erase has ended.
- Thai on the board is a font wiped in, not handwriting; long Thai sentences look like a caption, not chalk.
- The full-screen chalk filter makes frames / render a bit slower than other Stick2D looks (≈ 1× real time on an Apple-silicon Mac).

## Check loop
`voice` → `check` (missing keys, unsaid lines, shot lengths, board text lanes, safe area every 0.1 s) → `frames` and **look at the sheet**:
the board writes on the right word, the result is boxed, the old page is gone after an erase, the teacher's mouth open on his lines,
subtitles below the writing. Fix and repeat. Then `cover`, `render`, `frames --video`.
<!-- genhaha:781c07c7ad6b -->
