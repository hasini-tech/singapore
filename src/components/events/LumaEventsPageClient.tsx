'use client';

import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import {
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  ChevronLeft,
  Clock3,
  Copy,
  ExternalLink,
  Globe,
  Loader2,
  MapPin,
  Ticket,
  Users,
  X,
} from 'lucide-react';
import { useAuth } from '@/context/auth-context';
import { useMedia } from '@/hooks/use-media';
import api from '@/lib/api';
import { DEFAULT_EVENT_COVER } from '@/lib/defaults';
import { routes } from '@/config/routes';

type EventFilter = 'upcoming' | 'past';
type EventMode = 'personal' | 'public';
type EventRelationship = 'hosting' | 'public';

type EventRecord = {
  id: string;
  slug: string;
  title: string;
  description?: string;
  date?: string;
  time?: string;
  end_time?: string;
  location?: string;
  is_online?: boolean;
  cover_image?: string;
  attendee_count?: number;
  confirmed_count?: number;
  waitlisted_count?: number;
  checked_in_count?: number;
  max_seats?: number;
  ticket_price?: number;
  is_paid?: boolean;
  status?: string;
  created_at?: string;
  share_url?: string;
  host_name?: string;
  host_bio?: string;
  host_image?: string;
  community_enabled?: boolean;
  relationship: EventRelationship;
};

type AttendeeRecord = {
  id: string;
  name: string;
  bio?: string;
  profile_image?: string;
};

type EventGroup = {
  key: string;
  date: Date;
  items: EventRecord[];
};

function parseDateValue(value?: string | null) {
  if (!value) return null;

  const trimmed = value.trim();
  if (!trimmed) return null;

  const isoDateMatch = trimmed.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (isoDateMatch) {
    return new Date(
      Number(isoDateMatch[1]),
      Number(isoDateMatch[2]) - 1,
      Number(isoDateMatch[3])
    );
  }

  const dayMonthYearMatch = trimmed.match(/^(\d{2})-(\d{2})-(\d{4})$/);
  if (dayMonthYearMatch) {
    return new Date(
      Number(dayMonthYearMatch[3]),
      Number(dayMonthYearMatch[2]) - 1,
      Number(dayMonthYearMatch[1])
    );
  }

  const parsed = new Date(trimmed);
  if (Number.isNaN(parsed.getTime())) {
    return null;
  }

  return parsed;
}

function parseTimeValue(value?: string | null) {
  if (!value) return null;

  const trimmed = value.trim();
  if (!trimmed) return null;

  const twentyFourHour = trimmed.match(/^(\d{1,2}):(\d{2})$/);
  if (twentyFourHour) {
    return {
      hours: Number(twentyFourHour[1]),
      minutes: Number(twentyFourHour[2]),
    };
  }

  const meridiem = trimmed.match(/^(\d{1,2}):(\d{2})\s*([AP]M)$/i);
  if (!meridiem) {
    return null;
  }

  let hours = Number(meridiem[1]) % 12;
  if (meridiem[3].toUpperCase() === 'PM') {
    hours += 12;
  }

  return {
    hours,
    minutes: Number(meridiem[2]),
  };
}

function isDateOnlyValue(value?: string | null) {
  if (!value) return false;
  return (
    /^\d{4}-\d{2}-\d{2}$/.test(value.trim()) ||
    /^\d{2}-\d{2}-\d{4}$/.test(value.trim())
  );
}

function getEventDateTime(event: EventRecord) {
  const baseDate =
    parseDateValue(event.date) ?? parseDateValue(event.created_at);
  if (!baseDate) return null;

  const next = new Date(baseDate);
  if (isDateOnlyValue(event.date)) {
    const parsedTime = parseTimeValue(event.time);
    if (parsedTime) {
      next.setHours(parsedTime.hours, parsedTime.minutes, 0, 0);
    } else {
      next.setHours(23, 59, 59, 999);
    }
  }

  return next;
}

function formatDayKey(date: Date) {
  return `${date.getFullYear()}-${`${date.getMonth() + 1}`.padStart(2, '0')}-${`${date.getDate()}`.padStart(2, '0')}`;
}

function formatClock(value?: string | null) {
  const parsed = parseTimeValue(value);
  if (!parsed) {
    return value?.trim() || 'Time TBA';
  }

  const next = new Date();
  next.setHours(parsed.hours, parsed.minutes, 0, 0);

  return next.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  });
}

function formatTimeRange(event: EventRecord) {
  const start = formatClock(event.time);
  if (!event.end_time) {
    return start;
  }

  return `${start} - ${formatClock(event.end_time)}`;
}

function formatLongDate(value?: string | null) {
  const parsed = parseDateValue(value);
  if (!parsed) {
    return 'Date TBA';
  }

  return parsed.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

function formatGuestCount(event: EventRecord) {
  const guestCount = Number(event.confirmed_count || event.attendee_count || 0);
  if (guestCount <= 0) return 'No guests';
  if (guestCount === 1) return '1 guest';
  return `${guestCount} guests`;
}

function getStatusLabel(event: EventRecord) {
  if (event.relationship === 'hosting') {
    return event.status === 'private' ? 'Private Event' : 'Created Event';
  }

  return event.status === 'private' ? 'Private Invite' : 'Public Event';
}

function buildShareUrl(event: EventRecord) {
  if (event.share_url) {
    return event.share_url;
  }

  if (typeof window === 'undefined') {
    return `${routes.events}/${event.slug}`;
  }

  return `${window.location.origin}${routes.events}/${event.slug}`;
}

function normalizeEvent(
  raw: Partial<EventRecord> | null | undefined,
  relationship: EventRelationship
) {
  if (!raw?.id || !raw.slug || !raw.title) {
    return null;
  }

  const normalized: EventRecord = {
    id: String(raw.id),
    slug: String(raw.slug),
    title: String(raw.title),
    description: typeof raw.description === 'string' ? raw.description : '',
    date: typeof raw.date === 'string' ? raw.date : undefined,
    time: typeof raw.time === 'string' ? raw.time : undefined,
    end_time: typeof raw.end_time === 'string' ? raw.end_time : undefined,
    location: typeof raw.location === 'string' ? raw.location : undefined,
    is_online: Boolean(raw.is_online),
    cover_image:
      typeof raw.cover_image === 'string' ? raw.cover_image : undefined,
    attendee_count: Number(raw.attendee_count || 0),
    confirmed_count: Number(raw.confirmed_count || 0),
    waitlisted_count: Number(raw.waitlisted_count || 0),
    checked_in_count: Number(raw.checked_in_count || 0),
    max_seats: Number(raw.max_seats || 0),
    ticket_price: Number(raw.ticket_price || 0),
    is_paid: Boolean(raw.is_paid),
    status: typeof raw.status === 'string' ? raw.status : 'published',
    created_at: typeof raw.created_at === 'string' ? raw.created_at : undefined,
    share_url: typeof raw.share_url === 'string' ? raw.share_url : undefined,
    host_name: typeof raw.host_name === 'string' ? raw.host_name : undefined,
    host_bio: typeof raw.host_bio === 'string' ? raw.host_bio : undefined,
    host_image: typeof raw.host_image === 'string' ? raw.host_image : undefined,
    community_enabled: raw.community_enabled !== false,
    relationship,
  };

  return normalized;
}

function normalizeEventList(payload: unknown, relationship: EventRelationship) {
  if (!Array.isArray(payload)) {
    return [];
  }

  return payload
    .map((item) => normalizeEvent(item as Partial<EventRecord>, relationship))
    .filter((item): item is EventRecord => item !== null);
}

function normalizeAttendees(payload: unknown) {
  const attendees = (payload as { attendees?: unknown[] } | null)?.attendees;
  if (!Array.isArray(attendees)) {
    return [];
  }

  return attendees
    .map((item) => {
      const attendee = item as Partial<AttendeeRecord>;
      if (!attendee?.id || !attendee.name) {
        return null;
      }

      const normalized: AttendeeRecord = {
        id: String(attendee.id),
        name: String(attendee.name),
        bio: typeof attendee.bio === 'string' ? attendee.bio : '',
        profile_image:
          typeof attendee.profile_image === 'string'
            ? attendee.profile_image
            : undefined,
      };

      return normalized;
    })
    .filter((item): item is AttendeeRecord => item !== null);
}

function groupEventsByDay(events: EventRecord[]) {
  const map = new Map<string, EventGroup>();

  events.forEach((event) => {
    const eventDate = getEventDateTime(event);
    if (!eventDate) return;

    const key = formatDayKey(eventDate);
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
    items: [...group.items].sort((left, right) => {
      const leftValue = getEventDateTime(left)?.getTime() || 0;
      const rightValue = getEventDateTime(right)?.getTime() || 0;
      return leftValue - rightValue;
    }),
  }));
}

async function copyText(value: string) {
  if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(value);
    return;
  }

  const textarea = document.createElement('textarea');
  textarea.value = value;
  textarea.style.position = 'fixed';
  textarea.style.opacity = '0';
  textarea.style.left = '-9999px';
  document.body.appendChild(textarea);
  textarea.focus();
  textarea.select();
  document.execCommand('copy');
  document.body.removeChild(textarea);
}

function EmptyState({ filter }: { filter: EventFilter }) {
  return (
    <div
      style={{
        background: '#ffffff',
        border: '1px dashed #d9d3ca',
        borderRadius: '26px',
        padding: '48px 24px',
        textAlign: 'center',
        color: '#7a746b',
      }}
    >
      <div
        style={{
          fontSize: '1.5rem',
          fontWeight: 700,
          marginBottom: '10px',
          color: '#24211c',
        }}
      >
        No {filter} events yet
      </div>
      <div style={{ maxWidth: 460, margin: '0 auto', lineHeight: 1.7 }}>
        Newly created events will appear here in the timeline.
      </div>
    </div>
  );
}

function AttendeeAvatar({
  attendee,
  index,
}: {
  attendee: AttendeeRecord;
  index: number;
}) {
  const initials = attendee.name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('');

  return attendee.profile_image ? (
    <img
      src={attendee.profile_image}
      alt={attendee.name}
      style={{
        width: 28,
        height: 28,
        borderRadius: '999px',
        objectFit: 'cover',
        border: '2px solid #fff',
        marginLeft: index === 0 ? 0 : -8,
        boxShadow: '0 4px 10px rgba(15,23,42,0.08)',
      }}
    />
  ) : (
    <div
      title={attendee.name}
      style={{
        width: 28,
        height: 28,
        borderRadius: '999px',
        display: 'grid',
        placeItems: 'center',
        background: '#f6cdd6',
        color: '#7d2043',
        fontSize: '0.72rem',
        fontWeight: 700,
        border: '2px solid #fff',
        marginLeft: index === 0 ? 0 : -8,
        boxShadow: '0 4px 10px rgba(15,23,42,0.08)',
      }}
    >
      {initials || 'G'}
    </div>
  );
}

function EventDetailDrawer({
  event,
  attendees,
  loading,
  error,
  created,
  onClose,
  onCopy,
  copyFeedback,
}: {
  event: EventRecord | null;
  attendees: AttendeeRecord[];
  loading: boolean;
  error: string;
  created: boolean;
  onClose: () => void;
  onCopy: () => void;
  copyFeedback: string;
}) {
  const isMobile = useMedia('(max-width: 1024px)', false);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, []);

  const shareUrl = event ? buildShareUrl(event) : '';
  const ticketPriceLabel =
    event && event.is_paid
      ? `$${Number(event.ticket_price || 0).toFixed(2)}`
      : 'Free';
  const seatsLabel =
    event && Number(event.max_seats || 0) > 0
      ? `${Number(event.max_seats)} seats`
      : 'Unlimited';
  const locationLabel = event?.is_online
    ? 'Online event'
    : event?.location || 'Venue TBA';
  const showMap = Boolean(event && !event.is_online && event.location);

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 80,
        background: 'rgba(21, 18, 12, 0.18)',
        backdropFilter: 'blur(4px)',
      }}
      onClick={onClose}
    >
      <aside
        onClick={(eventTarget) => eventTarget.stopPropagation()}
        style={{
          position: 'absolute',
          top: 0,
          right: 0,
          bottom: 0,
          width: isMobile ? '100%' : 'min(520px, 100vw)',
          background: '#fffdf9',
          borderLeft: isMobile ? 'none' : '1px solid #e8e0d5',
          boxShadow: '-24px 0 80px rgba(15, 23, 42, 0.14)',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <div
          style={{
            position: 'sticky',
            top: 0,
            zIndex: 2,
            padding: '14px 14px 12px',
            background: 'rgba(255, 253, 249, 0.94)',
            borderBottom: '1px solid #efe7dc',
            backdropFilter: 'blur(12px)',
          }}
        >
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <button
              type="button"
              onClick={onClose}
              style={headerIconButtonStyle}
            >
              {isMobile ? <ChevronLeft size={16} /> : <X size={16} />}
            </button>
            <button type="button" onClick={onCopy} style={headerButtonStyle}>
              <Copy size={15} />
              Copy Link
            </button>
            <a
              href={event ? `${routes.events}/${event.slug}` : '#'}
              target="_blank"
              rel="noreferrer"
              style={headerButtonStyle}
            >
              Event Page
              <ExternalLink size={14} />
            </a>
            {event?.relationship === 'hosting' && (
              <Link
                href={`/manage/${event.slug}`}
                style={{ ...headerButtonStyle, marginLeft: 'auto' }}
              >
                Manage
                <ArrowRight size={14} />
              </Link>
            )}
          </div>
          {copyFeedback ? (
            <div
              style={{
                marginTop: '10px',
                fontSize: '0.8rem',
                fontWeight: 700,
                color: '#ba5b76',
              }}
            >
              {copyFeedback}
            </div>
          ) : null}
        </div>

        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: isMobile ? '16px 16px 28px' : '18px 18px 36px',
          }}
        >
          {loading && !event ? (
            <div
              style={{
                minHeight: '45vh',
                display: 'grid',
                placeItems: 'center',
                color: '#986f3f',
              }}
            >
              <Loader2 className="animate-spin" size={34} />
            </div>
          ) : error && !event ? (
            <div
              style={{
                marginTop: '8px',
                borderRadius: '18px',
                border: '1px solid #f3c4cf',
                background: '#fff1f4',
                color: '#b4235d',
                fontWeight: 700,
                padding: '16px',
              }}
            >
              {error}
            </div>
          ) : event ? (
            <div style={{ display: 'grid', gap: '18px' }}>
              {event.relationship === 'hosting' && (
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    gap: '12px',
                    alignItems: 'center',
                    borderRadius: '18px',
                    background: created ? '#ffd6e5' : '#fde2ec',
                    color: '#c2185b',
                    padding: '14px 16px',
                    fontWeight: 700,
                  }}
                >
                  <span>
                    {created
                      ? 'Your event was created successfully.'
                      : 'You have manage access for this event.'}
                  </span>
                  <Link
                    href={`/manage/${event.slug}`}
                    style={manageBannerButtonStyle}
                  >
                    Manage
                    <ArrowRight size={14} />
                  </Link>
                </div>
              )}

              <div
                style={{
                  overflow: 'hidden',
                  borderRadius: '24px',
                  background: '#131313',
                  minHeight: isMobile ? 260 : 278,
                  boxShadow: '0 24px 60px rgba(15,23,42,0.15)',
                }}
              >
                <img
                  src={event.cover_image || DEFAULT_EVENT_COVER}
                  alt={event.title}
                  className="evently-image"
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              </div>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                <span style={detailTagStyle}>{getStatusLabel(event)}</span>
                <span style={detailTagStyle}>
                  {event.is_online ? 'Online' : 'In Person'}
                </span>
                <span style={detailTagStyle}>{ticketPriceLabel}</span>
              </div>

              <div>
                <h2
                  style={{
                    margin: 0,
                    fontSize: isMobile ? '2rem' : '2.25rem',
                    lineHeight: 1.04,
                    letterSpacing: '-0.05em',
                    color: '#181511',
                  }}
                >
                  {event.title}
                </h2>
                <div
                  style={{
                    marginTop: '12px',
                    color: '#7f776e',
                    fontSize: '0.96rem',
                    fontWeight: 600,
                  }}
                >
                  Presented by {event.host_name || 'GrowthLab Events'}
                </div>
              </div>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
                  gap: '12px',
                }}
              >
                <div style={infoCardStyle}>
                  <CalendarDays size={18} color="#a36d2f" />
                  <div>
                    <div style={infoLabelStyle}>Date</div>
                    <div style={infoValueStyle}>
                      {formatLongDate(event.date)}
                    </div>
                  </div>
                </div>
                <div style={infoCardStyle}>
                  <Clock3 size={18} color="#a36d2f" />
                  <div>
                    <div style={infoLabelStyle}>Time</div>
                    <div style={infoValueStyle}>{formatTimeRange(event)}</div>
                  </div>
                </div>
                <div style={infoCardStyle}>
                  <MapPin size={18} color="#a36d2f" />
                  <div>
                    <div style={infoLabelStyle}>Location</div>
                    <div style={infoValueStyle}>{locationLabel}</div>
                  </div>
                </div>
                <div style={infoCardStyle}>
                  <Users size={18} color="#a36d2f" />
                  <div>
                    <div style={infoLabelStyle}>Guests</div>
                    <div style={infoValueStyle}>{formatGuestCount(event)}</div>
                  </div>
                </div>
              </div>

              <section style={sectionCardStyle}>
                <div style={sectionLabelStyle}>Registration</div>
                <div style={{ color: '#4c4337', lineHeight: 1.65 }}>
                  Guests will use this event page to register.
                </div>
                <div
                  style={{
                    marginTop: '14px',
                    borderRadius: '18px',
                    border: '1px solid #efe2d1',
                    background: '#fff8f0',
                    padding: '14px 16px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    gap: '14px',
                    alignItems: 'center',
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 700, color: '#201b16' }}>
                      General Admission
                    </div>
                    <div
                      style={{
                        marginTop: '4px',
                        color: '#7c7367',
                        fontSize: '0.92rem',
                      }}
                    >
                      {event.status === 'private'
                        ? 'Private registration link'
                        : 'Open registration on the event page'}
                    </div>
                  </div>
                  <div style={{ fontWeight: 800, color: '#a36d2f' }}>
                    {ticketPriceLabel}
                  </div>
                </div>
              </section>

              <section style={sectionCardStyle}>
                <div style={sectionLabelStyle}>About Event</div>
                <div
                  style={{
                    color: '#4c4337',
                    lineHeight: 1.75,
                    whiteSpace: 'pre-wrap',
                  }}
                >
                  {event.description?.trim() ||
                    'No description has been added yet.'}
                </div>
              </section>

              <section style={sectionCardStyle}>
                <div style={sectionLabelStyle}>Location</div>
                <div
                  style={{
                    color: '#201b16',
                    fontWeight: 700,
                    marginBottom: '8px',
                  }}
                >
                  {locationLabel}
                </div>
                {showMap ? (
                  <iframe
                    title={`${event.title} map`}
                    src={`https://www.google.com/maps?q=${encodeURIComponent(event.location || '')}&output=embed`}
                    loading="lazy"
                    style={{
                      width: '100%',
                      height: 220,
                      border: 0,
                      borderRadius: '18px',
                      marginTop: '12px',
                    }}
                  />
                ) : (
                  <div
                    style={{
                      marginTop: '12px',
                      borderRadius: '18px',
                      padding: '18px',
                      background: '#fff8f0',
                      border: '1px solid #efe2d1',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      color: '#7c7367',
                    }}
                  >
                    <Globe size={18} color="#a36d2f" />
                    This event will be hosted online.
                  </div>
                )}
              </section>

              <section style={sectionCardStyle}>
                <div style={sectionLabelStyle}>Community</div>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    gap: '12px',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                  }}
                >
                  <div style={{ color: '#4c4337' }}>
                    {attendees.length > 0
                      ? 'Registered guests already showing interest in this event.'
                      : 'Guest profiles will appear here after people RSVP.'}
                  </div>
                  <div
                    style={{
                      padding: '8px 12px',
                      borderRadius: '999px',
                      background: '#f7eee4',
                      color: '#9c6b35',
                      fontWeight: 800,
                    }}
                  >
                    {formatGuestCount(event)}
                  </div>
                </div>
                {attendees.length > 0 ? (
                  <div
                    style={{ marginTop: '16px', display: 'grid', gap: '12px' }}
                  >
                    <div style={{ display: 'flex', paddingLeft: '8px' }}>
                      {attendees.slice(0, 5).map((attendee, index) => (
                        <AttendeeAvatar
                          key={attendee.id}
                          attendee={attendee}
                          index={index}
                        />
                      ))}
                    </div>
                    <div style={{ display: 'grid', gap: '10px' }}>
                      {attendees.slice(0, 4).map((attendee) => (
                        <div
                          key={attendee.id}
                          style={{
                            display: 'flex',
                            gap: '12px',
                            alignItems: 'center',
                            borderRadius: '16px',
                            background: '#fff8f0',
                            border: '1px solid #efe2d1',
                            padding: '12px 14px',
                          }}
                        >
                          <AttendeeAvatar attendee={attendee} index={0} />
                          <div style={{ minWidth: 0 }}>
                            <div style={{ fontWeight: 700, color: '#201b16' }}>
                              {attendee.name}
                            </div>
                            <div
                              style={{
                                fontSize: '0.9rem',
                                color: '#7c7367',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                              }}
                            >
                              {attendee.bio || 'Attending this event'}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : null}
              </section>

              <section style={sectionCardStyle}>
                <div style={sectionLabelStyle}>Hosted By</div>
                <div
                  style={{ display: 'flex', gap: '14px', alignItems: 'center' }}
                >
                  {event.host_image ? (
                    <img
                      src={event.host_image}
                      alt={event.host_name || 'Host'}
                      style={{
                        width: 52,
                        height: 52,
                        borderRadius: '999px',
                        objectFit: 'cover',
                      }}
                    />
                  ) : (
                    <div
                      style={{
                        width: 52,
                        height: 52,
                        borderRadius: '999px',
                        background: '#f6ddd0',
                        display: 'grid',
                        placeItems: 'center',
                        color: '#b26a29',
                      }}
                    >
                      <Users size={22} />
                    </div>
                  )}
                  <div>
                    <div style={{ fontWeight: 800, color: '#201b16' }}>
                      {event.host_name || 'GrowthLab'}
                    </div>
                    <div
                      style={{
                        color: '#7c7367',
                        marginTop: '4px',
                        lineHeight: 1.6,
                      }}
                    >
                      {event.host_bio?.trim() || 'Event host and organizer'}
                    </div>
                  </div>
                </div>
              </section>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
                  gap: '12px',
                }}
              >
                <Link
                  href={
                    event.relationship === 'hosting'
                      ? `/manage/${event.slug}`
                      : `${routes.events}/${event.slug}`
                  }
                  style={primaryActionStyle}
                >
                  {event.relationship === 'hosting'
                    ? 'Manage Event'
                    : 'Open Event Page'}
                  <ArrowRight size={16} />
                </Link>
                <a
                  href={shareUrl}
                  target="_blank"
                  rel="noreferrer"
                  style={secondaryActionStyle}
                >
                  Share Event
                  <ExternalLink size={15} />
                </a>
              </div>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)',
                  gap: '12px',
                }}
              >
                <div style={miniStatStyle}>
                  <div style={miniStatLabelStyle}>Capacity</div>
                  <div style={miniStatValueStyle}>{seatsLabel}</div>
                </div>
                <div style={miniStatStyle}>
                  <div style={miniStatLabelStyle}>Confirmed</div>
                  <div style={miniStatValueStyle}>
                    {Number(event.confirmed_count || 0)}
                  </div>
                </div>
                <div style={miniStatStyle}>
                  <div style={miniStatLabelStyle}>Checked In</div>
                  <div style={miniStatValueStyle}>
                    {Number(event.checked_in_count || 0)}
                  </div>
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </aside>
    </div>
  );
}

export default function LumaEventsPageClient() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { user, loading: authLoading } = useAuth();
  const isTablet = useMedia('(max-width: 1024px)', false);

  const [filter, setFilter] = useState<EventFilter>('upcoming');
  const [mode, setMode] = useState<EventMode>('public');
  const [events, setEvents] = useState<EventRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState('');
  const [selectedEvent, setSelectedEvent] = useState<EventRecord | null>(null);
  const [selectedAttendees, setSelectedAttendees] = useState<AttendeeRecord[]>(
    []
  );
  const [copyFeedback, setCopyFeedback] = useState('');

  const selectedSlug = searchParams.get('event') || '';
  const created = searchParams.get('created') === '1';

  useEffect(() => {
    if (!copyFeedback) return;

    const timer = window.setTimeout(() => setCopyFeedback(''), 2200);
    return () => window.clearTimeout(timer);
  }, [copyFeedback]);

  useEffect(() => {
    if (authLoading) {
      return;
    }

    let mounted = true;

    async function loadEvents() {
      setLoading(true);
      setError('');

      const hasSession = Boolean(
        typeof window !== 'undefined' && localStorage.getItem('evently_token')
      );

      try {
        if (user || hasSession) {
          const response = await api.get('/events/my-events');
          if (!mounted) return;

          setMode('personal');
          setEvents(normalizeEventList(response.data, 'hosting'));
          return;
        }

        const response = await api.get('/events');
        if (!mounted) return;

        setMode('public');
        setEvents(normalizeEventList(response.data, 'public'));
      } catch (requestError: any) {
        if (!mounted) return;

        setEvents([]);
        setError(
          requestError?.response?.data?.detail ||
            'Could not load the event timeline right now.'
        );
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    loadEvents();

    return () => {
      mounted = false;
    };
  }, [authLoading, user]);

  useEffect(() => {
    if (!selectedSlug) {
      setSelectedEvent(null);
      setSelectedAttendees([]);
      setDetailError('');
      setDetailLoading(false);
      return;
    }

    let mounted = true;
    const listMatch =
      events.find((event) => event.slug === selectedSlug) || null;

    if (listMatch) {
      setSelectedEvent(listMatch);
    }

    async function loadEventDetail() {
      setDetailLoading(true);
      setDetailError('');

      const relationship =
        listMatch?.relationship || (mode === 'personal' ? 'hosting' : 'public');

      const [eventResult, communityResult] = await Promise.allSettled([
        api.get(`/events/${encodeURIComponent(selectedSlug)}`),
        api.get(`/events/${encodeURIComponent(selectedSlug)}/community`),
      ]);

      if (!mounted) return;

      if (eventResult.status === 'fulfilled') {
        const normalized = normalizeEvent(
          eventResult.value.data as Partial<EventRecord>,
          relationship
        );
        if (normalized) {
          setSelectedEvent(normalized);
        } else {
          setDetailError('Could not open this event.');
        }
      } else if (!listMatch) {
        setSelectedEvent(null);
        setDetailError(
          (eventResult.reason as any)?.response?.data?.detail ||
            'Could not open this event.'
        );
      }

      if (communityResult.status === 'fulfilled') {
        setSelectedAttendees(normalizeAttendees(communityResult.value.data));
      } else {
        setSelectedAttendees([]);
      }

      setDetailLoading(false);
    }

    void loadEventDetail();

    return () => {
      mounted = false;
    };
  }, [events, mode, selectedSlug]);

  const groupedEvents = useMemo(() => {
    const now = Date.now();
    const datedEvents = events
      .filter((event) => getEventDateTime(event))
      .sort((left, right) => {
        const leftValue = getEventDateTime(left)?.getTime() || 0;
        const rightValue = getEventDateTime(right)?.getTime() || 0;
        return leftValue - rightValue;
      });

    const visibleEvents =
      filter === 'upcoming'
        ? datedEvents.filter(
            (event) => (getEventDateTime(event)?.getTime() || 0) >= now
          )
        : [...datedEvents]
            .filter((event) => (getEventDateTime(event)?.getTime() || 0) < now)
            .sort(
              (left, right) =>
                (getEventDateTime(right)?.getTime() || 0) -
                (getEventDateTime(left)?.getTime() || 0)
            );

    const groups = groupEventsByDay(visibleEvents);
    return filter === 'upcoming'
      ? groups.sort((left, right) => left.date.getTime() - right.date.getTime())
      : groups.sort(
          (left, right) => right.date.getTime() - left.date.getTime()
        );
  }, [events, filter]);

  const selectEvent = (slug: string) => {
    const nextParams = new URLSearchParams(searchParams.toString());
    nextParams.set('event', slug);
    const nextQuery = nextParams.toString();
    router.replace(nextQuery ? `${pathname}?${nextQuery}` : pathname, {
      scroll: false,
    });
  };

  const closeDetail = () => {
    const nextParams = new URLSearchParams(searchParams.toString());
    nextParams.delete('event');
    nextParams.delete('created');
    const nextQuery = nextParams.toString();
    router.replace(nextQuery ? `${pathname}?${nextQuery}` : pathname, {
      scroll: false,
    });
  };

  const handleCopyLink = async () => {
    if (!selectedEvent) return;

    try {
      await copyText(buildShareUrl(selectedEvent));
      setCopyFeedback('Event link copied.');
    } catch {
      setCopyFeedback('Could not copy the event link.');
    }
  };

  return (
    <main
      style={{
        minHeight: '100vh',
        background:
          'linear-gradient(180deg, #f8f4ef 0%, #f6f1e8 28%, #f9f7f2 100%)',
        color: '#201b16',
      }}
    >
      <header
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 20,
          backdropFilter: 'blur(10px)',
          background: 'rgba(248, 244, 239, 0.86)',
          borderBottom: '1px solid rgba(95, 78, 57, 0.08)',
        }}
      >
        <div
          style={{
            maxWidth: 1180,
            margin: '0 auto',
            padding: '14px 20px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '16px',
            flexWrap: 'wrap',
          }}
        >
          <div
            style={{
              display: 'flex',
              gap: '16px',
              alignItems: 'center',
              flexWrap: 'wrap',
            }}
          >
            <div
              style={{
                width: 30,
                height: 30,
                borderRadius: '999px',
                background: 'linear-gradient(135deg, #f2d8bc, #f9ede1)',
                display: 'grid',
                placeItems: 'center',
                color: '#9a6431',
                boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.8)',
              }}
            >
              <CalendarDays size={16} />
            </div>
            <Link href={routes.luma.events} style={activeNavStyle}>
              Events
            </Link>
            <Link href={routes.eventCalendar} style={navStyle}>
              Calendars
            </Link>
            <Link href={routes.discover} style={navStyle}>
              Discover
            </Link>
          </div>

          <Link href={routes.luma.createEvent} style={createButtonStyle}>
            Create Event
            <ArrowRight size={15} />
          </Link>
        </div>
      </header>

      <section
        style={{ maxWidth: 1180, margin: '0 auto', padding: '30px 20px 84px' }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: isTablet ? 'stretch' : 'flex-end',
            gap: '18px',
            flexWrap: 'wrap',
            marginBottom: '24px',
          }}
        >
          <div style={{ display: 'grid', gap: '10px' }}>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 12px',
                borderRadius: '999px',
                background: '#fff8f0',
                border: '1px solid #ebdecd',
                color: '#a36d2f',
                fontWeight: 800,
                fontSize: '0.78rem',
                width: 'fit-content',
              }}
            >
              <CheckCircle2 size={14} />
              {mode === 'personal'
                ? 'Your Luma timeline'
                : 'Luma event timeline'}
            </div>
            <div>
              <h1
                style={{
                  margin: 0,
                  fontSize: 'clamp(2.2rem, 5vw, 3.4rem)',
                  lineHeight: 0.95,
                  letterSpacing: '-0.06em',
                }}
              >
                Events
              </h1>
              <p
                style={{
                  margin: '10px 0 0',
                  color: '#7a746b',
                  fontSize: '1rem',
                  maxWidth: 620,
                  lineHeight: 1.7,
                }}
              >
                Newly created events show up here as a timeline card, and you
                can open the event details on the right just like the Luma
                layout in your screenshots.
              </p>
            </div>
          </div>

          <div
            style={{
              display: 'inline-flex',
              padding: '4px',
              borderRadius: '16px',
              background: '#fffdfa',
              border: '1px solid #eadfce',
              boxShadow: '0 12px 30px rgba(15, 23, 42, 0.05)',
            }}
          >
            {(['upcoming', 'past'] as const).map((key) => {
              const active = filter === key;
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => setFilter(key)}
                  style={{
                    padding: '10px 16px',
                    borderRadius: '12px',
                    border: 'none',
                    background: active ? '#1b1712' : 'transparent',
                    color: active ? '#fff9f2' : '#6b6459',
                    fontWeight: 700,
                    cursor: 'pointer',
                    minWidth: 112,
                  }}
                >
                  {key === 'upcoming' ? 'Upcoming' : 'Past'}
                </button>
              );
            })}
          </div>
        </div>

        {created ? (
          <div
            style={{
              marginBottom: '18px',
              padding: '14px 16px',
              borderRadius: '18px',
              background: '#ffe5ef',
              border: '1px solid #f7bfd4',
              color: '#bb2a63',
              fontWeight: 700,
            }}
          >
            Event created. Open the card to review it in the Luma-style detail
            panel.
          </div>
        ) : null}

        {error ? (
          <div
            style={{
              marginBottom: '18px',
              padding: '14px 16px',
              borderRadius: '18px',
              background: '#fff1f4',
              border: '1px solid #f4c8d4',
              color: '#b4235d',
              fontWeight: 700,
            }}
          >
            {error}
          </div>
        ) : null}

        {loading ? (
          <div
            style={{
              minHeight: '45vh',
              display: 'grid',
              placeItems: 'center',
              color: '#a36d2f',
            }}
          >
            <Loader2 className="animate-spin" size={40} />
          </div>
        ) : groupedEvents.length === 0 ? (
          <EmptyState filter={filter} />
        ) : (
          <div style={{ display: 'grid', gap: '28px' }}>
            {groupedEvents.map((group) => (
              <div
                key={group.key}
                style={{
                  display: 'grid',
                  gridTemplateColumns: isTablet ? '1fr' : '150px 1fr',
                  gap: isTablet ? '12px' : '0',
                  alignItems: 'start',
                }}
              >
                <div style={{ paddingRight: isTablet ? 0 : 24 }}>
                  <div
                    style={{
                      fontSize: isTablet ? '1.5rem' : '1.85rem',
                      lineHeight: 1,
                      fontWeight: 800,
                      letterSpacing: '-0.05em',
                    }}
                  >
                    {group.date.toLocaleDateString('en-US', {
                      day: 'numeric',
                      month: 'short',
                    })}
                  </div>
                  <div
                    style={{
                      marginTop: '6px',
                      color: '#aca497',
                      fontSize: '0.98rem',
                    }}
                  >
                    {group.date.toLocaleDateString('en-US', {
                      weekday: 'long',
                    })}
                  </div>
                </div>

                <div
                  style={{
                    position: 'relative',
                    display: 'grid',
                    gap: '14px',
                    paddingLeft: isTablet ? 0 : 28,
                    borderLeft: isTablet ? 'none' : '1px dashed #e4d7c6',
                  }}
                >
                  {group.items.map((event) => {
                    const active = selectedSlug === event.slug;
                    const guestCount = Number(
                      event.confirmed_count || event.attendee_count || 0
                    );

                    return (
                      <button
                        key={event.id}
                        type="button"
                        onClick={() => selectEvent(event.slug)}
                        style={{
                          position: 'relative',
                          textAlign: 'left',
                          border: active
                            ? '1px solid #dabb95'
                            : '1px solid #eee4d8',
                          background: active ? '#fffdf9' : '#ffffff',
                          borderRadius: '26px',
                          padding: isTablet ? '16px' : '18px 18px 18px 20px',
                          boxShadow: active
                            ? '0 22px 44px rgba(163,109,47,0.10)'
                            : '0 16px 36px rgba(15,23,42,0.05)',
                          display: 'grid',
                          gridTemplateColumns: isTablet
                            ? '1fr'
                            : 'minmax(0, 1fr) 132px',
                          gap: '18px',
                          alignItems: 'center',
                          cursor: 'pointer',
                        }}
                      >
                        {!isTablet ? (
                          <span
                            style={{
                              position: 'absolute',
                              left: -35,
                              top: 28,
                              width: 10,
                              height: 10,
                              borderRadius: '999px',
                              background: active ? '#d69037' : '#d7ccbe',
                              boxShadow: '0 0 0 4px #f8f4ef',
                            }}
                          />
                        ) : null}

                        <div style={{ minWidth: 0 }}>
                          <div
                            style={{
                              display: 'flex',
                              flexWrap: 'wrap',
                              alignItems: 'center',
                              gap: '8px',
                              marginBottom: '10px',
                              color: '#8f8577',
                              fontWeight: 700,
                            }}
                          >
                            <span>{formatClock(event.time)}</span>
                            {event.end_time ? (
                              <span style={{ color: '#d69037' }}>
                                {formatClock(event.end_time)}
                              </span>
                            ) : null}
                          </div>

                          <div style={{ marginBottom: '10px' }}>
                            <div
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '8px',
                                marginBottom: '8px',
                                padding: '6px 10px',
                                borderRadius: '999px',
                                background: '#fff5e7',
                                color: '#c07d2f',
                                fontSize: '0.76rem',
                                fontWeight: 800,
                              }}
                            >
                              {getStatusLabel(event)}
                            </div>
                            <h3
                              style={{
                                margin: 0,
                                fontSize: isTablet ? '1.25rem' : '1.4rem',
                                lineHeight: 1.22,
                                letterSpacing: '-0.03em',
                                color: '#201b16',
                              }}
                            >
                              {event.title}
                            </h3>
                          </div>

                          <div
                            style={{
                              display: 'grid',
                              gap: '8px',
                              color: '#7f776e',
                            }}
                          >
                            <div style={timelineRowStyle}>
                              <MapPin size={16} color="#b7ab9c" />
                              <span>
                                {event.is_online
                                  ? 'Online event'
                                  : event.location || 'Location TBA'}
                              </span>
                            </div>
                            <div style={timelineRowStyle}>
                              {event.relationship === 'hosting' ? (
                                <Users size={16} color="#b7ab9c" />
                              ) : (
                                <Ticket size={16} color="#b7ab9c" />
                              )}
                              <span>{formatGuestCount(event)}</span>
                            </div>
                          </div>

                          <div
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '12px',
                              marginTop: '16px',
                              flexWrap: 'wrap',
                            }}
                          >
                            <span style={timelineActionStyle}>
                              {event.relationship === 'hosting'
                                ? 'Manage Event'
                                : 'Open Event'}
                              <ArrowRight size={15} />
                            </span>

                            {guestCount > 0 ? (
                              <span
                                style={{
                                  color: '#9e9488',
                                  fontSize: '0.92rem',
                                  fontWeight: 700,
                                }}
                              >
                                +{guestCount} joined
                              </span>
                            ) : null}
                          </div>
                        </div>

                        <div
                          style={{
                            width: isTablet ? '100%' : 120,
                            height: isTablet ? 180 : 120,
                            borderRadius: '18px',
                            overflow: 'hidden',
                            justifySelf: isTablet ? 'stretch' : 'end',
                            background: '#17110f',
                          }}
                        >
                          <img
                            src={event.cover_image || DEFAULT_EVENT_COVER}
                            alt={event.title}
                            className="evently-image"
                            style={{
                              width: '100%',
                              height: '100%',
                              objectFit: 'cover',
                            }}
                          />
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {selectedSlug ? (
        <EventDetailDrawer
          event={selectedEvent}
          attendees={selectedAttendees}
          loading={detailLoading}
          error={detailError}
          created={created}
          onClose={closeDetail}
          onCopy={handleCopyLink}
          copyFeedback={copyFeedback}
        />
      ) : null}
    </main>
  );
}

const navStyle: React.CSSProperties = {
  color: '#8c8478',
  textDecoration: 'none',
  fontWeight: 700,
};

const activeNavStyle: React.CSSProperties = {
  ...navStyle,
  color: '#2c241b',
};

const createButtonStyle: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: '8px',
  padding: '10px 14px',
  borderRadius: '14px',
  background: '#1b1712',
  color: '#fff9f2',
  textDecoration: 'none',
  fontWeight: 700,
  boxShadow: '0 16px 26px rgba(27, 23, 18, 0.16)',
};

const timelineRowStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  minWidth: 0,
  fontSize: '0.96rem',
  lineHeight: 1.5,
};

const timelineActionStyle: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: '8px',
  padding: '10px 14px',
  borderRadius: '12px',
  background: '#f6f0e7',
  color: '#635849',
  fontWeight: 700,
};

const headerIconButtonStyle: React.CSSProperties = {
  width: 36,
  height: 36,
  borderRadius: '12px',
  border: '1px solid #eadfce',
  background: '#ffffff',
  color: '#53483b',
  display: 'grid',
  placeItems: 'center',
  cursor: 'pointer',
};

const headerButtonStyle: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '8px',
  borderRadius: '12px',
  border: '1px solid #eadfce',
  background: '#ffffff',
  color: '#5f5446',
  padding: '10px 12px',
  fontWeight: 700,
  textDecoration: 'none',
};

const manageBannerButtonStyle: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: '8px',
  borderRadius: '999px',
  padding: '8px 12px',
  background: '#f82581',
  color: '#fff',
  textDecoration: 'none',
  whiteSpace: 'nowrap',
};

const detailTagStyle: React.CSSProperties = {
  padding: '7px 10px',
  borderRadius: '999px',
  background: '#fff4e7',
  color: '#c97f2d',
  fontWeight: 800,
  fontSize: '0.76rem',
};

const infoCardStyle: React.CSSProperties = {
  display: 'flex',
  gap: '12px',
  alignItems: 'flex-start',
  padding: '14px 16px',
  borderRadius: '18px',
  background: '#fff8f0',
  border: '1px solid #efe2d1',
};

const infoLabelStyle: React.CSSProperties = {
  fontSize: '0.78rem',
  fontWeight: 800,
  letterSpacing: '0.08em',
  textTransform: 'uppercase',
  color: '#ad8b61',
};

const infoValueStyle: React.CSSProperties = {
  marginTop: '5px',
  fontWeight: 700,
  color: '#201b16',
  lineHeight: 1.55,
};

const sectionCardStyle: React.CSSProperties = {
  borderRadius: '22px',
  border: '1px solid #efe2d1',
  background: '#fffdfa',
  padding: '18px',
};

const sectionLabelStyle: React.CSSProperties = {
  fontSize: '0.82rem',
  letterSpacing: '0.08em',
  textTransform: 'uppercase',
  fontWeight: 800,
  color: '#ad8b61',
  marginBottom: '14px',
};

const primaryActionStyle: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '8px',
  borderRadius: '16px',
  padding: '13px 16px',
  background: '#1b1712',
  color: '#fff9f2',
  textDecoration: 'none',
  fontWeight: 800,
};

const secondaryActionStyle: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '8px',
  borderRadius: '16px',
  padding: '13px 16px',
  background: '#fff8f0',
  color: '#6a5f50',
  border: '1px solid #efe2d1',
  textDecoration: 'none',
  fontWeight: 800,
};

const miniStatStyle: React.CSSProperties = {
  borderRadius: '18px',
  border: '1px solid #efe2d1',
  background: '#fff8f0',
  padding: '14px 16px',
};

const miniStatLabelStyle: React.CSSProperties = {
  fontSize: '0.8rem',
  textTransform: 'uppercase',
  letterSpacing: '0.08em',
  fontWeight: 800,
  color: '#ad8b61',
};

const miniStatValueStyle: React.CSSProperties = {
  marginTop: '8px',
  fontSize: '1.15rem',
  fontWeight: 800,
  color: '#201b16',
};
