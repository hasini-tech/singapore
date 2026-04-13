'use client';

import { feedService } from '@/services/feed.service';
import { PostResponse as PostType } from '@/types/feed';
import { motion } from 'framer-motion';
import { useCallback, useEffect, useImperativeHandle, useState, forwardRef } from 'react';
import { Button, Text } from 'rizzui';
import PostCard from './post-card';
import type { FeedType, SortBy, TimeRange } from './feed-header';

interface FeedListProps {
  feedType: FeedType;
  sortBy: SortBy;
  timeRange: TimeRange;
}

export interface FeedListHandle {
  prependPost: (post: PostType) => void;
  removePost: (postId: number) => void;
}

const FeedList = forwardRef<FeedListHandle, FeedListProps>(function FeedList(
  { feedType, sortBy, timeRange },
  ref
) {
  const [posts, setPosts] = useState<PostType[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasNext, setHasNext] = useState(false);
  const [isFetchingMore, setIsFetchingMore] = useState(false);

  useImperativeHandle(ref, () => ({
    prependPost: (post: PostType) => {
      setPosts((prev) => [post, ...prev]);
    },
    removePost: (postId: number) => {
      setPosts((prev) => prev.filter((p) => p.id !== postId));
    },
  }));

  const fetchFeed = useCallback(
    async (pageNum: number, isMore: boolean = false) => {
      try {
        if (isMore) setIsFetchingMore(true);
        else setLoading(true);
        const response = await feedService.getFeed({
          page: pageNum,
          limit: 10,
          feed_type: feedType,
          sort_by: sortBy,
          time_range: timeRange,
        });
        if (isMore) {
          setPosts((prev) => [...prev, ...response.posts]);
        } else {
          setPosts(response.posts);
        }
        setHasNext(response.hasNext);
        setPage(response.page);
      } catch (error) {
        console.error('Failed to fetch feed:', error);
      } finally {
        setLoading(false);
        setIsFetchingMore(false);
      }
    },
    [feedType, sortBy, timeRange]
  );

  useEffect(() => {
    fetchFeed(1);
  }, [fetchFeed]);

  const handleLoadMore = () => {
    if (hasNext && !isFetchingMore) {
      fetchFeed(page + 1, true);
    }
  };

  const handlePostDeleted = (postId: number) => {
    setPosts((prev) => prev.filter((p) => p.id !== postId));
  };

  const container = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } },
  };

  return (
    <div className="flex flex-col gap-6">
      {loading ? (
        <div className="flex flex-col gap-6">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-64 w-full animate-pulse rounded-2xl bg-gray-100"
            />
          ))}
        </div>
      ) : posts.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-gray-200 p-12 text-center">
          <Text className="text-gray-400">
            {feedType === 'following'
              ? 'No posts from people you follow yet.'
              : feedType === 'trending'
                ? 'No trending posts right now.'
                : 'No posts found in your network.'}
          </Text>
        </div>
      ) : (
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="flex flex-col gap-6"
        >
          {posts.map((post) => (
            <PostCard key={post.id} post={post} onDeleted={handlePostDeleted} />
          ))}
        </motion.div>
      )}

      {hasNext && (
        <div className="py-8 text-center">
          <Button
            variant="text"
            isLoading={isFetchingMore}
            onClick={handleLoadMore}
            className="rounded-xl px-8 font-bold text-primary hover:bg-primary/5"
          >
            Load more posts
          </Button>
        </div>
      )}

      {!hasNext && posts.length > 0 && (
        <div className="py-8 text-center text-sm font-medium text-gray-400">
          You&apos;ve reached the end of the feed.
        </div>
      )}
    </div>
  );
});

export default FeedList;
