import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import AppleProvider from "next-auth/providers/apple";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { db } from "@/lib/db";

// Crear un proveedor de credenciales personalizado para email/contraseña
import CredentialsProvider from "next-auth/providers/credentials";

// Estrategia para hashear contraseñas sin NextAuth
async function verifyPassword(email: string, password: string) {
  const user = await db.user.findUnique({
    where: { email: email.toLowerCase() },
  });

  if (!user || !user.password) {
    return null;
  }

  // Importar bcrypt dinámicamente solo cuando se necesite
  const bcrypt = (await import('bcryptjs')).default;
  const isValid = await bcrypt.compare(password, user.password);

  if (!isValid) {
    return null;
  }

  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
  };
}

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
    CredentialsProvider({
      id: "credentials",
      name: "Credenciales",
      type: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Contraseña", type: "password" },
      },
      async authorize(credentials) {
        const user = await verifyPassword(
          credentials.email as string,
          credentials.password as string
        );

        if (!user) {
          return null;
        }

        return user;
      },
    }),
  ],
  callbacks: {
    async session({ session, user }) {
      if (session.user) {
        session.user.id = user.id;

        try {
          const dbUser = await db.user.findUnique({
            where: { id: user.id },
            select: { role: true, accessCode: true, email: true },
          });

          if (!dbUser) {
            // If user not found in DB, use values from authorize function
            session.user.role = (user as any).role || "STUDENT";
            session.user.hasAccessCode = false;
            return session;
          }

          // Si es email universitario y es STUDENT, promover a TEACHER
          if (dbUser.email && dbUser.role === "STUDENT") {
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
            session.user.role = dbUser.role || "STUDENT";
          }

          session.user.hasAccessCode = !!dbUser.accessCode;
        } catch (error) {
          console.error("Error in session callback:", error);
          // Fallback to user object from authorize
          session.user.role = (user as any).role || "STUDENT";
          session.user.hasAccessCode = false;
        }
      }
      return session;
    },
  },
  pages: {
    signIn: "/auth/signin",
  },
};
