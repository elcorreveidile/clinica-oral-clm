import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import AppleProvider from "next-auth/providers/apple";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { cookies } from "next/headers";
import { compare } from "bcryptjs";
import { db } from "@/lib/db";
import { Role } from "@prisma/client";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(db) as NextAuthOptions["adapter"],
  session: { strategy: "jwt" },
  providers: [
    // ── Email / Password ──
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Contraseña", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email y contraseña son obligatorios");
        }

        const user = await db.user.findUnique({
          where: { email: credentials.email },
        });

        if (!user || !user.password) {
          throw new Error("Credenciales incorrectas");
        }

        const isValid = await compare(credentials.password, user.password);
        if (!isValid) {
          throw new Error("Credenciales incorrectas");
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        };
      },
    }),

    // ── OAuth (optional – only enabled when env vars are set) ──
    ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
      ? [
          GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
          }),
        ]
      : []),

    ...(process.env.APPLE_ID && process.env.APPLE_PRIVATE_KEY
      ? [
          AppleProvider({
            clientId: process.env.APPLE_ID!,
            clientSecret: {
              teamId: process.env.APPLE_TEAM_ID!,
              privateKey: process.env.APPLE_PRIVATE_KEY!,
              keyId: process.env.APPLE_KEY_ID!,
            } as unknown as string,
          }),
        ]
      : []),
  ],
  callbacks: {
    async signIn({ user, account }) {
      // Credentials login already validated in authorize()
      if (account?.provider === "credentials") {
        return true;
      }

      // ── OAuth: Returning user ──
      const existingUser = await db.user.findUnique({
        where: { email: user.email! },
      });

      if (existingUser) {
        return true;
      }

      // ── OAuth: New user – validate access code ──
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

      await db.accessCode.update({
        where: { id: codeRecord.id },
        data: {
          isUsed: true,
          usedBy: user.email,
        },
      });

      return true;
    },

    async jwt({ token, user }) {
      if (user) {
        // For credentials, user object already has role from authorize()
        if ("role" in user) {
          token.id = user.id;
          token.role = user.role;
          token.hasAccessCode = false;
        } else {
          const dbUser = await db.user.findUnique({
            where: { email: user.email! },
            select: { id: true, role: true, accessCode: true },
          });
          if (dbUser) {
            token.id = dbUser.id;
            token.role = dbUser.role;
            token.hasAccessCode = !!dbUser.accessCode;
          }
        }
      }
      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = (token.role as Role) ?? "STUDENT";
        session.user.hasAccessCode = (token.hasAccessCode as boolean) ?? false;
      }
      return session;
    },
  },
  pages: {
    signIn: "/auth/signin",
    error: "/auth/signin",
  },
};
