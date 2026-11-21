// Script by shot. One chunk = one spoken line (35-60 Thai characters, SPOKEN Thai, numbers as Thai words). Keys must be unique; scene.js points at them: "@key:word".
(function () {
  const SHOTS = [
    { id: "e1", start: 0.0, end: 4.2, chunks: [{ t: "ตอนไทยเป็นเวลาเช้า ที่อเมริกายังเป็น[กลางคืน] ทำไมนะ", key: "e1", sfx: "pop@w:กลางคืน" }] },
    { id: "e2", start: 4.2, end: 8.4, chunks: [{ t: "เพราะโลกกลมและหมุนไปเรื่อยๆ แต่ละที่จึงได้รับ[แสงอาทิตย์]ไม่พร้อมกัน", key: "e2", sfx: "pop@w:แสงอาทิตย์" }] },
    { id: "e3", start: 8.4, end: 12.6, chunks: [{ t: "เราจึงแบ่งโลกเป็น[ยี่สิบสี่เขตเวลา] เขตละหนึ่งชั่วโมง", key: "e3", sfx: "pop@w:ยี่สิบสี่" }] },
    { id: "e4", start: 12.6, end: 16.8, chunks: [{ t: "แต่ละเขตกว้างสิบห้าองศา สิบห้าคูณยี่สิบสี่ได้[สามร้อยหกสิบ]", key: "e4", sfx: "pop@w:สามร้อยหกสิบ" }] },
    { id: "e5", start: 16.8, end: 21.0, chunks: [{ t: "ไทยใช้เวลาตามเส้นลองจิจูดหนึ่งร้อยห้าองศา[ตะวันออก]", key: "e5", sfx: "pop@w:ตะวันออก" }] },
    { id: "e6", start: 21.0, end: 25.2, chunks: [{ t: "เวลาไทยจึงเร็วกว่าเวลาสากลที่กรีนิช[เจ็ดชั่วโมง]", key: "e6", sfx: "pop@w:เจ็ดชั่วโมง" }] },
    { id: "e7", start: 25.2, end: 29.4, chunks: [{ t: "ถ้ากรีนิชเป็นเที่ยงวัน ไทยก็เป็น[หนึ่งทุ่ม]แล้ว", key: "e7", sfx: "ding@w:หนึ่งทุ่ม" }] },
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
