---
name: genhaha-cutout-explainer
description: ทำคลิปอธิบายแนวตั้ง 9:16 สไตล์ผ้าสักหลาด/กระดาษตัดสีพาสเทล เรื่อง "ถ้าโลกนี้ไม่มี…" ป้ายแคปซูล การ์ดมือถือ/UI จอแบ่งเฉียง ตาราง 2×2 พิธีกรหัวกลมใส่แว่นกลมมีสีหน้า ท่าแขน ปากขยับตามเสียงจริง ซับคาราโอเกะไม่ตัดกลางคำ เสียงพากย์ไทยฟรี (edge-tts) เพลงและเสียงประกอบสร้างจากโค้ด ทำงานบนคอมของคุณใน Claude Code ฟรี ไม่ต้องมี API key. English: make a vertical 9:16 pastel felt-cutout "what if the world had no…" explainer (44 flat SVG props, 9 backgrounds, capsule labels, phone/UI cards, diagonal split screens, 2x2 matrix, a round-head glasses presenter with 9 faces and 15 arm poses whose mouth follows the real voice, 2-row karaoke subtitles), locally and free with edge-tts, synthesized SFX and music.
---
<!-- genhaha:5f8f980bb7f3 -->
# Cutout Explainer — pastel felt-cutout "what if the world had no…" shorts (runs locally, free)

## วิธีใช้ (สำหรับผู้ใช้ — Claude ข้ามส่วนนี้ได้)

**ทำอะไรได้:** ทำคลิปอธิบายแนวตั้ง 30–60 วินาที เรื่อง "ถ้าโลกนี้ไม่มีไฟฟ้า / เงินสด / อินเทอร์เน็ต…" ภาพเป็นรูปทรงแบนสีพาสเทลเหมือนตัดจากผ้าสักหลาด มีเงาใต้ทุกชิ้นและลายผ้าเบาๆ ป้ายคำแบบแคปซูล การ์ดมือถือ จอแบ่งเฉียงเทียบสองด้าน ตาราง 2×2 สรุปท้ายเรื่อง และพิธีกรหัวกลมใส่แว่นกลมที่เปลี่ยนสีหน้า ยกแขนชี้ และอ้าปากตามเสียงพากย์จริง ซับคาราโอเกะคำที่กำลังพูดเป็นสีเหลือง ไม่เกินสองแถวและไม่ตัดกลางคำ ฟรี ไม่ต้องมี key ภาพทั้งหมดวาดจากโค้ด ไม่มีภาพ AI

**ต้องมีอะไร:** Claude Code บนคอม (Mac, Windows หรือ Linux) พร้อม Node.js 22+, ffmpeg, Python กับ edge-tts (หรือ uv), Chrome หรือ Edge (ไม่ต้องมี GPU) และต่ออินเทอร์เน็ตได้ตอนสร้างเสียงพากย์และครั้งแรกที่ใช้ HyperFrames (GSAP และฟอนต์มากับสกิลแล้ว) ใช้บน claude.ai เว็บไม่ได้ เพราะต้องเรนเดอร์บนเครื่องของคุณ

**ติดตั้ง:** แตก zip ลงโฟลเดอร์สกิล เช่น `mkdir -p ~/.claude/skills && unzip -o ~/Downloads/genhaha-cutout-explainer.zip -d ~/.claude/skills/` แล้วเปิด Claude Code ใหม่ พิมพ์ `/skills` จะเห็นสกิลนี้ ครั้งแรกบอก Claude ว่า “เช็กเครื่องให้หน่อย” (รันคำสั่ง doctor)

**พิมพ์สั่งอย่างไร:** เช่น
- “ทำคลิป 45 วินาที ถ้าโลกนี้ไม่มีเงินสด ฮุกตื่นมา ATM กดไม่ได้ แล้วไล่ผลกระทบ จบด้วยตาราง 4 หน้าที่ของเงิน”
- “ทำคลิปอธิบาย ถ้าอินเทอร์เน็ตล่มหนึ่งวัน 40 วินาที บรรยายไทย”
- “ทำคลิป what-if ถ้าโลกนี้ไม่มีนาฬิกา 30 วินาที”
- “แก้คลิปเมื่อกี้ ให้ฉากสุดท้ายเป็นการ์ดให้เลือก 3 ใบ แล้วเรนเดอร์ใหม่”

**ได้อะไรกลับมา:** MP4 แนวตั้ง 1080×1920 พร้อมเสียงพากย์ เพลง และเสียงประกอบ ไฟล์ซับ SRT และสรุปงาน (มีบรรทัดแจ้งว่าใช้ AI/ตัวละครสมมติให้แปะในโพสต์) อยู่ใน `./videos/<วันที่>_<ชื่อ>/renders/` เฟรมแรกของคลิปคือภาพปก

**เสียงให้ดีขึ้น (ไม่บังคับ):** ใช้เสียงฟรี edge-tts ได้เลย ถ้าอยากได้เสียงธรรมชาติขึ้น ใส่ key ของ Gemini, ElevenLabs, OpenAI หรือ Cloudflare ได้ ดู `references/ai-providers.md` (key อยู่ในเครื่องคุณเท่านั้น ห้ามพิมพ์ในแชต) ถ้าไม่มี key หรือเรียกไม่สำเร็จ จะใช้แบบฟรีให้อัตโนมัติ

**ถ้าติดปัญหา:** รัน doctor ซ้ำ หรือดู `references/troubleshooting.md`

You write the story (`captions.js`) and the scene script (the `K.scene(...)` blocks in `index.html`); `scripts/cutout.mjs` does validation, voice, timing, sound, snapshots, cover, SRT and render. Everything is free and stays on the user's machine. Cost per clip: $0. No AI images, no downloaded models, no CDN at render time (the kit, GSAP and Kanit are bundled).

```bash
CO="<this skill's folder>/scripts/cutout.mjs"     # e.g. ~/.claude/skills/genhaha-cutout-explainer/scripts/cutout.mjs (quote it)
node "$CO" doctor                                  # Node 22+, ffmpeg, bundled engine, Chrome, HyperFrames, edge-tts
```
If `doctor` shows something missing, tell the user the exact install line it printed and wait.

## Look
- Canvas 1080×1920 (9:16), plain SVG + GSAP (no GPU needed). Flat pastel felt cutouts with no outlines (a darker lower layer instead), a soft drop shadow under every piece, felt grain + fibre + vignette over the frame, polka / stripe / checker / room / sky / night backgrounds, a slow push-in, pieces that pop in with an overshoot, diagonal-wipe / curtain / pop scene changes.
- 44 props (phone with 7 screens, clock, bulb, fridge, thermometer, car, traffic light, ATM, hospital, calendar, coin, map, skyline, kettle …), 9 backgrounds, capsule labels, solid phone/UI cards, ready shots: close-up, diagonal split screen, 2×2 flip-card matrix, 1–4 option cards. One original round-head presenter with big round glasses (9 faces, 15 arm poses, blinks); his mouth follows the loudness of the real voice. Original designs only: no real people, no real brands, no copied characters.
- Subtitles: Kanit ExtraBold with a navy stroke at y 1330, at most 2 rows 840 px wide, phrases (the spaces you write) stay whole, wrapping only between dictionary words, the spoken word turns yellow. No emoji, no glass cards, no letter-spaced Thai, no camera shake except one `K.shake` on a shock beat.
- Phone safe area: text only inside y 250–1520 and not right of x 960 below y 900 (`check` measures it every 0.5 s). Pill centres at y ≥ 320.
- Sound is synthesized (no samples): a soft whoosh on scene cuts, per-line cues (`pop`, `ding`, `boom`, `sparkle` …) and a procedural music bed (`playful` default, ducked under the voice).

## Step 0 — ask the user first (once)
Before writing anything, ask **once**, in one short friendly message in the user's language (use the question tool if you have one). Skip every item already answered; never block the clip on it. "ตามสะดวก" / "แล้วแต่" = take the defaults.
1. **The topic** — "ถ้าโลกนี้ไม่มี …" what? (or another everyday what-if / how-does-it-work idea) and the angle: funny consequences, systems that break, or a flip to the good side.
2. **Length** — 30–60 s (default 45 s).
3. **Language** — Thai (default) or English. The clip is **narrated** by default (free edge-tts voice + karaoke subtitles); a silent version is possible on request.
Pro voices (the user's own key) are optional and never asked for in chat; if the user wants them, run `node "$CO" keys` and follow `references/ai-providers.md`.

## Steps
1. **Brief** — topic, language, length. Plan 8–11 shots of 3–6 s: an abnormal everyday hook → first funny consequence → structural consequences → a flip → a 2×2 summary → a closing question or comment invite (worded differently every clip). Say facts only when you are confident; note every claim you could not verify (you will tell the user).
2. **Craft** — read `references/cutout-craft.md` (scene script API, 44 props, 9 backgrounds, faces, poses, layouts, shot cookbook, lessons). A new clip = rewrite `captions.js` and the scene script + the `<section data-shot>` list in `index.html` — never `engine/*`.
3. **Scaffold** — `node "$CO" new <slug> --title "…" [--lang en] [--blank]` → `./videos/<date>_<slug>/` with the working 47 s demo ("ถ้าโลกนี้ไม่มีไฟฟ้า 1 วัน", 10 shots) to edit; `--blank` = a 2-shot skeleton.
4. **Script** — `captions.js`: one chunk per spoken line (≤ ~26 Thai letters, spaces between meaning groups, numbers as words, a unique `key`, `pause`, `sfx`). Thai ≈ 14.4 characters per second. Hook in the first line.
5. **Scene** — the scene script in `index.html`: one `K.scene(id, background, { enter })` per section; props with `L.add(K.prop(name, opts), x, y, { t })`, times from `at("key")` / `atW("key","word")`; the presenter with `L.char(...)`, `.say(key)`, `.face`, `.pose`. Use only catalog names (wrong names give named errors with "Did you mean").
6. **Voice** — `node "$CO" voice` (free edge-tts, cached per line; if the service throttles wait a minute and retry once, never loop) → `assets/voice/voiceover.wav`, `timing.js` (line times, per-character times, mouth envelope), every `<section>` retimed to the voice.
7. **Check** — `node "$CO" check`: named SCENE errors, script warnings, `publish.ai_disclosure` present, HyperFrames check, safe area. Fix every error.
8. **Look at the shots** — `node "$CO" snapshot` (one frame per spoken line; `--at 1,5,9` for exact seconds), open `renders/frames/sheet.jpg` with Read and LOOK: presenter and props visible, nothing clipped or overlapping, text in the safe area, subtitles ≤ 2 rows, nothing floating. Fix and repeat.
9. **Cover** — `node "$CO" cover --at 1.2 [--title "…|…"]`: a frame laid over the first 0.1 s of the final so the first frame is the thumbnail. Pick a second without a label under the title.
10. **Sound** — `node "$CO" sfx --list`; `video.json → music { mood: playful|calm|warm|bright|dark|none, level 0.12 }`, `sfx { scene_cut: "whoosh" }`. Prefer quiet to loud.
11. **Render** — `node "$CO" render` → `renders/<slug>-final.mp4`, `<slug>.th_TH.srt`, `<slug>-summary.md`. Intermediates are deleted; the render refuses to start while the scene has errors.
12. **Verify** — `node "$CO" frames --video renders/<slug>-final.mp4 --every 3` and Read the sheet; `ffprobe` shows 1080×1920 and the duration; the render prints the audio level. You cannot listen: tell the user which sounds to check by ear (voice and any English words, the cue sounds, music level under the voice, whether the mouth looks in time).

## Rules that matter
- Original designs and invented characters only. No real people or faces, no real brands or logos, no real private victims. A what-if explainer is framed as "ถ้า…", so it is fine; still say facts only when you are confident, keep claims general ("มักจะ", "หลายที่"), no invented statistics or quotes, and list in your reply every fact you could not verify. `video.json → publish.ai_disclosure` must be filled — `check` fails without it and the summary gives the line to paste into the post.
- No emoji, no glass cards (solid cards only), no letter-spaced Thai, no camera shake except one `K.shake` on a shock beat. Text only in y 250–1520 and left of x 960 below y 900.
- Narration 14.4 Thai characters per second (`voice` applies the tempo and prints the result), hook in the first line, shots 2.5–7 s, a natural different closing each clip (no stock "comment below" formula).
- Every pixel is a function of time: no `Math.random` / `Date.now` / `requestAnimationFrame` (use `K.rng(seed)`); keep GSAP and fonts local (no CDN links) so the render works offline.
- Ship only `renders/<slug>-final.mp4` + `.th_TH.srt` + `-summary.md`. The first frame is the picked thumbnail. Do not publish or upload anything unless the user asks.
- Always `check` and look at `snapshot` before a full render, and at the final frames after. Keys are optional and only for voices; never print or store them; if a call fails use the free voice.
