// Script by shot. One chunk = one spoken line; scene.js refers to a line by its key ("k1@0.5" = half-way through line k1, "k1+0.4" = 0.4 s after it starts).
// t = the subtitle ([word] = accent ink, ≤ 2 lines, digits and + = allowed) · say = the SPOKEN text when it differs (numbers as Thai words). sfx: "pop@0.5" (visual-proof sfx --list).
// start/end are estimates; `visual-proof voice` overwrites them with the voice timing (timing.js).
(function () {
  const SHOTS = [
    { id: "s1", start: 0, end: 5, chunks: [
      { t: "สี่เหลี่ยมกว้าง 4 สูง 3 มี [12 ช่อง]", key: "k1", say: "สี่เหลี่ยมกว้างสี่ สูงสาม มีสิบสองช่อง" } ] },
    { id: "s2", start: 5, end: 9.5, chunks: [
      { t: "พื้นที่คือ[กว้างคูณยาว]เสมอ", key: "k2" } ] },
  ];

  function timeCaptions(shots) {
    const out = [];
    for (const shot of shots) {
      const weights = shot.chunks.map((c) => (c.say || c.t).replace(/[\[\]\s]/g, "").length + 6);
      const total = weights.reduce((a, b) => a + b, 0);
      let t = shot.start;
      shot.chunks.forEach((c, i) => {
        const d = ((shot.end - shot.start) * weights[i]) / total;
        out.push({ shot: shot.id, key: c.key, text: c.t, cap: c.cap, say: c.say, emo: c.emo, sfx: c.sfx, pause: c.pause, start: +t.toFixed(2), end: +(t + d).toFixed(2) });
        t += d;
      });
    }
    return out;
  }

  const CAPTIONS = timeCaptions(SHOTS);
  const tts = typeof window !== "undefined" && window.TTS_TIMING;
  if (tts && tts.chunks.length === CAPTIONS.length) CAPTIONS.forEach((c, i) => Object.assign(c, tts.chunks[i]));
  if (typeof module !== "undefined" && module.exports) module.exports = { SHOTS, CAPTIONS };
  if (typeof window !== "undefined") window.CAPTIONS = CAPTIONS;
})();
// genhaha:ed4a029a9d2b
