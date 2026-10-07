import { Data, WorkEntry } from "./types";
import { fmtDate, fmtDateShort, fmtDuration, fmtTime, inRange } from "./utils";

export interface ReportResult {
  title: string;
  markdown: string;
  entries: WorkEntry[];
  totalMin: number;
  extraMin: number;
}

export function generateReport(data: Data, start: Date, end: Date, name: string): ReportResult {
  const entries = data.workEntries.filter((e) => inRange(e.date, start, end)).sort((a, b) => a.date.localeCompare(b.date) || a.start_time.localeCompare(b.start_time));
  const blockers = data.blockers.filter((b) => inRange(b.created_date, start, end) || (b.status !== "Resolved"));
  const meetings = data.meetings.filter((m) => inRange(m.date, start, end));
  const learning = data.learning.filter((l) => inRange(l.date, start, end));
  const evidence = data.evidence.filter((ev) => inRange(ev.date, start, end));
  const projName = (id: string | null) => data.projects.find((p) => p.id === id)?.name ?? "—";

  const completed = entries.filter((e) => e.status === "Completed");
  const inProgress = entries.filter((e) => e.status === "In Progress" || e.status === "Blocked");
  const withIssues = entries.filter((e) => e.issues_found?.trim());
  const totalMin = entries.reduce((s, e) => s + e.duration_min, 0);
  const extraMin = entries.filter((e) => e.is_extra).reduce((s, e) => s + e.duration_min, 0);
  const pending = data.workEntries.filter((e) => e.status === "Planned" || e.status === "In Progress");

  const title = `Work Report — ${name} (${fmtDateShort(start.toISOString().slice(0, 10))} – ${fmtDateShort(end.toISOString().slice(0, 10))})`;
  const lines: string[] = [`# ${title}`, ""];
  const sec = (h: string) => lines.push("", `## ${h}`, "");

  sec("Work Summary");
  lines.push(`Logged ${entries.length} work entries across ${new Set(entries.map((e) => e.project_id)).size} project(s).`);
  const byProject = new Map<string, number>();
  for (const e of entries) byProject.set(projName(e.project_id), (byProject.get(projName(e.project_id)) ?? 0) + e.duration_min);
  for (const [p, m] of byProject) lines.push(`- **${p}**: ${fmtDuration(m)}`);

  sec("Completed Tasks");
  for (const e of completed) lines.push(`- **${e.title}** (${fmtDate(e.date)}, ${fmtDuration(e.duration_min)}) — ${projName(e.project_id)}${e.accomplishments ? ` — ${e.accomplishments}` : ""}`);
  if (!completed.length) lines.push("_None_");

  sec("In Progress");
  for (const e of inProgress) lines.push(`- **${e.title}** — ${projName(e.project_id)} (${e.status})`);
  if (!inProgress.length) lines.push("_None_");

  sec("Important Findings");
  for (const e of withIssues) lines.push(`- **${e.title}**: ${e.issues_found}`);
  if (!withIssues.length) lines.push("_None_");

  sec("Blockers");
  for (const b of blockers) lines.push(`- **${b.title}** — ${projName(b.project_id)} — waiting for: ${b.waiting_for || "—"} (${b.status})${b.resolution ? ` — Resolution: ${b.resolution}` : ""}`);
  if (!blockers.length) lines.push("_None_");

  sec("Meetings");
  for (const m of meetings) lines.push(`- **${m.name}** (${fmtDate(m.date)} ${fmtTime(m.start_time)}) — ${m.attendees}${m.decisions ? ` — Decisions: ${m.decisions}` : ""}`);
  if (!meetings.length) lines.push("_None_");

  sec("Learning");
  for (const l of learning) lines.push(`- **${l.topic}** (${fmtDuration(l.duration_min)}) — ${l.learned}`);
  if (!learning.length) lines.push("_None_");

  sec("Hours");
  lines.push(`- Normal hours: **${fmtDuration(totalMin - extraMin)}**`);
  lines.push(`- Extra hours: **${fmtDuration(extraMin)}**`);
  lines.push(`- Total hours: **${fmtDuration(totalMin)}**`);

  sec("Evidence");
  for (const ev of evidence) lines.push(`- **${ev.name}** (${ev.type}, ${fmtDate(ev.date)}) — ${projName(ev.project_id)}${ev.url ? ` — ${ev.url}` : ""}${ev.description ? ` — ${ev.description}` : ""}`);
  if (!evidence.length) lines.push("_None_");

  sec("Next Steps");
  for (const e of pending) lines.push(`- ${e.title} — ${projName(e.project_id)} (${e.status})`);
  const openBlockers = data.blockers.filter((b) => b.status !== "Resolved");
  for (const b of openBlockers) lines.push(`- Resolve blocker: ${b.title} (waiting for ${b.waiting_for || "—"})`);
  if (!pending.length && !openBlockers.length) lines.push("_None_");

  return { title, markdown: lines.join("\n"), entries, totalMin, extraMin };
}

export function download(filename: string, content: string, type = "text/markdown") {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function exportCSV(entries: WorkEntry[], projName: (id: string | null) => string): string {
  const esc = (s: string) => `"${(s ?? "").replace(/"/g, '""')}"`;
  const rows = [
    ["Date", "Task", "Project", "Category", "Status", "Priority", "Start", "End", "Minutes", "Extra", "Tags", "Description"],
    ...entries.map((e) => [e.date, e.title, projName(e.project_id), e.category, e.status, e.priority, e.start_time, e.end_time, String(e.duration_min), e.is_extra ? "Yes" : "No", e.tags.join("; "), e.description]),
  ];
  return rows.map((r) => r.map(esc).join(",")).join("\n");
}
