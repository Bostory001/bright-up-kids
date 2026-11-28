// แผนภาพประกอบบทเรียนที่วาดด้วยโค้ด (SVG) — ไม่ใช้ไฟล์รูป ปรับค่าด้วย params จากเนื้อหาบทเรียน
// ชนิด: compass skydome timezone earth solar stars angle clock numline bars
// ข้อมูลมาจากเซิร์ฟเวอร์ที่ผ่านการกรองแล้ว (lib/server/routes/play.ts cleanParams) แต่ที่นี่ยังอ่านแบบป้องกันค่าผิดรูปเสมอ

import { Apparatus, Objects } from "./Apparatus";

export const DIAGRAM_KINDS = ["compass", "skydome", "timezone", "earth", "solar", "stars", "angle", "clock", "numline", "bars", "states", "tree", "table", "apparatus", "objects"] as const;
export type DiagramKind = (typeof DIAGRAM_KINDS)[number];
type P = Record<string, unknown>;

const n = (p: P, k: string, d: number) => (typeof p[k] === "number" && Number.isFinite(p[k] as number) ? (p[k] as number) : d);
const s = (p: P, k: string, d = "") => (typeof p[k] === "string" ? (p[k] as string) : d);
const b = (p: P, k: string) => p[k] === true;
const arr = (p: P, k: string): unknown[] => (Array.isArray(p[k]) ? (p[k] as unknown[]) : []);
const nums = (a: unknown[]) => a.filter((x): x is number => typeof x === "number" && Number.isFinite(x));
const strs = (a: unknown[]) => a.filter((x): x is string => typeof x === "string");
const rad = (deg: number) => (deg * Math.PI) / 180;
const f = (x: number) => Math.round(x * 100) / 100;

const INK = "#78350f";
const SOFT = "#fef3c7";
const BLUE = "#0369a1";
const ORANGE = "#ea580c";

function Frame({ vb, label, children }: { vb: string; label: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl bg-sky-50 p-2">
      <svg viewBox={vb} role="img" aria-label={label} className="mx-auto block h-auto w-full max-w-xl" fontFamily="inherit">
        {children}
      </svg>
    </div>
  );
}

// ---------- เข็มทิศ ----------
const DIR_ANGLE: Record<string, number> = { N: 0, NE: 45, E: 90, SE: 135, S: 180, SW: 225, W: 270, NW: 315 };
const DIR_TH: Record<string, string> = { N: "เหนือ", E: "ตะวันออก", S: "ใต้", W: "ตะวันตก" };
const DIR_TH2: Record<string, [string, string]> = { NE: ["ตะวันออก", "เฉียงเหนือ"], SE: ["ตะวันออก", "เฉียงใต้"], SW: ["ตะวันตก", "เฉียงใต้"], NW: ["ตะวันตก", "เฉียงเหนือ"] };

function Compass({ p }: { p: P }) {
  const cx = 210, cy = 190, R = 105;
  const pt = (a: number, r: number): [number, number] => [f(cx + r * Math.sin(rad(a))), f(cy - r * Math.cos(rad(a)))];
  const mode8 = s(p, "mode") === "8";
  const facing = s(p, "facing");
  const scale = s(p, "scale");
  const hi = strs(arr(p, "highlight"));
  const ray = typeof p.ray === "number" ? n(p, "ray", 0) : null;
  const scaleText: Record<string, string[]> = { deg: ["0°", "90°", "180°", "270°"], grade: ["0 เกรด", "100", "200", "300"], mil: ["0 มิล", "1,600", "3,200", "4,800"] };
  const st = scaleText[scale];
  const cardinal = ["N", "E", "S", "W"];
  const fa = DIR_ANGLE[facing];
  return (
    <Frame vb="0 0 420 380" label={s(p, "caption", "เข็มทิศแสดงทิศ")}>
      <circle cx={cx} cy={cy} r={R} fill="#fff" stroke={BLUE} strokeWidth="3" />
      {Array.from({ length: mode8 ? 8 : 4 }, (_, i) => {
        const a = (360 / (mode8 ? 8 : 4)) * i;
        const [x1, y1] = pt(a, R - 12), [x2, y2] = pt(a, R);
        return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke={BLUE} strokeWidth="3" />;
      })}
      {ray !== null && (
        <>
          <path d={`M ${cx} ${cy} L ${pt(0, 48)[0]} ${pt(0, 48)[1]} A 48 48 0 ${ray > 180 ? 1 : 0} 1 ${pt(ray, 48)[0]} ${pt(ray, 48)[1]} Z`} fill="#fed7aa" opacity="0.9" />
          <line x1={cx} y1={cy} x2={pt(ray, R)[0]} y2={pt(ray, R)[1]} stroke={ORANGE} strokeWidth="4" strokeLinecap="round" />
          <circle cx={pt(ray, R)[0]} cy={pt(ray, R)[1]} r="6" fill={ORANGE} />
          <text x={pt(ray / 2, 66)[0]} y={pt(ray / 2, 66)[1] + 5} fontSize="16" fontWeight="700" fill={ORANGE} textAnchor="middle">{ray}°</text>
          {s(p, "rayLabel") && <text x={pt(ray, R + 26)[0]} y={pt(ray, R + 26)[1] + 4} fontSize="13" fontWeight="700" fill={ORANGE} textAnchor="middle">{s(p, "rayLabel")}</text>}
        </>
      )}
      {cardinal.map((d, i) => {
        const [x, y] = pt(DIR_ANGLE[d], R + 30);
        const on = hi.includes(d);
        return (
          <g key={d}>
            <text x={x} y={y + 5} fontSize={on ? 22 : 19} fontWeight="800" fill={on ? ORANGE : BLUE} textAnchor="middle">{DIR_TH[d]}</text>
            {st && <text x={x} y={y + 24} fontSize="13" fontWeight="700" fill="#475569" textAnchor="middle">{st[i]}</text>}
          </g>
        );
      })}
      {mode8 && Object.entries(DIR_TH2).map(([d, [l1, l2]]) => {
        const [x, y] = pt(DIR_ANGLE[d], R + 44);
        const on = hi.includes(d);
        return (
          <g key={d} fill={on ? ORANGE : "#0f766e"} fontWeight="700" fontSize="12" textAnchor="middle">
            <text x={x} y={y - 2}>{l1}</text>
            <text x={x} y={y + 12}>{l2}</text>
          </g>
        );
      })}
      {mode8 && Object.keys(DIR_TH2).map((d) => {
        const [x, y] = pt(DIR_ANGLE[d], R);
        return <circle key={d} cx={x} cy={y} r="5" fill={hi.includes(d) ? ORANGE : "#0f766e"} />;
      })}
      {fa !== undefined && (
        <g>
          <line x1={cx} y1={cy} x2={pt(fa, 64)[0]} y2={pt(fa, 64)[1]} stroke="#16a34a" strokeWidth="5" strokeLinecap="round" />
          <polygon points={`${pt(fa, 82).join(",")} ${pt(fa - 9, 60).join(",")} ${pt(fa + 9, 60).join(",")}`} fill="#16a34a" />
          <circle cx={cx} cy={cy} r="13" fill="#facc15" stroke={INK} strokeWidth="2" />
          <text x={pt(fa, 96)[0]} y={pt(fa, 96)[1] + 4} fontSize="12" fontWeight="800" fill="#15803d" textAnchor="middle">หน้า</text>
          <text x={pt(fa + 180, 40)[0]} y={pt(fa + 180, 40)[1] + 4} fontSize="12" fontWeight="800" fill="#475569" textAnchor="middle">หลัง</text>
          <text x={pt(fa - 90, 40)[0]} y={pt(fa - 90, 40)[1] + 4} fontSize="12" fontWeight="800" fill="#7c3aed" textAnchor="middle">ซ้ายมือ</text>
          <text x={pt(fa + 90, 40)[0]} y={pt(fa + 90, 40)[1] + 4} fontSize="12" fontWeight="800" fill="#be185d" textAnchor="middle">ขวามือ</text>
        </g>
      )}
      {fa === undefined && <circle cx={cx} cy={cy} r="6" fill={BLUE} />}
    </Frame>
  );
}

// ---------- ทรงกลมฟ้า ----------
function SkyDome({ p }: { p: P }) {
  const h = s(p, "highlight", "all");
  const on = (k: string) => h === "all" || h === k;
  const strong = (k: string) => h === k;
  return (
    <Frame vb="0 0 420 320" label={s(p, "caption", "ทรงกลมฟ้าและผู้สังเกต")}>
      <path d="M 30 210 A 180 170 0 0 1 390 210 Z" fill="#dbeafe" />
      <ellipse cx="210" cy="210" rx="180" ry="42" fill={on("horizon") ? "#bbf7d0" : "#d1fae5"} stroke={strong("horizon") ? ORANGE : "#16a34a"} strokeWidth={strong("horizon") ? 5 : 3} />
      <rect x="30" y="210" width="360" height="40" fill="#a7f3d0" opacity="0.5" />
      <ellipse cx="210" cy="210" rx="36" ry="170" fill="none" stroke={strong("meridian") ? ORANGE : "#7c3aed"} strokeWidth={strong("meridian") ? 5 : 2.5} strokeDasharray="8 6" opacity={on("meridian") ? 1 : 0.35} />
      <line x1="210" y1="40" x2="210" y2="290" stroke="#94a3b8" strokeWidth="2" strokeDasharray="4 4" />
      {/* ผู้สังเกต */}
      <circle cx="210" cy="190" r="10" fill="#fcd34d" stroke={INK} strokeWidth="2" />
      <line x1="210" y1="200" x2="210" y2="226" stroke={INK} strokeWidth="4" strokeLinecap="round" />
      <line x1="210" y1="208" x2="196" y2="220" stroke={INK} strokeWidth="3" strokeLinecap="round" />
      <line x1="210" y1="208" x2="224" y2="220" stroke={INK} strokeWidth="3" strokeLinecap="round" />
      {/* จุดสำคัญ */}
      <circle cx="210" cy="40" r={strong("zenith") ? 10 : 7} fill={strong("zenith") ? ORANGE : "#dc2626"} />
      <text x="224" y="38" fontSize={strong("zenith") ? 19 : 16} fontWeight="800" fill={strong("zenith") ? ORANGE : "#b91c1c"}>จุดเหนือศีรษะ (สูงสุด)</text>
      <circle cx="210" cy="290" r={strong("nadir") ? 10 : 7} fill={strong("nadir") ? ORANGE : "#475569"} />
      <text x="224" y="296" fontSize={strong("nadir") ? 19 : 16} fontWeight="800" fill={strong("nadir") ? ORANGE : "#334155"}>จุดใต้เท้า (ต่ำสุด)</text>
      <text x="210" y="168" fontSize="13" fontWeight="800" fill="#475569" textAnchor="middle">เหนือ</text>
      <text x="210" y="272" fontSize="13" fontWeight="800" fill="#475569" textAnchor="middle">ใต้</text>
      <text x="395" y="214" fontSize="14" fontWeight="800" fill="#0f766e" textAnchor="end">ตะวันออก</text>
      <text x="25" y="214" fontSize="14" fontWeight="800" fill="#0f766e">ตะวันตก</text>
      <text x="48" y="150" fontSize="13" fontWeight="700" fill={strong("horizon") ? ORANGE : "#15803d"}>เส้นขอบฟ้า</text>
      <text x="318" y="110" fontSize="13" fontWeight="700" fill={strong("meridian") ? ORANGE : "#6d28d9"}>เส้นเมริเดียน</text>
    </Frame>
  );
}

// ---------- เขตเวลา ----------
function TimeZones({ p }: { p: P }) {
  const marks = arr(p, "marks").filter(Array.isArray).map((m) => m as unknown[]).filter((m) => typeof m[0] === "number" && typeof m[1] === "string") as [number, string][];
  const x0 = 14, w = 28, y0 = 68, hh = 46;
  return (
    <Frame vb="0 0 700 230" label={s(p, "caption", "เขตเวลา 24 เขตของโลก")}>
      {Array.from({ length: 24 }, (_, i) => {
        const marked = marks.some((m) => Math.round(m[0] / 15) % 24 === i);
        return (
          <g key={i}>
            <rect x={x0 + i * w} y={y0} width={w} height={hh} fill={marked ? "#fdba74" : i % 2 ? "#bae6fd" : "#e0f2fe"} stroke="#0369a1" strokeWidth="1" />
            <text x={x0 + i * w + w / 2} y={y0 + 28} fontSize="12" fontWeight="800" fill={INK} textAnchor="middle">+{i}</text>
            {i % 3 === 0 && <text x={x0 + i * w + w / 2} y={y0 + hh + 18} fontSize="11" fontWeight="700" fill="#475569" textAnchor="middle">{i * 15}°</text>}
          </g>
        );
      })}
      <text x="14" y="34" fontSize="16" fontWeight="800" fill={BLUE}>1 เขตกว้าง 15° เวลาต่างกัน 1 ชั่วโมง (+ชม. จากเวลากรีนิช)</text>
      <text x="14" y="54" fontSize="12" fontWeight="700" fill="#475569">ลองจิจูด ตะวันออก →</text>
      {marks.map((m, i) => {
        const idx = Math.round(m[0] / 15) % 24;
        const x = x0 + idx * w + w / 2;
        const y = 170 + (i % 2) * 22;
        return (
          <g key={i}>
            <line x1={x} y1={y0 + hh} x2={x} y2={y - 14} stroke={ORANGE} strokeWidth="2" />
            <text x={Math.min(Math.max(x, 60), 640)} y={y + 2} fontSize="14" fontWeight="800" fill={ORANGE} textAnchor="middle">{m[1]}</text>
          </g>
        );
      })}
      <text x="686" y="222" fontSize="12" fontWeight="700" fill="#475569" textAnchor="end">ไปทางตะวันออก เวลาเร็วขึ้น →</text>
    </Frame>
  );
}

// ---------- โลกหมุน/โคจร ----------
function Earth({ p }: { p: P }) {
  const mode = s(p, "mode", "rotation");
  if (mode === "orbit") {
    return (
      <Frame vb="0 0 420 270" label={s(p, "caption", "โลกโคจรรอบดวงอาทิตย์")}>
        <ellipse cx="210" cy="125" rx="160" ry="85" fill="none" stroke="#94a3b8" strokeWidth="2.5" strokeDasharray="7 6" />
        <circle cx="210" cy="125" r="34" fill="#facc15" stroke="#f59e0b" strokeWidth="4" />
        <text x="210" y="130" fontSize="13" fontWeight="800" fill={INK} textAnchor="middle">ดวงอาทิตย์</text>
        <circle cx="370" cy="125" r="17" fill="#38bdf8" stroke="#0369a1" strokeWidth="2.5" />
        <path d="M 360 108 Q 352 100 340 104" fill="none" stroke={ORANGE} strokeWidth="2.5" markerEnd="url(#ar)" />
        <text x="370" y="158" fontSize="12" fontWeight="800" fill={BLUE} textAnchor="middle">โลก</text>
        <defs><marker id="ar" markerWidth="8" markerHeight="8" refX="4" refY="4" orient="auto"><path d="M0,0 L8,4 L0,8 Z" fill={ORANGE} /></marker></defs>
        <text x="210" y="238" fontSize="14" fontWeight="800" fill={INK} textAnchor="middle">โลกโคจรรอบดวงอาทิตย์ 1 รอบ = 365 วัน = 1 ปี</text>
        <text x="210" y="258" fontSize="13" fontWeight="700" fill="#475569" textAnchor="middle">โลกหมุนรอบตัวเอง 1 รอบ = 24 ชั่วโมง = 1 วัน</text>
      </Frame>
    );
  }
  return (
    <Frame vb="0 0 420 290" label={s(p, "caption", "โลกหมุนรอบตัวเองทำให้เกิดกลางวันกลางคืน")}>
      <defs>
        <clipPath id="earthclip"><circle cx="270" cy="130" r="78" /></clipPath>
        <marker id="ar2" markerWidth="8" markerHeight="8" refX="4" refY="4" orient="auto"><path d="M0,0 L8,4 L0,8 Z" fill={ORANGE} /></marker>
      </defs>
      <circle cx="56" cy="130" r="34" fill="#facc15" stroke="#f59e0b" strokeWidth="4" />
      {[-40, -20, 0, 20, 40].map((dy) => <line key={dy} x1="100" y1={130 + dy} x2="180" y2={130 + dy * 1.1} stroke="#f59e0b" strokeWidth="3" strokeDasharray="6 6" />)}
      <circle cx="270" cy="130" r="78" fill="#1e293b" />
      <rect x="192" y="52" width="78" height="156" fill="#7dd3fc" clipPath="url(#earthclip)" />
      <circle cx="270" cy="130" r="78" fill="none" stroke="#0369a1" strokeWidth="3" />
      <text x="228" y="134" fontSize="15" fontWeight="800" fill={INK} textAnchor="middle">กลางวัน</text>
      <text x="312" y="134" fontSize="15" fontWeight="800" fill="#e2e8f0" textAnchor="middle">กลางคืน</text>
      <path d="M 330 36 Q 270 6 210 36" fill="none" stroke={ORANGE} strokeWidth="4" markerEnd="url(#ar2)" />
      <text x="270" y="20" fontSize="12" fontWeight="800" fill={ORANGE} textAnchor="middle">โลกหมุนทวนเข็มนาฬิกา (ตะวันตก → ตะวันออก)</text>
      <text x="56" y="184" fontSize="13" fontWeight="800" fill={INK} textAnchor="middle">ดวงอาทิตย์</text>
      <text x="210" y="256" fontSize="14" fontWeight="800" fill={INK} textAnchor="middle">ด้านที่หันหาดวงอาทิตย์เป็นกลางวัน ด้านตรงข้ามเป็นกลางคืน</text>
      <text x="210" y="276" fontSize="12" fontWeight="700" fill="#475569" textAnchor="middle">(มองจากด้านบนของขั้วโลกเหนือ)</text>
    </Frame>
  );
}

// ---------- ระบบสุริยะ ----------
const PLANETS: { n: string; r: number; c: string }[] = [
  { n: "พุธ", r: 6, c: "#a8a29e" }, { n: "ศุกร์", r: 10, c: "#fcd34d" }, { n: "โลก", r: 11, c: "#38bdf8" }, { n: "อังคาร", r: 8, c: "#f87171" },
  { n: "พฤหัสบดี", r: 24, c: "#fdba74" }, { n: "เสาร์", r: 20, c: "#fde68a" }, { n: "ยูเรนัส", r: 15, c: "#67e8f9" }, { n: "เนปจูน", r: 15, c: "#818cf8" },
];
function Solar({ p }: { p: P }) {
  const hi = nums(arr(p, "highlight"));
  const eye = b(p, "eye");
  const naked = [0, 1, 3, 4, 5];
  return (
    <Frame vb="0 0 780 190" label={s(p, "caption", "ดาวเคราะห์เรียงตามระยะจากดวงอาทิตย์")}>
      <rect x="0" y="0" width="780" height="190" rx="14" fill="#0f172a" />
      <circle cx="-10" cy="82" r="58" fill="#facc15" />
      <text x="20" y="30" fontSize="12" fontWeight="800" fill="#fde68a">ดวงอาทิตย์</text>
      {PLANETS.map((pl, i) => {
        const x = 100 + i * 86;
        const on = hi.includes(i);
        return (
          <g key={pl.n}>
            {on && <circle cx={x} cy="84" r={pl.r + 9} fill="none" stroke="#fb923c" strokeWidth="3" />}
            <circle cx={x} cy="84" r={pl.r} fill={pl.c} />
            {pl.n === "เสาร์" && <ellipse cx={x} cy="84" rx={pl.r + 12} ry="5" fill="none" stroke="#fef3c7" strokeWidth="2.5" />}
            <text x={x} y="140" fontSize="13" fontWeight="800" fill={on ? "#fdba74" : "#e2e8f0"} textAnchor="middle">{pl.n}</text>
            <text x={x} y="157" fontSize="10" fontWeight="700" fill="#94a3b8" textAnchor="middle">{i + 1}</text>
            {eye && naked.includes(i) && <text x={x} y="40" fontSize="16" textAnchor="middle">👁</text>}
          </g>
        );
      })}
      {eye && <text x="390" y="182" fontSize="11" fontWeight="700" fill="#cbd5e1" textAnchor="middle">👁 = เห็นได้ด้วยตาเปล่า</text>}
    </Frame>
  );
}

// ---------- กลุ่มดาว ----------
function Stars({ p }: { p: P }) {
  const pts = arr(p, "points").filter(Array.isArray).map((q) => q as unknown[]).filter((q) => typeof q[0] === "number" && typeof q[1] === "number");
  const lines = arr(p, "lines").filter(Array.isArray).map((l) => nums(l as unknown[]));
  const dashed = arr(p, "dashed").filter(Array.isArray).map((l) => nums(l as unknown[]));
  const hi = nums(arr(p, "hi"));
  const X = (v: unknown) => f((v as number) * 4), Y = (v: unknown) => f((v as number) * 3.6);
  return (
    <Frame vb="0 0 400 320" label={s(p, "caption", "แผนภาพจำลองกลุ่มดาว")}>
      <rect x="0" y="0" width="400" height="320" rx="14" fill="#0f172a" />
      {lines.map((l, i) => l.length >= 2 && pts[l[0]] && pts[l[1]] && <line key={i} x1={X(pts[l[0]][0])} y1={Y(pts[l[0]][1])} x2={X(pts[l[1]][0])} y2={Y(pts[l[1]][1])} stroke="#93c5fd" strokeWidth="2" />)}
      {dashed.map((l, i) => l.length >= 2 && pts[l[0]] && pts[l[1]] && <line key={i} x1={X(pts[l[0]][0])} y1={Y(pts[l[0]][1])} x2={X(pts[l[1]][0])} y2={Y(pts[l[1]][1])} stroke="#fbbf24" strokeWidth="2.5" strokeDasharray="6 5" />)}
      {pts.map((q, i) => {
        const on = hi.includes(i);
        return (
          <g key={i}>
            {on && <circle cx={X(q[0])} cy={Y(q[1])} r="13" fill="none" stroke="#fbbf24" strokeWidth="2.5" />}
            <circle cx={X(q[0])} cy={Y(q[1])} r={on ? 7 : typeof q[3] === "number" ? Math.min(Math.max(q[3] as number, 2), 9) : 4.5} fill={on ? "#fde047" : "#f8fafc"} />
            {typeof q[2] === "string" && q[2] && <text x={f((q[0] as number) * 4 + 10)} y={f((q[1] as number) * 3.6 - 8)} fontSize="12" fontWeight="700" fill={on ? "#fde047" : "#cbd5e1"}>{q[2] as string}</text>}
          </g>
        );
      })}
      {s(p, "caption") && <text x="200" y="308" fontSize="13" fontWeight="800" fill="#e2e8f0" textAnchor="middle">{s(p, "caption")}</text>}
    </Frame>
  );
}

// ---------- มุม ----------
function Angle({ p }: { p: P }) {
  const deg = Math.min(Math.max(n(p, "deg", 60), 1), 359);
  const vx = 80, vy = 130, L = 150;
  const e1 = [vx + L, vy];
  const e2 = [f(vx + L * Math.cos(rad(deg))), f(vy - L * Math.sin(rad(deg)))];
  const r = 44;
  const a1 = [vx + r, vy], a2 = [f(vx + r * Math.cos(rad(deg))), f(vy - r * Math.sin(rad(deg)))];
  const kind = deg < 90 ? "มุมแหลม" : deg === 90 ? "มุมฉาก" : deg < 180 ? "มุมป้าน" : deg === 180 ? "มุมตรง" : "";
  const mid = rad(deg / 2);
  return (
    <Frame vb="0 0 300 260" label={s(p, "caption", `มุม ${deg} องศา`)}>
      {deg === 90 ? <path d={`M ${vx + 22} ${vy} L ${vx + 22} ${vy - 22} L ${vx} ${vy - 22}`} fill="none" stroke={ORANGE} strokeWidth="3" /> : <path d={`M ${a1[0]} ${a1[1]} A ${r} ${r} 0 ${deg > 180 ? 1 : 0} 0 ${a2[0]} ${a2[1]}`} fill="none" stroke={ORANGE} strokeWidth="4" />}
      <line x1={vx} y1={vy} x2={e1[0]} y2={e1[1]} stroke={BLUE} strokeWidth="5" strokeLinecap="round" />
      <line x1={vx} y1={vy} x2={e2[0]} y2={e2[1]} stroke={BLUE} strokeWidth="5" strokeLinecap="round" />
      <circle cx={vx} cy={vy} r="6" fill={INK} />
      <text x={f(vx + (r + 26) * Math.cos(mid))} y={f(vy - (r + 26) * Math.sin(mid) + 6)} fontSize="20" fontWeight="800" fill={ORANGE} textAnchor="middle">{deg}°</text>
      {(s(p, "label") || kind) && <text x="150" y="246" fontSize="17" fontWeight="800" fill={INK} textAnchor="middle">{s(p, "label") || kind}</text>}
    </Frame>
  );
}

// ---------- นาฬิกา ----------
function Clock({ p }: { p: P }) {
  const h = n(p, "h", 3), m = n(p, "m", 0);
  const ha = ((h % 12) + m / 60) * 30, ma = m * 6;
  const end = (a: number, r: number): [number, number] => [f(100 + r * Math.sin(rad(a))), f(100 - r * Math.cos(rad(a)))];
  return (
    <Frame vb="0 0 200 215" label={s(p, "caption", `นาฬิกาบอกเวลา ${h} นาฬิกา ${m} นาที`)}>
      <circle cx="100" cy="100" r="88" fill="#fff" stroke={BLUE} strokeWidth="6" />
      {Array.from({ length: 12 }, (_, i) => {
        const [x, y] = end((i + 1) * 30, 70);
        return <text key={i} x={x} y={y + 6} fontSize="17" fontWeight="800" fill={INK} textAnchor="middle">{i + 1}</text>;
      })}
      {Array.from({ length: 60 }, (_, i) => {
        const [x1, y1] = end(i * 6, i % 5 ? 83 : 80), [x2, y2] = end(i * 6, 88);
        return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke={BLUE} strokeWidth={i % 5 ? 1 : 2.5} />;
      })}
      <line x1="100" y1="100" x2={end(ha, 44)[0]} y2={end(ha, 44)[1]} stroke={INK} strokeWidth="7" strokeLinecap="round" />
      <line x1="100" y1="100" x2={end(ma, 66)[0]} y2={end(ma, 66)[1]} stroke={ORANGE} strokeWidth="4" strokeLinecap="round" />
      <circle cx="100" cy="100" r="6" fill={INK} />
      {b(p, "digital") && <text x="100" y="208" fontSize="16" fontWeight="800" fill={INK} textAnchor="middle">{String(h).padStart(2, "0")}.{String(m).padStart(2, "0")} น.</text>}
    </Frame>
  );
}

// ---------- เส้นจำนวน ----------
function NumLine({ p }: { p: P }) {
  const min = n(p, "min", 0), max = n(p, "max", 10);
  const step = Math.max(n(p, "step", 1), 0.000001);
  const marks = nums(arr(p, "marks"));
  const hops = arr(p, "hops").filter(Array.isArray).map((h) => nums(h as unknown[]));
  const span = max - min || 1;
  const X = (v: number) => f(30 + ((v - min) / span) * 640);
  const count = Math.min(Math.floor(span / step) + 1, 41);
  const ticks = Array.from({ length: count }, (_, i) => f(min + i * step));
  const labelEvery = count > 22 ? 2 : 1;
  return (
    <Frame vb="0 0 700 140" label={s(p, "caption", "เส้นจำนวน")}>
      <line x1="24" y1="92" x2="676" y2="92" stroke={BLUE} strokeWidth="4" strokeLinecap="round" />
      {ticks.map((t, i) => (
        <g key={i}>
          <line x1={X(t)} y1="82" x2={X(t)} y2="102" stroke={BLUE} strokeWidth="2.5" />
          {i % labelEvery === 0 && <text x={X(t)} y="124" fontSize="15" fontWeight="800" fill={INK} textAnchor="middle">{t}</text>}
        </g>
      ))}
      {hops.map((h, i) => h.length >= 2 && (
        <g key={i}>
          <path d={`M ${X(h[0])} 82 Q ${f((X(h[0]) + X(h[1])) / 2)} 20 ${X(h[1])} 82`} fill="none" stroke={ORANGE} strokeWidth="3" />
          <text x={f((X(h[0]) + X(h[1])) / 2)} y="34" fontSize="14" fontWeight="800" fill={ORANGE} textAnchor="middle">{h[1] >= h[0] ? "+" : "−"}{f(Math.abs(h[1] - h[0]))}</text>
        </g>
      ))}
      {marks.map((m, i) => <circle key={i} cx={X(m)} cy="92" r="9" fill={ORANGE} stroke="#fff" strokeWidth="2" />)}
    </Frame>
  );
}

// ---------- แผนภูมิแท่ง ----------
function Bars({ p }: { p: P }) {
  const labels = strs(arr(p, "labels")).slice(0, 8);
  const values = nums(arr(p, "values")).slice(0, 8);
  const cnt = Math.min(labels.length, values.length);
  const max = Math.max(...values.slice(0, cnt), 1);
  const top = Math.ceil(max / 5) * 5 || 5;
  const bw = Math.min(56, 320 / Math.max(cnt, 1));
  const gap = (340 - bw * cnt) / (cnt + 1);
  return (
    <Frame vb="0 0 420 260" label={s(p, "caption", "แผนภูมิแท่ง")}>
      {[0, 1, 2, 3, 4].map((i) => {
        const y = 200 - (i * 160) / 4;
        return (
          <g key={i}>
            <line x1="56" y1={y} x2="400" y2={y} stroke="#cbd5e1" strokeWidth="1" />
            <text x="48" y={y + 4} fontSize="11" fontWeight="700" fill="#475569" textAnchor="end">{f((top * i) / 4)}</text>
          </g>
        );
      })}
      {Array.from({ length: cnt }, (_, i) => {
        const x = 56 + gap * (i + 1) + bw * i;
        const h = (values[i] / top) * 160;
        return (
          <g key={i}>
            <rect x={x} y={200 - h} width={bw} height={h} rx="5" fill={["#38bdf8", "#fb923c", "#4ade80", "#f472b6", "#a78bfa", "#facc15", "#2dd4bf", "#f87171"][i % 8]} />
            <text x={x + bw / 2} y={194 - h} fontSize="14" fontWeight="800" fill={INK} textAnchor="middle">{values[i]}</text>
            <text x={x + bw / 2} y="222" fontSize="12" fontWeight="800" fill={INK} textAnchor="middle">{labels[i]}</text>
          </g>
        );
      })}
      {s(p, "unit") && <text x="56" y="250" fontSize="12" fontWeight="700" fill="#475569">หน่วย: {s(p, "unit")}</text>}
    </Frame>
  );
}


// ---------- สถานะของสาร (อนุภาค 3 สถานะ + ลูกศรการเปลี่ยนสถานะ) ----------
const CHANGES: Record<string, { th: string; from: number; to: number; side: "top" | "bottom" | "arc-top" | "arc-bottom" }> = {
  melting: { th: "การหลอมเหลว", from: 0, to: 1, side: "top" },
  freezing: { th: "การแข็งตัว", from: 1, to: 0, side: "bottom" },
  evaporation: { th: "การกลายเป็นไอ", from: 1, to: 2, side: "top" },
  condensation: { th: "การควบแน่น", from: 2, to: 1, side: "bottom" },
  sublimation: { th: "การระเหิด", from: 0, to: 2, side: "arc-top" },
  deposition: { th: "การระเหิดกลับ", from: 2, to: 0, side: "arc-bottom" },
};
function States({ p }: { p: P }) {
  const xs = [100, 260, 420];
  const showChanges = s(p, "mode") === "changes";
  const hi = s(p, "highlight");
  const solid = Array.from({ length: 16 }, (_, i) => [xs[0] - 36 + (i % 4) * 24, 205 - Math.floor(i / 4) * 24]);
  const liquid = [[-30, 208], [-6, 210], [20, 207], [42, 209], [-38, 186], [-14, 188], [10, 185], [34, 187], [-24, 164], [0, 166], [24, 163]].map(([dx, y]) => [xs[1] + dx, y]);
  const gas = [[-30, 120], [10, 112], [34, 140], [-14, 150], [26, 182], [-34, 190], [0, 214], [-6, 98]].map(([dx, y]) => [xs[2] + dx, y]);
  const sets = [solid, liquid, gas];
  const names = ["ของแข็ง", "ของเหลว", "แก๊ส"];
  const arrow = (key: string) => {
    const c = CHANGES[key];
    const on = hi === key || hi === "all";
    const col = on ? ORANGE : "#94a3b8";
    const x1 = xs[c.from] + (c.to > c.from ? 62 : -62), x2 = xs[c.to] + (c.to > c.from ? -62 : 62);
    if (c.side === "arc-top" || c.side === "arc-bottom") {
      const up = c.side === "arc-top";
      const y0 = up ? 78 : 262, yc = up ? 24 : 318;
      const a = xs[c.from], b = xs[c.to];
      return (
        <g key={key}>
          <path d={`M ${a} ${y0} Q ${(a + b) / 2} ${yc} ${b} ${y0}`} fill="none" stroke={col} strokeWidth={on ? 4 : 2.5} markerEnd={`url(#${on ? "stA" : "stG"})`} />
          <text x={(a + b) / 2} y={up ? 32 : 316} fontSize="13" fontWeight="800" fill={col} textAnchor="middle">{c.th}</text>
        </g>
      );
    }
    const y = c.side === "top" ? 150 : 190;
    return (
      <g key={key}>
        <line x1={x1} y1={y} x2={x2} y2={y} stroke={col} strokeWidth={on ? 4 : 2.5} markerEnd={`url(#${on ? "stA" : "stG"})`} />
        <text x={(x1 + x2) / 2} y={y + (c.side === "top" ? -8 : 20)} fontSize="12" fontWeight="800" fill={col} textAnchor="middle">{c.th}</text>
      </g>
    );
  };
  return (
    <Frame vb="0 0 520 340" label={s(p, "caption", "อนุภาคของสารในสถานะของแข็ง ของเหลว และแก๊ส")}>
      <defs>
        <marker id="stA" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto"><path d="M0,0 L8,4 L0,8 Z" fill={ORANGE} /></marker>
        <marker id="stG" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto"><path d="M0,0 L8,4 L0,8 Z" fill="#94a3b8" /></marker>
      </defs>
      {xs.map((x, i) => (
        <g key={i}>
          <rect x={x - 52} y="92" width="104" height="140" rx="10" fill="#f8fafc" stroke="#94a3b8" strokeWidth="2.5" />
          {sets[i].map((c, k) => <circle key={k} cx={c[0]} cy={c[1]} r="11" fill="#475569" stroke="#fff" strokeWidth="1.5" />)}
          <text x={x} y="258" fontSize="16" fontWeight="800" fill={INK} textAnchor="middle">{names[i]}</text>
        </g>
      ))}
      {showChanges && Object.keys(CHANGES).map(arrow)}
      {showChanges && <text x="260" y="336" fontSize="12" fontWeight="700" fill="#475569" textAnchor="middle">ซ้าย → ขวา: ดูดความร้อน (อุณหภูมิสูงขึ้น) · ขวา → ซ้าย: คายความร้อน</text>}
    </Frame>
  );
}

// ---------- แผนผังต้นไม้ (จำแนกสาร) ----------
function Tree({ p }: { p: P }) {
  const raw = arr(p, "nodes").filter(Array.isArray).map((q) => q as unknown[]).filter((q) => typeof q[0] === "string" && typeof q[1] === "string").slice(0, 16) as [string, string, string?][];
  const ids = new Set(raw.map((r) => r[0]));
  const kids = (id: string) => raw.filter((r) => r[2] === id);
  const roots = raw.filter((r) => !r[2] || !ids.has(r[2]));
  const pos = new Map<string, { x: number; y: number }>();
  let leaf = 0;
  const place = (id: string, depth: number): number => {
    const ch = kids(id);
    let x: number;
    if (ch.length === 0) x = 70 + 130 * leaf++;
    else { const xs = ch.map((c) => place(c[0], depth + 1)); x = (Math.min(...xs) + Math.max(...xs)) / 2; }
    pos.set(id, { x, y: 40 + depth * 78 });
    return x;
  };
  roots.forEach((r) => place(r[0], 0));
  const W = Math.max(leaf, 1) * 130 + 10;
  const maxY = Math.max(...[...pos.values()].map((v) => v.y), 40) + 50;
  const hi = strs(arr(p, "highlight"));
  return (
    <Frame vb={`0 0 ${W} ${maxY}`} label={s(p, "caption", "แผนผังจำแนกสาร")}>
      {raw.map((r) => {
        const a = pos.get(r[0]), b = r[2] ? pos.get(r[2]) : undefined;
        return a && b ? <path key={"l" + r[0]} d={`M ${b.x} ${b.y + 18} C ${b.x} ${b.y + 40} ${a.x} ${a.y - 40} ${a.x} ${a.y - 18}`} fill="none" stroke="#94a3b8" strokeWidth="2.5" /> : null;
      })}
      {raw.map((r) => {
        const a = pos.get(r[0]);
        if (!a) return null;
        const on = hi.includes(r[0]);
        return (
          <g key={r[0]}>
            <rect x={a.x - 58} y={a.y - 18} width="116" height="36" rx="10" fill={on ? "#fed7aa" : "#fff"} stroke={on ? ORANGE : BLUE} strokeWidth="2.5" />
            <text x={a.x} y={a.y + 5} fontSize={r[1].length > 12 ? 11.5 : 14} fontWeight="800" fill={INK} textAnchor="middle">{r[1]}</text>
          </g>
        );
      })}
    </Frame>
  );
}

// ---------- ตารางเปรียบเทียบ ----------
function DataTable({ p }: { p: P }) {
  const head = strs(arr(p, "headers")).slice(0, 5);
  const rows = arr(p, "rows").filter(Array.isArray).map((r) => strs(r as unknown[]).slice(0, 5)).slice(0, 10);
  return (
    <div className="overflow-x-auto rounded-2xl bg-sky-50 p-2">
      <table className="mx-auto w-full max-w-xl border-collapse text-sm" aria-label={s(p, "caption", "ตารางเปรียบเทียบ")}>
        {head.length > 0 && <thead><tr>{head.map((h, i) => <th key={i} className="border border-sky-200 bg-sky-100 px-2 py-1.5 text-center font-extrabold text-sky-900">{h}</th>)}</tr></thead>}
        <tbody>{rows.map((r, i) => <tr key={i}>{r.map((c, j) => <td key={j} className={"border border-sky-200 bg-white px-2 py-1.5 align-top " + (j === 0 ? "font-bold text-amber-950" : "text-gray-800")}>{c}</td>)}</tr>)}</tbody>
      </table>
      {s(p, "caption") && <p className="mt-1 text-center text-xs font-bold text-gray-600">{s(p, "caption")}</p>}
    </div>
  );
}

export function Diagram({ kind, params }: { kind: string; params: Record<string, unknown> }) {
  switch (kind as DiagramKind) {
    case "compass": return <Compass p={params} />;
    case "skydome": return <SkyDome p={params} />;
    case "timezone": return <TimeZones p={params} />;
    case "earth": return <Earth p={params} />;
    case "solar": return <Solar p={params} />;
    case "stars": return <Stars p={params} />;
    case "angle": return <Angle p={params} />;
    case "clock": return <Clock p={params} />;
    case "numline": return <NumLine p={params} />;
    case "bars": return <Bars p={params} />;
    case "states": return <States p={params} />;
    case "tree": return <Tree p={params} />;
    case "table": return <DataTable p={params} />;
    case "apparatus": return <Apparatus p={params} />;
    case "objects": return <Objects p={params} />;
    default: return null;
  }
}
