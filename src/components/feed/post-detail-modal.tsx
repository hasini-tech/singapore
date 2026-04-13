'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  PiXBold,
  PiHeartFill,
  PiHeartBold,
  PiChatCircleDotsBold,
  PiShareFatBold,
  PiGlobeSimpleBold,
  PiUsersBold,
  PiLockBold,
  PiArrowSquareOutBold,
  PiBookmarkSimpleBold,
  PiBookmarkSimpleFill,
  PiPlayFill,
  PiCaretLeftBold,
  PiCaretRightBold,
  PiEyeBold,
  PiArrowsOutBold,
} from 'react-icons/pi';
import { Title, Text, Avatar, ActionIcon, Button } from 'rizzui';
import cn from '@/utils/class-names';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
dayjs.extend(relativeTime);
import { PostResponse as Post } from '@/types/feed';
import { getApiMediaUrl } from '@/utils/get-api-media-url';
import { feedService } from '@/services/feed.service';
import { useAuth } from '@/context/auth-context';
import { toast } from 'react-hot-toast';
import CommentSection from './comment-section';
import ShareDialog from './share-dialog';
import MediaLightbox, { MediaItem } from './media-lightbox';

interface PostDetailModalProps {
  post: Post | null;
  isOpen: boolean;
  onClose: () => void;
  onDeleted?: (postId: number) => void;
  initialMediaIndex?: number;
}

export default function PostDetailModal({
  post,
  isOpen,
  onClose,
  onDeleted,
  initialMediaIndex = -1,
}: PostDetailModalProps) {
  const { user } = useAuth();

  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [isSaved, setIsSaved] = useState(false);
  const [commentsCount, setCommentsCount] = useState(0);
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [mediaIndex, setMediaIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  // Sync state when post changes
  useEffect(() => {
    if (post) {
      setIsLiked(post.isLiked);
      setLikesCount(post.likesCount);
      setIsSaved(post.isSaved);
      setCommentsCount(post.commentsCount);
      setMediaIndex(0);
    }
  }, [post]);

  // Open lightbox immediately if initialMediaIndex provided
  useEffect(() => {
    if (isOpen && post && initialMediaIndex >= 0 && post.attachments.length > 0) {
      setLightboxOpen(true);
      setLightboxIndex(initialMediaIndex);
    }
  }, [isOpen, post, initialMediaIndex]);

  // Lock body scroll
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Keyboard
  useEffect(() => {
    if (!isOpen || lightboxOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isOpen, lightboxOpen, onClose]);

  if (!post) return null;

  const handleLike = async () => {
    const prevLiked = isLiked;
    const prevCount = likesCount;
    setIsLiked(!isLiked);
    setLikesCount((prev) => (isLiked ? prev - 1 : prev + 1));
    try {
      await feedService.likePost(post.id);
    } catch {
      setIsLiked(prevLiked);
      setLikesCount(prevCount);
      toast.error('Failed to like post');
    }
  };

  const handleSave = async () => {
    const prevSaved = isSaved;
    setIsSaved(!isSaved);
    try {
      await feedService.savePost(post.id);
      toast.success(prevSaved ? 'Post unsaved' : 'Post saved');
    } catch {
      setIsSaved(prevSaved);
      toast.error('Failed to save post');
    }
  };

  const handleCommentCountChange = (delta: number) => {
    setCommentsCount((prev) => prev + delta);
  };

  const name = `${post.author.firstName} ${post.author.lastName}`;
  const hasMedia = post.attachments.length > 0;
  const mediaItems: MediaItem[] = post.attachments.map((att) => ({
    id: att.id,
    type: att.postAttachmentType,
    url: att.postAttachmentUrl,
    title: att.postAttachmentTitle,
  }));

  const visibilityIcon = {
    public: <PiGlobeSimpleBold className="h-3 w-3" />,
    connections: <PiUsersBold className="h-3 w-3" />,
    private: <PiLockBold className="h-3 w-3" />,
  }[post.postVisibility];

  // Format post content with clickable hashtags
  const renderContent = (text: string) => {
    const parts = text.split(/(#\w+)/g);
    return parts.map((part, i) => {
      if (part.startsWith('#')) {
        return (
          <span key={i} className="cursor-pointer font-semibold text-primary hover:underline">
            {part}
          </span>
        );
      }
      return part;
    });
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[1000] flex items-center justify-center"
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/60" onClick={onClose} />

          {/* Modal Content */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className={cn(
              'relative z-10 flex max-h-[90vh] w-full overflow-hidden rounded-2xl bg-background shadow-2xl',
              hasMedia ? 'max-w-5xl' : 'max-w-2xl'
            )}
          >
            {/* Left: Media panel (only if attachments) */}
            {hasMedia && (
              <div className="relative hidden w-[55%] flex-shrink-0 bg-black md:block">
                {/* Current media */}
                <div className="relative flex h-full items-center justify-center">
                  {post.attachments[mediaIndex]?.postAttachmentType === 'image' ? (
                    <Image
                      src={getApiMediaUrl(post.attachments[mediaIndex].postAttachmentUrl)}
                      alt={post.attachments[mediaIndex].postAttachmentTitle || 'Post image'}
                      fill
                      className="cursor-pointer object-contain"
                      sizes="55vw"
                      onClick={() => {
                        setLightboxIndex(mediaIndex);
                        setLightboxOpen(true);
                      }}
                    />
                  ) : post.attachments[mediaIndex]?.postAttachmentType === 'video' ? (
                    <video
                      src={getApiMediaUrl(post.attachments[mediaIndex].postAttachmentUrl)}
                      className="max-h-full max-w-full"
                      controls
                      autoPlay
                    />
                  ) : (
                    <div className="flex flex-col items-center gap-3 p-8 text-center text-white/60">
                      <PiArrowSquareOutBold className="h-12 w-12" />
                      <Text className="text-sm">
                        {post.attachments[mediaIndex]?.postAttachmentTitle || 'Document'}
                      </Text>
                    </div>
                  )}

                  {/* Fullscreen button */}
                  {post.attachments[mediaIndex]?.postAttachmentType === 'image' && (
                    <button
                      className="absolute bottom-4 right-4 rounded-lg bg-black/50 p-2 text-white/80 transition-colors hover:bg-black/70 hover:text-white"
                      onClick={() => {
                        setLightboxIndex(mediaIndex);
                        setLightboxOpen(true);
                      }}
                    >
                      <PiArrowsOutBold className="h-5 w-5" />
                    </button>
                  )}
                </div>

                {/* Media nav arrows */}
                {post.attachments.length > 1 && (
                  <>
                    <button
                      className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-black/40 p-2 text-white/80 transition-colors hover:bg-black/60"
                      onClick={() =>
                        setMediaIndex((p) => (p > 0 ? p - 1 : post.attachments.length - 1))
                      }
                    >
                      <PiCaretLeftBold className="h-4 w-4" />
                    </button>
                    <button
                      className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-black/40 p-2 text-white/80 transition-colors hover:bg-black/60"
                      onClick={() =>
                        setMediaIndex((p) => (p < post.attachments.length - 1 ? p + 1 : 0))
                      }
                    >
                      <PiCaretRightBold className="h-4 w-4" />
                    </button>

                    {/* Dots indicator */}
                    <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-1.5">
                      {post.attachments.map((_, idx) => (
                        <button
                          key={idx}
                          onClick={() => setMediaIndex(idx)}
                          className={cn(
                            'h-2 rounded-full transition-all',
                            idx === mediaIndex ? 'w-6 bg-white' : 'w-2 bg-white/40'
                          )}
                        />
                      ))}
                    </div>
                  </>
                )}
              </div>
            )}

            {/* Right: Post content + comments */}
            <div className="flex min-w-0 flex-1 flex-col">
              {/* Header */}
              <div className="flex items-start justify-between border-b border-muted p-4">
                <div className="flex gap-3">
                  <Link href={`/profile/${post.author.id}`} className="flex-shrink-0">
                    <Avatar
                      name={name}
                      src={getApiMediaUrl(post.author.avatarURL) || '/growthlab/founder.jpg'}
                      size="md"
                      className="ring-2 ring-primary/10 ring-offset-2"
                    />
                  </Link>
                  <div>
                    <Link
                      href={`/profile/${post.author.id}`}
                      className="transition-colors hover:text-primary"
                    >
                      <Title as="h4" className="text-sm font-bold">
                        {name}
                      </Title>
                    </Link>
                    <Text className="mt-0.5 line-clamp-1 text-[11px] text-gray-400">
                      {post.author.headline || 'Ecosystem Partner'}
                    </Text>
                    <div className="mt-1 flex items-center gap-1.5 text-[10px] text-gray-400">
                      <span>{dayjs(post.createdAt).fromNow()}</span>
                      <span>·</span>
                      <span className="flex items-center gap-1">
                        {visibilityIcon}
                        <span className="capitalize">{post.postVisibility}</span>
                      </span>
                      {post.viewsCount > 0 && (
                        <>
                          <span>·</span>
                          <span className="flex items-center gap-1">
                            <PiEyeBold className="h-3 w-3" />
                            {post.viewsCount.toLocaleString()} views
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                <ActionIcon
                  variant="text"
                  className="rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                  onClick={onClose}
                >
                  <PiXBold className="h-5 w-5" />
                </ActionIcon>
              </div>

              {/* Scrollable content area */}
              <div className="flex-1 overflow-y-auto">
                {/* Post content */}
                <div className="p-4">
                  <p className="whitespace-pre-wrap text-sm leading-relaxed text-gray-700">
                    {renderContent(post.postContent)}
                  </p>

                  {/* Hashtags */}
                  {post.postHashTags.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {post.postHashTags.map((tag) => (
                        <span
                          key={tag}
                          className="cursor-pointer rounded-full bg-primary/5 px-2.5 py-1 text-[11px] font-semibold text-primary hover:bg-primary/10"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Mobile media (shown when left panel hidden) */}
                {hasMedia && (
                  <div className="px-4 pb-3 md:hidden">
                    <div
                      className={cn(
                        'grid gap-1',
                        post.attachments.length === 1 ? 'grid-cols-1' : 'grid-cols-2'
                      )}
                    >
                      {post.attachments.slice(0, 4).map((att, idx) => (
                        <div
                          key={att.id}
                          className={cn(
                            'relative cursor-pointer overflow-hidden rounded-xl bg-gray-50',
                            post.attachments.length === 1 ? 'aspect-video' : 'aspect-square',
                            post.attachments.length === 3 && idx === 0 ? 'col-span-2 aspect-video' : ''
                          )}
                          onClick={() => {
                            setLightboxIndex(idx);
                            setLightboxOpen(true);
                          }}
                        >
                          {att.postAttachmentType === 'image' ? (
                            <Image
                              src={getApiMediaUrl(att.postAttachmentUrl)}
                              alt={att.postAttachmentTitle || ''}
                              fill
                              className="object-cover"
                            />
                          ) : att.postAttachmentType === 'video' ? (
                            <div className="flex h-full items-center justify-center bg-black">
                              <PiPlayFill className="h-10 w-10 text-white/80" />
                            </div>
                          ) : null}
                          {idx === 3 && post.attachments.length > 4 && (
                            <div className="absolute inset-0 flex items-center justify-center bg-black/50 text-lg font-bold text-white">
                              +{post.attachments.length - 4}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Stats bar */}
                <div className="flex items-center justify-between border-t border-b border-muted px-4 py-2 text-[11px] text-gray-400">
                  <div className="flex items-center gap-1">
                    <PiHeartFill className="h-3 w-3 text-red-500" />
                    <span>{likesCount} likes</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span>{commentsCount} comments</span>
                    <span>·</span>
                    <span>{post.sharesCount + post.repostsCount} shares</span>
                  </div>
                </div>

                {/* Action Bar */}
                <div className="flex gap-1 border-b border-muted px-2 py-1">
                  <Button
                    variant="text"
                    className={cn(
                      'h-9 flex-1 gap-2 rounded-xl text-xs font-bold',
                      isLiked ? 'text-primary' : 'text-gray-500 hover:bg-gray-50'
                    )}
                    onClick={handleLike}
                  >
                    {isLiked ? (
                      <PiHeartFill className="h-4 w-4" />
                    ) : (
                      <PiHeartBold className="h-4 w-4" />
                    )}
                    Like
                  </Button>
                  <Button
                    variant="text"
                    className="h-9 flex-1 gap-2 rounded-xl text-xs font-bold text-gray-500 hover:bg-gray-50"
                    onClick={() => setShowShareDialog(true)}
                  >
                    <PiShareFatBold className="h-4 w-4" />
                    Share
                  </Button>
                  <Button
                    variant="text"
                    className={cn(
                      'h-9 gap-2 rounded-xl text-xs font-bold',
                      isSaved ? 'text-primary' : 'text-gray-500 hover:bg-gray-50'
                    )}
                    onClick={handleSave}
                  >
                    {isSaved ? (
                      <PiBookmarkSimpleFill className="h-4 w-4" />
                    ) : (
                      <PiBookmarkSimpleBold className="h-4 w-4" />
                    )}
                  </Button>
                </div>

                {/* Comments section - always visible in detail */}
                <CommentSection postId={post.id} onCommentCountChange={handleCommentCountChange} />
              </div>
            </div>
          </motion.div>

          {/* Fullscreen lightbox */}
          <MediaLightbox
            items={mediaItems}
            initialIndex={lightboxIndex}
            isOpen={lightboxOpen}
            onClose={() => setLightboxOpen(false)}
          />

          {/* Share dialog */}
          <ShareDialog
            isOpen={showShareDialog}
            onClose={() => setShowShareDialog(false)}
            post={post}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
