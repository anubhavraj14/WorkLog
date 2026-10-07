"use client";
import React, { useState } from "react";
import { useStore } from "@/lib/store";
import { Card, Button, PageHeader, Modal, SampleMark, EmptyState } from "@/components/ui";
import { MeetingForm } from "@/components/forms";
import { useProjectName } from "@/components/lists";
import { fmtDate, fmtTime } from "@/lib/utils";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { Meeting } from "@/lib/types";

export default function Meetings() {
  const { data, remove } = useStore();
  const projName = useProjectName();
  const [adding, setAdding] = useState(false);
  const [edit, setEdit] = useState<Meeting | null>(null);
  const list = [...data.meetings].sort((a, b) => b.date.localeCompare(a.date));

  return (
    <div>
      <PageHeader title="Meetings"><Button onClick={() => setAdding(true)}><Plus size={16} /> Add Meeting</Button></PageHeader>
      <div className="space-y-2">
        {list.map((m) => (
          <Card key={m.id} className="p-3">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <div className="font-medium">{m.name}{m.is_sample && <SampleMark />}</div>
                <div className="mt-0.5 text-xs text-zinc-500">
                  {fmtDate(m.date)} · {fmtTime(m.start_time)}{m.end_time ? `–${fmtTime(m.end_time)}` : ""} · {projName(m.project_id)}{m.attendees ? ` · ${m.attendees}` : ""}
                </div>
                {m.discussion && <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">{m.discussion}</p>}
                {m.decisions && <p className="mt-1 text-sm"><span className="font-medium">Decisions:</span> {m.decisions}</p>}
                {m.action_items && <p className="mt-1 text-sm"><span className="font-medium">Action items:</span> {m.action_items}</p>}
                {m.follow_up_date && <p className="mt-1 text-xs text-zinc-500">Follow-up: {fmtDate(m.follow_up_date)}</p>}
              </div>
              <div className="flex gap-1">
                <button onClick={() => setEdit(m)} className="rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"><Pencil size={14} /></button>
                <button onClick={() => confirm("Delete this meeting?") && remove("meetings", m.id)} className="rounded-lg p-1.5 text-zinc-400 hover:bg-red-50 hover:text-red-600"><Trash2 size={14} /></button>
              </div>
            </div>
          </Card>
        ))}
      </div>
      {!list.length && <EmptyState text="No meetings recorded." action={<Button onClick={() => setAdding(true)}>Add meeting</Button>} />}
      <Modal open={adding} onClose={() => setAdding(false)} title="Add Meeting"><MeetingForm onSaved={() => setAdding(false)} /></Modal>
      <Modal open={!!edit} onClose={() => setEdit(null)} title="Edit Meeting">{edit && <MeetingForm initial={edit} onSaved={() => setEdit(null)} />}</Modal>
    </div>
  );
}
