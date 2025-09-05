/**
 * SHA-256 hashing utilities for searchable encrypted fields
 * Provides consistent hashing for unique constraints and lookups
 */

import { createHash, randomBytes } from "node:crypto";
import { HashResult, BATCH_LIMITS } from "./types";

const HASH_ALGORITHM = "sha256";
const SALT_LENGTH = 32; // 256-bit salt for additional security

/**
 * Generates a SHA-256 hash of the input data
 * Used for creating searchable hashes of encrypted PII fields
 * @param data - The data to hash
 * @param salt - Optional salt for additional security (recommended)
 * @returns HashResult with hex-encoded hash
 */
export function generateHash(data: string, salt?: Buffer): HashResult {
  if (!data || typeof data !== "string") {
    throw new Error("Invalid data: must be a non-empty string");
  }

  const hash = createHash(HASH_ALGORITHM);

  // Add salt if provided for additional security
  if (salt) {
    if (!Buffer.isBuffer(salt)) {
      throw new Error("Salt must be a Buffer");
    }
    hash.update(salt);
  }

  // Hash the data
  hash.update(data, "utf8");

  return {
    hash: hash.digest("hex"),
    algorithm: HASH_ALGORITHM,
  };
}

/**
 * Generates a deterministic hash for database unique constraints
 * Uses a consistent approach for the same input data
 * @param data - The data to hash
 * @returns Hex-encoded hash string
 */
export function generateDeterministicHash(data: string): string {
  if (!data || typeof data !== "string") {
    throw new Error("Invalid data: must be a non-empty string");
  }

  // For deterministic hashing, we use a consistent approach
  // This ensures the same input always produces the same hash
  const hash = createHash(HASH_ALGORITHM);
  hash.update(data.toLowerCase().trim(), "utf8"); // Normalize input

  return hash.digest("hex");
}

/**
 * Generates hashes for multiple data items in batch
 * @param dataItems - Array of strings to hash
 * @param salt - Optional salt to use for all items
 * @returns Array of HashResult objects
 */
export function generateHashBatch(
  dataItems: string[],
  salt?: Buffer
): HashResult[] {
  if (dataItems.length > BATCH_LIMITS.HASH_GENERATION) {
    throw new Error(
      `Batch size ${dataItems.length} exceeds limit of ${BATCH_LIMITS.HASH_GENERATION}`
    );
  }

  return dataItems.map((data) => generateHash(data, salt));
}

/**
 * Generates deterministic hashes for multiple data items in batch
 * @param dataItems - Array of strings to hash
 * @returns Array of hex-encoded hash strings
 */
export function generateDeterministicHashBatch(dataItems: string[]): string[] {
  if (dataItems.length > BATCH_LIMITS.HASH_GENERATION) {
    throw new Error(
      `Batch size ${dataItems.length} exceeds limit of ${BATCH_LIMITS.HASH_GENERATION}`
    );
  }

  return dataItems.map((data) => generateDeterministicHash(data));
}

/**
 * Verifies a hash against the original data
 * @param data - The original data
 * @param expectedHash - The expected hash to verify against
 * @param salt - The salt used during original hashing (if any)
 * @returns true if hash matches, false otherwise
 */
export function verifyHash(
  data: string,
  expectedHash: string,
  salt?: Buffer
): boolean {
  try {
    const result = generateHash(data, salt);
    return result.hash === expectedHash;
  } catch {
    return false;
  }
}

/**
 * Verifies a deterministic hash against the original data
 * @param data - The original data
 * @param expectedHash - The expected hash to verify against
 * @returns true if hash matches, false otherwise
 */
export function verifyDeterministicHash(
  data: string,
  expectedHash: string
): boolean {
  try {
    const hash = generateDeterministicHash(data);
    return hash === expectedHash;
  } catch {
    return false;
  }
}

/**
 * Generates a random salt for hashing operations
 * @returns Random salt buffer
 */
export function generateSalt(): Buffer {
  return randomBytes(SALT_LENGTH);
}

/**
 * Creates a hash suitable for database unique constraints
 * This is used for email_hash, phone_hash, etc. fields in the database schema
 * @param data - The PII data to hash for unique constraints
 * @returns Hex-encoded hash string suitable for database storage
 */
export function createUniqueConstraintHash(data: string): string {
  return generateDeterministicHash(data);
}

/**
 * Validates that a hash string is in the correct format
 * @param hash - The hash string to validate
 * @returns true if valid SHA-256 hex hash, false otherwise
 */
export function isValidHash(hash: string): boolean {
  if (!hash || typeof hash !== "string") {
    return false;
  }

  // SHA-256 hashes are 64 hex characters
  const sha256HexPattern = /^[a-f0-9]{64}$/i;
  return sha256HexPattern.test(hash);
}
