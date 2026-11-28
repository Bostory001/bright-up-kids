// visual-proof check — scene.js validation (named errors, the same validator the page runs) + script rules + the page opens without errors + HyperFrames check + safe area (9:16). Fix every error before rendering.
//   visual-proof check [--project <dir>]
// Checks: every shot type / part / palette / ink / camera / caption key / time string named in scene.js exists · no Math.random / Date.now · video.json size = 1080x1920
// · subtitle lines not too long · shots 2.5-7.5 s · titles / equations / subtitles short enough for the safe area (y 250–1520) · HyperFrames check.
import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { parseArgs, projectDir, HF, loadTiming, loadCaptions, config, modeOf, dims } from "./lib/common.mjs";
import { run as safe } from "./safe.mjs";
import { openComposition } from "./lib/browser.mjs";
import { lintProject } from "./sync.mjs";

export async function run(argv) {
  const args = parseArgs(argv);
  const root = projectDir(args);
  let bad = 0;
  const cfg0 = config(root), mode = modeOf(cfg0), D = dims(root);
  console.log(`  aspect ${D.aspect} (${D.w}x${D.h})`);
  if (cfg0.width && cfg0.height && (cfg0.width !== D.w || cfg0.height !== D.h)) { bad++; console.log(`  ✗ video.json says ${cfg0.width}x${cfg0.height} but index.html #root is ${D.w}x${D.h}`); }
  if (!(D.w === 1080 && D.h === 1920)) { bad++; console.log(`  ✗ ${D.w}x${D.h} — visual-proof is laid out for 1080x1920 (9:16) only`); }
  if (!String(config(root).publish?.ai_disclosure || "").trim()) { bad++; console.log("  ✗ video.json → publish.ai_disclosure is empty — the AI-voice / code-drawn disclosure line is required (e.g. เสียงพากย์สร้างด้วย AI · ภาพวาดด้วยโค้ด)"); }
  if (mode === "narrated" && !loadTiming(root)) console.log("  ⚠ narrated clip but no voice yet (timing.js empty) — run visual-proof voice");
  const html = fs.readFileSync(path.join(root, "index.html"), "utf8").replace(/^\s*\/\/.*$/gm, "").replace(/<!--[\s\S]*?-->/g, "");
  if (/Math\.random|Date\.now|new Date\(|requestAnimationFrame|performance\.now/.test(html)) { bad++; console.log("  ✗ index.html uses Math.random / Date.now / requestAnimationFrame — every frame must be a pure function of time (the kit is seeded: write data, not randomness)"); }
  if (/https?:\/\/(?!hyperframes\.heygen\.com)/.test(html.replace(/xmlns="[^"]*"/g, ""))) console.log("  ⚠ index.html loads something from the internet — keep GSAP / fonts local so the render works offline");
  if (/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/u.test(html)) { bad++; console.log("  ✗ emoji / pictograph characters found in index.html — not allowed in this look"); }
  if (/backdrop-filter/.test(html)) console.log("  ⚠ backdrop-filter (glass card) in index.html — not allowed in this look");
  try {
    const caps = loadCaptions(root) || [];
    const keys = new Set(); for (const c of caps) { if (keys.has(c.key)) { bad++; console.log(`  ✗ duplicate caption key "${c.key}" in captions.js`); } keys.add(c.key); }
    const lens = [...new Set(caps.map((c) => c.shot))].map((id) => { const cs = caps.filter((c) => c.shot === id); return { id, d: cs[cs.length - 1].end - cs[0].start }; });
    const short = lens.filter((s) => s.d < 2.4), longS = lens.filter((s) => s.d > 7.5);
    if (short.length) console.log(`  ⚠ shot(s) shorter than 2.5 s: ${short.map((s) => `${s.id} ${s.d.toFixed(1)}`).join(", ")} — merge with a neighbour`);
    if (longS.length) console.log(`  ⚠ shot(s) longer than 7.5 s on one picture: ${longS.map((s) => `${s.id} ${s.d.toFixed(1)}`).join(", ")} — split or add a camera move`);
  } catch (e) { console.log(`  ⚠ script check skipped: ${e.message}`); }
  // scene.js through the validator, then the page itself opens in Chrome (a red card #vperr = data error the validator did not catch)
  try { const r = lintProject(root); bad += r.errors.length; } catch (e) { bad++; console.log(`  ✗ scene.js / captions.js could not be read: ${e.message}`); }
  try {
    const pg = await openComposition(root);
    try {
      const w = [...new Set(pg.warnings)];
      if (w.length) { console.log(`  ⚠ ${w.length} warning(s) from the page:`); for (const x of w.slice(0, 10)) console.log(`    ${x}`); }
      const errs = [...new Set(pg.errors)];
      if (errs.length) { bad++; console.log(`  ✗ page errors: ${errs.join(" | ")}`); } else console.log("  ✓ page opens and draws without errors");
    } finally { await pg.close(); }
  } catch (e) {
    bad++; console.log(`  ✗ the scene could not be opened: ${e.message}`);
  }
  const hfr = spawnSync("npx", [...HF, "check"], { cwd: root, encoding: "utf8", maxBuffer: 1 << 26 });
  const hfOut = (hfr.stdout || "") + (hfr.stderr || ""), r = { status: hfr.status };
  { const L = hfOut.split("\n"), keep = L.filter((l) => /^\s*✗|error\(s\)|Check failed|Check passed|audio_src_not_found|Report:/.test(l) && !/^\s*0 error\(s\)/.test(l) && !/need 3:1/.test(l));   // contrast notes on the ink-on-paper colours are advisory, they do not fail the check
    const warn = (hfOut.match(/^\s*⚠\s+\S+/gm) || []).length;
    console.log(`  HyperFrames check: ${hfr.status === 0 ? "passed" : "FAILED"}${warn ? ` (${warn} warning(s) hidden: caption cross-fade overlap, nested stage/captions are normal for this look; add --verbose to see them)` : ""}`);
    if (args.verbose) console.log(hfOut); else for (const l of keep) console.log(`    ${l.trim()}`); }
  const s = bad ? 1 : await safe(["--project", root]);
  if (r.status !== 0) { console.log("✗ hyperframes check failed (see above)"); return 1; }
  if (bad) { console.log(`✗ ${bad} problem(s) to fix `); return 1; }
  return s;
}
// genhaha:ed4a029a9d2b
