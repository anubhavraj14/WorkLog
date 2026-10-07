"use client";
import React, { useState } from "react";
import { useStore } from "@/lib/store";
import {
  WorkEntry, Project, Evidence, Blocker, Meeting, LearningEntry,
  WORK_CATEGORIES, WORK_STATUSES, PRIORITIES, PROJECT_STATUSES, BLOCKER_STATUSES, EVIDENCE_TYPES,
} from "@/lib/types";
import { durationBetween, fmtDuration, todayStr, uid } from "@/lib/utils";
import { Button, Field, Input, Select, Textarea } from "./ui";

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
  const { data, add, update } = useStore();
  const [e, setE] = useState<WorkEntry>(initial ? { ...initial } : blankEntry());
  const [tagsRaw, setTagsRaw] = useState((initial?.tags ?? []).join(", "));
  const [saving, setSaving] = useState(false);
  const set = (p: Partial<WorkEntry>) => setE((prev) => ({ ...prev, ...p }));
  const dur = e.duration_min || durationBetween(e.start_time, e.end_time);

  const save = async () => {
    if (!e.title.trim()) return alert("Please enter a task title");
    setSaving(true);
    const item = { ...e, duration_min: durationBetween(e.start_time, e.end_time) || e.duration_min || 0, tags: tagsRaw.split(",").map((t) => t.trim()).filter(Boolean), project_id: e.project_id || null };
    if (initial) await update("workEntries", e.id, item);
    else await add("workEntries", item);
    setSaving(false);
    onSaved?.();
  };

  return (
    <div className="space-y-3">
      <Field label="What did you work on?">
        <Input autoFocus value={e.title} onChange={(ev) => set({ title: ev.target.value })} placeholder="e.g. Tested Ramp Creation Agent" />
      </Field>
      {!quick && (
        <Field label="What did you actually do?">
          <Textarea value={e.description} onChange={(ev) => set({ description: ev.target.value })} placeholder="Details, steps, findings…" />
        </Field>
      )}
      <div className="grid grid-cols-2 gap-3">
        <Field label="Project">
          <Select value={e.project_id ?? ""} onChange={(ev) => set({ project_id: ev.target.value || null })}>
            <option value="">— None —</option>
            {data.projects.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
          </Select>
        </Field>
        <Field label="Category">
          <Select value={e.category} onChange={(ev) => set({ category: ev.target.value as WorkEntry["category"] })}>
            {WORK_CATEGORIES.map((c) => <option key={c}>{c}</option>)}
          </Select>
        </Field>
        <Field label="Status">
          <Select value={e.status} onChange={(ev) => set({ status: ev.target.value as WorkEntry["status"] })}>
            {WORK_STATUSES.map((s) => <option key={s}>{s}</option>)}
          </Select>
        </Field>
        <Field label="Priority">
          <Select value={e.priority} onChange={(ev) => set({ priority: ev.target.value as WorkEntry["priority"] })}>
            {PRIORITIES.map((p) => <option key={p}>{p}</option>)}
          </Select>
        </Field>
        <Field label="Date">
          <Input type="date" value={e.date} onChange={(ev) => set({ date: ev.target.value })} />
        </Field>
        <Field label={quick ? "Duration (minutes)" : `Start time${dur ? ` · ${fmtDuration(dur)}` : ""}`}>
          {quick ? (
            <Input type="number" min={0} value={e.duration_min || ""} onChange={(ev) => set({ duration_min: Number(ev.target.value) })} placeholder="120" />
          ) : (
            <Input type="time" value={e.start_time} onChange={(ev) => set({ start_time: ev.target.value })} />
          )}
        </Field>
        {!quick && (
          <Field label="End time">
            <Input type="time" value={e.end_time} onChange={(ev) => set({ end_time: ev.target.value })} />
          </Field>
        )}
        <Field label="Extra hours?">
          <Select value={e.is_extra ? "yes" : "no"} onChange={(ev) => set({ is_extra: ev.target.value === "yes" })}>
            <option value="no">No</option>
            <option value="yes">Yes</option>
          </Select>
        </Field>
        {e.is_extra && (
          <Field label="Reason for extra hours">
            <Input value={e.extra_reason} onChange={(ev) => set({ extra_reason: ev.target.value })} placeholder="e.g. Additional testing requested" />
          </Field>
        )}
        {!quick && (
          <Field label="Tags (comma separated)">
            <Input value={tagsRaw} onChange={(ev) => setTagsRaw(ev.target.value)} placeholder="AI Agents, Testing" />
          </Field>
        )}
      </div>
      {!quick && (
        <>
          <Field label="What I accomplished"><Textarea value={e.accomplishments} onChange={(ev) => set({ accomplishments: ev.target.value })} /></Field>
          <Field label="Issues found"><Textarea value={e.issues_found} onChange={(ev) => set({ issues_found: ev.target.value })} /></Field>
          <Field label="Notes"><Textarea value={e.notes} onChange={(ev) => set({ notes: ev.target.value })} /></Field>
        </>
      )}
      <Button onClick={save} disabled={saving} className="w-full justify-center">{saving ? "Saving…" : initial ? "Save changes" : "Log work"}</Button>
    </div>
  );
}

export function ProjectForm({ initial, onSaved }: { initial?: Project; onSaved?: () => void }) {
  const { add, update } = useStore();
  const [p, setP] = useState<Project>(initial ?? { id: uid(), name: "", description: "", client: "", start_date: todayStr(), end_date: "", status: "Active", notes: "" });
  const set = (x: Partial<Project>) => setP((prev) => ({ ...prev, ...x }));
  const save = async () => {
    if (!p.name.trim()) return alert("Enter a project name");
    if (initial) await update("projects", p.id, p); else await add("projects", p);
    onSaved?.();
  };
  return (
    <div className="space-y-3">
      <Field label="Project name"><Input autoFocus value={p.name} onChange={(e) => set({ name: e.target.value })} /></Field>
      <Field label="Description"><Textarea value={p.description} onChange={(e) => set({ description: e.target.value })} /></Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Company / client"><Input value={p.client} onChange={(e) => set({ client: e.target.value })} /></Field>
        <Field label="Status"><Select value={p.status} onChange={(e) => set({ status: e.target.value as Project["status"] })}>{PROJECT_STATUSES.map((s) => <option key={s}>{s}</option>)}</Select></Field>
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
  const [ev, setEv] = useState<Evidence>(initial ?? { id: uid(), name: "", type: "Link", url: "", file_path: "", project_id: null, work_entry_id: workEntryId ?? null, description: "", date: todayStr() });
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const set = (x: Partial<Evidence>) => setEv((prev) => ({ ...prev, ...x }));
  const save = async () => {
    if (!ev.name.trim()) return alert("Enter an evidence name");
    setBusy(true);
    let url = ev.url;
    if (file) url = await uploadFile(file);
    const item = { ...ev, url };
    if (initial) await update("evidence", ev.id, item); else await add("evidence", item);
    setBusy(false);
    onSaved?.();
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
      <Button onClick={save} disabled={busy} className="w-full justify-center">{busy ? "Saving…" : "Save evidence"}</Button>
    </div>
  );
}

export function BlockerForm({ initial, onSaved }: { initial?: Blocker; onSaved?: () => void }) {
  const { data, add, update } = useStore();
  const [b, setB] = useState<Blocker>(initial ?? { id: uid(), title: "", project_id: null, waiting_for: "", description: "", status: "Open", created_date: todayStr(), resolution: "", resolution_date: "", resolved_by: "", resolution_notes: "" });
  const set = (x: Partial<Blocker>) => setB((prev) => ({ ...prev, ...x }));
  const save = async () => {
    if (!b.title.trim()) return alert("Enter a blocker title");
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
        <Field label="Status"><Select value={b.status} onChange={(e) => set({ status: e.target.value as Blocker["status"] })}>{BLOCKER_STATUSES.map((s) => <option key={s}>{s}</option>)}</Select></Field>
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
  const [m, setM] = useState<Meeting>(initial ?? { id: uid(), name: "", date: todayStr(), start_time: "", end_time: "", attendees: "", project_id: null, discussion: "", decisions: "", action_items: "", follow_up_date: "", notes: "" });
  const set = (x: Partial<Meeting>) => setM((prev) => ({ ...prev, ...x }));
  const save = async () => {
    if (!m.name.trim()) return alert("Enter a meeting name");
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
  const [l, setL] = useState<LearningEntry>(initial ?? { id: uid(), topic: "", course: "", date: todayStr(), duration_min: 0, learned: "", notes: "", certificate_url: "" });
  const set = (x: Partial<LearningEntry>) => setL((prev) => ({ ...prev, ...x }));
  const save = async () => {
    if (!l.topic.trim()) return alert("Enter a topic");
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
