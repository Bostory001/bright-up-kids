// cutout doctor — is this machine ready? Only free local tools are needed; API keys are optional (providers section).
//   cutout doctor [--project <dir>] [--online]   --online also synthesizes one short edge-tts line and checks which hosts are reachable (needs internet)
// Checks: Node 22+, ffmpeg, the bundled engine, Chrome / Edge, HyperFrames (npx), edge-tts (python3 or uv).
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync, execFileSync } from "node:child_process";
import { parseArgs, which, HF, SCRIPTS, TEMPLATE } from "./lib/common.mjs";
import { edgePython, EDGE_HINT } from "./lib/python.mjs";
import { findChrome, browserName, launch } from "./lib/browser.mjs";
import { loadEnv, pickProvider, hasKeys, KEYS, PROVIDERS } from "./lib/tts.mjs";
import { proHint } from "./lib/pro/index.mjs";

export async function run(argv) {
  const args = parseArgs(argv);
  let fails = 0;
  const ok = (m) => console.log(`  ✓ ${m}`), bad = (m, fix) => { fails++; console.log(`  ✗ ${m}${fix ? `\n      → ${fix}` : ""}`); };
  const ver = (cmd, a) => { try { return execFileSync(cmd, a, { stdio: ["ignore", "pipe", "pipe"] }).toString().split("\n")[0].trim(); } catch { return null; } };
  const major = +process.versions.node.split(".")[0];
  major >= 22 ? ok(`Node ${process.versions.node}`) : bad(`Node ${process.versions.node} — need 22+ (built-in WebSocket + Intl.Segmenter)`, "https://nodejs.org");
  ver("ffmpeg", ["-version"]) ? ok(ver("ffmpeg", ["-version"]).slice(0, 48)) : bad("ffmpeg missing", "macOS: brew install ffmpeg · Ubuntu: sudo apt install ffmpeg · Windows: winget install ffmpeg");
  ver("ffprobe", ["-version"]) ? ok("ffprobe") : bad("ffprobe missing", "comes with ffmpeg");
  // the engine ships inside the skill: the kit + GSAP are local files (no CDN), so a project renders offline
  const need = ["engine/cutout-kit.js", "engine/motion.js", "engine/validate.js", "engine/cutout.css", "vendor/gsap.min.js", "fonts/Kanit-Bold.ttf", "demo/index.html"];
  const missing = need.filter((f) => !fs.existsSync(path.join(TEMPLATE, f)));
  missing.length ? bad(`skill template incomplete: ${missing.join(", ")}`, "re-download the skill zip") : ok("cutout engine (44 props, 9 backgrounds) + GSAP bundled in template/ (no CDN, offline-safe)");
  const ep = edgePython(); ep ? ok(`edge-tts via ${ep.how} (the narrator voice)`) : console.log(`  · edge-tts not importable — only needed for the narrator voice (a silent clip needs none). ${EDGE_HINT}`);
  which("npx") ? ok(`npx ${ver("npx", ["--version"])}`) : bad("npx missing", "comes with Node.js");
  const hf = ver("npx", [...HF, "--version"]); hf ? ok(`HyperFrames ${hf} (npx ${HF[1]}, Apache-2.0)`) : bad("HyperFrames could not start", `check the network, then: npx ${HF.join(" ")} --version`);
  const ch = findChrome(); ch ? ok(`Browser: ${browserName(ch)} — ${ch}`) : bad("No Chrome / Edge / Chromium found (needed by cutout check / safe / snapshot / cover and for the render)", `install Google Chrome or Microsoft Edge, or run: node "$CO" chrome  (downloads a ~100 MB headless Chrome, needs the internet), or set CHROME_PATH`);
  if (ch) {
    let b; try { b = await launch(); const okSvg = await b.evaluate(`!!document.createElementNS('http://www.w3.org/2000/svg','svg').createSVGMatrix || true`);
      okSvg ? ok("headless Chrome starts (the cutout scene is plain SVG: no GPU / WebGL needed)") : bad("headless Chrome did not answer", "set CHROME_PATH to a working Chrome / Edge"); }
    catch (e) { bad(`could not start Chrome: ${e.message.split("\n")[0]}`, "set CHROME_PATH to a working Chrome / Edge"); }
    finally { if (b) await b.close(); }
  }
  if (args.online && ep) {
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "pc-doc-")), mp3 = path.join(tmp, "a.mp3"), js = path.join(tmp, "a.json");
    const r = spawnSync(ep.cmd, [...ep.pre, path.join(SCRIPTS, "edge_synth.py")], { input: JSON.stringify({ jobs: [{ voice: "th-TH-NiwatNeural", text: "ทดสอบเสียง", mp3, json: js }] }), encoding: "utf8" });
    r.status === 0 && fs.existsSync(js) ? ok(`edge-tts online: Thai voice works, ${JSON.parse(fs.readFileSync(js, "utf8")).length} word boundaries`) : bad("edge-tts online test failed", (r.stderr || "").trim().split("\n").pop());
    fs.rmSync(tmp, { recursive: true, force: true });
  }
  // which hosts this machine can reach (cloud sandboxes often allow only package registries): every ✗ names what to allow or why a step will fail
  if (args.online) {
    console.log("\nnetwork (hosts the skill talks to)");
    const hosts = [["registry.npmjs.org", "https://registry.npmjs.org/", "HyperFrames (npx)"], ["pypi.org", "https://pypi.org/simple/edge-tts/", "edge-tts install"],
      ["speech.platform.bing.com", "https://speech.platform.bing.com/", "free edge-tts voice"], ["storage.googleapis.com", "https://storage.googleapis.com/chrome-for-testing-public/", "headless Chrome download (not needed if Chrome / Edge is installed)"]];
    for (const [h, u, why] of hosts) {
      try { await fetch(u, { method: "HEAD", signal: AbortSignal.timeout(7000) }); console.log(`  ✓ ${h}  (${why})`); }
      catch (e) { console.log(`  ✗ ${h}  blocked or offline — ${why}`); }
    }
    console.log("  If a host is blocked, this environment's network-access setting must allow it (in claude.ai look under Settings → Capabilities), or run on your own computer.");
  }
  // optional AI providers: yes/no only, values are never printed. Missing keys are fine (free edge-tts is used).
  const env = loadEnv(process.cwd());
  console.log("\nproviders (optional — no key needed; see references/ai-providers.md)");
  for (const p of PROVIDERS.filter((x) => x !== "edge")) {
    const miss = KEYS[p].filter((k) => !env[k]);
    console.log(`  ${hasKeys(env, p) ? "✓" : "·"} ${p.padEnd(11)} ${KEYS[p].join(" + ")}: ${hasKeys(env, p) ? "configured" : miss.length === KEYS[p].length ? "not set" : `missing ${miss.join(", ")}`}`);
  }
  const pk = pickProvider(env);
  console.log(`  → voice provider in use: ${pk.provider}${pk.provider === "edge" ? " (free)" : " (paid, per character)"}${pk.note ? `\n    note: ${pk.note}` : env.CO_TTS ? "" : "  — set CO_TTS=elevenlabs|openai|gemini|cloudflare to change"}`);
  console.log(proHint());
  console.log(fails ? `\n${fails} problem(s) to fix.` : "\nReady. Cost per clip: $0 (ffmpeg, HyperFrames and Chrome are free; so are edge-tts, the synthesized SFX and the music).");
  return fails ? 1 : 0;
}
// genhaha:5f8f980bb7f3
