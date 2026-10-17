import type { Metadata } from "next";
import Link from "next/link";
import { cache } from "react";
import { notFound } from "next/navigation";
import SiteHeader from "@/components/site-header";
import MovieDetailClient from "@/components/movie-detail-client";
import { getMovieDetailsByTmdbId } from "@/lib/tmdb";
import type { SearchParams } from "@/lib/types";

interface TmdbMoviePageProps {
  params: Promise<{ tmdbId: string }>;
  searchParams: Promise<SearchParams>;
}

const getCachedMovie = cache(getMovieDetailsByTmdbId);

function getMovieId(value: string): number | null {
  const id = Number(value);
  return Number.isSafeInteger(id) && id > 0 ? id : null;
}

function getReturnNavigation(searchParams: SearchParams) {
  const source = typeof searchParams.from === "string" ? searchParams.from : "";
  const query = typeof searchParams.q === "string" ? searchParams.q.slice(0, 120) : "";
  if (source === "history") return { backHref: "/history", backLabel: "Back to history" };
  if (source === "search" && query) {
    return { backHref: `/search?q=${encodeURIComponent(query)}`, backLabel: "Back to search" };
  }
  return { backHref: "/", backLabel: "Back to movies" };
}

export async function generateMetadata({ params }: TmdbMoviePageProps): Promise<Metadata> {
  const { tmdbId } = await params;
  const id = getMovieId(tmdbId);
  if (!id) return { title: "Movie not found", robots: { index: false } };
  try {
    const movie = await getCachedMovie(id);
    return {
      title: movie?.Title ?? "Movie details",
      description: movie?.Plot && movie.Plot !== "N/A" ? movie.Plot : "Movie details and ratings.",
      robots: { index: false, follow: true },
    };
  } catch {
    return { title: "Movie details", robots: { index: false, follow: true } };
  }
}

export default async function TmdbMoviePage({ params, searchParams }: TmdbMoviePageProps) {
  const [{ tmdbId }, resolvedSearchParams] = await Promise.all([params, searchParams]);
  const id = getMovieId(tmdbId);
  if (!id) notFound();

  const { backHref, backLabel } = getReturnNavigation(resolvedSearchParams);
  const currentQuery = new URLSearchParams();
  if (resolvedSearchParams.from === "history") currentQuery.set("from", "history");
  if (resolvedSearchParams.from === "search" && typeof resolvedSearchParams.q === "string") {
    currentQuery.set("from", "search");
    currentQuery.set("q", resolvedSearchParams.q.slice(0, 120));
  }
  const currentHref = `/movie/tmdb/${id}${currentQuery.size ? `?${currentQuery}` : ""}`;

  let movie = null;
  let errorMessage = "";
  try {
    movie = await getCachedMovie(id);
  } catch (error) {
    errorMessage = error instanceof Error ? error.message : "Movie details are unavailable.";
  }

  return (
    <div className="page-shell">
      <SiteHeader />
      {movie ? (
        <MovieDetailClient movie={movie} backHref={backHref} backLabel={backLabel} currentHref={currentHref} />
      ) : (
        <main className="mx-auto max-w-2xl py-10 text-center">
          <h1 className="text-3xl font-black">Movie unavailable</h1>
          <p role="alert" className="mt-3 text-sm text-muted-foreground">{errorMessage}</p>
          <Link href={backHref} className="mt-6 inline-flex rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground">{backLabel}</Link>
        </main>
      )}
    </div>
  );
}
