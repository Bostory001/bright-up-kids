// Script by shot. One chunk = one spoken line (35-60 Thai characters, SPOKEN Thai, numbers as Thai words). Keys must be unique; scene.js points at them: "@key:word".
(function () {
  const SHOTS = [
    { id: "e1", start: 0.0, end: 4.2, chunks: [{ t: "ธาตุทุกชนิดในโลก แบ่งตามสมบัติได้เป็น[สามกลุ่ม]", key: "e1", sfx: "pop@w:สามกลุ่ม" }] },
    { id: "e2", start: 4.2, end: 8.4, chunks: [{ t: "คือธาตุโลหะ ธาตุอโลหะ และ[ธาตุกึ่งโลหะ]", key: "e2", sfx: "pop@w:ธาตุโลหะ" }] },
    { id: "e3", start: 8.4, end: 12.6, chunks: [{ t: "ธาตุโลหะ ส่วนใหญ่เป็นของแข็ง ยกเว้น[ปรอท]ที่เป็นของเหลว", key: "e3", sfx: "pop@w:ปรอท" }] },
    { id: "e4", start: 12.6, end: 16.8, chunks: [{ t: "ผิว[มันวาว] นำความร้อนและไฟฟ้าได้ดี จุดเดือดและจุดหลอมเหลวสูง", key: "e4", sfx: "pop@w:มันวาว" }] },
    { id: "e5", start: 16.8, end: 21.0, chunks: [{ t: "ตัวอย่างโลหะ เช่น โซเดียม เหล็ก แคลเซียม ปรอท และ[อะลูมิเนียม]", key: "e5", sfx: "pop@w:อะลูมิเนียม" }] },
    { id: "e6", start: 21.0, end: 25.2, chunks: [{ t: "ธาตุอโลหะ มีสมบัติ[ตรงข้าม] คือไม่นำไฟฟ้า", key: "e6", sfx: "pop@w:ไม่นำไฟฟ้า" }] },
    { id: "e7", start: 25.2, end: 29.4, chunks: [{ t: "จุดเดือดและจุดหลอมเหลวต่ำ เปราะบาง และเปลี่ยนสมบัติทางกายภาพได้[มากกว่า]โลหะ", key: "e7", sfx: "pop@w:เปราะบาง" }] },
    { id: "e8", start: 29.4, end: 33.6, chunks: [{ t: "เช่น ออกซิเจนซึ่งเป็นแก๊ส กำมะถัน และ[ฟอสฟอรัส]ที่เป็นของแข็ง", key: "e8", sfx: "pop@w:ฟอสฟอรัส" }] },
    { id: "e9", start: 33.6, end: 37.8, chunks: [{ t: "ธาตุกึ่งโลหะ มีสมบัติ[กึ่งกลาง] ระหว่างโลหะกับอโลหะ", key: "e9", sfx: "pop@w:กึ่งกลาง" }] },
    { id: "e10", start: 37.8, end: 42.0, chunks: [{ t: "เช่น ซิลิคอน และเจอร์เมเนียม นำไฟฟ้า[ได้บ้าง] ที่อุณหภูมิปกติ", key: "e10", sfx: "pop@w:ได้บ้าง" }] },
    { id: "e11", start: 42.0, end: 46.2, chunks: [{ t: "และนำไฟฟ้าได้มากขึ้น เมื่อ[อุณหภูมิ]สูงขึ้น", key: "e11", sfx: "pop@w:อุณหภูมิ" }] },
    { id: "e12", start: 46.2, end: 50.4, chunks: [{ t: "เป็นของแข็ง ผิวมันวาวสีเงิน จุดเดือดสูง แต่[เปราะ]แตกง่ายคล้ายอโลหะ", key: "e12", sfx: "pop@w:เปราะ" }] },
    { id: "e13", start: 50.4, end: 54.6, chunks: [{ t: "ลองทายดูสิ ว่าซิลิคอนเป็นธาตุกลุ่มไหน ตอบว่า[กึ่งโลหะ]", key: "e13", sfx: "ding@w:กึ่งโลหะ" }] },
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
