/**
 * Notification Hooks
 * React hooks for notification operations
 */

import { Notification, NotificationApi, NotificationsListResponse } from '@/api/notification.api';
import { NotificationStatus, NotificationType } from '@prisma/client';
import { useCallback, useEffect, useState } from 'react';

// #region Get Notifications Hook

/**
 * Hook to get notifications for current user
 * Supports lazy loading with load more functionality
 */
export function useNotifications(params?: {
  page?: number;
  limit?: number;
  status?: NotificationStatus;
  type?: NotificationType;
  enableLazyLoad?: boolean; // Enable lazy loading mode
}) {
  const [data, setData] = useState<NotificationsListResponse | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [currentPage, setCurrentPage] = useState(params?.page || 1);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [hasMore, setHasMore] = useState(true);

  // Extract params for dependency tracking
  const limit = params?.limit || 10;
  const status = params?.status;
  const type = params?.type;
  const enableLazyLoad = params?.enableLazyLoad ?? false;

  const fetchNotifications = useCallback(
    async (page: number, append: boolean = false) => {
      try {
        if (append) {
          setIsLoadingMore(true);
        } else {
          setIsLoading(true);
        }
        setError(null);

        const result = await NotificationApi.getNotifications({
          page,
          limit,
          status,
          type,
        });

        if (append) {
          // Append new notifications to existing list
          setNotifications(prev => [...prev, ...result.notifications]);
        } else {
          // Replace notifications (initial load)
          setNotifications(result.notifications);
        }

        setData(result);
        setCurrentPage(page);
        setHasMore(result.pagination.page < result.pagination.totalPages);
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Failed to fetch notifications');
        setError(error);
        console.error('Failed to fetch notifications:', error);
      } finally {
        setIsLoading(false);
        setIsLoadingMore(false);
      }
    },
    [limit, status, type]
  );

  // Initial load
  useEffect(() => {
    // Always load first page on mount
    fetchNotifications(1, false);
  }, [fetchNotifications]);

  // Load more function for lazy loading
  const loadMore = useCallback(() => {
    if (!isLoadingMore && hasMore) {
      fetchNotifications(currentPage + 1, true);
    }
  }, [currentPage, hasMore, isLoadingMore, fetchNotifications]);

  // Refetch function
  const refetch = useCallback(() => {
    setCurrentPage(1);
    setNotifications([]);
    fetchNotifications(1, false);
  }, [fetchNotifications]);

  return {
    data: enableLazyLoad ? ({ ...data, notifications } as NotificationsListResponse | null) : data,
    notifications: enableLazyLoad ? notifications : (data?.notifications ?? []),
    isLoading,
    isLoadingMore,
    error,
    hasMore,
    loadMore,
    refetch,
  };
}

// #endregion

// #region Get Unread Count Hook

/**
 * Hook to get unread notification count
 */
export function useUnreadCount() {
  const [count, setCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const fetchUnreadCount = useCallback(async () => {
    try {
      setIsLoading(true);
      const result = await NotificationApi.getNotifications({
        limit: 1,
        status: NotificationStatus.UNREAD,
      });
      setCount(result.pagination.total);
    } catch (error) {
      console.error('Failed to fetch unread count:', error);
      setCount(0);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUnreadCount();
  }, [fetchUnreadCount]);

  return {
    count,
    isLoading,
    refetch: fetchUnreadCount,
  };
}

// #endregion

// #region Mark as Read Hook

/**
 * Hook to mark notification as read
 */
export function useMarkAsRead() {
  const [isPending, setIsPending] = useState(false);

  const mutateAsync = useCallback(async (id: number) => {
    try {
      setIsPending(true);
      await NotificationApi.markAsRead(id);
    } finally {
      setIsPending(false);
    }
  }, []);

  return {
    mutateAsync,
    isPending,
  };
}

// #endregion

// #region Mark All as Read Hook

/**
 * Hook to mark all notifications as read
 */
export function useMarkAllAsRead() {
  const [isPending, setIsPending] = useState(false);

  const mutateAsync = useCallback(async () => {
    try {
      setIsPending(true);
      await NotificationApi.markAllAsRead();
    } finally {
      setIsPending(false);
    }
  }, []);

  return {
    mutateAsync,
    isPending,
  };
}

// #endregion
