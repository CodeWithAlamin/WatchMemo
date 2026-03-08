import type { Metadata } from "next";
import UpdatePasswordForm from "./update-password-form";

export const metadata: Metadata = {
  title: "Set new password",
  description: "Set a new password for your WatchMemo account.",
  alternates: {
    canonical: "/auth/update-password",
  },
  robots: {
    index: false,
    follow: false,
  },
  openGraph: {
    title: "Set New Password | WatchMemo",
    description: "Set a new password for your WatchMemo account.",
    url: "/auth/update-password",
    images: ["/thumbnail.png"],
  },
  twitter: {
    card: "summary_large_image",
    title: "Set New Password | WatchMemo",
    description: "Set a new password for your WatchMemo account.",
    images: ["/thumbnail.png"],
  },
};

export default function UpdatePasswordPage() {
  return <UpdatePasswordForm />;
}
