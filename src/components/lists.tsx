"use client";
import React from "react";
import Link from "next/link";
import { useStore } from "@/lib/store";
import { WorkEntry } from "@/lib/types";
import { fmtDateShort, fmtDuration, fmtTime } from "@/lib/utils";
import { StatusBadge, CategoryBadge, TagPill, SampleMark } from "./ui";

export function useProjectName() {
  const { data } = useStore();
  return (id: string | null) => data.projects.find((p) => p.id === id)?.name ?? "—";
}

export function EntryRow({ e }: { e: WorkEntry }) {
  const projName = useProjectName();
  return (
    <Link href={`/log/${e.id}`} className="block rounded-xl border border-zinc-200 bg-white p-3 transition-colors hover:border-indigo-300 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-indigo-700">
      <div className="flex flex-wrap items-center gap-2">
        <span className="font-medium">{e.title}{e.is_sample && <SampleMark />}</span>
        <StatusBadge s={e.status} />
        {e.is_extra && <span className="rounded-full bg-purple-100 px-2 py-0.5 text-xs font-medium text-purple-700 dark:bg-purple-950 dark:text-purple-300">Extra</span>}
      </div>
      <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-zinc-500">
        <span>{fmtDateShort(e.date)}</span>
        <span>{projName(e.project_id)}</span>
        <CategoryBadge c={e.category} />
        {(e.start_time && e.end_time) && <span>{fmtTime(e.start_time)} – {fmtTime(e.end_time)}</span>}
        <span className="font-medium text-zinc-700 dark:text-zinc-300">{fmtDuration(e.duration_min)}</span>
      </div>
      {e.description && <p className="mt-1 line-clamp-2 text-sm text-zinc-600 dark:text-zinc-400">{e.description}</p>}
      {e.tags.length > 0 && <div className="mt-2 flex flex-wrap gap-1">{e.tags.map((t) => <TagPill key={t} tag={t} />)}</div>}
    </Link>
  );
}
