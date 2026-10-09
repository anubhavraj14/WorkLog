"use client";
import React from "react";
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid,
  PieChart, Pie, Cell, Legend,
} from "recharts";
import { ChartPalette } from "@/lib/types";

export const COLORS = ["#6366f1", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#06b6d4", "#ec4899", "#84cc16", "#f97316", "#64748b", "#14b8a6"];
export const CHART_PALETTES: { id: ChartPalette; name: string; working: string; extra: string }[] = [
  { id: "original-violet", name: "Original Violet", working: "#6366f1", extra: "#8b5cf6" },
  { id: "violet-rose", name: "Violet & Rose", working: "#6366f1", extra: "#ec4899" },
  { id: "blue-cyan", name: "Blue & Cyan", working: "#2563eb", extra: "#06b6d4" },
  { id: "emerald-amber", name: "Emerald & Amber", working: "#059669", extra: "#f59e0b" },
  { id: "slate-violet", name: "Slate & Violet", working: "#475569", extra: "#8b5cf6" },
];

export function HoursBar({ data, palette = "violet-rose" }: { data: { label: string; hours: number; extra?: number }[]; palette?: ChartPalette }) {
  const colors = CHART_PALETTES.find((item) => item.id === palette) ?? CHART_PALETTES[0];
  return (
    <ResponsiveContainer width="100%" height={180}>
      <BarChart data={data} margin={{ top: 4, right: 8, left: -18, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e4e4e7" vertical={false} />
        <XAxis dataKey="label" tick={{ fontSize: 11 }} stroke="#a1a1aa" />
        <YAxis tick={{ fontSize: 11 }} stroke="#a1a1aa" />
        <Tooltip formatter={(v) => `${Number(v ?? 0).toFixed(1)}h`} />
        <Bar dataKey="hours" name="Working hours" fill={colors.working} stackId="hours" />
        {data.some((d) => d.extra) && <Bar dataKey="extra" name="Extra hours" fill={colors.extra} stackId="hours" radius={[4, 4, 0, 0]} />}
      </BarChart>
    </ResponsiveContainer>
  );
}

export function Donut({ data }: { data: { name: string; value: number }[] }) {
  return (
    <ResponsiveContainer width="100%" height={200}>
      <PieChart>
        <Pie data={data} dataKey="value" nameKey="name" innerRadius={50} outerRadius={75} paddingAngle={2}>
          {data.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
        </Pie>
        <Tooltip />
        <Legend wrapperStyle={{ fontSize: 11 }} />
      </PieChart>
    </ResponsiveContainer>
  );
}
