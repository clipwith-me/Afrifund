import apiClient from './client';

export const notificationsApi = {
  // Get user notifications
  getAll: (unreadOnly?: boolean) =>
    apiClient.get('/notifications', { params: { unreadOnly } }),

  // Get unread count
  getUnreadCount: () => apiClient.get('/notifications/unread-count'),

  // Mark notification as read
  markAsRead: (id: string) => apiClient.patch(`/notifications/${id}/read`),

  // Mark all notifications as read
  markAllAsRead: () => apiClient.patch('/notifications/mark-all-read'),
};
