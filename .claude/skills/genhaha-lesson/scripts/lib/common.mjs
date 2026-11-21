// Shared helpers for the Lesson CLI. No npm dependencies: Node 22+, ffmpeg, python3 (edge-tts), Chrome.
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import { execFileSync, spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

export const SCRIPTS = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
export const PLUGIN_ROOT = path.dirname(SCRIPTS);
export const TEMPLATE = path.join(PLUGIN_ROOT, "template");
export const HF_VERSION = process.env.LS_HYPERFRAMES || "hyperframes@0.8.153";
export const HF = ["--yes", HF_VERSION];

// --key value / --flag / positional
export function parseArgs(argv) {
  const out = { _: [] };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a.startsWith("--")) {
      const [k, v] = a.slice(2).split("=");
      if (v !== undefined) out[k] = v;
      else if (argv[i + 1] !== undefined && !argv[i + 1].startsWith("--")) out[k] = argv[++i];
      else out[k] = true;
    } else out._.push(a);
  }
  return out;
}

// project = --project <dir> | the current directory | a single child of ./videos named like the slug
export function projectDir(args) {
  const p = args.project ? path.resolve(args.project) : process.cwd();
  if (fs.existsSync(path.join(p, "video.json")) && fs.existsSync(path.join(p, "index.html"))) return p;
  if (args.project) {
    for (const base of ["videos", "."]) {
      const dir = path.resolve(base);
      if (!fs.existsSync(dir)) continue;
      const hit = fs.readdirSync(dir).filter((d) => d === args.project || d.endsWith("_" + args.project)).sort().pop();
      if (hit && fs.existsSync(path.join(dir, hit, "video.json"))) return path.join(dir, hit);
    }
  }
  throw new Error(`not a Lesson project: ${p} (needs video.json + index.html; pass --project <dir>)`);
}
export const slugOf = (root) => readJson(path.join(root, "video.json")).name || path.basename(root).replace(/^\d{4}-\d\d-\d\d-\d{4}_/, "");
export const readJson = (f) => JSON.parse(fs.readFileSync(f, "utf8"));
export const writeJson = (f, o) => fs.writeFileSync(f, JSON.stringify(o, null, 2) + "\n");
export const config = (root) => readJson(path.join(root, "video.json"));

// captions.js (+ timing.js) evaluated like the browser does
export function loadCaptions(root) {
  const sandbox = { window: {} };
  const timing = path.join(root, "timing.js");
  if (fs.existsSync(timing)) vm.runInNewContext(fs.readFileSync(timing, "utf8"), sandbox);
  vm.runInNewContext(fs.readFileSync(path.join(root, "captions.js"), "utf8"), sandbox);
  return sandbox.window.CAPTIONS;
}
export function loadTiming(root) {
  const f = path.join(root, "timing.js");
  if (!fs.existsSync(f)) return null;
  const sandbox = { window: {} };
  vm.runInNewContext(fs.readFileSync(f, "utf8"), sandbox);
  return sandbox.window.TTS_TIMING || null;
}

export function which(cmd) {
  const r = spawnSync(process.platform === "win32" ? "where" : "which", [cmd], { encoding: "utf8" });
  return r.status === 0 ? r.stdout.split(/\r?\n/)[0].trim() : null;
}
export const has = (cmd) => !!which(cmd);
export function need(cmd, hint) { if (!has(cmd)) throw new Error(`${cmd} not found — ${hint}`); }

export function ff(args, opts = {}) { return execFileSync("ffmpeg", ["-y", "-hide_banner", "-loglevel", "error", ...args], { maxBuffer: 1 << 28, ...opts }); }
export const probeDuration = (f) => +execFileSync("ffprobe", ["-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", f]).toString().trim();
export function volumedetect(f) {
  const r = spawnSync("ffmpeg", ["-hide_banner", "-i", f, "-af", "volumedetect", "-vn", "-f", "null", "-"], { encoding: "utf8" }).stderr;
  return { mean: +((r.match(/mean_volume: ([-\d.]+)/) || [])[1] ?? NaN), max: +((r.match(/max_volume: ([-\d.]+)/) || [])[1] ?? NaN) };
}

// timed step logger (durations also collected in STEPS for lesson summary)
export const STEPS = [];
export async function step(label, fn) {
  const t = Date.now();
  process.stdout.write(`… ${label}`);
  try { const r = await fn(); const s = (Date.now() - t) / 1000; STEPS.push({ step: label.replace(/\s*\(.*\)$/, ""), s: +s.toFixed(1) }); console.log(` ✓ ${s.toFixed(1)} s`); return r; }
  catch (e) { console.log(" ✗"); throw e; }
}

// tag attribute patching that tolerates attributes HyperFrames Studio may add
const setAttr = (tag, name, value) =>
  new RegExp(`\\s${name}="[^"]*"`).test(tag) ? tag.replace(new RegExp(`(\\s${name}=")[^"]*(")`), `$1${value}$2`) : tag.replace(/\s*\/?>$/, (m) => ` ${name}="${value}"${m.trim()}`);
export function patchTag(html, id, attrs, optional = false) {
  const m = html.match(new RegExp(`<[a-z]+\\b[^>]*\\sid="${id}"[^>]*>`));
  if (!m) { if (optional) return html; throw new Error(`tag #${id} not found in index.html`); }
  let tag = m[0];
  for (const [k, v] of Object.entries(attrs)) tag = setAttr(tag, k, v);
  return html.replace(m[0], tag);
}
// genhaha:ed34a05c8342
