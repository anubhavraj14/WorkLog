"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useStore } from "@/lib/store";
import { PageHeader, Button, Card } from "@/components/ui";
import { cn, fmtDuration, format, parseISO } from "@/lib/utils";
import { startOfMonth, endOfMonth, startOfWeek, endOfWeek, addDays, addMonths, isSameMonth, isSameDay } from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function CalendarPage() {
  const { data } = useStore();
  const router = useRouter();
  const [cursor, setCursor] = useState(new Date());
  const [view, setView] = useState<"month" | "week">("month");

  const monthStart = startOfMonth(cursor);
  const gridStart = view === "month" ? startOfWeek(monthStart, { weekStartsOn: 1 }) : startOfWeek(cursor, { weekStartsOn: 1 });
  const cells = view === "month" ? 42 : 7;

  const dayInfo = (d: Date) => {
    const ds = format(d, "yyyy-MM-dd");
    const es = data.workEntries.filter((e) => e.date === ds);
    return {
      min: es.reduce((s, e) => s + e.duration_min, 0),
      extra: es.some((e) => e.is_extra),
      tasks: es.length,
      meetings: data.meetings.filter((m) => m.date === ds).length,
      blockers: data.blockers.filter((b) => b.created_date === ds && b.status !== "Resolved").length,
    };
  };

  return (
    <div>
      <PageHeader title="Calendar">
        <Button variant="ghost" onClick={() => setCursor(view === "month" ? addMonths(cursor, -1) : addDays(cursor, -7))}><ChevronLeft size={16} /></Button>
        <span className="flex items-center px-2 text-sm font-medium">{format(cursor, view === "month" ? "MMMM yyyy" : "MMM d, yyyy")}</span>
        <Button variant="ghost" onClick={() => setCursor(view === "month" ? addMonths(cursor, 1) : addDays(cursor, 7))}><ChevronRight size={16} /></Button>
        <input type="date" value={format(cursor, "yyyy-MM-dd")} onChange={(e) => e.target.value && setCursor(parseISO(e.target.value))} aria-label="Choose calendar date" className="rounded-lg border border-zinc-200 px-2 py-1.5 text-sm dark:border-zinc-700 dark:bg-zinc-900" />
        <Button variant="ghost" onClick={() => setCursor(new Date())}>Today</Button>
        <div className="flex rounded-lg border border-zinc-200 p-0.5 text-xs dark:border-zinc-700">
          {(["month", "week"] as const).map((v) => (
            <button key={v} onClick={() => setView(v)} className={cn("rounded-md px-2.5 py-1 capitalize", view === v ? "bg-indigo-600 text-white" : "text-zinc-500")}>{v}</button>
          ))}
        </div>
      </PageHeader>

      <Card className="p-2 sm:p-3">
        <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-medium uppercase text-zinc-400 sm:text-xs">
          {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => <div key={d} className="py-1">{d}</div>)}
        </div>
        <div className="grid grid-cols-7 gap-1">
          {Array.from({ length: cells }).map((_, i) => {
            const d = addDays(gridStart, i);
            const info = dayInfo(d);
            const dim = view === "month" && !isSameMonth(d, cursor);
            const today = isSameDay(d, new Date());
            return (
              <button
                key={i}
                onClick={() => router.push(`/log?d=${format(d, "yyyy-MM-dd")}`)}
                className={cn(
                  "flex min-h-16 flex-col rounded-lg border p-1.5 text-left transition-colors hover:border-indigo-400 sm:min-h-20 sm:p-2",
                  dim ? "border-transparent opacity-40" : "border-zinc-200 dark:border-zinc-800",
                  today && "ring-2 ring-indigo-500",
                  info.min > 0 && "bg-indigo-50/60 dark:bg-indigo-950/40"
                )}
              >
                <span className={cn("text-xs font-medium", today && "text-indigo-600")}>{format(d, "d")}</span>
                {info.min > 0 && <span className="mt-auto text-[10px] font-semibold text-indigo-700 dark:text-indigo-300 sm:text-xs">{fmtDuration(info.min)}</span>}
                <div className="flex flex-wrap gap-0.5 text-[9px] leading-none">
                  {info.extra && <span className="rounded bg-purple-200 px-1 text-purple-800 dark:bg-purple-900 dark:text-purple-200">extra</span>}
                  {info.tasks > 0 && <span className="rounded bg-zinc-200 px-1 dark:bg-zinc-700">{info.tasks}t</span>}
                  {info.meetings > 0 && <span className="rounded bg-blue-200 px-1 text-blue-800 dark:bg-blue-900 dark:text-blue-200">{info.meetings}m</span>}
                  {info.blockers > 0 && <span className="rounded bg-red-200 px-1 text-red-800 dark:bg-red-900 dark:text-red-200">{info.blockers}b</span>}
                </div>
              </button>
            );
          })}
        </div>
      </Card>
      <p className="mt-3 text-xs text-zinc-500">Legend: hours worked · <b>extra</b> = extra hours · <b>t</b> = tasks · <b>m</b> = meetings · <b>b</b> = blockers. Click a day to open its Daily Log.</p>
    </div>
  );
}
