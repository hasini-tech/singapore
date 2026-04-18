'use client';

import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import {
  PiBookmarkSimple,
  PiUsers,
  PiChartLineUp,
  PiBuildings,
  PiCalendar,
  PiMapPinBold,
  PiEyeBold,
} from 'react-icons/pi';
import { Title, Text, Button, Avatar } from 'rizzui';
import { useAuth } from '@/context/auth-context';
import { feedService } from '@/services/feed.service';
import { UserStatsResponse } from '@/types/feed';
import { getApiMediaUrl } from '@/utils/get-api-media-url';

const navItems = [
  { label: 'My Items', icon: PiBookmarkSimple, href: '/feed/saved' },
  { label: 'Groups', icon: PiUsers, href: '/groups' },
  { label: 'Events', icon: PiCalendar, href: '/events' },
  { label: 'Business Pages', icon: PiBuildings, href: '/pages' },
];

export default function SidebarLeft() {
  const { user: authUser } = useAuth();
  const [data, setData] = useState<UserStatsResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        const response = await feedService.getUserStats();
        setData(response);
      } catch (error) {
        console.error('Failed to fetch user stats:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchStats();
  }, []);

  const user = data?.user || authUser;
  const stats = data?.stats;
  const displayName = user
    ? `${user.firstName} ${user.lastName}`
    : 'User';
  const headline = user?.headline || 'Entrepreneur & Innovator';
  const coverImageUrl = authUser?.coverImageURL
    ? getApiMediaUrl(authUser.coverImageURL)
    : null;

  return (
    <div className="flex flex-col gap-4">
      {/* Profile Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="overflow-hidden rounded-2xl border border-muted bg-background shadow-sm"
      >
        {/* Cover Image */}
        <div className="relative h-20 w-full">
          {coverImageUrl ? (
            <Image
              src={coverImageUrl}
              alt="Cover"
              fill
              className="object-cover"
            />
          ) : (
            <div className="h-full w-full bg-gradient-to-r from-primary/30 via-primary/20 to-secondary/30" />
          )}
        </div>

        <div className="relative px-4 pb-4">
          <div className="absolute -top-8 left-4">
            <Avatar
              name={displayName}
              src={
                getApiMediaUrl(user?.avatarURL) || '/growthlab/founder.jpg'
              }
              size="lg"
              className="border-4 border-white shadow-lg dark:border-gray-900"
            />
          </div>

          <div className="pt-10">
            <Link href="/profile" className="group">
              <Title
                as="h3"
                className="text-lg font-bold transition-colors group-hover:text-primary"
              >
                {displayName}
              </Title>
            </Link>
            <Text className="line-clamp-2 text-sm text-gray-500">
              {headline}
            </Text>

            {/* Company & Location */}
            {(authUser?.companyName || authUser?.location) && (
              <div className="mt-1.5 flex flex-wrap items-center gap-2 text-[11px] text-gray-400">
                {authUser?.companyName && (
                  <span className="flex items-center gap-1">
                    <PiBuildings className="h-3 w-3" />
                    {authUser.companyName}
                  </span>
                )}
                {authUser?.location && (
                  <span className="flex items-center gap-1">
                    <PiMapPinBold className="h-3 w-3" />
                    {authUser.location}
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Stats Grid */}
          <div className="mt-4 grid grid-cols-2 gap-3 border-t border-muted pt-4">
            <div className="text-center">
              <Text className="text-lg font-bold text-primary">
                {loading ? '...' : stats?.profileViews ?? 0}
              </Text>
              <Text className="text-[10px] text-gray-400">Profile views</Text>
            </div>
            <div className="text-center">
              <Text className="text-lg font-bold text-primary">
                {loading ? '...' : stats?.totalPostViews ?? 0}
              </Text>
              <Text className="text-[10px] text-gray-400">Impressions</Text>
            </div>
            <div className="text-center">
              <Text className="text-lg font-bold text-primary">
                {loading ? '...' : stats?.totalConnections ?? 0}
              </Text>
              <Text className="text-[10px] text-gray-400">Connections</Text>
            </div>
            <div className="text-center">
              <Text className="text-lg font-bold text-primary">
                {loading ? '...' : stats?.totalFollowers ?? 0}
              </Text>
              <Text className="text-[10px] text-gray-400">Followers</Text>
            </div>
          </div>

          <Link
            href="/profile"
            className="mt-3 flex items-center justify-center gap-1.5 rounded-xl border border-muted py-2 text-xs font-bold text-gray-500 transition-colors hover:border-primary hover:text-primary"
          >
            <PiEyeBold className="h-3.5 w-3.5" />
            View my profile
          </Link>
        </div>
      </motion.div>

      {/* Navigation Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="rounded-2xl border border-muted bg-background p-4 shadow-sm"
      >
        <div className="space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm text-gray-600 transition-all hover:bg-gray-50 dark:hover:bg-gray-200"
            >
              <item.icon className="h-5 w-5 text-gray-400" />
              <span className="font-medium">{item.label}</span>
            </Link>
          ))}
        </div>
      </motion.div>

      {/* Community Dashboard Shortcut */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="rounded-2xl bg-gradient-to-br from-primary to-secondary p-6 text-white shadow-xl shadow-primary/20"
      >
        <div className="mb-4 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-background/20">
            <PiChartLineUp className="h-6 w-6" />
          </div>
          <Title as="h4" className="text-base text-white">
            Growth Dashboard
          </Title>
        </div>
        <Text className="mb-4 text-xs text-white/80">
          Track your startup growth metrics and investor engagement in
          real-time.
        </Text>
        <Button
          variant="flat"
          className="w-full bg-background font-bold text-primary hover:bg-background/90"
        >
          View Analytics
        </Button>
      </motion.div>
    </div>
  );
}
