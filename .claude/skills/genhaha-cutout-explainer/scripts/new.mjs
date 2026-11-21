// cutout new <slug> — scaffold a project into ./videos/<YYYY-MM-DD-HHMM>_<slug>/ (in the current directory).
//   cutout new blackout --title "ถ้าโลกนี้ไม่มีไฟฟ้า 1 วัน"                the working 47 s demo (ถ้าโลกนี้ไม่มีไฟฟ้า 1 วัน, 10 shots, narrated)
//   cutout new my-story --blank --title "…" [--lang en]    a 2-shot skeleton to write your own story into
//   options: [--dir videos] [--rate 14.4] [--voice <edge voice>]
// The project gets: index.html (the SCENE data) · captions.js (the script) · video.json · timing.js · engine/ (cutout-kit.js = props, backgrounds, presenter, shots; motion.js; validate.js; cutout.css — do not edit)
//                   vendor/ (GSAP, local — no CDN) · look.css · assets/fonts (Kanit, SIL OFL).
import fs from "node:fs";
import path from "node:path";
import { parseArgs, TEMPLATE } from "./lib/common.mjs";

const VOICE = { th: "th-TH-NiwatNeural", en: "en-US-GuyNeural" };   // friendly man; th-TH-PremwadeeNeural = woman

export async function run(argv) {
  const args = parseArgs(argv);
  const slug = String(args._[0] || "").toLowerCase().replace(/[^a-z0-9-]+/g, "-").replace(/^-|-$/g, "");
  if (!slug) throw new Error('usage: cutout new <slug> --title "…" [--blank] [--lang th|en] [--voice <edge voice>] [--dir videos]');
  const blank = !!args.blank, lang = String(args.lang || "th");
  const d = new Date(), p = (n) => String(n).padStart(2, "0");
  const stamp = `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}-${p(d.getHours())}${p(d.getMinutes())}`;
  const root = path.resolve(String(args.dir || "videos"), `${stamp}_${slug}`);
  if (fs.existsSync(root)) throw new Error(`exists: ${root}`);
  fs.mkdirSync(path.join(root, "assets/fonts"), { recursive: true }); fs.mkdirSync(path.join(root, "assets/voice"), { recursive: true }); fs.mkdirSync(path.join(root, "renders"), { recursive: true });
  const title = String(args.title || slug);
  const rate = args.rate !== undefined ? Number(args.rate) : lang === "th" ? 14.4 : null;
  const voice = String(args.voice || VOICE[lang] || VOICE.en);
  const esc = (s) => JSON.stringify(s).slice(1, -1);
  const fill = (s) => s.replaceAll("{{SLUG}}", slug).replaceAll("{{TITLE}}", esc(title).replace(/</g, "&lt;")).replaceAll("{{LANG}}", lang).replaceAll("{{VOICE}}", voice)
    .replaceAll("{{RATE}}", rate == null ? "null" : String(rate)).replaceAll("{{DATE}}", stamp.slice(0, 10));
  const src = path.join(TEMPLATE, blank ? "blank" : "demo");
  for (const f of ["index.html", "captions.js"]) fs.writeFileSync(path.join(root, f), fill(fs.readFileSync(path.join(src, f), "utf8")));
  fs.writeFileSync(path.join(root, "video.json"), fill(fs.readFileSync(path.join(TEMPLATE, "video.json"), "utf8")));
  fs.cpSync(path.join(TEMPLATE, "engine"), path.join(root, "engine"), { recursive: true });
  fs.cpSync(path.join(TEMPLATE, "vendor"), path.join(root, "vendor"), { recursive: true });
  fs.copyFileSync(path.join(TEMPLATE, "look.css"), path.join(root, "look.css"));
  for (const f of fs.readdirSync(path.join(TEMPLATE, "fonts"))) fs.copyFileSync(path.join(TEMPLATE, "fonts", f), path.join(root, "assets/fonts", f));
  fs.writeFileSync(path.join(root, "timing.js"), "// written by `cutout voice`\nwindow.TTS_TIMING = null;\n");
  fs.copyFileSync(path.join(TEMPLATE, "hyperframes.json"), path.join(root, "hyperframes.json"));
  fs.writeFileSync(path.join(root, "package.json"), JSON.stringify({ name: slug, private: true, type: "module", scripts: { check: "npx --yes hyperframes@0.8.153 check", render: "npx --yes hyperframes@0.8.153 render" } }, null, 2) + "\n");
  fs.copyFileSync(path.join(TEMPLATE, "gitignore"), path.join(root, ".gitignore"));
  const rel = path.relative(process.cwd(), root) || root;
  console.log(`✓ ${rel} (${blank ? "blank 2-shot skeleton" : "blackout demo, 10 shots"} · narrated · voice ${voice})`);
  console.log(`  next: edit captions.js (script) and the SCENE in index.html, then`);
  console.log(`        cutout snapshot --project "${rel}"   → look at renders/frames/sheet.jpg`);
  console.log(`        cutout voice → check → snapshot → render`);
  return root;
}
// genhaha:5f8f980bb7f3
