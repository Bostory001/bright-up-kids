// validate.js — named errors with "did you mean" for the cutout engine. Loaded BEFORE motion.js and cutout-kit.js.
// Every wrong name (prop, background, face, pose, enter, anim, caption key) is recorded in window.__CO_VALIDATION = { errors, warnings } instead of
// crashing half way, a harmless stand-in is drawn, and K.finish() throws one "SCENE has N error(s)" at the end. `cutout check` prints the lists.
(function () {
  const V = (window.__CO_VALIDATION = window.__CO_VALIDATION || { errors: [], warnings: [] });
  const ANIMS = ["pop", "drop", "fade", "none", "slide:l", "slide:r", "slide:u", "slide:d"];
  const ENTERS = ["cut", "wipe", "curtain", "pop"];
  const lev = (a, b) => { const d = Array.from({ length: a.length + 1 }, (_, i) => [i]); for (let j = 1; j <= b.length; j++) d[0][j] = j;
    for (let i = 1; i <= a.length; i++) for (let j = 1; j <= b.length; j++) d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1)); return d[a.length][b.length]; };
  const dym = (name, list) => {
    const n = String(name).toLowerCase(); let best = null, bd = 99;
    for (const x of list) { const l = String(x).toLowerCase(), d = l.includes(n) || n.includes(l) ? 1 : lev(n, l); if (d < bd) { bd = d; best = x; } }
    return best != null && bd <= Math.max(2, Math.floor(n.length / 3)) ? `Did you mean "${best}"? ` : "";
  };
  const err = (m) => { if (!V.errors.includes(m)) V.errors.push(m); };
  const warn = (m) => { if (!V.warnings.includes(m)) V.warnings.push(m); };
  window.CutoutDYM = dym; window.CutoutErr = err; window.CutoutWarn = warn;
  const num = (v) => typeof v === "number" && Number.isFinite(v);

  function check(kind, name, list, where) {
    if (list.includes(name)) return true;
    err(`${where}: ${kind} "${name}" does not exist. ${dym(name, list)}Valid ${kind}s: ${list.join(" ")}`);
    return false;
  }

  window.CutoutValidate = function (K, M) {
    const PROPS = Object.keys(K.PROPS), BGS = Object.keys(K.BG), FACES = Object.keys(K.FACES), POSES = Object.keys(K.POSES);
    const scenesSeen = [];

    const prop = K.prop;
    K.prop = (name, o) => {
      if (!check("prop", name, Object.keys(K.PROPS), "K.prop")) return K.PROPS.qmark({});
      return prop(name, o);
    };

    const scene = K.scene;
    K.scene = (id, bg, o = {}) => {
      const where = `K.scene("${id}")`;
      if (!document.querySelector("#sc-" + id)) { err(`${where}: there is no <section id="sc-${id}" data-shot="${id}" …> in index.html (and a matching shot "${id}" in captions.js). Sections: ${[...document.querySelectorAll("section[data-shot]")].map((s) => s.dataset.shot).join(" ") || "none"}`); }
      if (bg != null && !BGS.includes(bg)) { err(`${where}: background "${bg}" does not exist. ${dym(bg, BGS)}Valid backgrounds: ${BGS.join(" ")}`); bg = "plain"; }
      if (o.enter != null && !ENTERS.includes(o.enter)) { err(`${where}: enter "${o.enter}" does not exist. ${dym(o.enter, ENTERS)}Valid: ${ENTERS.join(" ")}`); o = { ...o, enter: "cut" }; }
      if (scenesSeen.includes(id)) err(`${where}: this scene id is used twice — one K.scene per <section>`);
      scenesSeen.push(id);
      const L = scene(id, bg, o);
      const add = L.add;
      L.add = (svg, x, y, ao = {}) => {
        const w = `L.add in scene "${id}"`;
        if (typeof svg !== "string") { err(`${w}: first argument must be an svg string (use K.prop("bulb") or K.txt(...)), got ${typeof svg}`); svg = ""; }
        if (!num(x) || !num(y)) { err(`${w}: x and y must be numbers (got x=${x}, y=${y})`); x = 540; y = 900; }
        if (ao.t != null && !num(ao.t)) { err(`${w}: t is ${ao.t} — a time from at("key") / atW("key","word") that did not resolve; fix the caption key or word`); ao = { ...ao, t: undefined }; }
        if (ao.anim != null && !ANIMS.includes(ao.anim)) { err(`${w}: anim "${ao.anim}" does not exist. ${dym(ao.anim, ANIMS)}Valid: ${ANIMS.join(" ")}`); ao = { ...ao, anim: "pop" }; }
        if (ao.s != null && !(num(ao.s) && ao.s > 0)) { err(`${w}: s (scale) must be a positive number, got ${ao.s}`); ao = { ...ao, s: 1 }; }
        if (x < -300 || x > 1380 || y < -300 || y > 2220) warn(`${w}: item at (${Math.round(x)}, ${Math.round(y)}) is far outside the 1080x1920 frame`);
        return add(svg, x, y, ao);
      };
      const char = L.char;
      L.char = (co = {}) => {
        const h = char(co), hid = `hero in scene "${id}"`;
        if (co.y != null && (co.y < 1200 || co.y > 1340)) warn(`${hid}: feet at y ${co.y} — the host stands on y 1300 (subtitles start at y 1330)`);
        const face = h.face, pose = h.pose, say = h.say, hop = h.hop;
        h.face = (t, name) => { if (!num(t)) { err(`${hid}: face time is ${t} (an at()/atW() that did not resolve)`); return h; } if (!check("face", name, FACES, `${hid}: face`)) name = "neutral"; return face(t, name); };
        h.pose = (name, t, d, ease) => {
          if (!num(t)) { err(`${hid}: pose time is ${t} (an at()/atW() that did not resolve)`); return h; }
          if (typeof name === "string" && !check("pose", name, POSES, `${hid}: pose`)) name = "idle";
          return pose(name, t, d, ease);
        };
        h.say = (key, op) => { if (!M.CAP.some((c) => c.key === key)) { err(`${hid}: say("${key}") — no caption line with that key. ${dym(key, M.CAP.map((c) => c.key))}Keys: ${M.CAP.map((c) => c.key).join(" ")}`); return h; } if (op && op.pose != null && op.pose !== false && typeof op.pose === "string") check("pose", op.pose, POSES, `${hid}: say pose`); return say(key, op); };
        h.hop = (t, hh) => num(t) ? hop(t, hh) : (err(`${hid}: hop time is ${t}`), h);
        h.has = true; L.hero = h; return h;
      };
      return L;
    };

    const pill = K.pill;
    K.pill = (L, text, x, y, o = {}) => {
      const w = `K.pill "${String(text).slice(0, 18)}"`;
      if (typeof text !== "string" || !text.trim()) { err(`${w}: text must be a non-empty string`); text = "?"; }
      if (!num(x) || !num(y)) { err(`${w}: x and y must be numbers`); x = 540; y = 400; }
      if (o.t != null && !num(o.t)) { err(`${w}: t is ${o.t} — at()/atW() did not resolve`); o = { ...o, t: undefined }; }
      const size = o.size ?? 54, h = Math.round(size * 1.55), width = o.w ?? Math.round([...text].filter((c) => !/[ัิ-ฺ็-๎]/.test(c)).length * size * 0.56 + size * 1.3);
      if (y - h / 2 * (o.s ?? 1) < 262) warn(`${w}: pill top at y ${Math.round(y - h / 2)} is above the safe line (y 250) — put the centre at y >= ${Math.round(262 + h / 2)}`);
      if (width * (o.s ?? 1) > 940) warn(`${w}: about ${Math.round(width)} px wide — it will not fit the 940 px safe width; shorten the text or lower size`);
      if (x + (width * (o.s ?? 1)) / 2 > 960 && y > 900) warn(`${w}: reaches x ${Math.round(x + width / 2)} below y 900 (the app buttons live right of x 960)`);
      return pill(L, text, x, y, o);
    };

    const closeup = K.closeup;
    K.closeup = (L, o = {}) => { if (o.prop != null && !check("prop", o.prop, Object.keys(K.PROPS), "K.closeup")) o = { ...o, prop: "qmark" }; return closeup(L, o); };
    const matrix = K.matrix;
    K.matrix = (L, o = {}) => { if ((o.cards || []).length > 4) warn(`K.matrix: ${o.cards.length} cards — only the first 4 are drawn (2x2)`); (o.cards || []).forEach((c, i) => { if (c.t != null && !num(c.t)) err(`K.matrix card ${i + 1} ("${c.title}"): t is ${c.t} — atW() did not resolve`); }); return matrix(L, o); };
    const choice = K.choice;
    K.choice = (L, o = {}) => { const n = (o.cards || []).length; if (n < 1 || n > 4) err(`K.choice: needs 1-4 cards (got ${n})`); return choice(L, o); };

    // after the whole script ran: structural checks
    window.CutoutValidate.final = (K2, M2, v) => {
      const secs = [...document.querySelectorAll("section[data-shot]")].map((s) => s.dataset.shot);
      secs.forEach((s) => { if (!scenesSeen.includes(s)) warn(`section "${s}" has no K.scene("${s}", …) — that shot would be an empty screen`); });
      const shots = [...new Set(M2.CAP.map((c) => c.shot))];
      shots.forEach((s) => { if (!secs.includes(s)) v.errors.push(`captions.js shot "${s}" has no <section id="sc-${s}" data-shot="${s}"> in index.html`); });
      if (M2.CAP.length && !M2.levelAt) warn("no voice yet (timing.js has no envelope) — the mouth uses a seeded flap; run `cutout voice` for lip movement that follows the real voice");
    };
    return K;
  };
})();
// genhaha:5f8f980bb7f3
