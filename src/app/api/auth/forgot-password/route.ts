import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/database/client";
import { resetPasswordSchema } from "@/lib/validations/auth";
import { createUniqueConstraintHash } from "@/lib/encryption";
import { sendPasswordResetEmail, getBaseUrl } from "@/lib/services/email";
import { randomBytes } from "crypto";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = resetPasswordSchema.parse(body);

    // Find user by email hash
    const emailHash = createUniqueConstraintHash(validatedData.email);
    const user = await db.user.findUnique({
      where: { email_hash: emailHash },
    });

    // Always return success to prevent email enumeration attacks
    const successResponse = {
      success: true,
      message:
        "If an account with that email exists, you will receive a password reset link.",
    };

    // If user doesn't exist, still return success but don't send email
    if (!user) {
      return NextResponse.json(successResponse);
    }

    // Generate password reset token
    const resetToken = randomBytes(32).toString("hex");
    const resetExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    // Update user with reset token
    await db.user.update({
      where: { id: user.id },
      data: {
        passwordResetToken: resetToken,
        passwordResetExpires: resetExpires,
      },
    });

    // Send password reset email (currently logs to console)
    try {
      await sendPasswordResetEmail({
        to: validatedData.email,
        firstName: user.firstName_encrypted ? "User" : "User", // TODO: Decrypt name
        token: resetToken,
        baseUrl: getBaseUrl(),
      });
    } catch (emailError) {
      console.error("Failed to send password reset email:", emailError);
      // Don't fail the request if email sending fails
    }

    return NextResponse.json(successResponse);
  } catch (error) {
    console.error("Forgot password error:", error);

    if (error instanceof Error && error.message.includes("validation")) {
      return NextResponse.json(
        { error: "Invalid email address" },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
