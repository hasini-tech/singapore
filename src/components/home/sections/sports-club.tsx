'use client';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { PiArrowRight, PiTrophy } from 'react-icons/pi';
import { Button, Text, Title } from 'rizzui';
export default function SportsClub() {
    return (
        <section
            id="sports-club"
            className="relative overflow-hidden bg-background py-24 lg:py-32"
        >

            {/* Background Glows */}
            <div className="absolute right-0 top-0 h-[500px] w-[500px] -translate-y-1/2 translate-x-1/2 rounded-full bg-primary/20 blur-[120px]" />
            <div className="absolute bottom-0 left-0 h-[500px] w-[500px] -translate-x-1/2 translate-y-1/2 rounded-full bg-secondary/10 blur-[120px]" />
            <div className="container mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8">

                <div className="grid grid-cols-1 items-center gap-16 lg:grid-cols-12">

                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                        className="space-y-8 lg:col-span-7"
                    >

                        <div className="flex items-center gap-3">

                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/20">

                                <PiTrophy className="h-6 w-6 text-primary" />
                            </div>
                            <span className="text-sm font-bold uppercase tracking-widest text-primary">
                                Coming Soon
                            </span>
                        </div>
                        <Title
                            as="h2"
                            className="text-5xl font-bold tracking-tight text-foreground lg:text-8xl"
                        >
                            GrowthLab <br />
                            <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text dark:to-primary-lighter text-transparent">
                                Sports Club
                            </span>
                        </Title>
                        <Text className="max-w-2xl text-xl font-light leading-relaxed text-muted-foreground lg:text-3xl">

                            Where entrepreneurship meets athletic excellence. Join a community
                            of high-performing founders who balance business grit with
                            physical peak performance.
                        </Text>
                        <div className="pt-8">

                            <Button
                                size="xl"
                                className="h-16 rounded-2xl bg-primary px-12 font-bold text-primary-foreground shadow-2xl transition-all hover:bg-primary-dark"
                            >
                                View Sports Club <PiArrowRight className="ml-2 h-5 w-5" />
                            </Button>
                        </div>
                    </motion.div>
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 30 }}
                        whileInView={{ opacity: 1, scale: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8 }}
                        className="relative lg:col-span-5"
                    >

                        <div className="absolute -right-8 -top-16 z-10 hidden md:block">
                            <span className="text-[120px] font-bold text-foreground/5">
                                12
                            </span>
                        </div>
                        <div className="relative aspect-[5/6] w-full overflow-hidden rounded-[40px] border border-foreground/10 shadow-3xl">

                            <Image
                                src="/growthlab/sports-club.jpg"
                                alt="GrowthLab Sports Club"
                                fill
                                className="object-cover opacity-80"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-transparent/80 via-transparent to-transparent" />
                        </div>
                    </motion.div>
                </div>
            </div>
        </section>
    );
}
