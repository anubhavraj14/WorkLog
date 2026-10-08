"use client";
import React, { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useStore } from "@/lib/store";
import { fmtDate, fmtDuration, fmtTime } from "@/lib/utils";
import { Card, Button, StatusBadge, PriorityBadge, CategoryBadge, TagPill, Modal, EmptyState, SampleMark } from "@/components/ui";
import { WorkEntryForm, EvidenceForm } from "@/components/forms";
import { useProjectName } from "@/components/lists";
import { Pencil, Trash2, Plus, ExternalLink } from "lucide-react";
import { Evidence } from "@/lib/types";
import { useDialog } from "@/components/dialog-provider";

export default function EntryDetail() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { data, remove } = useStore();
  const dialog = useDialog();
  const projName = useProjectName();
  const [editing, setEditing] = useState(false);
  const [addingEvidence, setAddingEvidence] = useState(false);
  const [editingEvidence, setEditingEvidence] = useState<Evidence | null>(null);
  const e = data.workEntries.find((w) => w.id === id);
  if (!e) return <EmptyState text="Work entry not found." action={<Button href="/log">Back to log</Button>} />;

  const evidence = data.evidence.filter((ev) => ev.work_entry_id === e.id);
  const meetings = data.meetings.filter((m) => m.date === e.date && (m.project_id === e.project_id || !e.project_id));
  const blockers = data.blockers.filter((b) => b.project_id === e.project_id && b.status !== "Resolved");
  const deleteEvidence = async (evidenceId: string) => {
    if (!await dialog.confirm("The evidence record and its uploaded file will be permanently removed.", { title: "Delete evidence?", destructive: true })) return;
    try {
      await remove("evidence", evidenceId);
    } catch (error) {
      await dialog.alert(error instanceof Error ? error.message : "Unable to delete evidence", "Deletion failed");
    }
  };

  const row = (label: string, value: React.ReactNode) =>
    value ? <div className="grid gap-1 sm:grid-cols-3"><dt className="text-xs font-medium uppercase text-zinc-400">{label}</dt><dd className="sm:col-span-2 text-sm whitespace-pre-wrap">{value}</dd></div> : null;

  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold">{e.title}{e.is_sample && <SampleMark />}</h1>
          <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-zinc-500">
            <span>{projName(e.project_id)}</span>·<span>{fmtDate(e.date)}</span>·<span>{fmtTime(e.start_time)}{e.end_time ? ` – ${fmtTime(e.end_time)}` : ""}</span>·<span className="font-medium text-zinc-700 dark:text-zinc-300">{fmtDuration(e.duration_min)}</span>
          </div>
          <div className="mt-2 flex flex-wrap gap-2">
            <StatusBadge s={e.status} /><PriorityBadge p={e.priority} /><CategoryBadge c={e.category} />
            {e.is_extra && <span className="rounded-full bg-purple-100 px-2 py-0.5 text-xs font-medium text-purple-700 dark:bg-purple-950 dark:text-purple-300">Extra Hours</span>}
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="ghost" onClick={() => setEditing(true)}><Pencil size={14} /> Edit</Button>
          <Button variant="danger" onClick={async () => { if (await dialog.confirm("This work entry will be permanently removed.", { title: "Delete work entry?", destructive: true })) { await remove("workEntries", e.id); router.push("/log"); } }}><Trash2 size={14} /></Button>
        </div>
      </div>

      <Card>
        <dl className="space-y-3">
          {row("Description", e.description)}
          {row("Accomplished", e.accomplishments)}
          {row("Issues found", e.issues_found)}
          {row("Notes", e.notes)}
          {row("Extra reason", e.is_extra ? e.extra_reason || "—" : null)}
          {e.tags.length > 0 && row("Tags", <span className="flex flex-wrap gap-1">{e.tags.map((t) => <TagPill key={t} tag={t} />)}</span>)}
        </dl>
      </Card>

      <Card>
        <div className="mb-2 flex items-center justify-between">
          <h2 className="text-sm font-semibold">Evidence</h2>
          <Button variant="ghost" onClick={() => setAddingEvidence(true)}><Plus size={14} /> Add</Button>
        </div>
        <div className="space-y-2">
          {evidence.map((ev) => (
            <div key={ev.id} className="flex items-center justify-between rounded-lg border border-zinc-100 p-2 text-sm dark:border-zinc-800">
              <div>
                <span className="font-medium">{ev.name}{ev.is_sample && <SampleMark />}</span>
                <span className="ml-2 text-xs text-zinc-500">{ev.type}</span>
                {ev.description && <div className="text-xs text-zinc-500">{ev.description}</div>}
              </div>
              <div className="flex items-center gap-2">
                {ev.url && <a href={ev.url} target="_blank" rel="noreferrer" aria-label="Open evidence" title="Open evidence" className="text-indigo-600"><ExternalLink size={14} /></a>}
                <button onClick={() => setEditingEvidence(ev)} aria-label="Edit evidence" title="Edit evidence" className="text-zinc-500 hover:text-indigo-600"><Pencil size={14} /></button>
                <button onClick={() => deleteEvidence(ev.id)} aria-label="Delete evidence" title="Delete evidence" className="text-zinc-500 hover:text-red-600"><Trash2 size={14} /></button>
              </div>
            </div>
          ))}
          {!evidence.length && <p className="text-sm text-zinc-500">No evidence attached yet.</p>}
        </div>
      </Card>

      {meetings.length > 0 && (
        <Card>
          <h2 className="mb-2 text-sm font-semibold">Related Meetings</h2>
          {meetings.map((m) => <div key={m.id} className="py-1 text-sm">{m.name} — {fmtTime(m.start_time)}{m.attendees ? ` · ${m.attendees}` : ""}</div>)}
        </Card>
      )}
      {blockers.length > 0 && (
        <Card>
          <h2 className="mb-2 text-sm font-semibold">Related Blockers</h2>
          {blockers.map((b) => <div key={b.id} className="py-1 text-sm">{b.title} — waiting for {b.waiting_for || "—"}</div>)}
        </Card>
      )}

      <Modal wide open={editing} onClose={() => setEditing(false)} title="Edit Work Entry"><WorkEntryForm initial={e} onSaved={() => setEditing(false)} /></Modal>
      <Modal open={addingEvidence} onClose={() => setAddingEvidence(false)} title="Add Evidence"><EvidenceForm workEntryId={e.id} onSaved={() => setAddingEvidence(false)} /></Modal>
      <Modal open={!!editingEvidence} onClose={() => setEditingEvidence(null)} title="Edit Evidence">{editingEvidence && <EvidenceForm initial={editingEvidence} onSaved={() => setEditingEvidence(null)} />}</Modal>
    </div>
  );
}
