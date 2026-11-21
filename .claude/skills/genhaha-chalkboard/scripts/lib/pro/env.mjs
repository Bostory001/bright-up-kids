// Key lookup for Pro mode. Order: real environment variables first, then a project ./.env (never committed).
// Values are only ever handed to the provider adapter; nothing here prints or stores a key.
import fs from "node:fs";
import path from "node:path";

export function readDotEnv(...dirs) {
  const out = {};
  for (const d of dirs.filter(Boolean)) {
    const f = path.join(d, ".env");
    if (!fs.existsSync(f)) continue;
    for (const line of fs.readFileSync(f, "utf8").split(/\r?\n/)) {
      const m = line.match(/^\s*(?:export\s+)?([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*?)\s*$/);
      if (!m || m[1] in out) continue;
      out[m[1]] = m[2].replace(/^(['"])(.*)\1$/, "$2");
    }
  }
  return out;
}
export function makeEnv(...dirs) {
  const dot = readDotEnv(...dirs), env = { ...dot };
  for (const [k, v] of Object.entries(process.env)) if (v) env[k] = v;
  if (!env.CLOUDFLARE_API_TOKEN && env.CLOUDFLARE_API_KEY) env.CLOUDFLARE_API_TOKEN = env.CLOUDFLARE_API_KEY;   // accepted alias
  return env;
}
export const envFiles = (...dirs) => dirs.filter(Boolean).map((d) => path.join(d, ".env")).filter((f) => fs.existsSync(f));
// remove any known secret value from a message before it is shown
export function redact(msg, env) {
  let s = String(msg);
  for (const k of ["GEMINI_API_KEY", "OPENAI_API_KEY", "ELEVENLABS_API_KEY", "CLOUDFLARE_API_TOKEN", "GOOGLE_MAPS_API_KEY"]) if (env[k] && env[k].length > 5) s = s.split(env[k]).join("***");
  return s.replace(/([?&]key=)[^&\s"]+/g, "$1***");
}
// genhaha:781c07c7ad6b
