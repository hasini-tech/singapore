'use client';

import { useState } from 'react';
import {
  PiXBold,
  PiGlobeSimpleBold,
  PiUsersBold,
  PiLockBold,
  PiLinkBold,
  PiCopyBold,
  PiShareFatBold,
} from 'react-icons/pi';
import { FaXTwitter, FaLinkedinIn, FaWhatsapp } from 'react-icons/fa6';
import { Title, Text, Button, Avatar, ActionIcon, Textarea } from 'rizzui';
import cn from '@/utils/class-names';
import { Modal } from '@/modal-views/modal';
import { feedService } from '@/services/feed.service';
import { PostResponse } from '@/types/feed';
import { toast } from 'react-hot-toast';

interface ShareDialogProps {
  isOpen: boolean;
  onClose: () => void;
  post: PostResponse;
}

export default function ShareDialog({ isOpen, onClose, post }: ShareDialogProps) {
  const [caption, setCaption] = useState('');
  const [visibility, setVisibility] = useState<'public' | 'connections' | 'private'>('public');
  const [submitting, setSubmitting] = useState(false);

  const postUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/feed/posts/${post.id}`
    : '';
  const authorName = `${post.author.firstName} ${post.author.lastName}`;

  const handleRepost = async () => {
    if (submitting) return;
    setSubmitting(true);
    try {
      await feedService.repostPost(post.id, {
        caption: caption.trim() || undefined,
        visibility,
      });
      toast.success('Post shared successfully!');
      setCaption('');
      onClose();
    } catch {
      toast.error('Failed to share post');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(postUrl);
      toast.success('Link copied to clipboard');
      // Track the share
      feedService.sharePost(post.id).catch(() => {});
    } catch {
      toast.error('Failed to copy link');
    }
  };

  const handleExternalShare = (platform: 'twitter' | 'linkedin' | 'whatsapp') => {
    const text = `Check out this post by ${authorName}`;
    const urls: Record<string, string> = {
      twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(postUrl)}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(postUrl)}`,
      whatsapp: `https://wa.me/?text=${encodeURIComponent(text + ' ' + postUrl)}`,
    };
    window.open(urls[platform], '_blank', 'noopener,noreferrer,width=600,height=400');
    feedService.sharePost(post.id).catch(() => {});
  };

  const visibilityOptions = [
    { value: 'public' as const, icon: PiGlobeSimpleBold, label: 'Public' },
    { value: 'connections' as const, icon: PiUsersBold, label: 'Connections' },
    { value: 'private' as const, icon: PiLockBold, label: 'Only me' },
  ];

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="md" rounded="lg">
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <Title as="h3" className="text-lg font-bold">Share post</Title>
          <ActionIcon
            variant="text"
            onClick={onClose}
            className="rounded-full hover:bg-gray-100 border border-gray-200"
          >
            <PiXBold className="h-4 w-4" />
          </ActionIcon>
        </div>

        {/* Repost Section */}
        <div className="mb-4">
          <Text className="text-xs font-bold text-gray-500 mb-2">Repost with your thoughts</Text>
          <Textarea
            placeholder="Add a caption (optional)..."
            className="mb-3"
            textareaClassName="border-gray-200 focus:ring-primary/30 text-sm resize-none rounded-xl"
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            maxLength={1000}
          />

          {/* Visibility */}
          <div className="flex items-center gap-2 mb-4">
            {visibilityOptions.map((opt) => (
              <Button
                key={opt.value}
                variant={visibility === opt.value ? 'solid' : 'outline'}
                size="sm"
                className={cn(
                  'h-7 rounded-lg px-2.5 text-[11px] font-bold gap-1',
                  visibility === opt.value
                    ? 'bg-primary text-white'
                    : 'border-gray-200 text-gray-500'
                )}
                onClick={() => setVisibility(opt.value)}
              >
                <opt.icon className="h-3 w-3" />
                {opt.label}
              </Button>
            ))}
          </div>

          <Button
            onClick={handleRepost}
            isLoading={submitting}
            disabled={submitting}
            className="w-full rounded-xl font-bold bg-primary hover:bg-primary/90 text-white shadow-md shadow-primary/20"
          >
            <PiShareFatBold className="h-4 w-4 mr-2" />
            Repost
          </Button>
        </div>

        {/* Divider */}
        <div className="relative my-5">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-muted" />
          </div>
          <div className="relative flex justify-center">
            <span className="bg-background px-3 text-xs text-gray-400">or share via</span>
          </div>
        </div>

        {/* External Share Options */}
        <div className="flex justify-center gap-3">
          <ActionIcon
            variant="outline"
            className="h-11 w-11 rounded-xl border-gray-200 hover:border-gray-900 hover:bg-gray-900 hover:text-white transition-all"
            onClick={() => handleExternalShare('twitter')}
          >
            <FaXTwitter className="h-4 w-4" />
          </ActionIcon>
          <ActionIcon
            variant="outline"
            className="h-11 w-11 rounded-xl border-gray-200 hover:border-[#0A66C2] hover:bg-[#0A66C2] hover:text-white transition-all"
            onClick={() => handleExternalShare('linkedin')}
          >
            <FaLinkedinIn className="h-4 w-4" />
          </ActionIcon>
          <ActionIcon
            variant="outline"
            className="h-11 w-11 rounded-xl border-gray-200 hover:border-[#25D366] hover:bg-[#25D366] hover:text-white transition-all"
            onClick={() => handleExternalShare('whatsapp')}
          >
            <FaWhatsapp className="h-5 w-5" />
          </ActionIcon>
          <ActionIcon
            variant="outline"
            className="h-11 w-11 rounded-xl border-gray-200 hover:border-primary hover:bg-primary/5 hover:text-primary transition-all"
            onClick={handleCopyLink}
          >
            <PiCopyBold className="h-4 w-4" />
          </ActionIcon>
        </div>
      </div>
    </Modal>
  );
}
