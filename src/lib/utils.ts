import { format, parseISO, startOfWeek, endOfWeek, startOfMonth, endOfMonth, addDays, isSameDay } from "date-fns";

export const uid = () =>
  typeof crypto !== "undefined" && crypto.randomUUID
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2) + Date.now().toString(36);

export const todayStr = () => format(new Date(), "yyyy-MM-dd");
export const fmtDate = (d: string) => format(parseISO(d), "EEE, MMM d, yyyy");
export const fmtDateShort = (d: string) => format(parseISO(d), "MMM d");
export const fmtTime = (t: string) => {
  if (!t) return "";
  const [h, m] = t.split(":").map(Number);
  const ampm = h >= 12 ? "PM" : "AM";
  return `${h % 12 || 12}:${String(m).padStart(2, "0")} ${ampm}`;
};

export function durationBetween(start: string, end: string): number {
  if (!start || !end) return 0;
  const [sh, sm] = start.split(":").map(Number);
  const [eh, em] = end.split(":").map(Number);
  return Math.max(0, eh * 60 + em - (sh * 60 + sm));
}

export function fmtDuration(min: number): string {
  if (!min) return "0h";
  const h = Math.floor(min / 60);
  const m = min % 60;
  return m ? `${h}h ${m}m` : `${h}h`;
}

export function weekRange(d: Date) {
  return { start: startOfWeek(d, { weekStartsOn: 1 }), end: endOfWeek(d, { weekStartsOn: 1 }) };
}
export function monthRange(d: Date) {
  return { start: startOfMonth(d), end: endOfMonth(d) };
}
export const inRange = (date: string, start: Date, end: Date) => {
  const d = parseISO(date);
  return d >= start && d <= end;
};
export { parseISO, format, addDays, isSameDay };

export function greeting(): string {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

export const cn = (...parts: (string | false | undefined)[]) => parts.filter(Boolean).join(" ");
