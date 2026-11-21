// Script by shot. One chunk = one spoken line (35-60 Thai characters, SPOKEN Thai, numbers as Thai words). Keys must be unique; scene.js points at them: "@key:word".
(function () {
  const SHOTS = [
    { id: "e1", start: 0, end: 4.0, chunks: [{ t: "รู้ไหมว่า[โลกหมุน]รอบตัวเองอยู่ตลอดเวลา แล้วมันทำให้เกิดอะไรบ้าง", key: "e1", sfx: "pop@w:โลกหมุน" }] },
    { id: "e2", start: 4.0, end: 8.4, chunks: [{ t: "โลกหมุนจากทิศตะวันตกไปทิศตะวันออก ครบหนึ่งรอบใช้เวลาประมาณ[ยี่สิบสี่ชั่วโมง]", key: "e2", sfx: "ding@w:ยี่สิบสี่" }] },
    { id: "e3", start: 8.4, end: 12.4, chunks: [{ t: "ข้อหนึ่ง ด้านที่หันหาดวงอาทิตย์เป็น[กลางวัน] ด้านที่หันหนีเป็นกลางคืน", key: "e3", sfx: "whoosh@0.05" }] },
    { id: "e4", start: 12.4, end: 16.4, chunks: [{ t: "ข้อสอง เรา[เห็นดวงอาทิตย์]ขึ้นทางทิศตะวันออก แล้วตกทางทิศตะวันตก", key: "e4", sfx: "pop@w:ขึ้น" }] },
    { id: "e5", start: 16.4, end: 20.4, chunks: [{ t: "ข้อสาม [เงา]ของต้นไม้เปลี่ยนทิศทางและความยาวไปตลอดวัน", key: "e5", sfx: "pop@w:เงา" }] },
    { id: "e6", start: 20.4, end: 24.4, chunks: [{ t: "ข้อสี่ อุณหภูมิเปลี่ยนไปตามเวลา กลางวัน[ร้อน] กลางคืนเย็นลง", key: "e6", sfx: "boom@w:ร้อน" }] },
    { id: "e7", start: 24.4, end: 28.8, chunks: [{ t: "ข้อห้า ดาวดูเหมือนเคลื่อนที่ไปทางตะวันตก ทั้งที่จริง[โลก]ต่างหากที่หมุน", key: "e7", sfx: "ding@w:โลก" }] },
    { id: "e8", start: 28.8, end: 33.4, chunks: [{ t: "สรุปคือ โลกหมุนรอบตัวเอง จึงมี[กลางวันกลางคืน] พรุ่งนี้ลองสังเกตเงาตัวเองดูนะ", key: "e8", sfx: "ding@w:กลางวัน" }] },
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
