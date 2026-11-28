// visual-proof cover — thumbnail = a frame of the scene (renders/cover.jpg, subtitle hidden). `visual-proof render` lays it over the
// first video.json → cover.seconds (default 0.1 s = 3 frames) of the final, so feeds that show the first frame show the cover. Timing, audio and subtitles are unchanged.
//
//   visual-proof cover [--project <dir>] [--at 3.2] [--seconds 0.1]     pick a time when the first sheet is (nearly) drawn
//   visual-proof cover --apply                 overlay renders/cover.jpg onto an existing renders/<slug>-final.mp4
// The picture is the first shot itself (its title is part of the scene: put the hook in shot 1). Settings are saved in video.json → thumbnail { mode, at }.
import fs from "node:fs";
import path from "node:path";
import { parseArgs, projectDir, config, slugOf, ff, writeJson, dims } from "./lib/common.mjs";
import { openComposition } from "./lib/browser.mjs";

// the cover is a screenshot of the live scene (captions hidden) at video.json -> thumbnail.at,
export async function makeCover(root) {
  const cfg = config(root), th = cfg.thumbnail || {};
  if (th.mode === "none") return null;
  const R = (f) => path.join(root, "renders", f);
  fs.mkdirSync(R(""), { recursive: true });
  const pg = await openComposition(root, { hideCaptions: true });
  try {
    const at = Math.max(0, Math.min(Number(th.at ?? pg.duration * 0.15), pg.duration - 0.3));
    await pg.seek(at);
    const out = R("cover.jpg");
    await pg.screenshot(out, { quality: 93 });
    return out;
  } finally { await pg.close(); }
}

// overlay the cover on the first `seconds` of a video (re-encodes video, copies audio)
export function applyCover(root, video) {
  const c = config(root).cover || {}, secs = Number(c.seconds ?? 0.1), img = path.join(root, "renders/cover.jpg");
  if (!(secs > 0) || !fs.existsSync(img)) return false;
  const tmp = video.replace(/\.mp4$/, ".cover-tmp.mp4");
  ff(["-i", video, "-i", img, "-filter_complex", `[1:v]scale=${dims(root).w}:${dims(root).h},setsar=1,format=yuv420p[c];[0:v][c]overlay=0:0:enable='lt(t,${secs})',format=yuv420p[v]`,
    "-map", "[v]", "-map", "0:a?", "-c:v", "libx264", "-crf", "20", "-preset", "medium", "-c:a", "copy", "-movflags", "+faststart", tmp]);
  fs.renameSync(tmp, video);
  return true;
}

export async function run(argv) {
  const args = parseArgs(argv);
  const root = projectDir(args), cfg = config(root);
  cfg.thumbnail = { mode: "frame", ...(cfg.thumbnail || {}) };
  if (args.at !== undefined && args.at !== true) cfg.thumbnail.at = Number(args.at);
  if (args.seconds !== undefined && args.seconds !== true) cfg.cover = { ...(cfg.cover || {}), seconds: Number(args.seconds) };
  writeJson(path.join(root, "video.json"), cfg);
  if (args.apply) {
    const v = path.join(root, "renders", `${slugOf(root)}-final.mp4`);
    if (!fs.existsSync(v)) throw new Error(`no ${path.relative(root, v)} — run visual-proof render first`);
    await makeCover(root);
    console.log(applyCover(root, v) ? `✓ cover laid over the first ${cfg.cover?.seconds ?? 0.1} s of ${path.basename(v)}` : "cover off (seconds 0 or no cover.jpg)");
    return;
  }
  const out = await makeCover(root);
  console.log(out ? `✓ ${path.relative(process.cwd(), out)} (frame at ${cfg.thumbnail.at ?? "15%"} s) — visual-proof render lays it on the first ${cfg.cover?.seconds ?? 0.1} s` : "cover off (thumbnail.mode none)");
}
// genhaha:ed4a029a9d2b
