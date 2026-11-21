// Script by shot. One chunk = one spoken line (35-60 Thai characters, SPOKEN Thai, numbers as Thai words). Keys must be unique; scene.js points at them: "@key:word".
(function () {
  const SHOTS = [
    { id: "e1", start: 0.0, end: 4.2, chunks: [{ t: "ลองจินตนาการว่า เรายืนกลางทุ่งโล่ง มองเห็นท้องฟ้าเป็น[โดม]ครึ่งวงกลม", key: "e1", sfx: "pop@w:โดม" }] },
    { id: "e2", start: 4.2, end: 8.4, chunks: [{ t: "เราคือ[ศูนย์กลาง] ของทรงกลมฟ้า ที่ใช้บอกตำแหน่งของดวงดาว", key: "e2", sfx: "pop@w:ศูนย์กลาง" }] },
    { id: "e3", start: 8.4, end: 12.6, chunks: [{ t: "[ทิศทั้งสี่] คือ เหนือ ใต้ ตะวันออก ตะวันตก ล้อมรอบตัวเรา", key: "e3", sfx: "pop@w:ทิศทั้งสี่" }] },
    { id: "e4", start: 12.6, end: 16.8, chunks: [{ t: "หันหน้าไปทางเหนือ หลังคือใต้ ซ้ายมือตะวันตก ขวามือ[ตะวันออก]", key: "e4", sfx: "pop@w:หลัง" }] },
    { id: "e5", start: 16.8, end: 21.0, chunks: [{ t: "จุดเหนือศีรษะ คือจุดสูงสุดบนฟ้า อยู่เหนือ[หัวเรา]พอดี", key: "e5", sfx: "pop@w:จุดเหนือศีรษะ" }] },
    { id: "e6", start: 21.0, end: 25.2, chunks: [{ t: "ส่วนจุดใต้เท้า เป็นจุดต่ำสุด อยู่ใต้[เท้า]เรา", key: "e6", sfx: "pop@w:จุดใต้เท้า" }] },
    { id: "e7", start: 25.2, end: 29.4, chunks: [{ t: "เส้นขอบฟ้า คือแนวที่ฟ้ามาบรรจบพื้น มองเห็นเป็น[วงกลม]รอบตัว", key: "e7", sfx: "pop@w:เส้นขอบฟ้า" }] },
    { id: "e8", start: 29.4, end: 33.6, chunks: [{ t: "เส้นเมอริเดียน ลากจากเหนือไปใต้ ผ่านจุด[เหนือศีรษะ]พอดี", key: "e8", sfx: "pop@w:เส้นเมอริเดียน" }] },
    { id: "e9", start: 33.6, end: 37.8, chunks: [{ t: "ตอน[เที่ยงวัน] ดวงอาทิตย์จะเคลื่อนมาถึงเส้นเมอริเดียนพอดี", key: "e9", sfx: "pop@w:เที่ยงวัน" }] },
    { id: "e10", start: 37.8, end: 42.0, chunks: [{ t: "สรุป สี่ทิศ สองจุด และ[สองเส้น] ที่ใช้บอกตำแหน่งบนฟ้า", key: "e10", sfx: "ding@w:สี่ทิศ" }] },
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
