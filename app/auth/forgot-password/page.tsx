import type { Metadata } from "next";
import ForgotPasswordForm from "./forgot-password-form";

export const metadata: Metadata = {
  title: "Recover password",
  description: "Request a secure password reset link for your WatchMemo account.",
  alternates: {
    canonical: "/auth/forgot-password",
  },
};

export default function ForgotPasswordPage() {
  return <ForgotPasswordForm />;
}
