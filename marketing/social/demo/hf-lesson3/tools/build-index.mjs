/**
 * คลิปสอน #3 — เศษส่วน: ทำไม "ครึ่งหนึ่ง" มากกว่า "หนึ่งในสาม" ทั้งที่ 3 มากกว่า 2
 *
 * ธีมตามหน้าเพจจริง: ฟ้าสดใส เมฆขาว ตัวหนังสือหนาขอบขาว ชมพูบานเย็น ปุ่มเหลืองส้ม ดูดเดิลดาว
 * ไม่ใช้โลกโคมไฟกลางคืนและไม่ใช้ตัวละครแฟนตาซี — เจ้าของบอกว่าอยากได้แบบคนทั่วไป
 *
 *   node tools/build-index.mjs
 */
import { readFile, writeFile } from "node:fs/promises";

const W = 1080, H = 1920;

/* ── บทตามโครง 6 จังหวะใน skill lesson-storytelling ─────────
   สะดุด → เจอปัญหา → ลองผิด → จุดพลิก → ทำซ้ำ → ส่งไม้ต่อ
   จังหวะสำคัญที่สุดคือ "ชี้จุดที่คิดพลาด" เด็กที่ตอบผิดมีเหตุผลของเขา */
const BEATS = [
  { d: 3.2, lines: [["ครึ่งหนึ่ง กับ หนึ่งในสาม", "ink"], ["อันไหนมากกว่า ?", "blue"]] },
  { d: 4.0, lines: [["เด็กส่วนใหญ่ตอบ หนึ่งในสาม", "ink"], ["เพราะ 3 มากกว่า 2", "pink"]] },
  { d: 4.4, lines: [["แต่เลขข้างล่างไม่ใช่จำนวนของ", "ink"], ["มันคือจำนวนคนที่มาแบ่ง", "blue"]] },
  { d: 5.6, lines: [["เค้กก้อนเท่ากัน", "ink"], ["ซ้ายแบ่ง 2 คน ขวาแบ่ง 3 คน", "ink"]] },
  { d: 4.6, lines: [["ยิ่งแบ่งหลายคน", "ink"], ["ชิ้นยิ่งเล็กลง", "orange"]] },
  { d: 4.2, lines: [["ชิ้นของ 2 คน ใหญ่กว่า", "ink"], ["ครึ่งหนึ่ง จึงมากกว่า หนึ่งในสาม", "green"]] },
  { d: 4.0, lines: [["ลองเอง หนึ่งในสี่ กับ หนึ่งในหก", "ink"], ["แบ่ง 6 คน ย่อมได้ชิ้นเล็กกว่า", "green"]] },
  { d: 4.2, lines: [["ลูกติดตรงไหน ครูรู้ตรงนั้น", "ink"], ["ทดลองประเมินพื้นฐานฟรี", "pink"]] }
];
/* ถ้าพากย์แล้ว ความยาวของแต่ละจังหวะมาจากเสียงจริง ไม่ใช่ตัวเลขที่เดาไว้ข้างบน
   (ค่า d ใน BEATS ใช้เฉพาะตอนยังไม่มีเสียง)
   รอบแรกที่เดาเอง เสียงยาวกว่าภาพ 13 วินาที ซับเลยวิ่งหนีเสียง */
const VO_LEAD = 0.2;   // ภาพขึ้นก่อนเสียงนิดหนึ่ง
const VO_PAD = 0.5;    // เผื่อหายใจท้ายประโยค
let VO = null;
try {
  VO = JSON.parse(await readFile("assets/vo/timing.json", "utf8"));
} catch { /* ยังไม่ได้พากย์ */ }
if (VO) for (let i = 0; i < BEATS.length; i++) {
  const s = VO["b" + i];
  if (s) BEATS[i].d = +(s + VO_LEAD + VO_PAD).toFixed(2);
}

const T = [];
(function () { let a = 0; for (const b of BEATS) { T.push(+a.toFixed(2)); a += b.d; } })();
const DUR = +(T[7] + BEATS[7].d).toFixed(2);

/* ── ตัวช่วยวาด ─────────────────────────────────────────────
   0 องศา = ชี้ขึ้น เดินตามเข็ม เหมือนเวลาตัดเค้กจริง            */
const pt = (cx, cy, r, deg) => {
  const a = (deg - 90) * Math.PI / 180;
  return [+(cx + r * Math.cos(a)).toFixed(1), +(cy + r * Math.sin(a)).toFixed(1)];
};
const wedge = (cx, cy, r, a0, a1) => {
  const [x0, y0] = pt(cx, cy, r, a0), [x1, y1] = pt(cx, cy, r, a1);
  return `M${cx} ${cy} L${x0} ${y0} A${r} ${r} 0 ${a1 - a0 > 180 ? 1 : 0} 1 ${x1} ${y1} Z`;
};

/** เค้ก 1 ก้อนบนจาน: ชิ้นที่ได้ + รอยตัด + ขอบ */
function cake(id, cx, cy, r, parts) {
  const step = 360 / parts;
  const cuts = Array.from({ length: parts }, (_, i) => {
    const [x, y] = pt(cx, cy, r, i * step);
    return `<line class="cut" x1="${cx}" y1="${cy}" x2="${x}" y2="${y}" />`;
  }).join("");
  return `<circle class="plate" cx="${cx}" cy="${cy + 10}" r="${r + 26}" />` +
    `<circle class="cakebase" cx="${cx}" cy="${cy}" r="${r}" />` +
    `<path class="slice" id="${id}slice" d="${wedge(cx, cy, r, 0, step)}" />` +
    cuts +
    `<circle class="cakeedge" cx="${cx}" cy="${cy}" r="${r}" />`;
}

/** คนธรรมดา n คน เรียงกลางที่ cx — หัวกลม ไหล่มน ไม่มีหน้าตา */
function people(id, cx, cy, n, gap = 62) {
  const x0 = cx - ((n - 1) * gap) / 2;
  return Array.from({ length: n }, (_, i) => {
    const x = x0 + i * gap;
    return `<g class="person" id="${id}p${i}"><circle cx="${x}" cy="${cy}" r="15" />` +
      `<path d="M${x - 21} ${cy + 56} v-19 a21 21 0 0 1 42 0 v19 z" /></g>`;
  }).join("");
}

/** ก้อนเมฆ */
const cloud = (x, y, s) =>
  `<g class="cloud" transform="translate(${x} ${y}) scale(${s})">` +
  `<circle cx="0" cy="0" r="34"/><circle cx="44" cy="-14" r="44"/><circle cx="94" cy="4" r="30"/>` +
  `<rect x="-34" y="-4" width="160" height="38" rx="19"/></g>`;

/** ดาวประกายสี่แฉกแบบดูดเดิลในโพสต์ของเพจ */
const spark = (x, y, r, cls) =>
  `<path class="spark ${cls}" d="M${x} ${y - r} Q${x + r * .17} ${y - r * .17} ${x + r} ${y} ` +
  `Q${x + r * .17} ${y + r * .17} ${x} ${y + r} Q${x - r * .17} ${y + r * .17} ${x - r} ${y} ` +
  `Q${x - r * .17} ${y - r * .17} ${x} ${y - r} Z" />`;

/** ตัวหนังสือหนามีขอบขาว — ซ้อนสองชั้นจริง ไม่พึ่ง paint-order
    (ชั้นล่างคือเส้นขอบ ชั้นบนคือสีเนื้อ)
    ชั้นขอบเป็นพื้นผิว ไม่ใช่ข้อความที่ต้องอ่าน จึงใส่ data-layout-ignore
    ไม่งั้นตัวตรวจจะฟ้องว่าข้อความสองก้อนทับกัน */
const ot = (txt, tone, cls = "", id = "") =>
  `<span class="ot ${cls} ${tone}"${id ? ` id="${id}"` : ""}><i class="ot-s" data-layout-ignore>${txt}</i><i class="ot-f">${txt}</i></span>`;

/** เศษส่วนมีเส้นคั่น — เขียนเป็นเลขจริง เด็กต้องเห็นว่าบนกับล่างคนละหน้าที่ */
const frac = (id, top, bottom, cls = "") =>
  `<span class="frac ${cls}" id="${id}"><b class="num">${top}</b><i class="bar"></i><b class="den">${bottom}</b></span>`;

const dots = Array.from({ length: 8 }, (_, i) => `<i class="dot" id="dot${i}"></i>`).join("");

const captions = BEATS.map((b, i) => `
      <div class="clip cap" id="cap${i}" data-start="${T[i]}" data-duration="${b.d}" data-track-index="5" data-track-kind="captions">
        <div class="capbox">
          ${b.lines.map((l, j) => `<p class="capline l${j} c-${l[1]}">${l[0]}</p>`).join("\n          ")}
        </div>
      </div>`).join("");

/* เสียงพากย์หนึ่งไฟล์ต่อหนึ่งจังหวะ — ไม่ใส่ data-duration ให้เล่นจนจบไฟล์
   ทุกตัวต้องมี id ไม่งั้น HyperFrames ไม่เอาเข้ามิกซ์ */
const audios = VO
  ? BEATS.map((b, i) => VO["b" + i]
      ? `\n      <audio class="clip" id="vo${i}" src="assets/vo/b${i}.wav" data-start="${(T[i] + VO_LEAD).toFixed(2)}" data-volume="1" data-track-index="6"></audio>`
      : "").join("")
  : "";

const faces = await readFile("assets/fonts/faces.css", "utf8");

/* ── ช่วงเวลาของแต่ละฉาก ───────────────────────────────────── */
/* ฉากคาบเกี่ยวจังหวะที่มันครอบ และยืดตาม T เอง ไม่ใช่เลขตายตัว
   ไม่งั้นพอเสียงยาวขึ้น ฉากจะจบก่อนที่คนพูดจะพูดจบ */
const XF = 0.2;
const span = (a, b) => [+(a - XF).toFixed(2), +(b + XF - (a - XF)).toFixed(2)];
const S = {
  hook:  [0, +(T[1] + XF).toFixed(2)],
  wrong: span(T[1], T[2]),
  denom: span(T[2], T[3]),
  cakes: span(T[3], T[6]),
  ex2:   span(T[6], T[7]),
  cta:   [+(T[7] - XF).toFixed(2), +(DUR - T[7] + XF).toFixed(2)]
};
const sc = (k) => `data-start="${S[k][0]}" data-duration="${S[k][1].toFixed(2)}"`;

const html = `<!doctype html>
<html lang="th">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=${W}, height=${H}" />
    <script src="https://cdn.jsdelivr.net/npm/gsap@3.15.0/dist/gsap.min.js"><\/script>
    <style>
${faces}
      :root {
        --sky0: #7ed1f2;
        --sky1: #bfe9fb;
        --sky2: #e8f7fe;
        --pink: #ed2a86;
        --pinkD: #c4166b;
        --blue: #1e8fd5;
        --blueD: #1366a3;
        --yellow: #ffc93c;
        --orange: #f98a1f;
        --green: #3fb24a;
        --greenD: #2b8a34;
        --ink: #2c4257;
        --ink2: #5b7389;
        --cake: #ffe3a8;
        --cakeEdge: #e9a43a;
        --slice: #ffc247;
        --sliceEdge: #e07f16;
        --font-display: "Mitr", "IBM Plex Sans Thai", sans-serif;
        --font-body: "IBM Plex Sans Thai", "Mitr", sans-serif;
      }
      * { margin: 0; padding: 0; box-sizing: border-box; }
      html, body { width: ${W}px; height: ${H}px; overflow: hidden; background: var(--sky2); }
      #root { width: 100%; height: 100%; position: relative; font-family: var(--font-body); color: var(--ink); }

      #bg { position: absolute; inset: 0;
        background: linear-gradient(180deg, var(--sky0) 0%, var(--sky1) 42%, var(--sky2) 78%, #fff 100%); }
      #sky { position: absolute; inset: 0; }
      .cloud { fill: #fff; opacity: .9; }
      .spark { fill: var(--yellow); }
      .spark.pink { fill: #ff8ec4; }
      .spark.white { fill: #fff; }

      /* ── ตัวหนังสือหนาขอบขาว ───────────────────────────── */
      .ot { position: relative; display: inline-block; font-family: var(--font-display);
        font-weight: 700; line-height: 1.12; filter: drop-shadow(0 7px 0 rgba(28,70,104,.13)); }
      .ot i { font-style: normal; display: block; white-space: nowrap; }
      .ot .ot-s { -webkit-text-stroke: 17px #fff; color: #fff; }
      .ot .ot-f { position: absolute; left: 0; top: 0; }
      .ot.pink .ot-f { color: var(--pink); }
      .ot.blue .ot-f { color: var(--blue); }
      .ot.green .ot-f { color: var(--greenD); }
      .ot.ink .ot-f { color: var(--ink); }
      .ot.orange .ot-f { color: var(--orange); }

      /* ── หัวคลิป ───────────────────────────────────────── */
      #header { position: absolute; inset: 0; z-index: 50; }
      #chip { position: absolute; left: 58px; top: 292px; height: 74px; padding: 0 30px 0 14px;
        display: flex; align-items: center; gap: 16px; border-radius: 37px;
        background: #fff; box-shadow: 0 8px 20px rgba(28,70,104,.16); }
      #chipicon { width: 50px; height: 50px; border-radius: 16px; background: var(--blue); color: #fff;
        display: flex; align-items: center; justify-content: center;
        font-family: var(--font-display); font-weight: 600; font-size: 26px; letter-spacing: -1px; }
      #chip span { font-family: var(--font-display); font-weight: 600; font-size: 31px; color: var(--ink); }
      #chip em { font-style: normal; font-weight: 600; font-size: 29px; color: var(--blue); }
      #dots { position: absolute; right: 56px; top: 318px; display: flex; gap: 17px; align-items: center; }
      .dot { width: 13px; height: 13px; border-radius: 50%; background: #fff; opacity: .75; }

      /* ── ฉาก ───────────────────────────────────────────── */
      .scene { position: absolute; inset: 0; z-index: 20; }
      .stage { position: absolute; left: 0; top: 400px; width: ${W}px; height: 860px; }

      /* เศษส่วน */
      .frac { display: inline-flex; flex-direction: column; align-items: center; vertical-align: middle;
        font-family: var(--font-display); line-height: 1; }
      .frac .num, .frac .den { font-weight: 700; font-size: 120px; color: #fff; font-style: normal;
        -webkit-text-stroke: 0; text-shadow: 0 6px 0 rgba(28,70,104,.14); }
      .frac .bar { display: block; width: 116px; height: 12px; border-radius: 6px; background: #fff; margin: 16px 0;
        box-shadow: 0 5px 0 rgba(28,70,104,.12); }
      .frac.ink .num, .frac.ink .den { color: var(--ink); text-shadow: none; }
      .frac.ink .bar { background: var(--ink); box-shadow: none; }
      .frac.sm .num, .frac.sm .den { font-size: 72px; }
      .frac.sm .bar { width: 70px; height: 8px; margin: 10px 0; }
      .frac.lit .den { color: var(--pink); }

      /* ฉาก 1 · สะดุด */
      #hookrow { position: absolute; left: 0; top: 70px; width: 100%;
        display: flex; align-items: center; justify-content: center; gap: 96px; }
      /* สีขาวบนฟ้าอ่อนคอนทราสต์ไม่ถึงเกณฑ์ ตัวหนังสือที่ต้องอ่านจึงใช้สีเข้ม */
      #hookvs { font-family: var(--font-display); font-weight: 600; font-size: 60px; color: var(--ink); }
      #hookq { position: absolute; left: 0; top: 520px; width: 100%; text-align: center; }
      #hookq .ot { font-size: 82px; }

      /* ฉาก 2 · ชี้จุดที่คิดพลาด */
      #wrongwrap { position: absolute; left: 0; top: 150px; width: 100%; text-align: center; }
      #wrongline { position: relative; display: inline-block; }
      #wrongline .ot { font-size: 100px; }
      /* ขีดฆ่าต้องบางและอยู่ค่อนไปทางล่าง ไม่งั้นบังตัวอักษรจนอ่านไม่ออก */
      #strike { position: absolute; left: -26px; top: 62%; height: 10px; border-radius: 5px;
        background: var(--pink); width: calc(100% + 52px); transform-origin: 0 50%;
        box-shadow: 0 0 0 4px #fff; }
      #wrongnote { position: absolute; left: 0; top: 350px; width: 100%; text-align: center; }
      #wrongnote .ot { font-size: 52px; }

      /* ฉาก 3 · เลขล่างคืออะไร */
      #denomwrap { position: absolute; left: 0; top: 110px; width: 100%; text-align: center; }
      /* ต้องเริ่มใต้ตัวเศษส่วน (สูง ~284px จาก top 110) ไม่งั้นหัวลูกศรทับเลขล่าง */
      #arrow { position: absolute; left: 50%; top: 418px; width: 8px; height: 86px; border-radius: 4px;
        background: var(--blue); transform-origin: 50% 0; margin-left: -4px; }
      #arrow::after { content: ""; position: absolute; left: -15px; bottom: -4px;
        border-left: 19px solid transparent; border-right: 19px solid transparent; border-top: 26px solid var(--blue); }
      #denomnote { position: absolute; left: 0; top: 548px; width: 100%; text-align: center; }
      #denomnote .ot { font-size: 62px; }

      /* ฉาก 4 · เค้ก */
      .cakesvg { position: absolute; left: 0; top: 0; width: ${W}px; height: 860px; }
      .plate { fill: #fff; opacity: .95; }
      .cakebase { fill: var(--cake); }
      .cakeedge { fill: none; stroke: var(--cakeEdge); stroke-width: 6; }
      .slice { fill: var(--slice); stroke: var(--sliceEdge); stroke-width: 6; stroke-linejoin: round; }
      .cut { stroke: #fff; stroke-width: 8; stroke-linecap: round; }
      .person { fill: var(--blue); }
      #cakeB .person, #cakeD .person { fill: var(--pink); }
      .cakelabel { position: absolute; top: 596px; width: 440px; text-align: center; }
      .cakelabel .who { margin-top: 12px; font-family: var(--font-display); font-weight: 600;
        font-size: 34px; color: var(--ink2); }
      #labA, #labC { left: 90px; }
      #labB, #labD { left: 550px; }
      /* ฉากทำซ้ำไม่ต้องมีเศษส่วนใต้เค้ก เพราะบรรทัดเฉลยพูดไว้แล้ว
         ใส่ไปจะชนกับบรรทัดเฉลยพอดี */
      .lab2 { top: 604px; }
      .bar2 { position: absolute; height: 52px; border-radius: 26px; transform-origin: 0 50%; border: 5px solid #fff; }
      #barA { left: 300px; top: 700px; width: 450px; background: var(--slice); }
      #barB { left: 300px; top: 770px; width: 300px; background: #8ad2f0; }
      .bartag { position: absolute; font-family: var(--font-display); font-weight: 600; font-size: 32px; color: var(--ink); }
      #tagA { left: 150px; top: 710px; }
      #tagB { left: 150px; top: 780px; }
      #verdict { position: absolute; left: 0; top: 690px; width: 100%; text-align: center; }
      #verdict .ot { font-size: 74px; }

      /* ฉาก 5 · ทำซ้ำ */
      #ex2note { position: absolute; left: 0; top: 700px; width: 100%; text-align: center; }
      #ex2note .ot { font-size: 64px; }

      /* ฉาก 6 · ปิดท้าย */
      #ctacard { position: absolute; left: 86px; top: 170px; width: 908px; padding: 62px 54px 56px;
        border-radius: 46px; background: #fff; box-shadow: 0 22px 50px rgba(28,70,104,.18); text-align: center; }
      #ctatitle .ot { font-size: 62px; }
      #ctaline { margin-top: 30px; font-family: var(--font-display); font-weight: 500; font-size: 40px; color: var(--ink2); }
      #ctaphone { margin-top: 38px; display: inline-block; padding: 24px 56px; border-radius: 40px;
        background: linear-gradient(180deg, #f53f97, var(--pinkD)); color: #fff;
        font-family: var(--font-display); font-weight: 700; font-size: 56px;
        box-shadow: 0 10px 0 rgba(140,10,70,.3); }
      #ctasubjects { margin-top: 40px; display: flex; justify-content: center; gap: 22px; }
      .subj { width: 150px; padding: 18px 0 14px; border-radius: 26px; background: #f2f8fd; }
      .subj b { display: block; font-family: var(--font-display); font-weight: 600; font-size: 34px; color: var(--blue); }
      .subj span { display: block; margin-top: 6px; font-weight: 600; font-size: 25px; color: var(--ink2); }

      /* ── ซับไทเทิล + ท้ายคลิป ──────────────────────────── */
      .cap { position: absolute; inset: 0; z-index: 55; }
      .capbox { position: absolute; left: 40px; top: 1296px; width: 1000px; height: 240px; border-radius: 34px;
        background: #fff; box-shadow: 0 14px 34px rgba(28,70,104,.16);
        display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 14px; }
      .capline { font-family: var(--font-display); font-weight: 600; font-size: 56px; line-height: 1.2;
        text-align: center; white-space: nowrap; }
      .c-ink { color: var(--ink); }
      .c-pink { color: var(--pinkD); }
      .c-blue { color: var(--blueD); }
      .c-green { color: var(--greenD); }
      .c-orange { color: #cf6f0d; }
      #footer { position: absolute; inset: 0; z-index: 58; }
      #track { position: absolute; left: 40px; top: 1580px; width: 1000px; height: 10px; border-radius: 5px;
        background: rgba(255,255,255,.75); }
      #fill { position: absolute; left: 0; top: 0; height: 100%; width: 100%; border-radius: 5px;
        background: var(--pink); transform-origin: 0 50%; }
      #addr { position: absolute; left: 0; top: 1686px; width: 100%; text-align: center;
        font-family: var(--font-display); font-weight: 500; font-size: 32px; color: #46617a; }
    </style>
  </head>
  <body>
    <div id="root" data-composition-id="main" data-start="0" data-duration="${DUR}"
         data-width="${W}" data-height="${H}">

      <div id="bg">
        <svg id="sky" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg">
          ${cloud(60, 250, 1.1)}
          ${cloud(760, 180, 1.4)}
          ${cloud(-20, 1180, 1.25)}
          ${cloud(820, 1310, 1.0)}
          ${spark(140, 470, 26, "")}
          ${spark(980, 560, 20, "pink")}
          ${spark(70, 980, 18, "white")}
          ${spark(1010, 1120, 24, "")}
          ${spark(880, 760, 15, "white")}
        </svg>
      </div>

      <!-- ฉาก 1 · สะดุด -->
      <div class="clip scene" id="sHook" ${sc("hook")} data-track-index="0" data-track-kind="graphics">
        <div class="stage">
          <div id="hookrow">${frac("hkA", 1, 2, "ink")}<span id="hookvs">หรือ</span>${frac("hkB", 1, 3, "ink")}</div>
          <div id="hookq">${ot("อันไหนมากกว่า ?", "pink")}</div>
        </div>
      </div>

      <!-- ฉาก 2 · ชี้จุดที่คิดพลาด -->
      <div class="clip scene" id="sWrong" ${sc("wrong")} data-track-index="0" data-track-kind="graphics">
        <div class="stage">
          <div id="wrongwrap"><span id="wrongline">${ot("3 มากกว่า 2", "ink")}<i id="strike"></i></span></div>
          <div id="wrongnote">${ot("เทียบเลขล่างตรง ๆ ไม่ได้", "pink")}</div>
        </div>
      </div>

      <!-- ฉาก 3 · เลขล่างคือจำนวนคนที่มาแบ่ง -->
      <div class="clip scene" id="sDenom" ${sc("denom")} data-track-index="0" data-track-kind="graphics">
        <div class="stage">
          <div id="denomwrap">${frac("dnA", 1, 3, "ink lit")}</div>
          <div id="arrow"></div>
          <div id="denomnote">${ot("จำนวนคนที่มาแบ่ง", "blue")}</div>
        </div>
      </div>

      <!-- ฉาก 4 · เค้กสองก้อน -->
      <div class="clip scene" id="sCakes" ${sc("cakes")} data-track-index="0" data-track-kind="graphics">
        <div class="stage">
          <svg class="cakesvg" viewBox="0 0 ${W} 860" xmlns="http://www.w3.org/2000/svg">
            <g id="cakeA">${cake("A", 310, 270, 158, 2)}${people("A", 310, 500, 2)}</g>
            <g id="cakeB">${cake("B", 770, 270, 158, 3)}${people("B", 770, 500, 3)}</g>
          </svg>
          <div class="cakelabel" id="labA">${frac("lbA", 1, 2, "ink sm")}<div class="who">แบ่ง 2 คน</div></div>
          <div class="cakelabel" id="labB">${frac("lbB", 1, 3, "ink sm")}<div class="who">แบ่ง 3 คน</div></div>
          <div class="bartag" id="tagA">ครึ่ง</div>
          <div class="bar2" id="barA"></div>
          <div class="bartag" id="tagB">หนึ่งในสาม</div>
          <div class="bar2" id="barB"></div>
          <div id="verdict">${ot("ครึ่งหนึ่ง &gt; หนึ่งในสาม", "green")}</div>
        </div>
      </div>

      <!-- ฉาก 5 · ทำซ้ำ -->
      <div class="clip scene" id="sEx2" ${sc("ex2")} data-track-index="0" data-track-kind="graphics">
        <div class="stage">
          <svg class="cakesvg" viewBox="0 0 ${W} 860" xmlns="http://www.w3.org/2000/svg">
            <g id="cakeC">${cake("C", 310, 270, 158, 4)}${people("C", 310, 500, 4, 52)}</g>
            <g id="cakeD">${cake("D", 770, 270, 158, 6)}${people("D", 770, 500, 6, 44)}</g>
          </svg>
          <div class="cakelabel lab2" id="labC"><div class="who">แบ่ง 4 คน</div></div>
          <div class="cakelabel lab2" id="labD"><div class="who">แบ่ง 6 คน</div></div>
          <div id="ex2note">${ot("หนึ่งในสี่ &gt; หนึ่งในหก", "green")}</div>
        </div>
      </div>

      <!-- ฉาก 6 · ปิดท้าย -->
      <div class="clip scene" id="sCta" ${sc("cta")} data-track-index="0" data-track-kind="graphics">
        <div class="stage">
          <div id="ctacard">
            <div id="ctatitle">${ot("ลูกติดตรงไหน ครูรู้ตรงนั้น", "blue")}</div>
            <div id="ctaline">ประเมินพื้นฐานฟรี · รู้จุดที่ควรเสริม</div>
            <div id="ctaphone">065-447-4691</div>
            <div id="ctasubjects">
              <div class="subj"><b>+ − × ÷</b><span>คณิตศาสตร์</span></div>
              <div class="subj"><b>ABC</b><span>ภาษาอังกฤษ</span></div>
              <div class="subj"><b>ก ข ค</b><span>ภาษาไทย</span></div>
            </div>
          </div>
        </div>
      </div>

      <!-- หัวคลิป -->
      <div class="clip" id="header" data-start="0" data-duration="${DUR}" data-track-index="3" data-track-kind="graphics">
        <div id="chip"><i id="chipicon">+−×÷</i><span>คณิต ป.4</span><em>เศษส่วน</em></div>
        <div id="dots">${dots}</div>
      </div>

      <!-- ซับไทเทิล -->${captions}

      <!-- เสียงพากย์ -->${audios}

      <!-- ท้ายคลิป -->
      <div class="clip" id="footer" data-start="0" data-duration="${DUR}" data-track-index="4" data-track-kind="graphics">
        <div id="track"><div id="fill"></div></div>
        <div id="addr">Bright Up Kids · ซอยวัดหลวงพ่อโต บางพลี</div>
      </div>
    </div>

    <script>
      const T = ${JSON.stringify(T)};
      const DUR = ${DUR};
      const tl = gsap.timeline({ paused: true });
      const set = (t, el, v) => tl.set(el, v, t);
      /* ฉากเข้า-ออก: ขยับลูกข้างใน ไม่แตะ .clip เอง ตามสัญญาของ HyperFrames */
      const scene = (sel, inAt, outAt) => {
        tl.fromTo(sel + " .stage", { opacity: 0, y: 30, scale: .97 },
          { opacity: 1, y: 0, scale: 1, duration: .5, ease: "back.out(1.3)" }, inAt);
        tl.to(sel + " .stage", { opacity: 0, y: -24, duration: .38, ease: "power2.in" }, outAt);
      };

      tl.fromTo("#fill", { scaleX: 0 }, { scaleX: 1, duration: DUR, ease: "none" }, 0);

      /* เมฆลอยช้า ๆ กับดาวกะพริบ — ให้พื้นหลังไม่นิ่งสนิท */
      gsap.utils.toArray("#sky .cloud").forEach((el, i) => {
        tl.to(el, { x: 34, duration: 5 + i, yoyo: true, repeat: 8, ease: "sine.inOut" }, 0);
      });
      gsap.utils.toArray("#sky .spark").forEach((el, i) => {
        tl.fromTo(el, { scale: .75, transformOrigin: "50% 50%" },
          { scale: 1.15, duration: 1.1 + i * .2, yoyo: true, repeat: 24, ease: "sine.inOut" }, i * .3);
      });

      T.forEach((t, i) => {
        tl.to("#dot" + i, { backgroundColor: "#ed2a86", opacity: 1, scale: 1.35, duration: .25, ease: "back.out(2)" }, t);
        if (i > 0) tl.to("#dot" + (i - 1), { scale: 1, opacity: .75, backgroundColor: "#ffffff", duration: .25 }, t);
      });

      /* ── ฉาก 1 · สะดุด ──────────────────────────────────── */
      scene("#sHook", 0.1, 3.0);
      tl.fromTo("#hkA", { y: -80, opacity: 0 }, { y: 0, opacity: 1, duration: .6, ease: "back.out(1.6)" }, .25);
      tl.fromTo("#hookvs", { opacity: 0 }, { opacity: 1, duration: .3 }, .62);
      tl.fromTo("#hkB", { y: -80, opacity: 0 }, { y: 0, opacity: 1, duration: .6, ease: "back.out(1.6)" }, .72);
      tl.fromTo("#hookq", { opacity: 0, scale: .86 }, { opacity: 1, scale: 1, duration: .5, ease: "back.out(2)" }, 1.2);

      /* ── ฉาก 2 · ชี้จุดที่คิดพลาด ───────────────────────── */
      scene("#sWrong", T[1] - .2, T[2] - .4);
      set(0, "#strike", { scaleX: 0 });
      set(0, "#wrongnote", { opacity: 0 });
      tl.to("#strike", { scaleX: 1, duration: .4, ease: "power3.inOut" }, T[1] + 1.5);
      tl.fromTo("#wrongnote", { opacity: 0, y: 18 }, { opacity: 1, y: 0, duration: .42 }, T[1] + 1.95);

      /* ── ฉาก 3 · เลขล่างคืออะไร ─────────────────────────── */
      scene("#sDenom", T[2] - .2, T[3] - .4);
      set(0, "#arrow", { scaleY: 0 });
      set(0, "#denomnote", { opacity: 0 });
      tl.to("#arrow", { scaleY: 1, duration: .42, ease: "power3.out" }, T[2] + 1.1);
      tl.fromTo("#denomnote", { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: .42 }, T[2] + 1.5);

      /* ── ฉาก 4 · เค้ก ───────────────────────────────────── */
      scene("#sCakes", T[3] - .2, T[6] - .4);
      /* อย่า scale <path> ใน SVG — GSAP คิดจุดหมุนจากกรอบของ path เอง
         พอจบที่ scale 1 ยังเหลือการเลื่อนค้าง ชิ้นเค้กเลยหลุดออกนอกวง
         ใช้ความหนาเส้นขอบเด้งแทน ได้ความรู้สึก "ป๊อป" เหมือนกันและไม่ขยับ */
      set(0, ["#Aslice", "#Bslice"], { opacity: 0 });
      set(0, ["#labA", "#labB", "#verdict"], { opacity: 0 });
      set(0, ["#barA", "#barB"], { opacity: 0, scaleX: 0 });
      set(0, ["#tagA", "#tagB"], { opacity: 0 });

      /* คนมาต่อแถวก่อน แล้วค่อยรู้ว่าต้องแบ่งกี่ชิ้น */
      ["#Ap0", "#Ap1"].forEach((s, i) =>
        tl.fromTo(s, { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: .4, ease: "back.out(2)" }, T[3] + .45 + i * .14));
      ["#Bp0", "#Bp1", "#Bp2"].forEach((s, i) =>
        tl.fromTo(s, { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: .4, ease: "back.out(2)" }, T[3] + .45 + i * .14));
      tl.fromTo("#labA", { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: .42 }, T[3] + 1.15);
      tl.fromTo("#labB", { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: .42 }, T[3] + 1.35);

      /* จุดพลิก: ระบายชิ้นที่แต่ละคนได้ แล้วเทียบความยาวให้เห็นกับตา */
      tl.fromTo("#Aslice", { opacity: 0, strokeWidth: 22 }, { opacity: 1, strokeWidth: 6, duration: .5, ease: "power3.out" }, T[4] + .2);
      tl.fromTo("#Bslice", { opacity: 0, strokeWidth: 22 }, { opacity: 1, strokeWidth: 6, duration: .5, ease: "power3.out" }, T[4] + .55);
      /* ป้ายใต้เค้กหมดหน้าที่แล้ว ต้องเก็บก่อนแถบเทียบขึ้น ไม่งั้นทับกัน */
      tl.to(["#labA", "#labB"], { opacity: 0, duration: .32 }, T[4] + .9);
      tl.to(["#tagA", "#tagB"], { opacity: 1, duration: .3 }, T[4] + 1.0);
      tl.fromTo("#barA", { scaleX: 0, opacity: 1 }, { scaleX: 1, duration: .55, ease: "power3.out" }, T[4] + 1.05);
      tl.fromTo("#barB", { scaleX: 0, opacity: 1 }, { scaleX: 1, duration: .55, ease: "power3.out" }, T[4] + 1.35);

      /* เฉลย */
      tl.to(["#barA", "#barB", "#tagA", "#tagB"], { opacity: 0, duration: .3 }, T[5] + .35);
      tl.fromTo("#verdict", { opacity: 0, scale: .85 }, { opacity: 1, scale: 1, duration: .55, ease: "back.out(2)" }, T[5] + .45);

      /* ── ฉาก 5 · ทำซ้ำ ──────────────────────────────────── */
      scene("#sEx2", T[6] - .2, T[7] - .4);
      set(0, ["#Cslice", "#Dslice", "#ex2note"], { opacity: 0 });
      tl.fromTo("#Cslice", { opacity: 0 }, { opacity: 1, duration: .35 }, T[6] + .5);
      tl.fromTo("#Dslice", { opacity: 0 }, { opacity: 1, duration: .35 }, T[6] + .8);
      tl.fromTo("#ex2note", { opacity: 0, scale: .88 }, { opacity: 1, scale: 1, duration: .5, ease: "back.out(2)" }, T[6] + 1.5);

      /* ── ฉาก 6 · ปิดท้าย ────────────────────────────────── */
      tl.fromTo("#sCta .stage", { opacity: 0, y: 30, scale: .96 },
        { opacity: 1, y: 0, scale: 1, duration: .55, ease: "back.out(1.4)" }, T[7] - .2);
      tl.fromTo("#ctaphone", { scale: .88, opacity: 0 }, { scale: 1, opacity: 1, duration: .5, ease: "back.out(2.2)" }, T[7] + .55);
      tl.fromTo("#ctasubjects .subj", { opacity: 0, y: 18 },
        { opacity: 1, y: 0, duration: .4, stagger: .1, ease: "power2.out" }, T[7] + .85);

      /* ── ซับไทเทิล ──────────────────────────────────────── */
      T.forEach((t, i) => {
        tl.fromTo("#cap" + i + " .capbox", { opacity: 0, y: 18 }, { opacity: 1, y: 0, duration: .32, ease: "back.out(1.5)" }, t);
        tl.fromTo("#cap" + i + " .l0", { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: .38 }, t);
        tl.fromTo("#cap" + i + " .l1", { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: .38 }, t + .1);
      });

      window.__timelines["main"] = tl;
      tl.seek(0);
    <\/script>
  </body>
</html>
`;

await writeFile("index.html", html);
console.log("เขียน index.html แล้ว ·", html.length, "ตัวอักษร · ยาว", DUR, "วินาที · จังหวะ", T.join(", "));
