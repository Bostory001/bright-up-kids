// Optional TTS providers (Node built-in fetch only). edge-tts stays the free default; the others need a key the user
// put in the shell environment or in ./.env (read here, never printed, never written anywhere, sent only to that provider).
//   CB_TTS=edge|elevenlabs|openai|gemini|cloudflare      CB_VOICE=<voice>   CB_TTS_MODEL=<model>
// Each synth(text, opts) returns { audio: Buffer, words: [{t,d,text}] | [] }  (words = seconds; [] = no timestamps).
import fs from "node:fs";
import path from "node:path";

export const PROVIDERS = ["edge", "elevenlabs", "openai", "gemini", "cloudflare"];
export const KEYS = {
  elevenlabs: ["ELEVENLABS_API_KEY"],
  openai: ["OPENAI_API_KEY"],
  gemini: ["GEMINI_API_KEY"],
  cloudflare: ["CLOUDFLARE_ACCOUNT_ID", "CLOUDFLARE_API_TOKEN"],
};

// read KEY=VALUE lines from the given .env files into a private object (process.env wins; nothing is exported)
export function loadEnv(...dirs) {
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
  // CLOUDFLARE_API_KEY is accepted as an alias of CLOUDFLARE_API_TOKEN
  const get = (k) => process.env[k] || out[k] || (k === "CLOUDFLARE_API_TOKEN" ? process.env.CLOUDFLARE_API_KEY || out.CLOUDFLARE_API_KEY : undefined);
  return new Proxy(out, { get: (o, k) => get(k), has: (o, k) => !!get(k) });
}
export const hasKeys = (env, p) => p === "edge" || KEYS[p].every((k) => !!env[k]);

// which provider is configured by CB_TTS and whether its key is present (falls back to edge, with a reason)
export function pickProvider(env) {
  const want = String(env.CB_TTS || "edge").toLowerCase();
  if (!PROVIDERS.includes(want)) return { provider: "edge", note: `CB_TTS="${want}" is not one of ${PROVIDERS.join("|")} — using edge` };
  if (!hasKeys(env, want)) return { provider: "edge", note: `Pro voice "${want}" needs ${KEYS[want].filter((k) => !env[k]).join(" + ")} and it is not set — using the free voice instead (run the keys command to add one, optional)` };
  return { provider: want, note: null };
}

export const DEFAULTS = {
  elevenlabs: { voice: "21m00Tcm4TlvDq8ikWAM", model: "eleven_v3" },  // Rachel (premade); v3 covers Thai
  openai: { voice: "coral", model: "gpt-4o-mini-tts" },
  gemini: { voice: "Kore", model: "gemini-3.8-flash-tts" },
  cloudflare: { voice: "Kore", model: "google/gemini-3.8-flash-tts" },
};

// distinct voices handed to the 1st, 2nd, 3rd … speaker when video.json → speakers.<id>.<provider> names none
export const SPEAKER_DEFAULTS = {
  elevenlabs: ["pNInz6obpgDQGcFmaJgB", "21m00Tcm4TlvDq8ikWAM", "ErXwobaYiN019PkySvjV"],   // Adam, Rachel, Antoni (premade)
  openai: ["onyx", "coral", "echo", "nova"],
  gemini: ["Puck", "Kore", "Charon", "Zephyr"],
  cloudflare: ["Puck", "Kore", "Charon", "Zephyr"],
};

async function fail(name, res) {
  let body = ""; try { body = (await res.text()).slice(0, 300); } catch { /* ignore */ }
  const hint = res.status === 401 || res.status === 403 ? " (key rejected — check the key and that it has TTS access)" : res.status === 429 ? " (rate limit or quota — see references/ai-providers.md)" : "";
  throw new Error(`${name} HTTP ${res.status}${hint}: ${body.replace(/\s+/g, " ")}`);
}
const b64 = (s) => Buffer.from(String(s).replace(/^data:[^,]+,/, ""), "base64");

async function elevenlabs(text, { voice, model, env }) {
  const res = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${encodeURIComponent(voice)}/with-timestamps?output_format=mp3_44100_128`, {
    signal: AbortSignal.timeout(90000), method: "POST", headers: { "xi-api-key": env.ELEVENLABS_API_KEY, "Content-Type": "application/json" },
    body: JSON.stringify({ text, model_id: model }) });
  if (!res.ok) await fail("ElevenLabs", res);
  const j = await res.json();
  const a = j.alignment || j.normalized_alignment, words = [];
  // character-level timestamps → one entry per non-space character (works for Thai, which has no spaces)
  if (a?.characters) a.characters.forEach((ch, i) => { if (ch.trim()) words.push({ t: a.character_start_times_seconds[i], d: a.character_end_times_seconds[i] - a.character_start_times_seconds[i], text: ch }); });
  return { audio: b64(j.audio_base64), words };
}

async function openai(text, { voice, model, env }) {
  const res = await fetch("https://api.openai.com/v1/audio/speech", {
    signal: AbortSignal.timeout(90000), method: "POST", headers: { Authorization: `Bearer ${env.OPENAI_API_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({ model, input: text, voice, response_format: "mp3", ...(env.CB_TTS_INSTRUCTIONS && /gpt-4o/.test(model) ? { instructions: env.CB_TTS_INSTRUCTIONS } : {}) }) });
  if (!res.ok) await fail("OpenAI", res);
  return { audio: Buffer.from(await res.arrayBuffer()), words: [] };  // no timestamps
}

async function gemini(text, { voice, model, env }) {
  const res = await fetch("https://generativelanguage.googleapis.com/v1beta/interactions", {
    signal: AbortSignal.timeout(90000), method: "POST", headers: { "x-goog-api-key": env.GEMINI_API_KEY, "Content-Type": "application/json" },
    body: JSON.stringify({ model, input: [{ type: "user_input", content: [{ type: "text", text }] }],
      response_format: { type: "audio" }, generation_config: { speech_config: [{ voice }] } }) });
  if (!res.ok) await fail("Gemini", res);
  const j = await res.json();
  const blocks = (j.steps || []).filter((s) => s.type === "model_output").flatMap((s) => s.content || []).filter((c) => c.type === "audio");
  if (!blocks.length) throw new Error(`Gemini returned no audio: ${JSON.stringify(j).slice(0, 200)}`);
  return { audio: b64(blocks[blocks.length - 1].data), words: [] };  // WAV 24 kHz mono; no timestamps
}

async function cloudflare(text, { voice, model, env }) {
  const res = await fetch(`https://api.cloudflare.com/client/v4/accounts/${env.CLOUDFLARE_ACCOUNT_ID}/ai/run`, {
    signal: AbortSignal.timeout(90000), method: "POST", headers: { Authorization: `Bearer ${env.CLOUDFLARE_API_TOKEN}`, "Content-Type": "application/json" },
    body: JSON.stringify({ model, input: { text, voice } }) });
  if (!res.ok) await fail("Cloudflare Workers AI", res);
  const j = await res.json();
  const a = j.result?.audio ?? j.result?.result?.audio;
  if (!j.success || !a) throw new Error(`Cloudflare Workers AI: ${JSON.stringify(j.errors ?? j).slice(0, 250)}`);
  return { audio: a.startsWith("http") ? Buffer.from(await (await fetch(a)).arrayBuffer()) : b64(a), words: [] };
}

const IMPL = { elevenlabs, openai, gemini, cloudflare };

// synthesize with 3 tries (429/5xx back off); 4xx other than 429 fail at once so a wrong key is not retried
export async function synth(provider, text, opts) {
  let last;
  for (let n = 1; n <= 3; n++) {
    try { return await IMPL[provider](text, opts); }
    catch (e) { last = e; const m = /HTTP (\d+)/.exec(e.message); if (m && +m[1] < 500 && +m[1] !== 429) break; await new Promise((r) => setTimeout(r, 1500 * n)); }
  }
  throw last;
}
// genhaha:781c07c7ad6b
