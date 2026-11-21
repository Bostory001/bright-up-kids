// vc-validate.js - variety-captions data checks, IN THE PAGE (MCP: an error becomes the red card in preview_frame) and in node (variety-captions lint / check / sync).
//   VCV.catalog()                        every valid name, read from the loaded kit (vc-lib.js + vc-art.js)
//   VCV.validate(SCENE, caps, shotIds)   -> [{ level: "error"|"warn", path, msg, fix }]   (wrong names get "did you mean"; text edges and overlaps are checked)
//   VCV.expand(SCENE, shotIds, caps)     -> scene for VC.build (shots object -> array in section order); merges SCENE.lines into caps
// Form: const SCENE = { palette, bg, cam, seed, flash, cut, caption, lines: { <key>: { cap, en, hi } }, shots: { <shotId>: { bg, cam, items: [ { cap | art | fx, ... } ] } } }
(function (K) {
  const ITEM_KEYS = ["cap", "kind", "art", "fx", "x", "y", "s", "rot", "size", "color", "colors", "burst", "at", "until", "dur", "from", "to", "dec", "prefix", "suffix", "maxW", "anim", "idle", "face", "fy", "label", "sym", "flip", "n", "r", "flash", "font", "note"];
  const SHOT_KEYS = ["items", "bg", "cam", "subs", "dur", "note"];
  const TOP_KEYS = ["palette", "bg", "cam", "seed", "flash", "cut", "caption", "lines", "shots", "title", "note"];
  const NUM_KEYS = ["x", "y", "s", "rot", "size", "dur", "from", "to", "dec", "maxW", "fy", "n", "r"];
  const SAFE = [250, 1520], SUB_TOP = 1340;   // text lives in y 250-1520; the subtitle line owns y 1360-1500, so captions end at 1340
  function catalog() {
    return {
      palettes: Object.fromEntries(Object.entries(K.PALETTES || {}).map(([k, v]) => [k, v.note])), colors: K.COLORS || [], bgs: K.BGS || [],
      cams: K.CAMS || {}, kinds: K.KINDS || {}, art: Object.fromEntries(Object.entries(K.ART || {}).map(([k, v]) => [k, `${v.doc} (default colour ${v.col})`])),
      fx: K.FX || {}, anims: K.ANIMS || [], idles: K.IDLES || [], faces: K.FACES || [], cuts: K.CUTS || [], itemKeys: ITEM_KEYS, shotKeys: SHOT_KEYS, topKeys: TOP_KEYS,
      timeSpec: "number = s from shot start | \"@key\" | \"@key:word\" | \"@key.end\" | \"end-0.4\" | \"40%\" | any + \"+0.3\"",
    };
  }
  const near = (v, list) => {
    let best = null, bd = 1e9; const a = String(v);
    for (const b of list) { const dp = Array.from({ length: a.length + 1 }, (_, i) => [i, ...Array(b.length).fill(0)]); for (let j = 1; j <= b.length; j++) dp[0][j] = j; for (let i = 1; i <= a.length; i++) for (let j = 1; j <= b.length; j++) dp[i][j] = Math.min(dp[i - 1][j] + 1, dp[i][j - 1] + 1, dp[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1)); if (dp[a.length][b.length] < bd) { bd = dp[a.length][b.length]; best = b; } }
    return bd <= Math.max(2, a.length / 2) ? best : null;
  };
  const plain = (t) => String(t || "").replace(/[\[\]]/g, "");
  const shotList = (S, shotIds) => {
    if (Array.isArray(S.shots)) return S.shots.map((s, i) => ({ ...s, id: s.id || `s${i + 1}` }));
    const o = S.shots || {}, ids = shotIds && shotIds.length ? shotIds : Object.keys(o);
    return ids.map((id) => ({ ...(o[id] || {}), id }));
  };
  const rectHit = (a, b, pad = 0) => a.left < b.right + pad && b.left < a.right + pad && a.top < b.bottom + pad && b.top < a.bottom + pad;

  function validate(S, caps, shotIds) {
    const C = catalog(), out = [], E = (p, msg, fix) => out.push({ level: "error", path: p, msg, fix }), Wn = (p, msg, fix) => out.push({ level: "warn", path: p, msg, fix });
    if (!S || typeof S !== "object") { E("SCENE", "no data", "const SCENE = { palette: \"pop\", shots: { <shotId>: { items: [ { cap: \"...\", y: 440 } ] } } };"); return out; }
    if (!S.shots || (Array.isArray(S.shots) ? !S.shots.length : !Object.keys(S.shots).length)) { E("shots", "no shots", "shots: { <shotId>: { items: [ { cap: \"สวัสดี\", kind: \"burst\", y: 440 } ] }, … } — one entry per script shot"); return out; }
    const keys = new Map((caps || []).map((c) => [c.key, plain(c.text)]));
    const enumCheck = (p, v, list, what) => { if (v != null && !list.includes(v)) { const n = near(v, list); E(p, `unknown ${what} "${v}"`, `use one of: ${list.join(", ")}${n ? ` (did you mean "${n}"?)` : ""}`); } };
    const timeCheck = (p, v) => {
      if (v == null || typeof v === "number") return;
      if (typeof v !== "string") return E(p, "time must be a number or a string", "1.2 · \"@key\" · \"@key:word\" · \"@key.end\" · \"end-0.4\" · \"40%\"");
      if (v[0] !== "@") { if (!/^(start|end|\d+(\.\d+)?%?|\d*\.\d+)?([+-]\d*\.?\d+)?$/.test(v.trim()) || !v.trim()) E(p, `bad time "${v}"`, C.timeSpec); return; }
      const m = v.slice(1).replace(/[+-]\d*\.?\d+$/, "").replace(/\.end$/, ""), [k, w] = m.split(":");
      if (!keys.has(k)) E(p, `no script line with key "${k}"`, `keys: ${[...keys.keys()].join(", ")}`);
      else if (w && !keys.get(k).includes(w)) E(p, `"${w}" is not in line ${k} ("${keys.get(k)}")`, "copy a word exactly as written in that line (the item then appears the moment it is spoken)");
    };
    for (const k of Object.keys(S)) if (!TOP_KEYS.includes(k)) Wn(k, `unknown scene key "${k}" (ignored)`, near(k, TOP_KEYS) ? `did you mean "${near(k, TOP_KEYS)}"?` : `scene keys: ${TOP_KEYS.join(", ")}`);
    enumCheck("palette", S.palette, Object.keys(C.palettes), "palette"); enumCheck("bg", S.bg, C.bgs, "background"); enumCheck("cam", S.cam, Object.keys(C.cams), "camera"); enumCheck("cut", S.cut, C.cuts, "cut");
    const subOn = !(S.caption && S.caption.show === false), bottomMax = subOn ? SUB_TOP : SAFE[1];
    if (S.caption && S.caption.y != null && (S.caption.y < 1300 || S.caption.y > SAFE[1] - 60)) E("caption.y", `subtitle y ${S.caption.y} is outside the safe area`, "keep caption.y between 1300 and 1460 (default 1410)");
    if (!Array.isArray(S.shots) && shotIds) {
      for (const id of Object.keys(S.shots)) if (!shotIds.includes(id)) E(`shots.${id}`, `no script shot "${id}"`, `shot ids: ${shotIds.join(", ")}`);
      for (const id of shotIds) if (!S.shots[id]) Wn(`shots.${id}`, "no data for this shot → empty background", `add shots.${id}`);
    }
    if (S.lines) for (const [k, l] of Object.entries(S.lines)) {
      if (!keys.has(k)) { E(`lines.${k}`, `no script line with key "${k}"`, `keys: ${[...keys.keys()].join(", ")}`); continue; }
      if (l && l.cap) [].concat(l.cap).forEach((c, j) => { const spoken = Array.isArray(c) ? c[1] : c; if (typeof spoken === "string" && !keys.get(k).includes(spoken.split(/\s+/)[0])) Wn(`lines.${k}.cap[${j}]`, `phrase "${spoken}" not found in line ${k}`, "subtitle phrases are the spoken words in order; use [\"shown\", \"as spoken\"] to show digits"); });
      for (const t of [].concat((l && l.cap) || []).flat()) if (K.EMOJI.test(String(t))) E(`lines.${k}.cap`, "emoji in a subtitle", "no emoji: the font has none (they render as boxes)");
    }
    shotList(S, shotIds).forEach((sh) => {
      const P = Array.isArray(S.shots) ? `shots[${sh.id}]` : `shots.${sh.id}`;
      for (const k of Object.keys(sh)) if (k !== "id" && !SHOT_KEYS.includes(k)) Wn(`${P}.${k}`, `unknown shot key "${k}" (ignored)`, near(k, SHOT_KEYS) ? `did you mean "${near(k, SHOT_KEYS)}"?` : `shot keys: ${SHOT_KEYS.join(", ")}`);
      enumCheck(`${P}.bg`, sh.bg, C.bgs, "background"); enumCheck(`${P}.cam`, sh.cam, Object.keys(C.cams), "camera");
      if (sh.items != null && !Array.isArray(sh.items)) { E(`${P}.items`, "items must be a list", "items: [ { cap: \"...\", y: 440 }, { art: \"star\", x: 540, y: 900 } ]"); return; }
      if (!(sh.items || []).length) Wn(P, "shot has no items → an empty background", "add a caption and a sticker");
      const boxes = [];
      (sh.items || []).forEach((it, j) => {
        const Q = `${P}.items[${j}]`;
        if (!it || typeof it !== "object" || Array.isArray(it)) return E(Q, "an item must be an object", "{ cap: \"สามหัวใจ!\", kind: \"burst\", y: 440 }");
        const isCap = it.cap != null || (it.kind != null && it.art == null && it.fx == null), kinds = [isCap ? "cap" : null, it.art != null ? "art" : null, it.fx != null ? "fx" : null].filter(Boolean);
        if (kinds.length !== 1) return E(Q, kinds.length ? `item has ${kinds.join(" + ")} — use exactly one` : "item needs cap, art or fx", "{ cap: \"…\" } caption | { art: \"<name>\" } sticker | { fx: \"confetti\" } effect");
        for (const k of Object.keys(it)) if (!ITEM_KEYS.includes(k)) Wn(`${Q}.${k}`, `unknown item key "${k}" (ignored)`, near(k, ITEM_KEYS) ? `did you mean "${near(k, ITEM_KEYS)}"?` : `item keys: ${ITEM_KEYS.join(", ")}`);
        for (const k of NUM_KEYS) if (it[k] != null && (typeof it[k] !== "number" || !isFinite(it[k]))) E(`${Q}.${k}`, `${k} must be a number`, `${k}: 540`);
        enumCheck(`${Q}.color`, it.color, C.colors, "colour"); enumCheck(`${Q}.burst`, it.burst, C.colors, "colour");
        if (it.colors != null) [].concat(it.colors).forEach((n, m) => enumCheck(`${Q}.colors[${m}]`, n, C.colors, "colour"));
        enumCheck(`${Q}.anim`, it.anim, C.anims, "animation"); enumCheck(`${Q}.idle`, it.idle, C.idles, "idle motion"); enumCheck(`${Q}.face`, it.face, C.faces, "face"); enumCheck(`${Q}.font`, it.font, ["heavy", "hand"], "font");
        if (Array.isArray(it.at)) it.at.forEach((a, m) => timeCheck(`${Q}.at[${m}]`, a)); else timeCheck(`${Q}.at`, it.at);
        timeCheck(`${Q}.until`, it.until);
        if (it.s != null && (it.s <= 0 || it.s > 8)) E(`${Q}.s`, `scale ${it.s} out of range`, "s between 0.2 and 6 (1 ≈ 200 px)");
        const x = it.x ?? 540, y = it.y ?? (isCap ? 600 : 960);
        if (x < -100 || x > 1180 || y < -100 || y > 2020) E(Q, `position (${x}, ${y}) is off the 1080×1920 frame`, "x 0–1080, y 250–1340 for anything that matters");
        for (const t of [it.cap, it.label, it.prefix, it.suffix, it.sym]) if (t != null && K.EMOJI.test(String(t))) E(Q, "emoji in text", "no emoji: write the word or use a sticker (art: \"heart\")");
        if (it.art != null) {
          enumCheck(`${Q}.art`, it.art, Object.keys(C.art), "sticker");
          if (it.face != null && it.art === "smile") Wn(`${Q}.face`, "smile already has a face", "use face on other stickers");
          const half = (it.s ?? 1) * 100 * (it.art === "octopus" ? 1.45 : 1);
          boxes.push({ art: true, it, left: x - half, right: x + half, top: y - half, bottom: y + half, Q });
          if (y + half > SUB_TOP + 40 && subOn) Wn(`${Q}.y`, `sticker ${it.art} reaches y ${Math.round(y + half)}, into the subtitle lane (y ${SUB_TOP + 20}–1500)`, `move it up or make it smaller: y ≤ ${Math.floor(SUB_TOP + 40 - half)}`);
        } else if (it.fx != null) { enumCheck(`${Q}.fx`, it.fx, Object.keys(C.fx), "effect"); }
        else {
          const kind = it.kind || "burst"; enumCheck(`${Q}.kind`, it.kind, Object.keys(C.kinds), "caption kind");
          if (kind === "counter") { if (typeof it.to !== "number") E(`${Q}.to`, "a counter needs the number it counts to", "{ kind: \"counter\", to: 9, cap: \"สมอง\" }"); }
          else if (typeof it.cap !== "string" || !it.cap.trim()) E(`${Q}.cap`, "cap must be a non-empty string", "cap: \"หัวใจ 3 ดวง!\"");
          if (kind === "stack" && Array.isArray(it.at) && it.at.length > 1 && it.at.length !== String(it.cap).split(/\n|\|/).length) Wn(`${Q}.at`, `${it.at.length} times for ${String(it.cap).split(/\n|\|/).length} lines`, "one time per line (the last time repeats for extra lines)");
          if (it.size != null && (it.size < 40 || it.size > 340)) E(`${Q}.size`, `size ${it.size} out of range`, "size 60–300 (burst 170–230, aside 60–90, counter 240–320)");
          const b = K.capBox({ ...it, kind }), n = b.lines.length;
          const size0 = it.size ?? K.KIND_SIZE[kind] ?? 150, minSize = Math.min(...b.sizes);
          if (kind !== "aside" && minSize < 56) E(`${Q}.cap`, `caption "${String(it.cap).slice(0, 18)}" would shrink to ${Math.round(minSize)} px to fit ${Math.round(b.maxW)} px of width`, "shorten it, break it with | (two lines), or move it up / to the centre (x 540); below y 900 the width is only 840 px");
          else if (minSize < size0 * 0.7) Wn(`${Q}.cap`, `caption "${String(it.cap).slice(0, 18)}" shrinks from ${size0} to ${Math.round(minSize)} px to fit`, "shorten it or break it with | for a bigger look");
          const pad = kind === "burst" ? 90 : kind === "counter" ? 60 : 0;   // the starburst behind the letters is bigger than the text
          boxes.push({ ...b, it, Q, kind, top: b.top - pad, bottom: b.bottom + pad });
          if (b.top < SAFE[0]) E(`${Q}.y`, `caption "${String(it.cap).slice(0, 18)}" (top y ${Math.round(b.top)}) leaves the safe area (y ≥ ${SAFE[0]})`, `move it down: y ≥ ${Math.ceil(SAFE[0] + b.h / 2)}`);
          if (b.bottom > bottomMax) E(`${Q}.y`, `caption "${String(it.cap).slice(0, 18)}" (bottom y ${Math.round(b.bottom)}) runs into the ${subOn ? `subtitle lane (y ≥ ${SUB_TOP})` : `app caption area (y ≥ ${SAFE[1]})`}`, `move it up: y ≤ ${Math.floor(bottomMax - b.h / 2)}${subOn ? "" : ""}`);
          if (b.bottom > 900 && b.right > 960) E(`${Q}.x`, `caption "${String(it.cap).slice(0, 18)}" (right edge x ${Math.round(b.right)}) is under the like / comment buttons (nothing right of x 960 below y 900)`, `centre it (x 540) with a shorter text, or move it up above y 900; now x ≤ ${Math.floor(960 - b.w / 2)}`);
          if (b.left < 40) E(`${Q}.x`, `caption "${String(it.cap).slice(0, 18)}" starts at x ${Math.round(b.left)}`, "keep text inside x 40–1040");
          if (n > 3 && kind !== "stack") Wn(`${Q}.cap`, `${n} lines in one caption`, "big captions work best in 1–2 lines; use kind: \"stack\" for a list");
        }
      });
      // overlaps: two captions that both stay until the end of the shot must not share space (a caption with `until` is trusted to leave in time); a caption must not bury a big sticker
      const caps2 = boxes.filter((b) => !b.art);
      for (let a = 0; a < caps2.length; a++) for (let b = a + 1; b < caps2.length; b++) {
        const A = caps2[a], B = caps2[b], live = A.it.until == null && B.it.until == null;
        if (live && rectHit(A, B, -4)) E(`${B.Q}`, `caption "${String(B.it.cap).slice(0, 14)}" overlaps "${String(A.it.cap).slice(0, 14)}" (${A.Q})`, `move one: y ${Math.round(A.y)} vs ${Math.round(B.y)}; the boxes (with the burst) are ${Math.round(A.bottom - A.top)} and ${Math.round(B.bottom - B.top)} px tall; or give the first one \`until\``);
      }
      for (const A of boxes.filter((b) => b.art && (b.it.s ?? 1) >= 1.6)) for (const B of caps2) {
        const ix = Math.max(0, Math.min(A.right, B.right) - Math.max(A.left, B.left)), iy = Math.max(0, Math.min(A.bottom, B.bottom) - Math.max(A.top, B.top));
        if (ix * iy > 0.3 * (A.right - A.left) * (A.bottom - A.top)) Wn(B.Q, `caption "${String(B.it.cap).slice(0, 14)}" covers more than a third of the sticker ${A.it.art} (${A.Q})`, "move the caption or the sticker apart (big stickers are the hero of the shot)");
      }
    });
    return out;
  }

  // SCENE -> scene for VC.build; merges per-line subtitle data into window.CAPTIONS (the platform keeps only t/key/sfx/pause per line); [word] = gold
  function expand(S, shotIds, caps) {
    const lines = S.lines || {};
    (caps || []).forEach((c) => {
      const l = lines[c.key] || {};
      const br = [...String(c.text || "").matchAll(/\[([^\]]+)\]/g)].map((m) => m[1]);
      for (const f of ["cap", "en"]) if (l[f] != null) c[f] = l[f];
      const hi = [].concat(c.hi || [], l.hi || [], br); if (hi.length) c.hi = [...new Set(hi)];
    });
    const { lines: _l, shots: _s, ...rest } = S;
    return { ...rest, shots: shotList(S, shotIds) };
  }
  const api = { catalog, validate, expand };
  if (typeof window !== "undefined") window.VCV = api;
})((typeof window !== "undefined" ? (window.VCK = window.VCK || {}) : {}));
// genhaha:4846ca29f0d0
