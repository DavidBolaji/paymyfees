import NextAuth from 'next-auth';
import Google from 'next-auth/providers/google';
import { prisma } from '@/src/database/prisma';
import { UserRole } from '@prisma/client';

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  ],
  session: { strategy: 'jwt' },
  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: '/auth/login',
    error: '/auth/login',
  },
  callbacks: {
    async signIn({ account, profile }) {
      if (!profile?.email) return false;
      return true;
    },

    async jwt({ token, account, profile }) {
      // Handle Google OAuth sign-in
      if (account?.provider === 'google' && profile) {
        const email = profile.email as string;
        const googleId = account.providerAccountId;

        // Find existing user by email or googleId
        const existingUser = await prisma.user.findFirst({
          where: {
            OR: [{ email }, { googleId }],
          },
        });

        if (existingUser) {
          // Link account if not already linked
          if (!existingUser.googleId) {
            await prisma.user.update({
              where: { id: existingUser.id },
              data: { googleId, emailVerified: true },
            });
          }
          token.userId = existingUser.id;
          // If existing email user: skip Phase 2, set profileComplete = true
          // If returning Google user: use their googleProfileComplete status
          token.profileComplete = !existingUser.googleId
            ? true // email user — already complete
            : existingUser.googleProfileComplete; // Google user — check their status
        } else {
          // Brand new Google user — create partial record
          const nameParts = (profile.name ?? '').split(' ');
          const firstName =
            (profile as any).given_name ?? nameParts[0] ?? 'User';
          const lastName =
            (profile as any).family_name ??
            nameParts.slice(1).join(' ') ??
            firstName;

          const newUser = await prisma.user.create({
            data: {
              email,
              googleId,
              firstName,
              lastName,
              fullName: `${firstName} ${lastName}`.trim(),
              profileImage: (profile as any).picture ?? null,
              role: UserRole.PARENT, // placeholder, will be updated in Phase 2
              country: 'Nigeria',
              emailVerified: true,
              googleProfileComplete: false,
              password: null, // null allowed after schema change
            },
          });
          token.userId = newUser.id;
          token.profileComplete = false; // Requires Phase 2
        }
      }
      return token;
    },

    async session({ session, token }) {
      session.user.id = token.userId as string;
      (session.user as any).profileComplete = token.profileComplete as boolean;
      return session;
    },
  },
});
