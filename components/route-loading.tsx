import { Skeleton } from "@/components/ui/skeleton";
import SiteHeader from "@/components/site-header";

export function SearchLoading() {
  return (
    <main className="page-shell flex flex-col gap-6" aria-busy="true" aria-label="Loading search">
      <SiteHeader />
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between md:gap-8">
        <Skeleton className="h-9 w-40 rounded-lg" />
        <Skeleton className="h-11 w-full rounded-xl md:max-w-4xl md:flex-1" />
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7">
        {Array.from({ length: 10 }, (_, index) => <Skeleton key={index} className="aspect-[2/3] rounded-xl" />)}
      </div>
    </main>
  );
}

export function MovieLoading() {
  return (
    <main className="page-shell flex flex-col gap-4" aria-busy="true" aria-label="Loading movie">
      <SiteHeader />
      <div className="mx-auto w-full max-w-6xl space-y-4">
        <Skeleton className="h-6 w-36 rounded" />
        <div className="grid overflow-hidden rounded-2xl border bg-white/60 lg:grid-cols-[280px_minmax(0,1fr)]">
          <Skeleton className="aspect-[2/3] w-full rounded-none" />
          <div className="space-y-5 p-4 sm:p-6">
            <Skeleton className="h-10 w-3/4 rounded-lg" />
            <Skeleton className="h-5 w-1/3 rounded" />
            <Skeleton className="h-28 w-full rounded-xl" />
            <Skeleton className="h-36 w-full rounded-2xl" />
          </div>
        </div>
      </div>
    </main>
  );
}

export function HistoryLoading() {
  return (
    <main className="page-shell flex flex-col gap-6" aria-busy="true" aria-label="Loading watch history">
      <SiteHeader />
      <div className="mx-auto w-full max-w-6xl space-y-5">
        <Skeleton className="h-10 w-56 rounded-lg" />
        <div className="space-y-2.5">
          {Array.from({ length: 4 }, (_, index) => <Skeleton key={index} className="h-24 rounded-xl" />)}
        </div>
      </div>
    </main>
  );
}

export function ProfileLoading() {
  return (
    <main className="page-shell flex flex-col gap-5" aria-busy="true" aria-label="Loading profile">
      <SiteHeader />
      <div className="mx-auto w-full max-w-6xl space-y-4">
        <Skeleton className="h-24 rounded-2xl" />
        <div className="grid gap-3 lg:grid-cols-2">
          <Skeleton className="h-52 rounded-2xl" />
          <Skeleton className="h-52 rounded-2xl" />
        </div>
      </div>
    </main>
  );
}
