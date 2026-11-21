---
name: genhaha-chalkboard
description: ทำคลิปสอนบนกระดานดำชอล์กสีเขียวกรอบไม้ แนวตั้ง 9:16 หรือแนวนอน 16:9 (กระดานห้องเรียนกว้าง) ตัวเลขและเครื่องหมายค่อยๆ เขียนทีละเส้นด้วยชอล์กมีฝุ่นชอล์ก วงกลม ลูกศร กรอบ ปีกกา ขีดเส้นใต้ ลบกระดานด้วยแปรงลบ ครูตัวไม้ขีดวาดด้วยชอล์กยืนขอบขวาปากขยับตามเสียงพูด เสียงครูเสียงเดียว ซับอยู่ใต้กระดาน เหมาะกับเคล็ดลับเลข วิทย์ ภาษา ยาวไม่เกิน 32 วินาที บนคอมของคุณใน Claude Code ฟรี ไม่ต้องมี API key Make a vertical 9:16 or landscape 16:9 (wide classroom board) chalkboard lesson clip: digits and signs written stroke by stroke in chalk with dust, hand-drawn circles, arrows, boxes and braces, an eraser wiping the board, a chalk stick teacher lip-synced to one narrator voice (edge-tts), drawn with SVG + GSAP and rendered locally with HyperFrames, free.
---
<!-- genhaha:781c07c7ad6b -->
# Chalkboard lesson — "กระดานดำชอล์ก" (runs locally, free)

## วิธีใช้ (สำหรับผู้ใช้ — Claude ข้ามส่วนนี้ได้)

**ทำอะไรได้:** ทำคลิปสอนสั้นแนวตั้ง (หรือแนวนอน 16:9 สำหรับ YouTube/ทีวี บอกว่า "แนวนอน") บนกระดานดำสีเขียวกรอบไม้ เหมือนครูกำลังเขียนกระดานจริง ตัวเลขและเครื่องหมายค่อยๆ ถูกเขียนทีละเส้นมีชอล์กก้อนเล็กวิ่งตามและฝุ่นชอล์ก ครูวงคำตอบ ลากลูกศร ตีกรอบ ขีดเส้นใต้ แล้วใช้แปรงลบกระดานก่อนขึ้นเรื่องถัดไป มีครูตัวไม้ขีดวาดด้วยชอล์กยืนที่ขอบขวา ปากขยับตามเสียงพูดจริง ทำหน้าตาและท่าทางตามเนื้อหา เหมาะกับเคล็ดลับคิดเลขเร็ว เรื่องวิทย์สั้นๆ เคล็ดลับภาษา ยาวไม่เกินประมาณ 32 วินาที ภาพวาดด้วยโค้ดทั้งหมด ไม่ใช้ภาพ AI ทำงานบนคอมของคุณ ฟรี ไม่ต้องมีบัญชีหรือ API key

**ต้องมีอะไร:** Claude Code บนคอม (Mac, Windows หรือ Linux) พร้อม Node.js 22+, ffmpeg, Python กับ edge-tts (หรือ uv) และ Chrome หรือ Edge (ตัวใดตัวหนึ่ง) และต่ออินเทอร์เน็ตได้ (เสียงอ่านและตัวเรนเดอร์โหลดผ่านเน็ต) ถ้าเครื่องไม่มี Chrome ให้รัน `chalkboard chrome` เพื่อดาวน์โหลดตัวเบราว์เซอร์แบบไม่มีหน้าจอ ใช้บน claude.ai เว็บไม่ได้ เพราะต้องเรนเดอร์บนเครื่องของคุณ

**ติดตั้ง:** แตก zip ลงโฟลเดอร์สกิล เช่น `mkdir -p ~/.claude/skills && unzip -o ~/Downloads/genhaha-chalkboard.zip -d ~/.claude/skills/` แล้วเปิด Claude Code ใหม่ พิมพ์ `/skills` จะเห็นสกิลนี้ ครั้งแรกบอก Claude ว่า “เช็กเครื่องให้หน่อย” (รันคำสั่ง doctor) มันจะบอกว่าขาดอะไรและวิธีลง

**พิมพ์สั่งอย่างไร:** เช่น
- “ทำคลิปกระดานดำสอนคูณ 11 ในใจ ภายใน 30 วินาที”
- “ทำคลิปชอล์กอธิบายว่าทำไมมุมในสามเหลี่ยมรวมกันได้ 180 องศา”
- “ทำคลิปครูกระดานดำ เคล็ดลับเช็กว่าเลขหารด้วย 3 ลงตัวไหม”

**ได้อะไรกลับมา:** ไฟล์วิดีโอ MP4 แนวตั้ง 1080×1920 (หรือแนวนอน 1920×1080 เมื่อสั่ง 16:9) พร้อมเสียงครู เสียงประกอบเบาๆ และเพลงประกอบเบาๆ ไฟล์ซับ SRT และภาพปก อยู่ใน `./videos/<วันที่>_<ชื่อ>/renders/` ของโฟลเดอร์ที่ Claude Code เปิดอยู่

**เสียงให้ดีขึ้น (ไม่บังคับ):** ใช้เสียงฟรี edge-tts ได้เลย (ภาษาไทยมีเสียงครูผู้ชายหนึ่งและผู้หญิงหนึ่ง) ถ้าอยากได้เสียงที่ธรรมชาติขึ้นหรือมีเสียงให้เลือกมากขึ้น ใส่ key ของ Gemini, ElevenLabs, OpenAI หรือ Cloudflare ได้ ดู `references/ai-providers.md` **โหมดโปรไม่บังคับ:** Claude จะถามครั้งเดียว แล้วพาตั้งค่า key ของคุณเองทีละขั้น (key อยู่ในเครื่องคุณเท่านั้น ห้ามพิมพ์ในแชต) ถ้าไม่มี key หรือเรียกไม่สำเร็จ จะใช้แบบฟรีให้อัตโนมัติ — ไม่ต้องมี API key ก็ทำคลิปได้ครบ

**ถ้าติดปัญหา:** รัน doctor ซ้ำ ตรวจว่า Node เป็น 22 ขึ้นไป มี ffmpeg และ edge-tts ครบ ถ้าเสียงฟรีโหลดไม่ครบให้รอสักนาทีแล้วสั่งใหม่ ถ้าเรนเดอร์ไม่ผ่านบอก Claude ว่า “เช็กเครื่องให้หน่อย” หรือดู `references/troubleshooting.md`

You write a short, factual lesson (`captions.js`, one teacher voice) and the board code with the chalk kit (`C.write / line / arrow / circle / box / brace / underline / sparkle / erase`, `C.teacher` + `T.say / face / pose`); `scripts/chalkboard.mjs` does the voice, per-character mouth timing, checks, sound, cover, SRT and render. Everything is free and stays on the user's machine. Cost per clip: $0.

```bash
CB="<this skill's folder>/scripts/chalkboard.mjs"   # e.g. ~/.claude/skills/genhaha-chalkboard/scripts/chalkboard.mjs (quote it)
node "$CB" doctor                                   # once: Node 22+, ffmpeg, python3+edge-tts (or uv), npx, Chrome
```

In a cloud sandbox (paths like `/mnt/skills/…`, no Chrome, slow network) run `node "$CB" doctor --online` first: it lists which hosts are reachable. If `speech.platform.bing.com` is blocked the free voice cannot work — tell the user which hosts are blocked and that the environment's network setting must allow them (or use their own computer); do not loop. If `doctor` shows something missing, tell the user the exact install line it printed and wait. The one exception is Chrome: when `doctor` reports only Chrome missing, run `node "$CB" chrome` yourself (one-time ~100 MB download, nothing installed system-wide), then run `doctor` again. If that also fails (no internet), say so plainly: this skill needs a computer with internet. Every project command takes `--project <dir>` (default: current directory).

## Look

Vertical 1080×1920 (default) or landscape 1920×1080 (`new --aspect 16:9`), drawn with SVG + GSAP only (no images, no WebGL, no CDN), every frame a pure function of time. No emoji, no glass cards, no shake, no letter-spaced Thai, no photos or AI pictures.
- **Board:** green chalkboard `#27483d` with a soft radial light, wooden frame, chalk tray (three chalk sticks, a felt eraser) at y ≈ 1530, faint smudges and half-wiped old sums; a dark wood base under it.
- **Chalk:** a rough-chalk filter on everything written. Digits and signs (`0-9 + = × ? … . -`) are **handwritten stroke by stroke** with a chalk stub following the line and dust puffs; Thai is Kanit **wiped in** left to right (short words only). Colours: white, yellow (results), pink (marks), blue (second row, names), green.
- **Marks:** wobbly lines, arrows, arcs linking pairs, rings around answers, sketchy double boxes, braces, wavy underlines, four-point sparkles on the result.
- **Eraser:** a felt eraser zig-zags over the writing area in three bands and the page is gone; pale streaks stay, like a real board.
- **Teacher:** a small chalk-line stick figure at the right edge (x ≈ 905, feet y 1232, holding a wooden pointer); mouth flaps on the real voice timing, ten faces, gestures while talking, a hop on the result.
- **Subtitle:** chalk-white Kanit 800 66 px, dark-green stroke, from y 1262 (under the writing), the spoken word pops in yellow, `[accent]` words stay yellow; up to 3 rows, ending by y 1520.
- **Lanes:** board writing y 270–1000; nothing in x > 780 below y 820 (teacher); all text y 250–1520 and left of x 960 below y 900 (phone UI).
- **16:9 (1920×1080), `node "$CB" new <slug> --aspect 16:9` (or `--wide`):** the board becomes a wide classroom board (wooden frame, a deep chalk ledge along the bottom edge, chalk sticks and the felt eraser on it). Writing area x 70–1850, y 70–800 (much more room: rows, long equations, a clock beside the number); teacher at the right (`C.teacher({ x: 1740, y: 800, s: 0.62 })`, ground line y 806, nothing of the board text in x > 1590 below y 330); subtitle Kanit 800 60 px from y 840, x 260–1660, 2 rows end by y 990; no phone UI, text inside x 90–1830, y 60–1000. The kit lays the board out by itself, but **every `C.write` / mark is placed by absolute coordinates, so write the wide clip with the 16:9 numbers** (the 16:9 demo shows them; `aspect` only switches the shell). Same voice, captions, cover (title boxes at y 700), SRT; the frame sheet is 4 per row.

## Step 0 — ask the user first (topic, teacher voice, free or Pro)

Before writing anything, ask **once**, in one short friendly message in the user's language (use the question tool if you have one). Skip every item the user already answered; never ask more than this once, and never block the clip on it. "ตามสะดวก" / "แล้วแต่" / a hurry = defaults.

1. **Topic and the teacher:** the one idea to teach (a maths trick, a science why, a language tip) and the teacher's voice — default a man teacher (`th-TH-NiwatNeural`); offer a woman teacher (`th-TH-PremwadeeNeural`). Offer 2–3 fitting angles if the topic is broad. Length ≤ 32 s unless they ask.
2. **Free or Pro** — offer exactly two choices, free first and as the default:
   - **ฟรีเลย (แนะนำสำหรับเริ่มต้น)** — everything free, nothing to set up (edge-tts teacher voice).
   - **โหมดโปร ใช้คีย์ของคุณเอง เสียงดีขึ้น — ไม่บังคับ** — in ONE line say what Pro adds: a more natural teacher voice and more voices to choose from. It uses the user's own API key and is billed by the provider; the clip never needs it.

If they pick free (or do not answer), go free and do not mention Pro again. If they pick Pro, follow **Pro mode (optional)** below step by step. Never ask for a key in the chat.

## Steps

1. **Brief.** Topic, teacher voice, language (`th` default or `en`), length (default 25–32 s). Facts must be checkable; arithmetic must be right (work it out); no invented numbers, studies or quotes; legends as "ว่ากันว่า".
2. **Script.** Read [references/chalkboard-craft.md](references/chalkboard-craft.md): the problem as the hook, the trick, two or three worked steps, the result boxed, a natural different closing. Numbers as Thai words in the script, digits on the board. Thai at ~14.4 chars/s (30 s ≈ 400 chars).
3. **Scaffold.** `node "$CB" new <slug> --title "…" [--aspect 16:9] [--cover "line 1|[accent line 2]"] [--lang en] [--voice th-TH-PremwadeeNeural]` → `./videos/<date>_<slug>/` with a working demo ("บวก 1 ถึง 100 ใน 5 วินาที", ~28 s, 6 shots, 3 board pages; `--aspect 16:9` = the same lesson laid out for the wide board). Ask the user once whether they want 9:16 (TikTok / Reels / Shorts, default) or 16:9 (YouTube / TV / website); a shape change later: `node "$CB" aspect 16:9` switches the shell only, the board coordinates must be re-placed. Use it as the pattern, or `--blank` for a 2-shot skeleton. Kit API: `template/README.md` (copied header in `chalk-kit.js`).
4. **Script → `captions.js`.** Shots → chunks: `t` (with `[accent]` words), `key`, optional `say`, `sfx`, `pause`. One chunk = one subtitle = one voice line, ≤ ~55 Thai characters. One narrator: no `who`.
5. **Board → `index.html`.** One `<section data-shot="id">` per shot. `const C = Chalk(tl, M)`, the teacher once at the top (`C.teacher({ x: 905, y: 1232, s: 0.6 })`, `T.stick()`, `T.enter`, `T.sway`), `T.say(key, talk)` for **every** line, faces and poses on words with `atW(key, "word")`. Board writes on the spoken word (`C.write(text, x, y, size, atW(key, "word"), dur, o)`), marks after them, `C.erase(end(key) + 0.02, 1.0)` between ideas. Writing area y 270–1000 (16:9: x 70–1850, y 70–800). Copy the demo's patterns.
6. **Voice.** `node "$CB" voice` — one edge-tts clip per line (cached, missing lines retried one at a time), tempo to 14.4 chars/s, word boundaries → per-character times (`TTS_TIMING.chars`, used by the mouth, `atW` and the karaoke), loudness-normalised; `timing.js` and the `<section>` times are rewritten. If it ends with lines missing, the free service is throttling this network: wait ~1 minute and run it once more (done lines are kept); if that fails too, STOP retrying — tell the user, offer a provider key (`CB_TTS=gemini|openai|elevenlabs|cloudflare`) or running on their own computer. Re-run after every script change, then re-check the board timings.
7. **Check.** `node "$CB" check` — HyperFrames lint + every key used in index.html (`say / at / end / atW`, also `[…].forEach` key lists) exists in captions.js + every line said by the teacher + each shot ≥ 3 s + subtitle line length + every `C.write` inside the lanes (y 250–1520, writing area, not on the teacher, not on the subtitle, short Thai) + no CDN / raster images + page errors + safe area of the aspect (phone for 9:16, TV margins for 16:9) sampled every 0.1 s. Fix every ✗ and ⚠ (an `off_pivot_rotation` note on the teacher's arm is explained in troubleshooting).
8. **Look.** `node "$CB" frames` (contact sheet `renders/frames/sheet.jpg`, one frame per line) → **open the sheet with Read and look**: the chalk appears on the right word, the result is boxed, an erased page is really gone, the teacher's mouth open on his lines, subtitles below the writing. Use `--at 1.2,3.4,…` for specific moments. Fix and re-check.
9. **Cover.** `node "$CB" cover --title "บวก 1 ถึง 100|[ใน 5 วินาที]" --at <s>` → `renders/cover.jpg` (a frame where the problem is fully written + the title in white boxes at y 1236); look at it. `render` lays it over the first 0.1 s.
10. **Sound.** Soft SFX from the `sfx` fields (`node "$CB" sfx --list`; `ding` on the result, `pop` / `blip` on a key number) and a light bed: `node "$CB" music --mood playful|calm|bright|none` (procedural, ducked under the voice; default `playful`).
11. **Render.** `node "$CB" render` → check → cover → HyperFrames → mix voice + SFX + music → `renders/<slug>-final.mp4`, `renders/<slug>.th_TH.srt` (or `en_US`), `renders/<slug>-summary.md`. Sound-only edits: `render --audio-only`.
12. **Verify.** `node "$CB" frames --video renders/<slug>-final.mp4 --every 2`, Read the sheet (tile 1 = cover). Expect `audio mean` ≈ −15 to −19 dB. You cannot listen: tell the user which names, numbers and English words to check (fix with `say`).

## Rules that matter

- **Real facts only.** Arithmetic checked, science checkable; no invented numbers, studies, experts or quotes; legends and anecdotes as "ว่ากันว่า"; sources in `video.json → sources`.
- **One teacher voice**, `T.say(key)` on every line; the teacher stays small at the right edge, the board is the picture.
- **Digits on the board, words in the script.** Thai on the board only a word or two (it is wiped in, not handwritten); board text ≥ 60 px (16:9: ≥ 90 px), inside the writing area (9:16 y 270–1000 · 16:9 x 70–1850 y 70–800), out of the teacher's corner.
- **One page per idea**, erase at the end of a line, 2–3 erases per clip at most.
- **Shots ≥ 3 s**, ≤ 32 s total by default; no Math.random / Date.now.
- **No emoji** anywhere, no glass cards, no shake, no letter-spaced Thai, no photos or AI images.
- **Natural, different closing:** the result plus a small twist or question that fits this topic; never the same stock line in every clip.
- **Speaking rate** ≈ 14.4 Thai chars/s (`voice.rate`); do not slow the voice to fill time, add a line or a `pause`.
- Deliver `renders/<slug>-final.mp4` (+ `.srt`, `cover.jpg`, `-summary.md`) only.

## Voices (edge-tts, free; `node "$CB" voice --list th-TH`)

One narrator = the teacher (`video.json → voice.voice`). Thai: `th-TH-NiwatNeural` (man, default) or `th-TH-PremwadeeNeural` (woman) — the only two Thai edge voices. English: `en-US-GuyNeural` / `en-US-AndrewNeural` (men), `en-US-AriaNeural` / `en-US-JennyNeural` (women). `voice.edge_rate` ("+8%") and `voice.edge_pitch` ("-10Hz") are optional. A single line may carry `voice: "en"` (an English phrase inside a Thai clip).

## Pro mode (optional)

Free is the default and always complete. Pro only swaps in a better teacher voice through the **user's own** API key. It is never required, never pushed twice, and never blocks the clip.

**What Pro adds here:** premium Thai voices (Gemini / ElevenLabs / OpenAI / Cloudflare) — more natural, more to choose from. No picture service is used: the clip is drawn by code.

When the user picks Pro:
1. Run `node "$CB" keys`. It prints `set` / `not set` per provider (never a value), what each unlocks, where to get it, and the exact line to add for macOS / Windows / Linux. Step-by-step guide for the user: https://videos.genhaha.com/skills#keys. Suggest the easiest first (Gemini: one key; ElevenLabs: exact syllable timing for the mouth and the board writes).
2. A key is `not set`? Walk them through it one small step at a time: open the provider page, create a key, then **they** put it in their shell profile, or run `node "$CB" keys --prepare` (creates a project `.env` with empty lines and adds `.env` to `.gitignore`) and paste the key after the `=` themselves. **Never ask for a key in the chat, never print, echo, log or save one.** If the user pastes a key anyway: do not use or repeat it; tell them to delete that message and rotate (re-create) the key. Run `keys` again to confirm `set`.
3. Use it: `node "$CB" voice --provider gemini` (or `elevenlabs` | `openai` | `cloudflare`; `edge` = free, the default). The voice: `video.json → voice.gemini` (or `.elevenlabs` / `.openai` / `.cloudflare`), else a default. Exact mouth/karaoke timing only with ElevenLabs; the others spread it evenly per line. Cached lines are not re-billed.
4. **Fallbacks are automatic:** key missing → free path with a one-line note; a Pro call fails (wrong key, no credit, rate limit) → the voice step redoes the clip with edge-tts. Tell the user in ONE friendly line ("ใช้เสียงฟรีแทนให้แล้ว คลิปไม่ได้รับผลกระทบ"), do not retry in a loop.

Keys are read only from environment variables or the project `.env`, are sent only to that provider's own API host, and are never shown. Details, models and common errors: [references/ai-providers.md](references/ai-providers.md).

## Network and privacy

Only these touch the network: the one-time installs `doctor` explains (ffmpeg, edge-tts, HyperFrames via npx and its Chrome) and edge-tts reading the script text aloud (Microsoft's free read-aloud service). Fonts and GSAP ship inside the project; the render itself works offline. Only if the user opts in does the script text go to the chosen provider's API with their own key. Problems: [references/troubleshooting.md](references/troubleshooting.md).

## Make the user feel good (applies to every message)

- **Warm and short.** Reply in the user's language, plain words, no jargon or tool names. Start with one friendly line that shows you understood the idea ("ได้เลย เดี๋ยวให้ครูกระดานดำสอนเรื่อง … ให้นะ"), not with a checklist.
- **Say what is happening.** Before a slow step (voice, render) say in one line what you are doing and roughly how long; render takes about a minute for a 30 s clip. Never go silent for a long time, never dump logs.
- **Setup problems are never the user's fault.** If `doctor` or a command fails, give one clear fix in everyday words (the single line to run), then continue. Never show a stack trace or ask them to debug.
- **Offer, don't interrogate.** At most one question before starting, with a recommended default; if the user does not answer or says "ตามสะดวก", go with the default and keep working.
- **Celebrate the result.** Finish with the file and a one-line summary of what the clip teaches, and one natural, different invitation to tweak it (a step, the result, the length). No sales pitch, no long recap.

## Reply

Path of the MP4, length, the teacher's voice, what you checked in the frames (writing on the word, erases clean, mouth, subtitles), and which names, numbers or English words the user should listen for.
