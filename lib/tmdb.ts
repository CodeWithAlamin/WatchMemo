import "server-only";

import type { MovieDetails, MovieSearchResult } from "@/lib/types";

export interface DiscoveryMovie {
  id: number;
  title: string;
  overview: string;
  releaseDate: string;
  posterUrl: string | null;
  rating: number;
}

export interface MovieDiscovery {
  trending: DiscoveryMovie[];
  nowPlaying: DiscoveryMovie[];
  upcoming: DiscoveryMovie[];
  hasError: boolean;
}

interface TmdbMovie {
  id: number;
  title?: string;
  overview?: string;
  release_date?: string;
  poster_path?: string | null;
  vote_average?: number;
  imdb_id?: string | null;
  runtime?: number | null;
  genres?: { name: string }[];
  credits?: {
    cast?: { name: string }[];
    crew?: { name: string; job: string }[];
  };
  external_ids?: { imdb_id?: string | null };
}

interface TmdbListResponse {
  results?: TmdbMovie[];
  total_results?: number;
}

interface TmdbFindResponse {
  movie_results?: TmdbMovie[];
}

const API_BASE_URL = "https://api.themoviedb.org/3";
const IMAGE_BASE_URL = "https://image.tmdb.org/t/p/w500";
const REQUEST_TIMEOUT_MS = 8000;

function getAccessToken(): string {
  const token = process.env.TMDB_API_READ_ACCESS_TOKEN?.trim();
  if (!token) throw new Error("TMDB is not configured.");
  return token;
}

async function tmdbRequest<T>(path: string, revalidate = 3600): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      Authorization: `Bearer ${getAccessToken()}`,
      accept: "application/json",
    },
    next: { revalidate },
    signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
  });

  if (!response.ok) {
    throw new Error(`TMDB request failed (${response.status}).`);
  }
  return response.json() as Promise<T>;
}

function normalizeMovies(movies: TmdbMovie[] = []): DiscoveryMovie[] {
  return movies
    .filter((movie) => movie.id && movie.title)
    .map((movie) => ({
      id: movie.id,
      title: movie.title ?? "Untitled movie",
      overview: movie.overview?.trim() ?? "",
      releaseDate: movie.release_date ?? "",
      posterUrl: movie.poster_path ? `${IMAGE_BASE_URL}${movie.poster_path}` : null,
      rating: Number.isFinite(movie.vote_average) ? Number(movie.vote_average) : 0,
    }));
}

async function getMovieList(path: string): Promise<DiscoveryMovie[]> {
  const data = await tmdbRequest<TmdbListResponse>(`${path}?language=en-US&page=1`);
  return normalizeMovies(data.results);
}

export async function getMovieDiscovery(): Promise<MovieDiscovery> {
  const [trending, nowPlaying, upcoming] = await Promise.allSettled([
    getMovieList("/trending/movie/week"),
    getMovieList("/movie/now_playing"),
    getMovieList("/movie/upcoming"),
  ]);

  return {
    trending: trending.status === "fulfilled" ? trending.value : [],
    nowPlaying: nowPlaying.status === "fulfilled" ? nowPlaying.value : [],
    upcoming: upcoming.status === "fulfilled" ? upcoming.value : [],
    hasError: [trending, nowPlaying, upcoming].some((result) => result.status === "rejected"),
  };
}

export async function searchMovies(query: string): Promise<MovieSearchResult[]> {
  const normalizedQuery = query.trim();
  if (normalizedQuery.length < 2) return [];

  const params = new URLSearchParams({ query: normalizedQuery, language: "en-US", page: "1" });
  const data = await tmdbRequest<TmdbListResponse>(`/search/movie?${params}`);
  return normalizeMovies(data.results).map((movie) => ({
    imdbID: `tmdb:${movie.id}`,
    tmdbID: movie.id,
    Title: movie.title,
    Year: movie.releaseDate.slice(0, 4),
    Poster: movie.posterUrl ?? "N/A",
    Type: "movie",
  }));
}

function normalizeDetails(movie: TmdbMovie): MovieDetails {
  const imdbId = movie.external_ids?.imdb_id ?? movie.imdb_id;
  const crew = movie.credits?.crew ?? [];
  const cast = movie.credits?.cast ?? [];
  const poster = movie.poster_path ? `${IMAGE_BASE_URL}${movie.poster_path}` : "N/A";
  const year = movie.release_date?.slice(0, 4) ?? "";
  return {
    tmdbID: movie.id,
    imdbID: imdbId && /^tt\d{7,10}$/.test(imdbId) ? imdbId : `tmdb:${movie.id}`,
    Title: movie.title ?? "Untitled movie",
    Year: year || "N/A",
    Released: movie.release_date || "N/A",
    Runtime: movie.runtime ? `${movie.runtime} min` : "N/A",
    Genre: movie.genres?.map(({ name }) => name).join(", ") || "N/A",
    Director: crew.find(({ job }) => job === "Director")?.name ?? "N/A",
    Actors: cast.slice(0, 8).map(({ name }) => name).join(", ") || "N/A",
    Plot: movie.overview?.trim() || "N/A",
    Poster: poster,
    imdbRating: Number.isFinite(movie.vote_average) ? Number(movie.vote_average).toFixed(1) : "N/A",
  };
}

export async function getMovieDetailsByTmdbId(tmdbId: number): Promise<MovieDetails | null> {
  if (!Number.isSafeInteger(tmdbId) || tmdbId <= 0) return null;
  const params = new URLSearchParams({ append_to_response: "credits,external_ids", language: "en-US" });
  const movie = await tmdbRequest<TmdbMovie>(`/movie/${tmdbId}?${params}`, 86400);
  return movie.id ? normalizeDetails(movie) : null;
}

export async function getMovieDetailsByImdbId(imdbId: string): Promise<MovieDetails | null> {
  if (!/^tt\d{7,10}$/.test(imdbId)) return null;
  const params = new URLSearchParams({ external_source: "imdb_id" });
  const data = await tmdbRequest<TmdbFindResponse>(`/find/${imdbId}?${params}`, 86400);
  const match = data.movie_results?.[0];
  if (!match) return null;
  const movie = await getMovieDetailsByTmdbId(match.id);
  return movie ? { ...movie, imdbID: imdbId } : null;
}
