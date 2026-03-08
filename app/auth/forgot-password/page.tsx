import type { Metadata } from "next";
import ForgotPasswordForm from "./forgot-password-form";

export const metadata: Metadata = {
  title: "Recover password",
  description: "Request a secure password reset link for your WatchMemo account.",
  alternates: {
    canonical: "/auth/forgot-password",
  },
  robots: {
    index: false,
    follow: false,
  },
  openGraph: {
    title: "Recover Password | WatchMemo",
    description: "Request a password reset link for your WatchMemo account.",
    url: "/auth/forgot-password",
    images: ["/thumbnail.png"],
  },
  twitter: {
    card: "summary_large_image",
    title: "Recover Password | WatchMemo",
    description: "Request a password reset link for your WatchMemo account.",
    images: ["/thumbnail.png"],
  },
};

export default function ForgotPasswordPage() {
  return <ForgotPasswordForm />;
}
