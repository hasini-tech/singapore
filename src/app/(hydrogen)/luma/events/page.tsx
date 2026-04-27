import type { Metadata } from 'next';
import LumaEventsPageClient from '@/components/events/LumaEventsPageClient';

export const metadata: Metadata = {
  title: 'Luma Events | GrowthLab',
  description:
    'Review newly created events in a Luma-style timeline and detail panel.',
};

export const dynamic = 'force-dynamic';

export default function LumaEventsPage() {
  return <LumaEventsPageClient />;
}
