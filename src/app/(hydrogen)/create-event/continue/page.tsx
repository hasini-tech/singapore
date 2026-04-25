import type { Metadata } from 'next';
import EmailOtpGate from '@/components/events/EmailOtpGate';

export const metadata: Metadata = {
  title: 'Continue | GrowthLab',
  description: 'Continue to the event builder after sign in.',
};

export const dynamic = 'force-dynamic';

export default async function CreateEventContinuePage({
  searchParams,
}: {
  searchParams?: Promise<{ redirect?: string }>;
}) {
  const resolvedSearchParams = await searchParams;
  const redirectPath = resolvedSearchParams?.redirect || '/create-event/form';
  return <EmailOtpGate redirectPath={redirectPath} />;
}
