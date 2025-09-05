/**
 * Jest environment setup for loading test environment variables
 */

// Load test environment variables
process.env.NODE_ENV = "test";
process.env.DATABASE_URL = "file:./test.db";
process.env.NEXTAUTH_SECRET = "test-secret-key-for-development-only";
process.env.NEXTAUTH_URL = "http://localhost:3000";
process.env.AWS_REGION = "us-east-1";
process.env.AWS_ACCESS_KEY_ID = "test";
process.env.AWS_SECRET_ACCESS_KEY = "test";
process.env.ENCRYPTION_MOCK_MODE = "true";
process.env.MOCK_ENCRYPTION_KEY = "test-key-32-characters-long-str";
process.env.GMAIL_USER = "test@example.com";
process.env.GMAIL_APP_PASSWORD = "test-password";
process.env.AWS_SNS_PHONE_NUMBER = "+12345678900";
