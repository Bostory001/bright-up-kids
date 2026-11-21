// lesson cover — thumbnail: the paper + grid (scenes and subtitles hidden) + a big 1–2 line title → renders/cover.jpg.
// `lesson render` lays it over the first video.json → cover.seconds (default 0.1 s = 3 frames) of the final, so feeds that show
// the first frame show the cover. Timing, audio and subtitles are unchanged.
//
//   lesson cover [--project <dir>] --title "Conjunction|[and / but / so]" [--eyebrow "GRAMMAR · 1 MIN"] [--at 3] [--top 640] [--size 146,128]
//   lesson cover --apply                 overlay renders/cover.jpg onto an existing renders/<slug>-final.mp4
// "|" = new line, [ ] = accent colour. Settings are saved in video.json → cover so `lesson render` can redo it.
import fs from "node:fs";
import path from "node:path";
import { parseArgs, projectDir, config, slugOf, ff, writeJson } from "./lib/common.mjs";
import { openComposition } from "./lib/browser.mjs";

export async function makeCover(root) {
  const c = config(root).cover || {};
  if (!c.title) return null;
  const lines = String(c.title).split("|").filter(Boolean);
  const sizes = String(c.size || "146,128").split(",").map(Number), top = Number(c.top ?? 640);
  const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/\[([^\]]+)\]/g, '<span style="color:var(--blue)">$1</span>');
  const html = lines.map((l, i) => `<div style="font-size:${sizes[Math.min(i, sizes.length - 1)]}px">${esc(l)}</div>`).join("");
  const pg = await openComposition(root, { hideCaptions: true });
  try {
    await pg.seek(Number(c.at ?? 1.2));
    // paper + grid only: hide every scene, the dots and the subtitles, then draw the title card
    await pg.evaluate(`(() => {
      document.querySelectorAll('section.clip, #dots').forEach((e) => e.style.setProperty('display', 'none', 'important'));
      const d = document.createElement('div'); d.id = '__cover';
      d.style.cssText = 'position:absolute;left:60px;right:60px;top:${top}px;z-index:999;text-align:center;font-family:Kanit,sans-serif;font-weight:800;line-height:1.12;letter-spacing:-0.02em;color:var(--ink,#101114)';
      d.innerHTML = ${JSON.stringify((c.eyebrow ? `<div style="font-size:34px;font-weight:700;letter-spacing:0.32em;text-transform:uppercase;color:var(--blue,#3446e8);margin-bottom:46px">${String(c.eyebrow).replace(/</g, "&lt;")}</div>` : "") + "")} + ${JSON.stringify(html)};
      document.getElementById('root').appendChild(d); return document.fonts.ready.then(() => true); })()`);
    const out = path.join(root, "renders/cover.jpg");
    fs.mkdirSync(path.dirname(out), { recursive: true });
    await pg.screenshot(out);
    return out;
  } finally { await pg.close(); }
}

// overlay the cover on the first `seconds` of a video (re-encodes video, copies audio)
export function applyCover(root, video) {
  const c = config(root).cover || {}, secs = Number(c.seconds ?? 0.1), img = path.join(root, "renders/cover.jpg");
  if (!(secs > 0) || !fs.existsSync(img)) return false;
  const tmp = video.replace(/\.mp4$/, ".cover-tmp.mp4");
  ff(["-i", video, "-i", img, "-filter_complex", `[1:v]scale=1080:1920,setsar=1,format=yuv420p[c];[0:v][c]overlay=0:0:enable='lt(t,${secs})',format=yuv420p[v]`,
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
    if (!fs.existsSync(v)) throw new Error(`no ${path.relative(root, v)} — run lesson render first`);
    if (!fs.existsSync(path.join(root, "renders/cover.jpg"))) await makeCover(root);
    console.log(applyCover(root, v) ? `✓ cover laid over the first ${cfg.cover.seconds ?? 0.1} s of ${path.basename(v)}` : "cover off (seconds 0 or no cover.jpg)");
    return;
  }
  if (!cfg.cover.title) throw new Error('usage: lesson cover --title "line 1|[accent line 2]" [--at 1.2]');
  const out = await makeCover(root);
  console.log(`✓ ${path.relative(process.cwd(), out)} (frame ${cfg.cover.at ?? 1.2} s) — lesson render lays it on the first ${cfg.cover.seconds ?? 0.1} s`);
}
// genhaha:ed34a05c8342
