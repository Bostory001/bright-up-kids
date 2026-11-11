/**
 * สร้างเพลงคลอด้วย ACE-Step 1.5 turbo ผ่าน ComfyUI ที่รันอยู่ในเครื่อง
 *
 *   node tools/make-bgm.mjs
 *
 * ทำไมสร้างเอง ไม่ใช้คลังเพลง: เพลงที่สร้างเองไม่มีปัญหาลิขสิทธิ์เชิงพาณิชย์
 * และไม่โดน Facebook เคลมเสียง ซึ่งสำคัญเพราะสาขาเป็นธุรกิจจริง
 *
 * ออกที่ assets/bgm/<ชื่อ>.flac — ฟังเลือกก่อน แล้วค่อยเอาตัวที่ชอบไปใช้
 */
import { writeFile, mkdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.join(HERE, "..", "assets", "bgm");
const API = "http://127.0.0.1:8188";
const CKPT = "ace_step_1.5_turbo_aio.safetensors";
const SECONDS = 46;          /* คลิปยาว 40.9 วิ เผื่อหางไว้เฟด */
const NEG = "vocals, singing, lyrics, rap, heavy drums, distorted guitar, aggressive, dark, sad, noise, clipping";

/* สามแนวให้เลือก — ทุกตัวต้องเป็นดนตรีล้วน ไม่มีเสียงร้อง เพราะมีคนพูดทับอยู่แล้ว */
const PICKS = [
  { name: "a-ukulele", bpm: 104, key: "C major",
    tags: "soft playful ukulele, marimba, light hand claps, warm, cheerful, gentle, simple, instrumental, no vocals, children education background music" },
  { name: "b-piano",   bpm: 96,  key: "F major",
    tags: "gentle piano, soft bells, gentle pad, calm uplifting, light percussion, airy, instrumental, no vocals, learning video background music" },
  { name: "c-guitar",  bpm: 110, key: "G major",
    tags: "bright acoustic guitar, soft synth pad, light shaker, happy, friendly, simple, instrumental, no vocals, kids explainer background music" },
];

const clientId = "bu-bgm-" + process.pid;

function graph(p, seed) {
  const enc = (tags) => ({
    class_type: "TextEncodeAceStepAudio1.5",
    inputs: {
      clip: ["ckpt", 1], tags, lyrics: "", seed, bpm: p.bpm, duration: SECONDS,
      timesignature: "4", language: "en", keyscale: p.key,
      generate_audio_codes: true, cfg_scale: 2.0, temperature: 0.85,
      top_p: 0.9, top_k: 0, min_p: 0,
    },
  });
  return {
    ckpt: { class_type: "CheckpointLoaderSimple", inputs: { ckpt_name: CKPT } },
    pos: enc(p.tags),
    neg: enc(NEG),
    lat: { class_type: "EmptyAceStep1.5LatentAudio", inputs: { seconds: SECONDS, batch_size: 1 } },
    ks: {
      class_type: "KSampler",
      inputs: {
        model: ["ckpt", 0], seed, steps: 12, cfg: 1.0,
        sampler_name: "euler", scheduler: "simple",
        positive: ["pos", 0], negative: ["neg", 0], latent_image: ["lat", 0], denoise: 1.0,
      },
    },
    dec: { class_type: "VAEDecodeAudio", inputs: { samples: ["ks", 0], vae: ["ckpt", 2] } },
    save: { class_type: "SaveAudio", inputs: { audio: ["dec", 0], filename_prefix: "bu-bgm/" + p.name } },
  };
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

await mkdir(OUT, { recursive: true });

for (const p of PICKS) {
  const seed = 1000 + PICKS.indexOf(p) * 7;
  const r = await fetch(API + "/prompt", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ prompt: graph(p, seed), client_id: clientId }),
  });
  const j = await r.json();
  if (!j.prompt_id) { console.log(p.name, "ส่งงานไม่สำเร็จ:", JSON.stringify(j).slice(0, 400)); continue; }
  process.stdout.write(p.name + " กำลังสร้าง");

  let files = null;
  for (let i = 0; i < 300; i++) {
    await sleep(2000);
    process.stdout.write(".");
    const h = await (await fetch(API + "/history/" + j.prompt_id)).json();
    const rec = h[j.prompt_id];
    if (!rec) continue;
    if (rec.status && rec.status.status_str === "error") {
      console.log("\n", p.name, "พัง:", JSON.stringify(rec.status).slice(0, 500)); break;
    }
    const outs = Object.values(rec.outputs || {});
    const au = outs.flatMap((o) => o.audio || []);
    if (au.length) { files = au; break; }
  }
  if (!files) { console.log("\n", p.name, "ไม่ได้ไฟล์"); continue; }

  for (const f of files) {
    const q = new URLSearchParams({ filename: f.filename, subfolder: f.subfolder || "", type: f.type || "output" });
    const buf = Buffer.from(await (await fetch(API + "/view?" + q)).arrayBuffer());
    const dest = path.join(OUT, p.name + path.extname(f.filename));
    await writeFile(dest, buf);
    console.log("\n ->", dest, (buf.length / 1048576).toFixed(2), "MB");
  }
}
console.log("เสร็จ");
