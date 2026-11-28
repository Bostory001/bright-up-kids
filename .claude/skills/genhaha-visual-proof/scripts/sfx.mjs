// visual-proof sfx — sound effects synthesized with ffmpeg (sine tones, filtered noise, envelopes; free, no samples, nothing downloaded)
// + the cue list that `visual-proof render` mixes: a soft scene-cut sound, the `sfx` cues on caption lines in captions.js, and the `sfx` fields
// written in scene.js (figure items, equation terms, array rings, marks, steps; a qed shot adds a chime on its ∎). Scene cues closer than 0.2 s
// to each other keep the more important one, and at most ~10 scene cues per 30 s are kept (quiet beats loud).
//
//   visual-proof sfx [--project <dir>]          build the sounds into <project>/assets/sfx/ and print the cue list
//   visual-proof sfx --list                     the sounds and what they are for
//   visual-proof sfx --play heartbeat           (macOS afplay / ffplay) listen to one
//
// Loops ("loop" in --list) are ambience beds: they play from the cue to the end of the clip. Caption cue: sfx: "branch_snap@w:word"  ·  "tick@0.4" (s after line start)  ·  ["a", "b@w:…"]; add "|L" / "|R" / "|-0.5" to pan and "*1.6" for gain: "pop@w:and|L*1.6"
// video.json → sfx: { scene_cut: "whoosh" | null, scene_cut_gain: 0.8 }
import fs from "node:fs";
import path from "node:path";
import { execFileSync, spawnSync } from "node:child_process";
import { loadScene, loadCaps, sceneCues } from "./lib/vp.mjs";
import { parseArgs, projectDir, config, loadCaptions, loadTiming, ff, volumedetect, which } from "./lib/common.mjs";

const sine = (f) => `sin(2*PI*(${f})*t)`;
const slide = (f0, f1, d) => `sin(2*PI*(${f0}*t+(${f1 - f0})*t*t/(2*${d})))`;
const steps = (notes, len) => notes.reduceRight((acc, f, i) => (i === notes.length - 1 ? `${f}` : `if(lt(t,${((i + 1) * len).toFixed(3)}),${f},${acc})`), "");
const decay = (k) => `exp(-${k}*t)`;
const noise = "(random(0)*2-1)";
const stepper = (iv, hz, k) => `(0.85+0.15*sin(floor(t/${iv})*2.3))*sin(2*PI*${hz}*t)*exp(-${k}*mod(t,${iv}))`;   // one thud per interval
// "g" sounds are a whole ffmpeg filter graph that ends in [o] (sources inside); "loop" sounds are seamless ambience beds
const eval_ = (expr, d, extra = "") => `aevalsrc='${expr}':s=44100:d=${d}${extra}`;

export const SOUNDS = {
  // ---- soft UI-style sounds (narrated films, chips) ----
  tick:   { d: 0.07, e: `${sine(2100)}*${decay(70)}`, gain: 0.2, use: "a tile / chip lands (soft click)" },
  pop:    { d: 0.16, e: `${slide(420, 980, 0.16)}*${decay(22)}`, gain: 0.26, use: "a card or example pops in" },
  blip:   { d: 0.1, e: `${sine(1175)}*${decay(32)}`, gain: 0.18, use: "small label appears" },
  ding:   { d: 0.7, e: `(${sine(1319)}+0.35*${sine(1976)}+0.15*${sine(2637)})*${decay(7)}`, gain: 0.22, use: "key term, tip, a fact lands (bell)" },
  chime:  { d: 1.0, e: `(${sine(steps([988, 1319, 1760], 0.12))}+0.25*${sine(steps([1976, 2637, 3520], 0.12))})*${decay(4)}`, gain: 0.2, use: "ending / save & follow" },
  whoosh: { d: 0.4, e: `${noise}*sin(PI*t/0.4)*sin(PI*t/0.4)`, af: "highpass=f=350,lowpass=f=2600", gain: 0.2, use: "camera whip / scene cut (soft air sweep)" },
  // ---- ambience beds (loop = plays from the cue to the end of the clip) ----
  rain_bed:     { d: 8, loop: true, gain: 0.1, use: "steady rain on a roof / street (bed) for flood and rain scenes",
    g: `anoisesrc=d=8:c=white:r=44100:a=0.5:seed=14,highpass=f=900,lowpass=f=7000,tremolo=f=0.35:d=0.25,volume=0.9[c];anoisesrc=d=8:c=brown:r=44100:a=0.5:seed=15,lowpass=f=400,volume=0.6[b];[c][b]amix=inputs=2:normalize=0[o]` },
  flood_rumble: { d: 8, loop: true, gain: 0.12, use: "rising muddy water: low rushing noise (bed) under a flood shot",
    g: `anoisesrc=d=8:c=brown:r=44100:a=0.9:seed=16,lowpass=f=520,tremolo=f=0.6:d=0.4,volume=1.8[c];anoisesrc=d=8:c=pink:r=44100:a=0.4:seed=17,highpass=f=300,lowpass=f=1800,tremolo=f=1.3:d=0.5,volume=0.5[b];[c][b]amix=inputs=2:normalize=0[o]` },
  city_hum:     { d: 8, loop: true, gain: 0.08, use: "distant traffic hush for street / market scenes (bed)",
    g: `anoisesrc=d=8:c=brown:r=44100:a=0.8:seed=18,lowpass=f=700,tremolo=f=0.15:d=0.3,volume=1.2[o]` },
  light_buzz:   { d: 3, loop: true, gain: 0.1, use: "a failing lamp / office fluorescent hum (bed)",
    g: `${eval_("(0.35*sin(2*PI*100*t)+0.2*sin(2*PI*200*t)+0.12*sin(2*PI*300*t))*(0.8+0.2*gt(sin(2*PI*3*t),0.5))", 3)},lowpass=f=2000[o]` },
  // ---- morning / daylight ambience (warm films) ----
  birds_morning: { d: 10, loop: true, gain: 0.11, use: "morning birds: soft chirps + a little air (bed, daylight)",
    g: `${eval_("0.30*sin(2*PI*(3300+900*sin(2*PI*8*t))*t)*pow(max(0,sin(2*PI*0.7*t)),14)+0.24*sin(2*PI*(4300+1300*sin(2*PI*11*t))*t)*pow(max(0,sin(2*PI*0.5*t+1.2)),18)+0.18*sin(2*PI*(2700+600*sin(2*PI*6*t))*t)*pow(max(0,sin(2*PI*0.3*t+2.4)),20)+0.14*sin(2*PI*(5200+1500*sin(2*PI*14*t))*t)*pow(max(0,sin(2*PI*1.1*t+0.6)),30)", 10)}[c];anoisesrc=d=10:c=pink:r=44100:a=0.3:seed=12,highpass=f=300,lowpass=f=1800,tremolo=f=0.2:d=0.5,volume=0.5[b];[c][b]amix=inputs=2:normalize=0[o]` },
  // ---- phone / story one-shots for this look ----
  sparkle:      { d: 1.2, e: `(${sine(steps([1568, 1976, 2349, 3136, 3951], 0.07))}+0.3*${sine(steps([3136, 3951, 4699, 6272, 7902], 0.07))})*${decay(3.2)}*(1-exp(-80*t))`, gain: 0.18, use: "relief / success twinkle (rescue arrives, a win)" },
  notif:        { d: 0.6, e: `(${sine(1568)}*gt(t,0)*lt(t,0.12)+${sine(2093)}*gte(t,0.12))*${decay(7)}*(1-exp(-120*t))`, gain: 0.22, use: "phone notification: two-note ping when an alert banner appears" },
  coin:         { d: 0.5, e: `(${sine(1976)}*lt(t,0.07)+${sine(2637)}*gte(t,0.07))*${decay(9)}*(1-exp(-150*t))+0.2*${noise}*exp(-200*t)`, af: "highpass=f=700", gain: 0.2, use: "a coin / the last money (price joke, paying)" },
  receipt:      { d: 0.9, e: `${noise}*(0.5+0.5*sin(2*PI*48*t))*sin(PI*t/0.9)*0.7`, af: "highpass=f=1800,lowpass=f=7500", gain: 0.2, use: "receipt printer / paper tearing" },
  splash:       { d: 0.8, e: `${noise}*exp(-9*t)*(1-exp(-300*t))+0.5*sin(2*PI*(220-120*t)*t)*exp(-12*t)`, af: "highpass=f=250,lowpass=f=5200", gain: 0.3, use: "a step / a drop into water" },
  wade:         { d: 3.0, e: `${noise}*0.6*(0.45+0.55*sin(2*PI*1.9*t)*sin(2*PI*1.9*t))*sin(PI*t/3)`, af: "highpass=f=200,lowpass=f=2600", gain: 0.3, use: "wading through water (steady slosh)" },
  // ---- storybook / folk-tale sounds (this look) ----
  wind_chime:   { d: 2.6, e: `(${[[0, 2093], [0.19, 2637], [0.41, 1760], [0.66, 3136], [0.93, 2349]].map(([t0, f]) => `gte(t,${t0})*sin(2*PI*${f}*(t-${t0}))*exp(-5*(t-${t0}))`).join("+")})*0.5`, af: "lowpass=f=9000,aecho=0.6:0.5:120:0.25", gain: 0.2, use: "small wind chimes / eave bells tinkle (folk tale, doors, bells)" },
  temple_bell:  { d: 4.2, e: `(sin(2*PI*196*t)+0.6*sin(2*PI*196*2.01*t)*exp(-1.2*t)+0.4*sin(2*PI*196*2.76*t)*exp(-2*t)+0.25*sin(2*PI*196*5.4*t)*exp(-4*t))*exp(-1.3*t)*(1-exp(-300*t))`, af: "lowpass=f=5000,aecho=0.7:0.6:180|330:0.35|0.2", gain: 0.3, use: "one big bell stroke with a long ring (the moment of the bell)" },
  rain_heavy:   { d: 8, loop: true, gain: 0.16, use: "heavy rain on thatch and water (bed) for storm pages",
    g: `anoisesrc=d=8:c=white:r=44100:a=0.55:seed=31,highpass=f=700,lowpass=f=8000,tremolo=f=0.4:d=0.2,volume=1.0[c];anoisesrc=d=8:c=brown:r=44100:a=0.6:seed=32,lowpass=f=500,volume=0.8[b];[c][b]amix=inputs=2:normalize=0[o]` },
  wind_trees:   { d: 8, loop: true, gain: 0.1, use: "wind through leaves (bed), cold and lonely",
    g: `anoisesrc=d=8:c=pink:r=44100:a=0.6:seed=33,highpass=f=250,lowpass=f=2400,tremolo=f=0.23:d=0.6,volume=1.3[o]` },
  crowd:        { d: 4, g: `anoisesrc=d=4:c=pink:r=44100:a=0.7:seed=34,highpass=f=350,lowpass=f=2200,tremolo=f=5.5:d=0.7,afade=t=in:d=0.5,afade=t=out:st=2.8:d=1.1,volume=1.4[o]`, gain: 0.22, use: "many people hurry out and murmur (no words)" },
  page_turn:    { d: 0.7, e: `${noise}*sin(PI*t/0.7)*(0.6+0.4*sin(2*PI*9*t))*0.8`, af: "highpass=f=1200,lowpass=f=6500", gain: 0.2, use: "a page turns (scene cut on the 'turn' / 'wash' transitions)" },
  // ---- one-shots ----
  branch_snap:  { d: 0.5, e: `${noise}*exp(-90*t)*0.9+0.6*sin(2*PI*230*t)*exp(-45*t)+0.5*(random(1)*2-1)*exp(-70*(t-0.07))*gte(t,0.07)`, af: "highpass=f=450,lowpass=f=7000", gain: 0.5, use: "a branch breaks behind you" },
  heartbeat:    { d: 3.6, e: `sin(2*PI*52*t)*exp(-26*mod(t,0.9))*0.9+0.7*sin(2*PI*44*t)*exp(-30*(mod(t,0.9)-0.24))*gte(mod(t,0.9),0.24)`, af: "lowpass=f=160", gain: 0.5, use: "four slow heartbeats (tension)" },
  horror_hit:   { d: 2.2, e: `0.9*sin(2*PI*70*t)*exp(-2.5*t)+0.25*(sin(2*PI*311*t)+sin(2*PI*330*t)+sin(2*PI*466*t))*exp(-3*t)*(1-exp(-40*t))+0.4*${noise}*exp(-9*t)`, af: "lowpass=f=6000", gain: 0.55, use: "stinger: low boom + dissonant cluster (the reveal)" },
  boom:         { d: 2.0, e: `sin(2*PI*45*t)*exp(-2*t)+0.3*${noise}*exp(-14*t)`, af: "lowpass=f=300", gain: 0.5, use: "deep boom / impact" },
  thud:         { d: 0.4, e: `sin(2*PI*60*t)*exp(-18*t)+0.2*${noise}*exp(-60*t)`, af: "lowpass=f=400", gain: 0.45, use: "something heavy lands" },
  door_slam:    { d: 0.9, e: `sin(2*PI*70*t)*exp(-9*t)+0.7*${noise}*exp(-30*t)`, af: "lowpass=f=2500", gain: 0.5, use: "door slams" },
  creak:        { d: 1.6, e: `(${sine("(140+120*t/1.6)")}+0.6*sin(4*PI*(140+120*t/1.6)*t)+0.4*sin(6*PI*(140+120*t/1.6)*t))*(0.55+0.45*sin(2*PI*31*t))*sin(PI*t/1.6)*0.4`, af: "lowpass=f=2200", gain: 0.3, use: "a door or floorboard creaks" },
  footsteps:    { d: 3.0, e: `${stepper(0.5, 85, 35)}*0.8+0.5*${noise}*exp(-60*mod(t,0.5))`, af: "lowpass=f=520", gain: 0.45, use: "six slow footsteps (walking)" },
  run_steps:    { d: 2.4, e: `${stepper(0.28, 95, 45)}*0.8+0.6*${noise}*exp(-70*mod(t,0.28))`, af: "lowpass=f=700", gain: 0.5, use: "running footsteps" },
  footsteps_hall: { d: 3.0, e: `${stepper(0.5, 90, 33)}*0.8+0.5*${noise}*exp(-60*mod(t,0.5))`, af: "lowpass=f=900,aecho=0.7:0.6:90|170:0.4|0.25", gain: 0.45, use: "footsteps in a corridor (echo)" },
  stairs_steps: { d: 2.4, e: `${stepper(0.38, 120, 40)}*0.8+0.6*${noise}*exp(-70*mod(t,0.38))`, af: "lowpass=f=1200,aecho=0.7:0.6:70:0.3", gain: 0.45, use: "steps on stairs" },
  footsteps_grass: { d: 3.0, e: `${stepper(0.52, 70, 28)}*0.45+0.55*${noise}*exp(-38*mod(t,0.52))*(0.8+0.2*sin(floor(t/0.52)*1.7))`, af: "highpass=f=250,lowpass=f=2400", gain: 0.4, use: "soft footsteps on grass (walking, daylight)" },
  mug_clink:    { d: 0.6, e: `(${sine(2480)}+0.5*${sine(3720)}+0.25*${sine(5300)})*${decay(16)}*0.6+0.5*${noise}*exp(-300*t)`, af: "highpass=f=800", gain: 0.28, use: "two mugs clink (ceramic / enamel)" },
  pan_sizzle:   { d: 3, g: `anoisesrc=d=3:c=white:r=44100:a=0.5:seed=21,highpass=f=3500,lowpass=f=10000,tremolo=f=9:d=0.5,afade=t=in:d=0.3,afade=t=out:st=2.2:d=0.8,volume=0.9[o]`, gain: 0.2, use: "pancakes sizzling in a pan (short)" },
  morning_chime: { d: 2.2, e: `(${sine(steps([784, 988, 1175, 1568], 0.22))}+0.3*${sine(steps([1568, 1976, 2349, 3136], 0.22))})*${decay(2.2)}*(1-exp(-60*t))`, gain: 0.2, use: "gentle ending chime (warm, daylight)" },
  thunder:      { d: 5, g: `anoisesrc=d=5:c=brown:r=44100:a=0.9:seed=11,lowpass=f=220,tremolo=f=7:d=0.45,afade=t=in:d=0.5,afade=t=out:st=2.2:d=2.8,volume=2[o]`, gain: 0.5, use: "distant thunder roll" },
  whisper:      { d: 1.6, g: `anoisesrc=d=1.6:c=pink:r=44100:a=0.9:seed=5,highpass=f=1800,lowpass=f=7500,tremolo=f=5:d=0.95,afade=t=in:d=0.2,afade=t=out:st=1.1:d=0.5,volume=2[o]`, gain: 0.3, use: "breathy whisper (no words)" },
  starter_fail: { d: 1.8, e: `(0.8*sin(2*PI*(60+25*sin(2*PI*7*t))*t)+0.2*${noise})*gt(sin(2*PI*5*t),-0.2)*exp(-1.1*t)`, af: "lowpass=f=900", gain: 0.4, use: "an engine that will not start" },
  riser:        { d: 3, e: `${noise}*pow(t/3,2)*0.6+0.3*${slide(200, 1400, 3)}*pow(t/3,2)`, af: "highpass=f=500,lowpass=f=6000", gain: 0.3, use: "tension riser into a hit" },
  breath_out:   { d: 1.3, g: `anoisesrc=d=1.3:c=pink:r=44100:a=0.9:seed=2,highpass=f=400,lowpass=f=2200,afade=t=in:d=0.35,afade=t=out:st=0.5:d=0.8,volume=1.5[o]`, gain: 0.25, use: "a breath out" },
  inhale:       { d: 1.0, g: `anoisesrc=d=1.0:c=pink:r=44100:a=0.9:seed=6,highpass=f=500,lowpass=f=2600,afade=t=in:d=0.7,afade=t=out:st=0.8:d=0.2,volume=1.5[o]`, gain: 0.25, use: "a sharp breath in" },
  chain_rattle: { d: 1.4, e: `${noise}*exp(-60*mod(t,0.11))*gt(sin(2*PI*2.3*t+0.5),-0.3)*sin(PI*t/1.4)`, af: "highpass=f=2500,lowpass=f=8000", gain: 0.3, use: "chain rattles" },
  chair_scrape: { d: 1.0, e: `${noise}*sin(PI*t)*(0.6+0.4*sin(2*PI*55*t))`, af: "highpass=f=600,lowpass=f=2500", gain: 0.3, use: "a chair scrapes the floor" },
  clock_tick:   { d: 0.1, e: `${sine(1800)}*${decay(120)}`, gain: 0.25, use: "a clock ticks" },
  pen_scratch:  { d: 0.9, e: `${noise}*(0.55+0.45*sin(2*PI*14*t))*sin(PI*t/0.9)`, af: "highpass=f=3000,lowpass=f=9000", gain: 0.2, use: "pen on paper" },
};
// aliases (same sound, other name)
for (const [a, b] of [["rain", "rain_heavy"], ["door_creak", "creak"], ["footstep", "footsteps"], ["stinger", "horror_hit"], ["water", "flood_rumble"]]) SOUNDS[a] = { ...SOUNDS[b], use: `${SOUNDS[b].use} (alias of ${b})` };

export function buildSounds(dir, names = Object.keys(SOUNDS)) {
  fs.mkdirSync(dir, { recursive: true });
  let made = 0;
  for (const name of names) {
    const s = SOUNDS[name]; if (!s) throw new Error(`unknown sound "${name}" — known: ${Object.keys(SOUNDS).join(", ")}`);
    const out = path.join(dir, `${name}.wav`);
    if (fs.existsSync(out)) continue;
    const tmp = out + ".raw.wav";
    const fades = s.loop ? "afade=t=in:d=0.004" : `afade=t=in:d=0.004,afade=t=out:st=${Math.max(0, s.d - 0.03).toFixed(3)}:d=0.03`;
    if (s.g) ff(["-filter_complex", s.g.replace(/\[o\]\s*$/, `,${fades}[o]`), "-map", "[o]", "-t", String(s.d), tmp]);
    else ff(["-f", "lavfi", "-i", `aevalsrc='0.5*(${s.e})':s=44100:d=${s.d}`, "-af", `${s.af ? s.af + "," : ""}lowpass=f=9000,${fades}`, tmp]);
    const { max } = volumedetect(tmp);
    ff(["-i", tmp, "-af", `volume=${(-3 - (isFinite(max) ? max : 0)).toFixed(2)}dB`, "-ar", "44100", "-ac", "2", out]);
    fs.rmSync(tmp); made++;
  }
  return made;
}

// every cue of the project: { t, name, pan, gain, loop, why }
export function cueList(root) {
  const cfg = config(root), caps = loadCaptions(root) || [], T = loadTiming(root) || {}, CH = T.chars || [];
  const html = fs.readFileSync(path.join(root, "index.html"), "utf8");
  const cues = [];
  const cut = cfg.sfx && "scene_cut" in cfg.sfx ? cfg.sfx.scene_cut : null;
  if (cut && SOUNDS[cut]) [...html.matchAll(/<section\b[^>]*\sdata-start="([\d.]+)"/g)].map((m) => +m[1]).sort((a, b) => a - b).slice(1)
    .forEach((t) => cues.push({ t: t + 0.18, name: cut, pan: 0, gain: SOUNDS[cut].gain * (cfg.sfx?.scene_cut_gain ?? 0.8), loop: false, why: "scene cut" }));
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
      if (!SOUNDS[name]) throw new Error(`line ${c.key}: unknown sfx "${name}" (visual-proof sfx --list)`);
      cues.push({ t, name, pan, gain: SOUNDS[name].gain * Number(gp || 1), loop: !!SOUNDS[name].loop, why: `${c.key} ${plain.slice(0, 28)}` });
    }
  });
  // scene.js sfx (names from the kit's list; a few map onto the synthesized set here)
  const ALIAS = { swish: "whoosh", plop: "pop", stamp: "thud", bit_tick: "tick", bit_coin: "coin", bit_blip: "blip" };
  const PRI = { ding: 5, chime: 5, sparkle: 4, pop: 4, tick: 3, coin: 3, blip: 3, thud: 2, whoosh: 1 };
  try {
    const S = loadScene(path.join(root, "scene.js")), sc = loadCaps(path.join(root, "captions.js"), path.join(root, "timing.js")) || [];
    const starts = {}; for (const m of html.matchAll(/<section[^>]*data-shot="([^"]+)"[^>]*>/g)) starts[m[1]] = +(m[0].match(/data-start="([\d.]+)"/) || [])[1] || 0;
    let list = sceneCues(root, S, sc, starts).map((c) => ({ ...c, name: ALIAS[c.sfx] || c.sfx })).filter((c) => { if (SOUNDS[c.name]) return true; console.warn(`  ! scene sfx "${c.sfx}" (${c.why}) has no synthesized sound here — skipped`); return false; });
    for (let i = 1; i < list.length; i++) if (list[i].t - list[i - 1].t < 0.2) ((PRI[list[i].name] || 0) >= (PRI[list[i - 1].name] || 0) ? list[i - 1] : list[i]).drop = true;
    list = list.filter((c) => !c.drop);
    const end = list.length ? list[list.length - 1].t : 0, budget = Math.max(6, Math.round((10 * Math.max(end, 30)) / 30));
    while (list.length > budget) { const low = [...list].sort((a, b) => (PRI[a.name] || 0) - (PRI[b.name] || 0))[0]; list = list.filter((c) => c !== low); }
    for (const c of list) cues.push({ t: c.t, name: c.name, pan: 0, gain: SOUNDS[c.name].gain, loop: false, why: `scene ${c.why}` });
  } catch (e) { console.warn(`  ! scene.js sfx skipped: ${e.message}`); }
  return cues.sort((a, b) => a.t - b.t);
}

export async function run(argv) {
  const args = parseArgs(argv);
  if (args.list) { for (const [n, s] of Object.entries(SOUNDS)) console.log(`${n.padEnd(14)} ${String(s.d).padStart(5)} s${s.loop ? " loop" : "     "}  ${s.use}`); return; }
  if (args.play) {
    const dir = path.join(process.cwd(), ".visual-proof-sfx-preview"); buildSounds(dir, [args.play]);
    const f = path.join(dir, `${args.play}.wav`), pl = which("afplay") ? ["afplay", [f]] : ["ffplay", ["-autoexit", "-nodisp", f]];
    spawnSync(pl[0], pl[1], { stdio: "ignore" }); fs.rmSync(dir, { recursive: true, force: true }); return;
  }
  const root = projectDir(args);
  const cues = cueList(root);
  const made = buildSounds(path.join(root, "assets/sfx"), [...new Set(cues.map((c) => c.name))]);
  for (const c of cues) console.log(`${c.t.toFixed(2).padStart(7)} s  ${c.name.padEnd(12)}${c.pan ? ` pan ${c.pan}` : ""}  ${c.why}`);
  console.log(`✓ ${cues.length} cues · ${made} sound(s) synthesized into assets/sfx`);
}
// genhaha:ed4a029a9d2b
