'use client';

import Link from 'next/link';
import { useEffect, useState, type CSSProperties } from 'react';
import {
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  Globe2,
  Loader2,
  MapPin,
  Users,
} from 'lucide-react';
import {
  lumaListPageColors,
  lumaListPageFontStack,
} from '@/config/luma-page-theme';
import { routes } from '@/config/routes';
import api from '@/lib/api';

const C = lumaListPageColors;

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

function formatCountLabel(
  value: number,
  singular: string,
  plural = `${singular}s`
) {
  return `${value} ${value === 1 ? singular : plural}`;
}

function getTintColor(value?: string) {
  const next = value?.trim();
  return next || C.success;
}

function EmptyState() {
  return (
    <div
      style={{
        borderRadius: '26px',
        border: `1px dashed ${C.borderDashed}`,
        background: C.surfaceRaised,
        padding: '42px 24px',
        textAlign: 'center',
      }}
    >
      <div
        style={{
          fontSize: '1.4rem',
          fontWeight: 800,
          letterSpacing: '-0.03em',
          color: C.textStrong,
        }}
      >
        No calendars yet
      </div>
      <p
        style={{
          margin: '10px auto 0',
          maxWidth: 460,
          color: C.textMuted,
          lineHeight: 1.7,
        }}
      >
        Create your first calendar to start grouping events into a shared
        workspace.
      </p>
      <Link
        href={routes.calendarsCreate}
        style={{ ...createButtonStyle, marginTop: 18 }}
      >
        Create your first calendar
        <ArrowRight size={15} />
      </Link>
    </div>
  );
}

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
        setCalendars(
          Array.isArray(response.data) ? (response.data as OwnerCalendar[]) : []
        );
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
    <main
      style={{
        minHeight: '100vh',
        background: `radial-gradient(circle at top, rgba(232, 246, 247, 0.65), transparent 38%), ${C.bg}`,
        color: C.text,
        fontFamily: lumaListPageFontStack,
      }}
    >
      <header
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 20,
          borderBottom: `1px solid ${C.toolbarBorder}`,
          background: C.toolbarStrong,
          backdropFilter: 'blur(14px)',
          WebkitBackdropFilter: 'blur(14px)',
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
                background: `linear-gradient(135deg, ${C.accentGradientFrom}, ${C.accentGradientTo})`,
                display: 'grid',
                placeItems: 'center',
                color: C.accentMuted,
                boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.8)',
              }}
            >
              <CalendarDays size={16} />
            </div>
            <Link href={routes.luma.events} style={navStyle}>
              Events
            </Link>
            <Link href={routes.calendars} style={activeNavStyle}>
              Calendars
            </Link>
            <Link href={routes.discover} style={navStyle}>
              Discover
            </Link>
          </div>

          <Link href={routes.calendarsCreate} style={createButtonStyle}>
            Create Calendar
            <ArrowRight size={15} />
          </Link>
        </div>
      </header>

      <section
        style={{ maxWidth: 1180, margin: '0 auto', padding: '30px 20px 84px' }}
      >
        <div style={{ display: 'grid', gap: '24px' }}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-end',
              gap: '18px',
              flexWrap: 'wrap',
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
                  background: C.surfaceSoft,
                  border: `1px solid ${C.borderWarm}`,
                  color: C.accentMuted,
                  fontWeight: 800,
                  fontSize: '0.78rem',
                  width: 'fit-content',
                }}
              >
                <CheckCircle2 size={14} />
                Your calendar workspace
              </div>

              <div>
                <h1
                  style={{
                    margin: 0,
                    fontSize: 'clamp(2.2rem, 5vw, 3.4rem)',
                    lineHeight: 0.95,
                    letterSpacing: '-0.06em',
                    color: C.textStrong,
                  }}
                >
                  Calendars
                </h1>
                <p
                  style={{
                    margin: '10px 0 0',
                    color: C.textMuted,
                    fontSize: '1rem',
                    maxWidth: 700,
                    lineHeight: 1.7,
                  }}
                >
                  Create calendars to organize events, manage attendees, and
                  share your event collection with a clean, modern workspace
                  view.
                </p>
              </div>
            </div>
          </div>

          <section
            style={{
              borderRadius: '30px',
              border: `1px solid ${C.borderSoft}`,
              background: `linear-gradient(180deg, ${C.surface} 0%, ${C.bgAlt} 100%)`,
              padding: '28px',
              boxShadow: C.shadowPanel,
            }}
          >
            <div
              style={{
                display: 'grid',
                gap: '10px',
                maxWidth: 720,
              }}
            >
              <h2
                style={{
                  margin: 0,
                  fontSize: '1.8rem',
                  lineHeight: 1.05,
                  letterSpacing: '-0.04em',
                  color: C.textStrong,
                }}
              >
                Your calendar workspace
              </h2>
              <p
                style={{
                  margin: 0,
                  color: C.textMuted,
                  lineHeight: 1.75,
                }}
              >
                Each calendar can hold public or city-specific events, giving
                you a clean way to group launches, community meetups, and brand
                programs.
              </p>
            </div>
          </section>

          {error ? (
            <div
              style={{
                padding: '14px 16px',
                borderRadius: '18px',
                background: C.dangerSoft,
                border: `1px solid ${C.roseSoft}`,
                color: C.danger,
                fontWeight: 700,
              }}
            >
              {error}
            </div>
          ) : null}

          <section
            style={{
              borderRadius: '32px',
              border: `1px solid ${C.borderSoft}`,
              background: C.surface,
              padding: '26px',
              boxShadow: C.shadowPanel,
            }}
          >
            {loading ? (
              <div
                style={{
                  minHeight: 240,
                  display: 'grid',
                  placeItems: 'center',
                  color: C.accentMuted,
                }}
              >
                <Loader2 className="animate-spin" size={36} />
              </div>
            ) : calendars.length === 0 ? (
              <EmptyState />
            ) : (
              <div
                style={{
                  display: 'grid',
                  gap: '18px',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                }}
              >
                {calendars.map((calendar) => {
                  const tint = getTintColor(calendar.tint_color);

                  return (
                    <article
                      key={calendar.id}
                      style={{
                        borderRadius: '28px',
                        border: `1px solid ${C.borderCard}`,
                        background: C.surfaceRaised,
                        padding: '22px',
                        boxShadow: C.shadowCard,
                        display: 'grid',
                        gap: '18px',
                      }}
                    >
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'flex-start',
                          justifyContent: 'space-between',
                          gap: '16px',
                        }}
                      >
                        <div style={{ minWidth: 0 }}>
                          <div
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '8px',
                              marginBottom: '10px',
                              padding: '6px 10px',
                              borderRadius: '999px',
                              background: C.accentSoft,
                              color: C.accent,
                              fontSize: '0.76rem',
                              fontWeight: 800,
                            }}
                          >
                            {calendar.location_scope === 'city'
                              ? calendar.city || 'City calendar'
                              : 'Global calendar'}
                          </div>
                          <h3
                            style={{
                              margin: 0,
                              fontSize: '1.45rem',
                              lineHeight: 1.15,
                              letterSpacing: '-0.03em',
                              color: C.text,
                            }}
                          >
                            {calendar.name}
                          </h3>
                        </div>

                        <span
                          aria-hidden="true"
                          style={{
                            width: 18,
                            height: 18,
                            borderRadius: '999px',
                            background: tint,
                            boxShadow: `0 0 0 6px ${C.surfaceSoft}`,
                            flexShrink: 0,
                            marginTop: 4,
                          }}
                        />
                      </div>

                      <p
                        style={{
                          margin: 0,
                          color: C.textMuted,
                          lineHeight: 1.7,
                          minHeight: 54,
                        }}
                      >
                        {calendar.description || 'No description added yet.'}
                      </p>

                      <div
                        style={{
                          display: 'grid',
                          gap: '10px',
                          gridTemplateColumns:
                            'repeat(auto-fit, minmax(150px, 1fr))',
                        }}
                      >
                        <div style={statCardStyle}>
                          <div style={statLabelStyle}>
                            <Users size={15} />
                            Audience
                          </div>
                          <div style={statValueStyle}>
                            {formatCountLabel(
                              calendar.subscriber_count,
                              'subscriber'
                            )}
                          </div>
                        </div>

                        <div style={statCardStyle}>
                          <div style={statLabelStyle}>
                            <CalendarDays size={15} />
                            Events
                          </div>
                          <div style={statValueStyle}>
                            {formatCountLabel(calendar.event_count, 'event')}
                          </div>
                        </div>

                        <div style={statCardStyle}>
                          <div style={statLabelStyle}>
                            {calendar.location_scope === 'city' ? (
                              <MapPin size={15} />
                            ) : (
                              <Globe2 size={15} />
                            )}
                            Scope
                          </div>
                          <div style={statValueStyle}>
                            {calendar.location_scope === 'city'
                              ? calendar.city || 'City'
                              : 'Global'}
                          </div>
                        </div>
                      </div>

                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          gap: '12px',
                          flexWrap: 'wrap',
                        }}
                      >
                        <div
                          style={{
                            color: C.textTertiary,
                            fontSize: '0.92rem',
                            fontWeight: 700,
                          }}
                        >
                          {formatCountLabel(
                            calendar.upcoming_event_count,
                            'upcoming event'
                          )}
                        </div>

                        <Link
                          href={`/calendars/${calendar.slug}`}
                          style={secondaryActionStyle}
                        >
                          View calendar
                          <ArrowRight size={15} />
                        </Link>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </section>
        </div>
      </section>
    </main>
  );
}

const navStyle: CSSProperties = {
  color: C.textSoft,
  textDecoration: 'none',
  fontWeight: 700,
};

const activeNavStyle: CSSProperties = {
  ...navStyle,
  color: C.textStrong,
};

const createButtonStyle: CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '8px',
  padding: '12px 18px',
  borderRadius: '16px',
  background: C.success,
  color: C.strongForeground,
  textDecoration: 'none',
  fontWeight: 700,
  boxShadow: C.shadowButton,
};

const secondaryActionStyle: CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '8px',
  borderRadius: '14px',
  padding: '11px 14px',
  background: C.strong,
  color: C.strongForeground,
  border: `1px solid ${C.strong}`,
  textDecoration: 'none',
  fontWeight: 700,
};

const statCardStyle: CSSProperties = {
  borderRadius: '18px',
  border: `1px solid ${C.borderSoft}`,
  background: C.surfaceSoft,
  padding: '14px 16px',
};

const statLabelStyle: CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: '7px',
  fontSize: '0.78rem',
  textTransform: 'uppercase',
  letterSpacing: '0.08em',
  fontWeight: 800,
  color: C.accentMuted,
};

const statValueStyle: CSSProperties = {
  marginTop: '8px',
  fontSize: '1rem',
  fontWeight: 700,
  color: C.text,
  lineHeight: 1.5,
};
