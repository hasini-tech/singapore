import { DefaultSession } from 'next-auth';
import 'next-auth/jwt';

declare module 'next-auth' {
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
  }
}

declare module 'next-auth/jwt' {
  /** Returned by the `jwt` callback and `getToken`, when using JWT sessions */
  interface JWT {
    idToken?: string;
    accessToken?: string;
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
