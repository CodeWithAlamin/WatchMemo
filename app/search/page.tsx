import type { Metadata } from "next";
import MovieSearchForm from "@/components/movie-search-form";
import MovieSearchResults from "@/components/movie-search-results";
import SiteHeader from "@/components/site-header";
import { searchMovies } from "@/lib/tmdb";
import type { SearchParams } from "@/lib/types";

function getQuery(value: string | string[] | undefined): string {
  return typeof value === "string" ? value.trim() : "";
}

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}): Promise<Metadata> {
  const query = getQuery((await searchParams).q);
  return {
    title: query ? `Search ${query}` : "Search Movies",
    description: query
      ? `Search movie titles matching ${query} in WatchMemo.`
      : "Search for movies by title.",
    robots: { index: false, follow: true },
    alternates: { canonical: "/search" },
  };
}

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const query = getQuery((await searchParams).q);
  let movies = [] as Awaited<ReturnType<typeof searchMovies>>;
  let errorMessage = "";

  if (query.length >= 2) {
    try {
      movies = await searchMovies(query);
    } catch (error) {
      errorMessage = error instanceof Error
        ? error.message
        : "Could not search right now. Please try again.";
    }
  }

  return (
    <main className="page-shell flex flex-col gap-6">
      <SiteHeader />
      <section className="flex w-full flex-col gap-3 md:flex-row md:items-center md:justify-between md:gap-8">
        <h1 className="shrink-0 text-2xl font-bold tracking-tight sm:text-3xl">Search movies</h1>
        <div className="w-full md:max-w-4xl md:flex-1">
          <MovieSearchForm initialQuery={query} />
        </div>
      </section>

      {errorMessage ? (
        <div role="alert" className="rounded-xl border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
          {errorMessage}
        </div>
      ) : query.length < 2 ? (
        null
      ) : (
        <section className="w-full space-y-4" aria-labelledby="search-results-heading">
          <h2 id="search-results-heading" className="text-lg font-semibold tracking-tight">
            Results for “{query}”
          </h2>
          <MovieSearchResults movies={movies} query={query} />
        </section>
      )}
    </main>
  );
}
