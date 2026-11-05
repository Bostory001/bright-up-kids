#!/usr/bin/env node

import { mkdir, readFile, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const PROMPTS_PATH = path.join(ROOT, "marketing", "video", "characters", "PROMPTS.md");
const OUT_DIR = path.dirname(PROMPTS_PATH);
const MODEL = process.env.OPENAI_IMAGE_MODEL ?? "gpt-image-2.5-sunburst";
const ONLY = process.argv.find((arg) => arg.startsWith("--only="))?.split("=")[1];

const BLOCKS = {
  "[STYLE block]": `STYLE: modern anime cel-shaded illustration, clean confident linework with\ncolored outlines, two-tone cel shading with soft highlights, vivid saturated\npalette, child proportions (head-to-body ratio about 1:5), large expressive\neyes with light reflections, warm friendly expression, Thai elementary school\nsetting, flat white background, high detail on face and costume, studio\ncharacter-design quality`,
  "[LAYOUT block]": `LAYOUT: character reference sheet on one canvas, 4:3 landscape.\nTop row: full-body turnaround of the SAME character — front view, 3/4 view,\nside view, back view, all at identical height on a shared baseline.\nBottom row: four head-and-shoulders expressions — happy, surprised, thinking\n(hand near chin), proud. Evenly spaced, white background, no text labels.`,
  "[NEGATIVE block]": `NEGATIVE: any text, letters, numbers, logos, watermarks, signatures, speech\nbubbles, photorealism, 3d render, dark or moody lighting, horror, violence,\nweapons, sexualized clothing, short skirts above mid-thigh, makeup, adult\nproportions, extra fingers, deformed hands, cluttered background, busy\npatterns, copyrighted mascots or branded uniforms`,
};

const NAMES = {
  1: "tonkla", 2: "boat", 3: "mimi", 4: "praew", 5: "kru-ann", 6: "manao", 7: "koko",
  8: "group", 9: "banner", 10: "subjects", 11: "avatar-assets",
};

function fillBlocks(prompt) {
  return Object.entries(BLOCKS).reduce((text, [token, value]) => text.replaceAll(token, value), prompt).trim();
}

function sections(markdown) {
  const matches = [...markdown.matchAll(/^# (\d+)\. .*$/gm)];
  return matches.map((m, i) => ({
    number: Number(m[1]),
    title: m[0].slice(2),
    text: markdown.slice(m.index, matches[i + 1]?.index ?? markdown.length),
  }));
}

function firstPrompt(text) {
  return text.match(/```\n([\s\S]*?)\n```/)?.[1]?.trim() ?? null;
}

async function callImageAPI(prompt, referencePath) {
  if (!process.env.OPENAI_API_KEY) throw new Error("OPENAI_API_KEY is not set");
  const headers = { Authorization: `Bearer ${process.env.OPENAI_API_KEY}` };
  let response;
  if (referencePath) {
    const form = new FormData();
    form.append("model", MODEL);
    form.append("prompt", prompt);
    form.append("size", "1024x1024");
    form.append("quality", process.env.OPENAI_IMAGE_QUALITY ?? "medium");
    const bytes = await readFile(referencePath);
    form.append("image[]", new Blob([bytes], { type: "image/png" }), path.basename(referencePath));
    response = await fetch("https://api.openai.com/v1/images/edits", { method: "POST", headers, body: form });
  } else {
    response = await fetch("https://api.openai.com/v1/images/generations", {
      method: "POST", headers: { ...headers, "Content-Type": "application/json" },
      body: JSON.stringify({ model: MODEL, prompt, size: "1024x1024", quality: process.env.OPENAI_IMAGE_QUALITY ?? "medium" }),
    });
  }
  const body = await response.json();
  if (!response.ok) throw new Error(`${response.status}: ${JSON.stringify(body)}`);
  const b64 = body.data?.[0]?.b64_json;
  if (!b64) throw new Error("API response did not contain data[0].b64_json");
  return Buffer.from(b64, "base64");
}

async function main() {
  const markdown = await readFile(PROMPTS_PATH, "utf8");
  await mkdir(OUT_DIR, { recursive: true });
  const all = sections(markdown);
  const chosen = ONLY ? all.filter((s) => String(s.number) === ONLY || NAMES[s.number] === ONLY) : all;
  if (!chosen.length) throw new Error(`No section matched --only=${ONLY}`);
  let previousImage = null;
  for (const section of chosen) {
    const raw = firstPrompt(section.text);
    if (!raw) continue;
    const prompt = fillBlocks(raw);
    const base = NAMES[section.number] ?? `section-${section.number}`;
    const imagePath = path.join(OUT_DIR, `${base}.png`);
    const metaPath = path.join(OUT_DIR, `${base}.md`);
    const bytes = await callImageAPI(prompt, previousImage && existsSync(previousImage) ? previousImage : null);
    await writeFile(imagePath, bytes);
    await writeFile(metaPath, `# ${section.title}\n\n- Model: \`${MODEL}\`\n- Seed: not supported by the current Images API\n- Endpoint: ${previousImage ? "POST /v1/images/edits (previous image as reference)" : "POST /v1/images/generations"}\n- Reference: ${previousImage ? path.basename(previousImage) : "none"}\n\n## Prompt used\n\n${prompt}\n`);
    previousImage = imagePath;
    console.log(`Saved ${imagePath}`);
  }
}

main().catch((error) => { console.error(error.message); process.exitCode = 1; });
