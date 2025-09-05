/**
 * Integration tests for the encryption system
 * Tests the complete encryption flow with mock data
 */

import {
  encrypt,
  decrypt,
  generateEncryptionKey,
} from "../../src/lib/encryption/crypto";
import {
  createUniqueConstraintHash,
  verifyDeterministicHash,
} from "../../src/lib/encryption/hash";
import { PII_FIELD_MAPPINGS } from "../../src/lib/encryption/types";

describe("Encryption System Integration", () => {
  const testKey = generateEncryptionKey();

  describe("Complete encryption workflow", () => {
    it("encrypts, stores hash, and decrypts PII data correctly", () => {
      const originalData = {
        firstName: "John",
        lastName: "Doe",
        email: "john.doe@example.com",
        phone: "+1234567890",
      };

      // Simulate the encryption middleware process
      const encryptedData: any = {};

      // Encrypt each PII field
      Object.entries(originalData).forEach(([field, value]) => {
        const mapping = PII_FIELD_MAPPINGS[field];
        if (mapping) {
          // Encrypt the value
          const encrypted = encrypt(value, testKey);
          const encryptedString = JSON.stringify({
            data: encrypted.encrypted,
            iv: encrypted.iv,
            tag: encrypted.authTag,
          });

          // Store encrypted and hash fields
          encryptedData[mapping.encryptedField] = encryptedString;
          encryptedData[mapping.hashField] = createUniqueConstraintHash(value);

          // Remove plaintext (as middleware would do)
          delete encryptedData[field];
        }
      });

      // Verify encrypted data structure
      expect(encryptedData.firstName_encrypted).toBeDefined();
      expect(encryptedData.firstName_hash).toBeDefined();
      expect(encryptedData.lastName_encrypted).toBeDefined();
      expect(encryptedData.lastName_hash).toBeDefined();
      expect(encryptedData.email_encrypted).toBeDefined();
      expect(encryptedData.email_hash).toBeDefined();
      expect(encryptedData.phone_encrypted).toBeDefined();
      expect(encryptedData.phone_hash).toBeDefined();

      // Plaintext fields should not exist
      expect(encryptedData.firstName).toBeUndefined();
      expect(encryptedData.lastName).toBeUndefined();
      expect(encryptedData.email).toBeUndefined();
      expect(encryptedData.phone).toBeUndefined();

      // Simulate decryption (as middleware would do on read)
      const decryptedData: any = { ...encryptedData };

      Object.entries(PII_FIELD_MAPPINGS).forEach(([field, mapping]) => {
        const encryptedValue = decryptedData[mapping.encryptedField];
        if (encryptedValue) {
          try {
            const parsedEncrypted = JSON.parse(encryptedValue);
            const decryptionInput = {
              encrypted: parsedEncrypted.data,
              iv: parsedEncrypted.iv,
              authTag: parsedEncrypted.tag,
            };

            const decryptedValue = decrypt(decryptionInput, testKey);
            decryptedData[field] = decryptedValue;
          } catch (error) {
            decryptedData[field] = null;
          }
        }
      });

      // Verify decrypted data matches original
      expect(decryptedData.firstName).toBe("John");
      expect(decryptedData.lastName).toBe("Doe");
      expect(decryptedData.email).toBe("john.doe@example.com");
      expect(decryptedData.phone).toBe("+1234567890");
    });

    it("verifies hash-based lookups work correctly", () => {
      const testEmail = "user@example.com";
      const hash1 = createUniqueConstraintHash(testEmail);
      const hash2 = createUniqueConstraintHash(testEmail);

      // Same email should produce same hash (for database constraints)
      expect(hash1).toBe(hash2);
      expect(verifyDeterministicHash(testEmail, hash1)).toBe(true);

      // Different email should produce different hash
      const differentHash = createUniqueConstraintHash("other@example.com");
      expect(differentHash).not.toBe(hash1);
    });

    it("handles batch operations within limits", () => {
      const testData = Array(25)
        .fill(null)
        .map((_, i) => `test-data-${i}`);

      // Encrypt all data
      const encrypted = testData.map((data) => encrypt(data, testKey));
      expect(encrypted).toHaveLength(25);

      // Decrypt all data
      const decrypted = encrypted.map((enc) => decrypt(enc, testKey));
      expect(decrypted).toEqual(testData);
    });

    it("demonstrates field mapping consistency", () => {
      // Verify all required PII fields have proper mappings
      const expectedFields = [
        "firstName",
        "lastName",
        "email",
        "phone",
        "verificationCode",
      ];

      expectedFields.forEach((field) => {
        const mapping = PII_FIELD_MAPPINGS[field];
        expect(mapping).toBeDefined();
        expect(mapping.plainField).toBe(field);
        expect(mapping.encryptedField).toBe(`${field}_encrypted`);
        expect(mapping.hashField).toBe(`${field}_hash`);
        expect(mapping.keyPath).toBeDefined();
      });
    });

    it("validates encryption/decryption error handling", () => {
      const plaintext = "test data";
      const encrypted = encrypt(plaintext, testKey);

      // Test invalid decryption inputs
      expect(() =>
        decrypt({ encrypted: "", iv: "", authTag: "" }, testKey)
      ).toThrow("Invalid decryption input");

      expect(() => decrypt(encrypted, Buffer.alloc(16))) // Wrong key length
        .toThrow("Invalid decryption key");

      // Test invalid encryption inputs
      expect(() => encrypt("", testKey)).toThrow("Invalid plaintext");

      expect(() => encrypt("test", Buffer.alloc(16))).toThrow(
        "Invalid encryption key"
      );
    });
  });

  describe("Security properties", () => {
    it("produces different encrypted output for same input", () => {
      const plaintext = "same input data";
      const encrypted1 = encrypt(plaintext, testKey);
      const encrypted2 = encrypt(plaintext, testKey);

      // Different IVs should produce different encrypted data
      expect(encrypted1.encrypted).not.toBe(encrypted2.encrypted);
      expect(encrypted1.iv).not.toBe(encrypted2.iv);
      expect(encrypted1.authTag).not.toBe(encrypted2.authTag);

      // But both should decrypt to same plaintext
      expect(decrypt(encrypted1, testKey)).toBe(plaintext);
      expect(decrypt(encrypted2, testKey)).toBe(plaintext);
    });

    it("produces consistent hashes for database constraints", () => {
      const testData = ["john.doe@example.com", "+1234567890", "John Doe"];

      testData.forEach((data) => {
        const hash1 = createUniqueConstraintHash(data);
        const hash2 = createUniqueConstraintHash(data);
        const hash3 = createUniqueConstraintHash(data.toLowerCase().trim());

        expect(hash1).toBe(hash2); // Consistency
        expect(hash2).toBe(hash3); // Case/whitespace normalization
        expect(hash1).toMatch(/^[a-f0-9]{64}$/); // Valid SHA-256 format
      });
    });
  });
});
