// vc-kit.js - variety-captions player: reads the SCENE data and paints ONE 1080x1920 canvas as a PURE FUNCTION of time.
//   VC.boot(tl, SCENE, jsError)   validate (vc-validate.js) -> red error card, or expand + build. Used by index.html (local) and page.html (MCP).
// Layers, back to front: background (palette + pattern) and stickers / effects in WORLD space (the camera moves them) -> captions in SCREEN space
// (never shaken by the camera) -> white hit flash -> plain subtitle line. Every caption and sticker appears on its `at` time spec
// ("@key:word" = the moment that word is spoken, from window.CAPTIONS + window.TTS_TIMING).
(function (K) {
  const { W, H, TAU, clamp, lerp, eo, ei, eio, back, bounceOut, hash, FONT, PALETTES, clusters, numFmt, capBox } = K;
  const BEAT = 0.5357;   // 112 BPM, used by idle pulses

  // ---- time lookups (captions.js + timing.js): the same contract in the local skill and on the platform ----
  function lookups() {
    const CAP = window.CAPTIONS || [], TT = window.TTS_TIMING || {};
    const find = (key) => { const i = CAP.findIndex((c) => c.key === key); if (i < 0) throw new Error(`no line with key "${key}"`); return i; };
    const at = (key) => CAP[find(key)].start, end = (key) => CAP[find(key)].end;
    const atW = (key, word) => { const i = find(key), c = CAP[i], plain = String(c.text || "").replace(/[\[\]]/g, ""), idx = plain.indexOf(word); if (idx < 0) return c.start; const cps = [...plain.slice(0, idx)].length, ch = (TT.chars || [])[i]; return ch && ch.length === [...plain].length ? ch[cps] : c.start + (cps / [...plain].length) * Math.max(0.3, c.end - c.start - 0.25); };
    return { at, end, atW, CAP, TT };
  }

  function build(tl, S) {
    const stage = document.getElementById("stage");
    const mk = (w = W, h = H) => { const c = document.createElement("canvas"); c.width = w; c.height = h; return c; };
    const cv = mk(); cv.id = "vc-canvas"; stage.appendChild(cv);
    const out = cv.getContext("2d");
    const vars = (() => { try { return window.__hyperframes?.getVariables?.() || {}; } catch { return {}; } })();
    const M = lookups(), PAL = K.palette(S.palette), COL = PAL.col, SEED = S.seed ?? 7;
    const WARN = [];

    // ---- shot spans from <section data-shot> (the platform / the voice step retime them) ----
    const secs = {};
    document.querySelectorAll("section[data-shot]").forEach((s) => { const t0 = parseFloat(s.dataset.start); secs[s.dataset.shot] = [t0, t0 + parseFloat(s.dataset.duration)]; });
    let T0 = 0;
    const SH = S.shots.map((sh, i) => { const r = secs[sh.id], o = { ...sh, i, t0: r ? r[0] : T0, t1: r ? r[1] : T0 + (sh.dur ?? 4) }; T0 = o.t1; return o; });
    SH.forEach((sh, i) => { if (SH[i + 1]) sh.t1 = SH[i + 1].t0; sh.dur = sh.t1 - sh.t0; });
    const TOTAL = parseFloat(document.getElementById("root").dataset.duration) || T0;
    if (SH.length) { const last = SH[SH.length - 1]; last.t1 = Math.max(last.t1, TOTAL); last.dur = last.t1 - last.t0; }

    const TS = (sh, v, def = 0) => {
      if (v == null) return def;
      if (typeof v === "number") return v;
      let s = String(v).trim(), off = 0;
      const m = s.match(/([+-]\d*\.?\d+)$/); if (m && s.length > m[1].length) { off = parseFloat(m[1]); s = s.slice(0, -m[1].length); }
      if (s === "end") return sh.dur + off;
      if (s === "start") return off;
      if (/^\d+(\.\d+)?%$/.test(s)) return (parseFloat(s) / 100) * sh.dur + off;
      if (s[0] === "@") { s = s.slice(1); try { if (s.endsWith(".end")) return M.end(s.slice(0, -4)) - sh.t0 + off; const [key, word] = s.split(":"); return (word ? M.atW(key, word) : M.at(key)) - sh.t0 + off; } catch (e) { WARN.push(`shot ${sh.id}: ${e.message}`); console.warn(`[variety-captions] shot ${sh.id}: ${e.message}`); return def; } }
      const n = parseFloat(s); return isNaN(n) ? def : n + off;
    };

    // ---- text measuring + layout (memoised; cleared when the fonts arrive) ----
    const mctx = mk(8, 8).getContext("2d"); const LAY = new Map();
    const fontOf = (it) => (it.font === "hand" || it.kind === "aside" ? FONT.hand : FONT.heavy), weightOf = (f) => (f === FONT.hand ? 700 : 800);
    const meas = (str, size, font) => { mctx.font = `${weightOf(font)} ${size}px ${font}`; return mctx.measureText(str).width; };
    function lay(it) {
      const key = it.id; let L = LAY.get(key); if (L) return L;
      const font = fontOf(it), box = capBox(it, (s, z) => meas(s, z, font));
      const lines = box.lines.map((str, i) => { const size = box.sizes[i], cl = clusters(str), ws = cl.map((ch) => meas(ch, size, font)); return { str, cl, ws, tw: ws.reduce((a, b) => a + b, 0), size }; });
      L = { ...box, font, lines, lh: box.size * 1.12 }; LAY.set(key, L); return L;
    }

    // ---- compile items ----
    let uid = 0;
    SH.forEach((sh) => {
      sh.arts = []; sh.caps = []; sh.fxs = []; sh.hits = [];
      (sh.items || []).forEach((it, idx) => {
        const o = { ...it, id: ++uid, sh };
        const ats = Array.isArray(it.at) ? it.at.map((a) => sh.t0 + TS(sh, a, 0)) : null;
        o.t0 = ats ? Math.min(...ats) : sh.t0 + TS(sh, it.at, 0.05 + 0.04 * Math.min(idx, 4));
        o.ats = ats; o.t1 = it.until != null ? sh.t0 + TS(sh, it.until, sh.dur) : 1e9;
        o.rotR = ((it.rot || 0) * Math.PI) / 180;
        if (it.cap != null || it.kind) {
          o.kind = it.kind || "burst"; o.col = COL[it.color] || COL.yellow; o.tilt = it.rot ?? (o.kind === "stamp" ? -6 : o.kind === "tilt" ? -8 : o.kind === "aside" ? -3 : 0);
          o.x = it.x ?? 540; o.y = it.y ?? 600; o.seed = SEED * 13 + uid;
          const B = { yellow: "pink", pink: "yellow", blue: "white", lime: "yellow", red: "yellow", orange: "white", purple: "yellow", white: "red" };
          o.burstCol = COL[it.burst] || COL[B[it.color || "yellow"]];
          o.colors = (it.colors || []).map((n) => COL[n] || COL.yellow);
          sh.caps.push(o);
          if (["burst", "shake", "stamp", "tilt", "counter"].includes(o.kind)) { sh.hits.push(o.t0); }
          o.flash = it.flash !== false && S.flash !== false && ["burst", "shake", "stamp"].includes(o.kind);
        } else if (it.art) { o.col = COL[it.color] || COL[K.ART[it.art]?.col] || COL.yellow; sh.arts.push(o); if (it.anim === "drop") sh.hits.push(o.t0 + 0.28); }
        else if (it.fx) { sh.fxs.push(o); }
      });
      sh.hits.sort((a, b) => a - b);
    });
    const FLASH = SH.flatMap((sh) => sh.caps.filter((c) => c.flash).map((c) => c.t0 - 0.0));

    // ---- camera presets: (T, shot) -> { z, x, y, r } (world space only; captions stay put) ----
    function pulse(T, hits) { let P = 0; for (const h of hits) { const dt = T - h; if (dt < 0) continue; P = Math.max(P, dt < 0.133 ? eo(dt / 0.133) : Math.exp(-(dt - 0.133) * 4.5)); } return P; }
    const camAt = (sh, T) => {
      const name = sh.cam || S.cam || "punch", lt = T - sh.t0, k = clamp(lt / Math.max(0.5, sh.dur));
      const hand = { x: 7 * Math.sin(T * 1.3) + 3 * Math.sin(T * 3.1), y: 6 * Math.sin(T * 1.7 + 1), r: 0.004 * Math.sin(T * 1.1) };
      switch (name) {
        case "still": return { z: 1, x: 0, y: 0, r: 0 };
        case "drift": return { z: 1.035, ...hand };
        case "push": return { z: lerp(1.0, 1.13, eio(k)), x: hand.x * 0.4, y: hand.y * 0.4, r: 0 };
        case "pull": return { z: lerp(1.15, 1.0, eio(k)), x: hand.x * 0.4, y: hand.y * 0.4, r: 0 };
        case "whip": { const w = Math.exp(-lt * 9) * (lt < 0.5 ? 1 : 0); return { z: 1.05 + 0.04 * w, x: 420 * w + hand.x * 0.5, y: hand.y * 0.5, r: 0.03 * w }; }
        case "rock": return { z: 1.07, x: 0, y: hand.y, r: 0.032 * Math.sin(T * 2.1) };
        default: return { z: 1.03 + 0.1 * pulse(T, sh.hits), ...hand };
      }
    };

    // ---- backgrounds (world space, overscan so the camera never shows an edge) ----
    const TILES = {};
    function tile(kind) {
      if (TILES[kind]) return TILES[kind];
      const c = mk(120, 120), g = c.getContext("2d");
      if (kind === "dots") { g.clearRect(0, 0, 120, 120); g.fillStyle = PAL.ray; for (const [x, y] of [[30, 30], [90, 90]]) { g.beginPath(); g.arc(x, y, 15, 0, TAU); g.fill(); } }
      else { g.fillStyle = PAL.ray; g.fillRect(0, 0, 60, 60); g.fillRect(60, 60, 60, 60); }
      return (TILES[kind] = out.createPattern(c, "repeat"));
    }
    function drawBG(c, T, sh) {
      const g = c.createLinearGradient(0, -400, 0, H + 400); g.addColorStop(0, PAL.bg[0]); g.addColorStop(0.5, PAL.bg[1]); g.addColorStop(1, PAL.bg[2]);
      c.fillStyle = g; c.fillRect(-500, -700, W + 1000, H + 1400);
      const kind = sh.bg || S.bg || PAL.defBg;
      c.fillStyle = PAL.ray;
      if (kind === "rays") { c.save(); c.translate(540, 900); c.rotate(T * 0.12); for (let i = 0; i < 16; i++) { const a = (i / 16) * TAU, b = a + TAU / 32; c.beginPath(); c.moveTo(0, 0); c.lineTo(Math.cos(a) * 2600, Math.sin(a) * 2600); c.lineTo(Math.cos(b) * 2600, Math.sin(b) * 2600); c.closePath(); c.fill(); } c.restore(); }
      else if (kind === "dots" || kind === "checker") { c.save(); const o = (T * 26) % 120; c.translate(-o, -o); c.fillStyle = tile(kind); c.fillRect(0, 0, W + 400, H + 400); c.restore(); }
      else if (kind === "stripes") { const o = (T * 60) % 180; for (let i = -6; i < 16; i++) { const x = i * 180 + o; c.beginPath(); c.moveTo(x, -300); c.lineTo(x + 90, -300); c.lineTo(x + 90 - 700, H + 300); c.lineTo(x - 700, H + 300); c.closePath(); c.fill(); } }
      else if (kind === "waves") { for (let i = 0; i < 6; i++) { const y0 = 260 + i * 300; c.beginPath(); c.moveTo(-300, H + 400); for (let x = -300; x <= W + 300; x += 30) c.lineTo(x, y0 + 38 * Math.sin(x * 0.006 + T * (1 + i * 0.25) + i)); c.lineTo(W + 300, H + 400); c.closePath(); c.globalAlpha = 0.5; c.fill(); c.globalAlpha = 1; } }
    }

    // ---- painting helpers ----
    const rrect = (c, x, y, w, h, r) => { c.beginPath(); c.moveTo(x + r, y); c.arcTo(x + w, y, x + w, y + h, r); c.arcTo(x + w, y + h, x, y + h, r); c.arcTo(x, y + h, x, y, r); c.arcTo(x, y, x + w, y, r); c.closePath(); };
    function paint(c, str, size, col, o = {}) {
      const font = o.font || FONT.heavy; c.font = `${weightOf(font)} ${size}px ${font}`; c.textAlign = "center"; c.textBaseline = "middle"; c.lineJoin = "round"; c.miterLimit = 2;
      if (!o.noShadow) { c.strokeStyle = "rgba(10,20,60,0.42)"; c.lineWidth = size * 0.27; c.strokeText(str, size * 0.03, size * 0.07); }
      c.strokeStyle = o.outer || col.out; c.lineWidth = size * 0.25; c.strokeText(str, 0, 0);
      c.strokeStyle = o.edge || "#fff"; c.lineWidth = size * 0.13; c.strokeText(str, 0, 0);
      if (o.fill) c.fillStyle = o.fill; else { const g = c.createLinearGradient(0, -size * 0.45, 0, size * 0.45); g.addColorStop(0, col.hi); g.addColorStop(1, col.lo); c.fillStyle = g; }
      c.fillText(str, 0, 0);
    }
    function burstShape(c, cx, cy, rx, ry, T, t0, col, ob = 1) {
      const lt = T - t0; if (lt < 0) return;
      const sc = back(lt / 0.3, 1.6) * ob, n = 22;
      c.save(); c.translate(cx, cy); c.scale(sc, sc); c.rotate(0.03 * Math.sin(T * 3)); c.lineCap = "round";
      c.strokeStyle = "rgba(255,255,255,0.85)"; c.lineWidth = 7;
      for (let i = 0; i < 30; i++) { const a = (i / 30) * TAU + 0.05 * Math.sin(T * 2), r0 = 1.08 + 0.1 * hash(i), r1 = r0 + 0.12 + 0.18 * hash(i + 40) + 0.04 * Math.sin(T * 16 + i); c.beginPath(); c.moveTo(Math.cos(a) * rx * r0, Math.sin(a) * ry * r0); c.lineTo(Math.cos(a) * rx * r1, Math.sin(a) * ry * r1); c.stroke(); }
      c.beginPath(); for (let i = 0; i < n * 2; i++) { const a = (i / (n * 2)) * TAU, r = i % 2 === 0 ? 1 - 0.05 * hash(i) : 0.74; const x = Math.cos(a) * rx * r, y = Math.sin(a) * ry * r; i ? c.lineTo(x, y) : c.moveTo(x, y); }
      c.closePath(); c.lineJoin = "round"; c.strokeStyle = col.out; c.lineWidth = 30; c.stroke(); c.strokeStyle = "#fff"; c.lineWidth = 16; c.stroke();
      const g = c.createRadialGradient(0, 0, 10, 0, 0, rx); g.addColorStop(0, col.hi); g.addColorStop(1, col.lo); c.fillStyle = g; c.fill(); c.restore();
    }
    const ring = (c, x, y, T, t0, R, col = "#fff") => { const k = (T - t0) / 0.42; if (k < 0 || k > 1) return; c.save(); c.globalAlpha = 1 - k; c.strokeStyle = col; c.lineWidth = 26 * (1 - k) + 3; c.beginPath(); c.arc(x, y, 40 + (R - 40) * eo(k), 0, TAU); c.stroke(); c.restore(); };

    // ---- caption kinds ----
    const K_DRAW = {
      burst(c, it, T, L, ob) {
        const n = L.lines.reduce((a, l) => a + l.cl.length, 0), step = Math.min(2 / 30, 0.42 / Math.max(1, n));
        burstShape(c, it.x, it.y, Math.min(540, L.w / 2 + 120), L.h / 2 + 95, T, it.t0, it.burstCol, ob);
        let g = 0;
        L.lines.forEach((l, li) => {
          const ly = it.y + (li - (L.lines.length - 1) / 2) * L.lh; let x = it.x - l.tw / 2;
          l.cl.forEach((ch, i) => {
            const w = l.ws[i], cx = x + w / 2; x += w; g++;
            if (!ch.trim()) return;
            const lt = T - it.t0 - (g - 1) * step; if (lt < 0) return;
            const s0 = back(lt / (8 / 30), 1.7) * ob, wob = clamp(lt / 0.3), rot = (hash(it.seed * 31 + g) - 0.5) * 0.12 + 0.05 * Math.sin(T * 9 + g * 1.3) * wob, sc = s0 * (1 + 0.025 * Math.sin(T * 7 + g * 0.9) * wob);
            c.save(); c.translate(cx, ly); c.rotate(rot + it.rotR); c.scale(sc, sc); paint(c, ch, l.size, it.col); c.restore();
          });
        });
      },
      shake(c, it, T, L, ob) {
        const lt = T - it.t0, f = Math.floor(T * 30), crash = 1 - eo(lt / 0.12), sc = (1 + 1.4 * crash) * ob;
        const dx = lt > 0.12 ? (hash(f * 7 + it.seed) - 0.5) * 14 : 0, dy = lt > 0.12 ? (hash(f * 11 + it.seed) - 0.5) * 14 : 0, r = (hash(f * 5 + it.seed) - 0.5) * 0.05;
        c.save(); c.translate(it.x + dx, it.y + dy); c.rotate(r + it.rotR); c.scale(sc, sc); c.globalAlpha = clamp(lt / 0.05);
        L.lines.forEach((l, li) => { c.save(); c.translate(0, (li - (L.lines.length - 1) / 2) * L.lh); paint(c, l.str, l.size, it.col, { outer: "#14091f" }); c.restore(); });
        c.restore();
        if (lt > 0 && lt < 0.3) ring(c, it.x, it.y, T, it.t0 + 0.1, 330, it.col.hi);
      },
      stamp(c, it, T, L, ob) {
        const lt = T - it.t0, k = clamp(lt / 0.11), sc = (k < 1 ? lerp(3.2, 1, ei(k)) : 1 + 0.05 * Math.exp(-(lt - 0.11) * 14) * Math.sin((lt - 0.11) * 40)) * ob;
        c.save(); c.translate(it.x, it.y); c.rotate(it.rotR || (it.tilt * Math.PI) / 180); c.scale(sc, sc); c.globalAlpha = clamp(lt / 0.04);
        const w = L.w, h = L.h; rrect(c, -w / 2, -h / 2, w, h, 26);
        c.lineJoin = "round"; c.save(); c.translate(4, 9); c.strokeStyle = "rgba(10,20,60,0.4)"; c.lineWidth = 26; c.stroke(); c.restore();
        c.fillStyle = "#fff"; c.fill(); c.strokeStyle = it.col.lo; c.lineWidth = 18; c.stroke(); c.strokeStyle = it.col.out; c.lineWidth = 5; rrect(c, -w / 2 + 16, -h / 2 + 16, w - 32, h - 32, 14); c.stroke();
        L.lines.forEach((l, li) => { c.save(); c.translate(0, (li - (L.lines.length - 1) / 2) * L.lh + 4); paint(c, l.str, l.size, it.col, { noShadow: true, edge: "rgba(0,0,0,0)", outer: "rgba(0,0,0,0)" }); c.restore(); });
        c.restore();
        ring(c, it.x, it.y, T, it.t0 + 0.11, Math.max(L.w, 500) * 0.8, "#fff");
      },
      swipe(c, it, T, L, ob) {
        const lt = T - it.t0, wipe = eo(lt / 0.24), w = L.w, h = L.lh * L.lines.length + 6;
        c.save(); c.translate(it.x, it.y); c.rotate(it.rotR - 0.03); c.scale(ob, ob);
        c.save(); c.beginPath(); c.rect(-w / 2 - 20, -h, (w + 40) * wipe, h * 2); c.clip();
        c.fillStyle = "rgba(10,20,60,0.35)"; c.fillRect(-w / 2 + 5, -h / 2 + 9, w, h);
        const g = c.createLinearGradient(0, -h / 2, 0, h / 2); g.addColorStop(0, it.col.hi); g.addColorStop(1, it.col.lo); c.fillStyle = g; c.fillRect(-w / 2, -h / 2, w, h);
        c.fillStyle = it.col.out; c.fillRect(-w / 2, h / 2 - 6, w, 6); c.restore();
        const ta = clamp((lt - 0.06) / 0.2), s = back(ta, 1.6); c.globalAlpha = clamp(ta * 3);
        L.lines.forEach((l, li) => { c.save(); c.translate(0, (li - (L.lines.length - 1) / 2) * L.lh + 3); c.scale(s, s); paint(c, l.str, l.size, it.col, { fill: PAL.ink, outer: "rgba(0,0,0,0)", edge: "rgba(255,255,255,0.95)", noShadow: true }); c.restore(); });
        c.globalAlpha = 1;
        const uw = eo((lt - 0.28) / 0.3); if (uw > 0) { c.strokeStyle = "#fff"; c.lineWidth = 9; c.lineCap = "round"; c.beginPath(); const y = h / 2 + 24, n = 14; for (let i = 0; i <= n * uw; i++) { const x = -w / 2 + (i / n) * w * 0.98; i ? c.lineTo(x, y + (i % 2 ? 9 : -9)) : c.moveTo(x, y); } c.stroke(); }
        c.restore();
      },
      stack(c, it, T, L, ob) {
        const n = L.lines.length; let y = it.y - L.h / 2;
        L.lines.forEach((l, i) => {
          const a = it.ats ? it.ats[Math.min(i, it.ats.length - 1)] : it.t0 + i * 0.16, lh = l.size * 1.12, cy = y + lh / 2; y += lh;
          const lt = T - a; if (lt < 0) return;
          const s0 = back(lt / 0.27, 1.9) * ob, rot = (i % 2 ? 1 : -1) * 0.04 + it.rotR + 0.02 * Math.sin(T * 6 + i) * clamp(lt / 0.4);
          const col = it.colors.length ? it.colors[i % it.colors.length] : i % 2 ? COL.white : it.col;
          c.save(); c.translate(it.x, cy); c.rotate(rot); c.scale(s0, s0); paint(c, l.str, l.size, col); c.restore();
        });
      },
      bounce(c, it, T, L, ob) {
        let g = 0;
        L.lines.forEach((l, li) => {
          const ly = it.y + (li - (L.lines.length - 1) / 2) * L.lh; let x = it.x - l.tw / 2;
          l.cl.forEach((ch, i) => {
            const w = l.ws[i], cx = x + w / 2; x += w; g++;
            if (!ch.trim()) return;
            const lt = T - it.t0 - (g - 1) * 0.07; if (lt < 0) return;
            const k = clamp(lt / 0.6), dy = -(1 - bounceOut(k)) * 560, wave = k >= 1 ? Math.sin(T * 6 - g * 0.6) * 8 : 0, sq = k < 1 && k > 0.4 ? 1 + 0.12 * Math.sin(k * 20) * (1 - k) : 1;
            c.save(); c.translate(cx, ly + dy + wave); c.scale(ob / sq, ob * sq); c.rotate(it.rotR + (hash(it.seed + g) - 0.5) * 0.06); paint(c, ch, l.size, it.col); c.restore();
          });
        });
      },
      tilt(c, it, T, L, ob) {
        const lt = T - it.t0, k = back(lt / 0.34, 1.7), rot = lerp(-0.6, (it.tilt * Math.PI) / 180, clamp(lt / 0.34)) + it.rotR + 0.012 * Math.sin(T * 3), sc = k * ob;
        c.save(); c.translate(it.x, it.y); c.rotate(rot); c.scale(sc, sc);
        const w = L.w, h = L.lh * L.lines.length + 24, sk = -0.12; c.save(); c.transform(1, 0, sk, 1, 0, 0);
        c.fillStyle = "rgba(10,20,60,0.4)"; c.fillRect(-w / 2 + 7, -h / 2 + 12, w, h);
        c.fillStyle = it.col.out; c.fillRect(-w / 2 - 8, -h / 2 - 8, w + 16, h + 16); c.fillStyle = "#fff"; c.fillRect(-w / 2 - 2, -h / 2 - 2, w + 4, h + 4);
        const g = c.createLinearGradient(0, -h / 2, 0, h / 2); g.addColorStop(0, it.col.hi); g.addColorStop(1, it.col.lo); c.fillStyle = g; c.fillRect(-w / 2 + 3, -h / 2 + 3, w - 6, h - 6); c.restore();
        L.lines.forEach((l, li) => { c.save(); c.translate(0, (li - (L.lines.length - 1) / 2) * L.lh + 2);
          for (let d = 9; d >= 1; d--) { c.save(); c.translate(d * 1.1, d * 1.7); paint(c, l.str, l.size, it.col, { noShadow: true, fill: it.col.out, outer: it.col.out, edge: it.col.out }); c.restore(); }
          paint(c, l.str, l.size, COL.white, { outer: it.col.out, edge: it.col.lo, noShadow: true }); c.restore(); });
        c.restore();
      },
      counter(c, it, T, L, ob) {
        const lt = T - it.t0, dur = it.dur ?? 0.9, p = clamp(lt / dur), from = it.from ?? 0, to = it.to ?? 0, v = lerp(from, to, eo(p)), dec = it.dec || 0;
        const F = (it.prefix || "") + numFmt(to, dec) + (it.suffix || ""), cur = (it.prefix || "") + numFmt(dec ? v : Math.round(v), dec) + (it.suffix || "");
        const size = L.lines[0].size, font = L.font; c.font = `800 ${size}px ${font}`;
        const slot = [...F].map((ch) => (/\d/.test(ch) ? meas("0", size, font) : meas(ch, size, font))), tw = slot.reduce((a, b) => a + b, 0), pad = [...F].length - [...cur].length;
        const fin = lt - dur, pop = fin > 0 ? 1 + 0.14 * Math.exp(-fin * 9) * Math.cos(fin * 24) : 1 + 0.05 * (1 - (v % 1));
        if (fin > -0.05) burstShape(c, it.x, it.y, Math.min(540, tw / 2 + 150), size * 0.8, T, it.t0 + dur, it.burstCol, ob);
        c.save(); c.translate(it.x, it.y - (it.cap ? size * 0.12 : 0)); c.rotate(it.rotR); c.scale(pop * back(lt / 0.25, 1.7) * ob, pop * back(lt / 0.25, 1.7) * ob);
        let x = -tw / 2; [...F].forEach((fc, i) => { const ch = i >= pad ? [...cur][i - pad] : ""; if (ch && ch.trim()) { c.save(); c.translate(x + slot[i] / 2, 0); paint(c, ch, size, it.col); c.restore(); } x += slot[i]; });
        c.restore();
        if (it.cap) { const ls = size * 0.34, lk = back((lt - 0.2) / 0.3, 1.8) * ob; if (lk > 0) { c.save(); c.translate(it.x, it.y + size * 0.62); c.scale(lk, lk); paint(c, String(it.cap), ls, COL.white); c.restore(); } }
      },
      aside(c, it, T, L, ob) {
        const lt = T - it.t0, sc = back(lt / 0.27, 1.8) * ob;
        c.save(); c.translate(it.x, it.y); c.rotate((it.tilt * Math.PI) / 180 + it.rotR + 0.02 * Math.sin(T * 6)); c.scale(sc, sc); c.transform(1, 0, -0.22, 1, 0, 0);
        L.lines.forEach((l, li) => { c.save(); c.translate(0, (li - (L.lines.length - 1) / 2) * L.lh); paint(c, l.str, l.size, it.col, { font: FONT.hand, fill: "#fff", outer: it.col.out, edge: it.col.lo }); c.restore(); });
        c.restore();
      },
    };

    function drawCap(c, it, T) {
      if (T < it.t0 || T < 0) return;
      const o = clamp((T - it.t1) / 0.15); if (o >= 1) return;
      (K_DRAW[it.kind] || K_DRAW.burst)(c, it, T, lay(it), 1 - eo(o));
    }

    // ---- stickers + effects (world space) ----
    function drawArtItem(c, it, T) {
      const lt = T - it.t0; if (lt < 0) return;
      const o = clamp((T - it.t1) / 0.15); if (o >= 1) return;
      const anim = it.anim || "pop", idle = it.idle || "bob", s0 = it.s ?? 1, sd = hash(it.id * 3 + SEED) * 6;
      let x = it.x ?? 540, y = it.y ?? 960, rot = it.rotR, sc = s0 * (1 - eo(o)), al = 1;
      const ent = { pop: () => (sc *= back(lt / 0.27, 1.8)), drop: () => { y -= (1 - bounceOut(lt / 0.55)) * 900; }, spin: () => { sc *= back(lt / 0.4, 1.5); rot += (1 - eo(lt / 0.45)) * TAU; }, "slide-l": () => { x -= (1 - back(lt / 0.4, 1.3)) * 800; }, "slide-r": () => { x += (1 - back(lt / 0.4, 1.3)) * 800; }, zoom: () => { sc *= 1 + 2.2 * (1 - eo(lt / 0.25)); al = eo(lt / 0.2); }, none: () => {} };
      (ent[anim] || ent.pop)();
      const ia = clamp((lt - 0.3) / 0.3);
      if (idle === "bob") y += Math.sin(T * 4.4 + sd) * 14 * ia; else if (idle === "pulse") sc *= 1 + 0.07 * Math.exp(-(((T % BEAT) / BEAT)) * 5) * ia; else if (idle === "wiggle") rot += 0.08 * Math.sin(T * 7 + sd) * ia;
      else if (idle === "spin") rot += lt * 1.2 * ia; else if (idle === "float") { x += 12 * Math.sin(T * 1.3 + sd) * ia; y += 16 * Math.sin(T * 1.9 + 1 + sd) * ia; }
      c.save(); c.translate(x, y); c.rotate(rot); c.scale(sc * (it.flip ? -1 : 1), sc); c.globalAlpha = al;
      K.drawArt(c, it.art, { col: it.col, pal: PAL, t: lt, label: it.label, sym: it.sym, face: it.face, fy: it.fy }); c.restore();
    }
    function drawFx(c, it, T) {
      const lt = T - it.t0; if (lt < 0) return;
      const x = it.x ?? 540, y = it.y ?? 700, names = K.COLORS;
      if (it.fx === "confetti") {
        const n = it.n ?? 70, dur = it.dur ?? 2.6; if (lt > dur + 2.5) return;
        for (let i = 0; i < n; i++) {
          const d = hash(i * 5 + SEED) * 0.6, l2 = lt - d; if (l2 < 0) continue;
          const px = hash(i * 3 + 1 + SEED) * W + 40 * Math.sin(l2 * 2 + i), py = -80 + l2 * (520 + 380 * hash(i + 7)); if (py > H + 60) continue;
          c.save(); c.translate(px, py); c.rotate(l2 * (3 + 4 * hash(i + 11)) + i); c.scale(Math.cos(l2 * 6 + i), 1); c.fillStyle = COL[names[i % names.length]].lo; c.fillRect(-9, -14, 18, 28); c.restore();
        }
      } else if (it.fx === "sparkles") {
        const n = it.n ?? 8, r = it.r ?? 330;
        for (let i = 0; i < n; i++) { const a = TAU * hash(i * 3 + 1 + SEED), rr = r * (0.7 + 0.5 * hash(i + 11)), k = clamp((lt - i * 0.09) / 0.2) * (0.6 + 0.4 * Math.sin(T * 9 + i * 2)); if (k <= 0) continue;
          c.save(); c.translate(x + Math.cos(a) * rr, y + Math.sin(a) * rr * 0.9); c.rotate(T * 1.2 + i); const s = (0.16 + 0.12 * hash(i + 5)) * k * 2; c.scale(s, s); K.drawArt(c, "sparkle", { col: COL[i % 2 ? "yellow" : "white"], t: lt }); c.restore(); }
      } else if (it.fx === "speed") {
        const r0 = it.r ?? 300, f = Math.floor(T * 15); c.save(); c.translate(x, y); c.strokeStyle = "rgba(255,255,255,0.55)"; c.lineCap = "round";
        for (let i = 0; i < 40; i++) { const a = (i / 40) * TAU + hash(f + i) * 0.05, a0 = r0 + 60 * hash(i + f * 3), a1 = a0 + 220 + 480 * hash(i * 7 + 2); c.lineWidth = 4 + 7 * hash(i + 9); c.beginPath(); c.moveTo(Math.cos(a) * a0, Math.sin(a) * a0); c.lineTo(Math.cos(a) * a1, Math.sin(a) * a1); c.stroke(); } c.restore();
      } else if (it.fx === "shock") ring(c, x, y, T, it.t0, it.r ?? 500, "#fff");
    }

    // ---- subtitles: phrases of each line (lines.<key>.cap or split at spaces), [word] / hi words in gold ----
    const CAPS = M.CAP, TT = M.TT, PH = [];
    CAPS.forEach((c, i) => {
      const plain = String(c.text || "").replace(/[\[\]]/g, ""), arr = [...plain], chars = (TT.chars || [])[i];
      const timeAt = (idx) => (chars && chars.length === arr.length ? chars[Math.min(idx, arr.length - 1)] : c.start + (idx / Math.max(1, arr.length)) * Math.max(0.3, c.end - c.start - 0.25));
      let list = c.cap;
      if (!list) {   // no phrases given: cut at spaces, and inside long Thai runs at word boundaries (Intl.Segmenter), at most `caption.max` characters per phrase
        const max = S.caption?.max || 22, segs = typeof Intl !== "undefined" && Intl.Segmenter ? [...new Intl.Segmenter("th", { granularity: "word" }).segment(plain)].map((x) => x.segment) : plain.split(/(\s+)/);
        list = []; let cur = ""; for (const w of segs) { if ([...(cur + w).trim()].length > max && cur.trim()) { list.push(cur.trim()); cur = w.trim() ? w : ""; } else cur += w; } if (cur.trim()) list.push(cur.trim());
      }
      const ens = Array.isArray(c.en) ? c.en : null; let cursor = 0;
      list.forEach((item, j) => {
        const [show, spoken] = Array.isArray(item) ? item : [item, item];
        let idx = plain.indexOf(spoken, [...plain].slice(0, cursor).join("").length); if (idx < 0) idx = plain.indexOf(String(spoken).split(/\s+/)[0]);
        const ci = idx >= 0 ? [...plain.slice(0, idx)].length : cursor;
        PH.push({ th: show, en: ens ? ens[j] ?? "" : j === 0 ? c.en || "" : "", s: Math.max(c.start, timeAt(ci) - 0.05), e: c.end, line: i, hi: c.hi || [] });
        if (idx >= 0) cursor = ci + [...spoken].length;
      });
    });
    PH.sort((a, b) => a.s - b.s); PH.forEach((p, i) => { const n = PH[i + 1]; if (n && (n.line === p.line || n.s - p.e < 0.6)) p.e = n.s; });
    const CAPO = { y: 1410, size: 58, ...(S.caption || {}) }, GOLD = "#ffe14a";
    function drawSub(c, T) {
      if (vars.subtitles === false || CAPO.show === false || window.__VC_NOSUBS) return;
      const p = PH.find((q) => T >= q.s && T < q.e); if (!p) return;
      const cs = SH.find((x) => T >= x.t0 && T < x.t1); if (cs && cs.subs === false) return;
      const k = clamp((T - p.s) / 0.12), parts = []; let rest = p.th;
      while (rest) { let best = -1, bw = ""; for (const w of p.hi) { const q = w ? rest.indexOf(w) : -1; if (q >= 0 && (best < 0 || q < best)) { best = q; bw = w; } } if (best < 0) { parts.push([rest, false]); break; } if (best > 0) parts.push([rest.slice(0, best), false]); parts.push([bw, true]); rest = rest.slice(best + bw.length); }
      c.save(); c.setTransform(1, 0, 0, 1, 0, 0); c.globalAlpha = 0.35 + 0.65 * k; c.textBaseline = "middle"; c.textAlign = "left";
      let size = CAPO.size; c.font = `800 ${size}px ${FONT.heavy}`; let tw = parts.reduce((s, [q]) => s + c.measureText(q).width, 0); if (tw > 940) { size *= 940 / tw; c.font = `800 ${size}px ${FONT.heavy}`; tw = 940; }
      let x = 540 - tw / 2; const y = CAPO.y + (1 - k) * 5; c.lineJoin = "round";
      c.lineWidth = size * 0.3; c.strokeStyle = PAL.subOut; for (const [q] of parts) { c.strokeText(q, x, y); x += c.measureText(q).width; }
      x = 540 - tw / 2; for (const [q, h] of parts) { c.fillStyle = h ? GOLD : "#fff"; c.fillText(q, x, y); x += c.measureText(q).width; }
      if (CAPO.en !== false && p.en) { let es = 32; c.font = `800 ${es}px ${FONT.heavy}`; const ew = c.measureText(p.en).width; if (ew > 900) { es *= 900 / ew; c.font = `800 ${es}px ${FONT.heavy}`; } c.textAlign = "center"; c.lineWidth = 9; c.strokeStyle = PAL.subOut; c.strokeText(p.en, 540, y + size * 0.95); c.fillStyle = "#fff"; c.fillText(p.en, 540, y + size * 0.95); }
      c.restore();
    }

    // ---- one frame ----
    function draw(T) {
      let i = SH.findIndex((s) => T >= s.t0 && T < s.t1); if (i < 0) i = T < (SH[0]?.t0 ?? 0) ? 0 : SH.length - 1;
      const sh = SH[i]; out.setTransform(1, 0, 0, 1, 0, 0); out.globalAlpha = 1; out.globalCompositeOperation = "source-over"; out.fillStyle = PAL.bg[1]; out.fillRect(0, 0, W, H);
      if (!sh) return;
      const cm = camAt(sh, T);
      out.save(); out.translate(540 + cm.x, 960 + cm.y); out.rotate(cm.r); out.scale(cm.z, cm.z); out.translate(-540, -960);
      drawBG(out, T, sh);
      for (const a of sh.arts) drawArtItem(out, a, T);
      for (const f of sh.fxs) drawFx(out, f, T);
      out.restore();
      for (const cp of sh.caps) drawCap(out, cp, T);
      if (S.cut !== "none") for (const f of FLASH) { const d = T - f; if (d >= 0 && d < 0.1) { out.setTransform(1, 0, 0, 1, 0, 0); out.fillStyle = `rgba(255,255,255,${0.3 * (1 - d / 0.1)})`; out.fillRect(0, 0, W, H); } }
      drawSub(out, T);
    }

    // HyperFrames seeks the timeline ~1,300 times per snapshot: redraw ONCE per batch of seeks (a microtask after the synchronous seek loop)
    const clock = { _t: 0, _q: false, get t() { return this._t; }, set t(v) { this._t = v; if (!this._q) { this._q = true; queueMicrotask(() => { this._q = false; draw(this._t); }); } } };
    tl.fromTo(clock, { t: 0 }, { t: TOTAL, duration: TOTAL, ease: "none", immediateRender: false }, 0);
    draw(0);
    if (document.fonts && document.fonts.load) Promise.all([`800 40px ${FONT.heavy}`, `700 40px ${FONT.hand}`].map((f) => document.fonts.load(f, "ทดสอบAa?!"))).then(() => { LAY.clear(); draw(clock._t); }).catch(() => {});
    window.VC_DEBUG = { SH, PAL, draw, warnings: WARN, lay };
    return { SH, TOTAL };
  }

  // validate -> red card, or build. `jsError`: a syntax error caught while the SCENE script ran (MCP page).
  function boot(tl, SCENE, jsError) {
    const total = +document.querySelector("#root").dataset.duration;
    const esc = (x) => String(x).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    try {
      if (!SCENE || typeof SCENE !== "object") throw Object.assign(new Error("no SCENE"), { problems: [jsError ? `scenes_js has a JavaScript error: ${jsError}` : "scenes_js must be exactly one statement: const SCENE = { palette: \"pop\", lines: {}, shots: { <shotId>: { items: [ { cap: \"...\", kind: \"burst\", y: 440 } ] } } };"] });
      const caps = window.CAPTIONS || [], shotIds = [...document.querySelectorAll("section[data-shot]")].map((s) => s.dataset.shot);
      const all = window.VCV.validate(SCENE, caps, shotIds), errs = all.filter((p) => p.level === "error");
      all.filter((p) => p.level === "warn").forEach((p) => console.warn(`[variety-captions] ${p.path}: ${p.msg} (${p.fix || ""})`));
      if (errs.length) throw Object.assign(new Error("invalid SCENE"), { problems: errs });
      return build(tl, window.VCV.expand(SCENE, shotIds, caps));
    } catch (e) {
      const list = e.problems || ["engine error: " + (e && e.message ? e.message : e)];
      const shown = list.slice(0, 4).map((p) => (typeof p === "string" ? `<p>${esc(p.slice(0, 520))}</p>` : `<p>${esc(p.path)}: ${esc(p.msg)}<i>fix: ${esc(String(p.fix || "").slice(0, 400))}</i></p>`)).join("");
      const d = document.createElement("div"); d.id = "vcerr";
      d.innerHTML = `<b>SCENE data error (${list.length}) - fix set_scenes</b>${shown}${list.length > 4 ? `<p>… and ${list.length - 4} more</p>` : ""}`;
      (document.querySelector("#chrome") || document.querySelector("#root")).appendChild(d);
      tl.to({}, { duration: total }, 0);
      console.error("variety-captions: " + list.map((p) => (typeof p === "string" ? p : `${p.path}: ${p.msg} (fix: ${p.fix})`)).join("\n"));
      return null;
    }
  }
  window.VC = { build, boot };
})(window.VCK);
// genhaha:4846ca29f0d0
