"use client";
import React, { useState } from "react";
import Link from "next/link";
import { useStore } from "@/lib/store";
import { Card, PageHeader, Input, Select, StatusBadge, BlockerBadge, SampleMark } from "@/components/ui";
import { EntryRow, useProjectName } from "@/components/lists";
import { fmtDate, fmtDuration } from "@/lib/utils";
import { WORK_CATEGORIES, WORK_STATUSES, PRIORITIES } from "@/lib/types";
import { Search as SearchIcon } from "lucide-react";

function H({ children }: { children: React.ReactNode }) {
  return <h2 className="mb-2 mt-6 text-sm font-semibold">{children}</h2>;
}

export default function SearchPage() {
  const { data } = useStore();
  const projName = useProjectName();
  const [q, setQ] = useState("");
  const [project, setProject] = useState("");
  const [status, setStatus] = useState("");
  const [category, setCategory] = useState("");
  const [priority, setPriority] = useState("");
  const [extra, setExtra] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const ql = q.toLowerCase();
  const hit = (...fields: (string | undefined | null)[]) => !ql || fields.some((f) => f?.toLowerCase().includes(ql));

  const entries = data.workEntries.filter((e) =>
    hit(e.title, e.description, e.notes, e.tags.join(" "), e.accomplishments, e.issues_found, projName(e.project_id)) &&
    (!project || e.project_id === project) && (!status || e.status === status) &&
    (!category || e.category === category) && (!priority || e.priority === priority) &&
    (!extra || (extra === "yes" ? e.is_extra : !e.is_extra)) &&
    (!from || e.date >= from) && (!to || e.date <= to)
  );
  const projects = data.projects.filter((p) => hit(p.name, p.description, p.client, p.notes));
  const blockers = data.blockers.filter((b) => hit(b.title, b.description, b.waiting_for, projName(b.project_id)));
  const meetings = data.meetings.filter((m) => hit(m.name, m.discussion, m.decisions, m.attendees, m.action_items));
  const evidence = data.evidence.filter((ev) => hit(ev.name, ev.description, ev.type, projName(ev.project_id)));
  const learning = data.learning.filter((l) => hit(l.topic, l.course, l.learned, l.notes));



  return (
    <div>
      <PageHeader title="Search" />
      <div className="relative mb-3">
        <SearchIcon size={16} className="absolute left-3 top-3 text-zinc-400" />
        <Input autoFocus value={q} onChange={(e) => setQ(e.target.value)} placeholder='Search everything… e.g. "Ramp Creation"' className="pl-9" />
      </div>
      <Card className="mb-4 grid grid-cols-2 gap-2 p-3 sm:grid-cols-4 lg:grid-cols-7">
        <Select value={project} onChange={(e) => setProject(e.target.value)}><option value="">All projects</option>{data.projects.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}</Select>
        <Select value={status} onChange={(e) => setStatus(e.target.value)}><option value="">Any status</option>{WORK_STATUSES.map((s) => <option key={s}>{s}</option>)}</Select>
        <Select value={category} onChange={(e) => setCategory(e.target.value)}><option value="">Any category</option>{WORK_CATEGORIES.map((c) => <option key={c}>{c}</option>)}</Select>
        <Select value={priority} onChange={(e) => setPriority(e.target.value)}><option value="">Any priority</option>{PRIORITIES.map((p) => <option key={p}>{p}</option>)}</Select>
        <Select value={extra} onChange={(e) => setExtra(e.target.value)}><option value="">Normal+Extra</option><option value="yes">Extra only</option><option value="no">Normal only</option></Select>
        <Input type="date" value={from} onChange={(e) => setFrom(e.target.value)} title="From" />
        <Input type="date" value={to} onChange={(e) => setTo(e.target.value)} title="To" />
      </Card>

      <H>Work Entries ({entries.length})</H>
      <div className="space-y-2">{entries.map((e) => <EntryRow key={e.id} e={e} />)}</div>

      {projects.length > 0 && (<><H>Projects ({projects.length})</H>
        <div className="space-y-1">{projects.map((p) => <Link key={p.id} href={`/projects/${p.id}`} className="block rounded-lg border border-zinc-200 p-2 text-sm hover:border-indigo-300 dark:border-zinc-800">{p.name}{p.is_sample && <SampleMark />}</Link>)}</div></>)}

      {blockers.length > 0 && (<><H>Blockers ({blockers.length})</H>
        <div className="space-y-1">{blockers.map((b) => <div key={b.id} className="flex items-center gap-2 rounded-lg border border-zinc-200 p-2 text-sm dark:border-zinc-800">{b.title}<BlockerBadge s={b.status} /><span className="text-xs text-zinc-500">{fmtDate(b.created_date)}</span></div>)}</div></>)}

      {meetings.length > 0 && (<><H>Meetings ({meetings.length})</H>
        <div className="space-y-1">{meetings.map((m) => <div key={m.id} className="rounded-lg border border-zinc-200 p-2 text-sm dark:border-zinc-800">{m.name} <span className="text-xs text-zinc-500">{fmtDate(m.date)}</span></div>)}</div></>)}

      {evidence.length > 0 && (<><H>Evidence ({evidence.length})</H>
        <div className="space-y-1">{evidence.map((ev) => <div key={ev.id} className="rounded-lg border border-zinc-200 p-2 text-sm dark:border-zinc-800">{ev.name} <span className="text-xs text-zinc-500">{ev.type} · {fmtDate(ev.date)}</span></div>)}</div></>)}

      {learning.length > 0 && (<><H>Learning ({learning.length})</H>
        <div className="space-y-1">{learning.map((l) => <div key={l.id} className="rounded-lg border border-zinc-200 p-2 text-sm dark:border-zinc-800">{l.topic} <span className="text-xs text-zinc-500">{fmtDuration(l.duration_min)} · {fmtDate(l.date)}</span></div>)}</div></>)}
    </div>
  );
}
