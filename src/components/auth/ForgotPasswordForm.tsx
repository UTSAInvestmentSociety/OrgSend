"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  resetPasswordSchema,
  type ResetPasswordFormData,
} from "@/lib/validations/auth";
import Link from "next/link";

export function ForgotPasswordForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
    mode: "onChange",
  });

  const onSubmit = async (data: ResetPasswordFormData) => {
    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (response.ok) {
        setSubmitted(true);
      } else {
        // Even on error, we show success to prevent email enumeration
        setSubmitted(true);
      }
    } catch (error) {
      setSubmitted(true); // Still show success for security
    } finally {
      setIsLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="max-w-md mx-auto bg-white p-8 rounded-lg shadow-md">
        <div className="text-center">
          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-6 h-6 text-blue-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
              />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Check Your Email
          </h2>
          <p className="text-gray-600 mb-6">
            If an account with that email exists, you will receive a password
            reset link. Please check your email (or console in development
            mode).
          </p>
          <p className="text-sm text-gray-500 mb-6">
            The reset link will expire in 1 hour.
          </p>
          <Link
            href="/auth/signin"
            className="inline-block bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
          >
            Back to Sign In
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto bg-white p-8 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-center mb-6">Forgot Password</h2>
      <p className="text-gray-600 text-center mb-6">
        Enter your email address and we&apos;ll send you a link to reset your
        password.
      </p>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label
            htmlFor="email"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Email Address
          </label>
          <input
            {...register("email")}
            type="email"
            id="email"
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.email ? "border-red-500" : "border-gray-300"
            }`}
            placeholder="Enter your email address"
          />
          {errors.email && (
            <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>
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
          {isLoading ? "Sending..." : "Send Reset Link"}
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
