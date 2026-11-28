// visual-proof render — the last mile in one command (all local, $0):
//   hyperframes check → safe area (warn) → cover frame → HyperFrames render (canvas scene) → mix [voice] + SFX cues + music
//   → cover on the first frames → renders/<slug>-final.mp4 + <slug>.<locale>.srt + <slug>-summary.md. Intermediates are deleted.
//
//   visual-proof render [--project <dir>] [--strict-safe] [--skip-check] [--keep] [--audio-only] [--fps 30] [--quality draft|looks|delivery]
//   --audio-only   re-mix sound onto the existing final (after changing sfx / music) without re-rendering the picture
//   --software     pass --no-browser-gpu to HyperFrames (only if the render crashes on a headless server)
// Silent clips (video.json mode "silent") have no voice: length = #root data-duration in index.html, music defaults to level 0.5 and nothing is ducked.
import fs from "node:fs";
import path from "node:path";
import { spawnSync, execFileSync } from "node:child_process";
import { parseArgs, projectDir, config, slugOf, durationOf, hasVoice, modeOf, dims, HF, ff, step, STEPS, probeDuration, volumedetect, need } from "./lib/common.mjs";
import { check as safeCheck } from "./safe.mjs";
import { buildSounds, cueList } from "./sfx.mjs";
import { ensureMusic } from "./music.mjs";
import { makeCover } from "./cover.mjs";
import { writeSrt } from "./srt.mjs";
import { writeSummary } from "./summary.mjs";

export async function run(argv) {
  const args = parseArgs(argv);
  need("ffmpeg", "install ffmpeg"); need("npx", "install Node.js 22+");
  const root = projectDir(args), slug = slugOf(root), cfg = config(root), mode = modeOf(cfg), DM = dims(root);
  const R = (f) => path.join(root, "renders", f);
  fs.mkdirSync(R(""), { recursive: true });
  const raw = R(`${slug}.raw.mp4`), final = R(`${slug}-final.mp4`), t0 = Date.now();
  const hf = (a, label) => { const r = spawnSync("npx", [...HF, ...a], { cwd: root, encoding: "utf8", maxBuffer: 1 << 26 });
    if (r.status !== 0) throw new Error(`hyperframes ${label} failed:\n${(r.stdout + r.stderr).split("\n").filter(Boolean).slice(-25).join("\n")}`); return r.stdout + r.stderr; };

  if (mode === "narrated" && !hasVoice(root)) throw new Error("narrated clip but no voice yet — run `visual-proof voice` first");
  const D = durationOf(root), hasV = mode === "narrated" && hasVoice(root);

  let video = raw;
  if (args["audio-only"]) {
    if (!fs.existsSync(final)) throw new Error("--audio-only needs an existing final; run visual-proof render once");
    video = R(`${slug}.prev.mp4`); fs.renameSync(final, video);
  } else {
    console.log(`aspect ${DM.aspect} · ${DM.w}x${DM.h}`);
    if (!args["skip-check"]) {
      const out = await step("hyperframes check", () => hf(["check"], "check"));
      const w = (out.match(/(\d+)\s+warning/i) || [])[1]; if (w && +w) console.log(`  (${w} warning(s) — contrast warnings over the video are normal)`);
      const { groups } = await step(`safe area ${DM.aspect}`, () => safeCheck(root, { step: 0.5 }));
      if (groups.length) {
        for (const g of groups) console.log(`  ⚠ ${g.el}: ${g.why}`);
        if (args["strict-safe"]) throw new Error("text outside the safe area (see above)");
      }
    }
    await step("cover image", () => makeCover(root));
    const q = args.quality ? ["--quality", String(args.quality)] : [];
    await step(`HyperFrames render (${D} s of video)`, () => hf(["render", "-o", raw, "--fps", String(args.fps || 30), ...(args.software ? ["--no-browser-gpu"] : []), ...q], "render"));
  }

  // ---------- sound: [voice] + SFX cues + music bed ----------
  const cues = cueList(root).filter((c) => c.t < D - 0.05);
  buildSounds(path.join(root, "assets/sfx"), [...new Set(cues.map((c) => c.name))]);
  const music = ensureMusic(root);
  const level = Number(cfg.music?.level ?? (hasV ? 0.1 : 0.5));
  const inputs = ["-i", video], fc = [], mixIn = [];
  let n = 1;
  if (hasV) {
    inputs.push("-i", path.join(root, "assets/voice/voiceover.wav")); n++;
    fc.push(`[1:a]aformat=sample_rates=48000:channel_layouts=stereo,asplit=2[vo][vsc]`);
    mixIn.push("[vo]");
  }
  if (music) {
    inputs.push("-i", music); const mi = n++;
    fc.push(`[${mi}:a]aformat=sample_rates=48000:channel_layouts=stereo,volume=${(level * 2.2).toFixed(3)}[mus]`);
    if (hasV) { fc.push(`[mus][vsc]sidechaincompress=threshold=0.04:ratio=5:attack=30:release=400[mduck]`); mixIn.push("[mduck]"); }   // duck the music under the narrator
    else mixIn.push("[mus]");
  } else if (hasV) fc.push(`[vsc]anullsink`);
  cues.forEach((c, i) => {
    const wav = path.join(root, "assets/sfx", `${c.name}.wav`);
    if (c.loop) inputs.push("-stream_loop", "-1");
    inputs.push("-i", wav); const si = n++;
    const pan = c.pan ? `,pan=stereo|c0=${Math.min(1, 1 - c.pan).toFixed(2)}*c0|c1=${Math.min(1, 1 + c.pan).toFixed(2)}*c1` : "";
    const len = Math.max(0.5, D - c.t);                                   // ambience beds run to the end of the clip and fade out
    const bed = c.loop ? `,atrim=0:${len.toFixed(2)},afade=t=in:d=0.8,afade=t=out:st=${Math.max(0, len - 1.5).toFixed(2)}:d=1.5` : "";
    fc.push(`[${si}:a]aformat=sample_rates=48000:channel_layouts=stereo${bed},volume=${(c.gain * 1.6).toFixed(3)}${pan},adelay=${Math.max(0, Math.round(c.t * 1000))}:all=1[s${i}]`);
    mixIn.push(`[s${i}]`);
  });
  if (!mixIn.length) { fc.push(`anullsrc=r=48000:cl=stereo,atrim=0:${D}[sil]`); mixIn.push("[sil]"); }
  fc.push(`${mixIn.join("")}amix=inputs=${mixIn.length}:duration=longest:normalize=0,atrim=0:${D},loudnorm=I=-14:TP=-1.5:LRA=11,aresample=48000[a]`);
  const vArgs = args["audio-only"] ? ["-map", "0:v", "-c:v", "copy"] : ["-map", "0:v", "-c:v", "libx264", "-crf", "21", "-preset", "medium", "-pix_fmt", "yuv420p"];
  // the cover goes on in the same encode (first cover.seconds), unless we only re-mix sound
  const coverImg = R("cover.jpg"), secs = Number(cfg.cover?.seconds ?? 0.1);
  if (!args["audio-only"] && fs.existsSync(coverImg) && secs > 0) {
    inputs.push("-loop", "1", "-t", String(secs + 0.2), "-i", coverImg); const ci = n++;
    fc.push(`[${ci}:v]scale=${DM.w}:${DM.h},setsar=1,format=yuv420p[cv]`, `[0:v][cv]overlay=0:0:enable='lt(t,${secs})':eof_action=pass,format=yuv420p[v]`);
    vArgs.splice(0, 2, "-map", "[v]");
  }
  await step(`mix ${hasV ? "voice + " : ""}${cues.length} SFX${music ? " + music" : ""} → final`, () =>
    ff([...inputs, "-filter_complex", fc.join(";"), ...vArgs, "-map", "[a]", "-c:a", "aac", "-b:a", "192k", "-t", String(D), "-movflags", "+faststart", final]));
  if (args["audio-only"]) fs.rmSync(video, { force: true });

  writeSrt(root);
  if (!args.keep) { fs.rmSync(raw, { force: true }); fs.rmSync(R("cover.jpg"), { force: true }); fs.rmSync(R("frames"), { recursive: true, force: true }); }   // ship only final + srt + summary
  const Dn = probeDuration(final), v = volumedetect(final), mb = fs.statSync(final).size / 1e6;
  const [pw, ph] = execFileSync("ffprobe", ["-v", "error", "-select_streams", "v:0", "-show_entries", "stream=width,height", "-of", "csv=p=0:s=x", final]).toString().trim().split("x").map(Number);
  if (pw !== DM.w || ph !== DM.h) throw new Error(`the render is ${pw}x${ph} but the project is ${DM.aspect} (${DM.w}x${DM.h}) — check #root data-width/height in index.html and video.json`);
  console.log(`\n✓ ${path.relative(process.cwd(), final)} · ${pw}x${ph} (${DM.aspect}) · ${Dn.toFixed(1)} s · ${mb.toFixed(1)} MB · audio mean ${v.mean} dB / peak ${v.max} dB · ${((Date.now() - t0) / 1000).toFixed(0)} s total · ${hasV ? "voice via " + (cfg.voice?.provider || "edge-tts") : "silent clip (music + sfx)"} · cost $0`);
  if (!(v.mean > -60)) console.log("  ⚠ the audio track is (nearly) silent — check music.mood / sfx cues (visual-proof sfx --list)");
  const { md } = await writeSummary(root, { steps: STEPS, wall_s: (Date.now() - t0) / 1000 });
  console.log(`\n${md}  → renders/${slug}-summary.md (+ .json)`);
  console.log(`  next: visual-proof frames --video renders/${slug}-final.mp4 --project "${path.relative(process.cwd(), root) || "."}"  and look at the sheet`);
}
// genhaha:ed4a029a9d2b
