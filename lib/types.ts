export type SearchParams = Record<string, string | string[] | undefined>;

export interface OmdbSearchMovie {
  imdbID: string;
  Title: string;
  Year: string;
  Poster: string;
  Type: string;
}

export interface OmdbMovieDetails {
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
  title: string;
  year: string;
  poster: string;
  imdbRating: number;
  runtime: number;
  userRating: number;
  comment?: string;
  updatedAt?: string;
}
