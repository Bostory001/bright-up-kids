// Script by shot. One chunk = one spoken line (35-60 Thai characters, SPOKEN Thai, numbers as Thai words). Keys must be unique; scene.js points at them: "@key:word".
(function () {
  const SHOTS = [
    { id: "e1", start: 0.0, end: 4.2, chunks: [{ t: "น้ำแข็งกลายเป็นน้ำ น้ำกลายเป็นไอ นั่นคือการ[เปลี่ยนสถานะ]ของสาร", key: "e1", sfx: "pop@w:เปลี่ยนสถานะ" }] },
    { id: "e2", start: 4.2, end: 8.4, chunks: [{ t: "สารเปลี่ยนสถานะได้ เพราะ[พลังงานความร้อน] ทำให้อุณหภูมิเปลี่ยนไป", key: "e2", sfx: "pop@w:พลังงานความร้อน" }] },
    { id: "e3", start: 8.4, end: 12.6, chunks: [{ t: "การเปลี่ยนสถานะมี[หกแบบ] และทั้งหมดเป็นการเปลี่ยนทางกายภาพ", key: "e3", sfx: "pop@w:หกแบบ" }] },
    { id: "e4", start: 12.6, end: 16.8, chunks: [{ t: "แบบที่หนึ่ง[การหลอมเหลว] ของแข็งเปลี่ยนเป็นของเหลว", key: "e4", sfx: "pop@w:การหลอมเหลว" }] },
    { id: "e5", start: 16.8, end: 21.0, chunks: [{ t: "เมื่อให้ความร้อน อนุภาคในของแข็งสั่นแรงขึ้น จน[เอาชนะ]แรงยึดเหนี่ยวได้", key: "e5", sfx: "pop@w:เอาชนะ" }] },
    { id: "e6", start: 21.0, end: 25.2, chunks: [{ t: "ของแข็งจึงเคลื่อนที่ได้ เช่น[น้ำแข็ง]ละลาย และไอศกรีมละลาย", key: "e6", sfx: "pop@w:น้ำแข็ง" }] },
    { id: "e7", start: 25.2, end: 29.4, chunks: [{ t: "แบบที่สอง[การกลายเป็นไอ] ของเหลวเปลี่ยนเป็นแก๊ส ต้องได้รับความร้อน", key: "e7", sfx: "pop@w:การกลายเป็นไอ" }] },
    { id: "e8", start: 29.4, end: 33.6, chunks: [{ t: "อนุภาคของเหลวมีพลังงานสูงจนแยกจากกัน เช่น น้ำกลายเป็น[ไอน้ำ]", key: "e8", sfx: "pop@w:ไอน้ำ" }] },
    { id: "e9", start: 33.6, end: 37.8, chunks: [{ t: "อุณหภูมิที่ทำให้ของเหลวเดือดจนกลายเป็นไอ เรียกว่า[จุดเดือด]", key: "e9", sfx: "pop@w:จุดเดือด" }] },
    { id: "e10", start: 37.8, end: 42.0, chunks: [{ t: "น้ำเดือดที่[หนึ่งร้อย]องศา แต่เอทานอลเดือดที่เจ็ดสิบแปดจุดห้าองศา", key: "e10", sfx: "pop@w:หนึ่งร้อย" }] },
    { id: "e11", start: 42.0, end: 46.2, chunks: [{ t: "แบบที่สาม[การควบแน่น] แก๊สเปลี่ยนเป็นของเหลว ตรงข้ามกับการกลายเป็นไอ", key: "e11", sfx: "pop@w:การควบแน่น" }] },
    { id: "e12", start: 46.2, end: 50.4, chunks: [{ t: "เมื่อลดอุณหภูมิ อนุภาคแก๊สช้าลง และเข้ามาใกล้กัน จนรวมเป็น[ของเหลว]", key: "e12", sfx: "pop@w:เข้ามาใกล้กัน" }] },
    { id: "e13", start: 50.4, end: 54.6, chunks: [{ t: "เช่นการเกิด[ฝน] และหยดน้ำที่เกาะข้างแก้วน้ำเย็น", key: "e13", sfx: "pop@w:ฝน" }] },
    { id: "e14", start: 54.6, end: 58.8, chunks: [{ t: "แบบที่สี่[การแข็งตัว] ของเหลวเปลี่ยนเป็นของแข็ง ตรงข้ามกับการหลอมเหลว", key: "e14", sfx: "pop@w:การแข็งตัว" }] },
    { id: "e15", start: 58.8, end: 63.0, chunks: [{ t: "สารต้อง[คายความร้อน]ออกมา เพื่อลดการสั่นของโมเลกุล เช่น น้ำกลายเป็นน้ำแข็ง", key: "e15", sfx: "pop@w:คายความร้อน" }] },
    { id: "e16", start: 63.0, end: 67.2, chunks: [{ t: "แบบที่ห้า[การระเหิด] ของแข็งกลายเป็นแก๊ส โดยไม่ผ่านของเหลว", key: "e16", sfx: "pop@w:การระเหิด" }] },
    { id: "e17", start: 67.2, end: 71.4, chunks: [{ t: "เช่น[ลูกเหม็น] การบูร พิมเสน วางทิ้งไว้ก็หายไปเอง โดยไม่ละลายเป็นน้ำ", key: "e17", sfx: "pop@w:ลูกเหม็น" }] },
    { id: "e18", start: 71.4, end: 75.6, chunks: [{ t: "แบบที่หก[การระเหิดกลับ] แก๊สกลายเป็นของแข็ง โดยไม่ผ่านของเหลว", key: "e18", sfx: "pop@w:การระเหิดกลับ" }] },
    { id: "e19", start: 75.6, end: 79.8, chunks: [{ t: "สรุป สามแบบแรกต้อง[ดูดความร้อน] อีกสามแบบต้องคายความร้อน", key: "e19", sfx: "ding@w:ดูดความร้อน" }] },
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
