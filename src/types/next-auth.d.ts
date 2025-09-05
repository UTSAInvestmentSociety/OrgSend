import NextAuth, { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email: string;
      firstName: string;
      lastName: string;
      role: string;
      userType: string | null;
      emailVerified: boolean;
      phoneVerified: boolean;
      communicationPreference: string;
    } & DefaultSession["user"];
  }

  interface User {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: string;
    userType: string | null;
    emailVerified: boolean;
    phoneVerified: boolean;
    communicationPreference: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    firstName: string;
    lastName: string;
    role: string;
    userType: string | null;
    emailVerified: boolean;
    phoneVerified: boolean;
    communicationPreference: string;
  }
}
