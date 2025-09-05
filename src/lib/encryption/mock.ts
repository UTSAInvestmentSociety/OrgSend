/**
 * Mock encryption system for testing
 * Provides predictable encryption/decryption for test environments
 */

import { createHash } from "crypto";

// Mock encryption key for testing
const MOCK_ENCRYPTION_KEY =
  process.env.MOCK_ENCRYPTION_KEY || "test-key-32-characters-long-str";

/**
 * Mock encrypt function that produces predictable results for testing
 * Uses base64 encoding with a predictable prefix
 */
export function mockEncrypt(data: string): string {
  if (!data) return "";

  // Simple reversible encoding for testing
  const encoded = Buffer.from(data).toString("base64");
  return `mock_encrypted_${encoded}`;
}

/**
 * Mock decrypt function that reverses the mock encryption
 */
export function mockDecrypt(encryptedData: string): string {
  if (!encryptedData) return "";

  if (!encryptedData.startsWith("mock_encrypted_")) {
    // If it's not mock encrypted, return as is (for development data)
    return encryptedData;
  }

  const encoded = encryptedData.replace("mock_encrypted_", "");
  try {
    return Buffer.from(encoded, "base64").toString("utf8");
  } catch (error) {
    console.warn("Failed to decode mock encrypted data:", error);
    return encryptedData;
  }
}

/**
 * Mock hash function for unique constraints (deterministic)
 */
export function mockCreateHash(data: string): string {
  return createHash("sha256").update(data).digest("hex");
}

/**
 * Mock key retrieval that returns static test keys
 */
export async function mockGetEncryptionKey(keyPath: string): Promise<string> {
  // Return different mock keys based on path for testing
  const keyMap: Record<string, string> = {
    "/app/encryption/names-key": "mock-names-key-32chars-long-12345",
    "/app/encryption/email-key": "mock-email-key-32chars-long-12345",
    "/app/encryption/phone-key": "mock-phone-key-32chars-long-12345",
    "/app/encryption/temp-key": "mock-temp-key-32chars-long-123456",
    "/app/encryption/ids-key": "mock-ids-key-32chars-long-123456",
    "/app/encryption/academic-key": "mock-academic-key-32chars-long-1",
    "/app/encryption/employment-key": "mock-employment-key-32chars-lo",
    "/app/encryption/urls-key": "mock-urls-key-32chars-long-12345",
  };

  return keyMap[keyPath] || MOCK_ENCRYPTION_KEY;
}

/**
 * Check if we're in mock mode
 */
export function isMockMode(): boolean {
  return (
    process.env.NODE_ENV === "test" ||
    process.env.ENCRYPTION_MOCK_MODE === "true"
  );
}

/**
 * Mock AWS Secrets Manager for testing
 */
export class MockSecretsManager {
  private secrets: Map<string, string> = new Map();

  constructor() {
    // Pre-populate with test secrets
    this.secrets.set(
      "/app/encryption/names-key",
      "mock-names-key-32chars-long-12345"
    );
    this.secrets.set(
      "/app/encryption/email-key",
      "mock-email-key-32chars-long-12345"
    );
    this.secrets.set(
      "/app/encryption/phone-key",
      "mock-phone-key-32chars-long-12345"
    );
    this.secrets.set(
      "/app/encryption/temp-key",
      "mock-temp-key-32chars-long-123456"
    );
    this.secrets.set(
      "/app/encryption/ids-key",
      "mock-ids-key-32chars-long-123456"
    );
    this.secrets.set(
      "/app/encryption/academic-key",
      "mock-academic-key-32chars-long-1"
    );
    this.secrets.set(
      "/app/encryption/employment-key",
      "mock-employment-key-32chars-lo"
    );
    this.secrets.set(
      "/app/encryption/urls-key",
      "mock-urls-key-32chars-long-12345"
    );
  }

  async getSecretValue(params: { SecretId: string }) {
    const secret = this.secrets.get(params.SecretId);
    if (!secret) {
      throw new Error(`Secret not found: ${params.SecretId}`);
    }

    return {
      SecretString: secret,
    };
  }

  send(command: any) {
    return this.getSecretValue({ SecretId: command.input.SecretId });
  }
}

/**
 * Mock SNS for SMS testing
 */
export class MockSNS {
  async publish(params: any) {
    console.log("Mock SMS sent:", {
      to: params.PhoneNumber,
      message: params.Message,
      subject: params.Subject,
    });

    return {
      promise: () =>
        Promise.resolve({
          MessageId: `mock-message-${Date.now()}`,
        }),
    };
  }

  send(command: any) {
    return this.publish(command.input);
  }
}
