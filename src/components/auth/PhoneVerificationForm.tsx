"use client";

import { useState } from "react";
import {
  formatPhoneNumber,
  isSMSServiceAvailable,
  getSMSServiceStatus,
} from "@/lib/services/sms";

interface PhoneVerificationFormProps {
  phoneNumber: string;
  isVerified: boolean;
  onVerificationComplete: () => void;
}

export function PhoneVerificationForm({
  phoneNumber,
  isVerified,
  onVerificationComplete,
}: PhoneVerificationFormProps) {
  const [step, setStep] = useState<"request" | "verify">("request");
  const [code, setCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [timeLeft, setTimeLeft] = useState(0);

  const smsStatus = getSMSServiceStatus();
  const isServiceAvailable = isSMSServiceAvailable();

  const startCountdown = (seconds: number) => {
    setTimeLeft(seconds);
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleSendCode = async () => {
    setIsLoading(true);
    setMessage(null);

    try {
      const response = await fetch("/api/auth/send-phone-verification", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const result = await response.json();

      if (result.success) {
        setMessage({ type: "success", text: result.message });
        if (result.expiresIn) {
          startCountdown(result.expiresIn);
        }
        setStep("verify");
      } else {
        setMessage({
          type: "error",
          text: result.message || "Failed to send verification code",
        });
      }
    } catch (error) {
      setMessage({
        type: "error",
        text: "An error occurred. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyCode = async () => {
    if (code.length !== 6) {
      setMessage({ type: "error", text: "Please enter a 6-digit code" });
      return;
    }

    setIsLoading(true);
    setMessage(null);

    try {
      const response = await fetch("/api/auth/verify-phone", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ code }),
      });

      const result = await response.json();

      if (result.success) {
        setMessage({ type: "success", text: result.message });
        onVerificationComplete();
      } else {
        setMessage({ type: "error", text: result.error });
      }
    } catch (error) {
      setMessage({
        type: "error",
        text: "An error occurred. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  if (isVerified) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-md p-4">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <svg
              className="h-5 w-5 text-green-400"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <div className="ml-3">
            <p className="text-sm font-medium text-green-800">
              Phone number verified: {formatPhoneNumber(phoneNumber)}
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!isServiceAvailable) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <svg
              className="h-5 w-5 text-yellow-400"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-yellow-800">
              SMS Verification Temporarily Unavailable
            </h3>
            <div className="mt-2 text-sm text-yellow-700">
              <p>Phone: {formatPhoneNumber(phoneNumber)}</p>
              <p className="mt-1">
                <strong>Status:</strong> {smsStatus.statusMessage}
              </p>
              <p className="mt-1">
                Your phone number has been saved and will be automatically
                verified once our SMS service is active.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-md p-4">
      <h3 className="text-lg font-medium text-gray-900 mb-4">
        Phone Verification
      </h3>

      <div className="mb-4">
        <p className="text-sm text-gray-600">
          Phone: {formatPhoneNumber(phoneNumber)}
        </p>
      </div>

      {message && (
        <div
          className={`p-3 mb-4 rounded-md text-sm ${
            message.type === "success"
              ? "bg-green-50 text-green-800 border border-green-200"
              : "bg-red-50 text-red-800 border border-red-200"
          }`}
        >
          {message.text}
        </div>
      )}

      {step === "request" && (
        <div>
          <p className="text-sm text-gray-600 mb-4">
            Click the button below to receive a 6-digit verification code via
            SMS.
          </p>
          <button
            onClick={handleSendCode}
            disabled={isLoading}
            className={`w-full py-2 px-4 rounded-md text-white font-medium ${
              isLoading
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            }`}
          >
            {isLoading ? "Sending..." : "Send Verification Code"}
          </button>
        </div>
      )}

      {step === "verify" && (
        <div>
          <label
            htmlFor="code"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Enter 6-digit verification code
          </label>
          <input
            type="text"
            id="code"
            value={code}
            onChange={(e) =>
              setCode(e.target.value.replace(/\D/g, "").slice(0, 6))
            }
            placeholder="123456"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
            maxLength={6}
          />

          {timeLeft > 0 && (
            <p className="text-sm text-gray-500 mb-4">
              Code expires in: {formatTime(timeLeft)}
            </p>
          )}

          <div className="space-y-2">
            <button
              onClick={handleVerifyCode}
              disabled={isLoading || code.length !== 6}
              className={`w-full py-2 px-4 rounded-md text-white font-medium ${
                isLoading || code.length !== 6
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
              }`}
            >
              {isLoading ? "Verifying..." : "Verify Code"}
            </button>

            <button
              onClick={() => {
                setStep("request");
                setCode("");
                setMessage(null);
                setTimeLeft(0);
              }}
              className="w-full py-2 px-4 rounded-md text-gray-700 font-medium border border-gray-300 hover:bg-gray-50"
            >
              Request New Code
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
