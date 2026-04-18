'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, CalendarDays, Loader2, MapPin, Plus, Sparkles, Ticket, Users } from 'lucide-react';
import { useAuth } from '@/context/auth-context';
import api from '@/lib/api';
import { routes } from '@/config/routes';
import { DEFAULT_EVENT_COVER } from '@/lib/defaults';
import {
  getPersonalTimelineCacheKey,
  isLocalFallbackResponse,
  mergeUniqueTimelineItems,
  readPersonalTimelineCacheItems,
  readStoredTimelineIdentity,
  writePersonalTimelineCacheItems,
} from '@/lib/personalTimelineCache';

type EventsTab = 'upcoming' | 'past';
type EventsMode = 'personal' | 'public';
type EventRelationship = 'hosting' | 'attending' | 'public';

type EventRecord = {
  id: string;
  slug: string;
  title: string;
  description?: string;
  date?: string;
  time?: string;
  location?: string;
  is_online?: boolean;
  cover_image?: string;
  attendee_count?: number;
  confirmed_count?: number;
  host_id?: string;
  created_at?: string;
  relationship: EventRelationship;
  ticket_status?: string;
  event_status?: string;
};

type TicketRecord = {
  event_id: string;
  status?: string;
  created_at?: string;
  event_title?: string;
  event_slug?: string;
  event_date?: string;
  event_time?: string;
  event_location?: string;
  event_description?: string;
  event_cover_image?: string;
  event_is_online?: boolean;
  event_status?: string;
};

type EventGroup = {
  key: string;
  date: Date;
  items: EventRecord[];
};

const EXCLUDED_TICKET_STATUSES = new Set(['cancelled', 'rejected']);

function readCachedEvent(serialized: string | null) {
  if (!serialized) return null;
  try {
    return JSON.parse(serialized);
  } catch {
    return null;
  }
}

function readPersonalTimelineCache(cacheKey: string | null) {
  return readPersonalTimelineCacheItems<Partial<EventRecord>>(cacheKey)
    .map((event) => {
      const relationship =
        event && typeof event === 'object' && 'relationship' in event
          ? (event.relationship as EventRelationship)
          : 'hosting';
      return normalizeEvent(event as Partial<EventRecord>, relationship);
    })
    .filter((event): event is EventRecord => event !== null);
}

function writePersonalTimelineCache(cacheKey: string | null, events: EventRecord[]) {
  writePersonalTimelineCacheItems(cacheKey, events);
}

function mergeLatestEvent(events: EventRecord[], latestEvent: EventRecord | null) {
  if (!latestEvent) {
    return events;
  }

  return events.some((event) => event.id === latestEvent.id) ? events : [latestEvent, ...events];
}

function normalizeEvent(
  event: Partial<EventRecord> | null,
  relationship: EventRelationship,
): EventRecord | null {
  if (!event?.id || !event.slug || !event.title) {
    return null;
  }

  return {
    id: String(event.id),
    slug: String(event.slug),
    title: String(event.title),
    description: typeof event.description === 'string' ? event.description : '',
    date: typeof event.date === 'string' ? event.date : undefined,
    time: typeof event.time === 'string' ? event.time : undefined,
    location: typeof event.location === 'string' ? event.location : undefined,
    is_online: Boolean(event.is_online),
    cover_image: typeof event.cover_image === 'string' ? event.cover_image : undefined,
    attendee_count: Number(event.attendee_count || 0),
    confirmed_count: Number(event.confirmed_count || 0),
    host_id: typeof event.host_id === 'string' ? event.host_id : undefined,
    created_at: typeof event.created_at === 'string' ? event.created_at : undefined,
    relationship,
    ticket_status: typeof event.ticket_status === 'string' ? event.ticket_status : undefined,
    event_status: typeof event.event_status === 'string' ? event.event_status : undefined,
  };
}

function normalizeEventList(events: unknown, relationship: EventRelationship) {
  if (!Array.isArray(events)) {
    return [];
  }

  return events
    .map((event) => normalizeEvent(event as Partial<EventRecord>, relationship))
    .filter((event): event is EventRecord => event !== null);
}

function normalizeTicketEvents(records: unknown) {
  if (!Array.isArray(records)) {
    return [];
  }

  return records
    .map((record) => {
      const ticket = record as TicketRecord;

      if (
        !ticket.event_id ||
        !ticket.event_slug ||
        !ticket.event_title ||
        EXCLUDED_TICKET_STATUSES.has((ticket.status || '').toLowerCase())
      ) {
        return null;
      }

      return normalizeEvent(
        {
          id: ticket.event_id,
          slug: ticket.event_slug,
          title: ticket.event_title,
          description: ticket.event_description,
          date: ticket.event_date,
          time: ticket.event_time,
          location: ticket.event_location,
          is_online: ticket.event_is_online,
          cover_image: ticket.event_cover_image,
          created_at: ticket.created_at,
          ticket_status: ticket.status,
          event_status: ticket.event_status,
        },
        'attending',
      );
    })
    .filter((event): event is EventRecord => event !== null);
}

function mergePersonalEvents(
  hostedEvents: EventRecord[],
  attendingEvents: EventRecord[],
  latestHostedEvent: EventRecord | null,
) {
  const merged = new Map<string, EventRecord>();

  hostedEvents.forEach((event) => {
    merged.set(event.id, event);
  });

  attendingEvents.forEach((event) => {
    if (!merged.has(event.id)) {
      merged.set(event.id, event);
    }
  });

  if (latestHostedEvent) {
    merged.set(latestHostedEvent.id, latestHostedEvent);
  }

  return Array.from(merged.values());
}

function parseDateValue(value?: string | null) {
  if (!value) return null;

  const trimmed = value.trim();
  if (!trimmed) return null;

  const isoLikeMatch = trimmed.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (isoLikeMatch) {
    return new Date(Number(isoLikeMatch[1]), Number(isoLikeMatch[2]) - 1, Number(isoLikeMatch[3]));
  }

  const dayMonthYearMatch = trimmed.match(/^(\d{2})-(\d{2})-(\d{4})$/);
  if (dayMonthYearMatch) {
    return new Date(
      Number(dayMonthYearMatch[3]),
      Number(dayMonthYearMatch[2]) - 1,
      Number(dayMonthYearMatch[1]),
    );
  }

  const parsed = new Date(trimmed);
  if (!Number.isNaN(parsed.getTime())) {
    return parsed;
  }

  return null;
}

function isDateOnlyValue(value?: string | null) {
  if (!value) return false;
  const trimmed = value.trim();
  return /^\d{4}-\d{2}-\d{2}$/.test(trimmed) || /^\d{2}-\d{2}-\d{4}$/.test(trimmed);
}

function parseTimeValue(value?: string | null) {
  if (!value) return null;

  const trimmed = value.trim();
  if (!trimmed) return null;

  const twentyFourHourMatch = trimmed.match(/^(\d{1,2}):(\d{2})$/);
  if (twentyFourHourMatch) {
    return {
      hours: Number(twentyFourHourMatch[1]),
      minutes: Number(twentyFourHourMatch[2]),
    };
  }

  const meridiemMatch = trimmed.match(/^(\d{1,2}):(\d{2})\s*([AP]M)$/i);
  if (meridiemMatch) {
    const suffix = meridiemMatch[3].toUpperCase();
    let hours = Number(meridiemMatch[1]) % 12;
    if (suffix === 'PM') {
      hours += 12;
    }
    return {
      hours,
      minutes: Number(meridiemMatch[2]),
    };
  }

  return null;
}

function getEventDisplayDate(event: EventRecord) {
  return parseDateValue(event.date) ?? parseDateValue(event.created_at);
}

function getEventHistoryDate(event: EventRecord) {
  return parseDateValue(event.created_at) ?? getEventDisplayDate(event);
}

function getEventSortDate(event: EventRecord) {
  const baseDate = getEventDisplayDate(event);
  if (!baseDate) return null;

  const normalized = new Date(baseDate);

  if (isDateOnlyValue(event.date)) {
    const parsedTime = parseTimeValue(event.time);
    if (parsedTime) {
      normalized.setHours(parsedTime.hours, parsedTime.minutes, 0, 0);
    } else {
      normalized.setHours(23, 59, 59, 999);
    }
  }

  return normalized;
}

function dateKey(date: Date) {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const day = `${date.getDate()}`.padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function groupEventsByDay(events: EventRecord[]) {
  const map = new Map<string, EventGroup>();

  events.forEach((event) => {
    const eventDate = getEventDisplayDate(event);
    if (!eventDate) return;

    const key = dateKey(eventDate);
    const existing = map.get(key);

    if (existing) {
      existing.items.push(event);
      return;
    }

    map.set(key, {
      key,
      date: eventDate,
      items: [event],
    });
  });

  return Array.from(map.values()).map((group) => ({
    ...group,
    items: [...group.items].sort((a, b) => {
      const left = getEventSortDate(a)?.getTime() || 0;
      const right = getEventSortDate(b)?.getTime() || 0;
      return right - left;
    }),
  }));
}

function groupEventsByHistory(events: EventRecord[]) {
  const map = new Map<string, EventGroup>();

  events.forEach((event) => {
    const historyDate = getEventHistoryDate(event);
    if (!historyDate) return;

    const key = dateKey(historyDate);
    const existing = map.get(key);

    if (existing) {
      existing.items.push(event);
      return;
    }

    map.set(key, {
      key,
      date: historyDate,
      items: [event],
    });
  });

  return Array.from(map.values()).map((group) => ({
    ...group,
    items: [...group.items].sort((a, b) => {
      const left = getEventHistoryDate(a)?.getTime() || 0;
      const right = getEventHistoryDate(b)?.getTime() || 0;
      return right - left;
    }),
  }));
}

function formatEventTime(event: EventRecord) {
  if (event.time) {
    return event.time;
  }

  const parsed = getEventSortDate(event);
  if (!parsed) return 'Time TBA';

  return parsed.toLocaleTimeString([], {
    hour: 'numeric',
    minute: '2-digit',
  });
}

function formatGuestCount(event: EventRecord) {
  const guests = Number(event.confirmed_count || event.attendee_count || 0);
  if (guests <= 0) return 'No guests yet';
  if (guests === 1) return '1 guest';
  return `${guests} guests`;
}

function formatTicketStatus(status?: string) {
  switch ((status || '').toLowerCase()) {
    case 'confirmed':
      return 'Registration confirmed';
    case 'waitlisted':
      return 'On the waitlist';
    case 'pending_payment':
      return 'Payment pending';
    case 'pending_approval':
      return 'Awaiting approval';
    default:
      return 'Saved to your timeline';
  }
}

function EmptyState({ tab, personalMode }: { tab: EventsTab; personalMode: boolean }) {
  const heading = tab === 'upcoming' ? 'No upcoming events yet' : 'No past events yet';
  const description =
    tab === 'upcoming'
      ? personalMode
        ? 'Events you create or join will appear here in your personal timeline.'
        : 'There are no upcoming public events to show right now.'
      : personalMode
        ? 'Your hosted and attended events will move here after they finish.'
        : 'Past public events will show here after they wrap up.';

  return (
    <div
      className="surface-panel"
      style={{
        borderRadius: '24px',
        padding: '42px 20px',
        textAlign: 'center',
      }}
    >
      <div
        style={{
          width: '84px',
          height: '84px',
          margin: '0 auto 18px',
          borderRadius: '24px',
          background: 'var(--primary-soft)',
          color: 'var(--primary-color)',
          display: 'grid',
          placeItems: 'center',
        }}
      >
        <Sparkles size={30} />
      </div>
      <h2 style={{ margin: '0 0 10px', fontSize: '1.7rem', letterSpacing: '-0.04em' }}>{heading}</h2>
      <p
        style={{
          margin: 0,
          fontSize: '0.96rem',
          color: 'var(--text-secondary)',
          maxWidth: '520px',
          marginInline: 'auto',
        }}
      >
        {description}
      </p>
      {tab === 'upcoming' && personalMode && (
        <div style={{ marginTop: '22px' }}>
          <Link href={routes.createEvent} className="primary-button">
            <Plus size={18} />
            Create Event
          </Link>
        </div>
      )}
    </div>
  );
}

function EventCover({ event }: { event: EventRecord }) {
  return (
    <div
      style={{
        width: '112px',
        height: '112px',
        borderRadius: '18px',
        overflow: 'hidden',
        border: '1px solid var(--border-color)',
        background: 'var(--teal-050)',
        flexShrink: 0,
      }}
    >
      <img
        src={event.cover_image || DEFAULT_EVENT_COVER}
        alt={event.title}
        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
      />
    </div>
  );
}

function Timeline({ groups }: { groups: EventGroup[] }) {
  return (
    <div style={{ display: 'grid', gap: '26px' }}>
      {groups.map((group) => (
        <div
          key={group.key}
          style={{
            display: 'grid',
            gridTemplateColumns: 'minmax(96px, 132px) 1fr',
            gap: '0',
            alignItems: 'start',
          }}
        >
          <div style={{ paddingRight: '14px' }}>
            <div
              style={{
                fontSize: '1.6rem',
                fontWeight: 800,
                color: 'var(--primary-color)',
                marginBottom: '2px',
                letterSpacing: '-0.04em',
              }}
            >
              {group.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            </div>
            <div style={{ color: 'var(--text-tertiary)', fontSize: '1rem', fontWeight: 700 }}>
              {group.date.toLocaleDateString('en-US', { weekday: 'long' })}
            </div>
          </div>

          <div
            style={{
              position: 'relative',
              display: 'grid',
              gap: '14px',
              paddingLeft: '26px',
              borderLeft: '1px solid var(--events-divider)',
            }}
          >
            {group.items.map((event) => {
              const ownsEvent = event.relationship === 'hosting';
              const isAttending = event.relationship === 'attending';
              const actionHref = ownsEvent ? `/manage/${event.slug}` : `/events/${event.slug}`;
              const badgeLabel = ownsEvent ? 'Hosting' : isAttending ? 'Attending' : 'Explore';
              const guestLabel = formatGuestCount(event);
              const secondaryMeta = isAttending
                ? formatTicketStatus(event.ticket_status)
                : guestLabel === 'No guests yet'
                  ? guestLabel
                  : guestLabel;

              return (
                <div key={event.id} style={{ position: 'relative' }}>
                  <div
                    style={{
                      position: 'absolute',
                      left: '-31px',
                      top: '24px',
                      width: '12px',
                      height: '12px',
                      borderRadius: '50%',
                      background: 'var(--primary-color)',
                      boxShadow: '0 0 0 4px var(--surface-color)',
                    }}
                  />

                  <div
                    className="surface-panel"
                    style={{
                      borderRadius: '24px',
                      padding: '20px',
                      display: 'grid',
                      gridTemplateColumns: 'minmax(0, 1fr) auto',
                      gap: '20px',
                      alignItems: 'center',
                      minHeight: '184px',
                    }}
                  >
                    <div style={{ display: 'grid', gap: '12px', paddingLeft: '4px' }}>
                      <div
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '8px',
                          padding: '7px 11px',
                          borderRadius: '999px',
                          background: 'var(--primary-soft)',
                          color: 'var(--primary-color)',
                          fontWeight: 800,
                          fontSize: '0.73rem',
                          width: 'fit-content',
                        }}
                      >
                        {badgeLabel}
                      </div>

                      <div>
                        <div
                          style={{
                            color: 'var(--text-tertiary)',
                            fontSize: '0.95rem',
                            fontWeight: 700,
                            marginBottom: '6px',
                          }}
                        >
                          {formatEventTime(event)}
                        </div>
                        <h3
                          style={{
                            margin: 0,
                            fontSize: '1.45rem',
                            fontWeight: 800,
                            color: 'var(--text-primary)',
                            letterSpacing: '-0.03em',
                          }}
                        >
                          {event.title}
                        </h3>
                      </div>

                      <div style={{ display: 'grid', gap: '8px', color: 'var(--text-secondary)' }}>
                        <div style={rowStyle}>
                          <MapPin size={16} color="var(--primary-color)" />
                          <span>{event.is_online ? 'Online event' : event.location || 'Location TBA'}</span>
                        </div>
                        <div style={rowStyle}>
                          {isAttending ? (
                            <Ticket size={16} color="var(--primary-color)" />
                          ) : (
                            <Users size={16} color="var(--primary-color)" />
                          )}
                          <span>{secondaryMeta}</span>
                        </div>
                      </div>

                      <div>
                        <Link href={actionHref} className="primary-button" style={{ minHeight: '40px' }}>
                          {ownsEvent ? 'Manage Event' : 'View Event'}
                          <ArrowRight size={16} />
                        </Link>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
                      <EventCover event={event} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

export default function BrowseEventsPageClient() {
  const { user, loading: authLoading } = useAuth();
  const [events, setEvents] = useState<EventRecord[]>([]);
  const [activeTab, setActiveTab] = useState<EventsTab>('upcoming');
  const [mode, setMode] = useState<EventsMode>('personal');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (authLoading) {
      return;
    }

    let mounted = true;

    const loadEvents = async () => {
      setLoading(true);
      setError('');

      const latestCreatedEvent =
        typeof window !== 'undefined' ? sessionStorage.getItem('latest_created_event') : null;
      const parsedLatestEvent = normalizeEvent(
        readCachedEvent(latestCreatedEvent) as Partial<EventRecord> | null,
        'hosting',
      );
      const hasSession = Boolean(typeof window !== 'undefined' && localStorage.getItem('evently_token'));
      const identity = user ?? readStoredTimelineIdentity();
      const personalCacheKey = getPersonalTimelineCacheKey(identity);
      const cachedPersonalEvents = readPersonalTimelineCache(personalCacheKey);

      if (user || hasSession) {
        const seededPersonalEvents = parsedLatestEvent
          ? mergeLatestEvent(cachedPersonalEvents, parsedLatestEvent)
          : cachedPersonalEvents;

        if (seededPersonalEvents.length > 0) {
          if (!mounted) return;
          setEvents(seededPersonalEvents);
          setMode('personal');
          setLoading(false);
        }

        const [hostedResult, ticketsResult] = await Promise.allSettled([
          api.get('/events/my-events'),
          api.get('/tickets/my-tickets'),
        ]);

        const hostedSucceeded = hostedResult.status === 'fulfilled';
        const ticketsSucceeded = ticketsResult.status === 'fulfilled';
        const cachedHostedEvents = cachedPersonalEvents.filter((event) => event.relationship === 'hosting');
        const hostedEventsFromApi = hostedSucceeded ? normalizeEventList(hostedResult.value.data, 'hosting') : [];
        const seededHostedEvents = parsedLatestEvent
          ? mergeUniqueTimelineItems([parsedLatestEvent], cachedHostedEvents)
          : cachedHostedEvents;
        const hostedEvents = hostedSucceeded
          ? isLocalFallbackResponse(hostedResult.value.headers)
            ? mergeUniqueTimelineItems(hostedEventsFromApi, seededHostedEvents)
            : mergeLatestEvent(hostedEventsFromApi, parsedLatestEvent)
          : seededHostedEvents;
        const attendingEvents = ticketsSucceeded ? normalizeTicketEvents(ticketsResult.value.data) : [];

        if (hostedSucceeded || ticketsSucceeded) {
          const mergedEvents = mergePersonalEvents(hostedEvents, attendingEvents, null);
          if (!mounted) return;
          setEvents(mergedEvents);
          setMode('personal');
          writePersonalTimelineCache(personalCacheKey, mergedEvents);
          if (parsedLatestEvent) {
            sessionStorage.removeItem('latest_created_event');
          }
          setLoading(false);
          return;
        }

        if (!mounted) return;
        if (cachedPersonalEvents.length > 0) {
          setEvents(mergeLatestEvent(cachedPersonalEvents, parsedLatestEvent));
          setMode('personal');
          if (parsedLatestEvent) {
            sessionStorage.removeItem('latest_created_event');
          }
          setLoading(false);
          return;
        }
        setMode('personal');
        setEvents(parsedLatestEvent ? [parsedLatestEvent] : []);
        setError('Could not load your events right now.');
        setLoading(false);
        return;
      }

      try {
        const publicResponse = await api.get('/events');
        if (!mounted) return;
        setEvents(normalizeEventList(publicResponse.data, 'public'));
        setMode('public');
      } catch {
        if (!mounted) return;
        setError('Could not load events right now.');
        setEvents([]);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    loadEvents();

    return () => {
      mounted = false;
    };
  }, [authLoading, user]);

  const { upcomingGroups, pastGroups, historyGroups } = useMemo(() => {
    const now = Date.now();
    const datedEvents = events
      .filter((event) => getEventDisplayDate(event))
      .sort((a, b) => {
        const left = getEventSortDate(a)?.getTime() || 0;
        const right = getEventSortDate(b)?.getTime() || 0;
        return right - left;
      });

    const upcoming = datedEvents.filter((event) => (getEventSortDate(event)?.getTime() || 0) >= now);
    const past = datedEvents.filter((event) => (getEventSortDate(event)?.getTime() || 0) < now);

    return {
      upcomingGroups: groupEventsByDay(
        [...upcoming].sort(
          (a, b) => (getEventSortDate(a)?.getTime() || 0) - (getEventSortDate(b)?.getTime() || 0),
        ),
      ).sort((a, b) => a.date.getTime() - b.date.getTime()),
      pastGroups: groupEventsByDay(past).sort((a, b) => b.date.getTime() - a.date.getTime()),
      historyGroups: groupEventsByHistory(events).sort((a, b) => b.date.getTime() - a.date.getTime()),
    };
  }, [events]);

  const activeGroups =
    activeTab === 'upcoming'
      ? upcomingGroups
      : mode === 'personal' && pastGroups.length === 0
        ? historyGroups
        : pastGroups;

  return (
    <main
      className="events-page"
      style={{
        minHeight: '100vh',
      }}
    >
      <section className="page-shell" style={{ paddingTop: '28px', paddingBottom: '60px' }}>
        <div
          className="surface-panel"
          style={{
            borderRadius: '24px',
            padding: '18px',
            marginBottom: '18px',
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-end',
              gap: '12px',
              flexWrap: 'wrap',
            }}
          >
            <div style={{ display: 'grid', gap: '8px' }}>
              <div className="eyebrow" style={{ width: 'fit-content', padding: '8px 12px', fontSize: '0.8rem' }}>
                <CalendarDays size={14} />
                {mode === 'personal' ? 'Your timeline' : 'Event timeline'}
              </div>
              <div>
                <h2
                  style={{
                    margin: 0,
                    fontSize: 'clamp(1.8rem, 3.4vw, 2.6rem)',
                    lineHeight: 0.95,
                    fontWeight: 800,
                    color: 'var(--text-primary)',
                    letterSpacing: '-0.05em',
                  }}
                >
                  Events
                </h2>
                <p
                  style={{
                    margin: '10px 0 0',
                    color: 'var(--text-secondary)',
                    fontSize: '0.94rem',
                    fontWeight: 500,
                    maxWidth: '560px',
                  }}
                >
                  Track the events you host and join across upcoming and past moments.
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
              <Link
                href={routes.createEvent}
                className="inline-flex items-center gap-2 rounded-2xl px-4 py-3 text-sm font-semibold text-white transition"
                style={{ background: 'var(--primary-color)' }}
              >
                <Plus size={16} />
                Create Event
              </Link>
              <div
                style={{
                  padding: '3px',
                  borderRadius: '12px',
                  background: 'var(--events-tabs-shell-bg)',
                  border: '1px solid var(--border-color)',
                  display: 'inline-flex',
                  boxShadow: 'var(--events-shadow-panel)',
                }}
              >
                {(['upcoming', 'past'] as const).map((tab) => {
                  const active = activeTab === tab;
                  return (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      style={{
                        padding: '8px 14px',
                        borderRadius: '10px',
                        border: active ? '1px solid var(--border-strong)' : '1px solid transparent',
                        background: active ? 'var(--primary-color)' : 'transparent',
                        color: active ? 'var(--primary-foreground)' : 'var(--text-secondary)',
                        fontWeight: 700,
                        cursor: 'pointer',
                        fontSize: '0.84rem',
                        boxShadow: active ? '0 12px 24px rgba(14,118,120,0.22)' : 'none',
                        transition: 'all 0.2s ease',
                      }}
                    >
                      {tab === 'upcoming' ? 'Upcoming' : 'Past'}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {error && (
              <div
                style={{
                  marginBottom: '18px',
                  padding: '11px 12px',
                  borderRadius: '14px',
                  background: 'var(--events-error-bg)',
                  border: '1px solid var(--events-error-border)',
                  color: 'rgb(var(--red-dark))',
                  fontWeight: 600,
                }}
              >
            {error}
          </div>
        )}

        {loading ? (
          <div style={{ minHeight: '42vh', display: 'grid', placeItems: 'center', color: 'var(--primary-color)' }}>
            <Loader2 className="animate-spin" size={40} />
          </div>
        ) : activeGroups.length === 0 ? (
          <EmptyState tab={activeTab} personalMode={mode === 'personal'} />
        ) : (
          <Timeline groups={activeGroups} />
        )}
      </section>
    </main>
  );
}

const rowStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '10px',
  fontSize: '0.96rem',
  fontWeight: 600,
};
