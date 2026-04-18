import { Suspense } from 'react';
import AuthWrapperOne from '@/app/shared/auth-layout/auth-wrapper-one';
import SignInForm from '@/app/signin/sign-in-form';
import Logo from '@/components/logo';
import { metaObject } from '@/config/site.config';
import Image from 'next/image';

export const metadata = {
  ...metaObject('Sign In'),
};

export default function SignIn() {
  return (
    <AuthWrapperOne
      title={
        <>
          <Logo className="mb-6 mt-2" />
          Welcome back! Please sign in to continue.
        </>
      }
      pageImage={
        <div className="relative mx-auto aspect-[4/3.37] w-[500px] xl:w-[620px] 2xl:w-[820px] rounded-xl">
          <Image
            src={'/growthlab/team-meeting.png'}
            alt="Sign Up Thumbnail"
            fill
            priority
            sizes="(max-width: 768px) 100vw"
            className="object-cover rounded-3xl"
          />
        </div>
      }
      isSocialLoginActive={true}
      isSignIn={true}
    >
      <Suspense fallback={<div>Loading...</div>}>
        <SignInForm />
      </Suspense>
    </AuthWrapperOne>
  );
}
