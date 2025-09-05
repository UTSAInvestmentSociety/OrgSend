/**
 * TypeScript interfaces and types for encryption system
 * Supports AES-256-GCM encryption with AWS Secrets Manager
 */

export interface EncryptionResult {
  encrypted: string;
  iv: string;
  authTag: string;
}

export interface DecryptionInput {
  encrypted: string;
  iv: string;
  authTag: string;
}

export interface EncryptionKey {
  key: Buffer;
  keyId: string;
  version: number;
}

export interface HashResult {
  hash: string;
  algorithm: "sha256";
}

// AWS Secrets Manager configuration
export interface SecretsManagerConfig {
  region: string;
  accessKeyId?: string;
  secretAccessKey?: string;
}

// Encryption key paths in AWS Secrets Manager
export const ENCRYPTION_KEY_PATHS = {
  NAMES: "/app/encryption/names-key",
  PHONE: "/app/encryption/phone-key",
  EMAIL: "/app/encryption/email-key",
  ACADEMIC: "/app/encryption/academic-key", // For majors, minors, student IDs
  PROFESSIONAL: "/app/encryption/professional-key", // For employers, job titles, LinkedIn URLs
} as const;

export type EncryptionKeyPath =
  (typeof ENCRYPTION_KEY_PATHS)[keyof typeof ENCRYPTION_KEY_PATHS];

// Field mapping for encrypted data patterns
export interface EncryptedFieldMapping {
  plainField: string;
  encryptedField: string;
  hashField: string;
  keyPath: EncryptionKeyPath;
}

// Supported PII field mappings
export const PII_FIELD_MAPPINGS: Record<string, EncryptedFieldMapping> = {
  firstName: {
    plainField: "firstName",
    encryptedField: "firstName_encrypted",
    hashField: "firstName_hash",
    keyPath: ENCRYPTION_KEY_PATHS.NAMES,
  },
  lastName: {
    plainField: "lastName",
    encryptedField: "lastName_encrypted",
    hashField: "lastName_hash",
    keyPath: ENCRYPTION_KEY_PATHS.NAMES,
  },
  email: {
    plainField: "email",
    encryptedField: "email_encrypted",
    hashField: "email_hash",
    keyPath: ENCRYPTION_KEY_PATHS.EMAIL,
  },
  phone: {
    plainField: "phone",
    encryptedField: "phone_encrypted",
    hashField: "phone_hash",
    keyPath: ENCRYPTION_KEY_PATHS.PHONE,
  },
  verificationCode: {
    plainField: "verificationCode",
    encryptedField: "verificationCode_encrypted",
    hashField: "verificationCode_hash",
    keyPath: ENCRYPTION_KEY_PATHS.PHONE,
  },

  // Academic fields (StudentInfo, AlumniInfo)
  major: {
    plainField: "major",
    encryptedField: "major_encrypted",
    hashField: "major_hash",
    keyPath: ENCRYPTION_KEY_PATHS.ACADEMIC,
  },
  secondMajor: {
    plainField: "secondMajor",
    encryptedField: "secondMajor_encrypted",
    hashField: "secondMajor_hash",
    keyPath: ENCRYPTION_KEY_PATHS.ACADEMIC,
  },
  minor: {
    plainField: "minor",
    encryptedField: "minor_encrypted",
    hashField: "minor_hash",
    keyPath: ENCRYPTION_KEY_PATHS.ACADEMIC,
  },
  studentId: {
    plainField: "studentId",
    encryptedField: "studentId_encrypted",
    hashField: "studentId_hash",
    keyPath: ENCRYPTION_KEY_PATHS.ACADEMIC,
  },

  // Professional fields (AlumniInfo, IndustryProfessionalInfo)
  currentEmployer: {
    plainField: "currentEmployer",
    encryptedField: "currentEmployer_encrypted",
    hashField: "currentEmployer_hash",
    keyPath: ENCRYPTION_KEY_PATHS.PROFESSIONAL,
  },
  jobTitle: {
    plainField: "jobTitle",
    encryptedField: "jobTitle_encrypted",
    hashField: "jobTitle_hash",
    keyPath: ENCRYPTION_KEY_PATHS.PROFESSIONAL,
  },
  linkedinUrl: {
    plainField: "linkedinUrl",
    encryptedField: "linkedinUrl_encrypted",
    hashField: "linkedinUrl_hash",
    keyPath: ENCRYPTION_KEY_PATHS.PROFESSIONAL,
  },
};

// Error types for encryption operations
export class EncryptionError extends Error {
  constructor(
    message: string,
    public readonly cause?: Error
  ) {
    super(message);
    this.name = "EncryptionError";
  }
}

export class DecryptionError extends Error {
  constructor(
    message: string,
    public readonly cause?: Error
  ) {
    super(message);
    this.name = "DecryptionError";
  }
}

export class KeyRetrievalError extends Error {
  constructor(
    message: string,
    public readonly cause?: Error
  ) {
    super(message);
    this.name = "KeyRetrievalError";
  }
}

// Batch operation limits for performance
export const BATCH_LIMITS = {
  ENCRYPTION: 50,
  DECRYPTION: 25,
  HASH_GENERATION: 100,
} as const;
