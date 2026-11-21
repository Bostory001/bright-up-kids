// cutout-kit.js (genhaha-cutout-explainer engine — do not edit; add your own props in a <script> after this file via Cutout.PROPS.name = fn) — "paper cutout / felt applique" explainer kit (classic script; SVG + GSAP + Motion only: no images, no WebGL).
// Style studied from a Thai what-if explainer (ref1): flat pastel felt shapes with a paper-grain overlay, soft drop shadows, polka/stripe/checker
// backgrounds, a white round-head character with big glasses + blush + stick limbs + white gloves in a yellow dress, UI cards, pill badges, pops with overshoot,
// diagonal wipes / split curtains between 3–5 s vignettes. Everything is a pure function of the GSAP timeline (seeded PRNG, no Math.random / Date).
//
//   <script src="cutout-kit.js"></script>  after motion.js and captions.js, with cutout.css; <div id="stage"> must exist (the kit builds an <svg> in it)
//   const K = Cutout(tl, M);                                   // M = Motion(tl)
//   const L = K.scene("hook", "room", { enter: "cut" });       // one scene per <section data-shot="hook" id="sc-hook">; bg: sky grass polka checker night factory room grid plain
//   const bulb = L.add(K.prop("bulb", { on: false }), 700, 520, { s: 1.6, t: at("h1"), anim: "pop" });   // any prop (K.PROPS) / any svg string; anim: pop drop fade slide:l|r|u|d none
//   const hero = L.char({ x: 215, y: 1300 });         // the round-glasses host
//   hero.say("h1"); hero.pose("shock", at("h2"), 0.3); hero.face(at("h2"), "shock");
//   K.pill(L, "ไฟดับ!", 540, 330, { t: at("h2"), bg: "#ff5a5f" });   K.card(…)  K.counter(…)  K.matrix(L, …)  K.split(L, …)  K.choice(L, …)  K.closeup(L, …)
//   M.subtitles({ avTop: null });                               // karaoke subtitles (css --sub-top)
// World = 1080×1920 screen space. Floor line for the host ≈ y 1300 (subtitles start at y 1330). Items are drawn around their own (0,0): place with x,y,s,rot.
(function () {
  const NS = "http://www.w3.org/2000/svg";
  const INK = "#2b2b2b", GLASS = "#1b1b1b", SKIN = "#f6f1e6";
  const PAL = { ink: INK, red: "#ff5a5f", coral: "#ff6f61", yellow: "#ffd23a", sun: "#ffbf1f", orange: "#ff9a2f", green: "#3fcf8e", grass: "#6cc04a", teal: "#2fb7b0", sky: "#6ec6f2", blue: "#3d86d9", navy: "#1a1e4a", purple: "#8a5bd6", pink: "#ff7eb6", paper: "#fff7e8", white: "#ffffff", grey: "#c9ced8" };
  const rngf = (seed) => { let a = (seed >>> 0) || 1; return () => { a = (a + 0x6d2b79f5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; };
  const vis = (s) => [...String(s)].filter((c) => !/[ัิ-ฺ็-๎]/.test(c)).length;      // Thai: count only base glyphs (no tone/vowel marks) for width estimates
  const f1 = (n) => Math.round(n * 10) / 10;
  const st = (w = 0, c = INK) => (w ? `stroke="${c}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"` : "");
  const FONT = `font-family="Kanit, sans-serif"`;
  const txt = (s, x, y, size, fill, o = {}) => `<text x="${x}" y="${y}" ${FONT} font-weight="${o.w ?? 800}" font-size="${size}" fill="${fill}" text-anchor="${o.a ?? "middle"}" ${o.stroke ? `stroke="${o.stroke}" stroke-width="${o.sw ?? 8}" paint-order="stroke" stroke-linejoin="round"` : ""} ${o.extra ?? ""}>${s}</text>`;
  // darker/lighter shade of a #rrggbb colour (felt layering: a shape + a slightly darker lower shape)
  const shade = (hex, k) => { const n = parseInt(hex.slice(1), 16), c = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((v) => Math.max(0, Math.min(255, Math.round(k < 0 ? v * (1 + k) : v + (255 - v) * k)))); return "#" + c.map((v) => v.toString(16).padStart(2, "0")).join(""); };

  // ======================================================================= props (each returns svg centred on 0,0 · ~200–300 px at s=1) =======================================================================
  const PROPS = {};
  const P = (name, desc, fn) => { PROPS[name] = Object.assign(fn, { desc }); };
  P("phone", "มือถือ (screen: dead|battery|lock|alarm|app|bank|map · pct · color)", (o = {}) => {
    const w = 190, h = 360, scr = o.screen ?? "lock", c = o.color ?? "#2c3250";
    const screens = {
      dead: `<rect x="-86" y="-166" width="172" height="332" rx="22" fill="#14161f"/><path d="M-86 -166 L-20 -166 L-86 -40Z" fill="#fff" opacity="0.06"/>`,
      battery: `<rect x="-86" y="-166" width="172" height="332" rx="22" fill="#14161f"/><rect x="-46" y="-34" width="86" height="48" rx="10" fill="none" stroke="#ff5a5f" stroke-width="7"/><rect x="42" y="-20" width="9" height="20" rx="3" fill="#ff5a5f"/><rect x="-40" y="-28" width="14" height="36" rx="4" fill="#ff5a5f"/>${txt(o.pct ?? "0%", 0, 74, 54, "#ff5a5f")}`,
      lock: `<defs><linearGradient id="phg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#7a4dd8"/><stop offset="1" stop-color="#e65ab5"/></linearGradient></defs><rect x="-86" y="-166" width="172" height="332" rx="22" fill="url(#phg)"/>${txt(o.time ?? "06:30", 0, -84, 50, "#fff")}${txt(o.sub ?? "อรุณสวัสดิ์", 0, -40, 20, "#fff", { w: 600 })}<circle cx="-24" cy="116" r="44" fill="#fff" opacity="0.18"/><circle cx="24" cy="116" r="44" fill="#fff" opacity="0.18"/>`,
      alarm: `<rect x="-86" y="-166" width="172" height="332" rx="22" fill="#ffd23a"/><path d="M0 -70 q-44 0 -44 50 v34 l-14 16 h116 l-14 -16 v-34 q0 -50 -44 -50z" fill="#fff"/><circle cx="0" cy="52" r="12" fill="#fff"/>${txt(o.time ?? "06:30", 0, 120, 38, "#2b2b2b")}`,
      app: `<rect x="-86" y="-166" width="172" height="332" rx="22" fill="#eef3fb"/><rect x="-86" y="-166" width="172" height="62" rx="22" fill="${o.accent ?? "#3d86d9"}"/>${[0, 1, 2, 3].map((i) => `<rect x="${-70 + (i % 2) * 74}" y="${-82 + Math.floor(i / 2) * 84}" width="66" height="72" rx="14" fill="${["#ff7eb6", "#3fcf8e", "#ffd23a", "#8a5bd6"][i]}"/>`).join("")}`,
      bank: `<rect x="-86" y="-166" width="172" height="332" rx="22" fill="#eafaf2"/><rect x="-86" y="-166" width="172" height="62" rx="22" fill="#2fb77d"/>${txt(o.text ?? "฿0.00", 0, 22, 46, o.red === false ? "#2b2b2b" : "#ff5a5f")}${txt("ยอดเงิน", 0, -52, 22, "#fff", { w: 600 })}`,
      map: `<rect x="-86" y="-166" width="172" height="332" rx="22" fill="#dff3e0"/><path d="M-86 -40 H86 M-20 -166 V166 M40 -166 V166 M-86 60 H86" stroke="#fff" stroke-width="12"/><circle cx="12" cy="10" r="14" fill="#3d86d9" stroke="#fff" stroke-width="5"/>`,
    };
    return `<rect x="-95" y="-180" width="190" height="360" rx="34" fill="${c}"/><rect x="-95" y="-180" width="190" height="360" rx="34" fill="none" stroke="${shade(c, 0.25)}" stroke-width="4"/>${screens[scr] ?? screens.lock}<rect x="-30" y="-176" width="60" height="14" rx="7" fill="${c}"/>`;
  });
  P("clock", "นาฬิกาแขวน (h, m, dead)", (o = {}) => {
    const h = o.h ?? 6, m = o.m ?? 30, ha = ((h % 12) + m / 60) * 30, ma = m * 6;
    return `<circle r="112" fill="${o.rim ?? "#ff9a2f"}"/><circle r="94" fill="#fff7e8"/>${Array.from({ length: 12 }, (_, i) => `<rect x="-3" y="-88" width="6" height="${i % 3 === 0 ? 18 : 10}" rx="3" fill="#b9a98a" transform="rotate(${i * 30})"/>`).join("")}<g class="hands" ${o.dead ? "" : ""}><rect x="-5" y="-56" width="10" height="62" rx="5" fill="#2b2b2b" transform="rotate(${ha})"/><rect x="-4" y="-80" width="8" height="86" rx="4" fill="#2b2b2b" transform="rotate(${ma})"/></g><circle r="9" fill="${o.dead ? "#ff5a5f" : "#2b2b2b"}"/>${o.dead ? `<path d="M-40 -40 L40 40 M40 -40 L-40 40" stroke="#ff5a5f" stroke-width="12" stroke-linecap="round" opacity="0.9"/>` : ""}`;
  });
  P("bulb", "หลอดไฟ (on)", (o = {}) => {
    const on = o.on ?? true;
    return `<g class="glow" opacity="${on ? 1 : 0}"><circle r="150" fill="#ffe27a" opacity="0.28"/><circle r="105" fill="#ffe27a" opacity="0.35"/>${Array.from({ length: 10 }, (_, i) => `<rect x="-5" y="-176" width="10" height="34" rx="5" fill="#ffd23a" transform="rotate(${i * 36 + 18})"/>`).join("")}</g>
      <rect x="-30" y="76" width="60" height="22" rx="6" fill="#9aa3b5"/><rect x="-24" y="96" width="48" height="18" rx="6" fill="#7b8499"/><path d="M-24 76 q-48 -46 -48 -100 a72 72 0 0 1 144 0 q0 54 -48 100z" fill="#dfe6f2"/><path d="M-24 76 q-48 -46 -48 -100 a72 72 0 0 1 144 0 q0 54 -48 100z" class="on" fill="#ffd84a" opacity="${on ? 1 : 0}"/><path d="M-16 74 V4 q0 -34 16 -34 q16 0 16 34 V74" fill="none" stroke="${on ? "#ff9a2f" : "#9aa3b5"}" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"/><ellipse cx="-34" cy="-40" rx="10" ry="26" fill="#fff" opacity="0.55" transform="rotate(18 -34 -40)"/>`;
  });
  P("switch", "สวิตช์ไฟติดผนัง (on)", (o = {}) => `<rect x="-58" y="-86" width="116" height="172" rx="22" fill="#f4f1ea"/><rect x="-58" y="-86" width="116" height="172" rx="22" fill="none" stroke="#cdc6b6" stroke-width="5"/><rect x="-30" y="-52" width="60" height="104" rx="14" fill="#dcd5c4"/><g class="tog"><rect x="-22" y="${o.on ? -44 : -4}" width="44" height="48" rx="10" fill="#fff"/></g><circle cx="0" cy="-70" r="5" fill="#cdc6b6"/><circle cx="0" cy="70" r="5" fill="#cdc6b6"/>`);
  P("fridge", "ตู้เย็น (open)", (o = {}) => {
    const c = o.color ?? "#d6ecf7";
    return o.open ? `<rect x="-90" y="-170" width="180" height="340" rx="22" fill="${shade(c, -0.12)}"/><rect x="-74" y="-154" width="148" height="308" rx="12" fill="#f7fdff"/>${[-100, -22, 56].map((y) => `<rect x="-74" y="${y}" width="148" height="9" fill="#bfe0f0"/>`).join("")}<path d="M-90 -170 L-150 -150 L-150 150 L-90 170Z" fill="${c}"/><rect x="-142" y="-20" width="9" height="50" rx="4" fill="#9aa3b5"/>
      <g class="food"><rect x="-56" y="-142" width="34" height="42" rx="5" fill="#fff"/><rect x="-56" y="-142" width="34" height="14" fill="#3d86d9"/><ellipse cx="22" cy="-118" rx="26" ry="18" fill="#ffb347"/><circle cx="-34" cy="-60" r="17" fill="#ff5a5f"/><circle cx="2" cy="-62" r="15" fill="#6cc04a"/><path d="M26 -52 q24 -14 44 0 q-20 14 -44 0z" fill="#8fd0f0"/><circle cx="-30" cy="22" r="13" fill="#ffd23a"/><circle cx="-6" cy="24" r="13" fill="#fff"/><circle cx="18" cy="22" r="13" fill="#ffd23a"/></g>` :
      `<rect x="-90" y="-170" width="180" height="340" rx="22" fill="${c}"/><rect x="-90" y="-72" width="180" height="8" fill="${shade(c, -0.15)}"/><rect x="-70" y="-130" width="12" height="46" rx="6" fill="#9aa3b5"/><rect x="-70" y="-46" width="12" height="70" rx="6" fill="#9aa3b5"/><rect x="-80" y="-160" width="160" height="14" rx="7" fill="#fff" opacity="0.4"/>${txt("❄", 36, -112, 40, "#8fd0f0")}`;
  });
  P("thermo", "เทอร์โมมิเตอร์ (level 0–1, color)", (o = {}) => {
    const lv = o.level ?? 0.5, c = o.color ?? "#ff5a5f";
    return `<rect x="-26" y="-150" width="52" height="250" rx="26" fill="#f2f4f8"/><rect x="-26" y="-150" width="52" height="250" rx="26" fill="none" stroke="#c9ced8" stroke-width="5"/><circle cy="108" r="46" fill="${c}"/><g><rect class="mer" x="-10" y="${f1(90 - lv * 220)}" width="20" height="${f1(lv * 220 + 20)}" rx="10" fill="${c}"/></g>${[0, 1, 2, 3, 4].map((i) => `<rect x="32" y="${-120 + i * 42}" width="${i % 2 ? 16 : 26}" height="5" rx="2.5" fill="#9aa3b5"/>`).join("")}`;
  });
  P("car", "รถยนต์ด้านข้าง (color, face)", (o = {}) => {
    const c = o.color ?? "#ff5a5f";
    return `<rect x="-140" y="-34" width="280" height="76" rx="26" fill="${c}"/><path d="M-84 -34 q10 -62 70 -62 h44 q44 0 64 62z" fill="${c}"/><path d="M-70 -38 q8 -44 52 -44 h26 v44z M24 -38 v-44 h22 q30 0 44 44z" fill="#bfe8fb"/><rect x="-140" y="12" width="280" height="30" rx="12" fill="${shade(c, -0.18)}"/><rect x="120" y="-20" width="22" height="22" rx="8" fill="#fff0a0"/><rect x="-142" y="-18" width="16" height="16" rx="6" fill="#ff9a2f"/>${[-82, 82].map((x) => `<circle cx="${x}" cy="46" r="34" fill="#2b2b2b"/><circle cx="${x}" cy="46" r="15" fill="#c9ced8"/>`).join("")}`;
  });
  P("trafficlight", "ไฟจราจร (lit: r|y|g|none)", (o = {}) => {
    const lit = o.lit ?? "none";
    return `<rect x="-9" y="40" width="18" height="190" fill="#7b8499"/><rect x="-44" y="-130" width="88" height="180" rx="24" fill="#3a3f55"/>${[["r", "#ff5a5f", -86], ["y", "#ffd23a", -36], ["g", "#3fcf8e", 14]].map(([k, col, y]) => `<circle cy="${y}" r="21" fill="${lit === k ? col : shade("#3a3f55", 0.12)}"/>`).join("")}`;
  });
  P("atm", "ตู้ ATM (text, red)", (o = {}) => `<rect x="-100" y="-170" width="200" height="340" rx="24" fill="#3d86d9"/><rect x="-80" y="-148" width="160" height="110" rx="12" fill="${o.dead ? "#14161f" : "#dff3e0"}"/>${o.dead ? `<path d="M-30 -120 L30 -64 M30 -120 L-30 -64" stroke="#ff5a5f" stroke-width="12" stroke-linecap="round"/>` : txt(o.text ?? "฿", 0, -70, 54, "#2fb77d")}<rect x="-70" y="-14" width="140" height="46" rx="8" fill="#2c6fbd"/>${Array.from({ length: 9 }, (_, i) => `<rect x="${-62 + (i % 3) * 44}" y="${48 + Math.floor(i / 3) * 34}" width="36" height="26" rx="6" fill="#dfe9f7"/>`).join("")}<rect x="-50" y="-8" width="100" height="14" rx="4" fill="#14161f"/>`);
  P("hospital", "โรงพยาบาล", (o = {}) => `<rect x="-130" y="-70" width="260" height="190" rx="14" fill="#fff"/><rect x="-130" y="-70" width="260" height="30" fill="#eef3fb"/><rect x="-36" y="-150" width="72" height="72" rx="14" fill="#ff5a5f"/><rect x="-8" y="-140" width="16" height="52" rx="3" fill="#fff"/><rect x="-26" y="-122" width="52" height="16" rx="3" fill="#fff"/>${[-100, 52].map((x) => [-20, 40].map((y) => `<rect x="${x}" y="${y}" width="48" height="40" rx="6" fill="${o.lit === false ? "#9aa3b5" : "#ffe27a"}"/>`).join("")).join("")}<rect x="-26" y="52" width="52" height="68" rx="6" fill="#8fd0f0"/>`);
  P("battery", "แบตเตอรี่ (pct 0–1, color)", (o = {}) => {
    const p = o.pct ?? 0.5, c = o.color ?? (p < 0.25 ? "#ff5a5f" : "#3fcf8e");
    return `<rect x="-110" y="-60" width="210" height="120" rx="22" fill="#f2f4f8"/><rect x="-110" y="-60" width="210" height="120" rx="22" fill="none" stroke="#2b2b2b" stroke-width="8"/><rect x="100" y="-24" width="22" height="48" rx="8" fill="#2b2b2b"/><rect class="lvl" x="-98" y="-48" width="${f1(186 * p)}" height="96" rx="12" fill="${c}"/>`;
  });
  P("bolt", "สายฟ้า/ไฟฟ้า (color)", (o = {}) => `<path d="M18 -130 L-62 18 H-6 L-26 130 L66 -30 H8Z" fill="${o.color ?? "#ffd23a"}" stroke="${shade(o.color ?? "#ffd23a", -0.25)}" stroke-width="6" stroke-linejoin="round"/>`);
  P("plug", "ปลั๊ก (out)", (o = {}) => `<g transform="rotate(${o.rot ?? 0})"><path d="M0 70 q-70 60 -140 20" fill="none" stroke="#2b2b2b" stroke-width="12" stroke-linecap="round"/><rect x="-44" y="-48" width="88" height="124" rx="22" fill="#e9edf5"/><rect x="-26" y="-98" width="14" height="56" rx="5" fill="#9aa3b5"/><rect x="12" y="-98" width="14" height="56" rx="5" fill="#9aa3b5"/></g>`);
  P("star", "ดาว (color)", (o = {}) => `<path d="M0 -60 L17 -20 L60 -17 L27 11 L38 54 L0 30 L-38 54 L-27 11 L-60 -17 L-17 -20Z" fill="${o.color ?? "#ffe27a"}" stroke="${shade(o.color ?? "#ffe27a", -0.2)}" stroke-width="5" stroke-linejoin="round"/>`);
  P("moon", "พระจันทร์เสี้ยว", () => `<path d="M30 -100 a100 100 0 1 0 60 160 a84 84 0 0 1 -60 -160z" fill="#fff3b0"/><circle cx="-34" cy="-20" r="14" fill="#f0e08a" opacity="0.7"/><circle cx="-10" cy="44" r="9" fill="#f0e08a" opacity="0.7"/>`);
  P("sun", "ดวงอาทิตย์", () => `<circle r="72" fill="#ffd23a"/>${Array.from({ length: 12 }, (_, i) => `<rect x="-6" y="-118" width="12" height="30" rx="6" fill="#ffbf1f" transform="rotate(${i * 30})"/>`).join("")}<circle cx="-24" cy="-8" r="6" fill="#2b2b2b"/><circle cx="24" cy="-8" r="6" fill="#2b2b2b"/><path d="M-22 22 q22 20 44 0" fill="none" stroke="#2b2b2b" stroke-width="6" stroke-linecap="round"/>`);
  P("cloud", "เมฆ (color)", (o = {}) => `<g fill="${o.color ?? "#fff"}"><circle cx="-60" cy="10" r="46"/><circle cx="-8" cy="-14" r="62"/><circle cx="54" cy="6" r="48"/><rect x="-106" y="6" width="212" height="50" rx="25"/></g><rect x="-100" y="30" width="200" height="26" rx="13" fill="#000" opacity="0.05"/>`);
  P("calendar", "ปฏิทิน (top, day, color)", (o = {}) => `<rect x="-90" y="-100" width="180" height="200" rx="22" fill="#fff"/><path d="M-90 -78 a22 22 0 0 1 22 -22 h136 a22 22 0 0 1 22 22 v34 h-180z" fill="${o.color ?? "#ff5a5f"}"/>${txt(o.top ?? "จันทร์", 0, -56, 30, "#fff")}${txt(o.day ?? "1", 0, 48, 96, "#2b2b2b")}<circle cx="-48" cy="-100" r="9" fill="#2b2b2b"/><circle cx="48" cy="-100" r="9" fill="#2b2b2b"/>`);
  P("coin", "เหรียญ (label)", (o = {}) => `<circle r="80" fill="#ffd23a"/><circle r="80" fill="none" stroke="#e0a418" stroke-width="8"/><circle r="58" fill="none" stroke="#e0a418" stroke-width="5"/>${txt(o.label ?? "฿", 0, 28, 80, "#c98a0c")}`);
  P("pizza", "พิซซ่า (slices, cut)", (o = {}) => `<circle r="120" fill="#f6c36b"/><circle r="100" fill="#ff7a4d"/><circle r="94" fill="#ffd36e" opacity="0.55"/>${[[-40, -50], [46, -30], [-10, 40], [62, 54], [-62, 30], [10, -86]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="17" fill="#d6364a"/>`).join("")}${(o.cut ?? [0, 80, 150, 200, 280]).map((a) => `<path d="M0 0 L0 -118" stroke="#a8512c" stroke-width="5" transform="rotate(${a})"/>`).join("")}`);
  P("ruler", "ไม้บรรทัด (len, label)", (o = {}) => { const L = o.len ?? 280; return `<rect x="${-L / 2}" y="-34" width="${L}" height="68" rx="10" fill="#ffd23a"/>${Array.from({ length: Math.floor(L / 20) + 1 }, (_, i) => `<rect x="${-L / 2 + 10 + i * 20}" y="-34" width="4" height="${i % 5 === 0 ? 30 : 18}" fill="#8a6a10"/>`).join("")}${o.label ? txt(o.label, 0, 28, 24, "#8a6a10") : ""}`; });
  P("bridge", "สะพาน (bend 0–1, load)", (o = {}) => `<g transform="rotate(${(o.bend ?? 0) * 7} 0 0)"><rect x="-220" y="-10" width="440" height="30" rx="8" fill="#ff9a2f"/><rect x="-220" y="14" width="440" height="12" fill="#c76a12"/>${[-170, -60, 60, 170].map((x) => `<rect x="${x - 12}" y="26" width="24" height="120" fill="#9aa3b5"/>`).join("")}</g>`);
  P("cpu", "ชิป CPU (label)", (o = {}) => `${Array.from({ length: 6 }, (_, i) => `<rect x="${-66 + i * 26}" y="-104" width="10" height="208" rx="4" fill="#c9ced8"/><rect x="-104" y="${-66 + i * 26}" width="208" height="10" rx="4" fill="#c9ced8"/>`).join("")}<rect x="-76" y="-76" width="152" height="152" rx="20" fill="#3a3f66"/><rect x="-60" y="-60" width="120" height="120" rx="12" fill="#6a5cd6"/>${txt(o.label ?? "CPU", 0, 16, 44, "#fff")}`);
  P("map", "แผนที่ + หมุด (w, h, pin)", (o = {}) => { const w = o.w ?? 300, h = o.h ?? 300; return `<rect x="${-w / 2}" y="${-h / 2}" width="${w}" height="${h}" rx="18" fill="#dff3e0"/><path d="M${-w / 2} -20 H${w / 2} M-40 ${-h / 2} V${h / 2} M70 ${-h / 2} V${h / 2} M${-w / 2} 70 H${w / 2}" stroke="#fff" stroke-width="16"/><rect x="-120" y="-110" width="60" height="50" rx="8" fill="#c8e8ff"/><rect x="90" y="30" width="46" height="56" rx="8" fill="#ffe3a8"/>${o.pin === false ? "" : `<path class="pin" d="M10 10 q-40 -50 0 -70 q40 20 0 70z" fill="#ff5a5f"/><circle cx="10" cy="-44" r="9" fill="#fff"/>`}`; });
  P("earth", "โลก", () => `<circle r="110" fill="#4aa8ef"/><path d="M-70 -50 q30 -40 60 -10 q10 30 -20 40 q-30 -10 -40 -30z M20 20 q40 -20 60 20 q0 40 -40 50 q-30 -30 -20 -70z M-60 50 q20 -10 30 10 q-10 20 -30 10z" fill="#5fc455"/><circle r="110" fill="none" stroke="#2b7cc4" stroke-width="6"/><ellipse cx="-40" cy="-60" rx="30" ry="16" fill="#fff" opacity="0.35" transform="rotate(-30 -40 -60)"/>`);
  P("qmark", "เครื่องหมาย ? (color)", (o = {}) => `<path d="M-46 -64 q4 -56 52 -56 q54 0 54 50 q0 30 -34 52 q-18 12 -18 34 v8" fill="none" stroke="${o.color ?? "#ff5a5f"}" stroke-width="30" stroke-linecap="round" stroke-linejoin="round"/><circle cx="2" cy="104" r="19" fill="${o.color ?? "#ff5a5f"}"/>`);
  P("xmark", "กากบาท (color)", (o = {}) => `<path d="M-62 -62 L62 62 M62 -62 L-62 62" stroke="${o.color ?? "#ff5a5f"}" stroke-width="30" stroke-linecap="round"/>`);
  P("check", "เครื่องหมายถูก (color)", (o = {}) => `<circle r="70" fill="${o.color ?? "#3fcf8e"}"/><path d="M-34 4 L-8 32 L38 -26" fill="none" stroke="#fff" stroke-width="18" stroke-linecap="round" stroke-linejoin="round"/>`);
  P("wifi", "สัญญาณ wifi (color)", (o = {}) => `<g fill="none" stroke="${o.color ?? "#3d86d9"}" stroke-width="20" stroke-linecap="round"><path d="M-90 -20 a130 130 0 0 1 180 0"/><path d="M-56 22 a80 80 0 0 1 112 0"/></g><circle cy="62" r="16" fill="${o.color ?? "#3d86d9"}"/>`);
  P("tree", "ต้นไม้", (o = {}) => `<rect x="-14" y="20" width="28" height="120" rx="8" fill="#8a5a2b"/><circle cx="-44" cy="-10" r="54" fill="${o.color ?? "#4cb04a"}"/><circle cx="44" cy="-10" r="54" fill="${o.color ?? "#4cb04a"}"/><circle cy="-52" r="64" fill="${shade(o.color ?? "#4cb04a", 0.12)}"/>`);
  P("house", "บ้านเล็ก (color)", (o = {}) => `<rect x="-90" y="-30" width="180" height="130" fill="${o.color ?? "#ffe3a8"}"/><path d="M-110 -26 L0 -118 L110 -26Z" fill="#e0543f"/><rect x="-22" y="30" width="44" height="70" rx="6" fill="#8a5a2b"/><rect x="38" y="-6" width="38" height="38" rx="5" fill="${o.lit === false ? "#9aa3b5" : "#ffe27a"}"/>`);
  P("skyline", "ตึกเมือง (w, lit 0–1, seed, colors) — ช่องหน้าต่างปิดทีละดวงด้วย K.blackout", (o = {}) => {
    const r = rngf(o.seed ?? 7), W = o.w ?? 1080, n = Math.round(W / 110), cols = o.colors ?? ["#4d5a9c", "#5b6bb0", "#3e4a86", "#6a78b8"];
    let x = -W / 2, out = "";
    for (let i = 0; i < n; i++) {
      const bw = 90 + r() * 60, bh = 200 + r() * 360, c = cols[i % cols.length];
      out += `<rect x="${f1(x)}" y="${f1(-bh)}" width="${f1(bw)}" height="${f1(bh + 4)}" fill="${c}"/>`;
      for (let wy = -bh + 24; wy < -20; wy += 44) for (let wx = x + 14; wx < x + bw - 24; wx += 34) out += `<rect class="w" x="${f1(wx)}" y="${f1(wy)}" width="18" height="26" rx="3" fill="${r() < (o.lit ?? 0.7) ? "#ffe27a" : shade(c, -0.25)}"/>`;
      x += bw + 4;
    }
    return out;
  });
  P("bubble", "ฟองความคิด/คำพูด (text, w, h, kind: think|say)", (o = {}) => {
    const w = o.w ?? 300, h = o.h ?? 150, think = (o.kind ?? "think") === "think";
    return `<g fill="#fff"><rect x="${-w / 2}" y="${-h / 2}" width="${w}" height="${h}" rx="${Math.min(h / 2, 70)}"/>${think ? `<circle cx="${-w / 2 + 50}" cy="${h / 2 + 22}" r="16"/><circle cx="${-w / 2 + 26}" cy="${h / 2 + 52}" r="9"/>` : `<path d="M${-w / 2 + 40} ${h / 2 - 4} l-20 44 l60 -44z"/>`}</g>${o.text ? txt(o.text, 0, 12, o.size ?? 44, INK) : ""}`;
  });
  P("bed", "เตียงสีชมพู (color)", (o = {}) => { const c = o.color ?? "#ff7eb6"; return `<rect x="-200" y="-90" width="40" height="160" rx="12" fill="#8a5bd6"/><rect x="-200" y="-30" width="400" height="76" rx="16" fill="${c}"/><rect x="-200" y="10" width="400" height="30" rx="12" fill="${shade(c, -0.15)}"/><rect x="-190" y="40" width="22" height="50" fill="#8a5bd6"/><rect x="168" y="40" width="22" height="50" fill="#8a5bd6"/><rect x="-180" y="-60" width="110" height="46" rx="22" fill="#a67ae8"/>`; });
  P("window", "หน้าต่าง + ม่าน (night)", (o = {}) => `<rect x="-90" y="-110" width="180" height="220" rx="12" fill="#fff"/><rect x="-76" y="-96" width="152" height="192" rx="6" fill="${o.night ? "#1a1e4a" : "#8fd8f7"}"/>${o.night ? `<circle cx="30" cy="-40" r="22" fill="#fff3b0"/>${[[-40, -60], [-20, 20], [40, 30]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="3" fill="#fff"/>`).join("")}` : `<circle cx="30" cy="-40" r="22" fill="#ffd23a"/><path d="M-76 60 q40 -30 80 0 t72 0 v36 h-152z" fill="#6cc04a"/>`}<rect x="-3" y="-96" width="6" height="192" fill="#fff"/><rect x="-76" y="-3" width="152" height="6" fill="#fff"/><path d="M-110 -120 h50 v250 q-30 -20 -50 0z" fill="#ff5a8a"/>`);
  P("plant", "ต้นไม้ในกระถาง", () => `<path d="M-60 40 q-10 -90 40 -120 q10 70 -40 120z M60 40 q10 -90 -40 -120 q-10 70 40 120z M0 40 q-30 -100 0 -170 q30 70 0 170z" fill="#2f9b5a"/><path d="M-50 40 H50 L38 130 H-38Z" fill="#d9703a"/>`);
  P("food", "ของกินตู้เย็น (kind: fish|milk|egg|apple)", (o = {}) => ({
    fish: `<ellipse rx="52" ry="30" fill="#8fd0f0"/><path d="M44 0 L84 -26 V26Z" fill="#6bb8e0"/><circle cx="-28" cy="-6" r="6" fill="#2b2b2b"/>`,
    milk: `<rect x="-30" y="-50" width="60" height="100" rx="8" fill="#fff"/><path d="M-30 -50 L0 -78 L30 -50Z" fill="#dfe6f2"/><rect x="-30" y="-6" width="60" height="26" fill="#3d86d9"/>`,
    egg: `<ellipse rx="34" ry="44" fill="#fff4dc"/><ellipse cx="-10" cy="-14" rx="8" ry="14" fill="#fff" opacity="0.7"/>`,
    apple: `<circle r="44" fill="#ff5a5f"/><rect x="-4" y="-62" width="8" height="22" rx="4" fill="#8a5a2b"/><ellipse cx="14" cy="-52" rx="16" ry="8" fill="#4cb04a"/>`,
  }[o.kind ?? "apple"]));
  P("faucet", "ก๊อกน้ำ + หยดน้ำ (drop: true = หยดห้อยที่ปลาย)", (o = {}) => `<rect x="-150" y="-60" width="130" height="46" rx="14" fill="#b8c2d6"/><rect x="-30" y="-92" width="70" height="110" rx="16" fill="#9aa8c4"/><rect x="-6" y="-130" width="22" height="46" rx="8" fill="#7b8499"/><rect x="-26" y="-148" width="62" height="24" rx="12" fill="#ff5a5f"/><path d="M-20 18 h60 v18 a30 30 0 0 1 -60 0z" fill="#9aa8c4"/>${o.drop ? `<path class="drop" d="M10 66 q-16 22 0 34 q16 -12 0 -34z" fill="#6ec6f2"/>` : ""}`);
  P("bucket", "ถังน้ำ (water 0–1)", (o = {}) => `<path d="M-80 -70 L-64 90 q64 24 128 0 L80 -70z" fill="#ff9a2f"/><path d="M-80 -70 L-76 -40 H76 L80 -70z" fill="#e0791a"/><ellipse cy="-70" rx="80" ry="18" fill="${(o.water ?? 0) > 0 ? "#6ec6f2" : "#8a4d10"}"/><path d="M-76 -70 q76 -150 152 0" fill="none" stroke="#7b8499" stroke-width="8" stroke-linecap="round"/>`);
  P("table", "โต๊ะเล็ก (w)", (o = {}) => { const w = o.w ?? 320; return `<rect x="${-w / 2}" y="-20" width="${w}" height="26" rx="10" fill="#c98a4b"/><rect x="${-w / 2 + 24}" y="4" width="22" height="130" fill="#a86f33"/><rect x="${w / 2 - 46}" y="4" width="22" height="130" fill="#a86f33"/>`; });
  P("candle", "เทียนไข (flame: false = ดับ)", (o = {}) => `<rect x="-26" y="-20" width="52" height="110" rx="10" fill="#fff4dc"/><rect x="-26" y="-20" width="52" height="20" rx="10" fill="#f4e2bd"/><path d="M-26 8 q8 26 -4 40 h30z" fill="#fff4dc"/><rect x="-3" y="-38" width="6" height="22" rx="3" fill="#2b2b2b"/><g class="flame" opacity="${o.flame === false ? 0 : 1}"><path d="M0 -112 q-34 40 -22 70 q22 22 44 0 q12 -30 -22 -70z" fill="#ffb347"/><path d="M0 -86 q-16 22 -10 40 q10 12 20 0 q6 -18 -10 -40z" fill="#fff2a0"/></g>`);
  P("bell", "กระดิ่ง", () => `<path d="M0 -76 q-60 0 -60 70 v36 l-20 24 h160 l-20 -24 v-36 q0 -70 -60 -70z" fill="#ffd23a"/><circle cy="70" r="16" fill="#e0a418"/>`);
  P("kettle", "กาน้ำร้อน (color, on) — ไอน้ำ .steam", (o = {}) => { const c = o.color ?? "#c9ced8", d = shade(c, -0.3); return `<path d="M52 -26 q62 -16 52 34 q-6 30 -52 24" fill="none" stroke="${d}" stroke-width="16" stroke-linecap="round"/><path d="M-58 -2 L-108 -58 q-8 -12 6 -12 h22 L-40 -22z" fill="${d}"/><rect x="-66" y="-50" width="132" height="112" rx="40" fill="${c}"/><rect x="-66" y="-50" width="132" height="42" rx="40" fill="#fff" opacity="0.16"/><rect x="-26" y="-68" width="52" height="24" rx="12" fill="${shade(c, -0.18)}"/><circle cx="0" cy="-74" r="9" fill="#ff5a5f"/><circle cx="0" cy="22" r="16" fill="${o.on ? "#ffd23a" : "#8d96aa"}"/><g class="steam" opacity="${o.on ? 1 : 0}"><path d="M-96 -92 q-14 -20 0 -38 q14 -18 0 -38" fill="none" stroke="#fff" stroke-width="12" stroke-linecap="round" opacity="0.85"/><path d="M-58 -100 q-14 -20 0 -38 q14 -18 0 -38" fill="none" stroke="#fff" stroke-width="12" stroke-linecap="round" opacity="0.85"/></g>`; });
  P("honk", "ฟองเสียง ปิ๊น (text)", (o = {}) => `<path d="M-90 -40 L-40 -52 L-20 -92 L10 -56 L66 -64 L40 -20 L84 6 L28 14 L20 56 L-18 26 L-62 44 L-52 0Z" fill="#ffd23a" stroke="#ff9a2f" stroke-width="6" stroke-linejoin="round"/>${txt(o.text ?? "ปิ๊น!", 0, 6, 38, "#c4361d")}`);

  // ======================================================================= backgrounds (full-bleed 1080×1920) =======================================================================
  const BG = {};
  const B = (name, desc, fn) => { BG[name] = Object.assign(fn, { desc }); };
  const dots = (id, bg, dot, s = 70, r = 9) => `<pattern id="${id}" width="${s}" height="${s}" patternUnits="userSpaceOnUse"><rect width="${s}" height="${s}" fill="${bg}"/><circle cx="${s / 4}" cy="${s / 4}" r="${r}" fill="${dot}"/><circle cx="${(3 * s) / 4}" cy="${(3 * s) / 4}" r="${r}" fill="${dot}"/></pattern>`;
  const cloud = (x, y, s = 1, c = "#fff") => `<g transform="translate(${x} ${y}) scale(${s})" class="drift">${PROPS.cloud({ color: c })}</g>`;
  B("sky", "ท้องฟ้า + เนินหญ้า (ground, horizon)", (o = {}) => {
    const g = o.ground ?? "#6cc04a", hz = o.horizon ?? 1010;
    return `<defs><linearGradient id="bgsky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#5fb8ee"/><stop offset="1" stop-color="#c4ecfb"/></linearGradient></defs><rect width="1080" height="${hz + 40}" fill="url(#bgsky)"/>
      <g transform="translate(900 380) scale(1.1)"><g class="sunrot">${PROPS.sun()}</g></g>${cloud(200, 330, 1.2)}${cloud(720, 560, 0.9)}${cloud(120, 760, 0.8, "#f4fbff")}
      <ellipse cx="260" cy="${hz + 20}" rx="520" ry="130" fill="${shade(g, 0.18)}"/><ellipse cx="900" cy="${hz + 30}" rx="480" ry="110" fill="${shade(g, 0.08)}"/>
      <rect y="${hz}" width="1080" height="${1920 - hz}" fill="${g}"/><rect y="${hz + 150}" width="1080" height="${1920 - hz - 150}" fill="${shade(g, -0.07)}"/>${Array.from({ length: 22 }, (_, i) => { const r = rngf(i + 3); return `<path d="M${f1(r() * 1080)} ${f1(hz + 40 + r() * 850)} q6 -22 12 0 q6 -22 12 0" fill="none" stroke="${shade(g, -0.2)}" stroke-width="5" stroke-linecap="round"/>`; }).join("")}`;
  });
  B("polka", "สีพื้นลายจุด (color, dot)", (o = {}) => `<defs>${dots("pk" + (o.color ?? "g").replace("#", ""), o.color ?? "#3de0a2", o.dot ?? shade(o.color ?? "#3de0a2", 0.28))}</defs><rect width="1080" height="1920" fill="url(#pk${(o.color ?? "g").replace("#", "")})"/>`);
  B("plain", "สีเรียบ + ขอบล่าง (color)", (o = {}) => `<rect width="1080" height="1920" fill="${o.color ?? "#fff7e8"}"/><rect y="1500" width="1080" height="420" fill="${shade(o.color ?? "#fff7e8", -0.06)}"/>`);
  B("checker", "ลายหมากรุก (a, b, size)", (o = {}) => { const s = o.size ?? 120, a = o.a ?? "#e9473c", b = o.b ?? "#fff4e2"; return `<defs><pattern id="ck${s}" width="${s * 2}" height="${s * 2}" patternUnits="userSpaceOnUse"><rect width="${s * 2}" height="${s * 2}" fill="${b}"/><rect width="${s}" height="${s}" fill="${a}"/><rect x="${s}" y="${s}" width="${s}" height="${s}" fill="${a}"/></pattern></defs><rect width="1080" height="1920" fill="url(#ck${s})"/>`; });
  B("night", "ท้องฟ้ากลางคืน + ดาว + พื้นมืด (stars, ground)", (o = {}) => {
    const r = rngf(o.seed ?? 11), n = o.stars ?? 70, g = o.ground ?? "#243c6b", hz = o.horizon ?? 1010;
    return `<defs><linearGradient id="bgnight" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#0f1236"/><stop offset="1" stop-color="#2d3278"/></linearGradient></defs><rect width="1080" height="${hz + 40}" fill="url(#bgnight)"/>${Array.from({ length: n }, () => `<circle class="tw" cx="${f1(r() * 1080)}" cy="${f1(r() * (hz - 60))}" r="${f1(1.5 + r() * 3)}" fill="#fff" opacity="${f1(0.4 + r() * 0.6)}"/>`).join("")}<g transform="translate(860 330) scale(1.0)">${PROPS.moon()}</g>
      <ellipse cx="300" cy="${hz + 20}" rx="560" ry="120" fill="${shade(g, 0.1)}"/><rect y="${hz}" width="1080" height="${1920 - hz}" fill="${g}"/><rect y="${hz + 150}" width="1080" height="${1920 - hz - 150}" fill="${shade(g, -0.12)}"/>`;
  });
  B("factory", "โรงงานสีม่วง + สายพาน", () => `<rect width="1080" height="1920" fill="#6d4fb8"/><rect y="990" width="1080" height="930" fill="#3d2b7a"/><g fill="#8a6fd6"><rect x="90" y="520" width="120" height="460"/><rect x="300" y="640" width="150" height="340"/><rect x="760" y="560" width="140" height="420"/></g><g fill="#a893e6" opacity="0.8"><circle cx="150" cy="470" r="46"/><circle cx="200" cy="410" r="36"/><circle cx="830" cy="510" r="44"/></g><rect y="900" width="1080" height="70" fill="#2b2b2b"/><rect y="970" width="1080" height="22" fill="#14161f"/>${Array.from({ length: 22 }, (_, i) => `<rect x="${i * 54}" y="908" width="26" height="8" rx="3" fill="#555"/>`).join("")}`);
  B("room", "ห้องนอน ผนังลายริ้วฟ้า พื้นส้ม (wall, floor)", (o = {}) => {
    const w = o.wall ?? "#3d86d9", fl = o.floor ?? "#f6a431", hz = o.horizon ?? 1010;
    return `<rect width="1080" height="${hz}" fill="${w}"/>${Array.from({ length: 7 }, (_, i) => `<rect x="${i * 180 + 90}" width="90" height="${hz}" fill="${shade(w, 0.1)}"/>`).join("")}<rect y="${hz - 24}" width="1080" height="24" fill="${shade(w, -0.2)}"/><rect y="${hz}" width="1080" height="${1920 - hz}" fill="${fl}"/>${Array.from({ length: 9 }, (_, i) => `<rect y="${hz + i * 110}" width="1080" height="${i % 2 ? 0 : 55}" fill="${shade(fl, 0.14)}"/>`).join("")}${Array.from({ length: 8 }, (_, i) => `<path d="M${40 + i * 140} 52 l40 0 l-20 54z" fill="${["#ff5a8a", "#ffd23a", "#3fcf8e", "#3d86d9"][i % 4]}" transform="translate(0 ${i % 2 ? 4 : 0})"/>`).join("")}<path d="M20 50 Q540 130 1060 50" fill="none" stroke="#2b2b2b" stroke-width="3" opacity="0.5"/>`;
  });
  B("grid", "แผนที่ผังเมือง (สีเขียวอ่อน)", () => `<rect width="1080" height="1920" fill="#dff3e0"/>${Array.from({ length: 6 }, (_, i) => `<rect x="0" y="${200 + i * 300}" width="1080" height="46" fill="#fff"/>`).join("")}${Array.from({ length: 4 }, (_, i) => `<rect x="${120 + i * 280}" y="0" width="46" height="1920" fill="#fff"/>`).join("")}${Array.from({ length: 24 }, (_, i) => { const r = rngf(i * 9 + 1); return `<rect x="${f1(180 + (i % 4) * 280 + r() * 20)}" y="${f1(270 + Math.floor(i / 4) * 300 + r() * 20)}" width="${f1(80 + r() * 90)}" height="${f1(70 + r() * 80)}" rx="10" fill="${["#c8e8ff", "#ffe3a8", "#f4c8e8", "#d6c8ff"][i % 4]}"/>`; }).join("")}`);
  B("dark", "พื้นหลังมืด (color)", (o = {}) => `<rect width="1080" height="1920" fill="${o.color ?? "#171a3a"}"/>${Array.from({ length: 36 }, (_, i) => { const r = rngf(i + 40); return `<circle cx="${f1(r() * 1080)}" cy="${f1(r() * 1920)}" r="${f1(1.5 + r() * 2.5)}" fill="#fff" opacity="${f1(0.15 + r() * 0.3)}"/>`; }).join("")}`);

  // ======================================================================= the host character (round white head, glasses, stick limbs, white gloves, yellow dress) =======================================================================
  const FACES = {
    neutral: { eyes: "dots", brows: null, mouth: `<path d="M-16 50 Q0 58 16 50" fill="none" stroke="${GLASS}" stroke-width="6" stroke-linecap="round"/>` },
    happy: { eyes: "dots", brows: null, mouth: `<path d="M-26 42 Q0 84 26 42Z" fill="#7a1f2e" stroke="${GLASS}" stroke-width="5" stroke-linejoin="round"/><path d="M-14 62 Q0 52 14 62 Q0 72 -14 62Z" fill="#ff8f9f"/>` },
    cheer: { eyes: "arcs", brows: null, mouth: `<path d="M-30 38 Q0 96 30 38Z" fill="#7a1f2e" stroke="${GLASS}" stroke-width="5" stroke-linejoin="round"/><path d="M-16 64 Q0 52 16 64 Q0 76 -16 64Z" fill="#ff8f9f"/>` },
    shock: { eyes: "big", brows: "up", mouth: `<ellipse cx="0" cy="54" rx="13" ry="19" fill="#7a1f2e" stroke="${GLASS}" stroke-width="5"/>` },
    worry: { eyes: "dots", brows: "worry", mouth: `<path d="M-20 56 Q-10 46 0 56 Q10 66 20 56" fill="none" stroke="${GLASS}" stroke-width="6" stroke-linecap="round"/>` },
    sad: { eyes: "dots", brows: "worry", mouth: `<path d="M-20 60 Q0 40 20 60" fill="none" stroke="${GLASS}" stroke-width="6" stroke-linecap="round"/>` },
    think: { eyes: "side", brows: "one", mouth: `<path d="M-14 52 L16 46" fill="none" stroke="${GLASS}" stroke-width="6" stroke-linecap="round"/>` },
    smug: { eyes: "half", brows: "flat", mouth: `<path d="M-18 46 Q8 62 24 38" fill="none" stroke="${GLASS}" stroke-width="6" stroke-linecap="round"/>` },
    sleepy: { eyes: "half", brows: null, mouth: `<ellipse cx="0" cy="52" rx="9" ry="6" fill="#7a1f2e" stroke="${GLASS}" stroke-width="4"/>` },
  };
  const faceSvg = (f) => {
    const E = { dots: `<circle cx="-37" cy="-8" r="7" fill="${GLASS}"/><circle cx="37" cy="-8" r="7" fill="${GLASS}"/>`, big: `<circle cx="-37" cy="-8" r="11" fill="${GLASS}"/><circle cx="37" cy="-8" r="11" fill="${GLASS}"/><circle cx="-34" cy="-12" r="4" fill="#fff"/><circle cx="40" cy="-12" r="4" fill="#fff"/>`, arcs: `<path d="M-52 -2 Q-37 -26 -22 -2 M22 -2 Q37 -26 52 -2" fill="none" stroke="${GLASS}" stroke-width="7" stroke-linecap="round"/>`, side: `<circle cx="-28" cy="-14" r="7" fill="${GLASS}"/><circle cx="46" cy="-14" r="7" fill="${GLASS}"/>`, half: `<path d="M-50 -6 H-24 M24 -6 H50" stroke="${GLASS}" stroke-width="8" stroke-linecap="round"/><circle cx="-37" cy="-2" r="6" fill="${GLASS}"/><circle cx="37" cy="-2" r="6" fill="${GLASS}"/>` }[f.eyes];
    const Bw = { up: `<path d="M-58 -58 Q-40 -74 -20 -58 M20 -58 Q40 -74 58 -58" fill="none" stroke="${GLASS}" stroke-width="6" stroke-linecap="round"/>`, worry: `<path d="M-58 -50 L-20 -64 M58 -50 L20 -64" stroke="${GLASS}" stroke-width="6" stroke-linecap="round"/>`, one: `<path d="M-58 -50 L-20 -52 M20 -70 Q40 -80 58 -64" fill="none" stroke="${GLASS}" stroke-width="6" stroke-linecap="round"/>`, flat: `<path d="M-58 -54 L-20 -54 M20 -62 L58 -50" stroke="${GLASS}" stroke-width="6" stroke-linecap="round"/>` }[f.brows] || "";
    return E + Bw + f.mouth;
  };
  // arm poses: [shoulder, elbow] per arm in degrees, OUTWARD-positive (0 = hanging; 90 = straight out sideways; 180 = straight up). elbow = extra bend of the forearm (neg = toward the body)
  const POSES = {
    idle: { A: [10, 6], B: [10, 6] }, talk: { A: [10, 6], B: [48, -52] }, talk2: { A: [52, -48], B: [52, -48] }, point: { A: [10, 6], B: [96, 0] }, pointUp: { A: [10, 6], B: [150, 0] },
    pointL: { A: [96, 0], B: [10, 6] }, think: { A: [22, -128], B: [10, 6] }, shock: { A: [138, 24], B: [138, 24] }, cheer: { A: [150, 24], B: [150, 24] }, shrug: { A: [58, -62], B: [58, -62] },
    hips: { A: [38, -110], B: [38, -110] }, hold: { A: [34, -92], B: [34, -92] }, wave: { A: [10, 6], B: [150, -20] }, facepalm: { A: [10, 6], B: [30, -150] }, down: { A: [30, 4], B: [30, 4] },
  };
  const charSvg = () => {
    const arm = (side, cls) => `<g class="${cls}" transform="translate(${side * 50} -316)"><g class="up"><line x1="0" y1="0" x2="0" y2="70" stroke="${GLASS}" stroke-width="7" stroke-linecap="round"/><g transform="translate(0 70)"><g class="fo"><line x1="0" y1="0" x2="0" y2="62" stroke="${GLASS}" stroke-width="7" stroke-linecap="round"/><circle cy="70" r="15" fill="#fff" stroke="${GLASS}" stroke-width="3"/></g></g></g></g>`;
    return `<ellipse cx="0" cy="2" rx="86" ry="15" fill="#000" opacity="0.2"/>
      <g class="legs"><line x1="-24" y1="-196" x2="-28" y2="-36" stroke="${GLASS}" stroke-width="7" stroke-linecap="round"/><line x1="24" y1="-196" x2="28" y2="-36" stroke="${GLASS}" stroke-width="7" stroke-linecap="round"/><rect x="-36" y="-58" width="16" height="20" fill="#fff"/><rect x="20" y="-58" width="16" height="20" fill="#fff"/><path d="M-62 -26 q0 -22 30 -20 q22 2 26 20 q4 14 -10 14 h-34 q-12 0 -12 -14z" fill="#2fb7b0"/><path d="M62 -26 q0 -22 -30 -20 q-22 2 -26 20 q-4 14 10 14 h34 q12 0 12 -14z" fill="#2fb7b0"/></g>
      <g class="body"><path d="M-48 -332 Q0 -348 48 -332 L74 -176 Q0 -158 -74 -176Z" fill="#ffd23a"/><path d="M-74 -176 Q0 -158 74 -176 L72 -190 Q0 -172 -72 -190Z" fill="#f2b81c"/><path d="M-24 -334 Q0 -310 24 -334" fill="none" stroke="#f2b81c" stroke-width="8" stroke-linecap="round"/></g>
      ${arm(-1, "armA")}${arm(1, "armB")}
      <g class="ckhead" transform="translate(0 -430)"><g class="tilt"><circle r="94" fill="${SKIN}"/><circle r="94" fill="none" stroke="#ddd6c4" stroke-width="3"/><ellipse cx="-62" cy="22" rx="19" ry="14" fill="#f5a3a0" opacity="0.7"/><ellipse cx="62" cy="22" rx="19" ry="14" fill="#f5a3a0" opacity="0.7"/>
        ${Object.entries(FACES).map(([k, f]) => `<g class="f f-${k}" opacity="${k === "neutral" ? 1 : 0}">${faceSvg(f)}</g>`).join("")}
        <g fill="#fff" opacity="0.0"></g><circle cx="-37" cy="-8" r="0" fill="none"/>
        <g class="lids" opacity="0"><circle cx="-37" cy="-8" r="26" fill="${SKIN}"/><circle cx="37" cy="-8" r="26" fill="${SKIN}"/><path d="M-50 -6 H-24 M24 -6 H50" stroke="${GLASS}" stroke-width="6" stroke-linecap="round"/></g>
        <g fill="rgba(255,255,255,0.18)"><circle cx="-37" cy="-8" r="31"/><circle cx="37" cy="-8" r="31"/></g><g fill="none" stroke="${GLASS}" stroke-width="8"><circle cx="-37" cy="-8" r="31"/><circle cx="37" cy="-8" r="31"/><path d="M-6 -10 Q0 -16 6 -10" stroke-width="7"/><path d="M-68 -6 L-94 -14 M68 -6 L94 -14" stroke-width="6" stroke-linecap="round"/></g>
        <ellipse class="talk" cx="0" cy="53" rx="12" ry="2" fill="#7a1f2e" stroke="${GLASS}" stroke-width="5" opacity="0"/></g></g>`;
  };

  // ======================================================================= Cutout(tl, M, opts) =======================================================================
  window.Cutout = function (tl, M, opts = {}) {
    const stage = document.querySelector("#stage");
    const svg = document.createElementNS(NS, "svg");
    svg.setAttribute("viewBox", "0 0 1080 1920"); svg.setAttribute("width", "1080"); svg.setAttribute("height", "1920"); svg.id = "ck";
    svg.innerHTML = `<defs>
      <filter id="ds" x="-20%" y="-20%" width="140%" height="150%"><feDropShadow dx="0" dy="9" stdDeviation="5" flood-color="#10163a" flood-opacity="0.28"/></filter>
      <filter id="felt" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="3" seed="4" result="n"/><feColorMatrix in="n" type="matrix" values="0 0 0 0 0.25  0 0 0 0 0.2  0 0 0 0 0.15  0 0 0 1.5 -0.55"/></filter>
      <filter id="fiber" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency="0.012 0.5" numOctaves="2" seed="9" result="n"/><feColorMatrix in="n" type="matrix" values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 1.6 -0.7"/></filter>
      <radialGradient id="vg" cx="50%" cy="48%" r="78%"><stop offset="0.6" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#101030" stop-opacity="0.22"/></radialGradient>
    </defs><g id="shk" data-layout-allow-overflow><g id="world"></g></g><g id="fxl" data-layout-allow-overflow></g>
    <rect width="1080" height="1920" filter="url(#felt)" opacity="${opts.grain ?? 0.2}" style="mix-blend-mode:multiply" pointer-events="none"/>
    <rect width="1080" height="1920" filter="url(#fiber)" opacity="${opts.fiber ?? 0.04}" pointer-events="none"/><rect width="1080" height="1920" fill="url(#vg)" pointer-events="none"/>`;
    stage.appendChild(svg);
    const world = svg.querySelector("#world"), fxl = svg.querySelector("#fxl"), shk = svg.querySelector("#shk");
    let uid = 0;
    const mk = (tag, parent, attrs = {}, html = "") => { const e = document.createElementNS(NS, tag); for (const k in attrs) e.setAttribute(k, attrs[k]); if (html) e.innerHTML = html; parent && parent.appendChild(e); return e; };
    const O = { svgOrigin: "0 0" };
    // state at time t: t≈0 → apply immediately (a zero-length tl.set at t=0 is not re-rendered when the playhead is already at 0)
    const ST = (target, vars, t) => (t < 0.02 ? gsap.set(target, vars) : tl.set(target, vars, t));
    const { at, end, CAP } = M;
    const sceneInfo = (id) => { const s = document.querySelector("#sc-" + id); if (!s) throw new Error(`no <section id="sc-${id}">`); return { t0: parseFloat(s.dataset.start), t1: parseFloat(s.dataset.start) + parseFloat(s.dataset.duration) }; };

    // ---- items: add(svgString, x, y, {s, rot, t, anim, d, shadow}) → { o (outer: position), i (inner: animated) }
    const relT = (L, t) => (t != null && L && t < L.t0 ? L.t0 + t : t);   // a time earlier than the scene's start = seconds from the scene start
    function adder(parent, L) {
      return function add(svgStr, x, y, o = {}) {
        const outer = mk("g", parent, { transform: `translate(${f1(x)} ${f1(y)}) rotate(${o.rot ?? 0}) scale(${o.s ?? 1})`, ...(o.shadow === false ? {} : { filter: "url(#ds)" }) });
        const inner = mk("g", outer, {}, svgStr);
        const it = { o: outer, i: inner, x, y, s: o.s ?? 1, rot: o.rot ?? 0, q: (sel) => inner.querySelector(sel), qa: (sel) => Array.from(inner.querySelectorAll(sel)) };
        if (o.t != null) show(it, relT(L, o.t), o);
        return it;
      };
    }
    // appear animation at time t
    function show(it, t, o = {}) {
      const a = o.anim ?? "pop", d = o.d ?? 0.5;
      if (a === "none") return it;
      gsap.set(it.i, { opacity: 0, ...(a === "pop" ? { scale: 0 } : {}), ...O });
      if (a === "pop") tl.to(it.i, { scale: 1, opacity: 1, duration: d, ease: "back.out(2.2)" }, t);
      else if (a === "fade") tl.to(it.i, { opacity: 1, duration: d }, t);
      else if (a === "drop") { gsap.set(it.i, { y: -260 }); tl.to(it.i, { y: 0, opacity: 1, duration: d, ease: "bounce.out" }, t); }
      else if (a.startsWith("slide")) { const dir = a.split(":")[1] || "l", dx = dir === "l" ? -1300 : dir === "r" ? 1300 : 0, dy = dir === "u" ? -1300 : dir === "d" ? 1300 : 0; gsap.set(it.i, { x: dx, y: dy }); tl.to(it.i, { x: 0, y: 0, opacity: 1, duration: d, ease: "power3.out" }, t); }
      return it;
    }
    const hide = (it, t, d = 0.25) => tl.to(it.i, { opacity: 0, scale: 0.9, duration: d, ...O }, t);
    const unhide = (it, t, d = 0.25) => tl.to(it.i, { opacity: 1, scale: 1, duration: d, ...O }, t);
    const move = (it, t, d, x, y, ease = "power2.inOut") => tl.to(it.i, { x: x - it.x, y: y - it.y, duration: d, ease }, t);
    const scale = (it, t, d, s, ease = "back.out(1.6)") => tl.to(it.i, { scale: s, duration: d, ease, ...O }, t);
    const wiggle = (it, t, n = 3, amp = 8, d = 0.09) => { for (let k = 0; k < n * 2; k++) tl.to(it.i, { rotation: k % 2 ? amp : -amp, duration: d, ease: "sine.inOut", ...O }, t + k * d); tl.to(it.i, { rotation: 0, duration: d, ...O }, t + n * 2 * d); };
    const bounce = (it, t, h = 22, n = 2, d = 0.16) => { for (let k = 0; k < n; k++) { tl.to(it.i, { y: -h, duration: d, ease: "power2.out" }, t + k * d * 2); tl.to(it.i, { y: 0, duration: d, ease: "power2.in" }, t + k * d * 2 + d); } };
    const idle = (it, t0, t1, amp = 7, per = 1.1) => { const n = Math.floor((t1 - t0) / per); for (let k = 0; k < n; k++) tl.to(it.i, { y: k % 2 ? 0 : -amp, duration: per, ease: "sine.inOut" }, t0 + k * per); };
    const swap = (it, sel, t, visible = true) => { const els = typeof sel === "string" ? it.qa(sel) : [].concat(sel); tl.set(els, { opacity: visible ? 1 : 0 }, t); };
    const fade = (els, t, v, d = 0.3) => tl.to(els, { opacity: v, duration: d }, t);
    const tint = (els, t, color, d = 0.3) => tl.to(els, { fill: color, duration: d }, t);

    // ---- scene layers
    function scene(id, bgName = "plain", o = {}) {
      const { t0, t1 } = sceneInfo(id);
      const root = mk("g", world, { "data-scene": id });
      const hold = o.hold ?? 0.6;
      gsap.set(root, { opacity: t0 < 0.02 ? 1 : 0 }); if (t0 >= 0.02) tl.set(root, { opacity: 1 }, t0); tl.set(root, { opacity: 0 }, t1 + hold);
      const camg = mk("g", root, {}), bgg = mk("g", camg, {}, (BG[bgName] || BG.plain)(o.bgOpts || {}));
      const dr = bgg.querySelectorAll(".drift"), sr = bgg.querySelectorAll(".sunrot");
      if (dr.length) tl.fromTo(dr, { x: -36 }, { x: 36, duration: t1 - t0 + hold, ease: "none", immediateRender: false }, t0);
      if (sr.length) tl.fromTo(sr, { rotation: -10 }, { rotation: 20, duration: t1 - t0 + hold, ease: "none", ...O, immediateRender: false }, t0);
      if (o.push !== false) tl.fromTo(camg, { scale: 1 }, { scale: o.push ?? 1.035, duration: t1 - t0 + hold, ease: "none", svgOrigin: "540 900", immediateRender: false }, t0);
      const content = mk("g", camg, {});
      const L = { id, t0, t1, root, cam: camg, bg: bgg, g: content, add: null, K: null }; L.add = adder(content, L);
      // entry transition over the previous scene (this root is above it in z-order)
      const enter = o.enter ?? "cut";
      if (enter === "wipe" || enter === "curtain") {
        const cid = "cw" + uid++, dur = o.enterD ?? 0.55;
        const clip = mk("clipPath", svg.querySelector("defs"), { id: cid });
        const rect = mk("rect", clip, enter === "wipe" ? { x: -1700, y: -900, width: 0, height: 3700, transform: "rotate(-16 540 960)" } : { x: 540, y: 0, width: 0, height: 1920 });
        root.setAttribute("clip-path", `url(#${cid})`);
        if (enter === "wipe") {
          tl.to(rect, { attr: { width: 4600 }, duration: dur, ease: "power2.inOut" }, t0);
          const bar = mk("rect", fxl, { x: -1700, y: -900, width: 46, height: 3700, transform: "rotate(-16 540 960)", fill: o.wipeColor ?? "#ffd23a", opacity: 0 });
          tl.set(bar, { opacity: 1 }, t0); tl.to(bar, { attr: { x: 2900 }, duration: dur, ease: "power2.inOut" }, t0); tl.set(bar, { opacity: 0 }, t0 + dur + 0.02);
        } else {
          tl.to(rect, { attr: { x: -80, width: 1240 }, duration: dur, ease: "power3.inOut" }, t0);
          const bars = [-1, 1].map((sd) => mk("rect", fxl, { x: 540, y: 0, width: 30, height: 1920, fill: o.wipeColor ?? "#ff5a5f", opacity: 0 }));
          bars.forEach((b, k) => { tl.set(b, { opacity: 1 }, t0); tl.to(b, { attr: { x: k ? 1080 : -30 }, duration: dur, ease: "power3.inOut" }, t0); tl.set(b, { opacity: 0 }, t0 + dur + 0.02); });
        }
      } else if (enter === "pop") { tl.fromTo(content, { y: 60, opacity: 0 }, { y: 0, opacity: 1, duration: 0.4, ease: "back.out(1.6)", immediateRender: false }, t0);  /* (no svgOrigin scale here: it leaves an x/y offset behind) */ }
      L.char = (co = {}) => character(L, co);
      L.region = (pts, bgSvg = "", fill = null) => region(L, pts, bgSvg, fill);
      L.pill = (text, x, y, po = {}) => pill(L, text, x, y, po);
      return L;
    }
    // a clipped polygon sub-layer that slides in (used by split screens)
    function region(L, pts, bgSvg, fill) {
      const cid = "rg" + uid++, clip = mk("clipPath", svg.querySelector("defs"), { id: cid });
      mk("polygon", clip, { points: pts.map((p) => p.join(",")).join(" ") });
      const outer = mk("g", L.g, { "clip-path": `url(#${cid})` }), inner = mk("g", outer, {});
      if (fill) mk("polygon", inner, { points: pts.map((p) => p.join(",")).join(" "), fill });
      if (bgSvg) mk("g", inner, {}, bgSvg);
      const content = mk("g", inner, {});
      const R = { outer, inner, g: content, t0: L.t0, add: adder(content, L), slide: (t, from = "l", d = 0.55) => { gsap.set(inner, { x: from === "l" ? -1200 : from === "r" ? 1200 : 0, y: from === "u" ? -1400 : from === "d" ? 1400 : 0 }); tl.to(inner, { x: 0, y: 0, duration: d, ease: "power3.out" }, relT(L, t)); } };
      return R;
    }

    // ---- UI pieces
    function pillSvg(text, o = {}) {
      const size = o.size ?? 54, w = o.w ?? Math.round(vis(text) * size * 0.56 + size * 1.3), h = o.h ?? Math.round(size * 1.55);
      return { svg: `<rect x="${-w / 2}" y="${-h / 2}" width="${w}" height="${h}" rx="${h / 2}" fill="${o.bg ?? "#fff"}"/><rect x="${-w / 2}" y="${-h / 2}" width="${w}" height="${h / 2}" rx="${h / 2}" fill="#fff" opacity="${o.bg ? 0.16 : 0}"/>${txt(text, 0, size * 0.36, size, o.fg ?? INK)}`, w, h };
    }
    function pill(L, text, x, y, o = {}) { const p = pillSvg(text, o); const it = L.add(p.svg, x, y, { s: o.s ?? 1, rot: o.rot ?? 0, t: o.t, anim: o.anim ?? "pop", d: o.d }); it.w = p.w; it.h = p.h; if (o.until != null) hide(it, o.until); return it; }
    function card(L, o = {}) {
      const w = o.w ?? 420, h = o.h ?? 300, c = o.color ?? "#fff", head = o.head;
      let s = `<rect x="${-w / 2}" y="${-h / 2}" width="${w}" height="${h}" rx="30" fill="${c}"/>`;
      if (head) s += `<path d="M${-w / 2} ${-h / 2 + 90} v-60 a30 30 0 0 1 30 -30 h${w - 60} a30 30 0 0 1 30 30 v60z" fill="${o.headColor ?? "#3d86d9"}"/>${txt(head, 0, -h / 2 + 62, o.headSize ?? 46, "#fff")}`;
      if (o.inner) s += o.inner;
      return L.add(s, o.x ?? 540, o.y ?? 700, { s: o.s ?? 1, rot: o.rot ?? 0, t: o.t, anim: o.anim ?? "pop" });
    }
    // number counter in an svg <text>: counter(textEl, t0, t1, from, to, fmt)  — a setter-driven clock (onUpdate does not run on seek)
    function counter(el, t0, t1, from, to, fmt = (v) => String(Math.round(v)), ease = "none") {
      const clock = { _v: from }; Object.defineProperty(clock, "v", { get() { return this._v; }, set(v) { this._v = v; el.textContent = fmt(v); } });
      el.textContent = fmt(from); tl.fromTo(clock, { v: from }, { v: to, duration: t1 - t0, ease, immediateRender: false }, t0);
    }
    // windows of a skyline go dark one by one:  blackout(item, t0, t1, seed)
    function blackout(it, t0, t1, seed = 5) { const r = rngf(seed); it.qa(".w").forEach((w) => { tl.set(w, { fill: "#2b3270" }, t0 + r() * (t1 - t0)); }); }
    function lightup(it, t0, t1, seed = 5) { const r = rngf(seed); it.qa(".w").forEach((w) => { tl.set(w, { fill: "#ffe27a" }, t0 + r() * (t1 - t0)); }); }
    function shake(t, amp = 14, n = 6) { for (let k = 0; k < n; k++) tl.to(shk, { x: (k % 2 ? -1 : 1) * amp * (1 - k / n), y: (k % 2 ? 1 : -1) * amp * 0.4 * (1 - k / n), duration: 0.05 }, t + k * 0.05); tl.to(shk, { x: 0, y: 0, duration: 0.05 }, t + n * 0.05); }
    function flash(t, color = "#fff", a = 0.7, d = 0.35, L) { const r = mk("rect", fxl, { width: 1080, height: 1920, fill: color, opacity: 0 }); tl.set(r, { opacity: a }, t); tl.to(r, { opacity: 0, duration: d }, t + 0.03); }
    // warm light pool (additive): glow(x, y, r, { t0, t1, color, a, seed }) — flickers with a seeded pattern; sits above the dim overlay
    function glow(x, y, r, o = {}) {
      const id = "gl" + uid++, c = o.color ?? "#ffb347", g = mk("g", fxl, { style: "mix-blend-mode:screen" });
      mk("defs", g, {}, `<radialGradient id="${id}"><stop offset="0" stop-color="${c}" stop-opacity="${o.a ?? 0.85}"/><stop offset="0.45" stop-color="${c}" stop-opacity="0.28"/><stop offset="1" stop-color="${c}" stop-opacity="0"/></radialGradient>`);
      const e = mk("circle", g, { cx: x, cy: y, r, fill: `url(#${id})`, opacity: 0 }), rr = rngf(o.seed ?? 4), t0 = o.t0 ?? 0, t1 = o.t1 ?? M.TOTAL;
      tl.to(e, { opacity: 1, duration: 0.4 }, t0); for (let t = t0 + 0.4; t < t1 - 0.2; t += 0.12 + rr() * 0.1) tl.to(e, { opacity: 0.82 + rr() * 0.18, duration: 0.1 }, t); tl.to(e, { opacity: 0, duration: 0.3 }, t1);
      return e;
    }
    // dim the whole screen (lights out): returns the overlay
    function dim(t0, t1, a = 0.7, color = "#0a0e2a", d = 0.25) { const r = mk("rect", fxl, { width: 1080, height: 1920, fill: color, opacity: 0 }); tl.to(r, { opacity: a, duration: d }, t0); tl.to(r, { opacity: 0, duration: d }, t1); return r; }

    // ---- character
    function character(L, o = {}) {
      const x = o.x ?? 215, y = o.y ?? 1300, s = o.s ?? 0.95, flip = o.flip ? -1 : 1;
      const outer = mk("g", L.g, { transform: `translate(${x} ${y}) scale(${s * flip} ${s})`, filter: "url(#ds)" }), inner = mk("g", outer, {}, charSvg());
      const q = (sel) => inner.querySelector(sel);
      const ch = { o: outer, i: inner, x, y, s, faceNow: "neutral", cur: JSON.parse(JSON.stringify(POSES.idle)), rng: rngf(o.seed ?? 5) };
      const armEls = { A: [q(".armA .up"), q(".armA .fo")], B: [q(".armB .up"), q(".armB .fo")] };
      const sign = { A: 1, B: -1 };          // outward-positive: the screen-left arm turns clockwise (+), the right arm counter-clockwise (−)
      for (const k of ["A", "B"]) [0, 1].forEach((j) => gsap.set(armEls[k][j], { rotation: POSES.idle[k][j] * sign[k], ...O }));
      ch.pose = (name, t, d = 0.3, ease = "back.out(1.5)") => {
        const p = typeof name === "string" ? POSES[name] : name; if (!p) throw new Error(`pose "${name}" — have: ${Object.keys(POSES).join(" ")}`);
        for (const k of ["A", "B"]) [0, 1].forEach((j) => { const to = p[k][j] * sign[k]; tl.fromTo(armEls[k][j], { rotation: ch.cur[k][j] * sign[k] }, { rotation: to, duration: d, ease, ...O, immediateRender: false }, t); });
        ch.cur = JSON.parse(JSON.stringify(p)); return ch;
      };
      Object.keys(FACES).forEach((k) => gsap.set(q(".f-" + k), { opacity: k === "neutral" ? 1 : 0 }));
      ch.face = (t, name) => { if (!FACES[name]) throw new Error(`face "${name}" — have: ${Object.keys(FACES).join(" ")}`); ST(q(".f-" + ch.faceNow), { opacity: 0 }, t); ST(q(".f-" + name), { opacity: 1 }, t); ch.faceNow = name; return ch; };
      // blinking (seeded) + mouth flap while a caption line is spoken
      const lids = q(".lids"), talk = q(".talk"), tilt = q(".tilt");
      gsap.set(tilt, { rotation: 0, ...O }); gsap.set(talk, { opacity: 0 });
      const T = M.TOTAL; for (let t = 1.2 + ch.rng() * 1.5; t < T - 0.3; t += 2.4 + ch.rng() * 2.4) { tl.set(lids, { opacity: 1 }, t); tl.set(lids, { opacity: 0 }, t + 0.11); }
      // mouth: follows the REAL voice loudness (TTS_TIMING.envelope, 30 fps, written by `cutout voice`): closed -> small -> mid -> wide with each syllable.
      // Without a voice yet (no envelope) it falls back to a seeded flap so the preview still moves.
      const MOUTH = [[0, 0, 12], [1, 4, 11], [1, 8, 13], [1, 14, 16]];   // [visible, ry, rx] per loudness step
      ch.say = (key, op = {}) => {
        const c = CAP.find((c) => c.key === key); if (!c) throw new Error(`no caption key "${key}"`);
        const lv = M.levelAt;
        if (lv) {
          let prev = -1;
          for (let t = c.start; t < c.end - 0.04; t += 1 / 30) {
            const v = lv(t + 0.03), q = v < 0.15 ? 0 : v < 0.4 ? 1 : v < 0.7 ? 2 : 3;   // the mouth leads the sound by ~1 frame
            if (q === prev) continue; prev = q;
            const m = MOUTH[q]; ST(talk, { opacity: m[0], attr: { ry: m[1] || 2, rx: m[2] } }, t);
          }
          tl.set(talk, { opacity: 0 }, c.end);
        } else {
          ST(talk, { opacity: 1 }, c.start); let t = c.start, open = true;
          while (t < c.end - 0.05) { const d = 0.09 + ch.rng() * 0.08; ST(talk, { attr: { ry: f1(open ? 5 + ch.rng() * 9 : 2) } }, t); open = !open; t += d; }
          tl.set(talk, { opacity: 0 }, c.end);
        }
        if (op.pose !== false) { const gp = op.pose ?? (ch.rng() < 0.5 ? "talk" : "talk2"); ch.pose(gp, c.start, 0.25); ch.pose("idle", c.end - 0.05, 0.35, "power2.inOut"); }
        return ch;
      };
      ch.tilt = (t, deg, d = 0.3) => tl.to(tilt, { rotation: deg, duration: d, ease: "back.out(1.8)", ...O }, t);
      ch.hop = (t, h = 40) => { tl.to(inner, { y: -h, duration: 0.14, ease: "power2.out" }, t); tl.to(inner, { y: 0, duration: 0.18, ease: "bounce.out" }, t + 0.14); };
      ch.moveTo = (t, d, nx, ny = y, ease = "power2.inOut") => tl.to(outer, { x: nx, y: ny, duration: d, ease }, t);
      ch.hide = (t) => tl.set(outer, { opacity: 0 }, t); ch.reveal = (t) => tl.set(outer, { opacity: 1 }, t);
      ch.scaleTo = (t, d, ns) => tl.to(outer, { scaleX: ns * flip, scaleY: ns, duration: d, ease: "power2.inOut", ...O }, t);
      const t1 = L.t1, t0 = L.t0, per = 1.2; for (let t = t0, k = 0; t + per <= t1 + 0.6; t += per, k++) tl.to(q(".body"), { y: k % 2 ? 0 : -3, duration: per, ease: "sine.inOut" }, t);
      return ch;
    }

    // ---- shot types ---------------------------------------------------------------------------------
    // closeup(L, { prop, props, x, y, s, label, t }) — one big prop (micro-interaction) with an optional pill label under it
    function closeup(L, o = {}) {
      const it = L.add(o.svg ?? PROPS[o.prop](o.props || {}), o.x ?? 540, o.y ?? 640, { s: o.s ?? 2.2, t: o.t, anim: o.anim ?? "pop", rot: o.rot ?? 0 });
      if (o.label) it.label = pill(L, o.label, 540, (o.y ?? 640) + (o.labelDy ?? 470), { t: relT(L, o.t ?? 0) + 0.25, bg: o.labelBg ?? "#ffd23a" });
      return it;
    }
    // split(L, { a:{bg,fill}, b:{…}, t, tilt, build(a,b) }) — diagonal split screen; a = top, b = bottom; a/b are sub-layers with .add()
    function split(L, o = {}) {
      const m = o.y ?? 960, k = o.tilt ?? 90, d = o.gap ?? 8;
      const A = L.region([[0, 0], [1080, 0], [1080, m - k - d], [0, m + k - d]], o.a?.bg ?? "", o.a?.fill ?? "#bfe8fb"), Bz = L.region([[0, m + k + d], [1080, m - k + d], [1080, 1920], [0, 1920]], o.b?.bg ?? "", o.b?.fill ?? "#ffe3a8");
      const ts = relT(L, o.t ?? L.t0); A.slide(ts, "l"); Bz.slide(ts, "r");
      const line = L.add(`<line x1="-600" y1="${k}" x2="600" y2="${-k}" stroke="#fff" stroke-width="14" stroke-dasharray="26 22" stroke-linecap="round"/>`, 540, m, { anim: "fade", t: ts + 0.3, shadow: false });
      return { a: A, b: Bz, line };
    }
    // matrix(L, { cards:[{title, icon(svg), color, t}], y, w, h, gap }) — 2×2 cards: grey "?" backs flip to the faces at each card's t
    function matrix(L, o = {}) {
      const w = o.w ?? 440, h = o.h ?? 400, gap = o.gap ?? 40, cx = 540, cy = o.y ?? 760, out = [];
      (o.cards || []).slice(0, 4).forEach((c, idx) => {
        const x = cx + ((idx % 2) - 0.5) * (w + gap), y = cy + (Math.floor(idx / 2) - 0.5) * (h + gap);
        const outer = mk("g", L.g, { transform: `translate(${f1(x)} ${f1(y)})`, filter: "url(#ds)" }), inner = mk("g", outer, {});
        const back = mk("g", inner, {}, `<rect x="${-w / 2}" y="${-h / 2}" width="${w}" height="${h}" rx="34" fill="#3b4268"/>${txt("?", 0, 56, 150, "#6a739f")}`);
        const face = mk("g", inner, {}, `<rect x="${-w / 2}" y="${-h / 2}" width="${w}" height="${h}" rx="34" fill="${c.color ?? "#3fcf8e"}"/><rect x="${-w / 2}" y="${-h / 2}" width="${w}" height="${h * 0.5}" rx="34" fill="#fff" opacity="0.14"/><g transform="translate(0 -34) scale(${c.iconS ?? 0.8})">${c.icon || ""}</g>${txt(c.title || "", 0, h / 2 - 54, c.size ?? 70, "#fff", { stroke: shade(c.color ?? "#3fcf8e", -0.35), sw: 10 })}`);
        gsap.set(inner, { scale: 0, ...O }); gsap.set(face, { opacity: 0 });
        const ti = relT(L, o.in ?? L.t0 + 0.2) + idx * 0.12; tl.to(inner, { scale: 1, duration: 0.45, ease: "back.out(2)", ...O }, ti);
        if (c.t != null) { tl.to(inner, { scaleX: 0, duration: 0.14, ease: "power2.in", ...O }, c.t - 0.14); tl.set(back, { opacity: 0 }, c.t); tl.set(face, { opacity: 1 }, c.t); tl.to(inner, { scaleX: 1, duration: 0.2, ease: "back.out(2)", ...O }, c.t); }
        out.push({ outer, inner, face, back });
      });
      return out;
    }
    // choice(L, { cards:[{label, svg, color}], y, t, title }) — outro: floating option cards that bounce, to invite a comment
    function choice(L, o = {}) {
      const n = (o.cards || []).length, w = o.w ?? 290, gap = o.gap ?? 28, y = o.y ?? 640, items = [], t0c = relT(L, o.t ?? L.t0);
      o.cards.forEach((c, i) => {
        const x = 540 + (i - (n - 1) / 2) * (w + gap), col = c.color ?? ["#ff7eb6", "#3fcf8e", "#3d86d9"][i % 3];
        const it = L.add(`<rect x="${-w / 2}" y="-230" width="${w}" height="460" rx="36" fill="#fff"/><rect x="${-w / 2}" y="-230" width="${w}" height="${92}" rx="36" fill="${col}"/><rect x="${-w / 2}" y="-170" width="${w}" height="32" fill="${col}"/><g transform="translate(0 -22) scale(${c.iconS ?? 0.9})">${c.svg || ""}</g>${txt(c.label, 0, 190, c.size ?? 50, INK)}${txt(String(i + 1), 0, -168, 52, "#fff")}`, x, y, { t: t0c + i * 0.18, anim: "pop" });
        bounce(it, t0c + 1.2 + i * 0.35, 18, 2); items.push(it);
      });
      if (o.title) items.title = pill(L, o.title, 540, y - 360, { t: t0c, bg: "#ffd23a", size: o.titleSize ?? 56 });
      return items;
    }

    const K = Object.assign({ scene, rng: rngf, finish, svg, world, fx: fxl, PROPS, BG, POSES, FACES, C: PAL, prop: (n, o) => { if (!PROPS[n]) throw new Error(`prop "${n}" — have: ${Object.keys(PROPS).join(" ")}`); return PROPS[n](o || {}); },
      pill, pillSvg, card, counter, blackout, lightup, shake, flash, dim, glow, show, hide, unhide, move, scale, wiggle, bounce, idle, swap, fade, tint, txt, shade, closeup, split, matrix, choice, mk, at, end });
    // finish(): publish the validation result and the ready flag (index.html calls K.finish() as its last line, after registering the timeline)
    function finish() {
      const V = window.__CO_VALIDATION || { errors: [], warnings: [] };
      if (window.CutoutValidate && window.CutoutValidate.final) window.CutoutValidate.final(K, M, V);
      window.__CO_READY = true;
      if (V.errors.length) throw new Error(`SCENE has ${V.errors.length} error(s):\n - ${V.errors.join("\n - ")}`);
    }
    return window.CutoutValidate ? window.CutoutValidate(K, M) : K;
  };
  window.Cutout.PROPS = PROPS; window.Cutout.BG = BG; window.Cutout.FACES = FACES; window.Cutout.POSES = POSES; window.Cutout.charSvg = charSvg; window.Cutout.shade = shade; window.Cutout.txt = txt;
})();
// genhaha:5f8f980bb7f3
