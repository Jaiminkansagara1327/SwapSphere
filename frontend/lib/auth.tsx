"use client";

import { useUser, useAuth as useClerkAuth } from "@clerk/nextjs";

export function useAuth() {
  const { user, isLoaded } = useUser();
  const { signOut } = useClerkAuth();

  return {
    user: user ? { id: user.id, email: user.primaryEmailAddress?.emailAddress } : null,
    profile: user
      ? {
          id: user.id,
          username: user.username || user.firstName || "user",
          full_name: user.fullName || null,
          avatar_url: user.imageUrl || null,
          updated_at: user.updatedAt ? new Date(user.updatedAt).toISOString() : null,
        }
      : null,
    loading: !isLoaded,
    signOut: async () => {
      await signOut();
    },
    refreshProfile: async () => {},
  };
}
