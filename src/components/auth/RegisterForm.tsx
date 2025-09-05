"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { registerSchema, type RegisterFormData } from "@/lib/validations/auth";
import Link from "next/link";

export function RegisterForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [submitMessage, setSubmitMessage] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    reset,
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    mode: "onChange",
  });

  const onSubmit = async (data: RegisterFormData) => {
    setIsLoading(true);
    setSubmitMessage(null);

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Registration failed");
      }

      setSubmitMessage({
        type: "success",
        message: result.message,
      });
      reset();
    } catch (error) {
      setSubmitMessage({
        type: "error",
        message: error instanceof Error ? error.message : "Registration failed",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white p-8 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-center mb-6">Create Account</h2>

      {submitMessage && (
        <div
          className={`p-4 mb-6 rounded-md text-sm ${
            submitMessage.type === "success"
              ? "bg-green-50 text-green-800 border border-green-200"
              : "bg-red-50 text-red-800 border border-red-200"
          }`}
        >
          {submitMessage.message}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Name Fields */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label
              htmlFor="firstName"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              First Name *
            </label>
            <input
              {...register("firstName")}
              type="text"
              id="firstName"
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.firstName ? "border-red-500" : "border-gray-300"
              }`}
            />
            {errors.firstName && (
              <p className="text-red-500 text-xs mt-1">
                {errors.firstName.message}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="lastName"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Last Name *
            </label>
            <input
              {...register("lastName")}
              type="text"
              id="lastName"
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.lastName ? "border-red-500" : "border-gray-300"
              }`}
            />
            {errors.lastName && (
              <p className="text-red-500 text-xs mt-1">
                {errors.lastName.message}
              </p>
            )}
          </div>
        </div>

        {/* Email */}
        <div>
          <label
            htmlFor="email"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Email Address *
          </label>
          <input
            {...register("email")}
            type="email"
            id="email"
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.email ? "border-red-500" : "border-gray-300"
            }`}
          />
          {errors.email && (
            <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>
          )}
        </div>

        {/* Phone */}
        <div>
          <label
            htmlFor="phone"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Phone Number *
          </label>
          <input
            {...register("phone")}
            type="tel"
            id="phone"
            placeholder="+1XXXXXXXXXX"
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.phone ? "border-red-500" : "border-gray-300"
            }`}
          />
          {errors.phone && (
            <p className="text-red-500 text-xs mt-1">{errors.phone.message}</p>
          )}
          <p className="text-xs text-gray-500 mt-1">
            Phone will be stored but not verified until SMS service is active
          </p>
        </div>

        {/* User Type */}
        <div>
          <label
            htmlFor="userType"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            User Type *
          </label>
          <select
            {...register("userType")}
            id="userType"
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.userType ? "border-red-500" : "border-gray-300"
            }`}
          >
            <option value="">Select user type...</option>
            <option value="STUDENT">Student</option>
            <option value="ALUMNI">Alumni</option>
            <option value="INDUSTRY_PROFESSIONAL">Industry Professional</option>
          </select>
          {errors.userType && (
            <p className="text-red-500 text-xs mt-1">
              {errors.userType.message}
            </p>
          )}
        </div>

        {/* Communication Preference */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Communication Preference *
          </label>
          <div className="space-y-2">
            <label className="flex items-center">
              <input
                {...register("communicationPreference")}
                type="radio"
                value="EMAIL_ONLY"
                className="mr-2"
              />
              Email Only
            </label>
            <label className="flex items-center">
              <input
                {...register("communicationPreference")}
                type="radio"
                value="SMS_ONLY"
                className="mr-2"
              />
              SMS Only (when available)
            </label>
            <label className="flex items-center">
              <input
                {...register("communicationPreference")}
                type="radio"
                value="BOTH"
                className="mr-2"
              />
              Both Email and SMS
            </label>
          </div>
          {errors.communicationPreference && (
            <p className="text-red-500 text-xs mt-1">
              {errors.communicationPreference.message}
            </p>
          )}
        </div>

        {/* Password Fields */}
        <div>
          <label
            htmlFor="password"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Password *
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
            Confirm Password *
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

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading || !isValid}
          className={`w-full py-2 px-4 rounded-md text-white font-medium ${
            isLoading || !isValid
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          }`}
        >
          {isLoading ? "Creating Account..." : "Create Account"}
        </button>
      </form>

      <div className="mt-6 text-center">
        <p className="text-sm text-gray-600">
          Already have an account?{" "}
          <Link
            href="/auth/signin"
            className="text-blue-600 hover:text-blue-800"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
