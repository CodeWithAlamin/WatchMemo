"use client";

import { type FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { User } from "@supabase/supabase-js";

import { supabase } from "@/lib/supabase/client";
import { getDisplayName } from "@/lib/auth/display-name";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import SiteHeader from "@/components/site-header";
import { Skeleton } from "@/components/ui/skeleton";

export default function ProfileClient() {
  const router = useRouter();

  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const [displayName, setDisplayName] = useState("");
  const [nameStatus, setNameStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");
  const [nameError, setNameError] = useState("");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordStatus, setPasswordStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");
  const [passwordError, setPasswordError] = useState("");

  useEffect(() => {
    let mounted = true;

    void supabase.auth.getUser().then(({ data }) => {
      if (!mounted) return;

      if (!data.user) {
        router.replace("/auth/login?next=%2Fprofile");
        return;
      }

      setUser(data.user);
      setDisplayName(getDisplayName(data.user));
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session?.user) {
        router.replace("/auth/login?next=%2Fprofile");
        return;
      }
      setUser(session.user);
      setDisplayName(getDisplayName(session.user));
      setLoading(false);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [router]);

  async function handleNameSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setNameStatus("loading");
    setNameError("");

    const normalizedName = displayName.trim();
    if (normalizedName.length < 2) {
      setNameStatus("error");
      setNameError("Display name must be at least 2 characters.");
      return;
    }

    const { data, error } = await supabase.auth.updateUser({
      data: { display_name: normalizedName },
    });

    if (error) {
      setNameStatus("error");
      setNameError(error.message);
      return;
    }

    setUser(data.user);
    setNameStatus("success");
  }

  async function handlePasswordSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPasswordStatus("loading");
    setPasswordError("");

    if (password.length < 8) {
      setPasswordStatus("error");
      setPasswordError("Password must be at least 8 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setPasswordStatus("error");
      setPasswordError("Passwords do not match.");
      return;
    }

    const { error } = await supabase.auth.updateUser({ password });

    if (error) {
      setPasswordStatus("error");
      setPasswordError(error.message);
      return;
    }

    setPassword("");
    setConfirmPassword("");
    setPasswordStatus("success");
  }

  if (loading) {
    return (
      <main className="page-shell flex flex-col gap-5">
        <SiteHeader />
        <div className="mx-auto w-full max-w-6xl space-y-4" aria-label="Loading profile" aria-busy="true">
          <Skeleton className="h-24 rounded-2xl" />
          <div className="grid gap-3 lg:grid-cols-2">
            <Skeleton className="h-52 rounded-2xl" />
            <Skeleton className="h-52 rounded-2xl" />
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="page-shell flex flex-col gap-5">
      <SiteHeader />
      <div className="mx-auto w-full max-w-6xl space-y-5">
        <section className="rounded-2xl border border-white/70 bg-white/65 p-4 backdrop-blur-sm sm:p-5">
          <div>
            <h1 className="text-2xl font-black tracking-tight">
              Profile settings
            </h1>
            <p className="text-sm text-muted-foreground">
              Manage your account securely.
            </p>
          </div>
        </section>

      <div className="grid gap-3 lg:grid-cols-2">
        <Card className="rounded-2xl border-0 bg-card/95 py-0 shadow-md">
          <CardHeader className="px-5 pt-5">
            <CardTitle className="text-xl font-black tracking-tight">
              Basic profile
            </CardTitle>
            <CardDescription className="mb-2">
              Set how your name appears in the app.
            </CardDescription>
          </CardHeader>
          <CardContent className="px-5 pb-5">
            <form className="space-y-3" onSubmit={handleNameSubmit}>
              <Input type="email" value={user?.email ?? ""} disabled />
              <Input
                type="text"
                value={displayName}
                onChange={(event) => setDisplayName(event.target.value)}
                placeholder="Display name"
                minLength={2}
                maxLength={40}
                required
              />

              <Button disabled={nameStatus === "loading"}>
                {nameStatus === "loading" ? "Saving..." : "Save profile"}
              </Button>
            </form>

            {nameStatus === "success" ? (
              <p className="mt-3 rounded-xl border bg-muted p-3 text-sm font-medium text-muted-foreground">
                Profile updated.
              </p>
            ) : null}

            {nameStatus === "error" ? (
              <p className="mt-3 rounded-xl border border-destructive/30 bg-destructive/10 p-3 text-sm font-medium text-destructive">
                {nameError}
              </p>
            ) : null}
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-0 bg-card/95 py-0 shadow-md">
          <CardHeader className="px-5 pt-5">
            <CardTitle className="text-xl font-black tracking-tight">
              Change password
            </CardTitle>
            <CardDescription className="mb-2">
              Use at least 8 characters. Avoid reusing old passwords.
            </CardDescription>
          </CardHeader>
          <CardContent className="px-5 pb-5">
            <form className="space-y-3" onSubmit={handlePasswordSubmit}>
              <Input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="New password"
                minLength={8}
                required
              />
              <Input
                type="password"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                placeholder="Confirm new password"
                minLength={8}
                required
              />

              <Button disabled={passwordStatus === "loading"}>
                {passwordStatus === "loading"
                  ? "Updating..."
                  : "Update password"}
              </Button>
            </form>

            {passwordStatus === "success" ? (
              <p className="mt-3 rounded-xl border bg-muted p-3 text-sm font-medium text-muted-foreground">
                Password changed.
              </p>
            ) : null}

            {passwordStatus === "error" ? (
              <p className="mt-3 rounded-xl border border-destructive/30 bg-destructive/10 p-3 text-sm font-medium text-destructive">
                {passwordError}
              </p>
            ) : null}
          </CardContent>
        </Card>
      </div>
      </div>
    </main>
  );
}
