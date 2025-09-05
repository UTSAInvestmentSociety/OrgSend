/**
 * Unit tests for SHA-256 hashing utilities
 */

import {
  generateHash,
  generateDeterministicHash,
  generateHashBatch,
  generateDeterministicHashBatch,
  verifyHash,
  verifyDeterministicHash,
  generateSalt,
  createUniqueConstraintHash,
  isValidHash,
} from "../../../src/lib/encryption/hash";

describe("Hash Utilities", () => {
  describe("generateHash", () => {
    it("generates SHA-256 hash successfully", () => {
      const data = "test data";
      const result = generateHash(data);

      expect(result).toHaveProperty("hash");
      expect(result).toHaveProperty("algorithm");
      expect(result.algorithm).toBe("sha256");
      expect(typeof result.hash).toBe("string");
      expect(result.hash).toMatch(/^[a-f0-9]{64}$/); // SHA-256 hex format
    });

    it("generates different hashes with salt", () => {
      const data = "same data";
      const salt1 = generateSalt();
      const salt2 = generateSalt();

      const result1 = generateHash(data, salt1);
      const result2 = generateHash(data, salt2);

      expect(result1.hash).not.toBe(result2.hash);
    });

    it("generates same hash with same salt", () => {
      const data = "consistent data";
      const salt = generateSalt();

      const result1 = generateHash(data, salt);
      const result2 = generateHash(data, salt);

      expect(result1.hash).toBe(result2.hash);
    });

    it("throws error for invalid input", () => {
      expect(() => generateHash("")).toThrow();
      expect(() => generateHash(null as any)).toThrow();
      expect(() => generateHash(undefined as any)).toThrow();
    });

    it("throws error for invalid salt", () => {
      expect(() => generateHash("test", "not a buffer" as any)).toThrow();
    });
  });

  describe("generateDeterministicHash", () => {
    it("generates consistent hashes for same input", () => {
      const data = "deterministic test";
      const hash1 = generateDeterministicHash(data);
      const hash2 = generateDeterministicHash(data);

      expect(hash1).toBe(hash2);
      expect(hash1).toMatch(/^[a-f0-9]{64}$/);
    });

    it("normalizes input (case and whitespace)", () => {
      const hash1 = generateDeterministicHash("Test Data");
      const hash2 = generateDeterministicHash("test data");
      const hash3 = generateDeterministicHash(" TEST DATA ");

      expect(hash1).toBe(hash2);
      expect(hash2).toBe(hash3);
    });

    it("generates different hashes for different inputs", () => {
      const hash1 = generateDeterministicHash("input1");
      const hash2 = generateDeterministicHash("input2");

      expect(hash1).not.toBe(hash2);
    });

    it("throws error for invalid input", () => {
      expect(() => generateDeterministicHash("")).toThrow();
      expect(() => generateDeterministicHash(null as any)).toThrow();
    });
  });

  describe("batch operations", () => {
    const testData = [
      "email@example.com",
      "another@test.com",
      "+1234567890",
      "John Doe",
    ];

    describe("generateHashBatch", () => {
      it("generates hashes for multiple items", () => {
        const results = generateHashBatch(testData);

        expect(results).toHaveLength(testData.length);
        results.forEach((result) => {
          expect(result).toHaveProperty("hash");
          expect(result).toHaveProperty("algorithm");
          expect(result.hash).toMatch(/^[a-f0-9]{64}$/);
        });
      });

      it("uses same salt for all items when provided", () => {
        const salt = generateSalt();
        const results = generateHashBatch(testData, salt);

        // Verify each item individually with same salt
        results.forEach((result, index) => {
          const expectedHash = generateHash(testData[index], salt);
          expect(result.hash).toBe(expectedHash.hash);
        });
      });

      it("throws error when batch size exceeds limit", () => {
        const largeBatch = Array(101).fill("test data");
        expect(() => generateHashBatch(largeBatch)).toThrow();
      });
    });

    describe("generateDeterministicHashBatch", () => {
      it("generates deterministic hashes for multiple items", () => {
        const results = generateDeterministicHashBatch(testData);

        expect(results).toHaveLength(testData.length);
        results.forEach((result) => {
          expect(typeof result).toBe("string");
          expect(result).toMatch(/^[a-f0-9]{64}$/);
        });

        // Verify consistency
        const secondResults = generateDeterministicHashBatch(testData);
        expect(results).toEqual(secondResults);
      });

      it("throws error when batch size exceeds limit", () => {
        const largeBatch = Array(101).fill("test data");
        expect(() => generateDeterministicHashBatch(largeBatch)).toThrow();
      });
    });
  });

  describe("hash verification", () => {
    describe("verifyHash", () => {
      it("verifies correct hashes without salt", () => {
        const data = "verification test";
        const result = generateHash(data);

        expect(verifyHash(data, result.hash)).toBe(true);
      });

      it("verifies correct hashes with salt", () => {
        const data = "verification test with salt";
        const salt = generateSalt();
        const result = generateHash(data, salt);

        expect(verifyHash(data, result.hash, salt)).toBe(true);
      });

      it("rejects incorrect hashes", () => {
        const data = "verification test";
        const wrongHash = generateHash("different data").hash;

        expect(verifyHash(data, wrongHash)).toBe(false);
      });

      it("handles verification errors gracefully", () => {
        expect(verifyHash("test", "invalid-hash")).toBe(false);
        expect(verifyHash("test", null as any)).toBe(false);
      });
    });

    describe("verifyDeterministicHash", () => {
      it("verifies correct deterministic hashes", () => {
        const data = "deterministic verification";
        const hash = generateDeterministicHash(data);

        expect(verifyDeterministicHash(data, hash)).toBe(true);
      });

      it("handles normalization during verification", () => {
        const data = "Test Data";
        const hash = generateDeterministicHash(data);

        expect(verifyDeterministicHash("test data", hash)).toBe(true);
        expect(verifyDeterministicHash(" TEST DATA ", hash)).toBe(true);
      });

      it("rejects incorrect hashes", () => {
        const data = "verification test";
        const wrongHash = generateDeterministicHash("different data");

        expect(verifyDeterministicHash(data, wrongHash)).toBe(false);
      });

      it("handles verification errors gracefully", () => {
        expect(verifyDeterministicHash("test", "invalid-hash")).toBe(false);
        expect(verifyDeterministicHash("test", null as any)).toBe(false);
      });
    });
  });

  describe("salt generation", () => {
    it("generates 32-byte salt", () => {
      const salt = generateSalt();
      expect(salt).toBeInstanceOf(Buffer);
      expect(salt.length).toBe(32);
    });

    it("generates unique salts", () => {
      const salt1 = generateSalt();
      const salt2 = generateSalt();
      expect(salt1.equals(salt2)).toBe(false);
    });
  });

  describe("createUniqueConstraintHash", () => {
    it("creates hash suitable for database constraints", () => {
      const email = "user@example.com";
      const hash = createUniqueConstraintHash(email);

      expect(typeof hash).toBe("string");
      expect(hash).toMatch(/^[a-f0-9]{64}$/);
    });

    it("creates consistent hashes for unique constraints", () => {
      const email = "user@example.com";
      const hash1 = createUniqueConstraintHash(email);
      const hash2 = createUniqueConstraintHash(email);

      expect(hash1).toBe(hash2);
    });

    it("creates different hashes for different inputs", () => {
      const email1 = "user1@example.com";
      const email2 = "user2@example.com";
      const hash1 = createUniqueConstraintHash(email1);
      const hash2 = createUniqueConstraintHash(email2);

      expect(hash1).not.toBe(hash2);
    });
  });

  describe("isValidHash", () => {
    it("validates correct SHA-256 hashes", () => {
      const validHash = generateDeterministicHash("test data");
      expect(isValidHash(validHash)).toBe(true);
    });

    it("rejects invalid hash formats", () => {
      expect(isValidHash("too-short")).toBe(false);
      expect(isValidHash("x".repeat(64))).toBe(false); // Invalid hex chars
      expect(isValidHash("1".repeat(63))).toBe(false); // Wrong length
      expect(isValidHash("1".repeat(65))).toBe(false); // Wrong length
      expect(isValidHash("")).toBe(false);
      expect(isValidHash(null as any)).toBe(false);
      expect(isValidHash(undefined as any)).toBe(false);
    });

    it("accepts both upper and lower case hex", () => {
      const hash = generateDeterministicHash("test");
      expect(isValidHash(hash.toLowerCase())).toBe(true);
      expect(isValidHash(hash.toUpperCase())).toBe(true);
    });
  });

  describe("PII field hashing scenarios", () => {
    const testScenarios = [
      {
        name: "email addresses",
        values: ["user@example.com", "test.user+tag@domain.co.uk"],
      },
      { name: "phone numbers", values: ["+1234567890", "+44123456789"] },
      { name: "names", values: ["John Doe", "María García-López", "李小明"] },
    ];

    testScenarios.forEach(({ name, values }) => {
      describe(`${name}`, () => {
        it("creates consistent hashes for database lookups", () => {
          values.forEach((value) => {
            const hash1 = createUniqueConstraintHash(value);
            const hash2 = createUniqueConstraintHash(value);
            expect(hash1).toBe(hash2);
            expect(isValidHash(hash1)).toBe(true);
          });
        });

        it("creates unique hashes for different values", () => {
          if (values.length > 1) {
            const hash1 = createUniqueConstraintHash(values[0]);
            const hash2 = createUniqueConstraintHash(values[1]);
            expect(hash1).not.toBe(hash2);
          }
        });
      });
    });
  });
});
