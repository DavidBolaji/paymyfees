import { NextResponse } from 'next/server';
import { SupportService, ISupportService, CreateTicketData } from '@/src/services/SupportService';
import { ApiResponse } from '@/src/types';
import { UserRole } from '@prisma/client';
import { ValidationError, NotFoundError } from '@/src/types/errors';

/**
 * Support Controller
 * Handles HTTP layer for support operations
 */
export class SupportController {
  private supportService: ISupportService;

  constructor(supportService?: ISupportService) {
    this.supportService = supportService || new SupportService();
  }

  /**
   * Get frequently asked questions
   * GET /api/support/faqs
   */
  async getFaqs(req: Request): Promise<NextResponse> {
    console.info('Getting FAQs');

    try {
      const { searchParams } = new URL(req.url);
      const category = searchParams.get('category') || undefined;

      const faqs = await this.supportService.getFaqs(category);

      const response: ApiResponse = {
        success: true,
        data: faqs,
        metadata: {
          timestamp: new Date().toISOString(),
        },
      };

      return NextResponse.json(response, { status: 200 });
    } catch (error) {
      console.error('Error getting FAQs', { error: (error as Error).message });

      return NextResponse.json(
        {
          success: false,
          error: 'Internal Server Error',
          message: 'An error occurred while getting FAQs',
          metadata: {
            timestamp: new Date().toISOString(),
          },
        },
        { status: 500 }
      );
    }
  }

  /**
   * Get support tickets for a user
   * GET /api/support/tickets
   */
  async getTickets(_req: Request, userId: string): Promise<NextResponse> {
    console.info('Getting support tickets', { userId });

    try {
      const tickets = await this.supportService.getTickets(userId);

      const response: ApiResponse = {
        success: true,
        data: tickets,
        metadata: {
          timestamp: new Date().toISOString(),
        },
      };

      return NextResponse.json(response, { status: 200 });
    } catch (error) {
      console.error('Error getting support tickets', {
        userId,
        error: (error as Error).message,
      });

      if (error instanceof ValidationError) {
        return NextResponse.json(
          {
            success: false,
            error: 'Validation Error',
            message: error.message,
            metadata: {
              timestamp: new Date().toISOString(),
            },
          },
          { status: 400 }
        );
      }

      return NextResponse.json(
        {
          success: false,
          error: 'Internal Server Error',
          message: 'An error occurred while getting support tickets',
          metadata: {
            timestamp: new Date().toISOString(),
          },
        },
        { status: 500 }
      );
    }
  }

  /**
   * Get a specific ticket by ID
   * GET /api/support/tickets/:id
   */
  async getTicketById(_req: Request, userId: string, ticketId: string): Promise<NextResponse> {
    console.info('Getting ticket by ID', { userId, ticketId });

    try {
      const ticket = await this.supportService.getTicketById(ticketId, userId);

      const response: ApiResponse = {
        success: true,
        data: ticket,
        metadata: {
          timestamp: new Date().toISOString(),
        },
      };

      return NextResponse.json(response, { status: 200 });
    } catch (error) {
      console.error('Error getting ticket by ID', {
        userId,
        ticketId,
        error: (error as Error).message,
      });

      if (error instanceof NotFoundError) {
        return NextResponse.json(
          {
            success: false,
            error: 'Not Found',
            message: error.message,
            metadata: {
              timestamp: new Date().toISOString(),
            },
          },
          { status: 404 }
        );
      }

      if (error instanceof ValidationError) {
        return NextResponse.json(
          {
            success: false,
            error: 'Validation Error',
            message: error.message,
            metadata: {
              timestamp: new Date().toISOString(),
            },
          },
          { status: 400 }
        );
      }

      return NextResponse.json(
        {
          success: false,
          error: 'Internal Server Error',
          message: 'An error occurred while getting the ticket',
          metadata: {
            timestamp: new Date().toISOString(),
          },
        },
        { status: 500 }
      );
    }
  }

  /**
   * Create a new support ticket
   * POST /api/support/tickets
   */
  async createTicket(req: Request, userId: string, userRole: UserRole): Promise<NextResponse> {
    console.info('Creating support ticket', { userId, userRole });

    try {
      const data: CreateTicketData = await req.json();

      // Validate request body
      if (!data || typeof data !== 'object') {
        throw new ValidationError('Invalid request body');
      }

      const ticket = await this.supportService.createTicket(userId, userRole, data);

      const response: ApiResponse = {
        success: true,
        data: ticket,
        message: 'Support ticket created successfully',
        metadata: {
          timestamp: new Date().toISOString(),
        },
      };

      return NextResponse.json(response, { status: 201 });
    } catch (error) {
      console.error('Error creating support ticket', {
        userId,
        userRole,
        error: (error as Error).message,
      });

      if (error instanceof ValidationError) {
        return NextResponse.json(
          {
            success: false,
            error: 'Validation Error',
            message: error.message,
            metadata: {
              timestamp: new Date().toISOString(),
            },
          },
          { status: 400 }
        );
      }

      return NextResponse.json(
        {
          success: false,
          error: 'Internal Server Error',
          message: 'An error occurred while creating the support ticket',
          metadata: {
            timestamp: new Date().toISOString(),
          },
        },
        { status: 500 }
      );
    }
  }
}