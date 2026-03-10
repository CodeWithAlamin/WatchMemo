import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import type { ReactNode } from "react";
import SiteFooter from "@/components/site-footer";
import "./globals.css";

const jakarta = Plus_Jakarta_Sans({ subsets: ["latin"] });

const siteName = "WatchMemo";
const siteDescription =
  "WatchMemo is your personal movie watch history tracker. Search films, rate what you watched, and keep private viewing notes for future reference.";
const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL || "https://watchmemo.vercel.app";
const socialImage = "/thumbnail.png";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  applicationName: siteName,
  verification: {
    google: "Ud_1N5b6ROzjS2VDBXVheEwRlJVZ1uzppKAhGynxIn8",
  },
  referrer: "origin-when-cross-origin",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  title: {
    default: siteName,
    template: `%s | ${siteName}`,
  },
  description: siteDescription,
  authors: [{ name: "Alamin", url: "https://github.com/CodeWithAlamin" }],
  creator: "CodeWithAlamin",
  publisher: siteName,
  keywords: [
    "watch history",
    "movie tracker",
    "movie watchlist",
    "film journal",
    "personal watch log",
    "movie ratings",
  ],
  alternates: {
    canonical: "/",
  },
  manifest: "/manifest.webmanifest",
  icons: {
    icon: [{ url: "/watchmemo-logo-mark.svg", type: "image/svg+xml" }],
    shortcut: ["/watchmemo-logo-mark.svg"],
    apple: "/watchmemo-logo-mark.svg",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "/",
    siteName,
    title: siteName,
    description: siteDescription,
    images: [
      {
        url: socialImage,
        width: 1200,
        height: 630,
        alt: `${siteName} preview`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    creator: "@CodeWithAlamin",
    site: "@CodeWithAlamin",
    title: siteName,
    description: siteDescription,
    images: [socialImage],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  category: "entertainment",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#f7f3e9",
};

export default function RootLayout({
  children,
}: Readonly<{ children: ReactNode }>) {
  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "Organization",
      name: siteName,
      url: siteUrl,
      logo: `${siteUrl}/watchmemo-logo-mark.svg`,
      sameAs: [
        "https://github.com/CodeWithAlamin",
        "https://x.com/CodeWithAlamin",
        "https://linkedin.com/in/codewithalamin",
      ],
    },
    {
      "@context": "https://schema.org",
      "@type": "WebSite",
      name: siteName,
      url: siteUrl,
      description: siteDescription,
      potentialAction: {
        "@type": "SearchAction",
        target: `${siteUrl}/?q={search_term_string}`,
        "query-input": "required name=search_term_string",
      },
    },
  ];

  return (
    <html lang="en">
      <body className={jakarta.className}>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <div className="flex min-h-screen flex-col lg:h-dvh lg:overflow-hidden">
          <main className="flex-1 lg:overflow-hidden">{children}</main>
          <SiteFooter />
        </div>
      </body>
    </html>
  );
}
