import "@testing-library/jest-dom";

// Mock Next.js router
jest.mock("next/navigation", () => ({
  useRouter() {
    return {
      push: jest.fn(),
      replace: jest.fn(),
      back: jest.fn(),
    };
  },
  usePathname() {
    return "";
  },
}));

// Setup Node.js environment for crypto functions
const { TextEncoder, TextDecoder } = require("util");
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

// Mock crypto for consistent testing
if (typeof global.crypto === "undefined") {
  const { webcrypto } = require("crypto");
  global.crypto = webcrypto;
}

// Individual tests will handle their own AWS mocking to avoid conflicts

// Global test setup
beforeEach(() => {
  jest.clearAllMocks();
  jest.clearAllTimers();
});
