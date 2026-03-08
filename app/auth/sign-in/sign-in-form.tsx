"use client";

import Link from "next/link";
import { type FormEvent, useEffect, useState } from "react";
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

type SubmitState = "idle" | "loading" | "error";
type AuthUser = Awaited<ReturnType<typeof supabase.auth.getUser>>["data"]["user"];

export default function SignInForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const rawNextPath = searchParams.get("next") || "/";
  const nextPath = rawNextPath.startsWith("/") ? rawNextPath : "/";
  const encodedNext = encodeURIComponent(nextPath);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitState, setSubmitState] = useState<SubmitState>("idle");
  const [error, setError] = useState("");

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

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError) {
      setSubmitState("error");
      setError(signInError.message);
      return;
    }

    router.replace(nextPath);
  }

  return (
    <div className="mx-auto max-w-md">
      <Card className="rounded-3xl border-0 bg-card/95 shadow-lg">
        <CardHeader>
          <CardTitle className="pb-1 text-2xl font-black tracking-tight">
            Welcome back
          </CardTitle>
          <CardDescription className="pb-3">
            Login to keep your watched movies, ratings, and notes synced.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <div className="mb-4 grid grid-cols-2 gap-2">
            <Button asChild className="ring-1 ring-primary/40">
              <Link href={`/auth/login?next=${encodedNext}`}>Login</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href={`/auth/sign-up?next=${encodedNext}`}>Register</Link>
            </Button>
          </div>

          <form className="space-y-3" onSubmit={handleSubmit}>
            <Input
              type="email"
              placeholder="Email address"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
            <Input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              minLength={6}
              required
            />

            <div className="text-right text-sm">
              <Link
                href={`/auth/forgot-password?next=${encodedNext}`}
                className="font-medium text-primary hover:underline"
              >
                Forgot password?
              </Link>
            </div>

            <Button className="w-full" disabled={submitState === "loading"}>
              {submitState === "loading" ? "Logging in..." : "Login"}
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
