'use client';

import { FormEvent, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { PiArrowRight, PiEnvelopeSimple, PiShieldCheck } from 'react-icons/pi';
import { getSafeRedirectPath } from '@/utils/get-safe-redirect-path';

type EmailOtpGateProps = {
  redirectPath?: string;
};

type OtpRequestResponse = {
  success?: boolean;
  message?: string;
  detail?: string;
  resend_in_seconds?: number;
  debug_code?: string;
};

type OtpVerifyResponse = {
  success?: boolean;
  detail?: string;
  token?: string;
  access_token?: string;
  refresh_token?: string;
  user?: {
    id?: string | number;
    name?: string | null;
    email?: string | null;
    emailAddress?: string | null;
  } | null;
  data?: {
    id?: string | number;
    name?: string | null;
    email?: string | null;
    emailAddress?: string | null;
  } | null;
};

const DEFAULT_REDIRECT_PATH = '/create-event/form';

function buildDisplayName(email: string) {
  const localPart = email.split('@')[0] || 'event host';
  return localPart
    .replace(/[._-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function persistOtpSession(email: string, payload: OtpVerifyResponse) {
  const token = payload.access_token ?? payload.token;
  if (!token || typeof window === 'undefined') {
    return false;
  }

  const profile = payload.user ?? payload.data ?? null;
  const normalizedUser = {
    id:
      profile?.id !== undefined && profile?.id !== null
        ? String(profile.id)
        : email,
    name: profile?.name || buildDisplayName(email),
    email: profile?.email || profile?.emailAddress || email,
  };

  localStorage.setItem('evently_token', token);
  localStorage.setItem('access_token', token);
  localStorage.setItem('evently_user', JSON.stringify(normalizedUser));
  localStorage.setItem('user', JSON.stringify(profile ?? normalizedUser));

  if (payload.refresh_token) {
    localStorage.setItem('refresh_token', payload.refresh_token);
  } else {
    localStorage.removeItem('refresh_token');
  }

  document.cookie = `evently_token=${encodeURIComponent(token)}; Path=/; SameSite=Lax`;
  return true;
}

export default function EmailOtpGate({
  redirectPath = DEFAULT_REDIRECT_PATH,
}: EmailOtpGateProps) {
  const router = useRouter();
  const safeRedirectPath = useMemo(
    () => getSafeRedirectPath(redirectPath, DEFAULT_REDIRECT_PATH),
    [redirectPath]
  );

  const [step, setStep] = useState<'email' | 'otp'>('email');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [debugCode, setDebugCode] = useState('');
  const [resendIn, setResendIn] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (resendIn <= 0) {
      return;
    }

    const timer = window.setTimeout(() => {
      setResendIn((current) => Math.max(0, current - 1));
    }, 1000);

    return () => window.clearTimeout(timer);
  }, [resendIn]);

  async function requestOtp() {
    setIsSubmitting(true);
    setError('');
    setMessage('');

    try {
      const response = await fetch('/api/users/otp/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          emailAddress: email,
        }),
      });

      const payload = (await response.json()) as OtpRequestResponse;
      if (!response.ok) {
        throw new Error(payload.detail || payload.message || 'Could not send verification code.');
      }

      setStep('otp');
      setMessage(payload.message || 'We sent a verification code to your email.');
      setDebugCode(payload.debug_code || '');
      setResendIn(payload.resend_in_seconds || 60);
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : 'Could not send verification code.'
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  async function verifyOtp() {
    setIsSubmitting(true);
    setError('');
    setMessage('');

    try {
      const response = await fetch('/api/users/otp/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          emailAddress: email,
          otp,
        }),
      });

      const payload = (await response.json()) as OtpVerifyResponse;
      if (!response.ok) {
        throw new Error(payload.detail || 'The verification code is invalid.');
      }

      const stored = persistOtpSession(email, payload);
      if (!stored) {
        throw new Error('Verification succeeded but no session token was returned.');
      }

      router.replace(safeRedirectPath);
      router.refresh();
    } catch (verifyError) {
      setError(
        verifyError instanceof Error
          ? verifyError.message
          : 'Could not verify the code.'
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (step === 'email') {
      await requestOtp();
      return;
    }

    await verifyOtp();
  }

  return (
    <main
      className="min-h-screen px-4 py-10"
      style={{
        background:
          'radial-gradient(circle at top left, rgba(103,205,208,0.22), transparent 36%), linear-gradient(135deg, #e8f8f8 0%, #f8fcfc 44%, #ffffff 100%)',
      }}
    >
      <div className="mx-auto flex min-h-[80vh] max-w-5xl items-center justify-center">
        <div className="grid w-full overflow-hidden rounded-[36px] border border-[rgba(15,115,119,0.12)] bg-white/90 shadow-[0_32px_80px_rgba(15,115,119,0.14)] backdrop-blur md:grid-cols-[0.95fr_1.05fr]">
          <section className="flex flex-col justify-between gap-8 bg-[linear-gradient(145deg,#0f7377_0%,#19999d_55%,#d7f2f2_100%)] p-8 text-white md:p-10">
            <div>
              <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-2 text-xs font-bold uppercase tracking-[0.2em] text-white/90">
                <PiShieldCheck size={16} />
                Secure Event Access
              </div>
              <h1 className="max-w-sm text-4xl font-black tracking-tight text-white">
                Continue to the GrowthLab event builder
              </h1>
              <p className="mt-4 max-w-md text-base leading-7 text-white/80">
                Sign in with a one-time email code and we will take you straight to
                your create-event page.
              </p>
            </div>

            <div className="grid gap-4 text-sm text-white/85">
              <div className="rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur">
                Use the same email you want attached to your hosted events.
              </div>
              <div className="rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur">
                After verification, you will land on <code>{safeRedirectPath}</code>.
              </div>
            </div>
          </section>

          <section className="p-8 md:p-10">
            <div className="mx-auto max-w-md">
              <div className="mb-8">
                <div className="text-sm font-bold uppercase tracking-[0.16em] text-[#0f7377]">
                  {step === 'email' ? 'Step 1' : 'Step 2'}
                </div>
                <h2 className="mt-3 text-3xl font-black tracking-tight text-slate-900">
                  {step === 'email' ? 'Enter your email' : 'Enter the code'}
                </h2>
                <p className="mt-3 text-sm leading-6 text-slate-500">
                  {step === 'email'
                    ? 'We will send a one-time code so you can open the create-event page.'
                    : `We sent a verification code to ${email}.`}
                </p>
              </div>

              <form className="grid gap-5" onSubmit={handleSubmit}>
                {step === 'email' ? (
                  <label className="grid gap-2">
                    <span className="text-sm font-semibold text-slate-700">Email</span>
                    <span className="flex items-center gap-3 rounded-2xl border border-[rgba(15,115,119,0.15)] bg-[#f7fbfb] px-4 py-4">
                      <PiEnvelopeSimple size={18} color="#0f7377" />
                      <input
                        autoFocus
                        required
                        type="email"
                        value={email}
                        onChange={(event) => setEmail(event.target.value)}
                        placeholder="you@example.com"
                        className="w-full bg-transparent text-[15px] text-slate-900 outline-none placeholder:text-slate-400"
                      />
                    </span>
                  </label>
                ) : (
                  <label className="grid gap-2">
                    <span className="text-sm font-semibold text-slate-700">Verification code</span>
                    <input
                      autoFocus
                      required
                      inputMode="numeric"
                      pattern="[0-9]*"
                      maxLength={6}
                      value={otp}
                      onChange={(event) =>
                        setOtp(event.target.value.replace(/\D/g, '').slice(0, 6))
                      }
                      placeholder="123456"
                      className="rounded-2xl border border-[rgba(15,115,119,0.15)] bg-[#f7fbfb] px-4 py-4 text-lg font-bold tracking-[0.45em] text-slate-900 outline-none placeholder:tracking-[0.2em] placeholder:text-slate-400"
                    />
                  </label>
                )}

                {message ? (
                  <div className="rounded-2xl border border-[rgba(17,168,73,0.16)] bg-[rgba(17,168,73,0.07)] px-4 py-3 text-sm font-medium text-[#166534]">
                    {message}
                  </div>
                ) : null}

                {error ? (
                  <div className="rounded-2xl border border-[rgba(238,0,0,0.16)] bg-[rgba(238,0,0,0.06)] px-4 py-3 text-sm font-medium text-[#b42318]">
                    {error}
                  </div>
                ) : null}

                {step === 'otp' && debugCode ? (
                  <div className="rounded-2xl border border-[rgba(15,115,119,0.12)] bg-[#f7fbfb] px-4 py-3 text-sm text-slate-600">
                    Development code: <span className="font-bold text-slate-900">{debugCode}</span>
                  </div>
                ) : null}

                <button
                  type="submit"
                  disabled={isSubmitting || (step === 'otp' && otp.length < 6)}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[linear-gradient(135deg,#0f7377_0%,#1ba2a6_100%)] px-5 py-4 text-sm font-extrabold text-white shadow-[0_18px_40px_rgba(15,115,119,0.22)] transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  <span>
                    {isSubmitting
                      ? 'Please wait...'
                      : step === 'email'
                        ? 'Send code'
                        : 'Verify and continue'}
                  </span>
                  {!isSubmitting ? <PiArrowRight size={16} /> : null}
                </button>

                {step === 'otp' ? (
                  <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-slate-500">
                    <button
                      type="button"
                      onClick={() => {
                        setStep('email');
                        setOtp('');
                        setError('');
                        setMessage('');
                      }}
                      className="font-semibold text-slate-600 underline-offset-4 hover:text-slate-900 hover:underline"
                    >
                      Change email
                    </button>
                    <button
                      type="button"
                      disabled={isSubmitting || resendIn > 0}
                      onClick={() => {
                        void requestOtp();
                      }}
                      className="font-semibold text-[#0f7377] underline-offset-4 hover:underline disabled:cursor-not-allowed disabled:text-slate-400"
                    >
                      {resendIn > 0 ? `Resend in ${resendIn}s` : 'Resend code'}
                    </button>
                  </div>
                ) : null}
              </form>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
