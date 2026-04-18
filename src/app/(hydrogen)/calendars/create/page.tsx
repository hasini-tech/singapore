'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import toast from 'react-hot-toast';
import PageHeader from '@/app/shared/page-header';
import { metaObject } from '@/config/site.config';
import { routes } from '@/config/routes';
import api from '@/lib/api';

const defaultTint = '#0e7678';

export default function CreateCalendarPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect') ?? '';
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [slug, setSlug] = useState('');
  const [tintColor, setTintColor] = useState(defaultTint);
  const [locationScope, setLocationScope] = useState<'global' | 'city'>('global');
  const [city, setCity] = useState('');
  const [saving, setSaving] = useState(false);

  const slugHint = useMemo(() => {
    const base = name.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    return slug.trim() || base || 'calendar-name';
  }, [name, slug]);

  const canSubmit = name.trim().length > 0 && (locationScope === 'global' || city.trim().length > 0);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!canSubmit) {
      toast.error('Please fill in the calendar name and city when using city scope.');
      return;
    }

    setSaving(true);

    try {
      const response = await api.post('/events/calendars', {
        name: name.trim(),
        description: description.trim(),
        slug: slug.trim() || undefined,
        tint_color: tintColor,
        location_scope: locationScope,
        city: locationScope === 'city' ? city.trim() : '',
      });

      const createdCalendar = response.data as {
        slug: string;
      };

      toast.success('Calendar created successfully.');
      router.push(redirect || `/calendars/${createdCalendar.slug}`);
    } catch (err: any) {
      toast.error(err?.response?.data?.detail || 'Unable to create calendar.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8">
      <PageHeader
        title="Create Calendar"
        breadcrumb={[
          { name: 'Home', href: routes.file.dashboard },
          { name: 'Calendars', href: routes.calendars },
          { name: 'Create' },
        ]}
      />

      <div className="mx-auto mt-6 max-w-3xl rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-slate-900">Calendar Name</label>
            <input
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="My event calendar"
              className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-400 focus:bg-white"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-semibold text-slate-900">Description</label>
            <textarea
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="Describe your calendar"
              rows={4}
              className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-400 focus:bg-white"
            />
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-slate-900">Slug (optional)</label>
              <input
                value={slug}
                onChange={(event) => setSlug(event.target.value)}
                placeholder="custom-calendar-slug"
                className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-400 focus:bg-white"
              />
              <p className="text-xs text-slate-500">Preview: /calendars/{slugHint}</p>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-semibold text-slate-900">Tint color</label>
              <input
                type="color"
                value={tintColor}
                onChange={(event) => setTintColor(event.target.value)}
                className="h-12 w-full cursor-pointer rounded-3xl border border-slate-200 bg-white px-3 py-2"
              />
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-slate-900">Location scope</label>
              <div className="grid gap-2">
                {(['global', 'city'] as const).map((scope) => (
                  <button
                    key={scope}
                    type="button"
                    onClick={() => setLocationScope(scope)}
                    className={`w-full rounded-3xl border px-4 py-3 text-left text-sm font-semibold ${locationScope === scope ? 'border-slate-900 bg-slate-900 text-white' : 'border-slate-200 bg-slate-50 text-slate-900 hover:border-slate-400'}`}
                  >
                    {scope === 'global' ? 'Global calendar' : 'City calendar'}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-semibold text-slate-900">City</label>
              <input
                value={city}
                onChange={(event) => setCity(event.target.value)}
                placeholder={locationScope === 'global' ? 'Global calendar' : 'Chennai'}
                disabled={locationScope === 'global'}
                className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-400 focus:bg-white disabled:cursor-not-allowed disabled:opacity-60"
              />
            </div>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <Link href={routes.calendars} className="text-sm font-semibold text-slate-700 hover:text-slate-900">
              Back to calendars
            </Link>
            <button
              type="submit"
              disabled={!canSubmit || saving}
              className="inline-flex items-center justify-center rounded-3xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saving ? 'Creating...' : 'Create calendar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
