/**
 * AWS Secrets Manager integration for encryption key management
 * Provides secure key retrieval and caching for encryption operations
 */

import {
  SecretsManagerClient,
  GetSecretValueCommand,
} from "@aws-sdk/client-secrets-manager";
import {
  EncryptionKey,
  EncryptionKeyPath,
  ENCRYPTION_KEY_PATHS,
  KeyRetrievalError,
  SecretsManagerConfig,
} from "./types";
import { validateEncryptionKey } from "./crypto";

// In-memory cache for encryption keys (with TTL)
interface KeyCacheEntry {
  key: EncryptionKey;
  timestamp: number;
  ttl: number;
}

const keyCache = new Map<string, KeyCacheEntry>();
const DEFAULT_CACHE_TTL = 5 * 60 * 1000; // 5 minutes in milliseconds
const MAX_CACHE_SIZE = 10; // Maximum number of keys to cache

/**
 * Creates AWS Secrets Manager client with configuration
 * @param config - AWS configuration options
 * @returns Configured SecretsManagerClient
 */
function createSecretsManagerClient(
  config?: SecretsManagerConfig
): SecretsManagerClient {
  const clientConfig = {
    region:
      config?.region ||
      process.env.AWS_REGION ||
      process.env.AWS_SECRETS_MANAGER_REGION ||
      "us-east-1",
    ...(config?.accessKeyId && config?.secretAccessKey
      ? {
          credentials: {
            accessKeyId: config.accessKeyId,
            secretAccessKey: config.secretAccessKey,
          },
        }
      : {}),
  };

  return new SecretsManagerClient(clientConfig);
}

/**
 * Retrieves an encryption key from AWS Secrets Manager
 * @param keyPath - The path to the encryption key in Secrets Manager
 * @param config - Optional AWS configuration
 * @returns EncryptionKey object with key data
 */
export async function getEncryptionKey(
  keyPath: EncryptionKeyPath,
  config?: SecretsManagerConfig
): Promise<EncryptionKey> {
  try {
    // Check cache first
    const cachedKey = getCachedKey(keyPath);
    if (cachedKey) {
      return cachedKey;
    }

    const client = createSecretsManagerClient(config);
    const command = new GetSecretValueCommand({
      SecretId: keyPath,
    });

    const response = await client.send(command);

    if (!response.SecretString) {
      throw new KeyRetrievalError(
        `No secret value found for key path: ${keyPath}`
      );
    }

    // Parse the secret value - expecting JSON with key data
    let secretData: any;
    try {
      secretData = JSON.parse(response.SecretString);
    } catch (parseError) {
      throw new KeyRetrievalError(
        `Invalid JSON format in secret: ${keyPath}`,
        parseError as Error
      );
    }

    // Validate required fields
    if (!secretData.key) {
      throw new KeyRetrievalError(`Missing 'key' field in secret: ${keyPath}`);
    }

    // Convert hex key to Buffer (keys are stored as 64-character hex strings)
    let keyBuffer: Buffer;
    try {
      keyBuffer = Buffer.from(secretData.key, "hex");
    } catch (bufferError) {
      throw new KeyRetrievalError(
        `Invalid hex key format in secret: ${keyPath}`,
        bufferError as Error
      );
    }

    // Validate key format
    validateEncryptionKey(keyBuffer);

    const encryptionKey: EncryptionKey = {
      key: keyBuffer,
      keyId: secretData.keyId || response.Name || keyPath,
      version: secretData.version || 1,
    };

    // Cache the key for future use
    cacheKey(keyPath, encryptionKey);

    return encryptionKey;
  } catch (error) {
    if (error instanceof KeyRetrievalError) {
      throw error;
    }
    throw new KeyRetrievalError(
      `Failed to retrieve encryption key from ${keyPath}`,
      error as Error
    );
  }
}

/**
 * Retrieves encryption keys for names (firstName, lastName)
 * @param config - Optional AWS configuration
 * @returns EncryptionKey for names
 */
export async function getNamesKey(
  config?: SecretsManagerConfig
): Promise<EncryptionKey> {
  return getEncryptionKey(ENCRYPTION_KEY_PATHS.NAMES, config);
}

/**
 * Retrieves encryption key for phone numbers
 * @param config - Optional AWS configuration
 * @returns EncryptionKey for phone numbers
 */
export async function getPhoneKey(
  config?: SecretsManagerConfig
): Promise<EncryptionKey> {
  return getEncryptionKey(ENCRYPTION_KEY_PATHS.PHONE, config);
}

/**
 * Retrieves encryption key for email addresses
 * @param config - Optional AWS configuration
 * @returns EncryptionKey for email addresses
 */
export async function getEmailKey(
  config?: SecretsManagerConfig
): Promise<EncryptionKey> {
  return getEncryptionKey(ENCRYPTION_KEY_PATHS.EMAIL, config);
}

/**
 * Retrieves cached encryption key if available and not expired
 * @param keyPath - The key path to check in cache
 * @returns EncryptionKey if cached and valid, null otherwise
 */
function getCachedKey(keyPath: string): EncryptionKey | null {
  const cacheEntry = keyCache.get(keyPath);

  if (!cacheEntry) {
    return null;
  }

  const now = Date.now();
  const isExpired = now > cacheEntry.timestamp + cacheEntry.ttl;

  if (isExpired) {
    keyCache.delete(keyPath);
    return null;
  }

  return cacheEntry.key;
}

/**
 * Caches an encryption key with TTL
 * @param keyPath - The key path
 * @param key - The encryption key to cache
 * @param ttl - Time to live in milliseconds (optional)
 */
function cacheKey(
  keyPath: string,
  key: EncryptionKey,
  ttl = DEFAULT_CACHE_TTL
): void {
  // Implement LRU eviction if cache is full
  if (keyCache.size >= MAX_CACHE_SIZE) {
    const oldestKey = keyCache.keys().next().value;
    if (oldestKey) {
      keyCache.delete(oldestKey);
    }
  }

  keyCache.set(keyPath, {
    key,
    timestamp: Date.now(),
    ttl,
  });
}

/**
 * Clears all cached encryption keys
 * Used for testing and security purposes
 */
export function clearKeyCache(): void {
  keyCache.clear();
}

/**
 * Gets cache statistics for monitoring
 * @returns Object with cache size and key paths
 */
export function getKeyCacheStats(): { size: number; keys: string[] } {
  return {
    size: keyCache.size,
    keys: Array.from(keyCache.keys()),
  };
}

/**
 * Pre-loads encryption keys into cache for better performance
 * @param config - Optional AWS configuration
 * @returns Promise that resolves when all keys are cached
 */
export async function preloadEncryptionKeys(
  config?: SecretsManagerConfig
): Promise<void> {
  const keyPaths = Object.values(ENCRYPTION_KEY_PATHS);

  const promises = keyPaths.map((keyPath) =>
    getEncryptionKey(keyPath, config).catch((error) => {
      // Log error but don't fail the entire preload operation
      console.warn(
        `Failed to preload encryption key ${keyPath}:`,
        error.message
      );
      return null;
    })
  );

  await Promise.allSettled(promises);
}

/**
 * Validates AWS configuration for Secrets Manager access
 * @param config - AWS configuration to validate
 * @returns true if valid, throws error if invalid
 */
export function validateSecretsManagerConfig(
  config?: SecretsManagerConfig
): boolean {
  const region =
    config?.region ||
    process.env.AWS_REGION ||
    process.env.AWS_SECRETS_MANAGER_REGION;

  if (!region) {
    throw new KeyRetrievalError(
      "AWS region is required for Secrets Manager access"
    );
  }

  // Check for credentials in config or environment
  const hasConfigCredentials = config?.accessKeyId && config?.secretAccessKey;
  const hasEnvCredentials =
    process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY;

  if (!hasConfigCredentials && !hasEnvCredentials) {
    throw new KeyRetrievalError(
      "AWS credentials are required for Secrets Manager access"
    );
  }

  return true;
}
