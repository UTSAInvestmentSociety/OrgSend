/**
 * Prisma Client Extension for Encryption (Prisma 6.x Compatible)
 * Replaces deprecated middleware with modern client extensions
 */

import { Prisma } from "@/generated/prisma";
import { encryptData, decryptData } from "./crypto";
import { createUniqueConstraintHash } from "./hash";
import { mockEncrypt, mockDecrypt, isMockMode } from "./mock";
import type { EncryptionConfig } from "./config";

// Field mappings for each model
const ENCRYPTED_FIELD_MAP: Record<string, EncryptionConfig[]> = {
  User: [
    {
      fieldName: "firstName",
      encryptedField: "firstName_encrypted",
      hashField: "firstName_hash",
      keyPath: "/app/encryption/names-key",
    },
    {
      fieldName: "lastName",
      encryptedField: "lastName_encrypted",
      hashField: "lastName_hash",
      keyPath: "/app/encryption/names-key",
    },
    {
      fieldName: "email",
      encryptedField: "email_encrypted",
      hashField: "email_hash",
      keyPath: "/app/encryption/email-key",
    },
    {
      fieldName: "phone",
      encryptedField: "phone_encrypted",
      hashField: "phone_hash",
      keyPath: "/app/encryption/phone-key",
    },
    {
      fieldName: "phoneVerificationCode",
      encryptedField: "phoneVerificationCode_encrypted",
      hashField: "phoneVerificationCode_hash",
      keyPath: "/app/encryption/temp-key",
    },
  ],
  StudentInfo: [
    {
      fieldName: "studentId",
      encryptedField: "studentId_encrypted",
      hashField: "studentId_hash",
      keyPath: "/app/encryption/ids-key",
    },
    {
      fieldName: "major",
      encryptedField: "major_encrypted",
      hashField: "major_hash",
      keyPath: "/app/encryption/academic-key",
    },
    {
      fieldName: "minor",
      encryptedField: "minor_encrypted",
      hashField: "minor_hash",
      keyPath: "/app/encryption/academic-key",
    },
    {
      fieldName: "degreeProgram",
      encryptedField: "degreeProgram_encrypted",
      hashField: "degreeProgram_hash",
      keyPath: "/app/encryption/academic-key",
    },
  ],
  AlumniInfo: [
    {
      fieldName: "degreeObtained",
      encryptedField: "degreeObtained_encrypted",
      hashField: "degreeObtained_hash",
      keyPath: "/app/encryption/academic-key",
    },
    {
      fieldName: "currentEmployer",
      encryptedField: "currentEmployer_encrypted",
      hashField: "currentEmployer_hash",
      keyPath: "/app/encryption/employment-key",
    },
    {
      fieldName: "jobTitle",
      encryptedField: "jobTitle_encrypted",
      hashField: "jobTitle_hash",
      keyPath: "/app/encryption/employment-key",
    },
    {
      fieldName: "linkedInUrl",
      encryptedField: "linkedInUrl_encrypted",
      hashField: "linkedInUrl_hash",
      keyPath: "/app/encryption/urls-key",
    },
  ],
  IndustryProfessionalInfo: [
    {
      fieldName: "companyName",
      encryptedField: "companyName_encrypted",
      hashField: "companyName_hash",
      keyPath: "/app/encryption/employment-key",
    },
    {
      fieldName: "jobTitle",
      encryptedField: "jobTitle_encrypted",
      hashField: "jobTitle_hash",
      keyPath: "/app/encryption/employment-key",
    },
    {
      fieldName: "linkedInUrl",
      encryptedField: "linkedInUrl_encrypted",
      hashField: "linkedInUrl_hash",
      keyPath: "/app/encryption/urls-key",
    },
  ],
};

// Helper function to transform data for create/update operations
async function transformDataForStorage(
  modelName: string,
  data: any
): Promise<any> {
  const configs = ENCRYPTED_FIELD_MAP[modelName];
  if (!configs) return data;

  const transformedData = { ...data };

  for (const config of configs) {
    if (
      data[config.fieldName] !== undefined &&
      data[config.fieldName] !== null
    ) {
      const plainValue = data[config.fieldName];

      try {
        let encryptedValue: string;

        if (isMockMode()) {
          // Use mock encryption in test environment
          encryptedValue = mockEncrypt(plainValue);
        } else {
          // Use real encryption in production
          encryptedValue = await encryptData(plainValue, config.keyPath);
        }

        // Create hash for unique constraints and lookups
        const hashValue = createUniqueConstraintHash(plainValue);

        // Replace original field with encrypted fields
        delete transformedData[config.fieldName];
        transformedData[config.encryptedField] = encryptedValue;
        transformedData[config.hashField] = hashValue;
      } catch (error) {
        console.error(`Failed to encrypt field ${config.fieldName}:`, error);
        // Keep original data if encryption fails (for development)
        transformedData[config.encryptedField] = plainValue;
        transformedData[config.hashField] =
          createUniqueConstraintHash(plainValue);
        delete transformedData[config.fieldName];
      }
    }
  }

  return transformedData;
}

// Helper function to transform data for read operations
async function transformDataForReading(
  modelName: string,
  result: any
): Promise<any> {
  if (!result) return result;

  const configs = ENCRYPTED_FIELD_MAP[modelName];
  if (!configs) return result;

  // Handle arrays of results
  if (Array.isArray(result)) {
    return Promise.all(
      result.map((item) => transformDataForReading(modelName, item))
    );
  }

  const transformedResult = { ...result };

  for (const config of configs) {
    if (
      result[config.encryptedField] !== undefined &&
      result[config.encryptedField] !== null
    ) {
      try {
        let decryptedValue: string;

        if (isMockMode()) {
          // Use mock decryption in test environment
          decryptedValue = mockDecrypt(result[config.encryptedField]);
        } else {
          // Use real decryption in production
          decryptedValue = await decryptData(
            result[config.encryptedField],
            config.keyPath
          );
        }

        transformedResult[config.fieldName] = decryptedValue;
      } catch (error) {
        console.error(`Failed to decrypt field ${config.fieldName}:`, error);
        // Return encrypted data if decryption fails (for development)
        transformedResult[config.fieldName] = result[config.encryptedField];
      }
    }
  }

  return transformedResult;
}

/**
 * Prisma Client Extension for automatic encryption/decryption
 * Compatible with Prisma 6.x
 */
export const encryptionExtension = Prisma.defineExtension({
  name: "encryption",
  query: {
    // Apply to all models
    $allModels: {
      // Handle create operations
      async create({ args, model, query }) {
        if (args.data) {
          args.data = await transformDataForStorage(model, args.data);
        }
        const result = await query(args);
        return transformDataForReading(model, result);
      },

      // Handle update operations
      async update({ args, model, query }) {
        if (args.data) {
          args.data = await transformDataForStorage(model, args.data);
        }
        const result = await query(args);
        return transformDataForReading(model, result);
      },

      // Handle upsert operations
      async upsert({ args, model, query }) {
        if (args.create) {
          args.create = await transformDataForStorage(model, args.create);
        }
        if (args.update) {
          args.update = await transformDataForStorage(model, args.update);
        }
        const result = await query(args);
        return transformDataForReading(model, result);
      },

      // Handle createMany operations
      async createMany({ args, model, query }) {
        if (args.data) {
          if (Array.isArray(args.data)) {
            args.data = await Promise.all(
              args.data.map((item) => transformDataForStorage(model, item))
            );
          } else {
            args.data = await transformDataForStorage(model, args.data);
          }
        }
        return query(args);
      },

      // Handle updateMany operations
      async updateMany({ args, model, query }) {
        if (args.data) {
          args.data = await transformDataForStorage(model, args.data);
        }
        return query(args);
      },

      // Handle read operations
      async findFirst({ args, model, query }) {
        const result = await query(args);
        return transformDataForReading(model, result);
      },

      async findUnique({ args, model, query }) {
        const result = await query(args);
        return transformDataForReading(model, result);
      },

      async findMany({ args, model, query }) {
        const result = await query(args);
        return transformDataForReading(model, result);
      },

      // Handle delete operations (no transformation needed)
      async delete({ args, query }) {
        return query(args);
      },

      async deleteMany({ args, query }) {
        return query(args);
      },
    },
  },
});

export default encryptionExtension;
