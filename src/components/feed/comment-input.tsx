'use client';

import { useState } from 'react';
import { PiPaperPlaneRightFill } from 'react-icons/pi';
import { Avatar, ActionIcon } from 'rizzui';
import cn from '@/utils/class-names';
import { feedService } from '@/services/feed.service';
import { CommentResponse } from '@/types/feed';
import { useAuth } from '@/context/auth-context';
import { getApiMediaUrl } from '@/utils/get-api-media-url';
import { toast } from 'react-hot-toast';

interface CommentInputProps {
  postId: number;
  parentCommentId?: number;
  onCommentAdded: (comment: CommentResponse) => void;
  compact?: boolean;
}

export default function CommentInput({
  postId,
  parentCommentId,
  onCommentAdded,
  compact = false,
}: CommentInputProps) {
  const { user } = useAuth();
  const [content, setContent] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    const trimmed = content.trim();
    if (!trimmed || submitting) return;

    setSubmitting(true);
    try {
      const comment = await feedService.createComment(postId, {
        commentContent: trimmed,
        ...(parentCommentId && { parentCommentID: parentCommentId }),
      });
      setContent('');
      onCommentAdded(comment);
    } catch {
      toast.error('Failed to post comment');
    } finally {
      setSubmitting(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className={cn('flex items-center gap-2', compact ? '' : 'pt-1')}>
      <Avatar
        name={user?.name || 'User'}
        src={getApiMediaUrl(user?.avatarURL) || '/growthlab/founder.jpg'}
        size={compact ? 'sm' : 'sm'}
        className="flex-shrink-0"
      />
      <div className="relative flex-1">
        <input
          type="text"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={parentCommentId ? 'Write a reply...' : 'Add a comment...'}
          className={cn(
            'w-full rounded-full border border-gray-200 bg-gray-50 pr-10 text-xs outline-none transition-colors',
            'placeholder:text-gray-400 focus:border-primary/30 focus:bg-background',
            'dark:border-gray-300 dark:bg-gray-100',
            compact ? 'py-1.5 px-3' : 'py-2 px-4'
          )}
          disabled={submitting}
        />
        <ActionIcon
          variant="text"
          size="sm"
          className={cn(
            'absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 rounded-full',
            content.trim()
              ? 'text-primary hover:bg-primary/10'
              : 'text-gray-300 cursor-not-allowed'
          )}
          onClick={handleSubmit}
          disabled={!content.trim() || submitting}
        >
          <PiPaperPlaneRightFill className="h-4 w-4" />
        </ActionIcon>
      </div>
    </div>
  );
}
