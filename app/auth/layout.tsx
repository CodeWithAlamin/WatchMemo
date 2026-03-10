import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
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
          <Link href="/" className="inline-flex" aria-label="Go to home">
            <Image
              src="/watchmemo-logo-wordmark.svg"
              alt="WatchMemo"
              width={156}
              height={32}
              className="h-7 w-auto"
              priority
            />
          </Link>
          <p className="text-[11px] text-muted-foreground">Personal watch log</p>
        </div>
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/5 px-3 py-1.5 text-xs font-medium text-primary transition hover:bg-primary/10"
        >
          <ArrowLeft className="size-3.5" />
          Back home
        </Link>
      </div>
      <div className="w-full">{children}</div>
    </main>
  );
}
