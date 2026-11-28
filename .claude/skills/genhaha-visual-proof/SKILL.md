---
name: genhaha-visual-proof
description: "ทำคลิปพิสูจน์คณิตด้วยภาพแนวตั้ง 9:16 บนพื้นกรมท่าเข้ม รูปทรงแบนเส้นคมค่อยๆ วาดขึ้นทีละส่วนตามเสียงพูด หนึ่งปริมาณหนึ่งสีตลอดคลิป และสมการประกอบออกมาจากรูปทีละพจน์ซ้ายไปขวา มีฉาก 8 แบบ (สร้างรูป จัดเรียงใหม่ เทียบสองข้าง สมการ จุดเรียงเป็นจัตุรัส เส้นจำนวน ขั้นตอน และการ์ดสรุป ∎) ชิ้นส่วนวาดด้วยโค้ด 30 แบบ 4 พาเลตต์ เหมาะกับพีทาโกรัส ผลบวกเลขคี่ มุมในสามเหลี่ยม อัตราส่วน กราฟฟังก์ชัน ซับคาราโอเกะ เสียงพากย์ไทยฟรี (edge-tts) ฟรี ทำบนคอมของคุณใน Claude Code ไม่ต้องมี API key. English: make a vertical 9:16 geometric visual-proof short: flat shapes build on a dark navy ground as the narrator speaks, one colour per quantity, and the equation assembles out of the shapes term by term (8 shot types, 30 code-drawn parts, 4 palettes, free edge-tts voice). Free, runs locally, no API key. You check the maths."
---
<!-- genhaha:ed4a029a9d2b -->
# Visual proof — maths proofs drawn on screen, the equation built from the shapes (runs locally, free)

## วิธีใช้ (สำหรับผู้ใช้ — Claude ข้ามส่วนนี้ได้)

**ทำอะไรได้:** ทำคลิปอธิบายคณิตศาสตร์แนวตั้ง 25–45 วินาที แบบครูวาดบนกระดาน บนพื้นกรมท่าเข้ม ทุกฉากมีหนึ่งความคิด รูปทรงแบนค่อยๆ วาดขึ้นตามเสียงพูด แต่ละปริมาณมีสีของตัวเองตลอดคลิป แล้วสมการก็ประกอบออกมาจากรูป ตัวเลขลอยออกจากรูปที่มันวัดไปลงช่องของมันทีละพจน์ซ้ายไปขวา มีฉาก 8 แบบ ชิ้นส่วน 30 แบบวาดจากโค้ดทั้งหมด 4 พาเลตต์ (กรมท่า ถ่าน ม่วง กระดาษ) ไม่มีภาพ AI ไม่มีรูปถ่าย ฟรีสำหรับทุกคน ไม่ต้องมี key

**ต้องมีอะไร:** Claude Code บนคอม พร้อม Node.js 22+, ffmpeg, Python กับ edge-tts (หรือ uv) และ Chrome หรือ Edge (ตัวใดตัวหนึ่ง) ต่ออินเทอร์เน็ตได้ตอนสร้างเสียงพากย์กับครั้งแรกที่ใช้ HyperFrames (GSAP กับฟอนต์ IBM Plex Sans Thai และ Newsreader มากับสกิลแล้ว) ทดสอบบน macOS เท่านั้น ยังไม่ได้ลองบน Windows หรือ Linux ใช้บน claude.ai เว็บไม่ได้ เพราะต้องเรนเดอร์บนเครื่องของคุณ

**ติดตั้ง:** แตก zip ลงโฟลเดอร์สกิล เช่น `mkdir -p ~/.claude/skills && unzip -o ~/Downloads/genhaha-visual-proof.zip -d ~/.claude/skills/` แล้วเปิด Claude Code ใหม่ พิมพ์ `/skills` จะเห็นสกิลนี้ ครั้งแรกบอก Claude ว่า “เช็กเครื่องให้หน่อย” (รันคำสั่ง doctor)

**พิมพ์สั่งอย่างไร:** เช่น
- “ทำคลิป 30 วินาที พิสูจน์ทฤษฎีบทพีทาโกรัสด้วยการจัดเรียงสามเหลี่ยมสี่ชิ้น”
- “อธิบายว่าทำไมมุมในสามเหลี่ยมรวมกันได้ 180 องศา ใช้พาเลตต์กระดาษ”
- “ทำคลิปผลบวก 1 ถึง 10 ด้วยภาพบันไดสองชุดต่อกัน”
- “แก้คลิปเมื่อกี้ ให้ฉากที่สามเป็นเส้นจำนวนแทน แล้วเรนเดอร์ใหม่”

**ได้อะไรกลับมา:** MP4 1080×1920 พร้อมเสียงพากย์ เพลง และเสียงประกอบ ไฟล์ซับ SRT และสรุปงาน (มีบรรทัดแจ้งว่าใช้เสียง AI ให้แปะในโพสต์) อยู่ใน `./videos/<วันที่>_<ชื่อ>/renders/` เฟรมแรกของคลิปคือภาพปก

**เสียงให้ดีขึ้น (ไม่บังคับ):** ใช้เสียงฟรี edge-tts ได้เลย ถ้าอยากได้เสียงธรรมชาติขึ้น ใส่ key ของ Gemini, ElevenLabs, OpenAI หรือ Cloudflare ได้ ดู `references/ai-providers.md` (key อยู่ในเครื่องคุณเท่านั้น ห้ามพิมพ์ในแชต) ถ้าไม่มี key หรือเรียกไม่สำเร็จ จะใช้แบบฟรีให้อัตโนมัติ

**ข้อควรรู้:** คณิตในคลิปสาธิต (1 + 3 + 5 + 7 = 16 = 4² และผลบวกเลขคี่ n ตัวแรกเท่ากับ n²) ตรวจด้วยการคำนวณแล้ว แต่สกิลไม่ได้ตรวจคณิตของคุณให้ ผู้ทำคลิปต้องตรวจเอง สมการเป็นตัวอักษรบนแคนวาส ไม่ใช่ TeX (มียกกำลัง ตัวห้อย เศษส่วนง่าย แต่ไม่มีราก ผลรวม หรือเมทริกซ์) ยังไม่มีใครฟังเสียงและดูการเคลื่อนไหวของคลิปสาธิตจริง เฟรมนิ่งเท่านั้นที่ถูกตรวจ

**ถ้าติดปัญหา:** รัน doctor ซ้ำ หรือดู `references/troubleshooting.md`

You write the script (`captions.js`) and the picture data (`scene.js`: palette, inks, shots → figures, equations; plain data, no engine code); `scripts/visual-proof.mjs` does validation, voice, timing, sound, snapshots, cover, SRT and render. Everything is free and stays on the user's machine. This skill is free for everyone (no account, no key, no payment). Cost per clip: $0. No AI images, no downloaded models, no CDN at render time (the kit, GSAP and the fonts are bundled; fonts are SIL OFL, see `template/THIRD-PARTY.md`). Style grammar after the LemoLab style prompts (MIT) in the open-source cinecode project; no text or code from it is copied.

```bash
VP="<this skill's folder>/scripts/visual-proof.mjs"    # e.g. ~/.claude/skills/genhaha-visual-proof/scripts/visual-proof.mjs (quote it)
node "$VP" doctor                                      # Node 22+, ffmpeg, bundled kit, Chrome, HyperFrames, edge-tts
```
If `doctor` shows something missing, tell the user the exact install line it printed and wait. Every command takes `--project <dir>` (default: current directory).

## Look
- Canvas 1080×1920 (9:16 only), one 2D canvas painted as a pure function of time (no GPU, no WebGL, no blur or blend modes), GSAP clock. Dark navy ground by default (`navy`, `charcoal`, `plum`, `paper`); flat shapes with 3 px strokes and translucent fills; dots pop in, lines trace on.
- **One idea per shot, built, never shown whole.** **Colour = meaning:** `ink` maps each quantity to one of six inks (`teal gold coral violet sky lime`, plus neutrals `line sum soft`) and it never changes. **The equation comes out of the picture:** a term with `from` appears on its shape and flies into its slot; terms appear strictly left to right; an operator appears when the next term lands. One thing moves at a time.
- 8 shot types: `build`, `rearrange` (dissection proofs), `compare` (two figures, one scale, a sign), `equation` (big result with focus), `array` (L-shaped rings → square numbers), `numberline` (marks, jumps, ratio bars), `steps` (2–5 derivation rows), `qed` (final card, underline + ∎). 30 parts (`poly tri rtri square sqside rect circle ngon sector seg arrow arc jump graph angle right brace dim ticks mark label point dot grid dots cells gnomon bar numline axes`). 6 cameras, 4 enters, 4 transitions, 3 grounds.
- Text: the title on top (y 330), the figure in the middle (x 70–1010), the equation under it in Newsreader (168–196 px, Thai in IBM Plex Sans Thai), subtitles at y 1392–1524 with one accent word. Everything inside the phone safe area (y 250–1520; nothing right of x 960 below y 900); the kit lays it out.
- Never: emoji, glass cards, camera shake, letter-spaced Thai, photos or AI pictures, people or brands, maths you did not check.

## Step 0 — ask the user first (once)
Ask **once**, in one short friendly message in the user's language; skip what is already answered; "ตามสะดวก" = defaults.
1. **The fact to prove or show** (one idea: a theorem, a pattern, a ratio); 2. **Length** (default 30 s) and language (Thai default); 3. **Look**: palette (`navy` default, `charcoal`, `plum`, `paper`). Narrated Thai by default (edge-tts voice, free).

## Steps
1. **Brief** — the fact, language (`th` default), length, palette. A hook question + 3–5 shots that build the idea + a `qed` card with the general result. Check the maths by calculation yourself (every equation on screen, every number in the narration); write it in `video.json → story.fact_notes`. If a claim is not a proven or well-known result, do not state it as true.
2. **Craft** — read `references/visual-proof-craft.md` (script rules, every shot type and its keys, equation tokens, all 30 parts, times, layout, a worked demo). A new clip = rewrite `captions.js` and `scene.js`; never `vp-*.js`.
3. **Scaffold** — `node "$VP" new <slug> --title "…" [--blank] [--lang en] [--silent]` → `./videos/<date>_<slug>/` with the working 28 s demo to edit (`--blank` = 2 shots; `--silent` = no voice).
4. **Script** — `captions.js`: one chunk per spoken line (a unique `key`, numbers and symbols as Thai words in `say`, `[highlight word]` in `t`, optional `sfx` like `"pop@0.5"`). Thai ≈ 14 characters per second. Hook in the first line; each shot 2.5–7 s.
5. **Scene** — `scene.js`: `palette`, `ink`, defaults, and `shots: { <shotId>: { type, title, figure, eq, … } }` with `at` times like `"a1@0.5"` (half-way through line a1) or `"a1+0.4"`. Shot 1 should show its whole figure within 1.5 s. `node "$VP" catalog` lists every name and the keys of every part.
6. **Sync + lint** — `node "$VP" sync` (lints, then writes the `<section data-shot>` list from `captions.js`; run it again after adding or removing shots). Every error names the path, a "did you mean" and the fix.
7. **Voice** — `node "$VP" voice` (free edge-tts, cached per line; if throttled wait a minute and retry once, never loop) → `assets/voice/voiceover.wav`, `timing.js`, every `<section>` retimed. If edge-tts keeps failing: a Pro key (`references/ai-providers.md`) or a silent clip (`sync --silent`), and tell the user.
8. **Check** — `node "$VP" check`: scene errors, script warnings, `publish.ai_disclosure`, page opens, HyperFrames check, text lengths. Fix every error.
9. **Look at the shots** — `node "$VP" snapshot` (one frame near the END of every shot) and `--at 2,6,10.5` for mid-build frames, then Read `renders/frames/sheet.jpg`. Check: the figure is big and complete, labels do not collide, the equation reads left to right with the right colours, nothing under the subtitles, the maths on screen is right. Fix and re-check.
10. **Cover** — `node "$VP" cover --at 2.5` (a frame with shot 1 built, subtitle hidden; it becomes the first 0.1 s).
11. **Sound** — `video.json → music { mood: calm|warm|bright|playful|none, level 0.1 }`; `sfx` on scene items (`{ t: "16", sfx: "ding" }`, `array.sfx`) or on caption lines (`pop`, `tick`, `ding`, `sparkle`, `chime`; `node "$VP" sfx --list`). A `qed` shot adds a chime on its ∎. Quiet beats loud.
12. **Render** — `node "$VP" render` → `renders/<slug>-final.mp4`, `<slug>.th_TH.srt`, `-summary.md`. About 0.7 s of render per clip second plus about 10 s for check and mix. Intermediates are deleted.
13. **Verify** — `node "$VP" frames --video renders/<slug>-final.mp4 --every 2` and Read the sheet; `ffprobe` for size and duration. You cannot listen: tell the user which numbers, letters (n, a, b, c) and maths words to check by ear.

## Rules that matter
- Correct maths only: every equation checked by calculation; say "for every counting number n" only for proven results; never present a guess or a special case as a general rule. No real brands or people.
- `video.json → publish.ai_disclosure` must be filled (`check` fails without it).
- 14 Thai characters per second, hook in the first line, a natural different closing each clip, no stock "comment below".
- One idea per shot; each quantity keeps its ink; terms come from their shapes (`from`); at most 15 tokens per equation row (use `eq2`).
- Everything is a function of time: no `Math.random` / `Date.now` / timers; keep GSAP and fonts local.
- Ship only `renders/<slug>-final.mp4` + `.th_TH.srt` + `-summary.md`. Do not publish or upload anything unless the user asks. Keys are optional and only for voices; never print or store them; if a call fails use the free voice.
