// vc-lib.js - variety-captions shared tables: maths, 4 colour sets (palettes), colours, backgrounds, camera / caption-kind / animation names, Thai-aware text helpers.
// Plain data + small functions only. Loaded by the page (vc-kit.js) and by node (the validator reads the names from here, so a "did you mean" always matches what the page can draw).
(function (K) {
  K.W = 1080; K.H = 1920; K.TAU = Math.PI * 2;
  const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
  K.clamp = clamp;
  K.lerp = (a, b, k) => a + (b - a) * k;
  K.eo = (x) => 1 - Math.pow(1 - clamp(x), 3);                                   // ease out (cubic)
  K.ei = (x) => Math.pow(clamp(x), 3);                                            // ease in
  K.eio = (x) => { x = clamp(x); return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2; };
  K.back = (x, s = 1.7) => { x = clamp(x); const c3 = s + 1; return 1 + c3 * Math.pow(x - 1, 3) + s * Math.pow(x - 1, 2); };   // overshoot
  K.bounceOut = (x) => { x = clamp(x); const n = 7.5625, d = 2.75; if (x < 1 / d) return n * x * x; if (x < 2 / d) return n * (x -= 1.5 / d) * x + 0.75; if (x < 2.5 / d) return n * (x -= 2.25 / d) * x + 0.9375; return n * (x -= 2.625 / d) * x + 0.984375; };
  K.hash = (n) => { const s = Math.sin(n * 127.1 + 311.7) * 43758.5453; return s - Math.floor(s); };   // seeded noise: no Math.random anywhere (every frame is a pure function of time)

  // ---------- colours: 8 names; each = { hi, lo, out } (fill gradient top / bottom, dark outline). A palette tunes all 8 at once ----------
  const BASE = {
    yellow: ["#fff68a", "#ffc400", "#a8460a"], pink: ["#ffb3e0", "#ff2d95", "#7a0f4a"], blue: ["#b4f1ff", "#2a8bff", "#0b3a95"], lime: ["#eaff7a", "#6fd400", "#1f6a00"],
    red: ["#ff9a8a", "#ff2d2d", "#7a0a0a"], orange: ["#ffd08a", "#ff8a00", "#7a3000"], purple: ["#e2b8ff", "#a044ff", "#3a0a7a"], white: ["#ffffff", "#dfe8ff", "#2a2a6a"],
  };
  K.COLORS = Object.keys(BASE);
  const hex = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
  const toHex = (r) => "#" + r.map((v) => Math.round(clamp(v, 0, 255)).toString(16).padStart(2, "0")).join("");
  function hsl([r, g, b]) { r /= 255; g /= 255; b /= 255; const mx = Math.max(r, g, b), mn = Math.min(r, g, b), l = (mx + mn) / 2; let h = 0, s = 0; if (mx !== mn) { const d = mx - mn; s = l > 0.5 ? d / (2 - mx - mn) : d / (mx + mn); h = mx === r ? (g - b) / d + (g < b ? 6 : 0) : mx === g ? (b - r) / d + 2 : (r - g) / d + 4; h /= 6; } return [h, s, l]; }
  function rgb([h, s, l]) { if (s === 0) return [l * 255, l * 255, l * 255]; const f = (p, q, t) => { if (t < 0) t += 1; if (t > 1) t -= 1; return t < 1 / 6 ? p + (q - p) * 6 * t : t < 1 / 2 ? q : t < 2 / 3 ? p + (q - p) * (2 / 3 - t) * 6 : p; }; const q = l < 0.5 ? l * (1 + s) : l + s - l * s, p = 2 * l - q; return [f(p, q, h + 1 / 3) * 255, f(p, q, h) * 255, f(p, q, h - 1 / 3) * 255]; }
  const tune = (c, t) => { const [h, s, l] = hsl(hex(c)); return toHex(rgb([h, clamp(s * t.s), clamp(l + t.l)])); };

  // ---------- 4 colour sets: pick ONE with `palette` in the scene data ----------
  K.PALETTES = {
    pop:   { note: "cyan-to-blue sea, hot yellow and pink: the classic loud variety-show look", bg: ["#22c4ea", "#1393d6", "#0a4a9c"], ray: "rgba(255,255,255,0.14)", tune: { s: 1, l: 0 }, ink: "#12204a", subOut: "#0b2a66", defBg: "rays" },
    candy: { note: "pink-to-lilac pastel with saturated candy colours: cute, food, lifestyle", bg: ["#ffc2ea", "#e49bff", "#9a78ff"], ray: "rgba(255,255,255,0.20)", tune: { s: 0.95, l: 0.02 }, ink: "#3a0f5e", subOut: "#5a1a8a", defBg: "dots" },
    night: { note: "deep indigo with neon colours: gaming, mystery, tech, late-night", bg: ["#2c1c70", "#1a1245", "#090720"], ray: "rgba(150,120,255,0.18)", tune: { s: 1.08, l: 0.01 }, ink: "#0a0820", subOut: "#000000", defBg: "stripes" },
    sunny: { note: "warm orange-to-red sunset: food, travel, money, energy", bg: ["#ffd23f", "#ff9a3c", "#ff5e5e"], ray: "rgba(255,255,255,0.22)", tune: { s: 1, l: 0 }, ink: "#4a1500", subOut: "#7a2a00", defBg: "rays" },
  };
  K.palette = (name) => {
    const P = K.PALETTES[name] || K.PALETTES.pop, col = {};
    for (const [k, v] of Object.entries(BASE)) col[k] = { hi: tune(v[0], P.tune), lo: tune(v[1], P.tune), out: tune(v[2], P.tune) };
    return { ...P, name: K.PALETTES[name] ? name : "pop", col };
  };
  K.BGS = ["rays", "dots", "stripes", "waves", "checker", "plain"];
  K.CAMS = {
    punch: "punch-in (4 frames) on every caption hit + light handheld drift: the default",
    drift: "slow handheld drift, no zoom pulses (calm shots)",
    push: "slow push-in over the whole shot",
    pull: "slow pull-out over the whole shot",
    whip: "a fast whip across at the start of the shot that settles (energetic cut)",
    rock: "slow rocking dutch angle with a slight zoom (silly, dizzy)",
    still: "locked off",
  };
  K.KINDS = {
    burst: "starburst behind, letters pop one by one on the spoken word, wiggle while held (the loud default: hooks and key words)",
    shake: "crashes in big, then shakes (shock, danger, anger)",
    stamp: "slams down inside a boxed stamp with an impact ring (verdicts: ผ่าน / ห้าม / จริง)",
    swipe: "highlighter bar swipes across, dark text on it, wavy underline follows (a phrase to underline)",
    stack: "lines separated by | each pop in on their own spoken word, alternating colours and tilts (lists, 'a, b, c')",
    bounce: "letters drop from above and bounce one after another, then wave (fun, playful)",
    tilt: "tilted ribbon with a 3D slab under the text, spins in (titles, labels)",
    counter: "number counts up with a pulse and a final burst; `cap` is the label under it (to, from, dec, prefix, suffix)",
    aside: "small slanted hand-written aside (Mali), pops in (the 'by the way' remark above or below a big caption)",
  };
  K.ANIMS = ["pop", "drop", "spin", "slide-l", "slide-r", "zoom", "none"];
  K.IDLES = ["bob", "pulse", "wiggle", "spin", "float", "none"];
  K.FACES = ["happy", "shock", "smirk", "cry", "dizzy", "angry", "wink"];
  K.FX = { confetti: "falling paper pieces over the whole screen (dur, n)", sparkles: "twinkling 4-point stars around x, y (r = radius, n)", speed: "radial speed lines from x, y (r = inner radius)", shock: "an expanding shock ring at x, y (r = final radius)" };
  K.CUTS = ["flash", "none"];

  // ---------- Thai-aware text ----------
  const MARK = /[ัิ-ฺ็-๎]/, LEAD = /[เ-ไ]/, THAI = /[฀-๿]/;
  // clusters: a consonant keeps its vowel / tone marks (and a leading vowel) so letter-by-letter pops never tear a Thai syllable apart
  K.clusters = (s) => { const out = []; let lead = ""; for (const ch of [...String(s)]) { if (MARK.test(ch) && out.length) out[out.length - 1] += ch; else if (LEAD.test(ch)) lead += ch; else { out.push(lead + ch); lead = ""; } } if (lead) out.push(lead); return out; };
  K.cw = (ch, size) => (MARK.test(ch) ? 0 : THAI.test(ch) ? 0.58 * size : /[A-Z0-9]/.test(ch) ? 0.66 * size : /[a-z]/.test(ch) ? 0.58 * size : /\s/.test(ch) ? 0.3 * size : /[.,:;!'|]/.test(ch) ? 0.34 * size : 0.62 * size);
  K.est = (str, size) => [...String(str)].reduce((w, ch) => w + K.cw(ch, size), 0);
  K.EMOJI = /[\u{1F000}-\u{1FAFF}\u{2600}-\u{27BF}\u{2B00}-\u{2BFF}\u{FE0F}]/u;
  K.FONT = { heavy: "VCHeavy", hand: "VCHand" };
  // ---------- caption boxes (shared by the validator and the page: the same maths, so a passing check means the page fits) ----------
  K.KIND_SIZE = { burst: 190, shake: 170, stamp: 150, swipe: 120, stack: 150, bounce: 170, tilt: 130, counter: 280, aside: 74 };
  K.numFmt = (v, dec = 0) => { const s = Math.abs(v).toFixed(dec), [i, f] = s.split("."); return (v < 0 ? "-" : "") + i.replace(/\B(?=(\d{3})+(?!\d))/g, ",") + (f ? "." + f : ""); };
  K.capBox = (it, meas) => {
    const kind = it.kind || "burst", x = it.x ?? 540, y = it.y ?? 600, size0 = it.size ?? K.KIND_SIZE[kind] ?? 150, W = meas || ((s, z) => K.est(s, z));
    const lines = kind === "counter" ? [(it.prefix || "") + K.numFmt(it.to ?? 0, it.dec || 0) + (it.suffix || "")] : String(it.cap == null ? "" : it.cap).split(/\n|\|/);
    let maxW = it.maxW ?? 900; const lh0 = size0 * 1.12 * lines.length; if (y + lh0 / 2 > 900) maxW = Math.min(maxW, 2 * (960 - x));
    const widths = lines.map((l) => W(l, size0)), per = kind === "stack";
    const fits = widths.map((w) => (w > maxW ? maxW / w : 1)), shared = Math.min(...fits, 1);
    const sizes = lines.map((l, i) => size0 * (per ? fits[i] : shared)), ws = lines.map((l, i) => widths[i] * (per ? fits[i] : shared));
    let w = Math.max(...ws, 1), h = sizes.reduce((a, z) => a + z * 1.12, 0);
    if (kind === "stamp") { w += 80; h += 70; } else if (kind === "swipe") { w += 60; h += 24; } else if (kind === "tilt") { w += 110; h += 40; h += w * 0.14; }
    else if (kind === "counter") { const lab = it.cap ? sizes[0] * 0.34 * 1.2 : 0; h += lab; }
    return { x, y, w, h, size: sizes[0], sizes, lines, maxW, left: x - w / 2, right: x + w / 2, top: y - h / 2, bottom: y + h / 2 };
  };

})((typeof window !== "undefined" ? (window.VCK = window.VCK || {}) : {}));
// genhaha:4846ca29f0d0
