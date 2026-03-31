import { validateLogin } from "@/app/features/auth/utils/validation";

// Mock supabase so validateUsername doesn't make real DB calls
jest.mock("@/services/supabase-client", () => ({
  supabase: {
    from: jest.fn(),
    auth: { signInWithPassword: jest.fn() },
  },
}));

describe("validateLogin", () => {
  // ─────────────────────────────────────────────
  // Empty fields
  // ─────────────────────────────────────────────
  describe("empty fields", () => {
    it("returns email and password required errors when both are empty", () => {
      const errors = validateLogin("", "");
      expect(errors.email).toBe("Email is required.");
      expect(errors.password).toBe("Password is required.");
    });

    it("returns email required error when only email is empty", () => {
      const errors = validateLogin("", "password123");
      expect(errors.email).toBe("Email is required.");
      expect(errors.password).toBeUndefined();
    });

    it("returns password required error when only password is empty", () => {
      const errors = validateLogin("test@email.com", "");
      expect(errors.email).toBeUndefined();
      expect(errors.password).toBe("Password is required.");
    });

    it("treats whitespace-only email as empty", () => {
      const errors = validateLogin("   ", "password123");
      expect(errors.email).toBe("Email is required.");
    });

    it("treats whitespace-only password as empty", () => {
      const errors = validateLogin("test@email.com", "   ");
      expect(errors.password).toBe("Password is required.");
    });
  });

  // ─────────────────────────────────────────────
  // Invalid email format
  // ─────────────────────────────────────────────
  describe("invalid email format", () => {
    it("returns invalid email error for email without @", () => {
      const errors = validateLogin("wrongemail", "password123");
      expect(errors.email).toBe("Email is invalid.");
    });

    it("returns invalid email error for email without domain", () => {
      const errors = validateLogin("user@", "password123");
      expect(errors.email).toBe("Email is invalid.");
    });

    it("returns invalid email error for email without top-level domain", () => {
      const errors = validateLogin("user@domain", "password123");
      expect(errors.email).toBe("Email is invalid.");
    });

    it("returns invalid email error for email with spaces", () => {
      const errors = validateLogin("user @domain.com", "password123");
      expect(errors.email).toBe("Email is invalid.");
    });
  });

  // ─────────────────────────────────────────────
  // Valid inputs — no errors
  // ─────────────────────────────────────────────
  describe("valid inputs", () => {
    it("returns no errors for valid email and password", () => {
      const errors = validateLogin("airauy5@gmail.com", "illyriady");
      expect(Object.keys(errors).length).toBe(0);
    });

    it("returns no errors for valid email and any non-empty password", () => {
      const errors = validateLogin("test@example.com", "abcdefgh");
      expect(Object.keys(errors).length).toBe(0);
    });
  });
});
