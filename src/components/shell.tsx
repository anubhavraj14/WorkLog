"use client";
import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useStore } from "@/lib/store";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard, CalendarDays, FolderKanban, ShieldAlert, Users, GraduationCap,
  Clock3, Calendar, Search, FileBarChart, CalendarRange, BarChart3, Settings as SettingsIcon,
  Plus, Moon, Sun, LogOut, FlaskConical, ChevronDown, Ellipsis,
} from "lucide-react";
import { useTheme } from "next-themes";

const PRIMARY = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/log", label: "Daily Log", icon: CalendarDays },
  { href: "/calendar", label: "Calendar", icon: Calendar },
  { href: "/reports", label: "Reports", icon: FileBarChart },
  { href: "/settings", label: "Settings", icon: SettingsIcon },
];

const MORE = [
  { href: "/projects", label: "Projects", icon: FolderKanban },
  { href: "/evidence", label: "Evidence", icon: FlaskConical },
  { href: "/blockers", label: "Blockers", icon: ShieldAlert },
  { href: "/meetings", label: "Meetings", icon: Users },
  { href: "/learning", label: "Learning", icon: GraduationCap },
  { href: "/extra-hours", label: "Extra Hours", icon: Clock3 },
  { href: "/search", label: "Search", icon: Search },
  { href: "/weekly", label: "Weekly Summary", icon: CalendarRange },
  { href: "/analytics", label: "Analytics", icon: BarChart3 },
];

export function Shell({ children }: { children: React.ReactNode }) {
  const { mode, loading, userEmail, signOut } = useStore();
  const pathname = usePathname();
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const [moreOpen, setMoreOpen] = useState(false);
  const [mobileMore, setMobileMore] = useState(false);

  if (pathname === "/login") return <>{children}</>;

  if (loading)
    return <div className="flex min-h-screen items-center justify-center text-sm text-zinc-400">Loading WorkLog…</div>;

  if (mode === "cloud" && !userEmail) {
    router.replace("/login");
    return null;
  }

  const linkCls = (href: string, mobile = false) =>
    cn(
      "flex items-center rounded-lg text-sm transition-colors",
      mobile ? "flex-col gap-0.5 px-2 py-1 text-[10px]" : "gap-2.5 px-3 py-2",
      pathname === href
        ? "bg-zinc-100 font-medium text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100"
        : "text-zinc-500 hover:bg-zinc-50 hover:text-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-800/60 dark:hover:text-zinc-200"
    );

  const moreActive = MORE.some((m) => m.href === pathname);

  return (
    <div className="flex min-h-screen">
      {/* Desktop sidebar */}
      <aside className="sticky top-0 hidden h-screen w-60 shrink-0 flex-col border-r border-zinc-200/80 bg-white px-3 py-4 dark:border-zinc-800 dark:bg-zinc-950 md:flex">
        <Link href="/" className="mb-5 flex items-center gap-2.5 px-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-zinc-900 text-sm font-bold text-white dark:bg-white dark:text-zinc-900">W</span>
          <span className="text-[17px] font-semibold tracking-tight">WorkLog</span>
        </Link>
        <Link href="/log/new" className="mb-4 flex items-center justify-center gap-1.5 rounded-lg bg-zinc-900 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-700 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200">
          <Plus size={16} /> Log Work
        </Link>
        <nav className="flex-1 space-y-0.5 overflow-y-auto">
          {PRIMARY.map((n) => (
            <Link key={n.href} href={n.href} className={linkCls(n.href)}>
              <n.icon size={16} /> {n.label}
            </Link>
          ))}
          <button onClick={() => setMoreOpen(!moreOpen)} className={cn(linkCls(moreActive ? pathname : "__none"), "w-full justify-between")}>
            <span className="flex items-center gap-2.5"><Ellipsis size={16} /> More</span>
            <ChevronDown size={14} className={cn("transition-transform", moreOpen && "rotate-180")} />
          </button>
          {moreOpen && (
            <div className="ml-3 space-y-0.5 border-l border-zinc-200 pl-2 dark:border-zinc-800">
              {MORE.map((n) => (
                <Link key={n.href} href={n.href} className={linkCls(n.href)}>
                  <n.icon size={15} /> {n.label}
                </Link>
              ))}
            </div>
          )}
        </nav>
        <div className="mt-2 flex items-center justify-between border-t border-zinc-100 pt-3 dark:border-zinc-800">
          <button onClick={() => setTheme(theme === "dark" ? "light" : "dark")} className="rounded-lg p-2 text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800" aria-label="Toggle theme">
            {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
          </button>
          {mode === "cloud" && (
            <button onClick={signOut} className="flex items-center gap-1.5 rounded-lg p-2 text-xs text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800">
              <LogOut size={14} /> Sign out
            </button>
          )}
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        {mode === "demo" && (
          <div className="border-b border-amber-200/60 bg-amber-50 px-4 py-1.5 text-center text-xs text-amber-700 dark:border-amber-900 dark:bg-amber-950/50 dark:text-amber-300">
            Demo mode — data stays in this browser. Add Supabase keys to sync across devices.
          </div>
        )}
        <main className="min-w-0 flex-1 px-4 py-5 pb-24 sm:px-6 md:py-7 md:pb-8 lg:px-8">{children}</main>

        {/* Mobile bottom nav */}
        <nav className="fixed bottom-0 left-0 right-0 z-40 flex justify-around border-t border-zinc-200 bg-white/95 py-1.5 backdrop-blur dark:border-zinc-800 dark:bg-zinc-950/95 md:hidden">
          {PRIMARY.slice(0, 4).map((n) => (
            <Link key={n.href} href={n.href} className={linkCls(n.href, true)}>
              <n.icon size={19} /> {n.label.split(" ")[0]}
            </Link>
          ))}
          <button onClick={() => setMobileMore(true)} className={linkCls("__more", true)}>
            <Ellipsis size={19} /> More
          </button>
        </nav>

        {/* Mobile "More" sheet */}
        {mobileMore && (
          <div className="fixed inset-0 z-50 flex items-end bg-black/40 md:hidden" onClick={() => setMobileMore(false)}>
            <div className="max-h-[75vh] w-full overflow-y-auto rounded-t-2xl bg-white p-4 pb-8 dark:bg-zinc-900" onClick={(e) => e.stopPropagation()}>
              <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-zinc-300 dark:bg-zinc-700" />
              <div className="grid grid-cols-3 gap-2">
                {MORE.map((n) => (
                  <Link key={n.href} href={n.href} onClick={() => setMobileMore(false)}
                    className="flex flex-col items-center gap-1.5 rounded-xl border border-zinc-200 p-3 text-xs font-medium text-zinc-600 dark:border-zinc-800 dark:text-zinc-300">
                    <n.icon size={20} className="text-zinc-800 dark:text-zinc-200" /> {n.label}
                  </Link>
                ))}
                <Link href="/settings" onClick={() => setMobileMore(false)}
                  className="flex flex-col items-center gap-1.5 rounded-xl border border-zinc-200 p-3 text-xs font-medium text-zinc-600 dark:border-zinc-800 dark:text-zinc-300">
                  <SettingsIcon size={20} className="text-zinc-800 dark:text-zinc-200" /> Settings
                </Link>
                <button onClick={() => { setTheme(theme === "dark" ? "light" : "dark"); setMobileMore(false); }}
                  className="flex flex-col items-center gap-1.5 rounded-xl border border-zinc-200 p-3 text-xs font-medium text-zinc-600 dark:border-zinc-800 dark:text-zinc-300">
                  {theme === "dark" ? <Sun size={20} /> : <Moon size={20} />} Theme
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
