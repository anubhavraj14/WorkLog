"use client";
import React, { useState } from "react";
import { useStore } from "@/lib/store";
import { Card, Button, PageHeader, Modal, BlockerBadge, SampleMark, EmptyState } from "@/components/ui";
import { BlockerForm } from "@/components/forms";
import { useProjectName } from "@/components/lists";
import { fmtDate } from "@/lib/utils";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { Blocker } from "@/lib/types";

export default function Blockers() {
  const { data, remove } = useStore();
  const projName = useProjectName();
  const [adding, setAdding] = useState(false);
  const [edit, setEdit] = useState<Blocker | null>(null);
  const active = data.blockers.filter((b) => b.status !== "Resolved");
  const resolved = data.blockers.filter((b) => b.status === "Resolved");

  const renderItem = (b: Blocker) => (
    <Card className="p-3">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <div className="flex items-center gap-2"><span className="font-medium">{b.title}{b.is_sample && <SampleMark />}</span><BlockerBadge s={b.status} /></div>
          <div className="mt-0.5 text-xs text-zinc-500">{projName(b.project_id)} · waiting for {b.waiting_for || "—"} · created {fmtDate(b.created_date)}</div>
          {b.description && <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">{b.description}</p>}
          {b.status === "Resolved" && (
            <p className="mt-1 text-sm text-emerald-700 dark:text-emerald-400">Resolved{b.resolution_date ? ` on ${fmtDate(b.resolution_date)}` : ""}{b.resolved_by ? ` by ${b.resolved_by}` : ""}{b.resolution ? ` — ${b.resolution}` : ""}</p>
          )}
        </div>
        <div className="flex gap-1">
          <button onClick={() => setEdit(b)} className="rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"><Pencil size={14} /></button>
          <button onClick={() => confirm("Delete this blocker?") && remove("blockers", b.id)} className="rounded-lg p-1.5 text-zinc-400 hover:bg-red-50 hover:text-red-600"><Trash2 size={14} /></button>
        </div>
      </div>
    </Card>
  );

  return (
    <div>
      <PageHeader title="Blockers"><Button onClick={() => setAdding(true)}><Plus size={16} /> Add Blocker</Button></PageHeader>
      <h2 className="mb-2 text-sm font-semibold">Active ({active.length})</h2>
      <div className="mb-6 space-y-2">{active.map((b) => <React.Fragment key={b.id}>{renderItem(b)}</React.Fragment>)}{!active.length && <p className="text-sm text-zinc-500">No active blockers.</p>}</div>
      <h2 className="mb-2 text-sm font-semibold">Resolved ({resolved.length})</h2>
      <div className="space-y-2">{resolved.map((b) => <React.Fragment key={b.id}>{renderItem(b)}</React.Fragment>)}{!resolved.length && <p className="text-sm text-zinc-500">None yet.</p>}</div>
      <Modal open={adding} onClose={() => setAdding(false)} title="Add Blocker"><BlockerForm onSaved={() => setAdding(false)} /></Modal>
      <Modal open={!!edit} onClose={() => setEdit(null)} title="Edit Blocker">{edit && <BlockerForm initial={edit} onSaved={() => setEdit(null)} />}</Modal>
    </div>
  );
}
