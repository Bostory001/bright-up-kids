// chalkboard srt — subtitles → renders/<slug>.<locale>.srt (same timings as the burned-in karaoke lines). `chalkboard render` runs it.
//   chalkboard srt [--project <dir>]
import fs from "node:fs";
import path from "node:path";
import { parseArgs, projectDir, loadCaptions, config, slugOf } from "./lib/common.mjs";

const LOCALE = { th: "th_TH", en: "en_US" };
const stamp = (s) => { const ms = Math.round(s * 1000), p = (n, w = 2) => String(n).padStart(w, "0");
  return `${p(Math.floor(ms / 3600000))}:${p(Math.floor(ms / 60000) % 60)}:${p(Math.floor(ms / 1000) % 60)},${p(ms % 1000, 3)}`; };

export function writeSrt(root) {
  const caps = loadCaptions(root), lang = config(root).voice?.language || "th";
  const spk = config(root).speakers || {}, multi = new Set(caps.map((c) => c.speaker).filter(Boolean)).size > 1;
  // dialogue: the speaker's name opens a turn ("ต้น: …"); lines that continue the same turn stay plain
  const srt = caps.map((c, i) => `${i + 1}\n${stamp(c.start)} --> ${stamp(c.end)}\n${multi && c.speaker && caps[i - 1]?.speaker !== c.speaker ? `${spk[c.speaker]?.name || c.speaker}: ` : ""}${c.text.replace(/[\[\]]/g, "")}\n`).join("\n");
  const out = path.join(root, "renders", `${slugOf(root)}.${LOCALE[lang] || lang}.srt`);
  fs.mkdirSync(path.dirname(out), { recursive: true });
  fs.writeFileSync(out, srt);
  return out;
}
export async function run(argv) { const out = writeSrt(projectDir(parseArgs(argv))); console.log(`✓ ${path.relative(process.cwd(), out)}`); }
// genhaha:781c07c7ad6b
