import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

export default withAuth(
  function middleware(req) {
    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ req, token }) => {
        const { pathname } = req.nextUrl;
        // Define private paths that require authentication
        const privatePaths = [
          '/feed',
          '/business',
          '/connect',
          '/profile',
        ];

        // Check if the path is private
        const isPrivatePath = privatePaths.some((path) => pathname.startsWith(path));

        // If it's a private path, require authentication
        if (isPrivatePath) {
          return !!token;
        }

        // All other paths are public by default
        return true;
      },
    },
    pages: {
      signIn: '/signin', // Redirect here if unauthenticated on a private route
    },
  }
);

export const config = {
  // Apply middleware to all routes except api, _next/static, _next/image, favicon.ico
  matcher: ['/((?!api/auth|_next/static|_next/image|favicon.ico).*)'],
};
