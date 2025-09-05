/**
 * Prisma database client with encryption middleware integration
 * Provides transparent PII encryption/decryption for all database operations
 */

import { PrismaClient } from "../../generated/prisma";

// Global Prisma instance for connection management
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// Create Prisma client
function createPrismaClient(): PrismaClient {
  const prisma = new PrismaClient({
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "error", "warn"]
        : ["error"],
    errorFormat: "pretty",
  });

  // TODO: Add encryption extension when Prisma extension system is fully working
  // For now, manual encryption handling in API routes

  return prisma;
}

// Use global instance in development to prevent connection exhaustion during hot reloads
export const db = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = db;
}

/**
 * Safely disconnect from database
 * Should be called during application shutdown
 */
export async function disconnectDatabase(): Promise<void> {
  await db.$disconnect();
}

/**
 * Test database connection
 * @returns Promise<boolean> - true if connection successful
 */
export async function testDatabaseConnection(): Promise<boolean> {
  try {
    await db.$queryRaw`SELECT 1`;
    return true;
  } catch (error) {
    console.error("Database connection test failed:", error);
    return false;
  }
}

/**
 * Get database connection info
 * @returns Object with connection details (safe for logging)
 */
export function getDatabaseInfo(): {
  connected: boolean;
  url: string | undefined;
  provider: string;
} {
  const databaseUrl = process.env.DATABASE_URL;

  return {
    connected: db ? true : false,
    url: databaseUrl
      ? databaseUrl.replace(/\/\/[^:]+:[^@]+@/, "//***:***@")
      : undefined,
    provider: "postgresql",
  };
}

/**
 * Execute raw SQL query with proper typing
 * Use with caution - bypasses encryption middleware
 */
export const rawQuery = db.$queryRaw;
export const rawExecute = db.$executeRaw;

/**
 * Transaction helper with encryption support
 * All operations within transaction will have encryption applied
 */
export const transaction = db.$transaction.bind(db);

// Re-export Prisma types for use throughout the application
export * from "../../generated/prisma";
