import type { Metadata } from "next";
import SignUpForm from "./sign-up-form";

export const metadata: Metadata = {
  title: "Sign up",
  description: "Create a WatchMemo account to save ratings and personal movie notes.",
  alternates: {
    canonical: "/auth/sign-up",
  },
  robots: {
    index: false,
    follow: false,
  },
  openGraph: {
    title: "Sign Up | WatchMemo",
    description: "Create your WatchMemo account.",
    url: "/auth/sign-up",
    images: ["/thumbnail.png"],
  },
  twitter: {
    card: "summary_large_image",
    title: "Sign Up | WatchMemo",
    description: "Create your WatchMemo account.",
    images: ["/thumbnail.png"],
  },
};

export default function SignUpPage() {
  return <SignUpForm />;
}
