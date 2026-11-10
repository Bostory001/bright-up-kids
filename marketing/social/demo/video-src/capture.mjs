/**
 * ถ่ายเฟรมจาก lesson-borrow.html ทีละเฟรมด้วย Chrome headless (CDP)
 * ไม่ต้องติดตั้ง npm อะไรเลย — ใช้ WebSocket/fetch ที่มากับ Node 22+
 *
 *   node capture.mjs <โฟลเดอร์เก็บเฟรม> [fps]
 *
 * หน้าเว็บต้องมี window.drawAt(t) และ window.TOTAL_MS
 */
import { spawn } from "node:child_process";
import { mkdir, writeFile, rm } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import os from "node:os";
import { fileURLToPath } from "node:url";

const HERE = path.dirname(fileURLToPath(import.meta.url));
/* --page=xxx.html เลือกคลิปที่จะเรนเดอร์ · ไม่ใส่ = คลิปสอน #1 */
const FLAGS = process.argv.slice(2).filter((a) => a.startsWith("--"));
const ARGV  = process.argv.slice(2).filter((a) => !a.startsWith("--"));
const pageFlag = FLAGS.find((a) => a.startsWith("--page="));
const PAGE = path.join(HERE, pageFlag ? pageFlag.slice(7) : "lesson-borrow.html");
const OUT = path.resolve(ARGV[0] || path.join(HERE, "frames"));
const FPS = Number(ARGV[1] || 30);
const PORT = 9333 + (process.pid % 300);

const CHROMES = [
  "C:/Program Files/Google/Chrome/Application/chrome.exe",
  "C:/Program Files (x86)/Google/Chrome/Application/chrome.exe",
  "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe",
];
const chromePath = CHROMES.find((p) => existsSync(p));
if (!chromePath) throw new Error("หา Chrome/Edge ไม่เจอ");

const fileUrl = "file:///" + PAGE.replace(/\\/g, "/");
const profile = path.join(os.tmpdir(), "bu-render-" + process.pid);

await mkdir(OUT, { recursive: true });

const chrome = spawn(chromePath, [
  "--headless=new",
  "--remote-debugging-port=" + PORT,
  "--user-data-dir=" + profile,
  "--window-size=1080,1920",
  "--hide-scrollbars",
  "--disable-gpu",
  "--force-color-profile=srgb",
  "--font-render-hinting=none",
  "--no-first-run",
  "--no-default-browser-check",
  "--disable-extensions",
  "--disable-background-timer-throttling",
  "about:blank",
], { stdio: "ignore" });

/* ── รอให้ Chrome เปิดพอร์ต ─────────────────────────────────── */
let wsUrl = null;
for (let i = 0; i < 80; i++) {
  try {
    const r = await fetch(`http://127.0.0.1:${PORT}/json/version`);
    wsUrl = (await r.json()).webSocketDebuggerUrl;
    if (wsUrl) break;
  } catch { /* ยังไม่พร้อม */ }
  await new Promise((r) => setTimeout(r, 250));
}
if (!wsUrl) { chrome.kill(); throw new Error("Chrome ไม่ยอมเปิด debugging port"); }

/* ── ท่อ CDP ────────────────────────────────────────────────── */
const ws = new WebSocket(wsUrl);
await new Promise((res, rej) => { ws.onopen = res; ws.onerror = rej; });

let nextId = 1;
const pending = new Map();
const waiters = [];

ws.onmessage = (ev) => {
  const m = JSON.parse(ev.data);
  if (m.id && pending.has(m.id)) {
    const { res, rej } = pending.get(m.id);
    pending.delete(m.id);
    m.error ? rej(new Error(m.error.message)) : res(m.result);
    return;
  }
  for (let i = waiters.length - 1; i >= 0; i--) {
    if (waiters[i].method === m.method) { waiters[i].res(m.params); waiters.splice(i, 1); }
  }
};

const send = (method, params = {}, sessionId) =>
  new Promise((res, rej) => {
    const id = nextId++;
    pending.set(id, { res, rej });
    ws.send(JSON.stringify({ id, method, params, sessionId }));
  });

const once = (method, ms = 30000) =>
  new Promise((res, rej) => {
    const w = { method, res };
    waiters.push(w);
    setTimeout(() => { const i = waiters.indexOf(w); if (i >= 0) { waiters.splice(i, 1); rej(new Error("รอ " + method + " นานเกินไป")); } }, ms);
  });

/* ── เปิดหน้าเว็บ ───────────────────────────────────────────── */
const { targetId } = await send("Target.createTarget", { url: "about:blank" });
const { sessionId } = await send("Target.attachToTarget", { targetId, flatten: true });

await send("Page.enable", {}, sessionId);
await send("Runtime.enable", {}, sessionId);
await send("Emulation.setDeviceMetricsOverride",
  { width: 1080, height: 1920, deviceScaleFactor: 1, mobile: false }, sessionId);

const loaded = once("Page.loadEventFired");
await send("Page.navigate", { url: fileUrl }, sessionId);
await loaded;

const evalJs = async (expression, awaitPromise = false) => {
  const r = await send("Runtime.evaluate",
    { expression, awaitPromise, returnByValue: true }, sessionId);
  if (r.exceptionDetails) throw new Error(r.exceptionDetails.text + " :: " + expression.slice(0, 80));
  return r.result.value;
};

/* ฟอนต์ไทยต้องโหลดเสร็จก่อน ไม่งั้นเฟรมแรก ๆ จะเป็นฟอนต์สำรอง */
await evalJs(`Promise.all([
  document.fonts.load("700 150px 'Bai Jamjuree'"),
  document.fonts.load("600 56px 'Bai Jamjuree'"),
  document.fonts.load("600 32px 'IBM Plex Sans Thai'"),
  document.fonts.load("500 32px 'IBM Plex Sans Thai'")
]).then(() => document.fonts.ready).then(() => true)`, true);

/* รูปตัวละครต้องโหลดครบก่อน ไม่งั้นเฟรมแรก ๆ จะไม่มีครู */
if (await evalJs("typeof window.ASSETS_READY !== 'undefined'")) {
  const ok = await evalJs("window.ASSETS_READY", true);
  if (!ok) throw new Error("โหลดรูปตัวละครใน assets/ ไม่สำเร็จ");
}

const total = await evalJs("window.TOTAL_MS");
if (!total) throw new Error("หน้าเว็บไม่ได้ประกาศ TOTAL_MS");

/* โหมด probe: เก็บแค่ 8 ภาพตัวอย่างไว้ตรวจหน้าตาก่อนเรนเดอร์จริง
   เวลาที่จะถ่ายมาจาก window.PROBE_MS ของหน้านั้น ถ้าไม่มีก็แบ่งเท่า ๆ กัน */
const PROBE = ARGV[2] === "probe";
const probeTimes = (await evalJs("window.PROBE_MS || null"))
  || Array.from({ length: 8 }, (_, i) => Math.round((total * (i + 0.5)) / 8));

const frames = PROBE ? probeTimes.length : Math.round((total / 1000) * FPS);
console.log(`เรนเดอร์ ${frames} เฟรม (${(total / 1000).toFixed(1)} วิ @ ${FPS}fps) → ${OUT}`);

const t0 = Date.now();
for (let i = 0; i < frames; i++) {
  await evalJs(`window.drawAt(${PROBE ? probeTimes[i] : (i / FPS) * 1000})`);
  const shot = await send("Page.captureScreenshot",
    { format: "png", captureBeyondViewport: false }, sessionId);
  await writeFile(path.join(OUT, "f" + String(i + 1).padStart(5, "0") + ".png"),
    Buffer.from(shot.data, "base64"));
  if ((i + 1) % 100 === 0 || i + 1 === frames) {
    const sec = (Date.now() - t0) / 1000;
    console.log(`  ${i + 1}/${frames} · ${sec.toFixed(0)} วิ · เหลือ ~${((sec / (i + 1)) * (frames - i - 1)).toFixed(0)} วิ`);
  }
}

ws.close();
chrome.kill();
await rm(profile, { recursive: true, force: true }).catch(() => {});
console.log("เสร็จ:", frames, "เฟรม");
