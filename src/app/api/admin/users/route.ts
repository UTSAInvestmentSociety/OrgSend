import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]/route";
import { db } from "@/lib/database/client";
import { UserRole } from "@/types/database";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user is admin
    const adminUser = await db.user.findUnique({
      where: { id: session.user.id },
      select: { role: true },
    });

    if (!adminUser || adminUser.role !== UserRole.ADMIN) {
      return NextResponse.json(
        { error: "Admin access required" },
        { status: 403 }
      );
    }

    // Get all users with basic info (temporarily without decryption)
    const users = await db.user.findMany({
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
      orderBy: {
        createdAt: "desc",
      },
    });

    // Transform users for display (temporarily showing encrypted data as placeholder)
    const transformedUsers = users.map((user) => ({
      id: user.id,
      firstName: user.firstName_encrypted || "Encrypted", // TODO: Decrypt when encryption middleware is ready
      lastName: user.lastName_encrypted || "Data", // TODO: Decrypt when encryption middleware is ready
      email: user.email_encrypted || "encrypted@example.com", // TODO: Decrypt when encryption middleware is ready
      userType: user.userType,
      emailVerified: user.emailVerified,
      phoneVerified: user.phoneVerified,
      communicationPreference: user.communicationPreference,
      createdAt: user.createdAt.toISOString(),
    }));

    const stats = {
      total: users.length,
      verified: users.filter((u) => u.emailVerified).length,
      unverified: users.filter((u) => !u.emailVerified).length,
      phoneVerified: users.filter((u) => u.phoneVerified).length,
    };

    return NextResponse.json({
      users: transformedUsers,
      stats,
    });
  } catch (error) {
    console.error("Admin users fetch error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user is admin
    const adminUser = await db.user.findUnique({
      where: { id: session.user.id },
      select: { role: true },
    });

    if (!adminUser || adminUser.role !== UserRole.ADMIN) {
      return NextResponse.json(
        { error: "Admin access required" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { userId, updates } = body;

    if (!userId || !updates) {
      return NextResponse.json(
        { error: "Missing userId or updates" },
        { status: 400 }
      );
    }

    // Only allow specific fields to be updated
    const allowedUpdates: any = {};
    if ("emailVerified" in updates) {
      allowedUpdates.emailVerified = updates.emailVerified;
    }
    if ("phoneVerified" in updates) {
      allowedUpdates.phoneVerified = updates.phoneVerified;
    }
    if (
      "userType" in updates &&
      ["MEMBER", "OFFICER", "ADMIN"].includes(updates.userType)
    ) {
      allowedUpdates.userType = updates.userType;
    }

    const updatedUser = await db.user.update({
      where: { id: userId },
      data: {
        ...allowedUpdates,
        updatedAt: new Date(),
      },
      select: {
        id: true,
        userType: true,
        emailVerified: true,
        phoneVerified: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: "User updated successfully",
      user: updatedUser,
    });
  } catch (error) {
    console.error("Admin user update error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
