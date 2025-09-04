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

// Global test setup
beforeEach(() => {
  jest.clearAllMocks();
  jest.clearAllTimers();
});
