"use client";

import { useAuth } from "@/hooks/useAuth";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import Link from "next/link";

export default function AdminPage() {
  return (
    <ProtectedRoute requireAdmin>
      <AdminContent />
    </ProtectedRoute>
  );
}

function AdminContent() {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold text-gray-900">
                OrgSend Admin
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                href="/profile"
                className="text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md"
              >
                My Profile
              </Link>
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

      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900">Admin Dashboard</h2>
          <p className="text-gray-600">Manage users and system settings</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg
                    className="h-6 w-6 text-blue-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"
                    />
                  </svg>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Total Users
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      Loading...
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg
                    className="h-6 w-6 text-green-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Verified Emails
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      Loading...
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg
                    className="h-6 w-6 text-yellow-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"
                    />
                  </svg>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Phone Verified
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      Pending SMS Setup
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
            <div>
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                User Management
              </h3>
              <p className="mt-1 max-w-2xl text-sm text-gray-500">
                View and manage user accounts and verification status
              </p>
            </div>
            <Link
              href="/admin/users"
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
            >
              Manage Users
            </Link>
          </div>
        </div>

        <div className="mt-8 bg-white shadow overflow-hidden sm:rounded-md">
          <div className="px-4 py-5 sm:px-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              System Status
            </h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">
              Current status of integrated services
            </p>
          </div>
          <div className="border-t border-gray-200">
            <dl>
              <div className="bg-gray-50 px-4 py-5 sm:px-6">
                <div className="flex items-center justify-between">
                  <dt className="text-sm font-medium text-gray-500">
                    Email Service
                  </dt>
                  <dd className="flex items-center text-sm text-gray-900">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full mr-2"></div>
                    Console Logging (SMTP Pending)
                  </dd>
                </div>
              </div>
              <div className="bg-white px-4 py-5 sm:px-6">
                <div className="flex items-center justify-between">
                  <dt className="text-sm font-medium text-gray-500">
                    SMS Service
                  </dt>
                  <dd className="flex items-center text-sm text-gray-900">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full mr-2"></div>
                    Mock Service (AWS SNS Pending)
                  </dd>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-5 sm:px-6">
                <div className="flex items-center justify-between">
                  <dt className="text-sm font-medium text-gray-500">
                    Database
                  </dt>
                  <dd className="flex items-center text-sm text-gray-900">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                    Connected
                  </dd>
                </div>
              </div>
              <div className="bg-white px-4 py-5 sm:px-6">
                <div className="flex items-center justify-between">
                  <dt className="text-sm font-medium text-gray-500">
                    Encryption
                  </dt>
                  <dd className="flex items-center text-sm text-gray-900">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full mr-2"></div>
                    Manual Implementation (Middleware Pending)
                  </dd>
                </div>
              </div>
            </dl>
          </div>
        </div>
      </div>
    </div>
  );
}
