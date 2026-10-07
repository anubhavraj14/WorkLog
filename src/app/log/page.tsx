"use client";
import React, { useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useStore } from "@/lib/store";
import { fmtDate, fmtDuration, fmtTime, todayStr, addDays, format, parseISO } from "@/lib/utils";
import { Card, Button, StatusBadge, SampleMark, PageHeader, Modal } from "@/components/ui";
import { useProjectName } from "@/components/lists";
import { WorkEntryForm, MeetingForm } from "@/components/forms";
import { Plus, ChevronLeft, ChevronRight, Pencil, Trash2 } from "lucide-react";
import { WorkEntry, Meeting } from "@/lib/types";

export default function DailyLog() {
  const params = useSearchParams();
  const router = useRouter();
  const { data, remove } = useStore();
  const projName = useProjectName();
  const [date, setDate] = useState(params.get("d") ?? todayStr());
  const [edit, setEdit] = useState<WorkEntry | null>(null);
  const [editMeeting, setEditMeeting] = useState<Meeting | null>(null);

  const entries = data.workEntries.filter((e) => e.date === date).sort((a, b) => a.start_time.localeCompare(b.start_time));
  const meetings = data.meetings.filter((m) => m.date === date).sort((a, b) => a.start_time.localeCompare(b.start_time));

  type Item = { kind: "w"; t: string; w: WorkEntry } | { kind: "m"; t: string; m: Meeting };
  const items: Item[] = [
    ...entries.map((w) => ({ kind: "w" as const, t: w.start_time, w })),
    ...meetings.map((m) => ({ kind: "m" as const, t: m.start_time, m })),
  ].sort((a, b) => a.t.localeCompare(b.t));

  const total = entries.reduce((s, e) => s + e.duration_min, 0);
  const extra = entries.filter((e) => e.is_extra).reduce((s, e) => s + e.duration_min, 0);
  const nav = (off: number) => setDate(format(addDays(parseISO(date), off), "yyyy-MM-dd"));

  return (
    <div>
      <PageHeader title="Daily Work Log">
        <Button variant="ghost" onClick={() => nav(-1)}><ChevronLeft size={16} /></Button>
        <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="rounded-lg border border-zinc-200 px-2 py-1.5 text-sm dark:border-zinc-700 dark:bg-zinc-900" />
        <Button variant="ghost" onClick={() => nav(1)}><ChevronRight size={16} /></Button>
        <Button href={`/log/new?d=${date}`}><Plus size={16} /> Log Work</Button>
      </PageHeader>

      <div className="mb-4 flex flex-wrap gap-4">
        <Card className="px-4 py-3"><span className="text-xs text-zinc-500">Total Work</span><div className="text-lg font-semibold">{fmtDuration(total)}</div></Card>
        <Card className="px-4 py-3"><span className="text-xs text-zinc-500">Extra Hours</span><div className="text-lg font-semibold text-purple-600">{fmtDuration(extra)}</div></Card>
        <Card className="px-4 py-3"><span className="text-xs text-zinc-500">Entries</span><div className="text-lg font-semibold">{items.length}</div></Card>
      </div>

      <h2 className="mb-3 text-sm font-medium text-zinc-500">{fmtDate(date)}</h2>
      <div className="relative space-y-3 border-l-2 border-zinc-200 pl-4 dark:border-zinc-800">
        {items.map((it) => (
          <div key={it.kind === "w" ? it.w.id : it.m.id} className="relative">
            <span className="absolute -left-[23px] top-4 h-2.5 w-2.5 rounded-full bg-indigo-500" />
            {it.kind === "w" ? (
              <Card className="p-3">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <div className="text-xs font-medium text-zinc-500">{fmtTime(it.w.start_time)}{it.w.end_time ? ` – ${fmtTime(it.w.end_time)}` : ""} · {fmtDuration(it.w.duration_min)}</div>
                    <div className="flex items-center gap-2">
                      <a href={`/log/${it.w.id}`} className="font-medium hover:text-indigo-600" onClick={(e) => { e.preventDefault(); router.push(`/log/${it.w.id}`); }}>{it.w.title}{it.w.is_sample && <SampleMark />}</a>
                      <StatusBadge s={it.w.status} />
                      {it.w.is_extra && <span className="rounded-full bg-purple-100 px-2 py-0.5 text-xs font-medium text-purple-700 dark:bg-purple-950 dark:text-purple-300">Extra Hours</span>}
                    </div>
                    <div className="mt-0.5 text-xs text-zinc-500">{projName(it.w.project_id)} · {it.w.category}</div>
                    {it.w.description && <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">{it.w.description}</p>}
                  </div>
                  <div className="flex gap-1">
                    <button onClick={() => setEdit(it.w)} className="rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"><Pencil size={14} /></button>
                    <button onClick={() => confirm("Delete this entry?") && remove("workEntries", it.w.id)} className="rounded-lg p-1.5 text-zinc-400 hover:bg-red-50 hover:text-red-600"><Trash2 size={14} /></button>
                  </div>
                </div>
              </Card>
            ) : (
              <Card className="border-blue-200 p-3 dark:border-blue-900">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <div className="text-xs font-medium text-zinc-500">{fmtTime(it.m.start_time)}{it.m.end_time ? ` – ${fmtTime(it.m.end_time)}` : ""}</div>
                    <div className="font-medium">{it.m.name}{it.m.is_sample && <SampleMark />}</div>
                    {it.m.attendees && <div className="text-xs text-zinc-500">with {it.m.attendees}</div>}
                  </div>
                  <div className="flex gap-1">
                    <button onClick={() => setEditMeeting(it.m)} className="rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"><Pencil size={14} /></button>
                    <button onClick={() => confirm("Delete this meeting?") && remove("meetings", it.m.id)} className="rounded-lg p-1.5 text-zinc-400 hover:bg-red-50 hover:text-red-600"><Trash2 size={14} /></button>
                  </div>
                </div>
              </Card>
            )}
          </div>
        ))}
        {!items.length && <p className="text-sm text-zinc-500">Nothing logged for this day.</p>}
      </div>

      <Modal wide open={!!edit} onClose={() => setEdit(null)} title="Edit Work Entry">{edit && <WorkEntryForm initial={edit} onSaved={() => setEdit(null)} />}</Modal>
      <Modal open={!!editMeeting} onClose={() => setEditMeeting(null)} title="Edit Meeting">{editMeeting && <MeetingForm initial={editMeeting} onSaved={() => setEditMeeting(null)} />}</Modal>
    </div>
  );
}
