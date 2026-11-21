// cutout check — SCENE validation (named errors) + script rules + HyperFrames lint/layout check + phone safe area. Fix every error before rendering.
//   cutout check [--project <dir>]
// Checks: every set / prop / pose / face / mood / hold / character / caption key / overlay named in the SCENE exists (the page reports the valid choices) · no Math.random / Date.now
// · subtitle lines not too long · shots 2.5-7 s · text and subtitles inside the phone safe area (y 250–1520, nothing right of x 960 below y 900) · HyperFrames check.
import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { parseArgs, projectDir, HF, loadTiming, loadCaptions, config, modeOf } from "./lib/common.mjs";
import { run as safe } from "./safe.mjs";
import { openComposition } from "./lib/browser.mjs";

export async function run(argv) {
  const args = parseArgs(argv);
  const root = projectDir(args);
  let bad = 0;
  const mode = modeOf(config(root));
  if (!String(config(root).publish?.ai_disclosure || "").trim()) { bad++; console.log("  ✗ video.json → publish.ai_disclosure is empty — fiction must carry a disclosure line (e.g. เรื่องแต่ง … · เสียงพากย์สร้างด้วย AI · ภาพเคลื่อนไหวสร้างด้วยโค้ด)"); }
  if (mode === "narrated" && !loadTiming(root)) console.log("  ⚠ narrated clip but no voice yet (timing.js empty) — run cutout voice");
  const html = fs.readFileSync(path.join(root, "index.html"), "utf8").replace(/^\s*\/\/.*$/gm, "").replace(/<!--[\s\S]*?-->/g, "");
  if (/Math\.random|Date\.now|new Date\(|requestAnimationFrame|performance\.now/.test(html)) { bad++; console.log("  ✗ index.html uses Math.random / Date.now / requestAnimationFrame — every frame must be a pure function of time (the kit has a seeded PRNG: K.rng(seed))"); }
  if (/https?:\/\/(?!hyperframes\.heygen\.com)/.test(html.replace(/xmlns="[^"]*"/g, ""))) console.log("  ⚠ index.html loads something from the internet — keep GSAP / fonts local so the render works offline");
  if (/<img\b|url\(https?:/i.test(html)) console.log("  ⚠ images found — the picture is drawn as SVG by the kit; images are not part of this look");
  if (/font-family:\s*['"]?Kanit/i.test(html.replace(/@font-face[^}]*}/g, ""))) console.log("  ⚠ index.html names the font Kanit in inline CSS — inherit it from look.css instead");
  if (/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/u.test(html)) { bad++; console.log("  ✗ emoji / pictograph characters found in index.html — not allowed in this look"); }
  if (/backdrop-filter/.test(html)) console.log("  ⚠ backdrop-filter (glass card) in index.html — not allowed in this look");
  try {
    const caps = loadCaptions(root) || [];
    const keys = new Set(); for (const c of caps) { if (keys.has(c.key)) { bad++; console.log(`  ✗ duplicate caption key "${c.key}" in captions.js`); } keys.add(c.key); }
    const glyphs = (t) => [...t.replace(/[\[\]\s]/g, "")].filter((ch) => !/[ัิ-ฺ็-๎]/.test(ch)).length;   // base glyphs only (tone / vowel marks take no width)
    const long = caps.filter((c) => glyphs(c.text) > 30);
    if (long.length) console.log(`  ⚠ long subtitle line(s) (> 30 Thai glyphs: the subtitle will shrink to fit 2 rows): ${long.map((c) => c.key).join(", ")} — split into two chunks`);
    const lens = [...new Set(caps.map((c) => c.shot))].map((id) => { const cs = caps.filter((c) => c.shot === id); return { id, d: cs[cs.length - 1].end - cs[0].start }; });
    const short = lens.filter((s) => s.d < 2.4), longS = lens.filter((s) => s.d > 7.5);
    if (short.length) console.log(`  ⚠ shot(s) shorter than 2.5 s: ${short.map((s) => `${s.id} ${s.d.toFixed(1)}`).join(", ")} — merge with a neighbour`);
    if (longS.length) console.log(`  ⚠ shot(s) longer than 7.5 s on one picture: ${longS.map((s) => `${s.id} ${s.d.toFixed(1)}`).join(", ")} — split or add a camera move`);
  } catch (e) { console.log(`  ⚠ script check skipped: ${e.message}`); }
  // SCENE validation + page console warnings / errors, in the same Chrome that draws the frames
  try {
    const pg = await openComposition(root).catch(async (e) => { throw e; });
    try {
      const V = await pg.evaluate("window.__CO_VALIDATION || null");
      if (V) { for (const m of V.errors) { bad++; console.log(`  ✗ SCENE: ${m}`); } for (const m of V.warnings) console.log(`  ⚠ SCENE: ${m}`); if (!V.errors.length) console.log(`  ✓ SCENE data valid${V.warnings.length ? ` (${V.warnings.length} warning(s))` : ""}`); }
      const w = [...new Set(pg.warnings)].filter((x) => !/useLegacyLights/.test(x));
      if (w.length) { console.log(`  ⚠ ${w.length} warning(s) from the page:`); for (const x of w.slice(0, 10)) console.log(`    ${x}`); }
      const errs = [...new Set(pg.errors)].filter((e) => !(V && V.errors.length && /^Error: SCENE has/.test(e)));
      if (errs.length) { bad++; console.log(`  ✗ page errors: ${errs.join(" | ")}`); }
    } finally { await pg.close(); }
  } catch (e) {
    bad++; console.log(`  ✗ the scene could not be opened: ${e.message}`);
  }
  const hfr = spawnSync("npx", [...HF, "check"], { cwd: root, encoding: "utf8", maxBuffer: 1 << 26 });
  const hfOut = (hfr.stdout || "") + (hfr.stderr || ""), r = { status: hfr.status };
  { const L = hfOut.split("\n"), keep = L.filter((l) => /^\s*✗|error\(s\)|Check failed|Check passed|audio_src_not_found|Report:/.test(l) && !/^\s*0 error\(s\)/.test(l) && !/need 3:1/.test(l));   // contrast notes on flat cutout colours are advisory, they do not fail the check
    const warn = (hfOut.match(/^\s*⚠\s+\S+/gm) || []).length;
    console.log(`  HyperFrames check: ${hfr.status === 0 ? "passed" : "FAILED"}${warn ? ` (${warn} warning(s) hidden: caption cross-fade overlap, nested stage/captions are normal for this look; add --verbose to see them)` : ""}`);
    if (args.verbose) console.log(hfOut); else for (const l of keep) console.log(`    ${l.trim()}`); }
  const s = bad ? 1 : await safe(["--project", root]);
  if (r.status !== 0) { console.log("✗ hyperframes check failed (see above)"); return 1; }
  if (bad) { console.log(`✗ ${bad} problem(s) to fix (safe-area check skipped until the scene opens)`); return 1; }
  return s;
}
// genhaha:5f8f980bb7f3
