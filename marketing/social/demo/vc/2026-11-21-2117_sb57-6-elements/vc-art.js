// vc-art.js - the sticker / graphic library: 38 flat cartoon pieces drawn in code (no emoji, no photos, no AI pictures).
// Every piece is drawn in a 200 x 200 unit box centred on 0, 0 (s: 1 = about 200 px) with a sticker outline (shadow, dark outline, white edge, gradient fill).
// fn(c, o): o = { col: {hi, lo, out}, pal, t (seconds since the piece appeared), label, sym, face }. Items pick a piece with { art: "<name>" }.
(function (K) {
  const { TAU, clamp, hash, FONT } = K;
  const cache = new Map();
  const P = (d) => { let p = cache.get(d); if (!p) { p = new Path2D(d); cache.set(d, p); } return p; };
  const grad = (c, col, y0 = -100, y1 = 100) => { const g = c.createLinearGradient(0, y0, 0, y1); g.addColorStop(0, col.hi); g.addColorStop(1, col.lo); return g; };

  // a filled sticker from SVG path data: soft shadow, dark outline, white edge, gradient fill
  function stk(c, d, col, o = {}) {
    const p = typeof d === "string" ? P(d) : d, w = o.w ?? 1;
    c.lineJoin = "round"; c.lineCap = "round";
    c.save(); c.translate(3 * w, 7 * w); c.strokeStyle = "rgba(10,20,60,0.40)"; c.lineWidth = 27 * w; c.stroke(p); c.restore();
    c.strokeStyle = col.out; c.lineWidth = 25 * w; c.stroke(p);
    c.strokeStyle = "#fff"; c.lineWidth = 13 * w; c.stroke(p);
    c.fillStyle = o.fill || grad(c, col); c.fill(p, o.rule || "nonzero");
  }
  // a stroked (line) sticker: same layers as a thick pen line
  function line(c, d, col, wd = 30) {
    const p = typeof d === "string" ? P(d) : d;
    c.lineJoin = "round"; c.lineCap = "round";
    c.save(); c.translate(3, 7); c.strokeStyle = "rgba(10,20,60,0.40)"; c.lineWidth = wd + 28; c.stroke(p); c.restore();
    c.strokeStyle = col.out; c.lineWidth = wd + 26; c.stroke(p);
    c.strokeStyle = "#fff"; c.lineWidth = wd + 13; c.stroke(p);
    c.strokeStyle = grad(c, col); c.lineWidth = wd; c.stroke(p);
  }
  const shine = (c, x, y, rx, ry, rot = -0.5) => { c.save(); c.fillStyle = "rgba(255,255,255,0.78)"; c.beginPath(); c.ellipse(x, y, rx, ry, rot, 0, TAU); c.fill(); c.restore(); };
  const dot = (c, x, y, r, f) => { c.fillStyle = f; c.beginPath(); c.arc(x, y, r, 0, TAU); c.fill(); };
  function glyph(c, ch, col, size, font = FONT.heavy) {
    c.font = `800 ${size}px ${font}`; c.textAlign = "center"; c.textBaseline = "middle"; c.lineJoin = "round";
    c.strokeStyle = "rgba(10,20,60,0.40)"; c.lineWidth = size * 0.26; c.strokeText(ch, 3, 7);
    c.strokeStyle = col.out; c.lineWidth = size * 0.25; c.strokeText(ch, 0, 0);
    c.strokeStyle = "#fff"; c.lineWidth = size * 0.13; c.strokeText(ch, 0, 0);
    c.fillStyle = grad(c, col, -size * 0.5, size * 0.5); c.fillText(ch, 0, 0);
  }
  const star = (n, R, r, rot = -Math.PI / 2) => { let d = ""; for (let i = 0; i < n * 2; i++) { const a = rot + (i * Math.PI) / n, k = i % 2 ? r : R; d += (i ? "L" : "M") + (Math.cos(a) * k).toFixed(1) + " " + (Math.sin(a) * k).toFixed(1); } return d + "Z"; };

  // ---------- faces: any piece can wear one (`face`): eyes + mouth drawn on top ----------
  function face(c, kind, y = 6, k = 1) {
    c.save(); c.translate(0, y); c.scale(k, k); c.lineCap = "round"; c.lineJoin = "round";
    const eye = (x, r, py = 0, px = 0) => { dot(c, x, 0, r, "#fff"); c.strokeStyle = "#1a1030"; c.lineWidth = 4; c.beginPath(); c.arc(x, 0, r, 0, TAU); c.stroke(); dot(c, x + px, py, r * 0.55, "#1a1030"); dot(c, x + px - 2, py - 3, r * 0.2, "#fff"); };
    const ink = "#1a1030";
    c.strokeStyle = ink; c.fillStyle = ink; c.lineWidth = 6;
    if (kind === "happy") { eye(-26, 14, 1); eye(26, 14, 1); c.beginPath(); c.arc(0, 18, 24, 0.15 * Math.PI, 0.85 * Math.PI); c.stroke(); dot(c, -48, 22, 9, "rgba(255,80,130,0.5)"); dot(c, 48, 22, 9, "rgba(255,80,130,0.5)"); }
    else if (kind === "shock") { eye(-26, 17); eye(26, 17); c.beginPath(); c.ellipse(0, 40, 13, 17, 0, 0, TAU); c.fillStyle = "#5a0f2a"; c.fill(); c.stroke(); }
    else if (kind === "smirk") { eye(-26, 13, 3, 4); eye(26, 13, 3, 4); c.beginPath(); c.moveTo(-18, 36); c.quadraticCurveTo(10, 52, 34, 28); c.stroke(); c.beginPath(); c.moveTo(-42, -22); c.lineTo(-12, -28); c.stroke(); }
    else if (kind === "cry") { eye(-26, 13, 3); eye(26, 13, 3); c.beginPath(); c.moveTo(-22, 46); c.quadraticCurveTo(0, 28, 22, 46); c.stroke(); c.fillStyle = "#7fd8ff"; for (const x of [-34, 34]) { c.beginPath(); c.moveTo(x, 12); c.quadraticCurveTo(x + 8, 34, x, 46); c.quadraticCurveTo(x - 8, 34, x, 12); c.fill(); } }
    else if (kind === "dizzy") { for (const x of [-26, 26]) { c.beginPath(); c.moveTo(x - 11, -11); c.lineTo(x + 11, 11); c.moveTo(x + 11, -11); c.lineTo(x - 11, 11); c.stroke(); } c.beginPath(); c.moveTo(-24, 38); c.bezierCurveTo(-12, 28, -4, 48, 6, 38); c.bezierCurveTo(14, 30, 22, 46, 28, 38); c.stroke(); }
    else if (kind === "angry") { eye(-26, 12, 4); eye(26, 12, 4); c.lineWidth = 9; c.beginPath(); c.moveTo(-46, -22); c.lineTo(-12, -6); c.moveTo(46, -22); c.lineTo(12, -6); c.stroke(); c.lineWidth = 6; c.beginPath(); c.moveTo(-22, 46); c.quadraticCurveTo(0, 30, 22, 46); c.stroke(); }
    else if (kind === "wink") { eye(-26, 14, 1); c.beginPath(); c.moveTo(14, 2); c.quadraticCurveTo(26, -10, 38, 2); c.stroke(); c.beginPath(); c.arc(0, 18, 24, 0.12 * Math.PI, 0.7 * Math.PI); c.stroke(); }
    c.restore();
  }

  const A = {};
  const def = (name, colName, doc, fn) => { A[name] = { col: colName, doc, fn }; };

  // ---------- symbols ----------
  def("heart", "pink", "heart", (c, o) => { stk(c, "M0 88 C-150 -2 -92 -100 0 -38 C92 -100 150 -2 0 88Z", o.col); shine(c, -46, -40, 14, 24); });
  def("star", "yellow", "5-point star", (c, o) => { stk(c, star(5, 98, 42), o.col); shine(c, -26, -34, 10, 16); });
  def("sparkle", "yellow", "4-point twinkle", (c, o) => { stk(c, "M0 -100 Q9 -9 100 0 Q9 9 0 100 Q-9 9 -100 0 Q-9 -9 0 -100Z", o.col, { w: 0.9 }); });
  def("drop", "blue", "water / blood / sweat drop", (c, o) => { stk(c, "M0 -100 C12 -48 72 -8 72 36 A72 72 0 0 1 -72 36 C-72 -8 -12 -48 0 -100Z", o.col); shine(c, -34, 30, 10, 22, 0.3); });
  def("bolt", "yellow", "lightning bolt", (c, o) => { stk(c, "M26 -100 L-58 10 L-6 10 L-32 100 L62 -20 L8 -20Z", o.col); });
  def("flame", "orange", "flame", (c, o) => { stk(c, "M0 -100 C20 -60 76 -30 70 30 C66 78 30 100 0 100 C-34 100 -72 74 -70 26 C-68 -10 -40 -20 -35 -55 C-12 -40 -2 -70 0 -100Z", o.col); c.save(); c.translate(0, 38); c.scale(0.5, 0.5); c.fillStyle = "#fff3a8"; c.fill(P("M0 -70 C14 -40 52 -22 48 20 C44 55 20 70 0 70 C-24 70 -50 52 -48 18 C-46 -8 -28 -14 -24 -38 C-8 -28 -2 -48 0 -70Z")); c.restore(); });
  def("question", "yellow", "big ?", (c, o) => glyph(c, "?", o.col, 200));
  def("exclaim", "red", "big !", (c, o) => glyph(c, "!", o.col, 200));
  def("check", "lime", "check mark", (c, o) => line(c, "M-66 6 L-22 54 L70 -58", o.col, 38));
  def("cross", "red", "X mark", (c, o) => line(c, "M-58 -58 L58 58 M58 -58 L-58 58", o.col, 38));
  def("arrow", "red", "block arrow (rot turns it, default up)", (c, o) => stk(c, "M0 -100 L78 -8 L32 -8 L32 96 L-32 96 L-32 -8 L-78 -8Z", o.col));
  def("arrowcurve", "red", "curved arrow", (c, o) => { line(c, "M-80 64 C-80 -60 30 -84 64 -26", o.col, 24); c.save(); c.translate(64, -26); c.rotate(0.55); stk(c, "M0 -30 L36 22 L-36 22Z", o.col, { w: 0.8 }); c.restore(); });
  def("burst", "yellow", "spiky explosion shape (a bare burst, no text)", (c, o) => { stk(c, star(14, 100, 70), o.col, { w: 0.9 }); });
  def("zigzag", "orange", "zig-zag line", (c, o) => line(c, "M-90 20 L-60 -30 L-30 20 L0 -30 L30 20 L60 -30 L90 20", o.col, 20));
  def("dots", "white", "halftone dots", (c, o) => { c.fillStyle = o.col.lo; for (let y = 0; y < 5; y++) for (let x = 0; x < 5; x++) { c.beginPath(); c.arc(-80 + x * 40, -80 + y * 40, 4 + (x + y) * 1.7, 0, TAU); c.fill(); } });
  def("ring", "white", "double ring (a shock / pop ring, grows)", (c, o) => { const g = 0.55 + 0.45 * clamp(o.t / 0.4); c.save(); c.scale(g, g); c.lineWidth = 16; c.strokeStyle = o.col.out; c.beginPath(); c.arc(0, 0, 88, 0, TAU); c.stroke(); c.lineWidth = 7; c.strokeStyle = "#fff"; c.beginPath(); c.arc(0, 0, 88, 0, TAU); c.stroke(); c.restore(); });
  def("anger", "red", "anger vein mark", (c, o) => { for (const [a, s] of [[0, 1], [Math.PI, 1], [Math.PI / 2, -1], [-Math.PI / 2, -1]]) { c.save(); c.rotate(a); line(c, "M16 -16 C60 -22 66 -66 30 -76", o.col, 14 * s * 1); c.restore(); } });
  def("sweat", "blue", "three flying sweat drops", (c, o) => { for (const [x, y, k, r] of [[-50, 20, 0.7, -0.4], [10, -40, 0.9, 0.1], [58, 14, 0.6, 0.5]]) { c.save(); c.translate(x, y); c.rotate(r); c.scale(k, k); stk(c, "M0 -60 C8 -28 40 -4 40 20 A40 40 0 0 1 -40 20 C-40 -4 -8 -28 0 -60Z", o.col, { w: 0.9 }); c.restore(); } });
  def("smile", "yellow", "round smiley (wears any face; default happy)", (c, o) => { stk(c, "M-90 0 A90 90 0 1 0 90 0 A90 90 0 1 0 -90 0Z", o.col); shine(c, -44, -52, 12, 20); if (!o.face) face(c, "happy", 6, 1.15); });
  def("speech", "white", "speech bubble (label inside, up to ~8 characters)", (c, o) => { stk(c, "M-92 -58 Q-92 -84 -66 -84 L66 -84 Q92 -84 92 -58 L92 18 Q92 44 66 44 L-8 44 L-46 92 L-40 44 L-66 44 Q-92 44 -92 18Z", o.col, { fill: "#fff" }); if (o.label) { c.font = `800 ${Math.min(62, 560 / Math.max(2, K.est(o.label, 1)))}px ${FONT.heavy}`; c.textAlign = "center"; c.textBaseline = "middle"; c.fillStyle = "#14143c"; c.fillText(String(o.label), 0, -20); } });
  def("crown", "yellow", "crown", (c, o) => { stk(c, "M-86 62 L-96 -52 L-46 0 L0 -74 L46 0 L96 -52 L86 62Z", o.col); dot(c, -96, -52, 11, "#ff2d95"); dot(c, 0, -74, 12, "#2a8bff"); dot(c, 96, -52, 11, "#ff2d95"); dot(c, 0, 24, 13, "#ff2d2d"); });
  def("bulb", "yellow", "light bulb (flickers)", (c, o) => { const fl = 0.75 + 0.25 * Math.sin(o.t * 14); c.save(); c.globalAlpha = fl; c.strokeStyle = o.col.lo; c.lineWidth = 9; c.lineCap = "round"; for (let i = 0; i < 7; i++) { const a = -Math.PI * 0.95 + i * (Math.PI * 0.9 / 6); c.beginPath(); c.moveTo(Math.cos(a) * 108, -14 + Math.sin(a) * 108); c.lineTo(Math.cos(a) * 128, -14 + Math.sin(a) * 128); c.stroke(); } c.restore(); stk(c, "M0 -92 C62 -92 88 -42 72 4 C62 34 38 44 38 68 L-38 68 C-38 44 -62 34 -72 4 C-88 -42 -62 -92 0 -92Z", o.col); stk(c, "M-30 78 L30 78 L30 98 L-30 98Z", { hi: "#d7dbe6", lo: "#8a90a6", out: o.col.out }, { w: 0.5 }); shine(c, -34, -44, 10, 20); });
  def("clock", "white", "clock, hands turn", (c, o) => { stk(c, "M-86 0 A86 86 0 1 0 86 0 A86 86 0 1 0 -86 0Z", o.col, { fill: "#fff" }); c.strokeStyle = o.col.out; c.lineCap = "round"; for (let i = 0; i < 12; i++) { const a = (i / 12) * TAU; c.lineWidth = 6; c.beginPath(); c.moveTo(Math.cos(a) * 66, Math.sin(a) * 66); c.lineTo(Math.cos(a) * 76, Math.sin(a) * 76); c.stroke(); } const m = o.t * 3.2 - Math.PI / 2, h = m / 12 - Math.PI / 2 * 0.0; c.lineWidth = 9; c.strokeStyle = "#14143c"; c.beginPath(); c.moveTo(0, 0); c.lineTo(Math.cos(m) * 62, Math.sin(m) * 62); c.stroke(); c.lineWidth = 12; c.beginPath(); c.moveTo(0, 0); c.lineTo(Math.cos(h) * 40, Math.sin(h) * 40); c.stroke(); dot(c, 0, 0, 9, "#ff2d2d"); });
  def("coin", "yellow", "coin (sym: the symbol, default the baht sign)", (c, o) => { stk(c, "M-88 0 A88 88 0 1 0 88 0 A88 88 0 1 0 -88 0Z", o.col); c.strokeStyle = o.col.out; c.globalAlpha = 0.5; c.lineWidth = 7; c.beginPath(); c.arc(0, 0, 66, 0, TAU); c.stroke(); c.globalAlpha = 1; c.font = `800 92px ${FONT.heavy}`; c.textAlign = "center"; c.textBaseline = "middle"; c.fillStyle = o.col.out; c.fillText(o.sym || "฿", 0, 6); shine(c, -46, -48, 9, 17); });
  def("rocket", "red", "rocket, flame flickers", (c, o) => { const f = 0.8 + 0.3 * Math.sin(o.t * 30); c.save(); c.translate(0, 84); c.scale(1, f); stk(c, "M0 80 C28 50 30 20 22 0 L-22 0 C-30 20 -28 50 0 80Z", { hi: "#fff3a8", lo: "#ff8a00", out: "#a8460a" }, { w: 0.8 }); c.restore(); stk(c, "M-40 14 L-86 76 L-34 62Z M40 14 L86 76 L34 62Z", o.col, { w: 0.8 }); stk(c, "M0 -100 C48 -66 52 6 40 62 L-40 62 C-52 6 -48 -66 0 -100Z", { hi: "#ffffff", lo: "#c7d3ee", out: "#2a2a6a" }); stk(c, "M0 -100 C22 -84 38 -62 44 -38 L-44 -38 C-38 -62 -22 -84 0 -100Z", o.col, { w: 0.6 }); dot(c, 0, -2, 20, "#2a8bff"); dot(c, -5, -8, 7, "#bfe6ff"); });
  def("cloud", "white", "cloud (wears any face)", (c, o) => { stk(c, "M-62 52 A38 38 0 0 1 -60 -22 A46 46 0 0 1 22 -54 A42 42 0 0 1 70 -8 A36 36 0 0 1 56 52Z", o.col, { fill: "#fff" }); });
  def("sun", "yellow", "sun, rays turn slowly (wears any face)", (c, o) => { c.save(); c.rotate(o.t * 0.5); for (let i = 0; i < 10; i++) { c.save(); c.rotate((i / 10) * TAU); stk(c, "M0 -104 L16 -76 L-16 -76Z", o.col, { w: 0.55 }); c.restore(); } c.restore(); stk(c, "M-62 0 A62 62 0 1 0 62 0 A62 62 0 1 0 -62 0Z", o.col); shine(c, -26, -30, 9, 15); });
  def("moon", "yellow", "crescent moon", (c, o) => { stk(c, "M24 -94 A94 94 0 1 0 24 94 A74 74 0 1 1 24 -94Z", o.col); });
  def("snowflake", "blue", "snowflake / cold", (c, o) => { const d = (() => { let s = ""; for (let i = 0; i < 6; i++) { const a = (i / 6) * TAU; const x = Math.cos(a), y = Math.sin(a); s += `M0 0 L${(x * 92).toFixed(1)} ${(y * 92).toFixed(1)} M${(x * 56).toFixed(1)} ${(y * 56).toFixed(1)} L${(x * 56 + Math.cos(a + 0.9) * 24).toFixed(1)} ${(y * 56 + Math.sin(a + 0.9) * 24).toFixed(1)} M${(x * 56).toFixed(1)} ${(y * 56).toFixed(1)} L${(x * 56 + Math.cos(a - 0.9) * 24).toFixed(1)} ${(y * 56 + Math.sin(a - 0.9) * 24).toFixed(1)} `; } return s; })(); c.save(); c.rotate(o.t * 0.4); line(c, d, o.col, 14); c.restore(); });
  def("eye", "white", "eye, pupil looks around", (c, o) => { stk(c, "M-96 0 Q0 -92 96 0 Q0 92 -96 0Z", o.col, { fill: "#fff" }); const px = 26 * Math.sin(o.t * 2.2), py = 6 * Math.sin(o.t * 3.1); dot(c, px, py, 34, o.col.lo); dot(c, px, py, 20, "#14143c"); dot(c, px - 8, py - 9, 7, "#fff"); });
  def("magnifier", "blue", "magnifying glass", (c, o) => { line(c, "M34 34 L88 88", { hi: "#ffd08a", lo: "#c9680a", out: "#7a3000" }, 24); stk(c, "M-60 -22 A52 52 0 1 0 44 -22 A52 52 0 1 0 -60 -22Z", o.col, { fill: "rgba(200,240,255,0.88)" }); shine(c, -34, -42, 10, 18); });
  def("trophy", "yellow", "trophy", (c, o) => { line(c, "M-56 -52 C-98 -52 -92 8 -42 18 M56 -52 C98 -52 92 8 42 18", o.col, 14); stk(c, "M-58 -88 L58 -88 L52 -16 C46 34 20 44 0 44 C-20 44 -46 34 -52 -16Z", o.col); stk(c, "M-16 44 L16 44 L18 76 L-18 76Z", o.col, { w: 0.6 }); stk(c, "M-50 76 L50 76 L50 98 L-50 98Z", { hi: "#8a90a6", lo: "#4a5068", out: "#14143c" }, { w: 0.6 }); shine(c, -30, -52, 8, 22, 0.1); });
  def("gift", "red", "gift box with a bow", (c, o) => { stk(c, "M-76 -24 L76 -24 L76 90 L-76 90Z", o.col, { w: 0.9 }); stk(c, "M-88 -58 L88 -58 L88 -20 L-88 -20Z", o.col, { w: 0.9 }); stk(c, "M-16 -58 L16 -58 L16 90 L-16 90Z", { hi: "#fff68a", lo: "#ffc400", out: "#a8460a" }, { w: 0.5 }); stk(c, "M0 -58 C-60 -112 -70 -60 0 -58 C70 -60 60 -112 0 -58Z", { hi: "#fff68a", lo: "#ffc400", out: "#a8460a" }, { w: 0.7 }); });
  def("bomb", "purple", "cartoon bomb, fuse sparks", (c, o) => { stk(c, "M-72 16 A72 72 0 1 0 72 16 A72 72 0 1 0 -72 16Z", { hi: "#4a4f66", lo: "#14152a", out: "#06060f" }); shine(c, -30, -22, 12, 20); line(c, "M26 -50 C44 -82 62 -72 70 -92", { hi: "#d7b27a", lo: "#8a5a22", out: "#3a2208" }, 10); const k = 0.7 + 0.5 * Math.abs(Math.sin(o.t * 18)); c.save(); c.translate(72, -96); c.rotate(o.t * 4); c.scale(k, k); stk(c, star(4, 34, 9), { hi: "#fff68a", lo: "#ff8a00", out: "#a8460a" }, { w: 0.6 }); c.restore(); });
  def("megaphone", "red", "megaphone, sound arcs pulse", (c, o) => { const k = (o.t * 2) % 1; c.save(); c.globalAlpha = 1 - k * 0.6; for (let i = 0; i < 2; i++) { c.strokeStyle = "#fff"; c.lineWidth = 9; c.lineCap = "round"; c.beginPath(); c.arc(30, 0, 70 + i * 28 + k * 14, -0.55, 0.55); c.stroke(); } c.restore(); stk(c, "M-86 -26 L26 -78 L26 78 L-86 26Z", o.col); stk(c, "M-96 -34 L-76 -34 L-76 34 L-96 34Z", { hi: "#d7dbe6", lo: "#8a90a6", out: "#14143c" }, { w: 0.6 }); stk(c, "M-60 24 L-30 24 L-22 76 L-52 76Z", { hi: "#d7dbe6", lo: "#8a90a6", out: "#14143c" }, { w: 0.6 }); });
  def("note", "pink", "music note", (c, o) => { stk(c, "M-62 56 A34 28 -20 1 0 6 40 A34 28 -20 1 0 -62 56Z", o.col, { w: 0.8 }); line(c, "M2 44 L2 -80 C30 -74 54 -52 52 -22", o.col, 18); });
  def("brain", "pink", "brain (two lobes, folds; wears any face)", (c, o) => { stk(c, "M0 -84 C-40 -104 -96 -76 -90 -30 C-112 -6 -92 52 -50 56 C-44 92 8 98 0 56 C8 98 44 92 50 56 C92 52 112 -6 90 -30 C96 -76 40 -104 0 -84Z", o.col); c.strokeStyle = o.col.out; c.globalAlpha = 0.55; c.lineWidth = 7; c.lineCap = "round"; c.beginPath(); c.moveTo(0, -80); c.lineTo(0, 54); c.moveTo(-70, -34); c.quadraticCurveTo(-46, -54, -22, -30); c.moveTo(-76, 14); c.quadraticCurveTo(-48, -2, -22, 20); c.moveTo(70, -34); c.quadraticCurveTo(46, -54, 22, -30); c.moveTo(76, 14); c.quadraticCurveTo(48, -2, 22, 20); c.stroke(); c.globalAlpha = 1; });
  def("octopus", "pink", "octopus mascot: round head, 8 waving arms, eyes (the face option changes its mood)", (c, o) => {
    const t = o.t, col = o.col;
    c.lineJoin = "round"; c.lineCap = "round";
    const arms = []; for (let i = 0; i < 8; i++) { const d = i - 3.5, sg = Math.sign(d), pts = []; for (let k = 0; k <= 12; k++) { const u = k / 12, x0 = d * 17, xt = d * 36, len = 74 + 14 * Math.abs(d) / 3.5; pts.push([x0 + (xt - x0) * u + Math.sin(u * 5 - t * 5 + i * 0.9) * 11 * u + sg * 26 * u * u * u, 44 + len * u - 16 * u * u * u * (Math.abs(d) > 1.5 ? 1 : 0.2) + Math.sin(u * 3 - t * 3.4 + i) * 5 * u]); } arms.push(pts); }
    const armPath = (pts) => { const p = new Path2D(); pts.forEach((q, i) => (i ? p.lineTo(q[0], q[1]) : p.moveTo(q[0], q[1]))); return p; };
    for (const pts of arms) { const p = armPath(pts); c.save(); c.translate(3, 7); c.strokeStyle = "rgba(10,20,60,0.4)"; c.lineWidth = 42; c.stroke(p); c.restore(); }
    for (const [lw, st] of [[40, col.out], [28, "#fff"], [16, null]]) for (const pts of arms) { const p = armPath(pts); c.lineWidth = lw; c.strokeStyle = st || col.lo; c.stroke(p); }
    for (const pts of arms) for (const k of [5, 7, 9]) dot(c, pts[k][0], pts[k][1] + 1, 3.6, "rgba(255,235,245,0.9)");
    stk(c, "M-86 40 C-122 -52 -72 -118 0 -118 C72 -118 122 -52 86 40 C62 66 -62 66 -86 40Z", col);
    shine(c, -44, -72, 12, 22, -0.6);
    if (!o.face) face(c, "happy", -16, 1.3);
  });

  K.ART = A;
  A.octopus.fy = -16; A.octopus.fk = 1.3;
  K.drawArt = function (c, name, o) { const a = A[name]; if (!a) return; a.fn(c, o); if (o.face) face(c, o.face, o.fy ?? a.fy ?? 6, o.fk ?? a.fk ?? 1.15); };
  K.drawFace = face;
})((typeof window !== "undefined" ? (window.VCK = window.VCK || {}) : {}));
// genhaha:4846ca29f0d0
