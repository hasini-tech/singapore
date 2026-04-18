'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import PageHeader from '@/app/shared/page-header';
import { metaObject } from '@/config/site.config';
import { routes } from '@/config/routes';
import api from '@/lib/api';

type OwnerCalendar = {
  id: string;
  name: string;
  slug: string;
  description: string;
  tint_color: string;
  location_scope: 'city' | 'global';
  city: string;
  subscriber_count: number;
  is_default: boolean;
  event_count: number;
  upcoming_event_count: number;
};

export default function CalendarsPage() {
  const [calendars, setCalendars] = useState<OwnerCalendar[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;

    async function loadCalendars() {
      setLoading(true);
      setError('');

      try {
        const response = await api.get('/events/calendars');
        if (!active) return;
        setCalendars(Array.isArray(response.data) ? response.data : []);
      } catch (err: any) {
        if (!active) return;
        setError(err?.response?.data?.detail || 'Unable to load calendars.');
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadCalendars();

    return () => {
      active = false;
    };
  }, []);

  return (
    <div className="min-h-screen w-full py-8">
      <div className="mx-auto w-full max-w-[1180px]">
      <PageHeader
        title="Calendars"
        breadcrumb={[
          { name: 'Home', href: routes.file.dashboard },
          { name: 'Calendars' },
        ]}
      >
        <Link href={routes.calendarsCreate} className="primary-button">
          Create Calendar
        </Link>
      </PageHeader>

      <div className="space-y-6">
        <section className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-xl font-semibold text-slate-900">Your calendar workspace</h2>
          <p className="max-w-2xl text-sm text-slate-600">
            Create calendars to organize events, manage attendees, and share your event collection.
          </p>
        </section>

        <section className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm">
          {loading ? (
            <div className="text-sm text-slate-500">Loading calendars…</div>
          ) : error ? (
            <div className="text-sm text-red-600">{error}</div>
          ) : calendars.length === 0 ? (
            <div className="grid gap-4">
              <div className="text-sm text-slate-600">No calendars found yet.</div>
              <Link href={routes.calendarsCreate} className="inline-flex items-center justify-center rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800">
                Create your first calendar
              </Link>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {calendars.map((calendar) => (
                <div key={calendar.id} className="rounded-3xl border border-slate-200 p-5 shadow-sm">
                  <div className="mb-4 flex items-center justify-between gap-3">
                    <div>
                      <div className="mb-2 text-lg font-semibold text-slate-900">{calendar.name}</div>
                      <div className="text-sm text-slate-500">{calendar.location_scope === 'city' ? calendar.city || 'City calendar' : 'Global calendar'}</div>
                    </div>
                    <span
                      className="h-10 w-10 rounded-full border"
                      style={{ background: calendar.tint_color }}
                    />
                  </div>
                  <p className="mb-5 text-sm leading-6 text-slate-600">{calendar.description || 'No description added yet.'}</p>
                  <div className="flex flex-wrap gap-2 text-sm text-slate-500">
                    <span>{calendar.subscriber_count} subscriber{calendar.subscriber_count === 1 ? '' : 's'}</span>
                    <span>{calendar.event_count} events</span>
                  </div>
                  <Link href={`/calendars/${calendar.slug}`} className="mt-5 inline-flex items-center rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800">
                    View calendar
                  </Link>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
      </div>
    </div>
  );
}























