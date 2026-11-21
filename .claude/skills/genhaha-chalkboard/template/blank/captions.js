// Script by shot. One chunk = one subtitle = one voice line of the teacher (a shot = one board idea, 3–9 s, 1–3 chunks).
//   t     subtitle text = what is spoken: numbers as Thai WORDS here, the board shows the digits; [brackets] = accent words (yellow)
//   key   unique id, used in index.html: T.say("h1") (teacher's mouth), at("h1") line start, end("h1"), atW("h1", "word") when a word is spoken
//   say   (optional) what the voice reads if it differs from t     sfx  (optional) "pop@w:<word>" | "ding@0.4" | ["a", "b@w:…"]
//   pause (optional) extra silence before the line, seconds
// One narrator (the teacher): no `who` needed. `voice` rewrites every start/end from the real voice; the numbers below are only placeholders.
(function () {
  const SHOTS = [
    { id: "hook", start: 0, end: 5.0, chunks: [
      { t: "หนึ่งบวกสองบวกสาม ได้เท่าไหร่นะ ลองคิดในใจดูก่อน", key: "h1" },
    ]},
    { id: "body", start: 5.0, end: 10.0, chunks: [
      { t: "คำตอบคือ[หก] ง่ายกว่าที่คิดใช่ไหม", key: "b1", sfx: "ding@w:หก" },
    ]},
  ];

  function timeCaptions(shots) {
    const out = [];
    for (const shot of shots) {
      const weights = shot.chunks.map((c) => c.t.replace(/[\[\]\s]/g, "").length + 6);
      const total = weights.reduce((a, b) => a + b, 0);
      let t = shot.start;
      shot.chunks.forEach((c, i) => {
        const d = ((shot.end - shot.start) * weights[i]) / total;
        out.push({ shot: shot.id, key: c.key, text: c.t, say: c.say, who: c.who, voice: c.voice, sfx: c.sfx, pause: c.pause, start: +t.toFixed(2), end: +(t + d).toFixed(2) });
        t += d;
      });
    }
    return out;
  }

  const CAPTIONS = timeCaptions(SHOTS);
  const tts = typeof window !== "undefined" && window.TTS_TIMING;
  if (tts && tts.chunks && tts.chunks.length === CAPTIONS.length) CAPTIONS.forEach((c, i) => Object.assign(c, tts.chunks[i]));
  if (typeof module !== "undefined") module.exports = { SHOTS, CAPTIONS };
  else window.CAPTIONS = CAPTIONS;
})();
// genhaha:781c07c7ad6b
