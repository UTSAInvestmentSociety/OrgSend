"use client";

import { useAuth } from "@/hooks/useAuth";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import Link from "next/link";

export default function ProfilePage() {
  return (
    <ProtectedRoute>
      <ProfileContent />
    </ProtectedRoute>
  );
}

function ProfileContent() {
  const { user, logout } = useAuth();

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

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold text-gray-900">OrgSend</h1>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                href="/profile/edit"
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
              >
                Edit Profile
              </Link>
              {user.userType === "ADMIN" && (
                <Link
                  href="/admin"
                  className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors"
                >
                  Admin Dashboard
                </Link>
              )}
              <button
                onClick={logout}
                className="text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Profile</h2>
              <p className="text-gray-600">
                Manage your account information and preferences
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Personal Information
                </h3>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      First Name
                    </label>
                    <div className="mt-1 text-sm text-gray-900">
                      {user.firstName}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Last Name
                    </label>
                    <div className="mt-1 text-sm text-gray-900">
                      {user.lastName}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Email
                    </label>
                    <div className="mt-1 text-sm text-gray-900">
                      {user.email}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      User Type
                    </label>
                    <div className="mt-1 text-sm text-gray-900">
                      {user.userType === "MEMBER"
                        ? "Member"
                        : user.userType === "ADMIN"
                          ? "Administrator"
                          : user.userType === "OFFICER"
                            ? "Officer"
                            : user.userType}
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Account Status
                </h3>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Email Verification
                    </label>
                    <div className="mt-1 flex items-center">
                      <div
                        className={`w-2 h-2 rounded-full mr-2 ${
                          user.emailVerified ? "bg-green-500" : "bg-red-500"
                        }`}
                      ></div>
                      <span className="text-sm text-gray-900">
                        {user.emailVerified ? "Verified" : "Not Verified"}
                      </span>
                      {!user.emailVerified && (
                        <button className="ml-2 text-blue-600 hover:text-blue-800 text-sm">
                          Resend Verification
                        </button>
                      )}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Phone Verification
                    </label>
                    <div className="mt-1 flex items-center">
                      <div
                        className={`w-2 h-2 rounded-full mr-2 ${
                          user.phoneVerified ? "bg-green-500" : "bg-yellow-500"
                        }`}
                      ></div>
                      <span className="text-sm text-gray-900">
                        {user.phoneVerified
                          ? "Verified"
                          : "Pending SMS Service Setup"}
                      </span>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Communication Preference
                    </label>
                    <div className="mt-1 text-sm text-gray-900">
                      {user.communicationPreference === "EMAIL_ONLY"
                        ? "Email Only"
                        : user.communicationPreference === "SMS_ONLY"
                          ? "SMS Only"
                          : user.communicationPreference === "BOTH"
                            ? "Email & SMS"
                            : user.communicationPreference}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-gray-200">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Account Actions
              </h3>
              <div className="flex space-x-4">
                <Link
                  href="/profile/change-password"
                  className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 transition-colors"
                >
                  Change Password
                </Link>
                <Link
                  href="/profile/edit"
                  className="border border-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-50 transition-colors"
                >
                  Edit Profile
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
