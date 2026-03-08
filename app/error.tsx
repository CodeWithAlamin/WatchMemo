"use client";

export default function Error({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  return (
    <main className="mx-auto max-w-6xl p-4 sm:p-6 lg:p-8">
      <div className="rounded-2xl border border-destructive/30 bg-destructive/10 p-8 shadow-sm">
        <p className="text-base font-semibold text-destructive">{error.message}</p>
        <button className="mt-4 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90" onClick={reset}>
          Try again
        </button>
      </div>
    </main>
  );
}
