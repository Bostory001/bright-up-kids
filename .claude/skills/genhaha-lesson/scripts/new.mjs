// lesson new <slug> — scaffold a project into ./videos/<YYYY-MM-DD-HHMM>_<slug>/ (in the current directory).
//   lesson new conjunction --title "Grammar Conjunction ใน 1 นาที"            the demo lesson (Thai, ~44 s) — edit it
//   lesson new my-lesson --blank --title "…" [--lang en] [--voice en-US-AriaNeural]   a 3-scene skeleton (hook · define · outro)
//   options: [--dir videos] [--rate 14.4]
import fs from "node:fs";
import path from "node:path";
import { parseArgs, TEMPLATE } from "./lib/common.mjs";

const VOICES = { th: "th-TH-PremwadeeNeural", en: "en-US-AriaNeural" };

export async function run(argv) {
  const args = parseArgs(argv);
  const slug = String(args._[0] || "").toLowerCase().replace(/[^a-z0-9-]+/g, "-").replace(/^-|-$/g, "");
  if (!slug) throw new Error('usage: lesson new <slug> --title "…" [--blank] [--lang th|en] [--voice <edge voice>] [--dir videos]');
  const blank = !!args.blank, lang = String(args.lang || "th");
  const d = new Date(), p = (n) => String(n).padStart(2, "0");
  const stamp = `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}-${p(d.getHours())}${p(d.getMinutes())}`;
  const root = path.resolve(String(args.dir || "videos"), `${stamp}_${slug}`);
  if (fs.existsSync(root)) throw new Error(`exists: ${root}`);
  fs.mkdirSync(path.join(root, "assets/fonts"), { recursive: true });
  fs.mkdirSync(path.join(root, "renders"), { recursive: true });
  const title = String(args.title || slug);
  const rate = args.rate !== undefined ? Number(args.rate) : lang === "th" ? 14.4 : null;
  const fill = (s) => s.replaceAll("{{SLUG}}", slug).replaceAll("{{TITLE}}", JSON.stringify(title).slice(1, -1)).replaceAll("{{LANG}}", lang)
    .replaceAll("{{VOICE}}", String(args.voice || VOICES[lang] || VOICES.en)).replaceAll("{{RATE}}", rate == null ? "null" : String(rate)).replaceAll("{{DATE}}", stamp.slice(0, 10));
  const src = path.join(TEMPLATE, blank ? "blank" : "demo");
  for (const f of ["index.html", "captions.js"]) fs.writeFileSync(path.join(root, f), fill(fs.readFileSync(path.join(src, f), "utf8")));
  fs.writeFileSync(path.join(root, "video.json"), fill(fs.readFileSync(path.join(src, "video.json"), "utf8")));
  fs.writeFileSync(path.join(root, "index.html"), fs.readFileSync(path.join(root, "index.html"), "utf8").replace(/<title>[^<]*<\/title>/, `<title>${title.replace(/</g, "&lt;")}</title>`));
  for (const f of ["lesson.js", "motion.js", "look.css", "gsap.min.js"]) fs.copyFileSync(path.join(TEMPLATE, f), path.join(root, f));
  for (const f of fs.readdirSync(path.join(TEMPLATE, "fonts"))) fs.copyFileSync(path.join(TEMPLATE, "fonts", f), path.join(root, "assets/fonts", f));
  fs.writeFileSync(path.join(root, "timing.js"), "// written by `lesson voice`\nwindow.TTS_TIMING = null;\n");
  fs.writeFileSync(path.join(root, ".gitignore"), ".env\nassets/voice/line-*\nrenders/frames/\nrenders/*.raw.mp4\n.hyperframes/\n");
  console.log(`✓ ${path.relative(process.cwd(), root) || root}${blank ? " (blank skeleton)" : " (demo lesson)"}`);
  console.log(`  next: lesson voice --project "${path.relative(process.cwd(), root)}"   (then check · frames · render)`);
  return root;
}
// genhaha:ed34a05c8342
