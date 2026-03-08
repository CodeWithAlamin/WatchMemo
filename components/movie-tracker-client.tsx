"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  Clapperboard,
  Clock3,
  Film,
  Frown,
  Laugh,
  LogOut,
  Meh,
  Settings,
  Pencil,
  Save,
  Smile,
  Sparkles,
  Star,
  UserRound,
  X,
} from "lucide-react";
import type { User } from "@supabase/supabase-js";

import MovieSearchInput from "./movie-search-input";
import RatingStars from "./rating-stars";
import { getDisplayName } from "@/lib/auth/display-name";
import { OmdbMovieDetails, OmdbSearchMovie, WatchedMovie } from "@/lib/types";
import { supabase } from "@/lib/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";

interface MovieTrackerClientProps {
  initialQuery: string;
  movies: OmdbSearchMovie[];
  selectedMovie: OmdbMovieDetails | null;
  fetchError: string;
}

type WatchedMovieRow = {
  user_id: string;
  imdb_id: string;
  user_rating: number;
  comment: string | null;
  movie_snapshot: {
    title?: string;
    year?: string;
    poster?: string;
    imdbRating?: number;
    runtime?: number;
  } | null;
  updated_at: string;
};
type MovieSnapshot = NonNullable<WatchedMovieRow["movie_snapshot"]>;

const average = (values: number[]): number => {
  if (!values.length) return 0;
  return values.reduce((acc, current) => acc + current / values.length, 0);
};

function mapRowToWatchedMovie(row: WatchedMovieRow): WatchedMovie {
  const snapshot = row.movie_snapshot ?? {};

  return {
    imdbID: row.imdb_id,
    title: snapshot.title ?? "Unknown title",
    year: snapshot.year ?? "",
    poster: snapshot.poster ?? "",
    imdbRating: Number(snapshot.imdbRating || 0),
    runtime: Number(snapshot.runtime || 0),
    userRating: Number(row.user_rating || 0),
    comment: row.comment ?? undefined,
  };
}

function parseRuntimeMinutes(runtime: string): number {
  const runtimeMinutes = Number(runtime.split(" ").at(0));
  return Number.isNaN(runtimeMinutes) ? 0 : runtimeMinutes;
}

function buildSnapshotFromMovieDetails(movie: OmdbMovieDetails): MovieSnapshot {
  return {
    title: movie.Title,
    year: movie.Year,
    poster: movie.Poster,
    imdbRating: Number(movie.imdbRating),
    runtime: parseRuntimeMinutes(movie.Runtime),
  };
}

const isAvailableText = (value?: string | null): value is string =>
  Boolean(value && value.trim() !== "" && value !== "N/A");

const isAuthSessionMissingError = (message: string): boolean =>
  message.toLowerCase().includes("auth session missing");

type RatingTier = {
  label: "Bad" | "Okay" | "Good" | "Great";
  min: number;
  max: number;
};

const RATING_TIERS: RatingTier[] = [
  { label: "Bad", min: 1, max: 3 },
  { label: "Okay", min: 4, max: 5 },
  { label: "Good", min: 6, max: 7 },
  { label: "Great", min: 8, max: 10 },
];
const RATING_MESSAGES = [
  "1 · Very bad",
  "2 · Not good",
  "3 · Weak watch",
  "4 · Below average",
  "5 · Fine",
  "6 · Decent",
  "7 · Good",
  "8 · Great",
  "9 · Excellent",
  "10 · Masterpiece",
];

function getRatingTierLabel(rating: number): RatingTier["label"] | null {
  if (rating <= 0) return null;
  return (
    RATING_TIERS.find((tier) => rating >= tier.min && rating <= tier.max)?.label ??
    null
  );
}

export default function MovieTrackerClient({
  initialQuery,
  movies,
  selectedMovie,
  fetchError,
}: MovieTrackerClientProps) {
  const [watched, setWatched] = useState<WatchedMovie[]>([]);
  const [watchedLoading, setWatchedLoading] = useState(false);
  const [authUser, setAuthUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [syncError, setSyncError] = useState("");
  const [mobilePanel, setMobilePanel] = useState<"search" | "watched">("search");
  const [pendingAddId, setPendingAddId] = useState<string | null>(null);
  const [pendingUpdateIds, setPendingUpdateIds] = useState<string[]>([]);
  const [pendingDeleteIds, setPendingDeleteIds] = useState<string[]>([]);
  const [pendingSelectedId, setPendingSelectedId] = useState<string | null>(null);

  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const selectedId = searchParams.get("selected");
  const activeSelectedId = pendingSelectedId ?? selectedId;
  const isSelectedMovieLoading =
    Boolean(activeSelectedId) &&
    !fetchError &&
    (pendingSelectedId !== null ||
      !selectedMovie ||
      selectedMovie.imdbID !== activeSelectedId);
  const nextAuthPath = useMemo(() => {
    const query = searchParams.toString();
    return query ? `${pathname}?${query}` : pathname;
  }, [pathname, searchParams]);

  useEffect(() => {
    if (!selectedMovie?.Title) {
      document.title = "WatchMemo";
      return;
    }

    document.title = `${selectedMovie.Title} | WatchMemo`;

    return () => {
      document.title = "WatchMemo";
    };
  }, [selectedMovie?.Title]);

  const fetchWatched = useCallback(async (userId: string): Promise<void> => {
    setWatchedLoading(true);
    setSyncError("");

    const { data, error } = await supabase
      .from("watched_movies")
      .select(
        "user_id, imdb_id, user_rating, comment, movie_snapshot, updated_at",
      )
      .eq("user_id", userId)
      .order("updated_at", { ascending: false });

    if (error) {
      if (isAuthSessionMissingError(error.message)) {
        setWatched([]);
        setWatchedLoading(false);
        return;
      }
      setSyncError(error.message);
      setWatchedLoading(false);
      return;
    }

    setWatched(((data ?? []) as WatchedMovieRow[]).map(mapRowToWatchedMovie));
    setWatchedLoading(false);
  }, []);

  useEffect(() => {
    let mounted = true;

    void supabase.auth.getUser().then(({ data, error }) => {
      if (!mounted) return;
      if (error && !isAuthSessionMissingError(error.message)) {
        setSyncError(error.message);
      }
      setAuthUser(data.user ?? null);
      setAuthLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setAuthUser(session?.user ?? null);
      setAuthLoading(false);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (authLoading) return;

    if (!authUser) {
      setWatched([]);
      return;
    }

    void fetchWatched(authUser.id);
  }, [authLoading, authUser, fetchWatched]);

  useEffect(() => {
    if (!authUser || !selectedMovie) return;

    const watchedEntry = watched.find((movie) => movie.imdbID === selectedMovie.imdbID);
    if (!watchedEntry) return;

    const snapshot = buildSnapshotFromMovieDetails(selectedMovie);
    const needsRefresh =
      watchedEntry.title !== (snapshot.title ?? watchedEntry.title) ||
      watchedEntry.year !== (snapshot.year ?? watchedEntry.year) ||
      watchedEntry.poster !== (snapshot.poster ?? watchedEntry.poster) ||
      watchedEntry.imdbRating !== Number(snapshot.imdbRating ?? watchedEntry.imdbRating) ||
      watchedEntry.runtime !== Number(snapshot.runtime ?? watchedEntry.runtime);

    if (!needsRefresh) return;

    void (async () => {
      const previousWatched = watched;

      setWatched((current) =>
        current.map((movie) =>
          movie.imdbID === selectedMovie.imdbID
            ? {
                ...movie,
                title: snapshot.title ?? movie.title,
                year: snapshot.year ?? movie.year,
                poster: snapshot.poster ?? movie.poster,
                imdbRating: Number(snapshot.imdbRating ?? movie.imdbRating),
                runtime: Number(snapshot.runtime ?? movie.runtime),
              }
            : movie,
        ),
      );

      const { error } = await supabase
        .from("watched_movies")
        .update({ movie_snapshot: snapshot })
        .eq("user_id", authUser.id)
        .eq("imdb_id", selectedMovie.imdbID);

      if (!error) return;
      if (isAuthSessionMissingError(error.message)) {
        setWatched(previousWatched);
        return;
      }
      setWatched(previousWatched);
      setSyncError(error.message);
    })();
  }, [authUser, selectedMovie, watched]);

  const updateSearchParams = useCallback(
    (updater: (params: URLSearchParams) => void): void => {
      const params = new URLSearchParams(searchParams.toString());
      updater(params);

      const next = params.toString();
      router.replace(next ? `${pathname}?${next}` : pathname, { scroll: false });
    },
    [pathname, router, searchParams],
  );

  function handleSelectMovie(imdbID: string): void {
    const nextSelected = selectedId === imdbID ? null : imdbID;
    setPendingSelectedId(nextSelected);

    updateSearchParams((params) => {
      if (params.get("selected") === imdbID) {
        params.delete("selected");
      } else {
        params.set("selected", imdbID);
      }
    });

    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  const handleCloseMovie = useCallback((): void => {
    setPendingSelectedId(null);
    updateSearchParams((params) => {
      params.delete("selected");
    });
    setMobilePanel("search");
  }, [updateSearchParams]);

  useEffect(() => {
    if (pendingSelectedId !== null && selectedId === pendingSelectedId) {
      setPendingSelectedId(null);
    }
  }, [pendingSelectedId, selectedId]);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent): void {
      if (event.key !== "Escape" || !activeSelectedId) return;
      handleCloseMovie();
    }

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [activeSelectedId, handleCloseMovie]);

  function handleMobilePanelChange(panel: "search" | "watched"): void {
    setMobilePanel(panel);
    setPendingSelectedId(null);
    updateSearchParams((params) => {
      params.delete("selected");
    });
  }

  const redirectToAuth = useCallback((): void => {
    const next = encodeURIComponent(nextAuthPath);
    router.push(`/auth/login?next=${next}`);
  }, [nextAuthPath, router]);

  function handleAddWatched(movie: WatchedMovie): void {
    if (!authUser) {
      redirectToAuth();
      return;
    }

    void (async () => {
      setSyncError("");
      const previousWatched = watched;
      setPendingAddId(movie.imdbID);
      setWatched((current) => {
        const exists = current.some((item) => item.imdbID === movie.imdbID);
        if (!exists) return [movie, ...current];

        return current.map((item) => (item.imdbID === movie.imdbID ? movie : item));
      });

      const { error } = await supabase.from("watched_movies").upsert(
        {
          user_id: authUser.id,
          imdb_id: movie.imdbID,
          user_rating: movie.userRating,
          comment: movie.comment ?? null,
          movie_snapshot: {
            title: movie.title,
            year: movie.year,
            poster: movie.poster,
            imdbRating: movie.imdbRating,
            runtime: movie.runtime,
          },
        },
        { onConflict: "user_id,imdb_id" },
      );

      if (error) {
        if (isAuthSessionMissingError(error.message)) {
          setWatched(previousWatched);
          setPendingAddId(null);
          redirectToAuth();
          return;
        }
        setWatched(previousWatched);
        setSyncError(error.message);
        setPendingAddId(null);
        return;
      }
      setPendingAddId(null);
    })();
  }

  function handleDeleteWatched(id: string): void {
    if (!authUser) {
      redirectToAuth();
      return;
    }

    void (async () => {
      setSyncError("");
      const previousWatched = watched;
      setPendingDeleteIds((current) => [...current, id]);
      setWatched((current) => current.filter((movie) => movie.imdbID !== id));

      const { error } = await supabase
        .from("watched_movies")
        .delete()
        .eq("user_id", authUser.id)
        .eq("imdb_id", id);

      if (error) {
        if (isAuthSessionMissingError(error.message)) {
          setWatched(previousWatched);
          setPendingDeleteIds((current) => current.filter((item) => item !== id));
          redirectToAuth();
          return;
        }
        setWatched(previousWatched);
        setSyncError(error.message);
        setPendingDeleteIds((current) => current.filter((item) => item !== id));
        return;
      }
      setPendingDeleteIds((current) => current.filter((item) => item !== id));
    })();
  }

  function handleUpdateWatched(
    id: string,
    updates: Pick<WatchedMovie, "userRating" | "comment"> & {
      movieSnapshot?: MovieSnapshot;
    },
  ): void {
    if (!authUser) {
      redirectToAuth();
      return;
    }

    const current = watched.find((movie) => movie.imdbID === id);
    if (!current) return;

    void (async () => {
      setSyncError("");
      const previousWatched = watched;
      setPendingUpdateIds((currentIds) => [...currentIds, id]);
      setWatched((currentWatched) =>
        currentWatched.map((movie) =>
          movie.imdbID === id
            ? {
                ...movie,
                userRating: updates.userRating,
                comment: updates.comment,
                title: updates.movieSnapshot?.title ?? movie.title,
                year: updates.movieSnapshot?.year ?? movie.year,
                poster: updates.movieSnapshot?.poster ?? movie.poster,
                imdbRating: updates.movieSnapshot?.imdbRating ?? movie.imdbRating,
                runtime: updates.movieSnapshot?.runtime ?? movie.runtime,
              }
            : movie,
        ),
      );

      const { error } = await supabase
        .from("watched_movies")
        .update({
          user_rating: updates.userRating,
          comment: updates.comment ?? null,
          ...(updates.movieSnapshot
            ? { movie_snapshot: updates.movieSnapshot }
            : {}),
        })
        .eq("user_id", authUser.id)
        .eq("imdb_id", id);

      if (error) {
        if (isAuthSessionMissingError(error.message)) {
          setWatched(previousWatched);
          setPendingUpdateIds((currentIds) =>
            currentIds.filter((item) => item !== id),
          );
          redirectToAuth();
          return;
        }
        setWatched(previousWatched);
        setSyncError(error.message);
        setPendingUpdateIds((currentIds) =>
          currentIds.filter((item) => item !== id),
        );
        return;
      }
      setPendingUpdateIds((currentIds) =>
        currentIds.filter((item) => item !== id),
      );
    })();
  }

  async function handleSignOut(): Promise<void> {
    await supabase.auth.signOut();
    setWatched([]);
    setPendingAddId(null);
    setPendingUpdateIds([]);
    setPendingDeleteIds([]);
  }

  return (
    <main className="mx-auto flex h-full max-w-6xl flex-col overflow-hidden px-4 pb-1 pt-1 sm:px-6 sm:pb-2 sm:pt-2 lg:px-8 lg:pb-2 lg:pt-2">
      <section className="sticky top-1 z-50 mb-3 rounded-3xl border bg-background/90 p-2 shadow-md shadow-black/10 backdrop-blur-xl supports-[backdrop-filter]:bg-background/80 sm:p-3">
        <div className="space-y-1.5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0">
              <Link href="/" className="inline-flex" aria-label="Go to home">
                <Image
                  src="/watchmemo-logo-wordmark.svg"
                  alt="WatchMemo"
                  width={230}
                  height={48}
                  priority
                  className="h-9 w-auto sm:h-10"
                />
              </Link>
              <p className="mt-1 text-xs text-muted-foreground sm:text-sm">
                Your personal movie memory vault
              </p>
            </div>

            {authLoading ? (
              <Skeleton className="size-10 rounded-full" />
            ) : authUser ? (
              <DropdownMenu modal={false}>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    size="icon"
                    className="relative size-10 rounded-full p-0"
                    aria-label="Open account menu"
                  >
                    <Image
                      src="/avatar-user.svg"
                      alt="User avatar"
                      width={36}
                      height={36}
                      className="size-9 rounded-full border border-border/70 bg-background object-cover"
                    />
                    <span className="sr-only">Account menu</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel className="truncate">
                    {getDisplayName(authUser)}
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/profile">
                      <Settings className="size-4" />
                      Settings
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => void handleSignOut()}>
                    <LogOut className="size-4" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button size="sm" className="shadow-md shadow-primary/25 hover:shadow-lg hover:shadow-primary/30" onClick={redirectToAuth}>
                <UserRound className="mr-1 size-3.5" />
                Login to save
              </Button>
            )}
          </div>

          <MovieSearchInput initialQuery={initialQuery} />
        </div>
      </section>

      {syncError ? (
        <p className="mb-4 rounded-2xl border border-destructive/30 bg-destructive/10 p-4 text-sm font-semibold text-destructive">
          {syncError}
        </p>
      ) : null}

      <section className="mb-4 grid grid-cols-2 gap-2 lg:hidden">
        <Button
          variant={mobilePanel === "search" ? "default" : "outline"}
          onClick={() => handleMobilePanelChange("search")}
        >
          Discover
        </Button>
        <Button
          variant={mobilePanel === "watched" ? "default" : "outline"}
          onClick={() => handleMobilePanelChange("watched")}
        >
          Watched
        </Button>
      </section>

      <section className="grid gap-5 lg:min-h-0 lg:flex-1 lg:grid-cols-2">
        <Card
          className={`overflow-hidden rounded-3xl border-0 bg-card/95 py-0 shadow-lg lg:h-full lg:min-h-0 lg:flex-col ${
            activeSelectedId
              ? "hidden lg:flex"
              : mobilePanel === "search"
                ? "flex"
                : "hidden lg:flex"
          }`}
        >
          <CardHeader className="py-4">
            <CardTitle className="flex items-center gap-2 text-base font-bold">
              <Clapperboard className="size-4" /> Find Movies
            </CardTitle>
            <CardDescription>
              Search by title and open any movie for full details.
            </CardDescription>
          </CardHeader>
          <Separator />
          <CardContent className="p-4 lg:flex-1 lg:overflow-y-auto">
            {fetchError ? <ErrorMessage message={fetchError} /> : null}
            {!fetchError ? (
              <MovieList
                movies={movies}
                selectedId={activeSelectedId}
                onSelectMovie={handleSelectMovie}
              />
            ) : null}
          </CardContent>
        </Card>

        <Card
          className={`overflow-hidden rounded-3xl border-0 bg-card/95 py-0 shadow-lg lg:h-full lg:min-h-0 lg:flex-col ${
            activeSelectedId
              ? "flex"
              : mobilePanel === "watched"
                ? "flex"
                : "hidden lg:flex"
          }`}
        >
          <CardHeader className="py-4">
            <div className="flex items-center justify-between gap-2">
              <CardTitle className="flex items-center gap-2 text-base font-bold">
                {activeSelectedId ? (
                  <Star className="size-4" />
                ) : (
                  <Clock3 className="size-4" />
                )}{" "}
                {activeSelectedId ? "Movie Details" : "Your Watched List"}
              </CardTitle>
              {activeSelectedId ? (
                <Button variant="outline" size="sm" onClick={handleCloseMovie}>
                  Back to results
                </Button>
              ) : null}
            </div>
            <CardDescription>
              {activeSelectedId
                ? "Rate this movie, add a note, and save it to your personal log."
                : "Your saved ratings and personal notes."}
            </CardDescription>
          </CardHeader>
          <Separator />
          <CardContent className="p-4 lg:flex-1 lg:overflow-y-auto">
            {activeSelectedId && isSelectedMovieLoading ? (
              <MovieDetailsSkeleton />
            ) : activeSelectedId && selectedMovie ? (
              <MovieDetails
                movie={selectedMovie}
                watched={watched}
                isAuthenticated={Boolean(authUser)}
                isSaving={pendingAddId === selectedMovie.imdbID}
                isUpdating={pendingUpdateIds.includes(selectedMovie.imdbID)}
                onAddWatched={handleAddWatched}
                onUpdateWatched={handleUpdateWatched}
                onRequireAuth={redirectToAuth}
              />
            ) : authUser && watchedLoading ? (
              <WatchedSkeleton />
            ) : !authUser ? (
              <div className="rounded-2xl border bg-muted/60 p-6 text-center">
                <Sparkles className="mx-auto mb-2 size-5 text-muted-foreground" />
                <p className="text-sm font-medium text-muted-foreground">
                  Browse freely. Login when you want to save ratings and notes.
                </p>
                <Button className="mt-3" size="sm" onClick={redirectToAuth}>
                  Login to start your log
                </Button>
              </div>
            ) : (
              <>
                <WatchedSummary watched={watched} />
                <WatchedMoviesList
                  watched={watched}
                  pendingUpdateIds={pendingUpdateIds}
                  pendingDeleteIds={pendingDeleteIds}
                  onDeleteWatched={handleDeleteWatched}
                  onUpdateWatched={handleUpdateWatched}
                />
              </>
            )}
          </CardContent>
        </Card>
      </section>
    </main>
  );
}

function MovieList({
  movies,
  selectedId,
  onSelectMovie,
}: {
  movies: OmdbSearchMovie[];
  selectedId: string | null;
  onSelectMovie: (id: string) => void;
}) {
  if (!movies.length) {
    return (
      <div className="rounded-2xl border bg-muted/60 p-6 text-center">
        <Film className="mx-auto mb-2 size-5 text-muted-foreground" />
        <p className="text-sm font-medium text-muted-foreground">
          Start typing a movie title to explore results.
        </p>
      </div>
    );
  }

  return (
    <ul className="space-y-2">
      {movies.map((movie) => {
        const isActive = selectedId === movie.imdbID;

        return (
          <li key={movie.imdbID}>
            <Button
              variant="outline"
              className={`h-auto w-full justify-start gap-3 rounded-2xl border bg-background px-3 py-3 transition-all duration-200 ${
                isActive
                  ? "border-primary/50 bg-primary/10 shadow-sm"
                  : "hover:-translate-y-0.5 hover:border-primary/40 hover:bg-secondary/50"
              }`}
              onClick={() => onSelectMovie(movie.imdbID)}
            >
              <Poster src={movie.Poster} alt={`${movie.Title} poster`} />
              <div className="min-w-0 text-left">
                <p className="truncate text-sm font-semibold leading-tight">
                  {movie.Title}
                </p>
                {isAvailableText(movie.Year) ? (
                  <p className="mt-1 text-xs text-muted-foreground">
                    Released {movie.Year}
                  </p>
                ) : null}
              </div>
            </Button>
          </li>
        );
      })}
    </ul>
  );
}

function MovieDetails({
  movie,
  watched,
  isAuthenticated,
  isSaving,
  isUpdating,
  onAddWatched,
  onUpdateWatched,
  onRequireAuth,
}: {
  movie: OmdbMovieDetails;
  watched: WatchedMovie[];
  isAuthenticated: boolean;
  isSaving: boolean;
  isUpdating: boolean;
  onAddWatched: (movie: WatchedMovie) => void;
  onUpdateWatched: (
    id: string,
    updates: Pick<WatchedMovie, "userRating" | "comment"> & {
      movieSnapshot?: MovieSnapshot;
    },
  ) => void;
  onRequireAuth: () => void;
}) {
  const [userRating, setUserRating] = useState(0);
  const [comment, setComment] = useState("");
  const [isEditingWatched, setIsEditingWatched] = useState(false);
  const [editRating, setEditRating] = useState(0);
  const [editComment, setEditComment] = useState("");

  const isWatched = watched.some((item) => item.imdbID === movie.imdbID);
  const watchedEntry = watched.find((item) => item.imdbID === movie.imdbID);
  const watchedUserRating = watchedEntry?.userRating;

  useEffect(() => {
    if (!watchedEntry) {
      setIsEditingWatched(false);
      setEditRating(0);
      setEditComment("");
      return;
    }

    setEditRating(watchedEntry.userRating);
    setEditComment(watchedEntry.comment ?? "");
  }, [movie.imdbID, watchedEntry]);

  function handleAdd(): void {
    if (userRating <= 0) return;

    const watchedMovie: WatchedMovie = {
      imdbID: movie.imdbID,
      title: movie.Title,
      year: movie.Year,
      poster: movie.Poster,
      imdbRating: Number(movie.imdbRating),
      runtime: parseRuntimeMinutes(movie.Runtime),
      userRating,
      comment: comment.trim() || undefined,
    };

    onAddWatched(watchedMovie);
  }

  function handleStartEditingWatched(): void {
    if (!watchedEntry) return;
    setEditRating(watchedEntry.userRating);
    setEditComment(watchedEntry.comment ?? "");
    setIsEditingWatched(true);
  }

  function handleCancelEditingWatched(): void {
    if (watchedEntry) {
      setEditRating(watchedEntry.userRating);
      setEditComment(watchedEntry.comment ?? "");
    }
    setIsEditingWatched(false);
  }

  function handleSaveEditingWatched(): void {
    if (!watchedEntry) return;
    const normalizedRating = Math.min(10, Math.max(1, Math.round(editRating)));
    onUpdateWatched(watchedEntry.imdbID, {
      userRating: normalizedRating,
      comment: editComment.trim() || undefined,
      movieSnapshot: buildSnapshotFromMovieDetails(movie),
    });
    setIsEditingWatched(false);
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-[120px_1fr]">
        <Poster src={movie.Poster} alt={`Poster of ${movie.Title}`} size="lg" />
        <div>
          <h3 className="text-xl font-bold leading-tight">
            {movie.Title}
          </h3>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {isAvailableText(movie.Released) ? (
              <Badge variant="secondary">{movie.Released}</Badge>
            ) : null}
            {isAvailableText(movie.Runtime) ? (
              <Badge variant="secondary">{movie.Runtime}</Badge>
            ) : null}
            {isAvailableText(movie.imdbRating) ? (
              <Badge variant="secondary">IMDb {movie.imdbRating}</Badge>
            ) : null}
          </div>
          {isAvailableText(movie.Genre) ? (
            <p className="mt-2 text-sm text-muted-foreground">{movie.Genre}</p>
          ) : null}
        </div>
      </div>

      <div className="rounded-2xl border bg-muted/40 p-4">
        {!isWatched ? (
          <>
            <div className="space-y-1">
              <p className="text-sm font-semibold text-foreground">
                How did this movie feel for you?
              </p>
              <p className="text-xs text-muted-foreground">
                Choose a score and add an optional note.
              </p>
            </div>
            <RatingStars
              maxRating={10}
              size={22}
              message={RATING_MESSAGES}
              onSetRating={setUserRating}
              className="pt-1"
            />
            <RatingScaleLegend rating={userRating} />
            <textarea
              className="mt-3 min-h-20 w-full rounded-xl border bg-background px-3 py-2 text-sm outline-none ring-ring/50 transition placeholder:text-muted-foreground focus-visible:ring-2"
              placeholder="Optional note: what stood out, what you loved, or what missed."
              value={comment}
              onChange={(event) => setComment(event.target.value)}
            />
            <Button
              className="mt-3"
              disabled={userRating <= 0 || isSaving}
              onClick={isAuthenticated ? handleAdd : onRequireAuth}
            >
              {isAuthenticated
                ? isSaving
                  ? "Saving to WatchMemo..."
                  : "Save to watched list"
                : "Login to save rating"}
            </Button>
          </>
        ) : (
          <div className="space-y-2">
            <p className="text-sm font-semibold text-muted-foreground">
              You rated this movie {watchedUserRating} / 10
            </p>
            {!isEditingWatched ? (
              <>
                {watchedEntry?.comment ? (
                  <p className="rounded-lg border bg-background/80 p-3 text-sm italic text-muted-foreground">
                    “{watchedEntry.comment}”
                  </p>
                ) : null}
                <Button
                  variant="outline"
                  size="sm"
                  disabled={isUpdating}
                  onClick={handleStartEditingWatched}
                >
                  <Pencil className="mr-1 size-3.5" />
                  Edit rating/comment
                </Button>
              </>
            ) : (
              <>
                <RatingStars
                  maxRating={10}
                  size={22}
                  message={RATING_MESSAGES}
                  rating={editRating}
                  onSetRating={setEditRating}
                />
                <RatingScaleLegend rating={editRating} />
                <textarea
                  className="mt-1 min-h-20 w-full rounded-xl border bg-background px-3 py-2 text-sm outline-none ring-ring/50 transition placeholder:text-muted-foreground focus-visible:ring-2"
                  placeholder="Update your note..."
                  value={editComment}
                  onChange={(event) => setEditComment(event.target.value)}
                />
                <div className="flex gap-2">
                  <Button size="sm" disabled={isUpdating} onClick={handleSaveEditingWatched}>
                    <Save className="mr-1 size-3.5" />
                    {isUpdating ? "Saving..." : "Save"}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={isUpdating}
                    onClick={handleCancelEditingWatched}
                  >
                    <X className="mr-1 size-3.5" />
                    Cancel
                  </Button>
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {isAvailableText(movie.Plot) ? (
        <p className="text-sm leading-relaxed text-muted-foreground">
          {movie.Plot}
        </p>
      ) : null}
      {isAvailableText(movie.Actors) ? (
        <p className="text-sm text-muted-foreground">Starring {movie.Actors}</p>
      ) : null}
      {isAvailableText(movie.Director) ? (
        <p className="text-sm text-muted-foreground">
          Directed by {movie.Director}
        </p>
      ) : null}
    </div>
  );
}

function WatchedSummary({ watched }: { watched: WatchedMovie[] }) {
  const { likedAvgImdbRating, likedMinImdbRating, totalRuntime } = useMemo(() => {
      const likedMovies = watched.filter((movie) => movie.userRating >= 8);
      const likedImdbRatings = likedMovies
        .map((movie) => movie.imdbRating)
        .filter((rating) => rating > 0);

      return {
        likedAvgImdbRating: likedImdbRatings.length
          ? average(likedImdbRatings)
          : 0,
        likedMinImdbRating: likedImdbRatings.length
          ? Math.min(...likedImdbRatings)
          : 0,
        totalRuntime: watched.reduce((sum, movie) => sum + movie.runtime, 0),
      };
    }, [watched]);

  return (
    <div className="mb-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
      <Metric label="Movies" value={watched.length.toString()} />
      <Metric
        label="Liked Avg IMDb"
        value={likedAvgImdbRating ? likedAvgImdbRating.toFixed(1) : "—"}
      />
      <Metric
        label="Lowest IMDb You Liked"
        value={likedMinImdbRating ? likedMinImdbRating.toFixed(1) : "—"}
      />
      <Metric label="Total Runtime" value={`${totalRuntime}m`} />
    </div>
  );
}

function Metric({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border bg-secondary/45 p-3">
      <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      <p className="mt-1 text-lg font-black leading-none">{value}</p>
    </div>
  );
}

function WatchedMoviesList({
  watched,
  pendingUpdateIds,
  pendingDeleteIds,
  onDeleteWatched,
  onUpdateWatched,
}: {
  watched: WatchedMovie[];
  pendingUpdateIds: string[];
  pendingDeleteIds: string[];
  onDeleteWatched: (id: string) => void;
  onUpdateWatched: (
    id: string,
    updates: Pick<WatchedMovie, "userRating" | "comment"> & {
      movieSnapshot?: MovieSnapshot;
    },
  ) => void;
}) {
  if (!watched.length) {
    return (
      <div className="rounded-2xl border bg-muted/60 p-6 text-center">
        <Sparkles className="mx-auto mb-2 size-5 text-muted-foreground" />
        <p className="text-sm font-medium text-muted-foreground">
          No movies saved yet. Pick one from the Find Movies panel.
        </p>
      </div>
    );
  }

  return (
    <ul className="space-y-2">
      {watched.map((movie) => (
        <WatchedMovieItem
          key={movie.imdbID}
          movie={movie}
          isUpdating={pendingUpdateIds.includes(movie.imdbID)}
          isDeleting={pendingDeleteIds.includes(movie.imdbID)}
          onDeleteWatched={onDeleteWatched}
          onUpdateWatched={onUpdateWatched}
        />
      ))}
    </ul>
  );
}

function WatchedMovieItem({
  movie,
  isUpdating,
  isDeleting,
  onDeleteWatched,
  onUpdateWatched,
}: {
  movie: WatchedMovie;
  isUpdating: boolean;
  isDeleting: boolean;
  onDeleteWatched: (id: string) => void;
  onUpdateWatched: (
    id: string,
    updates: Pick<WatchedMovie, "userRating" | "comment"> & {
      movieSnapshot?: MovieSnapshot;
    },
  ) => void;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [draftRating, setDraftRating] = useState(movie.userRating);
  const [draftComment, setDraftComment] = useState(movie.comment ?? "");

  useEffect(() => {
    if (isEditing) return;
    setDraftRating(movie.userRating);
    setDraftComment(movie.comment ?? "");
  }, [movie.comment, movie.userRating, isEditing]);

  function handleStartEditing(): void {
    setDraftRating(movie.userRating);
    setDraftComment(movie.comment ?? "");
    setIsEditing(true);
  }

  function handleCancelEditing(): void {
    setDraftRating(movie.userRating);
    setDraftComment(movie.comment ?? "");
    setIsEditing(false);
  }

  function handleSaveEditing(): void {
    const normalizedRating = Math.min(10, Math.max(1, Math.round(draftRating)));

    onUpdateWatched(movie.imdbID, {
      userRating: normalizedRating,
      comment: draftComment.trim() || undefined,
    });
    setIsEditing(false);
  }

  const summaryParts: string[] = [];
  if (movie.imdbRating > 0) summaryParts.push(`IMDb ${movie.imdbRating}`);
  summaryParts.push(`You ${movie.userRating}`);
  if (movie.runtime > 0) summaryParts.push(`${movie.runtime}m`);

  return (
    <li className="rounded-2xl border bg-background p-3">
      <div className="flex items-center gap-3">
        <Poster src={movie.poster} alt={`${movie.title} poster`} />

        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold">{movie.title}</p>
          <p className="text-xs text-muted-foreground">{summaryParts.join(" • ")}</p>
          {!isEditing && movie.comment ? (
            <p className="comment-preview mt-1 text-xs italic text-muted-foreground">
              “{movie.comment}”
            </p>
          ) : null}
        </div>

        <div className="flex items-center gap-2">
          {!isEditing ? (
            <Button
              variant="outline"
              size="sm"
              disabled={isDeleting || isUpdating}
              onClick={handleStartEditing}
            >
              <Pencil className="mr-1 size-3.5" />
              Edit
            </Button>
          ) : null}

          <Button
            variant="destructive"
            size="sm"
            disabled={isDeleting || isUpdating}
            onClick={() => onDeleteWatched(movie.imdbID)}
          >
            {isDeleting ? "Removing..." : "Remove"}
          </Button>
        </div>
      </div>

      {isEditing ? (
        <div className="mt-3 rounded-xl border bg-muted/40 p-3">
          <RatingStars
            maxRating={10}
            size={20}
            message={RATING_MESSAGES}
            rating={draftRating}
            onSetRating={setDraftRating}
          />
          <RatingScaleLegend rating={draftRating} compact />
          <textarea
            className="mt-3 min-h-20 w-full rounded-xl border bg-background px-3 py-2 text-sm outline-none ring-ring/50 transition placeholder:text-muted-foreground focus-visible:ring-2"
            placeholder="Update your note..."
            value={draftComment}
            onChange={(event) => setDraftComment(event.target.value)}
          />

          <div className="mt-3 flex gap-2">
            <Button size="sm" disabled={isUpdating} onClick={handleSaveEditing}>
              <Save className="mr-1 size-3.5" />
              {isUpdating ? "Saving..." : "Save"}
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={isUpdating}
              onClick={handleCancelEditing}
            >
              <X className="mr-1 size-3.5" />
              Cancel
            </Button>
          </div>
        </div>
      ) : null}
    </li>
  );
}

function Poster({
  src,
  alt,
  size = "sm",
}: {
  src: string;
  alt: string;
  size?: "sm" | "lg";
}) {
  const dimension = size === "lg" ? 120 : 56;

  if (!isAvailableText(src)) {
    return (
      <div
        className="flex items-center justify-center rounded-lg border bg-muted text-xs font-semibold text-muted-foreground"
        style={{ width: dimension, height: size === "lg" ? 168 : 84 }}
      >
        No poster
      </div>
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      width={dimension}
      height={size === "lg" ? 168 : 84}
      className="rounded-lg object-cover"
      unoptimized
    />
  );
}

function ErrorMessage({ message }: { message: string }) {
  return (
    <p className="rounded-2xl border border-destructive/30 bg-destructive/10 p-4 text-sm font-semibold text-destructive">
      {message}
    </p>
  );
}

function WatchedSkeleton() {
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <Skeleton key={index} className="h-16 rounded-xl" />
        ))}
      </div>
      {Array.from({ length: 4 }).map((_, index) => (
        <div key={index} className="rounded-2xl border bg-background p-3">
          <div className="flex items-center gap-3">
            <Skeleton className="h-[84px] w-14 rounded-lg" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-2/3" />
              <Skeleton className="h-3 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function MovieDetailsSkeleton() {
  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-[120px_1fr]">
        <Skeleton className="h-[168px] w-[120px] rounded-lg" />
        <div>
          <Skeleton className="h-7 w-2/3" />
          <div className="mt-3 flex gap-2">
            <Skeleton className="h-6 w-24 rounded-full" />
            <Skeleton className="h-6 w-20 rounded-full" />
            <Skeleton className="h-6 w-16 rounded-full" />
          </div>
          <Skeleton className="mt-3 h-4 w-1/2" />
        </div>
      </div>
      <div className="rounded-2xl border bg-muted/40 p-4">
        <Skeleton className="h-6 w-48" />
        <Skeleton className="mt-3 h-20 w-full" />
        <Skeleton className="mt-3 h-9 w-40" />
      </div>
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-5/6" />
      <Skeleton className="h-4 w-3/5" />
    </div>
  );
}

function RatingScaleLegend({
  rating,
  compact = false,
}: {
  rating: number;
  compact?: boolean;
}) {
  const currentLabel = getRatingTierLabel(rating);

  return (
    <div className={compact ? "mt-2" : "mt-3"}>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {RATING_TIERS.map((tier) => {
          const active = currentLabel === tier.label;
          const Icon =
            tier.label === "Bad"
              ? Frown
              : tier.label === "Okay"
                ? Meh
                : tier.label === "Good"
                  ? Smile
                  : Laugh;

          return (
            <div
              key={tier.label}
              className={`rounded-xl border px-2.5 py-2 text-[11px] font-semibold transition-colors ${
                active
                  ? "border-primary/50 bg-primary/15 text-primary shadow-sm"
                  : "border-border bg-background/80 text-muted-foreground"
              }`}
            >
              <div className="flex items-center gap-1.5">
                <Icon className="size-3.5" />
                <span>{tier.label}</span>
              </div>
              <p className="mt-0.5 text-[10px] font-medium opacity-85">
                {tier.min}-{tier.max}
              </p>
            </div>
          );
        })}
      </div>
      {rating > 0 ? (
        <p className="mt-1 text-xs font-medium text-muted-foreground">
          Selected: {currentLabel} feeling ({rating}/10)
        </p>
      ) : null}
    </div>
  );
}
