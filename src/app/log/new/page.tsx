"use client";
import React, { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { WorkEntryForm } from "@/components/forms";
import { Card, PageHeader } from "@/components/ui";
import { cn } from "@/lib/utils";

export default function NewEntry() {
  const router = useRouter();
  const params = useSearchParams();
  const [tab, setTab] = useState<"quick" | "full">(params.get("quick") ? "quick" : "full");
  return (
    <div className="mx-auto max-w-xl">
      <PageHeader title="Log Work" />
      <div className="mb-4 flex rounded-lg border border-zinc-200 p-1 text-sm dark:border-zinc-700">
        {(["quick", "full"] as const).map((t) => (
          <button key={t} onClick={() => setTab(t)} className={cn("flex-1 rounded-md px-3 py-1.5 font-medium", tab === t ? "bg-indigo-600 text-white" : "text-zinc-500")}>
            {t === "quick" ? "Quick Log" : "Full Details"}
          </button>
        ))}
      </div>
      <Card>
        <WorkEntryForm quick={tab === "quick"} onSaved={() => router.push("/log")} />
      </Card>
      {tab === "quick" && <p className="mt-3 text-center text-xs text-zinc-500">Describe what you did, pick project/category/status, set minutes — done in under a minute.</p>}
    </div>
  );
}
