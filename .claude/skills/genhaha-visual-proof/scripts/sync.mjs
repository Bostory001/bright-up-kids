// visual-proof sync — lint scene.js (+ captions.js) and write the <section data-shot> clips of index.html from the captions.js shot ranges.
//   visual-proof sync [--project <dir>] [--silent]     lint, then write sections (existing times kept; `voice` retimes them to the voice)
//                                                      --silent: no voice — times from the captions.js estimates, the <audio> tag removed, video.json mode "silent"
//   visual-proof lint [--project <dir>]                 lint only (exit 1 on errors)
//   visual-proof catalog [--json]                       every shot type, part (+ its keys), palette, ink, camera, enter, transition, ground, operator, graph fn, sfx
// Errors name the exact path (shots.s2.figure[3].part), what is wrong, a "did you mean" and a one-line fix.
import fs from "node:fs";
import path from "node:path";
import { parseArgs, projectDir, config, writeJson } from "./lib/common.mjs";
import { VPV, loadScene, loadCaps, lintScene, printIssues } from "./lib/vp.mjs";

export function lintProject(root, label = "scene.js") {
  const S = loadScene(path.join(root, "scene.js"));
  const caps = loadCaps(path.join(root, "captions.js"), path.join(root, "timing.js")) || [];
  const r = lintScene(S, caps, root);
  console.log(`${r.errors.length ? "✗" : r.warnings.length ? "⚠" : "✓"} ${label}: ${r.ids.length} sections · ${r.errors.length} errors · ${r.warnings.length} warnings`);
  printIssues(r.issues);
  // pacing: never under 2.5 s per section
  const span = {}; for (const c of caps) { const x = (span[c.shot] ||= { s: 1e9, e: 0 }); x.s = Math.min(x.s, c.start); x.e = Math.max(x.e, c.end); }
  for (const [id, x] of Object.entries(span)) if (x.e - x.s < 2.5) console.log(`  ⚠ shot ${id}: ${(x.e - x.s).toFixed(1)} s on screen (< 2.5 s) — merge the line into the previous shot`);
  return { S, caps, ...r };
}

export async function runCatalog(argv) {
  const a = parseArgs(argv), c = VPV().catalog();
  if (a.json) { console.log(JSON.stringify(c, null, 1)); return; }
  console.log("shot types:", c.types.join(" "));
  for (const [g, list] of Object.entries(c.partsByGroup)) console.log(`parts/${g}:`, list.map((n) => `${n}(${c.partKeys[n].req.join(",")}${c.partKeys[n].opt.length ? " | " + c.partKeys[n].opt.join(",") : ""})`).join("  "));
  console.log("palettes:", c.palettes.join(" "), "\ninks:", c.inks.join(" "), "+", c.neutrals.join(" "), "\ncameras:", c.cameras.join(" "), "\nenters:", c.enters.join(" "), "\ntransitions:", c.transitions.join(" "), "\ngrounds:", c.grounds.join(" "));
  console.log("ops:", c.ops.join(" "), "\ngraph fns:", c.fns.join(" "), "\nsfx:", c.sfx.join(" "), "\nshot keys:", c.shotKeys.join(" "), "\ntype keys:", JSON.stringify(c.typeKeys));
  console.log(`parts: ${c.parts.length} · limits:`, JSON.stringify(c.limits));
}
export async function runLint(argv) { const root = projectDir(parseArgs(argv)); return lintProject(root).errors.length ? 1 : 0; }

export async function run(argv) {
  const args = parseArgs(argv), root = projectDir(args);
  const { S, caps, errors, ids } = lintProject(root);
  if (errors.length && !args.force) throw new Error("stopped: fix the errors above (or --force)");
  const idx = path.join(root, "index.html");
  let html = fs.readFileSync(idx, "utf8");
  const old = {}; for (const m of html.matchAll(/<section[^>]*data-shot="([^"]+)"[^>]*>/g)) old[m[1]] = { s: +(m[0].match(/data-start="([\d.]+)"/) || [])[1], d: +(m[0].match(/data-duration="([\d.]+)"/) || [])[1] };
  const capShots = {}; for (const c of caps) { const r = (capShots[c.shot] ||= { s: 1e9, e: 0 }); r.s = Math.min(r.s, c.start); r.e = Math.max(r.e, c.end); }
  if (args.silent) for (const k of Object.keys(old)) delete old[k];
  let t = 0;
  const rows = ids.map((id, i) => {
    const o = old[id] || (capShots[id] ? { s: capShots[id].s, d: +(capShots[id].e - capShots[id].s).toFixed(2) } : null);
    const start = o ? o.s : t, dur = o ? o.d : 4; t = start + dur;
    return `      <section id="sc-${id}" class="clip" data-shot="${id}" data-start="${start}" data-duration="${dur}" data-track-index="${i + 1}"></section>`;
  });
  const re = /( *<!-- vp:sections -->\n)[\s\S]*?( *<!-- \/vp:sections -->)/;
  if (!re.test(html)) throw new Error("index.html has no <!-- vp:sections --> markers");
  html = html.replace(re, `$1${rows.join("\n")}\n$2`);
  const firstOld = Object.keys(old)[0];
  if (args.silent || !firstOld) {
    const total = +(t + (args.silent ? 2.2 : 0.4)).toFixed(2);
    for (const id of ["root", "stage", "captions", "chrome"]) html = html.replace(new RegExp(`(<div id="${id}"[^>]*data-duration=")[\\d.]+"`), `$1${total}"`);
    html = html.replace(/(<audio id="vo"[^>]*data-duration=")[\d.]+"/, `$1${total}"`);
    if (args.silent) html = html.replace(/<audio id="vo"[^>]*><\/audio>\n?\s*/, "");
  }
  if (!args.silent && !/<audio id="vo"/.test(html) && fs.existsSync(path.join(root, "assets/voice/voiceover.wav"))) {
    const total = (html.match(/<div id="root"[^>]*data-duration="([\d.]+)"/) || [])[1] || t.toFixed(2);
    html = html.replace(/( *)<div id="captions"/, `$1<audio id="vo" src="assets/voice/voiceover.wav" data-start="0" data-duration="${total}" data-track-index="30" data-volume="1"></audio>\n$1<div id="captions"`);
  }
  fs.writeFileSync(idx, html);
  if (args.silent) { const cfg = config(root); cfg.mode = "silent"; cfg.music = { ...(cfg.music || {}), level: cfg.music?.level >= 0.3 ? cfg.music.level : 0.5 }; writeJson(path.join(root, "video.json"), cfg); }
  console.log(`✓ ${ids.length} sections (${t.toFixed(2)} s): ${ids.join(", ")}${args.silent ? " · silent clip (no voice)" : ""}`);
}
// genhaha:ed4a029a9d2b
