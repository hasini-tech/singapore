import type { Metadata } from 'next';
import BrowseEventsPageClient from '@/components/events/BrowseEventsPageClient';

export const metadata: Metadata = {
  title: 'Browse Events | GrowthLab',
  description: 'Browse your event timeline, upcoming events, and past events in one place.',
};

export const dynamic = 'force-dynamic';

export default function BrowseEventsPage() {
  return <BrowseEventsPageClient />;
}
