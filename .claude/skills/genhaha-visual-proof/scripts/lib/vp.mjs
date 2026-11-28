// The visual-proof validator (vp-validate.js) run in Node, so `check`, `lint`, `catalog`, `sync` and `sfx` see exactly what the page sees.
// vp-lib.js / vp-art.js / vp-validate.js are loaded from the project folder when it has them (a project carries its own kit), else from template/kit.
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import { TEMPLATE } from "./common.mjs";

const KIT = ["vp-lib.js", "vp-art.js", "vp-validate.js"];
export function load(files, extra = {}) {
  const win = { ...extra }, ctx = vm.createContext({ window: win, module: undefined, console, Intl, Math, JSON });
  for (const f of files) vm.runInContext(fs.readFileSync(f, "utf8"), ctx, { filename: f });
  return win;
}
export const kitDir = (root) => (root && KIT.every((f) => fs.existsSync(path.join(root, f))) ? root : path.join(TEMPLATE, "kit"));
export const kit = (root) => load(KIT.map((f) => path.join(kitDir(root), f)));   // { VP, VPA, VPV }
export const VPV = (root) => kit(root).VPV;
export const loadScene = (f) => load([f]).VP_SCENE;
export function loadCaps(f, timing) {
  if (!f || !fs.existsSync(f)) return null;
  const w = { TTS_TIMING: null };
  if (timing && fs.existsSync(timing)) Object.assign(w, load([timing]));
  return load([f], { TTS_TIMING: w.TTS_TIMING }).CAPTIONS || null;
}
// shot ids in script order (captions.js decides the order; scene.js has one key per shot)
export const shotIds = (S, caps) => { const order = [...new Set((caps || []).map((c) => c.shot))]; return order.length ? order : Object.keys(S?.shots || {}); };
// lint a scene + captions → { issues, errors, warnings, ids }; prints nothing
export function lintScene(S, caps, root) {
  const ids = shotIds(S, caps), issues = VPV(root).validate(S, caps || [], ids);
  return { ids, issues, errors: issues.filter((i) => i.level === "error"), warnings: issues.filter((i) => i.level !== "error") };
}
export function printIssues(issues, log = console.log) {
  for (const i of issues) log(`  ${i.level === "error" ? "✗" : "⚠"} ${i.path}: ${i.msg}${i.fix ? `\n      fix: ${i.fix}` : ""}`);
}
// sound cues written in scene.js (`sfx` on figure items, equation terms, array rings, marks/jumps/bars, steps; a qed shot adds a chime on its ∎)
// → [{ t, sfx, why }] in clip seconds. starts = { shotId: data-start } from index.html.
export function sceneCues(root, S, caps, starts) {
  const VP = kit(root).VP, ids = shotIds(S, caps), cues = [];
  const T = (v, id) => VP.resolveAt(v, caps, starts[id] || 0);
  const add = (t, sfx, why) => { if (t != null && sfx) cues.push({ t, sfx, why }); };
  for (const id of ids) {
    const sh = (S.shots || {})[id] || {};
    (sh.figure || []).forEach((it) => it && it.sfx && add(T(it.at, id), it.sfx, `${id} ${it.id || it.part}`));
    if (sh.array) (sh.array.sfx || []).forEach((s, i) => add(T((sh.array.at || [])[i], id), s, `${id} ring${i + 1}`));
    for (const k of ["marks", "jumps", "bars"]) (sh[k] || []).forEach((m, i) => m && m.sfx && add(T(m.at, id), m.sfx, `${id} ${k}[${i}]`));
    (sh.steps || []).forEach((r, i) => r && r.sfx && add(T(r.at, id), r.sfx, `${id} step ${i + 1}`));
    for (const row of [sh.eq, sh.eq2]) (row || []).forEach((tk) => tk && typeof tk === "object" && tk.sfx && add(T(tk.at, id), tk.sfx, `${id} eq ${tk.t}`));
    if (sh.type === "qed") {
      const toks = [].concat(sh.eq || [], sh.eq2 || []).filter((t) => t && typeof t === "object" && t.at != null);
      const last = toks.length ? Math.max(...toks.map((t) => T(t.at, id) || 0)) : starts[id] || 0, next = starts[ids[ids.indexOf(id) + 1]];
      add(sh.markAt != null ? T(sh.markAt, id) : Math.min(last + 0.8, (next || 1e9) - 0.6), "chime", `${id} ∎`);
    }
  }
  return cues.sort((a, b) => a.t - b.t);
}
// genhaha:ed4a029a9d2b
