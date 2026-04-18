import { type NextAuthOptions, type Session, type User as NextAuthUser } from 'next-auth';
import { type JWT } from 'next-auth/jwt';
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';
import LinkedInProvider from 'next-auth/providers/linkedin';
import { env } from '@/env.mjs';
import { getApiBaseUrl } from '@/utils/api-base-url';
import { getUserServiceUrl } from '@/utils/get-user-service-url';
import { pagesOptions } from './pages-options';

type LoginCredentials = {
  [key: string]: string | boolean | undefined;
  email?: string;
  password?: string;
  rememberMe?: string | boolean;
  sourcePage?: string;
};

type LoginProfile = {
  id?: string | number;
  name?: string | null;
  email?: string | null;
  emailAddress?: string | null;
  role?: string;
  is_active?: boolean;
  isVerified?: boolean;
  firstName?: string;
  lastName?: string;
  avatarURL?: string | null;
  coverImageURL?: string | null;
  headline?: string | null;
  companyName?: string | null;
  location?: string | null;
};

type LoginResponse = {
  access_token?: string;
  refresh_token?: string;
  token_type?: string;
  expires_in?: number;
  user?: LoginProfile;
  success?: boolean;
  token?: string;
  data?: LoginProfile;
  message?: string;
  detail?: string;
};

const LOGIN_ENDPOINTS = ['/auth/login', '/api/users/login'] as const;
const LOGIN_AUDIT_ENDPOINTS = [
  '/auth/login-history',
  '/api/users/login-history',
] as const;
const LOGIN_SERVICE_UNAVAILABLE_ERROR = 'LoginServiceUnavailable';

function joinApiUrl(baseUrl: string, path: string) {
  const normalizedBaseUrl = baseUrl.replace(/\/$/, '');
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;

  return `${normalizedBaseUrl}${normalizedPath}`;
}

function firstHeader(
  headers: Record<string, string | string[] | undefined> | undefined,
  key: string
) {
  const value = headers?.[key];
  return Array.isArray(value) ? value[0] : value;
}

function toBoolean(
  value: string | boolean | undefined
): boolean | undefined {
  if (value === undefined) {
    return undefined;
  }

  if (typeof value === 'boolean') {
    return value;
  }

  return value === 'true' || value === '1' || value === 'on';
}

function parseLoginResponse(body: string): LoginResponse | null {
  if (!body.trim()) return null;

  try {
    return JSON.parse(body) as LoginResponse;
  } catch {
    return null;
  }
}

function buildLoginUser(response: LoginResponse): NextAuthUser | null {
  const accessToken = response.access_token ?? response.token;
  if (!accessToken) return null;

  const profile = response.user ?? response.data;
  const email = profile?.email ?? profile?.emailAddress ?? null;
  const name =
    profile?.name ||
    [profile?.firstName, profile?.lastName].filter(Boolean).join(' ') ||
    profile?.email ||
    profile?.emailAddress ||
    undefined;

  return {
    id: String(profile?.id ?? email ?? ''),
    name,
    email,
    accessToken,
    refreshToken: response.refresh_token,
    firstName: profile?.firstName,
    lastName: profile?.lastName,
    avatarURL: profile?.avatarURL,
    coverImageURL: profile?.coverImageURL,
    headline: profile?.headline,
    companyName: profile?.companyName,
    location: profile?.location,
    role: profile?.role,
    isVerified: profile?.isVerified ?? profile?.is_active,
  };
}

async function storeLoginAudit(
  apiBaseUrl: string,
  payload: Record<string, unknown>
): Promise<void> {
  for (const endpoint of LOGIN_AUDIT_ENDPOINTS) {
    try {
      const response = await fetch(joinApiUrl(apiBaseUrl, endpoint), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        return;
      }

      if (response.status === 404 || response.status === 405) {
        continue;
      }

      console.error(
        `Login audit failed with status ${response.status} at ${endpoint}`
      );
      return;
    } catch (error) {
      console.error(`Login audit request failed at ${endpoint}:`, error);
    }
  }
}

type AuthProvider = NonNullable<NextAuthOptions['providers']>[number];

function getConfiguredOAuthProviders(): AuthProvider[] {
  const providers: AuthProvider[] = [];

  if (env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET) {
    providers.push(
      GoogleProvider({
        clientId: env.GOOGLE_CLIENT_ID,
        clientSecret: env.GOOGLE_CLIENT_SECRET,
      }) as AuthProvider
    );
  }

  if (env.LINKEDIN_CLIENT_ID && env.LINKEDIN_CLIENT_SECRET) {
    providers.push(
      LinkedInProvider({
        clientId: env.LINKEDIN_CLIENT_ID,
        clientSecret: env.LINKEDIN_CLIENT_SECRET,
      }) as AuthProvider
    );
  }

  return providers;
}

const oauthProviders = getConfiguredOAuthProviders();
const nextAuthSecret =
  process.env.NEXTAUTH_SECRET ||
  (process.env.NODE_ENV !== 'production'
    ? 'development-secret-change-me'
    : undefined);

export const authOptions: NextAuthOptions = {
  secret: 'pYn8fR2kL5mN9qS1vX4zW7hJ0gB3eD6aC9xY2zL5mV8',
  // debug: true,
  secret: nextAuthSecret,
  pages: {
    ...pagesOptions,
  },
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  callbacks: {
    async jwt({ token, user }: { token: JWT; user?: NextAuthUser }) {
      if (user) {
        // user object is only passed on the initial sign in
        token.accessToken = user.accessToken;
        token.refreshToken = user.refreshToken;
        token.id = user.id ?? token.sub;
        token.email = user.email;
        token.name = user.name;
        token.firstName = user.firstName;
        token.lastName = user.lastName;
        token.avatarURL = user.avatarURL;
        token.coverImageURL = user.coverImageURL;
        token.headline = user.headline;
        token.companyName = user.companyName;
        token.location = user.location;
        token.role = user.role;
        token.isVerified = user.isVerified;
      }
      return token;
    },
    async session({ session, token }: { session: Session; token: JWT }) {
      if (token) {
        // pass the access token back to the client session
        session.accessToken = token.accessToken;
        session.refreshToken = token.refreshToken;
        const sessionUser = session.user ?? {};
        session.user = {
          ...sessionUser,
          id: (token.id ?? token.sub ?? '') as string,
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
    async redirect({ url, baseUrl }: { url: string; baseUrl: string }) {
      if (url.startsWith('/')) {
        return `${baseUrl}${url}`;
      }

      if (url.startsWith(baseUrl)) {
        return url;
      }

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
      async authorize(
        credentials?: LoginCredentials,
        req?: { headers?: Record<string, string | string[] | undefined> }
      ) {
        try {
          if (!credentials?.email || !credentials.password) {
            return null;
          }

          const loginApiBaseUrl = getUserServiceUrl();
          const auditApiBaseUrl = getApiBaseUrl();
          const requestBody = JSON.stringify({
            email: credentials.email,
            emailAddress: credentials.email,
            password: credentials.password,
          });
          let sawLoginResponse = false;
          let lastLoginError: unknown;

          for (const endpoint of LOGIN_ENDPOINTS) {
            let response: Response;

            try {
              response = await fetch(
                joinApiUrl(loginApiBaseUrl, endpoint),
                {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: requestBody,
                }
              );
              sawLoginResponse = true;
            } catch (error) {
              lastLoginError = error;
              console.error(`Login request failed at ${endpoint}:`, error);
              continue;
            }

            const responseText = await response.text();

            if (!response.ok) {
              if (response.status === 404 || response.status === 405) {
                continue;
              }

              console.error(
                `Login failed with status ${response.status} at ${endpoint}: ${responseText}`
              );
              return null;
            }

            const data = parseLoginResponse(responseText);
            const user = data ? buildLoginUser(data) : null;

            if (user) {
              void storeLoginAudit(auditApiBaseUrl, {
                userId: user.id,
                email: user.email,
                name: user.name,
                role: user.role,
                provider: 'credentials',
                status: 'success',
                loginAt: new Date().toISOString(),
                rememberMe: toBoolean(credentials.rememberMe),
                sourcePage: credentials.sourcePage,
                userAgent: firstHeader(req?.headers, 'user-agent'),
                ipAddress:
                  firstHeader(req?.headers, 'x-forwarded-for')
                    ?.split(',')[0]
                    ?.trim() ??
                  firstHeader(req?.headers, 'x-real-ip') ??
                  undefined,
              });

              return user;
            }

            console.error(
              `Login response from ${endpoint} did not include an access token: ${responseText}`
            );
            return null;
          }

          if (lastLoginError && !sawLoginResponse) {
            if (process.env.NODE_ENV !== 'production') {
              const demoEmail = credentials.email ?? 'demo@local.dev';

              return {
                id: demoEmail,
                name: 'Demo User',
                email: demoEmail,
                accessToken: 'demo-access-token',
                refreshToken: 'demo-refresh-token',
                firstName: 'Demo',
                lastName: 'User',
                role: 'admin',
                isVerified: true,
              };
            }

            throw new Error(LOGIN_SERVICE_UNAVAILABLE_ERROR);
          }

          console.error(
            `Unable to find a supported login endpoint under ${loginApiBaseUrl}`
          );
          return null;
        } catch (error) {
          if (
            error instanceof Error &&
            error.message === LOGIN_SERVICE_UNAVAILABLE_ERROR
          ) {
            throw error;
          }

          console.error('Login Error:', error);
          return null;
        }
      },
    }),
    ...oauthProviders,
  ],
};
