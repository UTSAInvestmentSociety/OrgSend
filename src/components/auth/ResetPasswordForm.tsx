"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  newPasswordSchema,
  type NewPasswordFormData,
} from "@/lib/validations/auth";
import Link from "next/link";

interface ResetPasswordFormProps {
  token: string;
}

export function ResetPasswordForm({ token }: ResetPasswordFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<NewPasswordFormData>({
    resolver: zodResolver(newPasswordSchema),
    mode: "onChange",
  });

  const onSubmit = async (data: NewPasswordFormData) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          token,
          password: data.password,
          confirmPassword: data.confirmPassword,
        }),
      });

      const result = await response.json();

      if (response.ok) {
        setSuccess(true);
      } else {
        setError(result.error || "Password reset failed");
      }
    } catch (error) {
      setError("An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
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
            Password Reset Complete
          </h2>
          <p className="text-gray-600 mb-6">
            Your password has been successfully reset. You can now sign in with
            your new password.
          </p>
          <Link
            href="/auth/signin"
            className="inline-block bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
          >
            Sign In
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto bg-white p-8 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-center mb-6">Reset Password</h2>
      <p className="text-gray-600 text-center mb-6">
        Enter your new password below.
      </p>

      {error && (
        <div className="p-4 mb-6 rounded-md text-sm bg-red-50 text-red-800 border border-red-200">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label
            htmlFor="password"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            New Password
          </label>
          <input
            {...register("password")}
            type="password"
            id="password"
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.password ? "border-red-500" : "border-gray-300"
            }`}
          />
          {errors.password && (
            <p className="text-red-500 text-xs mt-1">
              {errors.password.message}
            </p>
          )}
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
              errors.confirmPassword ? "border-red-500" : "border-gray-300"
            }`}
          />
          {errors.confirmPassword && (
            <p className="text-red-500 text-xs mt-1">
              {errors.confirmPassword.message}
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={isLoading || !isValid}
          className={`w-full py-2 px-4 rounded-md text-white font-medium ${
            isLoading || !isValid
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          }`}
        >
          {isLoading ? "Resetting..." : "Reset Password"}
        </button>
      </form>

      <div className="mt-6 text-center">
        <Link
          href="/auth/signin"
          className="text-sm text-blue-600 hover:text-blue-800"
        >
          Back to Sign In
        </Link>
      </div>
    </div>
  );
}
