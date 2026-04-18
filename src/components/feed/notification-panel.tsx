'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  PiXBold,
  PiBellBold,
  PiCheckBold,
  PiTrashBold,
  PiHeartFill,
  PiChatCircleDotsFill,
  PiShareFatFill,
  PiUserPlusFill,
  PiMegaphoneFill,
  PiCheckCircleBold,
} from 'react-icons/pi';
import { Title, Text, Avatar, Button, ActionIcon, Loader, Badge } from 'rizzui';
import cn from '@/utils/class-names';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
dayjs.extend(relativeTime);
import { notificationService } from '@/services/notification.service';
import { NotificationItem } from '@/types/feed';
import { getApiMediaUrl } from '@/utils/get-api-media-url';
import { toast } from 'react-hot-toast';

interface NotificationPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

type FeatureTab = 'all' | 'feed' | 'connections' | 'system';

const featureTabs: { label: string; value: FeatureTab }[] = [
  { label: 'All', value: 'all' },
  { label: 'Feed', value: 'feed' },
  { label: 'Connections', value: 'connections' },
  { label: 'System', value: 'system' },
];

function getNotificationIcon(type: string) {
  if (type.includes('like')) return <PiHeartFill className="h-3.5 w-3.5 text-red-500" />;
  if (type.includes('comment')) return <PiChatCircleDotsFill className="h-3.5 w-3.5 text-blue-500" />;
  if (type.includes('share') || type.includes('repost')) return <PiShareFatFill className="h-3.5 w-3.5 text-green-500" />;
  if (type.includes('connection') || type.includes('follow')) return <PiUserPlusFill className="h-3.5 w-3.5 text-primary" />;
  return <PiMegaphoneFill className="h-3.5 w-3.5 text-amber-500" />;
}

export default function NotificationPanel({ isOpen, onClose }: NotificationPanelProps) {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<FeatureTab>('all');
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchNotifications = useCallback(async () => {
    try {
      setLoading(true);
      const params: any = { limit: 50 };
      if (activeTab !== 'all') params.feature = activeTab;
      const data = await notificationService.getNotifications(params);
      setNotifications(data.notifications);
      setUnreadCount(data.unreadCount);
    } catch {
      toast.error('Failed to load notifications');
    } finally {
      setLoading(false);
    }
  }, [activeTab]);

  useEffect(() => {
    if (isOpen) fetchNotifications();
  }, [isOpen, fetchNotifications]);

  const handleMarkAsRead = async (id: number) => {
    try {
      await notificationService.markAsRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch {
      // silent
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead(activeTab !== 'all' ? activeTab : undefined);
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
      toast.success('All marked as read');
    } catch {
      toast.error('Failed to mark all as read');
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await notificationService.deleteNotification(id);
      setNotifications((prev) => prev.filter((n) => n.id !== id));
      toast.success('Notification removed');
    } catch {
      toast.error('Failed to remove notification');
    }
  };

  const handleNotificationClick = (notification: NotificationItem) => {
    if (!notification.isRead) handleMarkAsRead(notification.id);
    if (notification.actionUrl) {
      window.location.href = notification.actionUrl;
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Panel */}
      <motion.div
        initial={{ opacity: 0, y: -10, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -10, scale: 0.95 }}
        className="absolute right-0 top-12 z-50 w-[380px] max-h-[70vh] overflow-hidden rounded-2xl border border-muted bg-background shadow-2xl"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-muted px-4 py-3">
          <div className="flex items-center gap-2">
            <Title as="h3" className="text-base font-bold">Notifications</Title>
            {unreadCount > 0 && (
              <Badge variant="flat" className="h-5 bg-red-50 px-1.5 text-[10px] font-bold text-red-500">
                {unreadCount} new
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-1">
            {unreadCount > 0 && (
              <Button
                variant="text"
                size="sm"
                className="h-8 gap-1 text-[11px] font-bold text-gray-400 hover:text-primary"
                onClick={handleMarkAllAsRead}
              >
                <PiCheckCircleBold className="h-3.5 w-3.5" />
                Mark all read
              </Button>
            )}
            <ActionIcon
              variant="text"
              size="sm"
              className="h-8 w-8 rounded-lg text-gray-400 hover:text-gray-600"
              onClick={onClose}
            >
              <PiXBold className="h-4 w-4" />
            </ActionIcon>
          </div>
        </div>

        {/* Feature Tabs */}
        <div className="flex gap-1 border-b border-muted px-3 py-2">
          {featureTabs.map((tab) => (
            <Button
              key={tab.value}
              variant={activeTab === tab.value ? 'solid' : 'text'}
              size="sm"
              className={cn(
                'h-7 rounded-lg px-3 text-[11px] font-bold',
                activeTab === tab.value
                  ? 'bg-primary text-white'
                  : 'text-gray-500 hover:bg-gray-100'
              )}
              onClick={() => setActiveTab(tab.value)}
            >
              {tab.label}
            </Button>
          ))}
        </div>

        {/* Notification List */}
        <div className="overflow-y-auto max-h-[calc(70vh-120px)]">
          {loading ? (
            <div className="flex justify-center py-8">
              <Loader variant="threeDot" />
            </div>
          ) : notifications.length === 0 ? (
            <div className="py-12 text-center">
              <PiBellBold className="mx-auto mb-3 h-10 w-10 text-gray-200" />
              <Text className="text-sm text-gray-400">No notifications yet</Text>
            </div>
          ) : (
            <div>
              {notifications.map((notification) => (
                <motion.div
                  key={notification.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className={cn(
                    'group flex cursor-pointer gap-3 px-4 py-3 transition-colors hover:bg-gray-50',
                    !notification.isRead && 'bg-primary/[0.03]'
                  )}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div className="relative flex-shrink-0">
                    <Avatar
                      name={notification.actorName || 'System'}
                      src={getApiMediaUrl(notification.actorAvatar) || undefined}
                      size="sm"
                    />
                    <div className="absolute -bottom-0.5 -right-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-background shadow-sm ring-1 ring-muted">
                      {getNotificationIcon(notification.type)}
                    </div>
                  </div>

                  <div className="min-w-0 flex-1">
                    <Text
                      className={cn(
                        'text-xs leading-relaxed',
                        !notification.isRead ? 'font-semibold text-foreground' : 'text-gray-600'
                      )}
                    >
                      {notification.message}
                    </Text>
                    <Text className="mt-0.5 text-[10px] text-gray-400">
                      {dayjs(notification.createdAt).fromNow()}
                    </Text>
                  </div>

                  <div className="flex flex-shrink-0 items-start gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                    {!notification.isRead && (
                      <ActionIcon
                        variant="text"
                        size="sm"
                        className="h-6 w-6 rounded-md text-gray-300 hover:text-primary"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleMarkAsRead(notification.id);
                        }}
                      >
                        <PiCheckBold className="h-3 w-3" />
                      </ActionIcon>
                    )}
                    <ActionIcon
                      variant="text"
                      size="sm"
                      className="h-6 w-6 rounded-md text-gray-300 hover:text-red-500"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(notification.id);
                      }}
                    >
                      <PiTrashBold className="h-3 w-3" />
                    </ActionIcon>
                  </div>

                  {!notification.isRead && (
                    <div className="mt-2 flex-shrink-0">
                      <div className="h-2 w-2 rounded-full bg-primary" />
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </motion.div>
    </>
  );
}
