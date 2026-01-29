/**
 * Notification Repository
 * Data access layer for notification-related operations
 */

import { prisma } from '@/src/lib/prisma';
import { logger } from '@/src/utils/logger';
import { Notification, Prisma } from '@prisma/client';

/**
 * Notification Repository Interface
 */
export interface INotificationRepository {
  getUserNotifications(userId: string): Promise<Notification[]>;
  getNotificationById(notificationId: string): Promise<Notification | null>;
  markAsRead(notificationId: string, userId: string): Promise<Notification>;
  markAllAsRead(userId: string): Promise<Prisma.BatchPayload>;
  createNotification(data: Prisma.NotificationCreateInput): Promise<Notification>;
}

/**
 * Notification Repository Implementation
 */
export class NotificationRepository implements INotificationRepository {
  /**
   * Get all notifications for a user
   */
  async getUserNotifications(userId: string): Promise<Notification[]> {
    console.log({ msg: 'Fetching user notifications from database', userId });
    
    try {
      const notifications = await prisma.notification.findMany({
        where: {
          userId,
        },
        orderBy: {
          createdAt: 'desc',
        },
      });
      
      return notifications;
    } catch (error) {
      console.error({ 
        msg: 'Error fetching user notifications', 
        userId,
        error: (error as Error).message 
      });
      throw error;
    }
  }

  /**
   * Get a notification by ID
   */
  async getNotificationById(notificationId: string): Promise<Notification | null> {
    console.log({ msg: 'Fetching notification by ID', notificationId });
    
    try {
      const notification = await prisma.notification.findUnique({
        where: {
          id: notificationId,
        },
      });
      
      return notification;
    } catch (error) {
      console.error({ 
        msg: 'Error fetching notification by ID', 
        notificationId,
        error: (error as Error).message 
      });
      throw error;
    }
  }

  /**
   * Mark a notification as read
   */
  async markAsRead(notificationId: string, userId: string): Promise<Notification> {
    console.log({ msg: 'Marking notification as read', notificationId, userId });
    
    try {
      const updatedNotification = await prisma.notification.update({
        where: {
          id: notificationId,
          userId, // Ensure the notification belongs to the user
        },
        data: {
          isRead: true,
          readAt: new Date(),
        },
      });
      
      return updatedNotification;
    } catch (error) {
      console.error({ 
        msg: 'Error marking notification as read', 
        notificationId,
        userId,
        error: (error as Error).message 
      });
      throw error;
    }
  }

  /**
   * Mark all notifications as read for a user
   */
  async markAllAsRead(userId: string): Promise<Prisma.BatchPayload> {
    console.log({ msg: 'Marking all notifications as read', userId });
    
    try {
      const result = await prisma.notification.updateMany({
        where: {
          userId,
          isRead: false,
        },
        data: {
          isRead: true,
          readAt: new Date(),
        },
      });
      
      return result;
    } catch (error) {
      console.error({ 
        msg: 'Error marking all notifications as read', 
        userId,
        error: (error as Error).message 
      });
      throw error;
    }
  }

  /**
   * Create a new notification
   */
  async createNotification(data: Prisma.NotificationCreateInput): Promise<Notification> {
    console.log({ msg: 'Creating new notification', userId: data.user?.connect?.id });
    
    try {
      const notification = await prisma.notification.create({
        data,
      });
      
      return notification;
    } catch (error) {
      console.error({ 
        msg: 'Error creating notification', 
        userId: data.user?.connect?.id,
        error: (error as Error).message 
      });
      throw error;
    }
  }
}