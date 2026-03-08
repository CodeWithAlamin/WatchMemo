import type { Metadata } from "next";
import ProfileClient from "./profile-client";

export const metadata: Metadata = {
  title: "Profile",
  description: "Manage your WatchMemo profile, display name, and password.",
  alternates: {
    canonical: "/profile",
  },
  robots: {
    index: false,
    follow: false,
  },
  openGraph: {
    title: "Profile | WatchMemo",
    description: "Manage your WatchMemo profile settings.",
    url: "/profile",
    images: ["/thumbnail.png"],
  },
  twitter: {
    card: "summary_large_image",
    title: "Profile | WatchMemo",
    description: "Manage your WatchMemo profile settings.",
    images: ["/thumbnail.png"],
  },
};

export default function ProfilePage() {
  return <ProfileClient />;
}
