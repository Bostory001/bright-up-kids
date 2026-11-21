// Minimal headless Chrome driver over the DevTools protocol (Node 22+ built-in WebSocket) — no puppeteer needed.
// Used by `cutout safe` (text measurements), `cutout frames` and `cutout cover` (screenshots of the composition at time t).
//
// Chrome, Microsoft Edge or Chromium is found in: $CHROME_PATH, the usual install paths (macOS / Linux / Windows), or the chrome-headless-shell that
// HyperFrames downloads into ~/.cache/puppeteer on its first render.
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawn } from "node:child_process";
import { pathToFileURL } from "node:url";
import { which } from "./common.mjs";

export function findChrome() {
  const env = process.env.CHROME_PATH; if (env && fs.existsSync(env)) return env;
  const home = os.homedir();
  const fixed = [
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
    "/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge",
    "/Applications/Chromium.app/Contents/MacOS/Chromium",
    "/Applications/Brave Browser.app/Contents/MacOS/Brave Browser",
    path.join(home, "Applications/Google Chrome.app/Contents/MacOS/Google Chrome"),
    path.join(home, "Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge"),
    "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
    "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
    "C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe",
    "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
    ...(process.env.LOCALAPPDATA ? [path.join(process.env.LOCALAPPDATA, "Google/Chrome/Application/chrome.exe"), path.join(process.env.LOCALAPPDATA, "Microsoft/Edge/Application/msedge.exe")] : []),
    "/usr/bin/google-chrome", "/usr/bin/google-chrome-stable", "/opt/google/chrome/chrome", "/usr/bin/microsoft-edge", "/usr/bin/microsoft-edge-stable", "/opt/microsoft/msedge/msedge",
    "/usr/bin/chromium", "/usr/bin/chromium-browser", "/snap/bin/chromium",
  ];
  for (const f of fixed) if (fs.existsSync(f)) return f;
  for (const c of ["google-chrome", "google-chrome-stable", "chromium", "chromium-browser", "microsoft-edge", "microsoft-edge-stable", "msedge"]) { const w = which(c); if (w) return w; }
  const cache = path.join(home, ".cache/puppeteer");
  for (const kind of ["chrome-headless-shell", "chrome"]) {
    const d = path.join(cache, kind); if (!fs.existsSync(d)) continue;
    for (const v of fs.readdirSync(d).sort().reverse()) {
      const walk = (p, depth) => { if (depth > 4 || !fs.existsSync(p)) return null; const st = fs.statSync(p);
        if (st.isFile() && /^(chrome-headless-shell|chrome|Google Chrome for Testing)(\.exe)?$/.test(path.basename(p))) return p;
        if (st.isDirectory()) for (const e of fs.readdirSync(p)) { const r = walk(path.join(p, e), depth + 1); if (r) return r; } return null; };
      const r = walk(path.join(d, v), 0); if (r) return r;
    }
  }
  return null;
}

// HyperFrames downloads its own chrome-headless-shell (~100 MB) on the first render. When that is not cached but this computer already has
// Chrome / Edge / Chromium, tell HyperFrames to use it (env HYPERFRAMES_BROWSER_PATH) — nothing to download, works offline.
export function applyBrowserEnv() {
  if (process.env.HYPERFRAMES_BROWSER_PATH || process.env.PUPPETEER_EXECUTABLE_PATH) return process.env.HYPERFRAMES_BROWSER_PATH || process.env.PUPPETEER_EXECUTABLE_PATH;
  const home = os.homedir();
  const cached = ["hyperframes/chrome/chrome-headless-shell", "puppeteer/chrome-headless-shell"].some((d) => { try { return fs.readdirSync(path.join(home, ".cache", d)).length > 0; } catch { return false; } });
  if (cached) return null;
  const exe = findChrome();
  if (exe && !/headless-shell/.test(exe)) { process.env.HYPERFRAMES_BROWSER_PATH = exe; return exe; }
  return null;
}
export const browserName = (exe) => /edge|msedge/i.test(exe) ? "Microsoft Edge" : /brave/i.test(exe) ? "Brave" : /chromium/i.test(exe) ? "Chromium" : /headless-shell/.test(exe) ? "Chrome headless shell" : "Google Chrome";

export async function launch() {
  const exe = findChrome();
  if (!exe) throw new Error("No Chrome / Edge / Chromium found — install Google Chrome or Microsoft Edge, or set CHROME_PATH (HyperFrames' own chrome-headless-shell also works after one `cutout render`)");
  const profile = fs.mkdtempSync(path.join(os.tmpdir(), "pc-chrome-"));
  const shell = /headless-shell/.test(exe);
  const proc = spawn(exe, [...(shell ? [] : ["--headless=new"]), "--remote-debugging-port=0", `--user-data-dir=${profile}`, "--no-first-run", "--no-default-browser-check",
    "--allow-file-access-from-files", "--hide-scrollbars", "--mute-audio", "--autoplay-policy=no-user-gesture-required", "--force-device-scale-factor=1", "--window-size=1080,1920", "about:blank"],
    { stdio: ["ignore", "ignore", "pipe"] });
  const wsUrl = await new Promise((res, rej) => {
    let buf = ""; const to = setTimeout(() => rej(new Error("Chrome did not start (no DevTools URL in 20 s)")), 20000);
    proc.stderr.on("data", (d) => { buf += d; const m = buf.match(/DevTools listening on (ws:\/\/\S+)/); if (m) { clearTimeout(to); res(m[1]); } });
    proc.on("exit", (c) => rej(new Error(`Chrome exited (${c}): ${buf.slice(-300)}`)));
  });
  const port = new URL(wsUrl).port;
  const list = await (await fetch(`http://127.0.0.1:${port}/json/list`)).json();
  const pageWs = list.find((t) => t.type === "page")?.webSocketDebuggerUrl;
  if (!pageWs) throw new Error("no page target in Chrome");
  const ws = new WebSocket(pageWs);
  await new Promise((res, rej) => { ws.onopen = res; ws.onerror = () => rej(new Error("DevTools socket failed")); });
  let id = 0; const pending = new Map(), listeners = [];
  ws.onmessage = (ev) => { const m = JSON.parse(ev.data); if (m.id && pending.has(m.id)) { const p = pending.get(m.id); pending.delete(m.id); m.error ? p.rej(new Error(m.error.message)) : p.res(m.result); } else if (m.method) listeners.forEach((f) => f(m)); };
  const send = (method, params = {}) => new Promise((res, rej) => { const i = ++id; pending.set(i, { res, rej }); ws.send(JSON.stringify({ id: i, method, params })); });
  const evaluate = async (expr) => { const r = await send("Runtime.evaluate", { expression: expr, awaitPromise: true, returnByValue: true });
    if (r.exceptionDetails) throw new Error(r.exceptionDetails.exception?.description || r.exceptionDetails.text); return r.result.value; };
  const close = async () => { try { ws.close(); } catch {} proc.kill(); await new Promise((r) => setTimeout(r, 200)); try { fs.rmSync(profile, { recursive: true, force: true, maxRetries: 8, retryDelay: 250 }); } catch {} };
  return { send, evaluate, close, on: (f) => listeners.push(f), exe };
}

// Opens <project>/index.html at 1080×1920 and returns helpers to seek the paused timeline like the HyperFrames runtime does.
export async function openComposition(root, { hideCaptions = false } = {}) {
  const b = await launch();
  const errors = [], warnings = [];
  b.on((m) => { if (m.method === "Runtime.consoleAPICalled" && m.params.type === "warning") warnings.push((m.params.args || []).map((a) => a.value ?? a.description ?? "").join(" ")); if (m.method === "Runtime.exceptionThrown") errors.push(m.params.exceptionDetails?.exception?.description?.split("\n")[0]); });
  await b.send("Runtime.enable"); await b.send("Page.enable");
  await b.send("Emulation.setDeviceMetricsOverride", { width: 1080, height: 1920, deviceScaleFactor: 1, mobile: false });
  await b.send("Page.addScriptToEvaluateOnNewDocument", { source: "window.__timelines = {};" });
  await b.send("Page.navigate", { url: pathToFileURL(path.join(root, "index.html")).href });
  for (let i = 0; ; i++) {
    const ok = await b.evaluate("!!(window.__timelines && window.__timelines.main)").catch(() => false);
    if (ok) break;
    if (i > 150) { await b.close(); throw new Error(`timeline not registered (window.__timelines.main)${errors.length ? ": " + errors.join(" | ") : " — see the page error"}`); }
    await new Promise((r) => setTimeout(r, 200));
  }
  // the cutout engine builds the scene when the page loads: wait until it says ready (window.__CO_READY), or until validation found errors
  for (let i = 0; i < 100; i++) {
    const st = await b.evaluate("window.__CO_READY ? 'ready' : (window.__CO_VALIDATION && window.__CO_VALIDATION.errors.length ? 'invalid' : '')").catch(() => "");
    if (st) break;
    if (i === 99 && !errors.length) errors.push("scene not ready after 20 s (window.__CO_READY never set — does index.html call K.finish()?)");
    if (errors.length && i > 10) break;
    await new Promise((r) => setTimeout(r, 200));
  }
  await b.evaluate("document.fonts.ready.then(() => true)");
  if (hideCaptions) await b.evaluate(`(() => { const s = document.createElement('style'); s.textContent = '#captions{display:none!important}'; document.head.appendChild(s); return true; })()`);
  const duration = await b.evaluate(`Number(document.querySelector('[data-composition-id]')?.dataset.duration) || window.__timelines.main.duration()`);
  const seek = (t) => b.evaluate(`(() => { const t = ${t}; document.querySelectorAll('.clip[data-start]').forEach((c) => { const a = +c.dataset.start, d = +c.dataset.duration;
      c.style.visibility = t >= a && t < a + d ? '' : 'hidden'; }); window.__timelines.main.seek(t, false); return true; })()`);
  const screenshot = async (file, { quality = 92 } = {}) => {
    const jpg = /\.jpe?g$/i.test(file);
    const r = await b.send("Page.captureScreenshot", { format: jpg ? "jpeg" : "png", ...(jpg ? { quality } : {}), clip: { x: 0, y: 0, width: 1080, height: 1920, scale: 1 } });
    fs.writeFileSync(file, Buffer.from(r.data, "base64"));
  };
  return { ...b, duration, seek, screenshot, errors, warnings };
}
// genhaha:5f8f980bb7f3
