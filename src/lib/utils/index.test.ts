import {
  formatPhoneNumber,
  isValidPhoneNumber,
  generateOrgCode,
} from "./index";

describe("Utility Functions", () => {
  describe("formatPhoneNumber", () => {
    test("formats 10-digit number to US format", () => {
      expect(formatPhoneNumber("5551234567")).toBe("+15551234567");
    });

    test("formats 11-digit number starting with 1", () => {
      expect(formatPhoneNumber("15551234567")).toBe("+15551234567");
    });

    test("returns original if invalid format", () => {
      expect(formatPhoneNumber("123")).toBe("123");
    });
  });

  describe("isValidPhoneNumber", () => {
    test("validates correct US phone number format", () => {
      expect(isValidPhoneNumber("+15551234567")).toBe(true);
    });

    test("rejects invalid formats", () => {
      expect(isValidPhoneNumber("5551234567")).toBe(false);
      expect(isValidPhoneNumber("+1555123456")).toBe(false);
    });
  });

  describe("generateOrgCode", () => {
    test("generates 8-character alphanumeric code", () => {
      const code = generateOrgCode();
      expect(code).toHaveLength(8);
      expect(code).toMatch(/^[A-Z0-9]{8}$/);
    });

    test("generates unique codes", () => {
      const code1 = generateOrgCode();
      const code2 = generateOrgCode();
      expect(code1).not.toBe(code2);
    });
  });
});
