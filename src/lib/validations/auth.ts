import { z } from "zod";

// Password validation schema with complexity requirements
const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .regex(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
    "Password must contain: lowercase, uppercase, number, and special character"
  );

// US phone number validation (format: +1XXXXXXXXXX)
const phoneSchema = z
  .string()
  .regex(
    /^\+1[0-9]{10}$/,
    "Phone must be in US format: +1XXXXXXXXXX (no spaces or dashes)"
  );

export const registerSchema = z
  .object({
    firstName: z
      .string()
      .min(2, "First name must be at least 2 characters")
      .max(50, "First name must be less than 50 characters")
      .regex(
        /^[a-zA-Z\s'-]+$/,
        "First name can only contain letters, spaces, hyphens, and apostrophes"
      ),

    lastName: z
      .string()
      .min(2, "Last name must be at least 2 characters")
      .max(50, "Last name must be less than 50 characters")
      .regex(
        /^[a-zA-Z\s'-]+$/,
        "Last name can only contain letters, spaces, hyphens, and apostrophes"
      ),

    email: z.string().email("Please enter a valid email address").toLowerCase(),

    phone: phoneSchema,

    password: passwordSchema,

    confirmPassword: z.string(),

    communicationPreference: z.enum(["EMAIL_ONLY", "SMS_ONLY", "BOTH"], {
      required_error: "Please select a communication preference",
    }),

    userType: z.enum(["STUDENT", "ALUMNI", "INDUSTRY_PROFESSIONAL"], {
      required_error: "Please select your user type",
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address").toLowerCase(),
  password: z.string().min(1, "Password is required"),
});

export const resetPasswordSchema = z.object({
  email: z.string().email("Please enter a valid email address").toLowerCase(),
});

export const newPasswordSchema = z
  .object({
    password: passwordSchema,
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export type RegisterFormData = z.infer<typeof registerSchema>;
export type LoginFormData = z.infer<typeof loginSchema>;
export type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;
export type NewPasswordFormData = z.infer<typeof newPasswordSchema>;
