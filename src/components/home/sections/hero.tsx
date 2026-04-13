'use client';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { PiArrowRight, PiSparkle } from 'react-icons/pi';
import { Badge, Button, Text, Title } from 'rizzui';
export default function Hero() {
  return (
    <section
      id="hero"
      className="relative flex items-center justify-center overflow-hidden pt-4"
    >
      {' '}
      {/* Background Elements */}{' '}
      <div
        className="absolute inset-0 z-0 opacity-[0.03] dark:opacity-[0.05]"
        style={{
          backgroundImage:
            'radial-gradient(#000 1px, transparent 1px), radial-gradient(#000 1px, transparent 1px)',
          backgroundSize: '40px 40px',
          backgroundPosition: '0 0, 20px 20px',
        }}
      />{' '}
      {/* Gradient Orbs from Previous Project */}{' '}
      <div className="absolute right-1/4 top-1/4 z-0 h-[500px] max-w-[500px] rounded-full bg-teal-500/10 blur-[120px] dark:bg-teal-500/5 sm:h-[700px] sm:w-[700px]" />{' '}
      <div className="absolute bottom-1/4 left-1/4 z-0 h-[500px] max-w-[500px] rounded-full bg-amber-500/10 blur-[120px] dark:bg-amber-500/5 sm:h-[700px] sm:w-[700px]" />{' '}
      <div className="relative z-10 mx-auto max-w-[1440px] px-4 text-center sm:px-6 lg:px-8">
        {' '}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {' '}
          {/* Subtitle Badge */}{' '}
          <div className="mb-8 flex justify-center">
            {' '}
            <Badge
              variant="flat"
              color="primary"
              className="px-4 py-1.5 text-xs font-bold uppercase tracking-[0.2em] shadow-sm text-background"
            >
              {' '}
              <PiSparkle className="mr-2 h-3.5 w-3.5" /> A
              Startup Community{' '}
              <PiSparkle className="ml-2 h-3.5 w-3.5 text-amber-500" />{' '}
            </Badge>{' '}
          </div>{' '}
          {/* High-Fidelity Heading */}{' '}
          <Title
            as="h1"
            className="mb-8 text-5xl font-extrabold leading-[1.05] tracking-tight text-foreground sm:text-7xl md:text-8xl lg:text-9xl"
          >
            {' '}
            <span className="inline-block bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 bg-clip-text text-transparent dark:from-white dark:via-teal-100 dark:to-white">
              {' '}
              Growth{' '}
            </span>{' '}
            <span className="ml-2 inline-block bg-gradient-to-r from-teal-600 via-teal-500 to-teal-600 bg-clip-text text-transparent">
              {' '}
              Lab{' '}
            </span>{' '}
          </Title>{' '}
          {/* Description */}{' '}
          <div className="mx-auto max-w-4xl px-4">
            {' '}
            <Text className="mb-6 text-xl font-light leading-relaxed sm:text-2xl lg:text-4xl">
              {' '}
              GrowthLab is a global startup ecosystem that empowers founders,
              investors, students, and innovators to{' '}
              <span className="font-semibold text-foreground">
                connect, launch, and grow.
              </span>{' '}
            </Text>{' '}
            <Text className="mb-12 text-base font-light lg:text-xl">
              {' '}
              Turn ideas into scalable ventures — faster and smarter. Think of
              us as your{' '}
              <span className="font-semibold text-teal-600">
                &quot;LinkedIn for startups.&quot;
              </span>{' '}
            </Text>{' '}
          </div>{' '}
          {/* CTAs */}{' '}
          <div className="mb-24 flex flex-col items-center gap-6 sm:flex-row sm:justify-center">
            {' '}
            <Link href="/signin" className="w-full sm:w-auto">
              {' '}
              <Button
                size="xl"
                className="h-16 w-full gap-2 rounded-xl bg-primary px-10 text-lg font-semibold text-primary-foreground shadow-xl transition-all hover:scale-105 hover:bg-primary/80"
              >
                {' '}
                Start Building <PiArrowRight className="h-5 w-5" />{' '}
              </Button>{' '}
            </Link>{' '}
            <Link href="#about" className="w-full sm:w-auto">
              {' '}
              <Button
                variant="outline"
                size="xl"
                className="h-16 w-full rounded-xl border-2 border-gray-200 bg-background/50 px-10 text-lg font-semibold text-gray-900 shadow-lg backdrop-blur-sm transition-all hover:scale-105 hover:bg-gray-50 dark:hover:bg-gray-900/50"
              >
                {' '}
                Learn More{' '}
              </Button>{' '}
            </Link>{' '}
          </div>{' '}
          {/* Quick Stats Bar */}{' '}
          <div className="mx-auto grid w-full max-w-5xl grid-cols-3 gap-4 border-t border-muted pt-12 sm:gap-12 lg:gap-24">
            {' '}
            {[
              { value: '2,500+', label: 'Members' },
              { value: '1,200+', label: 'Startups' },
              { value: '$500M+', label: 'Funding' },
            ].map((stat, i) => (
              <div key={i} className="flex flex-col items-center">
                {' '}
                <span className="text-2xl font-bold text-foreground sm:text-4xl lg:text-5xl">
                  {stat.value}
                </span>{' '}
                <span className="mt-2 text-[10px] font-medium uppercase tracking-[0.2em] text-gray-500 sm:text-xs">
                  {stat.label}
                </span>{' '}
              </div>
            ))}{' '}
          </div>{' '}
        </motion.div>{' '}
        {/* Scroll Indicator */}{' '}
        <div className="mt-20 flex flex-col items-center gap-4 text-gray-400">
          {' '}
          <span className="text-[10px] font-bold uppercase tracking-[0.3em]">
            Scroll to explore
          </span>{' '}
          <div className="flex h-12 w-6 justify-center rounded-full border-2 border-gray-200 p-1">
            {' '}
            <motion.div
              animate={{ y: [0, 20, 0] }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
              className="h-2 w-1.5 rounded-full bg-teal-600"
            />{' '}
          </div>{' '}
        </div>{' '}
      </div>{' '}
    </section>
  );
}
