import { prisma } from '@/src/lib/prisma';
import { Prisma, SupportTicket, SupportTicketStatus, Faq } from '@prisma/client';


/**
 * Support Repository Interface
 */
export interface ISupportRepository {
  getFaqs(category?: string): Promise<Faq[]>;
  getTicketsByUserId(userId: string): Promise<SupportTicket[]>;
  getTicketById(ticketId: string): Promise<SupportTicket | null>;
  createTicket(data: Prisma.SupportTicketCreateInput): Promise<SupportTicket>;
  updateTicketStatus(ticketId: string, status: SupportTicketStatus): Promise<SupportTicket>;
  addTicketMessage(data: Prisma.SupportMessageCreateInput): Promise<any>;
  addTicketAttachment(data: Prisma.SupportAttachmentCreateInput): Promise<any>;
  generateTicketNumber(): Promise<string>;
}

/**
 * Support Repository Implementation
 */
export class SupportRepository implements ISupportRepository {
  /**
   * Get FAQs, optionally filtered by category
   */
  async getFaqs(category?: string): Promise<Faq[]> {
    try {
      const where: Prisma.FaqWhereInput = {
        isActive: true,
      };

      if (category) {
        where.category = category;
      }

      const faqs = await prisma.faq.findMany({
        where,
        orderBy: [
          { order: 'asc' },
          { createdAt: 'desc' },
        ],
      });

      return faqs;
    } catch (error) {
      console.error('Error getting FAQs', { error, category });
      throw error;
    }
  }

  /**
   * Get all support tickets for a user
   */
  async getTicketsByUserId(userId: string): Promise<SupportTicket[]> {
    try {
      const tickets = await prisma.supportTicket.findMany({
        where: { userId },
        include: {
          messages: {
            orderBy: { createdAt: 'desc' },
            take: 1,
          },
          attachments: true,
        },
        orderBy: { createdAt: 'desc' },
      });

      return tickets;
    } catch (error) {
      console.error('Error getting user tickets', { error, userId });
      throw error;
    }
  }

  /**
   * Get a specific ticket by ID
   */
  async getTicketById(ticketId: string): Promise<SupportTicket | null> {
    try {
      const ticket = await prisma.supportTicket.findUnique({
        where: { id: ticketId },
        include: {
          user: {
            select: {
              id: true,
              fullName: true,
              email: true,
              role: true,
            },
          },
          messages: {
            orderBy: { createdAt: 'asc' },
          },
          attachments: true,
        },
      });

      return ticket;
    } catch (error) {
      console.error('Error getting ticket by ID', { error, ticketId });
      throw error;
    }
  }

  /**
   * Create a new support ticket
   */
  async createTicket(data: Prisma.SupportTicketCreateInput): Promise<SupportTicket> {
    try {
      const ticket = await prisma.supportTicket.create({
        data,
        include: {
          user: {
            select: {
              id: true,
              fullName: true,
              email: true,
              role: true,
            },
          },
        },
      });

      return ticket;
    } catch (error) {
      console.error('Error creating support ticket', { error, data });
      throw error;
    }
  }

  /**
   * Update ticket status
   */
  async updateTicketStatus(ticketId: string, status: SupportTicketStatus): Promise<SupportTicket> {
    try {
      const updateData: Prisma.SupportTicketUpdateInput = {
        status,
      };

      if (status === 'RESOLVED') {
        updateData.resolvedAt = new Date();
      } else if (status === 'CLOSED') {
        updateData.closedAt = new Date();
      }

      const ticket = await prisma.supportTicket.update({
        where: { id: ticketId },
        data: updateData,
      });

      return ticket;
    } catch (error) {
      console.error('Error updating ticket status', { error, ticketId, status });
      throw error;
    }
  }

  /**
   * Add a message to a ticket
   */
  async addTicketMessage(data: Prisma.SupportMessageCreateInput): Promise<any> {
    try {
      const message = await prisma.supportMessage.create({
        data,
      });

      return message;
    } catch (error) {
      console.error('Error adding ticket message', { error, data });
      throw error;
    }
  }

  /**
   * Add an attachment to a ticket
   */
  async addTicketAttachment(data: Prisma.SupportAttachmentCreateInput): Promise<any> {
    try {
      const attachment = await prisma.supportAttachment.create({
        data,
      });

      return attachment;
    } catch (error) {
      console.error('Error adding ticket attachment', { error, data });
      throw error;
    }
  }

  /**
   * Generate a unique ticket number
   */
  async generateTicketNumber(): Promise<string> {
    try {
      const today = new Date();
      const year = today.getFullYear().toString().slice(-2);
      const month = (today.getMonth() + 1).toString().padStart(2, '0');
      const day = today.getDate().toString().padStart(2, '0');

      const prefix = `TKT${year}${month}${day}`;

      // Get the count of tickets created today
      const startOfDay = new Date(today.setHours(0, 0, 0, 0));
      const endOfDay = new Date(today.setHours(23, 59, 59, 999));

      const count = await prisma.supportTicket.count({
        where: {
          createdAt: {
            gte: startOfDay,
            lte: endOfDay,
          },
        },
      });

      const sequence = (count + 1).toString().padStart(4, '0');
      return `${prefix}${sequence}`;
    } catch (error) {
      console.error('Error generating ticket number', { error });
      throw error;
    }
  }
}