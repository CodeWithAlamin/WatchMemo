import MovieCarousel from "@/components/movie-carousel";
import type { MovieDiscovery } from "@/lib/tmdb";

const sections = [
  { key: "trending", title: "Trending this week" },
  { key: "nowPlaying", title: "Now playing" },
  { key: "upcoming", title: "Coming soon" },
] as const;

export default function MovieDiscoverySections({
  discovery,
}: {
  discovery: MovieDiscovery;
}) {
  const hasMovies = sections.some(({ key }) => discovery[key].length > 0);

  return (
    <section aria-label="Movie listings" className="space-y-6">
      {discovery.hasError ? (
        <p role="status" className="rounded-xl border bg-card px-4 py-3 text-sm text-muted-foreground">
          Movie listings are unavailable. Try searching for a title.
        </p>
      ) : null}
      {sections.map(({ key, title }) => {
        const movies = discovery[key];
        return movies.length ? (
          <MovieCarousel key={key} title={title} movies={movies} />
        ) : null;
      })}
      {!hasMovies && !discovery.hasError ? (
        <p className="rounded-xl border bg-card px-4 py-3 text-sm text-muted-foreground">
          No movies to show. Try searching for a title.
        </p>
      ) : null}
    </section>
  );
}
