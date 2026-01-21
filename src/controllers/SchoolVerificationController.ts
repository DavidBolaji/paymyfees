/**
 * School Verification Controller
 * HTTP request/response handling for school verification endpoints
 * Implements controller layer with proper status codes and response formatting
 */

import { NextResponse } from 'next/server';
import { SchoolVerificationService, ISchoolVerificationService } from '@/src/services/SchoolVerificationService';
import { ApiResponse } from '@/src/types';
import { logger } from '@/src/utils/logger';
import { ValidationError } from '@/src/types/errors';

/**
 * School Verification Controller
 * Handles HTTP layer for school verification operations
 */
export class SchoolVerificationController {
  private schoolVerificationService: ISchoolVerificationService;

  constructor(schoolVerificationService?: ISchoolVerificationService) {
    this.schoolVerificationService = schoolVerificationService || new SchoolVerificationService();
  }

  /**
   * Submit a verification request
   * POST /api/school-verification
   */
  async submitVerificationRequest(req: Request, userId: string): Promise<NextResponse> {
    logger.info({ msg: 'Submitting verification request', userId });
    
    try {
      const data = await req.json();
      
      const verification = await this.schoolVerificationService.submitVerificationRequest(userId, data);

      const response: ApiResponse = {
        success: true,
        data: verification,
        metadata: {
          timestamp: new Date().toISOString(),
        },
      };

      return NextResponse.json(response, { status: 201 });
    } catch (error) {
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

      logger.error({
        msg: 'Error submitting verification request',
        userId,
        error: (error as Error).message,
      });

      return NextResponse.json(
        {
          success: false,
          error: 'Internal Server Error',
          message: 'An error occurred while submitting verification request',
          metadata: {
            timestamp: new Date().toISOString(),
          },
        },
        { status: 500 }
      );
    }
  }

  /**
   * Get verification status
   * GET /api/school-verification/status
   */
  async getVerificationStatus(_req: Request, userId: string): Promise<NextResponse> {
    logger.info({ msg: 'Getting verification status', userId });
    
    try {
      const status = await this.schoolVerificationService.getVerificationStatus(userId);

      const response: ApiResponse = {
        success: true,
        data: status,
        metadata: {
          timestamp: new Date().toISOString(),
        },
      };

      return NextResponse.json(response, { status: 200 });
    } catch (error) {
      logger.error({
        msg: 'Error getting verification status',
        userId,
        error: (error as Error).message,
      });

      return NextResponse.json(
        {
          success: false,
          error: 'Internal Server Error',
          message: 'An error occurred while getting verification status',
          metadata: {
            timestamp: new Date().toISOString(),
          },
        },
        { status: 500 }
      );
    }
  }
}