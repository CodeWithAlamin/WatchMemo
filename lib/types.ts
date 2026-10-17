export type SearchParams = Record<string, string | string[] | undefined>;

export interface MovieSearchResult {
  imdbID: string;
  tmdbID: number;
  Title: string;
  Year: string;
  Poster: string;
  Type: string;
}

export interface MovieDetails {
  tmdbID: number;
  imdbID: string;
  Title: string;
  Year: string;
  Released: string;
  Runtime: string;
  Genre: string;
  Director: string;
  Actors: string;
  Plot: string;
  Poster: string;
  imdbRating: string;
}

export interface WatchedMovie {
  imdbID: string;
  tmdbID?: number;
  title: string;
  year: string;
  poster: string;
  imdbRating: number;
  runtime: number;
  userRating: number;
  comment?: string;
  updatedAt?: string;
}
