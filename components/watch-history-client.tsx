"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useWatchHistory } from "@/lib/use-watch-history";
import type { WatchedMovie } from "@/lib/types";
import RatingStars from "@/components/rating-stars";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

type Filter = "all" | "loved" | "good" | "low";
const PAGE_SIZE = 10;

export default function WatchHistoryClient() {
  const { user, movies, loading, error, updateMovie, removeMovie } = useWatchHistory();
  const [filter, setFilter] = useState<Filter>("all");
  const [page, setPage] = useState(1);
  const counts = useMemo(() => ({
    all: movies.length,
    loved: movies.filter((movie) => movie.userRating === 5).length,
    good: movies.filter((movie) => movie.userRating >= 3 && movie.userRating <= 4).length,
    low: movies.filter((movie) => movie.userRating <= 2).length,
  }), [movies]);
  const filteredMovies = useMemo(() => movies
    .filter((movie) => {
      if (filter === "loved") return movie.userRating === 5;
      if (filter === "good") return movie.userRating >= 3 && movie.userRating <= 4;
      if (filter === "low") return movie.userRating <= 2;
      return true;
    })
    .sort((a, b) => Date.parse(b.updatedAt ?? "") - Date.parse(a.updatedAt ?? "")),
  [filter, movies]);
  const totalPages = Math.max(1, Math.ceil(filteredMovies.length / PAGE_SIZE));
  const pageMovies = filteredMovies.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  if (loading) {
    return <div className="space-y-2.5" aria-label="Loading watch history" aria-busy="true">{Array.from({ length: 4 }).map((_, index) => <Skeleton key={index} className="h-24 rounded-xl" />)}</div>;
  }

  if (!user) {
    return (
      <div className="rounded-2xl border border-white/80 bg-white/70 p-5 text-center shadow-md">
        <h2 className="text-lg font-bold">Your history is private</h2>
        <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">Sign in to see your movies, ratings, and notes.</p>
        <Button asChild size="sm" className="mt-4 rounded-full"><Link href="/auth/login?next=%2Fhistory">Sign in to view history</Link></Button>
      </div>
    );
  }

  const filters: { id: Filter; label: string }[] = [
    { id: "all", label: "All" },
    { id: "loved", label: "Loved" },
    { id: "good", label: "Good" },
    { id: "low", label: "Low rated" },
  ];

  return (
    <div className="space-y-4">
      {error ? <p role="alert" className="rounded-2xl border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">{error}</p> : null}
      <div className="flex flex-wrap gap-2" aria-label="Filter watch history">
        {filters.map((item) => (
          <Button key={item.id} size="sm" variant={filter === item.id ? "default" : "outline"} onClick={() => { setFilter(item.id); setPage(1); }}>
            {item.label} <span className="ml-1 opacity-70">{counts[item.id]}</span>
          </Button>
        ))}
      </div>
      {filteredMovies.length > 0 ? (
        <p className="text-sm text-muted-foreground" aria-live="polite">
          Showing {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filteredMovies.length)} of {filteredMovies.length} movies
        </p>
      ) : null}
      {!filteredMovies.length ? (
        <div className="rounded-2xl border border-white/80 bg-white/65 p-5 text-center">
          <h2 className="font-bold">{movies.length ? "No movies in this filter" : "Your watch history is empty"}</h2>
          <p className="mt-2 text-sm text-muted-foreground">Add a rating or note to a movie to get started.</p>
          <Button asChild size="sm" variant="outline" className="mt-3 rounded-full"><Link href="/">Browse movies</Link></Button>
        </div>
      ) : (
        <ul className="space-y-2.5">
          {pageMovies.map((movie) => (
            <HistoryItem
              key={movie.imdbID}
              movie={movie}
              onSave={updateMovie}
              onRemove={removeMovie}
            />
          ))}
        </ul>
      )}
      {totalPages > 1 ? (
        <nav className="flex items-center justify-center gap-3 pt-2" aria-label="Watch history pages">
          <Button size="sm" variant="outline" disabled={page === 1} onClick={() => setPage((current) => current - 1)}>
            Previous
          </Button>
          <span className="min-w-20 text-center text-sm text-muted-foreground" aria-live="polite">
            Page {page} of {totalPages}
          </span>
          <Button size="sm" variant="outline" disabled={page === totalPages} onClick={() => setPage((current) => current + 1)}>
            Next
          </Button>
        </nav>
      ) : null}
    </div>
  );
}

function HistoryItem({
  movie,
  onSave,
  onRemove,
}: {
  movie: WatchedMovie;
  onSave: (id: string, updates: Pick<WatchedMovie, "userRating" | "comment">) => Promise<void>;
  onRemove: (id: string) => Promise<void>;
}) {
  const [editing, setEditing] = useState(false);
  const [rating, setRating] = useState(movie.userRating);
  const [note, setNote] = useState(movie.comment ?? "");
  const [busy, setBusy] = useState(false);
  const [localError, setLocalError] = useState("");
  const [confirmRemove, setConfirmRemove] = useState(false);

  async function save() {
    setBusy(true);
    setLocalError("");
    try {
      await onSave(movie.imdbID, { userRating: rating, comment: note.trim() || undefined });
      setEditing(false);
    } catch (saveError) {
      setLocalError(saveError instanceof Error ? saveError.message : "Could not save changes.");
    } finally {
      setBusy(false);
    }
  }

  async function remove() {
    setBusy(true);
    setLocalError("");
    try {
      await onRemove(movie.imdbID);
    } catch (removeError) {
      setLocalError(removeError instanceof Error ? removeError.message : "Could not remove this movie.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <li className="rounded-2xl border border-white/80 bg-white/70 p-3 shadow-sm sm:p-4">
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="flex min-w-0 flex-1 gap-3">
          {movie.poster && movie.poster !== "N/A" ? (
            <Image src={movie.poster} alt={`${movie.title} poster`} width={64} height={96} unoptimized className="h-24 w-16 rounded-lg bg-slate-200 object-cover" />
          ) : <div className="flex h-24 w-16 shrink-0 items-center justify-center rounded-lg bg-slate-100 p-2 text-center text-xs text-muted-foreground">No poster</div>}
          <div className="min-w-0 flex-1">
            <Link href={movie.imdbID.startsWith("tmdb:") ? `/movie/tmdb/${movie.imdbID.slice(5)}?from=history` : `/movie/${movie.imdbID}?from=history`} className="font-bold hover:text-primary hover:underline">{movie.title}</Link>
            <p className="mt-1 text-sm text-muted-foreground">{movie.year} · Your rating {movie.userRating}/5{movie.runtime ? ` · ${movie.runtime} min` : ""}</p>
            {!editing && movie.comment ? <p className="mt-3 text-sm italic text-slate-600">“{movie.comment}”</p> : null}
          </div>
        </div>
        <div className="flex shrink-0 gap-2 sm:flex-col">
          {!editing ? <Button variant="outline" size="sm" disabled={busy} onClick={() => { setRating(movie.userRating); setNote(movie.comment ?? ""); setEditing(true); }}>Edit</Button> : null}
          {!confirmRemove ? (
            <Button variant="outline" size="sm" disabled={busy} onClick={() => setConfirmRemove(true)}>Remove</Button>
          ) : (
            <div className="flex items-center gap-2 rounded-xl bg-rose-50 p-2 sm:flex-col sm:items-stretch">
              <span className="text-xs font-medium text-rose-900">Remove this movie?</span>
              <Button variant="destructive" size="sm" disabled={busy} onClick={() => void remove()}>{busy ? "Removing…" : "Confirm"}</Button>
              <Button variant="outline" size="sm" disabled={busy} onClick={() => setConfirmRemove(false)}>Keep</Button>
            </div>
          )}
        </div>
      </div>
      {editing ? (
        <div className="mt-4 rounded-2xl bg-slate-50 p-4">
          <RatingStars maxRating={5} size={22} rating={rating} onSetRating={setRating} />
          <label htmlFor={`note-${movie.imdbID}`} className="sr-only">Note about {movie.title}</label>
          <textarea id={`note-${movie.imdbID}`} value={note} onChange={(event) => setNote(event.target.value)} className="mt-3 min-h-24 w-full rounded-xl border bg-white p-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring" placeholder="Add a note (optional)" />
          {localError ? <p role="alert" className="mt-2 text-sm text-destructive">{localError}</p> : null}
          <div className="mt-3 flex gap-2">
            <Button size="sm" disabled={busy || rating < 1} onClick={() => void save()}>{busy ? "Saving…" : "Save changes"}</Button>
            <Button size="sm" variant="outline" disabled={busy} onClick={() => setEditing(false)}>Cancel</Button>
          </div>
        </div>
      ) : null}
      {!editing && localError ? <p role="alert" className="mt-3 text-sm text-destructive">{localError}</p> : null}
    </li>
  );
}
