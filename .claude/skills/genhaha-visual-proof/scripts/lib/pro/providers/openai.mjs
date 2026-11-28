// OpenAI image adapter — POST /v1/images/generations (https://developers.openai.com/api/docs/guides/image-generation), checked 2026-10.
export const id = "openai", label = "OpenAI gpt-image", keys = ["OPENAI_API_KEY"];
export const defaultModel = "gpt-image-2.5-flare";
const SIZE = { square: "1024x1024", portrait: "1024x1536", landscape: "1536x1024" };
export function build(prompt, { shape = "square", quality = "low", model = defaultModel } = {}) {
  return {
    url: "https://api.openai.com/v1/images/generations",
    headers: { Authorization: "Bearer $OPENAI_API_KEY", "Content-Type": "application/json" },
    body: { model, prompt, size: SIZE[shape] || SIZE.square, quality, output_format: "png", n: 1 },
  };
}
export function parse(json) { const b = json?.data?.[0]?.b64_json; if (!b) throw new Error("OpenAI returned no image"); return Buffer.from(b, "base64"); }
// genhaha:ed4a029a9d2b
