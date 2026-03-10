"use client";

import {
  type FormEvent,
  useCallback,
  useEffect,
  useRef,
  useState,
  useTransition,
} from "react";
import { LoaderCircle, Search } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface MovieSearchInputProps {
  initialQuery: string;
}

export default function MovieSearchInput({
  initialQuery,
}: MovieSearchInputProps) {
  const DEBOUNCE_MS = 700;
  const [query, setQuery] = useState(initialQuery);
  const [hasPendingUserInput, setHasPendingUserInput] = useState(false);
  const [isPending, startTransition] = useTransition();
  const inputRef = useRef<HTMLInputElement | null>(null);
  const lastAppliedQueryRef = useRef(initialQuery.trim());

  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (hasPendingUserInput) return;

    const nextQuery = initialQuery.trim();
    lastAppliedQueryRef.current = nextQuery;
    setQuery(initialQuery);
    setHasPendingUserInput(false);
  }, [initialQuery, hasPendingUserInput]);

  const applySearch = useCallback((nextQuery: string): void => {
    const trimmedQuery = nextQuery.trim();
    const currentQuery = (searchParams.get("q") ?? "").trim();

    lastAppliedQueryRef.current = trimmedQuery;
    setHasPendingUserInput(false);

    if (trimmedQuery === currentQuery) return;

    const nextParams = new URLSearchParams(searchParams.toString());

    if (trimmedQuery) {
      nextParams.set("q", trimmedQuery);
    } else {
      nextParams.delete("q");
    }

    nextParams.delete("selected");

    startTransition(() => {
      const nextUrlQuery = nextParams.toString();
      const nextUrl = nextUrlQuery ? `${pathname}?${nextUrlQuery}` : pathname;

      // Create one history step when moving from home -> searched state.
      if (!currentQuery && trimmedQuery) {
        router.push(nextUrl, { scroll: false });
        return;
      }

      router.replace(nextUrl, { scroll: false });
    });
  }, [pathname, router, searchParams, startTransition]);

  function handleSubmit(event: FormEvent<HTMLFormElement>): void {
    event.preventDefault();
    applySearch(query);
  }

  useEffect(() => {
    if (!hasPendingUserInput) return;

    const timeoutId = setTimeout(() => {
      applySearch(query);
    }, DEBOUNCE_MS);

    return () => clearTimeout(timeoutId);
  }, [query, DEBOUNCE_MS, applySearch, hasPendingUserInput]);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent): void {
      if (event.key !== "Enter") return;
      if (document.activeElement === inputRef.current) return;

      inputRef.current?.focus();
    }

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, []);

  return (
    <div className="w-full">
      <form className="relative" onSubmit={handleSubmit}>
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          ref={inputRef}
          className="h-12 w-full rounded-2xl border bg-background/80 pl-10 pr-24 text-sm shadow-sm transition focus-visible:ring-2"
          type="text"
          placeholder="Search by movie title..."
          value={query}
          onChange={(event) => {
            setQuery(event.target.value);
            setHasPendingUserInput(true);
          }}
        />
        <div className="absolute right-2 top-1/2 flex -translate-y-1/2 items-center gap-1.5">
          <Button size="sm" className="h-8 rounded-xl px-3" disabled={isPending}>
            {isPending ? (
              <>
                <LoaderCircle className="mr-1 size-3.5 motion-safe:animate-spin" />
                Searching...
              </>
            ) : (
              <>
                <Search className="mr-1 size-3.5" />
                Search
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
