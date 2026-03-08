import Image from "next/image";
import Link from "next/link";
import { Github, Linkedin, Twitter } from "lucide-react";

const socialLinks = [
  {
    label: "LinkedIn",
    href: "https://linkedin.com/in/codewithalamin",
    icon: Linkedin,
  },
  {
    label: "X",
    href: "https://x.com/CodeWithAlamin",
    icon: Twitter,
  },
  {
    label: "GitHub",
    href: "https://github.com/CodeWithAlamin",
    icon: Github,
  },
] as const;

export default function SiteFooter() {
  return (
    <footer className="border-t border-border/70 bg-background/80">
      <div className="mx-auto w-full max-w-6xl px-4 py-3 text-sm text-muted-foreground sm:px-6 sm:py-3.5 lg:px-8">
        <div className="flex flex-col items-center gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="text-center lg:text-left">
            <Link href="/" className="inline-flex" aria-label="Go to home">
              <Image
                src="/watchmemo-logo-wordmark.svg"
                alt="WatchMemo"
                width={170}
                height={36}
                className="mx-auto h-7 w-auto lg:mx-0"
              />
            </Link>
            <p className="mt-0.5 text-xs">
              © {new Date().getFullYear()} All rights reserved.
            </p>
          </div>

          <p className="text-center text-xs sm:text-sm">
            Crafted with <span aria-hidden="true">♥</span> by{" "}
            <span className="font-semibold text-foreground">CodeWithAlamin</span>
          </p>

          <nav
            className="flex flex-wrap items-center justify-center gap-2 lg:justify-end"
            aria-label="Social links"
          >
          {socialLinks.map(({ label, href, icon: Icon }) => (
            <Link
              key={label}
              href={href}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors hover:bg-secondary hover:text-foreground"
            >
              <Icon className="size-3.5" />
              {label}
            </Link>
          ))}
          </nav>
        </div>
      </div>
    </footer>
  );
}
