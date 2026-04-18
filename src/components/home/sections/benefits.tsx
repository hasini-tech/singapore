'use client';

import { motion } from 'framer-motion';
import {
  PiBriefcase,
  PiCheckCircleFill,
  PiCurrencyDollar,
  PiGlobe,
  PiGraduationCap,
  PiNetwork,
  PiRocketLaunch,
} from 'react-icons/pi';
import { Text, Title } from 'rizzui';

const benefits = [
  {
    icon: PiNetwork,
    title: 'Professional Networking',
    description:
      'Connect with founders, investors, students, and innovators worldwide. Build meaningful relationships through our LinkedIn-style platform with AI-powered matching.',
    details: 'Global network, AI matching, industry groups, virtual meetups',
    color: 'blue',
  },
  {
    icon: PiGraduationCap,
    title: 'Education & Mentorship',
    description:
      'Access exclusive talks, workshops, and mentorship programs from industry leaders. Learn best practices and gain insights to accelerate your growth.',
    details: 'Expert talks, workshops, 1:1 mentorship, knowledge base',
    color: 'secondary',
  },
  {
    icon: PiCurrencyDollar,
    title: 'Funding Opportunities',
    description:
      'Connect with angel investors, VCs, and grant programs. Our platform facilitates funding rounds and helps you find the right financial partners for your growth.',
    details: 'Investor network, grant programs, pitch events, funding tools',
    color: 'green',
  },
  {
    icon: PiRocketLaunch,
    title: 'Startup Resources',
    description:
      'Access comprehensive startup resources including business templates, legal guides, marketing tools, and more.',
    details: 'Resource library, templates, guides, tools',
    color: 'orange',
  },
  {
    icon: PiGlobe,
    title: 'AI-Driven Tools',
    description:
      'Leverage AI-powered tools for market analysis, business plan generation, investor matching, and personalized growth recommendations.',
    details: 'AI market analysis, business plan builder, investor matching',
    color: 'primary',
  },
  {
    icon: PiBriefcase,
    title: 'Talent & Jobs',
    description:
      'Find top talent for your startup or discover new opportunities within the GrowthLab ecosystem. Post jobs, find co-founders, and build your dream team.',
    details: 'Job board, co-founder matching, talent pool, hiring resources',
    color: 'indigo',
  },
];

const businessInBox = [
  {
    name: 'Company Setup & Corp-Sec',
    desc: 'Incorporation, corporate secretarial services, business registration.',
  },
  {
    name: 'Compliance & Filings',
    desc: 'ACRA/IRAS filings, annual returns, regulatory compliance.',
  },
  {
    name: 'Accounting & Tax',
    desc: 'Bookkeeping, tax planning, financial reporting.',
  },
  {
    name: 'Banking & Payments',
    desc: 'Business account setup, multi-currency accounts, payment solutions.',
  },
  {
    name: 'HR & Legal Support',
    desc: 'Staff augmentation, payroll, work pass applications, legal consultation.',
  },
  {
    name: 'Intellectual Property',
    desc: 'Trademark registration, patent filing, IP protection.',
  },
  {
    name: 'Marketing & Growth',
    desc: 'Digital marketing, brand strategy, content creation.',
  },
  {
    name: 'Tech & Development',
    desc: 'Software development, cloud infrastructure, cybersecurity.',
  },
  {
    name: 'Virtual Office & Admin',
    desc: 'Virtual address, administrative support, mail handling.',
  },
];

export default function Benefits() {
  return (
    <section
      id="benefits"
      className="relative overflow-hidden bg-gray-900 py-24 lg:py-32 xl:py-40"
    >
      <div className="absolute inset-0 pointer-events-none">
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage:
              'radial-gradient(rgba(255,255,255,0.08) 1px, transparent 1px)',
            backgroundSize: '32px 32px',
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-br from-gray-950 via-gray-900 to-primary/20" />
        <div className="absolute -left-24 top-20 h-80 w-80 rounded-full bg-primary/15 blur-[120px]" />
        <div className="absolute bottom-0 right-0 h-[32rem] w-[32rem] rounded-full bg-cyan-500/10 blur-[160px]" />
      </div>

      <div className="relative z-10 container mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8">
        <div className="mb-24 grid grid-cols-1 gap-12 lg:grid-cols-12">
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="lg:col-span-2"
          >
            <span className="text-7xl font-bold text-gray-800 lg:text-9xl">
              09
            </span>
            <div className="mt-2 h-1.5 w-20 rounded-full bg-gradient-to-r from-primary to-secondary md:w-40" />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="lg:col-span-10"
          >
            <Title
              as="h2"
              className="mb-6 text-4xl font-bold leading-none tracking-tight text-background dark:text-background lg:text-7xl"
            >
              Your GrowthLab Advantage
            </Title>
            <Text className="text-xl font-light text-gray-400 lg:text-3xl">
              Empowering founders, investors, and innovators to launch and scale
              faster.
            </Text>
          </motion.div>
        </div>

        <div className="mb-32 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
          {benefits.map((benefit, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{
                duration: 0.8,
                delay: i * 0.1,
                ease: [0.21, 0.45, 0.32, 0.9],
              }}
              whileHover={{ y: -10, scale: 1.02 }}
              className="group relative rounded-[40px] border border-gray-800 bg-gray-900/50 p-10 shadow-2xl transition-all duration-300 hover:border-primary/50"
            >
              <div className="mb-8 flex h-16 w-16 items-center justify-center rounded-2xl bg-background/5 transition-colors group-hover:bg-primary dark:bg-primary-lighter">
                <benefit.icon className="h-8 w-8 text-primary transition-colors group-hover:text-white" />
              </div>
              <Title
                as="h3"
                className="mb-4 text-2xl font-bold text-background transition-colors group-hover:text-primary dark:text-background"
              >
                {benefit.title}
              </Title>
              <Text className="mb-6 font-light leading-relaxed text-gray-400">
                {benefit.description}
              </Text>
              <div className="mt-auto flex flex-col gap-2 border-t border-gray-800 pt-6">
                <span className="text-xs font-bold uppercase tracking-widest text-primary">
                  Includes
                </span>
                <Text className="text-sm italic text-gray-500">
                  {benefit.details}
                </Text>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="rounded-[60px] border border-gray-700 bg-gradient-to-br from-gray-800 to-gray-900 p-12 shadow-3xl lg:p-20"
        >
          <div className="mb-16 text-center">
            <Title
              as="h3"
              className="mb-6 text-4xl font-bold text-background dark:text-background lg:text-6xl"
            >
              Business in a Box
            </Title>
            <Text className="mx-auto max-w-3xl text-xl font-light text-gray-400 lg:text-2xl">
              Everything you need from incorporation to tech infrastructure, all
              in one place.
            </Text>
          </div>

          <div className="grid grid-cols-1 gap-x-12 gap-y-10 md:grid-cols-2 lg:grid-cols-3">
            {businessInBox.map((service, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                whileHover={{
                  scale: 1.05,
                  boxShadow: '0 0 20px rgba(0, 0, 0, 0.2)',
                }}
                className="flex items-start gap-4 rounded-lg border p-4 shadow group"
              >
                <div className="mt-1 flex-shrink-0">
                  <PiCheckCircleFill className="h-6 w-6 text-primary transition-transform group-hover:scale-125" />
                </div>
                <div>
                  <Title
                    as="h4"
                    className="mb-2 text-xl font-bold text-background dark:text-background"
                  >
                    {service.name}
                  </Title>
                  <Text className="text-sm font-light leading-snug text-gray-500">
                    {service.desc}
                  </Text>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
