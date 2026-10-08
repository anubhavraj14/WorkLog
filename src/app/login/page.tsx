"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useStore } from "@/lib/store";
import { Button, Field, Input, Card } from "@/components/ui";

export default function Login() {
  const { signIn, signUp, loading, userEmail } = useStore();
  const router = useRouter();
  const [isSignup, setIsSignup] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!loading && userEmail) router.replace("/");
  }, [loading, router, userEmail]);

  if (loading || userEmail) {
    return <div className="flex min-h-screen items-center justify-center text-sm text-zinc-400">Loading WorkLog…</div>;
  }

  const submit = async () => {
    setBusy(true);
    const err = isSignup ? await signUp(email, password, name) : await signIn(email, password);
    setBusy(false);
    if (err) setError(err);
    else router.push("/");
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-sm space-y-4 p-6">
        <div className="text-center">
          <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-lg font-bold text-white">W</div>
          <h1 className="text-xl font-bold">WorkLog</h1>
          <p className="text-xs text-zinc-500">{isSignup ? "Create your account" : "Sign in to your work diary"}</p>
        </div>
        {isSignup && <Field label="Name"><Input value={name} onChange={(e) => setName(e.target.value)} /></Field>}
        <Field label="Email"><Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} /></Field>
        <Field label="Password"><Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} /></Field>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <Button onClick={submit} disabled={busy} className="w-full justify-center">{busy ? "…" : isSignup ? "Create account" : "Sign in"}</Button>
        <button onClick={() => setIsSignup(!isSignup)} className="w-full text-center text-xs text-indigo-600 hover:underline">
          {isSignup ? "Already have an account? Sign in" : "Need an account? Sign up"}
        </button>
      </Card>
    </div>
  );
}
