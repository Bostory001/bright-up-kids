#!/usr/bin/env node
// Cutout explainer CLI — run as:  node "<skill>/scripts/cutout.mjs" <command> [options]
//   doctor       machine check (Node, ffmpeg, Chrome, edge-tts, HyperFrames)
//   new <slug>   scaffold ./videos/<stamp>_<slug>/ with the working 47 s blackout demo "ถ้าโลกนี้ไม่มีไฟฟ้า 1 วัน" (--blank = 2-shot skeleton)
//   voice        free edge-tts narration (Pro: own provider key) -> assets/voice/voiceover.wav + timing.js, shots retimed to the voice
//   check        scene validation (named errors + did-you-mean) + hyperframes check + safe area y 250-1520
//   snapshot     look at the shots: one frame per caption line / --at 1,5,9 -> renders/frames/sheet.jpg  (alias: frames)
//   frames       the same, or --video renders/<slug>-final.mp4 --every 3 to review a finished clip
//   cover        thumbnail = a frame of the scene (renders/cover.jpg), optional title; becomes the first frames of the final
//   sfx          synthesized sound effects + cue list          music   synthesized bed (playful|calm|warm|bright|dark|none)
//   render       check -> cover -> HyperFrames render -> mix voice + sfx + music -> renders/<slug>-final.mp4 + .th_TH.srt + -summary.md
//   safe | srt | summary | keys | chrome   single steps (see the header of scripts/<command>.mjs)
// Every project command takes --project <dir> (default: the current directory).
import "./winfix.mjs";   // Windows: lets "npx" be started (no effect elsewhere)
const ALIAS = { snapshot: "frames" };
const COMMANDS = ["new", "voice", "sfx", "music", "check", "safe", "frames", "snapshot", "cover", "render", "srt", "summary", "keys", "doctor", "chrome"];
const [cmd0, ...rest] = process.argv.slice(2);
const cmd = ALIAS[cmd0] || cmd0;
if (!cmd0 || cmd0 === "help" || cmd0 === "--help" || !COMMANDS.includes(cmd0)) {
  console.log(`usage: cutout.mjs <${COMMANDS.join("|")}> [--project <dir>] [options]\n(see the header of scripts/<command>.mjs for options)`);
  process.exit(cmd0 && !["help", "--help"].includes(cmd0) ? 1 : 0);
}
import { applyBrowserEnv } from "./lib/browser.mjs";
import { applyProviderFlag } from "./lib/pro/index.mjs";   // voice --provider gemini|openai|elevenlabs|cloudflare|edge (Pro mode, optional)
applyBrowserEnv();   // use the Chrome / Edge on this computer for the render when HyperFrames has no browser of its own yet
try {
  applyProviderFlag(cmd, rest);
  const mod = await import(`./${cmd}.mjs`);
  const code = await mod.run(rest);
  process.exit(typeof code === "number" ? code : 0);
} catch (e) {
  console.error(`✗ cutout ${cmd0}: ${e.message}`);
  process.exit(1);
}
// genhaha:5f8f980bb7f3
