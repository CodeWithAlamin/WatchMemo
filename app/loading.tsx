import Image from "next/image";

function PosterRow() {
  return (
    <section className="space-y-3" aria-hidden="true">
      <div className="loading-shimmer h-7 w-44 rounded-lg" />
      <div className="flex gap-4 overflow-hidden">
        {Array.from({ length: 6 }, (_, index) => (
          <div key={index} className="w-32 shrink-0 space-y-2 sm:w-40">
            <div className="loading-shimmer aspect-[2/3] rounded-2xl" />
            <div className="loading-shimmer h-4 w-4/5 rounded" />
            <div className="loading-shimmer h-3 w-2/5 rounded" />
          </div>
        ))}
      </div>
    </section>
  );
}

export default function Loading() {
  return (
    <main className="page-shell flex flex-col gap-6" aria-busy="true" aria-label="Loading WatchMemo">
      <div className="flex min-h-12 items-center justify-between" aria-hidden="true">
        <Image src="/watchmemo-logo-wordmark.svg" alt="" width={230} height={48} className="h-8 w-auto sm:h-9" />
        <div className="loading-shimmer h-9 w-28 rounded-full" />
      </div>
      <div className="loading-shimmer h-44 rounded-3xl sm:h-52" aria-hidden="true" />
      <div className="space-y-6">
        <PosterRow />
        <PosterRow />
        <PosterRow />
      </div>
      <span className="sr-only">Loading movies…</span>
    </main>
  );
}
