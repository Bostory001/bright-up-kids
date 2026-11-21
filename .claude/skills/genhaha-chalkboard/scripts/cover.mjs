// chalkboard cover — thumbnail: a frame of the clip (characters on their set; subtitles and big titles hidden) + a big title in white
// rounded boxes with red accent words → renders/cover.jpg. `chalkboard render` lays it over the first video.json → cover.seconds
// (default 0.1 s = 3 frames) of the final, so feeds that show the first frame show the cover. Timing, audio and subtitles are unchanged.
//
//   chalkboard cover [--project <dir>] --title "น้ำผึ้ง|[ไม่มีวันเสีย]?" [--eyebrow "…"] [--at 1] [--top 1236] [--size 78,78]
//   chalkboard cover --apply                 overlay renders/cover.jpg onto an existing renders/<slug>-final.mp4
// "|" = new line, [ ] = red accent. Settings are saved in video.json → cover so `chalkboard render` can redo it.
import fs from "node:fs";
import path from "node:path";
import { parseArgs, projectDir, config, slugOf, ff, writeJson, dims } from "./lib/common.mjs";
import { openComposition } from "./lib/browser.mjs";

export async function makeCover(root) {
  const c = config(root).cover || {};
  if (!c.title) return null;
  const lines = String(c.title).split("|").filter(Boolean);
  const D = dims(root), sizes = String(c.size || (D.portrait ? "78,78" : "72,72")).split(",").map(Number), top = Number(c.top ?? (D.portrait ? 1236 : 700));
  const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/\[([^\]]+)\]/g, '<span style="color:#d9202b">$1</span>');
  const boxes = lines.map((l, i) => `<div style="font-size:${sizes[Math.min(i, sizes.length - 1)]}px;font-weight:800;line-height:1.3;padding:6px 44px 16px;background:#fff;border:7px solid #141414;border-radius:30px;color:#141414;white-space:nowrap">${esc(l)}</div>`).join("");
  const eyebrow = c.eyebrow ? `<div style="font-size:36px;font-weight:800;color:#141414;background:#ffd23f;border:6px solid #141414;border-radius:999px;padding:2px 34px 8px">${String(c.eyebrow).replace(/</g, "&lt;")}</div>` : "";
  const pg = await openComposition(root, { hideCaptions: true });
  try {
    await pg.seek(Number(c.at ?? 3));
    await pg.evaluate(`(() => {
      document.querySelectorAll('#stage > .hl').forEach((e) => e.style.setProperty('display', 'none', 'important'));
      const d = document.createElement('div'); d.id = '__cover';
      d.style.cssText = 'position:absolute;left:0;right:0;top:${top}px;z-index:999;display:flex;flex-direction:column;align-items:center;gap:20px;font-family:Kanit,sans-serif';
      d.innerHTML = ${JSON.stringify(eyebrow + boxes)};
      document.getElementById('root').appendChild(d); return document.fonts.ready.then(() => true); })()`);
    const out = path.join(root, "renders/cover.jpg");
    fs.mkdirSync(path.dirname(out), { recursive: true });
    await pg.screenshot(out);
    return out;
  } finally { await pg.close(); }
}

// overlay the cover on the first `seconds` of a video (re-encodes video, copies audio)
export function applyCover(root, video) {
  const D = dims(root), c = config(root).cover || {}, secs = Number(c.seconds ?? 0.1), img = path.join(root, "renders/cover.jpg");
  if (!(secs > 0) || !fs.existsSync(img)) return false;
  const tmp = video.replace(/\.mp4$/, ".cover-tmp.mp4");
  ff(["-i", video, "-i", img, "-filter_complex", `[1:v]scale=${D.w}:${D.h},setsar=1,format=yuv420p[c];[0:v][c]overlay=0:0:enable='lt(t,${secs})',format=yuv420p[v]`,
    "-map", "[v]", "-map", "0:a?", "-c:v", "libx264", "-crf", "20", "-preset", "medium", "-c:a", "copy", "-movflags", "+faststart", tmp]);
  fs.renameSync(tmp, video);
  return true;
}

export async function run(argv) {
  const args = parseArgs(argv);
  const root = projectDir(args), cfgFile = path.join(root, "video.json"), cfg = config(root);
  cfg.cover = { ...(cfg.cover || {}) };
  for (const k of ["title", "eyebrow", "at", "top", "size", "seconds"]) if (args[k] !== undefined && args[k] !== true) cfg.cover[k] = ["at", "top", "seconds"].includes(k) ? Number(args[k]) : String(args[k]);
  writeJson(cfgFile, cfg);
  if (args.apply) {
    const v = path.join(root, "renders", `${slugOf(root)}-final.mp4`);
    if (!fs.existsSync(v)) throw new Error(`no ${path.relative(root, v)} — run chalkboard render first`);
    if (!fs.existsSync(path.join(root, "renders/cover.jpg"))) await makeCover(root);
    console.log(applyCover(root, v) ? `✓ cover laid over the first ${cfg.cover.seconds ?? 0.1} s of ${path.basename(v)}` : "cover off (seconds 0 or no cover.jpg)");
    return;
  }
  if (!cfg.cover.title) throw new Error('usage: chalkboard cover --title "line 1|[accent line 2]" [--at 1]');
  const out = await makeCover(root);
  console.log(`✓ ${path.relative(process.cwd(), out)} (frame ${cfg.cover.at ?? 3} s) — chalkboard render lays it on the first ${cfg.cover.seconds ?? 0.1} s`);
}
// genhaha:781c07c7ad6b
