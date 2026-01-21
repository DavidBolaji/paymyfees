import { NextResponse } from 'next/server';
import { SupportService, ISupportService } from '@/src/services/SupportService';
import { ApiResponse } from '@/src/types';
import { logger } from '@/src/utils/logger';


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
  async getFaqs(_req: Request): Promise<NextResponse> {
    logger.info({ msg: 'Getting FAQs' });
    try {
      const faqs = await this.supportService.getFaqs();
      const response: ApiResponse = {
        success: true,
        data: faqs,
        metadata: {
          timestamp: new Date().toISOString(),
        },
      };
      return NextResponse.json(response, { status: 200 });
    } catch (error) {
      logger.error({
        msg: 'Error getting FAQs',
        error: (error as Error).message,
      });
      return NextResponse.json({
        success: false,
        error: 'Internal Server Error',
        message: 'An error occurred while getting FAQs',
        metadata: {
          timestamp: new Date().toISOString(),
        },
      }, { status: 500 });
    }
  }

  /**
   * Get support tickets for a user
   * GET /api/support/tickets
   */
  async getTickets(_req: Request, userId: string): Promise<NextResponse> {
    logger.info({ msg: 'Getting support tickets', userId });
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
      logger.error({
        msg: 'Error getting support tickets',
        userId,
        error: (error as Error).message,
      });
      return NextResponse.json({
        success: false,
        error: 'Internal Server Error',
        message: 'An error occurred while getting support tickets',
        metadata: {
          timestamp: new Date().toISOString(),
        },
      }, { status: 500 });
    }
  }

  /**
   * Create a new support ticket
   * POST /api/support/tickets
   */
  async createTicket(req: Request, userId: string): Promise<NextResponse> {
    logger.info({ msg: 'Creating support ticket', userId });
    try {
      const data = await req.json();
      const ticket = await this.supportService.createTicket(userId, data);
      const response: ApiResponse = {
        success: true,
        data: ticket,
        metadata: {
          timestamp: new Date().toISOString(),
        },
      };
      return NextResponse.json(response, { status: 201 });
    } catch (error) {
      logger.error({
        msg: 'Error creating support ticket',
        userId,
        error: (error as Error).message,
      });
      return NextResponse.json({
        success: false,
        error: 'Internal Server Error',
        message: 'An error occurred while creating support ticket',
        metadata: {
          timestamp: new Date().toISOString(),
        },
      }, { status: 500 });
    }
  }
}