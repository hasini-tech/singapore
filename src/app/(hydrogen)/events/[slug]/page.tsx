import React from 'react';
import { Metadata } from 'next';
import { headers } from 'next/headers';
import { notFound } from 'next/navigation';
import { Calendar, Clock, Copy, ExternalLink, MapPin, Share2, Users, Sparkles, Video, BookOpen } from 'lucide-react';
import { format } from 'date-fns';
import BookingButton from './BookingButton';

export const dynamic = 'force-dynamic';

interface EventData {
  id: string;
  slug: string;
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  is_online: boolean;
  is_paid: boolean;
  ticket_price?: number;
  status: string;
  cover_image: string;
  share_url?: string;
  speakers?: Array<{
    name: string;
    role: string;
    bio: string;
    avatar?: string;
    links?: string[];
  }>;
  agenda?: string[];
  integrations?: Array<{
    name: string;
    url: string;
  }>;
  host_name: string;
  host_bio?: string;
  host_image?: string;
  max_seats: number;
  seats_left: number;
  confirmed_count: number;
  waitlisted_count: number;
  checked_in_count: number;
  community_enabled?: boolean;
}

function getFrontendOrigin() {
  const configuredOrigin = process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXT_PUBLIC_FRONTEND_URL;
  if (configuredOrigin) {
    try {
      return new URL(configuredOrigin).origin;
    } catch {
      return configuredOrigin.replace(/\/$/, '');
    }
  }

  return 'https://growthlab.local'; // Fallback for serverside origin resolution
}

async function getRequestOrigin() {
  const requestHeaders = await headers();
  const forwardedHost = requestHeaders.get('x-forwarded-host') || requestHeaders.get('host');
  const forwardedProto = requestHeaders.get('x-forwarded-proto') || 'https';
  if (forwardedHost) {
    return `${forwardedProto}://${forwardedHost}`;
  }
  return getFrontendOrigin();
}

async function getEventDetails(slug: string): Promise<EventData | null> {
  try {
    const origin = await getRequestOrigin();
    const res = await fetch(new URL(`/api/events/${slug}`, origin), {
      cache: 'no-store',
    });
    if (!res.ok) {
      if (res.status === 404) return null;
      throw new Error('Failed to fetch event details');
    }
    return res.json();
  } catch (error) {
    console.error('Error fetching event:', error);
    return null;
  }
}

async function getCommunity(slug: string) {
  try {
    const origin = await getRequestOrigin();
    const res = await fetch(new URL(`/api/events/${slug}/community`, origin), {
      cache: 'no-store',
    });
    if (!res.ok) {
      return null;
    }
    return res.json();
  } catch (error) {
    console.error('Error fetching community:', error);
    return null;
  }
}

function buildGoogleCalendarUrl(event: EventData) {
  const start = new Date(event.date);
  const end = new Date(start.getTime() + 90 * 60 * 1000);
  const fmt = (date: Date) => date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: event.title,
    dates: `${fmt(start)}/${fmt(end)}`,
    details: event.description,
    location: event.location,
  });
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const resolvedParams = await params;
  const event = await getEventDetails(resolvedParams.slug);
  if (!event) return { title: 'Event Not Found | GrowthLab' };

  return {
    title: `${event.title} | GrowthLab`,
    description: event.description.substring(0, 160),
    openGraph: {
      images: [event.cover_image || ''],
    },
  };
}

export default async function EventDetailsPage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = await params;
  const event = await getEventDetails(resolvedParams.slug);
  const community = await getCommunity(resolvedParams.slug);
  const origin = await getRequestOrigin();

  if (!event) {
    notFound();
  }

  const eventDate = new Date(event.date);
  const shareUrl = event.share_url || `${origin}/events/${event.slug}`;
  const googleCalendarUrl = buildGoogleCalendarUrl(event);
  const communityAttendees = community?.attendees || [];
  const speakerList = event.speakers || [];
  const agenda = event.agenda || [];
  const integrations = event.integrations || [];

  return (
    <div style={{ maxWidth: '1080px', margin: '0 auto', padding: '28px 20px 84px' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1.15fr 0.85fr', gap: '22px', alignItems: 'start' }}>
        <section>
          <div
            style={{
              position: 'relative',
              minHeight: '400px',
              borderRadius: '28px',
              overflow: 'hidden',
              background: 'var(--surface-color)',
              border: '1px solid var(--border-color)',
              boxShadow: 'var(--shadow-soft)',
            }}
          >
            {event.cover_image ? (
              <img src={event.cover_image} alt={event.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)' }}>
                No cover image yet
              </div>
            )}
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(0,0,0,0.12) 0%, rgba(0,0,0,0.62) 100%)' }} />
            <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '24px' }}>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                <span style={{ padding: '7px 10px', borderRadius: '999px', background: 'rgba(255,255,255,0.18)', color: 'white', backdropFilter: 'blur(10px)', fontSize: '12px', fontWeight: 700 }}>
                  {event.is_online ? 'Online event' : 'In person'}
                </span>
                <span style={{ padding: '7px 10px', borderRadius: '999px', background: 'rgba(255,255,255,0.18)', color: 'white', backdropFilter: 'blur(10px)', fontSize: '12px', fontWeight: 700 }}>
                  {event.is_paid ? `$${Number(event.ticket_price || 0).toFixed(2)}` : 'Free'}
                </span>
                <span style={{ padding: '7px 10px', borderRadius: '999px', background: 'rgba(255,255,255,0.18)', color: 'white', backdropFilter: 'blur(10px)', fontSize: '12px', fontWeight: 700 }}>
                  {event.status === 'private' ? 'Private link' : event.status === 'draft' ? 'Draft' : 'Public'}
                </span>
              </div>

              <div style={{ maxWidth: '700px', color: 'white' }}>
                <div style={{ fontSize: '0.8rem', letterSpacing: '0.12em', textTransform: 'uppercase', opacity: 0.8, marginBottom: '10px' }}>
                  Featured experience
                </div>
                <h1 style={{ fontSize: 'clamp(2.1rem, 4.6vw, 4rem)', lineHeight: 0.96, letterSpacing: '-0.05em', marginBottom: '12px' }}>{event.title}</h1>
                <p style={{ fontSize: '0.98rem', lineHeight: 1.7, maxWidth: '620px', opacity: 0.95 }}>{event.description}</p>
              </div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginTop: '14px' }}>
            <div style={{ padding: '18px', borderRadius: '20px', background: 'var(--surface-color)', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-soft)' }}>
              <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '12px' }}>
                <Calendar size={18} color="var(--primary-color)" />
                <strong>Date</strong>
              </div>
              <div style={{ color: 'var(--text-secondary)' }}>{format(eventDate, 'EEEE, MMMM d, yyyy')}</div>
            </div>
            <div style={{ padding: '18px', borderRadius: '20px', background: 'var(--surface-color)', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-soft)' }}>
              <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '12px' }}>
                <Clock size={18} color="var(--primary-color)" />
                <strong>Time</strong>
              </div>
              <div style={{ color: 'var(--text-secondary)' }}>{event.time}</div>
            </div>
          </div>

          <section style={{ marginTop: '28px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: '14px', alignItems: 'end', marginBottom: '16px' }}>
              <div>
                <div style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '8px' }}>
                  About
                </div>
                <h2 style={{ fontSize: '1.7rem', letterSpacing: '-0.03em' }}>Why people will want to come</h2>
              </div>
              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                <a href={googleCalendarUrl} target="_blank" rel="noreferrer" style={{ padding: '11px 14px', borderRadius: '12px', border: '1px solid var(--border-color)', background: 'rgba(255,255,255,0.72)', display: 'inline-flex', alignItems: 'center', gap: '8px', fontWeight: 700 }}>
                  <ExternalLink size={16} />
                  Add to Calendar
                </a>
                <a href={shareUrl} target="_blank" rel="noreferrer" style={{ padding: '11px 14px', borderRadius: '12px', border: '1px solid var(--border-color)', background: 'rgba(255,255,255,0.72)', display: 'inline-flex', alignItems: 'center', gap: '8px', fontWeight: 700 }}>
                  <Share2 size={16} />
                  Share Link
                </a>
              </div>
            </div>

            <div style={{ padding: '20px', borderRadius: '22px', background: 'var(--surface-color)', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-soft)', lineHeight: 1.75, whiteSpace: 'pre-wrap', color: 'var(--text-secondary)' }}>
              {event.description}
            </div>
          </section>

          {speakerList.length > 0 && (
            <section style={{ marginTop: '28px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
                <Sparkles size={18} color="var(--primary-color)" />
                <h2 style={{ fontSize: '1.5rem', letterSpacing: '-0.03em' }}>Speakers</h2>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '14px' }}>
                {speakerList.map((speaker: any, index: number) => (
                  <article key={`${speaker.name}-${index}`} style={{ padding: '18px', borderRadius: '20px', background: 'var(--surface-color)', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-soft)' }}>
                    <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '12px' }}>
                      {speaker.avatar ? (
                        <img src={speaker.avatar} alt={speaker.name} style={{ width: '50px', height: '50px', borderRadius: '50%', objectFit: 'cover' }} />
                      ) : (
                        <div style={{ width: '50px', height: '50px', borderRadius: '50%', background: 'rgba(31,106,82,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <Users size={22} color="var(--primary-color)" />
                        </div>
                      )}
                      <div>
                        <div style={{ fontWeight: 800 }}>{speaker.name}</div>
                        <div style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>{speaker.role}</div>
                      </div>
                    </div>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '13px', lineHeight: 1.65 }}>{speaker.bio}</p>
                    {Array.isArray(speaker.links) && speaker.links.length > 0 && (
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '12px' }}>
                        {speaker.links.map((link: string) => (
                          <a key={link} href={link} target="_blank" rel="noreferrer" style={{ padding: '7px 10px', borderRadius: '999px', background: 'rgba(31,106,82,0.08)', color: 'var(--primary-strong)', fontSize: '11px', fontWeight: 700 }}>
                            View link
                          </a>
                        ))}
                      </div>
                    )}
                  </article>
                ))}
              </div>
            </section>
          )}

          {agenda.length > 0 && (
            <section style={{ marginTop: '28px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
                <BookOpen size={18} color="var(--primary-color)" />
                <h2 style={{ fontSize: '1.5rem', letterSpacing: '-0.03em' }}>Agenda</h2>
              </div>
              <div style={{ display: 'grid', gap: '10px' }}>
                {agenda.map((item: string, index: number) => (
                  <div key={`${item}-${index}`} style={{ padding: '16px 18px', borderRadius: '16px', background: 'var(--surface-color)', border: '1px solid var(--border-color)' }}>
                    <div style={{ color: 'var(--text-secondary)', fontSize: '12px', marginBottom: '4px' }}>Step {index + 1}</div>
                    <div style={{ fontWeight: 600 }}>{item}</div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {integrations.length > 0 && (
            <section style={{ marginTop: '28px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
                <Video size={18} color="var(--primary-color)" />
                <h2 style={{ fontSize: '1.5rem', letterSpacing: '-0.03em' }}>Integrations</h2>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                {integrations.map((integration: any) => (
                  <a
                    key={`${integration.name}-${integration.url}`}
                      href={integration.url}
                      target="_blank"
                      rel="noreferrer"
                      style={{
                      padding: '11px 14px',
                      borderRadius: '12px',
                      border: '1px solid var(--border-color)',
                      background: 'rgba(255,255,255,0.72)',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '10px',
                      fontWeight: 700,
                    }}
                  >
                    {integration.name}
                    <ExternalLink size={15} />
                  </a>
                ))}
              </div>
            </section>
          )}
        </section>

        <aside style={{ position: 'sticky', top: '16px' }}>
          <div style={{ padding: '20px', borderRadius: '22px', background: 'var(--surface-color)', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-soft)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', alignItems: 'flex-start', marginBottom: '16px' }}>
              <div>
                <div style={{ color: 'var(--text-secondary)', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: '8px' }}>Hosted by</div>
                <h3 style={{ fontSize: '1.25rem', marginBottom: '8px' }}>{event.host_name}</h3>
                <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6, fontSize: '0.94rem' }}>{event.host_bio || 'Event organizer'}</p>
              </div>
              {event.host_image ? (
                <img src={event.host_image} alt={event.host_name} style={{ width: '50px', height: '50px', borderRadius: '50%', objectFit: 'cover' }} />
              ) : (
                <div style={{ width: '50px', height: '50px', borderRadius: '50%', background: 'rgba(31,106,82,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Users size={22} color="var(--primary-color)" />
                </div>
              )}
            </div>

            <div style={{ display: 'grid', gap: '12px', marginBottom: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Capacity</span>
                <strong>{event.max_seats === 0 ? 'Unlimited' : `${event.seats_left} left`}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Confirmed RSVPs</span>
                <strong>{event.confirmed_count || 0}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Waitlist</span>
                <strong>{event.waitlisted_count || 0}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Checked in</span>
                <strong>{event.checked_in_count || 0}</strong>
              </div>
            </div>

            <BookingButton event={event} />

            <div style={{ display: 'grid', gap: '10px', marginTop: '18px' }}>
              <a href={shareUrl} target="_blank" rel="noreferrer" style={{ padding: '11px 12px', borderRadius: '12px', border: '1px solid var(--border-color)', background: 'rgba(255,255,255,0.72)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Share2 size={16} />
                  Share event link
                </span>
                <Copy size={15} />
              </a>
              {event.location && (
                <div style={{ padding: '12px', borderRadius: '12px', background: 'rgba(31,106,82,0.08)', border: '1px solid rgba(31,106,82,0.14)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontWeight: 700, marginBottom: '6px' }}>
                    <MapPin size={16} />
                    Venue
                  </div>
                  <div style={{ color: 'var(--text-secondary)', fontSize: '13px', lineHeight: 1.6 }}>{event.location}</div>
                </div>
              )}
            </div>
          </div>

          {event.community_enabled !== false && (
          <div style={{ marginTop: '18px', padding: '24px', borderRadius: '28px', background: 'var(--surface-color)', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-soft)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
              <Users size={18} color="var(--primary-color)" />
              <h3 style={{ fontSize: '1.3rem', margin: 0 }}>Who is coming</h3>
            </div>
            {communityAttendees.length === 0 ? (
              <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7 }}>
                Attendee profiles will appear here once people RSVP. This is the networking layer that makes the event feel alive.
              </p>
            ) : (
              <div style={{ display: 'grid', gap: '12px' }}>
                {communityAttendees.map((member: any) => (
                  <div key={member.id} style={{ display: 'flex', gap: '12px', alignItems: 'center', padding: '12px', borderRadius: '18px', background: 'rgba(255,255,255,0.68)', border: '1px solid rgba(34,30,26,0.08)' }}>
                    {member.profile_image ? (
                      <img src={member.profile_image} alt={member.name} style={{ width: '44px', height: '44px', borderRadius: '50%', objectFit: 'cover' }} />
                    ) : (
                      <div style={{ width: '44px', height: '44px', borderRadius: '50%', background: 'rgba(31,106,82,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Users size={18} color="var(--primary-color)" />
                      </div>
                    )}
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontWeight: 700 }}>{member.name}</div>
                      <div style={{ color: 'var(--text-secondary)', fontSize: '13px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '220px' }}>{member.bio || 'Attending'}</div>
                      {Array.isArray(member.links) && member.links.length > 0 && (
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '8px' }}>
                          {member.links.slice(0, 2).map((link: string) => (
                            <a key={link} href={link} target="_blank" rel="noreferrer" style={{ fontSize: '11px', padding: '5px 8px', borderRadius: '999px', background: 'rgba(31,106,82,0.1)', color: 'var(--primary-strong)', fontWeight: 700 }}>
                              Link
                            </a>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          )}
        </aside>
      </div>
    </div>
  );
}
