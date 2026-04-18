'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { routes } from '@/config/routes';
import { growthLabEvents, type GrowthLabEvent } from './event-data';
import type { IconType } from 'react-icons';
import {
  PiArrowRight,
  PiArrowUpRight,
  PiCalendar,
  PiClock,
  PiMapPin,
  PiPlus,
  PiSparkle,
  PiUsers,
  PiVideoCameraFill,
} from 'react-icons/pi';
import { Badge, Text, Title } from 'rizzui';

type FeaturedEvent = GrowthLabEvent;

type Stat = {
  value: string;
  label: string;
  icon: IconType;
};

type RunOfShowItem = {
  time: string;
  title: string;
  detail: string;
};

const featuredEvents: FeaturedEvent[] = growthLabEvents;

const stats: Stat[] = [
  {
    value: '12',
    label: 'events this quarter',
    icon: PiCalendar,
  },
  {
    value: '8',
    label: 'cities activated',
    icon: PiMapPin,
  },
  {
    value: '1.8k',
    label: 'expected RSVPs',
    icon: PiUsers,
  },
  {
    value: '6',
    label: 'hybrid sessions',
    icon: PiVideoCameraFill,
  },
];

const runOfShow: RunOfShowItem[] = [
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
];

function MetaRow({ icon: Icon, label }: { icon: IconType; label: string }) {
  return (
    <div className="flex items-center gap-3 text-sm font-medium text-gray-600 dark:text-gray-400">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
        <Icon className="h-4 w-4" />
      </span>
      <span>{label}</span>
    </div>
  );
}

function StatCard({ stat, index }: { stat: Stat; index: number }) {
  const Icon = stat.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.45, delay: index * 0.05 }}
      whileHover={{ y: -4 }}
      className="group rounded-3xl border border-muted bg-background/90 p-5 shadow-sm backdrop-blur-sm transition-all duration-300 hover:shadow-xl"
    >
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-white">
        <Icon className="h-6 w-6" />
      </div>
      <div className="text-3xl font-bold tracking-tight text-foreground">{stat.value}</div>
      <Text className="mt-1 text-xs font-bold uppercase tracking-[0.22em] text-gray-500">
        {stat.label}
      </Text>
    </motion.div>
  );
}

function FeaturedEventCard({ event, index }: { event: FeaturedEvent; index: number }) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.7, delay: index * 0.08, ease: [0.21, 0.45, 0.32, 0.9] }}
      whileHover={{ y: -10 }}
      className="group flex h-full flex-col overflow-hidden rounded-[32px] border border-muted bg-background shadow-sm transition-all duration-500 hover:shadow-2xl"
    >
      <div className="relative aspect-[16/10] overflow-hidden">
        <Image
          src={event.image}
          alt={event.title}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
          className="object-cover transition-transform duration-700 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-gray-950/75 via-gray-950/10 to-transparent" />
        <div className="absolute left-4 top-4 flex flex-wrap items-center gap-2">
          <Badge
            variant="flat"
            color="primary"
            className="rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] shadow-lg"
          >
            {event.type}
          </Badge>
          <span className="rounded-full bg-background/90 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.25em] text-foreground backdrop-blur">
            {event.accent}
          </span>
        </div>
        <div className="absolute bottom-4 left-4 right-4">
          <div className="max-w-xl rounded-[24px] border border-white/10 bg-black/30 p-4 text-white shadow-2xl backdrop-blur-md">
            <div className="mb-2 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.28em] text-white/70">
              <PiSparkle className="h-3.5 w-3.5" />
              Featured session
            </div>
            <p className="text-sm leading-6 text-white/80">{event.summary}</p>
          </div>
        </div>
      </div>

      <div className="flex flex-1 flex-col p-7 lg:p-8">
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <Text className="mb-2 text-[11px] font-bold uppercase tracking-[0.28em] text-primary">
              {event.date}
            </Text>
            <Title
              as="h3"
              className="text-2xl font-bold leading-tight tracking-tight text-foreground transition-colors group-hover:text-primary"
            >
              {event.title}
            </Title>
          </div>

          <div className="hidden shrink-0 rounded-2xl bg-primary/10 p-3 text-primary md:grid md:place-items-center">
            <PiArrowUpRight className="h-5 w-5" />
          </div>
        </div>

        <div className="mb-6 grid gap-3">
          <MetaRow icon={PiClock} label={event.time} />
          <MetaRow icon={PiMapPin} label={event.location} />
          <MetaRow icon={PiUsers} label={event.attendees} />
        </div>

        <div className="mt-auto flex items-center justify-between gap-4">
          <Link
            href={event.ctaHref}
            className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-primary/20 transition-transform duration-200 hover:-translate-y-0.5 hover:bg-primary/90"
          >
            {event.ctaLabel}
            <PiArrowRight className="h-4 w-4" />
          </Link>
          <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-gray-400">
            {index + 1} / {featuredEvents.length}
          </span>
        </div>
      </div>
    </motion.article>
  );
}

export default function EventsLayout() {
  return (
    <main
      className="relative isolate overflow-hidden bg-[linear-gradient(180deg,rgba(255,255,255,0.96)_0%,rgba(245,250,250,0.96)_100%)]"
      style={{
        backgroundImage:
          'radial-gradient(circle at 12% 12%, rgba(14,118,120,0.12), transparent 22%), radial-gradient(circle at 82% 18%, rgba(245,158,11,0.12), transparent 18%), linear-gradient(180deg, rgba(255,255,255,0.98) 0%, rgba(245,250,250,0.98) 100%)',
      }}
    >
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute left-[-12%] top-[-10%] h-[24rem] w-[24rem] rounded-full bg-teal-500/10 blur-[120px]" />
        <div className="absolute right-[-8%] top-[15%] h-[22rem] w-[22rem] rounded-full bg-amber-500/10 blur-[120px]" />
      </div>

      <section className="mx-auto max-w-[1440px] px-4 pb-16 pt-10 sm:px-6 lg:px-8 lg:pb-20 lg:pt-16">
        <div className="grid items-center gap-10 lg:grid-cols-[1.05fr_0.95fr]">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: 'easeOut' }}
            className="max-w-3xl"
          >
            <div className="mb-6 flex justify-start">
              <Badge
                variant="flat"
                color="primary"
                className="rounded-full px-4 py-1.5 text-[10px] font-bold uppercase tracking-[0.25em] shadow-sm"
              >
                <PiSparkle className="mr-2 h-3.5 w-3.5" />
                06 / Events
              </Badge>
            </div>

            <Title
              as="h1"
              className="max-w-2xl text-5xl font-extrabold leading-[0.96] tracking-tight text-foreground sm:text-6xl lg:text-7xl"
            >
              Events that turn introductions into momentum.
            </Title>

            <Text className="mt-6 max-w-2xl text-lg font-light leading-8 text-gray-600 dark:text-gray-400 lg:text-xl">
              Discover founder mixers, workshops, demo nights, and hybrid sessions built to help the
              GrowthLab community meet, learn, and ship faster.
            </Text>

            <div className="mt-10 flex flex-col gap-4 sm:flex-row">
              <Link
                href={routes.eventCalendar}
                className="inline-flex items-center justify-center gap-2 rounded-full bg-primary px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-primary/20 transition-transform duration-200 hover:-translate-y-0.5 hover:bg-primary/90"
              >
                Open calendar
                <PiArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href={routes.createEvent}
                className="inline-flex items-center justify-center gap-2 rounded-full border border-[#d9dee5] bg-white px-3.5 py-2 text-sm font-medium text-slate-700 shadow-[0_1px_2px_rgba(15,23,42,0.04)] transition-all hover:-translate-y-0.5 hover:border-slate-300 hover:bg-slate-50"
              >
                <PiPlus className="h-4 w-4" />
                Create event
              </Link>
              <Link
                href={routes.feed}
                className="inline-flex items-center justify-center gap-2 rounded-full border border-muted bg-background/90 px-6 py-3.5 text-sm font-semibold text-foreground shadow-sm transition-transform duration-200 hover:-translate-y-0.5 hover:border-primary/30 hover:bg-gray-50"
              >
                Browse feed
              </Link>
            </div>

            <div className="mt-10 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {stats.map((stat, index) => (
                <StatCard key={stat.label} stat={stat} index={index} />
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: 'easeOut', delay: 0.1 }}
            className="relative"
          >
            <div className="absolute -left-6 top-10 hidden h-40 w-40 rounded-full bg-primary/10 blur-3xl lg:block" />
            <div className="rounded-[36px] border border-muted bg-background p-4 shadow-[0_30px_120px_rgba(17,39,45,0.14)]">
              <div className="relative aspect-[4/3] overflow-hidden rounded-[28px]">
                <Image
                  src={featuredEvents[0].image}
                  alt={featuredEvents[0].title}
                  fill
                  priority
                  sizes="(max-width: 1024px) 100vw, 48vw"
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-gray-950/82 via-gray-950/12 to-transparent" />
                <div className="absolute left-5 top-5 flex flex-wrap items-center gap-2">
                  <Badge
                    variant="flat"
                    color="primary"
                    className="rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] shadow-lg"
                  >
                    Next up
                  </Badge>
                  <span className="rounded-full bg-background/90 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.25em] text-foreground backdrop-blur">
                    {featuredEvents[0].date}
                  </span>
                </div>

                <div className="absolute bottom-5 left-5 right-5">
                  <div className="max-w-xl rounded-[24px] border border-white/10 bg-black/30 p-5 text-white shadow-2xl backdrop-blur-md">
                    <div className="mb-2 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.28em] text-white/70">
                      <PiSparkle className="h-3.5 w-3.5" />
                      Flagship gathering
                    </div>
                    <h2 className="text-2xl font-semibold leading-tight">
                      {featuredEvents[0].title}
                    </h2>
                    <p className="mt-2 text-sm leading-6 text-white/80">
                      {featuredEvents[0].summary}
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-4 grid gap-3 md:grid-cols-3">
                <div className="rounded-3xl border border-muted bg-gray-50/80 p-4 dark:bg-gray-900/40">
                  <Text className="text-[10px] font-bold uppercase tracking-[0.24em] text-gray-500">
                    Format
                  </Text>
                  <div className="mt-2 text-lg font-semibold text-foreground">Hybrid + live</div>
                </div>
                <div className="rounded-3xl border border-muted bg-gray-50/80 p-4 dark:bg-gray-900/40">
                  <Text className="text-[10px] font-bold uppercase tracking-[0.24em] text-gray-500">
                    RSVP window
                  </Text>
                  <div className="mt-2 text-lg font-semibold text-foreground">Now open</div>
                </div>
                <div className="rounded-3xl border border-muted bg-gray-50/80 p-4 dark:bg-gray-900/40">
                  <Text className="text-[10px] font-bold uppercase tracking-[0.24em] text-gray-500">
                    Capacity
                  </Text>
                  <div className="mt-2 text-lg font-semibold text-foreground">240 seats</div>
                </div>
              </div>

              <div className="mt-4 rounded-[28px] border border-muted bg-gray-50/80 p-4 dark:bg-gray-900/40">
                <div className="mb-4 flex items-center justify-between gap-4">
                  <Text className="text-sm font-bold uppercase tracking-[0.24em] text-primary">
                    Run of show
                  </Text>
                  <Badge variant="flat" color="primary" className="rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em]">
                    Live timeline
                  </Badge>
                </div>
                <div className="grid gap-3">
                  {runOfShow.map((item) => (
                    <div
                      key={item.time}
                      className="flex items-start gap-4 rounded-2xl border border-white/40 bg-background/80 p-4 shadow-sm"
                    >
                      <span className="rounded-full bg-primary/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-primary">
                        {item.time}
                      </span>
                      <div>
                        <div className="text-sm font-semibold text-foreground">{item.title}</div>
                        <div className="mt-1 text-sm leading-6 text-gray-600 dark:text-gray-400">
                          {item.detail}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="mx-auto max-w-[1440px] px-4 pb-16 sm:px-6 lg:px-8 lg:pb-20">
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div className="max-w-3xl">
            <Text className="text-[10px] font-bold uppercase tracking-[0.3em] text-primary">
              Featured events
            </Text>
            <Title
              as="h2"
              className="mt-3 text-4xl font-bold tracking-tight text-foreground lg:text-6xl"
            >
              Curated experiences for builders.
            </Title>
            <Text className="mt-4 max-w-2xl text-base font-light leading-7 text-gray-600 dark:text-gray-400 lg:text-lg">
              From community mixers to technical workshops, each event is designed to create
              relationships, learning, and practical momentum.
            </Text>
          </div>

          <Link
            href={routes.eventCalendar}
            className="inline-flex items-center justify-center gap-2 rounded-full border border-muted bg-background px-5 py-3 text-sm font-semibold text-foreground shadow-sm transition-transform duration-200 hover:-translate-y-0.5 hover:border-primary/30 hover:bg-gray-50"
          >
            View the full calendar
            <PiArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="grid gap-8 md:grid-cols-2 xl:grid-cols-3">
          {featuredEvents.map((event, index) => (
            <FeaturedEventCard key={event.title} event={event} index={index} />
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-[1440px] px-4 pb-24 sm:px-6 lg:px-8">
        <div className="overflow-hidden rounded-[34px] border border-primary/15 bg-[linear-gradient(135deg,rgba(14,118,120,0.12),rgba(255,255,255,0.96)_46%,rgba(245,250,250,0.98))] p-6 shadow-xl lg:p-10">
          <div className="grid gap-6 lg:grid-cols-[1.1fr_auto] lg:items-center">
            <div className="max-w-3xl">
              <Badge
                variant="flat"
                color="primary"
                className="rounded-full px-4 py-1.5 text-[10px] font-bold uppercase tracking-[0.25em]"
              >
                Host, attend, repeat
              </Badge>
              <Title
                as="h2"
                className="mt-4 text-3xl font-bold tracking-tight text-foreground lg:text-5xl"
              >
                Bring your next event to GrowthLab.
              </Title>
              <Text className="mt-4 max-w-2xl text-base font-light leading-7 text-gray-600 dark:text-gray-400 lg:text-lg">
                Use the calendar to create new sessions, manage attendance, and keep the
                community looped in.
              </Text>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row lg:justify-end">
              <Link
                href={routes.eventCalendar}
                className="inline-flex items-center justify-center gap-2 rounded-full bg-primary px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-primary/20 transition-transform duration-200 hover:-translate-y-0.5 hover:bg-primary/90"
              >
                Open event calendar
                <PiArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href={routes.signIn}
                className="inline-flex items-center justify-center gap-2 rounded-full border border-muted bg-background px-6 py-3.5 text-sm font-semibold text-foreground shadow-sm transition-transform duration-200 hover:-translate-y-0.5 hover:border-primary/30 hover:bg-gray-50"
              >
                Sign in to host
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
