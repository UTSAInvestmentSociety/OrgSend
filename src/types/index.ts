// Global TypeScript type definitions for OrgSend platform

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  communicationPreference: "EMAIL_ONLY" | "SMS_ONLY" | "BOTH";
  phoneVerified: boolean;
  emailVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Organization {
  id: string;
  name: string;
  code: string;
  description?: string;
  adminId: string;
  smsCredits: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Message {
  id: string;
  organizationId: string;
  content: string;
  type: "EMAIL" | "SMS";
  recipientCount: number;
  sentAt: Date;
  createdBy: string;
}

// Form validation types
export interface UserFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  communicationPreference: "EMAIL_ONLY" | "SMS_ONLY" | "BOTH";
}
