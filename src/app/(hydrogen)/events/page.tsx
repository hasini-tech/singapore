import type { Metadata } from 'next';
import EventsPageClient from '@/components/events/EventsPageClient';

export const metadata: Metadata = {
  title: 'Events | GrowthLab',
  description: 'Explore GrowthLab events, workshops, mixers, and community experiences.',
};

export const dynamic = 'force-dynamic';

export default function EventsPage() {
  return <EventsPageClient />;
}
