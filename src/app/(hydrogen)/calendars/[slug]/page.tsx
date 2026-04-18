import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import CalendarDetailPageClient from '@/components/events/CalendarDetailPageClient';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;

  return {
    title: `Calendar | GrowthLab`,
    description: 'Manage your GrowthLab calendar.',
  };
}

export default async function CalendarPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  return <CalendarDetailPageClient slug={slug} />;
}
