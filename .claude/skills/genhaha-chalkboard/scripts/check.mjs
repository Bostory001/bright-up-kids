// chalkboard check — HyperFrames lint/layout check + safe area (phone 9:16, or TV margins 16:9) + chalkboard rules. Lanes below are the 9:16 ones; 16:9 (1920x1080): board text x 70–1850, y 60–800, subtitles y 840–990. Fix every ✗ and ⚠ before rendering.
//   chalkboard check [--project <dir>] [--step 0.1]
// Rules checked: no Math.random / Date.now · no CDN scripts, raster or <image> pictures (the board is drawn by code)
// · every key used in index.html (say / at / end / atW, also ["k1","k2"].forEach((k) => T.say(k)) lists) exists in captions.js
// · every caption line is said by the teacher (T.say(key) — else the mouth stays shut on that line)
// · each shot ≥ 3 s (≤ 9 s) on screen · subtitle lines not too long for the lane (from y 1262, 3 rows by y 1520)
// · board text (C.write, read from window.__chalk) inside y 250–1520, inside the board (x 40–1040), not right of x 960 below y 900,
//   not on the subtitle lane (y > 1250), not on the teacher; Thai on the board short (it is wiped in, not handwritten)
// · page errors · phone safe area of every DOM/SVG text, sampled every --step s (default 0.1).
import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { parseArgs, projectDir, HF, loadTiming, loadCaptions, dims } from "./lib/common.mjs";
import { run as safe } from "./safe.mjs";
import { openComposition } from "./lib/browser.mjs";

export async function run(argv) {
  const args = parseArgs(argv);
  const root = projectDir(args);
  const D = dims(root), WIDE = !D.portrait;
  let warn = 0;
  const W = (m) => { warn++; console.log(`  ⚠ ${m}`); };
  console.log(`  aspect ${D.aspect} (${D.w}x${D.h})`);
  try { const c0 = JSON.parse(fs.readFileSync(path.join(root, "video.json"), "utf8")); if (c0.width && c0.height && (c0.width !== D.w || c0.height !== D.h)) W(`video.json says ${c0.width}x${c0.height} but index.html #root is ${D.w}x${D.h} — run: chalkboard aspect ${D.aspect}`); } catch {}
  if (D.w * D.h !== 1920 * 1080) W(`${D.w}x${D.h} is not a supported size — use 1920x1080 (16:9) or 1080x1920 (9:16)`);
  if (!loadTiming(root)) W("no voice yet (timing.js empty) — run voice; timings below are placeholders");
  const html = fs.readFileSync(path.join(root, "index.html"), "utf8").replace(/<!--[\s\S]*?-->/g, "").replace(/^\s*\/\/.*$/gm, "");
  if (/Math\.random|Date\.now|new Date\(/.test(html)) W("index.html uses Math.random / Date.now — every frame must be a pure function of time");
  if (/<script[^>]+src="(https?:)?\/\//i.test(html) || /<link[^>]+href="(https?:)?\/\//i.test(html)) W("a <script> or stylesheet loads from the internet — use the local gsap.min.js / fonts (the render must work offline)");
  if (/<img\b|<image\b|url\(\s*["']?https?:|\.(png|jpe?g|webp|gif|avif)\b["')]/i.test(html)) W("raster / external images found — the chalkboard is drawn by code (C.write / C.line / C.circle / C.path …)");
  let caps = [];
  try {
    caps = loadCaptions(root) || [];
    const keys = new Set(caps.map((c) => c.key));
    // every key the scene code uses must exist (a missing key throws in the page and the clip goes blank)
    const used = [...html.matchAll(/\b(say|at|end|atW|cutAt)\(\s*"([^"]+)"/g)].map((m) => ({ fn: m[1], key: m[2] }));
    for (const m of html.matchAll(/\[((?:\s*"[^"]+"\s*,?)+)\]\.forEach\(\s*\(?\s*(\w+)[^)]*\)?\s*=>([^;]*)/g)) {
      const fn = (m[3].match(new RegExp(`\\b(say|at|end|atW)\\(\\s*${m[2]}\\b`)) || [])[1];
      if (fn) for (const k of m[1].match(/"([^"]+)"/g).map((s) => s.slice(1, -1))) used.push({ fn, key: k });
    }
    const miss = [...new Set(used.filter((u) => !keys.has(u.key)).map((u) => `${u.fn}("${u.key}")`))];
    if (miss.length) W(`key(s) used in index.html but not in captions.js: ${miss.join(", ")}`);
    // shots: one picture ≥ 3 s, ≤ 9 s — measured on screen: from this <section>'s start to the next one (the last runs to the end)
    const ids = [...new Set(caps.map((c) => c.shot))];
    const sec = [...html.matchAll(/<section\b[^>]*>/g)].map((m) => ({ shot: (m[0].match(/data-shot="([^"]+)"/) || [])[1], start: +((m[0].match(/data-start="([\d.]+)"/) || [])[1] ?? NaN) })).filter((s) => s.shot && isFinite(s.start)).sort((a, b) => a.start - b.start);
    const total = +((html.match(/id="root"[^>]*data-duration="([\d.]+)"/) || [])[1] ?? 0);
    const lens = sec.length === ids.length && total ? sec.map((s, i) => ({ id: s.shot, d: (sec[i + 1]?.start ?? total) - s.start }))
      : ids.map((id) => { const cs = caps.filter((c) => c.shot === id); return { id, d: cs[cs.length - 1].end - cs[0].start }; });
    const short = lens.filter((s) => s.d < 3), longS = lens.filter((s) => s.d > 9);
    if (short.length) W(`shot(s) shorter than 3 s: ${short.map((s) => `${s.id} ${s.d.toFixed(1)} s`).join(", ")} — merge with a neighbour or add a line`);
    if (longS.length) W(`shot(s) longer than 9 s: ${longS.map((s) => `${s.id} ${s.d.toFixed(1)} s`).join(", ")} — split it, or erase and start a new page inside it`);
    if (total > 34) W(`clip is ${total.toFixed(1)} s — the chalkboard default is ≤ 32 s (fine if the user asked for longer)`);
    const secs = [...html.matchAll(/data-shot="([^"]+)"/g)].map((m) => m[1]);
    const noSec = ids.filter((id) => !secs.includes(id)), noCap = secs.filter((id) => !ids.includes(id));
    if (noSec.length) W(`shot(s) in captions.js without a <section data-shot>: ${noSec.join(", ")}`);
    if (noCap.length) W(`<section data-shot> without captions: ${noCap.join(", ")}`);
    // the subtitle lane from y 1262: ~24 Thai characters per row, 3 rows end by y 1520
    const max = WIDE ? 80 : 60, long = caps.filter((c) => [...c.text.replace(/[\[\]\s]/g, "")].length > max);
    if (long.length) W(`long subtitle line(s) (> ${max} characters, ${WIDE ? "a 3rd row would run past y 1000" : "a 4th row would run past y 1520"}): ${long.map((c) => c.key).join(", ")} — split into two chunks`);
  } catch (e) { W(`script check skipped: ${e.message}`); }
  // page: kit errors (unknown key, bad pose) + console warnings (atW word not found …) + the chalk log (board text boxes, said lines)
  try {
    const pg = await openComposition(root);
    try {
      const w = [...new Set(pg.warnings)];
      if (w.length) { W(`${w.length} page warning(s):`); for (const x of w.slice(0, 12)) console.log(`    ${x}`); }
      if (pg.errors.length) console.log(`  ✗ page errors: ${[...new Set(pg.errors)].join(" | ")}`);
      const L = await pg.evaluate("JSON.stringify(window.__chalk || null)").then((s) => JSON.parse(s || "null"));
      if (!L) W("window.__chalk missing — index.html must build the board with Chalk(tl, M) from chalk-kit.js");
      else {
        if (L.teacher) {
          const said = new Set(L.said), mute = caps.filter((c) => !said.has(c.key));
          if (mute.length) W(`line(s) the teacher never says (no T.say("key") — the mouth stays shut): ${mute.map((c) => c.key).join(", ")}`);
        }
        const bad = [];
        for (const b of L.writes) {
          const why = [];
          if (WIDE) {
            if (b.top < 60) why.push(`top ${Math.round(b.top)} < 60 (16:9 frame margin)`);
            if (b.bottom > 1000) why.push(`bottom ${Math.round(b.bottom)} > 1000`);
            else if (b.bottom > 830) why.push(`bottom ${Math.round(b.bottom)} runs into the subtitle lane (from y 840)`);
            if (b.x0 < 70 || b.x1 > 1850) why.push(`x ${Math.round(b.x0)}–${Math.round(b.x1)} leaves the board (70–1850)`);
          } else {
            if (b.top < 250) why.push(`top ${Math.round(b.top)} < 250`);
            if (b.bottom > 1520) why.push(`bottom ${Math.round(b.bottom)} > 1520`);
            else if (b.bottom > 1250) why.push(`bottom ${Math.round(b.bottom)} runs into the subtitle lane (from y 1262)`);
            if (b.x0 < 40 || b.x1 > 1040) why.push(`x ${Math.round(b.x0)}–${Math.round(b.x1)} leaves the board (40–1040)`);
            if (b.x1 > 960 && b.bottom > 900) why.push(`right ${Math.round(b.x1)} > 960 below y 900 (phone buttons)`);
          }
          const T = L.teacher;
          if (T && b.x1 > T.x0 + 20 && b.x0 < T.x1 && b.bottom > T.top + 20 && b.top < T.bottom) why.push(`overlaps the teacher (x ${Math.round(T.x0)}–${Math.round(T.x1)}, y ${Math.round(T.top)}–${T.bottom})`);
          if ([...b.thai.replace(/\s/g, "")].length > 14) why.push(`${[...b.thai].length} Thai characters — Thai is wiped in, not handwritten: keep it to a word or two, say the rest`);
          if (why.length) bad.push(`${b.t.toFixed(1)} s "${b.text}": ${why.join(", ")}`);
        }
        if (bad.length) { W(`${bad.length} board text placement problem(s) (writing area ${WIDE ? "y 70–800" : "y 270–1000"}):`); for (const x of bad.slice(0, 15)) console.log(`    ${x}`); }
        else console.log(`  ✓ board text: ${L.writes.length} C.write call(s) inside the lanes`);
      }
    } finally { await pg.close(); }
  } catch (e) { W(`page check skipped: ${e.message}`); }
  const r = spawnSync("npx", [...HF, "check"], { cwd: root, stdio: "inherit" });
  const s = await safe(["--project", root, "--step", String(args.step ?? 0.1)]);
  if (!warn) console.log("✓ script + scene rules");
  if (r.status !== 0) { console.log("✗ hyperframes check failed (see above)"); return 1; }
  return s;
}
// genhaha:781c07c7ad6b
