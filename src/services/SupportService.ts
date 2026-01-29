import { SupportRepository, ISupportRepository } from '@/src/repositories/SupportRepository';
import { ValidationError, NotFoundError } from '@/src/types/errors';
import { SupportTicketPriority, SupportTicketStatus, UserRole } from '@prisma/client';
import { CloudinaryUploadResult } from '@/src/utils/cloudinary-api';

/**
 * Support Ticket Creation Data
 */
export interface CreateTicketData {
  category: string;
  summary: string;
  documents?: CloudinaryUploadResult[];
}

/**
 * Support Service Interface
 */
export interface ISupportService {
  getFaqs(category?: string): Promise<any[]>;
  getTickets(userId: string): Promise<any[]>;
  getTicketById(ticketId: string, userId: string): Promise<any>;
  createTicket(userId: string, userRole: UserRole, data: CreateTicketData): Promise<any>;
}

/**
 * Support Service Implementation
 */
export class SupportService implements ISupportService {
  private supportRepository: ISupportRepository;

  constructor(supportRepository?: ISupportRepository) {
    this.supportRepository = supportRepository || new SupportRepository();
  }

  /**
   * Get frequently asked questions
   */
  async getFaqs(category?: string): Promise<any[]> {
    console.info('Getting FAQs', { category });

    try {
      const faqs = await this.supportRepository.getFaqs(category);
      return faqs;
    } catch (error) {
      console.error('Error getting FAQs', { error, category });
      throw error;
    }
  }

  /**
   * Get support tickets for a user
   */
  async getTickets(userId: string): Promise<any[]> {
    console.info('Getting support tickets', { userId });

    try {
      if (!userId) {
        throw new ValidationError('User ID is required');
      }

      const tickets = await this.supportRepository.getTicketsByUserId(userId);
      return tickets;
    } catch (error) {
      console.error('Error getting support tickets', { error, userId });
      throw error;
    }
  }

  /**
   * Get a specific ticket by ID
   */
  async getTicketById(ticketId: string, userId: string): Promise<any> {
    console.info('Getting ticket by ID', { ticketId, userId });

    try {
      if (!ticketId) {
        throw new ValidationError('Ticket ID is required');
      }

      const ticket = await this.supportRepository.getTicketById(ticketId);

      if (!ticket) {
        throw new NotFoundError('Support ticket not found');
      }

      // Verify the ticket belongs to the user
      if (ticket.userId !== userId) {
        throw new ValidationError('Unauthorized to view this ticket');
      }

      return ticket;
    } catch (error) {
      console.error('Error getting ticket by ID', { error, ticketId, userId });
      throw error;
    }
  }

  /**
   * Create a new support ticket
   */
  async createTicket(
    userId: string,
    userRole: UserRole,
    data: CreateTicketData
  ): Promise<any> {
    console.info('Creating support ticket', { userId, userRole, category: data.category });

    try {
      // Validate input
      this.validateTicketData(data);

      // Determine priority based on category
      const priority = this.determinePriority(data.category);

      // Generate ticket number
      const ticketNumber = await this.supportRepository.generateTicketNumber();

      // Create the ticket
      const ticket = await this.supportRepository.createTicket({
        ticketNumber,
        subject: this.generateSubject(data.category),
        category: data.category,
        description: data.summary,
        priority,
        status: SupportTicketStatus.OPEN,
        user: {
          connect: { id: userId },
        },
      });

      // Add initial message with the description
      await this.supportRepository.addTicketMessage({
        ticket: {
          connect: { id: ticket.id },
        },
        senderId: userId,
        senderRole: userRole,
        message: data.summary,
        isInternal: false,
      });

      // Add attachments if any
      if (data.documents && data.documents.length > 0) {
        await this.addAttachments(ticket.id, data.documents);
      }

      console.info('Support ticket created successfully', {
        ticketId: ticket.id,
        ticketNumber: ticket.ticketNumber,
      });

      return ticket;
    } catch (error) {
      console.error('Error creating support ticket', { error, userId, data });
      throw error;
    }
  }

  /**
   * Validate ticket data
   */
  private validateTicketData(data: CreateTicketData): void {
    if (!data.category || data.category.trim().length === 0) {
      throw new ValidationError('Support category is required');
    }

    if (!data.summary || data.summary.trim().length === 0) {
      throw new ValidationError('Issue summary is required');
    }

    if (data.summary.length < 10) {
      throw new ValidationError('Issue summary must be at least 10 characters long');
    }

    if (data.summary.length > 5000) {
      throw new ValidationError('Issue summary must not exceed 5000 characters');
    }
  }

  /**
   * Determine priority based on category
   */
  private determinePriority(category: string): SupportTicketPriority {
    const urgentCategories = ['payment', 'disbursement', 'account locked', 'security'];
    const highCategories = ['loan application', 'verification', 'technical'];
    
    const lowerCategory = category.toLowerCase();

    if (urgentCategories.some(c => lowerCategory.includes(c))) {
      return SupportTicketPriority.URGENT;
    }

    if (highCategories.some(c => lowerCategory.includes(c))) {
      return SupportTicketPriority.HIGH;
    }

    return SupportTicketPriority.MEDIUM;
  }

  /**
   * Generate subject from category
   */
  private generateSubject(category: string): string {
    return `Support Request: ${category}`;
  }

  /**
   * Add attachments to a ticket
   */
  private async addAttachments(
    ticketId: string,
    documents: CloudinaryUploadResult[]
  ): Promise<void> {
    try {
      for (const doc of documents) {
        await this.supportRepository.addTicketAttachment({
          ticket: {
            connect: { id: ticketId },
          },
          fileName: doc.original_filename || doc.public_id,
          fileUrl: doc.secure_url,
          fileSize: doc.bytes,
          mimeType: doc.format || 'application/octet-stream',
        });
      }

      console.info('Attachments added to ticket', {
        ticketId,
        count: documents.length,
      });
    } catch (error) {
      console.error('Error adding attachments to ticket', {
        error,
        ticketId,
      });
      throw error;
    }
    
  }
}