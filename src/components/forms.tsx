"use client";
import React, { useState } from "react";
import { useStore } from "@/lib/store";
import {
  WorkEntry, Project, Evidence, Blocker, Meeting, LearningEntry,
  WORK_CATEGORIES, WORK_STATUSES, PRIORITIES, PROJECT_STATUSES, BLOCKER_STATUSES, EVIDENCE_TYPES,
} from "@/lib/types";
import { durationBetween, fmtDuration, todayStr, uid } from "@/lib/utils";
import { splitWorkMinutes } from "@/lib/work-hours";
import { Button, Field, Input, Select, Textarea, Seg, Section } from "./ui";
import { useDialog } from "./dialog-provider";

const now = () => {
  const d = new Date();
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
};

const blankEntry = (): WorkEntry => ({
  id: uid(), title: "", description: "", project_id: null, category: "Development",
  status: "Completed", priority: "Medium", date: todayStr(), start_time: now(), end_time: "",
  duration_min: 0, is_extra: false, extra_reason: "", tags: [], notes: "", accomplishments: "", issues_found: "",
});

export function WorkEntryForm({ initial, quick, onSaved }: { initial?: WorkEntry; quick?: boolean; onSaved?: () => void }) {
  const { data, settings, add, update, saveSettings } = useStore();
  const dialog = useDialog();
  const [e, setE] = useState<WorkEntry>(initial ? { ...initial } : blankEntry());
  const [tagsRaw, setTagsRaw] = useState((initial?.tags ?? []).join(", "));
  const [selectedTemplateId, setSelectedTemplateId] = useState("");
  const [saving, setSaving] = useState(false);
  const set = (p: Partial<WorkEntry>) => setE((prev) => ({ ...prev, ...p }));
  const dur = e.duration_min || durationBetween(e.start_time, e.end_time);
  const split = splitWorkMinutes({ ...e, duration_min: dur }, settings);
  const applyTemplate = (id: string) => {
    setSelectedTemplateId(id);
    const template = settings.work_templates.find((item) => item.id === id);
    if (!template) return;
    set({
      title: template.title,
      description: template.description,
      project_id: template.project_id,
      category: template.category,
      status: template.status ?? e.status,
      priority: template.priority,
      start_time: template.start_time ?? e.start_time,
      end_time: template.end_time ?? e.end_time,
      duration_min: template.duration_min ?? e.duration_min,
      extra_reason: template.extra_reason ?? "",
      tags: template.tags,
      accomplishments: template.accomplishments ?? "",
      issues_found: template.issues_found ?? "",
      notes: template.notes ?? "",
    });
    setTagsRaw(template.tags.join(", "));
    if (template.accomplishments || template.issues_found || template.notes) setShowMore(true);
  };
  const saveTemplate = async () => {
    if (!e.title.trim()) return void dialog.alert("Enter a task title before saving a template.");
    const selectedTemplate = settings.work_templates.find((item) => item.id === selectedTemplateId);
    const name = (await dialog.prompt("Choose a name for this reusable work template.", selectedTemplate?.name ?? e.title, "Save work template"))?.trim();
    if (!name) return;
    const existing = settings.work_templates.find((item) => item.name.toLowerCase() === name.toLowerCase());
    const template = {
      id: existing?.id ?? uid(), name, title: e.title, description: e.description, project_id: e.project_id,
      category: e.category, status: e.status, priority: e.priority, start_time: e.start_time,
      end_time: e.end_time, duration_min: dur, extra_reason: e.extra_reason,
      tags: tagsRaw.split(",").map((tag) => tag.trim()).filter(Boolean), accomplishments: e.accomplishments,
      issues_found: e.issues_found, notes: e.notes,
    };
    const work_templates = existing
      ? settings.work_templates.map((item) => item.id === existing.id ? template : item)
      : [...settings.work_templates, template];
    await saveSettings({ ...settings, work_templates });
    setSelectedTemplateId(template.id);
  };
  const deleteTemplate = async () => {
    const template = settings.work_templates.find((item) => item.id === selectedTemplateId);
    if (!template || !await dialog.confirm(`Delete the “${template.name}” template?`, { title: "Delete template?", destructive: true })) return;
    await saveSettings({ ...settings, work_templates: settings.work_templates.filter((item) => item.id !== template.id) });
    setSelectedTemplateId("");
  };

  const save = async () => {
    if (!e.title.trim()) return void dialog.alert("Please enter a task title.");
    setSaving(true);
    try {
      const duration_min = durationBetween(e.start_time, e.end_time) || e.duration_min || 0;
      const { extra } = splitWorkMinutes({ ...e, duration_min }, settings);
      const item = { ...e, duration_min, is_extra: extra > 0, tags: tagsRaw.split(",").map((t) => t.trim()).filter(Boolean), project_id: e.project_id || null };
      if (initial) await update("workEntries", e.id, item);
      else {
        await add("workEntries", item);
        setE(blankEntry());
        setTagsRaw("");
        setSelectedTemplateId("");
        setShowMore(false);
      }
      onSaved?.();
    } catch (error) {
      await dialog.alert(error instanceof Error ? error.message : "Unable to save this work log. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const [showMore, setShowMore] = useState(!!initial);
  return (
    <div className="space-y-6">
      {/* Task */}
      <div className="space-y-3">
        {!initial && settings.work_templates.length > 0 && (
          <Field label="Start from a reusable template">
            <div className="flex gap-2">
              <Select value={selectedTemplateId} onChange={(ev) => applyTemplate(ev.target.value)}>
                <option value="">Choose a template…</option>
                {settings.work_templates.map((template) => <option key={template.id} value={template.id}>{template.name}</option>)}
              </Select>
              {selectedTemplateId && <Button variant="danger" onClick={deleteTemplate}>Delete</Button>}
            </div>
          </Field>
        )}
        <Field label="What did you work on?">
          <Input autoFocus value={e.title} onChange={(ev) => set({ title: ev.target.value })} placeholder="e.g. Tested Ramp Creation Agent" className="text-[15px]" />
        </Field>
        {!quick && (
          <Field label="What did you actually do?">
            <Textarea value={e.description} onChange={(ev) => set({ description: ev.target.value })} placeholder="Details, steps, findings…" />
          </Field>
        )}
      </div>

      {/* Classification */}
      <Section title="Details">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Project">
            <Select value={e.project_id ?? ""} onChange={(ev) => set({ project_id: ev.target.value || null })}>
              <option value="">No project</option>
              {data.projects.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
            </Select>
          </Field>
          <Field label="Priority">
            <Seg value={e.priority} onChange={(v) => set({ priority: v })} options={PRIORITIES} />
          </Field>
        </div>
        <Field label="Category">
          <Seg value={e.category} onChange={(v) => set({ category: v })} options={WORK_CATEGORIES} />
        </Field>
        <Field label="Status">
          <Seg value={e.status} onChange={(v) => set({ status: v })} options={WORK_STATUSES}
            color={(s) => s === "Completed" ? "bg-emerald-600 text-white" : s === "Blocked" ? "bg-red-600 text-white" : s === "In Progress" ? "bg-blue-600 text-white" : undefined} />
        </Field>
      </Section>

      {/* Time */}
      <Section title="Time">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          <Field label="Date"><Input type="date" value={e.date} onChange={(ev) => set({ date: ev.target.value })} /></Field>
          {quick ? (
            <Field label="Duration (min)"><Input type="number" min={0} value={e.duration_min || ""} onChange={(ev) => set({ duration_min: Number(ev.target.value) })} placeholder="120" /></Field>
          ) : (
            <>
              <Field label="Start"><Input type="time" value={e.start_time} onChange={(ev) => set({ start_time: ev.target.value })} /></Field>
              <Field label="End"><Input type="time" value={e.end_time} onChange={(ev) => set({ end_time: ev.target.value })} /></Field>
            </>
          )}
        </div>
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-zinc-50 px-3.5 py-3 text-sm dark:bg-zinc-800/60">
          <div><span className="text-zinc-500">Duration</span> <span className="font-semibold">{dur ? fmtDuration(dur) : "—"}</span></div>
          {dur > 0 && <div><span className="text-zinc-500">Normal</span> <span className="font-semibold">{fmtDuration(split.normal)}</span> <span className="ml-2 text-zinc-500">Extra</span> <span className="font-semibold text-purple-600">{fmtDuration(split.extra)}</span></div>}
        </div>
        {split.extra > 0 && (
          <Field label="Reason for extra hours">
            <Input value={e.extra_reason} onChange={(ev) => set({ extra_reason: ev.target.value })} placeholder="e.g. Additional testing requested" />
          </Field>
        )}
      </Section>

      {/* Optional extras */}
      {!quick && (
        showMore ? (
          <Section title="More">
            <Field label="Tags" hint="comma separated"><Input value={tagsRaw} onChange={(ev) => setTagsRaw(ev.target.value)} placeholder="AI Agents, Testing" /></Field>
            <Field label="What I accomplished"><Textarea value={e.accomplishments} onChange={(ev) => set({ accomplishments: ev.target.value })} /></Field>
            <Field label="Issues found"><Textarea value={e.issues_found} onChange={(ev) => set({ issues_found: ev.target.value })} /></Field>
            <Field label="Notes"><Textarea value={e.notes} onChange={(ev) => set({ notes: ev.target.value })} /></Field>
          </Section>
        ) : (
          <button type="button" onClick={() => setShowMore(true)} className="text-sm font-medium text-indigo-600 hover:underline">
            + Add tags, accomplishments, issues & notes
          </button>
        )
      )}

      {!initial && <Button variant="ghost" onClick={saveTemplate} className="w-full justify-center">Save current details as template</Button>}
      <Button onClick={save} disabled={saving} className="w-full justify-center py-2.5">{saving ? "Saving…" : initial ? "Save changes" : "Log work"}</Button>
    </div>
  );
}

export function ProjectForm({ initial, onSaved }: { initial?: Project; onSaved?: () => void }) {
  const { add, update } = useStore();
  const dialog = useDialog();
  const [p, setP] = useState<Project>(initial ?? { id: uid(), name: "", description: "", client: "", start_date: todayStr(), end_date: "", status: "Active", notes: "" });
  const set = (x: Partial<Project>) => setP((prev) => ({ ...prev, ...x }));
  const save = async () => {
    if (!p.name.trim()) return void dialog.alert("Enter a project name.");
    const payload = { ...p, end_date: p.end_date || null } as Project & { end_date: string | null };
    if (initial) await update("projects", p.id, payload); else await add("projects", payload);
    onSaved?.();
  };
  return (
    <div className="space-y-3">
      <Field label="Project name"><Input autoFocus value={p.name} onChange={(e) => set({ name: e.target.value })} /></Field>
      <Field label="Description"><Textarea value={p.description} onChange={(e) => set({ description: e.target.value })} /></Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Company / client"><Input value={p.client} onChange={(e) => set({ client: e.target.value })} /></Field>
        <Field label="Status"><Seg value={p.status} onChange={(v) => set({ status: v })} options={PROJECT_STATUSES} /></Field>
        <Field label="Start date"><Input type="date" value={p.start_date} onChange={(e) => set({ start_date: e.target.value })} /></Field>
        <Field label="End date"><Input type="date" value={p.end_date} onChange={(e) => set({ end_date: e.target.value })} /></Field>
      </div>
      <Field label="Notes"><Textarea value={p.notes} onChange={(e) => set({ notes: e.target.value })} /></Field>
      <Button onClick={save} className="w-full justify-center">Save project</Button>
    </div>
  );
}

export function EvidenceForm({ initial, workEntryId, onSaved }: { initial?: Evidence; workEntryId?: string; onSaved?: () => void }) {
  const { data, add, update, uploadFile } = useStore();
  const dialog = useDialog();
  const [ev, setEv] = useState<Evidence>(initial ?? { id: uid(), name: "", type: "Link", url: "", file_path: "", project_id: null, work_entry_id: workEntryId ?? null, description: "", date: todayStr() });
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const set = (x: Partial<Evidence>) => setEv((prev) => ({ ...prev, ...x }));
  const save = async () => {
    if (!ev.name.trim()) return void dialog.alert("Enter an evidence name.");
    setBusy(true);
    setError(null);
    try {
      let url = ev.url;
      let file_path = ev.file_path;
      if (file) ({ url, path: file_path } = await uploadFile(file));
      const item = { ...ev, url, file_path };
      if (initial) await update("evidence", ev.id, item); else await add("evidence", item);
      onSaved?.();
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  };
  return (
    <div className="space-y-3">
      <Field label="Evidence name"><Input autoFocus value={ev.name} onChange={(e) => set({ name: e.target.value })} placeholder="e.g. Screenshot of the issue" /></Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Type"><Select value={ev.type} onChange={(e) => set({ type: e.target.value as Evidence["type"] })}>{EVIDENCE_TYPES.map((t) => <option key={t}>{t}</option>)}</Select></Field>
        <Field label="Date"><Input type="date" value={ev.date} onChange={(e) => set({ date: e.target.value })} /></Field>
        <Field label="Project">
          <Select value={ev.project_id ?? ""} onChange={(e) => set({ project_id: e.target.value || null })}>
            <option value="">— None —</option>
            {data.projects.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
          </Select>
        </Field>
        <Field label="Related task">
          <Select value={ev.work_entry_id ?? ""} onChange={(e) => set({ work_entry_id: e.target.value || null })}>
            <option value="">— None —</option>
            {data.workEntries.map((w) => <option key={w.id} value={w.id}>{w.title}</option>)}
          </Select>
        </Field>
      </div>
      <Field label="Link (paste URL)"><Input value={ev.url} onChange={(e) => set({ url: e.target.value })} placeholder="https://…" /></Field>
      <Field label="Or upload a file"><Input type="file" onChange={(e) => setFile(e.target.files?.[0] ?? null)} /></Field>
      <Field label="Description"><Textarea value={ev.description} onChange={(e) => set({ description: e.target.value })} /></Field>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <Button onClick={save} disabled={busy} className="w-full justify-center">{busy ? "Saving…" : "Save evidence"}</Button>
    </div>
  );
}

export function BlockerForm({ initial, onSaved }: { initial?: Blocker; onSaved?: () => void }) {
  const { data, add, update } = useStore();
  const dialog = useDialog();
  const [b, setB] = useState<Blocker>(initial ?? { id: uid(), title: "", project_id: null, waiting_for: "", description: "", status: "Open", created_date: todayStr(), resolution: "", resolution_date: "", resolved_by: "", resolution_notes: "" });
  const set = (x: Partial<Blocker>) => setB((prev) => ({ ...prev, ...x }));
  const save = async () => {
    if (!b.title.trim()) return void dialog.alert("Enter a blocker title.");
    if (initial) await update("blockers", b.id, b); else await add("blockers", b);
    onSaved?.();
  };
  return (
    <div className="space-y-3">
      <Field label="Blocker"><Input autoFocus value={b.title} onChange={(e) => set({ title: e.target.value })} placeholder="e.g. Waiting for access to testing instance" /></Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Project">
          <Select value={b.project_id ?? ""} onChange={(e) => set({ project_id: e.target.value || null })}>
            <option value="">— None —</option>
            {data.projects.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
          </Select>
        </Field>
        <Field label="Waiting for"><Input value={b.waiting_for} onChange={(e) => set({ waiting_for: e.target.value })} placeholder="Team / person" /></Field>
        <Field label="Status"><Seg value={b.status} onChange={(v) => set({ status: v })} options={BLOCKER_STATUSES}
          color={(s) => s === "Resolved" ? "bg-emerald-600 text-white" : s === "Open" ? "bg-red-600 text-white" : s === "Waiting" ? "bg-amber-500 text-white" : undefined} /></Field>
        <Field label="Created"><Input type="date" value={b.created_date} onChange={(e) => set({ created_date: e.target.value })} /></Field>
      </div>
      <Field label="Description"><Textarea value={b.description} onChange={(e) => set({ description: e.target.value })} /></Field>
      {b.status === "Resolved" && (
        <>
          <Field label="Resolution"><Input value={b.resolution} onChange={(e) => set({ resolution: e.target.value })} /></Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Resolution date"><Input type="date" value={b.resolution_date} onChange={(e) => set({ resolution_date: e.target.value })} /></Field>
            <Field label="Resolved by"><Input value={b.resolved_by} onChange={(e) => set({ resolved_by: e.target.value })} /></Field>
          </div>
          <Field label="Resolution notes"><Textarea value={b.resolution_notes} onChange={(e) => set({ resolution_notes: e.target.value })} /></Field>
        </>
      )}
      <Button onClick={save} className="w-full justify-center">Save blocker</Button>
    </div>
  );
}

export function MeetingForm({ initial, onSaved }: { initial?: Meeting; onSaved?: () => void }) {
  const { data, add, update } = useStore();
  const dialog = useDialog();
  const [m, setM] = useState<Meeting>(initial ?? { id: uid(), name: "", date: todayStr(), start_time: "", end_time: "", attendees: "", project_id: null, discussion: "", decisions: "", action_items: "", follow_up_date: "", notes: "" });
  const set = (x: Partial<Meeting>) => setM((prev) => ({ ...prev, ...x }));
  const save = async () => {
    if (!m.name.trim()) return void dialog.alert("Enter a meeting name.");
    if (initial) await update("meetings", m.id, m); else await add("meetings", m);
    onSaved?.();
  };
  return (
    <div className="space-y-3">
      <Field label="Meeting name"><Input autoFocus value={m.name} onChange={(e) => set({ name: e.target.value })} /></Field>
      <div className="grid grid-cols-3 gap-3">
        <Field label="Date"><Input type="date" value={m.date} onChange={(e) => set({ date: e.target.value })} /></Field>
        <Field label="Start"><Input type="time" value={m.start_time} onChange={(e) => set({ start_time: e.target.value })} /></Field>
        <Field label="End"><Input type="time" value={m.end_time} onChange={(e) => set({ end_time: e.target.value })} /></Field>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Field label="People involved"><Input value={m.attendees} onChange={(e) => set({ attendees: e.target.value })} /></Field>
        <Field label="Project">
          <Select value={m.project_id ?? ""} onChange={(e) => set({ project_id: e.target.value || null })}>
            <option value="">— None —</option>
            {data.projects.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
          </Select>
        </Field>
      </div>
      <Field label="What was discussed"><Textarea value={m.discussion} onChange={(e) => set({ discussion: e.target.value })} /></Field>
      <Field label="Important decisions"><Textarea value={m.decisions} onChange={(e) => set({ decisions: e.target.value })} /></Field>
      <Field label="Action items"><Textarea value={m.action_items} onChange={(e) => set({ action_items: e.target.value })} /></Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Follow-up date"><Input type="date" value={m.follow_up_date} onChange={(e) => set({ follow_up_date: e.target.value })} /></Field>
        <Field label="Notes"><Input value={m.notes} onChange={(e) => set({ notes: e.target.value })} /></Field>
      </div>
      <Button onClick={save} className="w-full justify-center">Save meeting</Button>
    </div>
  );
}

export function LearningForm({ initial, onSaved }: { initial?: LearningEntry; onSaved?: () => void }) {
  const { add, update } = useStore();
  const dialog = useDialog();
  const [l, setL] = useState<LearningEntry>(initial ?? { id: uid(), topic: "", course: "", date: todayStr(), duration_min: 0, learned: "", notes: "", certificate_url: "" });
  const set = (x: Partial<LearningEntry>) => setL((prev) => ({ ...prev, ...x }));
  const save = async () => {
    if (!l.topic.trim()) return void dialog.alert("Enter a topic.");
    if (initial) await update("learning", l.id, l); else await add("learning", l);
    onSaved?.();
  };
  return (
    <div className="space-y-3">
      <Field label="Topic"><Input autoFocus value={l.topic} onChange={(e) => set({ topic: e.target.value })} placeholder="e.g. ServiceNow AI Agents" /></Field>
      <div className="grid grid-cols-3 gap-3">
        <Field label="Course / training"><Input value={l.course} onChange={(e) => set({ course: e.target.value })} /></Field>
        <Field label="Date"><Input type="date" value={l.date} onChange={(e) => set({ date: e.target.value })} /></Field>
        <Field label="Time spent (min)"><Input type="number" min={0} value={l.duration_min || ""} onChange={(e) => set({ duration_min: Number(e.target.value) })} /></Field>
      </div>
      <Field label="What I learned"><Textarea value={l.learned} onChange={(e) => set({ learned: e.target.value })} /></Field>
      <Field label="Notes"><Textarea value={l.notes} onChange={(e) => set({ notes: e.target.value })} /></Field>
      <Field label="Certificate / link"><Input value={l.certificate_url} onChange={(e) => set({ certificate_url: e.target.value })} placeholder="https://…" /></Field>
      <Button onClick={save} className="w-full justify-center">Save learning</Button>
    </div>
  );
}
