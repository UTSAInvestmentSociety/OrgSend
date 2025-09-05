"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "@/hooks/useAuth";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import Link from "next/link";
import { useRouter } from "next/navigation";

const editProfileSchema = z.object({
  firstName: z
    .string()
    .min(2, "First name must be at least 2 characters")
    .max(50),
  lastName: z
    .string()
    .min(2, "Last name must be at least 2 characters")
    .max(50),
  communicationPreference: z.enum(["EMAIL_ONLY", "SMS_ONLY", "BOTH"]),
});

type EditProfileFormData = z.infer<typeof editProfileSchema>;

export default function EditProfilePage() {
  return (
    <ProtectedRoute>
      <EditProfileContent />
    </ProtectedRoute>
  );
}

function EditProfileContent() {
  const { user } = useAuth();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<EditProfileFormData>({
    resolver: zodResolver(editProfileSchema),
    mode: "onChange",
    defaultValues: {
      firstName: user?.firstName || "",
      lastName: user?.lastName || "",
      communicationPreference:
        (user?.communicationPreference as any) || "EMAIL_ONLY",
    },
  });

  const onSubmit = async (data: EditProfileFormData) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/auth/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (response.ok) {
        setSuccess(true);
        setTimeout(() => {
          router.push("/profile");
        }, 2000);
      } else {
        setError(result.error || "Failed to update profile");
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
          <p className="mt-2 text-gray-600">Loading profile...</p>
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
              Profile Updated
            </h2>
            <p className="text-gray-600 mb-6">
              Your profile has been successfully updated. Redirecting to
              profile...
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
              <h2 className="text-2xl font-bold text-gray-900">Edit Profile</h2>
              <p className="text-gray-600">
                Update your personal information and preferences
              </p>
            </div>

            {error && (
              <div className="p-4 mb-6 rounded-md text-sm bg-red-50 text-red-800 border border-red-200">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label
                    htmlFor="firstName"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    First Name
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
                    Last Name
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

              <div>
                <label
                  htmlFor="communicationPreference"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Communication Preference
                </label>
                <select
                  {...register("communicationPreference")}
                  id="communicationPreference"
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.communicationPreference
                      ? "border-red-500"
                      : "border-gray-300"
                  }`}
                >
                  <option value="EMAIL_ONLY">Email Only</option>
                  <option value="SMS_ONLY">SMS Only (when available)</option>
                  <option value="BOTH">Both Email & SMS</option>
                </select>
                {errors.communicationPreference && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.communicationPreference.message}
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
                  {isLoading ? "Updating..." : "Update Profile"}
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
