import { DefaultSession, DefaultUser } from 'next-auth';
import 'next-auth/jwt';

declare module 'next-auth' {
  interface User extends DefaultUser {
    id: string;
    firstName?: string;
    lastName?: string;
    avatarURL?: string | null;
    coverImageURL?: string | null;
    headline?: string | null;
    companyName?: string | null;
    location?: string | null;
    role?: string;
    isVerified?: boolean;
    accessToken?: string;
    refreshToken?: string;
  }

  interface Session {
    user: {
      id: string;
      firstName?: string;
      lastName?: string;
      avatarURL?: string | null;
      coverImageURL?: string | null;
      headline?: string | null;
      companyName?: string | null;
      location?: string | null;
      role?: string;
      isVerified?: boolean;
    } & DefaultSession['user'];
    accessToken?: string;
    refreshToken?: string;
  }
}

declare module 'next-auth/jwt' {
  /** Returned by the `jwt` callback and `getToken`, when using JWT sessions */
  interface JWT {
    id?: string;
    idToken?: string;
    accessToken?: string;
    refreshToken?: string;
    firstName?: string;
    lastName?: string;
    avatarURL?: string | null;
    coverImageURL?: string | null;
    headline?: string | null;
    companyName?: string | null;
    location?: string | null;
    role?: string;
    isVerified?: boolean;
  }
}
