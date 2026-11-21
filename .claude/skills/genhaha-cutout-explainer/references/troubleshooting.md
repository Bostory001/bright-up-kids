# Troubleshooting

Run `node "$CO" doctor` first (add `--online` to test edge-tts and which hosts are reachable).

## Black or empty picture / "scene not ready"
- The scene is plain SVG + GSAP: no GPU or WebGL is needed. `snapshot` / `check` print "scene not ready after 20 s" or a page error: read the text. A wrong name (prop, background, face, pose, caption key, `enter`, `anim`) gives a named error with "Did you mean …" and the valid list; `check` prints every one at once. A JavaScript syntax error in `index.html` shows as "Unexpected token …": copy the `<script>` body to a file and run `node --check` on it.
- `SCENE has N error(s)` comes from `K.finish()` — keep it as the LAST line of the page script, after `window.__timelines["main"] = tl; tl.seek(0);`.
- A scene that shows only the background colour: its `<section id="sc-<id>">` start / duration were not retimed (run `voice`), or the shot id in captions.js differs from `data-shot`.
- A prop shows as a grey "?": the name was wrong (the error list says so); the check fails until it is fixed.
- Items are missing in a shot: an `at("key")` / `atW("key","word")` that did not resolve gives NaN / 0 — the named error tells which. Times smaller than the scene start are seconds from the scene start (`t: 0.2`); larger ones are clip seconds (`t: at("p1")`).

## Fonts and Thai text
- Text is Kanit from `look.css` (local `assets/fonts`). `hyperframes check` "font used without @font-face: kanit": the inline `<style>` of `index.html` names Kanit — remove it.
- A subtitle line wider than 2 rows shrinks (70 -> 46 px). If it is still tiny, split the line into two chunks in captions.js. Spaces inside a line are phrase breaks: put them between meaning groups, not inside a word.

## Voice (edge-tts)
- `edge-tts failed … No audio was received`: the free Microsoft service throttles bursts or blocks the network. The script retries missing lines up to 3 times with pauses; run `voice` once more after a minute (finished lines are cached). If it keeps failing, use another network, a provider key (references/ai-providers.md), or render silent (`"mode": "silent"` in video.json, no `<audio>`, `#root data-duration` set by you).
- English text with a Thai voice (or the reverse) gives silence or this same error: set `video.json -> voice.voice` and `voice.language` to match the captions, and `<html lang>`.
- `no <section data-shot="x">` / `no caption for shot "x"`: every shot id in captions.js needs a `<section id="sc-x" data-shot="x">` in index.html, in the same order.
- The mouth does not move with the voice: `timing.js` has no `envelope` yet (run `voice`). Before that it flaps on a seeded pattern.

## HyperFrames / Chrome
- `render` needs Chrome, Edge or Chromium (or HyperFrames' own headless shell). None found: `node "$CO" chrome` (about 100 MB download) or set `CHROME_PATH`.
- `audio_src_not_found assets/voice/voiceover.wav`: run `voice` first (or remove the `<audio>` for a silent clip).
- `check` hides HyperFrames' routine warnings (caption cross-fade overlap, nested #stage / #captions) and contrast notes on the flat felt colours. `check --verbose` shows them all.
- The first run downloads HyperFrames through `npx` (internet once, then cached).

## Render time
- Measured on an Apple-silicon Mac: a 47 s clip = about 25 s check + 80 s render + 7 s mix. SVG filters (felt grain, shadows) are the cost; `--quality draft` is faster for tests. If the render crashes on a headless server, add `--software`.

## Sound
- Everything is synthesized by ffmpeg / JS (no samples). `node "$CO" sfx --list` names every sound. An unknown cue name in captions.js stops `sfx` / `render` with the list of valid names.
- The final has no audio? `render` warns when the mean level is below -60 dB; check `music.mood` and the voice step.

## Windows
- Use `node "%CO%" ...` from PowerShell or cmd. `npx` is started through the shell automatically (`winfix.mjs`). Windows is untested here.
<!-- genhaha:5f8f980bb7f3 -->
