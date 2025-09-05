"use client";

import { useSearchParams } from "next/navigation";
import { ResetPasswordForm } from "@/components/auth/ResetPasswordForm";
import Link from "next/link";

export default function ResetPasswordPage() {
  const searchParams = useSearchParams();
  const token = searchParams?.get("token");

  if (!token) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md mx-auto bg-white p-8 rounded-lg shadow-md">
          <div className="text-center">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-6 h-6 text-red-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Invalid Reset Link
            </h2>
            <p className="text-gray-600 mb-6">
              This password reset link is invalid or missing. Please request a
              new one.
            </p>
            <Link
              href="/auth/forgot-password"
              className="inline-block bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
            >
              Request New Reset Link
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <ResetPasswordForm token={token} />
    </div>
  );
}
