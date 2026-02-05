/**
 * Notification Service
 * Business logic for notification operations
 * Implements service layer with dependency injection
 */

import { NotificationRepository, INotificationRepository } from '@/src/repositories/NotificationRepository';
import { ValidationError, NotFoundError } from '@/src/types/errors';

import { Notification, NotificationType, Prisma } from '@prisma/client';

/**
 * Notification Service Interface
 */
export interface INotificationService {
  getUserNotifications(userId: string): Promise<Notification[]>;
  markNotificationAsRead(notificationId: string, userId: string): Promise<Notification>;
  markAllNotificationsAsRead(userId: string): Promise<number>;
  createNotification(userId: string, type: NotificationType, title: string, message: string, actionUrl?: string, metadata?: any): Promise<Notification>;
}

/**
 * Notification Service Implementation
 */
export class NotificationService implements INotificationService {
  private notificationRepository: INotificationRepository;

  constructor(notificationRepository?: INotificationRepository) {
    this.notificationRepository = notificationRepository || new NotificationRepository();
  }

  /**
   * Get all notifications for a user
   */
  async getUserNotifications(userId: string): Promise<Notification[]> {
    console.log({ msg: 'Getting user notifications', userId });

    if (!userId) {
      throw new ValidationError('User ID is required');
    }

    return await this.notificationRepository.getUserNotifications(userId);
  }

  /**
   * Mark a notification as read
   */
  async markNotificationAsRead(notificationId: string, userId: string): Promise<Notification> {
    console.log({ msg: 'Marking notification as read', notificationId, userId });

    if (!notificationId) {
      throw new ValidationError('Notification ID is required');
    }

    if (!userId) {
      throw new ValidationError('User ID is required');
    }

    // Check if notification exists and belongs to the user
    const notification = await this.notificationRepository.getNotificationById(notificationId);
    if (!notification) {
      throw new NotFoundError('Notification not found');
    }

    if (notification.userId !== userId) {
      throw new ValidationError('Notification does not belong to the user');
    }

    // If already read, just return it
    if (notification.isRead) {
      return notification;
    }

    // Mark as read
    return await this.notificationRepository.markAsRead(notificationId, userId);
  }

  /**
   * Mark all notifications as read for a user
   */
  async markAllNotificationsAsRead(userId: string): Promise<number> {
    console.log({ msg: 'Marking all notifications as read', userId });

    if (!userId) {
      throw new ValidationError('User ID is required');
    }

    const result = await this.notificationRepository.markAllAsRead(userId);
    return result.count;
  }

  /**
   * Create a new notification
   */
  async createNotification(
    userId: string,
    type: NotificationType,
    title: string,
    message: string,
    actionUrl?: string,
    metadata?: any
  ): Promise<Notification> {
    console.log({ msg: 'Creating notification', userId, type });

    if (!userId) {
      throw new ValidationError('User ID is required');
    }

    if (!title || !message) {
      throw new ValidationError('Title and message are required');
    }

    const notificationData: Prisma.NotificationCreateInput = {
      user: {
        connect: { id: userId }
      },
      type,
      title,
      message,
      actionUrl,
      metadata: metadata ? metadata : undefined,
    };

    return await this.notificationRepository.createNotification(notificationData);
  }
}