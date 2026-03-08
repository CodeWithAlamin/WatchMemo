import type { Metadata } from "next";
import MovieTrackerClient from "@/components/movie-tracker-client";
import { getMovieDetails, searchMovies } from "@/lib/omdb";
import type { SearchParams } from "@/lib/types";

export const dynamic = "force-dynamic";

const siteName = "WatchMemo";
const pageDescription =
  "Track what you watched, add personal ratings, and keep movie notes in one place.";

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}): Promise<Metadata> {
  const resolvedParams = await searchParams;
  const query = getParam(resolvedParams?.q).trim();

  const title = query
    ? `Search "${query}" movies`
    : "Track Your Watched Movies";
  const description = query
    ? `Browse search results for "${query}" on WatchMemo and rate movies you watch.`
    : pageDescription;

  return {
    title,
    description,
    robots: query
      ? {
          index: false,
          follow: true,
        }
      : {
          index: true,
          follow: true,
        },
    alternates: {
      canonical: "/",
    },
    openGraph: {
      title: `${title} | ${siteName}`,
      description,
      url: query ? `/?q=${encodeURIComponent(query)}` : "/",
      images: [
        {
          url: "/thumbnail.png",
          width: 1200,
          height: 630,
          alt: `${siteName} preview`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} | ${siteName}`,
      description,
      images: ["/thumbnail.png"],
    },
  };
}

function getParam(value: string | string[] | undefined): string {
  return typeof value === "string" ? value : "";
}

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const resolvedParams = await searchParams;
  const query = getParam(resolvedParams?.q);
  const selectedId = getParam(resolvedParams?.selected);

  try {
    const [movies, selectedMovie] = await Promise.all([
      searchMovies(query),
      selectedId ? getMovieDetails(selectedId) : Promise.resolve(null),
    ]);

    return (
      <MovieTrackerClient
        initialQuery={query}
        movies={movies}
        selectedMovie={selectedMovie}
        fetchError=""
      />
    );
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Failed to fetch movies.";

    return (
      <MovieTrackerClient
        initialQuery={query}
        movies={[]}
        selectedMovie={null}
        fetchError={errorMessage}
      />
    );
  }
}
