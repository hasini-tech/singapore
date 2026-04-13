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
        token.firstName = (user as any).firstName;
        token.lastName = (user as any).lastName;
        token.avatarURL = (user as any).avatarURL;
        token.coverImageURL = (user as any).coverImageURL;
        token.headline = (user as any).headline;
        token.companyName = (user as any).companyName;
        token.location = (user as any).location;
        token.role = (user as any).role;
        token.isVerified = (user as any).isVerified;
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
          firstName: token.firstName as string | undefined,
          lastName: token.lastName as string | undefined,
          avatarURL: token.avatarURL as string | null | undefined,
          coverImageURL: token.coverImageURL as string | null | undefined,
          headline: token.headline as string | null | undefined,
          companyName: token.companyName as string | null | undefined,
          location: token.location as string | null | undefined,
          role: token.role as string | undefined,
          isVerified: token.isVerified as boolean | undefined,
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
            // Fetch the user's full profile so we have numeric ID, name, avatar, etc.
            let profile: any = null;
            try {
              const profileRes = await fetch('https://api.growthlab.sg/api/v1/auth/me', {
                headers: { Authorization: `Bearer ${data.access_token}` },
              });
              if (profileRes.ok) {
                profile = await profileRes.json();
              }
            } catch {
              // Profile fetch failed, continue with fallback data
            }

            return {
              id: profile?.id ? String(profile.id) : credentials?.email || '1',
              name: profile
                ? `${profile.firstName} ${profile.lastName}`
                : 'User',
              email: profile?.emailAddress || credentials?.email,
              accessToken: data.access_token,
              firstName: profile?.firstName,
              lastName: profile?.lastName,
              avatarURL: profile?.avatarURL || null,
              coverImageURL: profile?.coverImageURL || null,
              headline: profile?.headline || null,
              companyName: profile?.companyName || null,
              location: profile?.location || null,
              role: profile?.role,
              isVerified: profile?.isVerified || false,
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
