"use client";
import React, { useRef, useState } from "react";
import { useStore } from "@/lib/store";
import { Card, Button, PageHeader, Field, Input, Select } from "@/components/ui";
import { download } from "@/lib/report";
import { useTheme } from "next-themes";
import { useDialog } from "@/components/dialog-provider";
import { CHART_PALETTES } from "@/components/charts";

const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default function SettingsPage() {
  const { settings, saveSettings, exportAll, importAll, mode, userEmail, signOut } = useStore();
  const { setTheme } = useTheme();
  const dialog = useDialog();
  const [s, setS] = useState(settings);
  const [saved, setSaved] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const set = (p: Partial<typeof s>) => setS((prev) => ({ ...prev, ...p }));

  const save = async () => {
    await saveSettings(s);
    if (s.theme !== "system") setTheme(s.theme);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="mx-auto max-w-xl space-y-4">
      <PageHeader title="Settings" />
      <Card className="space-y-3">
        <h2 className="text-sm font-semibold">Profile</h2>
        <Field label="Name"><Input value={s.name} onChange={(e) => set({ name: e.target.value })} /></Field>
        <Field label="Job title"><Input value={s.title} onChange={(e) => set({ title: e.target.value })} placeholder="Software Engineer" /></Field>
        {mode === "cloud" && <p className="text-xs text-zinc-500">Signed in as {userEmail}</p>}
      </Card>

      <Card className="space-y-3">
        <h2 className="text-sm font-semibold">Working Hours</h2>
        <Field label="Normal hours per day"><Input type="number" min={1} max={16} value={s.work_hours_per_day} onChange={(e) => set({ work_hours_per_day: Number(e.target.value) })} /></Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Work starts"><Input type="time" value={s.work_start_time} onChange={(e) => set({ work_start_time: e.target.value })} /></Field>
          <Field label="Work ends"><Input type="time" value={s.work_end_time} onChange={(e) => set({ work_end_time: e.target.value })} /></Field>
        </div>
        <div>
          <span className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">Working days</span>
          <div className="flex gap-1.5">
            {DAY_NAMES.map((d, i) => (
              <button key={d} onClick={() => set({ working_days: s.working_days.includes(i) ? s.working_days.filter((x) => x !== i) : [...s.working_days, i] })}
                className={`h-9 w-9 rounded-lg text-xs font-medium ${s.working_days.includes(i) ? "bg-indigo-600 text-white" : "border border-zinc-200 text-zinc-500 dark:border-zinc-700"}`}>{d}</button>
            ))}
          </div>
        </div>
        <Field label="Theme">
          <Select value={s.theme} onChange={(e) => set({ theme: e.target.value as typeof s.theme })}>
            <option value="light">Light</option><option value="dark">Dark</option><option value="system">System</option>
          </Select>
        </Field>
        <Field label="Chart colors">
          <div className="grid grid-cols-2 gap-2">
            {CHART_PALETTES.map((palette) => (
              <button key={palette.id} type="button" onClick={() => set({ chart_palette: palette.id })} className={`flex items-center gap-2 rounded-xl border p-2.5 text-left text-sm transition-colors ${s.chart_palette === palette.id ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-950/40" : "border-zinc-200 hover:border-zinc-300 dark:border-zinc-700 dark:hover:border-zinc-600"}`}>
                <span className="flex overflow-hidden rounded-full">
                  <span className="h-5 w-5" style={{ backgroundColor: palette.working }} />
                  <span className="h-5 w-5" style={{ backgroundColor: palette.extra }} />
                </span>
                <span className="font-medium">{palette.name}</span>
              </button>
            ))}
          </div>
        </Field>
      </Card>

      {s.work_templates.length > 0 && (
        <Card className="space-y-3">
          <h2 className="text-sm font-semibold">Work Templates</h2>
          {s.work_templates.map((template) => (
            <div key={template.id} className="flex items-center justify-between gap-3 rounded-lg border border-zinc-200 p-2.5 text-sm dark:border-zinc-800">
              <span>{template.name}</span>
              <button onClick={() => set({ work_templates: s.work_templates.filter((item) => item.id !== template.id) })} className="text-xs text-red-600 hover:underline">Delete</button>
            </div>
          ))}
        </Card>
      )}

      <Button onClick={save} className="w-full justify-center">{saved ? "Saved" : "Save settings"}</Button>

      <Card className="space-y-3">
        <h2 className="text-sm font-semibold">Data Management</h2>
        <div className="grid grid-cols-2 gap-2">
          <Button variant="ghost" onClick={() => download("worklog-backup.json", exportAll(), "application/json")} className="justify-center">Export all data (JSON)</Button>
          <Button variant="ghost" onClick={() => fileRef.current?.click()} className="justify-center">Import data</Button>
          <input ref={fileRef} type="file" accept=".json" className="hidden" onChange={async (e) => {
            const f = e.target.files?.[0];
            if (f && await dialog.confirm("Imported records will be added alongside your existing data.", { title: "Import this backup?" })) await importAll(await f.text());
            e.target.value = "";
          }} />
        </div>
        {mode === "cloud" && <Button variant="ghost" onClick={signOut}>Sign out</Button>}
        <p className="text-xs text-zinc-500">
          {mode === "demo"
            ? "Demo mode: data is stored in this browser only. Add Supabase credentials (.env.local) to enable accounts and cross-device sync — see README."
            : "Cloud mode: all data is synced to your Supabase project."}
        </p>
      </Card>
    </div>
  );
}
