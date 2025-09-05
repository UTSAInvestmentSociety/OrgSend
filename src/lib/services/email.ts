/**
 * Email service for authentication flows
 * Currently using console logging as placeholder for actual email sending
 * TODO: Implement actual email sending with nodemailer when Gmail SMTP is configured
 */

export interface EmailVerificationData {
  to: string;
  firstName: string;
  token: string;
  baseUrl: string;
}

export interface PasswordResetData {
  to: string;
  firstName: string;
  token: string;
  baseUrl: string;
}

/**
 * Send email verification message
 * Currently logs to console - replace with actual email service
 */
export async function sendVerificationEmail(
  data: EmailVerificationData
): Promise<void> {
  const verificationUrl = `${data.baseUrl}/auth/verify-email?token=${data.token}`;

  // TODO: Replace with actual email service (nodemailer + Gmail SMTP)
  console.log(`
=== EMAIL VERIFICATION ===
To: ${data.to}
Subject: Verify your OrgSend account

Hi ${data.firstName},

Please click the link below to verify your email address:
${verificationUrl}

This link will expire in 24 hours.

If you did not create an account, please ignore this email.

---
OrgSend Team
========================
  `);

  // For now, simulate email sending delay
  await new Promise((resolve) => setTimeout(resolve, 100));
}

/**
 * Send password reset email
 * Currently logs to console - replace with actual email service
 */
export async function sendPasswordResetEmail(
  data: PasswordResetData
): Promise<void> {
  const resetUrl = `${data.baseUrl}/auth/reset-password?token=${data.token}`;

  // TODO: Replace with actual email service (nodemailer + Gmail SMTP)
  console.log(`
=== PASSWORD RESET ===
To: ${data.to}
Subject: Reset your OrgSend password

Hi ${data.firstName},

Click the link below to reset your password:
${resetUrl}

This link will expire in 1 hour.

If you did not request a password reset, please ignore this email.

---
OrgSend Team
===================
  `);

  // For now, simulate email sending delay
  await new Promise((resolve) => setTimeout(resolve, 100));
}

/**
 * Validate email address format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Get base URL for email links
 * Uses NEXTAUTH_URL from environment or defaults to localhost
 */
export function getBaseUrl(): string {
  return process.env.NEXTAUTH_URL || "http://localhost:3001";
}
