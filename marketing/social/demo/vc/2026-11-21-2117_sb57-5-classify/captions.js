// Script by shot. One chunk = one spoken line (35-60 Thai characters, SPOKEN Thai, numbers as Thai words). Keys must be unique; scene.js points at them: "@key:word".
(function () {
  const SHOTS = [
    { id: "e1", start: 0.0, end: 4.2, chunks: [{ t: "โลกมีสารมากกว่าสองล้านชนิด นักวิทยาศาสตร์จึงต้อง[จำแนก]เป็นหมวดหมู่", key: "e1", sfx: "pop@w:จำแนก" }] },
    { id: "e2", start: 4.2, end: 8.4, chunks: [{ t: "ใช้เกณฑ์ได้หลายอย่าง เช่น การนำไฟฟ้า สถานะ องค์ประกอบ และ[การละลาย]", key: "e2", sfx: "pop@w:การละลาย" }] },
    { id: "e3", start: 8.4, end: 12.6, chunks: [{ t: "แต่เกณฑ์ที่ใช้กันทั่วไป คือดู[ลักษณะเนื้อสาร] แล้วแบ่งเป็นสองกลุ่ม", key: "e3", sfx: "pop@w:ลักษณะเนื้อสาร" }] },
    { id: "e4", start: 12.6, end: 16.8, chunks: [{ t: "กลุ่มแรกคือ[สารเนื้อเดียว] กลุ่มที่สองคือสารเนื้อผสม", key: "e4", sfx: "pop@w:สารเนื้อเดียว" }] },
    { id: "e5", start: 16.8, end: 21.0, chunks: [{ t: "สารเนื้อเดียว ไม่มีสารอื่นเจือปน ลักษณะ[เหมือนกัน]ตลอดทั้งก้อน", key: "e5", sfx: "pop@w:เหมือนกัน" }] },
    { id: "e6", start: 21.0, end: 25.2, chunks: [{ t: "เช่น น้ำเกลือ น้ำกลั่น ทอง เงิน ทองแดง สังกะสี และ[แอลกอฮอล์]", key: "e6", sfx: "pop@w:น้ำกลั่น" }] },
    { id: "e7", start: 25.2, end: 29.4, chunks: [{ t: "สารเนื้อเดียวมีได้ทั้ง[สามสถานะ] เหล็กเป็นของแข็ง น้ำเป็นของเหลว อากาศเป็นแก๊ส", key: "e7", sfx: "pop@w:สามสถานะ" }] },
    { id: "e8", start: 29.4, end: 33.6, chunks: [{ t: "สารเนื้อเดียวแบ่งเป็นสองชนิด คือ[สารบริสุทธิ์] กับสารละลาย", key: "e8", sfx: "pop@w:สารบริสุทธิ์" }] },
    { id: "e9", start: 33.6, end: 37.8, chunks: [{ t: "สารบริสุทธิ์ มีองค์ประกอบอย่างเดียว แบ่งเป็น[ธาตุ]กับสารประกอบ", key: "e9", sfx: "pop@w:ธาตุ" }] },
    { id: "e10", start: 37.8, end: 42.0, chunks: [{ t: "[ธาตุ]คือสารบริสุทธิ์ ที่แยกสลายเป็นสารอื่น ด้วยวิธีทางเคมีไม่ได้", key: "e10", sfx: "pop@w:ธาตุ" }] },
    { id: "e11", start: 42.0, end: 46.2, chunks: [{ t: "เช่น ออกซิเจน ไฮโดรเจน และเหล็ก ธาตุมีได้ทั้ง[สามสถานะ]", key: "e11", sfx: "pop@w:เหล็ก" }] },
    { id: "e12", start: 46.2, end: 50.4, chunks: [{ t: "[สารประกอบ]เกิดจากธาตุตั้งแต่สองชนิดขึ้นไป มารวมตัวกันทางเคมี", key: "e12", sfx: "pop@w:สารประกอบ" }] },
    { id: "e13", start: 50.4, end: 54.6, chunks: [{ t: "เช่น[น้ำ] เอชทูโอ เกิดจากธาตุไฮโดรเจนกับธาตุออกซิเจน", key: "e13", sfx: "pop@w:เอชทูโอ" }] },
    { id: "e14", start: 54.6, end: 58.8, chunks: [{ t: "และแก๊สคาร์บอนไดออกไซด์ ซีโอทู เกิดจากธาตุคาร์บอนกับธาตุออกซิเจน", key: "e14", sfx: "pop@w:ซีโอทู" }] },
    { id: "e15", start: 58.8, end: 63.0, chunks: [{ t: "สารประกอบมีสมบัติ[ต่างจาก]ธาตุที่มารวมกัน เช่น ไฮโดรเจนกับออกซิเจนเป็นแก๊ส แต่น้ำเป็นของเหลว", key: "e15", sfx: "pop@w:ต่างจาก" }] },
    { id: "e16", start: 63.0, end: 67.2, chunks: [{ t: "ส่วน[สารผสม]คือการนำสารตั้งแต่สองชนิดมาผสมกัน ไม่จำกัดส่วนผสม", key: "e16", sfx: "pop@w:สารผสม" }] },
    { id: "e17", start: 67.2, end: 71.4, chunks: [{ t: "และตอนผสมกัน จะ[ไม่เกิดปฏิกิริยา] ระหว่างสารที่นำมาผสม", key: "e17", sfx: "pop@w:ไม่เกิดปฏิกิริยา" }] },
    { id: "e18", start: 71.4, end: 75.6, chunks: [{ t: "สารผสมมีสามชนิด คือสารละลาย สารแขวนลอย และ[คอลลอยด์]", key: "e18", sfx: "pop@w:สารละลาย" }] },
    { id: "e19", start: 75.6, end: 79.8, chunks: [{ t: "เรื่องต่อไปเราจะไล่ดูทีละชนิด [ติดตาม]กันต่อนะ", key: "e19", sfx: "ding@w:ติดตาม" }] },
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
