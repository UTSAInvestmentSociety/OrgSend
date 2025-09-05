/**
 * Encryption module exports
 * Provides transparent PII encryption with AWS Secrets Manager integration
 */

// Core encryption functions
export {
  encrypt,
  decrypt,
  encryptBatch,
  decryptBatch,
  generateEncryptionKey,
  validateEncryptionKey,
} from "./crypto";

// Hash utilities
export {
  generateHash,
  generateDeterministicHash,
  generateHashBatch,
  generateDeterministicHashBatch,
  verifyHash,
  verifyDeterministicHash,
  generateSalt,
  createUniqueConstraintHash,
  isValidHash,
} from "./hash";

// AWS Secrets Manager key management
export {
  getEncryptionKey,
  getNamesKey,
  getPhoneKey,
  getEmailKey,
  clearKeyCache,
  getKeyCacheStats,
  preloadEncryptionKeys,
  validateSecretsManagerConfig,
} from "./keys";

// Prisma middleware - temporarily disabled
// export {
//   encryptionMiddleware,
//   clearEncryptionKeyCache,
//   getEncryptionCacheStats,
// } from "./middleware";

// Types and constants
export type {
  EncryptionResult,
  DecryptionInput,
  EncryptionKey,
  HashResult,
  SecretsManagerConfig,
  EncryptionKeyPath,
  EncryptedFieldMapping,
} from "./types";

export {
  ENCRYPTION_KEY_PATHS,
  PII_FIELD_MAPPINGS,
  BATCH_LIMITS,
  EncryptionError,
  DecryptionError,
  KeyRetrievalError,
} from "./types";
