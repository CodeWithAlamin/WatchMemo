"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Check, Star } from "lucide-react";
import type { MovieDetails, WatchedMovie } from "@/lib/types";
import { useWatchHistory } from "@/lib/use-watch-history";
import RatingStars from "@/components/rating-stars";
import { Button } from "@/components/ui/button";

function isAvailable(value: string | undefined): boolean {
  return Boolean(value && value !== "N/A" && value.trim());
}

function runtimeMinutes(runtime: string): number {
  const value = Number(runtime.split(" ")[0]);
  return Number.isFinite(value) ? value : 0;
}

export default function MovieDetailClient({
  movie,
  backHref,
  backLabel,
  currentHref,
}: {
  movie: MovieDetails;
  backHref: string;
  backLabel: string;
  currentHref: string;
}) {
  const router = useRouter();
  const { user, movies, loading, error, setError, saveMovie, updateMovie } = useWatchHistory();
  const savedMovie = movies.find((item) => item.imdbID === movie.imdbID);
  const [rating, setRating] = useState(0);
  const [note, setNote] = useState("");
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!savedMovie) return;
    setRating(savedMovie.userRating);
    setNote(savedMovie.comment ?? "");
  }, [savedMovie]);

  async function handleSave() {
    if (rating < 1) return;
    if (!user) {
      router.push(`/auth/login?next=${encodeURIComponent(currentHref)}`);
      return;
    }

    setSaving(true);
    setError("");
    const entry: WatchedMovie = {
      imdbID: movie.imdbID,
      tmdbID: movie.tmdbID,
      title: movie.Title,
      year: movie.Year,
      poster: movie.Poster,
      imdbRating: Number(movie.imdbRating) || 0,
      runtime: runtimeMinutes(movie.Runtime),
      userRating: rating,
      comment: note.trim() || undefined,
    };

    try {
      if (savedMovie) {
        await updateMovie(movie.imdbID, {
          userRating: rating,
          comment: note.trim() || undefined,
        });
      } else {
        await saveMovie(entry);
      }
      setEditing(false);
    } catch {
      // The shared history hook exposes the server error and rolls back the optimistic update.
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="mx-auto w-full max-w-6xl space-y-4 py-3">
      <Link href={backHref} className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-600 hover:text-primary">
        <ArrowLeft className="size-4" /> {backLabel}
      </Link>

      <section className="overflow-hidden rounded-2xl border border-white/80 bg-white/75 shadow-lg shadow-slate-900/5 backdrop-blur">
        <div className="grid lg:grid-cols-[280px_minmax(0,1fr)]">
          <div className="relative mx-auto aspect-[2/3] w-full max-w-52 bg-slate-200 lg:max-w-none">
            {isAvailable(movie.Poster) ? (
              <Image src={movie.Poster} alt={`${movie.Title} poster`} fill priority sizes="(max-width: 1024px) 80vw, 35vw" unoptimized className="object-cover" />
            ) : (
              <div className="flex h-full items-center justify-center p-6 text-center text-muted-foreground">Poster unavailable</div>
            )}
          </div>

          <div className="space-y-5 p-4 sm:p-6">
            <div>
              <h1 className="text-2xl font-black leading-tight tracking-tight sm:text-4xl">{movie.Title}</h1>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {isAvailable(movie.Year) ? <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold">{movie.Year}</span> : null}
                {isAvailable(movie.Runtime) ? <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold">{movie.Runtime}</span> : null}
                {isAvailable(movie.imdbRating) ? <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-1 text-xs font-bold text-amber-900"><Star className="size-3 fill-current" /> TMDB {movie.imdbRating}</span> : null}
              </div>
              {isAvailable(movie.Genre) ? <p className="mt-3 text-sm font-medium text-slate-600">{movie.Genre}</p> : null}
            </div>

            {isAvailable(movie.Plot) ? <p className="text-sm leading-6 text-slate-700">{movie.Plot}</p> : null}

            <dl className="grid gap-3 text-sm sm:grid-cols-2">
              {isAvailable(movie.Director) ? <div><dt className="font-bold">Director</dt><dd className="mt-1 text-muted-foreground">{movie.Director}</dd></div> : null}
              {isAvailable(movie.Actors) ? <div className="sm:col-span-2"><dt className="font-bold">Cast</dt><dd className="mt-1 text-muted-foreground">{movie.Actors}</dd></div> : null}
              {isAvailable(movie.Released) ? <div><dt className="font-bold">Released</dt><dd className="mt-1 text-muted-foreground">{movie.Released}</dd></div> : null}
            </dl>

            <div className="rounded-xl border bg-slate-50/80 p-3.5">
              {savedMovie && !editing ? (
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="inline-flex items-center gap-2 font-bold"><Check className="size-4 text-emerald-600" /> In your watch history</p>
                    <p className="mt-1 text-sm text-muted-foreground">Your rating: {savedMovie.userRating}/5{savedMovie.comment ? ` · “${savedMovie.comment}”` : ""}</p>
                  </div>
                  <Button variant="outline" onClick={() => setEditing(true)}>Edit rating</Button>
                </div>
              ) : (
                <div>
                  <h2 className="font-bold">Add to watch history</h2>
                  <RatingStars maxRating={5} size={21} rating={rating} onSetRating={setRating} className="mt-2" />
                  <label htmlFor="movie-note" className="sr-only">Personal movie note</label>
                  <textarea id="movie-note" value={note} onChange={(event) => setNote(event.target.value)} placeholder="Add a note (optional)" className="mt-3 min-h-20 w-full rounded-lg border bg-white px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring" />
                  <div className="mt-3 flex flex-wrap gap-2">
                    <Button disabled={!rating || saving || loading} onClick={() => void handleSave()}>
                      {saving ? "Saving…" : savedMovie ? "Save changes" : user ? "Save to my history" : "Sign in to save"}
                    </Button>
                    {editing ? <Button variant="outline" onClick={() => { setEditing(false); setRating(savedMovie?.userRating ?? 0); setNote(savedMovie?.comment ?? ""); }}>Cancel</Button> : null}
                  </div>
                </div>
              )}
              {error ? <p role="alert" className="mt-3 text-sm text-destructive">{error}</p> : null}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
