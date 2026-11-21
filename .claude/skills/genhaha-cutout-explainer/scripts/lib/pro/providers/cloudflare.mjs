// Cloudflare Workers AI adapter — FLUX.1 schnell via REST (https://developers.cloudflare.com/workers-ai/models/flux-1-schnell/), checked 2026-10.
export const id = "cloudflare", label = "Cloudflare Workers AI (FLUX schnell)", keys = ["CLOUDFLARE_ACCOUNT_ID", "CLOUDFLARE_API_TOKEN"];
export const defaultModel = "@cf/black-forest-labs/flux-1-schnell";
export function build(prompt, { model = defaultModel } = {}) {
  return {
    url: `https://api.cloudflare.com/client/v4/accounts/$CLOUDFLARE_ACCOUNT_ID/ai/run/${model}`,
    headers: { Authorization: "Bearer $CLOUDFLARE_API_TOKEN", "Content-Type": "application/json" },
    body: { prompt: prompt.slice(0, 2048), steps: 4 },   // prompt max 2048 chars, steps max 8; output is square (crop in the page)
  };
}
export function parse(json) { const b = json?.result?.image || json?.image; if (!b) throw new Error(`Cloudflare returned no image: ${JSON.stringify(json?.errors ?? "").slice(0, 160)}`); return Buffer.from(b, "base64"); }
// genhaha:5f8f980bb7f3
