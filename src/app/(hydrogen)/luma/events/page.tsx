import type { Metadata } from 'next';
import EventsPageClient from '@/components/events/LumaEventsPageClient';

export const metadata: Metadata = {
  title: 'Events | GrowthLab',
  description:
    'Review newly created events in an event timeline and detail panel.',
};

export const dynamic = 'force-dynamic';

export default function EventsPage() {
  return <EventsPageClient />;
}
