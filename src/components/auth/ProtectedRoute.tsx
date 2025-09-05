"use client";

import { useAuth } from "@/hooks/useAuth";
import { ReactNode } from "react";

interface ProtectedRouteProps {
  children: ReactNode;
  requireAdmin?: boolean;
  fallback?: ReactNode;
}

export function ProtectedRoute({
  children,
  requireAdmin = false,
  fallback = (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-2 text-gray-600">Loading...</p>
      </div>
    </div>
  ),
}: ProtectedRouteProps) {
  const {
    authenticated,
    loading,
    requireAuth,
    requireAdmin: checkAdmin,
  } = useAuth();

  if (loading) {
    return <>{fallback}</>;
  }

  if (requireAdmin) {
    if (!checkAdmin()) {
      return null; // Redirect is handled by useAuth
    }
  } else {
    if (!requireAuth()) {
      return null; // Redirect is handled by useAuth
    }
  }

  if (!authenticated) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}
