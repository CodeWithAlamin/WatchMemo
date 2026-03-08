import type { Metadata } from "next";
import UpdatePasswordForm from "./update-password-form";

export const metadata: Metadata = {
  title: "Set new password",
  description: "Set a new password for your WatchMemo account.",
  alternates: {
    canonical: "/auth/update-password",
  },
};

export default function UpdatePasswordPage() {
  return <UpdatePasswordForm />;
}
