export interface ExerciseCard {
  id: string;
  title: string;
  grade?: number;
  draft?: boolean;
  subject: string;
  topic: string;
  count: number;
  best: number | null;
  homeworkDue: string | null;
  term: number | null;
  unit: string | null;
  order: number | null;
  hasTeach: boolean;
}

export type ExerciseFilter = "all" | "new" | "homework" | "review";

export function visibleExercises(exercises: ExerciseCard[], subject: string, filter: ExerciseFilter, search: string): ExerciseCard[] {
  const term = search.trim().toLocaleLowerCase("th");
  return exercises.filter((exercise) => {
    if (subject !== "all" && exercise.subject !== subject) return false;
    if (filter === "new" && exercise.best !== null) return false;
    if (filter === "homework" && !exercise.homeworkDue) return false;
    if (filter === "review" && (exercise.best === null || exercise.best >= exercise.count)) return false;
    return !term || (exercise.title + " " + exercise.topic).toLocaleLowerCase("th").includes(term);
  }).sort((a, b) => {
    if (a.homeworkDue && !b.homeworkDue) return -1;
    if (!a.homeworkDue && b.homeworkDue) return 1;
    return (a.homeworkDue ?? "").localeCompare(b.homeworkDue ?? "") || (a.order ?? 9999) - (b.order ?? 9999) || a.title.localeCompare(b.title, "th") || a.id.localeCompare(b.id);
  });
}

export function thaiDate(value: string): string {
  return new Intl.DateTimeFormat("th-TH", { day: "numeric", month: "short", year: "numeric", timeZone: "Asia/Bangkok" }).format(new Date(value + "T00:00:00Z"));
}

export interface UnitGroup {
  key: string;
  term: number;
  unit: string;
  number: number;
  lessons: ExerciseCard[];
}

/** รวมบทเรียนเป็นหน่วย (เทอม → หน่วย) เรียงตามลำดับบท · ชุดที่ไม่มีหน่วยแยกไว้ใน others */
export function groupUnits(exercises: ExerciseCard[]): { units: UnitGroup[]; others: ExerciseCard[] } {
  const map = new Map<string, UnitGroup>();
  const others: ExerciseCard[] = [];
  const sorted = [...exercises].sort((a, b) => (a.order ?? 9999) - (b.order ?? 9999) || a.title.localeCompare(b.title, "th"));
  for (const ex of sorted) {
    if (!ex.unit) { others.push(ex); continue; }
    const key = `${ex.term ?? 0}|${ex.unit}`;
    const g = map.get(key) ?? { key, term: ex.term ?? 0, unit: ex.unit, number: 0, lessons: [] };
    g.lessons.push(ex);
    map.set(key, g);
  }
  const units = [...map.values()];
  units.forEach((u, i) => { u.number = i + 1; });
  return { units, others };
}

const UNIT_EMOJI: [RegExp, string][] = [
  [/บวก/, "➕"], [/ลบ/, "➖"], [/คูณ/, "✖️"], [/หาร|ห\.ร\.ม|ค\.ร\.น/, "➗"], [/เศษส่วน/, "🍕"], [/ทศนิยม/, "🔟"],
  [/ร้อยละ/, "💯"], [/อัตราส่วน|มาตราส่วน/, "⚖️"], [/สมการ|แบบรูป/, "🧩"], [/ปริมาตร|ความจุ/, "🧊"], [/พื้นที่|รอบรูป/, "🟧"],
  [/น้ำหนัก|ชั่ง/, "⚖️"], [/ความยาว|วัด/, "📏"], [/เวลา|ปฏิทิน/, "🕐"], [/เงิน/, "💰"], [/มุม/, "📐"], [/รูป|เรขาคณิต/, "🔺"],
  [/แผนภูมิ|ตาราง|ข้อมูล|สถิติ|กราฟ/, "📊"], [/จำนวน|หลัก|ค่า/, "🔢"],
];
export function unitEmoji(name: string): string {
  return UNIT_EMOJI.find(([re]) => re.test(name))?.[1] ?? "📘";
}
