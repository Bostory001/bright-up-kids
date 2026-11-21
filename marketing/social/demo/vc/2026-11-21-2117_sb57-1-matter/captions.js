// Script by shot. One chunk = one spoken line (35-60 Thai characters, SPOKEN Thai, numbers as Thai words). Keys must be unique; scene.js points at them: "@key:word".
(function () {
  const SHOTS = [
    { id: "e1", start: 0.0, end: 4.2, chunks: [{ t: "ทุกสิ่งรอบตัวเรา ทั้งน้ำ ทั้งดิน ทั้งอากาศ ล้วนเรียกว่า[สาร]", key: "e1", sfx: "pop@w:สาร" }] },
    { id: "e2", start: 4.2, end: 8.4, chunks: [{ t: "สารในภาษาอังกฤษ คือคำว่า[แมทเทอร์] หมายถึงสิ่งที่มีมวล", key: "e2", sfx: "pop@w:แมทเทอร์" }] },
    { id: "e3", start: 8.4, end: 12.6, chunks: [{ t: "สารต้องมี[มวล] คือมีเนื้อสาร มีน้ำหนัก ไม่ใช่ที่ว่างเปล่า", key: "e3", sfx: "pop@w:มวล" }] },
    { id: "e4", start: 12.6, end: 16.8, chunks: [{ t: "สารต้องการ[ที่อยู่] เหมือนน้ำที่ต้องมีแก้วใส่ ลมที่ต้องมีลูกโป่ง", key: "e4", sfx: "pop@w:ที่อยู่" }] },
    { id: "e5", start: 16.8, end: 21.0, chunks: [{ t: "สารสัมผัสได้ด้วยประสาทสัมผัสทั้ง[ห้า] คือ ตา หู จมูก ลิ้น กาย", key: "e5", sfx: "pop@w:ห้า" }] },
    { id: "e6", start: 21.0, end: 25.2, chunks: [{ t: "สารบางอย่างมองเห็นได้ เช่น หิน ดิน น้ำ แต่บางอย่าง[มองไม่เห็น]", key: "e6", sfx: "pop@w:มองไม่เห็น" }] },
    { id: "e7", start: 25.2, end: 29.4, chunks: [{ t: "เช่น[อากาศ] เรามองไม่เห็น แต่ลมพัดแล้วรู้สึกได้ มันจึงเป็นสาร", key: "e7", sfx: "pop@w:อากาศ" }] },
    { id: "e8", start: 29.4, end: 33.6, chunks: [{ t: "ส่วนแสงกับเสียง[ไม่ใช่สาร] เพราะไม่มีมวล และไม่ต้องการที่อยู่", key: "e8", sfx: "pop@w:ไม่ใช่สาร" }] },
    { id: "e9", start: 33.6, end: 37.8, chunks: [{ t: "ส่วนเนื้อแท้ของสารอีกแบบ เรียกว่า[ซับสแตนซ์] ก็แปลว่าสารเหมือนกัน", key: "e9", sfx: "pop@w:ซับสแตนซ์" }] },
    { id: "e10", start: 37.8, end: 42.0, chunks: [{ t: "ซับสแตนซ์คือสิ่งที่มีมวล มีรูปร่าง มี[ปริมาตร] และเปลี่ยนแปลงได้", key: "e10", sfx: "pop@w:ปริมาตร" }] },
    { id: "e11", start: 42.0, end: 46.2, chunks: [{ t: "สารบางอย่างเกิดเองตามธรรมชาติ บางอย่างถูกดัดแปลง และบางอย่าง[สังเคราะห์]ขึ้นใหม่", key: "e11", sfx: "pop@w:ธรรมชาติ" }] },
    { id: "e12", start: 46.2, end: 50.4, chunks: [{ t: "ที่เจอบ่อยในชีวิต เช่น น้ำ เงิน ทองคำ เหล็ก น้ำมัน เกลือแกง และ[คอนกรีต]", key: "e12", sfx: "pop@w:คอนกรีต" }] },
    { id: "e13", start: 50.4, end: 54.6, chunks: [{ t: "ต่อไปมาดู[สมบัติของสาร] คือลักษณะเฉพาะ ที่บอกว่าสารนั้นคืออะไร", key: "e13", sfx: "pop@w:สมบัติของสาร" }] },
    { id: "e14", start: 54.6, end: 58.8, chunks: [{ t: "ที่สังเกตได้ง่าย เช่น สี กลิ่น รส และสถานะ ส่วนบางอย่างต้อง[ใช้เครื่องมือ]", key: "e14", sfx: "pop@w:สี" }] },
    { id: "e15", start: 58.8, end: 63.0, chunks: [{ t: "เช่น น้ำเป็นของเหลวใส ไม่มีสี ไม่มีกลิ่น เดือดที่[หนึ่งร้อย]องศาเซลเซียส", key: "e15", sfx: "pop@w:หนึ่งร้อย" }] },
    { id: "e16", start: 63.0, end: 67.2, chunks: [{ t: "ส่วนเอทานอล ไม่มีสีเหมือนกัน แต่มี[กลิ่นฉุน] และเดือดที่เจ็ดสิบแปดจุดห้าองศา", key: "e16", sfx: "pop@w:กลิ่นฉุน" }] },
    { id: "e17", start: 67.2, end: 71.4, chunks: [{ t: "สมบัติเฉพาะตัวแบบนี้ ช่วยให้เรา[แยกแยะ]ได้ว่า สารไหนเป็นสารไหน", key: "e17", sfx: "ding@w:แยกแยะ" }] },
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
