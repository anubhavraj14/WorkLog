"use client";
import React from "react";
import { useStore } from "@/lib/store";
import { Card, PageHeader, EmptyState } from "@/components/ui";
import { useProjectName } from "@/components/lists";
import { fmtDate, fmtDuration, todayStr, weekRange, monthRange, inRange, fmtTime } from "@/lib/utils";
import { Zap } from "lucide-react";
import { splitWorkMinutes } from "@/lib/work-hours";

export default function ExtraHours() {
  const { data, settings } = useStore();
  const projName = useProjectName();
  const t = todayStr();
  const wk = weekRange(new Date());
  const mo = monthRange(new Date());

  const sum = (fn: (e: (typeof data.workEntries)[0]) => boolean, kind: "normal" | "extra") =>
    data.workEntries.filter(fn).reduce((total, entry) => total + splitWorkMinutes(entry, settings)[kind], 0);

  const stats = [
    { label: "Today's normal hours", v: sum((e) => e.date === t, "normal") },
    { label: "Today's extra hours", v: sum((e) => e.date === t, "extra"), accent: true },
    { label: "This week normal", v: sum((e) => inRange(e.date, wk.start, wk.end), "normal") },
    { label: "This week extra", v: sum((e) => inRange(e.date, wk.start, wk.end), "extra"), accent: true },
    { label: "This month normal", v: sum((e) => inRange(e.date, mo.start, mo.end), "normal") },
    { label: "This month extra", v: sum((e) => inRange(e.date, mo.start, mo.end), "extra"), accent: true },
  ];

  const extraEntries = data.workEntries.filter((entry) => splitWorkMinutes(entry, settings).extra > 0).sort((a, b) => b.date.localeCompare(a.date));

  return (
    <div>
      <PageHeader title="Extra Hours Tracking" />
      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-6">
        {stats.map((s) => (
          <Card key={s.label} className="p-3.5">
            <div className={`text-lg font-semibold ${s.accent ? "text-purple-600" : ""}`}>{fmtDuration(s.v)}</div>
            <div className="text-xs text-zinc-500">{s.label}</div>
          </Card>
        ))}
      </div>

      <h2 className="mb-2 flex items-center gap-2 text-sm font-semibold"><Zap size={15} className="text-purple-500" /> Extra Hours History</h2>
      <Card className="overflow-x-auto p-0">
        <table className="w-full min-w-[560px] text-sm">
          <thead>
            <tr className="border-b border-zinc-200 text-left text-xs text-zinc-500 dark:border-zinc-800">
              <th className="p-3">Date</th><th className="p-3">Task</th><th className="p-3">Project</th><th className="p-3">Time</th><th className="p-3">Extra Time</th><th className="p-3">Reason</th>
            </tr>
          </thead>
          <tbody>
            {extraEntries.map((e) => (
              <tr key={e.id} className="border-b border-zinc-100 last:border-0 dark:border-zinc-800">
                <td className="p-3 whitespace-nowrap">{fmtDate(e.date)}</td>
                <td className="p-3">{e.title}</td>
                <td className="p-3">{projName(e.project_id)}</td>
                <td className="p-3 whitespace-nowrap">{e.start_time && e.end_time ? `${fmtTime(e.start_time)}–${fmtTime(e.end_time)}` : "—"}</td>
                <td className="p-3 font-medium text-purple-600">{fmtDuration(splitWorkMinutes(e, settings).extra)}</td>
                <td className="p-3 text-zinc-500">{e.extra_reason || "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {!extraEntries.length && <EmptyState text="No extra hours logged yet." />}
      </Card>
    </div>
  );
}
