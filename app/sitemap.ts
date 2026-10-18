import type { MetadataRoute } from "next";
import { getMovieDiscovery } from "@/lib/tmdb";

const siteUrl =
  (process.env.NEXT_PUBLIC_SITE_URL || "https://watchmemo.vercel.app").replace(/\/+$/, "");

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const entries: MetadataRoute.Sitemap = [
    { url: siteUrl, changeFrequency: "daily", priority: 1 },
  ];

  try {
    const discovery = await getMovieDiscovery();
    if (discovery.hasError) {
      console.error("Some TMDB movie lists could not be loaded for the sitemap.");
    }
    const movieIds = new Set([
      ...discovery.trending.slice(0, 8),
      ...discovery.nowPlaying.slice(0, 8),
      ...discovery.upcoming.slice(0, 8),
    ].map((movie) => movie.id));

    for (const movieId of movieIds) {
      entries.push({
        url: `${siteUrl}/movie/tmdb/${movieId}`,
        changeFrequency: "monthly",
        priority: 0.7,
      });
    }
  } catch (error) {
    console.error("Could not add movie pages to sitemap.", error);
  }

  return entries;
}
