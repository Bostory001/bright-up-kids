// lesson render — the last mile in one command (all local, $0):
//   hyperframes check → safe area (warn) → cover image → HyperFrames render (silent picture) → mix voice + soft SFX + music
//   (ducked) → cover on the first frames → renders/<slug>-final.mp4 + <slug>.<locale>.srt. Intermediates are deleted.
//
//   lesson render [--project <dir>] [--strict-safe] [--skip-check] [--keep] [--audio-only] [--fps 30] [--quality draft|looks|delivery]
//   --audio-only   re-mix sound onto the existing final (after changing sfx / music) without re-rendering the picture
import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { parseArgs, projectDir, config, slugOf, loadTiming, HF, ff, step, STEPS, probeDuration, volumedetect, need } from "./lib/common.mjs";
import { check as safeCheck } from "./safe.mjs";
import { buildSounds, cueList } from "./sfx.mjs";
import { ensureMusic } from "./music.mjs";
import { makeCover } from "./cover.mjs";
import { writeSrt } from "./srt.mjs";
import { writeSummary } from "./summary.mjs";

export async function run(argv) {
  const args = parseArgs(argv);
  need("ffmpeg", "install ffmpeg"); need("npx", "install Node.js 22+");
  const root = projectDir(args), slug = slugOf(root), cfg = config(root);
  const T = loadTiming(root); if (!T) throw new Error("no voice yet — run lesson voice first");
  const R = (f) => path.join(root, "renders", f);
  fs.mkdirSync(R(""), { recursive: true });
  const raw = R(`${slug}.raw.mp4`), final = R(`${slug}-final.mp4`), t0 = Date.now();
  const hf = (a, label) => { const r = spawnSync("npx", [...HF, ...a], { cwd: root, encoding: "utf8", maxBuffer: 1 << 26 });
    if (r.status !== 0) throw new Error(`hyperframes ${label} failed:\n${(r.stdout + r.stderr).split("\n").filter(Boolean).slice(-25).join("\n")}`); return r.stdout + r.stderr; };

  let video = raw;
  if (args["audio-only"]) {
    if (!fs.existsSync(final)) throw new Error("--audio-only needs an existing final; run lesson render once");
    video = R(`${slug}.prev.mp4`); fs.renameSync(final, video);
  } else {
    if (!args["skip-check"]) {
      const out = await step("hyperframes check", () => hf(["check"], "check"));
      const w = (out.match(/(\d+)\s+warning/i) || [])[1]; if (w && +w) console.log(`  (${w} warning(s) — contrast warnings during cuts are normal)`);
      const { groups } = await step("safe area", () => safeCheck(root, { step: 0.5 }));
      if (groups.length) {
        for (const g of groups) console.log(`  ⚠ ${g.from.toFixed(1)}–${g.to.toFixed(1)} s ${g.el} "${g.text}" ${g.why}`);
        if (args["strict-safe"]) throw new Error("text outside the phone safe area (see above)");
      }
    }
    if (cfg.cover?.title) await step("cover image", () => makeCover(root));
    const q = args.quality ? ["--quality", String(args.quality)] : [];
    await step(`HyperFrames render (${T.duration} s of video)`, () => hf(["render", "-o", raw, "--fps", String(args.fps || 30), ...q], "render"));
  }

  // ---------- sound: voice + SFX + optional music bed ----------
  const cues = cueList(root);
  buildSounds(path.join(root, "assets/sfx"), [...new Set(cues.map((c) => c.name))]);
  const music = ensureMusic(root);
  const vo = path.join(root, "assets/voice/voiceover.wav");
  const inputs = ["-i", video, "-i", vo], fc = [];
  let n = 2;
  fc.push(`[1:a]aformat=sample_rates=48000:channel_layouts=stereo,asplit=2[vo][vsc]`);
  const mixIn = ["[vo]"];
  if (music) {
    inputs.push("-i", music); const mi = n++;
    fc.push(`[${mi}:a]aformat=sample_rates=48000:channel_layouts=stereo,volume=${Number(cfg.music?.level ?? 0.1) * 2.2}[mus]`);
    fc.push(`[mus][vsc]sidechaincompress=threshold=0.04:ratio=5:attack=30:release=400[mduck]`);
    mixIn.push("[mduck]");
  } else fc.push(`[vsc]anullsink`);
  cues.forEach((c, i) => {
    inputs.push("-i", path.join(root, "assets/sfx", `${c.name}.wav`)); const si = n++;
    const pan = c.pan ? `,pan=stereo|c0=${Math.min(1, 1 - c.pan).toFixed(2)}*c0|c1=${Math.min(1, 1 + c.pan).toFixed(2)}*c1` : "";
    fc.push(`[${si}:a]aformat=sample_rates=48000:channel_layouts=stereo,volume=${(c.gain * 1.6).toFixed(3)}${pan},adelay=${Math.max(0, Math.round(c.t * 1000))}:all=1[s${i}]`);
    mixIn.push(`[s${i}]`);
  });
  fc.push(`${mixIn.join("")}amix=inputs=${mixIn.length}:duration=first:normalize=0,atrim=0:${T.duration},loudnorm=I=-14:TP=-1.5:LRA=11,aresample=48000[a]`);
  const vArgs = args["audio-only"] ? ["-map", "0:v", "-c:v", "copy"] : ["-map", "0:v", "-c:v", "libx264", "-crf", "21", "-preset", "medium", "-pix_fmt", "yuv420p"];
  // the cover goes on in the same encode (first cover.seconds), unless we only re-mix sound
  const coverImg = R("cover.jpg"), secs = Number(cfg.cover?.seconds ?? 0.1);
  if (!args["audio-only"] && cfg.cover?.title && fs.existsSync(coverImg) && secs > 0) {
    inputs.push("-loop", "1", "-t", String(secs + 0.2), "-i", coverImg); const ci = n++;
    fc.push(`[${ci}:v]scale=1080:1920,setsar=1,format=yuv420p[cv]`, `[0:v][cv]overlay=0:0:enable='lt(t,${secs})':eof_action=pass,format=yuv420p[v]`);
    vArgs.splice(0, 2, "-map", "[v]");
  }
  await step(`mix voice + ${cues.length} SFX${music ? " + music" : ""} → final`, () =>
    ff([...inputs, "-filter_complex", fc.join(";"), ...vArgs, "-map", "[a]", "-c:a", "aac", "-b:a", "192k", "-t", String(T.duration), "-movflags", "+faststart", final]));
  if (args["audio-only"]) fs.rmSync(video, { force: true });

  writeSrt(root);
  if (!args.keep) fs.rmSync(raw, { force: true });
  const D = probeDuration(final), v = volumedetect(final), mb = fs.statSync(final).size / 1e6;
  console.log(`\n✓ ${path.relative(process.cwd(), final)} · ${D.toFixed(1)} s · ${mb.toFixed(1)} MB · audio mean ${v.mean} dB / peak ${v.max} dB · ${((Date.now() - t0) / 1000).toFixed(0)} s total · cost $0`);
  const { md } = await writeSummary(root, { steps: STEPS, wall_s: (Date.now() - t0) / 1000,  });
  console.log(`\n${md}  → renders/${slug}-summary.md (+ .json)`);
  console.log(`  next: lesson frames --video "${path.relative(process.cwd(), final)}"  and look at the sheet`);
}
// genhaha:ed34a05c8342
