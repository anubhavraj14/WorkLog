"use client";
import React, { useState } from "react";
import { useStore } from "@/lib/store";
import { Card, Button, PageHeader, Input } from "@/components/ui";
import { generateReport, download, downloadPDF, exportCSV } from "@/lib/report";
import { ReportResult } from "@/lib/report";
import { weekRange, monthRange, fmtDate, parseISO } from "@/lib/utils";
import { addWeeks, addMonths, startOfDay, endOfDay, format } from "date-fns";
import { useProjectName } from "@/components/lists";
import { Copy, Download, FileDown } from "lucide-react";

const PRESETS = ["Today", "This Week", "Last Week", "This Month", "Last Month", "Custom"] as const;

export default function Reports() {
  const { data, settings } = useStore();
  const projName = useProjectName();
  const [preset, setPreset] = useState<(typeof PRESETS)[number]>("This Week");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [report, setReport] = useState<ReportResult | null>(null);
  const [copied, setCopied] = useState(false);

  const range = (): { start: Date; end: Date } => {
    const now = new Date();
    switch (preset) {
      case "Today": return { start: startOfDay(now), end: endOfDay(now) };
      case "This Week": return weekRange(now);
      case "Last Week": return weekRange(addWeeks(now, -1));
      case "This Month": return monthRange(now);
      case "Last Month": return monthRange(addMonths(now, -1));
      default: return { start: startOfDay(parseISO(from || format(now, "yyyy-MM-dd"))), end: endOfDay(parseISO(to || format(now, "yyyy-MM-dd"))) };
    }
  };

  const gen = () => {
    const { start, end } = range();
    setReport(generateReport(data, start, end, settings.name));
  };

  const copy = async () => {
    if (!report) return;
    await navigator.clipboard.writeText(report.markdown);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader title="Report Generator" />
      <Card className="mb-4 space-y-3">
        <div className="flex flex-wrap gap-2">
          {PRESETS.map((p) => (
            <button key={p} onClick={() => setPreset(p)} className={`rounded-lg px-3 py-1.5 text-sm font-medium ${preset === p ? "bg-indigo-600 text-white" : "border border-zinc-200 text-zinc-600 dark:border-zinc-700 dark:text-zinc-300"}`}>{p}</button>
          ))}
        </div>
        {preset === "Custom" && (
          <div className="flex gap-2">
            <Input type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
            <Input type="date" value={to} onChange={(e) => setTo(e.target.value)} />
          </div>
        )}
        <Button onClick={gen} className="w-full justify-center">Generate Report</Button>
      </Card>

      {report && (
        <>
          <div className="mb-3 flex flex-wrap gap-2">
            <Button variant="ghost" onClick={copy}><Copy size={14} /> {copied ? "Copied!" : "Copy Report"}</Button>
            <Button variant="ghost" onClick={() => downloadPDF("Work Report", report.markdown)}><FileDown size={14} /> Download PDF</Button>
            <Button variant="ghost" onClick={() => download(`worklog-report.md`, report.markdown)}><Download size={14} /> Markdown</Button>
            <Button variant="ghost" onClick={() => download(`worklog-data.csv`, exportCSV(report.entries, projName), "text/csv")}><FileDown size={14} /> Export CSV</Button>
            <Button variant="ghost" onClick={() => download(`worklog-export.json`, JSON.stringify({ generated: new Date().toISOString(), ...data }, null, 2), "application/json")}><FileDown size={14} /> Export JSON</Button>
          </div>
          <Card className="p-5">
            <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed">{report.markdown}</pre>
          </Card>
        </>
      )}
    </div>
  );
}
