'use client';

import { useState, useEffect, useCallback } from 'react';
import { PiBellBold, PiBellRingingFill } from 'react-icons/pi';
import { ActionIcon } from 'rizzui';
import cn from '@/utils/class-names';
import { notificationService } from '@/services/notification.service';

interface NotificationBellProps {
  onClick: () => void;
  className?: string;
}

export default function NotificationBell({ onClick, className }: NotificationBellProps) {
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchCount = useCallback(async () => {
    try {
      const data = await notificationService.getUnreadCount();
      setUnreadCount(data.unreadCount);
    } catch {
      // Silently fail - non-critical
    }
  }, []);

  useEffect(() => {
    fetchCount();
    const interval = setInterval(fetchCount, 30000); // Poll every 30s
    return () => clearInterval(interval);
  }, [fetchCount]);

  return (
    <ActionIcon
      variant="text"
      className={cn(
        'relative h-10 w-10 rounded-xl',
        unreadCount > 0
          ? 'text-primary'
          : 'text-gray-400 hover:text-gray-600',
        className
      )}
      onClick={onClick}
    >
      {unreadCount > 0 ? (
        <PiBellRingingFill className="h-5 w-5" />
      ) : (
        <PiBellBold className="h-5 w-5" />
      )}

      {unreadCount > 0 && (
        <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white shadow-sm">
          {unreadCount > 99 ? '99+' : unreadCount}
        </span>
      )}
    </ActionIcon>
  );
}
