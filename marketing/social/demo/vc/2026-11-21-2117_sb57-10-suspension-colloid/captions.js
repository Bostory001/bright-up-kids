// Script by shot. One chunk = one spoken line (35-60 Thai characters, SPOKEN Thai, numbers as Thai words). Keys must be unique; scene.js points at them: "@key:word".
(function () {
  const SHOTS = [
    { id: "e1", start: 0.0, end: 4.2, chunks: [{ t: "นอกจากสารละลาย สารผสมยังมีอีกสองชนิด คือ[สารแขวนลอย]กับคอลลอยด์", key: "e1", sfx: "pop@w:สารแขวนลอย" }] },
    { id: "e2", start: 4.2, end: 8.4, chunks: [{ t: "สารผสมสองกลุ่มนี้ เนื้อสารเห็นชัดว่า[ไม่ผสมเป็นเนื้อเดียวกัน]", key: "e2", sfx: "pop@w:ไม่ผสมเป็นเนื้อเดียวกัน" }] },
    { id: "e3", start: 8.4, end: 12.6, chunks: [{ t: "[สารแขวนลอย]มีอนุภาคใหญ่กว่าหนึ่งในหมื่นเซนติเมตร ลอยกระจายอยู่ในสารอื่น", key: "e3", sfx: "pop@w:สารแขวนลอย" }] },
    { id: "e4", start: 12.6, end: 16.8, chunks: [{ t: "มองด้วยตาเปล่าจะ[ขุ่น] และตั้งทิ้งไว้ อนุภาคจะตกตะกอน", key: "e4", sfx: "pop@w:ขุ่น" }] },
    { id: "e5", start: 16.8, end: 21.0, chunks: [{ t: "ผ่านกระดาษกรองไม่ได้ ผ่านเซลโลเฟนไม่ได้ เช่น[น้ำแป้ง] น้ำโคลน", key: "e5", sfx: "pop@w:น้ำแป้ง" }] },
    { id: "e6", start: 21.0, end: 25.2, chunks: [{ t: "[คอลลอยด์]มีอนุภาคเล็กกว่าสารแขวนลอย แต่ใหญ่กว่าสารละลาย", key: "e6", sfx: "pop@w:คอลลอยด์" }] },
    { id: "e7", start: 25.2, end: 29.4, chunks: [{ t: "จึงดูเหมือนเป็น[เนื้อเดียวกัน] เพราะอนุภาคเล็กมาก ลอยกระจายอยู่ในสารอื่น", key: "e7", sfx: "pop@w:เนื้อเดียวกัน" }] },
    { id: "e8", start: 29.4, end: 33.6, chunks: [{ t: "คอลลอยด์ผ่าน[กระดาษกรอง]ได้ แต่ผ่านกระดาษเซลโลเฟนไม่ได้", key: "e8", sfx: "pop@w:กระดาษกรอง" }] },
    { id: "e9", start: 33.6, end: 37.8, chunks: [{ t: "ตัวอย่างคอลลอยด์ เช่น[หมอก]ตอนเช้า และน้ำสลัด", key: "e9", sfx: "pop@w:หมอก" }] },
    { id: "e10", start: 37.8, end: 42.0, chunks: [{ t: "เทียบกัน[สารแขวนลอย]ใหญ่สุด คอลลอยด์ขนาดกลาง สารละลายเล็กสุด", key: "e10", sfx: "pop@w:สารแขวนลอย" }] },
    { id: "e11", start: 42.0, end: 46.2, chunks: [{ t: "ทายสิ ระหว่างน้ำโคลนกับน้ำสลัด อย่างไหนเป็น[สารแขวนลอย]", key: "e11", sfx: "pop@w:สารแขวนลอย" }] },
    { id: "e12", start: 46.2, end: 50.4, chunks: [{ t: "ตอบ[น้ำโคลน] เพราะตั้งทิ้งไว้แล้วตกตะกอน ส่วนน้ำสลัดเป็นคอลลอยด์", key: "e12", sfx: "ding@w:น้ำโคลน" }] },
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
