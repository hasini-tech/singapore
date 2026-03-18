import { type NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';
import LinkedInProvider from 'next-auth/providers/linkedin';
import { env } from '@/env.mjs';
import { pagesOptions } from './pages-options';

export const authOptions: NextAuthOptions = {
  // debug: true,
  pages: {
    ...pagesOptions,
  },
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        // user object is only passed on the initial sign in
        token.accessToken = (user as any).accessToken;
        token.id = user.id;
        token.email = user.email;
        token.name = user.name;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        // pass the access token back to the client session
        (session as any).accessToken = token.accessToken;
        session.user = {
          ...session.user,
          id: token.id as string,
          name: token.name,
          email: token.email,
        };
      }
      return session;
    },
    async redirect({ url, baseUrl }) {
      return baseUrl;
    },
  },
  providers: [
    CredentialsProvider({
      id: 'credentials',
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials: any) {
        try {
          // Pointing directly to the provided external api url
          const response = await fetch('https://api.growthlab.sg/api/v1/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              emailAddress: credentials?.email, // Note: the external API expects emailAddress
              password: credentials?.password,
            }),
          });
          
          if (!response.ok) {
            return null; // NextAuth handles this by throwing a CredentialsSignin error
          }

          const data: any = await response.json();
          // API returns: {"access_token": "...", "refresh_token": "...", "token_type": "bearer", "expires_in": 1800}
          
          if (data && data.access_token) {
            return {
              id: credentials?.email || '1', // Using email as ID since user object is missing
              name: 'User',
              email: credentials?.email,
              accessToken: data.access_token,
            };
          }

          return null;
        } catch (error) {
          console.error("Login Error:", error);
          return null;
        }
      },
    }),
    GoogleProvider({
      clientId: env.GOOGLE_CLIENT_ID || '',
      clientSecret: env.GOOGLE_CLIENT_SECRET || '',
    }),
    LinkedInProvider({
      clientId: env.LINKEDIN_CLIENT_ID || '',
      clientSecret: env.LINKEDIN_CLIENT_SECRET || '',
    }),
  ],
};
