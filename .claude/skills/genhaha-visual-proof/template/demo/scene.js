window.VP_SCENE = {
  palette: "navy",
  ink: { r1: "teal", r2: "gold", r3: "coral", r4: "violet", side: "sky" },
  camera: "push",
  enter: "trace",
  transition: "fade",
  ground: "plain",
  caption: { show: true, accent: "gold" },
  shots: {
    s1: { type: "build", title: "ผลบวกของเลขคี่", camera: "push",
      figure: [
        { id: "c1", part: "cells", x: 0, y: 0, cols: 1, rows: 1, q: "r1" },
        { id: "c3", part: "cells", x: 0, y: 1.25, cols: 3, rows: 1, q: "r2" },
        { id: "c5", part: "cells", x: 0, y: 2.5, cols: 5, rows: 1, q: "r3" },
        { id: "c7", part: "cells", x: 0, y: 3.75, cols: 7, rows: 1, q: "r4" } ],
      eq: [{ t: "1", q: "r1", from: "c1", at: "h1@0.34" }, "+", { t: "3", q: "r2", from: "c3", at: "h1@0.48" }, "+", { t: "5", q: "r3", from: "c5", at: "h1@0.59" }, "+",
        { t: "7", q: "r4", from: "c7", at: "h1@0.69" }, "=", { t: "?", at: "h1@0.86", sfx: "pop" }] },

    s2: { type: "numberline", title: "เลขคี่ห่างกันทีละ 2", camera: "drift",
      line: { from: 0, to: 8, step: 1 },
      marks: [{ v: 1, q: "r1", at: "n1@0.12" }, { v: 3, q: "r2", at: "n1@0.18" }, { v: 5, q: "r3", at: "n1@0.24" }, { v: 7, q: "r4", at: "n1@0.3" }],
      jumps: [{ from: 1, to: 3, label: "+2", q: "line", at: "n1@0.56" }, { from: 3, to: 5, label: "+2", q: "line", at: "n1@0.7" }, { from: 5, to: 7, label: "+2", q: "line", at: "n1@0.84" }],
      eq: [{ t: "1", q: "r1", from: "mark1", at: "n1@0.5" }, ",", { t: "3", q: "r2", from: "mark2", at: "n1@0.64" }, ",", { t: "5", q: "r3", from: "mark3", at: "n1@0.78" }, ",", { t: "7", q: "r4", from: "mark4", at: "n1@0.9" }] },

    s3: { type: "array", title: "วางเลขคี่เป็นจุด", camera: "focus", look: [1.5, 1.5],
      figure: [{ id: "ghost", part: "dots", x: 0, y: 0, cols: 4, rows: 4, r: 5, q: "soft", at: 0, enter: "fade" }],
      array: { n: 4, as: "dots", q: ["r1", "r2", "r3", "r4"], at: ["a1@0.7", "a2@0.46", "a2@0.64", "a2@0.8"], sfx: ["pop", "tick", "tick", "tick"] },
      eq: [{ t: "1", q: "r1", from: "ring1", at: "a1@0.85" }, "+", { t: "3", q: "r2", from: "ring2", at: "a2@0.56" }, "+", { t: "5", q: "r3", from: "ring3", at: "a2@0.74" }, "+", { t: "7", q: "r4", from: "ring4", at: "a2@0.9" }] },

    s4: { type: "steps", title: "ได้จัตุรัสทุกครั้ง", camera: "still",
      steps: [
        { eq: [{ t: "1", q: "r1" }, "=", { t: "1", sup: 2, q: "side" }], at: "p1@0.25" },
        { eq: [{ t: "1", q: "r1" }, "+", { t: "3", q: "r2" }, "=", { t: "2", sup: 2, q: "side" }], at: "p2@0.02" },
        { eq: [{ t: "1", q: "r1" }, "+", { t: "3", q: "r2" }, "+", { t: "5", q: "r3" }, "=", { t: "3", sup: 2, q: "side" }], at: "p2@0.36" },
        { eq: [{ t: "1", q: "r1" }, "+", { t: "3", q: "r2" }, "+", { t: "5", q: "r3" }, "+", { t: "7", q: "r4" }, "=", { t: "4", sup: 2, q: "side" }], at: "p2@0.7", sfx: "tick" } ] },

    s5: { type: "build", title: "สี่เลขคี่แรก = สี่คูณสี่", camera: "pull",
      figure: [
        { id: "g1", part: "gnomon", x: 0, y: 0, n: 1, q: "r1", at: 0, enter: "fade" },
        { id: "g2", part: "gnomon", x: 0, y: 0, n: 2, q: "r2", at: 0.1, enter: "fade" },
        { id: "g3", part: "gnomon", x: 0, y: 0, n: 3, q: "r3", at: 0.2, enter: "fade" },
        { id: "g4", part: "gnomon", x: 0, y: 0, n: 4, q: "r4", at: 0.3, enter: "fade" },
        { id: "bt", part: "brace", a: [-0.3, -0.5], b: [3.3, -0.5], label: "4", q: "side", at: "e1@0.45" },
        { id: "bl", part: "brace", a: [-0.5, 3.3], b: [-0.5, -0.3], label: "4", q: "side", at: "e1@0.52" } ],
      view: [-1.25, -1.3, 4.75, 4.75],
      eq: [{ id: "sq", t: "4", sup: 2, q: "side", from: "bt", at: "e1@0.6" }, "=", { t: "16", q: "sum", at: "e1@0.84", sfx: "ding" }],
      focus: [{ at: "e1@0.6", ids: ["bt", "bl", "sq"] }] },

    s6: { type: "qed", title: "ทุกจำนวนนับ n", camera: "still",
      eq: [{ t: "1", q: "r1", at: "q1@0.1" }, "+", { t: "3", q: "r2" }, "+", { t: "5", q: "r3" }, "+", "…", "+", "(", { t: "2n", it: true, q: "line" }, "−", "1", ")"],
      eq2: ["=", { t: "n", sup: 2, q: "side", at: "q1@0.66", sfx: "sparkle" }],
      note: "สำหรับทุกจำนวนนับ n" }
  }
};
// genhaha:ed4a029a9d2b
