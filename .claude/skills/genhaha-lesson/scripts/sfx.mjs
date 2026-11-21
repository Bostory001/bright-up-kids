// lesson sfx — soft sound effects synthesized with ffmpeg (sine tones, bell partials, filtered noise; free, no samples)
// + the cue list that `lesson render` mixes: a whoosh on every scene cut + `sfx` cues on caption lines.
//
//   lesson sfx [--project <dir>]          build the sounds into <project>/assets/sfx/ and print the cue list
//   lesson sfx --list                     the sounds and what they are for
//   lesson sfx --play ding            (macOS afplay / ffplay) listen to one
//
// Cue syntax on a caption line:  sfx: "pop@w:<word>"  ·  "tick@0.4" (s after line start)  ·  ["a", "b@w:…"]
//                                add "|L" / "|R" / "|-0.5" to pan and "*1.6" for gain:  "pop@w:and|L*1.6"
// video.json → sfx: { scene_cut: "whoosh" | null, scene_cut_gain: 0.8 }
import fs from "node:fs";
import path from "node:path";
import { execFileSync, spawnSync } from "node:child_process";
import { parseArgs, projectDir, config, loadCaptions, loadTiming, ff, volumedetect, which } from "./lib/common.mjs";

const sine = (f) => `sin(2*PI*(${f})*t)`;
const slide = (f0, f1, d) => `sin(2*PI*(${f0}*t+(${f1 - f0})*t*t/(2*${d})))`;
const steps = (notes, len) => notes.reduceRight((acc, f, i) => (i === notes.length - 1 ? `${f}` : `if(lt(t,${((i + 1) * len).toFixed(3)}),${f},${acc})`), "");
const decay = (k) => `exp(-${k}*t)`;
const noise = "(random(0)*2-1)";

export const SOUNDS = {
  tick:   { d: 0.07, e: `${sine(2100)}*${decay(70)}`, gain: 0.2, use: "a tile / chip lands (soft click)" },
  pop:    { d: 0.16, e: `${slide(420, 980, 0.16)}*${decay(22)}`, gain: 0.26, use: "a card or example pops in" },
  blip:   { d: 0.1, e: `${sine(1175)}*${decay(32)}`, gain: 0.18, use: "small label appears" },
  ding:   { d: 0.7, e: `(${sine(1319)}+0.35*${sine(1976)}+0.15*${sine(2637)})*${decay(7)}`, gain: 0.22, use: "key term, tip, a fact lands (bell)" },
  chime:  { d: 1.0, e: `(${sine(steps([988, 1319, 1760], 0.12))}+0.25*${sine(steps([1976, 2637, 3520], 0.12))})*${decay(4)}`, gain: 0.2, use: "ending / save & follow" },
  whoosh: { d: 0.4, e: `${noise}*sin(PI*t/0.4)*sin(PI*t/0.4)`, af: "highpass=f=350,lowpass=f=2600", gain: 0.2, use: "scene cut (soft air sweep)" },
};

export function buildSounds(dir, names = Object.keys(SOUNDS)) {
  fs.mkdirSync(dir, { recursive: true });
  let made = 0;
  for (const name of names) {
    const s = SOUNDS[name]; if (!s) throw new Error(`unknown sound "${name}" — known: ${Object.keys(SOUNDS).join(", ")}`);
    const out = path.join(dir, `${name}.wav`);
    if (fs.existsSync(out)) continue;
    const tmp = out + ".raw.wav";
    ff(["-f", "lavfi", "-i", `aevalsrc='0.5*(${s.e})':s=44100:d=${s.d}`, "-af", `${s.af ? s.af + "," : ""}lowpass=f=9000,afade=t=in:d=0.004,afade=t=out:st=${Math.max(0, s.d - 0.03).toFixed(3)}:d=0.03`, tmp]);
    const { max } = volumedetect(tmp);
    ff(["-i", tmp, "-af", `volume=${(-3 - (isFinite(max) ? max : 0)).toFixed(2)}dB`, "-ar", "44100", "-ac", "2", out]);
    fs.rmSync(tmp); made++;
  }
  return made;
}

// every cue of the project: { t, name, pan, gain, why }
export function cueList(root) {
  const cfg = config(root), caps = loadCaptions(root), T = loadTiming(root) || {}, CH = T.chars || [];
  const html = fs.readFileSync(path.join(root, "index.html"), "utf8");
  const cues = [];
  const cut = cfg.sfx && "scene_cut" in cfg.sfx ? cfg.sfx.scene_cut : "whoosh";
  if (cut) [...html.matchAll(/<section\b[^>]*\sdata-start="([\d.]+)"/g)].map((m) => +m[1]).sort((a, b) => a - b).slice(1)
    .forEach((t) => cues.push({ t: t + 0.3, name: cut, pan: 0, gain: SOUNDS[cut].gain * (cfg.sfx?.scene_cut_gain ?? 0.8), why: "scene cut" }));
  caps.forEach((c, li) => {
    const plain = c.text.replace(/[\[\]]/g, "");
    for (const spec of [].concat(c.sfx || [])) {
      const [head, panSpec = ""] = String(spec).split("|");
      const [name, off = ""] = head.split("@");
      let t = c.start;
      if (off.startsWith("w:")) {
        const word = off.slice(2), idx = plain.indexOf(word), cps = [...plain.slice(0, Math.max(0, idx))].length, times = CH[li];
        if (idx < 0) console.warn(`  ! sfx word "${word}" not found in line ${c.key}: ${plain}`);
        t = idx < 0 ? c.start : times && times.length === [...plain].length ? times[cps] : c.start + (cps / [...plain].length) * (c.end - c.start - 0.25);
      } else t = c.start + Number(off || 0);
      const [pp, gp] = panSpec.split("*");
      const pan = !pp ? 0 : pp === "L" ? -0.7 : pp === "R" ? 0.7 : Number(pp);
      if (!SOUNDS[name]) throw new Error(`line ${c.key}: unknown sfx "${name}" (lesson sfx --list)`);
      cues.push({ t, name, pan, gain: SOUNDS[name].gain * Number(gp || 1), why: `${c.key} ${plain.slice(0, 28)}` });
    }
  });
  return cues.sort((a, b) => a.t - b.t);
}

export async function run(argv) {
  const args = parseArgs(argv);
  if (args.list) { for (const [n, s] of Object.entries(SOUNDS)) console.log(`${n.padEnd(12)} ${String(s.d).padStart(5)} s  ${s.use}`); return; }
  if (args.play) {
    const dir = path.join(process.cwd(), ".lesson-sfx-preview"); buildSounds(dir, [args.play]);
    const f = path.join(dir, `${args.play}.wav`), pl = which("afplay") ? ["afplay", [f]] : ["ffplay", ["-autoexit", "-nodisp", f]];
    spawnSync(pl[0], pl[1], { stdio: "ignore" }); fs.rmSync(dir, { recursive: true, force: true }); return;
  }
  const root = projectDir(args);
  const cues = cueList(root);
  const made = buildSounds(path.join(root, "assets/sfx"), [...new Set(cues.map((c) => c.name))]);
  for (const c of cues) console.log(`${c.t.toFixed(2).padStart(7)} s  ${c.name.padEnd(12)}${c.pan ? ` pan ${c.pan}` : ""}  ${c.why}`);
  console.log(`✓ ${cues.length} cues · ${made} sound(s) synthesized into assets/sfx`);
}
// genhaha:ed34a05c8342
