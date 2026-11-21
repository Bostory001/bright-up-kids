// Pro mode (optional) — better voices / pictures through the user's OWN API keys. Everything here is opt-in:
// no key = nothing is called and the free path (edge-tts, drawn visuals, the user's own files) is used.
//   keys    set / not set per provider (never a value), what each unlocks, where to get it, the exact line to add
//   image   one picture from a provider -> assets/gen/<name>.png  (--dry-run prints the request without calling the network)
// Keys live ONLY in environment variables or a project .env that is git-ignored. They are never printed, logged or written by this code.
import fs from "node:fs";
import path from "node:path";
import { spawnSync, execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { makeEnv, envFiles, redact } from "./env.mjs";
import * as gemini from "./providers/gemini.mjs";
import * as openai from "./providers/openai.mjs";
import * as cloudflare from "./providers/cloudflare.mjs";

const HERE = path.dirname(fileURLToPath(import.meta.url));
export const SKILL = JSON.parse(fs.readFileSync(path.join(HERE, "skill.json"), "utf8"));
export const GUIDE = "https://videos.genhaha.com/skills#keys";
const IMG = { gemini, openai, cloudflare };
const VOICE_PROVIDERS = ["edge", "gemini", "openai", "elevenlabs", "cloudflare"];
const KEYSET = {
  GEMINI_API_KEY: { name: "Google Gemini", get: "https://aistudio.google.com/apikey", voice: "Gemini voices (natural Thai)", image: "Gemini pictures" },
  OPENAI_API_KEY: { name: "OpenAI", get: "https://platform.openai.com/api-keys", voice: "OpenAI voices", image: "gpt-image pictures" },
  ELEVENLABS_API_KEY: { name: "ElevenLabs", get: "https://elevenlabs.io/app/settings/api-keys", voice: "ElevenLabs voices (many Thai voices, word timing)", image: null },
  CLOUDFLARE_API_TOKEN: { name: "Cloudflare Workers AI", get: "https://dash.cloudflare.com/profile/api-tokens (token with Workers AI) + your Account ID on the dashboard home", voice: "Gemini voice through Workers AI", image: "FLUX schnell pictures (fast, cheap)", pair: "CLOUDFLARE_ACCOUNT_ID" },
  GOOGLE_MAPS_API_KEY: { name: "Google Maps Static", get: "https://console.cloud.google.com/google/maps-apis (enable Maps Static API)", voice: null, image: null, maps: true },
};
const list = (a) => a.join(", ");
const flag = (argv, name) => { const i = argv.findIndex((a) => a === `--${name}` || a.startsWith(`--${name}=`)); if (i < 0) return undefined; const a = argv[i]; if (a.includes("=")) return a.split("=").slice(1).join("="); return argv[i + 1] && !argv[i + 1].startsWith("--") ? argv[i + 1] : true; };
const projectGuess = (argv) => path.resolve(String(flag(argv, "project") || "."));
const cmdLine = (sub) => `node "$${SKILL.var}" ${sub}`;

// `--provider X` on the voice command sets this skill's <PREFIX>_TTS for the run (works for every driver)
export function applyProviderFlag(cmd, argv) {
  if (cmd !== "voice") return;
  const p = flag(argv, "provider");
  if (typeof p === "string") {
    const w = p.toLowerCase();
    if (!VOICE_PROVIDERS.includes(w)) { console.error(`✗ --provider ${p}: choose one of ${VOICE_PROVIDERS.join(" | ")} (edge = free, the default)`); process.exit(1); }
    process.env[`${SKILL.prefix}_TTS`] = w;
  }
}
export const stripProvider = (argv) => { const out = []; for (let i = 0; i < argv.length; i++) { if (argv[i] === "--provider") { i++; continue; } if (argv[i].startsWith("--provider=")) continue; out.push(argv[i]); } return out; };
export const useFree = () => { process.env[`${SKILL.prefix}_TTS`] = "edge"; };   // later steps in this process use the free voice
export const freeLine = (provider, why) => `Pro voice (${provider}) did not work this time${why ? ` — ${redact(String(why).replace(/\s+/g, " ").slice(0, 140), makeEnv(process.cwd()))}` : ""}. Using the free voice instead, nothing else changes. (ใช้เสียงฟรีแทนให้อัตโนมัติ)`;
// B-family drivers: print the friendly line and run the same command again with the free voice
export function reexecFree(provider, why, script, argv) {
  console.log(freeLine(provider, why));
  const r = spawnSync(process.execPath, [script, ...stripProvider(argv), "--provider", "edge"], { stdio: "inherit", env: { ...process.env, [`${SKILL.prefix}_TTS`]: "edge" } });
  process.exit(r.status ?? 1);
}
export const proHint = () => `\nPro mode (optional, better voices${SKILL.images ? " and pictures" : ""} with your own keys): ${cmdLine("keys")}   — free mode needs nothing.`;

// ---------------------------------------------------------------------------------------------------------------- keys
export async function runKeys(argv = []) {
  const proj = projectGuess(argv), env = makeEnv(proj, process.cwd());
  if (flag(argv, "prepare")) return prepareEnv(proj);
  const isSet = (k) => !!env[k];
  console.log(`Pro mode keys for ${SKILL.id}  (optional — the free path works without any of them)\n`);
  const rows = [
    ["GEMINI_API_KEY", ["GEMINI_API_KEY"]], ["OPENAI_API_KEY", ["OPENAI_API_KEY"]], ["ELEVENLABS_API_KEY", ["ELEVENLABS_API_KEY"]],
    ["CLOUDFLARE_API_TOKEN", ["CLOUDFLARE_API_TOKEN", "CLOUDFLARE_ACCOUNT_ID"]], ...(SKILL.maps ? [["GOOGLE_MAPS_API_KEY", ["GOOGLE_MAPS_API_KEY"]]] : []),
  ];
  for (const [k, need] of rows) {
    const info = KEYSET[k], ok = need.every(isSet), miss = need.filter((x) => !isSet(x));
    const unlock = [info.voice && `voice: ${info.voice}`, SKILL.images && info.image && `pictures: ${info.image}`, info.maps && "sharper satellite images for city layers"].filter(Boolean).join(" · ");
    console.log(`${ok ? "set    " : "not set"}  ${need.join(" + ")}${ok || miss.length === need.length ? "" : `   (missing ${miss.join(", ")})`}`);
    console.log(`         unlocks: ${unlock}`);
    console.log(`         get it:  ${info.get}`);
  }
  const files = envFiles(proj, process.cwd());
  console.log(`\nproject .env: ${files.length ? files.join(", ") + " (read; never committed)" : "none"}`);
  console.log(`step-by-step guide: ${GUIDE}`);
  console.log(`\nWhere the key goes (put it yourself in your own file, never in the chat). Example for GEMINI_API_KEY:`);
  console.log(`  macOS / Linux : add this line to ~/.zshrc (macOS) or ~/.bashrc (Linux), save, open a new terminal:`);
  console.log(`                  export GEMINI_API_KEY="<paste your key>"`);
  console.log(`  Windows       : in PowerShell run   setx GEMINI_API_KEY "<paste your key>"   then open a new terminal`);
  console.log(`  or a project  : a file named .env next to your project with the line   GEMINI_API_KEY=<paste your key>`);
  console.log(`                  ( ${cmdLine("keys --prepare")}  creates it with empty lines and puts .env in .gitignore )`);
  console.log(`\nTo use it:  ${cmdLine("voice --provider gemini")}   (or openai | elevenlabs | cloudflare; the default is edge = free)`);
  if (SKILL.images) console.log(`            ${cmdLine('image --prompt "…english description…" --name hero --provider gemini')}   (add --dry-run to see the request without sending it)`);
  console.log(`If a key is missing or a call fails, the free path is used automatically.`);
  console.log(`If you ever pasted a key into a chat, delete that message and rotate (re-create) the key in the provider's dashboard.`);
  return 0;
}
function prepareEnv(dir) {
  const envf = path.join(dir, ".env"), gi = path.join(dir, ".gitignore");
  const tmpl = ["# Pro mode keys for this project. Fill only the providers you want; empty lines are ignored. Never share or commit this file.",
    "GEMINI_API_KEY=", "OPENAI_API_KEY=", "ELEVENLABS_API_KEY=", "CLOUDFLARE_ACCOUNT_ID=", "CLOUDFLARE_API_TOKEN=", ...(SKILL.maps ? ["GOOGLE_MAPS_API_KEY="] : [])].join("\n") + "\n";
  fs.mkdirSync(dir, { recursive: true });
  if (fs.existsSync(envf)) console.log(`· ${envf} already exists — left as it is`); else { fs.writeFileSync(envf, tmpl); console.log(`✓ created ${envf} (empty lines — open it in a text editor, paste your key after the "=", save)`); }
  const cur = fs.existsSync(gi) ? fs.readFileSync(gi, "utf8") : "";
  if (!/^\s*\.env\s*$/m.test(cur)) { fs.writeFileSync(gi, cur + (cur && !cur.endsWith("\n") ? "\n" : "") + ".env\n"); console.log(`✓ added .env to ${gi} so it is never committed`); } else console.log("· .env is already in .gitignore");
  console.log("Do not paste the key into the chat. After saving, run the keys command again: it should say 'set'.");
  return 0;
}

// ---------------------------------------------------------------------------------------------------------------- image
const SAFETY = "No text, no letters, no logos, no watermark, no real people, no recognizable faces.";
const SAFETY_NOPEOPLE = " No people, no figures, no faces, no hands, no body parts.";
function findProject(argv) {
  const p = flag(argv, "project");
  if (p && typeof p === "string") {
    const abs = path.resolve(p);
    if (fs.existsSync(abs)) return abs;
    for (const base of ["videos", "."]) { try { const hit = fs.readdirSync(base).filter((d) => d === p || d.endsWith("_" + p)).sort().pop(); if (hit) return path.resolve(base, hit); } catch { /* none */ } }
    return abs;
  }
  return process.cwd();
}
const sniff = (b) => b[0] === 0x89 && b.slice(1, 4).toString("latin1") === "PNG" ? "png" : b[0] === 0xff && b[1] === 0xd8 ? "jpg" : b.slice(0, 4).toString("latin1") === "RIFF" ? "webp" : "bin";

export async function runImage(argv = []) {
  if (!SKILL.images) {
    console.log(`${SKILL.id} does not use generated pictures (${SKILL.imageWhy || "its look is drawn from code"}). Pro mode here is about better voices: ${cmdLine("voice --provider gemini")}. Nothing to do.`);
    return 0;
  }
  const prompt = String(flag(argv, "prompt") === true ? "" : flag(argv, "prompt") || "").trim();
  const dry = !!flag(argv, "dry-run"), proj = findProject(argv);
  if (!prompt) { console.error(`usage: ${cmdLine('image --prompt "<english description>" [--name hero] [--provider gemini|openai|cloudflare] [--shape square|portrait|landscape] [--quality low|medium|high] [--out path] [--project dir] [--dry-run]')}`); return 1; }
  if (/[^\x00-\x7F]/.test(prompt)) { console.error("✗ Write the picture prompt in English (image models follow English best). Describe the scene only: no text in the picture, no logos, no real people."); return 1; }
  if (/\b(logo|slogan|caption|headline|signboard text|text saying|the words)\b/i.test(prompt)) console.log("! The prompt mentions text/logo. Pictures with letters come out garbled — put real text in the page (HTML) instead, and use the user's own logo file.");
  const env = makeEnv(proj, process.cwd());
  const want = String(flag(argv, "provider") === true ? "" : flag(argv, "provider") || env[`${SKILL.prefix}_IMAGE`] || "").toLowerCase();
  if (want && !IMG[want]) { console.error(`✗ image provider "${want}" — choose gemini | openai | cloudflare`); return 1; }
  const hasKeys = (p) => IMG[p].keys.every((k) => !!env[k]);
  const provider = want || ["gemini", "openai", "cloudflare"].find(hasKeys) || (dry ? "gemini" : "");
  if (!provider) { console.log(`No picture key is set, so no AI picture is made — that is fine. Free path: use drawn shapes, the user's own photos in assets/user/, or leave the scene without a picture. (Optional: ${cmdLine("keys")} shows how to add a key.)`); return 3; }
  const P = IMG[provider], shape = String(flag(argv, "shape") || "square"), quality = String(flag(argv, "quality") || "low"), model = env[`${SKILL.prefix}_IMAGE_MODEL`] || P.defaultModel;
  const full = `${prompt.replace(/\s+/g, " ")}. ${SAFETY}${SKILL.noPeople ? SAFETY_NOPEOPLE : ""}`;
  const req = P.build(full, { shape, quality, model });
  const name = String(flag(argv, "name") || "img").replace(/[^a-z0-9_-]/gi, "-").toLowerCase();
  const out = path.resolve(String(flag(argv, "out") || path.join(proj, "assets/gen", `${name}.png`)));
  const logf = path.join(proj, "assets/gen/.pro-images.json");
  const cap = Number(flag(argv, "cap") || env[`${SKILL.prefix}_IMAGE_CAP`] || 12);
  let log = []; try { log = JSON.parse(fs.readFileSync(logf, "utf8")); } catch { /* new project */ }
  if (dry) {
    console.log(`DRY RUN — nothing is sent. Provider: ${P.label}${hasKeys(provider) ? " (key found)" : " (key NOT set — a real run would use the free path)"}`);
    console.log(`POST ${req.url}`);
    console.log(`headers: ${JSON.stringify(req.headers)}   (the real key is read from your environment and never printed)`);
    console.log(`body: ${JSON.stringify(req.body, null, 2)}`);
    console.log(`output: ${out}   · this project has made ${log.length}/${cap} pictures`);
    return 0;
  }
  if (!hasKeys(provider)) { console.log(`${P.label} needs ${P.keys.filter((k) => !env[k]).join(" + ")} and it is not set — skipping the AI picture and using the free path (drawn shapes / the user's own photos). Optional: ${cmdLine("keys")}.`); return 3; }
  if (log.length >= cap && !fs.existsSync(out)) { console.log(`This project already has ${log.length} generated pictures (limit ${cap}, to keep your bill small). Reuse one, or raise the limit with --cap ${cap + 6}.`); return 3; }
  console.log(`1 picture from ${P.label} (${model}) — billed by the provider to your own account; prices change, see the provider's pricing page. Free path stays available.`);
  try {
    const headers = Object.fromEntries(Object.entries(req.headers).map(([h, v]) => [h, v.replace(/\$([A-Z_]+)/g, (_, k) => env[k] || "")]));
    const url = req.url.replace(/\$([A-Z_]+)/g, (_, k) => env[k] || "");
    let json, lastErr;
    for (let n = 1; n <= 2 && !json; n++) {
      const res = await fetch(url, { method: "POST", headers, body: JSON.stringify(req.body), signal: AbortSignal.timeout(120000) });
      if (res.ok) { json = await res.json(); break; }
      const t = res.status === 401 || res.status === 403 ? "" : redact((await res.text().catch(() => "")).replace(/\s+/g, " ").slice(0, 200), env);   // never echo what a provider says about a rejected key
      lastErr = new Error(`HTTP ${res.status}${res.status === 401 || res.status === 403 ? " (key rejected or no access)" : res.status === 429 ? " (rate limit or no credit)" : ""}${t ? ": " + t : ""}`);
      if (res.status < 500 && res.status !== 429) break;
      await new Promise((r) => setTimeout(r, 2000 * n));
    }
    if (!json) throw lastErr;
    let buf = P.parse(json);
    fs.mkdirSync(path.dirname(out), { recursive: true });
    const kind = sniff(buf), ext = path.extname(out).slice(1).toLowerCase().replace("jpeg", "jpg");
    let final = out;
    if (kind !== "bin" && ext && kind !== ext) {
      const tmp = `${out}.tmp.${kind}`; fs.writeFileSync(tmp, buf);
      try { execFileSync("ffmpeg", ["-y", "-loglevel", "error", "-i", tmp, out]); } catch { final = out.replace(/\.[a-z0-9]+$/i, "") + "." + kind; fs.copyFileSync(tmp, final); } finally { fs.rmSync(tmp, { force: true }); }
    } else fs.writeFileSync(out, buf);
    log.push({ file: path.relative(proj, final), provider, model, shape, at: new Date().toISOString() });
    fs.writeFileSync(logf, JSON.stringify(log, null, 2) + "\n");
    console.log(`✓ ${final} (${provider}, ${(fs.statSync(final).size / 1024).toFixed(0)} KB) — look at it before using it: it must match the line and show no text or people${SKILL.noPeople ? "" : " you did not ask for"}. ${log.length}/${cap} pictures used in this project.`);
    return 0;
  } catch (e) {
    console.log(`The ${P.label} picture did not work this time (${redact(e.message, env)}). Using the free path instead: drawn shapes / the user's own photos. Nothing else changes.`);
    return 3;
  }
}
// genhaha:781c07c7ad6b
