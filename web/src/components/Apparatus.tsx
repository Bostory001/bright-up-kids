// อุปกรณ์แยกสาร + ไอคอนวัตถุ วาดด้วย SVG (ไม่ใช้ไฟล์รูป) — ใช้ผ่าน Diagram kind "apparatus" และ "objects"
type P = Record<string, unknown>;
const s = (p: P, k: string, d = "") => (typeof p[k] === "string" ? (p[k] as string) : d);
const arr = (p: P, k: string): unknown[] => (Array.isArray(p[k]) ? (p[k] as unknown[]) : []);
const INK = "#78350f";
const WATER = "#7dd3fc";
const MUD = "#a16207";
const GLASS = "#f1f5f9";
const STROKE = "#64748b";

function Frame({ vb, label, children }: { vb: string; label: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl bg-sky-50 p-2">
      <svg viewBox={vb} role="img" aria-label={label} className="mx-auto block h-auto w-full max-w-xl" fontFamily="inherit">
        {children}
      </svg>
    </div>
  );
}

function Label({ x, y, t, anchor = "middle", color = INK }: { x: number; y: number; t: string; anchor?: "start" | "middle" | "end"; color?: string }) {
  return <text x={x} y={y} fontSize="13" fontWeight="800" fill={color} textAnchor={anchor}>{t}</text>;
}
function Pointer({ x1, y1, x2, y2 }: { x1: number; y1: number; x2: number; y2: number }) {
  return <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="#94a3b8" strokeWidth="1.5" strokeDasharray="4 3" />;
}

// ---------- ชุดกรอง ----------
function Filter() {
  return (
    <>
      <g transform="translate(40 40) rotate(-28 70 40)">
        <path d="M 20 0 L 120 0 L 112 80 Q 70 92 28 80 Z" fill={GLASS} stroke={STROKE} strokeWidth="2.5" />
        <path d="M 24 30 L 116 30 L 112 80 Q 70 92 28 80 Z" fill={MUD} opacity="0.75" />
      </g>
      <path d="M 148 90 Q 190 100 232 124" stroke={MUD} strokeWidth="6" fill="none" strokeLinecap="round" opacity="0.8" />
      <polygon points="190,118 350,118 288,210 252,210" fill={GLASS} stroke={STROKE} strokeWidth="2.5" />
      <polygon points="205,124 335,124 284,200 256,200" fill="#fef9c3" stroke="#ca8a04" strokeWidth="1.5" />
      <ellipse cx="270" cy="193" rx="14" ry="6" fill={MUD} />
      {[[258, 188], [268, 190], [279, 188], [263, 194], [274, 195]].map((c, i) => <circle key={i} cx={c[0]} cy={c[1]} r="3.5" fill="#713f12" />)}
      <rect x="264" y="210" width="12" height="30" fill={GLASS} stroke={STROKE} strokeWidth="2" />
      <circle cx="270" cy="250" r="4" fill={WATER} />
      <circle cx="270" cy="266" r="3.5" fill={WATER} />
      <path d="M 215 250 L 225 325 L 315 325 L 325 250" fill={GLASS} stroke={STROKE} strokeWidth="2.5" />
      <path d="M 220 290 L 225 325 L 315 325 L 320 290 Z" fill={WATER} opacity="0.85" />
      <Label x={100} y={24} t="ของผสม (น้ำโคลน)" />
      <Label x={470} y={140} t="กระดาษกรอง" anchor="end" />
      <Pointer x1={340} y1={134} x2={400} y2={134} />
      <Label x={470} y={198} t="กากที่ติดบนกระดาษ" anchor="end" />
      <Pointer x1={290} y1={194} x2={340} y2={194} />
      <Label x={470} y={306} t="น้ำใสที่กรองได้" anchor="end" />
      <Pointer x1={320} y1={302} x2={365} y2={302} />
    </>
  );
}

// ---------- กรวยแยก ----------
function Funnel() {
  return (
    <>
      <defs>
        <clipPath id="fn-clip"><path d="M 215 90 L 305 90 L 280 215 L 240 215 Z" /></clipPath>
      </defs>
      <rect x="248" y="42" width="24" height="26" rx="4" fill="#94a3b8" />
      <rect x="252" y="66" width="16" height="22" fill={GLASS} stroke={STROKE} strokeWidth="2" />
      <g clipPath="url(#fn-clip)">
        <rect x="200" y="85" width="120" height="70" fill="#fde047" />
        <rect x="200" y="155" width="120" height="70" fill={WATER} />
      </g>
      <path d="M 215 90 L 305 90 L 280 215 L 240 215 Z" fill="none" stroke={STROKE} strokeWidth="2.5" />
      <rect x="252" y="215" width="16" height="22" fill={GLASS} stroke={STROKE} strokeWidth="2" />
      <rect x="236" y="226" width="48" height="8" rx="4" fill="#ef4444" />
      <circle cx="260" cy="248" r="3.5" fill={WATER} />
      <path d="M 220 252 L 228 322 L 292 322 L 300 252" fill={GLASS} stroke={STROKE} strokeWidth="2.5" />
      <path d="M 223 292 L 228 322 L 292 322 L 297 292 Z" fill={WATER} opacity="0.9" />
      <Label x={338} y={118} t="ชั้นน้ำมัน (เบากว่า อยู่บน)" anchor="start" />
      <Pointer x1={292} y1={120} x2={332} y2={114} />
      <Label x={338} y={190} t="ชั้นน้ำ (หนักกว่า อยู่ล่าง)" anchor="start" />
      <Pointer x1={276} y1={188} x2={332} y2={186} />
      <Label x={338} y={246} t="ก๊อกเปิด-ปิด" anchor="start" />
      <Pointer x1={286} y1={231} x2={332} y2={242} />
      <Label x={338} y={306} t="รองรับของเหลวชั้นล่าง" anchor="start" />
      <Pointer x1={300} y1={304} x2={332} y2={302} />
      <Label x={110} y={150} t="ผสมกันไม่ได้" />
      <Label x={110} y={170} t="จึงแยกเป็น 2 ชั้น" />
    </>
  );
}

// ---------- การกลั่น ----------
function Distill() {
  return (
    <>
      <circle cx="105" cy="222" r="52" fill={GLASS} stroke={STROKE} strokeWidth="2.5" />
      <path d="M 56 230 A 52 52 0 0 0 154 230 Z" fill={WATER} opacity="0.85" />
      <rect x="95" y="140" width="20" height="36" fill={GLASS} stroke={STROKE} strokeWidth="2" />
      <path d="M 105 140 L 105 108 L 205 108" fill="none" stroke={STROKE} strokeWidth="14" strokeLinecap="round" opacity="0.35" />
      <g transform="translate(195 100) rotate(18)">
        <rect x="0" y="0" width="190" height="40" rx="8" fill="#e0f2fe" stroke="#38bdf8" strokeWidth="2.5" />
        <rect x="0" y="14" width="190" height="12" fill={GLASS} stroke={STROKE} strokeWidth="1.5" />
        {[20, 55, 90, 125, 160].map((x) => <path key={x} d={`M ${x} 5 q 6 4 12 0`} stroke="#0ea5e9" strokeWidth="1.5" fill="none" />)}
      </g>
      <path d="M 385 172 L 395 250" stroke={WATER} strokeWidth="3" strokeDasharray="4 5" />
      <path d="M 360 255 L 366 322 L 428 322 L 434 255" fill={GLASS} stroke={STROKE} strokeWidth="2.5" />
      <path d="M 363 296 L 366 322 L 428 322 L 431 296 Z" fill="#bae6fd" />
      <path d="M 82 292 q 10 -34 20 -4 q 10 -30 22 4 q -6 14 -22 14 q -16 0 -20 -14 z" fill="#f97316" />
      <rect x="62" y="300" width="86" height="8" rx="4" fill="#475569" />
      {[0, 1, 2].map((i) => <path key={i} d={`M ${130 + i * 22} ${104 - i * 4} q 6 -10 0 -18`} stroke="#94a3b8" strokeWidth="2.5" fill="none" strokeLinecap="round" />)}
      <Label x={105} y={338} t="น้ำทะเล (ต้มจนเดือด)" />
      <Label x={150} y={78} t="ไอน้ำลอยขึ้น" anchor="start" />
      <Label x={372} y={110} t="เครื่องควบแน่น (น้ำเย็นไหลผ่าน)" anchor="middle" />
      <Label x={398} y={338} t="น้ำจืดที่ได้ (น้ำกลั่น)" anchor="middle" />
    </>
  );
}

// ---------- ระเหยแห้ง ----------
function Evap() {
  return (
    <>
      <path d="M 150 200 Q 260 280 370 200 Z" fill={GLASS} stroke={STROKE} strokeWidth="2.5" />
      <path d="M 170 204 Q 260 262 350 204 Z" fill={WATER} opacity="0.85" />
      <line x1="170" y1="236" x2="140" y2="320" stroke="#475569" strokeWidth="5" />
      <line x1="350" y1="236" x2="380" y2="320" stroke="#475569" strokeWidth="5" />
      <line x1="260" y1="262" x2="260" y2="320" stroke="#475569" strokeWidth="5" />
      <path d="M 232 322 q 8 -34 18 -6 q 10 -34 22 6 q -4 12 -20 12 q -16 0 -20 -12 z" fill="#f97316" />
      {[0, 1, 2, 3].map((i) => <path key={i} d={`M ${205 + i * 38} 182 q 8 -14 0 -28 q -8 -14 0 -28`} stroke="#94a3b8" strokeWidth="3" fill="none" strokeLinecap="round" />)}
      <path d="M 430 200 Q 470 232 510 200 Z" fill={GLASS} stroke={STROKE} strokeWidth="2" />
      {[[445, 205], [458, 208], [470, 205], [482, 208], [494, 205], [452, 201], [476, 201]].map((c, i) => <rect key={i} x={c[0]} y={c[1]} width="6" height="6" fill="#fff" stroke="#94a3b8" />)}
      <Label x={260} y={110} t="น้ำระเหยเป็นไอน้ำ" />
      <Label x={105} y={262} t="น้ำเกลือ (ให้ความร้อน)" color="#475569" />
      <Pointer x1={160} y1={256} x2={196} y2={234} />
      <Label x={470} y={238} t="เหลือผลึกเกลือ" />
      <path d="M 392 220 L 420 220" stroke="#ea580c" strokeWidth="3" markerEnd="url(#ev-a)" />
      <defs><marker id="ev-a" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto"><path d="M0,0 L8,4 L0,8 Z" fill="#ea580c" /></marker></defs>
    </>
  );
}

// ---------- แม่เหล็กดูด ----------
function Magnet() {
  return (
    <>
      <ellipse cx="260" cy="280" rx="160" ry="34" fill="#fde68a" stroke="#d97706" strokeWidth="2.5" />
      {Array.from({ length: 26 }, (_, i) => <circle key={i} cx={130 + ((i * 53) % 260)} cy={270 + ((i * 17) % 20)} r="4" fill="#d6b266" />)}
      <path d="M 210 60 L 210 140 Q 210 170 235 170 Q 260 170 260 140 L 260 60 Z" fill="#e2e8f0" opacity="0" />
      <path d="M 218 60 L 218 130 A 42 42 0 0 0 302 130 L 302 60" fill="none" stroke="#dc2626" strokeWidth="20" strokeLinecap="butt" />
      <path d="M 260 100 A 42 42 0 0 0 302 130 L 302 60" fill="none" stroke="#2563eb" strokeWidth="20" />
      <rect x="208" y="52" width="20" height="14" fill="#e2e8f0" />
      <rect x="292" y="52" width="20" height="14" fill="#e2e8f0" />
      {[[240, 196], [256, 206], [272, 192], [284, 210], [248, 220], [266, 224]].map((c, i) => <circle key={i} cx={c[0]} cy={c[1]} r="4.5" fill="#1e293b" />)}
      {[[236, 252], [292, 250], [262, 246]].map((c, i) => <path key={i} d={`M ${c[0]} ${c[1]} L ${c[0]} ${c[1] - 20}`} stroke="#94a3b8" strokeWidth="2" markerEnd="url(#mg-a)" />)}
      <defs><marker id="mg-a" markerWidth="6" markerHeight="6" refX="3" refY="3" orient="auto"><path d="M0,6 L3,0 L6,6 Z" fill="#94a3b8" /></marker></defs>
      <Label x={340} y={100} t="แม่เหล็ก" anchor="start" />
      <Label x={320} y={200} t="ผงตะไบเหล็ก (ถูกดูด)" anchor="start" />
      <Pointer x1={286} y1={200} x2={314} y2={196} />
      <Label x={260} y={338} t="ผงอื่นที่แม่เหล็กไม่ดูด อยู่ในจาน" />
    </>
  );
}

// ---------- ตะแกรงร่อน ----------
function Sieve() {
  return (
    <>
      <ellipse cx="260" cy="130" rx="105" ry="22" fill="#fff" stroke="#475569" strokeWidth="4" />
      <path d="M 155 130 L 165 160 Q 260 190 355 160 L 365 130" fill="#e2e8f0" stroke="#475569" strokeWidth="3" />
      {[0, 1, 2, 3, 4, 5, 6, 7, 8].map((i) => <line key={i} x1={175 + i * 20} y1="140" x2={178 + i * 20} y2="170" stroke="#94a3b8" strokeWidth="1.5" />)}
      {[[215, 120], [245, 112], [275, 120], [305, 114], [230, 128]].map((c, i) => <circle key={i} cx={c[0]} cy={c[1]} r="10" fill="#92400e" stroke="#fff" strokeWidth="1.5" />)}
      {[[220, 205], [240, 220], [262, 208], [284, 224], [304, 210], [250, 240], [274, 246]].map((c, i) => <circle key={i} cx={c[0]} cy={c[1]} r="3" fill="#fbbf24" />)}
      <path d="M 170 270 Q 260 340 350 270 Z" fill="#fff7ed" stroke="#d97706" strokeWidth="2.5" />
      <ellipse cx="260" cy="278" rx="62" ry="10" fill="#fcd34d" />
      <Label x={392} y={118} t="ก้อนใหญ่ค้างบนตะแกรง" anchor="start" />
      <Pointer x1={330} y1={118} x2={386} y2={114} />
      <Label x={392} y={230} t="เม็ดเล็กร่วงผ่านรู" anchor="start" />
      <Pointer x1={312} y1={226} x2={386} y2={226} />
      <Label x={372} y={296} t="ได้ของละเอียดในชาม" anchor="start" />
    </>
  );
}

// ---------- การระเหิด ----------
function Sublime() {
  return (
    <>
      <rect x="150" y="70" width="220" height="14" rx="6" fill="#bae6fd" stroke="#0ea5e9" strokeWidth="2.5" />
      {[[180, 90], [210, 94], [240, 90], [270, 94], [300, 90], [330, 94]].map((c, i) => <circle key={i} cx={c[0]} cy={c[1]} r="4.5" fill="#fff" stroke="#94a3b8" />)}
      {[0, 1, 2, 3, 4].map((i) => <path key={i} d={`M ${185 + i * 38} 250 q 8 -26 0 -52 q -8 -26 0 -52`} stroke="#a78bfa" strokeWidth="3" fill="none" strokeLinecap="round" opacity="0.8" />)}
      <path d="M 160 250 Q 260 290 360 250 Z" fill={GLASS} stroke={STROKE} strokeWidth="2.5" />
      <circle cx="230" cy="248" r="9" fill="#fff" stroke="#94a3b8" strokeWidth="2" />
      <circle cx="260" cy="252" r="9" fill="#fff" stroke="#94a3b8" strokeWidth="2" />
      {[[285, 248], [300, 252], [313, 248]].map((c, i) => <rect key={i} x={c[0]} y={c[1] - 3} width="7" height="7" fill="#fff" stroke="#94a3b8" />)}
      <path transform="translate(0 -12)" d="M 232 322 q 8 -30 18 -4 q 10 -30 22 4 q -4 10 -20 10 q -16 0 -20 -10 z" fill="#f97316" />
      <Label x={260} y={58} t="จานเย็น: ไอกลับเป็นผลึกแข็ง" />
      <Label x={110} y={170} t="ไอระเหิดขึ้น" anchor="middle" />
      <Label x={110} y={232} t="ลูกเหม็น" anchor="middle" />
      <Pointer x1={140} y1={232} x2={218} y2={246} />
      <Label x={372} y={266} t="เกลือไม่ระเหิด อยู่ในจาน" anchor="start" />
      <Pointer x1={318} y1={254} x2={366} y2={262} />
    </>
  );
}

// ---------- การตกตะกอน ----------
function Settle() {
  const tube = (x: number) => `M ${x} 90 L ${x} 270 Q ${x + 30} 300 ${x + 60} 270 L ${x + 60} 90`;
  return (
    <>
      {[70, 230, 390].map((x) => <path key={x} d={tube(x)} fill={GLASS} stroke={STROKE} strokeWidth="2.5" />)}
      <path d="M 70 130 L 70 270 Q 100 300 130 270 L 130 130 Z" fill="#fde68a" opacity="0.9" />
      {Array.from({ length: 16 }, (_, i) => <circle key={i} cx={240 + ((i * 17) % 40)} cy={140 + ((i * 29) % 120)} r="3" fill="#92400e" />)}
      <path d="M 230 130 L 230 270 Q 260 300 290 270 L 290 130 Z" fill="#fde68a" opacity="0.5" />
      <path d="M 390 130 L 390 270 Q 420 300 450 270 L 450 130 Z" fill="#fef9c3" opacity="0.8" />
      <path d="M 392 262 L 392 270 Q 420 298 448 270 L 448 262 Q 420 282 392 262 Z" fill="#92400e" />
      <Label x={100} y={72} t="เพิ่งเทลงใหม่" />
      <Label x={260} y={72} t="ตะกอนกำลังตก" />
      <Label x={420} y={72} t="ตกตะกอนแล้ว" />
      <Label x={420} y={330} t="ตะกอนอยู่ก้นหลอด" />
      <Label x={420} y={352} t="น้ำใสอยู่ด้านบน" />
    </>
  );
}

const APPARATUS: Record<string, { vb: string; label: string; node: React.ReactNode }> = {
  filter: { vb: "0 0 520 340", label: "ชุดกรองสาร กรวยกรอง กระดาษกรอง และภาชนะรองรับ", node: <Filter /> },
  funnel: { vb: "0 0 520 340", label: "กรวยแยกสำหรับแยกของเหลวสองชั้น", node: <Funnel /> },
  distill: { vb: "0 0 520 345", label: "ชุดกลั่นน้ำทะเลเป็นน้ำจืด", node: <Distill /> },
  evap: { vb: "0 0 520 340", label: "การระเหยแห้งน้ำเกลือให้ได้ผลึกเกลือ", node: <Evap /> },
  magnet: { vb: "0 0 520 345", label: "แม่เหล็กดูดผงตะไบเหล็กออกจากสารผสม", node: <Magnet /> },
  sieve: { vb: "0 0 520 340", label: "ตะแกรงร่อนแยกก้อนใหญ่ออกจากเม็ดเล็ก", node: <Sieve /> },
  sublime: { vb: "0 0 520 340", label: "การระเหิดแยกลูกเหม็นออกจากเกลือ", node: <Sublime /> },
  settle: { vb: "0 0 520 362", label: "การตกตะกอนในหลอดทดลอง", node: <Settle /> },
};
export const APPARATUS_TYPES = Object.keys(APPARATUS);

export function Apparatus({ p }: { p: P }) {
  const a = APPARATUS[s(p, "type")] ?? APPARATUS.filter;
  return (
    <Frame vb={a.vb} label={s(p, "caption", a.label)}>
      {a.node}
    </Frame>
  );
}

// ---------- ไอคอนวัตถุ ----------
const ICONS: Record<string, React.ReactNode> = {
  spoon: <><ellipse cx="30" cy="16" rx="11" ry="13" fill="#cbd5e1" stroke="#64748b" strokeWidth="2" /><rect x="27" y="28" width="6" height="28" rx="3" fill="#cbd5e1" stroke="#64748b" strokeWidth="2" /><ellipse cx="26" cy="12" rx="3" ry="5" fill="#fff" opacity="0.7" /></>,
  nail: <><rect x="14" y="8" width="32" height="7" rx="3" fill="#94a3b8" stroke="#475569" strokeWidth="2" /><polygon points="27,15 33,15 31,54 29,54" fill="#cbd5e1" stroke="#475569" strokeWidth="2" /></>,
  coin: <><circle cx="30" cy="30" r="22" fill="#fcd34d" stroke="#b45309" strokeWidth="2.5" /><circle cx="30" cy="30" r="15" fill="none" stroke="#b45309" strokeWidth="1.5" /><path d="M 22 24 q 8 -10 16 0" stroke="#fff" strokeWidth="3" fill="none" opacity="0.7" /></>,
  pot: <><path d="M 10 22 L 50 22 L 46 50 Q 30 56 14 50 Z" fill="#cbd5e1" stroke="#64748b" strokeWidth="2.5" /><rect x="4" y="26" width="8" height="5" rx="2" fill="#64748b" /><rect x="48" y="26" width="8" height="5" rx="2" fill="#64748b" /><ellipse cx="30" cy="22" rx="20" ry="4" fill="#e2e8f0" stroke="#64748b" strokeWidth="2" /></>,
  bottle: <><rect x="25" y="4" width="10" height="8" rx="2" fill="#2563eb" /><path d="M 26 12 L 34 12 L 34 20 Q 44 26 44 36 L 44 52 Q 30 58 16 52 L 16 36 Q 16 26 26 20 Z" fill="#bae6fd" stroke="#0284c7" strokeWidth="2.5" /><rect x="18" y="34" width="24" height="10" fill="#fff" opacity="0.6" /></>,
  bag: <><path d="M 12 20 L 48 20 L 44 54 L 16 54 Z" fill="#fecaca" stroke="#dc2626" strokeWidth="2.5" /><path d="M 20 20 q 0 -12 10 -12 q 10 0 10 12" fill="none" stroke="#dc2626" strokeWidth="3" /></>,
  tire: <><circle cx="30" cy="30" r="24" fill="#334155" stroke="#0f172a" strokeWidth="2.5" /><circle cx="30" cy="30" r="10" fill="#cbd5e1" stroke="#475569" strokeWidth="2" /><circle cx="30" cy="30" r="3" fill="#475569" /></>,
  tile: <><rect x="8" y="8" width="44" height="44" rx="4" fill="#fde68a" stroke="#b45309" strokeWidth="2.5" /><line x1="30" y1="8" x2="30" y2="52" stroke="#b45309" strokeWidth="1.5" /><line x1="8" y1="30" x2="52" y2="30" stroke="#b45309" strokeWidth="1.5" /></>,
  rock: <><path d="M 8 46 L 14 26 L 28 14 L 46 20 L 54 38 L 48 50 Z" fill="#a8a29e" stroke="#57534e" strokeWidth="2.5" /><path d="M 20 28 L 30 22" stroke="#d6d3d1" strokeWidth="3" /></>,
  wood: <><rect x="6" y="18" width="48" height="26" rx="6" fill="#d97706" stroke="#78350f" strokeWidth="2.5" /><ellipse cx="14" cy="31" rx="6" ry="11" fill="#fbbf24" stroke="#78350f" strokeWidth="2" /><ellipse cx="14" cy="31" rx="2.5" ry="5" fill="none" stroke="#78350f" strokeWidth="1.5" /></>,
  ice: <><rect x="10" y="14" width="40" height="38" rx="6" fill="#e0f2fe" stroke="#38bdf8" strokeWidth="2.5" /><path d="M 16 22 L 26 22" stroke="#fff" strokeWidth="4" /></>,
  drop: <><path d="M 30 6 Q 48 28 48 38 A 18 18 0 0 1 12 38 Q 12 28 30 6 Z" fill="#7dd3fc" stroke="#0284c7" strokeWidth="2.5" /><path d="M 22 38 q 0 8 8 10" stroke="#fff" strokeWidth="3" fill="none" /></>,
  steam: <>{[14, 30, 46].map((x) => <path key={x} d={`M ${x} 52 q 8 -10 0 -20 q -8 -10 0 -20`} stroke="#94a3b8" strokeWidth="4" fill="none" strokeLinecap="round" />)}</>,
  balloon: <><ellipse cx="30" cy="26" rx="19" ry="22" fill="#fca5a5" stroke="#dc2626" strokeWidth="2.5" /><path d="M 30 48 l -4 6 h 8 z" fill="#dc2626" /><ellipse cx="22" cy="18" rx="4" ry="6" fill="#fff" opacity="0.6" /></>,
  sugar: <>{[[14, 34], [30, 34], [22, 20], [38, 20], [46, 34]].map((c, i) => <rect key={i} x={c[0]} y={c[1]} width="14" height="14" rx="2" fill="#fff" stroke="#94a3b8" strokeWidth="2" />)}</>,
  salt: <><path d="M 14 10 L 46 10 L 44 54 L 16 54 Z" fill="#f8fafc" stroke="#64748b" strokeWidth="2.5" /><rect x="18" y="4" width="24" height="8" rx="3" fill="#94a3b8" />{[[26, 24], [34, 30], [28, 38], [36, 44]].map((c, i) => <circle key={i} cx={c[0]} cy={c[1]} r="2" fill="#94a3b8" />)}</>,
  ball: <><circle cx="30" cy="30" r="20" fill="#fff" stroke="#64748b" strokeWidth="2.5" /><circle cx="30" cy="30" r="20" fill="#e2e8f0" opacity="0.5" /><circle cx="24" cy="24" r="4" fill="#fff" /></>,
  magnet: <><path d="M 14 8 L 14 34 A 16 16 0 0 0 46 34 L 46 8" fill="none" stroke="#dc2626" strokeWidth="11" /><path d="M 30 18 A 16 16 0 0 0 46 34 L 46 8" fill="none" stroke="#2563eb" strokeWidth="11" /></>,
  sand: <><path d="M 4 50 Q 30 18 56 50 Z" fill="#fcd34d" stroke="#d97706" strokeWidth="2.5" />{[[22, 44], [34, 40], [28, 46]].map((c, i) => <circle key={i} cx={c[0]} cy={c[1]} r="1.5" fill="#b45309" />)}</>,
  cup: <><path d="M 12 12 L 48 12 L 44 52 L 16 52 Z" fill="#e0f2fe" stroke="#0284c7" strokeWidth="2.5" opacity="0.95" /><path d="M 14 28 L 46 28 L 44 52 L 16 52 Z" fill="#7dd3fc" /></>,
  leaf: <><path d="M 8 50 Q 8 10 52 10 Q 52 50 8 50 Z" fill="#4ade80" stroke="#15803d" strokeWidth="2.5" /><path d="M 10 48 Q 28 30 48 14" stroke="#15803d" strokeWidth="2" fill="none" /></>,
  rubber: <><rect x="8" y="22" width="44" height="22" rx="10" fill="#f87171" stroke="#b91c1c" strokeWidth="2.5" /><rect x="14" y="27" width="32" height="12" rx="6" fill="#fecaca" /></>,
};

export function Objects({ p }: { p: P }) {
  const rows = arr(p, "rows").filter(Array.isArray).map((r) => (r as unknown[]).filter((x): x is string => typeof x === "string")).filter((r) => r.length > 1).slice(0, 4);
  return (
    <div className="grid gap-2 rounded-2xl bg-sky-50 p-2" role="group" aria-label={s(p, "caption", "ตัวอย่างวัตถุ")}>
      {rows.map((r, i) => (
        <div key={i} className="rounded-xl bg-white p-2 ring-1 ring-sky-100">
          <div className="mb-1 text-center text-sm font-extrabold text-amber-900">{r[0]}</div>
          <div className="flex flex-wrap justify-center gap-x-3 gap-y-1">
            {r.slice(1, 7).map((it, j) => {
              const k = it.indexOf(":");
              const icon = k > 0 ? it.slice(0, k) : "";
              const label = k > 0 ? it.slice(k + 1) : it;
              return (
                <figure key={j} className="m-0 flex w-[4.6rem] flex-col items-center">
                  <svg viewBox="0 0 60 60" className="h-14 w-14" aria-hidden="true">
                    {ICONS[icon] ?? <circle cx="30" cy="30" r="20" fill="#e2e8f0" stroke="#94a3b8" strokeWidth="2" />}
                  </svg>
                  <figcaption className="text-center text-xs font-bold leading-tight text-gray-700">{label}</figcaption>
                </figure>
              );
            })}
          </div>
        </div>
      ))}
      {s(p, "caption") && <p className="text-center text-xs font-bold text-gray-600">{s(p, "caption")}</p>}
    </div>
  );
}
