'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Text, Button, Loader } from 'rizzui';
import CreatePost from './create-post';
import PostCard from './post-card';
import { feedService } from '@/services/feed.service';
import { PostResponse as PostType } from '@/types/feed';

export default function FeedList() {
  const [posts, setPosts] = useState<PostType[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasNext, setHasNext] = useState(false);
  const [isFetchingMore, setIsFetchingMore] = useState(false);

  const fetchFeed = useCallback(async (pageNum: number, isMore: boolean = false) => {
    try {
      if (isMore) setIsFetchingMore(true);
      else setLoading(true);

      const response = await feedService.getFeed({ page: pageNum, limit: 10 });
      
      if (isMore) {
        setPosts(prev => [...prev, ...response.posts]);
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
  }, []);

  useEffect(() => {
    fetchFeed(1);
  }, [fetchFeed]);

  const handleLoadMore = () => {
    if (hasNext && !isFetchingMore) {
      fetchFeed(page + 1, true);
    }
  };

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

  return (
    <div className="flex flex-col gap-6">
      {/* Live Updates Indicator */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-center gap-2 rounded-full border border-primary/20 bg-primary/5 py-2 px-4 text-xs font-bold text-primary shadow-sm shadow-primary/5"
      >
        <div className="relative flex h-2 w-2">
          <div className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75"></div>
          <div className="relative inline-flex h-2 w-2 rounded-full bg-primary"></div>
        </div>
        LIVE UPDATES: NEW POSTS IN YOUR NETWORK
      </motion.div>

      <CreatePost />
      
      {loading ? (
        <div className="flex flex-col gap-6">
           {[1, 2, 3].map((i) => (
             <div key={i} className="h-64 w-full animate-pulse rounded-2xl bg-gray-100 dark:bg-gray-800" />
           ))}
        </div>
      ) : posts.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-gray-200 p-12 text-center">
          <Text className="text-gray-400">No posts found in your network.</Text>
        </div>
      ) : (
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="flex flex-col gap-6"
        >
          {posts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </motion.div>
      )}

      {/* Infinite Scroll / Load More */}
      {hasNext && (
        <div className="py-8 text-center">
          <Button 
            variant="text" 
            isLoading={isFetchingMore} 
            onClick={handleLoadMore}
            className="font-bold text-primary hover:bg-primary/5 rounded-xl px-8"
          >
            Load more posts
          </Button>
        </div>
      )}

      {!hasNext && posts.length > 0 && (
        <div className="py-8 text-center text-gray-400 text-sm font-medium">
          You&apos;ve reached the end of the feed.
        </div>
      )}
    </div>
  );
}
