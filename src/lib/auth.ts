import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import AppleProvider from "next-auth/providers/apple";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { cookies } from "next/headers";
import { db } from "@/lib/db";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(db) as NextAuthOptions["adapter"],
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    AppleProvider({
      clientId: process.env.APPLE_ID!,
      clientSecret: {
        teamId: process.env.APPLE_TEAM_ID!,
        privateKey: process.env.APPLE_PRIVATE_KEY!,
        keyId: process.env.APPLE_KEY_ID!,
      } as unknown as string,
    }),
  ],
  callbacks: {
    async signIn({ user }) {
      // ── Returning user: allow sign-in without access code ──
      const existingUser = await db.user.findUnique({
        where: { email: user.email! },
      });

      if (existingUser) {
        return true;
      }

      // ── New user: validate access code ──
      const cookieStore = cookies();
      const accessCode = cookieStore.get("clinic-access-code")?.value;

      if (!accessCode) {
        return "/auth/signin?error=AccessCodeRequired";
      }

      const codeRecord = await db.accessCode.findUnique({
        where: { code: accessCode },
      });

      if (!codeRecord) {
        return "/auth/signin?error=InvalidAccessCode";
      }

      if (codeRecord.isUsed) {
        return "/auth/signin?error=AccessCodeUsed";
      }

      if (codeRecord.expiresAt && codeRecord.expiresAt < new Date()) {
        return "/auth/signin?error=AccessCodeExpired";
      }

      // ── Valid code: mark as used and allow registration ──
      await db.accessCode.update({
        where: { id: codeRecord.id },
        data: {
          isUsed: true,
          usedBy: user.email,
        },
      });

      return true;
    },

    async session({ session, user }) {
      if (session.user) {
        session.user.id = user.id;
        const dbUser = await db.user.findUnique({
          where: { id: user.id },
          select: { role: true, accessCode: true },
        });
        session.user.role = dbUser?.role ?? "STUDENT";
        session.user.hasAccessCode = !!dbUser?.accessCode;
      }
      return session;
    },
  },
  pages: {
    signIn: "/auth/signin",
    error: "/auth/signin",
  },
};
