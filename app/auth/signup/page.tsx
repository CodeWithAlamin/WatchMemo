import type { Metadata } from "next";
import SignupForm from "./signup-form";

export const metadata: Metadata = {
  title: "Signup",
  description: "Create a WatchMemo account to save ratings and personal movie notes.",
  alternates: {
    canonical: "/auth/signup",
  },
  robots: {
    index: false,
    follow: false,
  },
  openGraph: {
    title: "Signup | WatchMemo",
    description: "Create your WatchMemo account.",
    url: "/auth/signup",
    images: ["/thumbnail.png"],
  },
  twitter: {
    card: "summary_large_image",
    title: "Signup | WatchMemo",
    description: "Create your WatchMemo account.",
    images: ["/thumbnail.png"],
  },
};

export default function SignupPage() {
  return <SignupForm />;
}
