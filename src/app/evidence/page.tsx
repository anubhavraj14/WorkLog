"use client";
import React, { useState } from "react";
import Link from "next/link";
import { useStore } from "@/lib/store";
import { Card, Button, PageHeader, Modal, Badge, SampleMark, EmptyState } from "@/components/ui";
import { EvidenceForm } from "@/components/forms";
import { useProjectName } from "@/components/lists";
import { fmtDate } from "@/lib/utils";
import { Plus, Pencil, Trash2, ExternalLink } from "lucide-react";
import { Evidence } from "@/lib/types";

export default function EvidencePage() {
  const { data, remove } = useStore();
  const projName = useProjectName();
  const [adding, setAdding] = useState(false);
  const [edit, setEdit] = useState<Evidence | null>(null);
  const list = [...data.evidence].sort((a, b) => b.date.localeCompare(a.date));
  const taskName = (id: string | null) => data.workEntries.find((w) => w.id === id)?.title;
  const deleteEvidence = async (id: string) => {
    if (!confirm("Delete this evidence and its uploaded file?")) return;
    try {
      await remove("evidence", id);
    } catch (error) {
      alert(error instanceof Error ? error.message : "Unable to delete evidence");
    }
  };

  return (
    <div>
      <PageHeader title="Evidence & Proof of Work"><Button onClick={() => setAdding(true)}><Plus size={16} /> Add Evidence</Button></PageHeader>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {list.map((ev) => (
          <Card key={ev.id} className="flex flex-col gap-1.5 p-3">
            <div className="flex items-start justify-between gap-2">
              <div className="font-medium">{ev.name}{ev.is_sample && <SampleMark />}</div>
              <Badge>{ev.type}</Badge>
            </div>
            <div className="text-xs text-zinc-500">{fmtDate(ev.date)} · {projName(ev.project_id)}</div>
            {taskName(ev.work_entry_id) && (
              <Link href={`/log/${ev.work_entry_id}`} className="text-xs text-indigo-600 hover:underline">→ {taskName(ev.work_entry_id)}</Link>
            )}
            {ev.description && <p className="text-sm text-zinc-600 dark:text-zinc-400">{ev.description}</p>}
            {ev.url && (
              <a href={ev.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 truncate text-xs text-indigo-600 hover:underline">
                <ExternalLink size={11} /> {ev.url.startsWith("data:") ? "View attached file" : ev.url}
              </a>
            )}
            <div className="mt-auto flex gap-2 border-t border-zinc-100 pt-2 text-xs text-zinc-500 dark:border-zinc-800">
              <button onClick={() => setEdit(ev)} className="hover:text-indigo-600">Edit</button>
              <button onClick={() => deleteEvidence(ev.id)} className="hover:text-red-600">Delete</button>
            </div>
          </Card>
        ))}
      </div>
      {!list.length && <EmptyState text="No evidence yet." action={<Button onClick={() => setAdding(true)}>Add evidence</Button>} />}
      <Modal open={adding} onClose={() => setAdding(false)} title="Add Evidence"><EvidenceForm onSaved={() => setAdding(false)} /></Modal>
      <Modal open={!!edit} onClose={() => setEdit(null)} title="Edit Evidence">{edit && <EvidenceForm initial={edit} onSaved={() => setEdit(null)} />}</Modal>
    </div>
  );
}
