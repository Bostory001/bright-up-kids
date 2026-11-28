// visual-proof chrome — one-time helper: downloads Chrome's headless shell into ~/.cache/puppeteer (the place HyperFrames also uses),
// for machines with no Chrome / Chromium (cloud sandboxes, fresh servers). About 100 MB, needs the internet. Nothing is installed system-wide.
//   node "$VP" chrome [--force]      --force downloads even when a Chrome is already found
import { spawnSync } from "node:child_process";
import os from "node:os";
import path from "node:path";
import { findChrome } from "./lib/browser.mjs";

export async function run(argv = []) {
  const have = findChrome();
  if (have && !argv.includes("--force")) { console.log(`✓ Chrome already available: ${have}`); return 0; }
  const dir = path.join(os.homedir(), ".cache/puppeteer");
  console.log(`downloading chrome-headless-shell (about 100 MB) → ${dir}`);
  const r = spawnSync("npx", ["-y", "@puppeteer/browsers", "install", "chrome-headless-shell@stable", "--path", dir], { stdio: "inherit", shell: process.platform === "win32" });
  if (r.status !== 0) throw new Error("download failed — check the network, or install Google Chrome / set CHROME_PATH");
  const f = findChrome();
  if (!f) throw new Error(`downloaded, but the executable was not found under ${dir}`);
  console.log(`✓ ${f}`);
  return 0;
}
// genhaha:ed4a029a9d2b
