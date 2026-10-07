"use client";
import React, { useState } from "react";
import Link from "next/link";
import { useStore } from "@/lib/store";
import { Card, Button, PageHeader, Modal, ProjectStatusBadge, SampleMark, EmptyState } from "@/components/ui";
import { ProjectForm } from "@/components/forms";
import { fmtDateShort, fmtDuration } from "@/lib/utils";
import { Plus } from "lucide-react";
import { Project } from "@/lib/types";

export default function Projects() {
  const { data, remove } = useStore();
  const [adding, setAdding] = useState(false);
  const [edit, setEdit] = useState<Project | null>(null);

  return (
    <div>
      <PageHeader title="Projects"><Button onClick={() => setAdding(true)}><Plus size={16} /> Add Project</Button></PageHeader>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {data.projects.map((p) => {
          const entries = data.workEntries.filter((e) => e.project_id === p.id);
          const mins = entries.reduce((s, e) => s + e.duration_min, 0);
          return (
            <Card key={p.id} className="flex flex-col gap-2">
              <div className="flex items-start justify-between">
                <Link href={`/projects/${p.id}`} className="font-semibold hover:text-indigo-600">{p.name}{p.is_sample && <SampleMark />}</Link>
                <ProjectStatusBadge s={p.status} />
              </div>
              {p.description && <p className="line-clamp-2 text-sm text-zinc-600 dark:text-zinc-400">{p.description}</p>}
              <div className="text-xs text-zinc-500">
                {p.client && <span>{p.client} · </span>}
                {p.start_date && <span>{fmtDateShort(p.start_date)}{p.end_date ? ` – ${fmtDateShort(p.end_date)}` : " – present"}</span>}
              </div>
              <div className="mt-auto flex items-center justify-between border-t border-zinc-100 pt-2 text-xs text-zinc-500 dark:border-zinc-800">
                <span>{entries.length} tasks · {fmtDuration(mins)}</span>
                <span className="flex gap-1">
                  <button onClick={() => setEdit(p)} className="hover:text-indigo-600">Edit</button>
                  <button onClick={() => confirm("Delete this project? Entries will keep their data but lose the project link.") && remove("projects", p.id)} className="hover:text-red-600">Delete</button>
                </span>
              </div>
            </Card>
          );
        })}
      </div>
      {!data.projects.length && <EmptyState text="No projects yet." action={<Button onClick={() => setAdding(true)}>Add your first project</Button>} />}
      <Modal open={adding} onClose={() => setAdding(false)} title="Add Project"><ProjectForm onSaved={() => setAdding(false)} /></Modal>
      <Modal open={!!edit} onClose={() => setEdit(null)} title="Edit Project">{edit && <ProjectForm initial={edit} onSaved={() => setEdit(null)} />}</Modal>
    </div>
  );
}
