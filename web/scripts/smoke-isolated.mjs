import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { spawn } from "node:child_process";

const cwd = fileURLToPath(new URL("../", import.meta.url));
const dataDir = await mkdtemp(path.join(tmpdir(), "buk-smoke-"));
const env = { ...process.env, BUK_DATA_DIR: dataDir, FIREBASE_SERVICE_ACCOUNT: "", LINE_CHANNEL_ACCESS_TOKEN: "", LINE_CHANNEL_SECRET: "", LINE_LOGIN_CHANNEL_ID: "", LINE_LIFF_ID: "", ANTHROPIC_API_KEY: "", CRON_SECRET: "", VERCEL: "" };
let server;
let exited;
let output = "";
let base;
try {
  server = spawn(process.execPath, ["node_modules/next/dist/bin/next", "start", "--hostname", "127.0.0.1", "--port", "0"], { cwd, env, windowsHide: true, stdio: ["ignore", "pipe", "pipe"] });
  exited = new Promise((resolve) => { server.once("exit", resolve); server.once("error", resolve); });
  const collect = (chunk) => {
    const text = chunk.toString();
    output = (output + text).slice(-16000);
    const match = output.match(/127\.0\.0\.1:(\d+)/);
    if (match) base = "http://" + match[0];
  };
  server.stdout.on("data", collect);
  server.stderr.on("data", collect);
  const deadline = Date.now() + 60000;
  let ready = false;
  while (Date.now() < deadline && server.exitCode === null) {
    if (base) {
      try {
        const response = await fetch(base + "/api/status", { signal: AbortSignal.timeout(2000) });
        const status = await response.json();
        if (response.ok && status.needsSetup && status.store === "file") { ready = true; break; }
      } catch { /* Server is still starting. */ }
    }
    await new Promise((resolve) => setTimeout(resolve, 200));
  }
  if (!ready) throw new Error("Isolated server did not become ready.\n" + output);
  const child = spawn(process.execPath, ["scripts/smoke.mjs"], { cwd, env: { ...env, BASE_URL: base }, windowsHide: true, stdio: "inherit" });
  process.exitCode = await new Promise((resolve, reject) => { child.once("exit", (code) => resolve(code ?? 1)); child.once("error", reject); });
} catch (error) {
  console.error(error);
  process.exitCode = 1;
} finally {
  if (server && server.exitCode === null) server.kill();
  if (exited) await exited;
  if (path.dirname(path.resolve(dataDir)) !== path.resolve(tmpdir()) || !path.basename(dataDir).startsWith("buk-smoke-")) throw new Error("Unexpected temporary directory");
  await rm(dataDir, { recursive: true, force: true, maxRetries: 5, retryDelay: 200 });
}
