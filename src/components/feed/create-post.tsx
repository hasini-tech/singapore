'use client';

import { useState, useRef } from 'react';
import Image from 'next/image';
import {
  PiImageBold,
  PiVideoCameraBold,
  PiCalendarBlankBold,
  PiArticleBold,
  PiXBold,
  PiGlobeSimpleBold,
  PiUsersBold,
  PiLockBold,
  PiCaretDownBold,
  PiFilePdfBold,
  PiTrashBold,
} from 'react-icons/pi';
import { Title, Text, Button, Avatar, ActionIcon, Textarea, Loader } from 'rizzui';
import cn from '@/utils/class-names';
import { Modal } from '@/modal-views/modal';
import { useAuth } from '@/context/auth-context';
import { getApiMediaUrl } from '@/utils/get-api-media-url';
import { feedService } from '@/services/feed.service';
import { PostResponse, UploadResponse } from '@/types/feed';
import { toast } from 'react-hot-toast';

interface CreatePostProps {
  onPostCreated?: (post: PostResponse) => void;
}

interface PendingAttachment {
  file: File;
  preview: string;
  type: 'image' | 'video' | 'document';
  uploading: boolean;
  uploaded?: UploadResponse;
  error?: string;
}

export default function CreatePost({ onPostCreated }: CreatePostProps) {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [content, setContent] = useState('');
  const [visibility, setVisibility] = useState<'public' | 'connections' | 'private'>('public');
  const [attachments, setAttachments] = useState<PendingAttachment[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [showVisibilityMenu, setShowVisibilityMenu] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [fileAccept, setFileAccept] = useState('');

  const handleOpen = () => setIsOpen(true);

  const handleClose = () => {
    if (submitting) return;
    setIsOpen(false);
    setContent('');
    setAttachments([]);
  };

  const extractHashtags = (text: string): string[] => {
    const matches = text.match(/#(\w+)/g);
    return matches ? matches.map((tag) => tag.slice(1)) : [];
  };

  const handleFileSelect = (accept: string) => {
    setFileAccept(accept);
    setTimeout(() => fileInputRef.current?.click(), 0);
  };

  const handleFilesChosen = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    const newAttachments: PendingAttachment[] = files.map((file) => {
      const type = file.type.startsWith('image/')
        ? 'image'
        : file.type.startsWith('video/')
          ? 'video'
          : 'document';
      return {
        file,
        preview: type === 'image' ? URL.createObjectURL(file) : '',
        type,
        uploading: true,
      };
    });

    setAttachments((prev) => [...prev, ...newAttachments]);

    // Upload each file
    for (let i = 0; i < newAttachments.length; i++) {
      const att = newAttachments[i];
      try {
        const result = await feedService.uploadAttachment(att.file);
        setAttachments((prev) =>
          prev.map((a) =>
            a.file === att.file ? { ...a, uploading: false, uploaded: result } : a
          )
        );
      } catch {
        setAttachments((prev) =>
          prev.map((a) =>
            a.file === att.file
              ? { ...a, uploading: false, error: 'Upload failed' }
              : a
          )
        );
        toast.error(`Failed to upload ${att.file.name}`);
      }
    }

    // Reset file input
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removeAttachment = (index: number) => {
    setAttachments((prev) => {
      const removed = prev[index];
      if (removed.preview) URL.revokeObjectURL(removed.preview);
      return prev.filter((_, i) => i !== index);
    });
  };

  const handleSubmit = async () => {
    const trimmed = content.trim();
    if (!trimmed) return;

    // Check all attachments are uploaded
    const pendingUploads = attachments.filter((a) => a.uploading);
    if (pendingUploads.length > 0) {
      toast.error('Please wait for uploads to complete');
      return;
    }

    const failedUploads = attachments.filter((a) => a.error);
    if (failedUploads.length > 0) {
      toast.error('Please remove failed uploads before posting');
      return;
    }

    setSubmitting(true);
    try {
      const hashtags = extractHashtags(trimmed);
      const uploadedAttachments = attachments
        .filter((a) => a.uploaded)
        .map((a) => a.uploaded!.attachment_data)
        .map((ad) => ({
          postAttachmentType: ad.postAttachmentType as 'image' | 'video' | 'document',
          postAttachmentUrl: ad.postAttachmentUrl,
          postAttachmentTitle: ad.postAttachmentTitle,
        }));

      const post = await feedService.createPost({
        postContent: trimmed,
        postVisibility: visibility,
        postHashTags: hashtags,
        attachments: uploadedAttachments,
      });

      toast.success('Post created!');
      onPostCreated?.(post);
      handleClose();
    } catch {
      toast.error('Failed to create post');
    } finally {
      setSubmitting(false);
    }
  };

  const actions = [
    {
      label: 'Photo',
      icon: PiImageBold,
      color: 'text-blue-500',
      bg: 'bg-blue-50/50',
      accept: 'image/jpeg,image/png,image/gif,image/webp',
    },
    {
      label: 'Video',
      icon: PiVideoCameraBold,
      color: 'text-green-500',
      bg: 'bg-green-50/50',
      accept: 'video/mp4,video/quicktime',
    },
    {
      label: 'Document',
      icon: PiFilePdfBold,
      color: 'text-amber-500',
      bg: 'bg-amber-50/50',
      accept: '.pdf',
    },
    {
      label: 'Article',
      icon: PiArticleBold,
      color: 'text-rose-500',
      bg: 'bg-rose-50/50',
      accept: '',
    },
  ];

  const visibilityOptions = [
    { value: 'public' as const, icon: PiGlobeSimpleBold, label: 'Public' },
    { value: 'connections' as const, icon: PiUsersBold, label: 'Connections' },
    { value: 'private' as const, icon: PiLockBold, label: 'Only me' },
  ];

  return (
    <>
      <div className="rounded-2xl border border-muted bg-background p-4 shadow-sm">
        <div className="mb-4 flex gap-3">
          <Avatar
            name={user?.name || 'User'}
            src={getApiMediaUrl(user?.avatarURL) || '/growthlab/founder.jpg'}
            size="md"
            className="ring-2 ring-primary/10 ring-offset-2 ring-offset-white dark:ring-offset-gray-900"
          />
          <button
            onClick={handleOpen}
            className="flex-1 rounded-full border border-transparent bg-gray-50 px-6 text-left text-sm font-medium text-gray-500 transition-colors hover:border-gray-200 hover:bg-gray-100"
          >
            Start a post...
          </button>
        </div>

        <div className="flex justify-between gap-2 overflow-x-auto pt-1 no-scrollbar">
          {actions.map((action) => (
            <Button
              key={action.label}
              variant="text"
              className={cn(
                'h-10 flex-1 gap-2 whitespace-nowrap rounded-xl text-xs font-bold transition-all',
                'text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-200'
              )}
              onClick={handleOpen}
            >
              <action.icon className={cn('h-5 w-5', action.color)} />
              {action.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept={fileAccept}
        multiple={fileAccept.startsWith('image/')}
        className="hidden"
        onChange={handleFilesChosen}
      />

      {/* Post Modal */}
      <Modal isOpen={isOpen} onClose={handleClose} size="lg" rounded="lg">
        <div className="p-6">
          <div className="mb-6 flex items-center justify-between">
            <Title as="h3" className="text-xl font-bold">
              Create a post
            </Title>
            <ActionIcon
              variant="text"
              onClick={handleClose}
              className="rounded-full border border-gray-200 hover:bg-gray-100"
            >
              <PiXBold className="h-5 w-5" />
            </ActionIcon>
          </div>

          <div className="mb-6 flex gap-3">
            <Avatar
              name={user?.name || 'User'}
              src={getApiMediaUrl(user?.avatarURL) || '/growthlab/founder.jpg'}
              size="md"
            />
            <div>
              <Title as="h4" className="text-sm font-bold">
                {user?.name || 'User'}
              </Title>
              {/* Visibility Selector */}
              <div className="relative">
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-1 h-7 gap-1.5 rounded-lg border-gray-200 px-2 text-[11px] font-bold text-gray-500"
                  onClick={() => setShowVisibilityMenu(!showVisibilityMenu)}
                >
                  {visibility === 'public' ? (
                    <PiGlobeSimpleBold className="h-3.5 w-3.5" />
                  ) : visibility === 'connections' ? (
                    <PiUsersBold className="h-3.5 w-3.5" />
                  ) : (
                    <PiLockBold className="h-3.5 w-3.5" />
                  )}
                  <span className="capitalize">{visibility}</span>
                  <PiCaretDownBold className="h-3 w-3" />
                </Button>
                {showVisibilityMenu && (
                  <div className="absolute top-full left-0 z-50 mt-1 w-40 rounded-xl border border-muted bg-background p-1 shadow-lg">
                    {visibilityOptions.map((opt) => (
                      <button
                        key={opt.value}
                        className={cn(
                          'flex w-full items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors',
                          visibility === opt.value
                            ? 'bg-primary/5 text-primary'
                            : 'text-gray-600 hover:bg-gray-50'
                        )}
                        onClick={() => {
                          setVisibility(opt.value);
                          setShowVisibilityMenu(false);
                        }}
                      >
                        <opt.icon className="h-3.5 w-3.5" />
                        {opt.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          <Textarea
            placeholder="What do you want to talk about?"
            className="mb-4 min-h-[180px]"
            textareaClassName="border-none focus:ring-0 text-lg p-0 resize-none no-scrollbar bg-transparent placeholder:text-gray-300"
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />

          {/* Attachment Previews */}
          {attachments.length > 0 && (
            <div className="mb-4 grid grid-cols-3 gap-2">
              {attachments.map((att, idx) => (
                <div
                  key={idx}
                  className="group relative h-24 overflow-hidden rounded-xl border border-muted bg-gray-50"
                >
                  {att.type === 'image' && att.preview ? (
                    <Image
                      src={att.preview}
                      alt="Preview"
                      fill
                      className="object-cover"
                    />
                  ) : att.type === 'video' ? (
                    <div className="flex h-full items-center justify-center">
                      <PiVideoCameraBold className="h-8 w-8 text-green-500" />
                    </div>
                  ) : (
                    <div className="flex h-full items-center justify-center">
                      <PiFilePdfBold className="h-8 w-8 text-amber-500" />
                    </div>
                  )}

                  {att.uploading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                      <Loader variant="threeDot" className="text-white" />
                    </div>
                  )}

                  {att.error && (
                    <div className="absolute inset-0 flex items-center justify-center bg-red-500/20">
                      <Text className="text-[10px] font-bold text-red-600">Failed</Text>
                    </div>
                  )}

                  <ActionIcon
                    variant="flat"
                    size="sm"
                    className="absolute right-1 top-1 h-6 w-6 rounded-full bg-black/50 text-white opacity-0 transition-opacity group-hover:opacity-100"
                    onClick={() => removeAttachment(idx)}
                  >
                    <PiXBold className="h-3 w-3" />
                  </ActionIcon>

                  <Text className="absolute bottom-1 left-1 right-1 truncate text-[9px] font-medium text-white drop-shadow">
                    {att.file.name}
                  </Text>
                </div>
              ))}
            </div>
          )}

          <div className="mb-4 flex flex-wrap gap-2">
            {actions
              .filter((a) => a.accept)
              .map((action) => (
                <ActionIcon
                  key={action.label}
                  variant="flat"
                  className={cn(
                    'h-10 w-10 rounded-xl',
                    action.bg,
                    action.color,
                    'hover:opacity-80'
                  )}
                  onClick={() => handleFileSelect(action.accept)}
                >
                  <action.icon className="h-6 w-6" />
                </ActionIcon>
              ))}
          </div>

          <div className="flex items-center justify-between border-t border-muted pt-4">
            <div className="text-xs font-medium text-gray-400">
              {content.length} / 3000 characters
              {extractHashtags(content).length > 0 && (
                <span className="ml-2 text-primary">
                  {extractHashtags(content).length} hashtag(s)
                </span>
              )}
            </div>
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={handleClose}
                className="rounded-xl font-bold border-gray-200"
                disabled={submitting}
              >
                Cancel
              </Button>
              <Button
                disabled={!content.trim() || submitting}
                isLoading={submitting}
                className="rounded-xl bg-primary px-8 font-extrabold text-white shadow-lg shadow-primary/20 hover:bg-primary/90"
                onClick={handleSubmit}
              >
                Post
              </Button>
            </div>
          </div>
        </div>
      </Modal>
    </>
  );
}
