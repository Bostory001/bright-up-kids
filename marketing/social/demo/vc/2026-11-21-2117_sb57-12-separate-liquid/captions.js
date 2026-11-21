// Script by shot. One chunk = one spoken line (35-60 Thai characters, SPOKEN Thai, numbers as Thai words). Keys must be unique; scene.js points at them: "@key:word".
(function () {
  const SHOTS = [
    { id: "e1", start: 0.0, end: 4.2, chunks: [{ t: "ถ้าสารผสมเป็นของเหลวสองชนิดที่ไม่ละลายรวมกัน เช่นน้ำกับ[น้ำมัน]", key: "e1", sfx: "pop@w:น้ำมัน" }] },
    { id: "e2", start: 4.2, end: 8.4, chunks: [{ t: "เราแยกออกจากกันได้ ด้วยอุปกรณ์ที่เรียกว่า[กรวยแยก]", key: "e2", sfx: "pop@w:กรวยแยก" }] },
    { id: "e3", start: 8.4, end: 12.6, chunks: [{ t: "กรวยแยกรูปร่างคล้ายกรวย ปลายเรียวยาว และมี[ก๊อก]ให้ของเหลวผ่านไป", key: "e3", sfx: "pop@w:ก๊อก" }] },
    { id: "e4", start: 12.6, end: 16.8, chunks: [{ t: "น้ำมันเบากว่าน้ำ จึงลอยอยู่[ด้านบน] ส่วนน้ำอยู่ด้านล่าง", key: "e4", sfx: "pop@w:ด้านบน" }] },
    { id: "e5", start: 16.8, end: 21.0, chunks: [{ t: "เปิดก๊อกให้น้ำไหลออก พอถึงชั้นน้ำมันก็[ปิดก๊อก] แยกได้แล้ว", key: "e5", sfx: "pop@w:ปิดก๊อก" }] },
    { id: "e6", start: 21.0, end: 25.2, chunks: [{ t: "แต่ถ้าของแข็งละลายในน้ำไปแล้ว เช่น[น้ำทะเล] จะกรองไม่ได้", key: "e6", sfx: "pop@w:น้ำทะเล" }] },
    { id: "e7", start: 25.2, end: 29.4, chunks: [{ t: "วิธีที่สอง[การระเหยแห้ง] ต้มให้น้ำระเหยไป เหลือเกลือแกงเป็นของแข็ง", key: "e7", sfx: "pop@w:การระเหยแห้ง" }] },
    { id: "e8", start: 29.4, end: 33.6, chunks: [{ t: "ที่นาเกลือก็ตากน้ำทะเลกลางแดด ให้น้ำระเหย ก็จะได้[เกลือ]", key: "e8", sfx: "pop@w:เกลือ" }] },
    { id: "e9", start: 33.6, end: 37.8, chunks: [{ t: "วิธีที่สาม[การกลั่น] ใช้เมื่ออยากได้ตัวทำละลาย เช่น น้ำจืดจากน้ำทะเล", key: "e9", sfx: "pop@w:การกลั่น" }] },
    { id: "e10", start: 37.8, end: 42.0, chunks: [{ t: "ต้มจนน้ำกลายเป็นไอ แล้วทำให้ไอเย็นลง[ควบแน่น]เป็นน้ำจืดกลับมา", key: "e10", sfx: "pop@w:ควบแน่น" }] },
    { id: "e11", start: 42.0, end: 46.2, chunks: [{ t: "เกลือไม่ระเหยตามไปด้วย เพราะมี[จุดเดือด]สูงกว่าน้ำมาก", key: "e11", sfx: "pop@w:จุดเดือด" }] },
    { id: "e12", start: 46.2, end: 50.4, chunks: [{ t: "ถ้าติดเกาะกลางทะเล ไม่มีน้ำจืด ก็ใช้การ[กลั่น]ทำน้ำจืดจากน้ำทะเลได้", key: "e12", sfx: "pop@w:กลั่น" }] },
    { id: "e13", start: 50.4, end: 54.6, chunks: [{ t: "จำไว้ ของแข็งไม่ละลาย[ใช้กรอง] ละลายแล้ว[ใช้ระเหย]หรือ[กลั่น]", key: "e13", sfx: "ding@w:ใช้กรอง" }] },
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
