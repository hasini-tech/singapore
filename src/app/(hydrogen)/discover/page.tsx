import type { Metadata } from 'next';
import DiscoverPageClient from '@/components/events/DiscoverPageClient';

export const metadata: Metadata = {
  title: 'Discover Events | GrowthLab',
  description: 'Explore GrowthLab events, featured calendars, and local recommendations.',
};

export const dynamic = 'force-dynamic';

export default function DiscoverPage() {
  return <DiscoverPageClient />;
}
