"use client";
import React, { useState } from "react";
import { useStore } from "@/lib/store";
import { Card, PageHeader, Input } from "@/components/ui";
import { HoursBar, Donut } from "@/components/charts";
import { format, parseISO } from "@/lib/utils";
import { startOfWeek, startOfMonth, subDays, format as f } from "date-fns";

export default function Analytics() {
  const { data } = useStore();
  const [days, setDays] = useState(90);
  const since = f(subDays(new Date(), days), "yyyy-MM-dd");
  const entries = data.workEntries.filter((e) => e.date >= since);
  const projName = (id: string | null) => data.projects.find((p) => p.id === id)?.name ?? "None";

  const group = (keyFn: (e: (typeof entries)[0]) => string) => {
    const m = new Map<string, number>();
    for (const e of entries) m.set(keyFn(e), (m.get(keyFn(e)) ?? 0) + e.duration_min);
    return m;
  };

  const byWeek = new Map<string, { hours: number; extra: number }>();
  const byMonth = new Map<string, { hours: number; extra: number }>();
  for (const e of entries) {
    const wk = f(startOfWeek(parseISO(e.date), { weekStartsOn: 1 }), "MMM d");
    const mo = f(startOfMonth(parseISO(e.date)), "MMM yyyy");
    for (const [map, k] of [[byWeek, wk], [byMonth, mo]] as const) {
      const cur = map.get(k) ?? { hours: 0, extra: 0 };
      if (e.is_extra) cur.extra += e.duration_min / 60; else cur.hours += e.duration_min / 60;
      map.set(k, cur);
    }
  }
  const toArr = (m: Map<string, { hours: number; extra: number }>) =>
    [...m.entries()].map(([label, v]) => ({ label, hours: +v.hours.toFixed(1), extra: +v.extra.toFixed(1) }));

  const donut = (m: Map<string, number>) => [...m.entries()].map(([name, v]) => ({ name, value: +(v / 60).toFixed(1) }));
  const learningMin = data.learning.filter((l) => l.date >= since).reduce((s, l) => s + l.duration_min, 0);
  const statusCount = new Map<string, number>();
  for (const e of entries) statusCount.set(e.status, (statusCount.get(e.status) ?? 0) + 1);

  return (
    <div className="space-y-4">
      <PageHeader title="Analytics">
        <label className="flex items-center gap-2 text-sm text-zinc-500">
          Last
          <Input type="number" min={7} value={days} onChange={(e) => setDays(Number(e.target.value) || 90)} className="w-20" />
          days
        </label>
      </PageHeader>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card><h2 className="mb-2 text-sm font-semibold">Hours per Week</h2><HoursBar data={toArr(byWeek)} /></Card>
        <Card><h2 className="mb-2 text-sm font-semibold">Hours per Month</h2><HoursBar data={toArr(byMonth)} /></Card>
        <Card><h2 className="mb-2 text-sm font-semibold">Work by Project (hours)</h2><Donut data={donut(group((e) => projName(e.project_id)))} /></Card>
        <Card><h2 className="mb-2 text-sm font-semibold">Work by Category (hours)</h2><Donut data={donut(group((e) => e.category))} /></Card>
        <Card><h2 className="mb-2 text-sm font-semibold">Tasks by Status</h2><Donut data={[...statusCount.entries()].map(([name, value]) => ({ name, value }))} /></Card>
        <Card>
          <h2 className="mb-2 text-sm font-semibold">Summary</h2>
          <div className="space-y-1 text-sm">
            <p>Normal hours: <b>{(entries.filter((e) => !e.is_extra).reduce((s, e) => s + e.duration_min, 0) / 60).toFixed(1)}h</b></p>
            <p>Extra hours: <b className="text-purple-600">{(entries.filter((e) => e.is_extra).reduce((s, e) => s + e.duration_min, 0) / 60).toFixed(1)}h</b></p>
            <p>Blocked entries: <b>{entries.filter((e) => e.status === "Blocked").length}</b></p>
            <p>Learning hours: <b>{(learningMin / 60).toFixed(1)}h</b></p>
          </div>
        </Card>
      </div>
    </div>
  );
}
