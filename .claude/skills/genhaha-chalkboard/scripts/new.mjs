// chalkboard new <slug> — scaffold a project into ./videos/<YYYY-MM-DD-HHMM>_<slug>/ (in the current directory).
//   chalkboard new gauss --title "บวก 1 ถึง 100 ใน 5 วินาที"   the demo clip (6 shots, ~30 s, one teacher voice, 1+2+…+100 = 5050) — edit it
//   chalkboard new my-clip --blank --title "…" [--lang en]       a 2-shot skeleton (write → erase → write)
//   --aspect 16:9 (or --wide)   a wide classroom board 1920x1080 for YouTube / TV (default 9:16 = 1080x1920 for TikTok / Reels / Shorts); the size is stored in video.json + index.html
//   options: [--dir videos] [--rate 14.4] [--voice <edge voice of the teacher>] [--cover "line 1|[accent line 2]"]
import fs from "node:fs";
import path from "node:path";
import { parseArgs, TEMPLATE, parseAspect } from "./lib/common.mjs";

const VOICE = { th: "th-TH-NiwatNeural", en: "en-US-GuyNeural" };   // the teacher / narrator (th-TH-PremwadeeNeural = a woman teacher)

export async function run(argv) {
  const args = parseArgs(argv);
  const slug = String(args._[0] || "").toLowerCase().replace(/[^a-z0-9-]+/g, "-").replace(/^-|-$/g, "");
  if (!slug) throw new Error('usage: chalkboard new <slug> --title "…" [--aspect 9:16|16:9] [--blank] [--lang th|en] [--voice <edge voice>] [--cover "…"] [--dir videos]');
  const blank = !!args.blank, lang = String(args.lang || "th"), A = parseAspect(args.wide ? "16:9" : args.aspect === true ? undefined : args.aspect), wide = A.orient === "wide";
  const d = new Date(), p = (n) => String(n).padStart(2, "0");
  const stamp = `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}-${p(d.getHours())}${p(d.getMinutes())}`;
  const root = path.resolve(String(args.dir || "videos"), `${stamp}_${slug}`);
  if (fs.existsSync(root)) throw new Error(`exists: ${root}`);
  fs.mkdirSync(path.join(root, "assets/fonts"), { recursive: true });
  fs.mkdirSync(path.join(root, "renders"), { recursive: true });
  const title = String(args.title || slug);
  const rate = args.rate !== undefined ? Number(args.rate) : lang === "th" ? 14.4 : null;
  const voice = String(args.voice || VOICE[lang] || VOICE.en);
  const esc = (s) => JSON.stringify(s).slice(1, -1);
  const fill = (s) => s.replaceAll("{{SLUG}}", slug).replaceAll("{{TITLE_COVER}}", esc(String(args.cover || title))).replaceAll("{{TITLE}}", esc(title)).replaceAll("{{LANG}}", lang)
    .replaceAll("{{VOICE}}", voice).replaceAll("{{RATE}}", rate == null ? "null" : String(rate)).replaceAll("{{DATE}}", stamp.slice(0, 10))
    .replaceAll("{{ASPECT}}", A.aspect).replaceAll("{{W}}", String(A.w)).replaceAll("{{H}}", String(A.h)).replaceAll("{{COVER_TOP}}", wide ? "700" : "1236").replaceAll("{{COVER_SIZE}}", wide ? "72,72" : "78,78");
  const src = path.join(TEMPLATE, blank ? "blank" : "demo");
  const srcPage = wide ? path.join(TEMPLATE, blank ? "blank-wide" : "demo-wide") : src;   // the board code is placed by absolute coordinates, so 16:9 has its own index.html (captions.js + video.json are shared)
  for (const f of ["index.html", "captions.js", "video.json"]) fs.writeFileSync(path.join(root, f), fill(fs.readFileSync(path.join(f === "index.html" ? srcPage : src, f), "utf8")));
  fs.writeFileSync(path.join(root, "index.html"), fs.readFileSync(path.join(root, "index.html"), "utf8").replace(/<title>[^<]*<\/title>/, `<title>${title.replace(/</g, "&lt;")}</title>`));
  for (const f of ["stick2d-kit.js", "chalk-kit.js", "chalk.css", "motion.js", "look.css", "gsap.min.js", "hyperframes.json"]) fs.copyFileSync(path.join(TEMPLATE, f), path.join(root, f));
  for (const f of fs.readdirSync(path.join(TEMPLATE, "fonts"))) fs.copyFileSync(path.join(TEMPLATE, "fonts", f), path.join(root, "assets/fonts", f));
  fs.writeFileSync(path.join(root, "timing.js"), "// written by `chalkboard voice`\nwindow.TTS_TIMING = null;\n");
  fs.writeFileSync(path.join(root, ".gitignore"), ".env\nassets/voice/line-*\nrenders/frames/\nrenders/*.raw.mp4\n.hyperframes/\n");
  console.log(`✓ ${path.relative(process.cwd(), root) || root}${blank ? " (blank skeleton)" : " (demo clip)"} · ${A.aspect} ${A.w}x${A.h} · voice ${voice}`);
  console.log(`  next: chalkboard voice --project "${path.relative(process.cwd(), root)}"   (then check · frames · render)`);
  return root;
}
// genhaha:781c07c7ad6b
