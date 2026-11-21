// chalkboard aspect [16:9|9:16] — show or switch the shape of a project (the shell only).
//   chalkboard aspect [--project <dir>]            print the current aspect
//   chalkboard aspect 16:9 [--project <dir>]       switch: index.html (#root size, meta viewport, data-resolution, <html> class) + video.json (width/height/aspect, cover position)
// The chalk kit adapts the board itself (frame, tray, eraser band, teacher spot, subtitle lane), but the board code in index.html places every digit and mark by absolute
// coordinates, so after switching you must RE-PLACE them for the new frame: see "16:9 (1920x1080)" in references/chalkboard-craft.md, or start from `new --aspect 16:9`.
// Voice, timing and captions.js are untouched. Run `chalkboard frames` afterwards and look at the sheet.
import fs from "node:fs";
import path from "node:path";
import { parseArgs, projectDir, dims, config, writeJson, patchTag, parseAspect } from "./lib/common.mjs";

export async function run(argv) {
  const args = parseArgs(argv), root = projectDir(args), cur = dims(root);
  if (!args._[0]) { console.log(`${cur.aspect} (${cur.w}x${cur.h})`); return; }
  const A = parseAspect(args._[0]);
  if (A.aspect === cur.aspect) { console.log(`already ${A.aspect}`); return; }
  const f = path.join(root, "index.html");
  let html = fs.readFileSync(f, "utf8");
  html = patchTag(html, "root", { "data-width": A.w, "data-height": A.h });
  html = html.replace(/(<meta name="viewport" content=")[^"]*"/, `$1width=${A.w}, height=${A.h}"`).replace(/data-resolution="[^"]*"/, `data-resolution="${A.res}"`)
    .replace(/<html\b([^>]*?)(\sclass="[^"]*")?>/, (m, a) => `<html${a}${A.orient === "wide" ? ' class="wide"' : ""}>`);
  fs.writeFileSync(f, html);
  const cfg = config(root);
  Object.assign(cfg, { aspect: A.aspect, width: A.w, height: A.h });
  cfg.cover = Object.assign({}, cfg.cover, A.orient === "wide" ? { top: 700, size: "72,72" } : { top: 1236, size: "78,78" });
  writeJson(path.join(root, "video.json"), cfg);
  console.log(`✓ ${cur.aspect} → ${A.aspect} (${A.w}x${A.h}). The board code still has the ${cur.aspect} coordinates: re-place the C.write / marks / teacher for the new frame (new teacher spot: ${A.orient === "wide" ? "C.teacher({ x: 1740, y: 800, s: 0.62 }), writing area x 70–1850 y 70–800" : "C.teacher({ x: 905, y: 1232, s: 0.6 }), writing area y 270–1000"}), then chalkboard check + frames.`);
}
// genhaha:781c07c7ad6b
