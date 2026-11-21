// cutout voice — voiceover for the narrator (one voice for the whole clip; a caption may name its own edge `voice`).
// (video.json → voice.voice for edge-tts; voice.gemini / .openai / .elevenlabs / .cloudflare for the optional paid providers).
// edge-tts (free, no key, default) or an optional paid provider via CO_TTS (see references/ai-providers.md)
//   → assets/voice/voiceover.wav + timing.js (line times + per-character karaoke times),
// then retimes every <section> in index.html so scenes follow the voice.
//
//   cutout voice [--project <dir>] [--voice th-TH-PremwadeeNeural] [--rate 14.4 | --rate 0] [--force]
//   cutout voice --list th            list edge voices for a locale prefix
//
// video.json → voice: { voice, language, rate (target chars/s, null = natural), edge_rate "+0%", edge_pitch "+0Hz" }, gap_phrase, gap_shot, tail
// Word timings: edge-tts WordBoundary events (offset/duration per word) are matched to the subtitle characters (LCS);
// characters the voice did not report (spaces, punctuation, `say` rewrites) are interpolated. If less than half of a line
// matches, that line falls back to spreading its characters evenly over the spoken audio.
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import crypto from "node:crypto";
import { spawnSync, execFileSync } from "node:child_process";
import { parseArgs, projectDir, config, loadCaptions, patchTag, SCRIPTS, need } from "./lib/common.mjs";
import { edgePython, EDGE_HINT } from "./lib/python.mjs";
import { stripProvider, freeLine, useFree } from "./lib/pro/index.mjs";
import { loadEnv, pickProvider, DEFAULTS, synth, SPEAKER_DEFAULTS } from "./lib/tts.mjs";

const RATE = 24000;               // edge-tts audio is 24 kHz mono
const DEFAULT_VOICE = { th: "th-TH-NiwatNeural", en: "en-US-GuyNeural" };   // one friendly narrator (th-TH-PremwadeeNeural = woman)
// distinct edge voices handed out to speakers that name none (first = first speaker in the script …)
const EDGE_CAST = { th: ["th-TH-NiwatNeural", "th-TH-PremwadeeNeural"], en: ["en-US-GuyNeural", "en-US-AriaNeural", "en-GB-RyanNeural", "en-US-JennyNeural"] };
const DEFAULT_RATE = { th: 14.4 }; // Thai chars per second (incl. short holds); other languages: natural speed

export async function run(argv) {
  const args = parseArgs(argv);
  need("ffmpeg", "install ffmpeg (brew install ffmpeg / apt install ffmpeg / winget install ffmpeg)");
  const root0 = args.list !== undefined ? null : projectDir(args), cfg0 = root0 ? config(root0) : {};
  const env = loadEnv(root0, process.cwd());
  const pick = pickProvider(env), PROVIDER = pick.provider;
  if (pick.note) console.log(`note: ${pick.note}`);
  const py = PROVIDER === "edge" || args.list !== undefined ? edgePython() : null;
  if ((PROVIDER === "edge" || args.list !== undefined) && !py) throw new Error(`edge-tts is not available — ${EDGE_HINT}`);
  if (args.list !== undefined) {
    if (!py) throw new Error(`edge-tts is not available — ${EDGE_HINT}`);
    const r = spawnSync(py.cmd, [...py.pre, path.join(SCRIPTS, "edge_synth.py"), "--list", args.list === true ? "" : String(args.list)], { stdio: "inherit" });
    process.exit(r.status ?? 0);
  }
  const root = projectDir(args);
  const cfgFile = path.join(root, "video.json");
  const cfg = config(root);
  const LANG = cfg.voice?.language || "th";
  // edge voice lives in voice.voice (as before); other providers use voice.<provider> / CO_VOICE / a built-in default
  const MODEL = PROVIDER === "edge" ? null : env.CO_TTS_MODEL || cfg.voice?.[PROVIDER + "_model"] || DEFAULTS[PROVIDER].model;
  const VOICE = args.voice || (PROVIDER === "edge" ? cfg.voice?.voice || DEFAULT_VOICE[LANG] || DEFAULT_VOICE.en : env.CO_VOICE || cfg.voice?.[PROVIDER] || DEFAULTS[PROVIDER].voice);
  const RATE_TARGET = Number(args.rate ?? cfg.voice?.rate ?? DEFAULT_RATE[LANG] ?? 0) || 0;
  const EDGE_RATE = cfg.voice?.edge_rate || "+0%", EDGE_PITCH = cfg.voice?.edge_pitch || "+0Hz";
  const GAP_PHRASE = Number(cfg.gap_phrase ?? 0.03), GAP_SHOT = Number(cfg.gap_shot ?? 0.22), GAP_TURN = Number(cfg.gap_turn ?? 0.32), TAIL = Number(cfg.tail ?? 1.4), LEAD = 0.3, FADE = 0.6;

  const CAPTIONS = loadCaptions(root);
  if (!CAPTIONS?.length) throw new Error("captions.js has no lines");
  const keys = new Set(); for (const c of CAPTIONS) { if (keys.has(c.key)) throw new Error(`duplicate caption key "${c.key}"`); keys.add(c.key); }
  const dir = path.join(root, "assets/voice");
  fs.mkdirSync(dir, { recursive: true });

  // ---------- 1. synthesize (cached by text + voice + rate + pitch) ----------
  // speakers: video.json → speakers { id: { name, voice, <provider>, rate, pitch } }; a caption's `speaker` is that id (or its name)
  const SPK = cfg.speakers || {};
  const spkId = (c) => { if (!c.speaker) return null; if (SPK[c.speaker]) return c.speaker; const hit = Object.keys(SPK).find((k) => SPK[k].name === c.speaker); return hit || String(c.speaker); };
  const order = [...new Set(CAPTIONS.map(spkId).filter(Boolean))];
  for (const id of order) if (!SPK[id]) throw new Error(`caption speaker "${id}" is not defined in video.json → speakers (defined: ${Object.keys(SPK).join(", ") || "none"})`);
  const castVoice = (id) => {
    const o = SPK[id], k = order.indexOf(id);
    if (PROVIDER === "edge") return o.voice || (EDGE_CAST[LANG] || EDGE_CAST.en)[k % (EDGE_CAST[LANG] || EDGE_CAST.en).length];
    return o[PROVIDER] || (SPEAKER_DEFAULTS[PROVIDER] || [])[k % Math.max(1, (SPEAKER_DEFAULTS[PROVIDER] || []).length)] || VOICE;
  };
  // edge-tts has only two Thai voices: a 3rd/4th speaker reuses one, so shift its pitch to keep them apart (set speakers.<id>.pitch yourself to override)
  const SHIFT = ["-28Hz", "+28Hz", "-14Hz", "+14Hz"], seen = {};
  const spkPitch = {};
  for (const id of order) { const v = castVoice(id), n = (seen[v] = (seen[v] || 0) + 1); spkPitch[id] = SPK[id].pitch || (PROVIDER === "edge" && n > 1 && !SPK[id].voice ? SHIFT[(n - 2) % SHIFT.length] : null); }
  const lines = CAPTIONS.map((c, i) => {
    const text = (c.say ?? c.text).replace(/[\[\]]/g, "").trim();
    const sid = spkId(c), so = sid ? SPK[sid] : null;
    // a caption may still name its own edge voice (voice: "en" = cfg.voice.english, or a full voice name), which beats the speaker's voice
    const own = PROVIDER === "edge" && c.voice ? (c.voice === "en" ? cfg.voice?.english || "en-US-AriaNeural" : String(c.voice)) : null;
    const lv = own || (sid ? castVoice(sid) : VOICE);
    const rate = so?.rate || EDGE_RATE, pitch = (sid && spkPitch[sid]) || EDGE_PITCH;
    const h = crypto.createHash("sha1").update([PROVIDER === "edge" ? "" : PROVIDER + ":" + MODEL, lv, text, rate, pitch].join("|")).digest("hex").slice(0, 10);
    const base = path.join(dir, `line-${String(i).padStart(2, "0")}-${h}`);
    return { c, i, text, voice: lv, speaker: sid, rate, pitch, mp3: base + ".mp3", json: base + ".json" };
  });
  // who speaks with which voice — printed, saved to assets/voice/voices.json, and checked: two speakers must not share a voice
  const cast = order.map((id) => ({ speaker: id, name: SPK[id].name || id, voice: lines.find((l) => l.speaker === id).voice, pitch: spkPitch[id] || null, lines: lines.filter((l) => l.speaker === id).length }));
  if (cast.length) {
    console.log(`cast (${PROVIDER === "edge" ? "edge-tts" : PROVIDER}): ` + cast.map((o) => `${o.name} → ${o.voice}${o.pitch ? " " + o.pitch : ""} (${o.lines} lines)`).join(" · "));
    const dup = cast.find((o, k) => cast.findIndex((p) => p.voice === o.voice && (p.pitch || "") === (o.pitch || "")) !== k);
    if (dup) console.log(`  ⚠ ${dup.name} and ${cast.find((p) => p.voice === dup.voice && (p.pitch || "") === (dup.pitch || "")).name} share the voice ${dup.voice} — give each speaker their own voice in video.json → speakers`);
  }
  const todo = lines.filter((l) => args.force || !fs.existsSync(l.mp3) || !fs.existsSync(l.json));
  const t0 = Date.now();
  if (todo.length && PROVIDER === "edge") {
    console.log(`edge-tts ${order.length ? order.length + " speaker voice(s)" : VOICE} · ${todo.length}/${lines.length} line(s) to synthesize via ${py.how}`);
    // the free service sometimes drops a line ("No audio was received"): re-run only the missing lines, up to 3 times
    let r = null;
    for (let attempt = 1; attempt <= 3; attempt++) {
      const left = lines.filter((l) => args.force && attempt === 1 ? true : !fs.existsSync(l.mp3) || !fs.existsSync(l.json) || (attempt > 1 && fs.statSync(l.mp3).size === 0));
      if (!left.length) { r = { status: 0 }; break; }
      if (attempt > 1) { console.log(`  retry ${attempt - 1}: ${left.length} line(s) missing — one at a time, after a short pause (the free service throttles bursts)`); await new Promise((res) => setTimeout(res, 5000 * (attempt - 1))); }
      r = spawnSync(py.cmd, [...py.pre, path.join(SCRIPTS, "edge_synth.py")], {
        input: JSON.stringify({ concurrency: attempt === 1 ? 3 : 1, jobs: left.map((l) => ({ voice: l.voice, text: l.text, rate: l.rate, pitch: l.pitch, mp3: l.mp3, json: l.json })) }),
        encoding: "utf8", maxBuffer: 1 << 26 });
      if (r.status === 0 || r.status === 3) break;
      for (const l of left) if (!fs.existsSync(l.json)) fs.rmSync(l.mp3, { force: true });
    }
    if (r.status !== 0) throw new Error(`edge-tts failed (exit ${r.status}): ${(r.stderr || "").trim().split("\n").slice(-3).join(" | ")}${r.status === 3 ? " — " + EDGE_HINT : " — the free edge-tts service refused or throttled this network. Finished lines are cached: wait about a minute and run voice again once; if it still fails, use a provider key (CO_TTS=gemini|openai|elevenlabs|cloudflare, see references/ai-providers.md) or run on your own computer. Do not loop for minutes."}`);
    console.log(`  synthesized in ${((Date.now() - t0) / 1000).toFixed(1)} s (network, free)`);
  } else if (todo.length) {
    const chars = todo.reduce((n, l) => n + l.text.length, 0);
    console.log(`${PROVIDER} ${MODEL} · voice ${VOICE} · ${todo.length}/${lines.length} line(s), ${chars} characters — PAID provider, billed by the provider (keys stay local)`);
    let next = 0;
    const worker = async () => { for (let l; (l = todo[next++]);) {
      const r = await synth(PROVIDER, l.text, { voice: l.voice, model: MODEL, env });
      fs.writeFileSync(l.mp3, r.audio);   // container may be mp3/wav; ffmpeg detects it by content
      fs.writeFileSync(l.json, JSON.stringify(r.words)); } };
    try { await Promise.all(Array.from({ length: Math.min(3, todo.length) }, worker)); }
    catch (e) { console.log(freeLine(PROVIDER, e.message)); useFree(); return run([...stripProvider(argv), "--provider", "edge"]); }   // Pro failed -> free edge-tts, same command
    console.log(`  synthesized in ${((Date.now() - t0) / 1000).toFixed(1)} s`);
  } else console.log(`${PROVIDER === "edge" ? "edge-tts" : PROVIDER} ${VOICE} · all ${lines.length} lines cached`);
  // drop stale line files from earlier script versions
  const keep = new Set(lines.flatMap((l) => [l.mp3, l.json].map((f) => path.basename(f))));
  for (const f of fs.readdirSync(dir)) if (/^line-\d+-[0-9a-f]+\.(mp3|json)$/.test(f) && !keep.has(f)) fs.rmSync(path.join(dir, f));

  // ---------- 2. decode + trim ----------
  const decode = (file) => { const b = execFileSync("ffmpeg", ["-loglevel", "error", "-i", file, "-f", "s16le", "-ac", "1", "-ar", String(RATE), "pipe:1"], { maxBuffer: 1 << 28 });
    return new Int16Array(b.buffer, b.byteOffset, b.byteLength >> 1).slice(); };
  const trim = (pcm, thr = 350, pad = 0.03) => { let a = 0, b = pcm.length - 1;
    while (a < b && Math.abs(pcm[a]) < thr) a++; while (b > a && Math.abs(pcm[b]) < thr) b--;
    const p = Math.round(pad * RATE), s = Math.max(0, a - p); return { pcm: pcm.subarray(s, Math.min(pcm.length, b + p)), skip: s / RATE }; };
  const clips = lines.map((l) => { const { pcm, skip } = trim(decode(l.mp3)); return { ...l, pcm, skip, words: JSON.parse(fs.readFileSync(l.json, "utf8")) }; });

  // ---------- 3. tempo: hit the target speaking rate (pitch kept, ffmpeg atempo) ----------
  const spoken = (cl) => [...cl.text.replace(/\s/g, "")].length;
  const P = clips.reduce((n, cl) => n + cl.pcm.length / RATE, 0), CH = clips.reduce((n, cl) => n + spoken(cl), 0);
  const same = (i) => clips[i + 1] && clips[i + 1].c.shot === clips[i].c.shot && clips[i + 1].speaker === clips[i].speaker;   // next line continues the same turn
  const G = clips.reduce((n, cl, i) => n + (same(i) ? GAP_PHRASE : 0.25), 0);
  const TEMPO = args.tempo ? Number(args.tempo) : RATE_TARGET > 0 ? +Math.min(1.5, Math.max(0.75, P / Math.max(1, CH / RATE_TARGET - G))).toFixed(3) : 1;
  console.log(`natural rate ${(CH / P).toFixed(1)} chars/s → tempo ${TEMPO}${RATE_TARGET ? ` (target ${RATE_TARGET})` : " (natural)"}`);
  if (TEMPO !== 1) for (const cl of clips) {
    const b = execFileSync("ffmpeg", ["-loglevel", "error", "-f", "s16le", "-ar", String(RATE), "-ac", "1", "-i", "pipe:0", "-af", `atempo=${TEMPO}`, "-f", "s16le", "-ac", "1", "-ar", String(RATE), "pipe:1"],
      { input: Buffer.from(cl.pcm.buffer, cl.pcm.byteOffset, cl.pcm.byteLength), maxBuffer: 1 << 28 });
    cl.pcm = new Int16Array(b.buffer, b.byteOffset, b.byteLength >> 1).slice();
  }

  // ---------- 4. lay lines on the timeline ----------
  let t = LEAD;
  const chunks = clips.map((cl, i) => {
    if (i > 0) t += cl.c.shot !== clips[i - 1].c.shot ? GAP_SHOT : cl.speaker !== clips[i - 1].speaker ? GAP_TURN : GAP_PHRASE;
    t += Number(cl.c.pause) || 0;
    const start = t; t += cl.pcm.length / RATE;
    return { start: +start.toFixed(3), end: +t.toFixed(3), speaker: cl.speaker, voice: cl.voice };
  });
  chunks.forEach((c, i) => { c.said = c.end; const nx = chunks[i + 1]; c.end = nx && same(i) ? nx.start : +(c.end + 0.25).toFixed(3); });
  const duration = +(t + TAIL).toFixed(2);

  // ---------- 5. per-character times from WordBoundary ----------
  let fell = 0, cov = 0;
  const chars = clips.map((cl, i) => {
    const plain = [...cl.c.text.replace(/[\[\]]/g, "")];
    const toAbs = (sec) => chunks[i].start + Math.max(0, sec - cl.skip) / TEMPO;
    const B = []; // spoken characters with times
    for (const w of cl.words) { const ch = [...w.text]; ch.forEach((x, k) => B.push({ x, t: toAbs(w.t + (w.d * k) / Math.max(1, ch.length)) })); }
    const D = plain.map((x, k) => ({ x, k })).filter((o) => o.x.trim());
    // LCS between display chars and spoken chars
    const n = D.length, m = B.length, L = Array.from({ length: n + 1 }, () => new Uint16Array(m + 1));
    for (let a = n - 1; a >= 0; a--) for (let b = m - 1; b >= 0; b--) L[a][b] = D[a].x === B[b].x ? L[a + 1][b + 1] + 1 : Math.max(L[a + 1][b], L[a][b + 1]);
    const times = new Array(plain.length).fill(null);
    for (let a = 0, b = 0; a < n && b < m;) { if (D[a].x === B[b].x) { times[D[a].k] = B[b].t; a++; b++; } else if (L[a + 1][b] >= L[a][b + 1]) a++; else b++; }
    const matched = times.filter((v) => v != null).length, frac = n ? matched / n : 0;
    cov += frac;
    const s0 = chunks[i].start, s1 = chunks[i].said;
    if (frac < 0.5) { fell++; return plain.map((_, k) => +(s0 + (k / plain.length) * (s1 - s0 - 0.1)).toFixed(3)); }
    // interpolate the gaps (by character index), keep monotonic
    const idx = times.map((v, k) => (v != null ? k : -1)).filter((k) => k >= 0);
    for (let k = 0; k < plain.length; k++) if (times[k] == null) {
      const p = idx.filter((j) => j < k).pop(), q = idx.find((j) => j > k);
      times[k] = p == null ? s0 : q == null ? times[p] + 0.04 * (k - p) : times[p] + ((times[q] - times[p]) * (k - p)) / (q - p);
    }
    for (let k = 1; k < times.length; k++) times[k] = Math.max(times[k], times[k - 1]);
    return times.map((v) => +Math.min(v, s1).toFixed(3));
  });

  // ---------- 6. mixdown + loudness ----------
  const total = new Int16Array(Math.ceil(duration * RATE));
  clips.forEach((cl, i) => total.set(cl.pcm.subarray(0, Math.max(0, total.length - Math.round(chunks[i].start * RATE))), Math.round(chunks[i].start * RATE)));
  const wavHead = (bytes) => { const h = Buffer.alloc(44); h.write("RIFF", 0); h.writeUInt32LE(36 + bytes, 4); h.write("WAVE", 8); h.write("fmt ", 12); h.writeUInt32LE(16, 16);
    h.writeUInt16LE(1, 20); h.writeUInt16LE(1, 22); h.writeUInt32LE(RATE, 24); h.writeUInt32LE(RATE * 2, 28); h.writeUInt16LE(2, 32); h.writeUInt16LE(16, 34); h.write("data", 36); h.writeUInt32LE(bytes, 40); return h; };
  const raw = path.join(os.tmpdir(), `st-vo-${process.pid}.wav`), vo = path.join(dir, "voiceover.wav");
  fs.writeFileSync(raw, Buffer.concat([wavHead(total.byteLength), Buffer.from(total.buffer)]));
  execFileSync("ffmpeg", ["-y", "-loglevel", "error", "-i", raw, "-af", "loudnorm=I=-16:TP=-1.5:LRA=11", "-ar", String(RATE), "-ac", "1", vo]);
  fs.rmSync(raw, { force: true });

  // mouth envelope: loudness of the finished voice every 1/30 s (0..1, scaled to the 95th percentile) — the presenter's mouth opens and closes with the real syllables
  const ENV_FPS = 30, hop = Math.round(RATE / ENV_FPS), envRaw = [];
  for (let i = 0; i < total.length; i += hop) { let q = 0; const e = Math.min(total.length, i + hop); for (let k = i; k < e; k++) q += total[k] * total[k]; envRaw.push(Math.sqrt(q / Math.max(1, e - i))); }
  const p95 = [...envRaw].sort((a, b) => a - b)[Math.floor(envRaw.length * 0.95)] || 1;
  const envelope = envRaw.map((v) => +Math.min(1, v / p95).toFixed(2));
  fs.writeFileSync(path.join(root, "timing.js"),
    `// Generated by cutout voice — ${PROVIDER === "edge" ? "edge-tts" : PROVIDER} ${VOICE}, tempo ${TEMPO}, word timings on ${clips.length - fell}/${clips.length} lines\n` +
    `window.SPEAKERS = ${JSON.stringify(SPK)};\n` +
    `window.TTS_TIMING = ${JSON.stringify({ duration, provider: PROVIDER, voice: VOICE, tempo: TEMPO, cast, chunks })};\n` +
    `window.TTS_TIMING.chars = ${JSON.stringify(chars)};\n` +
    `window.TTS_TIMING.envelope = ${JSON.stringify(envelope)};\nwindow.TTS_TIMING.envelopeRate = ${ENV_FPS};\n`);

  // proof of who spoke each line with which voice (checked by `cutout summary` / `cutout check`)
  fs.writeFileSync(path.join(dir, "voices.json"), JSON.stringify({ provider: PROVIDER, cast, lines: clips.map((cl, i) => ({ key: cl.c.key, speaker: cl.speaker, name: cl.speaker ? SPK[cl.speaker].name || cl.speaker : null, voice: cl.voice, start: chunks[i].start, end: chunks[i].said })) }, null, 1) + "\n");

  // ---------- 7. retime index.html ----------
  let html = fs.readFileSync(path.join(root, "index.html"), "utf8");
  const scenes = [...html.matchAll(/<section\b[^>]*\sid="([^"]+)"[^>]*>/g)].map((m) => ({
    id: m[1], shot: (m[0].match(/data-shot="([^"]+)"/) || [])[1], cue: (m[0].match(/data-cue="([^"]+)"/) || [])[1] })).filter((s) => s.shot || s.cue);
  const startOf = (s) => {
    const i = s.shot ? clips.findIndex((cl) => cl.c.shot === s.shot) : clips.findIndex((cl) => cl.c.key === s.cue);
    if (i < 0) throw new Error(`section #${s.id}: no caption for ${s.shot ? `shot "${s.shot}"` : `key "${s.cue}"`}`);
    return chunks[i].start - (s.shot ? 0.3 : 0.25);
  };
  const starts = scenes.map((s, i) => (i === 0 ? 0 : +Math.max(0, startOf(s)).toFixed(2)));
  scenes.forEach((s, i) => { const e = i < scenes.length - 1 ? Math.min(duration, starts[i + 1] + FADE) : duration;
    html = patchTag(html, s.id, { "data-start": starts[i], "data-duration": +(e - starts[i]).toFixed(2) }); });
  for (const id of ["root", "stage", "chrome", "captions", "vo"]) html = patchTag(html, id, { "data-duration": duration }, id !== "root");
  html = html.replace(/<html\b([^>]*)\slang="[^"]*"/, `<html$1 lang="${LANG}"`);
  fs.writeFileSync(path.join(root, "index.html"), html);

  // keep video.json in sync with what was used
  cfg.voice = { ...(cfg.voice || {}), language: LANG, ...(PROVIDER === "edge" ? { voice: VOICE } : { [PROVIDER]: VOICE }) };
  delete cfg.voice.provider;   // provider is chosen per run by CO_TTS (default edge)
  fs.writeFileSync(cfgFile, JSON.stringify(cfg, null, 2) + "\n");

  const sp = clips.reduce((n, cl, i) => n + cl.pcm.length / RATE + (same(i) ? GAP_PHRASE : 0.25), 0);
  const mm = `${Math.floor(duration / 60)}:${String(Math.round(duration % 60)).padStart(2, "0")}`;
  console.log(`✓ assets/voice/voiceover.wav ${duration} s (${mm}) · ${chunks.length} lines · ${scenes.length} scenes · rate ${(CH / sp).toFixed(1)} chars/s`);
  if (PROVIDER !== "edge" && PROVIDER !== "elevenlabs") console.log(`  note: ${PROVIDER} gives no word timestamps — karaoke timing is spread evenly over each spoken line`);
  console.log(`  word timings: WordBoundary on ${clips.length - fell}/${clips.length} lines (avg ${(100 * cov / clips.length).toFixed(0)} % of characters matched)${fell ? ` · ${fell} line(s) spread evenly` : ""}`);
  console.log(`  scenes: ${scenes.map((s, i) => `${s.id}@${starts[i]}`).join(" ")}`);
}
// genhaha:5f8f980bb7f3
