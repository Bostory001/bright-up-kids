// Script + subtitles, grouped by shot. One chunk = one subtitle line = one voice line.
//   t      subtitle text; [brackets] = accent words (blue, never split across word pops)
//   key    unique id, used by B("a1") / B("a1","word") in index.html
//   say    (optional) what the voice reads if it differs from t (numbers, abbreviations) — keep it close to t
//   voice  (optional) edge-tts voice for this line only: "en" = video.json → voice.english (English example sentences), or a full name
//   sfx    (optional) soft sound on a word: "pop@w:<word>" | "tick@0.4" (seconds after the line starts) | ["a", "b@w:…"]
//          add "|L" / "|R" for pan, "*1.5" for gain. Sounds: `lesson sfx --list`
//   pause  (optional) extra silence before the line, seconds
// `lesson voice` rewrites every start/end from the real voice; the numbers below are placeholders.
(function () {
  const SHOTS = [
    { id: "hook", start: 0, end: 1, chunks: [
      { t: "ใช้ [and], [but], [so] ถูกจริงไหม?", key: "a1", sfx: "pop@0.1" },
    ]},
    { id: "what", start: 0, end: 1, chunks: [
      { t: "[Conjunction] คือคำเชื่อม", key: "a2" },
      { t: "เชื่อม คำ วลี หรือ ประโยค เข้าด้วยกัน", key: "a3", pause: 0.3 },
    ]},
    { id: "fan", start: 0, end: 1, chunks: [
      { t: "ตัวหลักจำง่ายๆ ว่า [FANBOYS]", key: "a4", sfx: "ding@w:FANBOYS" },
      { t: "for, and, nor, but, or, yet, so", key: "a5", voice: "en", pause: 0.6,
        sfx: ["tick@w:for", "tick@w:and", "tick@w:nor", "tick@w:but", "tick@w:or", "tick@w:yet", "tick@w:so"] },
    ]},
    { id: "and", start: 0, end: 1, chunks: [
      { t: "[and] แปลว่า และ ใช้เพิ่มข้อมูล", key: "b1" },
      { t: "I like tea [and] coffee.", key: "b2", voice: "en", pause: 0.9, sfx: "pop@0.05" },
    ]},
    { id: "but", start: 0, end: 1, chunks: [
      { t: "[but] แปลว่า แต่ ใช้กับเรื่องขัดกัน", key: "c1" },
      { t: "It's cheap, [but] it's good.", key: "c2", voice: "en", pause: 0.9, sfx: "pop@0.05" },
    ]},
    { id: "so", start: 0, end: 1, chunks: [
      { t: "[so] แปลว่า ดังนั้น บอกผลลัพธ์", key: "d1" },
      { t: "It rained, [so] I stayed home.", key: "d2", voice: "en", pause: 0.9, sfx: "pop@0.05" },
    ]},
    { id: "because", start: 0, end: 1, chunks: [
      { t: "ส่วน [because] แปลว่า เพราะ บอกเหตุผล", key: "e1" },
      { t: "I stayed home [because] it rained.", key: "e2", voice: "en", pause: 0.9, sfx: "pop@0.05" },
    ]},
    { id: "tip", start: 0, end: 1, chunks: [
      { t: "เชื่อมสองประโยคด้วย [FANBOYS]", key: "f1" },
      { t: "อย่าลืมใส่ [comma] หน้าคำเชื่อม", key: "f2", pause: 0.5, sfx: "ding@w:comma" },
    ]},
    { id: "end", start: 0, end: 1, chunks: [
      { t: "เซฟไว้ทบทวน แล้วกดฟอลโลว์นะ", key: "g1", pause: 0.6, sfx: "chime@0.1" },
    ]},
  ];

  function timeCaptions(shots) {
    const out = [];
    for (const shot of shots) {
      const weights = shot.chunks.map((c) => c.t.replace(/[\[\]\s]/g, "").length + 6);
      const total = weights.reduce((a, b) => a + b, 0);
      let t = shot.start;
      shot.chunks.forEach((c, i) => {
        const d = ((shot.end - shot.start) * weights[i]) / total;
        out.push({ shot: shot.id, key: c.key, text: c.t, say: c.say, voice: c.voice, sfx: c.sfx, pause: c.pause, start: +t.toFixed(2), end: +(t + d).toFixed(2) });
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
// genhaha:ed34a05c8342
