'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { signIn, useSession } from 'next-auth/react';
import type { SubmitHandler } from 'react-hook-form';
import { PiArrowRightBold } from 'react-icons/pi';
import { Password, Button, Input } from 'rizzui';
import { Form } from '@/ui/form';
import { loginSchema, LoginSchema } from '@/validators/login.schema';
import { toast } from 'react-hot-toast';
import { routes } from '@/config/routes';
import { getSafeRedirectPath } from '@/utils/get-safe-redirect-path';

const initialValues: LoginSchema = {
  email: '',
  password: '',
  rememberMe: true,
};

export default function SignInForm() {
  const [reset, setReset] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const { status } = useSession();
  const callbackUrl = searchParams?.get('callbackUrl') ?? null;

  useEffect(() => {
    if (status === 'authenticated') {
      router.replace(getSafeRedirectPath(callbackUrl, routes.feed));
    }
  }, [callbackUrl, router, status]);

  const onSubmit: SubmitHandler<LoginSchema> = async (data) => {
    setIsLoading(true);

    try {
      const redirectTarget = getSafeRedirectPath(callbackUrl, routes.feed);
      const res = await signIn('credentials', {
        ...data,
        sourcePage: '/signin',
        callbackUrl: redirectTarget,
        redirect: false,
      });

      if (res?.error === 'LoginServiceUnavailable') {
        toast.error(
          'Authentication service is unavailable right now. Please try again later.'
        );
      } else if (res?.error) {
        toast.error('Invalid email or password');
      } else if (res?.ok) {
        toast.success('Successfully signed in!');
        router.replace(getSafeRedirectPath(res.url, redirectTarget));
      }
    } catch (error: any) {
      console.error('Login error:', error);
      toast.error('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Form<LoginSchema>
        validationSchema={loginSchema}
        resetValues={reset}
        onSubmit={onSubmit}
        useFormProps={{
          defaultValues: initialValues,
        }}
      >
        {({ register, formState: { errors } }) => (
          <div className="space-y-5">
            <Input
              type="email"
              size="lg"
              label="Email"
              placeholder="Enter your email"
              className="[&>label>span]:font-medium"
              inputClassName="text-sm"
              {...register('email')}
              error={errors.email?.message}
            />
            <Password
              label="Password"
              placeholder="Enter your password"
              size="lg"
              className="[&>label>span]:font-medium"
              inputClassName="text-sm"
              {...register('password')}
              error={errors.password?.message}
            />
            <div className="pb-2" />
            <Button
              className="w-full"
              type="submit"
              size="lg"
              isLoading={isLoading}
              disabled={isLoading}
            >
              <span>{isLoading ? 'Signing in...' : 'Sign in'}</span>{' '}
              {!isLoading && (
                <PiArrowRightBold className="ms-2 mt-0.5 h-5 w-5" />
              )}
            </Button>
          </div>
        )}
      </Form>
    </>
  );
}
