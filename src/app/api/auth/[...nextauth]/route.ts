import NextAuth, { NextAuthOptions } from "next-auth";
import { db } from "@/lib/database/client";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { createUniqueConstraintHash } from "@/lib/encryption";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        try {
          // Hash email for lookup
          const emailHash = createUniqueConstraintHash(credentials.email);

          // Find user by email hash
          const user = await db.user.findUnique({
            where: { email_hash: emailHash },
          });

          if (!user) {
            return null;
          }

          // Verify password
          if (!user.passwordHash) {
            return null;
          }

          const isValidPassword = await bcrypt.compare(
            credentials.password,
            user.passwordHash
          );

          if (!isValidPassword) {
            return null;
          }

          // Check if email is verified
          if (!user.emailVerified) {
            throw new Error("Please verify your email before signing in");
          }

          // Update last login
          await db.user.update({
            where: { id: user.id },
            data: { lastLoginAt: new Date() },
          });

          return {
            id: user.id,
            email: credentials.email, // Use the provided email (decrypted)
            firstName: user.firstName_encrypted || "User", // TODO: Decrypt when encryption is ready
            lastName: user.lastName_encrypted || "", // TODO: Decrypt when encryption is ready
            emailVerified: Boolean(user.emailVerified),
            phoneVerified: Boolean(user.phoneVerified),
            role: user.role,
            userType: user.userType,
            communicationPreference: user.communicationPreference,
          };
        } catch (error) {
          console.error("Auth error:", error);
          return null;
        }
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.firstName = user.firstName;
        token.lastName = user.lastName;
        token.role = user.role;
        token.userType = user.userType;
        token.emailVerified = Boolean(user.emailVerified);
        token.phoneVerified = user.phoneVerified;
        token.communicationPreference = user.communicationPreference;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub!;
        session.user.firstName = token.firstName as string;
        session.user.lastName = token.lastName as string;
        session.user.role = token.role as string;
        session.user.userType = token.userType as string;
        session.user.emailVerified = token.emailVerified as boolean;
        session.user.phoneVerified = token.phoneVerified as boolean;
        session.user.communicationPreference =
          token.communicationPreference as string;
      }
      return session;
    },
  },
  pages: {
    signIn: "/auth/signin",
    error: "/auth/error",
  },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
