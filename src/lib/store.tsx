"use client";
import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { Data, Settings, ID } from "./types";
import { sampleData } from "./demo-data";
import { getSupabase, isSupabaseConfigured } from "./supabase";
import { uid } from "./utils";
import { compressImage } from "./image-compression";

const TABLE: Record<keyof Data, string> = {
  projects: "projects",
  workEntries: "work_entries",
  evidence: "evidence",
  blockers: "blockers",
  meetings: "meetings",
  learning: "learning",
};

const emptyData = (): Data => ({ projects: [], workEntries: [], evidence: [], blockers: [], meetings: [], learning: [] });
const defaultSettings = (): Settings => ({ name: "Anubhav", title: "", work_hours_per_day: 8, working_days: [1, 2, 3, 4, 5], theme: "system" });

const LS_DATA = "worklog:data";
const LS_SETTINGS = "worklog:settings";

interface Store {
  mode: "demo" | "cloud";
  loading: boolean;
  userEmail: string | null;
  data: Data;
  settings: Settings;
  add: <K extends keyof Data>(key: K, item: Data[K][number]) => Promise<void>;
  update: <K extends keyof Data>(key: K, id: ID, patch: Partial<Data[K][number]>) => Promise<void>;
  remove: <K extends keyof Data>(key: K, id: ID) => Promise<void>;
  saveSettings: (s: Settings) => Promise<void>;
  clearSampleData: () => Promise<void>;
  exportAll: () => string;
  importAll: (json: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<string | null>;
  signUp: (email: string, password: string, name: string) => Promise<string | null>;
  signOut: () => Promise<void>;
  uploadFile: (file: File) => Promise<{ url: string; path: string }>;
  refresh: () => Promise<void>;
}

const Ctx = createContext<Store | null>(null);
export const useStore = () => {
  const s = useContext(Ctx);
  if (!s) throw new Error("useStore outside provider");
  return s;
};

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [mode, setMode] = useState<"demo" | "cloud">("demo");
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [data, setData] = useState<Data>(emptyData());
  const [settings, setSettings] = useState<Settings>(defaultSettings());
  const sb = typeof window !== "undefined" ? getSupabase() : null;

  const seedDemo = () => {
    const d = sampleData();
    localStorage.setItem(LS_DATA, JSON.stringify(d));
    return d;
  };

  const loadDemo = useCallback(() => {
    const raw = localStorage.getItem(LS_DATA);
    setData(raw ? JSON.parse(raw) : seedDemo());
    const s = localStorage.getItem(LS_SETTINGS);
    if (s) setSettings(JSON.parse(s));
    setMode("demo");
    setLoading(false);
  }, []);

  const loadCloud = useCallback(async (uid_: string) => {
    if (!sb) return;
    const out = emptyData();
    for (const key of Object.keys(TABLE) as (keyof Data)[]) {
      const { data: rows } = await sb.from(TABLE[key]).select("*").order("created_at", { ascending: false });
      if (rows) (out as unknown as Record<string, unknown[]>)[key] = rows;
    }
    setData(out);
    const { data: prof } = await sb.from("profiles").select("*").eq("id", uid_).maybeSingle();
    if (prof) setSettings({ ...defaultSettings(), ...prof.settings, name: prof.name || "Anubhav" });
    setMode("cloud");
    setLoading(false);
  }, [sb]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- intentional: hydrate from localStorage/external auth on mount
    if (!sb || !isSupabaseConfigured()) { loadDemo(); return; }
    sb.auth.getSession().then(({ data: sess }) => {
      const u = sess.session?.user;
      if (u) { setUserId(u.id); setUserEmail(u.email ?? null); loadCloud(u.id); }
      else { setLoading(false); setMode("cloud"); setData(emptyData()); }
    });
    const { data: sub } = sb.auth.onAuthStateChange((_e, session) => {
      const u = session?.user;
      if (u) { setUserId(u.id); setUserEmail(u.email ?? null); loadCloud(u.id); }
      else { setUserId(null); setUserEmail(null); setData(emptyData()); }
    });
    return () => sub.subscription.unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const persistDemo = (d: Data) => { setData(d); localStorage.setItem(LS_DATA, JSON.stringify(d)); };

  const add: Store["add"] = async (key, item) => {
    if (mode === "cloud" && sb && userId) {
      await sb.from(TABLE[key]).insert({ ...(item as object), user_id: userId });
      await loadCloud(userId);
    } else persistDemo({ ...data, [key]: [item, ...(data[key] as unknown[])] } as Data);
  };

  const update: Store["update"] = async (key, id, patch) => {
    if (mode === "cloud" && sb && userId) {
      await sb.from(TABLE[key]).update(patch as object).eq("id", id);
      await loadCloud(userId);
    } else {
      persistDemo({ ...data, [key]: (data[key] as { id: ID }[]).map((r) => (r.id === id ? { ...r, ...patch } : r)) } as Data);
    }
  };

  const remove: Store["remove"] = async (key, id) => {
    if (mode === "cloud" && sb && userId) {
      if (key === "evidence") {
        const evidence = data.evidence.find((item) => item.id === id);
        const marker = "/storage/v1/object/public/evidence/";
        const encodedPath = evidence?.url.includes(marker) ? evidence.url.split(marker)[1]?.split("?")[0] : "";
        const path = evidence?.file_path || (encodedPath ? decodeURIComponent(encodedPath) : "");
        if (path.startsWith(`${userId}/`)) {
          const { error } = await sb.storage.from("evidence").remove([path]);
          if (error) throw new Error(`File deletion failed: ${error.message}`);
        }
      }
      const { error } = await sb.from(TABLE[key]).delete().eq("id", id);
      if (error) throw new Error(`Deletion failed: ${error.message}`);
      await loadCloud(userId);
    } else persistDemo({ ...data, [key]: (data[key] as { id: ID }[]).filter((r) => r.id !== id) } as Data);
  };

  const saveSettings = async (s: Settings) => {
    setSettings(s);
    if (mode === "cloud" && sb && userId) {
      await sb.from("profiles").upsert({ id: userId, name: s.name, settings: s });
    } else localStorage.setItem(LS_SETTINGS, JSON.stringify(s));
  };

  const clearSampleData = async () => {
    const sampleIds = (arr: { id: ID; is_sample?: boolean }[]) => arr.filter((r) => r.is_sample).map((r) => r.id);
    if (mode === "cloud" && sb && userId) {
      for (const key of Object.keys(TABLE) as (keyof Data)[]) {
        const ids = sampleIds(data[key] as { id: ID; is_sample?: boolean }[]);
        if (ids.length) await sb.from(TABLE[key]).delete().in("id", ids);
      }
      await loadCloud(userId);
    } else {
      const d = emptyData();
      for (const key of Object.keys(TABLE) as (keyof Data)[])
        (d as unknown as Record<string, unknown[]>)[key] = (data[key] as { is_sample?: boolean }[]).filter((r) => !r.is_sample);
      persistDemo(d);
    }
  };

  const exportAll = () => JSON.stringify({ settings, ...data }, null, 2);

  const importAll = async (json: string) => {
    const parsed = JSON.parse(json);
    const d = emptyData();
    for (const key of Object.keys(TABLE) as (keyof Data)[])
      if (Array.isArray(parsed[key])) (d as unknown as Record<string, unknown[]>)[key] = parsed[key];
    if (parsed.settings) await saveSettings(parsed.settings);
    if (mode === "cloud" && sb && userId) {
      for (const key of Object.keys(TABLE) as (keyof Data)[]) {
        const rows = (d[key] as object[]).map((r) => ({ ...r, user_id: userId }));
        if (rows.length) await sb.from(TABLE[key]).insert(rows);
      }
      await loadCloud(userId);
    } else persistDemo(d);
  };

  const signIn = async (email: string, password: string) => {
    if (!sb) return "Supabase is not configured";
    const { error } = await sb.auth.signInWithPassword({ email, password });
    return error?.message ?? null;
  };
  const signUp = async (email: string, password: string, name: string) => {
    if (!sb) return "Supabase is not configured";
    const { error } = await sb.auth.signUp({ email, password });
    if (error) return error.message;
    if (name) await saveSettings({ ...settings, name });
    return null;
  };
  const signOut = async () => { await sb?.auth.signOut(); };

  const uploadFile: Store["uploadFile"] = async (file) => {
    const upload = await compressImage(file);
    if (mode === "cloud" && sb && userId) {
      const safeName = upload.name.replace(/[^a-zA-Z0-9.\-_]/g, "_");
      const path = `${userId}/${uid()}-${safeName}`;
      const { error } = await sb.storage.from("evidence").upload(path, upload, upload.type ? { contentType: upload.type } : undefined);
      if (error) throw new Error(`Upload failed: ${error.message}`);
      const url = sb.storage.from("evidence").getPublicUrl(path).data.publicUrl;
      return { url, path };
    }
    const url = await new Promise<string>((res) => {
      const r = new FileReader();
      r.onload = () => res(String(r.result));
      r.readAsDataURL(upload);
    });
    return { url, path: "" };
  };

  const refresh = async () => { if (mode === "cloud" && userId) await loadCloud(userId); };

  return (
    <Ctx.Provider value={{ mode, loading, userEmail, data, settings, add, update, remove, saveSettings, clearSampleData, exportAll, importAll, signIn, signUp, signOut, uploadFile, refresh }}>
      {children}
    </Ctx.Provider>
  );
}
