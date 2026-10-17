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
    <main className="page-shell flex min-h-full flex-col justify-center">
      <div className="mx-auto mb-3 flex w-full max-w-md items-center justify-between rounded-xl border bg-background/80 px-3 py-2.5 backdrop-blur-sm">
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
          Home
        </Link>
      </div>
      <div className="w-full">{children}</div>
    </main>
  );
}
