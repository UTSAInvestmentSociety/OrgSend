import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/database/client";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { token } = body;

    if (!token) {
      return NextResponse.json(
        { error: "Verification token is required" },
        { status: 400 }
      );
    }

    // Find user with this verification token
    const user = await db.user.findFirst({
      where: {
        emailVerificationToken: token,
        emailVerificationExpires: {
          gt: new Date(), // Token must not be expired
        },
        emailVerified: false, // Only verify users who haven't been verified yet
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Invalid or expired verification token" },
        { status: 400 }
      );
    }

    // Update user as verified
    await db.user.update({
      where: { id: user.id },
      data: {
        emailVerified: true,
        emailVerificationToken: null, // Clear token after use
        emailVerificationExpires: null,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Email verified successfully. You can now sign in.",
    });
  } catch (error) {
    console.error("Email verification error:", error);
    return NextResponse.json(
      { error: "Internal server error during verification" },
      { status: 500 }
    );
  }
}

// Also handle GET requests for direct link verification
export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const token = url.searchParams.get("token");

  if (!token) {
    return NextResponse.json(
      { error: "Verification token is required" },
      { status: 400 }
    );
  }

  // Use the same logic as POST
  const postRequest = new NextRequest(request.url, {
    method: "POST",
    body: JSON.stringify({ token }),
    headers: { "Content-Type": "application/json" },
  });

  return POST(postRequest);
}
