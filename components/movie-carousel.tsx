"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Star } from "lucide-react";
import type { DiscoveryMovie } from "@/lib/tmdb";

export default function MovieCarousel({
  title,
  movies,
}: {
  title: string;
  movies: DiscoveryMovie[];
}) {
  const listRef = useRef<HTMLUListElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const updateScrollButtons = useCallback(() => {
    const list = listRef.current;
    if (!list) return;
    setCanScrollLeft(list.scrollLeft > 2);
    setCanScrollRight(list.scrollLeft + list.clientWidth < list.scrollWidth - 2);
  }, []);

  useEffect(() => {
    const list = listRef.current;
    if (!list) return;

    updateScrollButtons();
    const observer = new ResizeObserver(updateScrollButtons);
    observer.observe(list);
    return () => observer.disconnect();
  }, [movies.length, updateScrollButtons]);

  function scroll(direction: -1 | 1) {
    listRef.current?.scrollBy({
      left: direction * listRef.current.clientWidth * 0.8,
      behavior: "smooth",
    });
  }

  return (
    <section aria-labelledby={`carousel-${title.toLowerCase().replaceAll(" ", "-")}`}>
      <div className="mb-3 flex items-center justify-between gap-3">
        <h2
          id={`carousel-${title.toLowerCase().replaceAll(" ", "-")}`}
          className="text-lg font-bold tracking-tight sm:text-xl"
        >
          {title}
        </h2>
        <div className="flex shrink-0 gap-2">
          <button
            type="button"
            onClick={() => scroll(-1)}
            disabled={!canScrollLeft}
            aria-label={`Scroll ${title} left`}
            className="inline-flex size-8 items-center justify-center rounded-full border bg-white/80 text-slate-700 shadow-sm transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-40"
          >
            <ChevronLeft className="size-4" />
          </button>
          <button
            type="button"
            onClick={() => scroll(1)}
            disabled={!canScrollRight}
            aria-label={`Scroll ${title} right`}
            className="inline-flex size-8 items-center justify-center rounded-full border bg-white/80 text-slate-700 shadow-sm transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-40"
          >
            <ChevronRight className="size-4" />
          </button>
        </div>
      </div>
      <ul
        ref={listRef}
        onScroll={updateScrollButtons}
        aria-label={`${title} movies`}
        className="flex snap-x snap-mandatory touch-pan-x gap-3 overflow-x-auto overscroll-x-contain scroll-smooth pb-2"
      >
        {movies.slice(0, 8).map((movie) => (
          <DiscoveryCard key={movie.id} movie={movie} />
        ))}
      </ul>
    </section>
  );
}

function DiscoveryCard({ movie }: { movie: DiscoveryMovie }) {
  const year = movie.releaseDate ? movie.releaseDate.slice(0, 4) : "—";
  return (
    <li className="w-[34vw] min-w-0 max-w-44 shrink-0 snap-start sm:w-40 lg:w-44">
      <Link
        href={`/movie/tmdb/${movie.id}?title=${encodeURIComponent(movie.title)}`}
        className="group block h-full overflow-hidden rounded-xl border border-white/70 bg-white/80 shadow-sm shadow-slate-900/5 transition duration-200 hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        aria-label={`View details for ${movie.title}`}
      >
        <div className="relative aspect-[2/3] bg-slate-200">
          {movie.posterUrl ? (
            <Image
              src={movie.posterUrl}
              alt={`${movie.title} poster`}
              fill
              sizes="(max-width: 640px) 45vw, (max-width: 1280px) 20vw, 12vw"
              unoptimized
              className="object-cover"
            />
          ) : (
            <div className="flex h-full items-center justify-center px-4 text-center text-sm text-muted-foreground">
              No poster
            </div>
          )}
        </div>
        <div className="p-2.5">
          <h3 className="line-clamp-2 min-h-9 text-[13px] font-semibold leading-5 group-hover:text-primary">
            {movie.title}
          </h3>
          <div className="mt-1.5 flex items-center justify-between gap-2 text-[11px] text-muted-foreground">
            <span>{year}</span>
            {movie.rating > 0 ? (
              <span className="inline-flex items-center gap-1">
                <Star className="size-3 fill-amber-400 text-amber-400" />
                {movie.rating.toFixed(1)}
              </span>
            ) : null}
          </div>
        </div>
      </Link>
    </li>
  );
}
