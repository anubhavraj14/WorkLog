import { Settings, WorkEntry } from "./types";

const minutes = (time: string) => {
  const [hours, mins] = time.split(":").map(Number);
  return Number.isFinite(hours) && Number.isFinite(mins) ? hours * 60 + mins : 0;
};

export function splitWorkMinutes(entry: WorkEntry, settings: Settings) {
  const total = entry.duration_min || 0;
  if (!entry.start_time || total <= 0) return { normal: entry.is_extra ? 0 : total, extra: entry.is_extra ? total : 0 };

  const day = new Date(`${entry.date}T12:00:00`).getDay();
  if (!settings.working_days.includes(day)) return { normal: 0, extra: total };

  const start = minutes(entry.start_time);
  const end = entry.end_time ? minutes(entry.end_time) : start + total;
  const normalStart = minutes(settings.work_start_time);
  const normalEnd = minutes(settings.work_end_time);
  const normal = Math.max(0, Math.min(end, normalEnd) - Math.max(start, normalStart));
  const boundedNormal = Math.min(total, normal);
  return { normal: boundedNormal, extra: total - boundedNormal };
}
