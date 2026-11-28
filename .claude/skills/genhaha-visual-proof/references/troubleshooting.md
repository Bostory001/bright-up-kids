# Troubleshooting

Run `node "$VP" doctor` first (add `--online` to test edge-tts and which hosts are reachable).

## Red "SCENE data error" card / empty shot / "scene not ready"
- The scene is a plain 2D canvas + GSAP clock: no GPU or WebGL is needed. `node "$VP" lint` (also run by `check` and `sync`) prints every named error with the path (`shots.s3.figure[2].part`), what is wrong and a "did you mean".
- `node "$VP" catalog` lists every shot type, part (with its required | optional keys), palette, ink, camera, enter, transition, ground, operator, graph function and sfx.
- Every shot id in `captions.js` needs a key in `scene.js → shots` and a `<section id="sc-<id>" data-shot="<id>">` in `index.html`: run `node "$VP" sync` after adding or removing shots.
- `scene.js` must be ONE assignment `window.VP_SCENE = { ... }` of plain data: no functions, no `=>`, no variables, no `Math.random`.
- A part or term that never appears: its `at` names a caption key that does not exist (`"a2@0.5"` needs a line with `key: "a2"`), or the time is after the shot ends. A term with `from` must name an item `id` in the same shot.
- "terms out of reading order" warning: equation terms always appear left to right; a later `at` on an earlier term holds the whole row back. Give the terms rising times.
- "shot builds slowly" warning on shot 1: the first picture should be complete within about 1.5 s (people scroll away). Use `at: 0, 0.1, 0.2 …` or `enter: "fade"`.

## Layout and text
- Fonts: IBM Plex Sans Thai (Thai text) and Newsreader (the maths) from `fonts/` (SIL OFL, local). Emoji anywhere is an error.
- Limits the checker enforces: title 28 characters, step row 34, note 40, subtitle 68 (2 lines), at most 15 tokens in one equation row, 2–5 step rows, arrays of 1–8.
- The kit lays out everything itself (title y 330, figure from y 372 down to the equation, equation rows at most 840 px wide, subtitles y 1392–1524). A long equation breaks before its last "=" onto a second row (`eq2` does it on purpose). It does not shrink into tiny text.
- Text is painted on the canvas, so no tool can measure it: look at `renders/frames/sheet.jpg`. Known overlaps: an `rtri` side label against a `sqside` label on the same side; a number-line label under a `jump` arrow head.
- A square figure (dots 4×4) is limited by height and fills about 55–70 % of the width; `compare` shows two figures at one scale, so each side is smaller.

## Voice (edge-tts)
- `edge-tts failed ... No audio was received`: the free Microsoft service throttles bursts or blocks the network. The script retries missing lines up to 3 times with pauses; run `voice` once more after a minute (finished lines are cached). If it keeps failing, use a provider key (`references/ai-providers.md`), make a silent clip (`new <slug> --silent`, or `sync --silent`), or run on your own computer. Do not loop.
- Numbers and maths must be words in `say` (`"สี่กำลังสอง"`, `"เอ็นกำลังสอง"`), or the voice reads symbols badly. Listen to every number yourself.
- English text with a Thai voice (or the reverse) gives silence or this same error: set `video.json -> voice.voice` and `voice.language` to match the captions, and `<html lang>`.
- `no caption for shot "x"`: every shot id in captions.js needs a `<section id="sc-x" data-shot="x">` in index.html, in the same order (`sync`).
- Sub-step times inside a line (`"a2@0.6"`) are a fraction of the spoken line, not word times: a term can lead or trail the word by about 0.3 s. Move the fraction if it is off.

## HyperFrames / Chrome
- `render` needs Chrome, Edge or Chromium (or HyperFrames' own headless shell). None found: `node "$VP" chrome` (about 100 MB download) or set `CHROME_PATH`.
- `audio_src_not_found assets/voice/voiceover.wav`: run `voice` first (or `sync --silent` for a silent clip).
- `check --verbose` shows HyperFrames' routine warnings that `check` hides.
- The first run downloads HyperFrames through `npx` (internet once, then cached).

## Render time
- Measured on an Apple-silicon Mac: a 25 s clip = about 7 s check + 18 s render + 2 s mix (about 0.7 s of render per second of video). If the render crashes on a headless server, add `--software`; `--quality draft` is faster for tests.

## Sound
- Everything is synthesized by ffmpeg (no samples). `node "$VP" sfx --list` names every sound. Cues come from two places: `sfx:` on caption lines (`"pop@0.5"`) and `sfx` fields in scene.js (on a part, an equation term, an array ring, a mark or a step row; a `qed` shot adds a chime on its ∎). Scene cues closer than 0.2 s keep the more important one, and only about 10 per 30 s are kept.
- No scene-cut sound by default (set `sfx.scene_cut` in video.json to `"whoosh"` if you want one).
- The final has no audio? `render` warns when the mean level is below -60 dB; check `music.mood` and the voice step.

## Windows
- Use `node "%VP%" ...` from PowerShell or cmd. `npx` is started through the shell automatically (`winfix.mjs`). Windows is untested here.
<!-- genhaha:ed4a029a9d2b -->
