'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Badge, Tab, Title, Text } from 'rizzui';
import cn from '@/utils/class-names';
import {
  PiRocketBold,
  PiUsersBold,
  PiCurrencyDollarBold,
  PiBuildingsBold,
  PiGlobeBold,
  PiBookOpenBold,
  PiCodeBold,
  PiShieldBold,
  PiChartBarBold,
  PiTrophyBold,
  PiStarBold,
  PiCalendarBlankBold,
  PiClockBold,
  PiCheckCircleBold,
  PiCaretDownBold,
  PiCaretUpBold,
  PiArrowRightBold,
  PiDownloadBold,
  PiFileTextBold,
  PiPhoneBold,
  PiMagnifyingGlassBold,
  PiHandshakeBold,
  PiGraduationCapBold,
  PiLightbulbBold,
  PiNetworkBold,
  PiTargetBold,
} from 'react-icons/pi';

/* ------------------------------------------------------------------ */
/*  DATA                                                              */
/* ------------------------------------------------------------------ */

const phases = [
  {
    id: 1,
    title: 'Discovery & Validation',
    duration: 'Weeks 1-3',
    description:
      'Intensive deep-dive into your market opportunity, customer segments, and business model. We help you validate assumptions and refine your value proposition through structured frameworks and expert guidance.',
    activities: [
      'Market research and competitive analysis',
      'Customer discovery interviews',
      'Business model canvas refinement',
      'Value proposition validation',
      'Initial mentor matching',
    ],
    detailedActivities: [
      {
        title: 'Market Deep Dive',
        description:
          'Comprehensive analysis of your target market, competitive landscape, and growth opportunities',
        duration: '1 week',
        requirements: ['Market data', 'Competitor list', 'Customer segments'],
      },
      {
        title: 'Customer Discovery Sprint',
        description:
          'Structured interviews with potential customers to validate problem-solution fit',
        duration: '1 week',
        requirements: [
          'Interview scripts',
          'Customer contacts',
          'Feedback forms',
        ],
      },
      {
        title: 'Business Model Workshop',
        description:
          'Intensive workshop to refine your business model and revenue strategy',
        duration: '3 days',
        requirements: ['Business plan', 'Financial model', 'Revenue strategy'],
      },
    ],
    stats: {
      workshops: '12+',
      mentorHours: '20+',
      interviews: '50+',
      frameworks: '8',
    },
    timeline: [
      { week: '1', activity: 'Market research and competitive analysis' },
      { week: '2', activity: 'Customer discovery and validation' },
      { week: '3', activity: 'Business model refinement and pitch prep' },
    ],
  },
  {
    id: 2,
    title: 'Product Development',
    duration: 'Weeks 4-6',
    description:
      'Focus on building and iterating your product with technical mentorship. Polish your MVP, gather user feedback, and create a scalable development roadmap.',
    activities: [
      'MVP development and iteration',
      'User experience design',
      'Technical architecture review',
      'Beta testing with target users',
      'Product-market fit assessment',
    ],
    detailedActivities: [
      {
        title: 'Technical Architecture Review',
        description:
          'Expert review of your technology stack and scalability plans',
        duration: '1 week',
        requirements: [
          'Technical documentation',
          'Architecture diagrams',
          'Code repository',
        ],
      },
      {
        title: 'UX/UI Sprint',
        description:
          'Rapid design sprint to optimize user experience and interface',
        duration: '5 days',
        requirements: [
          'User research data',
          'Design mockups',
          'User flow maps',
        ],
      },
      {
        title: 'Beta Launch',
        description:
          'Controlled launch to beta users with structured feedback collection',
        duration: '1 week',
        requirements: [
          'Beta users',
          'Feedback mechanism',
          'Analytics setup',
        ],
      },
    ],
    stats: {
      iterations: '5+',
      betaUsers: '100+',
      features: '15+',
      reviews: '3',
    },
    timeline: [
      { week: '4', activity: 'Technical architecture review and planning' },
      { week: '5', activity: 'MVP iteration and UX optimization' },
      { week: '6', activity: 'Beta testing and feedback integration' },
    ],
  },
  {
    id: 3,
    title: 'Growth & Traction',
    duration: 'Weeks 7-9',
    description:
      'Develop and execute your go-to-market strategy. Focus on customer acquisition, retention metrics, and building sustainable growth channels.',
    activities: [
      'Go-to-market strategy development',
      'Customer acquisition channels',
      'Metrics and analytics setup',
      'Sales process optimization',
      'Partnership development',
    ],
    detailedActivities: [
      {
        title: 'Growth Strategy Workshop',
        description:
          'Develop comprehensive growth strategy with marketing experts',
        duration: '1 week',
        requirements: [
          'Marketing plan',
          'Channel analysis',
          'Budget allocation',
        ],
      },
      {
        title: 'Sales Acceleration',
        description:
          'Optimize sales process with experienced sales mentors',
        duration: '1 week',
        requirements: [
          'Sales pipeline',
          'CRM setup',
          'Sales scripts',
        ],
      },
      {
        title: 'Metrics Dashboard',
        description:
          'Build comprehensive metrics tracking for growth monitoring',
        duration: '3 days',
        requirements: [
          'KPI definitions',
          'Analytics tools',
          'Reporting templates',
        ],
      },
    ],
    stats: {
      channels: '5+',
      customers: '200+',
      growthRate: '30%+',
      partnerships: '10+',
    },
    timeline: [
      { week: '7', activity: 'Go-to-market strategy and channel testing' },
      { week: '8', activity: 'Customer acquisition and sales optimization' },
      { week: '9', activity: 'Metrics analysis and growth acceleration' },
    ],
  },
  {
    id: 4,
    title: 'Fundraising Preparation',
    duration: 'Weeks 10-11',
    description:
      'Prepare for fundraising with pitch deck development, financial modeling, and investor meeting preparation. Get ready for Demo Day and beyond.',
    activities: [
      'Pitch deck development',
      'Financial modeling and projections',
      'Investor meeting preparation',
      'Term sheet education',
      'Demo Day rehearsals',
    ],
    detailedActivities: [
      {
        title: 'Pitch Deck Workshop',
        description:
          'Craft compelling pitch deck with storytelling experts',
        duration: '1 week',
        requirements: ['Story narrative', 'Data visualization', 'Design assets'],
      },
      {
        title: 'Financial Modeling',
        description:
          'Build detailed financial model with experienced CFOs',
        duration: '5 days',
        requirements: ['Revenue data', 'Cost structure', 'Growth projections'],
      },
      {
        title: 'Mock Investor Meetings',
        description:
          'Practice pitch with real investors and get actionable feedback',
        duration: '3 days',
        requirements: ['Pitch deck', 'Financial model', 'Q&A preparation'],
      },
    ],
    stats: {
      investors: '50+',
      pitchSessions: '15+',
      deckIterations: '10+',
      introductions: '30+',
    },
    timeline: [
      { week: '10', activity: 'Pitch deck and financial model development' },
      { week: '11', activity: 'Mock pitches and investor introductions' },
    ],
  },
  {
    id: 5,
    title: 'Demo Day & Alumni',
    duration: 'Week 12 & Beyond',
    description:
      'Showcase your startup at Demo Day to our network of investors and partners. After graduation, join our thriving alumni network with continued support and resources.',
    activities: [
      'Demo Day presentation',
      'Investor meetings and follow-ups',
      'Alumni network onboarding',
      'Continued mentorship access',
      'Follow-on funding opportunities',
    ],
    detailedActivities: [
      {
        title: 'Demo Day',
        description:
          'Present your startup to 200+ investors, partners, and industry leaders',
        duration: '1 day',
        requirements: ['Final pitch', 'Live demo', 'Booth materials'],
      },
      {
        title: 'Investor Follow-up',
        description:
          'Structured follow-up process with interested investors',
        duration: '2 weeks',
        requirements: ['Data room', 'Due diligence docs', 'Follow-up plan'],
      },
      {
        title: 'Alumni Onboarding',
        description:
          'Join the alumni network and access ongoing resources',
        duration: 'Ongoing',
        requirements: ['Alumni profile', 'Network participation', 'Mentorship'],
      },
    ],
    stats: {
      alumni: '200+',
      funding: '$50M+',
      events: 'Monthly',
      partnerships: '50+ active',
    },
    timeline: [
      { month: '1', activity: 'Alumni onboarding and network introduction' },
      { month: '2-6', activity: 'Ongoing mentorship and funding support' },
      {
        month: '6+',
        activity: 'Long-term strategic partnerships and growth',
      },
    ],
  },
];

const keyFeatures = [
  {
    icon: PiUsersBold,
    title: 'Expert Mentorship',
    description:
      'Access to 100+ successful entrepreneurs, investors, and industry experts who have built and scaled companies',
    stats: '20+ hours per startup',
    details: [
      'One-on-one mentoring sessions',
      'Industry-specific expertise',
      'Network introductions',
      'Strategic guidance',
    ],
  },
  {
    icon: PiBuildingsBold,
    title: 'Premium Workspace',
    description:
      "Modern co-working space in the heart of Singapore's business district with all amenities",
    stats: '24/7 access',
    details: [
      'Private meeting rooms',
      'High-speed internet',
      'Coffee and refreshments',
      'Event spaces',
    ],
  },
  {
    icon: PiCurrencyDollarBold,
    title: 'Funding Support',
    description:
      'Direct access to our network of 200+ investors and VCs across Asia-Pacific and Silicon Valley',
    stats: '$50M+ raised by alumni',
    details: [
      'Investor introductions',
      'Pitch deck reviews',
      'Term sheet negotiations',
      'Due diligence support',
    ],
  },
  {
    icon: PiGlobeBold,
    title: 'Global Network',
    description:
      'Connect with startups and partners across Asia-Pacific and beyond through our international network',
    stats: '15+ countries',
    details: [
      'International partnerships',
      'Market expansion support',
      'Cross-border opportunities',
      'Cultural exchange programs',
    ],
  },
  {
    icon: PiBookOpenBold,
    title: 'Educational Resources',
    description:
      'Comprehensive library of startup guides, templates, and tools curated by industry experts',
    stats: '500+ resources',
    details: [
      'Business plan templates',
      'Financial models',
      'Legal document templates',
      'Marketing playbooks',
    ],
  },
  {
    icon: PiNetworkBold,
    title: 'Community Events',
    description:
      'Regular networking events, workshops, and industry meetups to build lasting relationships',
    stats: '50+ events annually',
    details: [
      'Monthly networking events',
      'Industry workshops',
      'Alumni reunions',
      'Investor meetups',
    ],
  },
  {
    icon: PiCodeBold,
    title: 'Technical Support',
    description:
      'Access to technical mentors, development resources, and technology partnerships',
    stats: 'Unlimited support',
    details: [
      'Technical architecture review',
      'Code quality assessment',
      'Technology stack guidance',
      'Development team referrals',
    ],
  },
  {
    icon: PiChartBarBold,
    title: 'Marketing & Sales',
    description:
      'Expert guidance on go-to-market strategy, customer acquisition, and sales optimization',
    stats: '10+ experts',
    details: [
      'Marketing strategy development',
      'Sales process optimization',
      'Customer acquisition tactics',
      'Brand positioning',
    ],
  },
  {
    icon: PiShieldBold,
    title: 'Legal & Compliance',
    description:
      'Access to legal experts for IP protection, contracts, and regulatory compliance',
    stats: '5+ legal partners',
    details: [
      'IP protection strategy',
      'Contract reviews',
      'Regulatory compliance',
      'Legal document templates',
    ],
  },
];

const successMetrics = [
  { metric: 'Startups Accelerated', value: '200+', icon: PiRocketBold },
  { metric: 'Total Funding Raised', value: '$50M+', icon: PiCurrencyDollarBold },
  { metric: 'Jobs Created', value: '1,500+', icon: PiUsersBold },
  { metric: 'Investor Network', value: '200+', icon: PiBuildingsBold },
  { metric: 'Success Rate', value: '85%', icon: PiTrophyBold },
  { metric: 'Alumni Companies', value: '180+', icon: PiStarBold },
];

const testimonials = [
  {
    name: 'Sarah Chen',
    company: 'EcoTech Solutions',
    role: 'Founder & CEO',
    content:
      'GrowthLab transformed our startup completely. The mentorship and network access helped us secure $2M in funding within 6 months of graduating. The program structure and expert guidance were exactly what we needed to scale.',
    image: '\uD83D\uDC69\u200D\uD83D\uDCBC',
    funding: '$2M raised',
    status: 'Series A',
    year: '2023',
    industry: 'CleanTech',
    metrics: '300% growth in 6 months',
  },
  {
    name: 'David Kumar',
    company: 'FinFlow',
    role: 'Co-Founder',
    content:
      'The 12-week program was intense but incredibly valuable. We learned more in those weeks than in our first year of business. The investor connections and mentorship were game-changing for our fintech startup.',
    image: '\uD83D\uDC68\u200D\uD83D\uDCBC',
    funding: '$1.5M raised',
    status: 'Seed Round',
    year: '2023',
    industry: 'FinTech',
    metrics: '500% user growth',
  },
  {
    name: 'Mei Lin',
    company: 'HealthTech Pro',
    role: 'Founder',
    content:
      "GrowthLab's investor network is unmatched. We connected with the right partners who understood our vision and market. The technical mentorship and go-to-market guidance were invaluable.",
    image: '\uD83D\uDC69\u200D\uD83D\uDD2C',
    funding: '$3M raised',
    status: 'Series A',
    year: '2022',
    industry: 'HealthTech',
    metrics: '10x revenue growth',
  },
  {
    name: 'Alex Rodriguez',
    company: 'DataFlow AI',
    role: 'Founder & CTO',
    content:
      'The technical mentorship and product development guidance at GrowthLab were exceptional. We went from MVP to enterprise-ready product in just 12 weeks with their support.',
    image: '\uD83D\uDC68\u200D\uD83D\uDCBB',
    funding: '$4.2M raised',
    status: 'Series A',
    year: '2023',
    industry: 'AI/ML',
    metrics: '50+ enterprise customers',
  },
  {
    name: 'Priya Sharma',
    company: 'EduTech Innovations',
    role: 'Co-Founder',
    content:
      'GrowthLab helped us navigate the complex education market and connect with the right investors. The alumni network continues to provide value even after graduation.',
    image: '\uD83D\uDC69\u200D\uD83C\uDFEB',
    funding: '$2.8M raised',
    status: 'Series A',
    year: '2022',
    industry: 'EdTech',
    metrics: '100K+ students reached',
  },
  {
    name: 'James Wilson',
    company: 'LogiTech Solutions',
    role: 'Founder & CEO',
    content:
      "The program's focus on operational excellence and scaling strategies was exactly what we needed. We've grown from 5 to 50 employees since graduating.",
    image: '\uD83D\uDC68\u200D\uD83D\uDCBC',
    funding: '$5M raised',
    status: 'Series B',
    year: '2021',
    industry: 'Logistics',
    metrics: '10x team growth',
  },
];

const programHighlights = [
  {
    title: 'Weekly Masterclasses',
    description:
      'Expert-led sessions on fundraising, product development, marketing, and scaling',
    icon: PiGraduationCapBold,
    frequency: 'Every Tuesday',
    duration: '3 hours',
    topics: [
      'Fundraising',
      'Product Strategy',
      'Marketing',
      'Operations',
      'Legal',
      'Technology',
    ],
  },
  {
    title: 'Investor Networking',
    description:
      'Monthly events connecting startups with VCs, angels, and strategic investors',
    icon: PiHandshakeBold,
    frequency: 'Monthly',
    duration: '4 hours',
    topics: [
      'Pitch Practice',
      'Investor Meetings',
      'Deal Negotiations',
      'Due Diligence',
    ],
  },
  {
    title: 'Peer Learning',
    description:
      'Collaborative sessions with other cohort members for knowledge sharing and support',
    icon: PiUsersBold,
    frequency: 'Weekly',
    duration: '2 hours',
    topics: [
      'Problem Solving',
      'Best Practices',
      'Resource Sharing',
      'Collaboration',
    ],
  },
  {
    title: 'Demo Day Prep',
    description:
      'Intensive preparation for the culminating Demo Day presentation',
    icon: PiTrophyBold,
    frequency: 'Final 2 weeks',
    duration: '20+ hours',
    topics: ['Pitch Deck', 'Live Demo', 'Q&A Practice', 'Media Training'],
  },
];

const applicationProcess = [
  {
    step: 1,
    title: 'Submit Application',
    description:
      'Complete our comprehensive application form with your business plan and team information',
    duration: '30-45 minutes',
    requirements: [
      'Business plan',
      'Team bios',
      'Financial projections',
      'Market analysis',
    ],
    icon: PiFileTextBold,
  },
  {
    step: 2,
    title: 'Initial Screening',
    description:
      'Our team reviews your application and conducts initial screening calls',
    duration: '1-2 weeks',
    requirements: ['Video interview', 'Pitch deck', 'Demo video'],
    icon: PiPhoneBold,
  },
  {
    step: 3,
    title: 'Due Diligence',
    description:
      'Deep dive into your business model, market opportunity, and competitive landscape',
    duration: '1-2 weeks',
    requirements: [
      'Financial statements',
      'Customer testimonials',
      'Technical documentation',
    ],
    icon: PiMagnifyingGlassBold,
  },
  {
    step: 4,
    title: 'Final Selection',
    description:
      'Panel interview with our selection committee and successful alumni',
    duration: '30 minutes',
    requirements: ['Live pitch', 'Q&A session', 'Reference checks'],
    icon: PiTrophyBold,
  },
];

/* ------------------------------------------------------------------ */
/*  PHASE ICONS MAPPING                                               */
/* ------------------------------------------------------------------ */

const phaseIcons = [
  PiMagnifyingGlassBold,
  PiCodeBold,
  PiChartBarBold,
  PiCurrencyDollarBold,
  PiRocketBold,
];

/* ------------------------------------------------------------------ */
/*  COMPONENT                                                         */
/* ------------------------------------------------------------------ */

export default function WhatHappensLayout() {
  const [expandedPhase, setExpandedPhase] = useState<number | null>(null);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary to-primary/90 py-12 md:py-20">
        <div className="absolute inset-0 bg-black/10" />
        <div className="container relative z-10 mx-auto max-w-7xl px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mx-auto max-w-4xl text-center"
          >
            <Title
              as="h1"
              className="mb-4 text-3xl font-bold leading-tight text-white drop-shadow-lg sm:text-4xl md:mb-6 md:text-6xl"
            >
              What Happens at GrowthLab
            </Title>
            <Text className="mb-6 px-2 text-lg leading-relaxed text-white/90 drop-shadow-md sm:text-xl md:mb-8 md:text-2xl">
              Discover the transformative journey that turns promising startups
              into successful, scalable companies
            </Text>
            <div className="flex flex-col justify-center gap-3 px-4 sm:flex-row md:gap-4">
              <button
                onClick={() =>
                  document
                    .getElementById('phases')
                    ?.scrollIntoView({ behavior: 'smooth' })
                }
                className="flex w-full items-center justify-center rounded-lg bg-[#F59E0B] px-6 py-3 text-base font-bold text-white shadow-2xl transition-all duration-300 hover:scale-105 hover:bg-[#F59E0B]/90 sm:w-auto md:px-8 md:py-4 md:text-lg"
              >
                <PiRocketBold className="mr-2 h-4 w-4 md:mr-3 md:h-5 md:w-5" />
                Explore Our Program
              </button>
              <Link href="/about/apply" className="w-full sm:w-auto">
                <button className="flex w-full items-center justify-center rounded-lg border-2 border-white bg-transparent px-6 py-3 text-base font-bold text-white shadow-xl transition-all duration-300 hover:scale-105 hover:bg-white hover:text-primary md:px-8 md:py-4 md:text-lg">
                  <PiArrowRightBold className="mr-2 h-4 w-4 md:mr-3 md:h-5 md:w-5" />
                  Apply Now
                </button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Tabbed Content */}
      <Tab>
        {/* Tab Navigation */}
        <section className="border-b bg-white py-4 md:py-8">
          <div className="container mx-auto max-w-7xl px-4">
            <Tab.List className="flex flex-wrap justify-center gap-1">
              {['Overview', 'Phases', 'Features', 'Stories', 'Apply', 'Highlights'].map(
                (label) => (
                  <Tab.ListItem
                    key={label}
                    className={({ selected }: { selected: boolean }) =>
                      cn(
                        'rounded-lg px-3 py-2 text-xs font-medium transition-colors sm:px-4 sm:text-sm',
                        selected
                          ? 'bg-primary text-white'
                          : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                      )
                    }
                  >
                    {label}
                  </Tab.ListItem>
                )
              )}
            </Tab.List>
          </div>
        </section>

        {/* Tab Panels */}
        <Tab.Panels className="container mx-auto max-w-7xl px-4 py-12">
          {/* ---- Overview Tab ---- */}
          <Tab.Panel>
            <div className="space-y-12">
              {/* Success Metrics */}
              <section>
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  className="mb-8 text-center md:mb-12"
                >
                  <Title
                    as="h2"
                    className="mb-3 text-2xl font-bold text-primary sm:text-3xl md:mb-4 md:text-4xl"
                  >
                    Our Impact in Numbers
                  </Title>
                  <Text className="mx-auto max-w-2xl px-4 text-base text-gray-600 md:text-lg">
                    GrowthLab has been transforming startups across Asia-Pacific
                    with proven results and measurable success
                  </Text>
                </motion.div>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:gap-6 lg:grid-cols-6">
                  {successMetrics.map((item, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, scale: 0.9 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      viewport={{ once: true }}
                      transition={{ delay: index * 0.1 }}
                      className="group text-center"
                    >
                      <div className="rounded-lg border border-gray-100 bg-gradient-to-br from-gray-50 to-white p-3 shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-xl md:rounded-xl md:p-6">
                        <div className="mb-2 flex justify-center text-primary transition-transform duration-300 group-hover:scale-110 md:mb-3">
                          <item.icon className="h-5 w-5 md:h-6 md:w-6" />
                        </div>
                        <div className="mb-1 text-lg font-bold text-primary md:mb-2 md:text-2xl">
                          {item.value}
                        </div>
                        <div className="text-xs font-medium leading-tight text-gray-600 md:text-sm">
                          {item.metric}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </section>

              {/* Program Overview */}
              <section className="rounded-xl bg-gradient-to-r from-primary/5 to-primary/10 p-4 md:rounded-2xl md:p-8">
                <div className="mb-6 text-center md:mb-8">
                  <Title
                    as="h3"
                    className="mb-3 text-xl font-bold text-primary md:mb-4 md:text-2xl"
                  >
                    Program Overview
                  </Title>
                  <Text className="mx-auto max-w-3xl px-2 text-base text-gray-700 md:text-lg">
                    Our comprehensive 12-week accelerator program is designed to
                    transform promising startups into successful, scalable
                    companies through intensive mentorship, expert guidance, and
                    access to our extensive network.
                  </Text>
                </div>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 md:gap-6">
                  {[
                    {
                      icon: PiCalendarBlankBold,
                      title: '12-Week Program',
                      text: 'Intensive accelerator experience with structured curriculum and milestones',
                    },
                    {
                      icon: PiUsersBold,
                      title: '15-20 Startups',
                      text: 'Carefully selected cohort of high-potential startups per batch',
                    },
                    {
                      icon: PiTrophyBold,
                      title: '85% Success Rate',
                      text: 'Proven track record of helping startups achieve their goals',
                    },
                  ].map((card, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.15 }}
                      className="text-center"
                    >
                      <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-primary text-white md:mb-4 md:h-16 md:w-16">
                        <card.icon className="h-6 w-6 md:h-8 md:w-8" />
                      </div>
                      <h4 className="mb-2 text-base font-semibold md:text-lg">
                        {card.title}
                      </h4>
                      <Text className="text-sm text-gray-600 md:text-base">
                        {card.text}
                      </Text>
                    </motion.div>
                  ))}
                </div>
              </section>
            </div>
          </Tab.Panel>

          {/* ---- Phases Tab ---- */}
          <Tab.Panel>
            <div id="phases" className="space-y-6 md:space-y-8">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="mb-8 text-center md:mb-12"
              >
                <Title
                  as="h2"
                  className="mb-3 text-2xl font-bold text-primary sm:text-3xl md:mb-4 md:text-4xl"
                >
                  Your GrowthLab Journey
                </Title>
                <Text className="mx-auto max-w-3xl px-4 text-base text-gray-600 md:text-lg">
                  From application to alumni success, follow the structured path
                  that has helped hundreds of startups scale
                </Text>
              </motion.div>

              <div className="space-y-4 md:space-y-8">
                {phases.map((phase, index) => {
                  const PhaseIcon = phaseIcons[index];
                  return (
                    <motion.div
                      key={phase.id}
                      initial={{ opacity: 0, y: 30 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: index * 0.1 }}
                      className="overflow-hidden rounded-xl border border-gray-200 shadow-sm transition-all duration-300 hover:shadow-xl"
                    >
                      {/* Phase Header */}
                      <div className="bg-gradient-to-r from-primary to-primary/80 p-4 text-white md:p-6">
                        <div className="flex items-center justify-between">
                          <div className="flex min-w-0 flex-1 items-center gap-3 md:gap-4">
                            <div className="flex-shrink-0 rounded-full bg-white/20 p-2 md:p-3">
                              <PhaseIcon className="h-6 w-6 md:h-8 md:w-8" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <h3 className="text-lg font-bold leading-tight md:text-2xl">
                                {phase.title}
                              </h3>
                              <div className="mt-1 flex items-center gap-2 md:mt-2">
                                <PiClockBold className="h-3 w-3 flex-shrink-0 md:h-4 md:w-4" />
                                <span className="text-sm text-white/90 md:text-base">
                                  {phase.duration}
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="flex flex-shrink-0 items-center gap-2">
                            <Badge className="bg-white px-2 py-1 text-xs font-semibold text-primary md:px-4 md:py-2 md:text-lg">
                              Phase {phase.id}
                            </Badge>
                            <button
                              onClick={() =>
                                setExpandedPhase(
                                  expandedPhase === phase.id
                                    ? null
                                    : phase.id
                                )
                              }
                              className="rounded p-1 text-white hover:bg-white/20 md:p-2"
                            >
                              {expandedPhase === phase.id ? (
                                <PiCaretUpBold className="h-4 w-4" />
                              ) : (
                                <PiCaretDownBold className="h-4 w-4" />
                              )}
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Phase Body */}
                      <div className="p-4 md:p-6">
                        <Text className="mb-4 text-base leading-relaxed text-gray-700 md:mb-6 md:text-lg">
                          {phase.description}
                        </Text>

                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6">
                          <div>
                            <h4 className="mb-2 text-base font-semibold text-primary md:mb-3 md:text-lg">
                              Key Activities
                            </h4>
                            <ul className="space-y-2">
                              {phase.activities.map((activity, idx) => (
                                <li
                                  key={idx}
                                  className="flex items-start gap-2 text-sm text-gray-700 md:text-base"
                                >
                                  <PiCheckCircleBold className="mt-0.5 h-3 w-3 flex-shrink-0 text-green-500 md:h-4 md:w-4" />
                                  <span className="leading-relaxed">
                                    {activity}
                                  </span>
                                </li>
                              ))}
                            </ul>
                          </div>

                          <div>
                            <h4 className="mb-2 text-base font-semibold text-primary md:mb-3 md:text-lg">
                              Program Stats
                            </h4>
                            <div className="space-y-2 md:space-y-3">
                              {Object.entries(phase.stats).map(
                                ([key, value]) => (
                                  <div
                                    key={key}
                                    className="flex items-center justify-between rounded-lg bg-gray-50 p-2 md:p-3"
                                  >
                                    <span className="text-xs capitalize text-gray-600 md:text-sm">
                                      {key
                                        .replace(/([A-Z])/g, ' $1')
                                        .trim()}
                                    </span>
                                    <span className="text-sm font-semibold text-primary md:text-base">
                                      {value}
                                    </span>
                                  </div>
                                )
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Expanded Detail */}
                        {expandedPhase === phase.id && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            className="mt-4 border-t pt-4 md:mt-6 md:pt-6"
                          >
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6">
                              <div>
                                <h4 className="mb-2 text-base font-semibold text-primary md:mb-3 md:text-lg">
                                  Detailed Activities
                                </h4>
                                <div className="space-y-3 md:space-y-4">
                                  {phase.detailedActivities.map(
                                    (activity, idx) => (
                                      <div
                                        key={idx}
                                        className="rounded-lg border p-3 md:p-4"
                                      >
                                        <div className="mb-2 flex items-center justify-between">
                                          <h5 className="text-sm font-medium md:text-base">
                                            {activity.title}
                                          </h5>
                                          <Badge
                                            variant="outline"
                                            className="text-xs"
                                          >
                                            {activity.duration}
                                          </Badge>
                                        </div>
                                        <Text className="mb-2 text-xs leading-relaxed text-gray-600 md:text-sm">
                                          {activity.description}
                                        </Text>
                                        <div className="flex flex-wrap gap-1">
                                          {activity.requirements.map(
                                            (req, reqIdx) => (
                                              <Badge
                                                key={reqIdx}
                                                variant="flat"
                                                className="text-xs"
                                              >
                                                {req}
                                              </Badge>
                                            )
                                          )}
                                        </div>
                                      </div>
                                    )
                                  )}
                                </div>
                              </div>

                              <div>
                                <h4 className="mb-2 text-base font-semibold text-primary md:mb-3 md:text-lg">
                                  Timeline
                                </h4>
                                <div className="space-y-2 md:space-y-3">
                                  {phase.timeline.map((item, idx) => (
                                    <div
                                      key={idx}
                                      className="flex items-center gap-2 rounded-lg bg-gray-50 p-2 md:gap-3 md:p-3"
                                    >
                                      <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-white md:h-8 md:w-8 md:text-sm">
                                        {idx + 1}
                                      </div>
                                      <div className="min-w-0 flex-1">
                                        <div className="text-xs font-medium leading-tight text-gray-900 md:text-sm">
                                          {item.activity}
                                        </div>
                                        <div className="text-xs text-gray-500">
                                          {(item as any).week
                                            ? `Week ${(item as any).week}`
                                            : `Month ${(item as any).month}`}
                                        </div>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </Tab.Panel>

          {/* ---- Features Tab ---- */}
          <Tab.Panel>
            <div className="space-y-6 md:space-y-8">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="mb-8 text-center md:mb-12"
              >
                <Title
                  as="h2"
                  className="mb-3 text-2xl font-bold text-primary sm:text-3xl md:mb-4 md:text-4xl"
                >
                  What You Get at GrowthLab
                </Title>
                <Text className="mx-auto max-w-3xl px-4 text-base text-gray-600 md:text-lg">
                  Comprehensive support and resources designed to accelerate
                  your startup&apos;s growth and success
                </Text>
              </motion.div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-6 lg:grid-cols-3">
                {keyFeatures.map((feature, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.08 }}
                    className="rounded-xl border border-gray-200 border-l-4 border-l-primary bg-white p-4 shadow-sm transition-all duration-300 hover:scale-105 hover:shadow-xl md:p-6"
                  >
                    <div className="mb-3 text-primary md:mb-4">
                      <feature.icon className="h-6 w-6 md:h-8 md:w-8" />
                    </div>
                    <h3 className="mb-2 text-lg font-semibold text-gray-900 md:mb-3 md:text-xl">
                      {feature.title}
                    </h3>
                    <Text className="mb-3 text-sm leading-relaxed text-gray-600 md:mb-4 md:text-base">
                      {feature.description}
                    </Text>
                    <div className="mb-3 rounded-lg bg-primary/10 px-2 py-1 text-xs font-semibold text-primary md:mb-4 md:px-3 md:py-2 md:text-sm">
                      {feature.stats}
                    </div>
                    <div className="space-y-1 md:space-y-2">
                      {feature.details.map((detail, idx) => (
                        <div
                          key={idx}
                          className="flex items-center gap-2 text-xs text-gray-600 md:text-sm"
                        >
                          <PiCheckCircleBold className="h-3 w-3 flex-shrink-0 text-green-500" />
                          <span className="leading-relaxed">{detail}</span>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </Tab.Panel>

          {/* ---- Stories Tab ---- */}
          <Tab.Panel>
            <div className="space-y-6 md:space-y-8">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="mb-8 text-center md:mb-12"
              >
                <Title
                  as="h2"
                  className="mb-3 text-2xl font-bold text-primary sm:text-3xl md:mb-4 md:text-4xl"
                >
                  Success Stories
                </Title>
                <Text className="mx-auto max-w-3xl px-4 text-base text-gray-600 md:text-lg">
                  Hear from our alumni about their GrowthLab experience and the
                  impact it had on their startups
                </Text>
              </motion.div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-3">
                {testimonials.map((testimonial, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                    className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm transition-all duration-300 hover:scale-105 hover:shadow-xl md:p-6"
                  >
                    <div className="mb-3 flex items-center gap-3 md:mb-4 md:gap-4">
                      <div className="relative flex-shrink-0">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 text-lg md:h-[60px] md:w-[60px] md:text-2xl">
                          {testimonial.image}
                        </div>
                        <div className="absolute -right-1 -top-1 rounded-full bg-primary p-1 text-white">
                          <PiCheckCircleBold className="h-2 w-2 md:h-3 md:w-3" />
                        </div>
                      </div>
                      <div className="min-w-0 flex-1">
                        <h4 className="text-sm font-semibold text-gray-900 md:text-base">
                          {testimonial.name}
                        </h4>
                        <Text className="text-xs text-gray-600 md:text-sm">
                          {testimonial.company}
                        </Text>
                        <Text className="text-xs text-gray-500">
                          {testimonial.role}
                        </Text>
                      </div>
                    </div>

                    <p className="mb-3 text-sm italic leading-relaxed text-gray-700 md:mb-4 md:text-base">
                      &ldquo;{testimonial.content}&rdquo;
                    </p>

                    <div className="mb-3 space-y-2 md:mb-4">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <Badge className="bg-green-100 text-xs text-green-800">
                          {testimonial.funding}
                        </Badge>
                        <Badge
                          variant="outline"
                          className="border-primary text-xs text-primary"
                        >
                          {testimonial.status}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between text-xs text-gray-500 md:text-sm">
                        <span>{testimonial.industry}</span>
                        <span>{testimonial.year}</span>
                      </div>
                      <div className="text-xs font-medium text-primary md:text-sm">
                        {testimonial.metrics}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </Tab.Panel>

          {/* ---- Apply Tab ---- */}
          <Tab.Panel>
            <div className="space-y-6 md:space-y-8">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="mb-8 text-center md:mb-12"
              >
                <Title
                  as="h2"
                  className="mb-3 text-2xl font-bold text-primary sm:text-3xl md:mb-4 md:text-4xl"
                >
                  Application Process
                </Title>
                <Text className="mx-auto max-w-3xl px-4 text-base text-gray-600 md:text-lg">
                  Our streamlined application process is designed to identify the
                  most promising startups while being efficient for applicants
                </Text>
              </motion.div>

              <div className="space-y-4 md:space-y-8">
                {applicationProcess.map((step, index) => (
                  <motion.div
                    key={step.step}
                    initial={{ opacity: 0, x: -30 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.15 }}
                    className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm transition-all duration-300 hover:shadow-xl md:p-6"
                  >
                    <div className="flex items-start gap-4 md:gap-6">
                      <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-white md:h-12 md:w-12 md:text-lg">
                        {step.step}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="mb-2 flex flex-wrap items-center justify-between gap-2 md:mb-3">
                          <h3 className="text-lg font-semibold text-gray-900 md:text-xl">
                            {step.title}
                          </h3>
                          <Badge
                            variant="outline"
                            className="border-primary text-xs text-primary"
                          >
                            {step.duration}
                          </Badge>
                        </div>
                        <Text className="mb-3 text-sm leading-relaxed text-gray-600 md:mb-4 md:text-base">
                          {step.description}
                        </Text>
                        <div>
                          <h4 className="mb-2 text-sm font-medium text-gray-900 md:text-base">
                            Requirements:
                          </h4>
                          <div className="flex flex-wrap gap-1 md:gap-2">
                            {step.requirements.map((req, idx) => (
                              <Badge
                                key={idx}
                                variant="flat"
                                className="text-xs"
                              >
                                {req}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                      <div className="flex-shrink-0 text-primary">
                        <step.icon className="h-6 w-6 md:h-8 md:w-8" />
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="rounded-xl bg-gradient-to-r from-primary/5 to-primary/10 p-4 text-center md:rounded-2xl md:p-8"
              >
                <Title
                  as="h3"
                  className="mb-3 text-xl font-bold text-primary md:mb-4 md:text-2xl"
                >
                  Ready to Apply?
                </Title>
                <Text className="mb-4 px-2 text-base text-gray-700 md:mb-6 md:text-lg">
                  Join the next cohort of innovative founders and take your
                  startup to the next level
                </Text>
                <div className="flex flex-col justify-center gap-3 sm:flex-row md:gap-4">
                  <Link href="/about/apply" className="w-full sm:w-auto">
                    <button className="flex w-full items-center justify-center rounded-lg bg-primary px-6 py-3 text-base font-bold text-white hover:bg-primary/90 md:px-8 md:py-4 md:text-lg">
                      <PiFileTextBold className="mr-2 h-4 w-4 md:mr-3 md:h-5 md:w-5" />
                      Start Application
                    </button>
                  </Link>
                  <button className="flex w-full items-center justify-center rounded-lg border border-primary px-6 py-3 text-base font-bold text-primary hover:bg-primary hover:text-white sm:w-auto md:px-8 md:py-4 md:text-lg">
                    <PiDownloadBold className="mr-2 h-4 w-4 md:mr-3 md:h-5 md:w-5" />
                    Download Guide
                  </button>
                </div>
              </motion.div>
            </div>
          </Tab.Panel>

          {/* ---- Highlights Tab ---- */}
          <Tab.Panel>
            <div className="space-y-6 md:space-y-8">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="mb-8 text-center md:mb-12"
              >
                <Title
                  as="h2"
                  className="mb-3 text-2xl font-bold text-primary sm:text-3xl md:mb-4 md:text-4xl"
                >
                  Program Highlights
                </Title>
                <Text className="mx-auto max-w-3xl px-4 text-base text-gray-600 md:text-lg">
                  Key activities and experiences that make our program unique and
                  effective
                </Text>
              </motion.div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-8">
                {programHighlights.map((highlight, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                    className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm transition-all duration-300 hover:scale-105 hover:shadow-xl md:p-6"
                  >
                    <div className="mb-3 flex items-start gap-3 md:mb-4 md:gap-4">
                      <div className="flex-shrink-0 rounded-lg bg-primary p-2 text-white md:p-3">
                        <highlight.icon className="h-6 w-6 md:h-8 md:w-8" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="mb-2 text-lg font-semibold text-gray-900 md:text-xl">
                          {highlight.title}
                        </h3>
                        <Text className="mb-2 text-sm leading-relaxed text-gray-600 md:mb-3 md:text-base">
                          {highlight.description}
                        </Text>
                        <div className="flex items-center gap-3 text-xs text-gray-500 md:gap-4 md:text-sm">
                          <span className="flex items-center gap-1">
                            <PiCalendarBlankBold className="h-3 w-3 flex-shrink-0 md:h-4 md:w-4" />
                            {highlight.frequency}
                          </span>
                          <span className="flex items-center gap-1">
                            <PiClockBold className="h-3 w-3 flex-shrink-0 md:h-4 md:w-4" />
                            {highlight.duration}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div>
                      <h4 className="mb-2 text-sm font-medium text-gray-900 md:text-base">
                        Topics Covered:
                      </h4>
                      <div className="flex flex-wrap gap-1 md:gap-2">
                        {highlight.topics.map((topic, idx) => (
                          <Badge
                            key={idx}
                            variant="outline"
                            className="text-xs"
                          >
                            {topic}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </Tab.Panel>
        </Tab.Panels>
      </Tab>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-primary to-primary/90 py-12 md:py-20">
        <div className="container mx-auto max-w-7xl px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <Title
              as="h2"
              className="mb-4 text-2xl font-bold leading-tight text-white sm:text-3xl md:mb-6 md:text-4xl"
            >
              Ready to Transform Your Startup?
            </Title>
            <Text className="mx-auto mb-6 max-w-2xl px-2 text-base leading-relaxed text-white/90 sm:text-lg md:mb-8 md:text-xl">
              Join the next cohort of innovative founders and take your startup
              to the next level with GrowthLab
            </Text>
            <div className="flex flex-col justify-center gap-3 px-4 sm:flex-row md:gap-4">
              <Link href="/about/apply" className="w-full sm:w-auto">
                <button className="flex w-full items-center justify-center rounded-lg bg-[#F59E0B] px-6 py-3 text-base font-bold text-white shadow-2xl transition-all duration-300 hover:scale-105 hover:bg-[#F59E0B]/90 md:px-8 md:py-4 md:text-lg">
                  <PiRocketBold className="mr-2 h-4 w-4 md:mr-3 md:h-5 md:w-5" />
                  Apply for Next Cohort
                </button>
              </Link>
              <Link href="/about/people" className="w-full sm:w-auto">
                <button className="flex w-full items-center justify-center rounded-lg border-2 border-white bg-transparent px-6 py-3 text-base font-bold text-white shadow-xl transition-all duration-300 hover:scale-105 hover:bg-white hover:text-primary md:px-8 md:py-4 md:text-lg">
                  <PiUsersBold className="mr-2 h-4 w-4 md:mr-3 md:h-5 md:w-5" />
                  Meet Our Team
                </button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
