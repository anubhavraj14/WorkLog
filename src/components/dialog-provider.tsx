"use client";
import React, { createContext, useContext, useState } from "react";
import { AlertTriangle } from "lucide-react";
import { Button, Input } from "./ui";

type DialogState = {
  type: "alert" | "confirm" | "prompt";
  title: string;
  message: string;
  value: string;
  destructive: boolean;
  resolve: (value: boolean | string | null) => void;
};

type DialogApi = {
  alert: (message: string, title?: string) => Promise<void>;
  confirm: (message: string, options?: { title?: string; destructive?: boolean }) => Promise<boolean>;
  prompt: (message: string, initialValue?: string, title?: string) => Promise<string | null>;
};

const DialogContext = createContext<DialogApi | null>(null);

export function DialogProvider({ children }: { children: React.ReactNode }) {
  const [dialog, setDialog] = useState<DialogState | null>(null);
  const close = (value: boolean | string | null) => {
    dialog?.resolve(value);
    setDialog(null);
  };
  const api: DialogApi = {
    alert: (message, title = "Something needs your attention") => new Promise((resolve) => setDialog({ type: "alert", title, message, value: "", destructive: false, resolve: () => resolve() })),
    confirm: (message, options) => new Promise((resolve) => setDialog({ type: "confirm", title: options?.title ?? "Are you sure?", message, value: "", destructive: options?.destructive ?? false, resolve: (value) => resolve(value === true) })),
    prompt: (message, initialValue = "", title = "Enter a value") => new Promise((resolve) => setDialog({ type: "prompt", title, message, value: initialValue, destructive: false, resolve: (value) => resolve(typeof value === "string" ? value : null) })),
  };

  return (
    <DialogContext.Provider value={api}>
      {children}
      {dialog && (
        <div className="fixed inset-0 z-[100] flex items-end justify-center bg-black/45 p-0 backdrop-blur-sm sm:items-center sm:p-4" onClick={() => close(dialog.type === "alert" ? true : null)}>
          <div role="dialog" aria-modal="true" aria-labelledby="dialog-title" className="w-full rounded-t-3xl border border-zinc-200 bg-white p-5 shadow-2xl dark:border-zinc-800 dark:bg-zinc-900 sm:max-w-md sm:rounded-2xl" onClick={(event) => event.stopPropagation()}>
            <div className="flex gap-3">
              {dialog.destructive && <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-50 text-red-600 dark:bg-red-950"><AlertTriangle size={19} /></div>}
              <div className="min-w-0 flex-1">
                <h2 id="dialog-title" className="text-base font-semibold">{dialog.title}</h2>
                <p className="mt-1 text-sm leading-6 text-zinc-500">{dialog.message}</p>
              </div>
            </div>
            {dialog.type === "prompt" && <Input autoFocus value={dialog.value} onChange={(event) => setDialog({ ...dialog, value: event.target.value })} onKeyDown={(event) => event.key === "Enter" && close(dialog.value)} className="mt-4" />}
            <div className="mt-5 flex justify-end gap-2">
              {dialog.type !== "alert" && <Button variant="ghost" onClick={() => close(null)}>Cancel</Button>}
              <Button variant={dialog.destructive ? "danger" : "primary"} onClick={() => close(dialog.type === "prompt" ? dialog.value : true)}>{dialog.type === "alert" ? "Got it" : dialog.type === "prompt" ? "Save" : dialog.destructive ? "Delete" : "Continue"}</Button>
            </div>
          </div>
        </div>
      )}
    </DialogContext.Provider>
  );
}

export function useDialog() {
  const dialog = useContext(DialogContext);
  if (!dialog) throw new Error("useDialog outside DialogProvider");
  return dialog;
}
