import type { Metadata } from 'next';
import EmailOtpGate from '@/components/events/EmailOtpGate';

export const metadata: Metadata = {
  title: 'Continue | GrowthLab',
  description: 'Continue to the event builder after sign in.',
};

export const dynamic = 'force-dynamic';

export default function CreateEventContinuePage({
  searchParams,
}: {
  searchParams?: { redirect?: string };
}) {
  const redirectPath = searchParams?.redirect || '/create-event/form';
  return <EmailOtpGate redirectPath={redirectPath} />;
}
