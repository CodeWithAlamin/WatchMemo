import type { Metadata } from "next";
import Link from "next/link";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
  },
};

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <main className="mx-auto flex min-h-full w-full max-w-5xl flex-col justify-center p-4 sm:p-6 lg:p-10">
      <div className="mx-auto mb-4 flex w-full max-w-md items-center justify-between rounded-2xl border bg-background/80 px-4 py-3 backdrop-blur-sm">
        <div>
          <p className="text-sm font-black tracking-tight text-foreground">
            WatchMemo
          </p>
          <p className="text-[11px] text-muted-foreground">Personal watch log</p>
        </div>
        <Link href="/" className="text-xs font-medium text-primary hover:underline">
          Back home
        </Link>
      </div>
      <div className="w-full">{children}</div>
    </main>
  );
}
