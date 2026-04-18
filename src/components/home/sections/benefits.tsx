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
            className="relative overflow-hidden bg-background py-24 lg:py-32 xl:py-40"
        >
            {/* Background Elements */}
            <div className="pointer-events-none absolute inset-0 opacity-20">
                <video
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="h-full w-full object-cover"
                >
                    <source src="/benefits-background.mp4" type="video/mp4" />
                </video>
                <div className="absolute inset-0 bg-gradient-to-br from-background via-background/90 to-primary/20" />
            </div>

            <div className="container relative z-10 mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="mb-24 grid grid-cols-1 gap-12 lg:grid-cols-12">
                    <motion.div
                        initial={{ opacity: 0, x: -40 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        className="lg:col-span-2"
                    >
                        <span className="text-7xl font-bold text-foreground/10 lg:text-9xl">
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
                            className="mb-6 text-4xl font-bold leading-none tracking-tight text-foreground lg:text-7xl"
                        >
                            Your GrowthLab Advantage
                        </Title>
                        <Text className="text-xl font-light text-muted-foreground lg:text-3xl">
                            Empowering founders, investors, and innovators to
                            launch and scale faster.
                        </Text>
                    </motion.div>
                </div>

                {/* Benefits Grid */}
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
                            className="group relative rounded-[40px] border border-foreground/10 bg-secondary/5 p-10 shadow-2xl transition-all duration-300 hover:border-primary/50"
                        >
                            <div className="mb-8 flex h-16 w-16 items-center justify-center rounded-2xl bg-foreground/5 transition-colors group-hover:bg-primary dark:bg-primary-lighter">
                                <benefit.icon className="h-8 w-8 text-primary transition-colors group-hover:text-foreground" />
                            </div>
                            <Title
                                as="h3"
                                className="mb-4 text-2xl font-bold text-foreground transition-colors group-hover:text-primary"
                            >
                                {benefit.title}
                            </Title>
                            <Text className="mb-6 font-light leading-relaxed text-muted-foreground">
                                {benefit.description}
                            </Text>
                            <div className="mt-auto flex flex-col gap-2 border-t border-foreground/10 pt-6">
                                <span className="text-xs font-bold uppercase tracking-widest text-primary">
                                    Includes
                                </span>
                                <Text className="text-sm italic text-muted-foreground/80">
                                    {benefit.details}
                                </Text>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Business in a Box */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    className="rounded-[60px] border border-foreground/10 bg-gradient-to-br from-background via-background to-secondary/10 p-12 shadow-3xl lg:p-20"
                >
                    <div className="mb-16 text-center">
                        <Title
                            as="h3"
                            className="mb-6 text-4xl font-bold text-foreground lg:text-6xl"
                        >
                            Business in a Box
                        </Title>
                        <Text className="mx-auto max-w-3xl text-xl font-light text-muted-foreground lg:text-2xl">
                            Everything you need from incorporation to tech
                            infrastructure, all in one place.
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
                                className="group flex items-start gap-4 rounded-lg border border-foreground/5 p-4 shadow transition-all duration-300 hover:border-primary/30 hover:bg-foreground/5"
                            >
                                <div className="mt-1 flex-shrink-0">
                                    <PiCheckCircleFill className="h-6 w-6 text-primary transition-transform group-hover:scale-125" />
                                </div>
                                <div>
                                    <Title
                                        as="h4"
                                        className="mb-2 text-xl font-bold text-foreground"
                                    >
                                        {service.name}
                                    </Title>
                                    <Text className="text-sm font-light leading-snug text-muted-foreground">
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
