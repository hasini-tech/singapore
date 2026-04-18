'use client';

import { motion } from 'framer-motion';
import { Text, Title } from 'rizzui';

import AnimatedCountUp from '@/components/animated-count-up';

export default function Stats() {
  const metrics = [
    {
      value: 2500,
      suffix: '+',
      label: 'Members',
      desc: 'Active entrepreneurs and builders',
    },
    {
      value: 50,
      suffix: '+',
      label: 'Countries',
      desc: 'Global network spanning continents',
    },
    {
      value: 500,
      suffix: '+',
      label: 'Projects',
      desc: 'Innovations in progress',
    },
    {
      value: 200,
      suffix: '+',
      label: 'Investors',
      desc: 'VCs and angel investors',
    },
  ];

  return (
    <section id="stats" className="relative bg-gray-900 py-24 lg:py-32">
      <div className="container mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8">
        <div className="mb-20 grid grid-cols-1 gap-12 text-white lg:grid-cols-12">
          <div className="lg:col-span-2">
            <span className="text-7xl font-bold text-white/10 dark:text-gray-50/10 lg:text-9xl">
              07
            </span>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="lg:col-span-10"
          >
            <Title
              as="h2"
              className="mb-6 text-4xl font-bold text-white dark:text-gray-100 lg:text-7xl"
            >
              GrowthLab in Numbers
            </Title>
            <Text className="text-xl font-light text-gray-400 lg:text-3xl">
              Real-time metrics from our global community
            </Text>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
          {metrics.map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.6 }}
              whileHover={{ y: -10, scale: 1.05 }}
              className="flex flex-col items-center justify-center rounded-2xl border border-primary/10 bg-background/5 p-10 text-center shadow-lg backdrop-blur-sm transition-all duration-500 hover:shadow-2xl"
            >
              <Title
                as="h3"
                className="mb-2 text-5xl font-extrabold text-background dark:text-background"
              >
                <AnimatedCountUp
                  end={stat.value}
                  duration={10}
                  separator=","
                  suffix={stat.suffix}
                  enableScrollSpy
                  scrollSpyOnce
                />
              </Title>
              <Text className="mb-2 font-bold uppercase tracking-widest text-primary">
                {stat.label}
              </Text>
              <Text className="text-sm font-light text-gray-400">
                {stat.desc}
              </Text>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
