import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "mock_client_id",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "mock_client_secret",
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Please enter an email and password.");
        }

        const email = credentials.email.trim().toLowerCase();

        // 1. Try finding user in Postgres DB via Prisma
        let user = null;
        try {
          user = await prisma.user.findUnique({
            where: { email },
          });
        } catch (err) {
          console.warn("DB user lookup warning:", err);
        }

        // Demo User Fallback if DB user doesn't exist yet
        if (!user && (email === "client@elantraa.com" || email === "admin@elantraa.com")) {
          const isDemoAdmin = email === "admin@elantraa.com";
          return {
            id: isDemoAdmin ? "user_admin_demo" : "user_client_demo",
            name: isDemoAdmin ? "Victoria Sterling (Admin)" : "Ananya Sharma",
            email: credentials.email,
            role: isDemoAdmin ? "ADMIN" : "CUSTOMER",
          };
        }

        if (!user || !user.passwordHash) {
          throw new Error("No account found with this email.");
        }

        const isValid = await bcrypt.compare(credentials.password, user.passwordHash);
        if (!isValid) {
          throw new Error("Incorrect password. Please try again.");
        }

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        };
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as { role?: string }).role || "CUSTOMER";
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        const u = session.user as { id?: string; role?: string; name?: string | null; email?: string | null };
        u.id = token.id as string;
        u.role = token.role as string;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
  secret: process.env.NEXTAUTH_SECRET || "elantraa_luxury_haute_couture_secret_key_2026",
};
