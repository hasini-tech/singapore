'use client';

import { useEffect, useState } from 'react';
import { signIn } from 'next-auth/react';
import { Button } from 'rizzui';
import { FcGoogle } from 'react-icons/fc';
import { PiLinkedinLogoFill } from 'react-icons/pi';
import OrSeparation from './or-separation';
import { routes } from '@/config/routes';

type SocialProviderId = 'google' | 'linkedin';

const SUPPORTED_SOCIAL_PROVIDERS: SocialProviderId[] = ['google', 'linkedin'];

export default function SocialButtons({
  className,
  isSignIn = false,
}: {
  className?: string;
  isSignIn?: boolean;
}) {
  const [providers, setProviders] = useState<SocialProviderId[]>([]);

  useEffect(() => {
    let isMounted = true;

    async function loadProviders() {
      try {
        const response = await fetch('/api/auth/providers', {
          cache: 'no-store',
        });

        if (!response.ok) {
          if (isMounted) {
            setProviders([]);
          }
          return;
        }

        const providerMap = (await response.json()) as Record<string, unknown>;
        const availableProviders = SUPPORTED_SOCIAL_PROVIDERS.filter(
          (provider) => provider in providerMap
        );

        if (isMounted) {
          setProviders(availableProviders);
        }
      } catch {
        if (isMounted) {
          setProviders([]);
        }
      }
    }

    void loadProviders();

    return () => {
      isMounted = false;
    };
  }, []);

  if (providers.length === 0) {
    return null;
  }

  return (
    <>
      <div
        className={`grid grid-cols-1 gap-4 pb-7 md:grid-cols-2 xl:gap-5 xl:pb-8 ${className ?? ''}`}
      >
        {providers.includes('google') && (
          <Button
            variant="outline"
            className="h-11 w-full"
            onClick={() => signIn('google', { callbackUrl: routes.feed })}
          >
            <FcGoogle className="me-2 h-5 w-5 shrink-0" />
            <span className="truncate">Sign in with Google</span>
          </Button>
        )}
        {providers.includes('linkedin') && (
          <Button
            variant="outline"
            className="h-11 w-full"
            onClick={() => signIn('linkedin', { callbackUrl: routes.feed })}
          >
            <PiLinkedinLogoFill className="me-2 h-5 w-5 shrink-0 text-[#0077B5]" />
            <span className="truncate">Sign in with LinkedIn</span>
          </Button>
        )}
      </div>
      <OrSeparation
        title={`OR ${isSignIn ? 'SIGN IN' : 'SIGN UP'} WITH`}
        isCenter={true}
        className="mb-7"
      />
    </>
  );
}
