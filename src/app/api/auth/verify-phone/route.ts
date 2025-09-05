import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { db } from "@/lib/database/client";
import { createUniqueConstraintHash } from "@/lib/encryption";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { code } = body;

    if (!code || code.length !== 6) {
      return NextResponse.json(
        { error: "6-digit verification code is required" },
        { status: 400 }
      );
    }

    // Get user from database
    const user = await db.user.findUnique({
      where: { id: session.user.id },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (user.phoneVerified) {
      return NextResponse.json(
        { error: "Phone number is already verified" },
        { status: 400 }
      );
    }

    // Check if verification code exists and is not expired
    if (
      !user.phoneVerificationExpires ||
      user.phoneVerificationExpires < new Date()
    ) {
      return NextResponse.json(
        { error: "Verification code has expired. Please request a new one." },
        { status: 400 }
      );
    }

    // Note: In real implementation, we would decrypt and compare the code
    // For now, we'll use a hash comparison approach
    const codeHash = createUniqueConstraintHash(code);
    const storedCodeHash = user.phoneVerificationCode_hash;

    if (!storedCodeHash || storedCodeHash !== codeHash) {
      return NextResponse.json(
        { error: "Invalid verification code" },
        { status: 400 }
      );
    }

    // Mark phone as verified
    await db.user.update({
      where: { id: user.id },
      data: {
        phoneVerified: true,
        phoneVerificationCode_encrypted: null, // Clear the code
        phoneVerificationCode_hash: null,
        phoneVerificationExpires: null,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Phone number verified successfully!",
    });
  } catch (error) {
    console.error("Phone verification error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
