// cutout music — free background bed, procedurally generated (sine drones / pads, sparse piano-like notes), written as assets/music/bgm-*.wav for the length of the clip.
// No samples, no AI, deterministic. `cutout render` mixes it at video.json → music.level; under a narrator it ducks while the voice talks.
//   playful light marimba-like plucks over a bright pad (default for this look) · see also calm | warm | bright
//   dark    low drone + sparse low piano-like notes, slow swell and a rising tension (tension / mystery)
//   warm    calm campfire / daylight: soft major-seventh pad + slow plucks
//   calm | bright | playful   the lighter beds
//
//   cutout music [--project <dir>] [--mood dark|warm|calm|bright|playful|none] [--bpm 104]
//   video.json → music: { mood: "playful", level: 0.5 (silent clip) | 0.12 (under a voice), bpm?: 104 }
// Prefer "none" when unsure: a quiet clip beats a distracting loop. Your own licensed track: put it at assets/music/bgm.wav
// (or .mp3) and set music.mood to "file".
import fs from "node:fs";
import path from "node:path";
import { parseArgs, projectDir, config, durationOf, ff } from "./lib/common.mjs";

const SR = 44100;
const MOODS = {
  // chords as semitone offsets from the key root (midi), 1 bar each — soft sine pad + sparse pluck + very light tick
  calm:   { bpm: 84,  root: 57, prog: [[0, 4, 7, 11], [-3, 0, 4, 7], [-7, -3, 0, 4], [-5, -1, 2, 5]], pluck: 0.5, tick: 0.0 },    // A: Imaj7 vi IV V
  playful: { bpm: 96, root: 60, prog: [[0, 4, 7, 11], [-3, 0, 4, 7], [-7, -3, 0, 4], [-5, -1, 2, 5]], pluck: 1.0, tick: 0.5 },   // C: light marimba-like plucks + soft off-beat tick (the Cutout explainer default)
  warm:   { bpm: 72,  root: 53, prog: [[0, 4, 7, 11], [-5, -1, 2, 5], [-3, 0, 4, 7], [-7, -3, 0, 4]], pluck: 0.7, tick: 0.0 },   // F: slow, soft, daylight / campfire
  dark:   { bpm: 40,  root: 33, dark: true },                                                                                // A1 drone: see synthDark()
  bright: { bpm: 104, root: 55, prog: [[0, 4, 7, 11], [7, 11, 14, 17], [9, 12, 16, 19], [5, 9, 12, 16]], pluck: 0.8, tick: 0.6 }, // G
};
const hz = (m) => 440 * Math.pow(2, (m - 69) / 12);

// dark: two detuned low sines + a fifth, slow swell (~13 s), sparse low piano-like notes from A minor pentatonic (seeded, so the same every time),
// everything rising in level toward the end; a short reverb is added in ensureMusic.
function synthDark(seconds, M) {
  const n = Math.ceil(seconds * SR), out = new Float32Array(n);
  let seed = 4242; const r01 = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  const scale = [0, 3, 5, 7, 10];                       // A minor pentatonic
  const notes = []; let tn = 1.6;
  while (tn < seconds - 1.5) { const deg = scale[Math.floor(r01() * scale.length)], oct = r01() < 0.3 ? 12 : 0; notes.push({ t: tn, f: hz(M.root + 24 + deg + oct), v: 0.5 + 0.5 * r01() }); tn += 2.6 + r01() * 3.6; }
  for (let i = 0; i < n; i++) {
    const t = i / SR, ramp = 0.55 + 0.45 * Math.min(1, t / Math.max(8, seconds));
    const swell = 0.55 + 0.45 * Math.sin(2 * Math.PI * t / 13 - 1.2);
    const f0 = hz(M.root), f1 = hz(M.root + 7);
    let d = (Math.sin(2 * Math.PI * f0 * t) + Math.sin(2 * Math.PI * (f0 * 1.004) * t) * 0.8 + 0.5 * Math.sin(2 * Math.PI * (f0 * 2.003) * t) + 0.35 * Math.sin(2 * Math.PI * f1 * t + 0.4 * Math.sin(2 * Math.PI * 0.11 * t))) * 0.13 * swell * ramp;
    let p = 0;
    for (const nt of notes) { const dt = t - nt.t; if (dt < 0 || dt > 6) continue; p += (Math.sin(2 * Math.PI * nt.f * t) + 0.4 * Math.sin(4 * Math.PI * nt.f * t) * Math.exp(-dt * 3) + 0.15 * Math.sin(6 * Math.PI * nt.f * t) * Math.exp(-dt * 6)) * Math.exp(-dt * 0.9) * Math.min(1, dt * 400) * 0.1 * nt.v; }
    out[i] = (d + p) * Math.max(0, Math.min(1, t / 2.5, (seconds - t) / 2.5));
  }
  return out;
}

function toWav(out) {
  const n = out.length, pcm = Buffer.alloc(n * 2);
  for (let i = 0; i < n; i++) pcm.writeInt16LE(Math.max(-32767, Math.min(32767, Math.round(out[i] * 32767))), i * 2);
  const h = Buffer.alloc(44); h.write("RIFF", 0); h.writeUInt32LE(36 + pcm.length, 4); h.write("WAVE", 8); h.write("fmt ", 12); h.writeUInt32LE(16, 16);
  h.writeUInt16LE(1, 20); h.writeUInt16LE(1, 22); h.writeUInt32LE(SR, 24); h.writeUInt32LE(SR * 2, 28); h.writeUInt16LE(2, 32); h.writeUInt16LE(16, 34); h.write("data", 36); h.writeUInt32LE(pcm.length, 40);
  return Buffer.concat([h, pcm]);
}

export function synth(mood, seconds, bpmOverride) {
  const M = MOODS[mood]; if (!M) throw new Error(`mood "${mood}" — use dark | warm | calm | bright | playful | none`);
  if (M.dark) return toWav(synthDark(seconds, M));
  const bpm = bpmOverride || M.bpm, beat = 60 / bpm, bar = beat * 4, n = Math.ceil(seconds * SR);
  const out = new Float32Array(n);
  let seed = 12345; const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647) * 2 - 1;
  for (let i = 0; i < n; i++) {
    const t = i / SR, b = Math.floor(t / bar), chord = M.prog[b % M.prog.length], inBar = t - b * bar;
    // pad: sine chord, slow swell inside each bar
    const swell = Math.sin(Math.PI * Math.min(1, inBar / bar)) * 0.7 + 0.3;
    let pad = 0; for (const c of chord) pad += Math.sin(2 * Math.PI * hz(M.root + c) * t) + 0.3 * Math.sin(2 * Math.PI * hz(M.root + c + 12) * t);
    pad *= 0.07 * swell;
    // bass: sine root, one long note per bar
    const bass = Math.sin(2 * Math.PI * hz(M.root - 12 + chord[0]) * t) * Math.exp(-inBar * 0.9) * 0.28;
    // pluck: sine + soft octave on every 8th, walking up the chord
    const e8 = Math.floor(inBar / (beat / 2)), te = inBar - e8 * (beat / 2);
    const pf = hz(M.root + 12 + chord[e8 % chord.length] + (e8 > 3 ? 12 : 0));
    const pl = (Math.sin(2 * Math.PI * pf * t) + 0.25 * Math.sin(4 * Math.PI * pf * t)) * Math.exp(-te * 7) * 0.13 * M.pluck * (e8 % 2 ? 0.6 : 1);
    // light tick on the off-beats
    const tk = M.tick && e8 % 2 ? rnd() * Math.exp(-te * 90) * 0.06 * M.tick : 0;
    const fade = Math.min(1, t / 1.2, (seconds - t) / 2.0);
    out[i] = (pad + bass + pl + tk) * Math.max(0, fade);
  }
  return toWav(out);
}

// path of the bed to mix, building it if needed (null = no music)
export function ensureMusic(root, { force = false } = {}) {
  const cfg = config(root), mood = cfg.music?.mood || "none";
  const dir = path.join(root, "assets/music");
  if (mood === "none") return null;
  if (mood === "file") { const f = ["bgm.wav", "bgm.mp3"].map((x) => path.join(dir, x)).find((x) => fs.existsSync(x)); if (!f) throw new Error("music.mood is \"file\" but assets/music/bgm.wav|mp3 is missing"); return f; }
  const dur = durationOf(root);   // voice length (narrated) or #root duration (silent)
  const f = path.join(dir, `bgm-${mood}-${cfg.music?.bpm || MOODS[mood]?.bpm}-${Math.ceil(dur)}.wav`);
  if (!fs.existsSync(f) || force) {
    fs.mkdirSync(dir, { recursive: true });
    for (const old of fs.readdirSync(dir)) if (/^bgm-.*\.wav$/.test(old)) fs.rmSync(path.join(dir, old));
    const tmp = f + ".raw.wav"; fs.writeFileSync(tmp, synth(mood, Math.ceil(dur) + 0.5, cfg.music?.bpm));
    const verb = mood === "dark" ? ",aecho=0.8:0.75:600|1100:0.35|0.22" : "";
    ff(["-i", tmp, "-af", `lowpass=f=${mood === "dark" ? 3500 : 5000}${verb},loudnorm=I=-20:TP=-3`, "-ar", "44100", "-ac", "2", f]); fs.rmSync(tmp);
  }
  return f;
}

export async function run(argv) {
  const args = parseArgs(argv);
  const root = projectDir(args), cfgFile = path.join(root, "video.json"), cfg = config(root);
  if (args.mood) { cfg.music = { ...(cfg.music || {}), mood: String(args.mood) }; if (args.bpm) cfg.music.bpm = Number(args.bpm); fs.writeFileSync(cfgFile, JSON.stringify(cfg, null, 2) + "\n"); }
  const f = ensureMusic(root, { force: true });
  console.log(f ? `✓ ${path.relative(root, f)} · mood ${cfg.music.mood} · mixed at level ${cfg.music?.level ?? 0.1} by cutout render` : "music: none (set --mood dark|warm|calm|bright)");
}
// genhaha:5f8f980bb7f3
