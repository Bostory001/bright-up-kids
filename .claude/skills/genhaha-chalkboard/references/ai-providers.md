# Optional AI voice providers

**API keys are optional.** With no key, this skill uses edge-tts: free, no account, good enough for most clips.
Paid voices cost money per character, billed by the provider. Check each provider's pricing page before a long clip.
The skill never sends a key anywhere except to that provider's own API, never prints it, and never writes it into a project file.

## Pro mode at a glance

Pro mode is optional: better voices through the user's **own** key. Free (edge-tts) is the default and always works. Step-by-step key guide: https://videos.genhaha.com/skills#keys

| Provider | What for in this skill | Env var | Where to get the key | Cost |
|---|---|---|---|---|
| Google Gemini | voices (natural Thai) | `GEMINI_API_KEY` | https://aistudio.google.com/apikey | ราคาเปลี่ยนได้ ดูหน้าผู้ให้บริการ |
| OpenAI | voices | `OPENAI_API_KEY` | https://platform.openai.com/api-keys | ราคาเปลี่ยนได้ ดูหน้าผู้ให้บริการ |
| ElevenLabs | voices (most choice, exact word timing) | `ELEVENLABS_API_KEY` | https://elevenlabs.io/app/settings/api-keys | ราคาเปลี่ยนได้ ดูหน้าผู้ให้บริการ |
| Cloudflare Workers AI | Gemini voice through one Cloudflare bill | `CLOUDFLARE_API_TOKEN` + `CLOUDFLARE_ACCOUNT_ID` | https://dash.cloudflare.com/profile/api-tokens (Workers AI) and the Account ID on the dashboard home | ราคาเปลี่ยนได้ ดูหน้าผู้ให้บริการ |

Prices change; check each provider's pricing page before a long clip. The skill never invents a price.

```bash
node "$CB" keys                                  # set / not set per provider (never the value), what it unlocks, how to add it
node "$CB" keys --prepare                        # project .env with empty lines + .env added to .gitignore
node "$CB" voice --provider gemini               # openai | elevenlabs | cloudflare | edge (free default)
```

- Keys live only in environment variables or a project `.env` (git-ignored). Never paste one into a chat; if you did, delete the message and rotate the key.
- Missing key or a failed call → the free path is used automatically (voice: edge-tts; no other Pro step here).
- `--provider` overrides `CB_TTS` for one run; `CB_TTS` / `CB_VOICE` / `CB_TTS_MODEL` set it for the shell.

## Quick summary

| Provider | `CB_TTS=` | Env var(s) | Word timing for karaoke | Best for |
|---|---|---|---|---|
| edge-tts (default) | `edge` | none | exact (word events) | free, always works |
| ElevenLabs | `elevenlabs` | `ELEVENLABS_API_KEY` | exact (character timestamps) | most natural voices, custom/cloned voices |
| OpenAI | `openai` | `OPENAI_API_KEY` | none, spread evenly in the line | easy key, steerable tone |
| Google Gemini | `gemini` | `GEMINI_API_KEY` | none, spread evenly in the line | natural Thai, many voices |
| Cloudflare Workers AI | `cloudflare` | `CLOUDFLARE_ACCOUNT_ID` + `CLOUDFLARE_API_TOKEN` | none, spread evenly in the line | one Cloudflare bill, Gemini voice model |

The recommended order for a beginner: **edge (free) first**, then **Gemini** or **ElevenLabs** if the voice is not good enough.

## Where to put the keys

Either, whichever you prefer:
- **Shell:** `export GEMINI_API_KEY=...` (or set it in your shell profile).
- **A `.env` file** in the project folder (`./.env`, one `NAME=value` per line). Make sure it is git-ignored (`echo .env >> .gitignore`) and never commit or share it.

The environment wins over `.env`. Keys are read at run time only.

## How to select a provider

```bash
CB_TTS=gemini node "$CB" voice  # one run
export CB_TTS=elevenlabs                # or for the whole shell / put CB_TTS=... in ./.env
```

Optional: `CB_VOICE=<voice>` (or `--voice`, or `video.json -> voice.<provider>`), `CB_TTS_MODEL=<model>`.
If `CB_TTS` names a provider whose key is missing, the skill prints a note and uses edge-tts. `node "$CB" doctor` shows which keys are configured (yes/no only) and which provider will be used.

## Voices: one teacher (narrator)

`video.json → voice` names the teacher's voice per provider: `voice` (edge-tts), `gemini`, `openai`, `elevenlabs`, `cloudflare` (e.g. `"gemini": "Puck"`, `"elevenlabs": "<voice id>"`). The chalkboard clip has one narrator, so no `speakers` block is needed. Voice ids are never secrets, but keys stay in the shell or `./.env`. A single line can still name its own edge voice (`voice: "en"` for an English phrase).
Mouth: the teacher's `T.say(key)` flaps on the per-character times in `timing.js`; with OpenAI / Gemini / Cloudflare those times are spread evenly over each line, so the mouth still opens and closes during the line, only less exactly on the syllables. Board writes timed with `atW(key, "word")` follow the same times.

## How timing works

- **edge, ElevenLabs:** real word/character times, so the karaoke highlight follows the voice.
- **OpenAI, Gemini, Cloudflare:** these APIs return audio only. The skill spreads the subtitle characters evenly over each spoken line. It looks fine for short lines (one chunk = one line) but is less exact than edge or ElevenLabs.
- **Pacing:** every provider is tempo-fitted with ffmpeg toward 14.4 chars/s (Thai), as in every clip. The tempo is limited to 0.75x-1.5x, so a very slow voice may stay below the target. The run prints the real rate.
- Results are cached per line (provider + model + voice + text), so re-running costs nothing for unchanged lines. `--force` re-synthesizes (and re-bills).

## ElevenLabs

- **For:** the most natural voices; Thai works with the v3 model.
- **Get a key:** https://elevenlabs.io/app/settings/api-keys (sign in, create a key). Docs: https://elevenlabs.io/docs/api-reference/text-to-speech/convert
- **Env var:** `ELEVENLABS_API_KEY`
- **Voices/models:** default model `eleven_v3` (many languages incl. Thai), alternatives `eleven_multilingual_v2`, `eleven_flash_v2_5` (cheaper, faster; check its language list). Voice = a voice ID from your Voice Library (default is the premade "Rachel" `21m00Tcm4TlvDq8ikWAM`). Set with `CB_VOICE=<voice_id>`.
- **Endpoint used:** `/v1/text-to-speech/{voice_id}/with-timestamps` (character timestamps become per-character karaoke times).
- **Price:** billed per character against your plan's credits; check https://elevenlabs.io/pricing.
- **Test:** `CB_TTS=elevenlabs node "$CB" voice` on a project with one short line.
- **Common errors:** 401 = wrong key or missing "Text to Speech" permission on a restricted key; 422 = bad voice ID/model; 429 or quota = credits used up or too many parallel requests.

## OpenAI

- **For:** simple key, steerable style. Thai is understood but the voices are English-first and read Thai slowly (the tempo fit speeds them up).
- **Get a key:** https://platform.openai.com/api-keys (billing must be enabled). Docs: https://platform.openai.com/docs/guides/text-to-speech
- **Env var:** `OPENAI_API_KEY`
- **Voices/models:** default model `gpt-4o-mini-tts`; voices such as `coral` (default), `alloy`, `ash`, `ballad`, `echo`, `fable`, `nova`, `onyx`, `sage`, `shimmer`, `verse`, `marin`, `cedar`. Tone hint: `CB_TTS_INSTRUCTIONS="calm, clear narrator"`. Older models `tts-1` / `tts-1-hd` also work through `CB_TTS_MODEL`.
- **Price:** check https://openai.com/api/pricing.
- **Test:** `CB_TTS=openai node "$CB" voice`
- **Common errors:** 401 = wrong key; 429 = no credit or rate limit; 400 = voice name not valid for that model. OpenAI requires disclosing that the voice is AI-generated to listeners.

## Google Gemini

- **For:** natural multilingual voices including Thai; 30 prebuilt voices.
- **Get a key:** https://aistudio.google.com/apikey . Docs: https://ai.google.dev/gemini-api/docs/speech-generation
- **Env var:** `GEMINI_API_KEY`
- **Voices/models:** default model `gemini-3.8-flash-tts` (uses the Interactions API, `POST /v1beta/interactions`). Voices: `Kore` (default), `Puck`, `Leda`, `Aoede`, `Charon`, `Fenrir`, `Zephyr` and more (list in the docs). Language is detected from the text. Older `gemini-2.5-flash-preview-tts` is not supported by this code path.
- **Price:** free tier limits and paid rates change; check https://ai.google.dev/gemini-api/docs/pricing .
- **Test:** `CB_TTS=gemini node "$CB" voice`
- **Common errors:** 400 = unknown voice or model name; 403 = key not allowed for the API / region; 429 = free-tier quota used up; a model sometimes reads style words aloud, so keep the script plain.

## Cloudflare Workers AI

- **For:** people who already pay through Cloudflare. Uses the hosted `google/gemini-3.8-flash-tts` model (Thai and English) through one Cloudflare bill. (Cloudflare's own `@cf/myshell-ai/melotts` and Deepgram Aura voices do not cover Thai, so they are not used.)
- **Get keys:** Account ID: Cloudflare dashboard, right sidebar of your account home. API token: https://dash.cloudflare.com/profile/api-tokens (create a token with Workers AI permission). Docs: https://developers.cloudflare.com/workers-ai/
- **Env vars:** `CLOUDFLARE_ACCOUNT_ID` and `CLOUDFLARE_API_TOKEN` (both needed; `CLOUDFLARE_API_KEY` is accepted as an alias of `CLOUDFLARE_API_TOKEN`). The token must be an API token with Workers AI permission, not the old Global API Key.
- **Voices/models:** default `google/gemini-3.8-flash-tts`, voice `Kore` (same voice names as Gemini). Override with `CB_TTS_MODEL` and `CB_VOICE`.
- **Price:** shown on the model page at https://developers.cloudflare.com/workers-ai/models/ ; check it before long clips.
- **Test:** `CB_TTS=cloudflare node "$CB" voice`
- **Common errors:** 401/403 = wrong or too-narrow token; "model not found" = the model is not enabled for your account; billing not set up.

## English example lines

With edge-tts a caption can carry `voice: "en"` to read an English example sentence with an English voice. Paid providers are multilingual and read the whole clip with one voice; the `voice` field is ignored for them.

## Test any provider with one short line

1. Scaffold a project (`node "$CB" new try --blank`), shorten `captions.js` to one or two short sentences.
2. `CB_TTS=<provider> node "$CB" voice` and read the printed lines: provider, model, characters billed, rate, timing mode.
3. If it fails, the error shows the HTTP status and the first part of the provider's message (never the key).
<!-- genhaha:781c07c7ad6b -->
