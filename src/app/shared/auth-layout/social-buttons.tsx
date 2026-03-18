'use client';

import { signIn } from 'next-auth/react';
import { Button } from 'rizzui';
import { FcGoogle } from 'react-icons/fc';
import { PiLinkedinLogoFill } from 'react-icons/pi';

export default function SocialButtons({ className }: { className?: string }) {
  return (
    <div className={`grid grid-cols-1 gap-4 pb-7 md:grid-cols-2 xl:gap-5 xl:pb-8 ${className}`}>
      <Button
        variant="outline"
        className="h-11 w-full"
        onClick={() => signIn('google')}
      >
        <FcGoogle className="me-2 h-5 w-5 shrink-0" />
        <span className="truncate">Sign in with Google</span>
      </Button>
      <Button
        variant="outline"
        className="h-11 w-full"
        onClick={() => signIn('linkedin')}
      >
        <PiLinkedinLogoFill className="me-2 h-5 w-5 shrink-0 text-[#0077B5]" />
        <span className="truncate">Sign in with LinkedIn</span>
      </Button>
    </div>
  );
}
