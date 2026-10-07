"use client";
import React, { useState } from "react";
import { useStore } from "@/lib/store";
import { Card, PageHeader, Button } from "@/components/ui";
import { useProjectName } from "@/components/lists";
import { weekRange, inRange, fmtDuration, fmtDateShort, format } from "@/lib/utils";
import { addWeeks } from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";

function Sec({ title, children }: { title: string; children: React.ReactNode }) {
  return <Card><h2 className="mb-2 text-sm font-semibold">{title}</h2><div className="space-y-1 text-sm">{children}</div></Card>;
}

export default function Weekly() {
  const { data } = useStore();
  const projName = useProjectName();
  const [offset, setOffset] = useState(0);
  const { start, end } = weekRange(addWeeks(new Date(), offset));

  const entries = data.workEntries.filter((e) => inRange(e.date, start, end));
  const total = entries.reduce((s, e) => s + e.duration_min, 0);
  const extra = entries.filter((e) => e.is_extra).reduce((s, e) => s + e.duration_min, 0);
  const completed = entries.filter((e) => e.status === "Completed");
  const inProg = entries.filter((e) => e.status === "In Progress");
  const blockers = data.blockers.filter((b) => b.status !== "Resolved" || inRange(b.created_date, start, end));
  const meetings = data.meetings.filter((m) => inRange(m.date, start, end));
  const learning = data.learning.filter((l) => inRange(l.date, start, end));
  const issues = entries.filter((e) => e.issues_found?.trim());
  const byMin = [...entries].sort((a, b) => b.duration_min - a.duration_min).slice(0, 5);
  const nextWeekPending = data.workEntries.filter((e) => e.status === "Planned" || e.status === "In Progress");

  const stat = (l: string, v: string | number) => (
    <Card className="p-3"><div className="text-lg font-semibold">{v}</div><div className="text-xs text-zinc-500">{l}</div></Card>
  );


  return (
    <div className="space-y-4">
      <PageHeader title="Weekly Summary">
        <Button variant="ghost" onClick={() => setOffset(offset - 1)}><ChevronLeft size={16} /></Button>
        <span className="flex items-center text-sm font-medium">{fmtDateShort(format(start, "yyyy-MM-dd"))} – {fmtDateShort(format(end, "yyyy-MM-dd"))}</span>
        <Button variant="ghost" onClick={() => setOffset(offset + 1)} disabled={offset >= 0}><ChevronRight size={16} /></Button>
      </PageHeader>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 xl:grid-cols-7">
        {stat("Total Work", fmtDuration(total))}
        {stat("Extra Hours", fmtDuration(extra))}
        {stat("Completed", completed.length)}
        {stat("In Progress", inProg.length)}
        {stat("Blockers", blockers.length)}
        {stat("Meetings", meetings.length)}
        {stat("Learning", fmtDuration(learning.reduce((s, l) => s + l.duration_min, 0)))}
      </div>

      <Sec title="Biggest Contributions">
        {byMin.map((e) => <div key={e.id}>• <b>{e.title}</b> — {fmtDuration(e.duration_min)} ({projName(e.project_id)})</div>)}
        {!byMin.length && <p className="text-zinc-500">No work this week.</p>}
      </Sec>

      <Sec title="Problems Found">
        {issues.map((e) => <div key={e.id}>• <b>{e.title}:</b> {e.issues_found}</div>)}
        {!issues.length && <p className="text-zinc-500">None recorded.</p>}
      </Sec>

      <Sec title="Blockers">
        {blockers.map((b) => <div key={b.id}>• <b>{b.title}</b> — waiting for {b.waiting_for || "—"} ({b.status})</div>)}
        {!blockers.length && <p className="text-zinc-500">None.</p>}
      </Sec>

      <Sec title="What I Learned">
        {learning.map((l) => <div key={l.id}>• <b>{l.topic}</b> — {l.learned}</div>)}
        {!learning.length && <p className="text-zinc-500">None recorded.</p>}
      </Sec>

      <Sec title="Next Week">
        {nextWeekPending.map((e) => <div key={e.id}>• {e.title} ({e.status})</div>)}
        {!nextWeekPending.length && <p className="text-zinc-500">No pending work.</p>}
      </Sec>
    </div>
  );
}
