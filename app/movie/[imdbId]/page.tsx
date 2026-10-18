import type { Metadata } from "next";
import Link from "next/link";
import { cache } from "react";
import { notFound } from "next/navigation";
import SiteHeader from "@/components/site-header";
import MovieDetailClient from "@/components/movie-detail-client";
import { getMovieDetailsByImdbId } from "@/lib/tmdb";
import type { MovieDetails } from "@/lib/types";
import type { SearchParams } from "@/lib/types";

interface MoviePageProps {
  params: Promise<{ imdbId: string }>;
  searchParams: Promise<SearchParams>;
}

const getCachedMovieDetails = cache(getMovieDetailsByImdbId);

function isImdbId(value: string): boolean {
  return /^tt\d{7,10}$/.test(value);
}

export async function generateMetadata({ params }: MoviePageProps): Promise<Metadata> {
  const { imdbId } = await params;
  if (!isImdbId(imdbId)) return { title: "Movie not found" };
  try {
    const movie = await getCachedMovieDetails(imdbId);
    if (!movie) return { title: "Movie not found", robots: { index: false } };
    const canonical = movie.tmdbID
      ? `/movie/tmdb/${movie.tmdbID}`
      : `/movie/${imdbId}`;
    const description = movie.Plot && movie.Plot !== "N/A"
      ? movie.Plot
      : `Movie details and personal ratings for ${movie.Title}.`;
    const image = movie.Poster !== "N/A" ? movie.Poster : undefined;
    return {
      title: movie.Title,
      description,
      alternates: { canonical },
      openGraph: {
        type: "website",
        title: `${movie.Title} | WatchMemo`,
        description,
        url: canonical,
        ...(image ? { images: [{ url: image, alt: `${movie.Title} poster` }] } : {}),
      },
      twitter: {
        card: image ? "summary_large_image" : "summary",
        title: `${movie.Title} | WatchMemo`,
        description,
        ...(image ? { images: [image] } : {}),
      },
    };
  } catch {
    return { title: "Movie details" };
  }
}

function getReturnNavigation(searchParams: SearchParams) {
  const source = typeof searchParams.from === "string" ? searchParams.from : "";
  const query = typeof searchParams.q === "string" ? searchParams.q.slice(0, 120) : "";

  if (source === "history") {
    return { backHref: "/history", backLabel: "Back to my history" };
  }
  if (source === "search" && query) {
    return {
      backHref: `/search?q=${encodeURIComponent(query)}`,
      backLabel: `Back to search results`,
    };
  }
  return { backHref: "/", backLabel: "Back to discover" };
}

export default async function MoviePage({ params, searchParams }: MoviePageProps) {
  const [{ imdbId }, resolvedSearchParams] = await Promise.all([params, searchParams]);
  const { backHref, backLabel } = getReturnNavigation(resolvedSearchParams);
  const currentQuery = new URLSearchParams();
  if (resolvedSearchParams.from === "history") currentQuery.set("from", "history");
  if (resolvedSearchParams.from === "search" && typeof resolvedSearchParams.q === "string") {
    currentQuery.set("from", "search");
    currentQuery.set("q", resolvedSearchParams.q.slice(0, 120));
  }
  const currentQueryString = currentQuery.toString();
  const currentHref = `/movie/${imdbId}${currentQueryString ? `?${currentQueryString}` : ""}`;
  let movie: MovieDetails | null = null;
  let errorMessage = "";

  if (isImdbId(imdbId)) {
    try {
      movie = await getCachedMovieDetails(imdbId);
    } catch (error) {
      if (error instanceof Error && error.message === "Movie not found!") {
        errorMessage = "We couldn't find that movie in TMDB.";
      } else {
        errorMessage = error instanceof Error
          ? error.message
          : "Movie details are temporarily unavailable.";
      }
    }
  }

  if (!isImdbId(imdbId)) notFound();

  return (
    <div className="page-shell">
      <SiteHeader />
      {movie ? (
        <MovieDetailClient
          movie={movie}
          backHref={backHref}
          backLabel={backLabel}
          currentHref={currentHref}
        />
      ) : (
        <main className="mx-auto max-w-2xl py-10 text-center">
          <h1 className="text-3xl font-black">Movie unavailable</h1>
          <p role="alert" className="mt-3 text-sm text-muted-foreground">
            {errorMessage || "This movie link is invalid or the movie could not be found."}
          </p>
          <Link href={backHref} className="mt-6 inline-flex rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground">
            {backLabel}
          </Link>
        </main>
      )}
    </div>
  );
}
