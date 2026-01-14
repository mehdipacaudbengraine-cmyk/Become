import NextAuth from "next-auth";
import { getServerSession } from "next-auth";
import type { NextAuthOptions } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import type { Adapter } from "next-auth/adapters";
import bcrypt from "bcryptjs";

import { db } from "@/lib/db";

export const authOptions: NextAuthOptions = {
  // ✅ Cast Adapter = évite le conflit de types entre versions
  adapter: PrismaAdapter(db) as Adapter,

  session: { strategy: "jwt" },
  callbacks: {
    // Ensure redirect URLs are validated and never point to a different host/port.
    // This prevents NextAuth from redirecting to an unexpected origin (e.g. 3002).
    async redirect({ url, baseUrl }) {
      // Allow relative paths
      if (url?.startsWith('/')) return `${baseUrl}${url}`;

      try {
        const target = new URL(url);
        if (target.origin === baseUrl) return url;
      } catch (e) {
        // If URL parsing fails, fallback to baseUrl
      }

      return baseUrl;
    },
    async jwt({ token, user }) {
      // On initial sign in, `user` is available — persist its id to the token
      if (user && (user as any).id) {
        (token as any).id = (user as any).id;
        (token as any).userId = (user as any).id;
        // also mirror to `sub` since some parts may read `sub`
        (token as any).sub = (user as any).id;
      }

      // If token already has sub but not id, ensure id is set
      if (!(token as any).id && (token as any).sub) {
        (token as any).id = (token as any).sub;
      }

      if (!(token as any).userId && (token as any).id) {
        (token as any).userId = (token as any).id;
      }

      return token;
    },

    async session({ session, token }) {
      // Ensure session.user.id exists and comes from token.id
      const id = (token as any).id || (token as any).sub || (token as any).userId;
      if (id) {
        session.user = session.user || ({} as any);
        (session.user as any).id = id;
      }

      return session;
    },
  },

  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },

      async authorize(credentials) {
        const email = credentials?.email;
        const password = credentials?.password;

        if (!email || !password) return null;

        // ⚠️ ici on utilise passwordHash (pas password)
        const user = await db.user.findUnique({
          where: { email },
          select: {
            id: true,
            email: true,
            name: true,
            passwordHash: true,
          },
        });

        if (!user?.passwordHash) return null;

        const ok = await bcrypt.compare(password, user.passwordHash);
        if (!ok) return null;

        // ✅ On force name non-null pour calmer TS si ton type l’exige
        return {
          id: user.id,
          email: user.email,
          name: user.name ?? user.email,
        };
      },
    }),
  ],
};

export default NextAuth(authOptions);

export async function auth() {
  return await getServerSession(authOptions);
}
