'use client';

import { ChangeEvent, FormEvent, useEffect, useRef, useState, useCallback, useMemo } from "react";
import { createPortal } from 'react-dom';
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  PiSparkle, PiCalendarDots, PiCalendar, PiCompass,
  PiMagnifyingGlass, PiBell, PiCaretDown, PiGlobe,
  PiShuffle, PiMapPin, PiFileText, PiTicket, PiShieldCheck,
  PiUsers, PiCloudArrowUp, PiCaretLeft, PiCaretRight,
  PiCheck, PiPencilSimple, PiMoon, PiSun,
} from "react-icons/pi";
import { useAuth } from "@/context/auth-context";
import api from "@/lib/api";
import { DEFAULT_EVENT_COVER } from "@/lib/defaults";
import { getPersonalTimelineCacheKey, mergeUniqueTimelineItems, readPersonalTimelineCacheItems, readStoredTimelineIdentity, writePersonalTimelineCacheItems } from "@/lib/personalTimelineCache";
import Image from 'next/image';
import { useTheme } from "next-themes";

// ─── Theme system ─────────────────────────────────────────────────────────────
type ThemeId = 'minimal'|'quantum'|'warp'|'emoji'|'confetti'|'pattern'|'seasonal';

const THEMES: { id: ThemeId; label: string; dark: boolean }[] = [
  { id:'minimal',  label:'Minimal',  dark:false },
  { id:'quantum',  label:'Quantum',  dark:true  },
  { id:'warp',     label:'Warp',     dark:true  },
  { id:'emoji',    label:'Emoji',    dark:true  },
  { id:'confetti', label:'Confetti', dark:true  },
  { id:'pattern',  label:'Pattern',  dark:true  },
  { id:'seasonal', label:'Seasonal', dark:false },
];

// Per-theme page background colors
const THEME_BG: Record<ThemeId, string> = {
  minimal:  '#f3eff8',
  quantum:  '#0d0b1e',
  warp:     '#060610',
  emoji:    '#181528',
  confetti: '#1c0a38',
  pattern:  '#2a1760',
  seasonal: '#fdf2f8',
};

// ─── Dynamic color palette (light vs dark) ────────────────────────────────────
function makeColors(dark: boolean) {
  return dark ? {
    surface:     'rgba(255,255,255,0.07)',
    inputBg:     'rgba(255,255,255,0.06)',
    inputBg2:    'rgba(255,255,255,0.10)',
    border:      'rgba(255,255,255,0.10)',
    text:        '#f0ecff',
    muted:       '#9d8fc8',
    light:       '#5a4f7a',
    accent:      '#a78bfa',
    accentHover: '#8b6ef0',
    daySelected: '#f0ecff',
    daySelText:  '#18181b',
    button:      '#6d28d9',
    buttonHover: '#5b21b6',
    pill:        'rgba(255,255,255,0.10)',
    pillHover:   'rgba(255,255,255,0.16)',
    toggle:      'rgba(255,255,255,0.15)',
    chipBg:      'rgba(255,255,255,0.09)',
    chipBorder:  'rgba(255,255,255,0.14)',
    optionHover: 'rgba(255,255,255,0.06)',
    divider:     'rgba(255,255,255,0.06)',
    placeholder: 'rgba(255,255,255,0.22)',
    scrollBg:    '#1a1330',
    tzBorder:    'rgba(255,255,255,0.08)',
  } : {
    surface:     '#ffffff',
    inputBg:     '#ede8f4',
    inputBg2:    '#f0ecf7',
    border:      '#e0d9ef',
    text:        '#18181b',
    muted:       '#8b7fa8',
    light:       '#b8afc8',
    accent:      '#6b46c1',
    accentHover: '#5a35b0',
    daySelected: '#18181b',
    daySelText:  '#ffffff',
    button:      '#4c1d95',
    buttonHover: '#3b1679',
    pill:        '#eae5f5',
    pillHover:   '#ddd5f0',
    toggle:      '#d4cce6',
    chipBg:      '#ffffff',
    chipBorder:  '#e0d9ef',
    optionHover: '#f5f0fb',
    divider:     'rgba(0,0,0,0.05)',
    placeholder: '#b8afc8',
    scrollBg:    '#ffffff',
    tzBorder:    '#e0d9ef',
  };
}

// ─── Timezone data ────────────────────────────────────────────────────────────
const POPULAR_TIMEZONES = [
  { label:'Pacific Time - Los Angeles',      offset:'GMT-07:00', tz:'America/Los_Angeles' },
  { label:'Central Time - Chicago',          offset:'GMT-05:00', tz:'America/Chicago' },
  { label:'Eastern Time - Toronto',          offset:'GMT-04:00', tz:'America/Toronto' },
  { label:'Eastern Time - New York',         offset:'GMT-04:00', tz:'America/New_York' },
  { label:'Brasilia Standard Time - São Paulo', offset:'GMT-03:00', tz:'America/Sao_Paulo' },
  { label:'United Kingdom Time - London',    offset:'GMT+01:00', tz:'Europe/London' },
  { label:'Central European Time - Madrid',  offset:'GMT+02:00', tz:'Europe/Madrid' },
  { label:'Central European Time - Paris',   offset:'GMT+02:00', tz:'Europe/Paris' },
  { label:'Gulf Standard Time - Dubai',      offset:'GMT+04:00', tz:'Asia/Dubai' },
  { label:'India Standard Time - Calcutta',  offset:'GMT+05:30', tz:'Asia/Calcutta' },
  { label:'China Standard Time - Shanghai',  offset:'GMT+08:00', tz:'Asia/Shanghai' },
  { label:'Japan Standard Time - Tokyo',     offset:'GMT+09:00', tz:'Asia/Tokyo' },
  { label:'Australian Eastern Time - Sydney',offset:'GMT+10:00', tz:'Australia/Sydney' },
];

// ─── Types & helpers ──────────────────────────────────────────────────────────
type EventStatus = 'published'|'private'|'draft';
type OwnerCalendar = { id:string; name:string; is_default:boolean; [k:string]:any };
type CreateEventForm = {
  title:string; description:string; date:string; time:string; end_time:string;
  location:string; is_online:boolean; is_paid:boolean; ticket_price:number;
  max_seats:number; status:EventStatus; community_enabled:boolean;
  require_approval:boolean; agenda:string;
};

function localIso(d = new Date()) {
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
}
function parseLocalDate(iso:string) { const[y,m,d]=iso.split('-').map(Number); return new Date(y,m-1,d); }
function fmtDate(iso:string) {
  if(!iso) return '';
  return parseLocalDate(iso).toLocaleDateString('en-GB',{weekday:'short',day:'numeric',month:'short'});
}
function addDays(iso:string,n:number) {
  const d=parseLocalDate(iso); d.setDate(d.getDate()+n); return localIso(d);
}

const INITIAL:CreateEventForm = {
  title:'',description:'',date:localIso(),time:'19:00',end_time:'20:00',
  location:'',is_online:false,is_paid:false,ticket_price:0,max_seats:0,
  status:'published',community_enabled:true,require_approval:false,agenda:'',
};
const TIMES = Array.from({length:48},(_,i)=>{
  const h=Math.floor(i/2).toString().padStart(2,'0'); const m=i%2===0?'00':'30';
  return `${h}:${m}`;
});

// ─── Background effects ───────────────────────────────────────────────────────
const BEAM_COLORS=['#ff6ad5','#c774e8','#ad8cff','#8795e8','#94d0ff','#ffe599','#ff99c8','#a8edea','#ff9de2','#ffecd2'];

function WarpBeams() {
  const beams = useMemo(() => Array.from({length:24},(_,i)=>({
    angle: (i * 15 + Math.random()*8) % 360,
    color: BEAM_COLORS[i % BEAM_COLORS.length],
    width: 0.5 + Math.random()*1.5,
    opacity: 0.3 + Math.random()*0.5,
    delay: Math.random()*3,
    dur: 3 + Math.random()*4,
    length: 40 + Math.random()*50,
  })), []);

  return (
    <div style={{position:'absolute',inset:0,overflow:'hidden',pointerEvents:'none',zIndex:0}}>
      {beams.map((b,i)=>(
        <div key={i} style={{
          position:'absolute', top:'50%', left:'50%',
          width:`${b.length}vw`, height:`${b.width}px`,
          background:`linear-gradient(90deg,transparent,${b.color},transparent)`,
          opacity:b.opacity,
          transform:`rotate(${b.angle}deg)`,
          transformOrigin:'0% 50%',
          animation:`warpBeam ${b.dur}s ${b.delay}s ease-in-out infinite alternate`,
          filter:'blur(0.5px)',
        }}/>
      ))}
    </div>
  );
}

function QuantumLines() {
  const lines = useMemo(() => Array.from({length:30},(_,i)=>({
    top: Math.random()*100,
    width: 10+Math.random()*40,
    opacity: 0.08+Math.random()*0.18,
    delay: Math.random()*5,
    dur: 4+Math.random()*6,
    color: i%3===0?'#a78bfa':i%3===1?'#818cf8':'#e879f9',
  })), []);

  return (
    <div style={{position:'absolute',inset:0,overflow:'hidden',pointerEvents:'none',zIndex:0}}>
      {lines.map((l,i)=>(
        <div key={i} style={{
          position:'absolute', top:`${l.top}%`, left:0, right:0,
          height:'1px', width:`${l.width}%`, marginLeft:`${Math.random()*60}%`,
          background:`linear-gradient(90deg,transparent,${l.color},transparent)`,
          opacity:l.opacity,
          animation:`quantumPulse ${l.dur}s ${l.delay}s ease-in-out infinite alternate`,
        }}/>
      ))}
    </div>
  );
}

function ConfettiHearts() {
  const hearts = useMemo(()=>Array.from({length:28},(_,i)=>({
    left: Math.random()*100,
    size: 12+Math.random()*28,
    opacity: 0.08+Math.random()*0.22,
    dur: 8+Math.random()*12,
    delay: Math.random()*10,
    drift: (Math.random()-0.5)*80,
  })),[]);

  return (
    <div style={{position:'absolute',inset:0,overflow:'hidden',pointerEvents:'none',zIndex:0}}>
      {hearts.map((h,i)=>(
        <div key={i} style={{
          position:'absolute',
          left:`${h.left}%`,
          bottom:'-60px',
          fontSize:`${h.size}px`,
          opacity:h.opacity,
          animation:`floatHeart ${h.dur}s ${h.delay}s ease-in-out infinite`,
          '--drift':`${h.drift}px`,
        } as any}>♥</div>
      ))}
    </div>
  );
}

function FloatingEmojis() {
  const emojis=['🎉','✨','🎊','🌟','💫','🎈','🎶','🌈','🎭','🔥','💜','🎤'];
  const items = useMemo(()=>Array.from({length:20},(_,i)=>({
    emoji: emojis[i%emojis.length],
    left: Math.random()*100,
    size: 16+Math.random()*24,
    opacity: 0.1+Math.random()*0.25,
    dur: 10+Math.random()*14,
    delay: Math.random()*10,
  })),[]);
  return (
    <div style={{position:'absolute',inset:0,overflow:'hidden',pointerEvents:'none',zIndex:0}}>
      {items.map((e,i)=>(
        <div key={i} style={{
          position:'absolute', left:`${e.left}%`, bottom:'-60px',
          fontSize:`${e.size}px`, opacity:e.opacity,
          animation:`floatHeart ${e.dur}s ${e.delay}s ease-in-out infinite`,
          '--drift':'0px',
        } as any}>{e.emoji}</div>
      ))}
    </div>
  );
}

function PatternBg() {
  return (
    <div style={{position:'absolute',inset:0,pointerEvents:'none',zIndex:0,opacity:0.35}}>
      <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="pg" x="0" y="0" width="48" height="48" patternUnits="userSpaceOnUse">
            <rect width="48" height="48" fill="none"/>
            <circle cx="24" cy="24" r="18" fill="none" stroke="#a78bfa" strokeWidth="0.8"/>
            <circle cx="24" cy="24" r="10" fill="none" stroke="#8b5cf6" strokeWidth="0.5"/>
            <line x1="0" y1="24" x2="48" y2="24" stroke="#7c3aed" strokeWidth="0.4" opacity="0.5"/>
            <line x1="24" y1="0" x2="24" y2="48" stroke="#7c3aed" strokeWidth="0.4" opacity="0.5"/>
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#pg)"/>
      </svg>
    </div>
  );
}

function SeasonalBg() {
  const flowers=['🌸','🌺','🌷','🌼','🌻','🌹'];
  const items = useMemo(()=>Array.from({length:18},(_,i)=>({
    emoji:flowers[i%flowers.length],
    top: Math.random()*100, left: Math.random()*100,
    size: 14+Math.random()*22, opacity: 0.12+Math.random()*0.2,
    rot: Math.random()*360,
  })),[]);
  return (
    <div style={{position:'absolute',inset:0,overflow:'hidden',pointerEvents:'none',zIndex:0}}>
      {items.map((f,i)=>(
        <div key={i} style={{
          position:'absolute', top:`${f.top}%`, left:`${f.left}%`,
          fontSize:`${f.size}px`, opacity:f.opacity,
          transform:`rotate(${f.rot}deg)`,
        }}>{f.emoji}</div>
      ))}
    </div>
  );
}

// ─── Portal wrapper for dropdowns (avoids stacking-context clipping) ──────────
function DropPortal({ anchor, children, align = 'left' }: { anchor: React.RefObject<HTMLElement|null>; children: React.ReactNode; align?: 'left'|'right' }) {
  const [pos, setPos] = useState<{ top: number; left: number } | null>(null);

  useEffect(() => {
    if (!anchor.current) return;
    const r = anchor.current.getBoundingClientRect();
    const left = align === 'right' ? r.right - 300 : r.left;
    setPos({ top: r.bottom + 6, left });
  }, [anchor, align]);

  if (!pos || typeof document === 'undefined') return null;
  return createPortal(
    <div style={{ position: 'fixed', top: pos.top, left: pos.left, zIndex: 99999 }}>
      {children}
    </div>,
    document.body
  );
}

function CalendarPopup({ value, onChange, onClose, C, anchor }: { value:string; onChange:(v:string)=>void; onClose:()=>void; C:ReturnType<typeof makeColors>; anchor: React.RefObject<HTMLElement|null> }) {
  const today = localIso();
  const sel = parseLocalDate(value);
  const [view, setView] = useState(new Date(sel.getFullYear(), sel.getMonth(), 1));
  const y=view.getFullYear(), m=view.getMonth();

  const days = (() => {
    const firstDow=(new Date(y,m,1).getDay()+6)%7;
    const inMonth=new Date(y,m+1,0).getDate();
    const prevLast=new Date(y,m,0).getDate();
    const arr:{day:number;iso:string;cur:boolean}[]=[];
    for(let i=firstDow-1;i>=0;i--) arr.push({day:prevLast-i,iso:localIso(new Date(y,m-1,prevLast-i)),cur:false});
    for(let i=1;i<=inMonth;i++) arr.push({day:i,iso:localIso(new Date(y,m,i)),cur:true});
    while(arr.length<42) arr.push({day:arr.length-firstDow-inMonth+1,iso:localIso(new Date(y,m+1,arr.length-firstDow-inMonth+1)),cur:false});
    return arr;
  })();

  return (
    <DropPortal anchor={anchor}>
      <div style={{width:296,background:C.scrollBg,borderRadius:16,boxShadow:'0 24px 60px rgba(0,0,0,0.3)',padding:'18px 16px 14px',border:`1px solid ${C.chipBorder}`,userSelect:'none'}} onClick={e=>e.stopPropagation()}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:14}}>
          <span style={{fontSize:16,fontWeight:700,color:C.text}}>{view.toLocaleString('en-US',{month:'long'})}</span>
          <div style={{display:'flex',alignItems:'center',gap:4}}>
            {([-1,1] as const).map(offset=>(
              <button key={offset} type="button" onClick={()=>setView(new Date(y,m+offset,1))} style={{background:'none',border:'none',cursor:'pointer',color:C.muted,padding:'4px 7px',borderRadius:8,display:'flex',alignItems:'center'}}>
                {offset===-1?<PiCaretLeft size={14}/>:<PiCaretRight size={14}/>}
              </button>
            ))}
          </div>
        </div>
        <div style={{display:'grid',gridTemplateColumns:'repeat(7,1fr)',marginBottom:4}}>
          {['M','T','W','T','F','S','S'].map((d,i)=>(
            <div key={i} style={{textAlign:'center',fontSize:12,fontWeight:700,color:i>=5?C.light:C.muted,paddingBottom:8}}>{d}</div>
          ))}
        </div>
        <div style={{display:'grid',gridTemplateColumns:'repeat(7,1fr)',gap:2}}>
          {days.map((d,i)=>{
            const isSel=d.iso===value; const isToday=d.iso===today;
            return (
              <div key={i} onClick={()=>{onChange(d.iso);onClose();}} style={{
                height:36,display:'flex',alignItems:'center',justifyContent:'center',
                fontSize:13,fontWeight:isSel?700:500,borderRadius:8,cursor:'pointer',
                background:isSel?C.daySelected:'transparent',
                color:isSel?C.daySelText:!d.cur?C.light:isToday?C.accent:C.text,
                transition:'background 0.12s',
              }}
              onMouseEnter={e=>{if(!isSel)(e.currentTarget as HTMLDivElement).style.background='rgba(107,70,193,0.12)';}}
              onMouseLeave={e=>{if(!isSel)(e.currentTarget as HTMLDivElement).style.background='transparent';}}>
                {d.day}
              </div>
            );
          })}
        </div>
      </div>
    </DropPortal>
  );
}

function TimePicker({ value, onChange, onClose, C, anchor }: { value:string; onChange:(v:string)=>void; onClose:()=>void; C:ReturnType<typeof makeColors>; anchor: React.RefObject<HTMLElement|null> }) {
  const listRef = useRef<HTMLDivElement>(null);
  useEffect(()=>{ const idx=TIMES.indexOf(value); if(listRef.current&&idx>=0) listRef.current.scrollTop=idx*44-88; },[value]);

  return (
    <DropPortal anchor={anchor}>
      <div ref={listRef} onClick={e=>e.stopPropagation()} style={{width:120,background:C.scrollBg,borderRadius:14,boxShadow:'0 20px 60px rgba(0,0,0,0.3)',maxHeight:280,overflowY:'auto',border:`1px solid ${C.chipBorder}`,scrollbarWidth:'none'}}>
        {TIMES.map(t=>{
          const isSel=t===value;
          return (
            <div key={t} onClick={()=>{onChange(t);onClose();}} style={{
              height:44,display:'flex',alignItems:'center',justifyContent:'center',
              fontSize:14,fontWeight:600,cursor:'pointer',
              background:isSel?C.accent:'transparent',
              color:isSel?'#fff':C.text,transition:'background 0.1s',
              borderRadius:isSel?10:0,margin:isSel?'2px 4px':0,
            }}
            onMouseEnter={e=>{if(!isSel)(e.currentTarget as HTMLDivElement).style.background=C.optionHover;}}
            onMouseLeave={e=>{if(!isSel)(e.currentTarget as HTMLDivElement).style.background='transparent';}}>
              {t}
            </div>
          );
        })}
      </div>
    </DropPortal>
  );
}

function TimezonePicker({ value, onChange, onClose, C }: { value:string; onChange:(v:typeof POPULAR_TIMEZONES[0])=>void; onClose:()=>void; C:ReturnType<typeof makeColors> }) {
  const [q,setQ]=useState('');
  const filtered=q?POPULAR_TIMEZONES.filter(z=>z.label.toLowerCase().includes(q.toLowerCase())||z.offset.includes(q)):POPULAR_TIMEZONES;
  return (
    <div onClick={e=>e.stopPropagation()} style={{position:'absolute',top:'calc(100% + 8px)',right:0,width:340,background:C.scrollBg,borderRadius:16,boxShadow:'0 20px 60px rgba(0,0,0,0.28)',zIndex:9999,border:`1px solid ${C.chipBorder}`,overflow:'hidden'}}>
      <div style={{padding:'12px 14px',borderBottom:`1px solid ${C.tzBorder}`}}>
        <input value={q} onChange={e=>setQ(e.target.value)} placeholder="Search for a timezone" style={{width:'100%',border:'none',outline:'none',fontSize:14,color:C.text,background:'transparent',fontFamily:'inherit'}}/>
      </div>
      <div style={{maxHeight:320,overflowY:'auto',scrollbarWidth:'thin'}}>
        <div style={{padding:'10px 14px 4px',fontSize:11,fontWeight:700,color:C.muted,textTransform:'uppercase',letterSpacing:'0.05em'}}>Popular Time Zones</div>
        {filtered.map((tz,i)=>(
          <div key={i} onClick={()=>{onChange(tz);onClose();}} style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',padding:'10px 14px',cursor:'pointer',background:value===tz.tz?C.inputBg:'transparent',transition:'background 0.1s'}}
          onMouseEnter={e=>{if(value!==tz.tz)(e.currentTarget as HTMLDivElement).style.background=C.optionHover;}}
          onMouseLeave={e=>{if(value!==tz.tz)(e.currentTarget as HTMLDivElement).style.background='transparent';}}>
            <span style={{fontSize:14,color:C.text,lineHeight:'1.4',maxWidth:230}}>{tz.label}</span>
            <span style={{fontSize:13,color:C.muted,whiteSpace:'nowrap',marginLeft:8,paddingTop:2}}>{tz.offset}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function VisibilityPicker({ value, onChange, onClose, C }: { value:EventStatus; onChange:(v:EventStatus)=>void; onClose:()=>void; C:ReturnType<typeof makeColors> }) {
  const opts=[
    {id:'published' as EventStatus,icon:<PiGlobe size={16}/>,label:'Public',desc:'Shown on your calendar and eligible to be featured.'},
    {id:'private' as EventStatus,icon:<PiSparkle size={16}/>,label:'Private',desc:'Unlisted. Only people with the link can register.'},
  ];
  return (
    <div onClick={e=>e.stopPropagation()} style={{position:'absolute',top:'calc(100% + 8px)',right:0,width:280,background:C.scrollBg,borderRadius:16,boxShadow:'0 20px 60px rgba(0,0,0,0.28)',zIndex:9999,border:`1px solid ${C.chipBorder}`,overflow:'hidden'}}>
      {opts.map((o,i)=>(
        <div key={o.id} onClick={()=>{onChange(o.id);onClose();}} style={{display:'flex',alignItems:'flex-start',gap:12,padding:'14px 16px',cursor:'pointer',background:value===o.id?C.inputBg:'transparent',borderBottom:i<opts.length-1?`1px solid ${C.tzBorder}`:'none',transition:'background 0.1s'}}
        onMouseEnter={e=>{if(value!==o.id)(e.currentTarget as HTMLDivElement).style.background=C.optionHover;}}
        onMouseLeave={e=>{if(value!==o.id)(e.currentTarget as HTMLDivElement).style.background='transparent';}}>
          <div style={{marginTop:2,color:C.muted}}>{o.icon}</div>
          <div style={{flex:1}}>
            <div style={{fontSize:14,fontWeight:600,color:C.text}}>{o.label}</div>
            <div style={{fontSize:12,color:C.muted,marginTop:2,lineHeight:1.4}}>{o.desc}</div>
          </div>
          {value===o.id&&<PiCheck size={16} style={{marginTop:2,color:C.accent}}/>}
        </div>
      ))}
    </div>
  );
}

// ─── Theme thumbnail previews ─────────────────────────────────────────────────
// Per-theme accent color for selection ring
const THEME_ACCENT: Record<ThemeId,string> = {
  minimal:  '#6b46c1',
  quantum:  '#a78bfa',
  warp:     '#ff6ad5',
  emoji:    '#fbbf24',
  confetti: '#c084fc',
  pattern:  '#818cf8',
  seasonal: '#f472b6',
};

function ThemeThumb({ theme, selected, onSelect }: { theme:typeof THEMES[0]; selected:boolean; onSelect:()=>void }) {
  const accent = THEME_ACCENT[theme.id];
  const previews: Record<ThemeId, React.ReactNode> = {
    minimal: (
      <div style={{width:'100%',height:'100%',background:'linear-gradient(145deg,#f3eff8,#ede8f4)',display:'flex',flexDirection:'column',justifyContent:'center',gap:5,padding:'10px 12px'}}>
        <div style={{background:'#d4cce6',height:6,borderRadius:4,width:'80%'}}/>
        <div style={{background:'#e0d9ef',height:4,borderRadius:3,width:'60%'}}/>
        <div style={{background:'#e0d9ef',height:4,borderRadius:3,width:'70%'}}/>
        <div style={{background:'#6b46c1',height:14,borderRadius:6,width:'45%',marginTop:2}}/>
      </div>
    ),
    quantum: (
      <div style={{width:'100%',height:'100%',background:'linear-gradient(135deg,#0d0b1e,#1e1050,#2d1b69)',overflow:'hidden',position:'relative',display:'flex',alignItems:'center',justifyContent:'center'}}>
        {[0,1,2].map(i=>(
          <div key={i} style={{position:'absolute',width:`${60+i*20}%`,height:'1px',background:`linear-gradient(90deg,transparent,${i===0?'#a78bfa':i===1?'#818cf8':'#e879f9'},transparent)`,opacity:0.6+i*0.15,transform:`rotate(${i*15-10}deg)`}}/>
        ))}
        <div style={{width:10,height:10,borderRadius:'50%',background:'radial-gradient(circle,#a78bfa,transparent)',boxShadow:'0 0 12px #a78bfa',zIndex:1}}/>
      </div>
    ),
    warp: (
      <div style={{width:'100%',height:'100%',background:'#060610',overflow:'hidden',position:'relative'}}>
        {['#ff6ad5','#94d0ff','#ffe599','#c774e8','#a8edea'].map((c,i)=>(
          <div key={i} style={{position:'absolute',top:'50%',left:'50%',width:'160%',height:'1.5px',background:`linear-gradient(90deg,transparent,${c},transparent)`,transform:`rotate(${i*36}deg)`,opacity:0.75}}/>
        ))}
      </div>
    ),
    emoji: (
      <div style={{width:'100%',height:'100%',background:'linear-gradient(135deg,#181528,#241d40)',display:'flex',alignItems:'center',justifyContent:'center',flexWrap:'wrap',gap:3,padding:6}}>
        {['🎉','✨','🎊','🌟','💫','🎈'].map((e,i)=><span key={i} style={{fontSize:15,filter:'drop-shadow(0 0 3px rgba(255,200,0,0.4))'}}>{e}</span>)}
      </div>
    ),
    confetti: (
      <div style={{width:'100%',height:'100%',background:'linear-gradient(135deg,#1c0a38,#3b0764)',overflow:'hidden',position:'relative',display:'flex',alignItems:'center',justifyContent:'center',gap:2}}>
        {['♥','♥','♥','♥','♥','♥','♥','♥'].map((e,i)=>(
          <span key={i} style={{color:['#a78bfa','#e879f9','#c084fc'][i%3],fontSize:11+i%3*2,opacity:0.4+i*0.07,transform:`translateY(${i%2===0?-3:3}px)`}}>{e}</span>
        ))}
      </div>
    ),
    pattern: (
      <div style={{width:'100%',height:'100%',background:'#2a1760',position:'relative',overflow:'hidden'}}>
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
          <defs><pattern id="pt2" x="0" y="0" width="18" height="18" patternUnits="userSpaceOnUse"><circle cx="9" cy="9" r="7" fill="none" stroke="#a78bfa" strokeWidth="0.8"/><circle cx="9" cy="9" r="3" fill="none" stroke="#818cf8" strokeWidth="0.5"/></pattern></defs>
          <rect width="100%" height="100%" fill="url(#pt2)"/>
        </svg>
      </div>
    ),
    seasonal: (
      <div style={{width:'100%',height:'100%',background:'linear-gradient(135deg,#fdf2f8,#fce7f3,#fdf4ff)',display:'flex',alignItems:'center',justifyContent:'center',flexWrap:'wrap',gap:3,padding:6}}>
        {['🌸','🌺','🌷','🌼','🌻','🌹'].map((e,i)=><span key={i} style={{fontSize:13}}>{e}</span>)}
      </div>
    ),
  };

  return (
    <div onClick={onSelect} style={{display:'flex',flexDirection:'column',alignItems:'center',gap:7,cursor:'pointer',flexShrink:0,transition:'transform 0.15s'}} onMouseEnter={e=>(e.currentTarget as HTMLDivElement).style.transform='translateY(-2px)'} onMouseLeave={e=>(e.currentTarget as HTMLDivElement).style.transform='translateY(0)'}>
      <div style={{
        width:96,height:68,borderRadius:14,overflow:'hidden',
        border: selected ? `2.5px solid ${accent}` : '2.5px solid transparent',
        boxShadow: selected ? `0 0 0 3px ${accent}30, 0 8px 24px rgba(0,0,0,0.18)` : '0 2px 12px rgba(0,0,0,0.08)',
        transition:'border-color 0.2s, box-shadow 0.2s',
      }}>
        {previews[theme.id]}
      </div>
      <div style={{display:'flex',flexDirection:'column',alignItems:'center',gap:1}}>
        <span style={{fontSize:12,fontWeight: selected ? 700:500,color: selected ? accent : '#8b7fa8',transition:'color 0.2s'}}>{theme.label}</span>
        {selected && <div style={{width:16,height:2,borderRadius:2,background:accent,transition:'width 0.2s'}}/>}
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function CreateEventBuilderPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, isLoading: authLoading } = useAuth();
  const { theme, setTheme } = useTheme();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const startDateRef = useRef<HTMLDivElement>(null);
  const startTimeRef = useRef<HTMLDivElement>(null);
  const endDateRef   = useRef<HTMLDivElement>(null);
  const endTimeRef   = useRef<HTMLDivElement>(null);
  const timezoneRef  = useRef<HTMLDivElement>(null);
  const visibilityRef= useRef<HTMLDivElement>(null);

  const [loading,setLoading]=useState(false);
  const [error,setError]=useState('');
  const [form,setForm]=useState<CreateEventForm>(INITIAL);
  const [ownerCalendars,setOwnerCalendars]=useState<OwnerCalendar[]>([]);
  const [selectedCalendarId,setSelectedCalendarId]=useState('');
  const [uploadedImage,setUploadedImage]=useState<string|null>(null);
  const [selectedTheme,setSelectedTheme]=useState<ThemeId>('minimal');
  const [showThemePanel,setShowThemePanel]=useState(false);
  const [endDate,setEndDate]=useState(addDays(localIso(),1));
  const [timezone,setTimezone]=useState(POPULAR_TIMEZONES.find(z=>z.tz==='Asia/Calcutta')!);
  const [showStripePopup,setShowStripePopup]=useState(false);

  type ActivePicker='startDate'|'startTime'|'endDate'|'endTime'|'timezone'|'visibility'|null;
  const [active,setActive]=useState<ActivePicker>(null);

  const themeConfig=THEMES.find(t=>t.id===selectedTheme)!;
  const isDark=themeConfig.dark;
  const C=useMemo(()=>makeColors(isDark),[isDark]);
  const pageBg=THEME_BG[selectedTheme];

  useEffect(()=>{
    document.body.classList.add('hide-nav');
    return ()=>document.body.classList.remove('hide-nav');
  },[]);

  useEffect(()=>{
    (async()=>{
      try {
        const res=await api.get<OwnerCalendar[]>('/events/calendars');
        const cals=Array.isArray(res.data)?res.data:[];
        setOwnerCalendars(cals);
        const fb=cals.find(c=>c.id===searchParams?.get('calendar'))||cals.find(c=>c.is_default)||cals[0];
        if(fb) setSelectedCalendarId(fb.id);
      } catch {}
    })();
  },[]);

  const setField=useCallback(<K extends keyof CreateEventForm>(k:K,v:CreateEventForm[K])=>
    setForm(prev=>({...prev,[k]:v})),[]);

  const handleImageUpload=(e:ChangeEvent<HTMLInputElement>)=>{
    const file=e.target.files?.[0]; if(!file) return;
    const reader=new FileReader();
    reader.onload=()=>setUploadedImage(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleSubmit=async(e:FormEvent)=>{
    e.preventDefault(); setLoading(true); setError('');
    try {
      const payload={...form,calendar_id:selectedCalendarId,cover_image:uploadedImage||DEFAULT_EVENT_COVER,date:new Date(`${form.date}T${form.time}`).toISOString()};
      const res=await api.post('/events/',payload);
      const identity=user??readStoredTimelineIdentity();
      const key=getPersonalTimelineCacheKey(identity);
      
      try {
        writePersonalTimelineCacheItems(key,mergeUniqueTimelineItems([{...res.data,relationship:'hosting'}],readPersonalTimelineCacheItems(key)));
      } catch(e) {
        // Silently catch quota exceeded errors if image base64 is huge
      }
      
      // Use a hard redirect to bypass Next.js RSC fetch soft-navigation which can throw TypeError: Failed to fetch
      window.location.href = `/manage/${res.data.slug}`;
    } catch(err:any) { setError(err?.response?.data?.detail||'Failed to create event'); setLoading(false); }
  };

  const selectedCalendar=ownerCalendars.find(c=>c.id===selectedCalendarId)||ownerCalendars[0];
  const toggle=(p:ActivePicker)=>setActive(prev=>prev===p?null:p);
  // When start date advances past end date, push end date forward by 1 day automatically
  useEffect(()=>{
    if(endDate<=form.date) setEndDate(addDays(form.date,1));
  },[form.date]);

  // common sub-component props
  const pickerProps={C};

  return (
    <div style={{minHeight:'100vh',background:pageBg,fontFamily:"'Inter','Outfit',sans-serif",color:C.text,position:'relative',transition:'background 0.4s'}} onClick={()=>{setActive(null);setShowThemePanel(false);}}>

      {/* Background effects */}
      {selectedTheme==='warp'     && <WarpBeams/>}
      {selectedTheme==='quantum'  && <QuantumLines/>}
      {selectedTheme==='confetti' && <ConfettiHearts/>}
      {selectedTheme==='emoji'    && <FloatingEmojis/>}
      {selectedTheme==='pattern'  && <PatternBg/>}
      {selectedTheme==='seasonal' && <SeasonalBg/>}

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
        body { font-family:'Inter',sans-serif; overflow-x:hidden; }

        @keyframes warpBeam {
          0%   { opacity: 0.1; transform: rotate(var(--angle, 0deg)) scaleX(0.6); }
          50%  { opacity: 0.7; }
          100% { opacity: 0.2; transform: rotate(var(--angle, 0deg)) scaleX(1); }
        }
        @keyframes quantumPulse {
          0%,100% { opacity:0.05; transform:scaleX(0.5); }
          50%     { opacity:0.2;  transform:scaleX(1); }
        }
        @keyframes floatHeart {
          0%   { transform:translateX(0) translateY(0) rotate(0deg); opacity:0; }
          10%  { opacity:1; }
          90%  { opacity:0.8; }
          100% { transform:translateX(var(--drift,0px)) translateY(-110vh) rotate(45deg); opacity:0; }
        }

        .luma-pill {
          display:inline-flex; align-items:center; gap:6px;
          padding:7px 13px; border-radius:100px;
          background:${C.pill}; border:1px solid ${C.chipBorder};
          font-size:13px; font-weight:600; color:${C.text};
          cursor:pointer; transition:background 0.15s;
          user-select:none; backdrop-filter:blur(8px);
        }
        .luma-pill:hover { background:${C.pillHover}; }

        .date-chip {
          display:inline-flex; align-items:center;
          padding:6px 14px; border-radius:10px;
          background:${C.chipBg}; border:1px solid ${C.chipBorder};
          font-size:14px; font-weight:600; color:${C.text};
          cursor:pointer; transition:border-color 0.15s, box-shadow 0.15s;
          white-space:nowrap;
        }
        .date-chip:hover { border-color:${C.accent}66; box-shadow:0 0 0 3px ${C.accent}14; }
        .date-chip.open  { border-color:${C.accent}; box-shadow:0 0 0 3px ${C.accent}18; }

        .luma-input-row {
          display:flex; align-items:center; gap:12px;
          padding:14px 16px; border-radius:12px;
          background:${C.inputBg}; border:1.5px solid transparent;
          transition:border-color 0.15s;
        }
        .luma-input-row:focus-within { border-color:${C.accent}55; }

        .luma-option-row {
          display:flex; align-items:center; gap:14px;
          padding:14px 18px; cursor:pointer; transition:background 0.12s;
        }
        .luma-option-row:hover { background:${C.optionHover}; }

        .luma-toggle {
          width:40px; height:22px; border-radius:11px;
          background:${C.toggle}; position:relative; cursor:pointer;
          transition:background 0.2s; flex-shrink:0;
        }
        .luma-toggle.on { background:${C.accent}; }
        .luma-toggle::after {
          content:''; position:absolute; top:2px; left:2px;
          width:18px; height:18px; border-radius:50%;
          background:#fff; transition:transform 0.2s;
          box-shadow:0 1px 3px rgba(0,0,0,0.2);
        }
        .luma-toggle.on::after { transform:translateX(18px); }

        input, textarea { border:none; background:transparent; outline:none; font-family:inherit; color:inherit; }
        input::placeholder, textarea::placeholder { color:${C.placeholder}; }
        ::-webkit-scrollbar { width:5px; }
        ::-webkit-scrollbar-thumb { background:rgba(128,128,128,0.2); border-radius:99px; }

        .nav-link { display:flex; align-items:center; gap:5px; color:${C.muted}; text-decoration:none; font-size:13px; font-weight:500; transition:color 0.15s; }
        .nav-link:hover { color:${C.text}; }
      `}</style>

      {/* ── Header ── */}
      <header style={{ display: 'flex', justifyContent: 'center', padding: '14px 32px', position: 'relative', zIndex: 10 }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 20,
          background: isDark ? '#1e293b' : '#fff',
          border: `1px solid ${isDark ? '#334155' : '#f1f1f1'}`,
          borderRadius: 999,
          padding: '8px 12px 8px 20px',
          boxShadow: isDark ? '0 10px 40px rgba(0,0,0,0.5)' : '0 12px 40px rgba(0,0,0,0.06)',
          transition: 'all 0.3s ease'
        }}>
          {/* Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 800, color: C.text, fontSize: '1.05rem', letterSpacing: '-0.02em' }}>
            GrowthLab <span style={{ fontWeight: 500, color: C.muted }}>Lite</span>
          </div>

          <div style={{ width: 1, height: 18, background: isDark ? '#334155' : '#eee' }} />

          {/* Nav Links */}
          <nav style={{ display: 'flex', gap: 24, padding: '0 8px' }}>
            <Link href="#" style={{ textDecoration: 'none', color: '#6366f1', fontSize: '0.92rem', fontWeight: 700 }}>Events</Link>
            <Link href="#" style={{ textDecoration: 'none', color: C.muted, fontSize: '0.92rem', fontWeight: 600, transition: 'color 0.2s' }}>Calendars</Link>
            <Link href="#" style={{ textDecoration: 'none', color: C.muted, fontSize: '0.92rem', fontWeight: 600, transition: 'color 0.2s' }}>Discover</Link>
          </nav>

          <div style={{ width: 1, height: 18, background: isDark ? '#334155' : '#eee' }} />

          {/* Controls & Avatar */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, paddingLeft: 4 }}>
            <div onClick={() => {
              const toDark = !isDark;
              setTheme(toDark ? 'dark' : 'light');
              setSelectedTheme(toDark ? 'quantum' : 'minimal');
            }} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', padding: 4, borderRadius: '50%', background: isDark ? '#334155' : '#f9f9f9' }}>
              {isDark ? <PiSun size={16} color={C.text}/> : <PiMoon size={16} color={C.text}/>}
            </div>
            <PiMagnifyingGlass size={18} color={C.muted} style={{ cursor: 'pointer' }}/>
            <div style={{ width: 28, height: 28, borderRadius: '50%', background: `linear-gradient(135deg, #6366f1, #4f46e5)`, color: '#fff', display: 'grid', placeItems: 'center', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>
              {user?.name?.[0]?.toUpperCase() || 'Y'}
            </div>
          </div>
        </div>
      </header>

      {/* ── Builder ── */}
      <form onSubmit={handleSubmit} style={{maxWidth:1100,margin:'0 auto',padding:'32px 32px 140px',display:'grid',gridTemplateColumns:'minmax(280px,340px) 1fr',gap:48,alignItems:'start',position:'relative',zIndex:10}}>

        {/* LEFT: Image + Theme */}
        <div style={{display:'flex',flexDirection:'column',gap:14}}>
          <div style={{aspectRatio:'1',borderRadius:20,position:'relative',overflow:'hidden',background:'#3b0764',boxShadow:`0 24px 60px rgba(0,0,0,${isDark?0.5:0.14})`, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
            <img src={uploadedImage||'/growthlab/startup-team-collaboration.png'} alt="Cover" style={{width: '100%', height: '100%', objectFit: 'cover', display: 'block'}}/>
            <button type="button" onClick={()=>fileInputRef.current?.click()} style={{position:'absolute',bottom:14,right:14,width:34,height:34,borderRadius:'50%',background:'rgba(0,0,0,0.65)',color:'#fff',border:'none',display:'grid',placeItems:'center',cursor:'pointer',backdropFilter:'blur(6px)'}}>
              <PiCloudArrowUp size={16}/>
            </button>
            <input ref={fileInputRef} type="file" hidden onChange={handleImageUpload} accept="image/*"/>
          </div>

          <div style={{display:'flex',gap:8}}>
            <div onClick={e=>{e.stopPropagation();setShowThemePanel(p=>!p);}} style={{flex:1,background:C.inputBg,padding:'10px 13px',borderRadius:14,border:`1px solid ${C.chipBorder}`,display:'flex',alignItems:'center',gap:10,cursor:'pointer',transition:'border-color 0.15s',backdropFilter:'blur(4px)'}}>
              <div style={{width:30,height:22,borderRadius:6,overflow:'hidden',flexShrink:0,border:`1px solid ${C.chipBorder}`}}>
                {/* mini preview */}
                <div style={{width:'100%',height:'100%',background: selectedTheme==='minimal'?'#f3eff8': selectedTheme==='warp'?'#060610': selectedTheme==='quantum'?'linear-gradient(135deg,#0d0b1e,#2d1b69)': selectedTheme==='confetti'?'linear-gradient(135deg,#1c0a38,#3b0764)': selectedTheme==='pattern'?'#2a1760': selectedTheme==='seasonal'?'#fdf2f8':'#181528'}}/>
              </div>
              <div style={{flex:1}}>
                <div style={{fontSize:10,fontWeight:700,color:C.muted,textTransform:'uppercase',letterSpacing:'0.05em'}}>Theme</div>
                <div style={{fontSize:13,fontWeight:700,color:C.text}}>{themeConfig.label}</div>
              </div>
              <PiCaretDown size={13} color={C.muted}/>
            </div>
            <button type="button" onClick={()=>{
              const idx=THEMES.findIndex(t=>t.id===selectedTheme);
              setSelectedTheme(THEMES[(idx+1)%THEMES.length].id);
            }} style={{width:46,height:46,borderRadius:14,border:`1px solid ${C.chipBorder}`,background:C.inputBg,display:'grid',placeItems:'center',color:C.muted,cursor:'pointer',backdropFilter:'blur(4px)'}}>
              <PiShuffle size={18}/>
            </button>
          </div>
        </div>

        {/* RIGHT: Fields */}
        <div style={{display:'flex',flexDirection:'column',gap:18}}>

          {/* Header pills */}
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
            <div className="luma-pill"><span>🎃</span><span>{selectedCalendar?.name||'Personal Calendar'}</span><PiCaretDown size={12}/></div>
            <div style={{position:'relative'}}>
              <div className="luma-pill" onClick={e=>{e.stopPropagation();toggle('visibility');}}
              style={{background:active==='visibility'?C.accent:C.pill,color:active==='visibility'?'#fff':C.text,borderColor:active==='visibility'?C.accent:C.chipBorder}}>
                <PiGlobe size={14}/><span>{form.status==='published'?'Public':'Private'}</span><PiCaretDown size={12}/>
              </div>
              {active==='visibility'&&<VisibilityPicker value={form.status} onChange={v=>setField('status',v)} onClose={()=>setActive(null)} C={C}/>}
            </div>
          </div>

          {/* Title */}
          <input placeholder="Event Name" value={form.title} onChange={e=>setField('title',e.target.value)}
            style={{fontSize:'2.2rem',fontWeight:700,color:form.title?C.text:C.placeholder,letterSpacing:'-0.03em',lineHeight:1.1,padding:0,width:'100%',background:'transparent'}}/>

          {/* Date & Time */}
          <div style={{background:C.inputBg,borderRadius:16,border:`1px solid ${C.chipBorder}`}}>
            <div style={{display:'grid',gridTemplateColumns:'1fr auto'}}>
              <div style={{padding:'4px 0'}}>
                {/* START */}
                <div style={{display:'flex',alignItems:'center',gap:10,padding:'10px 16px'}}>
                  <div style={{position:'relative',display:'flex',alignItems:'center',flexShrink:0}}>
                    <div style={{width:9,height:9,borderRadius:'50%',background:C.muted}}/>
                    <div style={{position:'absolute',top:12,left:3.5,height:28,borderLeft:`1.5px dashed ${C.light}`}}/>
                  </div>
                  <span style={{fontSize:13,fontWeight:600,color:C.muted,width:36,flexShrink:0}}>Start</span>
                  <div style={{display:'flex',gap:8,flex:1}}>
                    <div ref={startDateRef} style={{position:'relative'}}>
                      <div className={`date-chip${active==='startDate'?' open':''}`} onClick={e=>{e.stopPropagation();setActive(active==='startDate'?null:'startDate');}}>
                        {fmtDate(form.date)}
                      </div>
                      {active==='startDate'&&<CalendarPopup value={form.date} onChange={v=>setField('date',v)} onClose={()=>setActive(null)} C={C} anchor={startDateRef}/>}
                    </div>
                    <div ref={startTimeRef} style={{position:'relative'}}>
                      <div className={`date-chip${active==='startTime'?' open':''}`} onClick={e=>{e.stopPropagation();setActive(active==='startTime'?null:'startTime');}} style={{minWidth:68,justifyContent:'center'}}>
                        {form.time}
                      </div>
                      {active==='startTime'&&<TimePicker value={form.time} onChange={v=>setField('time',v)} onClose={()=>setActive(null)} C={C} anchor={startTimeRef}/>}
                    </div>
                  </div>
                </div>

                {/* END */}
                <div style={{display:'flex',alignItems:'center',gap:10,padding:'10px 16px'}}>
                  <div style={{width:9,height:9,borderRadius:'50%',border:`1.5px solid ${C.light}`,flexShrink:0}}/>
                  <span style={{fontSize:13,fontWeight:600,color:C.muted,width:36,flexShrink:0}}>End</span>
                  <div style={{display:'flex',gap:8,flex:1}}>
                    <div ref={endDateRef} style={{position:'relative'}}>
                      <div className={`date-chip${active==='endDate'?' open':''}`} onClick={e=>{e.stopPropagation();setActive(active==='endDate'?null:'endDate');}}>
                        {fmtDate(endDate)}
                      </div>
                      {active==='endDate'&&<CalendarPopup value={endDate} onChange={v=>setEndDate(v)} onClose={()=>setActive(null)} C={C} anchor={endDateRef}/>}
                    </div>
                    <div ref={endTimeRef} style={{position:'relative'}}>
                      <div className={`date-chip${active==='endTime'?' open':''}`} onClick={e=>{e.stopPropagation();setActive(active==='endTime'?null:'endTime');}} style={{minWidth:68,justifyContent:'center'}}>
                        {form.end_time}
                      </div>
                      {active==='endTime'&&<TimePicker value={form.end_time} onChange={v=>setField('end_time',v)} onClose={()=>setActive(null)} C={C} anchor={endTimeRef}/>}
                    </div>
                  </div>
                </div>
              </div>

              {/* Timezone */}
              <div ref={timezoneRef} style={{position:'relative'}}>
                <div onClick={e=>{e.stopPropagation();toggle('timezone');}} style={{display:'flex',flexDirection:'column',gap:3,padding:'14px 16px',borderLeft:`1px solid ${C.tzBorder}`,background:active==='timezone'?C.inputBg2:'transparent',cursor:'pointer',height:'100%',justifyContent:'center',minWidth:100,transition:'background 0.15s',borderRadius:'0 16px 16px 0'}}>
                  <PiGlobe size={14} color={C.muted}/>
                  <div style={{fontSize:12,fontWeight:700,color:C.text}}>{timezone.offset}</div>
                  <div style={{fontSize:11,fontWeight:500,color:C.muted}}>{timezone.label.split(' - ')[1]||timezone.label}</div>
                </div>
                {active==='timezone'&&<TimezonePicker value={timezone.tz} onChange={tz=>{setTimezone(tz);}} onClose={()=>setActive(null)} C={C}/>}
              </div>
            </div>
          </div>

          {/* Location */}
          <div className="luma-input-row">
            <PiMapPin size={18} color={C.muted} style={{flexShrink:0}}/>
            <div style={{flex:1}}>
              <input style={{fontSize:14,fontWeight:600,width:'100%',display:'block'}} placeholder="Add Event Location" value={form.location} onChange={e=>setField('location',e.target.value)}/>
              {!form.location&&<div style={{fontSize:12,color:C.light,marginTop:2}}>Offline location or virtual link</div>}
            </div>
          </div>

          {/* Description */}
          <div className="luma-input-row">
            <PiFileText size={18} color={C.muted} style={{flexShrink:0}}/>
            <textarea rows={1} style={{flex:1,fontSize:14,fontWeight:600,resize:'none',width:'100%'}} placeholder="Add Description" value={form.description} onChange={e=>setField('description',e.target.value)}/>
          </div>

          {/* Event Options */}
          <div style={{display:'flex',flexDirection:'column',gap:6}}>
            <div style={{fontSize:13,fontWeight:700,color:C.muted,paddingLeft:4}}>Event Options</div>
            <div style={{background:C.inputBg,borderRadius:16,overflow:'hidden',border:`1px solid ${C.chipBorder}`,backdropFilter:'blur(4px)'}}>
              <div className="luma-option-row" onClick={() => setShowStripePopup(true)} style={{cursor: 'pointer'}}>
                <PiTicket size={18} color={C.muted} style={{flexShrink:0}}/>
                <span style={{flex:1,fontSize:14,fontWeight:600,color:C.text}}>Ticket Price</span>
                <span style={{fontSize:13,color:C.muted,display:'flex',alignItems:'center',gap:5}}>Free <PiPencilSimple size={13}/></span>
              </div>
              <div style={{height:1,background:C.divider,margin:'0 16px'}}/>
              <div className="luma-option-row">
                <PiShieldCheck size={18} color={C.muted} style={{flexShrink:0}}/>
                <span style={{flex:1,fontSize:14,fontWeight:600,color:C.text}}>Require Approval</span>
                <div className={`luma-toggle${form.require_approval?' on':''}`} onClick={()=>setField('require_approval',!form.require_approval)}/>
              </div>
              <div style={{height:1,background:C.divider,margin:'0 16px'}}/>
              <div className="luma-option-row">
                <PiUsers size={18} color={C.muted} style={{flexShrink:0}}/>
                <span style={{flex:1,fontSize:14,fontWeight:600,color:C.text}}>Capacity</span>
                <span style={{fontSize:13,color:C.muted,display:'flex',alignItems:'center',gap:5}}>Unlimited <PiPencilSimple size={13}/></span>
              </div>
            </div>
          </div>

          {/* Submit */}
          <button type="submit" disabled={loading}
            style={{width:'100%',padding:'17px',borderRadius:14,background:C.button,color:'#fff',fontSize:15,fontWeight:700,cursor:'pointer',border:'none',letterSpacing:'0.01em',transition:'background 0.15s',boxShadow:`0 8px 30px rgba(76,29,149,${isDark?0.4:0.25})`,marginTop:4}}
            onMouseEnter={e=>(e.currentTarget as HTMLButtonElement).style.background=C.buttonHover}
            onMouseLeave={e=>(e.currentTarget as HTMLButtonElement).style.background=C.button}>
            {loading?'Creating…':'Create Event'}
          </button>
          {error&&<div style={{color:'#f87171',fontSize:13,fontWeight:600,textAlign:'center'}}>{error}</div>}
        </div>
      </form>

      {/* ── Theme Panel ── */}
      {showThemePanel&&(
        <div onClick={e=>e.stopPropagation()} style={{position:'fixed',bottom:0,left:0,right:0,background:isDark?'rgba(10,8,24,0.97)':'rgba(252,250,255,0.98)',borderTop:`1px solid ${C.chipBorder}`,boxShadow:`0 -20px 70px rgba(0,0,0,${isDark?0.65:0.14})`,zIndex:1000,backdropFilter:'blur(28px)'}}>
          {/* Header */}
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'16px 36px 12px'}}>
            <div>
              <span style={{fontSize:14,fontWeight:800,color:C.text,letterSpacing:'-0.01em'}}>Event Theme</span>
              <span style={{fontSize:12,color:C.muted,marginLeft:10}}>Pick a vibe for your event page</span>
            </div>
            <button type="button" onClick={()=>setShowThemePanel(false)} style={{background:C.inputBg,border:`1px solid ${C.chipBorder}`,cursor:'pointer',color:C.muted,fontSize:14,lineHeight:1,padding:'6px 10px',borderRadius:8,fontWeight:600}}>
              Done
            </button>
          </div>
          {/* Thumbnails — wrap grid centred */}
          <div style={{display:'flex',flexWrap:'wrap',gap:20,padding:'4px 36px 24px',justifyContent:'center'}}>
            {THEMES.map(t=>(
              <ThemeThumb key={t.id} theme={t} selected={selectedTheme===t.id} onSelect={()=>setSelectedTheme(t.id)}/>
            ))}
          </div>
        </div>
      )}

      {/* ── Stripe Popup ── */}
      {showStripePopup && (
        <div 
          onClick={() => setShowStripePopup(false)}
          style={{position: 'fixed', inset: 0, zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.1)'}}
        >
          <div 
            onClick={e => e.stopPropagation()}
            style={{background: '#fff', borderRadius: 20, padding: 24, width: '100%', maxWidth: 360, boxShadow: '0 24px 60px rgba(0,0,0,0.1)'}}
          >
            <div style={{width: 48, height: 48, borderRadius: 12, background: '#f5f5f5', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16, border: '1px solid #eee'}}>
              <PiTicket size={24} color="#333" />
            </div>
            <h3 style={{fontSize: 20, fontWeight: 800, color: '#111', margin: '0 0 12px', letterSpacing: '-0.02em', fontFamily: "'Inter', sans-serif"}}>Accept Payments</h3>
            <p style={{color: '#555', fontSize: 13.5, lineHeight: 1.5, margin: '0 0 16px', fontFamily: "'Inter', sans-serif"}}>This calendar is not yet set up to accept payments.</p>
            <p style={{color: '#555', fontSize: 13.5, lineHeight: 1.5, margin: '0 0 24px', fontFamily: "'Inter', sans-serif"}}>We use <span style={{color: '#0d9488', fontWeight: 600}}>Stripe</span> to process payments. Connect or set up a Stripe account to start accepting payments. It usually takes less than 5 minutes.</p>
            <button 
              onClick={() => setShowStripePopup(false)}
              style={{width: '100%', padding: '14px', borderRadius: 12, background: '#2c2c2c', color: '#fff', fontSize: 14, fontWeight: 700, cursor: 'pointer', border: 'none', fontFamily: "'Inter', sans-serif"}}
            >
              Connect Stripe
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
