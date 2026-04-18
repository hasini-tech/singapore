export type EventAgendaItem = {
  time: string;
  title: string;
  detail: string;
};

export type GrowthLabEvent = {
  slug: string;
  title: string;
  type: string;
  date: string;
  time: string;
  location: string;
  attendees: string;
  summary: string;
  description: string;
  image: string;
  ctaLabel: string;
  ctaHref: string;
  accent: string;
  format: string;
  capacity: string;
  rsvpWindow: string;
  host: string;
  highlights: string[];
  agenda: EventAgendaItem[];
};

export const growthLabEvents: GrowthLabEvent[] = [
  {
    slug: 'launch-night',
    title: 'GrowthLab Launch Night',
    type: 'Community Mixer',
    date: 'Dec 19, 2025',
    time: '6:30 PM - 9:30 PM',
    location: 'Marina Bay Sands, Singapore',
    attendees: '240+ attendees expected',
    summary:
      'Founder stories, live demos, and curated introductions to close the year with momentum.',
    description:
      'Our flagship gathering brings together founders, operators, investors, and community builders for an evening of sharp talks, live product moments, and introductions that lead to real follow-up.',
    image: '/gallery/images/JH2_2893.jpg',
    ctaLabel: 'View details',
    ctaHref: '/events/launch-night',
    accent: 'Flagship event',
    format: 'Hybrid + live',
    capacity: '240 seats',
    rsvpWindow: 'Now open',
    host: 'GrowthLab Community Team',
    highlights: [
      'Founder lightning talks',
      'Curated warm introductions',
      'Live demo showcase',
      'After-hours networking',
    ],
    agenda: [
      {
        time: '6:30 PM',
        title: 'Doors and networking',
        detail: 'Grab a badge, meet the room, and warm up with founder introductions.',
      },
      {
        time: '7:15 PM',
        title: 'Mainstage stories',
        detail: 'Three short talks, live demos, and a few sharp announcements.',
      },
      {
        time: '8:00 PM',
        title: 'Roundtables and after-hours',
        detail: 'Split into small groups to compare notes, swap ideas, and keep the conversation going.',
      },
    ],
  },
  {
    slug: 'ai-builder-weekend',
    title: 'AI Builder Weekend',
    type: 'Hands-on Workshop',
    date: 'Jan 15, 2026',
    time: '10:00 AM - 4:00 PM',
    location: 'Hybrid / Zoom + Singapore',
    attendees: '120 builders and operators',
    summary:
      'A practical, fast-paced session for teams building products, automations, and better workflows.',
    description:
      'A working session for founders and product teams who want to ship faster with AI. Expect focused build labs, live debugging, and practical prompts you can bring back to the team.',
    image: '/gallery/images/JH2_2922.jpg',
    ctaLabel: 'Explore agenda',
    ctaHref: '/events/ai-builder-weekend',
    accent: 'Hybrid format',
    format: 'Hybrid workshop',
    capacity: '120 seats',
    rsvpWindow: 'Registrations open',
    host: 'GrowthLab Product Guild',
    highlights: [
      'Hands-on build labs',
      'Live prompt engineering',
      'Office hours with experts',
      'Take-home templates',
    ],
    agenda: [
      {
        time: '10:00 AM',
        title: 'Opening build brief',
        detail: 'Set the goals, share the stack, and pick a challenge to solve.',
      },
      {
        time: '12:00 PM',
        title: 'Lunch and peer demos',
        detail: 'Swap feedback, review progress, and compare notes with other teams.',
      },
      {
        time: '2:30 PM',
        title: 'Implementation clinic',
        detail: 'Work through the tricky parts with mentors and ship a usable result.',
      },
    ],
  },
  {
    slug: 'founders-breakfast-club',
    title: 'Founders Breakfast Club',
    type: 'Invite-only Roundtable',
    date: 'Feb 05, 2026',
    time: '8:00 AM - 10:30 AM',
    location: 'The Fullerton Bay Hotel',
    attendees: '40 founders and investors',
    summary:
      'A tight-room morning of operator insights, warm introductions, and follow-up opportunities.',
    description:
      'A curated breakfast room for founders and investors who want direct conversations, sharper introductions, and a calmer pace for building trusted relationships.',
    image: '/gallery/images/JH2_2873.jpg',
    ctaLabel: 'Join the room',
    ctaHref: '/events/founders-breakfast-club',
    accent: 'Limited seats',
    format: 'Invite-only breakfast',
    capacity: '40 seats',
    rsvpWindow: 'Request access',
    host: 'GrowthLab Founders Circle',
    highlights: [
      'Small-group discussions',
      'Investor introductions',
      'Founder operator notes',
      'Follow-up matchmaking',
    ],
    agenda: [
      {
        time: '8:00 AM',
        title: 'Coffee and arrivals',
        detail: 'Settle in with a short, curated introduction round.',
      },
      {
        time: '8:45 AM',
        title: 'Founder roundtable',
        detail: 'Discuss challenges, hiring, and go-to-market with peers.',
      },
      {
        time: '9:45 AM',
        title: 'Matchmaking and close',
        detail: 'Capture follow-ups and leave with a clear next step.',
      },
    ],
  },
];

export function getEventBySlug(slug: string) {
  return growthLabEvents.find((event) => event.slug === slug) ?? null;
}

export function getEventSlugs() {
  return growthLabEvents.map((event) => event.slug);
}
