'use client';

import { useAuth } from '@/context/auth-context';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect } from 'react';

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // We let the NextAuth middleware handle the redirect logic.
    // AuthGuard here only ensures the custom context is synced before rendering.
  }, [isAuthenticated, isLoading, pathname, router]);

  // Define private paths that require authentication (keep in sync with middleware)
  const privatePaths = ['/feed', '/business', '/connect', '/profile'];
  const isPrivatePath = privatePaths.some((path) => pathname.startsWith(path));

  // If it's a private path and still loading, show spinner
  if (isPrivatePath && isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-gray-900"></div>
      </div>
    );
  }

  // If it's a public path, show content immediately
  if (!isPrivatePath) {
    return <>{children}</>;
  }

  // If it's a private path and authenticated, show content
  if (isAuthenticated) {
    return <>{children}</>;
  }

  // Otherwise, return null (middleware handles redirect)
  return null;
}
