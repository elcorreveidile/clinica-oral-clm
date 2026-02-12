import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import AppleProvider from "next-auth/providers/apple";
import { PrismaAdapter } from "@auth/prisma-adapter";
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
    async signIn({ user, email }) {
      if (!email) return false;

      // Si es email de la universidad y no tiene rol, asignar TEACHER
      const emailLower = email.toLowerCase();
      const isUniversityEmail = emailLower.endsWith("@ugr.es") || emailLower.endsWith("@go.ugr.es");

      const existingUser = await db.user.findUnique({
        where: { email: emailLower },
      });

      if (existingUser && existingUser.role === "STUDENT" && isUniversityEmail) {
        // Actualizar a TEACHER si es email universitario
        await db.user.update({
          where: { email: emailLower },
          data: { role: "TEACHER" },
        });
      } else if (!existingUser && isUniversityEmail) {
        // Es primer registro de email universitario, actualizar rol a TEACHER
        await db.user.update({
          where: { email: emailLower },
          data: { role: "TEACHER" },
        });
      }

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
  },
};
