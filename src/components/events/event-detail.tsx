import Link from 'next/link';
import Image from 'next/image';
import type { ComponentType } from 'react';
import {
  PiArrowLeft,
  PiArrowRight,
  PiCalendar,
  PiCheckCircle,
  PiClock,
  PiMapPin,
  PiPlus,
  PiSparkle,
  PiUsers,
} from 'react-icons/pi';
import { Badge, Text, Title } from 'rizzui';
import BookingButton from './BookingButton';
import type { GrowthLabEvent } from './event-data';
import { routes } from '@/config/routes';

function MetaRow({
  icon: Icon,
  label,
}: {
  icon: ComponentType<{ className?: string }>;
  label: string;
}) {
  return (
    <div className="flex items-center gap-3 text-sm font-medium text-gray-600 dark:text-gray-400">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
        <Icon className="h-4 w-4" />
      </span>
      <span>{label}</span>
    </div>
  );
}

export default function EventDetail({ event }: { event: GrowthLabEvent }) {
  return (
    <main
      className="relative isolate overflow-hidden bg-[linear-gradient(180deg,rgba(255,255,255,0.97)_0%,rgba(244,251,251,0.97)_100%)]"
      style={{
        backgroundImage:
          'radial-gradient(circle at 12% 12%, rgba(14,118,120,0.12), transparent 22%), radial-gradient(circle at 82% 18%, rgba(245,158,11,0.1), transparent 18%), linear-gradient(180deg, rgba(255,255,255,0.98) 0%, rgba(244,251,251,0.98) 100%)',
      }}
    >
      <section className="mx-auto max-w-[1440px] px-4 pb-16 pt-10 sm:px-6 lg:px-8 lg:pb-20 lg:pt-16">
        <Link
          href={routes.events}
          className="inline-flex items-center gap-2 rounded-full border border-muted bg-background/90 px-4 py-2 text-sm font-semibold text-foreground shadow-sm transition-transform duration-200 hover:-translate-y-0.5 hover:border-primary/30 hover:bg-gray-50"
        >
          <PiArrowLeft className="h-4 w-4" />
          Back to events
        </Link>

        <div className="mt-6 grid items-start gap-10 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="max-w-3xl">
            <div className="mb-6 flex flex-wrap items-center gap-2">
              <Badge
                variant="flat"
                color="primary"
                className="rounded-full px-4 py-1.5 text-[10px] font-bold uppercase tracking-[0.25em] shadow-sm"
              >
                <PiSparkle className="mr-2 h-3.5 w-3.5" />
                {event.type}
              </Badge>
              <span className="rounded-full bg-background/90 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.25em] text-foreground shadow-sm">
                {event.accent}
              </span>
            </div>

            <Title
              as="h1"
              className="max-w-2xl text-5xl font-extrabold leading-[0.96] tracking-tight text-foreground sm:text-6xl lg:text-7xl"
            >
              {event.title}
            </Title>

            <Text className="mt-6 max-w-2xl text-lg font-light leading-8 text-gray-600 dark:text-gray-400 lg:text-xl">
              {event.summary}
            </Text>

            <Text className="mt-5 max-w-2xl text-base leading-8 text-gray-600 dark:text-gray-400 lg:text-lg">
              {event.description}
            </Text>

            <div className="mt-8 grid gap-3 sm:grid-cols-2">
              <MetaRow icon={PiCalendar} label={event.date} />
              <MetaRow icon={PiClock} label={event.time} />
              <MetaRow icon={PiMapPin} label={event.location} />
              <MetaRow icon={PiUsers} label={event.attendees} />
            </div>

            <div className="mt-10">
              <Text className="text-[10px] font-bold uppercase tracking-[0.3em] text-primary">
                Highlights
              </Text>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {event.highlights.map((highlight) => (
                  <div
                    key={highlight}
                    className="flex items-start gap-3 rounded-2xl border border-muted bg-background/90 p-4 shadow-sm"
                  >
                    <span className="mt-0.5 flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">
                      <PiCheckCircle className="h-4 w-4" />
                    </span>
                    <span className="text-sm font-medium text-foreground">{highlight}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-10 rounded-[28px] border border-muted bg-background/90 p-6 shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <Text className="text-[10px] font-bold uppercase tracking-[0.3em] text-primary">
                    Run of show
                  </Text>
                  <Title as="h2" className="mt-2 text-2xl font-bold tracking-tight text-foreground">
                    What happens during the event
                  </Title>
                </div>
                <Badge
                  variant="flat"
                  color="primary"
                  className="rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em]"
                >
                  Live timeline
                </Badge>
              </div>

              <div className="mt-6 grid gap-3">
                {event.agenda.map((item) => (
                  <div
                    key={item.time}
                    className="flex items-start gap-4 rounded-2xl border border-white/40 bg-gray-50/80 p-4 shadow-sm"
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

            <div className="mt-10 flex flex-col gap-4 sm:flex-row">
              <BookingButton
                eventSlug={event.slug}
                eventTitle={event.title}
                className="inline-flex items-center justify-center gap-2 rounded-full bg-primary px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-primary/20 transition-transform duration-200 hover:-translate-y-0.5 hover:bg-primary/90"
              />
              <Link
                href={routes.createEvent}
                className="inline-flex items-center justify-center gap-2 rounded-full border border-[#d9dee5] bg-white px-3.5 py-2 text-sm font-medium text-slate-700 shadow-[0_1px_2px_rgba(15,23,42,0.04)] transition-all hover:-translate-y-0.5 hover:border-slate-300 hover:bg-slate-50"
              >
                <PiPlus className="h-4 w-4" />
                Create event
              </Link>
              <Link
                href={routes.eventCalendar}
                className="inline-flex items-center justify-center gap-2 rounded-full border border-muted bg-background/90 px-6 py-3.5 text-sm font-semibold text-foreground shadow-sm transition-transform duration-200 hover:-translate-y-0.5 hover:border-primary/30 hover:bg-gray-50"
              >
                Open calendar
                <PiArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>

          <aside className="lg:sticky lg:top-8">
            <div className="rounded-[36px] border border-muted bg-background p-4 shadow-[0_30px_120px_rgba(17,39,45,0.14)]">
              <div className="relative aspect-[4/3] overflow-hidden rounded-[28px]">
                <Image
                  src={event.image}
                  alt={event.title}
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
                    {event.date}
                  </span>
                </div>

                <div className="absolute bottom-5 left-5 right-5">
                  <div className="max-w-xl rounded-[24px] border border-white/10 bg-black/30 p-5 text-white shadow-2xl backdrop-blur-md">
                    <div className="mb-2 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.28em] text-white/70">
                      <PiSparkle className="h-3.5 w-3.5" />
                      {event.host}
                    </div>
                    <h2 className="text-2xl font-semibold leading-tight">{event.title}</h2>
                    <p className="mt-2 text-sm leading-6 text-white/80">{event.summary}</p>
                  </div>
                </div>
              </div>

              <div className="mt-4 grid gap-3 md:grid-cols-3">
                <div className="rounded-3xl border border-muted bg-gray-50/80 p-4 dark:bg-gray-900/40">
                  <Text className="text-[10px] font-bold uppercase tracking-[0.24em] text-gray-500">
                    Format
                  </Text>
                  <div className="mt-2 text-lg font-semibold text-foreground">{event.format}</div>
                </div>
                <div className="rounded-3xl border border-muted bg-gray-50/80 p-4 dark:bg-gray-900/40">
                  <Text className="text-[10px] font-bold uppercase tracking-[0.24em] text-gray-500">
                    RSVP window
                  </Text>
                  <div className="mt-2 text-lg font-semibold text-foreground">{event.rsvpWindow}</div>
                </div>
                <div className="rounded-3xl border border-muted bg-gray-50/80 p-4 dark:bg-gray-900/40">
                  <Text className="text-[10px] font-bold uppercase tracking-[0.24em] text-gray-500">
                    Capacity
                  </Text>
                  <div className="mt-2 text-lg font-semibold text-foreground">{event.capacity}</div>
                </div>
              </div>

              <div className="mt-4 rounded-[28px] border border-muted bg-gray-50/80 p-4 dark:bg-gray-900/40">
                <div className="mb-4 flex items-center justify-between gap-4">
                  <Text className="text-sm font-bold uppercase tracking-[0.24em] text-primary">
                    Your next step
                  </Text>
                  <Badge
                    variant="flat"
                    color="primary"
                    className="rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em]"
                  >
                    Demo flow
                  </Badge>
                </div>
              <div className="grid gap-3">
                <BookingButton
                  eventSlug={event.slug}
                  eventTitle={event.title}
                  className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-primary px-5 text-sm font-semibold text-white shadow-lg shadow-primary/20 transition-transform duration-200 hover:-translate-y-0.5 hover:bg-primary/90"
                />
                <Link
                  href={routes.createEvent}
                  className="inline-flex h-12 items-center justify-center gap-2 rounded-full border border-[#d9dee5] bg-white px-5 text-sm font-medium text-slate-700 shadow-[0_1px_2px_rgba(15,23,42,0.04)] transition-all hover:-translate-y-0.5 hover:border-slate-300 hover:bg-slate-50"
                >
                  <PiPlus className="h-4 w-4" />
                  Create event
                </Link>
                <Link
                  href={routes.events}
                  className="inline-flex h-12 items-center justify-center gap-2 rounded-full border border-muted bg-background px-5 text-sm font-semibold text-foreground shadow-sm transition-transform duration-200 hover:-translate-y-0.5 hover:border-primary/30 hover:bg-gray-50"
                >
                    Browse all events
                    <PiArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </section>
    </main>
  );
}
