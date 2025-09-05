import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../[...nextauth]/route";
import { db } from "@/lib/database/client";
import bcrypt from "bcryptjs";
import { z } from "zod";

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      "Password must contain at least one uppercase letter, one lowercase letter, and one number"
    ),
});

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = changePasswordSchema.parse(body);

    // Get current user with password hash
    const user = await db.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        passwordHash: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Verify current password
    if (!user.passwordHash) {
      return NextResponse.json({ error: "Password not set" }, { status: 400 });
    }

    const isCurrentPasswordValid = await bcrypt.compare(
      validatedData.currentPassword,
      user.passwordHash
    );

    if (!isCurrentPasswordValid) {
      return NextResponse.json(
        { error: "Current password is incorrect" },
        { status: 400 }
      );
    }

    // Check if new password is different from current
    const isSamePassword = await bcrypt.compare(
      validatedData.newPassword,
      user.passwordHash
    );

    if (isSamePassword) {
      return NextResponse.json(
        { error: "New password must be different from current password" },
        { status: 400 }
      );
    }

    // Hash new password
    const newPasswordHash = await bcrypt.hash(validatedData.newPassword, 12);

    // Update password in database
    await db.user.update({
      where: { id: user.id },
      data: {
        passwordHash: newPasswordHash,
        updatedAt: new Date(),
      },
    });

    // TODO: Send email notification about password change when SMTP is configured
    console.log(
      `Password changed for user ${session.user.id} at ${new Date().toISOString()}`
    );

    return NextResponse.json({
      success: true,
      message: "Password changed successfully",
    });
  } catch (error) {
    console.error("Change password error:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
