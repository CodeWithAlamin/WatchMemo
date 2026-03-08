import MovieTrackerClient from "@/components/movie-tracker-client";
import { getMovieDetails, searchMovies } from "@/lib/omdb";
import type { SearchParams } from "@/lib/types";

export const dynamic = "force-dynamic";

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
