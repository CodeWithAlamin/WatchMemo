"use client";

import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  Clapperboard,
  Clock3,
  Film,
  Pencil,
  Save,
  Sparkles,
  Star,
  X,
} from "lucide-react";

import SearchInput from "./search-input";
import StarRating from "./star-rating";
import { useLocalStorageState } from "./hooks/use-local-storage-state";
import { OmdbMovieDetails, OmdbSearchMovie, WatchedMovie } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

interface UsePopcornClientProps {
  initialQuery: string;
  movies: OmdbSearchMovie[];
  selectedMovie: OmdbMovieDetails | null;
  fetchError: string;
}

const average = (values: number[]): number => {
  if (!values.length) return 0;
  return values.reduce((acc, current) => acc + current / values.length, 0);
};

export default function UsePopcornClient({
  initialQuery,
  movies,
  selectedMovie,
  fetchError,
}: UsePopcornClientProps): JSX.Element {
  const [watched, setWatched] = useLocalStorageState<WatchedMovie[]>(
    [],
    "watched",
  );
  const [mobilePanel, setMobilePanel] = useState<"search" | "watched">(
    "search",
  );

  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const selectedId = searchParams.get("selected");

  useEffect(() => {
    if (!selectedMovie?.Title) {
      document.title = "CineScope";
      return;
    }

    document.title = `${selectedMovie.Title} | CineScope`;

    return () => {
      document.title = "CineScope";
    };
  }, [selectedMovie?.Title]);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent): void {
      if (event.key !== "Escape" || !selectedId) return;
      handleCloseMovie();
    }

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [selectedId]);

  function updateSearchParams(
    updater: (params: URLSearchParams) => void,
  ): void {
    const params = new URLSearchParams(searchParams.toString());
    updater(params);

    const next = params.toString();
    router.replace(next ? `${pathname}?${next}` : pathname, { scroll: false });
  }

  function handleSelectMovie(imdbID: string): void {
    updateSearchParams((params) => {
      if (params.get("selected") === imdbID) {
        params.delete("selected");
      } else {
        params.set("selected", imdbID);
      }
    });

    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function handleCloseMovie(): void {
    updateSearchParams((params) => {
      params.delete("selected");
    });
    setMobilePanel("search");
  }

  function handleMobilePanelChange(panel: "search" | "watched"): void {
    setMobilePanel(panel);
    updateSearchParams((params) => {
      params.delete("selected");
    });
  }

  function handleAddWatched(movie: WatchedMovie): void {
    setWatched((current) => {
      if (current.some((item) => item.imdbID === movie.imdbID)) return current;
      return [...current, movie];
    });

    handleCloseMovie();
  }

  function handleDeleteWatched(id: string): void {
    setWatched((current) => current.filter((movie) => movie.imdbID !== id));
  }

  function handleUpdateWatched(
    id: string,
    updates: Pick<WatchedMovie, "userRating" | "comment">,
  ): void {
    setWatched((current) =>
      current.map((movie) => {
        if (movie.imdbID !== id) return movie;

        const didRatingChange = movie.userRating !== updates.userRating;

        return {
          ...movie,
          ...updates,
          countRatingDecisions: didRatingChange
            ? movie.countRatingDecisions + 1
            : movie.countRatingDecisions,
        };
      }),
    );
  }

  return (
    <main className="mx-auto min-h-screen max-w-6xl p-4 sm:p-6 lg:p-8">
      <section className="sticky top-3 z-50 mb-6 rounded-3xl border bg-background/90 p-4 shadow-xl backdrop-blur-xl supports-[backdrop-filter]:bg-background/80 sm:p-5">
        <div className="space-y-3">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h1 className="text-3xl font-black tracking-tight sm:text-4xl">
                CineScope
              </h1>
              <p className="mt-1 text-xs text-muted-foreground">
                Search. Rate. Remember.
              </p>
            </div>
            <Badge
              variant="secondary"
              className="mt-1 rounded-full px-2.5 py-1 text-[10px] tracking-wide"
            >
              CURATED WATCHLIST
            </Badge>
          </div>

          <SearchInput
            initialQuery={initialQuery}
            resultCount={movies.length}
          />
        </div>
      </section>

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

      <section className="grid gap-5 lg:grid-cols-2">
        <Card
          className={`overflow-hidden rounded-3xl border-0 bg-card/95 py-0 shadow-lg ${
            selectedId
              ? "hidden lg:flex"
              : mobilePanel === "search"
                ? "flex"
                : "hidden lg:flex"
          }`}
        >
          <CardHeader className="py-4">
            <CardTitle className="flex items-center gap-2 text-base font-bold">
              <Clapperboard className="size-4" /> Discover Movies
            </CardTitle>
            <CardDescription>
              Pick a film to open full details and ratings.
            </CardDescription>
          </CardHeader>
          <Separator />
          <CardContent className="p-4">
            {fetchError ? <ErrorMessage message={fetchError} /> : null}
            {!fetchError ? (
              <MovieList
                movies={movies}
                selectedId={selectedId}
                onSelectMovie={handleSelectMovie}
              />
            ) : null}
          </CardContent>
        </Card>

        <Card
          className={`overflow-hidden rounded-3xl border-0 bg-card/95 py-0 shadow-lg ${
            selectedId
              ? "flex"
              : mobilePanel === "watched"
                ? "flex"
                : "hidden lg:flex"
          }`}
        >
          <CardHeader className="py-4">
            <CardTitle className="flex items-center gap-2 text-base font-bold">
              {selectedMovie ? (
                <Star className="size-4" />
              ) : (
                <Clock3 className="size-4" />
              )}{" "}
              {selectedMovie ? "Movie Details" : "Your Watched List"}
            </CardTitle>
            <CardDescription>
              {selectedMovie
                ? "Set your score and save it to your collection."
                : "A compact view of everything you have rated."}
            </CardDescription>
          </CardHeader>
          <Separator />
          <CardContent className="p-4">
            {selectedId && selectedMovie ? (
              <MovieDetails
                movie={selectedMovie}
                watched={watched}
                onCloseMovie={handleCloseMovie}
                onAddWatched={handleAddWatched}
                onUpdateWatched={handleUpdateWatched}
              />
            ) : (
              <>
                <WatchedSummary watched={watched} />
                <WatchedMoviesList
                  watched={watched}
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
}): JSX.Element {
  if (!movies.length) {
    return (
      <div className="rounded-2xl border bg-muted/60 p-6 text-center">
        <Film className="mx-auto mb-2 size-5 text-muted-foreground" />
        <p className="text-sm font-medium text-muted-foreground">
          Search for a movie using at least 3 letters.
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
                <p className="mt-1 text-xs text-muted-foreground">
                  Released {movie.Year}
                </p>
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
  onCloseMovie,
  onAddWatched,
  onUpdateWatched,
}: {
  movie: OmdbMovieDetails;
  watched: WatchedMovie[];
  onCloseMovie: () => void;
  onAddWatched: (movie: WatchedMovie) => void;
  onUpdateWatched: (
    id: string,
    updates: Pick<WatchedMovie, "userRating" | "comment">,
  ) => void;
}): JSX.Element {
  const [userRating, setUserRating] = useState(0);
  const [comment, setComment] = useState("");
  const [isEditingWatched, setIsEditingWatched] = useState(false);
  const [editRating, setEditRating] = useState(0);
  const [editComment, setEditComment] = useState("");
  const countRef = useRef(0);

  useEffect(() => {
    if (userRating) countRef.current += 1;
  }, [userRating]);

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
    const runtimeMinutes = Number(movie.Runtime.split(" ").at(0));

    const watchedMovie: WatchedMovie = {
      imdbID: movie.imdbID,
      title: movie.Title,
      year: movie.Year,
      poster: movie.Poster,
      imdbRating: Number(movie.imdbRating),
      runtime: Number.isNaN(runtimeMinutes) ? 0 : runtimeMinutes,
      userRating,
      comment: comment.trim() || undefined,
      countRatingDecisions: countRef.current,
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
    });
    setIsEditingWatched(false);
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-[120px_1fr]">
        <Poster src={movie.Poster} alt={`Poster of ${movie.Title}`} size="lg" />
        <div>
          <Button variant="outline" size="sm" onClick={onCloseMovie}>
            Back
          </Button>
          <h3 className="mt-2 text-xl font-bold leading-tight">
            {movie.Title}
          </h3>
          <div className="mt-2 flex flex-wrap gap-1.5">
            <Badge variant="secondary">{movie.Released}</Badge>
            <Badge variant="secondary">{movie.Runtime}</Badge>
            <Badge variant="secondary">IMDb {movie.imdbRating}</Badge>
          </div>
          <p className="mt-2 text-sm text-muted-foreground">{movie.Genre}</p>
        </div>
      </div>

      <div className="rounded-2xl border bg-muted/40 p-4">
        {!isWatched ? (
          <>
            <StarRating maxRating={10} size={22} onSetRating={setUserRating} />
            <textarea
              className="mt-3 min-h-20 w-full rounded-xl border bg-background px-3 py-2 text-sm outline-none ring-ring/50 transition placeholder:text-muted-foreground focus-visible:ring-2"
              placeholder="Optional: write your personal thoughts about this movie..."
              value={comment}
              onChange={(event) => setComment(event.target.value)}
            />
            {userRating > 0 ? (
              <Button className="mt-3" onClick={handleAdd}>
                Add to watched list
              </Button>
            ) : null}
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
                  onClick={handleStartEditingWatched}
                >
                  <Pencil className="mr-1 size-3.5" />
                  Edit rating/comment
                </Button>
              </>
            ) : (
              <>
                <StarRating
                  maxRating={10}
                  size={22}
                  rating={editRating}
                  onSetRating={setEditRating}
                />
                <textarea
                  className="mt-1 min-h-20 w-full rounded-xl border bg-background px-3 py-2 text-sm outline-none ring-ring/50 transition placeholder:text-muted-foreground focus-visible:ring-2"
                  placeholder="Update your personal thoughts..."
                  value={editComment}
                  onChange={(event) => setEditComment(event.target.value)}
                />
                <div className="flex gap-2">
                  <Button size="sm" onClick={handleSaveEditingWatched}>
                    <Save className="mr-1 size-3.5" />
                    Save
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
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

      <p className="text-sm leading-relaxed text-muted-foreground">
        {movie.Plot}
      </p>
      <p className="text-sm text-muted-foreground">Starring {movie.Actors}</p>
      <p className="text-sm text-muted-foreground">
        Directed by {movie.Director}
      </p>
    </div>
  );
}

function WatchedSummary({ watched }: { watched: WatchedMovie[] }): JSX.Element {
  const { avgImdbRating, avgUserRating, avgRuntime } = useMemo(() => {
    return {
      avgImdbRating: average(watched.map((movie) => movie.imdbRating)),
      avgUserRating: average(watched.map((movie) => movie.userRating)),
      avgRuntime: average(watched.map((movie) => movie.runtime)),
    };
  }, [watched]);

  return (
    <div className="mb-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
      <Metric label="Movies" value={watched.length.toString()} />
      <Metric label="IMDb Avg" value={avgImdbRating.toFixed(2)} />
      <Metric label="Your Avg" value={avgUserRating.toFixed(2)} />
      <Metric label="Runtime" value={`${avgRuntime.toFixed(0)}m`} />
    </div>
  );
}

function Metric({
  label,
  value,
}: {
  label: string;
  value: string;
}): JSX.Element {
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
  onDeleteWatched,
  onUpdateWatched,
}: {
  watched: WatchedMovie[];
  onDeleteWatched: (id: string) => void;
  onUpdateWatched: (
    id: string,
    updates: Pick<WatchedMovie, "userRating" | "comment">,
  ) => void;
}): JSX.Element {
  if (!watched.length) {
    return (
      <div className="rounded-2xl border bg-muted/60 p-6 text-center">
        <Sparkles className="mx-auto mb-2 size-5 text-muted-foreground" />
        <p className="text-sm font-medium text-muted-foreground">
          Your watched list is empty.
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
          onDeleteWatched={onDeleteWatched}
          onUpdateWatched={onUpdateWatched}
        />
      ))}
    </ul>
  );
}

function WatchedMovieItem({
  movie,
  onDeleteWatched,
  onUpdateWatched,
}: {
  movie: WatchedMovie;
  onDeleteWatched: (id: string) => void;
  onUpdateWatched: (
    id: string,
    updates: Pick<WatchedMovie, "userRating" | "comment">,
  ) => void;
}): JSX.Element {
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

  return (
    <li className="rounded-2xl border bg-background p-3">
      <div className="flex items-center gap-3">
        <Poster src={movie.poster} alt={`${movie.title} poster`} />

        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold">{movie.title}</p>
          <p className="text-xs text-muted-foreground">
            IMDb {movie.imdbRating} • You {movie.userRating} • {movie.runtime}m
          </p>
          {!isEditing && movie.comment ? (
            <p className="comment-preview mt-1 text-xs italic text-muted-foreground">
              “{movie.comment}”
            </p>
          ) : null}
        </div>

        <div className="flex items-center gap-2">
          {!isEditing ? (
            <Button variant="outline" size="sm" onClick={handleStartEditing}>
              <Pencil className="mr-1 size-3.5" />
              Edit
            </Button>
          ) : null}

          <Button
            variant="destructive"
            size="sm"
            onClick={() => onDeleteWatched(movie.imdbID)}
          >
            Remove
          </Button>
        </div>
      </div>

      {isEditing ? (
        <div className="mt-3 rounded-xl border bg-muted/40 p-3">
          <StarRating
            maxRating={10}
            size={20}
            rating={draftRating}
            onSetRating={setDraftRating}
          />
          <textarea
            className="mt-3 min-h-20 w-full rounded-xl border bg-background px-3 py-2 text-sm outline-none ring-ring/50 transition placeholder:text-muted-foreground focus-visible:ring-2"
            placeholder="Update your personal thoughts..."
            value={draftComment}
            onChange={(event) => setDraftComment(event.target.value)}
          />

          <div className="mt-3 flex gap-2">
            <Button size="sm" onClick={handleSaveEditing}>
              <Save className="mr-1 size-3.5" />
              Save
            </Button>
            <Button variant="outline" size="sm" onClick={handleCancelEditing}>
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
}): JSX.Element {
  const dimension = size === "lg" ? 120 : 56;

  if (src === "N/A") {
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

function ErrorMessage({ message }: { message: string }): JSX.Element {
  return (
    <p className="rounded-2xl border border-destructive/30 bg-destructive/10 p-4 text-sm font-semibold text-destructive">
      {message}
    </p>
  );
}
