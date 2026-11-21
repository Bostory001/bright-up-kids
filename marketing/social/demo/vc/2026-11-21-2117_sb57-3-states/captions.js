// Script by shot. One chunk = one spoken line (35-60 Thai characters, SPOKEN Thai, numbers as Thai words). Keys must be unique; scene.js points at them: "@key:word".
(function () {
  const SHOTS = [
    { id: "e1", start: 0.0, end: 4.2, chunks: [{ t: "สารรอบตัวเรามีสถานะ[สามแบบ] คือของแข็ง ของเหลว และแก๊ส", key: "e1", sfx: "pop@w:สามแบบ" }] },
    { id: "e2", start: 4.2, end: 8.4, chunks: [{ t: "สถานะของสาร ขึ้นอยู่กับว่า[อนุภาค]ในสารจัดเรียงตัวอย่างไร", key: "e2", sfx: "pop@w:อนุภาค" }] },
    { id: "e3", start: 8.4, end: 12.6, chunks: [{ t: "[ของแข็ง]มีรูปร่างและปริมาตรคงที่ เช่น เหล็ก ทองแดง น้ำแข็ง", key: "e3", sfx: "pop@w:ของแข็ง" }] },
    { id: "e4", start: 12.6, end: 16.8, chunks: [{ t: "เพราะอนุภาคอยู่ชิดกันมาก มีแรงยึดเหนี่ยวมาก ไม่เคลื่อนที่ แต่[สั่น]อยู่กับที่", key: "e4", sfx: "pop@w:สั่น" }] },
    { id: "e5", start: 16.8, end: 21.0, chunks: [{ t: "[ของเหลว]มีรูปร่างเปลี่ยนไปตามภาชนะ แต่ปริมาตรไม่เปลี่ยน", key: "e5", sfx: "pop@w:ของเหลว" }] },
    { id: "e6", start: 21.0, end: 25.2, chunks: [{ t: "เช่น น้ำ แอลกอฮอล์ น้ำมัน อนุภาคอยู่กันหลวม และ[เปลี่ยนตำแหน่ง]ได้", key: "e6", sfx: "pop@w:เปลี่ยนตำแหน่ง" }] },
    { id: "e7", start: 25.2, end: 29.4, chunks: [{ t: "[แก๊ส]ฟุ้งกระจาย รูปร่างและปริมาตรเปลี่ยนไปตามภาชนะที่บรรจุ", key: "e7", sfx: "pop@w:แก๊ส" }] },
    { id: "e8", start: 29.4, end: 33.6, chunks: [{ t: "เช่น ไอน้ำ แก๊สออกซิเจน แก๊สคาร์บอนไดออกไซด์ อนุภาคอยู่[ห่างกัน]มาก", key: "e8", sfx: "pop@w:ห่างกัน" }] },
    { id: "e9", start: 33.6, end: 37.8, chunks: [{ t: "แรงยึดเหนี่ยวระหว่างอนุภาคแก๊สน้อยมาก จนถือว่า[ไม่มี]แรงยึดเหนี่ยว", key: "e9", sfx: "pop@w:ไม่มี" }] },
    { id: "e10", start: 37.8, end: 42.0, chunks: [{ t: "อนุภาคแก๊สจึงเคลื่อนที่ไปมาได้[อย่างอิสระ] และรวดเร็ว", key: "e10", sfx: "pop@w:อย่างอิสระ" }] },
    { id: "e11", start: 42.0, end: 46.2, chunks: [{ t: "สรุปรูปร่าง ของแข็งคงที่ ของเหลวเปลี่ยนตามภาชนะ แก๊สก็เปลี่ยนตามภาชนะ", key: "e11", sfx: "pop@w:ของแข็งคงที่" }] },
    { id: "e12", start: 46.2, end: 50.4, chunks: [{ t: "ส่วนปริมาตร ของแข็งกับของเหลวคงที่ แต่[แก๊สเปลี่ยน]ไปตามภาชนะ", key: "e12", sfx: "pop@w:แก๊สเปลี่ยน" }] },
    { id: "e13", start: 50.4, end: 54.6, chunks: [{ t: "ที่ของแข็งกับของเหลวเหมือนกัน คือมี[ปริมาตรคงที่]", key: "e13", sfx: "pop@w:ปริมาตรคงที่" }] },
    { id: "e14", start: 54.6, end: 58.8, chunks: [{ t: "สารเปลี่ยนสถานะได้ด้วย[พลังงานความร้อน] ที่ทำให้อุณหภูมิเปลี่ยนไป", key: "e14", sfx: "ding@w:พลังงานความร้อน" }] },
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
