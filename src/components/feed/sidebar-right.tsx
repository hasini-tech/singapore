'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  PiHash,
  PiUserPlus,
  PiArrowRight,
  PiFireSimpleBold,
  PiCheckBold,
  PiXBold,
  PiUsersBold,
} from 'react-icons/pi';
import { Title, Text, Avatar, Badge, Button, Loader } from 'rizzui';
import cn from '@/utils/class-names';
import { feedService } from '@/services/feed.service';
import { TrendingTopic, UserRecommendation } from '@/types/feed';
import { getApiMediaUrl } from '@/utils/get-api-media-url';
import { toast } from 'react-hot-toast';

export default function SidebarRight() {
  const [trending, setTrending] = useState<TrendingTopic[]>([]);
  const [recommendations, setRecommendations] = useState<UserRecommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [connectingIds, setConnectingIds] = useState<Set<number>>(new Set());

  useEffect(() => {
    async function fetchData() {
      try {
        const [trendingData, recsData] = await Promise.all([
          feedService.getTrendingTopics(),
          feedService.getConnectionRecommendations(),
        ]);
        setTrending(trendingData);
        setRecommendations(recsData);
      } catch (error) {
        console.error('Failed to fetch sidebar right data:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const handleConnect = async (personId: number) => {
    setConnectingIds((prev) => new Set(prev).add(personId));
    try {
      await feedService.sendConnectionRequest(personId);
      setRecommendations((prev) =>
        prev.map((p) =>
          p.id === personId
            ? { ...p, connectionStatus: 'pending_sent' as const, isRequestSent: true }
            : p
        )
      );
      toast.success('Connection request sent!');
    } catch {
      toast.error('Failed to send request');
    } finally {
      setConnectingIds((prev) => {
        const next = new Set(prev);
        next.delete(personId);
        return next;
      });
    }
  };

  const handleDismiss = (personId: number) => {
    setRecommendations((prev) => prev.filter((p) => p.id !== personId));
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Trending Topics */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl border border-muted bg-background p-6 shadow-sm"
      >
        <Title as="h3" className="mb-4 flex items-center gap-2 text-base font-bold">
          <PiHash className="h-5 w-5 text-primary" />
          Trending Topics
        </Title>
        <div className="space-y-3">
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex items-center justify-between">
                  <div>
                    <div className="h-4 w-24 animate-pulse rounded bg-gray-100" />
                    <div className="mt-1 h-3 w-16 animate-pulse rounded bg-gray-100" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            trending.map((topic, idx) => (
              <div
                key={topic.hashtag}
                className="group flex items-center justify-between cursor-pointer"
              >
                <div>
                  <div className="flex items-center gap-1.5">
                    <Text className="text-sm font-bold transition-colors group-hover:text-primary">
                      #{topic.hashtag}
                    </Text>
                    {idx < 3 && (
                      <PiFireSimpleBold className="h-3.5 w-3.5 text-orange-500" />
                    )}
                  </div>
                  <Text className="text-[11px] text-gray-400">
                    {topic.postsCount.toLocaleString()} posts
                  </Text>
                </div>
                {topic.engagementScore > 50 && (
                  <Badge
                    variant="flat"
                    size="sm"
                    className="h-5 bg-orange-50 px-1.5 text-[9px] font-bold text-orange-500"
                  >
                    HOT
                  </Badge>
                )}
              </div>
            ))
          )}
        </div>
        <Button
          variant="text"
          className="mt-4 h-auto p-0 text-sm font-bold text-gray-500 hover:text-primary"
        >
          View all topics
        </Button>
      </motion.div>

      {/* Connection Recommendations */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="rounded-2xl border border-muted bg-background p-6 shadow-sm"
      >
        <Title as="h3" className="mb-4 flex items-center gap-2 text-base font-bold">
          <PiUserPlus className="h-5 w-5 text-secondary" />
          People you may know
        </Title>
        <div className="space-y-4">
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="h-10 w-10 animate-pulse rounded-full bg-gray-100" />
                  <div className="flex-1">
                    <div className="h-4 w-28 animate-pulse rounded bg-gray-100" />
                    <div className="mt-1 h-3 w-20 animate-pulse rounded bg-gray-100" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            recommendations.map((person) => (
              <div key={person.id} className="group">
                <div className="flex items-start gap-3">
                  <Avatar
                    name={`${person.firstName} ${person.lastName}`}
                    src={
                      getApiMediaUrl(person.avatarURL) ||
                      '/growthlab/founder.jpg'
                    }
                    size="md"
                    className="bg-primary/10"
                  />
                  <div className="min-w-0 flex-1">
                    <Text className="truncate text-sm font-bold">
                      {person.firstName} {person.lastName}
                    </Text>
                    <Text className="line-clamp-1 text-xs text-gray-500">
                      {person.headline}
                    </Text>

                    {/* Mutual connections & reason */}
                    {(person.mutualConnectionsCount > 0 || person.connectionReason) && (
                      <div className="mt-1 flex items-center gap-1.5 text-[10px] text-gray-400">
                        {person.mutualConnectionsCount > 0 && (
                          <span className="flex items-center gap-0.5">
                            <PiUsersBold className="h-3 w-3" />
                            {person.mutualConnectionsCount} mutual
                          </span>
                        )}
                        {person.mutualConnectionsCount > 0 && person.connectionReason && (
                          <span>•</span>
                        )}
                        {person.connectionReason && (
                          <span className="truncate">{person.connectionReason}</span>
                        )}
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="mt-2 flex gap-2">
                      {person.connectionStatus === 'pending_sent' || person.isRequestSent ? (
                        <Button
                          size="sm"
                          variant="outline"
                          disabled
                          className="h-7 rounded-lg px-3 text-[11px] font-bold border-gray-200 text-gray-400"
                        >
                          <PiCheckBold className="mr-1 h-3 w-3" />
                          Pending
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-7 rounded-lg px-3 text-[11px] font-bold hover:border-primary hover:bg-primary/10 hover:text-primary"
                          onClick={() => handleConnect(person.id)}
                          isLoading={connectingIds.has(person.id)}
                        >
                          <PiUserPlus className="mr-1 h-3 w-3" />
                          Connect
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="text"
                        className="h-7 px-2 text-[11px] text-gray-400 hover:text-gray-600"
                        onClick={() => handleDismiss(person.id)}
                      >
                        <PiXBold className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
        <Button
          variant="text"
          className="mt-4 flex h-auto items-center gap-2 p-0 text-sm font-bold text-gray-500 hover:text-primary"
        >
          Show More <PiArrowRight />
        </Button>
      </motion.div>

      {/* Sticky Footer Links */}
      <div className="flex flex-wrap justify-center gap-x-4 gap-y-2 px-4 text-[11px] text-gray-400">
        <Link href="/about" className="hover:underline">About</Link>
        <Link href="/accessibility" className="hover:underline">Accessibility</Link>
        <Link href="/help" className="hover:underline">Help Center</Link>
        <Link href="/privacy" className="hover:underline">Privacy & Terms</Link>
        <Link href="/ad-choices" className="hover:underline">Ad Choices</Link>
        <Link href="/advertising" className="hover:underline">Advertising</Link>
        <div className="mt-2 flex w-full items-center justify-center gap-1">
          <span className="font-bold text-primary">GrowthLab</span> © 2026
        </div>
      </div>
    </div>
  );
}
