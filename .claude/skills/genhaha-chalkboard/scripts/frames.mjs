// chalkboard frames — look before you render: screenshots of the composition at chosen times + one contact sheet.
//   chalkboard frames [--project <dir>] [--at 0.5,3,7.2]       specific times
//   chalkboard frames --lines                                   one frame per caption line (line start + 0.8 s) — the default
//   chalkboard frames --video renders/<slug>-final.mp4 [--every 3]   contact sheet of a rendered MP4 instead
// Output: renders/frames/*.jpg + renders/frames/sheet.jpg (open it with the Read tool to look at it).
import fs from "node:fs";
import path from "node:path";
import { parseArgs, projectDir, loadCaptions, ff, probeDuration, dims } from "./lib/common.mjs";
import { openComposition } from "./lib/browser.mjs";

export function sheet(files, out, cols = 6, wide = false) {
  if (wide) cols = Math.min(cols, 4);
  const tmp = path.join(path.dirname(out), "_tile");
  fs.mkdirSync(tmp, { recursive: true });
  files.forEach((f, i) => fs.copyFileSync(f, path.join(tmp, `t-${String(i).padStart(3, "0")}.jpg`)));
  const rows = Math.ceil(files.length / cols);
  ff(["-pattern_type", "glob", "-i", path.join(tmp, "t-*.jpg"), "-vf", `scale=${wide ? 384 : 216}:${wide ? 216 : 384}:flags=lanczos,tile=${cols}x${rows}:padding=4:color=0x202020`, "-frames:v", "1", "-q:v", "3", out]);
  fs.rmSync(tmp, { recursive: true, force: true });
}

export async function run(argv) {
  const args = parseArgs(argv);
  const root = projectDir(args);
  const dir = path.join(root, "renders/frames");
  fs.rmSync(dir, { recursive: true, force: true }); fs.mkdirSync(dir, { recursive: true });
  const files = [];
  if (args.video) {
    const v = path.resolve(root, String(args.video)), D = probeDuration(v), every = Number(args.every ?? 3);
    for (let t = 0.05, i = 0; t < D; t += i === 0 ? every - 0.05 : every, i++) {
      const f = path.join(dir, `v-${t.toFixed(2).padStart(6, "0")}.jpg`); ff(["-ss", t.toFixed(2), "-i", v, "-frames:v", "1", "-q:v", "3", f]); files.push(f);
    }
  } else {
    const times = args.at ? String(args.at).split(",").map(Number) : loadCaptions(root).map((c) => +(c.start + 0.8).toFixed(2));
    const pg = await openComposition(root);
    try { for (const t of times) { await pg.seek(t); const f = path.join(dir, `f-${t.toFixed(2).padStart(6, "0")}.jpg`); await pg.screenshot(f); files.push(f); } }
    finally { await pg.close(); }
    if (pg.errors.length) console.log(`  page errors: ${[...new Set(pg.errors)].join(" | ")}`);
  }
  const wide = !dims(root).portrait;
  sheet(files, path.join(dir, "sheet.jpg"), 6, wide);
  console.log(`✓ ${files.length} frames → ${path.relative(process.cwd(), path.join(dir, "sheet.jpg"))}  (${wide ? 4 : 6} per row, left→right, top→bottom)`);
}
// genhaha:781c07c7ad6b
