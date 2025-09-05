import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { db } from "@/lib/database/client";
import { newPasswordSchema } from "@/lib/validations/auth";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { token, password, confirmPassword } = body;

    if (!token) {
      return NextResponse.json(
        { error: "Reset token is required" },
        { status: 400 }
      );
    }

    // Validate password data
    const validatedData = newPasswordSchema.parse({
      password,
      confirmPassword,
    });

    // Find user with valid reset token
    const user = await db.user.findFirst({
      where: {
        passwordResetToken: token,
        passwordResetExpires: {
          gt: new Date(), // Token must not be expired
        },
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Invalid or expired reset token" },
        { status: 400 }
      );
    }

    // Hash new password
    const passwordHash = await bcrypt.hash(validatedData.password, 12);

    // Update user with new password and clear reset token
    await db.user.update({
      where: { id: user.id },
      data: {
        passwordHash,
        passwordResetToken: null,
        passwordResetExpires: null,
      },
    });

    return NextResponse.json({
      success: true,
      message:
        "Password reset successful. You can now sign in with your new password.",
    });
  } catch (error) {
    console.error("Reset password error:", error);

    if (error instanceof Error && error.message.includes("validation")) {
      return NextResponse.json(
        { error: "Password validation failed", details: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
