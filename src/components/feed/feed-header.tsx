'use client';

import { useState } from 'react';
import {
  PiSlidersHorizontalBold,
  PiFunnelBold,
  PiClockBold,
  PiArrowsDownUpBold,
  PiXBold,
} from 'react-icons/pi';
import { Button, ActionIcon, Badge, Popover, Text } from 'rizzui';
import cn from '@/utils/class-names';

export type FeedType = 'recommended' | 'following' | 'trending' | 'recent';
export type SortBy = 'recent' | 'trending' | 'engagement' | 'relevance';
export type TimeRange = 'all_time' | 'today' | 'this_week' | 'this_month';

interface FeedHeaderProps {
  feedType: FeedType;
  sortBy: SortBy;
  timeRange: TimeRange;
  onFeedTypeChange: (type: FeedType) => void;
  onSortByChange: (sort: SortBy) => void;
  onTimeRangeChange: (range: TimeRange) => void;
}

const feedTabs: { label: string; value: FeedType }[] = [
  { label: 'For You', value: 'recommended' },
  { label: 'Following', value: 'following' },
  { label: 'Trending', value: 'trending' },
  { label: 'Recent', value: 'recent' },
];

const sortOptions: { label: string; value: SortBy }[] = [
  { label: 'Relevance', value: 'relevance' },
  { label: 'Recent', value: 'recent' },
  { label: 'Popular', value: 'engagement' },
  { label: 'Trending', value: 'trending' },
];

const timeOptions: { label: string; value: TimeRange }[] = [
  { label: 'All Time', value: 'all_time' },
  { label: 'Today', value: 'today' },
  { label: 'This Week', value: 'this_week' },
  { label: 'This Month', value: 'this_month' },
];

export default function FeedHeader({
  feedType,
  sortBy,
  timeRange,
  onFeedTypeChange,
  onSortByChange,
  onTimeRangeChange,
}: FeedHeaderProps) {
  const [filtersOpen, setFiltersOpen] = useState(false);

  const activeFilterCount =
    (sortBy !== 'relevance' ? 1 : 0) + (timeRange !== 'all_time' ? 1 : 0);

  const handleReset = () => {
    onSortByChange('relevance');
    onTimeRangeChange('all_time');
    onFeedTypeChange('recommended');
  };

  return (
    <div className="rounded-2xl border border-muted bg-background p-3 shadow-sm">
      {/* Feed Type Tabs */}
      <div className="flex items-center gap-2">
        <div className="flex flex-1 gap-1 overflow-x-auto no-scrollbar">
          {feedTabs.map((tab) => (
            <Button
              key={tab.value}
              variant={feedType === tab.value ? 'solid' : 'text'}
              size="sm"
              className={cn(
                'rounded-xl px-4 text-xs font-bold whitespace-nowrap transition-all',
                feedType === tab.value
                  ? 'bg-primary text-white shadow-md shadow-primary/20'
                  : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-200'
              )}
              onClick={() => onFeedTypeChange(tab.value)}
            >
              {tab.label}
            </Button>
          ))}
        </div>

        {/* Filter Toggle */}
        <Popover placement="bottom-end" isOpen={filtersOpen} setIsOpen={setFiltersOpen}>
          <Popover.Trigger>
            <ActionIcon
              variant="text"
              className={cn(
                'relative rounded-xl h-9 w-9',
                filtersOpen || activeFilterCount > 0
                  ? 'text-primary bg-primary/5'
                  : 'text-gray-400 hover:text-gray-600'
              )}
            >
              <PiSlidersHorizontalBold className="h-5 w-5" />
              {activeFilterCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[9px] font-bold text-white">
                  {activeFilterCount}
                </span>
              )}
            </ActionIcon>
          </Popover.Trigger>
          <Popover.Content className="z-50 w-64 rounded-xl border border-muted bg-background p-4 shadow-lg">
            <div className="flex items-center justify-between mb-3">
              <Text className="text-sm font-bold">Filters</Text>
              {activeFilterCount > 0 && (
                <Button
                  variant="text"
                  size="sm"
                  className="h-auto p-0 text-xs text-gray-400 hover:text-primary"
                  onClick={handleReset}
                >
                  Reset all
                </Button>
              )}
            </div>

            {/* Sort By */}
            <div className="mb-3">
              <Text className="text-xs font-bold text-gray-500 mb-2 flex items-center gap-1.5">
                <PiArrowsDownUpBold className="h-3.5 w-3.5" />
                Sort By
              </Text>
              <div className="flex flex-wrap gap-1.5">
                {sortOptions.map((opt) => (
                  <Button
                    key={opt.value}
                    variant={sortBy === opt.value ? 'solid' : 'outline'}
                    size="sm"
                    className={cn(
                      'h-7 rounded-lg px-2.5 text-[11px] font-bold',
                      sortBy === opt.value
                        ? 'bg-primary text-white'
                        : 'border-gray-200 text-gray-500 hover:border-primary hover:text-primary'
                    )}
                    onClick={() => onSortByChange(opt.value)}
                  >
                    {opt.label}
                  </Button>
                ))}
              </div>
            </div>

            {/* Time Range */}
            <div>
              <Text className="text-xs font-bold text-gray-500 mb-2 flex items-center gap-1.5">
                <PiClockBold className="h-3.5 w-3.5" />
                Time Range
              </Text>
              <div className="flex flex-wrap gap-1.5">
                {timeOptions.map((opt) => (
                  <Button
                    key={opt.value}
                    variant={timeRange === opt.value ? 'solid' : 'outline'}
                    size="sm"
                    className={cn(
                      'h-7 rounded-lg px-2.5 text-[11px] font-bold',
                      timeRange === opt.value
                        ? 'bg-primary text-white'
                        : 'border-gray-200 text-gray-500 hover:border-primary hover:text-primary'
                    )}
                    onClick={() => onTimeRangeChange(opt.value)}
                  >
                    {opt.label}
                  </Button>
                ))}
              </div>
            </div>
          </Popover.Content>
        </Popover>
      </div>
    </div>
  );
}
