// Script by shot. One chunk = one spoken line (35-60 Thai characters, SPOKEN Thai, numbers as Thai words). Keys must be unique; scene.js points at them: "@key:word".
(function () {
  const SHOTS = [
    { id: "e1", start: 0.0, end: 4.2, chunks: [{ t: "ดาวที่เรามองเห็นบนฟ้ามีสองแบบ คือ[ดาวฤกษ์]กับดาวเคราะห์", key: "e1", sfx: "pop@w:ดาวฤกษ์" }] },
    { id: "e2", start: 4.2, end: 8.4, chunks: [{ t: "ดาวฤกษ์มี[แสงในตัวเอง] เหมือนดวงอาทิตย์เลย", key: "e2", sfx: "pop@w:แสงในตัวเอง" }] },
    { id: "e3", start: 8.4, end: 12.6, chunks: [{ t: "ดาวเคราะห์ที่เห็นด้วยตาเปล่ามี[ห้าดวง] พุธ ศุกร์ อังคาร พฤหัส เสาร์", key: "e3", sfx: "pop@w:ห้าดวง" }] },
    { id: "e4", start: 12.6, end: 16.8, chunks: [{ t: "ดาวฤกษ์หลายดวงรวมกันเป็น[กลุ่มดาว] รูปร่างเหมือนเดิมทุกคืน", key: "e4", sfx: "pop@w:กลุ่มดาว" }] },
    { id: "e5", start: 16.8, end: 21.0, chunks: [{ t: "เราจึงใช้กลุ่มดาวบอกทิศได้ กลุ่มดาวขึ้นทาง[ตะวันออก] ตกทางตะวันตก", key: "e5", sfx: "pop@w:ตะวันออก" }] },
    { id: "e6", start: 21.0, end: 25.2, chunks: [{ t: "เพราะโลกหมุนไปทางตะวันออก ดาวเลยดูเหมือนเคลื่อนไปทาง[ตะวันตก]", key: "e6", sfx: "ding@w:ตะวันตก" }] },
  ];
  function timeCaptions(shots) {
    const out = [];
    for (const shot of shots) {
      const weights = shot.chunks.map((c) => c.t.replace(/[\[\]\s]/g, "").length + 6);
      const total = weights.reduce((a, b) => a + b, 0);
      let t = shot.start;
      shot.chunks.forEach((c, i) => {
        const d = ((shot.end - shot.start) * weights[i]) / total;
        out.push({ shot: shot.id, key: c.key, text: c.t, cap: c.cap, en: c.en, hi: c.hi, emo: c.emo, say: c.say, sfx: c.sfx, pause: c.pause, start: +t.toFixed(2), end: +(t + d).toFixed(2) });
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
// genhaha:4846ca29f0d0
