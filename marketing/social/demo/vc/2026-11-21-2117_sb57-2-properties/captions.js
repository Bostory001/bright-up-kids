// Script by shot. One chunk = one spoken line (35-60 Thai characters, SPOKEN Thai, numbers as Thai words). Keys must be unique; scene.js points at them: "@key:word".
(function () {
  const SHOTS = [
    { id: "e1", start: 0.0, end: 4.2, chunks: [{ t: "สมบัติของสารแบ่งได้เป็น[สองประเภท] คือทางกายภาพ กับทางเคมี", key: "e1", sfx: "pop@w:สองประเภท" }] },
    { id: "e2", start: 4.2, end: 8.4, chunks: [{ t: "สมบัติ[ทางกายภาพ] คือสมบัติที่เราสังเกตเห็น จากรูปร่างภายนอก", key: "e2", sfx: "pop@w:ทางกายภาพ" }] },
    { id: "e3", start: 8.4, end: 12.6, chunks: [{ t: "เช่น สี กลิ่น รส ความหนาแน่น จุดเดือด และ[การละลาย]", key: "e3", sfx: "pop@w:ความหนาแน่น" }] },
    { id: "e4", start: 12.6, end: 16.8, chunks: [{ t: "ถ้าสมบัติทางกายภาพเปลี่ยนไป จะ[ไม่มีสารใหม่]เกิดขึ้น", key: "e4", sfx: "pop@w:ไม่มีสารใหม่" }] },
    { id: "e5", start: 16.8, end: 21.0, chunks: [{ t: "เช่น น้ำแข็งละลายเป็นน้ำ แค่[เปลี่ยนสถานะ] แต่ก็ยังเป็นน้ำเหมือนเดิม", key: "e5", sfx: "pop@w:เปลี่ยนสถานะ" }] },
    { id: "e6", start: 21.0, end: 25.2, chunks: [{ t: "การเกิดสารละลาย การเปลี่ยนอุณหภูมิ และ[การสึกกร่อน] ก็เป็นการเปลี่ยนทางกายภาพ", key: "e6", sfx: "pop@w:การสึกกร่อน" }] },
    { id: "e7", start: 25.2, end: 29.4, chunks: [{ t: "ส่วนสมบัติ[ทางเคมี] เกี่ยวกับสิ่งที่อยู่ภายในของสาร และการเกิดปฏิกิริยา", key: "e7", sfx: "pop@w:ทางเคมี" }] },
    { id: "e8", start: 29.4, end: 33.6, chunks: [{ t: "เช่น การเผาไหม้ การเกิดสนิมของเหล็ก และการ[ระเบิด]", key: "e8", sfx: "pop@w:เผาไหม้" }] },
    { id: "e9", start: 33.6, end: 37.8, chunks: [{ t: "ผลไม้สุก และกรดทำปฏิกิริยากับด่าง ก็เป็นสมบัติ[ทางเคมี]เหมือนกัน", key: "e9", sfx: "pop@w:ผลไม้สุก" }] },
    { id: "e10", start: 37.8, end: 42.0, chunks: [{ t: "ไฮโดรเจนรวมกับออกซิเจน เกิดเป็น[น้ำ] ซึ่งเป็นสารใหม่ที่ต่างจากเดิม", key: "e10", sfx: "pop@w:น้ำ" }] },
    { id: "e11", start: 42.0, end: 46.2, chunks: [{ t: "มาเทียบกัน ข้อแรก กายภาพไม่เกี่ยวกับ[ปฏิกิริยาเคมี] แต่ทางเคมีเกี่ยวข้อง", key: "e11", sfx: "pop@w:ปฏิกิริยาเคมี" }] },
    { id: "e12", start: 46.2, end: 50.4, chunks: [{ t: "ข้อสอง กายภาพไม่มีสารใหม่ ส่วนทางเคมี[มีสารใหม่]เกิดขึ้น", key: "e12", sfx: "pop@w:มีสารใหม่" }] },
    { id: "e13", start: 50.4, end: 54.6, chunks: [{ t: "ข้อสาม ทางกายภาพกลับสู่สภาพเดิมได้[ง่าย] แต่ทางเคมีกลับได้[ยาก]", key: "e13", sfx: "pop@w:ง่าย" }] },
    { id: "e14", start: 54.6, end: 58.8, chunks: [{ t: "ข้อสี่ ทางเคมีมี[ความร้อน]เกิดขึ้นจากปฏิกิริยา ส่วนทางกายภาพส่วนใหญ่แค่เปลี่ยนสถานะ", key: "e14", sfx: "pop@w:ความร้อน" }] },
    { id: "e15", start: 58.8, end: 63.0, chunks: [{ t: "ลองทายดู เผากระดาษเป็นทางกายภาพหรือเคมี ตอบ[ทางเคมี] เพราะได้เถ้าเป็นสารใหม่", key: "e15", sfx: "pop@w:ทางเคมี" }] },
    { id: "e16", start: 63.0, end: 67.2, chunks: [{ t: "แล้วเกลือละลายน้ำล่ะ ตอบ[ทางกายภาพ] เพราะระเหยน้ำออกก็ได้เกลือกลับมา", key: "e16", sfx: "pop@w:ทางกายภาพ" }] },
    { id: "e17", start: 67.2, end: 71.4, chunks: [{ t: "จำง่ายๆ ถ้ามี[สารใหม่]เกิดขึ้น ให้นึกถึงทางเคมีไว้ก่อนนะ", key: "e17", sfx: "ding@w:สารใหม่" }] },
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
