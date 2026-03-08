import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "WatchLog",
    short_name: "WatchLog",
    description:
      "Personal movie watch history tracker with ratings and notes.",
    start_url: "/",
    display: "standalone",
    background_color: "#f7f3e9",
    theme_color: "#f7f3e9",
    icons: [
      {
        src: "/vite.svg",
        sizes: "192x192",
        type: "image/svg+xml",
      },
    ],
  };
}
