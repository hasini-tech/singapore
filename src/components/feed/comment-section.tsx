'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  PiHeartBold,
  PiHeartFill,
  PiArrowBendUpLeftBold,
  PiTrashBold,
  PiCaretDownBold,
} from 'react-icons/pi';
import { Text, Avatar, Button, ActionIcon, Loader } from 'rizzui';
import cn from '@/utils/class-names';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
dayjs.extend(relativeTime);
import { feedService } from '@/services/feed.service';
import { CommentResponse } from '@/types/feed';
import { useAuth } from '@/context/auth-context';
import { getApiMediaUrl } from '@/utils/get-api-media-url';
import { toast } from 'react-hot-toast';
import CommentInput from './comment-input';

interface CommentSectionProps {
  postId: number;
  onCommentCountChange?: (delta: number) => void;
}

export default function CommentSection({ postId, onCommentCountChange }: CommentSectionProps) {
  const { user } = useAuth();
  const [comments, setComments] = useState<CommentResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasNext, setHasNext] = useState(false);
  const [total, setTotal] = useState(0);

  const fetchComments = useCallback(
    async (pageNum: number, append = false) => {
      try {
        setLoading(true);
        const response = await feedService.getComments(postId, { page: pageNum, limit: 10 });
        if (append) {
          setComments((prev) => [...prev, ...response.comments]);
        } else {
          setComments(response.comments);
        }
        setHasNext(response.hasNext);
        setPage(response.page);
        setTotal(response.total);
      } catch {
        toast.error('Failed to load comments');
      } finally {
        setLoading(false);
      }
    },
    [postId]
  );

  useEffect(() => {
    fetchComments(1);
  }, [fetchComments]);

  const handleCommentAdded = (comment: CommentResponse) => {
    if (comment.parentCommentID) {
      // It's a reply — insert into the parent's replies
      setComments((prev) =>
        prev.map((c) =>
          c.id === comment.parentCommentID
            ? { ...c, replies: [...c.replies, comment] }
            : c
        )
      );
    } else {
      setComments((prev) => [comment, ...prev]);
    }
    setTotal((prev) => prev + 1);
    onCommentCountChange?.(1);
  };

  const handleDeleteComment = async (commentId: number, parentId: number | null) => {
    try {
      await feedService.deleteComment(commentId);
      if (parentId) {
        setComments((prev) =>
          prev.map((c) =>
            c.id === parentId
              ? { ...c, replies: c.replies.filter((r) => r.id !== commentId) }
              : c
          )
        );
      } else {
        setComments((prev) => prev.filter((c) => c.id !== commentId));
      }
      setTotal((prev) => prev - 1);
      onCommentCountChange?.(-1);
      toast.success('Comment deleted');
    } catch {
      toast.error('Failed to delete comment');
    }
  };

  return (
    <div className="border-t border-muted px-4 py-3">
      <CommentInput postId={postId} onCommentAdded={handleCommentAdded} />

      {loading && comments.length === 0 ? (
        <div className="flex justify-center py-4">
          <Loader variant="threeDot" />
        </div>
      ) : (
        <AnimatePresence>
          <div className="mt-3 space-y-3">
            {comments.map((comment) => (
              <CommentItem
                key={comment.id}
                comment={comment}
                postId={postId}
                currentUserId={user?.id ? Number(user.id) : undefined}
                onDelete={handleDeleteComment}
                onReplyAdded={handleCommentAdded}
              />
            ))}
          </div>
        </AnimatePresence>
      )}

      {hasNext && (
        <Button
          variant="text"
          size="sm"
          className="mt-2 h-auto p-0 text-xs font-bold text-gray-500 hover:text-primary"
          onClick={() => fetchComments(page + 1, true)}
          isLoading={loading}
        >
          <PiCaretDownBold className="h-3 w-3 mr-1" />
          Load more comments ({total - comments.length} remaining)
        </Button>
      )}
    </div>
  );
}

// ── Single Comment Item ──────────────────────

interface CommentItemProps {
  comment: CommentResponse;
  postId: number;
  currentUserId?: number;
  parentId?: number | null;
  onDelete: (commentId: number, parentId: number | null) => void;
  onReplyAdded: (comment: CommentResponse) => void;
  depth?: number;
}

function CommentItem({
  comment,
  postId,
  currentUserId,
  parentId = null,
  onDelete,
  onReplyAdded,
  depth = 0,
}: CommentItemProps) {
  const [isLiked, setIsLiked] = useState(comment.isLiked);
  const [likeCount, setLikeCount] = useState(comment.commentLikeCount);
  const [showReply, setShowReply] = useState(false);
  const [showReplies, setShowReplies] = useState(true);

  const authorName = `${comment.author.firstName} ${comment.author.lastName}`;
  const isOwn = currentUserId === comment.commentAuthorID;

  const handleLike = async () => {
    const prevLiked = isLiked;
    const prevCount = likeCount;
    setIsLiked(!isLiked);
    setLikeCount((prev) => (isLiked ? prev - 1 : prev + 1));
    try {
      await feedService.likeComment(comment.id);
    } catch {
      setIsLiked(prevLiked);
      setLikeCount(prevCount);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 5 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -5 }}
      className={cn('flex gap-2', depth > 0 && 'ml-8 mt-2')}
    >
      <Avatar
        name={authorName}
        src={getApiMediaUrl(comment.author.avatarURL) || '/growthlab/founder.jpg'}
        size="sm"
        className="mt-0.5 flex-shrink-0"
      />
      <div className="flex-1 min-w-0">
        <div className="rounded-xl bg-gray-50 dark:bg-gray-100 px-3 py-2">
          <Text className="text-xs font-bold">{authorName}</Text>
          <Text className="text-xs text-gray-600 mt-0.5 whitespace-pre-wrap break-words">
            {comment.commentContent}
          </Text>
        </div>

        {/* Comment Actions */}
        <div className="flex items-center gap-3 mt-1 px-1">
          <button
            onClick={handleLike}
            className={cn(
              'text-[11px] font-bold transition-colors',
              isLiked ? 'text-primary' : 'text-gray-400 hover:text-primary'
            )}
          >
            {isLiked ? 'Liked' : 'Like'}
            {likeCount > 0 && ` (${likeCount})`}
          </button>

          {depth < 2 && (
            <button
              onClick={() => setShowReply(!showReply)}
              className="text-[11px] font-bold text-gray-400 hover:text-primary transition-colors"
            >
              Reply
            </button>
          )}

          {isOwn && (
            <button
              onClick={() => onDelete(comment.id, parentId)}
              className="text-[11px] font-bold text-gray-400 hover:text-red-500 transition-colors"
            >
              Delete
            </button>
          )}

          <Text className="text-[10px] text-gray-300">
            {dayjs(comment.createdAt).fromNow()}
          </Text>
        </div>

        {/* Reply Input */}
        {showReply && (
          <div className="mt-2">
            <CommentInput
              postId={postId}
              parentCommentId={comment.id}
              onCommentAdded={(newComment) => {
                onReplyAdded(newComment);
                setShowReply(false);
              }}
              compact
            />
          </div>
        )}

        {/* Nested Replies */}
        {comment.replies?.length > 0 && (
          <>
            {!showReplies && (
              <button
                onClick={() => setShowReplies(true)}
                className="mt-1 text-[11px] font-bold text-primary hover:underline"
              >
                Show {comment.replies.length} {comment.replies.length === 1 ? 'reply' : 'replies'}
              </button>
            )}
            {showReplies &&
              comment.replies.map((reply) => (
                <CommentItem
                  key={reply.id}
                  comment={reply}
                  postId={postId}
                  currentUserId={currentUserId}
                  parentId={comment.id}
                  onDelete={onDelete}
                  onReplyAdded={onReplyAdded}
                  depth={depth + 1}
                />
              ))}
          </>
        )}
      </div>
    </motion.div>
  );
}
