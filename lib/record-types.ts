export const recordTypes = [
  { value: "SONG", label: "참여곡" },
  { value: "AWARD", label: "수상" },
  { value: "EDUCATION", label: "학력" },
  { value: "CAREER", label: "경력" },
  { value: "PROJECT", label: "프로젝트" },
] as const;
export type RecordType = (typeof recordTypes)[number]["value"];
export function recordLabel(type: RecordType) {
  return recordTypes.find((option) => option.value === type)?.label || "경력";
}
export function careerPeriod(start: string, end: string | null, mode: "RANGE" | "SINGLE" = "RANGE") {
  if (mode === "SINGLE") return start.replaceAll("-", ".");
  return `${start.replaceAll("-", ".")} — ${end ? end.replaceAll("-", ".") : "현재"}`;
}
