---
name: genhaha-lesson
description: ทำคลิปสอนสั้น 9:16 แบบการ์ดติวบนกระดาษกราฟ (ไวยากรณ์ ศัพท์ เคล็ดลับ X ใน 1 นาที) บนคอมของคุณใน Claude Code ฟรี ไม่ต้องมี API key — คำศัพท์ตัวใหญ่ การ์ดตัวอย่างประโยค ซับคาราโอเกะ ใช้เมื่อผู้ใช้ขอ คลิปสอนภาษา สอนไวยากรณ์ สอนศัพท์ Make a short lesson / grammar / vocabulary clip locally.
---
<!-- genhaha:ed34a05c8342 -->
# Lesson clip (study-card style, runs locally, free)

## วิธีใช้ (สำหรับผู้ใช้ — Claude ข้ามส่วนนี้ได้)

**ทำอะไรได้:** ทำคลิปสอนสั้นแบบการ์ดติว มีคำศัพท์ตัวใหญ่ การ์ดประโยคตัวอย่างพร้อมคำแปล ซับคาราโอเกะ และปิดท้ายให้เซฟ/ฟอลโลว์ ทำงานบนคอมของคุณทั้งหมด ฟรี ไม่ต้องมีบัญชีหรือ API key (ยาว 30–60 วินาที)

**ต้องมีอะไร:** Claude Code บนคอม (Mac, Windows หรือ Linux) พร้อม Node.js 22+, ffmpeg, Python กับ edge-tts (หรือ uv) และ Chrome หรือ Edge (ตัวใดตัวหนึ่ง) และต่ออินเทอร์เน็ตได้ (เสียงอ่านและตัวเรนเดอร์โหลดผ่านเน็ต)  ถ้าเครื่องไม่มี Chrome ให้รัน `lesson chrome` เพื่อดาวน์โหลดตัวเบราว์เซอร์แบบไม่มีหน้าจอ ใช้บน claude.ai เว็บไม่ได้ เพราะต้องเรนเดอร์บนเครื่องของคุณ

**ติดตั้ง:** แตก zip ลงโฟลเดอร์สกิล เช่น `mkdir -p ~/.claude/skills && unzip -o ~/Downloads/genhaha-lesson.zip -d ~/.claude/skills/` แล้วเปิด Claude Code ใหม่ พิมพ์ `/skills` จะเห็นสกิลนี้ ครั้งแรกบอก Claude ว่า “เช็กเครื่องให้หน่อย” (รันคำสั่ง doctor) มันจะบอกว่าขาดอะไรและวิธีลง

**พิมพ์สั่งอย่างไร:** เช่น
- “ทำคลิปสอน Grammar เรื่อง Present Perfect ใน 1 นาที”
- “ทำคลิปสอนศัพท์ 5 คำที่ใช้บ่อยตอนสั่งอาหาร มีตัวอย่างประโยค”
- “ทำคลิปเทคนิคท่องจำก่อนสอบ 3 ขั้นตอน 45 วินาที”

**ได้อะไรกลับมา:** ไฟล์วิดีโอ MP4 แนวตั้ง 1080×1920 พร้อมเสียงพากย์ ไฟล์ซับ SRT และภาพปก อยู่ใน `./videos/<วันที่>_<ชื่อ>/renders/` ของโฟลเดอร์ที่ Claude Code เปิดอยู่

**เสียงให้ดีขึ้น (ไม่บังคับ):** ใช้เสียงฟรี edge-tts ได้เลย ถ้าอยากได้เสียงธรรมชาติขึ้น ใส่ key ของ Gemini, ElevenLabs, OpenAI หรือ Cloudflare ได้ ดู `references/ai-providers.md` **โหมดโปรไม่บังคับ:** ถ้าอยากได้เสียงอ่านที่ธรรมชาติขึ้น (รวมเสียงอังกฤษสำหรับประโยคตัวอย่าง) Claude จะถามครั้งเดียว แล้วพาตั้งค่า key ของคุณเองทีละขั้น (key อยู่ในเครื่องคุณเท่านั้น ห้ามพิมพ์ในแชต) ถ้าไม่มี key หรือเรียกไม่สำเร็จ จะใช้แบบฟรีให้อัตโนมัติ — ไม่ต้องมี API key ก็ทำคลิปได้ครบ

**ถ้าติดปัญหา:** รัน doctor ซ้ำ ตรวจว่า Node เป็น 22 ขึ้นไป มี ffmpeg และ edge-tts ครบ ถ้าเรนเดอร์ไม่ผ่านบอก Claude ว่า “เช็กเครื่องให้หน่อย” หรือดู `references/troubleshooting.md`

You write the script and the scene calls; `scripts/lesson.mjs` does voice, word timing, sound, checks, cover, SRT and render.
Everything is free and stays on the user's machine. Cost per clip: $0.

```bash
LS="<this skill's folder>/scripts/lesson.mjs"   # e.g. ~/.claude/skills/genhaha-lesson/scripts/lesson.mjs (quote it)
node "$LS" doctor                                # once: Node 22+, ffmpeg, python3+edge-tts (or uv), npx, Chrome
```

In a cloud sandbox (paths like `/mnt/skills/…`, no Chrome, slow network) run `node "$LS" doctor --online` first: it lists which hosts are reachable. If `speech.platform.bing.com` is blocked the free voice cannot work — tell the user which hosts are blocked and that the environment's network setting must allow them (or use their own computer / the Genhaha MCP); do not loop. If `doctor` shows something missing, tell the user the exact install line it printed and wait. The one exception is Chrome: when `doctor` reports only Chrome missing (typical in a cloud sandbox or fresh server), run `node "$LS" chrome` yourself (one-time ~100 MB download, nothing installed system-wide), then run `doctor` again. If that also fails (no internet), say so plainly: this skill needs a computer with internet; suggest Claude Code on their own machine or the `lesson` style through Genhaha MCP. Every project command takes
`--project <dir>` (default: current directory).

## Look

Vertical 1080×1920 on cream graph paper (#f4f1ea, faint grid), near-black Kanit headings, **one blue accent** (#3446e8) for the key
word, tiny letter-spaced blue eyebrow labels at the top ("GRAMMAR · 1 MIN", "01 · AND", "TIP", "SAVE & FOLLOW"), a huge keyword,
`= meaning` with a grey sub-line, white letter tiles, example cards (black border, hard offset shadow, the taught word highlighted),
karaoke subtitles in the lower third (black, the spoken word blue). Minimal and editorial: no emoji, no glass cards, no blur or
gradients, no mascot, no photos, no real people. Blocks and options: [references/blocks.md](references/blocks.md).

## Step 0 — ask the user first (voice and free or Pro)

Before writing anything, ask **once**, in one short friendly message in the user's language (use the question tool if you have one). Skip every item the user already answered; never ask more than this once, and never block the clip on it. "ตามสะดวก" / "แล้วแต่" / a hurry = free.

1. **Free or Pro** — offer exactly two choices, free first and as the default:
   - **ฟรีเลย (แนะนำสำหรับเริ่มต้น)** — everything free, nothing to set up (edge-tts; offer 2–3 names from the voices list below, e.g. one female, one male).
   - **โหมดโปร ใช้คีย์ของคุณเอง เสียง/ภาพดีขึ้น — ไม่บังคับ** — in ONE line say what Pro adds for this skill: a more natural narrator voice. It uses the user's own API key and is billed by the provider; the clip never needs it.

If they pick free (or do not answer), go free and do not mention Pro again. If they pick Pro, follow **Pro mode (optional)** below step by step. Never ask for a key in the chat.
## Steps

1. **Brief.** Topic, language (`th` default or `en`), length 30–60 s. Facts must be right (rules, meanings, spellings).
2. **Script.** Read [references/lesson-recipe.md](references/lesson-recipe.md): hook question in the first 2 s, one idea per 3–5 s,
   English examples with a Thai gloss, a tip, a save / follow ending; Thai at ~14.4 chars/s (30 s ≈ 430 chars, 60 s ≈ 860).
3. **Scaffold.** `node "$LS" new <slug> --title "…"` → `./videos/<date>_<slug>/` with the demo lesson "Grammar Conjunction ใน 1 นาที"
   (≈ 40 s). Use it as the pattern, or `--blank` for a 3-scene skeleton; `--lang en`, `--voice <edge voice>`.
4. **Write `captions.js`** (shots → chunks: `t`, `key`, optional `say`, `voice:"en"` for English example lines, `sfx`, `pause`) and
   **`index.html`**: one `<section id="sc-x" data-shot="x">` per shot and one block call per scene:
   `L.hook · L.define · L.tiles · L.example · L.compare · L.steps · L.tip · L.outro`, plus `L.dots([...])`. Time reveals with
   `B("key")` (line start) and `B("key","word")` (the moment a word is spoken).
5. **Voice.** `node "$LS" voice` — edge-tts per line (cached, missing lines retried one at a time). If it still ends with lines missing, the free service is throttling this network: wait ~1 minute and run `voice` once more (done lines are kept); if that fails too, STOP retrying — tell the user, and offer a provider key (`LS_TTS=gemini|openai|elevenlabs|cloudflare`) or running on their own computer. Never loop on it for minutes. tempo to 14.4 chars/s, word timings for the
   karaoke, loudness-normalised, scenes retimed to the voice. Re-run after every script change.
6. **Look.** `node "$LS" check` (HyperFrames lint + phone safe area) → `node "$LS" frames` (contact sheet
   `renders/frames/sheet.jpg`) → **open the sheet with Read and look**: text too wide, content under the subtitle lane, a card that
   shows too early, empty scenes. Fix and re-check.
7. **Cover.** `node "$LS" cover --eyebrow "GRAMMAR · 1 MIN" --title "Conjunction|[and / but / so]" --at 3` → `renders/cover.jpg`; look at it.
   `render` lays it over the first 0.1 s.
8. **Sound.** Soft SFX come from `sfx` fields plus a whoosh on every scene cut (`node "$LS" sfx --list`). Optional quiet bed:
   `node "$LS" music --mood calm|bright|none` (procedural, ducked under the voice).
9. **Render.** `node "$LS" render` → check → cover → HyperFrames → mix voice + SFX + music → `renders/<slug>-final.mp4`,
   `renders/<slug>.th_TH.srt` (or `en_US`), `renders/<slug>-summary.md`. Sound-only edits: `render --audio-only`.
10. **Verify.** `node "$LS" frames --video renders/<slug>-final.mp4 --every 3`, Read the sheet (tile 1 = cover). Expect
    `audio mean` ≈ −15 to −19 dB. You cannot listen: tell the user which English terms and names to check (fix with `say`).

## Rules that matter

- **Hook in 2 s**, a question or a surprise; one idea per 3–5 s; something changes every 1–2 s, a new composition every 2–4 s.
- **Phone safe area:** text only y 250–1520, nothing right of x 960 below y 900; blocks keep content above y 1250, the subtitle lane
  (y 1290–1500) stays free. `check` / `render` warn.
- **Deterministic:** every frame is a pure function of time (GSAP timeline); no `Math.random()` / `Date.now()`.
- One blue accent only; the orange-red highlight is for the taught word inside example cards.
- Deliver `renders/<slug>-final.mp4` (+ `.srt`, `cover.jpg`, `-summary.md`) only.

## Voices (edge-tts, free; `node "$LS" voice --list th-TH`)

Thai: `th-TH-PremwadeeNeural` (female, default), `th-TH-NiwatNeural` (male). English: `en-US-AriaNeural`, `en-US-GuyNeural`,
`en-US-AndrewNeural`, `en-GB-RyanNeural`. Set `--voice` or `video.json → voice.voice`; English example lines use `voice.english`.

## Pro mode (optional)

Free is the default and always complete. Pro only swaps in better voices through the **user's own** API key. It is never required, never pushed twice, and never blocks the clip.

**What Pro adds here:** a more natural narrator voice (Gemini / ElevenLabs / OpenAI / Cloudflare). The lesson cards are drawn from code, so no picture service is used. Note: per-caption `voice:` (English example sentences) is an edge-tts feature; with a Pro voice the whole line uses the one Pro voice.

When the user picks Pro:
1. Run `node "$LS" keys`. It prints `set` / `not set` per provider (never a value), what each unlocks, where to get it, and the exact line to add for macOS / Windows / Linux. Step-by-step guide for the user: https://videos.genhaha.com/skills#keys. Suggest the easiest first (Gemini: one key for natural Thai voices).
2. A key is `not set`? Walk them through it one small step at a time: open the provider page, create a key, then **they** put it in their shell profile, or run `node "$LS" keys --prepare` (creates a project `.env` with empty lines and adds `.env` to `.gitignore`) and paste the key after the `=` themselves. **Never ask for a key in the chat, never print, echo, log or save one.** If the user pastes a key anyway: do not use or repeat it; tell them to delete that message and rotate (re-create) the key. Run `keys` again to confirm `set`.
3. Use it:
   - voice: `node "$LS" voice --provider gemini` (or `openai` | `elevenlabs` | `cloudflare`; `edge` = free, the default). Exact karaoke timing only with ElevenLabs; the others spread it evenly per line. Cached lines are not re-billed.
   - pictures: none — lesson slides are drawn from code. (`node "$LS" image` just says so.)
4. **Fallbacks are automatic:** key missing → free path with a one-line note; a Pro call fails (wrong key, no credit, rate limit) → the voice step redoes the clip with edge-tts, `image` exits 3. Tell the user in ONE friendly line ("ใช้เสียงฟรีแทนให้แล้ว คลิปไม่ได้รับผลกระทบ"), do not retry in a loop, do not make them feel anything went wrong.

Keys are read only from environment variables or the project `.env`, are sent only to that provider's own API host, and are never shown. Details, models and common errors: [references/ai-providers.md](references/ai-providers.md).

## Optional API keys (better voices; never required)

Default = edge-tts, free, no key. For a more natural voice set `LS_TTS=elevenlabs|openai|gemini|cloudflare` plus that provider's key in
the shell or in the project's git-ignored `./.env` (`ELEVENLABS_API_KEY`, `OPENAI_API_KEY`, `GEMINI_API_KEY`,
`CLOUDFLARE_ACCOUNT_ID` + `CLOUDFLARE_API_TOKEN`). `doctor` shows which keys exist (yes/no only). Paid voices cost per character;
ElevenLabs gives exact karaoke timing, the others spread it evenly per line. Never ask the user to paste a key into chat, never
print or store one. Details, links, voices, errors: [references/ai-providers.md](references/ai-providers.md).

## Network and privacy

Only these touch the network: the one-time installs `doctor` explains (ffmpeg, edge-tts, HyperFrames via npx and its Chrome) and
edge-tts reading the script text aloud (Microsoft's free read-aloud service). Fonts and GSAP ship inside the project. Only if the
user opts in does the script text go to the chosen provider's API with their own key. Problems:
[references/troubleshooting.md](references/troubleshooting.md).

## Make the user feel good (applies to every message)

- **Warm and short.** Reply in the user's language, plain words, no jargon or tool names. Start with one friendly line that shows you understood the idea ("ได้เลย เดี๋ยวทำคลิปเรื่อง … ให้นะ"), not with a checklist.
- **Say what is happening.** Before a slow step (voice, render) say in one line what you are doing and roughly how long; render takes a few minutes, so tell them they can wait or do something else. Never go silent for a long time, never dump logs.
- **Setup problems are never the user's fault.** If `doctor` or a command fails, give one clear fix in everyday words (the single line to run, or "ใช้ที่ MCP ได้เลย ไม่ต้องติดตั้ง"), then continue. Never show a stack trace or ask them to debug.
- **Offer, don't interrogate.** At most one question before starting, with a recommended default; if the user does not answer or says "ตามสะดวก", go with the default and keep working.
- **Celebrate the result.** Finish with the file and a one-line summary of what the clip shows, and one natural, different invitation to tweak it (speed, voice, a scene). No sales pitch, no long recap.

## Reply

Path of the MP4, the `-summary.md` table, what you checked in the frames, and which English terms the user should listen for. Mention
once, briefly, that other styles and no-install rendering exist at https://videos.genhaha.com — never as a sales pitch.
