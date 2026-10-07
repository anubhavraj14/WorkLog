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
    <div className="mx-auto max-w-2xl">
      <PageHeader title="Log Work" sub="Capture what you did — takes less than a minute" />
      <div className="mb-5 inline-flex rounded-xl border border-zinc-200 bg-zinc-50 p-1 text-sm dark:border-zinc-800 dark:bg-zinc-900">
        {(["quick", "full"] as const).map((t) => (
          <button key={t} onClick={() => setTab(t)} className={cn("rounded-lg px-5 py-1.5 font-medium transition-all", tab === t ? "bg-white text-zinc-900 shadow-sm dark:bg-zinc-800 dark:text-white" : "text-zinc-500")}>
            {t === "quick" ? "Quick Log" : "Full Details"}
          </button>
        ))}
      </div>
      <Card className="p-5">
        <WorkEntryForm quick={tab === "quick"} onSaved={() => router.push("/log")} />
      </Card>
      {tab === "quick" && <p className="mt-3 text-center text-xs text-zinc-500">Describe what you did, pick details, set minutes — done.</p>}
    </div>
  );
}
