'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Badge, Collapse, Input, Title, Text } from 'rizzui';
import cn from '@/utils/class-names';
import {
  PiCalendarBlankBold,
  PiMapPinBold,
  PiTrendUpBold,
  PiTargetBold,
  PiUsersBold,
  PiFileTextBold,
  PiTrophyBold,
  PiCurrencyDollarBold,
  PiBuildingsBold,
  PiRocketBold,
  PiBookOpenBold,
  PiGlobeBold,
  PiCodeBold,
  PiLightbulbBold,
  PiShieldBold,
  PiLightningBold,
  PiHeartBold,
  PiQuestionBold,
  PiMagnifyingGlassBold,
  PiXBold,
  PiCaretDownBold,
  PiStarFill,
  PiStarBold,
  PiArrowRightBold,
  PiDownloadBold,
  PiEnvelopeSimpleBold,
  PiPhoneBold,
  PiChatCircleBold,
  PiPlusBold,
  PiMinusBold,
} from 'react-icons/pi';
import type { IconType } from 'react-icons';

interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: string;
  icon: IconType;
  tags?: string[];
}

const faqData: FAQItem[] = [
  // Application & Selection
  {
    id: 'apply-timing',
    question: 'When can I apply to GrowthLab?',
    answer:
      'We run two cohorts per year with applications opening in January and July. The next application deadline is July 15, 2025, for our September 2025 cohort. Check our website for specific dates and deadlines. We also accept applications on a rolling basis for exceptional startups outside our regular cycles.',
    category: 'Application & Selection',
    icon: PiCalendarBlankBold,
    tags: ['timing', 'deadlines', 'cohorts'],
  },
  {
    id: 'singapore-based',
    question: 'Do I need to be based in Singapore to apply?',
    answer:
      'While we prefer startups based in Singapore or willing to relocate, we accept remote participants in exceptional cases. However, we strongly encourage at least one founder to be present in Singapore during key program activities for maximum benefit. We provide visa support and relocation assistance for international founders.',
    category: 'Application & Selection',
    icon: PiMapPinBold,
    tags: ['location', 'relocation', 'visa'],
  },
  {
    id: 'startup-stage',
    question: 'What stage startups do you accept?',
    answer:
      'We primarily work with early-stage startups from pre-seed to Series A. Ideally, you should have at least an MVP and some early traction or validation. We occasionally accept exceptional pre-MVP teams with strong technical founders and compelling visions. We look for startups with clear product-market fit potential.',
    category: 'Application & Selection',
    icon: PiTrendUpBold,
    tags: ['stage', 'mvp', 'traction'],
  },
  {
    id: 'industries-focus',
    question: 'What industries do you focus on?',
    answer:
      'While we\'re industry-agnostic, we have particular expertise in fintech, healthtech, edtech, enterprise SaaS, sustainability, and deep tech. We look for startups with scalable business models and potential for regional or global impact. Our mentors have deep experience across these verticals.',
    category: 'Application & Selection',
    icon: PiTargetBold,
    tags: ['industries', 'verticals', 'expertise'],
  },
  {
    id: 'cohort-size',
    question: 'How many startups do you accept per cohort?',
    answer:
      'We typically select 10-12 startups per cohort to ensure we can provide hands-on support and personalized attention to each company. This allows for meaningful peer learning and focused mentorship. The small cohort size enables deep relationships and collaborative learning.',
    category: 'Application & Selection',
    icon: PiUsersBold,
    tags: ['cohort', 'size', 'support'],
  },
  {
    id: 'application-process',
    question: 'What is the application process like?',
    answer:
      'Our application process includes: 1) Online application form with business details, 2) Initial screening call (30 minutes), 3) Final interview with partners (60 minutes), 4) Reference checks, 5) Decision within 1-2 weeks. The entire process takes 2-3 weeks from application to decision.',
    category: 'Application & Selection',
    icon: PiFileTextBold,
    tags: ['process', 'timeline', 'interviews'],
  },
  // Program Details
  {
    id: 'what-provided',
    question: 'What does GrowthLab provide?',
    answer:
      'GrowthLab provides SGD 500K in funding, a 6-month intensive program, mentorship from 100+ experienced entrepreneurs and industry experts, premium co-working space, technical resources, legal and accounting support, and connections to investors and corporate partners across Asia. We also provide access to our alumni network and ongoing support post-program.',
    category: 'Program Details',
    icon: PiTrophyBold,
    tags: ['funding', 'mentorship', 'resources'],
  },
  {
    id: 'equity-stake',
    question: 'What equity stake does GrowthLab take?',
    answer:
      'In exchange for our investment and program, we typically take 6-8% equity in your company. The exact percentage depends on your startup\'s stage, traction, and valuation. We use a SAFE agreement for straightforward investment terms. Our goal is to be fair and aligned with your success.',
    category: 'Program Details',
    icon: PiCurrencyDollarBold,
    tags: ['equity', 'investment', 'safe'],
  },
  {
    id: 'program-structure',
    question: 'How is the program structured?',
    answer:
      'The program runs for 6 months and includes weekly workshops, one-on-one mentoring sessions, peer learning opportunities, networking events, and investor meetings. The program culminates in Demo Day, where startups present to investors and partners. We also provide milestone-based support and regular check-ins.',
    category: 'Program Details',
    icon: PiBuildingsBold,
    tags: ['structure', 'workshops', 'demo-day'],
  },
  {
    id: 'full-time-commitment',
    question: 'Do I need to work full-time on my startup during the program?',
    answer:
      'Yes, we expect all founders to be committed full-time to their startups during the program. The accelerator is intensive and requires your complete focus to maximize the benefits and achieve the milestones we set together. Part-time participation is not allowed as it limits the program\'s effectiveness.',
    category: 'Program Details',
    icon: PiCalendarBlankBold,
    tags: ['commitment', 'full-time', 'intensive'],
  },
  {
    id: 'post-demo-day',
    question: 'What happens after Demo Day?',
    answer:
      'After Demo Day, you become part of our alumni network with ongoing access to mentors, investors, and resources. We continue supporting your fundraising efforts and provide guidance as you scale. Many startups raise their next funding round within 6 months. We maintain long-term relationships with our portfolio companies.',
    category: 'Program Details',
    icon: PiRocketBold,
    tags: ['alumni', 'ongoing-support', 'fundraising'],
  },
  {
    id: 'workshop-topics',
    question: 'What topics are covered in workshops?',
    answer:
      'Our workshops cover: Product development and design, Go-to-market strategy, Fundraising and investor relations, Financial modeling and unit economics, Legal and IP protection, Team building and culture, Marketing and growth hacking, International expansion, and Leadership development. Each workshop is hands-on and practical.',
    category: 'Program Details',
    icon: PiBookOpenBold,
    tags: ['workshops', 'topics', 'learning'],
  },
  // Funding & Support
  {
    id: 'investment-structure',
    question: 'How is the investment structured?',
    answer:
      'Our investment is structured as a SAFE (Simple Agreement for Future Equity) with a valuation cap. This allows for a straightforward investment process without immediately setting a valuation, providing flexibility for both parties. We also offer convertible notes for more established startups.',
    category: 'Funding & Support',
    icon: PiCurrencyDollarBold,
    tags: ['safe', 'investment', 'structure'],
  },
  {
    id: 'follow-on-funding',
    question: 'Do you provide follow-on funding?',
    answer:
      'Yes, we have a dedicated follow-on fund to invest in our most promising portfolio companies as they raise subsequent rounds. Approximately 40% of our startups receive follow-on funding from GrowthLab, demonstrating our long-term commitment. We typically invest 2-5x our initial investment in follow-on rounds.',
    category: 'Funding & Support',
    icon: PiTrendUpBold,
    tags: ['follow-on', 'funding', 'commitment'],
  },
  {
    id: 'mentorship-expectations',
    question: 'What kind of mentorship can I expect?',
    answer:
      'You\'ll be matched with 3-5 mentors based on your specific needs and industry. These include successful entrepreneurs, industry experts, and functional specialists in areas like product, marketing, sales, and fundraising. Each mentor commits to regular sessions throughout the program. We also provide access to our entire mentor network.',
    category: 'Funding & Support',
    icon: PiUsersBold,
    tags: ['mentorship', 'matching', 'expertise'],
  },
  {
    id: 'visa-incorporation',
    question: 'Can you help with visa and incorporation issues?',
    answer:
      'Yes, we provide comprehensive support for international founders to obtain appropriate visas for Singapore. We also offer guidance on incorporation and connect you with legal partners who provide discounted services to our startups. Our team has extensive experience with immigration and business setup processes.',
    category: 'Funding & Support',
    icon: PiGlobeBold,
    tags: ['visa', 'incorporation', 'legal'],
  },
  {
    id: 'technical-support',
    question: 'What technical support do you provide?',
    answer:
      'We provide access to cloud credits (AWS, Google Cloud, Azure), development tools and software licenses, technical mentorship from CTOs and senior engineers, code reviews and architecture guidance, and connections to technical talent. We also offer workshops on technical best practices and scaling.',
    category: 'Funding & Support',
    icon: PiCodeBold,
    tags: ['technical', 'cloud', 'development'],
  },
  // Success & Results
  {
    id: 'success-rate',
    question: 'What is your success rate?',
    answer:
      'Over 95% of our startups are still operating and growing three years after the program. More than 70% have raised additional funding, with our portfolio companies collectively raising over $2 billion to date. Our alumni network spans across Asia and beyond, with companies in 15+ countries.',
    category: 'Success & Results',
    icon: PiTrophyBold,
    tags: ['success', 'rate', 'fundraising'],
  },
  {
    id: 'differentiation',
    question: 'How is GrowthLab different from other accelerators?',
    answer:
      'GrowthLab differentiates itself through our deep Southeast Asian market expertise, hands-on approach with a high mentor-to-startup ratio, strong corporate partnerships for pilot opportunities, and dedicated support for regional expansion. Our network is particularly strong in Singapore, Indonesia, Vietnam, and Thailand.',
    category: 'Success & Results',
    icon: PiLightbulbBold,
    tags: ['differentiation', 'expertise', 'network'],
  },
  {
    id: 'reapply-policy',
    question: 'Can I apply if I\'ve been rejected before?',
    answer:
      'Absolutely! Many successful GrowthLab startups applied multiple times before being accepted. We encourage you to reapply if you\'ve made significant progress since your last application. We value persistence, growth, and the ability to learn from feedback. Each application is evaluated independently.',
    category: 'Success & Results',
    icon: PiLightningBold,
    tags: ['reapply', 'persistence', 'growth'],
  },
  {
    id: 'nda-policy',
    question: 'Do you sign NDAs before application review?',
    answer:
      'We don\'t sign NDAs during the application process due to the volume of applications we receive and potential for overlap in ideas. However, we treat all application information as confidential and our team adheres to strict ethical standards and data protection policies. We have never had any issues with confidentiality.',
    category: 'Success & Results',
    icon: PiShieldBold,
    tags: ['nda', 'confidentiality', 'ethics'],
  },
  {
    id: 'alumni-network',
    question: 'What benefits do I get from the alumni network?',
    answer:
      'Our alumni network provides ongoing access to mentors, investors, and fellow entrepreneurs. You\'ll get priority access to our events, workshops, and resources. Alumni often collaborate on projects, share opportunities, and provide mutual support. We also facilitate introductions between alumni and new portfolio companies.',
    category: 'Success & Results',
    icon: PiHeartBold,
    tags: ['alumni', 'network', 'collaboration'],
  },
];

const categories = [
  'Application & Selection',
  'Program Details',
  'Funding & Support',
  'Success & Results',
];

const popularQuestions = [
  'When can I apply to GrowthLab?',
  'What does GrowthLab provide?',
  'What equity stake does GrowthLab take?',
  'What is your success rate?',
  'Do I need to be based in Singapore to apply?',
];

function getCategoryColor(category: string) {
  switch (category) {
    case 'Application & Selection':
      return 'bg-blue-50 text-blue-700 border-blue-200';
    case 'Program Details':
      return 'bg-green-50 text-green-700 border-green-200';
    case 'Funding & Support':
      return 'bg-purple-50 text-purple-700 border-purple-200';
    case 'Success & Results':
      return 'bg-orange-50 text-orange-700 border-orange-200';
    default:
      return 'bg-gray-50 text-gray-700 border-gray-200';
  }
}

export default function FAQLayout() {
  const [openItems, setOpenItems] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [showAll, setShowAll] = useState(false);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());

  const toggleItem = (id: string) => {
    setOpenItems((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const toggleFavorite = (id: string) => {
    setFavorites((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const filteredFAQs = faqData.filter((faq) => {
    const matchesSearch =
      faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      !selectedCategory || faq.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const displayedFAQs = showAll ? filteredFAQs : filteredFAQs.slice(0, 8);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-r from-primary to-primary/90 text-white">
        <div className="absolute inset-0 bg-black/10" />
        <div className="container relative z-10 mx-auto px-4 py-12 sm:py-16 md:py-20">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mx-auto max-w-5xl text-center"
          >
            <div className="mb-4 flex justify-center sm:mb-6">
              <div className="animate-pulse rounded-full bg-white/20 p-3 sm:p-4">
                <PiQuestionBold className="h-8 w-8 text-white sm:h-12 sm:w-12" />
              </div>
            </div>
            <Title
              as="h1"
              className="mb-4 text-3xl font-bold leading-tight text-white sm:mb-6 sm:text-4xl md:text-5xl lg:text-6xl"
            >
              Frequently Asked Questions
            </Title>
            <Text className="mx-auto mb-6 max-w-4xl text-lg leading-relaxed text-blue-100 sm:mb-8 sm:text-xl md:text-2xl">
              Find answers to common questions about GrowthLab&apos;s
              accelerator program, application process, funding, and more.
            </Text>
            <div className="flex flex-col justify-center gap-3 sm:flex-row sm:gap-4">
              <Link href="/about/apply">
                <button className="flex w-full items-center justify-center rounded-lg bg-[#F59E0B] px-6 py-3 text-lg font-semibold text-white shadow-2xl transition-all duration-300 hover:scale-105 hover:bg-[#F59E0B]/90 sm:w-auto sm:px-8 sm:py-4 sm:text-xl">
                  Apply Now
                  <PiArrowRightBold className="ml-2 h-5 w-5 sm:ml-3 sm:h-6 sm:w-6" />
                </button>
              </Link>
              <button className="flex w-full items-center justify-center rounded-lg border border-white/30 bg-white/20 px-6 py-3 text-lg font-semibold text-white transition-all duration-300 hover:bg-white/30 sm:w-auto sm:px-8 sm:py-4 sm:text-xl">
                <PiDownloadBold className="mr-2 h-5 w-5 sm:mr-3 sm:h-6 sm:w-6" />
                Download FAQ
              </button>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Search and Filter Section */}
      <div className="border-b border-gray-200 bg-white py-8 sm:py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col items-center justify-between gap-4 lg:flex-row sm:gap-6">
            <div className="w-full max-w-md flex-1">
              <Input
                type="text"
                placeholder="Search questions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                prefix={
                  <PiMagnifyingGlassBold className="h-5 w-5 text-gray-400" />
                }
                suffix={
                  searchTerm ? (
                    <button
                      onClick={() => setSearchTerm('')}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <PiXBold className="h-4 w-4" />
                    </button>
                  ) : null
                }
                className="w-full"
              />
            </div>
            <div className="flex flex-wrap gap-2 sm:gap-3">
              <button
                onClick={() => setSelectedCategory(null)}
                className={cn(
                  'rounded-lg px-3 py-2 text-xs font-medium transition-colors sm:px-4 sm:text-sm',
                  !selectedCategory
                    ? 'bg-primary text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                )}
              >
                All Categories
              </button>
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() =>
                    setSelectedCategory(
                      category === selectedCategory ? null : category
                    )
                  }
                  className={cn(
                    'rounded-lg px-3 py-2 text-xs font-medium transition-colors sm:px-4 sm:text-sm',
                    selectedCategory === category
                      ? 'bg-primary text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  )}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Popular Questions */}
      {!searchTerm && !selectedCategory && (
        <div className="bg-gray-50 py-8 sm:py-12">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="mb-6 text-center sm:mb-8"
            >
              <Title
                as="h2"
                className="mb-3 text-xl font-bold text-gray-900 sm:mb-4 sm:text-2xl md:text-3xl"
              >
                Popular Questions
              </Title>
              <Text className="text-sm text-gray-600 sm:text-base">
                Most frequently asked questions by founders
              </Text>
            </motion.div>
            <div className="mx-auto grid max-w-4xl grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3">
              {popularQuestions.map((question, index) => {
                const faq = faqData.find((f) => f.question === question);
                if (!faq) return null;
                return (
                  <motion.button
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                    onClick={() => toggleItem(faq.id)}
                    className="rounded-lg border border-gray-200 bg-white p-3 text-left shadow-sm transition-all duration-200 hover:border-primary hover:shadow-md sm:p-4"
                  >
                    <div className="flex items-center justify-between">
                      <span className="pr-2 text-sm font-medium text-gray-900 sm:text-base">
                        {question}
                      </span>
                      <PiCaretDownBold
                        className={cn(
                          'h-4 w-4 flex-shrink-0 transition-transform duration-300',
                          openItems.includes(faq.id)
                            ? 'rotate-180 text-primary'
                            : 'text-gray-400'
                        )}
                      />
                    </div>
                    {openItems.includes(faq.id) && (
                      <div className="mt-3 border-t border-gray-200 pt-3">
                        <p className="text-xs leading-relaxed text-gray-600 sm:text-sm">
                          {faq.answer}
                        </p>
                      </div>
                    )}
                  </motion.button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* FAQ Content */}
      <div className="bg-white py-12 sm:py-16">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-4xl">
            <div className="mb-6 flex items-center justify-between sm:mb-8">
              <Title
                as="h2"
                className="text-xl font-bold text-gray-900 sm:text-2xl md:text-3xl"
              >
                {selectedCategory
                  ? `${selectedCategory} Questions`
                  : 'All Questions'}
              </Title>
              <Text className="text-sm text-gray-500">
                {filteredFAQs.length} question
                {filteredFAQs.length !== 1 ? 's' : ''}
              </Text>
            </div>

            <div className="space-y-3 sm:space-y-4">
              {displayedFAQs.map((item, i) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.05 }}
                  className="rounded-lg border border-gray-200 bg-white shadow-sm transition-all duration-200 hover:shadow-md"
                >
                  <button
                    onClick={() => toggleItem(item.id)}
                    className="flex w-full items-center justify-between rounded-lg px-4 py-3 text-left transition-colors hover:bg-gray-50 sm:px-6 sm:py-4"
                  >
                    <div className="flex flex-1 items-start space-x-3 sm:space-x-4">
                      <div className="mt-1 flex-shrink-0 rounded-lg bg-primary/10 p-2">
                        <item.icon className="h-4 w-4 text-primary sm:h-5 sm:w-5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="pr-2 text-sm font-semibold leading-tight text-gray-900 sm:text-base lg:text-lg">
                          {item.question}
                        </h3>
                        <div className="mt-1 flex items-center space-x-2">
                          <Badge
                            variant="outline"
                            className={cn(
                              'text-xs',
                              getCategoryColor(item.category)
                            )}
                          >
                            {item.category}
                          </Badge>
                          {favorites.has(item.id) && (
                            <PiStarFill className="h-3 w-3 text-yellow-500" />
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span
                        role="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleFavorite(item.id);
                        }}
                        className="rounded p-1 hover:bg-gray-100"
                      >
                        {favorites.has(item.id) ? (
                          <PiStarFill className="h-4 w-4 text-yellow-500" />
                        ) : (
                          <PiStarBold className="h-4 w-4 text-gray-400" />
                        )}
                      </span>
                      <PiCaretDownBold
                        className={cn(
                          'h-4 w-4 flex-shrink-0 transition-transform duration-300 sm:h-5 sm:w-5',
                          openItems.includes(item.id)
                            ? 'rotate-180 text-primary'
                            : 'text-gray-400'
                        )}
                      />
                    </div>
                  </button>
                  {openItems.includes(item.id) && (
                    <div className="px-4 pb-4 sm:px-6">
                      <div className="border-t border-gray-200 pt-4">
                        <p className="mb-4 text-sm leading-relaxed text-gray-700 sm:text-base">
                          {item.answer}
                        </p>
                        {item.tags && item.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1 sm:gap-2">
                            {item.tags.map((tag, index) => (
                              <span
                                key={index}
                                className="inline-block rounded-full bg-gray-100 px-2 py-1 text-xs text-gray-600"
                              >
                                #{tag}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </motion.div>
              ))}
            </div>

            {!showAll && filteredFAQs.length > 8 && (
              <div className="mt-6 text-center sm:mt-8">
                <button
                  onClick={() => setShowAll(true)}
                  className="mx-auto flex items-center rounded-lg bg-primary px-6 py-3 font-semibold text-white transition-colors hover:bg-primary/90"
                >
                  Show All Questions
                  <PiPlusBold className="ml-2 h-4 w-4" />
                </button>
              </div>
            )}

            {showAll && filteredFAQs.length > 8 && (
              <div className="mt-6 text-center sm:mt-8">
                <button
                  onClick={() => setShowAll(false)}
                  className="mx-auto flex items-center rounded-lg bg-gray-100 px-6 py-3 font-semibold text-gray-700 transition-colors hover:bg-gray-200"
                >
                  Show Less
                  <PiMinusBold className="ml-2 h-4 w-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="bg-gray-50 py-12 sm:py-16">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-8 text-center sm:mb-12"
          >
            <Title
              as="h2"
              className="mb-3 text-2xl font-bold text-gray-900 sm:mb-4 sm:text-3xl"
            >
              GrowthLab by the Numbers
            </Title>
            <Text className="text-lg text-gray-600 sm:text-xl">
              Key statistics about our accelerator program
            </Text>
          </motion.div>

          <div className="mx-auto grid max-w-4xl grid-cols-2 gap-4 sm:gap-6 md:gap-8 lg:grid-cols-4">
            {[
              { value: '500K', label: 'SGD Funding per Startup' },
              { value: '6', label: 'Month Program Duration' },
              { value: '100+', label: 'Expert Mentors' },
              { value: '95%', label: 'Success Rate' },
            ].map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="rounded-lg bg-white p-4 text-center shadow-sm sm:p-6"
              >
                <div className="mb-1 text-2xl font-bold text-primary sm:mb-2 sm:text-3xl md:text-4xl">
                  {stat.value}
                </div>
                <div className="text-xs text-gray-600 sm:text-sm">
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Contact Section */}
      <div className="bg-white py-12 sm:py-16">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-4xl text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <Title
                as="h2"
                className="mb-4 text-2xl font-bold text-gray-900 sm:mb-6 sm:text-3xl"
              >
                Still Have Questions?
              </Title>
              <Text className="mb-6 text-lg text-gray-600 sm:mb-8 sm:text-xl">
                If you couldn&apos;t find the answer to your question,
                we&apos;re here to help! Reach out to our team directly.
              </Text>
            </motion.div>

            <div className="mb-6 grid grid-cols-1 gap-4 sm:mb-8 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3">
              <div className="rounded-lg bg-gray-50 p-4 shadow-sm transition-shadow hover:shadow-md sm:p-6">
                <PiEnvelopeSimpleBold className="mx-auto mb-2 h-6 w-6 text-primary sm:mb-3 sm:h-8 sm:w-8" />
                <h3 className="mb-1 text-sm font-semibold text-gray-900 sm:mb-2 sm:text-base">
                  Email Us
                </h3>
                <p className="mb-2 text-xs text-gray-600 sm:mb-3 sm:text-sm">
                  Get detailed answers to your questions
                </p>
                <a
                  href="mailto:hello@growthlab.sg"
                  className="text-xs font-medium text-primary hover:underline sm:text-sm"
                >
                  hello@growthlab.sg
                </a>
              </div>

              <div className="rounded-lg bg-gray-50 p-4 shadow-sm transition-shadow hover:shadow-md sm:p-6">
                <PiChatCircleBold className="mx-auto mb-2 h-6 w-6 text-primary sm:mb-3 sm:h-8 sm:w-8" />
                <h3 className="mb-1 text-sm font-semibold text-gray-900 sm:mb-2 sm:text-base">
                  Live Chat
                </h3>
                <p className="mb-2 text-xs text-gray-600 sm:mb-3 sm:text-sm">
                  Chat with our support team
                </p>
                <button className="text-xs font-medium text-primary hover:underline sm:text-sm">
                  Start Chat
                </button>
              </div>

              <div className="rounded-lg bg-gray-50 p-4 shadow-sm transition-shadow hover:shadow-md sm:col-span-2 sm:p-6 lg:col-span-1">
                <PiPhoneBold className="mx-auto mb-2 h-6 w-6 text-primary sm:mb-3 sm:h-8 sm:w-8" />
                <h3 className="mb-1 text-sm font-semibold text-gray-900 sm:mb-2 sm:text-base">
                  Call Us
                </h3>
                <p className="mb-2 text-xs text-gray-600 sm:mb-3 sm:text-sm">
                  Speak directly with our team
                </p>
                <a
                  href="tel:+6597371722"
                  className="text-xs font-medium text-primary hover:underline sm:text-sm"
                >
                  +65 9737 1722
                </a>
              </div>
            </div>

            <div className="rounded-lg bg-gradient-to-r from-primary to-primary/90 p-6 text-white shadow-lg sm:p-8">
              <h3 className="mb-3 text-lg font-semibold sm:mb-4 sm:text-xl">
                Ready to Apply?
              </h3>
              <p className="mb-4 text-sm text-blue-100 sm:mb-6 sm:text-base">
                Now that your questions are answered, take the next step and
                apply to GrowthLab&apos;s accelerator program.
              </p>
              <Link href="/about/apply">
                <button className="mx-auto flex items-center rounded-lg bg-[#F59E0B] px-6 py-3 font-semibold text-white shadow-xl transition-all duration-300 hover:scale-105 hover:bg-[#F59E0B]/90 sm:px-8 sm:py-4">
                  Start Your Application
                  <PiArrowRightBold className="ml-2 h-4 w-4 sm:h-5 sm:w-5" />
                </button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
