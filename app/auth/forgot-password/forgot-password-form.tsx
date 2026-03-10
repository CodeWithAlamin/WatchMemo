"use client";

import Link from "next/link";
import { type FormEvent, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { ArrowLeft } from "lucide-react";

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

export default function ForgotPasswordForm() {
  const searchParams = useSearchParams();
  const rawNextPath = searchParams.get("next") || "/";
  const nextPath = rawNextPath.startsWith("/") ? rawNextPath : "/";

  const [email, setEmail] = useState("");
  const [submitState, setSubmitState] = useState<SubmitState>("idle");
  const [error, setError] = useState("");

  const redirectTo = useMemo(() => {
    const siteUrl =
      process.env.NEXT_PUBLIC_SITE_URL ||
      (typeof window !== "undefined" ? window.location.origin : "");
    if (!siteUrl) return undefined;
    return `${siteUrl}/auth/update-password`;
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitState("loading");
    setError("");

    const { error: resetError } = await supabase.auth.resetPasswordForEmail(
      email,
      {
        redirectTo,
      },
    );

    if (resetError) {
      setSubmitState("error");
      setError(resetError.message);
      return;
    }

    setSubmitState("success");
  }

  return (
    <div className="mx-auto max-w-md">
      <Card className="rounded-3xl border-0 bg-card/95 shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl font-black tracking-tight">
            Reset your password
          </CardTitle>
          <CardDescription className="pb-3">
            Enter your email and we will send you a secure reset link.
          </CardDescription>
        </CardHeader>

        <CardContent>
          {submitState === "success" ? (
            <div className="space-y-3">
              <p className="rounded-xl border bg-muted p-3 text-sm font-medium text-muted-foreground">
                Reset link sent. Open your email and follow the instructions to
                create a new password.
              </p>
              <Button asChild className="w-full">
                <Link href={`/auth/login?next=${encodeURIComponent(nextPath)}`}>
                  <ArrowLeft className="size-4" />
                  Back to login
                </Link>
              </Button>
            </div>
          ) : (
            <form className="space-y-3" onSubmit={handleSubmit}>
              <Input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
              />

              <Button className="w-full" disabled={submitState === "loading"}>
                {submitState === "loading"
                  ? "Sending link..."
                  : "Send reset link"}
              </Button>
            </form>
          )}

          <div className="mt-4 text-right text-sm">
            <Link
              href={`/auth/login?next=${encodeURIComponent(nextPath)}`}
              className="inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/5 px-3 py-1.5 font-medium text-primary transition hover:bg-primary/10"
            >
              <ArrowLeft className="size-3.5" />
              Back to login
            </Link>
          </div>

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
