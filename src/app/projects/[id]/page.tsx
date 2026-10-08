"use client";
import React, { useState } from "react";
import { useParams } from "next/navigation";
import { useStore } from "@/lib/store";
import { Card, Button, PageHeader, ProjectStatusBadge, BlockerBadge, Modal, EmptyState, SampleMark } from "@/components/ui";
import { ProjectForm } from "@/components/forms";
import { EntryRow } from "@/components/lists";
import { fmtDateShort, fmtDuration, fmtTime, fmtDate } from "@/lib/utils";
import { Pencil } from "lucide-react";
import { splitWorkMinutes } from "@/lib/work-hours";

export default function ProjectDetail() {
  const { id } = useParams<{ id: string }>();
  const { data, settings } = useStore();
  const [editing, setEditing] = useState(false);
  const p = data.projects.find((x) => x.id === id);
  if (!p) return <EmptyState text="Project not found." action={<Button href="/projects">Back</Button>} />;

  const entries = data.workEntries.filter((e) => e.project_id === p.id).sort((a, b) => b.date.localeCompare(a.date));
  const blockers = data.blockers.filter((b) => b.project_id === p.id);
  const meetings = data.meetings.filter((m) => m.project_id === p.id).sort((a, b) => b.date.localeCompare(a.date));
  const evidence = data.evidence.filter((ev) => ev.project_id === p.id);
  const totalMin = entries.reduce((s, e) => s + e.duration_min, 0);
  const extraMin = entries.reduce((sum, entry) => sum + splitWorkMinutes(entry, settings).extra, 0);

  const stat = (l: string, v: string | number) => (
    <Card className="p-3"><div className="text-lg font-semibold">{v}</div><div className="text-xs text-zinc-500">{l}</div></Card>
  );

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">{p.name}{p.is_sample && <SampleMark />}</h1>
          <div className="mt-1 flex items-center gap-2 text-sm text-zinc-500">
            <ProjectStatusBadge s={p.status} />
            {p.client && <span>{p.client}</span>}
            {p.start_date && <span>{fmtDateShort(p.start_date)}{p.end_date ? ` – ${fmtDateShort(p.end_date)}` : " – present"}</span>}
          </div>
          {p.description && <p className="mt-2 max-w-2xl text-sm text-zinc-600 dark:text-zinc-400">{p.description}</p>}
          {p.notes && <p className="mt-1 text-xs text-zinc-500">Notes: {p.notes}</p>}
        </div>
        <Button variant="ghost" onClick={() => setEditing(true)}><Pencil size={14} /> Edit</Button>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
        {stat("Total hours", fmtDuration(totalMin))}
        {stat("Extra hours", fmtDuration(extraMin))}
        {stat("Completed", entries.filter((e) => e.status === "Completed").length)}
        {stat("In progress", entries.filter((e) => e.status === "In Progress").length)}
        {stat("Open blockers", blockers.filter((b) => b.status !== "Resolved").length)}
      </div>

      <section>
        <h2 className="mb-2 text-sm font-semibold">Work History</h2>
        <div className="space-y-2">{entries.map((e) => <EntryRow key={e.id} e={e} />)}</div>
        {!entries.length && <p className="text-sm text-zinc-500">No work logged for this project.</p>}
      </section>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <h2 className="mb-2 text-sm font-semibold">Blockers</h2>
          {blockers.map((b) => <div key={b.id} className="flex items-center justify-between py-1 text-sm"><span>{b.title}</span><BlockerBadge s={b.status} /></div>)}
          {!blockers.length && <p className="text-sm text-zinc-500">None</p>}
        </Card>
        <Card>
          <h2 className="mb-2 text-sm font-semibold">Meetings</h2>
          {meetings.map((m) => <div key={m.id} className="py-1 text-sm">{m.name} <span className="text-xs text-zinc-500">{fmtDate(m.date)}</span></div>)}
          {!meetings.length && <p className="text-sm text-zinc-500">None</p>}
        </Card>
        <Card>
          <h2 className="mb-2 text-sm font-semibold">Evidence</h2>
          {evidence.map((ev) => (
            <div key={ev.id} className="py-1 text-sm">
              {ev.url ? <a href={ev.url} target="_blank" rel="noreferrer" className="text-indigo-600 hover:underline">{ev.name}</a> : ev.name}
              <span className="ml-1 text-xs text-zinc-500">{ev.type}</span>
            </div>
          ))}
          {!evidence.length && <p className="text-sm text-zinc-500">None</p>}
        </Card>
      </div>

      <Modal open={editing} onClose={() => setEditing(false)} title="Edit Project"><ProjectForm initial={p} onSaved={() => setEditing(false)} /></Modal>
    </div>
  );
}
