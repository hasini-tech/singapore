'use client';

import Image from 'next/image';
import { Text, Title } from 'rizzui';
import cn from '@/utils/class-names';
import { jobFeedBannerLogo, jobFeedLogo } from '@/data/job-feed-data';

export default function ApiDashboardHeader({
  className,
}: {
  className?: string;
}) {
  return (
    <div
      className={cn(
        'min-h-{344px} relative mb-8 grid grid-cols-1 items-center px-6 pt-6 @lg:grid-cols-2 @lg:px-12 @7xl:px-24 @[2192px]:flex @[2192px]:items-center @[2192px]:justify-center dark:rounded-[10px] dark:border dark:border-muted dark:bg-gray-100/50',
        className
      )}
    >
      <Image
        fill
        loading="eager"
        alt="job feed banner"
        src={jobFeedBannerLogo}
        className="rounded-[10px] dark:hidden"
      />

      <div className="z-10 pb-6 @2xl:pb-0">
        <Title className="mb-6 text-2xl font-semibold leading-8 @2xl:leading-8 @4xl:text-4xl @4xl:leading-[40px]">
          The #1 Choice for Data Driven <br className="hidden @7xl:block" />{' '}
          Optimisation of Heavy Industries
        </Title>
        <Text className="leading-6">
          Empowering industries with data-driven insights for optimal
          performance.
        </Text>
      </div>

      <Image
        src={jobFeedLogo}
        alt="job feed logo"
        width={470}
        height={320}
        loading="eager"
        className="relative z-10 @lg:ml-6 dark:grayscale"
      />
    </div>
  );
}
