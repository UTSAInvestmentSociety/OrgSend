"use client";

import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  userType: string;
  emailVerified: boolean;
  phoneVerified: boolean;
  communicationPreference: string;
}

export function useAuth() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const logout = async () => {
    await signOut({ redirect: true, callbackUrl: "/auth/signin" });
  };

  const requireAuth = () => {
    if (status === "unauthenticated") {
      router.push("/auth/signin");
      return false;
    }
    return true;
  };

  const requireAdmin = () => {
    if (status === "unauthenticated") {
      router.push("/auth/signin");
      return false;
    }

    if (session?.user?.userType !== "ADMIN") {
      router.push("/");
      return false;
    }

    return true;
  };

  return {
    user: session?.user as User | undefined,
    session,
    status,
    loading: status === "loading",
    authenticated: status === "authenticated",
    logout,
    requireAuth,
    requireAdmin,
  };
}
