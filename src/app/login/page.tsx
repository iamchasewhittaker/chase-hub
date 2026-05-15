"use client";

// Email + password login. Chase signs in with the credentials set in the
// shared portfolio Supabase project (Auto Confirm User checked, no email
// verification step). Only chase.t.whittaker@gmail.com can actually reach
// /admin once signed in (enforced at proxy.ts + RLS policy), so this form
// is intentionally bare.
//
// Note: useSearchParams must be inside a <Suspense> boundary because Next.js
// can't statically prerender pages that read URL query params.

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase-browser";

export default function LoginPage() {
  return (
    <div className="mx-auto max-w-md px-6 py-24">
      <h1 className="text-3xl font-bold">Sign in</h1>
      <p className="mt-2 text-sm text-muted">
        Admin only. Enter the email and password on file.
      </p>
      <Suspense fallback={<LoginFallback />}>
        <LoginForm />
      </Suspense>
    </div>
  );
}

function LoginFallback() {
  return (
    <div className="mt-8 h-32 rounded-xl border border-border bg-surface" />
  );
}

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") || "/admin";
  const initialError = searchParams.get("error");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState<"idle" | "signing-in" | "error">(
    "idle",
  );
  const [error, setError] = useState<string | null>(initialError);

  const canSubmit =
    email.trim().length > 0 &&
    password.length > 0 &&
    status !== "signing-in";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;
    setStatus("signing-in");
    setError(null);

    const supabase = createSupabaseBrowserClient();
    const { error: signInErr } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    if (signInErr) {
      setStatus("error");
      setError(signInErr.message);
      return;
    }

    router.replace(next);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-3">
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="you@example.com"
        required
        autoFocus
        autoComplete="email"
        inputMode="email"
        className="rounded-lg border border-border bg-surface px-3 py-2.5 text-sm text-foreground placeholder:text-muted focus:border-accent focus:outline-none"
      />
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Password"
        required
        autoComplete="current-password"
        className="rounded-lg border border-border bg-surface px-3 py-2.5 text-sm text-foreground placeholder:text-muted focus:border-accent focus:outline-none"
      />
      <button
        type="submit"
        disabled={!canSubmit}
        className="rounded-lg bg-accent px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-60"
      >
        {status === "signing-in" ? "Signing in..." : "Sign in"}
      </button>
      {error && (
        <p className="text-sm text-red-600" role="alert">
          {error}
        </p>
      )}
    </form>
  );
}
