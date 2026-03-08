"use client";

import Link from "next/link";
import { type FormEvent, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { supabase } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";

type SubmitState = "idle" | "loading" | "error" | "success";
type AuthUser = Awaited<ReturnType<typeof supabase.auth.getUser>>["data"]["user"];

export default function SignUpForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const rawNextPath = searchParams.get("next") || "/";
  const nextPath = rawNextPath.startsWith("/") ? rawNextPath : "/";
  const encodedNext = encodeURIComponent(nextPath);

  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitState, setSubmitState] = useState<SubmitState>("idle");
  const [error, setError] = useState("");

  const emailRedirectTo = useMemo(() => {
    if (typeof window === "undefined") return undefined;
    return `${window.location.origin}/auth/login`;
  }, []);

  useEffect(() => {
    let mounted = true;

    void supabase.auth.getUser().then(
      ({ data }: { data: { user: AuthUser } }) => {
      if (!mounted) return;
      if (data.user) router.replace(nextPath);
      },
    );

    return () => {
      mounted = false;
    };
  }, [nextPath, router]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitState("loading");
    setError("");

    const { error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          display_name: displayName.trim(),
        },
        emailRedirectTo,
      },
    });

    if (signUpError) {
      setSubmitState("error");
      setError(signUpError.message);
      return;
    }

    setSubmitState("success");
  }

  if (submitState === "success") {
    return (
      <div className="mx-auto max-w-md">
        <Card className="rounded-3xl border-0 bg-card/95 shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl font-black tracking-tight">
              Account created
            </CardTitle>
            <CardDescription>
              Check your inbox and verify your email if confirmation is enabled.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button
              className="w-full"
              onClick={() => router.push(`/auth/login?next=${encodedNext}`)}
            >
              Continue to login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-md">
      <Card className="rounded-3xl border-0 bg-card/95 shadow-lg">
        <CardHeader>
          <CardTitle className="pb-1 text-2xl font-black tracking-tight">
            Create your account
          </CardTitle>
          <CardDescription className="pb-3">
            Build your private movie history with ratings and personal notes.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <div className="mb-4 grid grid-cols-2 gap-2">
            <Button asChild variant="outline">
              <Link href={`/auth/login?next=${encodedNext}`}>Login</Link>
            </Button>
            <Button asChild className="ring-1 ring-primary/40">
              <Link href={`/auth/sign-up?next=${encodedNext}`}>Register</Link>
            </Button>
          </div>

          <form className="space-y-3" onSubmit={handleSubmit}>
            <Input
              type="text"
              placeholder="Display name"
              value={displayName}
              onChange={(event) => setDisplayName(event.target.value)}
              minLength={2}
              maxLength={40}
              required
            />
            <Input
              type="email"
              placeholder="Email address"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
            <Input
              type="password"
              placeholder="Password (minimum 8 characters)"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              minLength={8}
              required
            />

            <Button className="w-full" disabled={submitState === "loading"}>
              {submitState === "loading"
                ? "Creating account..."
                : "Create account"}
            </Button>
          </form>

          {submitState === "error" ? (
            <p className="mt-3 rounded-xl border border-destructive/30 bg-destructive/10 p-3 text-sm font-medium text-destructive">
              {error}
            </p>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}
