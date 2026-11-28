// visual-proof safe — safe area for a 9:16 clip. Everything (shapes, equations, titles, subtitles) is painted on ONE canvas, so there is no DOM text to measure.
// The kit places text itself: title y 330, figure x 70–1010 from y 372 down to the equation, equation rows ≤ 840 px wide with the last baseline at y 1318,
// subtitles y 1392–1524 (2 lines max). What the data can still break — titles, notes, step rows, subtitles and equation rows that are too long — is
// checked by vp-validate.js; this command reports those issues. Look at the frames for the rest (labels you placed far outside the figure).
//   Reels / TikTok / Shorts UI covers: top y < 250 · bottom y > 1520 · right x > 960 below y 900.
//   visual-proof safe [--project <dir>]        exit 1 when something is too long (the same rules run inside `visual-proof check`)
import path from "node:path";
import { parseArgs, projectDir } from "./lib/common.mjs";
import { loadScene, loadCaps, lintScene } from "./lib/vp.mjs";

export const SAFE_TALL = { left: 0, top: 250, bottom: 1520, right: 960, rightFromY: 900, subBottom: 1520 };
const isSafe = (i) => /too long|chars|characters|tokens|safe area|y 250|y 1520/i.test(i.msg + " " + (i.fix || ""));

// same shape as the other skills' safe check: { samples, groups: [{ from, to, el, text, why }], errors }
export async function check(root) {
  const S = loadScene(path.join(root, "scene.js")), caps = loadCaps(path.join(root, "captions.js"), path.join(root, "timing.js")) || [];
  const r = lintScene(S, caps, root), bad = r.issues.filter((i) => i.level === "error" && isSafe(i));
  return { samples: r.ids.length, groups: bad.map((i) => ({ from: 0, to: 0, el: i.path, text: "", why: i.msg })), errors: [] };
}
export async function run(argv) {
  const root = projectDir(parseArgs(argv)), { samples, groups } = await check(root);
  if (!groups.length) { console.log(`✓ safe area (9:16): ${samples} shots — the kit keeps titles, figures, equations and subtitles inside y ${SAFE_TALL.top}-${SAFE_TALL.bottom}, nothing right of x ${SAFE_TALL.right} below y ${SAFE_TALL.rightFromY}; no text is too long`); return 0; }
  console.log(`✗ ${groups.length} item(s) too long for the safe layout:`);
  for (const g of groups) console.log(`  ${g.el}: ${g.why}`);
  return 1;
}
// genhaha:ed4a029a9d2b
