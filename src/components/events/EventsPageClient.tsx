'use client';

import React from 'react';
import Link from 'next/link';
import { CalendarDays, MapPin, Plus, Sparkles, Ticket } from 'lucide-react';
import { routes } from '@/config/routes';
import { useMedia } from '@/hooks/use-media';

export default function EventsPageClient() {
  const isMobile = useMedia('(max-width: 768px)', false);

  const heroGridStyle: React.CSSProperties = {
    ...eventsHeroGridStyle,
    gridTemplateColumns: isMobile ? '1fr' : eventsHeroGridStyle.gridTemplateColumns,
    gap: isMobile ? '22px' : eventsHeroGridStyle.gap,
  };

  const heroCopyStyle: React.CSSProperties = {
    ...eventsHeroCopyStyle,
    gap: isMobile ? '18px' : eventsHeroCopyStyle.gap,
    maxWidth: isMobile ? '100%' : eventsHeroCopyStyle.maxWidth,
  };

  const heroTitleStyle: React.CSSProperties = {
    ...eventsHeroTitleStyle,
    fontSize: isMobile ? 'clamp(2.15rem, 11vw, 3.4rem)' : eventsHeroTitleStyle.fontSize,
  };

  const heroActionsStyle: React.CSSProperties = {
    ...eventsHeroActionsStyle,
    flexDirection: isMobile ? 'column' : 'row',
    alignItems: isMobile ? 'stretch' : 'center',
  };

  const heroVisualStyle: React.CSSProperties = {
    ...eventsHeroVisualStyle,
    justifyItems: 'center',
  };

  const heroMockCardStyle: React.CSSProperties = {
    ...eventsHeroMockCardStyle,
    width: isMobile ? '100%' : eventsHeroMockCardStyle.width,
    transform: isMobile ? 'none' : eventsHeroMockCardStyle.transform,
    padding: isMobile ? '16px' : eventsHeroMockCardStyle.padding,
  };

  const heroPreviewArtStyle: React.CSSProperties = {
    ...eventsHeroPreviewArtStyle,
    minHeight: isMobile ? '140px' : eventsHeroPreviewArtStyle.minHeight,
  };

  return (
    <main
      className="events-page"
      style={{
        minHeight: '100vh',
      }}
    >
      <section
        className="page-shell"
        style={{
          paddingTop: '28px',
          paddingBottom: '60px',
          maxWidth: '1440px',
          width: '100%',
          margin: '0 auto',
          paddingLeft: isMobile ? '20px' : '40px',
          paddingRight: isMobile ? '20px' : '40px',
        }}
      >
        <div style={heroGridStyle}>
          <div style={heroCopyStyle}>
            <div className="eyebrow" style={{ width: 'fit-content', padding: '8px 12px', fontSize: isMobile ? '0.74rem' : '0.8rem' }}>
              GrowthLab Events
            </div>

            <div style={{ display: 'grid', gap: '14px' }}>
              <h1 style={heroTitleStyle}>
                Delightful events <span style={{ color: 'var(--primary-color)' }}>start here.</span>
              </h1>
              <p style={eventsHeroCopyTextStyle}>
                Create event pages, browse what is happening now, and discover the next great
                community experience with one clean workflow.
              </p>
            </div>

            <div style={heroActionsStyle}>
              <Link href={routes.createEvent} className="primary-button" style={isMobile ? { width: '100%' } : undefined}>
                <Plus size={16} />
                Create Event
              </Link>
              <Link href={routes.eventsBrowse} className="secondary-button" style={isMobile ? { width: '100%' } : undefined}>
                Browse Events
              </Link>
              <Link href={routes.discover} className="secondary-button" style={isMobile ? { width: '100%' } : undefined}>
                Discover Event
              </Link>
            </div>

          </div>

          <div style={heroVisualStyle}>
            <div style={eventsHeroGlowStyle} />
            <div style={heroMockCardStyle}>
              <div style={eventsHeroPhoneHeaderStyle}>
                <span>9:41</span>
                <span>5G</span>
              </div>
              <div style={eventsHeroPreviewStyle}>
                <div style={heroPreviewArtStyle}>
                  <Sparkles size={40} color="rgba(15, 115, 119, 0.42)" />
                </div>
              </div>
              <div style={{ display: 'grid', gap: '10px' }}>
                <div style={{ display: 'grid', gap: '4px' }}>
                  <div style={{ fontSize: '0.84rem', color: 'var(--text-tertiary)', fontWeight: 700 }}>
                    Featured event
                  </div>
                  <div style={{ fontSize: '1.42rem', fontWeight: 800, letterSpacing: '-0.03em' }}>
                    Summer Launch Party
                  </div>
                </div>
                <div style={{ display: 'grid', gap: '9px', color: 'var(--text-secondary)' }}>
                  <div style={heroDetailRowStyle}>
                    <CalendarDays size={15} color="var(--primary-color)" />
                    <span>Sun, Jul 23</span>
                  </div>
                  <div style={heroDetailRowStyle}>
                    <MapPin size={15} color="var(--primary-color)" />
                    <span>Oceanfront Venue</span>
                  </div>
                  <div style={heroDetailRowStyle}>
                    <Ticket size={15} color="var(--primary-color)" />
                    <span>54 guests interested</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

const eventsHeroGridStyle: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'minmax(0, 1.08fr) minmax(340px, 0.92fr)',
  gap: '28px',
  alignItems: 'center',
};

const eventsHeroCopyStyle: React.CSSProperties = {
  padding: '0',
  display: 'grid',
  gap: '22px',
  alignSelf: 'center',
  maxWidth: '640px',
};

const eventsHeroTitleStyle: React.CSSProperties = {
  margin: 0,
  fontSize: 'clamp(2.6rem, 6vw, 5.4rem)',
  lineHeight: 0.92,
  letterSpacing: '-0.06em',
  fontWeight: 800,
};

const eventsHeroCopyTextStyle: React.CSSProperties = {
  margin: 0,
  maxWidth: '560px',
  color: 'var(--text-secondary)',
  fontSize: '1.02rem',
  lineHeight: 1.7,
};

const eventsHeroActionsStyle: React.CSSProperties = {
  display: 'flex',
  flexWrap: 'wrap',
  gap: '12px',
};

const eventsHeroVisualStyle: React.CSSProperties = {
  padding: '0',
  position: 'relative',
  overflow: 'visible',
  display: 'grid',
  placeItems: 'center',
  alignSelf: 'center',
};

const eventsHeroGlowStyle: React.CSSProperties = {
  position: 'absolute',
  inset: 'auto auto 14% 14%',
  width: '240px',
  height: '240px',
  borderRadius: '999px',
  background: 'rgba(15, 115, 119, 0.11)',
  filter: 'blur(24px)',
};

const eventsHeroMockCardStyle: React.CSSProperties = {
  position: 'relative',
  zIndex: 1,
  width: 'min(100%, 390px)',
  borderRadius: '28px',
  padding: '18px',
  background: 'var(--events-card-bg)',
  border: '1px solid var(--events-card-border)',
  boxShadow: 'var(--events-shadow-card)',
  display: 'grid',
  gap: '16px',
  transform: 'rotate(-4deg)',
};

const eventsHeroPhoneHeaderStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  fontSize: '0.85rem',
  fontWeight: 800,
  color: 'var(--text-primary)',
};

const eventsHeroPreviewStyle: React.CSSProperties = {
  borderRadius: '24px',
  border: '1px solid var(--events-card-border)',
  background: 'var(--events-preview-bg)',
  padding: '18px',
};

const eventsHeroPreviewArtStyle: React.CSSProperties = {
  minHeight: '170px',
  borderRadius: '20px',
  border: '1px dashed var(--events-card-border)',
  display: 'grid',
  placeItems: 'center',
  background: 'var(--events-preview-art-bg)',
};

const heroDetailRowStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  fontWeight: 600,
  fontSize: '0.94rem',
};
