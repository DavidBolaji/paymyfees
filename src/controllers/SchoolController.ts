/**
 * School Controller
 * HTTP request/response handling for school endpoints
 * Implements controller layer with proper status codes and response formatting
 */

import { NextResponse } from 'next/server';
import { SchoolService, ISchoolService } from '@/src/services/SchoolService';
import { ApiResponse } from '@/src/types';
import { logger } from '@/src/utils/logger';
import { ValidationError, NotFoundError } from '@/src/types/errors';

/**
 * School Controller
 * Handles HTTP layer for school operations
 */
export class SchoolController {
  private schoolService: ISchoolService;

  constructor(schoolService?: ISchoolService) {
    this.schoolService = schoolService || new SchoolService();
  }

  /**
   * Get school profile
   * GET /api/schools/profile
   */
  async getSchoolProfile(_req: Request, userId: string): Promise<NextResponse> {
    logger.info({ msg: 'Getting school profile', userId });
    
    try {
      const profile = await this.schoolService.getSchoolProfile(userId);

      const response: ApiResponse = {
        success: true,
        data: profile,
        metadata: {
          timestamp: new Date().toISOString(),
        },
      };

      return NextResponse.json(response, { status: 200 });
    } catch (error) {
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

      logger.error({
        msg: 'Error getting school profile',
        userId,
        error: (error as Error).message,
      });

      return NextResponse.json(
        {
          success: false,
          error: 'Internal Server Error',
          message: 'An error occurred while getting school profile',
          metadata: {
            timestamp: new Date().toISOString(),
          },
        },
        { status: 500 }
      );
    }
  }

  /**
   * Register a new school
   * POST /api/schools/register
   */
  async registerSchool(req: Request, userId: string): Promise<NextResponse> {
    logger.info({ msg: 'Registering new school', userId });
    
    try {
      const data = await req.json();
      
      const school = await this.schoolService.registerSchool(userId, data);

      const response: ApiResponse = {
        success: true,
        data: school,
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
        msg: 'Error registering school',
        userId,
        error: (error as Error).message,
      });

      return NextResponse.json(
        {
          success: false,
          error: 'Internal Server Error',
          message: 'An error occurred while registering school',
          metadata: {
            timestamp: new Date().toISOString(),
          },
        },
        { status: 500 }
      );
    }
  }

  /**
   * Update school profile
   * PUT /api/schools/profile
   */
  async updateSchoolProfile(req: Request, userId: string): Promise<NextResponse> {
    logger.info({ msg: 'Updating school profile', userId });
    
    try {
      const data = await req.json();
      
      const school = await this.schoolService.updateSchoolProfile(userId, data);

      const response: ApiResponse = {
        success: true,
        data: school,
        metadata: {
          timestamp: new Date().toISOString(),
        },
      };

      return NextResponse.json(response, { status: 200 });
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

      logger.error({
        msg: 'Error updating school profile',
        userId,
        error: (error as Error).message,
      });

      return NextResponse.json(
        {
          success: false,
          error: 'Internal Server Error',
          message: 'An error occurred while updating school profile',
          metadata: {
            timestamp: new Date().toISOString(),
          },
        },
        { status: 500 }
      );
    }
  }

  /**
   * Get verification requests
   * GET /api/school/verification-requests
   */
  async getVerificationRequests(_req: Request, userId: string): Promise<NextResponse> {
    logger.info({ msg: 'Getting verification requests', userId });
    
    try {
      const verificationRequests = await this.schoolService.getVerificationRequests(userId);

      const response: ApiResponse = {
        success: true,
        data: verificationRequests,
        metadata: {
          timestamp: new Date().toISOString(),
        },
      };

      return NextResponse.json(response, { status: 200 });
    } catch (error) {
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

      logger.error({
        msg: 'Error getting verification requests',
        userId,
        error: (error as Error).message,
      });

      return NextResponse.json(
        {
          success: false,
          error: 'Internal Server Error',
          message: 'An error occurred while getting verification requests',
          metadata: {
            timestamp: new Date().toISOString(),
          },
        },
        { status: 500 }
      );
    }
  }

  /**
   * Respond to verification request
   * POST /api/school/verification-requests/:verificationId/respond
   */
  async respondToVerificationRequest(req: Request, userId: string, params: { verificationId: string }): Promise<NextResponse> {
    const { verificationId } = params;
    logger.info({ msg: 'Responding to verification request', userId, verificationId });
    
    try {
      const data = await req.json();
      
      if (!data.status) {
        return NextResponse.json(
          {
            success: false,
            error: 'Validation Error',
            message: 'Status is required',
            metadata: {
              timestamp: new Date().toISOString(),
            },
          },
          { status: 400 }
        );
      }

      const verification = await this.schoolService.respondToVerificationRequest(
        userId,
        verificationId,
        data.status,
        data.notes
      );

      const response: ApiResponse = {
        success: true,
        data: verification,
        metadata: {
          timestamp: new Date().toISOString(),
        },
      };

      return NextResponse.json(response, { status: 200 });
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

      logger.error({
        msg: 'Error responding to verification request',
        userId,
        verificationId,
        error: (error as Error).message,
      });

      return NextResponse.json(
        {
          success: false,
          error: 'Internal Server Error',
          message: 'An error occurred while responding to verification request',
          metadata: {
            timestamp: new Date().toISOString(),
          },
        },
        { status: 500 }
      );
    }
  }

  /**
   * Get disbursements
   * GET /api/schools/disbursements
   */
  async getDisbursements(_req: Request, userId: string): Promise<NextResponse> {
    logger.info({ msg: 'Getting disbursements', userId });
    
    try {
      const disbursements = await this.schoolService.getDisbursements(userId);

      const response: ApiResponse = {
        success: true,
        data: disbursements,
        metadata: {
          timestamp: new Date().toISOString(),
        },
      };

      return NextResponse.json(response, { status: 200 });
    } catch (error) {
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

      logger.error({
        msg: 'Error getting disbursements',
        userId,
        error: (error as Error).message,
      });

      return NextResponse.json(
        {
          success: false,
          error: 'Internal Server Error',
          message: 'An error occurred while getting disbursements',
          metadata: {
            timestamp: new Date().toISOString(),
          },
        },
        { status: 500 }
      );
    }
  }
}