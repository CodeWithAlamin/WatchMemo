import { redirect } from "next/navigation";

export default function SignInRedirectPage() {
  redirect("/auth/login");
}
