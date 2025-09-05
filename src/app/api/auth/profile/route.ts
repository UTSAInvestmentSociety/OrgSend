import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../[...nextauth]/route";
import { db } from "@/lib/database/client";
import { z } from "zod";
import { createUniqueConstraintHash } from "@/lib/encryption";

const updateProfileSchema = z.object({
  firstName: z.string().min(2).max(50),
  lastName: z.string().min(2).max(50),
  communicationPreference: z.enum(["EMAIL_ONLY", "SMS_ONLY", "BOTH"]),
});

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await db.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        firstName_encrypted: true,
        lastName_encrypted: true,
        email_encrypted: true,
        userType: true,
        emailVerified: true,
        phoneVerified: true,
        communicationPreference: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // For now, return encrypted data as-is since we don't have middleware
    // TODO: Implement decryption when encryption middleware is updated
    return NextResponse.json({
      user: {
        id: user.id,
        firstName: "Encrypted", // TODO: Decrypt user.firstName_encrypted
        lastName: "Data", // TODO: Decrypt user.lastName_encrypted
        email: "pending@decrypt.com", // TODO: Decrypt user.email_encrypted
        userType: user.userType,
        emailVerified: user.emailVerified,
        phoneVerified: user.phoneVerified,
        communicationPreference: user.communicationPreference,
      },
    });
  } catch (error) {
    console.error("Get profile error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = updateProfileSchema.parse(body);

    // For now, store data directly without encryption
    // TODO: Implement encryption when encryption middleware is updated
    const updatedUser = await db.user.update({
      where: { id: session.user.id },
      data: {
        // TODO: Encrypt these fields when encryption is working
        firstName_encrypted: validatedData.firstName,
        lastName_encrypted: validatedData.lastName,
        communicationPreference: validatedData.communicationPreference,
        updatedAt: new Date(),
      },
      select: {
        id: true,
        firstName_encrypted: true,
        lastName_encrypted: true,
        userType: true,
        emailVerified: true,
        phoneVerified: true,
        communicationPreference: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Profile updated successfully",
      user: {
        id: updatedUser.id,
        firstName: updatedUser.firstName_encrypted, // This is temporarily plaintext
        lastName: updatedUser.lastName_encrypted, // This is temporarily plaintext
        userType: updatedUser.userType,
        emailVerified: updatedUser.emailVerified,
        phoneVerified: updatedUser.phoneVerified,
        communicationPreference: updatedUser.communicationPreference,
      },
    });
  } catch (error) {
    console.error("Update profile error:", error);

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
