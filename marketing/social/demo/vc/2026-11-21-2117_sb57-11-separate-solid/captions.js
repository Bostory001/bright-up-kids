// Script by shot. One chunk = one spoken line (35-60 Thai characters, SPOKEN Thai, numbers as Thai words). Keys must be unique; scene.js points at them: "@key:word".
(function () {
  const SHOTS = [
    { id: "e1", start: 0.0, end: 4.2, chunks: [{ t: "สารรอบตัวมักเป็นสารผสม เช่น ข้าวที่ปนเปลือก จึงต้อง[แยกสาร]", key: "e1", sfx: "pop@w:แยกสาร" }] },
    { id: "e2", start: 4.2, end: 8.4, chunks: [{ t: "การแยกสารทำได้ เพราะสมบัติทางกายภาพของสาร เช่น สี ขนาด และ[สถานะ]ต่างกัน", key: "e2", sfx: "pop@w:สถานะ" }] },
    { id: "e3", start: 8.4, end: 12.6, chunks: [{ t: "วันนี้ดูของแข็งที่ปนอยู่ในสารผสม มี[หกวิธี]", key: "e3", sfx: "pop@w:หกวิธี" }] },
    { id: "e4", start: 12.6, end: 16.8, chunks: [{ t: "วิธีที่หนึ่ง[การหยิบออก] ใช้กับของแข็งก้อนใหญ่ ที่ต่างกันชัดเจน", key: "e4", sfx: "pop@w:การหยิบออก" }] },
    { id: "e5", start: 16.8, end: 21.0, chunks: [{ t: "เช่น หยิบถั่วที่ต้องการออกจากถั่วผสม หรือหยิบ[ลูกบอล]สีส้มออกจากกอง", key: "e5", sfx: "pop@w:ลูกบอล" }] },
    { id: "e6", start: 21.0, end: 25.2, chunks: [{ t: "วิธีที่สอง[การร่อน] ใช้เมื่อของแข็งมีขนาดต่างกัน แต่หยิบยาก", key: "e6", sfx: "pop@w:การร่อน" }] },
    { id: "e7", start: 25.2, end: 29.4, chunks: [{ t: "ใช้ตะแกรงร่อน เช่น ร่อนหินกับทราย หรือร่อน[แป้ง]ทำขนม", key: "e7", sfx: "pop@w:แป้ง" }] },
    { id: "e8", start: 29.4, end: 33.6, chunks: [{ t: "แป้งที่ผ่านตะแกรงร่อน จะ[ละเอียด]สม่ำเสมอ ทำขนมได้เนื้อดี", key: "e8", sfx: "pop@w:ละเอียด" }] },
    { id: "e9", start: 33.6, end: 37.8, chunks: [{ t: "วิธีที่สาม[ใช้แม่เหล็กดูด] ใช้เมื่อมีสารหนึ่งที่แม่เหล็กดูดได้", key: "e9", sfx: "pop@w:ใช้แม่เหล็กดูด" }] },
    { id: "e10", start: 37.8, end: 42.0, chunks: [{ t: "เช่น เหล็ก นิกเกิล โคบอลต์ อย่างแยก[ผงตะไบเหล็ก]ออกจากผงกำมะถัน", key: "e10", sfx: "pop@w:ผงตะไบเหล็ก" }] },
    { id: "e11", start: 42.0, end: 46.2, chunks: [{ t: "วิธีที่สี่[การระเหิด] ใช้กับของแข็งที่เปลี่ยนเป็นแก๊สโดยไม่เป็นของเหลว", key: "e11", sfx: "pop@w:การระเหิด" }] },
    { id: "e12", start: 46.2, end: 50.4, chunks: [{ t: "เช่น แยกผงการบูรออกจากเกลือแกง โดยให้ความร้อน ให้[การบูร]กลายเป็นไอ", key: "e12", sfx: "pop@w:การบูร" }] },
    { id: "e13", start: 50.4, end: 54.6, chunks: [{ t: "แล้วดักไอด้วย[ภาชนะเย็น] ก็จะได้การบูรเป็นของแข็งแยกออกมา", key: "e13", sfx: "pop@w:ภาชนะเย็น" }] },
    { id: "e14", start: 54.6, end: 58.8, chunks: [{ t: "วิธีที่ห้า[การกรอง] ใช้กับของแข็งที่ไม่ละลายในของเหลว", key: "e14", sfx: "pop@w:การกรอง" }] },
    { id: "e15", start: 58.8, end: 63.0, chunks: [{ t: "รินสารผ่านกระดาษกรอง ของเหลวไหลผ่าน ส่วนของแข็งจะ[ติดอยู่]บนกระดาษกรอง", key: "e15", sfx: "pop@w:ติดอยู่" }] },
    { id: "e16", start: 63.0, end: 67.2, chunks: [{ t: "ในชีวิตเรากรองน้ำกะทิด้วย[กระชอน] และกรองกากกาแฟ", key: "e16", sfx: "pop@w:กระชอน" }] },
    { id: "e17", start: 67.2, end: 71.4, chunks: [{ t: "วิธีที่หก[การตกตะกอน] ใช้เมื่อของแข็งแขวนลอยในของเหลว เช่น น้ำคลอง", key: "e17", sfx: "pop@w:การตกตะกอน" }] },
    { id: "e18", start: 71.4, end: 75.6, chunks: [{ t: "ตั้งทิ้งไว้ตะกอนจะจมลงก้นภาชนะ เร็วขึ้นได้ด้วย[สารส้ม] ทำให้น้ำใส", key: "e18", sfx: "pop@w:สารส้ม" }] },
    { id: "e19", start: 75.6, end: 79.8, chunks: [{ t: "สรุป หยิบ ร่อน แม่เหล็ก ระเหิด กรอง และ[ตกตะกอน] คือหกวิธีแยกของแข็ง", key: "e19", sfx: "ding@w:ตกตะกอน" }] },
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
