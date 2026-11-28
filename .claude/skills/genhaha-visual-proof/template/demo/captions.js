// Script by shot. One chunk = one spoken line; scene.js refers to a line by its key ("a2@0.5" = half-way through line a2, "a1+0.4" = 0.4 s after it starts).
// t = the subtitle ([word] = accent ink, ≤ 2 lines, digits and + = allowed) · say = the SPOKEN text when it differs (numbers as Thai words).
// start/end are estimates; `visual-proof voice` overwrites them with the voice timing (timing.js).
// Fact (maths, no source needed): 1 + 3 + 5 + 7 = 16 = 4², and the first n odd numbers add up to n² (each L-shaped ring of 2n − 1 dots turns an
// (n−1)×(n−1) square into an n×n square).
(function () {
  const SHOTS = [
    { id: "s1", start: 0, end: 4.2, chunks: [
      { t: "บวกเลขคี่ [1 + 3 + 5 + 7] ได้เท่าไหร่?", key: "h1", say: "บวกเลขคี่เรียงกัน หนึ่ง บวก สาม บวก ห้า บวก เจ็ด ได้เท่าไหร่" } ] },
    { id: "s2", start: 4.2, end: 8.4, chunks: [
      { t: "เลขคี่ห่างกันทีละ [2] เสมอ 1, 3, 5, 7", key: "n1", say: "เลขคี่ห่างกันทีละสองเสมอ หนึ่ง สาม ห้า เจ็ด" } ] },
    { id: "s3", start: 8.4, end: 13.6, chunks: [
      { t: "ลองวางเป็นจุด เริ่มจาก[จุดเดียว]", key: "a1" },
      { t: "แล้วเติม[รูปตัวแอล] 3 จุด 5 จุด 7 จุด", key: "a2", say: "แล้วเติมรูปตัวแอล สามจุด ห้าจุด เจ็ดจุด" } ] },
    { id: "s4", start: 13.6, end: 19.0, chunks: [
      { t: "ทุกครั้งที่เติม จะได้[สี่เหลี่ยมจัตุรัส]พอดี", key: "p1" },
      { t: "2 × 2 · 3 × 3 · 4 × 4", key: "p2", say: "สองคูณสอง สามคูณสาม สี่คูณสี่" } ] },
    { id: "s5", start: 19.0, end: 23.6, chunks: [
      { t: "เลขคี่สี่ตัวแรก รวมกันได้ [4 × 4 = 16]", key: "e1", say: "เลขคี่สี่ตัวแรก รวมกันได้ สี่คูณสี่ เท่ากับสิบหก" } ] },
    { id: "s6", start: 23.6, end: 27.6, chunks: [
      { t: "บวกเลขคี่ [n] ตัวแรก ได้ [n²] เสมอ", key: "q1", say: "บวกเลขคี่ เอ็น ตัวแรก ได้ เอ็นกำลังสอง เสมอ" } ] },
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
