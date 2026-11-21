// Script by shot. One chunk = one spoken line (35-60 Thai characters, SPOKEN Thai, numbers as Thai words). Keys must be unique; scene.js points at them: "@key:word".
(function () {
  const SHOTS = [
    { id: "e1", start: 0.0, end: 4.2, chunks: [{ t: "ในแผนที่ เราบอกทิศได้ถึง[หกแบบ] ไม่ได้มีแค่เหนือใต้", key: "e1", sfx: "pop@w:หกแบบ" }] },
    { id: "e2", start: 4.2, end: 8.4, chunks: [{ t: "แบบที่หนึ่ง บอกเป็น[ชื่อทิศ] มีให้เลือกสี่ สิบหก หรือสามสิบสองทิศ", key: "e2", sfx: "pop@w:สี่" }] },
    { id: "e3", start: 8.4, end: 12.6, chunks: [{ t: "แบบที่สอง บอกเป็น[มิล] วงกลมหนึ่งรอบแบ่งเป็นหกพันสี่ร้อยหน่วย", key: "e3", sfx: "pop@w:หกพันสี่ร้อย" }] },
    { id: "e4", start: 12.6, end: 16.8, chunks: [{ t: "แบบที่สาม บอกเป็น[องศา] วงกลมหนึ่งรอบมีสามร้อยหกสิบองศา", key: "e4", sfx: "pop@w:สามร้อยหกสิบ" }] },
    { id: "e5", start: 16.8, end: 21.0, chunks: [{ t: "หนึ่งองศามีหกสิบลิปดา และหนึ่งลิปดามีหกสิบ[พิลิปดา]", key: "e5", sfx: "pop@w:ลิปดา" }] },
    { id: "e6", start: 21.0, end: 25.2, chunks: [{ t: "แบบที่สี่ บอกเป็น[เกรด] วงกลมหนึ่งรอบมีสี่ร้อยเกรด", key: "e6", sfx: "pop@w:สี่ร้อย" }] },
    { id: "e7", start: 25.2, end: 29.4, chunks: [{ t: "เหนือคือศูนย์เกรด ตะวันออกหนึ่งร้อย ใต้สองร้อย ตะวันตกสามร้อย", key: "e7", sfx: "pop@w:ตะวันออกหนึ่งร้อย" }] },
    { id: "e8", start: 29.4, end: 33.6, chunks: [{ t: "แบบที่ห้า บอกเป็น[อะซิมุท] วัดจากทิศเหนือตามเข็มนาฬิกา ทหารนิยมใช้", key: "e8", sfx: "pop@w:อะซิมุท" }] },
    { id: "e9", start: 33.6, end: 37.8, chunks: [{ t: "แบบที่หก บอกเป็น[แบริ่ง] วัดจากเหนือหรือใต้ ไปทางออกหรือตก", key: "e9", sfx: "pop@w:แบริ่ง" }] },
    { id: "e10", start: 37.8, end: 42.0, chunks: [{ t: "ค่าแบริ่งไม่เกินเก้าสิบองศา เช่น เหนือสี่สิบเก้าองศา[ตะวันออก]", key: "e10", sfx: "pop@w:แบริ่ง" }] },
    { id: "e11", start: 42.0, end: 46.2, chunks: [{ t: "ทั้งหกแบบบอกทิศได้ละเอียดต่างกัน [เลือกใช้]ให้เหมาะกับงานนะ", key: "e11", sfx: "ding@w:เลือกใช้" }] },
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
