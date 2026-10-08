export interface ExerciseCard {
  id: string;
  title: string;
  subject: string;
  topic: string;
  count: number;
  best: number | null;
  homeworkDue: string | null;
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
    return (a.homeworkDue ?? "").localeCompare(b.homeworkDue ?? "") || a.title.localeCompare(b.title, "th") || a.id.localeCompare(b.id);
  });
}

export function thaiDate(value: string): string {
  return new Intl.DateTimeFormat("th-TH", { day: "numeric", month: "short", year: "numeric", timeZone: "Asia/Bangkok" }).format(new Date(value + "T00:00:00Z"));
}
