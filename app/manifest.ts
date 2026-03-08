import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "WatchMemo",
    short_name: "WatchMemo",
    description:
      "Personal movie watch history tracker with ratings and notes.",
    start_url: "/",
    display: "standalone",
    background_color: "#f7f3e9",
    theme_color: "#f7f3e9",
    icons: [
      {
        src: "/watchmemo-logo-mark.svg",
        sizes: "any",
        type: "image/svg+xml",
      },
    ],
  };
}
