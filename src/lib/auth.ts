

import NextAuth from 'next-auth';
import { getServerSession } from 'next-auth';
import type { NextAuthOptions, Session } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import type { JWT } from 'next-auth/jwt';
import bcrypt from 'bcryptjs';

import { db } from '@/lib/db';

export const authOptions: NextAuthOptions = {
  // ⚠️ NO ADAPTER - JWT strategy manages sessions
  session: { strategy: 'jwt' },
  secret: process.env.NEXTAUTH_SECRET,
  
  callbacks: {
    async redirect({ url, baseUrl }) {
      if (url?.startsWith('/')) return `${baseUrl}${url}`;
      try {
        const target = new URL(url);
        if (target.origin === baseUrl) return url;
      } catch (e) {
        // Fallback
      }
      return baseUrl;
    },

    async jwt({ token, user }: { token: JWT; user?: any }) {
      // ✅ On sign in, store the Prisma User.id in the token
      if (user?.id) {
        token.sub = user.id;
      }
      return token;
    },

    async session({ session, token }: { session: Session; token: JWT }) {
      // ✅ Ensure session.user.id comes from token.sub (Prisma User.id)
      if (token.sub) {
        session.user.id = token.sub;
      }
      return session;
    },
  },

  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },

      async authorize(credentials) {
        const email = credentials?.email;
        const password = credentials?.password;

        if (!email || !password) return null;

        // Fetch user from Prisma
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

        // Verify password
        const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
        if (!isPasswordValid) return null;

        // ✅ Return Prisma User object with id
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