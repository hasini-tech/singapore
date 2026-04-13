'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  PiDotsThreeOutlineVerticalBold,
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
  PiTrashBold,
  PiCopyBold,
  PiLinkBold,
} from 'react-icons/pi';
import { Title, Text, Button, Avatar, Collapse, ActionIcon, Badge, Popover } from 'rizzui';
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

interface PostCardProps {
  post: Post;
  className?: string;
  onDeleted?: (postId: number) => void;
}

export default function PostCard({ post, className, onDeleted }: PostCardProps) {
  const { user } = useAuth();
  const [isLiked, setIsLiked] = useState(post.isLiked);
  const [likesCount, setLikesCount] = useState(post.likesCount);
  const [isSaved, setIsSaved] = useState(post.isSaved);
  const [commentsCount, setCommentsCount] = useState(post.commentsCount);
  const [showComments, setShowComments] = useState(false);
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const isOwnPost = user?.id ? Number(user.id) === post.authorID : false;

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

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await feedService.deletePost(post.id);
      toast.success('Post deleted');
      onDeleted?.(post.id);
    } catch {
      toast.error('Failed to delete post');
    } finally {
      setDeleting(false);
      setMenuOpen(false);
    }
  };

  const handleCopyLink = async () => {
    const url = `${window.location.origin}/feed/posts/${post.id}`;
    try {
      await navigator.clipboard.writeText(url);
      toast.success('Link copied');
    } catch {
      toast.error('Failed to copy link');
    }
    setMenuOpen(false);
  };

  const handleCommentCountChange = (delta: number) => {
    setCommentsCount((prev) => prev + delta);
  };

  const name = `${post.author.firstName} ${post.author.lastName}`;

  const visibilityIcon = {
    public: <PiGlobeSimpleBold className="h-3 w-3" />,
    connections: <PiUsersBold className="h-3 w-3" />,
    private: <PiLockBold className="h-3 w-3" />,
  }[post.postVisibility];

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className={cn(
          'overflow-hidden rounded-2xl border border-muted bg-background shadow-sm',
          className
        )}
      >
        {/* Header */}
        <div className="flex items-start justify-between p-4 pb-3">
          <div className="flex gap-3">
            <Link href={`/profile/${post.author.id}`} className="flex-shrink-0">
              <Avatar
                name={name}
                src={getApiMediaUrl(post.author.avatarURL) || '/growthlab/founder.jpg'}
                size="md"
                className="ring-2 ring-primary/10 ring-offset-2 ring-offset-white dark:ring-offset-gray-900"
              />
            </Link>

            <div className="flex min-w-0 flex-col">
              <div className="flex flex-wrap items-center gap-1.5">
                <Link
                  href={`/profile/${post.author.id}`}
                  className="transition-colors hover:text-primary"
                >
                  <Title as="h4" className="line-clamp-1 truncate text-sm font-bold">
                    {name}
                  </Title>
                </Link>

                {post.author.isVerified && (
                  <Badge
                    variant="flat"
                    size="sm"
                    className="h-4 bg-primary/10 px-1.5 text-[10px] font-bold text-primary"
                  >
                    VERIFIED
                  </Badge>
                )}
              </div>

              <Text className="mt-0.5 line-clamp-1 truncate text-[11px] leading-tight text-gray-400">
                {post.author.headline || 'Ecosystem Partner @ GrowthLab'}
              </Text>

              <div className="mt-1 flex items-center gap-1.5 text-[10px] font-medium text-gray-400">
                <span>{dayjs(post.createdAt).fromNow()}</span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  {visibilityIcon}
                  <span className="capitalize">{post.postVisibility}</span>
                </span>
              </div>
            </div>
          </div>

          {/* Post Options Menu */}
          <Popover placement="bottom-end" isOpen={menuOpen} setIsOpen={setMenuOpen}>
            <Popover.Trigger>
              <ActionIcon variant="text" className="text-gray-400 hover:text-gray-600">
                <PiDotsThreeOutlineVerticalBold className="h-5 w-5" />
              </ActionIcon>
            </Popover.Trigger>
            <Popover.Content className="z-50 w-48 rounded-xl border border-muted bg-background p-1 shadow-lg">
              <button
                onClick={handleSave}
                className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-medium text-gray-600 transition-colors hover:bg-gray-50"
              >
                {isSaved ? (
                  <PiBookmarkSimpleFill className="h-4 w-4 text-primary" />
                ) : (
                  <PiBookmarkSimpleBold className="h-4 w-4" />
                )}
                {isSaved ? 'Unsave post' : 'Save post'}
              </button>
              <button
                onClick={handleCopyLink}
                className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-medium text-gray-600 transition-colors hover:bg-gray-50"
              >
                <PiCopyBold className="h-4 w-4" />
                Copy link
              </button>
              {isOwnPost && (
                <button
                  onClick={handleDelete}
                  disabled={deleting}
                  className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-medium text-red-500 transition-colors hover:bg-red-50"
                >
                  <PiTrashBold className="h-4 w-4" />
                  {deleting ? 'Deleting...' : 'Delete post'}
                </button>
              )}
            </Popover.Content>
          </Popover>
        </div>

        {/* Content */}
        <div className="px-4 pb-3 text-sm leading-relaxed text-gray-700">
          <Collapse header={() => null} className="group">
            <p className="whitespace-pre-wrap">{post.postContent}</p>
          </Collapse>
        </div>

        {/* Attachments - Media Gallery */}
        {post.attachments.length > 0 && (
          <div
            className={cn(
              'mb-3 grid gap-1 px-4',
              post.attachments.length === 1 ? 'grid-cols-1' : 'grid-cols-2'
            )}
          >
            {post.attachments.slice(0, 4).map((att, idx) => (
              <div
                key={att.id}
                className={cn(
                  'group relative cursor-pointer overflow-hidden rounded-xl bg-gray-50 aspect-video',
                  post.attachments.length === 1 ? 'h-[320px]' : 'h-[180px]',
                  post.attachments.length === 3 && idx === 0 ? 'col-span-2' : ''
                )}
              >
                {att.postAttachmentType === 'image' ? (
                  <Image
                    src={getApiMediaUrl(att.postAttachmentUrl)}
                    alt={att.postAttachmentTitle || 'Post attachment'}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                ) : att.postAttachmentType === 'video' ? (
                  <div className="flex h-full w-full items-center justify-center bg-black">
                    <video
                      src={getApiMediaUrl(att.postAttachmentUrl)}
                      className="h-full w-full object-contain"
                      controls
                    />
                  </div>
                ) : (
                  <div className="flex h-full w-full flex-col items-center justify-center gap-2 p-4 text-center">
                    <PiArrowSquareOutBold className="h-8 w-8 text-gray-400" />
                    <Text className="w-full truncate text-xs font-medium text-gray-500">
                      {att.postAttachmentTitle || att.postAttachmentUrl}
                    </Text>
                  </div>
                )}

                {idx === 3 && post.attachments.length > 4 && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/50 text-lg font-bold text-white">
                    +{post.attachments.length - 4}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Footer Stats */}
        <div className="flex items-center justify-between border-t border-muted px-4 py-2 text-[11px] text-gray-400">
          <div className="flex cursor-pointer items-center gap-1 transition-colors hover:text-primary">
            <div className="flex -space-x-1">
              <PiHeartFill className="h-3 w-3 rounded-full text-red-500 ring-2 ring-white dark:ring-gray-900" />
            </div>
            <span>{likesCount} likes</span>
          </div>
          <div className="flex items-center gap-3">
            <span
              className="cursor-pointer hover:underline"
              onClick={() => setShowComments(!showComments)}
            >
              {commentsCount} comments
            </span>
            <span>•</span>
            <span className="cursor-pointer hover:underline">{post.sharesCount + post.repostsCount} shares</span>
          </div>
        </div>

        {/* Action Bar */}
        <div className="flex gap-1 px-2 pb-2">
          <Button
            variant="text"
            className={cn(
              'h-10 flex-1 gap-2 rounded-xl text-xs font-bold',
              isLiked
                ? 'text-primary'
                : 'text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-200'
            )}
            onClick={handleLike}
          >
            {isLiked ? <PiHeartFill className="h-5 w-5" /> : <PiHeartBold className="h-5 w-5" />}
            Like
          </Button>

          <Button
            variant="text"
            className={cn(
              'h-10 flex-1 gap-2 rounded-xl text-xs font-bold',
              showComments
                ? 'text-primary bg-primary/5'
                : 'text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-200'
            )}
            onClick={() => setShowComments(!showComments)}
          >
            <PiChatCircleDotsBold className="h-5 w-5" />
            Comment
          </Button>

          <Button
            variant="text"
            className="h-10 flex-1 gap-2 rounded-xl text-xs font-bold text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-200"
            onClick={() => setShowShareDialog(true)}
          >
            <PiShareFatBold className="h-5 w-5" />
            Share
          </Button>

          <Button
            variant="text"
            className={cn(
              'h-10 w-10 gap-0 rounded-xl text-xs font-bold',
              isSaved
                ? 'text-primary'
                : 'text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-200'
            )}
            onClick={handleSave}
          >
            {isSaved ? (
              <PiBookmarkSimpleFill className="h-5 w-5" />
            ) : (
              <PiBookmarkSimpleBold className="h-5 w-5" />
            )}
          </Button>
        </div>

        {/* Comment Section */}
        {showComments && (
          <CommentSection postId={post.id} onCommentCountChange={handleCommentCountChange} />
        )}
      </motion.div>

      {/* Share Dialog */}
      <ShareDialog
        isOpen={showShareDialog}
        onClose={() => setShowShareDialog(false)}
        post={post}
      />
    </>
  );
}
