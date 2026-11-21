#!/usr/bin/env node
// Lesson CLI — run as:  node "<skill>/scripts/lesson.mjs" <command> [options]
//   new <slug>   scaffold ./videos/<stamp>_<slug>/ (demo lesson)   voice     edge-tts voice + word timings + retime
//   sfx          soft SFX + cue list                                music     optional quiet bed (calm|bright|none)
//   check        hyperframes check + safe area                      safe      safe-area check only
//   frames       screenshots + contact sheet (or --video)           cover     thumbnail card
//   render       check → render → mix → cover → final.mp4           srt       subtitles file
//   summary      duration · script · sound · cost                   doctor    machine check
//   chrome       download Chrome's headless shell (when no Chrome is installed)
// Every project command takes --project <dir> (default: the current directory).
import "./winfix.mjs";   // Windows: lets "npx" be started (no effect elsewhere)
const COMMANDS = ["new", "voice", "sfx", "music", "check", "safe", "frames", "cover", "render", "srt", "summary", "keys", "image", "doctor", "chrome"];
const [cmd, ...rest] = process.argv.slice(2);
if (!cmd || cmd === "help" || cmd === "--help" || !COMMANDS.includes(cmd)) {
  console.log(`usage: lesson.mjs <${COMMANDS.join("|")}> [--project <dir>] [options]\n(see the header of scripts/<command>.mjs for options)`);
  process.exit(cmd && !["help", "--help"].includes(cmd) ? 1 : 0);
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
  console.error(`✗ lesson ${cmd}: ${e.message}`);
  process.exit(1);
}
// genhaha:ed34a05c8342
