import type { User } from "@supabase/supabase-js";

export function getDisplayName(user: User | null): string {
  if (!user) return "Guest";

  const value = user.user_metadata?.display_name;
  if (typeof value === "string" && value.trim().length > 0) {
    return value.trim();
  }

  if (user.email) {
    return user.email.split("@")[0] || "User";
  }

  return "User";
}

export function getAvatarInitial(user: User | null): string {
  const displayName = getDisplayName(user);
  return displayName.charAt(0).toUpperCase() || "U";
}
