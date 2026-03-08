import type { Metadata } from "next";
import SignUpForm from "./sign-up-form";

export const metadata: Metadata = {
  title: "Sign up",
  description: "Create a WatchMemo account to save ratings and personal movie notes.",
  alternates: {
    canonical: "/auth/sign-up",
  },
};

export default function SignUpPage() {
  return <SignUpForm />;
}
