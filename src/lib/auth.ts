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
    async session({ session, user }) {
      if (session.user) {
        session.user.id = user.id;
        const dbUser = await db.user.findUnique({
          where: { id: user.id },
          select: { role: true, accessCode: true, email: true },
        });

        // Si es email universitario y es STUDENT, promover a TEACHER
        if (dbUser?.email && dbUser.role === "STUDENT") {
          const emailLower = dbUser.email.toLowerCase();
          const isUniversityEmail = emailLower.endsWith("@ugr.es") || emailLower.endsWith("@go.ugr.es");

          if (isUniversityEmail) {
            await db.user.update({
              where: { id: user.id },
              data: { role: "TEACHER" },
            });
            session.user.role = "TEACHER";
          } else {
            session.user.role = "STUDENT";
          }
        } else {
          session.user.role = dbUser?.role ?? "STUDENT";
        }

        session.user.hasAccessCode = !!dbUser?.accessCode;
      }
      return session;
    },
  },
  pages: {
    signIn: "/auth/signin",
  },
};
