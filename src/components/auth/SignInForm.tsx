"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema, type LoginFormData } from "@/lib/validations/auth";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

export function SignInForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    mode: "onChange",
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await signIn("credentials", {
        email: data.email,
        password: data.password,
        redirect: false,
      });

      if (result?.error) {
        setError("Invalid email or password");
      } else if (result?.ok) {
        const callbackUrl = searchParams?.get("callbackUrl") || "/dashboard";
        router.push(callbackUrl as any);
      }
    } catch (error) {
      setError("An error occurred during sign in");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white p-8 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-center mb-6">Sign In</h2>

      {error && (
        <div className="p-4 mb-6 rounded-md text-sm bg-red-50 text-red-800 border border-red-200">
          {error}
        </div>
      )}

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
          />
          {errors.email && (
            <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>
          )}
        </div>

        <div>
          <label
            htmlFor="password"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Password
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

        <button
          type="submit"
          disabled={isLoading || !isValid}
          className={`w-full py-2 px-4 rounded-md text-white font-medium ${
            isLoading || !isValid
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          }`}
        >
          {isLoading ? "Signing In..." : "Sign In"}
        </button>
      </form>

      <div className="mt-6 text-center space-y-2">
        <Link
          href="/auth/forgot-password"
          className="block text-sm text-blue-600 hover:text-blue-800"
        >
          Forgot your password?
        </Link>
        <p className="text-sm text-gray-600">
          Don&apos;t have an account?{" "}
          <Link
            href="/auth/signup"
            className="text-blue-600 hover:text-blue-800"
          >
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
