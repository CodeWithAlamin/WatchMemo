import type { Metadata } from "next";
import SiteHeader from "@/components/site-header";
import WatchHistoryClient from "@/components/watch-history-client";

export const metadata: Metadata = {
  title: "My Watch History",
  description: "View and manage your private movie ratings and notes.",
  robots: { index: false, follow: false },
};

export default function HistoryPage() {
  return (
    <main className="page-shell flex flex-col gap-6">
      <SiteHeader />
      <div className="mx-auto w-full max-w-6xl space-y-5">
        <section>
          <h1 className="text-3xl font-black tracking-tight sm:text-4xl">My watch history</h1>
          <p className="mt-2 max-w-xl text-sm text-muted-foreground">
            Movies you’ve watched, with your ratings and notes.
          </p>
        </section>
        <WatchHistoryClient />
      </div>
    </main>
  );
}
