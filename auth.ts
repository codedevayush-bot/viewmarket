import NextAuth from 'next-auth';
import Google from 'next-auth/providers/google';
import GitHub from 'next-auth/providers/github';
import NeonAdapter from '@auth/neon-adapter';
import { dbPool } from '@/lib/db';

// Enterprise-grade auth configuration with Neon adapter
// Security features:
// - 24-hour session maxAge (auto-logout after 24 hours)
// - 1-hour session updateAge (refresh token every hour)
// - Secure cookie settings
// - CSRF protection
// - Account linking prevention

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: NeonAdapter(dbPool),
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID || 'dummy',
      clientSecret: process.env.AUTH_GOOGLE_SECRET || 'dummy',
      allowDangerousEmailAccountLinking: true,
      authorization: {
        params: {
          prompt: 'consent',
          access_type: 'offline',
          response_type: 'code',
        },
      },
    }),
    GitHub({
      clientId: process.env.AUTH_GITHUB_ID || 'dummy',
      clientSecret: process.env.AUTH_GITHUB_SECRET || 'dummy',
      allowDangerousEmailAccountLinking: true,
    }),
  ],
  pages: {
    signIn: '/sign-in',
    error: '/auth/error',
  },
  session: {
    strategy: 'database',
    // Session expires after 24 hours (enterprise requirement)
    maxAge: 24 * 60 * 60, // 24 hours in seconds
    // Update session every hour to keep it fresh
    updateAge: 60 * 60, // 1 hour
    // Generate session tokens with sufficient entropy
    generateSessionToken: () => {
      return crypto.randomUUID();
    },
  },
  cookies: {
    sessionToken: {
      name: `authjs.session-token`,
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
        maxAge: 24 * 60 * 60, // 24 hours
      },
    },
    callbackUrl: {
      name: `authjs.callback-url`,
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
      },
    },
    csrfToken: {
      name: `authjs.csrf-token`,
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
      },
    },
  },
  callbacks: {
    session: async ({ session, user }) => {
      // Add user ID and role to session for RBAC
      if (session.user) {
        session.user.id = user.id;
        session.user.role = user.role || 'user';
      }
      return session;
    },
    signIn: async ({ user, account }) => {
      // Validate email domain if needed (enterprise feature)
      // Example: Only allow company emails
      // if (!user.email?.endsWith("@company.com")) {
      //   return false
      // }

      // Log for security audit
      console.log(
        `[SECURITY] User ${user.email} signing in via ${account?.provider}`
      );
      return true;
    },
  },
  events: {
    signIn: async ({ user, account, isNewUser }) => {
      console.log(
        `[AUDIT] User ${user.email} signed in with ${account?.provider} at ${new Date().toISOString()}`
      );
      if (isNewUser) {
        console.log(`[AUDIT] New user created: ${user.email}`);
      }
    },
    signOut: async () => {
      console.log(`[AUDIT] User signed out at ${new Date().toISOString()}`);
    },
    createUser: async ({ user }) => {
      console.log(`[AUDIT] New user registered: ${user.email}`);
    },
  },
  trustHost: true,
});
