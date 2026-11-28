// visual-proof new <slug> — scaffold a project into ./videos/<YYYY-MM-DD-HHMM>_<slug>/ (in the current directory).
//   visual-proof new odd-squares --title "ผลบวกเลขคี่"                     the working 28 s demo (1 + 3 + 5 + 7 = 4², 6 shots, narrated) to edit
//   visual-proof new my-topic --blank --title "…" [--lang en]        a 2-shot skeleton to write your own clip into
//   options: [--dir videos] [--rate 14.4] [--voice <edge voice>] [--lang th|en] [--silent]   (--silent: no voice, music + picture only)
// The project gets: index.html (page, sections) · captions.js (the script) · scene.js (window.VP_SCENE: what is drawn) · video.json · timing.js · vp-*.js + vp.css (the visual-proof kit — do not edit)
//                   vendor/ (GSAP — local, no CDN) · fonts/ (IBM Plex Sans Thai + Newsreader, SIL OFL).
import fs from "node:fs";
import path from "node:path";
import { parseArgs, TEMPLATE } from "./lib/common.mjs";
import { run as sync } from "./sync.mjs";

const VOICE = { th: "th-TH-NiwatNeural", en: "en-US-GuyNeural" };   // friendly man; th-TH-PremwadeeNeural = woman
const DISCLOSURE = { th: "เสียงพากย์สร้างด้วย AI · ภาพวาดด้วยโค้ด", en: "AI-generated voice · pictures drawn by code" };

export async function run(argv) {
  const args = parseArgs(argv);
  const slug = String(args._[0] || "").toLowerCase().replace(/[^a-z0-9-]+/g, "-").replace(/^-|-$/g, "");
  if (!slug) throw new Error('usage: visual-proof new <slug> --title "…" [--blank] [--lang th|en] [--voice <edge voice>] [--silent] [--dir videos]');
  const blank = !!args.blank, lang = String(args.lang || "th"), silent = !!args.silent;
  const d = new Date(), p = (n) => String(n).padStart(2, "0");
  const stamp = `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}-${p(d.getHours())}${p(d.getMinutes())}`;
  const root = path.resolve(String(args.dir || "videos"), `${stamp}_${slug}`);
  if (fs.existsSync(root)) throw new Error(`exists: ${root}`);
  fs.mkdirSync(path.join(root, "assets/voice"), { recursive: true }); fs.mkdirSync(path.join(root, "renders"), { recursive: true });
  const title = String(args.title || slug);
  const rate = args.rate !== undefined ? Number(args.rate) : lang === "th" ? 14.4 : null;
  const voice = String(args.voice || VOICE[lang] || VOICE.en);
  const esc = (s) => JSON.stringify(s).slice(1, -1);
  const fill = (s) => s.replaceAll("{{SLUG}}", slug).replaceAll("{{TITLE}}", esc(title).replace(/</g, "&lt;")).replaceAll("{{LANG}}", lang).replaceAll("{{VOICE}}", voice)
    .replaceAll("{{RATE}}", rate == null ? "null" : String(rate)).replaceAll("{{DATE}}", stamp.slice(0, 10)).replaceAll("{{DISCLOSURE}}", esc(DISCLOSURE[lang] || DISCLOSURE.en));
  const src = path.join(TEMPLATE, blank ? "blank" : "demo");
  for (const f of ["index.html", "captions.js", "scene.js"]) fs.writeFileSync(path.join(root, f), fill(fs.readFileSync(path.join(src, f), "utf8")));
  fs.writeFileSync(path.join(root, "video.json"), fill(fs.readFileSync(path.join(TEMPLATE, "video.json"), "utf8")));
  for (const f of fs.readdirSync(path.join(TEMPLATE, "kit"))) fs.copyFileSync(path.join(TEMPLATE, "kit", f), path.join(root, f));
  fs.cpSync(path.join(TEMPLATE, "vendor"), path.join(root, "vendor"), { recursive: true });
  fs.cpSync(path.join(TEMPLATE, "fonts"), path.join(root, "fonts"), { recursive: true });
  fs.writeFileSync(path.join(root, "timing.js"), "// written by `visual-proof voice`\nwindow.TTS_TIMING = null;\n");
  fs.copyFileSync(path.join(TEMPLATE, "hyperframes.json"), path.join(root, "hyperframes.json"));
  fs.writeFileSync(path.join(root, "package.json"), JSON.stringify({ name: slug, private: true, type: "module", scripts: { check: "npx --yes hyperframes@0.8.153 check", render: "npx --yes hyperframes@0.8.153 render" } }, null, 2) + "\n");
  fs.copyFileSync(path.join(TEMPLATE, "gitignore"), path.join(root, ".gitignore"));
  const rel = path.relative(process.cwd(), root) || root;
  console.log(`✓ ${rel} (${blank ? "blank 2-shot skeleton" : "odd-numbers demo, 6 shots"} · 9:16 1080x1920 · ${silent ? "silent" : "narrated · voice " + voice})`);
  if (silent) await sync(["--project", root, "--silent"]);
  console.log(`  next: edit captions.js (script) and scene.js (what is drawn), then`);
  console.log(`        visual-proof sync --project "${rel}"     (after adding or removing shots)  →  visual-proof lint`);
  console.log(`        visual-proof voice → check → snapshot (look at renders/frames/sheet.jpg) → render`);
  return root;
}
// genhaha:ed4a029a9d2b
