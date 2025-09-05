"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "@/hooks/useAuth";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import Link from "next/link";
import { useRouter } from "next/navigation";

const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        "Password must contain at least one uppercase letter, one lowercase letter, and one number"
      ),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

type ChangePasswordFormData = z.infer<typeof changePasswordSchema>;

export default function ChangePasswordPage() {
  return (
    <ProtectedRoute>
      <ChangePasswordContent />
    </ProtectedRoute>
  );
}

function ChangePasswordContent() {
  const { user } = useAuth();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<ChangePasswordFormData>({
    resolver: zodResolver(changePasswordSchema),
    mode: "onChange",
  });

  const onSubmit = async (data: ChangePasswordFormData) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          currentPassword: data.currentPassword,
          newPassword: data.newPassword,
        }),
      });

      const result = await response.json();

      if (response.ok) {
        setSuccess(true);
        setTimeout(() => {
          router.push("/profile");
        }, 3000);
      } else {
        setError(result.error || "Failed to change password");
      }
    } catch (error) {
      setError("An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md mx-auto bg-white p-8 rounded-lg shadow-md">
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
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Password Changed
            </h2>
            <p className="text-gray-600 mb-6">
              Your password has been successfully changed. You will be
              redirected to your profile.
            </p>
            <p className="text-sm text-gray-500">
              For security, you may need to sign in again on other devices.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link
                href="/profile"
                className="text-xl font-semibold text-gray-900"
              >
                OrgSend
              </Link>
            </div>
            <div className="flex items-center">
              <Link
                href="/profile"
                className="text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md"
              >
                Back to Profile
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-2xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900">
                Change Password
              </h2>
              <p className="text-gray-600">
                Update your password to keep your account secure
              </p>
            </div>

            {error && (
              <div className="p-4 mb-6 rounded-md text-sm bg-red-50 text-red-800 border border-red-200">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div>
                <label
                  htmlFor="currentPassword"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Current Password
                </label>
                <input
                  {...register("currentPassword")}
                  type="password"
                  id="currentPassword"
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.currentPassword
                      ? "border-red-500"
                      : "border-gray-300"
                  }`}
                />
                {errors.currentPassword && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.currentPassword.message}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="newPassword"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  New Password
                </label>
                <input
                  {...register("newPassword")}
                  type="password"
                  id="newPassword"
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.newPassword ? "border-red-500" : "border-gray-300"
                  }`}
                />
                {errors.newPassword && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.newPassword.message}
                  </p>
                )}
                <p className="text-xs text-gray-500 mt-1">
                  Must be at least 8 characters with uppercase, lowercase, and
                  number
                </p>
              </div>

              <div>
                <label
                  htmlFor="confirmPassword"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Confirm New Password
                </label>
                <input
                  {...register("confirmPassword")}
                  type="password"
                  id="confirmPassword"
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.confirmPassword
                      ? "border-red-500"
                      : "border-gray-300"
                  }`}
                />
                {errors.confirmPassword && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.confirmPassword.message}
                  </p>
                )}
              </div>

              <div className="pt-4 flex space-x-4">
                <button
                  type="submit"
                  disabled={isLoading || !isValid}
                  className={`flex-1 py-2 px-4 rounded-md text-white font-medium ${
                    isLoading || !isValid
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  }`}
                >
                  {isLoading ? "Changing Password..." : "Change Password"}
                </button>
                <Link
                  href="/profile"
                  className="flex-1 py-2 px-4 rounded-md text-center border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </Link>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
