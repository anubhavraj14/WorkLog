"use client";
import React from "react";
import { useParams } from "next/navigation";
import { useStore } from "@/lib/store";
import { PageHeader, EmptyState, Button } from "@/components/ui";
import { EntryRow } from "@/components/lists";

export default function TagPage() {
  const { tag } = useParams<{ tag: string }>();
  const decoded = decodeURIComponent(tag);
  const { data } = useStore();
  const entries = data.workEntries.filter((e) => e.tags.map((t) => t.toLowerCase()).includes(decoded.toLowerCase()));
  const allTags = [...new Set(data.workEntries.flatMap((e) => e.tags))];

  return (
    <div>
      <PageHeader title={`#${decoded}`} />
      <div className="mb-4 flex flex-wrap gap-1.5">
        {allTags.map((t) => (
          <a key={t} href={`/tags/${encodeURIComponent(t)}`} className={`rounded-full px-2.5 py-1 text-xs ${t === decoded ? "bg-indigo-600 text-white" : "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300"}`}>#{t}</a>
        ))}
      </div>
      <div className="space-y-2">{entries.map((e) => <EntryRow key={e.id} e={e} />)}</div>
      {!entries.length && <EmptyState text={`Nothing tagged “${decoded}”.`} action={<Button href="/log/new">Log work</Button>} />}
    </div>
  );
}
