"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useUser } from "@/context/AuthContext";
import { ApiError, api } from "@/lib/api";

type Field = "name" | "email" | "password" | "confirm" | null;

export function RegisterForm() {
  const router = useRouter();
  const { refresh } = useUser();
  const [form, setForm] = React.useState({
    name: "",
    email: "",
    password: "",
    confirm: "",
  });
  const [errorField, setErrorField] = React.useState<Field>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [busy, setBusy] = React.useState(false);

  function update<K extends keyof typeof form>(key: K, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setErrorField(null);

    if (form.password !== form.confirm) {
      setError("Passwords don't match");
      setErrorField("confirm");
      return;
    }

    setBusy(true);
    try {
      await api("/api/auth/register", {
        method: "POST",
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          password: form.password,
        }),
      });
      await refresh();
      router.push("/dashboard");
      router.refresh();
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
        // Naive heuristic — server returns { field } for known cases
        try {
          const parsed = JSON.parse(err.message);
          if (parsed?.field) setErrorField(parsed.field);
        } catch {
          /* not JSON, ignore */
        }
      } else {
        setError("Something went wrong");
      }
      setBusy(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="space-y-1.5">
        <h1 className="text-2xl font-semibold tracking-tight">Create your account</h1>
        <p className="text-sm text-muted">
          You&apos;ll join as a member by default — managers can promote you later.
        </p>
      </div>

      <form className="space-y-4" onSubmit={handleSubmit} noValidate>
        <div className="space-y-1.5">
          <Label htmlFor="name">Name</Label>
          <Input
            id="name"
            type="text"
            required
            minLength={2}
            value={form.name}
            onChange={(e) => update("name", e.target.value)}
            placeholder="Ada Lovelace"
          />
          {errorField === "name" && error ? (
            <p className="text-xs text-danger">{error}</p>
          ) : null}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            required
            value={form.email}
            onChange={(e) => update("email", e.target.value)}
            placeholder="you@company.com"
          />
          {errorField === "email" && error ? (
            <p className="text-xs text-danger">{error}</p>
          ) : null}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            autoComplete="new-password"
            required
            minLength={8}
            value={form.password}
            onChange={(e) => update("password", e.target.value)}
            placeholder="At least 8 characters"
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="confirm">Confirm password</Label>
          <Input
            id="confirm"
            type="password"
            autoComplete="new-password"
            required
            minLength={8}
            value={form.confirm}
            onChange={(e) => update("confirm", e.target.value)}
            placeholder="Type it again"
          />
          {errorField === "confirm" && error ? (
            <p className="text-xs text-danger">{error}</p>
          ) : null}
        </div>

        {error && !errorField ? (
          <p className="text-xs text-danger" role="alert">
            {error}
          </p>
        ) : null}

        <Button className="w-full" type="submit" disabled={busy}>
          {busy ? <Loader2 className="animate-spin" /> : null}
          {busy ? "Creating account…" : "Create account"}
        </Button>
      </form>

      <p className="text-xs text-muted text-center">
        Already have an account?{" "}
        <Link
          href="/login"
          className="text-foreground underline underline-offset-4 hover:text-primary"
        >
          Sign in
        </Link>
      </p>
    </div>
  );
}
