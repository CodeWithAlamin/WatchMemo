import type { Metadata } from "next";
import LoginForm from "./login-form";

export const metadata: Metadata = {
  title: "Login",
  description: "Log in to WatchMemo to manage your personal watch history.",
  alternates: {
    canonical: "/auth/login",
  },
  robots: {
    index: false,
    follow: false,
  },
  openGraph: {
    title: "Login | WatchMemo",
    description: "Log in to your WatchMemo account.",
    url: "/auth/login",
    images: ["/thumbnail.png"],
  },
  twitter: {
    card: "summary_large_image",
    title: "Login | WatchMemo",
    description: "Log in to your WatchMemo account.",
    images: ["/thumbnail.png"],
  },
};

export default function LoginPage() {
  return <LoginForm />;
}
