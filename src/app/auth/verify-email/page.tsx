"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";

export default function VerifyEmailPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading"
  );
  const [message, setMessage] = useState("");

  useEffect(() => {
    const token = searchParams?.get("token");

    if (!token) {
      setStatus("error");
      setMessage("No verification token provided");
      return;
    }

    verifyEmail(token);
  }, [searchParams]);

  const verifyEmail = async (token: string) => {
    try {
      const response = await fetch("/api/auth/verify-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ token }),
      });

      const result = await response.json();

      if (response.ok) {
        setStatus("success");
        setMessage(result.message);
      } else {
        setStatus("error");
        setMessage(result.error || "Verification failed");
      }
    } catch (error) {
      setStatus("error");
      setMessage("An error occurred during verification");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto bg-white p-8 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold text-center mb-6">
          Email Verification
        </h2>

        {status === "loading" && (
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Verifying your email...</p>
          </div>
        )}

        {status === "success" && (
          <div className="text-center">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-6 h-6 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <p className="text-green-800 mb-6">{message}</p>
            <Link
              href="/auth/signin"
              className="w-full inline-block bg-blue-600 text-white py-2 px-4 rounded-md text-center hover:bg-blue-700 transition-colors"
            >
              Sign In Now
            </Link>
          </div>
        )}

        {status === "error" && (
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
            <p className="text-red-800 mb-6">{message}</p>
            <div className="space-y-3">
              <Link
                href="/auth/signup"
                className="w-full inline-block bg-blue-600 text-white py-2 px-4 rounded-md text-center hover:bg-blue-700 transition-colors"
              >
                Create New Account
              </Link>
              <Link
                href="/auth/signin"
                className="block text-sm text-blue-600 hover:text-blue-800"
              >
                Back to Sign In
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
