/**
 * SMS service for phone verification
 * Currently using mock implementation until AWS SNS toll-free number is approved
 * TODO: Replace with actual AWS SNS integration when toll-free number is ready
 */

export interface PhoneVerificationData {
  phone: string;
  code: string;
  firstName: string;
}

/**
 * Send phone verification SMS
 * Currently mocks the SMS sending - replace with AWS SNS
 */
export async function sendPhoneVerificationSMS(
  data: PhoneVerificationData
): Promise<boolean> {
  // TODO: Replace with actual AWS SNS implementation
  console.log(`
=== SMS VERIFICATION (MOCK) ===
To: ${data.phone}
Message: Hi ${data.firstName}! Your OrgSend verification code is: ${data.code}

This code expires in 10 minutes. Reply STOP to opt out.
===============================
  `);

  // Simulate SMS service delay
  await new Promise((resolve) => setTimeout(resolve, 200));

  // Mock success (in real implementation, check AWS SNS response)
  return true;
}

/**
 * Generate 6-digit verification code
 */
export function generateVerificationCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

/**
 * Validate US phone number format
 */
export function isValidUSPhoneNumber(phone: string): boolean {
  const phoneRegex = /^\+1[0-9]{10}$/;
  return phoneRegex.test(phone);
}

/**
 * Format phone number for display (e.g., +11234567890 -> +1 (123) 456-7890)
 */
export function formatPhoneNumber(phone: string): string {
  if (!isValidUSPhoneNumber(phone)) {
    return phone;
  }

  const cleaned = phone.replace("+1", "");
  return `+1 (${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
}

/**
 * Check if SMS service is available
 * Returns false until AWS SNS toll-free number is approved
 */
export function isSMSServiceAvailable(): boolean {
  // TODO: Return true when AWS SNS is configured with toll-free number
  return false;
}

/**
 * Get SMS service status for admin dashboard
 */
export function getSMSServiceStatus(): {
  available: boolean;
  provider: string;
  statusMessage: string;
} {
  return {
    available: false,
    provider: "AWS SNS",
    statusMessage: "Toll-free number registration pending (1-7 business days)",
  };
}
