'use client';

import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { notificationsApi } from '@/lib/api/notifications';
import { useAuthStore } from '@/lib/stores/authStore';
import { formatRelativeTime } from '@/lib/utils/format';
import {
  Bell,
  Check,
  CheckCheck,
  DollarSign,
  Briefcase,
  Shield,
  Award,
  Users,
  X,
} from 'lucide-react';
import { toast } from 'sonner';

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  relatedId?: string;
}

export function NotificationBell() {
  const { isAuthenticated } = useAuthStore();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isAuthenticated) {
      loadUnreadCount();
      // Poll for new notifications every 30 seconds
      const interval = setInterval(loadUnreadCount, 30000);
      return () => clearInterval(interval);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (isOpen) {
      loadNotifications();
    }
  }, [isOpen]);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const loadUnreadCount = async () => {
    try {
      const response: any = await notificationsApi.getUnreadCount();
      setUnreadCount(response.data?.count || 0);
    } catch (error) {
      console.error('Failed to load unread count:', error);
    }
  };

  const loadNotifications = async () => {
    try {
      setLoading(true);
      const response: any = await notificationsApi.getAll();
      setNotifications(response.data || []);
    } catch (error) {
      console.error('Failed to load notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (id: string, event: React.MouseEvent) => {
    event.stopPropagation();
    try {
      await notificationsApi.markAsRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (error) {
      toast.error('Failed to mark as read');
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationsApi.markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
      toast.success('All notifications marked as read');
    } catch (error) {
      toast.error('Failed to mark all as read');
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'PLEDGE_RECEIVED':
      case 'PAYMENT_COMPLETED':
        return <DollarSign className="h-4 w-4 text-green-600" />;
      case 'CAMPAIGN_APPROVED':
      case 'CAMPAIGN_REJECTED':
      case 'CAMPAIGN_LAUNCHED':
        return <Briefcase className="h-4 w-4 text-blue-600" />;
      case 'KYC_APPROVED':
      case 'KYC_REJECTED':
        return <Shield className="h-4 w-4 text-purple-600" />;
      case 'CERTIFICATE_READY':
        return <Award className="h-4 w-4 text-yellow-600" />;
      case 'MENTOR_SESSION':
        return <Users className="h-4 w-4 text-indigo-600" />;
      default:
        return <Bell className="h-4 w-4 text-gray-600" />;
    }
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Icon Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative rounded-full p-2 text-gray-600 hover:bg-gray-100 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-500"
      >
        <Bell className="h-6 w-6" />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 flex h-5 w-5 items-center justify-center rounded-full bg-red-600 text-xs font-bold text-white">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Panel */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-screen max-w-md sm:w-96 rounded-lg border border-gray-200 bg-white shadow-lg z-50 mx-4 sm:mx-0">
          {/* Header */}
          <div className="flex items-center justify-between border-b px-4 py-3">
            <h3 className="font-semibold text-gray-900">Notifications</h3>
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllAsRead}
                  className="text-xs text-primary-600 hover:text-primary-700"
                  aria-label="Mark all as read"
                >
                  <CheckCheck className="inline h-3 w-3 mr-1" />
                  <span className="hidden sm:inline">Mark all read</span>
                  <span className="sm:hidden">All read</span>
                </button>
              )}
              <button
                onClick={() => setIsOpen(false)}
                className="rounded p-1 hover:bg-gray-100"
                aria-label="Close notifications"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Notifications List */}
          <div className="max-h-96 overflow-y-auto">
            {loading ? (
              <div className="space-y-2 p-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="animate-pulse space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-3 bg-gray-200 rounded w-full"></div>
                  </div>
                ))}
              </div>
            ) : notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
                <Bell className="h-12 w-12 text-gray-300 mb-3" />
                <p className="text-sm font-medium text-gray-900 mb-1">No notifications yet</p>
                <p className="text-xs text-gray-500">
                  We'll notify you when something important happens
                </p>
              </div>
            ) : (
              notifications.slice(0, 10).map((notification) => (
                <div
                  key={notification.id}
                  className={`border-b px-4 py-3 transition-colors hover:bg-gray-50 ${
                    !notification.isRead ? 'bg-primary-50' : ''
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {/* Icon */}
                    <div className="flex-shrink-0 mt-0.5">
                      {getNotificationIcon(notification.type)}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 mb-0.5">
                        {notification.title}
                      </p>
                      <p className="text-xs text-gray-600 mb-1 line-clamp-2">
                        {notification.message}
                      </p>
                      <p className="text-xs text-gray-500">
                        {formatRelativeTime(new Date(notification.createdAt))}
                      </p>
                    </div>

                    {/* Mark as Read Button */}
                    {!notification.isRead && (
                      <button
                        onClick={(e) => handleMarkAsRead(notification.id, e)}
                        className="flex-shrink-0 rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-primary-600"
                        title="Mark as read"
                      >
                        <Check className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="border-t px-4 py-3 text-center">
              <Link
                href="/dashboard/notifications"
                onClick={() => setIsOpen(false)}
                className="text-sm font-medium text-primary-600 hover:text-primary-700"
              >
                View all notifications
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
