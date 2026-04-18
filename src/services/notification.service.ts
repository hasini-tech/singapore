import { apiRequest } from './api-client';
import {
  NotificationsResponse,
  UnreadCountByFeature,
} from '@/types/feed';

export const notificationService = {
  getNotifications: async (params: {
    feature?: 'feed' | 'connections' | 'pages' | 'profile' | 'system';
    unread_only?: boolean;
    skip?: number;
    limit?: number;
  } = {}) => {
    const { skip = 0, limit = 20, feature, unread_only = false } = params;
    let url = `/notifications?skip=${skip}&limit=${limit}&unread_only=${unread_only}`;
    if (feature) url += `&feature=${feature}`;
    return apiRequest<NotificationsResponse>(url);
  },

  getUnreadCount: async () => {
    return apiRequest<{ unreadCount: number }>(`/notifications/unread-count`);
  },

  getUnreadCountByFeature: async () => {
    return apiRequest<UnreadCountByFeature>(`/notifications/unread-count-by-feature`);
  },

  markAsRead: async (notificationId: number) => {
    return apiRequest<{ message: string }>(`/notifications/${notificationId}/read`, {
      method: 'PUT',
    });
  },

  markAllAsRead: async (feature?: string) => {
    let url = `/notifications/read-all`;
    if (feature) url += `?feature=${feature}`;
    return apiRequest<{ message: string }>(url, {
      method: 'PUT',
    });
  },

  deleteNotification: async (notificationId: number) => {
    return apiRequest<{ message: string }>(`/notifications/${notificationId}`, {
      method: 'DELETE',
    });
  },
};
