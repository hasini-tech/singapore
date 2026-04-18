'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/auth-context';
import {
  CalendarPlus2,
  CalendarRange,
  Compass,
  Menu,
  Ticket,
  X,
} from 'lucide-react';
import { routes } from '@/config/routes';

const linkStyle: React.CSSProperties = {
  color: 'var(--text-secondary)',
  fontSize: '0.92rem',
  fontWeight: 700,
  display: 'inline-flex',
  alignItems: 'center',
  gap: 7,
};

const iconButtonStyle: React.CSSProperties = {
  width: '40px',
  height: '40px',
  borderRadius: '12px',
  border: '1px solid var(--border-color)',
  background: 'rgba(255,255,255,0.9)',
  color: 'var(--text-secondary)',
  display: 'grid',
  placeItems: 'center',
  cursor: 'pointer',
  boxShadow: '0 10px 20px rgba(16,36,42,0.05)',
};

const Navbar = () => {
  const { user } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const router = useRouter();

  const createEventHref = user
    ? routes.createEvent === '/create-event'
      ? '/create-event/form'
      : routes.createEvent
    : '/create-event/continue?redirect=/create-event/form';

  const handleCreateClick = () => {
    router.push(createEventHref);
    setIsMenuOpen(false);
  };

  return (
    <nav
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 100,
        padding: '12px 0',
        backdropFilter: 'blur(20px)',
        background: 'rgba(255, 255, 255, 0.9)',
        borderBottom: '1px solid var(--border-color)',
      }}
    >
      <div
        className="page-shell"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '16px',
          }}
        >
        <Link
          href="/"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '10px',
            minWidth: 'fit-content',
          }}
        >
          <div
            style={{
              width: '38px',
              height: '38px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, var(--primary-color), var(--teal-700))',
              color: '#fff',
              display: 'grid',
              placeItems: 'center',
              fontWeight: 800,
              boxShadow: '0 14px 24px rgba(14,118,120,0.18)',
            }}
          >
            E
          </div>
          <div style={{ display: 'grid', gap: '2px' }}>
            <span style={{ fontSize: '0.98rem', fontWeight: 800, letterSpacing: '-0.03em' }}>Evently</span>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)', fontWeight: 700 }}>
              Events made simple
            </span>
          </div>
        </Link>

        <div
          className="desktop-menu"
          style={{
            display: 'none',
            alignItems: 'center',
            justifyContent: 'flex-end',
            flex: 1,
            gap: '16px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap', marginLeft: 'auto' }}>
            <Link href={routes.events} style={linkStyle}>
              <Ticket size={18} strokeWidth={2} />
              Events
            </Link>
            <Link href={routes.discover} style={linkStyle}>
              <Compass size={18} strokeWidth={2} />
              Discover
            </Link>
            <Link href={routes.calendars} style={linkStyle}>
              <CalendarRange size={18} strokeWidth={2} />
              Calendars
            </Link>
            <button onClick={handleCreateClick} className="primary-button" style={{ minHeight: '40px' }}>
              <CalendarPlus2 size={18} />
              Create Event
            </button>
          </div>
        </div>

        <button
          className="mobile-toggle"
          onClick={() => setIsMenuOpen((current) => !current)}
          style={iconButtonStyle}
          aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
        >
          {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      <style
        dangerouslySetInnerHTML={{
          __html: `
            @media (min-width: 980px) {
              .desktop-menu { display: flex !important; }
              .mobile-toggle { display: none !important; }
            }
          `,
        }}
      />

      {isMenuOpen && (
        <div className="page-shell" style={{ marginTop: '14px' }}>
          <div
            className="glass-panel"
            style={{
              borderRadius: '22px',
              padding: '14px',
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
            }}
          >
            <Link href={routes.events} onClick={() => setIsMenuOpen(false)} style={mobileLinkStyle}>
              <Ticket size={18} />
              Events
            </Link>
            <Link href={routes.discover} onClick={() => setIsMenuOpen(false)} style={mobileLinkStyle}>
              <Compass size={18} />
              Discover
            </Link>
            <Link href={routes.calendars} onClick={() => setIsMenuOpen(false)} style={mobileLinkStyle}>
              <CalendarRange size={18} />
              Calendars
            </Link>
            <button onClick={handleCreateClick} className="primary-button" style={{ width: '100%' }}>
              <CalendarPlus2 size={18} />
              Create Event
            </button>
          </div>
        </div>
      )}
    </nav>
  );
};

const mobileLinkStyle: React.CSSProperties = {
  padding: '12px 14px',
  borderRadius: '14px',
  border: '1px solid var(--border-color)',
  background: 'rgba(255,255,255,0.92)',
  color: 'var(--text-primary)',
  fontWeight: 700,
  display: 'flex',
  alignItems: 'center',
  gap: '10px',
};

export default Navbar;
