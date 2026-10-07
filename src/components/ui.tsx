"use client";
import React from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { WorkStatus, Priority, ProjectStatus, BlockerStatus, WorkCategory } from "@/lib/types";
import { X } from "lucide-react";

export function Card({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn("rounded-2xl border border-zinc-200/80 bg-white p-4 shadow-[0_1px_2px_rgba(0,0,0,0.04)] dark:border-zinc-800 dark:bg-zinc-900", className)}>
      {children}
    </div>
  );
}

export function PageHeader({ title, sub, children }: { title: string; sub?: string; children?: React.ReactNode }) {
  return (
    <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">{title}</h1>
        {sub && <p className="mt-0.5 text-sm text-zinc-500">{sub}</p>}
      </div>
      <div className="flex items-center gap-2">{children}</div>
    </div>
  );
}

type BtnProps = React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "primary" | "ghost" | "danger"; href?: string };
export function Button({ variant = "primary", href, className, ...props }: BtnProps) {
  const cls = cn(
    "inline-flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-sm font-medium transition-all active:scale-[0.98] disabled:opacity-50",
    variant === "primary" && "bg-zinc-900 text-white hover:bg-zinc-700 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200",
    variant === "ghost" && "border border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800",
    variant === "danger" && "border border-red-200 bg-white text-red-600 hover:bg-red-50 dark:border-red-900 dark:bg-zinc-900 dark:text-red-400 dark:hover:bg-red-950",
    className
  );
  if (href) return <Link href={href} className={cls}>{props.children}</Link>;
  return <button className={cls} {...props} />;
}

const STATUS_COLORS: Record<WorkStatus, string> = {
  Planned: "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300",
  "In Progress": "bg-blue-50 text-blue-700 ring-1 ring-blue-200 dark:bg-blue-950 dark:text-blue-300 dark:ring-blue-900",
  Completed: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200 dark:bg-emerald-950 dark:text-emerald-300 dark:ring-emerald-900",
  Blocked: "bg-red-50 text-red-700 ring-1 ring-red-200 dark:bg-red-950 dark:text-red-300 dark:ring-red-900",
  Cancelled: "bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400",
};
const PRIORITY_COLORS: Record<Priority, string> = {
  Low: "bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400",
  Medium: "bg-amber-50 text-amber-700 ring-1 ring-amber-200 dark:bg-amber-950 dark:text-amber-300 dark:ring-amber-900",
  High: "bg-orange-50 text-orange-700 ring-1 ring-orange-200 dark:bg-orange-950 dark:text-orange-300 dark:ring-orange-900",
  Critical: "bg-red-50 text-red-700 ring-1 ring-red-200 dark:bg-red-950 dark:text-red-300 dark:ring-red-900",
};
const PROJECT_COLORS: Record<ProjectStatus, string> = {
  Active: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200 dark:bg-emerald-950 dark:text-emerald-300 dark:ring-emerald-900",
  Completed: "bg-blue-50 text-blue-700 ring-1 ring-blue-200 dark:bg-blue-950 dark:text-blue-300 dark:ring-blue-900",
  "On Hold": "bg-amber-50 text-amber-700 ring-1 ring-amber-200 dark:bg-amber-950 dark:text-amber-300 dark:ring-amber-900",
  Archived: "bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400",
};
const BLOCKER_COLORS: Record<BlockerStatus, string> = {
  Open: "bg-red-50 text-red-700 ring-1 ring-red-200 dark:bg-red-950 dark:text-red-300 dark:ring-red-900",
  Waiting: "bg-amber-50 text-amber-700 ring-1 ring-amber-200 dark:bg-amber-950 dark:text-amber-300 dark:ring-amber-900",
  Resolved: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200 dark:bg-emerald-950 dark:text-emerald-300 dark:ring-emerald-900",
};

export function Badge({ children, tone }: { children: React.ReactNode; tone?: string }) {
  return <span className={cn("inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium", tone ?? "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300")}>{children}</span>;
}
export const StatusBadge = ({ s }: { s: WorkStatus }) => <Badge tone={STATUS_COLORS[s]}>{s}</Badge>;
export const PriorityBadge = ({ p }: { p: Priority }) => <Badge tone={PRIORITY_COLORS[p]}>{p}</Badge>;
export const ProjectStatusBadge = ({ s }: { s: ProjectStatus }) => <Badge tone={PROJECT_COLORS[s]}>{s}</Badge>;
export const BlockerBadge = ({ s }: { s: BlockerStatus }) => <Badge tone={BLOCKER_COLORS[s]}>{s}</Badge>;
export const CategoryBadge = ({ c }: { c: WorkCategory }) => <Badge tone="bg-indigo-50 text-indigo-700 ring-1 ring-indigo-200 dark:bg-indigo-950 dark:text-indigo-300 dark:ring-indigo-900">{c}</Badge>;

export function TagPill({ tag }: { tag: string }) {
  return (
    <Link href={`/tags/${encodeURIComponent(tag)}`} className="rounded-full border border-zinc-200 px-2 py-0.5 text-[11px] text-zinc-500 transition-colors hover:border-indigo-300 hover:text-indigo-600 dark:border-zinc-700 dark:text-zinc-400">
      #{tag}
    </Link>
  );
}

export function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 flex items-baseline justify-between text-[13px] font-medium text-zinc-700 dark:text-zinc-300">
        {label}
        {hint && <span className="text-xs font-normal text-zinc-400">{hint}</span>}
      </span>
      {children}
    </label>
  );
}

const inputCls = "w-full rounded-xl border border-zinc-200 bg-white px-3.5 py-2.5 text-sm outline-none transition-colors placeholder:text-zinc-400 focus:border-zinc-400 focus:ring-4 focus:ring-zinc-100 dark:border-zinc-700 dark:bg-zinc-900 dark:focus:border-zinc-500 dark:focus:ring-zinc-800";
export const Input = (p: React.InputHTMLAttributes<HTMLInputElement>) => <input {...p} className={cn(inputCls, p.className)} />;
export const Textarea = (p: React.TextareaHTMLAttributes<HTMLTextAreaElement>) => <textarea {...p} className={cn(inputCls, "min-h-24 resize-y", p.className)} />;
export const Select = (p: React.SelectHTMLAttributes<HTMLSelectElement>) => <select {...p} className={cn(inputCls, "appearance-none bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2212%22%20height%3D%2212%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%2371717a%22%20stroke-width%3D%222%22%3E%3Cpath%20d%3D%22m6%209%206%206%206-6%22%2F%3E%3C%2Fsvg%3E')] bg-[right_12px_center] bg-no-repeat pr-9", p.className)} />;

/** Segmented pill picker — modern replacement for <select> on small enums */
export function Seg<T extends string>({ value, onChange, options, color }: { value: T; onChange: (v: T) => void; options: readonly T[]; color?: (v: T) => string | undefined }) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {options.map((o) => (
        <button
          type="button"
          key={o}
          onClick={() => onChange(o)}
          className={cn(
            "rounded-lg px-3 py-1.5 text-[13px] font-medium transition-all",
            value === o
              ? color?.(o) ?? "bg-zinc-900 text-white dark:bg-white dark:text-zinc-900"
              : "border border-zinc-200 text-zinc-500 hover:border-zinc-300 hover:text-zinc-700 dark:border-zinc-700 dark:text-zinc-400 dark:hover:border-zinc-600"
          )}
        >
          {o}
        </button>
      ))}
    </div>
  );
}

/** Toggle switch */
export function Switch({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label?: string }) {
  return (
    <button type="button" onClick={() => onChange(!checked)} className="flex items-center gap-2.5">
      <span className={cn("relative h-6 w-11 rounded-full transition-colors", checked ? "bg-zinc-900 dark:bg-white" : "bg-zinc-200 dark:bg-zinc-700")}>
        <span className={cn("absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all dark:bg-zinc-900", checked ? "left-[22px]" : "left-0.5")} />
      </span>
      {label && <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">{label}</span>}
    </button>
  );
}

/** Titled sub-section inside forms/cards */
export function Section({ title, children, action }: { title: string; children: React.ReactNode; action?: React.ReactNode }) {
  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-[13px] font-semibold uppercase tracking-wide text-zinc-400">{title}</h3>
        {action}
      </div>
      {children}
    </section>
  );
}

export function Modal({ open, onClose, title, children, wide }: { open: boolean; onClose: () => void; title: string; children: React.ReactNode; wide?: boolean }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 backdrop-blur-[2px] sm:items-center sm:p-4" onClick={onClose}>
      <div className={cn("max-h-[92vh] w-full overflow-y-auto rounded-t-2xl bg-white p-5 shadow-2xl dark:bg-zinc-900 sm:rounded-2xl", wide ? "max-w-2xl" : "max-w-lg")} onClick={(e) => e.stopPropagation()}>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-base font-semibold">{title}</h2>
          <button onClick={onClose} className="rounded-lg p-1.5 text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-600 dark:hover:bg-zinc-800"><X size={16} /></button>
        </div>
        {children}
      </div>
    </div>
  );
}

export function EmptyState({ text, action }: { text: string; action?: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-zinc-300 py-12 text-sm text-zinc-500 dark:border-zinc-700">
      {text}
      {action}
    </div>
  );
}

export function SampleMark() {
  return <span className="ml-1 rounded bg-violet-100 px-1 text-[10px] font-semibold text-violet-600 dark:bg-violet-950 dark:text-violet-300">SAMPLE</span>;
}
