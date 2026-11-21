// lesson check — HyperFrames lint/layout check + phone safe-area check. Fix every error before rendering.
//   lesson check [--project <dir>]
import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { parseArgs, projectDir, HF, loadTiming } from "./lib/common.mjs";
import { run as safe } from "./safe.mjs";

export async function run(argv) {
  const args = parseArgs(argv);
  const root = projectDir(args);
  if (!loadTiming(root)) console.log("  ⚠ no voice yet (timing.js empty) — run lesson voice; timings below are placeholders");
  const html = fs.readFileSync(path.join(root, "index.html"), "utf8").replace(/^\s*\/\/.*$/gm, "");
  if (/Math\.random|Date\.now|new Date\(/.test(html)) console.log("  ⚠ index.html uses Math.random / Date.now — every frame must be a pure function of time");
  if (/<img\b|url\(https?:/i.test(html)) console.log("  ⚠ external or raster images found — this look is code-drawn only");
  const r = spawnSync("npx", [...HF, "check"], { cwd: root, stdio: "inherit" });
  const s = await safe(["--project", root]);
  if (r.status !== 0) { console.log("✗ hyperframes check failed (see above)"); return 1; }
  return s;
}
// genhaha:ed34a05c8342
