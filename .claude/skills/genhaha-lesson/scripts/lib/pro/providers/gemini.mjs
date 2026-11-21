// Gemini image adapter — Interactions API (https://ai.google.dev/gemini-api/docs/image-generation), checked 2026-10.
export const id = "gemini", label = "Gemini image (Google AI Studio key)", keys = ["GEMINI_API_KEY"];
export const defaultModel = "gemini-nano-banana-2.1";
const ASPECT = { square: "1:1", portrait: "9:16", landscape: "16:9" };
export function build(prompt, { shape = "square", model = defaultModel } = {}) {
  return {
    url: "https://generativelanguage.googleapis.com/v1beta/interactions",
    headers: { "x-goog-api-key": "$GEMINI_API_KEY", "Content-Type": "application/json" },
    body: { model, input: [{ type: "text", text: prompt }], response_format: { type: "image", mime_type: "image/png", aspect_ratio: ASPECT[shape] || "1:1", image_size: "1K" } },
  };
}
// walk the JSON for the first image block with base64 data (tolerant of small layout changes)
function find(o) {
  if (!o || typeof o !== "object") return null;
  if (typeof o.data === "string" && o.data.length > 200 && (!o.type || o.type === "image")) return o.data;
  for (const v of Object.values(o)) { const r = find(v); if (r) return r; }
  return null;
}
export function parse(json) { const b = find(json); if (!b) throw new Error("Gemini returned no image (the prompt may have been declined — try other words)"); return Buffer.from(b, "base64"); }
// genhaha:ed34a05c8342
