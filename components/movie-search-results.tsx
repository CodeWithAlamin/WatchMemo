import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { MovieSearchResult } from "@/lib/types";

export default function MovieSearchResults({
  movies,
  query,
}: {
  movies: MovieSearchResult[];
  query: string;
}) {
  if (!movies.length) {
    return (
      <div className="rounded-2xl border border-white/80 bg-white/70 p-5 text-center shadow-sm">
        <h2 className="text-lg font-bold">No movies found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Try a different title or check the spelling.
        </p>
      </div>
    );
  }

  return (
    <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7">
      {movies.map((movie) => (
        <li key={movie.tmdbID}>
          <Link
            href={`/movie/tmdb/${movie.tmdbID}?from=search&q=${encodeURIComponent(query)}`}
            className="group block h-full overflow-hidden rounded-xl border border-white/80 bg-white/75 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <div className="relative aspect-[2/3] bg-slate-200">
              {movie.Poster && movie.Poster !== "N/A" ? (
                <Image
                  src={movie.Poster}
                  alt={`${movie.Title} poster`}
                  fill
                  sizes="(max-width: 640px) 45vw, (max-width: 1024px) 30vw, 18vw"
                  unoptimized
                  className="object-cover transition duration-300 group-hover:scale-[1.03]"
                />
              ) : (
                <div className="flex h-full items-center justify-center p-4 text-center text-sm text-muted-foreground">
                  Poster unavailable
                </div>
              )}
            </div>
            <div className="p-2.5 sm:p-3">
              <h2 className="line-clamp-2 min-h-9 text-[13px] font-bold leading-5 sm:text-sm">
                {movie.Title}
              </h2>
              <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
                <span>{movie.Year}</span>
                <span className="inline-flex items-center gap-1 font-semibold text-primary">
                  Details <ArrowRight className="size-3" />
                </span>
              </div>
            </div>
          </Link>
        </li>
      ))}
    </ul>
  );
}
