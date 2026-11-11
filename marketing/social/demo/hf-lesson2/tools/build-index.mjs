/**
 * เขียน index.html ของคลิปสอน #2 (เวอร์ชัน HyperFrames)
 *
 * ทำไมต้องมีตัวเขียนไฟล์: ของประดับที่ซ้ำ ๆ (โบเก้ เศษกระดาษ จุดบอกขั้น)
 * มีหลายสิบชิ้น พิมพ์มือแล้วแก้ยาก สคริปต์นี้คายออกมาเป็น HTML จริง ๆ
 * ในไฟล์ ไม่ได้สร้างตอนรัน — Studio จึงยังแก้แท็กได้ตามสัญญาของ HyperFrames
 *
 *   node tools/build-index.mjs
 */
import { readFile, writeFile } from "node:fs/promises";

/* สุ่มด้วยเมล็ดคงที่ — ห้ามใช้ Math.random ตอนรัน และต้องได้ภาพเดิมทุกครั้ง */
const seeded = (s) => () => (s = (s * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff;

const W = 1080, H = 1920, DUR = 32;

/* ── จังหวะ (วินาที) ตรงกับ BEATS ของเวอร์ชัน canvas ───────── */
const BEATS = [
  { d: 2.9, lines: [["ลูกบวกลบเลขคล่อง", "ink"], ["แต่โจทย์ปัญหา อ่านแล้วนิ่ง", "lantern"]] },
  { d: 3.8, lines: [["อย่าเดาจากคำว่า รวม หรือ เหลือ", "ink"], ["ให้วาดกล่องนี้ก่อน", "lantern"]] },
  { d: 4.6, lines: [["เลขที่โจทย์บอก ใส่ช่องเล็ก", "ink"], ["ช่องใหญ่ยังว่างอยู่", "bad"]] },
  { d: 4.0, lines: [["ช่องใหญ่ว่าง = หาทั้งหมด", "ink"], ["หาทั้งหมด ต้องบวก", "lantern"]] },
  { d: 4.6, lines: [["โจทย์ใหม่ บอกทั้งหมดมาแล้ว", "ink"], ["คราวนี้ช่องเล็กว่าง", "bad"]] },
  { d: 4.2, lines: [["ช่องเล็กว่าง = หาส่วนย่อย", "ink"], ["หาส่วนย่อย ต้องลบ", "lantern"]] },
  { d: 3.6, lines: [["กล่องเดียว ใช้ได้ทุกโจทย์", "ink"], ["ไม่ต้องเดาคำในโจทย์อีก", "lantern"]] },
  { d: 4.3, lines: [["ลูกติดตรงไหน ครูรู้ตรงนั้น", "ink"], ["ทดลองเรียนฟรี · 065 447 4691", "lantern"]] }
];
const T = [];
(function () { let a = 0; for (const b of BEATS) { T.push(+a.toFixed(2)); a += b.d; } })();
const T_CTA = T[7];

/* ── ชิ้นส่วนที่ซ้ำ ─────────────────────────────────────────── */
const bokeh = (() => {
  const r = seeded(20261110), out = [];
  for (let i = 0; i < 10; i++) {
    out.push(`<i class="bk" style="left:${(60 + r() * 940).toFixed(0)}px;top:${(300 + r() * 1150).toFixed(0)}px;width:${(32 + r() * 68).toFixed(0)}px;height:${(32 + r() * 68).toFixed(0)}px"></i>`);
  }
  return out.join("\n        ");
})();

const shards = (() => {
  const r = seeded(4477), out = [];
  for (let i = 0; i < 26; i++) {
    const s = 5 + r() * 13;
    out.push(`<i class="sh" style="left:${(r() * 960).toFixed(0)}px;top:${(r() * 176).toFixed(0)}px;width:${s.toFixed(0)}px;height:${(s * 0.7).toFixed(0)}px;background:${r() > .5 ? "var(--lantern)" : "#cfe0fb"}"></i>`);
  }
  return out.join("\n            ");
})();

const dots = Array.from({ length: 8 }, (_, i) =>
  `<i class="dot" id="dot${i}"></i>`).join("\n          ");

const captions = BEATS.map((b, i) => `
      <div class="clip cap" id="cap${i}" data-start="${T[i]}" data-duration="${b.d}" data-track-index="2">
        <div class="capbox">
          ${b.lines.map((l, j) => `<p class="capline l${j}" style="color:var(--${l[1]})">${l[0]}</p>`).join("\n          ")}
        </div>
      </div>`).join("");

/* รอยฉีกหยัก ๆ — ใช้เป็น clip-path ของการ์ดสองซีก */
const tear = (() => {
  const r = seeded(991), pts = [];
  for (let y = 0; y <= 176; y += 16) pts.push([(52 + (r() - .5) * 4.6).toFixed(2), (y / 176 * 100).toFixed(1)]);
  const left = ["0% 0%", ...pts.map(p => `${p[0]}% ${p[1]}%`), "0% 100%"].join(",");
  const right = ["100% 0%", ...pts.map(p => `${p[0]}% ${p[1]}%`), "100% 100%"].join(",");
  return { left, right };
})();

const faces = await readFile("assets/fonts/faces.css", "utf8");

const html = `<!doctype html>
<html lang="th">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=${W}, height=${H}" />
    <script src="https://cdn.jsdelivr.net/npm/gsap@3.15.0/dist/gsap.min.js"><\/script>
    <style>
${faces}
      :root {
        --ground: #0a1326;
        --bg0: #0d1830;
        --glow: #1b2d57;
        --lantern: #ffc24a;
        --hot: #fff0c9;
        --blue: #52a8ff;
        --ink: #eaf1fc;
        --ink2: #9db1d4;
        --ink3: #64779c;
        --bad: #ff8071;
        --rack: #16254a;
        --rackline: #1f3566;
        --font-display: "Bai Jamjuree", "IBM Plex Sans Thai", sans-serif;
        --font-body: "IBM Plex Sans Thai", "Bai Jamjuree", sans-serif;
      }
      * { margin: 0; padding: 0; box-sizing: border-box; }
      html, body { width: ${W}px; height: ${H}px; overflow: hidden; background: var(--ground); }
      #root { width: 100%; height: 100%; position: relative; font-family: var(--font-body); }

      /* ── ฉากหลัง ───────────────────────────────────────── */
      #bg { position: absolute; inset: 0; background: linear-gradient(180deg, var(--bg0), var(--ground)); }
      #bgtop { position: absolute; left: 0; top: -300px; width: 100%; height: 1300px;
        background: radial-gradient(ellipse 900px 700px at 50% 300px, var(--glow), rgba(27,45,87,0)); }
      #bokeh { position: absolute; inset: 0; }
      .bk { position: absolute; border-radius: 50%; background: var(--lantern); opacity: .16; filter: blur(16px); }
      #vignette { position: absolute; inset: 0; pointer-events: none; z-index: 60;
        background: radial-gradient(ellipse 680px 1100px at 50% 45%, rgba(0,0,0,0) 40%, rgba(0,0,0,.45) 100%); }

      /* ── องก์ 1 · ฮุก ──────────────────────────────────── */
      #hook { position: absolute; inset: 0; z-index: 10; }
      #hookimg { position: absolute; left: 0; top: 110px; width: ${W}px; height: 1180px;
        object-fit: cover;
        -webkit-mask-image: linear-gradient(to bottom, transparent 0, #000 220px, #000 560px, transparent 1000px);
                mask-image: linear-gradient(to bottom, transparent 0, #000 220px, #000 560px, transparent 1000px); }
      #hooktitle { position: absolute; left: 0; top: 1060px; width: 100%; text-align: center;
        font-family: var(--font-display); font-weight: 700; font-size: 150px; line-height: 1;
        color: var(--ink); text-shadow: 0 0 55px rgba(255,194,74,.3); }
      #hooktitle span { display: inline-block; margin: 0 14px; }
      #hooktitle .op { color: var(--lantern); }

      /* ── หัวคลิป ───────────────────────────────────────── */
      #header { position: absolute; inset: 0; z-index: 50; }
      /* ฉากบังหลังหัวคลิป — ช่วงฮุกมีภาพครูสว่างอยู่ข้างหลัง ตัวหนังสือจะจม */
      #headscrim { position: absolute; left: 0; top: 240px; width: 100%; height: 220px;
        background: linear-gradient(180deg, rgba(10,19,38,.92) 0%, rgba(10,19,38,.72) 55%, rgba(10,19,38,0) 100%); }
      #badge { position: absolute; left: 58px; top: 294px; width: 92px; height: 92px; border-radius: 50%;
        overflow: hidden; border: 3px solid var(--blue); box-shadow: 0 0 24px rgba(82,168,255,.55); }
      #badge img { width: 100%; height: 100%; object-fit: cover; }
      #tname { position: absolute; left: 170px; top: 296px; font-family: var(--font-display);
        font-weight: 600; font-size: 40px; color: var(--ink); }
      #tsub { position: absolute; left: 170px; top: 346px; font-weight: 500; font-size: 30px; color: #a8bbdc; }
      #dots { position: absolute; right: 52px; top: 332px; display: flex; gap: 18px; align-items: center; }
      .dot { width: 12px; height: 12px; border-radius: 50%; background: var(--ink3); opacity: .28; }

      /* ── การ์ดบน (โจทย์ / กฎ) ──────────────────────────── */
      .card { position: absolute; left: 60px; top: 430px; width: 960px; height: 176px; border-radius: 22px;
        background: rgba(20,34,68,.72); border: 2px solid rgba(82,168,255,.30); }
      #prob { z-index: 20; }
      .problabel { position: absolute; left: 34px; top: 24px; font-weight: 600; font-size: 28px; color: var(--blue); }
      .qwrap { position: absolute; left: 35px; top: 62px; width: 890px; text-align: center; }
      .q1 { font-weight: 600; font-size: 42px; line-height: 1.25; color: var(--ink); }
      .q2 { font-weight: 600; font-size: 40px; line-height: 1.25; color: var(--lantern); margin-top: 6px; }
      /* หน้ากล่องปกติต้องไม่โดน clip-path ของรอยฉีก ไม่งั้นข้อความขาดครึ่ง
         สองซีกที่ถูก clip ใช้เฉพาะตอนฉีกเท่านั้น */
      #cardFace, #tearL, #tearR { position: absolute; left: 0; top: 0; width: 960px; height: 176px; }
      #tearL { clip-path: polygon(${tear.left}); }
      #tearR { clip-path: polygon(${tear.right}); }
      #blow { position: absolute; left: 60px; top: 430px; width: 960px; height: 176px; z-index: 21; }
      .sh { position: absolute; border-radius: 2px; }

      #rule { z-index: 22; border-color: rgba(255,194,74,.32); background: rgba(20,34,68,.78); }
      .rrow { position: absolute; left: 0; width: 100%; text-align: center;
        font-family: var(--font-display); font-weight: 600; font-size: 48px; color: var(--ink2); }
      .rrow b { color: var(--lantern); font-weight: 600; text-shadow: 0 0 24px rgba(255,194,74,.7); }
      #rrow1 { top: 36px; }
      #rrow2 { top: 104px; }

      /* ── กล่องส่วนย่อย–ทั้งหมด ─────────────────────────── */
      #board { position: absolute; inset: 0; z-index: 15; }
      .box { position: absolute; border-radius: 20px; border: 2px solid var(--rackline);
        background: linear-gradient(180deg, var(--rack), #101c3a); }
      #whole { left: 160px; top: 680px; width: 760px; height: 150px; }
      #partA { left: 160px; top: 680px; width: 380px; height: 150px; }
      #partB { left: 540px; top: 680px; width: 380px; height: 150px; }
      .blabel { position: absolute; left: 22px; top: 12px; font-weight: 500; font-size: 28px; color: #93a7cb; }
      .bval { position: absolute; left: 0; top: 0; width: 100%; height: 100%;
        display: flex; align-items: center; justify-content: center;
        font-family: var(--font-display); font-weight: 700; font-size: 82px; color: var(--ink); }
      .bq { position: absolute; left: 0; top: 0; width: 100%; height: 100%;
        display: flex; align-items: center; justify-content: center;
        font-family: var(--font-display); font-weight: 700; font-size: 86px; color: var(--bad);
        text-shadow: 0 0 20px rgba(255,128,113,.6); }
      .unknown { border: 4px dashed var(--bad) !important; box-shadow: 0 0 22px rgba(255,128,113,.45); }
      .hot { border: 4px solid var(--lantern) !important; box-shadow: 0 0 26px rgba(255,194,74,.55); }
      .hot .bval { color: var(--lantern); text-shadow: 0 0 30px rgba(255,194,74,.8); }
      #links { position: absolute; left: 0; top: 0; width: ${W}px; height: ${H}px; }
      #links i { position: absolute; background: var(--rackline); }

      /* ใบมีดผ่ากล่อง */
      #blade { position: absolute; left: 538px; top: 600px; width: 6px; height: 320px; border-radius: 3px;
        background: linear-gradient(180deg, transparent, var(--hot), transparent);
        box-shadow: 0 0 34px var(--lantern); transform: rotate(16deg); transform-origin: 50% 50%; }

      /* วงโคจรรอบช่องที่ว่าง */
      .orbit { position: absolute; border: 3px solid rgba(255,194,74,.6); border-radius: 50%;
        box-shadow: 0 0 18px rgba(255,194,74,.45); }
      #orbW { left: 160px; top: 672px; width: 760px; height: 166px; }
      #orbB { left: 586px; top: 894px; width: 328px; height: 162px; }
      .spin { position: absolute; left: 50%; top: 50%; width: 0; height: 0; }
      .spin i { position: absolute; width: 22px; height: 22px; margin: -11px 0 0 -11px; border-radius: 50%;
        background: var(--hot); box-shadow: 0 0 26px var(--lantern); }

      /* แสงกระแทก */
      #burst { position: absolute; left: 0; top: 0; width: ${W}px; height: ${H}px; z-index: 40;
        mix-blend-mode: screen; pointer-events: none; opacity: 0; }
      #ring { position: absolute; border: 8px solid var(--lantern); border-radius: 50%;
        box-shadow: 0 0 30px var(--lantern); opacity: 0; z-index: 41; }

      /* ── สมการใต้กล่อง ─────────────────────────────────── */
      .eq { position: absolute; left: 0; top: 1130px; width: 100%; text-align: center;
        font-family: var(--font-display); font-weight: 700; font-size: 80px; color: var(--ink);
        text-shadow: 0 0 44px rgba(255,194,74,.26); z-index: 18; }
      .eq b { color: var(--lantern); font-weight: 700; }
      .pill { position: absolute; top: 1146px; height: 86px; border-radius: 20px;
        background: rgba(20,34,68,.80); border: 2px solid rgba(255,194,74,.34);
        display: flex; align-items: center; justify-content: center;
        font-family: var(--font-display); font-weight: 600; font-size: 46px; color: var(--lantern);
        text-shadow: 0 0 22px rgba(255,194,74,.5); z-index: 18; }
      #pill1 { left: 128px; width: 320px; }
      #pill2 { left: 632px; width: 320px; }

      /* ── องก์ 3 · ปิดท้าย ──────────────────────────────── */
      #cta { position: absolute; inset: 0; z-index: 25; }
      #ctaimg { position: absolute; left: 565px; top: 600px; width: 560px; height: 820px; object-fit: cover;
        -webkit-mask-image:
          linear-gradient(to right, transparent 0, #000 62%),
          linear-gradient(to bottom, transparent 0, #000 21%, #000 70%, transparent 100%);
        -webkit-mask-composite: source-in;
        mask-image:
          linear-gradient(to right, transparent 0, #000 62%),
          linear-gradient(to bottom, transparent 0, #000 21%, #000 70%, transparent 100%);
        mask-composite: intersect; }

      /* ── ซับไทเทิล + ท้ายคลิป ──────────────────────────── */
      .cap { position: absolute; inset: 0; z-index: 55; }
      .capbox { position: absolute; left: 40px; top: 1296px; width: 1000px; height: 240px; border-radius: 24px;
        background: rgba(6,12,26,.9); border: 2px solid rgba(255,194,74,.18);
        display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 18px; }
      .capline { font-family: var(--font-display); font-weight: 600; font-size: 60px; line-height: 1.1;
        text-align: center; white-space: nowrap; }
      #footer { position: absolute; inset: 0; z-index: 58; }
      #track { position: absolute; left: 40px; top: 1572px; width: 1000px; height: 7px; border-radius: 4px;
        background: rgba(255,255,255,.09); }
      #fill { position: absolute; left: 0; top: 0; height: 100%; width: 100%; border-radius: 4px;
        background: var(--lantern); box-shadow: 0 0 16px var(--lantern); transform-origin: 0 50%; }
      #addr { position: absolute; left: 0; top: 1690px; width: 100%; text-align: center;
        font-weight: 500; font-size: 32px; color: rgba(174,191,221,.72); }
    </style>
  </head>
  <body>
    <div id="root" data-composition-id="main" data-start="0" data-duration="${DUR}"
         data-width="${W}" data-height="${H}">

      <div id="bg">
        <div id="bgtop" data-layout-allow-overflow></div>
        <div id="bokeh">
        ${bokeh}
        </div>
      </div>

      <!-- องก์ 1 · ฮุก -->
      <div class="clip" id="hook" data-start="0" data-duration="3.2" data-track-index="0" data-track-kind="graphics">
        <img id="hookimg" src="assets/img/kao-hero.png" alt="" />
        <div id="hooktitle">
          <span class="op" id="w0">+</span><span id="w1">หรือ</span><span class="op" id="w2">−</span><span id="w3">?</span>
        </div>
      </div>

      <!-- องก์ 2 · กระดาน -->
      <div class="clip" id="board" data-start="2.9" data-duration="${(T_CTA + 0.6 - 2.9).toFixed(2)}" data-track-index="0" data-track-kind="graphics">
        <div id="links">
          <i style="left:538px;top:830px;width:3px;height:34px"></i>
          <i style="left:330px;top:864px;width:420px;height:3px"></i>
          <i style="left:330px;top:864px;width:3px;height:36px"></i>
          <i style="left:748px;top:864px;width:3px;height:36px"></i>
        </div>
        <div class="orbit" id="orbW"></div>
        <div class="orbit" id="orbB"></div>

        <div class="box" id="whole"><span class="blabel">ทั้งหมด</span><span class="bq" id="wholeQ">?</span><span class="bval" id="wholeV">23</span></div>
        <div class="box" id="partA"><span class="blabel">ส่วนย่อย</span><span class="bval" id="partAV">15</span></div>
        <div class="box" id="partB"><span class="blabel">ส่วนย่อย</span><span class="bq" id="partBQ">?</span><span class="bval" id="partBV">8</span></div>

        <div class="spin" id="spinW"><i></i></div>
        <div class="spin" id="spinB"><i></i></div>
        <div id="blade"></div>

        <div class="eq" id="eq1">15 <b>+</b> 8 &nbsp;=&nbsp; <b>23</b></div>
        <div class="eq" id="eq2">23 <b>−</b> 15 &nbsp;=&nbsp; <b>8</b></div>
        <div class="pill" id="pill1">15 + 8 = 23</div>
        <div class="pill" id="pill2">23 − 15 = 8</div>

        <div id="ring"></div>
        <div id="burst"></div>
      </div>

      <!-- การ์ดโจทย์ -->
      <div class="clip card" id="prob" data-start="2.9" data-duration="${(T[6] + 0.5 - 2.9).toFixed(2)}" data-track-index="1" data-track-kind="graphics">
        <div id="cardFace">
          <span class="problabel">โจทย์</span>
          <div class="qwrap" id="qA"><p class="q1">พี่มีโคม 15 ดวง&nbsp; น้องมีโคม 8 ดวง</p><p class="q2">สองคนรวมกันได้กี่ดวง ?</p></div>
          <div class="qwrap" id="qB"><p class="q1">มีโคมทั้งหมด 23 ดวง&nbsp; สีฟ้า 15 ดวง</p><p class="q2">ที่เหลือเป็นสีเขียวกี่ดวง ?</p></div>
        </div>
        <div id="tearL">
          <span class="problabel">โจทย์</span>
          <div class="qwrap"><p class="q1">พี่มีโคม 15 ดวง&nbsp; น้องมีโคม 8 ดวง</p><p class="q2">สองคนรวมกันได้กี่ดวง ?</p></div>
        </div>
        <div id="tearR">
          <span class="problabel">โจทย์</span>
          <div class="qwrap"><p class="q1">พี่มีโคม 15 ดวง&nbsp; น้องมีโคม 8 ดวง</p><p class="q2">สองคนรวมกันได้กี่ดวง ?</p></div>
        </div>
      </div>
      <div class="clip" id="blow" data-start="${(T[4] - 0.9).toFixed(2)}" data-duration="1.1" data-track-index="1" data-track-kind="graphics">
            ${shards}
      </div>

      <!-- การ์ดกฎ -->
      <div class="clip card" id="rule" data-start="${T[6]}" data-duration="${(DUR - T[6]).toFixed(2)}" data-track-index="1" data-track-kind="graphics">
        <p class="rrow" id="rrow1">ช่องใหญ่ว่าง &nbsp;=&nbsp; <b>บวก</b></p>
        <p class="rrow" id="rrow2">ช่องเล็กว่าง &nbsp;=&nbsp; <b>ลบ</b></p>
      </div>

      <!-- องก์ 3 · ปิดท้าย -->
      <div class="clip" id="cta" data-start="${T_CTA}" data-duration="${(DUR - T_CTA).toFixed(2)}" data-track-index="0" data-track-kind="graphics">
        <img id="ctaimg" src="assets/img/kao-arms.png" alt="" />
      </div>

      <!-- หัวคลิป -->
      <div class="clip" id="header" data-start="0" data-duration="${DUR}" data-track-index="3" data-track-kind="graphics">
        <div id="headscrim"></div>
        <div id="badge"><img src="assets/img/kao-face.png" alt="" /></div>
        <div id="tname">ครูเก้า</div>
        <div id="tsub">คณิต ป.2–3</div>
        <div id="dots">
          ${dots}
        </div>
      </div>

      <!-- ซับไทเทิล -->${captions}

      <!-- ท้ายคลิป -->
      <div class="clip" id="footer" data-start="0" data-duration="${DUR}" data-track-index="4" data-track-kind="graphics">
        <div id="track"><div id="fill"></div></div>
        <div id="addr">ซอยวัดหลวงพ่อโต บางพลี</div>
      </div>

      <div id="vignette"></div>
    </div>

    <script>
      const T = ${JSON.stringify(T)};
      const DUR = ${DUR};
      const tl = gsap.timeline({ paused: true });
      const set = (t, el, v) => tl.set(el, v, t);

      /* ── ฉากหลัง: โบเก้ลอย + dolly zoom ตอนปิดท้าย ──────── */
      gsap.utils.toArray("#bokeh .bk").forEach((el, i) => {
        tl.to(el, { y: 26, duration: 2.2 + (i % 5) * .4, yoyo: true, repeat: 14, ease: "sine.inOut" }, 0);
      });
      tl.fromTo("#bokeh", { scale: 1 }, { scale: 1.26, duration: 1.5, ease: "power2.out" }, T[7] - 0.2);

      /* ── แถบเวลา ────────────────────────────────────────── */
      tl.fromTo("#fill", { scaleX: 0 }, { scaleX: 1, duration: DUR, ease: "none" }, 0);

      /* ── จุดบอกขั้น ─────────────────────────────────────── */
      T.forEach((t, i) => {
        tl.to("#dot" + i, { opacity: 1, backgroundColor: "#ffc24a", scale: 1.35,
          boxShadow: "0 0 14px #ffc24a", duration: .25, ease: "power2.out" }, t);
        if (i > 0) tl.to("#dot" + (i - 1), { scale: 1, boxShadow: "0 0 0 #ffc24a", duration: .25 }, t);
      });

      /* ── องก์ 1 · letter dive ───────────────────────────── */
      ["#w0", "#w1", "#w2", "#w3"].forEach((w, i) => {
        tl.fromTo(w, { y: -240, opacity: 0, scale: 1.35 },
          { y: 0, opacity: 1, scale: 1, duration: .64, ease: "back.out(1.6)" }, .26 + i * .13);
      });
      tl.to("#hook", { opacity: 0, duration: .42, ease: "power2.inOut" }, T[1] - .22);

      /* ── การ์ดโจทย์ ─────────────────────────────────────── */
      set(0, "#qA", { opacity: 0 }); set(0, "#qB", { opacity: 0 });
      set(0, ["#tearL", "#tearR"], { opacity: 0 });
      tl.fromTo("#prob", { opacity: 0, y: 18 }, { opacity: 1, y: 0, duration: .45, ease: "power3.out" }, T[1]);
      tl.to("#qA", { opacity: 1, duration: .42, ease: "power2.out" }, T[2]);

      /* paper tear + blow away — ฉีกข้อเก่าก่อนข้อใหม่ขึ้น
         สลับจากหน้ากล่องปกติไปเป็นสองซีกที่ถูก clip ตรงจังหวะที่เริ่มฉีก */
      const TEAR = T[4] - .9;
      set(TEAR, "#cardFace", { opacity: 0 });
      set(TEAR, ["#tearL", "#tearR"], { opacity: 1 });
      tl.to("#tearL", { x: -165, y: 50, rotation: -9, opacity: 0, duration: .9, ease: "power2.in" }, TEAR);
      tl.to("#tearR", { x: 225, y: 34, rotation: 8, opacity: 0, duration: .9, ease: "power2.in" }, TEAR);
      gsap.utils.toArray("#blow .sh").forEach((el, i) => {
        tl.fromTo(el, { x: 0, y: 0, opacity: .9, rotation: 0 },
          { x: 180 + (i % 7) * 95, y: -90 + (i % 5) * 40 + 300, rotation: 180 + i * 23,
            opacity: 0, duration: .85, ease: "power2.in" }, TEAR + .04 + (i % 9) * .03);
      });
      /* ข้อใหม่โผล่บนการ์ดใบเดิมที่รีเซ็ตกลับมา */
      set(T[4], ["#tearL", "#tearR"], { opacity: 0, x: 0, y: 0, rotation: 0 });
      set(T[4], "#cardFace", { opacity: 1 });
      set(T[4], "#qA", { opacity: 0 });
      tl.fromTo("#qB", { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: .5, ease: "power2.out" }, T[4] + .12);
      tl.to("#prob", { opacity: 0, duration: .45, ease: "power2.in" }, T[6]);

      /* ── การ์ดกฎ ────────────────────────────────────────── */
      tl.fromTo("#rule", { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: .5, ease: "power3.out" }, T[6]);
      tl.fromTo(["#rrow1", "#rrow2"], { opacity: 0, x: -24 },
        { opacity: 1, x: 0, duration: .45, stagger: .14, ease: "power2.out" }, T[6] + .15);

      /* ── กล่อง: blade slice แล้วหล่นเป็นสองส่วนย่อย ─────── */
      set(0, "#board", { opacity: 0 });
      set(0, ["#wholeV", "#partAV", "#partBV", "#wholeQ", "#partBQ"], { opacity: 0 });
      set(0, ["#eq1", "#eq2", "#pill1", "#pill2"], { opacity: 0 });
      set(0, ["#orbW", "#orbB", "#spinW", "#spinB"], { opacity: 0 });
      set(0, "#blade", { opacity: 0, scaleY: 0 });
      set(0, "#links", { opacity: 0 });
      set(0, ".blabel", { opacity: 0 });

      tl.to("#board", { opacity: 1, duration: .5, ease: "power2.out" }, T[1] + .1);
      tl.fromTo("#whole", { scale: .9, opacity: 0 }, { scale: 1, opacity: 1, duration: .55, ease: "back.out(1.4)" }, T[1] + .1);
      set(T[1] + .1, "#partA", { opacity: 1 }); set(T[1] + .1, "#partB", { opacity: 1 });

      /* ใบมีด */
      tl.fromTo("#blade", { opacity: 1, scaleY: 0, y: -180 },
        { scaleY: 1, y: 0, duration: .16, ease: "power4.in" }, T[1] + .9);
      tl.to("#blade", { opacity: 0, y: 190, duration: .22, ease: "power2.out" }, T[1] + 1.06);

      /* สองซีกหล่นลงไปเป็นช่องส่วนย่อย */
      tl.to("#partA", { x: 0, y: 220, width: 340, duration: .75, ease: "power3.inOut" }, T[1] + 1.05);
      tl.to("#partB", { x: 40, y: 220, width: 340, duration: .75, ease: "power3.inOut" }, T[1] + 1.05);
      tl.to(".blabel", { opacity: 1, duration: .35 }, T[1] + 1.5);
      tl.to("#links", { opacity: 1, duration: .45 }, T[1] + 1.6);

      /* ── โจทย์ A: รู้สองส่วนย่อย ช่องใหญ่ว่าง ───────────── */
      set(T[2], "#whole", { className: "box unknown" });
      tl.to("#wholeQ", { opacity: 1, duration: .35 }, T[2] + .1);
      tl.fromTo("#partAV", { opacity: 0, scale: .7 }, { opacity: 1, scale: 1, duration: .55, ease: "back.out(2)" }, T[2] + .15);
      tl.fromTo("#partBV", { opacity: 0, scale: .7 }, { opacity: 1, scale: 1, duration: .55, ease: "back.out(2)" }, T[2] + .42);
      tl.to(["#orbW", "#spinW"], { opacity: 1, duration: .3 }, T[2] + .2);
      tl.to("#spinW", { rotation: 360 * 6, duration: 4.3, ease: "none" }, T[2] + .2);
      set(0, "#spinW i", { x: 380 });
      set(0, "#spinB i", { x: 164 });
      set(0, "#spinW", { scaleY: .22 });
      set(0, "#spinB", { scaleY: .5 });

      /* ── เฉลย A: บวก ────────────────────────────────────── */
      tl.to(["#orbW", "#spinW"], { opacity: 0, duration: .25 }, T[3] + .3);
      set(T[3] + .45, "#whole", { className: "box hot" });
      set(T[3] + .45, "#wholeQ", { opacity: 0 });
      tl.fromTo("#wholeV", { opacity: 0, scale: .6 }, { opacity: 1, scale: 1, duration: .6, ease: "back.out(2.2)" }, T[3] + .45);
      tl.fromTo("#eq1", { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: .55, ease: "power3.out" }, T[3] + .45);
      tl.to("#eq1", { opacity: 0, duration: .35 }, T[4] - .35);

      /* ── โจทย์ B: รู้ทั้งหมด ช่องเล็กว่าง ───────────────── */
      set(T[4], "#whole", { className: "box" });
      set(T[4], "#partBV", { opacity: 0 });
      set(T[4], "#partB", { className: "box unknown" });
      tl.to("#partBQ", { opacity: 1, duration: .35 }, T[4] + .15);
      tl.to(["#orbB", "#spinB"], { opacity: 1, duration: .3 }, T[4] + .25);
      tl.to("#spinB", { rotation: 360 * 6, duration: 4.3, ease: "none" }, T[4] + .25);

      /* ── เฉลย B: ลบ ─────────────────────────────────────── */
      tl.to(["#orbB", "#spinB"], { opacity: 0, duration: .25 }, T[5] + .3);
      set(T[5] + .45, "#partB", { className: "box hot" });
      set(T[5] + .45, "#partBQ", { opacity: 0 });
      tl.fromTo("#partBV", { opacity: 0, scale: .6 }, { opacity: 1, scale: 1, duration: .6, ease: "back.out(2.2)" }, T[5] + .45);
      tl.fromTo("#eq2", { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: .55, ease: "power3.out" }, T[5] + .45);

      /* ── impact frame · 2 ครั้ง ห่างกัน 11 วินาที ───────── */
      [[T[3] + .45, 540, 755], [T[5] + .45, 750, 975]].forEach(([t, cx, cy]) => {
        set(t, "#burst", { background:
          "radial-gradient(circle 920px at " + cx + "px " + cy + "px, rgba(255,240,201,.95) 0%, rgba(255,194,74,.38) 30%, rgba(255,194,74,0) 100%)" });
        tl.fromTo("#burst", { opacity: .9 }, { opacity: 0, duration: .22, ease: "power2.in" }, t);
        set(t, "#ring", { left: cx - 120, top: cy - 70, width: 240, height: 140, borderWidth: 8 });
        tl.fromTo("#ring", { opacity: .7, scale: 1 },
          { opacity: 0, scale: 4.6, borderWidth: 2, duration: .56, ease: "power2.out" }, t);
      });

      /* ── ปิดท้าย: rack focus + เม็ดยาสองเม็ด ───────────── */
      tl.to(["#eq2"], { opacity: 0, duration: .35 }, T[6]);
      tl.fromTo(["#pill1", "#pill2"], { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: .5, stagger: .12, ease: "power3.out" }, T[6] + .12);
      tl.to("#board", { filter: "blur(5px)", duration: .6, ease: "power2.out" }, T[6]);
      tl.to("#board", { opacity: 0, duration: .45, ease: "power2.inOut" }, T[7] - .22);

      tl.fromTo("#cta", { opacity: 0 }, { opacity: 1, duration: .45, ease: "power2.inOut" }, T[7] - .22);
      tl.fromTo("#ctaimg", { x: 70 }, { x: 0, duration: .7, ease: "power3.out" }, T[7]);

      /* ── ซับไทเทิล ──────────────────────────────────────── */
      T.forEach((t, i) => {
        tl.fromTo("#cap" + i + " .capbox", { opacity: 0, y: 16 },
          { opacity: 1, y: 0, duration: .3, ease: "power2.out" }, t);
        tl.fromTo("#cap" + i + " .l0", { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: .4, ease: "power2.out" }, t);
        tl.fromTo("#cap" + i + " .l1", { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: .4, ease: "power2.out" }, t + .1);
      });

      window.__timelines["main"] = tl;
      tl.seek(0);
    <\/script>
  </body>
</html>
`;

await writeFile("index.html", html);
console.log("เขียน index.html แล้ว ·", html.length, "ตัวอักษร · ยาว", DUR, "วินาที · จังหวะ", T.join(", "));
