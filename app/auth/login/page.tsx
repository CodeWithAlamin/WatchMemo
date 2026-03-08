import type { Metadata } from "next";
import SignInForm from "../sign-in/sign-in-form";

export const metadata: Metadata = {
  title: "Login",
  description: "Log in to WatchMemo to manage your personal watch history.",
  alternates: {
    canonical: "/auth/login",
  },
};

export default function LoginPage() {
  return <SignInForm />;
}
