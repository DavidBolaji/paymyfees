/**
 * School Support Message Repository
 * Data access layer for school support messages
 */

import { prisma } from '@/src/lib/prisma';

export interface ISchoolSupportMessageRepository {
  getMessages(schoolId: string, limit?: number): Promise<any[]>;
  createMessage(schoolId: string, message: string, priority?: string): Promise<any>;
  markAsRead(messageId: string): Promise<any>;
  getUnreadCount(schoolId: string): Promise<number>;
}

export class SchoolSupportMessageRepository implements ISchoolSupportMessageRepository {
  /**
   * Get support messages for a school
   */
  async getMessages(schoolId: string, limit: number = 5): Promise<any[]> {
    console.log({ msg: 'Fetching support messages', schoolId });
    
    try {
      const messages = await prisma.schoolSupportMessage.findMany({
        where: {
          schoolId: schoolId,
          OR: [
            { expiresAt: null },
            { expiresAt: { gt: new Date() } }
          ]
        },
        orderBy: [
          { isRead: 'asc' },
          { createdAt: 'desc' },
        ],
        take: limit,
      });
      
      return messages;
    } catch (error) {
      console.error({ 
        msg: 'Error fetching support messages', 
        schoolId,
        error: (error as Error).message 
      });
      throw error;
    }
  }

  /**
   * Create a new support message
   */
  async createMessage(schoolId: string, message: string, priority: string = 'normal'): Promise<any> {
    console.log({ msg: 'Creating support message', schoolId });
    
    try {
      const supportMessage = await prisma.schoolSupportMessage.create({
        data: {
          schoolId,
          message,
          priority,
        },
      });
      
      return supportMessage;
    } catch (error) {
      console.error({ 
        msg: 'Error creating support message', 
        schoolId,
        error: (error as Error).message 
      });
      throw error;
    }
  }

  /**
   * Mark a message as read
   */
  async markAsRead(messageId: string): Promise<any> {
    console.log({ msg: 'Marking message as read', messageId });
    
    try {
      const message = await prisma.schoolSupportMessage.update({
        where: {
          id: messageId,
        },
        data: {
          isRead: true,
          readAt: new Date(),
        },
      });
      
      return message;
    } catch (error) {
      console.error({ 
        msg: 'Error marking message as read', 
        messageId,
        error: (error as Error).message 
      });
      throw error;
    }
  }

  /**
   * Get count of unread messages
   */
  async getUnreadCount(schoolId: string): Promise<number> {
    console.log({ msg: 'Getting unread message count', schoolId });
    
    try {
      const count = await prisma.schoolSupportMessage.count({
        where: {
          schoolId: schoolId,
          isRead: false,
          OR: [
            { expiresAt: null },
            { expiresAt: { gt: new Date() } }
          ]
        },
      });
      
      return count;
    } catch (error) {
      console.error({ 
        msg: 'Error getting unread count', 
        schoolId,
        error: (error as Error).message 
      });
      throw error;
    }
  }
}