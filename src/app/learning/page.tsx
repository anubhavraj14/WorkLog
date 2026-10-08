"use client";
import React, { useState } from "react";
import { useStore } from "@/lib/store";
import { Card, Button, PageHeader, Modal, SampleMark, EmptyState } from "@/components/ui";
import { LearningForm } from "@/components/forms";
import { fmtDate, fmtDuration } from "@/lib/utils";
import { Plus, Pencil, Trash2, ExternalLink } from "lucide-react";
import { LearningEntry } from "@/lib/types";
import { useDialog } from "@/components/dialog-provider";

export default function Learning() {
  const { data, remove } = useStore();
  const dialog = useDialog();
  const [adding, setAdding] = useState(false);
  const [edit, setEdit] = useState<LearningEntry | null>(null);
  const list = [...data.learning].sort((a, b) => b.date.localeCompare(a.date));
  const total = list.reduce((s, l) => s + l.duration_min, 0);

  return (
    <div>
      <PageHeader title="Learning & Training"><Button onClick={() => setAdding(true)}><Plus size={16} /> Add Learning</Button></PageHeader>
      <Card className="mb-4 inline-flex items-baseline gap-2 px-4 py-3"><span className="text-lg font-semibold">{fmtDuration(total)}</span><span className="text-xs text-zinc-500">total learning time</span></Card>
      <div className="space-y-2">
        {list.map((l) => (
          <Card key={l.id} className="p-3">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <div className="font-medium">{l.topic}{l.is_sample && <SampleMark />}</div>
                <div className="mt-0.5 text-xs text-zinc-500">{l.course && `${l.course} · `}{fmtDate(l.date)} · {fmtDuration(l.duration_min)}</div>
                {l.learned && <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">{l.learned}</p>}
                {l.notes && <p className="mt-1 text-xs text-zinc-500">{l.notes}</p>}
                {l.certificate_url && <a href={l.certificate_url} target="_blank" rel="noreferrer" className="mt-1 inline-flex items-center gap-1 text-xs text-indigo-600 hover:underline"><ExternalLink size={11} /> Certificate / link</a>}
              </div>
              <div className="flex gap-1">
                <button onClick={() => setEdit(l)} className="rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"><Pencil size={14} /></button>
                <button onClick={async () => (await dialog.confirm("This learning entry will be permanently removed.", { title: "Delete learning entry?", destructive: true })) && remove("learning", l.id)} className="rounded-lg p-1.5 text-zinc-400 hover:bg-red-50 hover:text-red-600"><Trash2 size={14} /></button>
              </div>
            </div>
          </Card>
        ))}
      </div>
      {!list.length && <EmptyState text="No learning recorded." action={<Button onClick={() => setAdding(true)}>Add learning</Button>} />}
      <Modal open={adding} onClose={() => setAdding(false)} title="Add Learning"><LearningForm onSaved={() => setAdding(false)} /></Modal>
      <Modal open={!!edit} onClose={() => setEdit(null)} title="Edit Learning">{edit && <LearningForm initial={edit} onSaved={() => setEdit(null)} />}</Modal>
    </div>
  );
}
