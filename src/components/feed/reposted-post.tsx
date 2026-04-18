'use client';

import Image from 'next/image';
import Link from 'next/link';
import { PiGlobeSimpleBold, PiUsersBold, PiLockBold } from 'react-icons/pi';
import { Title, Text, Avatar } from 'rizzui';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
dayjs.extend(relativeTime);
import { PostResponse as Post } from '@/types/feed';
import { getApiMediaUrl } from '@/utils/get-api-media-url';
import cn from '@/utils/class-names';

interface RepostedPostProps {
  post: Post;
  className?: string;
}

export default function RepostedPost({ post, className }: RepostedPostProps) {
  const name = `${post.author.firstName} ${post.author.lastName}`;
  
  const visibilityIcon = {
    public: <PiGlobeSimpleBold className="h-3 w-3" />,
    connections: <PiUsersBold className="h-3 w-3" />,
    private: <PiLockBold className="h-3 w-3" />,
  }[post.postVisibility];

  return (
    <div className={cn(
      "mt-2 overflow-hidden rounded-xl border border-muted bg-gray-50/50 transition-colors hover:bg-gray-50",
      className
    )}>
      <div className="p-3">
        {/* Header */}
        <div className="flex items-center gap-2 mb-2">
          <Avatar
            name={name}
            src={getApiMediaUrl(post.author.avatarURL) || '/growthlab/founder.jpg'}
            size="sm"
            className="h-6 w-6"
          />
          <div className="flex flex-col min-w-0">
            <div className="flex items-center gap-1.5">
              <Title as="h5" className="text-xs font-bold truncate">{name}</Title>
              <Text className="text-[10px] text-gray-400">· {dayjs(post.createdAt).fromNow()}</Text>
            </div>
            <div className="flex items-center gap-1 text-[9px] text-gray-400">
              {visibilityIcon}
              <span className="capitalize">{post.postVisibility}</span>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="text-xs text-gray-700 leading-relaxed line-clamp-3 mb-2">
          {post.postContent}
        </div>

        {/* Media Preview (Compact) */}
        {post.attachments && post.attachments.length > 0 && (
          <div className="relative aspect-video w-full overflow-hidden rounded-lg bg-gray-200">
            {post.attachments[0].postAttachmentType === 'image' ? (
              <Image
                src={getApiMediaUrl(post.attachments[0].postAttachmentUrl)}
                alt=""
                fill
                className="object-cover"
              />
            ) : post.attachments[0].postAttachmentType === 'video' ? (
              <div className="flex h-full w-full items-center justify-center bg-black">
                 <div className="h-8 w-8 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm">
                    <div className="w-0 h-0 border-t-[6px] border-t-transparent border-l-[10px] border-l-white border-b-[6px] border-b-transparent ml-1" />
                 </div>
              </div>
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-gray-100 text-[10px] text-gray-400 font-medium">
                Attachment: {post.attachments[0].postAttachmentType}
              </div>
            )}
            {post.attachments.length > 1 && (
              <div className="absolute bottom-2 right-2 rounded bg-black/60 px-1.5 py-0.5 text-[9px] font-bold text-white">
                +{post.attachments.length - 1} more
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
