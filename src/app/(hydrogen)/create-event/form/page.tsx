import type { Metadata } from 'next';
import CreateEventBuilderPage from '@/components/events/CreateEventBuilderPage';

export const metadata: Metadata = {
  title: 'Create Event Form | GrowthLab',
  description: 'Create and save a GrowthLab event draft.',
};

export const dynamic = 'force-dynamic';

export default function CreateEventFormPage() {
  return <CreateEventBuilderPage />;
}
