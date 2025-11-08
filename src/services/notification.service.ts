/**
 * Notification Service
 * Handles all notification functionality including database storage and WebSocket delivery
 * Supports both direct sending and queue-based sending
 */

import { ValidationError } from '@/lib/errors';
import { prisma } from '@/lib/prisma';
import { addNotificationToQueue, addUrgentNotificationToQueue } from '@/queues/notification.queue';
import { NotificationStatus, NotificationType } from '@prisma/client';

// #region Types

/**
 * Notification data for creating a notification
 */
export interface CreateNotificationData {
  userId: number;
  title: string;
  message: string;
  type: NotificationType;
}

/**
 * Notification result after processing
 */
export interface SendNotificationResult {
  success: boolean;
  notificationId?: number;
  error?: string;
}

/**
 * Notification with user information
 */
export interface NotificationWithUser {
  id: number;
  userId: number;
  title: string;
  message: string;
  type: NotificationType;
  status: NotificationStatus;
  readAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  user?: {
    id: number;
    email: string;
    fullName: string;
  };
}

// #endregion

// #region Socket Server Integration

/**
 * Get socket server instance
 * This will be set by the socket server when it initializes
 */
let socketServerInstance: {
  emitToUser: (userId: number, event: string, data: unknown) => void;
} | null = null;

/**
 * Set socket server instance (called by socket server on initialization)
 */
export function setSocketServerInstance(instance: {
  emitToUser: (userId: number, event: string, data: unknown) => void;
}): void {
  socketServerInstance = instance;
}

/**
 * Emit notification to user via WebSocket
 */
function emitNotificationToUser(userId: number, notification: NotificationWithUser): void {
  if (socketServerInstance) {
    socketServerInstance.emitToUser(userId, 'notification', notification);
    console.log(`Notification ${notification.id} emitted to user ${userId} via WebSocket`);
  } else {
    console.warn('Socket server instance not available, notification not sent via WebSocket');
  }
}

// #endregion

// #region Notification Service Class

export class NotificationService {
  /**
   * Create and save notification to database
   * This is the core method that always saves to DB first
   */
  static async createNotification(data: CreateNotificationData): Promise<NotificationWithUser> {
    // Validate input
    if (!data.userId || data.userId <= 0) {
      throw new ValidationError('Invalid user ID');
    }

    if (!data.title || data.title.trim() === '') {
      throw new ValidationError('Notification title is required');
    }

    if (!data.message || data.message.trim() === '') {
      throw new ValidationError('Notification message is required');
    }

    // Verify user exists
    const user = await prisma.user.findUnique({
      where: { id: data.userId, isDeleted: false },
      select: { id: true, email: true, fullName: true },
    });

    if (!user) {
      throw new ValidationError('User not found');
    }

    // Create notification in database
    const notification = await prisma.notification.create({
      data: {
        userId: data.userId,
        title: data.title.trim(),
        message: data.message.trim(),
        type: data.type,
        status: NotificationStatus.UNREAD,
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            fullName: true,
          },
        },
      },
    });

    console.log(`Notification ${notification.id} created for user ${data.userId}`);

    return notification;
  }

  /**
   * Send notification directly (save to DB and send via WebSocket)
   * Use this for immediate notifications
   */
  static async sendNotification(data: CreateNotificationData): Promise<SendNotificationResult> {
    try {
      // 1. Save notification to database first (as required)
      const notification = await this.createNotification(data);

      // 2. Send via WebSocket if user is connected
      emitNotificationToUser(data.userId, notification);

      return {
        success: true,
        notificationId: notification.id,
      };
    } catch (error) {
      console.error('Failed to send notification:', error);

      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  }

  /**
   * Queue notification for asynchronous sending
   * Returns job ID instead of notification ID
   * Notification will be saved to DB and sent via WebSocket by the worker
   */
  static async queueNotification(data: CreateNotificationData): Promise<SendNotificationResult> {
    try {
      // Validate input
      if (!data.userId || data.userId <= 0) {
        throw new ValidationError('Invalid user ID');
      }

      if (!data.title || data.title.trim() === '') {
        throw new ValidationError('Notification title is required');
      }

      if (!data.message || data.message.trim() === '') {
        throw new ValidationError('Notification message is required');
      }

      // Add to queue
      const jobId = await addNotificationToQueue({
        userId: data.userId,
        title: data.title.trim(),
        message: data.message.trim(),
        type: data.type,
      });

      console.log('Notification queued successfully:', {
        jobId,
        userId: data.userId,
        title: data.title,
      });

      return {
        success: true,
        notificationId: parseInt(jobId) || undefined, // Return job ID as notification ID
      };
    } catch (error) {
      console.error('Failed to queue notification:', error);

      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  }

  /**
   * Queue urgent notification (high priority)
   * Used for alerts, security notifications, etc.
   */
  static async queueUrgentNotification(
    data: CreateNotificationData
  ): Promise<SendNotificationResult> {
    try {
      // Validate input
      if (!data.userId || data.userId <= 0) {
        throw new ValidationError('Invalid user ID');
      }

      if (!data.title || data.title.trim() === '') {
        throw new ValidationError('Notification title is required');
      }

      if (!data.message || data.message.trim() === '') {
        throw new ValidationError('Notification message is required');
      }

      // Add to queue with high priority
      const jobId = await addUrgentNotificationToQueue({
        userId: data.userId,
        title: data.title.trim(),
        message: data.message.trim(),
        type: data.type,
      });

      console.log('Urgent notification queued successfully:', {
        jobId,
        userId: data.userId,
        title: data.title,
      });

      return {
        success: true,
        notificationId: parseInt(jobId) || undefined,
      };
    } catch (error) {
      console.error('Failed to queue urgent notification:', error);

      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  }

  /**
   * Send notification to multiple users
   * Saves to DB and sends via WebSocket for each user
   */
  static async sendBulkNotifications(
    notifications: CreateNotificationData[]
  ): Promise<SendNotificationResult[]> {
    const results: SendNotificationResult[] = [];

    for (const notificationData of notifications) {
      const result = await this.sendNotification(notificationData);
      results.push(result);
    }

    return results;
  }

  /**
   * Mark notification as read
   */
  static async markAsRead(notificationId: number, userId: number): Promise<void> {
    const notification = await prisma.notification.findFirst({
      where: {
        id: notificationId,
        userId,
        isDeleted: false,
      },
    });

    if (!notification) {
      throw new ValidationError('Notification not found');
    }

    if (notification.status === NotificationStatus.READ) {
      return; // Already read
    }

    await prisma.notification.update({
      where: { id: notificationId },
      data: {
        status: NotificationStatus.READ,
        readAt: new Date(),
      },
    });

    console.log(`Notification ${notificationId} marked as read by user ${userId}`);
  }

  /**
   * Mark all notifications as read for a user
   */
  static async markAllAsRead(userId: number): Promise<number> {
    const result = await prisma.notification.updateMany({
      where: {
        userId,
        status: NotificationStatus.UNREAD,
        isDeleted: false,
      },
      data: {
        status: NotificationStatus.READ,
        readAt: new Date(),
      },
    });

    console.log(`${result.count} notifications marked as read for user ${userId}`);
    return result.count;
  }

  /**
   * Get user notifications
   */
  static async getUserNotifications(
    userId: number,
    options?: {
      limit?: number;
      offset?: number;
      status?: NotificationStatus;
      type?: NotificationType;
    }
  ): Promise<NotificationWithUser[]> {
    const notifications = await prisma.notification.findMany({
      where: {
        userId,
        isDeleted: false,
        ...(options?.status && { status: options.status }),
        ...(options?.type && { type: options.type }),
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            fullName: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: options?.limit,
      skip: options?.offset,
    });

    return notifications;
  }

  /**
   * Get unread notification count for a user
   */
  static async getUnreadCount(userId: number): Promise<number> {
    const count = await prisma.notification.count({
      where: {
        userId,
        status: NotificationStatus.UNREAD,
        isDeleted: false,
      },
    });

    return count;
  }

  /**
   * Delete notification (soft delete)
   */
  static async deleteNotification(notificationId: number, userId: number): Promise<void> {
    const notification = await prisma.notification.findFirst({
      where: {
        id: notificationId,
        userId,
        isDeleted: false,
      },
    });

    if (!notification) {
      throw new ValidationError('Notification not found');
    }

    await prisma.notification.update({
      where: { id: notificationId },
      data: {
        isDeleted: true,
      },
    });

    console.log(`Notification ${notificationId} deleted by user ${userId}`);
  }
}

// #endregion
