import type { Metadata } from "next";
import MovieDiscoverySections from "@/components/movie-discovery";
import MovieSearchForm from "@/components/movie-search-form";
import SiteHeader from "@/components/site-header";
import { getMovieDiscovery } from "@/lib/tmdb";

export const metadata: Metadata = {
  title: "Discover Movies",
  description: "Browse movies, search by title, and save ratings and notes.",
  alternates: { canonical: "/" },
};

export default async function HomePage() {
  const discovery = await getMovieDiscovery();

  return (
    <main className="page-shell flex flex-col gap-6">
      <SiteHeader />

      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-950 via-blue-950 to-indigo-950 px-5 py-6 text-white shadow-xl shadow-blue-950/15 sm:px-8 sm:py-8">
        <div className="pointer-events-none absolute -right-24 -top-32 size-72 rounded-full bg-amber-300/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-40 left-1/3 size-72 rounded-full bg-sky-400/20 blur-3xl" />
        <div className="relative grid gap-5 sm:gap-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(360px,0.9fr)] lg:items-center">
          <div>
            <h1 className="text-3xl font-black leading-tight tracking-tight sm:text-4xl lg:text-5xl">
              Find a movie.
            </h1>
            <p className="mt-2 max-w-xl text-sm leading-5 text-blue-100 sm:text-base">
              Browse popular movies or search by title. Save ratings and notes to your history.
            </p>
          </div>
          <div className="w-full lg:justify-self-end">
            <MovieSearchForm />
          </div>
        </div>
      </section>

      <MovieDiscoverySections discovery={discovery} />
    </main>
  );
}
