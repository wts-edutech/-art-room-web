/**
 * Helper constants for Mathayom 1-6 with 14 classrooms (ห้อง 1 - 14)
 */

export interface GradeGroup {
  level: string; // e.g. "ม.1"
  label: string; // e.g. "มัธยมศึกษาปีที่ 1 (ม.1)"
  rooms: string[]; // ["ม.1/1", "ม.1/2", ..., "ม.1/14"]
}

export const GRADE_GROUPS: GradeGroup[] = [1, 2, 3, 4, 5, 6].map((levelNum) => ({
  level: `ม.${levelNum}`,
  label: `มัธยมศึกษาปีที่ ${levelNum} (ม.${levelNum})`,
  rooms: Array.from({ length: 14 }, (_, i) => `ม.${levelNum}/${i + 1}`)
}));

export const ALL_GRADE_OPTIONS: string[] = GRADE_GROUPS.flatMap((g) => g.rooms);
