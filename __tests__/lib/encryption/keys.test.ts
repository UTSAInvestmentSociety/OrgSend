/**
 * Unit tests for AWS Secrets Manager integration
 * Uses mocked AWS SDK to test key retrieval functionality
 */

import { jest } from "@jest/globals";
import {
  SecretsManagerClient,
  GetSecretValueCommand,
} from "@aws-sdk/client-secrets-manager";
import {
  getEncryptionKey,
  getNamesKey,
  getPhoneKey,
  getEmailKey,
  clearKeyCache,
  getKeyCacheStats,
  preloadEncryptionKeys,
  validateSecretsManagerConfig,
} from "../../../src/lib/encryption/keys";
import {
  ENCRYPTION_KEY_PATHS,
  KeyRetrievalError,
} from "../../../src/lib/encryption/types";

// Mock AWS SDK
const mockSend = jest.fn();
const mockSecretsManagerClient = jest.fn().mockImplementation(() => ({
  send: mockSend,
}));

jest.mock("@aws-sdk/client-secrets-manager", () => ({
  SecretsManagerClient: mockSecretsManagerClient,
  GetSecretValueCommand: jest.fn().mockImplementation((input) => input),
}));

describe("AWS Secrets Manager Key Management", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    clearKeyCache();
  });

  afterEach(() => {
    clearKeyCache();
  });

  describe("getEncryptionKey", () => {
    const validSecretResponse = {
      SecretString: JSON.stringify({
        key: Buffer.from("a".repeat(32)).toString("base64"), // Valid 32-byte key
        keyId: "test-key-id",
        version: 1,
      }),
      Name: "test-secret",
    };

    it("retrieves and parses encryption key successfully", async () => {
      mockSend.mockResolvedValue(validSecretResponse);

      const result = await getEncryptionKey(ENCRYPTION_KEY_PATHS.NAMES);

      expect(result).toHaveProperty("key");
      expect(result).toHaveProperty("keyId");
      expect(result).toHaveProperty("version");
      expect(Buffer.isBuffer(result.key)).toBe(true);
      expect(result.key.length).toBe(32);
      expect(result.keyId).toBe("test-key-id");
      expect(result.version).toBe(1);
    });

    it("caches keys after first retrieval", async () => {
      mockSend.mockResolvedValue(validSecretResponse);

      // First call should hit AWS
      const result1 = await getEncryptionKey(ENCRYPTION_KEY_PATHS.NAMES);
      expect(mockSend).toHaveBeenCalledTimes(1);

      // Second call should use cache
      const result2 = await getEncryptionKey(ENCRYPTION_KEY_PATHS.NAMES);
      expect(mockSend).toHaveBeenCalledTimes(1); // Still only 1 call
      expect(result1.key.equals(result2.key)).toBe(true);
    });

    it("throws error when secret not found", async () => {
      mockSend.mockResolvedValue({ SecretString: undefined });

      await expect(
        getEncryptionKey(ENCRYPTION_KEY_PATHS.NAMES)
      ).rejects.toThrow(KeyRetrievalError);
      expect(mockSend).toHaveBeenCalledTimes(1);
    });

    it("throws error for invalid JSON in secret", async () => {
      mockSend.mockResolvedValue({ SecretString: "invalid json" });

      await expect(
        getEncryptionKey(ENCRYPTION_KEY_PATHS.NAMES)
      ).rejects.toThrow(KeyRetrievalError);
    });

    it("throws error when key field is missing", async () => {
      mockSend.mockResolvedValue({
        SecretString: JSON.stringify({ keyId: "test", version: 1 }),
      });

      await expect(
        getEncryptionKey(ENCRYPTION_KEY_PATHS.NAMES)
      ).rejects.toThrow(KeyRetrievalError);
    });

    it("throws error for invalid key format", async () => {
      mockSend.mockResolvedValue({
        SecretString: JSON.stringify({
          key: "invalid-base64",
          keyId: "test",
          version: 1,
        }),
      });

      await expect(
        getEncryptionKey(ENCRYPTION_KEY_PATHS.NAMES)
      ).rejects.toThrow(KeyRetrievalError);
    });

    it("throws error for wrong key length", async () => {
      mockSend.mockResolvedValue({
        SecretString: JSON.stringify({
          key: Buffer.from("short").toString("base64"), // Too short
          keyId: "test",
          version: 1,
        }),
      });

      await expect(
        getEncryptionKey(ENCRYPTION_KEY_PATHS.NAMES)
      ).rejects.toThrow();
    });

    it("handles AWS SDK errors", async () => {
      mockSend.mockRejectedValue(new Error("AWS Error"));

      await expect(
        getEncryptionKey(ENCRYPTION_KEY_PATHS.NAMES)
      ).rejects.toThrow(KeyRetrievalError);
    });

    it("uses correct key path in AWS request", async () => {
      mockSend.mockResolvedValue(validSecretResponse);

      await getEncryptionKey(ENCRYPTION_KEY_PATHS.EMAIL);

      expect(mockSend).toHaveBeenCalledWith(
        expect.objectContaining({
          input: { SecretId: ENCRYPTION_KEY_PATHS.EMAIL },
        })
      );
    });
  });

  describe("specific key retrieval functions", () => {
    const validSecretResponse = {
      SecretString: JSON.stringify({
        key: Buffer.from("b".repeat(32)).toString("base64"),
        keyId: "specific-key-id",
        version: 1,
      }),
    };

    beforeEach(() => {
      mockSend.mockResolvedValue(validSecretResponse);
    });

    it("getNamesKey retrieves names encryption key", async () => {
      const result = await getNamesKey();

      expect(mockSend).toHaveBeenCalledWith(
        expect.objectContaining({
          input: { SecretId: ENCRYPTION_KEY_PATHS.NAMES },
        })
      );
      expect(result.key.length).toBe(32);
    });

    it("getPhoneKey retrieves phone encryption key", async () => {
      const result = await getPhoneKey();

      expect(mockSend).toHaveBeenCalledWith(
        expect.objectContaining({
          input: { SecretId: ENCRYPTION_KEY_PATHS.PHONE },
        })
      );
      expect(result.key.length).toBe(32);
    });

    it("getEmailKey retrieves email encryption key", async () => {
      const result = await getEmailKey();

      expect(mockSend).toHaveBeenCalledWith(
        expect.objectContaining({
          input: { SecretId: ENCRYPTION_KEY_PATHS.EMAIL },
        })
      );
      expect(result.key.length).toBe(32);
    });
  });

  describe("key caching", () => {
    const validSecretResponse = {
      SecretString: JSON.stringify({
        key: Buffer.from("c".repeat(32)).toString("base64"),
        keyId: "cache-test-key",
        version: 1,
      }),
    };

    it("caches keys correctly", async () => {
      mockSend.mockResolvedValue(validSecretResponse);

      // Initial cache should be empty
      expect(getKeyCacheStats().size).toBe(0);

      // Retrieve key - should cache it
      await getEncryptionKey(ENCRYPTION_KEY_PATHS.NAMES);

      const stats = getKeyCacheStats();
      expect(stats.size).toBe(1);
      expect(stats.keys).toContain(ENCRYPTION_KEY_PATHS.NAMES);
    });

    it("clearKeyCache clears all cached keys", async () => {
      mockSend.mockResolvedValue(validSecretResponse);

      // Cache some keys
      await getNamesKey();
      await getPhoneKey();
      expect(getKeyCacheStats().size).toBe(2);

      // Clear cache
      clearKeyCache();
      expect(getKeyCacheStats().size).toBe(0);
    });

    it("handles cache statistics correctly", async () => {
      mockSend.mockResolvedValue(validSecretResponse);

      const initialStats = getKeyCacheStats();
      expect(initialStats.size).toBe(0);
      expect(initialStats.keys).toEqual([]);

      await getNamesKey();
      await getEmailKey();

      const finalStats = getKeyCacheStats();
      expect(finalStats.size).toBe(2);
      expect(finalStats.keys).toContain(ENCRYPTION_KEY_PATHS.NAMES);
      expect(finalStats.keys).toContain(ENCRYPTION_KEY_PATHS.EMAIL);
    });
  });

  describe("preloadEncryptionKeys", () => {
    const validSecretResponse = {
      SecretString: JSON.stringify({
        key: Buffer.from("d".repeat(32)).toString("base64"),
        keyId: "preload-key",
        version: 1,
      }),
    };

    it("preloads all encryption keys", async () => {
      mockSend.mockResolvedValue(validSecretResponse);

      await preloadEncryptionKeys();

      // Should have called AWS for each key type
      expect(mockSend).toHaveBeenCalledTimes(3);

      // Should have cached all keys
      const stats = getKeyCacheStats();
      expect(stats.size).toBe(3);
      expect(stats.keys).toContain(ENCRYPTION_KEY_PATHS.NAMES);
      expect(stats.keys).toContain(ENCRYPTION_KEY_PATHS.PHONE);
      expect(stats.keys).toContain(ENCRYPTION_KEY_PATHS.EMAIL);
    });

    it("continues preloading even if some keys fail", async () => {
      mockSend
        .mockResolvedValueOnce(validSecretResponse) // NAMES succeeds
        .mockRejectedValueOnce(new Error("AWS Error")) // PHONE fails
        .mockResolvedValueOnce(validSecretResponse); // EMAIL succeeds

      // Should not throw error
      await expect(preloadEncryptionKeys()).resolves.not.toThrow();

      // Should have attempted all keys
      expect(mockSend).toHaveBeenCalledTimes(3);

      // Should have cached successful keys
      const stats = getKeyCacheStats();
      expect(stats.size).toBe(2); // NAMES and EMAIL
    });
  });

  describe("validateSecretsManagerConfig", () => {
    const originalEnv = process.env;

    beforeEach(() => {
      jest.resetModules();
      process.env = { ...originalEnv };
    });

    afterEach(() => {
      process.env = originalEnv;
    });

    it("validates config with explicit region and credentials", () => {
      const config = {
        region: "us-west-2",
        accessKeyId: "test-key",
        secretAccessKey: "test-secret",
      };

      expect(() => validateSecretsManagerConfig(config)).not.toThrow();
      expect(validateSecretsManagerConfig(config)).toBe(true);
    });

    it("validates config with environment variables", () => {
      process.env.AWS_REGION = "us-east-1";
      process.env.AWS_ACCESS_KEY_ID = "env-key";
      process.env.AWS_SECRET_ACCESS_KEY = "env-secret";

      expect(() => validateSecretsManagerConfig()).not.toThrow();
      expect(validateSecretsManagerConfig()).toBe(true);
    });

    it("throws error when region is missing", () => {
      const config = {
        accessKeyId: "test-key",
        secretAccessKey: "test-secret",
      };

      expect(() => validateSecretsManagerConfig(config)).toThrow(
        KeyRetrievalError
      );
    });

    it("throws error when credentials are missing", () => {
      const config = {
        region: "us-west-2",
      };

      expect(() => validateSecretsManagerConfig(config)).toThrow(
        KeyRetrievalError
      );
    });

    it("uses AWS_SECRETS_MANAGER_REGION as fallback", () => {
      process.env.AWS_SECRETS_MANAGER_REGION = "eu-west-1";
      process.env.AWS_ACCESS_KEY_ID = "env-key";
      process.env.AWS_SECRET_ACCESS_KEY = "env-secret";

      expect(() => validateSecretsManagerConfig()).not.toThrow();
    });
  });

  describe("error handling", () => {
    it("wraps AWS errors in KeyRetrievalError", async () => {
      const awsError = new Error("Service temporarily unavailable");
      mockSend.mockRejectedValue(awsError);

      await expect(
        getEncryptionKey(ENCRYPTION_KEY_PATHS.NAMES)
      ).rejects.toThrow(KeyRetrievalError);
    });

    it("preserves original error as cause", async () => {
      const awsError = new Error("Network timeout");
      mockSend.mockRejectedValue(awsError);

      try {
        await getEncryptionKey(ENCRYPTION_KEY_PATHS.NAMES);
      } catch (error) {
        expect(error).toBeInstanceOf(KeyRetrievalError);
        expect((error as KeyRetrievalError).cause).toBe(awsError);
      }
    });

    it("includes key path in error messages", async () => {
      mockSend.mockResolvedValue({ SecretString: undefined });

      try {
        await getEncryptionKey(ENCRYPTION_KEY_PATHS.EMAIL);
      } catch (error) {
        expect((error as Error).message).toContain(ENCRYPTION_KEY_PATHS.EMAIL);
      }
    });
  });
});
