import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function MovieSearchForm({
  initialQuery = "",
}: {
  initialQuery?: string;
}) {
  return (
    <form action="/search" className="flex w-full items-stretch gap-2">
      <label htmlFor="movie-search" className="sr-only">Search movies by title</label>
      <div className="relative min-w-0 flex-1">
        <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
        <Input
          id="movie-search"
          name="q"
          type="search"
          minLength={2}
          placeholder="Search movies"
          defaultValue={initialQuery}
          className="h-11 rounded-xl border-slate-200 bg-white pl-10 pr-3 text-sm text-slate-900 shadow-sm placeholder:text-slate-400 focus-visible:ring-primary"
        />
      </div>
      <Button type="submit" className="h-11 shrink-0 rounded-xl px-4">
        Search
      </Button>
    </form>
  );
}
