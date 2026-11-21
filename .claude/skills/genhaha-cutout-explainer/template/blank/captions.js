// Script by shot. One chunk = one spoken line = one karaoke line; the SPOKEN Thai goes here (numbers as Thai words).
// Spaces inside a line are phrase breaks: a phrase is never cut across two subtitle rows, the spoken word lights up. Keep a line <= ~22 Thai characters (max 2 rows).
// Shots >= 3 s each (4-6 s is good): `cutout voice` speaks about 14.4 Thai characters per second, retimes the shots to the voice and measures the loudness the mouth follows.
// Per line: key (used by at("key") / atW("key","word") / hero.say("key")), t (shown + spoken), say (spoken text if different), pause (s of silence before), sfx ("boom" | "pop@w:word" | [..]; names: cutout sfx --list).
// "[word]" in t = accent colour in the subtitle (not spoken differently).
(function () {
  const SHOTS = [
    { id: "hook", start: 0, end: 6.0, chunks: [
      { t: "ตื่นเช้ามา ไฟดับ", key: "h1", emo: "worried", pause: 0.4 },
      { t: "แล้วมือถือ ก็ดับด้วย", key: "h2", emo: "shocked", pause: 0.3, sfx: "pop" },
    ]},
    { id: "next", start: 6.0, end: 12.0, chunks: [
      { t: "นี่แหละ ชีวิตไม่มีไฟฟ้า", key: "b1", emo: "playful", pause: 0.4 },
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
        out.push({ shot: shot.id, key: c.key, text: c.t, sub: c.sub, emo: c.emo, tag: c.tag, say: c.say, who: c.who, pose: c.pose, face: c.face, act: c.act, sfx: c.sfx, pause: c.pause, start: +t.toFixed(2), end: +(t + d).toFixed(2) });
        t += d;
      });
    }
    return out;
  }

  const CAPTIONS = timeCaptions(SHOTS);
  const tts = typeof window !== "undefined" && window.TTS_TIMING;
  if (tts && tts.chunks.length === CAPTIONS.length) CAPTIONS.forEach((c, i) => Object.assign(c, tts.chunks[i]));
  if (typeof module !== "undefined") module.exports = { SHOTS, CAPTIONS };
  else window.CAPTIONS = CAPTIONS;
})();
// genhaha:5f8f980bb7f3
