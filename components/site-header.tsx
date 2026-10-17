"use client";

import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { useEffect, useRef, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { Clock3, LogOut, Menu, Search, UserRound, X } from "lucide-react";
import { supabase } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";

export default function SiteHeader() {
  const [user, setUser] = useState<User | null>(null);
  const [ready, setReady] = useState(false);
  const [signOutError, setSignOutError] = useState("");
  const [mobileOpen, setMobileOpen] = useState(false);
  const mobileMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let mounted = true;
    void supabase.auth.getUser().then(({ data }) => {
      if (!mounted) return;
      setUser(data.user ?? null);
      setReady(true);
    }).catch(() => {
      if (mounted) setReady(true);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (!mounted) return;
        setUser(session?.user ?? null);
        setReady(true);
      },
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!mobileOpen) return;
    function closeOutside(event: PointerEvent) {
      if (!mobileMenuRef.current?.contains(event.target as Node)) setMobileOpen(false);
    }
    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === "Escape") setMobileOpen(false);
    }
    document.addEventListener("pointerdown", closeOutside);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("pointerdown", closeOutside);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [mobileOpen]);

  async function signOut() {
    setMobileOpen(false);
    setSignOutError("");
    try {
      const { error } = await supabase.auth.signOut();
      if (error) setSignOutError(error.message);
    } catch (error) {
      setSignOutError(error instanceof Error ? error.message : "Could not sign out.");
    }
  }

  return (
    <header className="relative py-2">
      <div className="flex min-h-12 items-center justify-between gap-3">
        <Link href="/" className="inline-flex shrink-0" aria-label="WatchMemo home">
          <Image
            src="/watchmemo-logo-wordmark.svg"
            alt="WatchMemo"
            width={230}
            height={48}
            priority
            className="h-8 w-auto sm:h-9"
          />
        </Link>

        <nav className="hidden items-center gap-1 md:flex md:gap-2" aria-label="Main navigation">
          <NavLink href="/search" label="Search" icon={<Search className="size-4" />} />
          <NavLink href="/history" label="History" icon={<Clock3 className="size-4" />} />
          <div className="flex h-9 w-52 items-center justify-end gap-1">
            {ready ? user ? (
              <>
                <NavLink href="/profile" label="Profile" icon={<UserRound className="size-4" />} />
                <NavButton onClick={() => void signOut()} label="Sign out" icon={<LogOut className="size-4" />} />
              </>
            ) : (
              <>
                <Link href="/auth/login" className="inline-flex h-9 items-center rounded-full px-3 text-sm font-semibold text-slate-700 transition hover:bg-white/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">Sign in</Link>
                <Link href="/auth/signup" className="inline-flex h-9 items-center rounded-full border border-white/80 bg-white/75 px-3 text-sm font-semibold text-slate-700 transition hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">Create account</Link>
              </>
            ) : (
              <span aria-hidden="true" className="loading-shimmer h-8 w-20 rounded-full" />
            )}
          </div>
        </nav>

        <div className="relative md:hidden" ref={mobileMenuRef}>
          <Button
            variant="outline"
            size="icon"
            className="rounded-full border-white/80 bg-white/75"
            aria-label={mobileOpen ? "Close navigation menu" : "Open navigation menu"}
            aria-expanded={mobileOpen}
            aria-controls="mobile-navigation"
            onClick={() => setMobileOpen((open) => !open)}
          >
            {mobileOpen ? <X className="size-5" /> : <Menu className="size-5" />}
          </Button>
          {mobileOpen ? (
            <nav id="mobile-navigation" aria-label="Mobile navigation" className="mobile-menu-pop absolute right-0 top-full z-50 mt-2 w-52 rounded-xl border bg-card p-1.5 text-card-foreground shadow-lg">
              <MobileNavLink href="/search" onClick={() => setMobileOpen(false)} icon={<Search className="size-4" />}>Search movies</MobileNavLink>
              <MobileNavLink href="/history" onClick={() => setMobileOpen(false)} icon={<Clock3 className="size-4" />}>My history</MobileNavLink>
              {ready ? user ? (
                <>
                  <MobileNavLink href="/profile" onClick={() => setMobileOpen(false)} icon={<UserRound className="size-4" />}>Profile</MobileNavLink>
                  <div className="my-1.5 border-t" />
                  <button type="button" onClick={() => void signOut()} className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm font-medium text-slate-700 transition hover:bg-secondary">
                    <LogOut className="size-4" />Sign out
                  </button>
                </>
              ) : (
                <>
                  <div className="my-1.5 border-t" />
                  <MobileNavLink href="/auth/login" onClick={() => setMobileOpen(false)}>Sign in</MobileNavLink>
                </>
              ) : null}
            </nav>
          ) : null}
        </div>
      </div>
      {signOutError ? <p role="alert" className="absolute right-0 top-full z-40 mt-1 rounded-lg border border-destructive/30 bg-background px-3 py-2 text-right text-sm text-destructive shadow-md">{signOutError}</p> : null}
    </header>
  );
}

function MobileNavLink({
  href,
  onClick,
  icon,
  children,
}: {
  href: string;
  onClick: () => void;
  icon?: ReactNode;
  children: ReactNode;
}) {
  return (
    <Link href={href} onClick={onClick} className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-secondary">
      {icon}{children}
    </Link>
  );
}

function NavButton({
  onClick,
  label,
  icon,
}: {
  onClick: () => void;
  label: string;
  icon: ReactNode;
}) {
  return (
    <button type="button" onClick={onClick} className="inline-flex h-9 items-center gap-2 rounded-full px-3 text-sm font-semibold text-slate-700 transition hover:bg-white/70 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" aria-label={label}>
      {icon}<span>{label}</span>
    </button>
  );
}

function NavLink({
  href,
  label,
  icon,
}: {
  href: string;
  label: string;
  icon: ReactNode;
}) {
  return (
    <Link
      href={href}
      aria-label={label}
      title={label}
      className="inline-flex size-9 items-center justify-center gap-2 rounded-full px-2 text-sm font-semibold text-slate-700 transition hover:bg-white/70 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:h-9 sm:w-auto sm:px-3"
    >
      {icon}
      <span className="hidden sm:inline">{label}</span>
    </Link>
  );
}
