import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { db } from "@/lib/database/client";
import { registerSchema } from "@/lib/validations/auth";
import { createUniqueConstraintHash } from "@/lib/encryption";
import { sendVerificationEmail, getBaseUrl } from "@/lib/services/email";
import { randomBytes } from "crypto";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = registerSchema.parse(body);

    // Check if user already exists with this email
    const emailHash = createUniqueConstraintHash(validatedData.email);
    const existingUser = await db.user.findUnique({
      where: { email_hash: emailHash },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "User with this email already exists" },
        { status: 400 }
      );
    }

    // Hash password
    const passwordHash = await bcrypt.hash(validatedData.password, 12);

    // Generate email verification token
    const emailVerificationToken = randomBytes(32).toString("hex");
    const emailVerificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    // Create user with encrypted PII data
    // TODO: Use encryption middleware when available, for now using manual field names
    const user = await db.user.create({
      data: {
        firstName_encrypted: validatedData.firstName, // TODO: Encrypt when middleware ready
        firstName_hash: createUniqueConstraintHash(validatedData.firstName),
        lastName_encrypted: validatedData.lastName, // TODO: Encrypt when middleware ready
        lastName_hash: createUniqueConstraintHash(validatedData.lastName),
        email_encrypted: validatedData.email, // TODO: Encrypt when middleware ready
        email_hash: emailHash,
        ...(validatedData.phone && {
          phone_encrypted: validatedData.phone, // TODO: Encrypt when middleware ready
          phone_hash: createUniqueConstraintHash(validatedData.phone),
        }),
        passwordHash,
        userType: validatedData.userType,
        communicationPreference: validatedData.communicationPreference,
        emailVerificationToken,
        emailVerificationExpires,
        emailVerified: false,
        phoneVerified: false, // Will be verified later via SMS
      },
    });

    // Send verification email
    try {
      await sendVerificationEmail({
        to: validatedData.email,
        firstName: validatedData.firstName,
        token: emailVerificationToken,
        baseUrl: getBaseUrl(),
      });
    } catch (emailError) {
      console.error("Failed to send verification email:", emailError);
      // Don't fail registration if email sending fails
    }

    return NextResponse.json(
      {
        success: true,
        message:
          "Registration successful. Please check your email (or console) to verify your account.",
        userId: user.id,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Registration error:", error);

    if (error instanceof Error && error.message.includes("Validation")) {
      return NextResponse.json(
        { error: "Invalid registration data", details: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Internal server error during registration" },
      { status: 500 }
    );
  }
}
