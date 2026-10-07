"use client";
import React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useStore } from "@/lib/store";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard, CalendarDays, FolderKanban, ShieldAlert, Users, GraduationCap,
  Clock3, Calendar, Search, FileBarChart, CalendarRange, BarChart3, Settings as SettingsIcon,
  Plus, Moon, Sun, LogOut, FlaskConical,
} from "lucide-react";
import { useTheme } from "next-themes";

const NAV = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/log", label: "Daily Log", icon: CalendarDays },
  { href: "/projects", label: "Projects", icon: FolderKanban },
  { href: "/evidence", label: "Evidence", icon: FlaskConical },
  { href: "/blockers", label: "Blockers", icon: ShieldAlert },
  { href: "/meetings", label: "Meetings", icon: Users },
  { href: "/learning", label: "Learning", icon: GraduationCap },
  { href: "/extra-hours", label: "Extra Hours", icon: Clock3 },
  { href: "/calendar", label: "Calendar", icon: Calendar },
  { href: "/search", label: "Search", icon: Search },
  { href: "/reports", label: "Reports", icon: FileBarChart },
  { href: "/weekly", label: "Weekly", icon: CalendarRange },
  { href: "/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/settings", label: "Settings", icon: SettingsIcon },
];

const MOBILE_NAV = [NAV[0], NAV[1], NAV[8], NAV[10], NAV[13]];

export function Shell({ children }: { children: React.ReactNode }) {
  const { mode, loading, userEmail, signOut } = useStore();
  const pathname = usePathname();
  const router = useRouter();
  const { theme, setTheme } = useTheme();

  if (pathname === "/login") return <>{children}</>;

  if (loading)
    return <div className="flex min-h-screen items-center justify-center text-sm text-zinc-500">Loading WorkLog…</div>;

  if (mode === "cloud" && !userEmail) {
    router.replace("/login");
    return null;
  }

  const link = (item: (typeof NAV)[number], mobile = false) => (
    <Link
      key={item.href}
      href={item.href}
      className={cn(
        "flex items-center gap-2 rounded-lg px-3 py-2 text-sm",
        mobile && "flex-col gap-0.5 px-2 py-1 text-[10px]",
        pathname === item.href
          ? "bg-indigo-50 font-medium text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300"
          : "text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
      )}
    >
      <item.icon size={mobile ? 18 : 16} />
      {item.label}
    </Link>
  );

  return (
    <div className="flex min-h-screen">
      <aside className="sticky top-0 hidden h-screen w-56 shrink-0 flex-col border-r border-zinc-200 bg-white p-3 dark:border-zinc-800 dark:bg-zinc-950 md:flex">
        <Link href="/" className="mb-4 flex items-center gap-2 px-2 py-1 text-lg font-bold">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-600 text-white">W</span>
          WorkLog
        </Link>
        <Link href="/log/new" className="mb-3 flex items-center justify-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-2 text-sm font-medium text-white hover:bg-indigo-700">
          <Plus size={16} /> Log Work
        </Link>
        <nav className="flex-1 space-y-0.5 overflow-y-auto">{NAV.map((n) => link(n))}</nav>
        <div className="mt-2 flex items-center justify-between border-t border-zinc-200 pt-2 dark:border-zinc-800">
          <button onClick={() => setTheme(theme === "dark" ? "light" : "dark")} className="rounded-lg p-2 text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800" aria-label="Toggle theme">
            {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
          </button>
          {mode === "cloud" && (
            <button onClick={signOut} className="flex items-center gap-1 rounded-lg p-2 text-xs text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800">
              <LogOut size={14} /> Sign out
            </button>
          )}
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        {mode === "demo" && (
          <div className="bg-violet-50 px-4 py-1.5 text-center text-xs text-violet-700 dark:bg-violet-950 dark:text-violet-300">
            Demo mode — data is stored in this browser and entries marked [Sample] are example data. Configure Supabase to sync across devices.
          </div>
        )}
        <header className="flex items-center justify-between border-b border-zinc-200 bg-white px-4 py-2 dark:border-zinc-800 dark:bg-zinc-950 md:hidden">
          <Link href="/" className="flex items-center gap-2 font-bold">
            <span className="flex h-6 w-6 items-center justify-center rounded-md bg-indigo-600 text-sm text-white">W</span>
            WorkLog
          </Link>
          <div className="flex items-center gap-1">
            <button onClick={() => setTheme(theme === "dark" ? "light" : "dark")} className="rounded-lg p-2 text-zinc-500">
              {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
            </button>
            <Link href="/settings" className="rounded-lg p-2 text-zinc-500"><SettingsIcon size={16} /></Link>
          </div>
        </header>
        <main className="min-w-0 flex-1 p-4 pb-24 md:p-6 md:pb-6">{children}</main>
        <nav className="fixed bottom-0 left-0 right-0 z-40 flex justify-around border-t border-zinc-200 bg-white py-1 dark:border-zinc-800 dark:bg-zinc-950 md:hidden">
          {MOBILE_NAV.map((n) => link(n, true))}
        </nav>
      </div>
    </div>
  );
}
