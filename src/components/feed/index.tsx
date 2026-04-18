'use client';

import { useState, useRef } from 'react';
import SidebarLeft from './sidebar-left';
import SidebarRight from './sidebar-right';
import FeedList, { FeedListHandle } from './feed-list';
import FeedHeader, { FeedType, SortBy, TimeRange } from './feed-header';
import CreatePost from './create-post';
import NotificationBell from './notification-bell';
import NotificationPanel from './notification-panel';
import { PostResponse } from '@/types/feed';

export default function FeedLayout() {
  const [feedType, setFeedType] = useState<FeedType>('recommended');
  const [sortBy, setSortBy] = useState<SortBy>('relevance');
  const [timeRange, setTimeRange] = useState<TimeRange>('all_time');
  const [showNotifications, setShowNotifications] = useState(false);
  const feedListRef = useRef<FeedListHandle>(null);

  const handlePostCreated = (post: PostResponse) => {
    feedListRef.current?.prependPost(post);
  };

  return (
    <div className="min-h-screen bg-gray-50/50 pb-20 pt-2 lg:pt-6">
      <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          {/* Left Sidebar - Desktop Only */}
          <aside className="hidden h-fit flex-col lg:sticky lg:top-[90px] lg:col-span-3 lg:flex">
            <SidebarLeft />
          </aside>

          {/* Main Feed Content */}
          <main className="lg:col-span-6">
            <div className="flex flex-col gap-4">
              {/* Mobile Header Bar */}
              <div className="flex items-center justify-between lg:hidden">
                <h1 className="text-lg font-bold">Feed</h1>
                <div className="relative">
                  <NotificationBell
                    onClick={() => setShowNotifications(!showNotifications)}
                  />
                  <NotificationPanel
                    isOpen={showNotifications}
                    onClose={() => setShowNotifications(false)}
                  />
                </div>
              </div>

              {/* Desktop Notification Bell (inline with header) */}
              <div className="hidden items-center justify-between lg:flex">
                <FeedHeader
                  feedType={feedType}
                  sortBy={sortBy}
                  timeRange={timeRange}
                  onFeedTypeChange={setFeedType}
                  onSortByChange={setSortBy}
                  onTimeRangeChange={setTimeRange}
                />
                <div className="relative ml-3">
                  <NotificationBell
                    onClick={() => setShowNotifications(!showNotifications)}
                  />
                  <NotificationPanel
                    isOpen={showNotifications}
                    onClose={() => setShowNotifications(false)}
                  />
                </div>
              </div>

              {/* Mobile Feed Header (below mobile bar) */}
              <div className="lg:hidden">
                <FeedHeader
                  feedType={feedType}
                  sortBy={sortBy}
                  timeRange={timeRange}
                  onFeedTypeChange={setFeedType}
                  onSortByChange={setSortBy}
                  onTimeRangeChange={setTimeRange}
                />
              </div>

              <CreatePost onPostCreated={handlePostCreated} />

              <FeedList
                ref={feedListRef}
                feedType={feedType}
                sortBy={sortBy}
                timeRange={timeRange}
              />
            </div>
          </main>

          {/* Right Sidebar - Desktop Only */}
          <aside className="hidden h-fit flex-col lg:sticky lg:top-[90px] lg:col-span-3 lg:flex">
            <SidebarRight />
          </aside>
        </div>
      </div>
    </div>
  );
}
