/**
 * Custom database types that provide plain field interfaces
 * These override Prisma types to allow using plain field names with encryption middleware
 */

import type {
  User as PrismaUser,
  Organization as PrismaOrganization,
  StudentInfo as PrismaStudentInfo,
  AlumniInfo as PrismaAlumniInfo,
  IndustryProfessionalInfo as PrismaIndustryProfessionalInfo,
  OrgFollow as PrismaOrgFollow,
  Message as PrismaMessage,
  MessageDelivery as PrismaMessageDelivery,
  Subgroup as PrismaSubgroup,
  UserSubgroup as PrismaUserSubgroup,
  OrgCredit as PrismaOrgCredit,
  CreditTransaction as PrismaCreditTransaction,
  SmsOptOut as PrismaSmsOptOut,
  SystemConfig as PrismaSystemConfig,
  UserRole,
  UserType,
  CommunicationPreference,
  FollowStatus,
  MessageType,
  DeliveryStatus,
  TransactionType,
  StudentClassification,
  GraduationTerm,
  Industry,
} from "../generated/prisma";

// User type with plain field names for use with encryption middleware
export interface User
  extends Omit<
    PrismaUser,
    | "firstName_encrypted"
    | "firstName_hash"
    | "lastName_encrypted"
    | "lastName_hash"
    | "email_encrypted"
    | "email_hash"
    | "phone_encrypted"
    | "phone_hash"
    | "phoneVerificationCode_encrypted"
    | "phoneVerificationCode_hash"
  > {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string | null;
  phoneVerificationCode?: string | null;
}

// User creation input with plain field names
export interface UserCreateInput {
  id?: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string | null;
  userType?: UserType | null;
  role?: UserRole;
  communicationPreference?: CommunicationPreference;
  passwordHash?: string | null;
  emailVerified?: boolean;
  phoneVerified?: boolean;
  isActive?: boolean;
}

// User update input with plain field names
export interface UserUpdateInput {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string | null;
  userType?: UserType | null;
  role?: UserRole;
  communicationPreference?: CommunicationPreference;
  passwordHash?: string | null;
  emailVerified?: boolean;
  phoneVerified?: boolean;
  isActive?: boolean;
}

// StudentInfo type with plain field names
export interface StudentInfo
  extends Omit<
    PrismaStudentInfo,
    | "studentId_encrypted"
    | "studentId_hash"
    | "major_encrypted"
    | "major_hash"
    | "minor_encrypted"
    | "minor_hash"
    | "degreeProgram_encrypted"
    | "degreeProgram_hash"
  > {
  studentId?: string | null;
  major?: string | null;
  minor?: string | null;
  degreeProgram?: string | null;
}

// StudentInfo creation input with plain field names
export interface StudentInfoCreateInput {
  id?: string;
  userId: string;
  studentId?: string | null;
  major?: string | null;
  minor?: string | null;
  degreeProgram?: string | null;
  classification?: StudentClassification | null;
  graduationYear?: number | null;
  graduationTerm?: GraduationTerm | null;
  gpa?: number | null;
}

// AlumniInfo type with plain field names
export interface AlumniInfo
  extends Omit<
    PrismaAlumniInfo,
    | "degreeObtained_encrypted"
    | "degreeObtained_hash"
    | "currentEmployer_encrypted"
    | "currentEmployer_hash"
    | "jobTitle_encrypted"
    | "jobTitle_hash"
    | "linkedInUrl_encrypted"
    | "linkedInUrl_hash"
  > {
  degreeObtained?: string | null;
  currentEmployer?: string | null;
  jobTitle?: string | null;
  linkedInUrl?: string | null;
}

// AlumniInfo creation input with plain field names
export interface AlumniInfoCreateInput {
  id?: string;
  userId: string;
  graduationYear: number;
  graduationTerm?: GraduationTerm | null;
  degreeObtained?: string | null;
  currentEmployer?: string | null;
  jobTitle?: string | null;
  linkedInUrl?: string | null;
}

// IndustryProfessionalInfo type with plain field names
export interface IndustryProfessionalInfo
  extends Omit<
    PrismaIndustryProfessionalInfo,
    | "companyName_encrypted"
    | "companyName_hash"
    | "jobTitle_encrypted"
    | "jobTitle_hash"
    | "linkedInUrl_encrypted"
    | "linkedInUrl_hash"
  > {
  companyName?: string | null;
  jobTitle?: string | null;
  linkedInUrl?: string | null;
}

// IndustryProfessionalInfo creation input with plain field names
export interface IndustryProfessionalInfoCreateInput {
  id?: string;
  userId: string;
  companyName?: string | null;
  jobTitle?: string | null;
  industry?: Industry | null;
  yearsOfExperience?: number | null;
  linkedInUrl?: string | null;
}

// Re-export other types that don't need field name changes
export type Organization = PrismaOrganization;
export type OrgFollow = PrismaOrgFollow;
export type Message = PrismaMessage;
export type MessageDelivery = PrismaMessageDelivery;
export type Subgroup = PrismaSubgroup;
export type UserSubgroup = PrismaUserSubgroup;
export type OrgCredit = PrismaOrgCredit;
export type CreditTransaction = PrismaCreditTransaction;
export type SmsOptOut = PrismaSmsOptOut;
export type SystemConfig = PrismaSystemConfig;

// Re-export all enums (as values, not types)
export {
  UserRole,
  UserType,
  CommunicationPreference,
  FollowStatus,
  MessageType,
  DeliveryStatus,
  TransactionType,
  StudentClassification,
  GraduationTerm,
  Industry,
} from "../generated/prisma";

// Organization creation input
export interface OrganizationCreateInput {
  id?: string;
  name: string;
  description?: string | null;
  code: string;
  adminId: string;
  isActive?: boolean;
  allowFollows?: boolean;
  requireApproval?: boolean;
  smsCreditsAvailable?: number;
}
