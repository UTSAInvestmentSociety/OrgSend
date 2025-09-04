// Utility functions for OrgSend platform

import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Utility function to merge Tailwind CSS classes
 * Combines clsx and tailwind-merge for optimal class handling
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format phone number to US format (+1XXXXXXXXXX)
 */
export function formatPhoneNumber(phone: string): string {
  const cleaned = phone.replace(/\D/g, "");
  if (cleaned.length === 10) {
    return `+1${cleaned}`;
  }
  if (cleaned.length === 11 && cleaned.startsWith("1")) {
    return `+${cleaned}`;
  }
  return phone;
}

/**
 * Validate US phone number format
 */
export function isValidPhoneNumber(phone: string): boolean {
  const phoneRegex = /^\+1[0-9]{10}$/;
  return phoneRegex.test(phone);
}

/**
 * Generate organization code (8 characters, alphanumeric, uppercase)
 */
export function generateOrgCode(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let result = "";
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}
