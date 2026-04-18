'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  PiSparkle,
  PiCalendarDots,
  PiCalendar,
  PiCompass,
  PiMagnifyingGlass,
  PiBell,
  PiImageSquare,
  PiArrowRight,
  PiCaretDown,
  PiClock,
  PiMapPin,
  PiFileText,
  PiTicket,
  PiShieldCheck,
  PiUsers,
  PiShuffle,
} from 'react-icons/pi';
import { routes } from '@/config/routes';
import Image from 'next/image';

const colors = {
  bg: '#f8fdfd',
  headerText: '#5c6c6c',
  headerIcon: '#8fa0a0',
  textMain: '#2d3a3a',
  textMuted: '#6d7f7f',
  accent: '#1ba3a3',
  button: '#067d7d',
  cardBg: '#ffffff',
  inputBg: '#eef7f7',
  border: '#e0ecec',
};

export default function LumaCreateEventPage() {
  const router = useRouter();
  const [eventName, setEventName] = useState('');

  return (
    <main
      style={{
        minHeight: '100vh',
        background: colors.bg,
        color: colors.textMain,
        fontFamily: 'Inter, system-ui, sans-serif',
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700&display=swap');
        
        body { font-family: 'Outfit', sans-serif; }
        
        .nav-link { 
          display: flex; 
          align-items: center; 
          gap: 6px; 
          color: ${colors.headerText}; 
          text-decoration: none; 
          font-size: 14px; 
          font-weight: 500;
          transition: opacity 0.2s;
        }
        .nav-link:hover { opacity: 0.7; }
        
        .icon-btn {
          background: none;
          border: none;
          color: ${colors.headerIcon};
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 4px;
        }
        
        .input-row {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 14px;
          background: ${colors.inputBg};
          border-radius: 12px;
          border: 1px solid transparent;
          transition: border-color 0.2s;
        }
        .input-row:focus-within {
          border-color: ${colors.accent}44;
        }
        
        .option-toggle {
          width: 44px;
          height: 24px;
          background: #e0ecec;
          border-radius: 12px;
          position: relative;
          cursor: pointer;
        }
        .option-toggle::after {
          content: '';
          position: absolute;
          top: 2px;
          left: 2px;
          width: 20px;
          height: 20px;
          background: white;
          border-radius: 50%;
          transition: transform 0.2s;
        }
        .option-toggle.active { background: ${colors.accent}; }
        .option-toggle.active::after { transform: translateX(20px); }

        .time-dropdown {
          position: absolute;
          top: 100%;
          right: 0;
          width: 80px;
          background: white;
          border-radius: 12px;
          box-shadow: 0 10px 30px rgba(0,0,0,0.08);
          border: 1px solid ${colors.border};
          z-index: 10;
          margin-top: 4px;
          max-height: 200px;
          overflow-y: auto;
        }
        .time-item {
          padding: 8px 12px;
          font-size: 13px;
          cursor: pointer;
          border-bottom: 1px solid ${colors.border};
        }
        .time-item:last-child { border: none; }
        .time-item:hover { background: ${colors.inputBg}; }
        .time-item.selected { background: ${colors.button}; color: white; }
      `}</style>

      {/* Header */}
      <header
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '12px 24px',
          maxWidth: '1200px',
          margin: '0 auto',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '32px' }}>
          <PiSparkle size={20} color={colors.headerIcon} style={{ cursor: 'pointer' }} />
          <nav style={{ display: 'flex', gap: '20px' }}>
            <Link href="#" className="nav-link">
              <PiCalendarDots size={18} />
              Events
            </Link>
            <Link href="#" className="nav-link">
              <PiCalendar size={18} />
              Calendars
            </Link>
            <Link href="#" className="nav-link">
              <PiCompass size={18} />
              Discover
            </Link>
          </nav>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <span style={{ fontSize: '13px', color: '#8fa0a0', fontWeight: 500 }}>
            18:44 GMT+5:30
          </span>
          <span style={{ fontSize: '14px', fontWeight: 600, color: colors.textMain }}>
            Create Event
          </span>
          <button className="icon-btn"><PiMagnifyingGlass size={20} /></button>
          <button className="icon-btn" style={{ position: 'relative' }}>
            <PiBell size={20} />
            <div style={{ position: 'absolute', top: 4, right: 4, width: 6, height: 6, background: '#ff5c5c', borderRadius: '50%' }} />
          </button>
          <div
            style={{
              width: 28,
              height: 28,
              borderRadius: '50%',
              background: '#e67300',
              color: 'white',
              fontSize: '12px',
              display: 'grid',
              placeItems: 'center',
              fontWeight: 700,
            }}
          >
            Y
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div
        style={{
          maxWidth: '1080px',
          margin: '0 auto',
          padding: '40px 24px',
          display: 'grid',
          gridTemplateColumns: 'minmax(340px, 400px) 1fr',
          gap: '40px',
        }}
      >
        {/* Left Column: Media */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div
            style={{
              width: '100%',
              aspectRatio: '1',
              borderRadius: '24px',
              background: '#f0f5f5',
              overflow: 'hidden',
              position: 'relative',
              boxShadow: '0 8px 30px rgba(0,80,80,0.06)',
            }}
          >
            <Image
                src="/growthlab/startup-team-collaboration.png"
                alt="Event cover"
                fill
                className="object-cover"
                priority
            />
            {/* Overlay Shuffle */}
            <button
              style={{
                position: 'absolute',
                bottom: '16px',
                right: '16px',
                width: 36,
                height: 36,
                borderRadius: '50%',
                background: 'rgba(0,0,0,0.8)',
                color: 'white',
                border: 'none',
                display: 'grid',
                placeItems: 'center',
                cursor: 'pointer',
                backdropFilter: 'blur(4px)',
              }}
            >
              <PiShuffle size={18} />
            </button>
          </div>

          <div style={{ display: 'flex', gap: '12px' }}>
             <div
                style={{
                    flex: 1,
                    background: colors.cardBg,
                    padding: '12px 16px',
                    borderRadius: '16px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    border: `1px solid ${colors.border}`,
                    boxShadow: '0 4px 12px rgba(0,0,0,0.04)'
                }}
             >
                <div style={{ width: 36, height: 26, background: '#f5e8f5', borderRadius: '6px', border: '1px solid #eee' }} />
                <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '10px', color: colors.textMuted, fontWeight: 700, textTransform: 'uppercase' }}>Theme</div>
                    <div style={{ fontSize: '14px', fontWeight: 600 }}>Minimal</div>
                </div>
                <PiCaretDown size={14} color={colors.headerIcon} />
             </div>
             
             <button
                style={{
                    width: 54,
                    height: 54,
                    borderRadius: '16px',
                    background: colors.cardBg,
                    border: `1px solid ${colors.border}`,
                    display: 'grid',
                    placeItems: 'center',
                    color: colors.headerIcon,
                    cursor: 'pointer',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.04)'
                }}
             >
                <PiShuffle size={20} />
             </button>
          </div>
        </div>

        {/* Right Column: Form */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ display: 'flex', gap: '12px' }}>
              <div style={{ 
                  display: 'inline-flex', 
                  alignItems: 'center', 
                  gap: '6px', 
                  padding: '6px 12px', 
                  background: '#f8ecec', 
                  borderRadius: '10px',
                  fontSize: '13px',
                  fontWeight: 600,
                  color: '#4a5555'
              }}>
                  <span style={{ fontSize: '14px' }}>🎃</span>
                  Personal Calendar
                  <PiCaretDown size={12} />
              </div>
              
              <div style={{ 
                  display: 'inline-flex', 
                  alignItems: 'center', 
                  gap: '6px', 
                  padding: '6px 12px', 
                  background: colors.inputBg, 
                  borderRadius: '10px',
                  fontSize: '13px',
                  fontWeight: 600,
                  color: '#4a5555'
              }}>
                  <PiGlobe size={14} />
                  Public
                  <PiCaretDown size={12} />
              </div>
          </div>

          <input
            placeholder="Event Name"
            value={eventName}
            onChange={(e) => setEventName(e.target.value)}
            style={{
              fontSize: '2.4rem',
              fontWeight: 700,
              border: 'none',
              background: 'transparent',
              outline: 'none',
              color: '#3d4d4d',
              padding: '0',
            }}
          />

          {/* Date Selection Box */}
          <div style={{ 
              background: colors.inputBg, 
              borderRadius: '20px', 
              padding: '4px',
              display: 'grid',
              gridTemplateColumns: '1fr auto',
              alignItems: 'center',
              gap: '12px'
          }}>
              <div style={{ padding: '4px' }}>
                {/* Start Row */}
                <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    padding: '12px 12px', 
                    gap: '12px',
                    position: 'relative'
                }}>
                    <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                         <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#c0cccc' }} />
                         <div style={{ position: 'absolute', top: 8, left: 3.5, width: 1, height: 40, borderLeft: '1px dashed #c0cccc' }} />
                    </div>
                    <span style={{ fontSize: '14px', fontWeight: 600, color: colors.textMuted, width: 40 }}>Start</span>
                    <span style={{ fontSize: '15px', fontWeight: 600, color: colors.textMain, flex: 1 }}>Fri 17 Apr</span>
                    <div style={{ position: 'relative' }}>
                        <span style={{ fontSize: '15px', fontWeight: 600, color: colors.textMain, padding: '4px 8px', borderRadius: '4px', background: 'rgba(0,0,0,0.03)' }}>19:00</span>
                    </div>
                </div>
                
                {/* End Row */}
                <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    padding: '12px 12px', 
                    gap: '12px'
                }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', border: '1.5px solid #c0cccc' }} />
                    <span style={{ fontSize: '14px', fontWeight: 600, color: colors.textMuted, width: 40 }}>End</span>
                    <span style={{ fontSize: '15px', fontWeight: 600, color: colors.textMain, flex: 1 }}>Fri 17 Apr</span>
                    <span style={{ fontSize: '15px', fontWeight: 600, color: colors.textMain, padding: '4px 8px', borderRadius: '4px', background: 'rgba(0,0,0,0.03)' }}>20:00</span>
                </div>
              </div>

              {/* Timezone side component */}
              <div style={{ 
                  padding: '12px 20px', 
                  borderLeft: `1px solid ${colors.border}`,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '4px'
              }}>
                   <PiGlobe size={16} color={colors.headerIcon} />
                   <div style={{ fontSize: '11px', fontWeight: 700, color: colors.textMain }}>GMT+05:30</div>
                   <div style={{ fontSize: '10px', fontWeight: 500, color: colors.textMuted }}>Calcutta</div>
              </div>
          </div>

          <div className="input-row">
            <PiMapPin size={18} color={colors.headerIcon} />
            <div style={{ flex: 1 }}>
                <div style={{ fontSize: '14px', fontWeight: 600 }}>Add Event Location</div>
                <div style={{ fontSize: '12px', color: colors.textMuted }}>Offline location or virtual link</div>
            </div>
          </div>

          <div className="input-row">
            <PiFileText size={18} color={colors.headerIcon} />
            <span style={{ fontSize: '14px', fontWeight: 600 }}>Add Description</span>
          </div>

          {/* Options Section */}
          <div style={{ marginTop: '10px' }}>
              <div style={{ fontSize: '12px', fontWeight: 700, color: colors.textMuted, textTransform: 'uppercase', marginBottom: '12px' }}>Event Options</div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', background: colors.inputBg, borderRadius: '16px', overflow: 'hidden' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '14px 16px' }}>
                      <PiTicket size={18} color={colors.headerIcon} />
                      <span style={{ flex: 1, fontSize: '14px', fontWeight: 600 }}>Ticket Price</span>
                      <span style={{ fontSize: '14px', color: colors.headerIcon }}>Free</span>
                      <PiSparkle size={14} color={colors.headerIcon} />
                  </div>
                  
                  <div style={{ height: '1px', background: 'rgba(0,0,0,0.04)', margin: '0 16px' }} />
                  
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '14px 16px' }}>
                      <PiShieldCheck size={18} color={colors.headerIcon} />
                      <span style={{ flex: 1, fontSize: '14px', fontWeight: 600 }}>Require Approval</span>
                      <div className="option-toggle" />
                  </div>
                  
                  <div style={{ height: '1px', background: 'rgba(0,0,0,0.04)', margin: '0 16px' }} />

                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '14px 16px' }}>
                      <PiUsers size={18} color={colors.headerIcon} />
                      <span style={{ flex: 1, fontSize: '14px', fontWeight: 600 }}>Capacity</span>
                      <span style={{ fontSize: '14px', color: colors.headerIcon }}>Unlimited</span>
                      <PiSparkle size={14} color={colors.headerIcon} />
                  </div>
              </div>
          </div>

          <button
            onClick={() => router.push(routes.luma.eventDetail)}
            style={{
              marginTop: '4px',
              width: '100%',
              padding: '16px',
              borderRadius: '12px',
              background: colors.button,
              color: 'white',
              fontSize: '16px',
              fontWeight: 700,
              border: 'none',
              cursor: 'pointer',
              transition: 'background 0.2s',
            }}
          >
            Create Event
          </button>
        </div>
      </div>
    </main>
  );
}

function PiGlobe({ size, color }: { size?: number; color?: string }) {
    return (
        <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 256 256" height={size || "1em"} width={size || "1em"} xmlns="http://www.w3.org/2000/svg" style={{ color: color }}>
            <path d="M128,24A104,104,0,1,0,232,128,104.11,104.11,0,0,0,128,24ZM128,216c-13.84,0-26.6-11.93-35.32-32H163.32C154.6,204.07,141.84,216,128,216ZM89.84,168c-2-12.38-3-26-3-40s1-27.62,3-40h76.32c2,12.38,3,26,3,40s-1,27.62-3,40ZM128,40c13.84,0,26.6,11.93,35.32,32H92.68C101.4,51.93,114.16,40,128,40ZM76.4,72H43.14a88.16,88.16,0,0,1,33.26-33.3ZM43.14,184H76.4c-6.81,17.2-18,29-33.26,33.3a88.16,88.16,0,0,1-33.26-33.3ZM40,128c0-14,1-27.42,2.83-40H73.57a177.6,177.6,0,0,0-1.57,40,177.6,177.6,0,0,0,1.57,40H42.83C41,155.42,40,142,40,128Zm139.6,89.3c-15.3-4.3-26.45-16.1-33.26-33.3h33.26A88.16,88.16,0,0,1,179.6,217.3ZM212.86,184H182.43a177.6,177.6,0,0,0,1.57-40,177.6,177.6,0,0,0-1.57-40h30.43c1.8,12.58,2.83,26,2.83,40S214.66,155.42,212.86,184Zm.28-96H179.6a88.16,88.16,0,0,1,33.26-33.3C211.14,55,212.19,72,213.14,88Z"></path>
        </svg>
    )
}
