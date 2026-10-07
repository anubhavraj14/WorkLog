"use client";
import React from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { WorkStatus, Priority, ProjectStatus, BlockerStatus, WorkCategory } from "@/lib/types";

export function Card({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn("rounded-xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900", className)}>{children}</div>;
}

export function PageHeader({ title, children }: { title: string; children?: React.ReactNode }) {
  return (
    <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
      <h1 className="text-xl font-semibold">{title}</h1>
      <div className="flex gap-2">{children}</div>
    </div>
  );
}

type BtnProps = React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "primary" | "ghost" | "danger"; href?: string };
export function Button({ variant = "primary", href, className, ...props }: BtnProps) {
  const cls = cn(
    "inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors disabled:opacity-50",
    variant === "primary" && "bg-indigo-600 text-white hover:bg-indigo-700",
    variant === "ghost" && "border border-zinc-200 bg-white hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:hover:bg-zinc-800",
    variant === "danger" && "bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-950 dark:text-red-400",
    className
  );
  if (href) return <Link href={href} className={cls}>{props.children}</Link>;
  return <button className={cls} {...props} />;
}

const STATUS_COLORS: Record<WorkStatus, string> = {
  Planned: "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300",
  "In Progress": "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300",
  Completed: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300",
  Blocked: "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300",
  Cancelled: "bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400",
};
const PRIORITY_COLORS: Record<Priority, string> = {
  Low: "bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400",
  Medium: "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300",
  High: "bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-300",
  Critical: "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300",
};
const PROJECT_COLORS: Record<ProjectStatus, string> = {
  Active: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300",
  Completed: "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300",
  "On Hold": "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300",
  Archived: "bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400",
};
const BLOCKER_COLORS: Record<BlockerStatus, string> = {
  Open: "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300",
  Waiting: "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300",
  Resolved: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300",
};

export function Badge({ children, tone }: { children: React.ReactNode; tone?: string }) {
  return <span className={cn("inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium", tone ?? "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300")}>{children}</span>;
}
export const StatusBadge = ({ s }: { s: WorkStatus }) => <Badge tone={STATUS_COLORS[s]}>{s}</Badge>;
export const PriorityBadge = ({ p }: { p: Priority }) => <Badge tone={PRIORITY_COLORS[p]}>{p}</Badge>;
export const ProjectStatusBadge = ({ s }: { s: ProjectStatus }) => <Badge tone={PROJECT_COLORS[s]}>{s}</Badge>;
export const BlockerBadge = ({ s }: { s: BlockerStatus }) => <Badge tone={BLOCKER_COLORS[s]}>{s}</Badge>;
export const CategoryBadge = ({ c }: { c: WorkCategory }) => <Badge tone="bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">{c}</Badge>;

export function TagPill({ tag }: { tag: string }) {
  return (
    <Link href={`/tags/${encodeURIComponent(tag)}`} className="rounded-full bg-zinc-100 px-2 py-0.5 text-xs text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700">
      #{tag}
    </Link>
  );
}

export function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300">{label}</span>
      {children}
    </label>
  );
}

const inputCls = "w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 dark:border-zinc-700 dark:bg-zinc-900 dark:focus:ring-indigo-950";
export const Input = (p: React.InputHTMLAttributes<HTMLInputElement>) => <input {...p} className={cn(inputCls, p.className)} />;
export const Textarea = (p: React.TextareaHTMLAttributes<HTMLTextAreaElement>) => <textarea {...p} className={cn(inputCls, "min-h-20", p.className)} />;
export const Select = (p: React.SelectHTMLAttributes<HTMLSelectElement>) => <select {...p} className={cn(inputCls, p.className)} />;

export function Modal({ open, onClose, title, children }: { open: boolean; onClose: () => void; title: string; children: React.ReactNode }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-0 sm:items-center sm:p-4" onClick={onClose}>
      <div className="max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-t-2xl bg-white p-5 dark:bg-zinc-900 sm:rounded-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">{title}</h2>
          <button onClick={onClose} className="rounded-lg p-1 text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800">✕</button>
        </div>
        {children}
      </div>
    </div>
  );
}

export function EmptyState({ text, action }: { text: string; action?: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-zinc-300 py-10 text-sm text-zinc-500 dark:border-zinc-700">
      {text}
      {action}
    </div>
  );
}

export function SampleMark() {
  return <span className="ml-1 rounded bg-violet-100 px-1 text-[10px] font-semibold text-violet-600 dark:bg-violet-950 dark:text-violet-300">SAMPLE</span>;
}
