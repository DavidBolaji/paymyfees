/**
 * Notification Controller
 * HTTP request/response handling for notification endpoints
 * Implements controller layer with proper status codes and response formatting
 */

import { NextResponse } from 'next/server';
import { NotificationService, INotificationService } from '@/src/services/NotificationService';
import { ApiResponse } from '@/src/types';
import { logger } from '@/src/utils/logger';

/**
 * Notification Controller
 * Handles HTTP layer for notification operations
 */
export class NotificationController {
  private notificationService: INotificationService;

  constructor(notificationService?: INotificationService) {
    this.notificationService = notificationService || new NotificationService();
  }

  /**
   * Get notifications for a user
   * GET /api/notifications
   */
  async getNotifications(_req: Request, userId: string | undefined): Promise<NextResponse> {
    console.log({ msg: 'Getting notifications', userId });
    
    if (!userId) {
      return NextResponse.json(
        {
          success: false,
          error: 'Authentication required',
          message: 'User ID is required to fetch notifications',
          metadata: {
            timestamp: new Date().toISOString(),
          },
        },
        { status: 401 }
      );
    }
    
    const notifications = await this.notificationService.getUserNotifications(userId);

    const response: ApiResponse = {
      success: true,
      data: notifications,
      metadata: {
        timestamp: new Date().toISOString(),
      },
    };

    return NextResponse.json(response, { status: 200 });
  }

  /**
   * Mark a notification as read
   * PUT /api/notifications/:notificationId/read
   */
  async markNotificationAsRead(_req: Request, notificationId: string, userId: string | undefined): Promise<NextResponse> {
    console.log({ msg: 'Marking notification as read', notificationId, userId });
    
    if (!userId) {
      return NextResponse.json(
        {
          success: false,
          error: 'Authentication required',
          message: 'User ID is required to mark notification as read',
          metadata: {
            timestamp: new Date().toISOString(),
          },
        },
        { status: 401 }
      );
    }
    
    try {
      const notification = await this.notificationService.markNotificationAsRead(notificationId, userId);
      
      const response: ApiResponse = {
        success: true,
        data: notification,
        metadata: {
          timestamp: new Date().toISOString(),
        },
      };
      
      return NextResponse.json(response, { status: 200 });
    } catch (error) {
      if ((error as any).name === 'NotFoundError') {
        return NextResponse.json(
          {
            success: false,
            error: 'Not Found',
            message: (error as Error).message,
            metadata: {
              timestamp: new Date().toISOString(),
            },
          },
          { status: 404 }
        );
      }
      
      if ((error as any).name === 'ValidationError') {
        return NextResponse.json(
          {
            success: false,
            error: 'Validation Error',
            message: (error as Error).message,
            metadata: {
              timestamp: new Date().toISOString(),
            },
          },
          { status: 400 }
        );
      }
      
      console.error({ 
        msg: 'Error marking notification as read', 
        notificationId, 
        userId, 
        error: (error as Error).message 
      });
      
      return NextResponse.json(
        {
          success: false,
          error: 'Internal Server Error',
          message: 'An error occurred while marking the notification as read',
          metadata: {
            timestamp: new Date().toISOString(),
          },
        },
        { status: 500 }
      );
    }
  }

  /**
   * Mark all notifications as read
   * PUT /api/notifications/read-all
   */
  async markAllNotificationsAsRead(_req: Request, userId: string | undefined): Promise<NextResponse> {
    console.log({ msg: 'Marking all notifications as read', userId });
    
    if (!userId) {
      return NextResponse.json(
        {
          success: false,
          error: 'Authentication required',
          message: 'User ID is required to mark all notifications as read',
          metadata: {
            timestamp: new Date().toISOString(),
          },
        },
        { status: 401 }
      );
    }
    
    try {
      const count = await this.notificationService.markAllNotificationsAsRead(userId);
      
      const response: ApiResponse = {
        success: true,
        data: { count },
        message: `${count} notifications marked as read`,
        metadata: {
          timestamp: new Date().toISOString(),
        },
      };
      
      return NextResponse.json(response, { status: 200 });
    } catch (error) {
      console.error({ 
        msg: 'Error marking all notifications as read', 
        userId, 
        error: (error as Error).message 
      });
      
      return NextResponse.json(
        {
          success: false,
          error: 'Internal Server Error',
          message: 'An error occurred while marking all notifications as read',
          metadata: {
            timestamp: new Date().toISOString(),
          },
        },
        { status: 500 }
      );
    }
  }
}