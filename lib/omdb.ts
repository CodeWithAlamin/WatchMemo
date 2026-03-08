import "server-only";

import { OmdbMovieDetails, OmdbSearchMovie } from "./types";

const BASE_URL = "https://www.omdbapi.com/";

interface OmdbBaseResponse {
  Response: "True" | "False";
  Error?: string;
}

interface OmdbSearchResponse extends OmdbBaseResponse {
  Search?: OmdbSearchMovie[];
}

interface OmdbDetailResponse extends OmdbBaseResponse, OmdbMovieDetails {}

function getApiKey(): string {
  const apiKey = process.env.OMDB_API_KEY;

  if (!apiKey) {
    throw new Error(
      "Missing OMDB_API_KEY. Add it to your .env.local file before running the app."
    );
  }

  return apiKey;
}

async function callOmdb<T extends OmdbBaseResponse>(
  params: Record<string, string>
): Promise<T> {
  const apiKey = getApiKey();
  const query = new URLSearchParams({ apikey: apiKey, ...params });

  const response = await fetch(`${BASE_URL}?${query.toString()}`, {
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error("Failed to reach OMDb API.");
  }

  const data = (await response.json()) as T;

  if (data.Response === "False") {
    throw new Error(data.Error || "OMDb request failed.");
  }

  return data;
}

export async function searchMovies(query: string): Promise<OmdbSearchMovie[]> {
  const normalizedQuery = query.trim();

  if (normalizedQuery.length < 3) {
    return [];
  }

  try {
    const data = await callOmdb<OmdbSearchResponse>({ s: normalizedQuery });
    const movies = data.Search ?? [];

    // OMDb can occasionally return duplicate imdbID entries for some queries.
    // Keep only the first entry per imdbID so React keys stay stable/unique.
    const uniqueMovies = Array.from(
      new Map(movies.map((movie) => [movie.imdbID, movie])).values()
    );

    return uniqueMovies;
  } catch (error) {
    if (error instanceof Error && error.message === "Movie not found!") {
      return [];
    }

    throw error;
  }
}

export async function getMovieDetails(
  imdbId: string
): Promise<OmdbMovieDetails | null> {
  if (!imdbId) return null;

  const data = await callOmdb<OmdbDetailResponse>({ i: imdbId });
  return data;
}
