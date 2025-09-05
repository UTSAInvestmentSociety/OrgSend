import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { db } from "@/lib/database/client";
import { encrypt, createUniqueConstraintHash } from "@/lib/encryption";
import {
  sendPhoneVerificationSMS,
  generateVerificationCode,
  isSMSServiceAvailable,
} from "@/lib/services/sms";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    // Check if SMS service is available
    if (!isSMSServiceAvailable()) {
      return NextResponse.json({
        success: false,
        message:
          "SMS verification is not currently available. Phone verification will be enabled once our toll-free number is approved (1-7 business days).",
        mockMode: true,
      });
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

    // Generate verification code
    const verificationCode = generateVerificationCode();
    const codeExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Update user with verification code (encrypted)
    await db.user.update({
      where: { id: user.id },
      data: {
        phoneVerificationCode_encrypted: verificationCode, // TODO: Encrypt when middleware ready
        phoneVerificationCode_hash:
          createUniqueConstraintHash(verificationCode),
        phoneVerificationExpires: codeExpires,
      },
    });

    // TODO: Send SMS when service is available
    // For now, just mock the SMS sending
    const smsSent = await sendPhoneVerificationSMS({
      phone: user.phone_encrypted ? "ENCRYPTED_PHONE" : "+1XXXXXXXXXX",
      code: verificationCode,
      firstName: user.firstName_encrypted ? "ENCRYPTED_NAME" : "User",
    });

    if (!smsSent) {
      return NextResponse.json(
        { error: "Failed to send verification SMS" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Verification code sent (check console in development)",
      expiresIn: 10 * 60, // 10 minutes in seconds
    });
  } catch (error) {
    console.error("Send phone verification error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
