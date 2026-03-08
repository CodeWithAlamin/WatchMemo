"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { Search } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { Input } from "@/components/ui/input";

interface SearchInputProps {
  initialQuery: string;
  resultCount: number;
}

export default function SearchInput({
  initialQuery,
  resultCount,
}: SearchInputProps) {
  const [query, setQuery] = useState(initialQuery);
  const [isPending, startTransition] = useTransition();
  const inputRef = useRef<HTMLInputElement | null>(null);

  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    setQuery(initialQuery);
  }, [initialQuery]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      const currentQuery = searchParams.get("q") ?? "";

      if (query.trim() === currentQuery.trim()) return;

      const nextParams = new URLSearchParams(searchParams.toString());

      if (query.trim()) {
        nextParams.set("q", query.trim());
      } else {
        nextParams.delete("q");
      }

      nextParams.delete("selected");

      startTransition(() => {
        const nextQuery = nextParams.toString();
        router.replace(nextQuery ? `${pathname}?${nextQuery}` : pathname, {
          scroll: false,
        });
      });
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [pathname, query, router, searchParams]);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent): void {
      if (event.key !== "Enter") return;
      if (document.activeElement === inputRef.current) return;

      inputRef.current?.focus();
      setQuery("");
    }

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, []);

  return (
    <div className="w-full">
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          ref={inputRef}
          className="h-12 w-full rounded-2xl border bg-background/80 pl-10 pr-32 text-sm shadow-sm transition focus-visible:ring-2"
          type="text"
          placeholder="Search films by title..."
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
        <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 rounded-full border bg-secondary px-2.5 py-1 text-[11px] font-semibold text-muted-foreground">
          {resultCount} matches
        </span>
      </div>
      {isPending ? (
        <p className="mt-1 text-right text-xs font-medium text-muted-foreground">Updating results...</p>
      ) : null}
    </div>
  );
}
