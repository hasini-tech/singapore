'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import {
  PiXBold,
  PiCaretLeftBold,
  PiCaretRightBold,
  PiDownloadSimpleBold,
  PiArrowsOutBold,
} from 'react-icons/pi';
import { ActionIcon, Text } from 'rizzui';
import cn from '@/utils/class-names';
import { getApiMediaUrl } from '@/utils/get-api-media-url';

export interface MediaItem {
  id: number;
  type: 'image' | 'video' | 'document';
  url: string;
  title?: string | null;
}

interface MediaLightboxProps {
  items: MediaItem[];
  initialIndex: number;
  isOpen: boolean;
  onClose: () => void;
}

export default function MediaLightbox({
  items,
  initialIndex,
  isOpen,
  onClose,
}: MediaLightboxProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (isOpen) setCurrentIndex(initialIndex);
  }, [isOpen, initialIndex]);

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') goToPrev();
      if (e.key === 'ArrowRight') goToNext();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, currentIndex, items.length]);

  // Lock body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const goToPrev = useCallback(() => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : items.length - 1));
  }, [items.length]);

  const goToNext = useCallback(() => {
    setCurrentIndex((prev) => (prev < items.length - 1 ? prev + 1 : 0));
  }, [items.length]);

  if (!isOpen) return null;
  const current = items[currentIndex];
  if (!current) return null;

  const mediaUrl = getApiMediaUrl(current.url);
  const hasMultiple = items.length > 1;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/95"
          onClick={onClose}
        >
          {/* Top bar */}
          <div className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between p-4">
            <Text className="text-sm font-medium text-white/70">
              {hasMultiple
                ? `${currentIndex + 1} / ${items.length}`
                : current.title || ''}
            </Text>
            <div className="flex items-center gap-2">
              {current.type === 'image' && (
                <a
                  href={mediaUrl}
                  download
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                >
                  <ActionIcon
                    variant="text"
                    className="text-white/70 hover:text-white"
                  >
                    <PiDownloadSimpleBold className="h-5 w-5" />
                  </ActionIcon>
                </a>
              )}
              <ActionIcon
                variant="text"
                className="text-white/70 hover:text-white"
                onClick={onClose}
              >
                <PiXBold className="h-6 w-6" />
              </ActionIcon>
            </div>
          </div>

          {/* Main media area */}
          <div
            className="relative flex h-full w-full items-center justify-center p-16"
            onClick={(e) => e.stopPropagation()}
          >
            {current.type === 'image' ? (
              <motion.div
                key={currentIndex}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                className="relative h-full w-full"
              >
                <Image
                  src={mediaUrl}
                  alt={current.title || 'Post media'}
                  fill
                  className="object-contain"
                  sizes="100vw"
                  priority
                />
              </motion.div>
            ) : current.type === 'video' ? (
              <motion.div
                key={currentIndex}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex h-full w-full items-center justify-center"
              >
                <video
                  ref={videoRef}
                  src={mediaUrl}
                  className="max-h-full max-w-full"
                  controls
                  autoPlay
                />
              </motion.div>
            ) : null}
          </div>

          {/* Navigation arrows */}
          {hasMultiple && (
            <>
              <button
                className="absolute left-4 top-1/2 z-10 -translate-y-1/2 rounded-full bg-white/10 p-3 text-white backdrop-blur-sm transition-colors hover:bg-white/20"
                onClick={(e) => {
                  e.stopPropagation();
                  goToPrev();
                }}
              >
                <PiCaretLeftBold className="h-6 w-6" />
              </button>
              <button
                className="absolute right-4 top-1/2 z-10 -translate-y-1/2 rounded-full bg-white/10 p-3 text-white backdrop-blur-sm transition-colors hover:bg-white/20"
                onClick={(e) => {
                  e.stopPropagation();
                  goToNext();
                }}
              >
                <PiCaretRightBold className="h-6 w-6" />
              </button>
            </>
          )}

          {/* Thumbnail strip */}
          {hasMultiple && (
            <div className="absolute bottom-4 left-1/2 z-10 flex -translate-x-1/2 gap-2">
              {items.map((item, idx) => (
                <button
                  key={item.id}
                  onClick={(e) => {
                    e.stopPropagation();
                    setCurrentIndex(idx);
                  }}
                  className={cn(
                    'h-14 w-14 overflow-hidden rounded-lg border-2 transition-all',
                    idx === currentIndex
                      ? 'border-white opacity-100 ring-2 ring-white/30'
                      : 'border-transparent opacity-50 hover:opacity-75'
                  )}
                >
                  {item.type === 'image' ? (
                    <Image
                      src={getApiMediaUrl(item.url)}
                      alt=""
                      width={56}
                      height={56}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-white/10 text-[10px] font-bold uppercase text-white/70">
                      {item.type}
                    </div>
                  )}
                </button>
              ))}
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
