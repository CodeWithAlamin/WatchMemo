"use client";

import { useCallback, useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase/client";
import type { WatchedMovie } from "@/lib/types";

type WatchSnapshot = Pick<
  WatchedMovie,
  "title" | "year" | "poster" | "imdbRating" | "runtime" | "tmdbID"
>;

interface WatchedMovieRow {
  imdb_id: string;
  user_rating: number;
  comment: string | null;
  movie_snapshot: Partial<WatchSnapshot> | null;
  updated_at: string;
}

function toWatchedMovie(row: WatchedMovieRow): WatchedMovie {
  const snapshot = row.movie_snapshot ?? {};
  return {
    imdbID: row.imdb_id,
    tmdbID: snapshot.tmdbID,
    title: snapshot.title ?? "Unknown title",
    year: snapshot.year ?? "",
    poster: snapshot.poster ?? "",
    imdbRating: Number(snapshot.imdbRating ?? 0),
    runtime: Number(snapshot.runtime ?? 0),
    userRating: Number(row.user_rating ?? 0),
    comment: row.comment ?? undefined,
    updatedAt: row.updated_at,
  };
}

export function useWatchHistory() {
  const [user, setUser] = useState<User | null>(null);
  const [movies, setMovies] = useState<WatchedMovie[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadMovies = useCallback(async (userId: string) => {
    setLoading(true);
    setError("");
    try {
      const { data, error: queryError } = await supabase
        .from("watched_movies")
        .select("imdb_id, user_rating, comment, movie_snapshot, updated_at")
        .eq("user_id", userId)
        .order("updated_at", { ascending: false });

      if (queryError) throw queryError;
      setMovies(((data ?? []) as WatchedMovieRow[]).map(toWatchedMovie));
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Could not load your watch history.");
      setMovies([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let mounted = true;
    void supabase.auth.getUser().then(({ data, error: authError }) => {
      if (!mounted) return;
      if (authError && !authError.message.toLowerCase().includes("auth session missing")) {
        setError(authError.message);
      }
      setUser(data.user ?? null);
      if (!data.user) setLoading(false);
    }).catch((authError: unknown) => {
      if (!mounted) return;
      setError(authError instanceof Error ? authError.message : "Could not check your sign-in status.");
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (!mounted) return;
        const nextUser = session?.user ?? null;
        setUser(nextUser);
        if (!nextUser) {
          setMovies([]);
          setLoading(false);
        }
      },
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (user) void loadMovies(user.id);
  }, [loadMovies, user]);

  const saveMovie = useCallback(async (movie: WatchedMovie) => {
    if (!user) throw new Error("Sign in to save movies to your watch history.");
    const previousMovies = movies;
    const updatedMovie = { ...movie, updatedAt: new Date().toISOString() };
    setMovies((current) => [
      updatedMovie,
      ...current.filter((item) => item.imdbID !== movie.imdbID),
    ]);
    setError("");

    try {
      const { error: saveError } = await supabase.from("watched_movies").upsert(
        {
          user_id: user.id,
          imdb_id: movie.imdbID,
          user_rating: movie.userRating,
          comment: movie.comment ?? null,
          movie_snapshot: {
            title: movie.title,
            year: movie.year,
            poster: movie.poster,
            imdbRating: movie.imdbRating,
            runtime: movie.runtime,
            tmdbID: movie.tmdbID,
          },
        },
        { onConflict: "user_id,imdb_id" },
      );
      if (saveError) throw saveError;
    } catch (saveError) {
      setMovies(previousMovies);
      setError(saveError instanceof Error ? saveError.message : "Could not save this movie.");
      throw saveError;
    }
  }, [movies, user]);

  const updateMovie = useCallback(async (
    movieId: string,
    updates: Pick<WatchedMovie, "userRating" | "comment">,
  ) => {
    if (!user) throw new Error("Sign in to update your watch history.");
    const previousMovies = movies;
    const updatedAt = new Date().toISOString();
    setMovies((current) => current.map((movie) => movie.imdbID === movieId
      ? { ...movie, ...updates, updatedAt }
      : movie));
    setError("");

    try {
      const { error: updateError } = await supabase
        .from("watched_movies")
        .update({
          user_rating: updates.userRating,
          comment: updates.comment ?? null,
        })
        .eq("user_id", user.id)
        .eq("imdb_id", movieId);
      if (updateError) throw updateError;
    } catch (updateError) {
      setMovies(previousMovies);
      setError(updateError instanceof Error ? updateError.message : "Could not update this movie.");
      throw updateError;
    }
  }, [movies, user]);

  const removeMovie = useCallback(async (movieId: string) => {
    if (!user) throw new Error("Sign in to update your watch history.");
    const previousMovies = movies;
    setMovies((current) => current.filter((movie) => movie.imdbID !== movieId));
    setError("");

    try {
      const { error: deleteError } = await supabase
        .from("watched_movies")
        .delete()
        .eq("user_id", user.id)
        .eq("imdb_id", movieId);
      if (deleteError) throw deleteError;
    } catch (deleteError) {
      setMovies(previousMovies);
      setError(deleteError instanceof Error ? deleteError.message : "Could not remove this movie.");
      throw deleteError;
    }
  }, [movies, user]);

  return { user, movies, loading, error, setError, saveMovie, updateMovie, removeMovie };
}
