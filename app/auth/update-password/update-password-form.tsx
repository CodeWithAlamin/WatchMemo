"use client";

import Link from "next/link";
import { type FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

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

type SubmitState = "checking" | "idle" | "loading" | "error" | "success";

export default function UpdatePasswordForm() {
  const router = useRouter();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [submitState, setSubmitState] = useState<SubmitState>("checking");
  const [canReset, setCanReset] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;

    void supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return;
      const hasSession = Boolean(data.session);
      setCanReset(hasSession);
      setSubmitState(hasSession ? "idle" : "error");
      if (!hasSession) {
        setError("This reset link is invalid or expired. Request a new one.");
      }
    });

    return () => {
      mounted = false;
    };
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (password.length < 8) {
      setSubmitState("error");
      setError("Password must be at least 8 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setSubmitState("error");
      setError("Passwords do not match.");
      return;
    }

    setSubmitState("loading");
    setError("");

    const { error: updateError } = await supabase.auth.updateUser({ password });

    if (updateError) {
      setSubmitState("error");
      setError(updateError.message);
      return;
    }

    setSubmitState("success");
  }

  return (
    <div className="mx-auto max-w-md">
      <Card className="rounded-3xl border-0 bg-card/95 shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl font-black tracking-tight">
            Set a new password
          </CardTitle>
          <CardDescription>
            Use a strong password you do not reuse elsewhere.
          </CardDescription>
        </CardHeader>

        <CardContent>
          {submitState === "checking" ? (
            <p className="rounded-xl border bg-muted p-3 text-sm font-medium text-muted-foreground">
              Verifying your reset session...
            </p>
          ) : null}

          {submitState === "success" ? (
            <div className="space-y-3">
              <p className="rounded-xl border bg-muted p-3 text-sm font-medium text-muted-foreground">
                Password updated successfully.
              </p>
              <Button className="w-full" onClick={() => router.push("/auth/login")}>
                Continue to login
              </Button>
            </div>
          ) : null}

          {submitState !== "checking" && submitState !== "success" && canReset ? (
            <form className="space-y-3" onSubmit={handleSubmit}>
              <Input
                type="password"
                placeholder="New password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                minLength={8}
                required
              />
              <Input
                type="password"
                placeholder="Confirm new password"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                minLength={8}
                required
              />

              <Button className="w-full" disabled={submitState === "loading"}>
                {submitState === "loading" ? "Updating password..." : "Update password"}
              </Button>
            </form>
          ) : null}

          <div className="mt-4 text-right text-sm">
            <Link href="/auth/forgot-password" className="font-medium text-primary hover:underline">
              Request new reset link
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
