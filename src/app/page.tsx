"use client";
import React, { useState } from "react";
import Link from "next/link";
import { useStore } from "@/lib/store";
import { fmtDuration, greeting, todayStr, weekRange, inRange, fmtDateShort, parseISO, format } from "@/lib/utils";
import { Card, Button, BlockerBadge, Modal, PageHeader } from "@/components/ui";
import { EntryRow, useProjectName } from "@/components/lists";
import { HoursBar } from "@/components/charts";
import { WorkEntryForm, ProjectForm, EvidenceForm, MeetingForm, BlockerForm } from "@/components/forms";
import { Plus, Clock3, Zap, CheckCircle2, Loader, ShieldAlert, FolderKanban, FlaskConical, Users, FileBarChart } from "lucide-react";

export default function Dashboard() {
  const { data, settings } = useStore();
  const projName = useProjectName();
  const [modal, setModal] = useState<string | null>(null);
  const today = todayStr();
  const { start, end } = weekRange(new Date());

  const todayEntries = data.workEntries.filter((e) => e.date === today);
  const weekEntries = data.workEntries.filter((e) => inRange(e.date, start, end));
  const todayMin = todayEntries.reduce((s, e) => s + e.duration_min, 0);
  const weekMin = weekEntries.reduce((s, e) => s + e.duration_min, 0);
  const extraMin = data.workEntries.filter((e) => e.is_extra && inRange(e.date, start, end)).reduce((s, e) => s + e.duration_min, 0);
  const openBlockers = data.blockers.filter((b) => b.status !== "Resolved");
  const recent = [...data.workEntries].sort((a, b) => b.date.localeCompare(a.date) || b.start_time.localeCompare(a.start_time)).slice(0, 6);

  const days: { label: string; hours: number; extra: number }[] = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(start); d.setDate(d.getDate() + i);
    const ds = format(d, "yyyy-MM-dd");
    const es = weekEntries.filter((e) => e.date === ds);
    days.push({
      label: format(d, "EEE"),
      hours: es.filter((e) => !e.is_extra).reduce((s, e) => s + e.duration_min, 0) / 60,
      extra: es.filter((e) => e.is_extra).reduce((s, e) => s + e.duration_min, 0) / 60,
    });
  }

  const stat = (label: string, value: string, icon: React.ReactNode) => (
    <Card className="flex items-center gap-3 p-3.5">
      <div className="rounded-lg bg-indigo-50 p-2 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-300">{icon}</div>
      <div><div className="text-lg font-semibold leading-tight">{value}</div><div className="text-xs text-zinc-500">{label}</div></div>
    </Card>
  );

  const actions = [
    { label: "Log Work", icon: Plus, open: "work" },
    { label: "Add Project", icon: FolderKanban, open: "project" },
    { label: "Add Evidence", icon: FlaskConical, open: "evidence" },
    { label: "Add Meeting", icon: Users, open: "meeting" },
    { label: "Add Blocker", icon: ShieldAlert, open: "blocker" },
    { label: "Generate Report", icon: FileBarChart, href: "/reports" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">{greeting()}, {settings.name}</h1>
          <p className="text-sm text-zinc-500">{format(new Date(), "EEEE, MMMM d, yyyy")}</p>
        </div>
        <Button href="/log/new"><Plus size={16} /> Log Today&apos;s Work</Button>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-6">
        {stat("Hours Today", fmtDuration(todayMin), <Clock3 size={18} />)}
        {stat("Hours This Week", fmtDuration(weekMin), <Clock3 size={18} />)}
        {stat("Extra Hours", fmtDuration(extraMin), <Zap size={18} />)}
        {stat("Tasks Completed", String(data.workEntries.filter((e) => e.status === "Completed").length), <CheckCircle2 size={18} />)}
        {stat("In Progress", String(data.workEntries.filter((e) => e.status === "In Progress").length), <Loader size={18} />)}
        {stat("Open Blockers", String(openBlockers.length), <ShieldAlert size={18} />)}
      </div>

      <Card>
        <h2 className="mb-2 text-sm font-semibold">Weekly Work Overview</h2>
        <HoursBar data={days} />
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <section>
          <div className="mb-2 flex items-center justify-between">
            <h2 className="text-sm font-semibold">Recent Work</h2>
            <Link href="/log" className="text-xs text-indigo-600 hover:underline">View all</Link>
          </div>
          <div className="space-y-2">{recent.map((e) => <EntryRow key={e.id} e={e} />)}</div>
          {!recent.length && <p className="text-sm text-zinc-500">No work logged yet — click “Log Today’s Work”.</p>}
        </section>

        <section>
          <div className="mb-2 flex items-center justify-between">
            <h2 className="text-sm font-semibold">Current Blockers</h2>
            <Link href="/blockers" className="text-xs text-indigo-600 hover:underline">View all</Link>
          </div>
          <div className="space-y-2">
            {openBlockers.map((b) => (
              <Card key={b.id} className="p-3">
                <div className="flex items-center gap-2"><span className="font-medium">{b.title}</span><BlockerBadge s={b.status} /></div>
                <div className="mt-1 text-xs text-zinc-500">{projName(b.project_id)} · waiting for {b.waiting_for || "—"} · since {fmtDateShort(b.created_date)}</div>
                {b.description && <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">{b.description}</p>}
              </Card>
            ))}
            {!openBlockers.length && <p className="text-sm text-zinc-500">No active blockers. 🎉</p>}
          </div>

          <h2 className="mb-2 mt-6 text-sm font-semibold">Quick Actions</h2>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {actions.map((a) =>
              a.href ? (
                <Link key={a.label} href={a.href} className="flex items-center gap-2 rounded-xl border border-zinc-200 bg-white p-3 text-sm font-medium hover:border-indigo-300 dark:border-zinc-800 dark:bg-zinc-900">
                  <a.icon size={16} className="text-indigo-600" /> {a.label}
                </Link>
              ) : (
                <button key={a.label} onClick={() => setModal(a.open!)} className="flex items-center gap-2 rounded-xl border border-zinc-200 bg-white p-3 text-left text-sm font-medium hover:border-indigo-300 dark:border-zinc-800 dark:bg-zinc-900">
                  <a.icon size={16} className="text-indigo-600" /> {a.label}
                </button>
              )
            )}
          </div>
        </section>
      </div>

      <Modal open={modal === "work"} onClose={() => setModal(null)} title="Log Work"><WorkEntryForm onSaved={() => setModal(null)} /></Modal>
      <Modal open={modal === "project"} onClose={() => setModal(null)} title="Add Project"><ProjectForm onSaved={() => setModal(null)} /></Modal>
      <Modal open={modal === "evidence"} onClose={() => setModal(null)} title="Add Evidence"><EvidenceForm onSaved={() => setModal(null)} /></Modal>
      <Modal open={modal === "meeting"} onClose={() => setModal(null)} title="Add Meeting"><MeetingForm onSaved={() => setModal(null)} /></Modal>
      <Modal open={modal === "blocker"} onClose={() => setModal(null)} title="Add Blocker"><BlockerForm onSaved={() => setModal(null)} /></Modal>
    </div>
  );
}
