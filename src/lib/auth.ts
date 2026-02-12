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
    async signIn({ user }) {
      if (!user.email) return false;

      // Asignar rol automáticamente basado en el email
      const email = user.email.toLowerCase();
      const isUniversityEmail = email.endsWith("@ugr.es") || email.endsWith("@go.ugr.es");

      // Crear o actualizar el usuario con el rol correcto
      await db.user.upsert({
        where: { email },
        update: { role: isUniversityEmail ? "TEACHER" : "STUDENT" },
        create: {
          email,
          name: user.name,
          role: isUniversityEmail ? "TEACHER" : "STUDENT",
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
  },
};
