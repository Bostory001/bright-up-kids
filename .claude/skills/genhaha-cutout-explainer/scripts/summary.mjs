// cutout summary — what the finished clip is: renders/<slug>-summary.md + .json (cutout render writes it automatically). All free: $0.
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { parseArgs, projectDir, config, slugOf, loadCaptions, loadTiming, modeOf, probeDuration, volumedetect } from "./lib/common.mjs";
import { cueList } from "./sfx.mjs";
const fmt = (n) => Math.round(n).toLocaleString("en-US");
const mmss = (s) => `${Math.floor(s / 60)}:${String(Math.round(s % 60)).padStart(2, "0")}`;

export async function writeSummary(root, { steps = [], wall_s = null } = {}) {
  const slug = slugOf(root), cfg = config(root), T = loadTiming(root), CAP = loadCaptions(root) || [], mode = modeOf(cfg);
  const final = path.join(root, "renders", `${slug}-final.mp4`);
  if (!fs.existsSync(final)) throw new Error(`no ${path.relative(process.cwd(), final)} yet — run cutout render`);
  const lines = CAP, shots = new Set(CAP.map((c) => c.shot)).size, chars = lines.reduce((a, c) => a + [...(c.say ?? c.text).replace(/[\[\]\s]/g, "")].length, 0);
  const D = probeDuration(final), v = volumedetect(final), bytes = fs.statSync(final).size;
  const [w, h, fps] = execFileSync("ffprobe", ["-v", "error", "-select_streams", "v:0", "-show_entries", "stream=width,height,r_frame_rate", "-of", "csv=p=0", final]).toString().trim().split(",");
  let sfx = 0; try { sfx = cueList(root).length; } catch {}
  const PAID = mode === "narrated" && !!(T?.provider && T.provider !== "edge");
  const S = {
    title: cfg.title, ai_disclosure: cfg.publish?.ai_disclosure || null, file: path.relative(root, final), created: new Date().toISOString(),
    video: { duration_s: +D.toFixed(2), size_mb: +(bytes / 1e6).toFixed(1), resolution: `${w}×${h}`, fps: +(fps.split("/").reduce((a, b) => a / b)).toFixed(2), shots, lines: lines.length,
      audio_mean_db: v.mean, audio_peak_db: v.max },
    voice: mode === "silent" ? { engine: null, note: "silent clip — no voice" } : { engine: T?.provider === "elevenlabs" || (T?.provider && T.provider !== "edge") ? T.provider : "edge-tts", voice: T?.voice || cfg.voice?.voice, language: cfg.voice?.language, cast: T?.cast || [], chars, chars_per_s: T ? +(chars / Math.max(1, T.chunks[T.chunks.length - 1].said - T.chunks[0].start - CAP.reduce((n, c) => n + (Number(c.pause) || 0), 0))).toFixed(1) : null },
    sound: { sfx_cues: sfx, music: cfg.music?.mood || "none" },
    time: { render_total_s: wall_s, steps },
    mode, engine: "cutout-explainer (flat SVG felt cutouts + GSAP)",
    cost_usd: PAID ? { voice: null, music_sfx: 0, render: 0, total_cash: null, note: `voice by ${T.provider} with the user's own key — billed by the provider per character (${chars} characters), not computed here; music, SFX and the local render are free` } : { voice: 0, music_sfx: 0, render: 0, total_cash: 0, note: "edge-tts, procedural music/SFX and the local render are free" },
  };
  const md = [
    `# ${S.title} — summary`, "",
    `| | |`, `|---|---|`,
    `| File | \`${S.file}\` |`,
    `| Duration | ${mmss(D)} (${D.toFixed(1)} s) · ${S.video.resolution} · ${S.video.fps} fps · ${S.video.size_mb} MB |`,
    `| Script | ${S.video.shots} shots · ${S.video.lines} lines · ${fmt(chars)} chars · ${S.voice.chars_per_s ?? "–"} chars/s |`,
    mode === "silent" ? `| Voice | none — silent clip (picture + music + SFX) |` : S.voice.cast.length ? `| Speakers | ${S.voice.cast.map((o) => `${o.name} \`${o.voice}\` (${o.lines} lines)`).join(" · ")} |` : `| Voice | ${S.voice.engine} \`${S.voice.voice}\` (${S.voice.language}) |`,
    `| Sound | ${sfx} SFX cues · music: ${S.sound.music} · mean ${v.mean} dB / peak ${v.max} dB |`,
    `| Disclosure (paste into the post) | ${cfg.publish?.ai_disclosure || "MISSING — set video.json → publish.ai_disclosure (fiction + AI voice + code-made picture)"} |`,
    wall_s != null ? `| Render time | ${wall_s.toFixed(0)} s${steps.length ? ` (${steps.map((s) => `${s.step} ${s.s.toFixed(1)} s`).join(" · ")})` : ""} |` : null,
    PAID ? `| Cash cost | voice billed by ${T.provider} (own key, ${chars} characters); music, SFX, render free |` : `| **Cash cost** | **$0.00** (free voice, music, SFX and local render) |`,
  ].filter((x) => x != null).join("\n") + "\n";
  fs.writeFileSync(path.join(root, "renders", `${slug}-summary.json`), JSON.stringify(S, null, 2) + "\n");
  fs.writeFileSync(path.join(root, "renders", `${slug}-summary.md`), md);
  return { S, md };
}


export async function run(argv) {
  const args = parseArgs(argv);
  const { md } = await writeSummary(projectDir(args));
  console.log(md);
}
// genhaha:5f8f980bb7f3
