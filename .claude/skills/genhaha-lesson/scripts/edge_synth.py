#!/usr/bin/env python3
"""edge-tts batch synthesis with word timings (free Microsoft Edge read-aloud voices; no API key).

stdin: {"jobs": [{"voice": "th-TH-NiwatNeural", "text": "...", "rate": "+0%", "pitch": "+0Hz",
                  "mp3": "/path/line.mp3", "json": "/path/line.json"}], "concurrency": 4}
Each job writes the MP3 and a JSON list of WordBoundary events: [{"t": seconds, "d": seconds, "text": "word"}].
Prints one line per finished job. Needs: pip install edge-tts (>= 7: boundary="WordBoundary").
"""
import asyncio
import json
import sys

try:
    import edge_tts
except ImportError:  # the Node side catches this exit code and explains how to install
    sys.stderr.write("edge_tts module not found: pip install edge-tts\n")
    sys.exit(3)


async def one(job, sem):
    async with sem:
        last = None
        for attempt in range(4):
            try:
                kw = dict(rate=job.get("rate") or "+0%", pitch=job.get("pitch") or "+0Hz")
                try:
                    com = edge_tts.Communicate(job["text"], job["voice"], boundary="WordBoundary", **kw)
                except TypeError:  # edge-tts < 7 always sent WordBoundary
                    com = edge_tts.Communicate(job["text"], job["voice"], **kw)
                words, n = [], 0
                with open(job["mp3"], "wb") as f:
                    async for ch in com.stream():
                        if ch["type"] == "audio":
                            f.write(ch["data"])
                            n += len(ch["data"])
                        elif ch["type"] == "WordBoundary":
                            words.append({"t": ch["offset"] / 1e7, "d": ch["duration"] / 1e7, "text": ch["text"]})
                if n == 0:
                    raise RuntimeError("no audio received")
                with open(job["json"], "w", encoding="utf-8") as f:
                    json.dump(words, f, ensure_ascii=False)
                print(json.dumps({"ok": job["mp3"], "words": len(words)}), flush=True)
                return
            except Exception as e:  # network hiccups: retry with a short back-off
                last = e
                await asyncio.sleep(1.5 * (attempt + 1))
        raise RuntimeError(f"edge-tts failed for {job['voice']}: {last}")


async def main():
    req = json.load(sys.stdin)
    sem = asyncio.Semaphore(int(req.get("concurrency", 4)))
    await asyncio.gather(*(one(j, sem) for j in req["jobs"]))


if __name__ == "__main__":
    if len(sys.argv) > 1 and sys.argv[1] == "--list":
        async def lst():
            vs = await edge_tts.list_voices()
            loc = sys.argv[2] if len(sys.argv) > 2 else ""
            for v in vs:
                if v["Locale"].lower().startswith(loc.lower()):
                    print(f'{v["ShortName"]:32} {v["Gender"]:7} {v["Locale"]}')
        asyncio.run(lst())
    else:
        asyncio.run(main())
