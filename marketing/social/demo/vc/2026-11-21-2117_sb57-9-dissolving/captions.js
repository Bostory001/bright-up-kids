// Script by shot. One chunk = one spoken line (35-60 Thai characters, SPOKEN Thai, numbers as Thai words). Keys must be unique; scene.js points at them: "@key:word".
(function () {
  const SHOTS = [
    { id: "e1", start: 0.0, end: 4.2, chunks: [{ t: "บางอย่างละลายน้ำดี บางอย่างไม่ละลายเลย ขึ้นอยู่กับ[ปัจจัย]หลายอย่าง", key: "e1", sfx: "pop@w:ปัจจัย" }] },
    { id: "e2", start: 4.2, end: 8.4, chunks: [{ t: "ความสามารถในการละลาย ขึ้นอยู่กับชนิดของ[ตัวทำละลาย]และตัวละลาย", key: "e2", sfx: "pop@w:ตัวทำละลาย" }] },
    { id: "e3", start: 8.4, end: 12.6, chunks: [{ t: "เช่น เชลแล็กไม่ละลายในน้ำ แต่ละลายใน[เอทานอล]", key: "e3", sfx: "pop@w:เอทานอล" }] },
    { id: "e4", start: 12.6, end: 16.8, chunks: [{ t: "และเกลือแกงละลายในน้ำได้ดีกว่า[สารส้ม] สารต่างชนิดจึงละลายต่างกัน", key: "e4", sfx: "pop@w:สารส้ม" }] },
    { id: "e5", start: 16.8, end: 21.0, chunks: [{ t: "ปัจจัยแรก[อุณหภูมิ] ถ้าตัวละลายเป็นของแข็ง อุณหภูมิสูงจะละลายได้ดี", key: "e5", sfx: "pop@w:อุณหภูมิ" }] },
    { id: "e6", start: 21.0, end: 25.2, chunks: [{ t: "เพราะความร้อนทำให้อนุภาคสั่นเร็ว จึงช่วยให้ตัวละลาย[แตกตัว]ได้ดี", key: "e6", sfx: "pop@w:แตกตัว" }] },
    { id: "e7", start: 25.2, end: 29.4, chunks: [{ t: "แต่ถ้าตัวละลายเป็น[แก๊ส] เมื่ออุณหภูมิสูงขึ้น จะละลายได้น้อยลง", key: "e7", sfx: "pop@w:แก๊ส" }] },
    { id: "e8", start: 29.4, end: 33.6, chunks: [{ t: "ปัจจัยที่สอง[ชนิดของตัวทำละลาย] เช่น น้ำ แอลกอฮอล์ โพรพานอล", key: "e8", sfx: "pop@w:ชนิดของตัวทำละลาย" }] },
    { id: "e9", start: 33.6, end: 37.8, chunks: [{ t: "ปัจจัยที่สาม ขนาดของตัวละลาย[ก้อนเล็ก]ละลายเร็วกว่าก้อนใหญ่", key: "e9", sfx: "pop@w:ก้อนเล็ก" }] },
    { id: "e10", start: 37.8, end: 42.0, chunks: [{ t: "เพราะก้อนเล็กมี[พื้นที่ผิว]สัมผัสมาก จึงจับกับอนุภาคตัวทำละลายได้มากกว่า", key: "e10", sfx: "pop@w:พื้นที่ผิว" }] },
    { id: "e11", start: 42.0, end: 46.2, chunks: [{ t: "ปัจจัยที่สี่[ความดัน] ถ้าตัวละลายเป็นแก๊ส ความดันสูงจะละลายได้มากขึ้น", key: "e11", sfx: "pop@w:ความดัน" }] },
    { id: "e12", start: 46.2, end: 50.4, chunks: [{ t: "เช่น แก๊สคาร์บอนไดออกไซด์ละลายใน[น้ำอัดลม] ตอนผลิตจึงใช้ความดันสูง", key: "e12", sfx: "pop@w:น้ำอัดลม" }] },
    { id: "e13", start: 50.4, end: 54.6, chunks: [{ t: "ปัจจัยที่ห้า[การคน] และการเขย่า ทำให้อนุภาคชนกันถี่ขึ้น ละลายได้เร็ว", key: "e13", sfx: "pop@w:การคน" }] },
    { id: "e14", start: 54.6, end: 58.8, chunks: [{ t: "ลองคิดดู ชงกาแฟด้วย[น้ำร้อน]แล้วคน กับน้ำเย็นไม่คน แบบไหนละลายเร็วกว่า", key: "e14", sfx: "pop@w:น้ำร้อน" }] },
    { id: "e15", start: 58.8, end: 63.0, chunks: [{ t: "แบบน้ำร้อนแล้วคน ละลายเร็วกว่า เพราะใช้ถึง[สองปัจจัย]เลย", key: "e15", sfx: "ding@w:สองปัจจัย" }] },
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
