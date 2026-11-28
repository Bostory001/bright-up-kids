// vp-validate.js — visual-proof data checks, IN THE PAGE (errors become the red card in preview/snapshot) and in node (scripts/lib/vp.mjs).
//   VPV.catalog()                       every valid name, read from the loaded kit (vp-lib.js PALETTES/INKS, vp-art.js PARTS)
//   VPV.validate(SCENE, caps, shotIds)  → [{ level: "error"|"warn", path, msg, fix }]   unknown names come with "did you mean"
// Form: window.VP_SCENE = { palette, ink: { <quantity>: <ink> }, camera, enter, transition, ground, caption, shots: { <shotId>: { type, … } } }
(function (W) {
  "use strict";
  const VP = W.VP, VPA = W.VPA;
  const TYPES = ["build", "rearrange", "compare", "equation", "array", "numberline", "steps", "qed"];
  const CAMERAS = ["still", "push", "pull", "drift", "focus", "tilt"];
  const ENTERS = ["trace", "grow", "drop", "fade"];
  const TRANSITIONS = ["fade", "slide", "wipe", "cut"];
  const GROUNDS = ["plain", "grid", "dots"];
  const SFX = ["pop", "tick", "ding", "chime", "sparkle", "swish", "whoosh", "pen_scratch", "plop", "stamp", "bit_tick", "bit_coin", "bit_blip", "wind_chime", "glass_crack", "thud"];
  const TOP_KEYS = ["palette", "ink", "camera", "enter", "transition", "ground", "caption", "shots", "title", "note"];
  const COMMON = ["type", "title", "camera", "enter", "figure", "view", "eq", "eq2", "focus", "carry", "look", "note"];
  const TYPE_KEYS = { build: [], rearrange: ["move"], compare: ["left", "right", "sign", "signAt"], equation: [], array: ["array"], numberline: ["line", "marks", "jumps", "bars"], steps: ["steps"], qed: ["markAt", "noteAt"] };
  const ITEM_COMMON = ["part", "id", "q", "at", "until", "dur", "enter", "to", "sfx", "w", "fill", "size"];
  const TOKEN_KEYS = ["t", "sup", "sub", "frac", "q", "at", "from", "id", "it", "sfx"];
  const FOCUS_KEYS = ["at", "until", "ids", "q"];
  const TO_KEYS = ["dx", "dy", "rot", "at", "dur", "pivot"];
  const SIDE_KEYS = ["figure", "view", "label", "labelAt", "q"];
  const ARRAY_KEYS = ["n", "as", "gap", "q", "at", "labels", "sfx"];
  const LINE_KEYS = ["from", "to", "step", "labels", "q", "at"];
  const MARK_KEYS = ["v", "label", "q", "at", "id", "sfx"];
  const JUMP_KEYS = ["from", "to", "label", "q", "at", "h", "id", "sfx"];
  const BAR_KEYS = ["parts", "from", "w", "total", "q", "at", "id", "sfx"];
  const STEP_KEYS = ["eq", "text", "at", "q", "sfx"];
  const POINT_KEYS = ["a", "b", "pivot"], PTS_KEYS = ["pts"];
  const LIMITS = { title: 28, note: 40, caption: 68, step: 34, side: 24, items: 40, steps: [2, 5], arrayN: [1, 8], eqTokens: 15 };
  const EMOJI = /[\u{1F000}-\u{1FAFF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{2B00}-\u{2BFF}\u{FE0F}]/u;

  function catalog() {
    const P = VPA.PARTS, byGroup = {};
    for (const [n, p] of Object.entries(P)) (byGroup[p.g] ||= []).push(n);
    return { types: TYPES, parts: Object.keys(P), partsByGroup: byGroup, partKeys: Object.fromEntries(Object.entries(P).map(([n, p]) => [n, { req: p.req, opt: p.opt }])),
      palettes: Object.keys(VP.PALETTES), inks: VP.INKS, neutrals: VP.NEUTRALS, cameras: CAMERAS, enters: ENTERS, transitions: TRANSITIONS, grounds: GROUNDS, sfx: SFX,
      ops: Object.keys(VP.OPS), fns: Object.keys(VPA.FN), topKeys: TOP_KEYS, shotKeys: COMMON, typeKeys: TYPE_KEYS, itemKeys: ITEM_COMMON, tokenKeys: TOKEN_KEYS, limits: LIMITS };
  }
  const near = (v, list) => {
    let best = null, bd = 1e9; const a = String(v);
    for (const b of list) { const dp = Array.from({ length: a.length + 1 }, (_, i) => [i, ...Array(b.length).fill(0)]); for (let j = 1; j <= b.length; j++) dp[0][j] = j; for (let i = 1; i <= a.length; i++) for (let j = 1; j <= b.length; j++) dp[i][j] = Math.min(dp[i - 1][j] + 1, dp[i][j - 1] + 1, dp[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1)); if (dp[a.length][b.length] < bd) { bd = dp[a.length][b.length]; best = b; } }
    return bd <= Math.max(2, a.length / 2) ? best : null;
  };
  const len = (s) => [...String(s == null ? "" : s).replace(/[\[\]|]/g, "")].length;
  const isNum = (v) => typeof v === "number" && isFinite(v);
  const isPt = (v) => Array.isArray(v) && v.length === 2 && isNum(v[0]) && isNum(v[1]);

  function validate(S, caps = [], shotIds = []) {
    const out = [], C = catalog();
    const err = (path, msg, fix) => out.push({ level: "error", path, msg, fix });
    const warn = (path, msg, fix) => out.push({ level: "warn", path, msg, fix });
    const name = (path, v, list, what) => { if (v == null) return true; if (!list.includes(v)) { const d = near(v, list); err(path, `unknown ${what} "${v}"`, d ? `did you mean "${d}"?` : `use one of: ${list.join(", ")}`); return false; } return true; };
    const keys = (path, obj, allowed) => { if (!obj || typeof obj !== "object") return; for (const k of Object.keys(obj)) if (!allowed.includes(k)) { const d = near(k, allowed); warn(path + "." + k, `unknown key "${k}" (ignored)`, d ? `did you mean "${d}"?` : `allowed: ${allowed.join(", ")}`); } };
    const text = (path, v, max) => { if (v == null) return; if (typeof v === "object" && !Array.isArray(v)) return; if (typeof v !== "string" && typeof v !== "number") return err(path, "must be a string", `"text, ${max} characters or less"`); if (EMOJI.test(String(v))) err(path, "emoji are not allowed (the style draws everything as flat shapes)", "remove the emoji"); if (len(v) > max) err(path, `${len(v)} characters, max ${max}`, "shorten it ('|' forces a line break)"); };
    if (!S || typeof S !== "object") { err("VP_SCENE", "missing", "scene.js must be ONE assignment: window.VP_SCENE = { … }"); return out; }
    keys("VP_SCENE", S, TOP_KEYS);
    name("palette", S.palette, C.palettes, "palette"); name("camera", S.camera, CAMERAS, "camera"); name("enter", S.enter, ENTERS, "enter motion");
    name("transition", S.transition, TRANSITIONS, "transition"); name("ground", S.ground, GROUNDS, "ground");
    if (S.caption) { keys("caption", S.caption, ["show", "accent"]); name("caption.accent", S.caption.accent, C.inks.concat(C.neutrals), "ink"); }
    const ink = S.ink || {};
    for (const [q, v] of Object.entries(ink)) name(`ink.${q}`, v, C.inks.concat(C.neutrals), "ink");
    const qNames = Object.keys(ink).concat(C.inks, C.neutrals);
    const q = (path, v) => { if (v == null) return; name(path, v, qNames, "quantity/ink (declare it in ink: { … } or use an ink name)"); };
    const sfx = (path, v) => { if (v == null) return; name(path, v, SFX, "sfx"); };
    const capKeys = caps.map((c) => c.key);
    const atChk = (path, v, shotId) => {
      if (v == null) return;
      if (isNum(v)) { if (v < 0) err(path, "seconds into the shot must be ≥ 0", "use 0.5, or a caption key like \"a1+0.5\""); return; }
      const m = String(v).match(VP.AT_RE); if (!m) return err(path, `bad time "${v}"`, 'use "key", "key+0.4", "key-0.2", "key@0.5" (half-way through that line) or seconds into the shot');
      if (!caps.length) return;
      if (!capKeys.includes(m[1])) { const d = near(m[1], capKeys); return err(path, `no caption line with key "${m[1]}"`, d ? `did you mean "${d}"?` : `keys: ${capKeys.join(", ")}`); }
      const c = caps.find((x) => x.key === m[1]); if (shotId && c.shot !== shotId) warn(path, `key "${m[1]}" belongs to shot ${c.shot}, not ${shotId}`, "times are normally keyed to a line of the same shot");
    };
    const tokRow = (path, row, ids, shotId) => {
      if (row == null) return;
      if (!Array.isArray(row)) return err(path, "must be an array of tokens", '["a", "+", "b", "=", { t: "c", sup: 2, q: "c" }]');
      if (row.length > LIMITS.eqTokens) err(path, `${row.length} tokens, max ${LIMITS.eqTokens} (a phone screen fits ~12)`, "split into eq + eq2 or shorten");
      let lastAt = null;
      row.forEach((tk, i) => {
        const p = `${path}[${i}]`;
        if (typeof tk === "number") return;
        if (typeof tk === "string") { if (EMOJI.test(tk)) err(p, "emoji are not allowed", "remove it"); if (len(tk) > 8) warn(p, `"${tk}" is long for one token`, "split it into tokens"); return; }
        if (!tk || typeof tk !== "object") return err(p, "token must be a string, a number or { t, sup, sub, frac, q, at, from }");
        keys(p, tk, TOKEN_KEYS); q(p + ".q", tk.q); sfx(p + ".sfx", tk.sfx); atChk(p + ".at", tk.at, shotId);
        if (tk.t == null && !tk.frac) err(p, "token needs t (or frac)", '{ t: "a", sup: 2, q: "a" }');
        if (tk.frac && !(Array.isArray(tk.frac) && tk.frac.length === 2)) err(p + ".frac", "frac must be [numerator, denominator]", 'frac: ["1", "2"]');
        if (tk.from != null && !ids.includes(tk.from)) { const d = near(tk.from, ids); err(p + ".from", `no figure item with id "${tk.from}"`, d ? `did you mean "${d}"?` : ids.length ? `ids: ${ids.join(", ")}` : "give the shape an id, or drop from"); }
        if (tk.at != null && caps.length) { const t = VP.resolveAt(tk.at, caps, 0); if (t != null && lastAt != null && t < lastAt - 0.01) warn(p + ".at", "this term is timed before an earlier term — the kit shows terms strictly left to right, so it will wait", "time the terms in reading order (the result last)"); if (t != null) lastAt = t; }
      });
    };
    const item = (path, it, ids, shotId) => {
      if (!it || typeof it !== "object") return err(path, "item must be an object { part, … }");
      if (!name(path + ".part", it.part, C.parts, "part")) return;
      const P = VPA.PARTS[it.part]; keys(path, it, ITEM_COMMON.concat(P.req, P.opt));
      for (const k of P.req) if (it[k] == null) err(`${path}.${k}`, `${it.part} needs ${k}`, `required: ${P.req.join(", ")}`);
      for (const k of P.req.concat(P.opt)) { const v = it[k]; if (v == null) continue;
        if (POINT_KEYS.includes(k) && !["rtri", "graph"].includes(it.part) && !isPt(v)) err(`${path}.${k}`, "must be a point [x, y] in figure units", "[2, 3]");
        else if (PTS_KEYS.includes(k) && !(Array.isArray(v) && v.length >= 2 && v.every(isPt))) err(`${path}.${k}`, "must be a list of points [[x, y], …]", "[[0,0],[3,0],[0,4]]");
        else if (["x", "y", "w", "h", "s", "r", "a", "b", "n", "rot", "from", "to", "step", "cols", "rows", "gap", "off"].includes(k) && !["a", "b"].includes(k) && typeof v !== "number" && !(it.part === "graph" && ["a", "b"].includes(k))) err(`${path}.${k}`, "must be a number", "e.g. 3");
      }
      if (it.part === "rtri") { for (const k of ["a", "b"]) if (!isNum(it[k]) || it[k] <= 0) err(`${path}.${k}`, "rtri legs must be positive numbers", "a: 3, b: 4"); ["qa", "qb", "qc"].forEach((k) => q(`${path}.${k}`, it[k])); ["la", "lb", "lc"].forEach((k) => text(`${path}.${k}`, it[k], 12)); }
      if (it.part === "graph") name(path + ".fn", it.fn, C.fns, "graph function");
      if (it.part === "mark") name(path + ".kind", it.kind, ["check", "cross", "qed"], "mark kind");
      if (it.part === "tri" && !(Array.isArray(it.pts) && it.pts.length === 3)) err(path + ".pts", "tri needs exactly 3 points", "use poly for more");
      if (it.part === "gnomon" && it.as != null) name(path + ".as", it.as, ["dots", "cells"], "gnomon look");
      if (it.part === "bar") (it.parts || []).forEach((p, i) => { keys(`${path}.parts[${i}]`, p, ["v", "q", "label"]); q(`${path}.parts[${i}].q`, p.q); if (!isNum(p.v)) err(`${path}.parts[${i}].v`, "bar part needs a number v", "v: 3"); });
      if (it.part === "label") text(path + ".text", it.text, 24);
      if (it.id != null) { if (ids.includes(it.id)) err(path + ".id", `id "${it.id}" used twice in this shot`, "ids must be unique per shot"); ids.push(it.id); }
      q(path + ".q", it.q); sfx(path + ".sfx", it.sfx); name(path + ".enter", it.enter, ENTERS, "enter motion"); atChk(path + ".at", it.at, shotId); atChk(path + ".until", it.until, shotId);
      if (it.to) { keys(path + ".to", it.to, TO_KEYS); atChk(path + ".to.at", it.to.at, shotId); if (it.to.pivot != null && !isPt(it.to.pivot)) err(path + ".to.pivot", "must be a point [x, y]"); }
      for (const k of ["label", "name"]) if (it[k] != null) text(`${path}.${k}`, it[k], 14);
    };

    const shots = S.shots;
    if (!shots || typeof shots !== "object" || Array.isArray(shots)) { err("shots", "missing or not an object", "shots: { s1: { type: \"build\", … }, s2: { … } } — one entry per shot id in captions.js"); return out; }
    const want = shotIds.length ? shotIds : Object.keys(shots);
    for (const id of want) if (!shots[id]) { const d = near(id, Object.keys(shots)); err(`shots.${id}`, `captions.js has shot "${id}" but scene.js does not`, d ? `did you mean "${d}"?` : "add it"); }
    for (const id of Object.keys(shots)) if (shotIds.length && !shotIds.includes(id)) warn(`shots.${id}`, "no caption line uses this shot (it will not be shown)", `caption shots: ${shotIds.join(", ")}`);

    for (const id of Object.keys(shots)) {
      const sh = shots[id], p = `shots.${id}`;
      if (!sh || typeof sh !== "object") { err(p, "must be an object { type, … }"); continue; }
      if (!name(p + ".type", sh.type, TYPES, "shot type")) continue;
      keys(p, sh, COMMON.concat(TYPE_KEYS[sh.type]));
      name(p + ".camera", sh.camera, CAMERAS, "camera"); name(p + ".enter", sh.enter, ENTERS, "enter motion"); text(p + ".title", sh.title, LIMITS.title);
      if (sh.view != null && !(Array.isArray(sh.view) && sh.view.length === 4 && sh.view.every(isNum) && sh.view[2] > 0 && sh.view[3] > 0)) err(p + ".view", "view must be [x, y, width, height] in figure units", "[-1, -1, 9, 9]");
      if (sh.look != null && !isPt(sh.look)) err(p + ".look", "look must be a point [x, y]");
      const ids = [];
      const fig = sh.figure || [];
      if (!Array.isArray(fig)) err(p + ".figure", "must be an array of items");
      else { if (fig.length > LIMITS.items) warn(p + ".figure", `${fig.length} items — one idea per shot`, "split the shot"); fig.forEach((it, i) => item(`${p}.figure[${i}]`, it, ids, id)); }
      if (sh.type === "compare") for (const side of ["left", "right"]) { const sd = sh[side]; if (!sd || !Array.isArray(sd.figure) || !sd.figure.length) { err(`${p}.${side}`, "compare needs left and right, each with a figure", `${side}: { figure: [ … ], label: "…" }`); continue; } keys(`${p}.${side}`, sd, SIDE_KEYS); text(`${p}.${side}.label`, sd.label, LIMITS.side); atChk(`${p}.${side}.labelAt`, sd.labelAt, id); q(`${p}.${side}.q`, sd.q); sd.figure.forEach((it, i) => item(`${p}.${side}.figure[${i}]`, it, ids, id)); }
      if (sh.type === "compare" && sh.sign != null) { if (!["=", "<", ">", "≠", "≈"].includes(sh.sign)) err(p + ".sign", `unknown sign "${sh.sign}"`, 'use "=", "<", ">", "≠" or "≈"'); atChk(p + ".signAt", sh.signAt, id); }
      if (sh.type === "array") { const A = sh.array; if (!A) err(p + ".array", "array shot needs array: { n, as }", 'array: { n: 4, as: "dots" }'); else { keys(p + ".array", A, ARRAY_KEYS); if (!isNum(A.n) || A.n < LIMITS.arrayN[0] || A.n > LIMITS.arrayN[1]) err(p + ".array.n", `n must be ${LIMITS.arrayN[0]}–${LIMITS.arrayN[1]}`); name(p + ".array.as", A.as, ["dots", "cells"], "array look"); (A.q || []).forEach((v, i) => q(`${p}.array.q[${i}]`, v)); (A.at || []).forEach((v, i) => atChk(`${p}.array.at[${i}]`, v, id)); (A.sfx || []).forEach((v, i) => sfx(`${p}.array.sfx[${i}]`, v)); for (let g = 1; g <= (A.n || 0); g++) ids.push(`ring${g}`); } }
      if (sh.type === "numberline") { const L = sh.line; if (!L) err(p + ".line", "numberline shot needs line: { from, to, step }", "line: { from: 0, to: 10, step: 1 }"); else { keys(p + ".line", L, LINE_KEYS); if (!isNum(L.from) || !isNum(L.to) || L.to <= L.from) err(p + ".line", "line needs numbers from < to"); else if ((L.to - L.from) / (L.step || 1) > 20) warn(p + ".line.step", `${Math.round((L.to - L.from) / (L.step || 1))} ticks — too dense for a phone`, "raise step (≤ 20 ticks)"); atChk(p + ".line.at", L.at, id); ids.push("line"); }
        (sh.marks || []).forEach((m, i) => { keys(`${p}.marks[${i}]`, m, MARK_KEYS); if (!isNum(m.v)) err(`${p}.marks[${i}].v`, "mark needs a number v"); q(`${p}.marks[${i}].q`, m.q); atChk(`${p}.marks[${i}].at`, m.at, id); sfx(`${p}.marks[${i}].sfx`, m.sfx); text(`${p}.marks[${i}].label`, m.label, 10); ids.push(m.id || `mark${i + 1}`); });
        (sh.jumps || []).forEach((j, i) => { keys(`${p}.jumps[${i}]`, j, JUMP_KEYS); if (!isNum(j.from) || !isNum(j.to)) err(`${p}.jumps[${i}]`, "jump needs numbers from and to"); q(`${p}.jumps[${i}].q`, j.q); atChk(`${p}.jumps[${i}].at`, j.at, id); sfx(`${p}.jumps[${i}].sfx`, j.sfx); text(`${p}.jumps[${i}].label`, j.label, 10); ids.push(j.id || `jump${i + 1}`); });
        (sh.bars || []).forEach((b, i) => { keys(`${p}.bars[${i}]`, b, BAR_KEYS); if (!Array.isArray(b.parts) || !b.parts.length) err(`${p}.bars[${i}].parts`, "bar needs parts [{ v, q, label }]"); else b.parts.forEach((x, k) => { if (!isNum(x.v)) err(`${p}.bars[${i}].parts[${k}].v`, "needs a number v"); q(`${p}.bars[${i}].parts[${k}].q`, x.q); }); atChk(`${p}.bars[${i}].at`, b.at, id); ids.push(b.id || `bar${i + 1}`); });
        if ((sh.bars || []).length > 2) warn(p + ".bars", "more than 2 bars run into the equation row", "keep ≤ 2 bars or drop the eq");
      }
      if (sh.type === "steps") { const st = sh.steps; if (!Array.isArray(st) || st.length < LIMITS.steps[0] || st.length > LIMITS.steps[1]) err(p + ".steps", `steps needs ${LIMITS.steps[0]}–${LIMITS.steps[1]} rows`, 'steps: [{ eq: ["1", "=", { t: "1", sup: 2 }], at: "p1" }, …]'); else st.forEach((r, i) => { keys(`${p}.steps[${i}]`, r, STEP_KEYS); if (!r.eq && !r.text) err(`${p}.steps[${i}]`, "row needs eq or text"); tokRow(`${p}.steps[${i}].eq`, r.eq, ids, id); text(`${p}.steps[${i}].text`, r.text, LIMITS.step); atChk(`${p}.steps[${i}].at`, r.at, id); q(`${p}.steps[${i}].q`, r.q); sfx(`${p}.steps[${i}].sfx`, r.sfx); }); if (sh.eq2) warn(p + ".eq2", "steps shows at most one equation row under the list", "drop eq2"); }
      if (sh.type === "rearrange" && !(fig || []).some((it) => it && it.to)) err(p + ".figure", "rearrange needs at least one item with to: { dx, dy, rot }", "to: { dx: 4, dy: 0, rot: 90 }");
      if ((sh.type === "equation" || sh.type === "qed") && !(Array.isArray(sh.eq) && sh.eq.length)) err(p + ".eq", `${sh.type} needs eq`, '["a", "+", "b"]');
      if (sh.type === "qed") { text(p + ".note", sh.note, LIMITS.note); atChk(p + ".markAt", sh.markAt, id); atChk(p + ".noteAt", sh.noteAt, id); }
      else if (sh.note != null) warn(p + ".note", "note is shown only on qed shots");
      atChk(p + ".move", sh.move, id);
      tokRow(p + ".eq", sh.eq, ids, id); tokRow(p + ".eq2", sh.eq2, ids, id);
      if (sh.eq2 && !sh.eq) err(p + ".eq2", "eq2 without eq", "use eq first");
      (sh.focus || []).forEach((f, i) => { keys(`${p}.focus[${i}]`, f, FOCUS_KEYS); atChk(`${p}.focus[${i}].at`, f.at, id); atChk(`${p}.focus[${i}].until`, f.until, id); if (!f.ids && !f.q) err(`${p}.focus[${i}]`, "focus needs ids or q", 'focus: [{ at: "a2", q: "a" }]'); [].concat(f.q || []).forEach((v) => q(`${p}.focus[${i}].q`, v)); (f.ids || []).forEach((v) => { const tokIds = [].concat(sh.eq || [], sh.eq2 || []).map((t) => t && t.id).filter(Boolean); if (!ids.includes(v) && !tokIds.includes(v)) { const d = near(v, ids.concat(tokIds)); err(`${p}.focus[${i}].ids`, `no item or token with id "${v}"`, d ? `did you mean "${d}"?` : "add an id to the shape/token"); } }); });
      if (sh.type === "steps" && fig.length) warn(p + ".figure", "steps shots do not draw a figure", "use build for a figure");
    }
    // hook: the first shot must show a figure moving inside its first 1.5 s
    { const id0 = (shotIds.length ? shotIds : Object.keys(shots))[0], sh0 = shots[id0];
      if (sh0 && Array.isArray(sh0.figure) && sh0.figure.length && caps.length) { const t0 = Math.min(...sh0.figure.map((it) => (it && it.at != null ? VP.resolveAt(it.at, caps, 0) : 0)).filter((v) => v != null)); if (t0 > 0.6) warn(`shots.${id0}.figure`, `first shape starts at ${t0.toFixed(1)} s — the opening must show a large figure moving in the first 1.5 s`, "drop at on the first items (shot 1 builds them inside 1.5 s by default)"); }
      else if (sh0 && !["steps", "equation", "qed"].includes(sh0.type) && !(sh0.array || sh0.line)) warn(`shots.${id0}`, "the opening shot has no figure", "start with a build shot"); }
    // captions: length, emoji, pacing (≥ 2.5 s per shot)
    caps.forEach((c, i) => { const p = `captions[${c.key || i}]`; text(p, c.cap || c.text, LIMITS.caption); });
    if (caps.length) { const ids = [...new Set(caps.map((c) => c.shot))]; ids.forEach((id, i) => { const cs = caps.filter((c) => c.shot === id), a = cs[0].start, b = i + 1 < ids.length ? caps.find((c) => c.shot === ids[i + 1]).start : cs[cs.length - 1].end; if (b - a < 2.5) warn(`shots.${id}`, `${(b - a).toFixed(1)} s on screen (< 2.5 s)`, "give it another line or merge it with the next shot"); }); }
    return out;
  }

  W.VPV = { catalog, validate, near };
})(typeof window !== "undefined" ? window : globalThis);
// genhaha:ed4a029a9d2b
