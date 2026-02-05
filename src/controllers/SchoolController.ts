/**
 * School Controller
 * HTTP request/response handling for school endpoints
 * Supports multiple schools per user
 */

import { NextResponse } from 'next/server';
import { SchoolService, ISchoolService } from '@/src/services/SchoolService';
import { ApiResponse } from '@/src/types';
import { ValidationError, NotFoundError } from '@/src/types/errors';

/**
 * School Controller
 */
export class SchoolController {
  private schoolService: ISchoolService;

  constructor(schoolService?: ISchoolService) {
    this.schoolService = schoolService || new SchoolService();
  }

  /**
   * Get school profile (primary or specific)
   * GET /api/schools/profile?schoolId=xxx (optional)
   */
  async getSchoolProfile(req: Request, userId: string): Promise<NextResponse> {
    console.log({ msg: 'Getting school profile', userId });
    
    try {
      const { searchParams } = new URL(req.url);
      const schoolId = searchParams.get('schoolId') || undefined;

      const profile = await this.schoolService.getSchoolProfile(userId, schoolId);

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

      console.error({
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
   * Get all schools for the authenticated user
   * GET /api/schools/my-schools
   */
  async getAllUserSchools(_req: Request, userId: string): Promise<NextResponse> {
    console.log({ msg: 'Getting all user schools', userId });
    
    try {
      const schools = await this.schoolService.getAllUserSchools(userId);

      const response: ApiResponse = {
        success: true,
        data: schools,
        metadata: {
          timestamp: new Date().toISOString()
        },
      };

      return NextResponse.json(response, { status: 200 });
    } catch (error) {
      console.error({
        msg: 'Error getting user schools',
        userId,
        error: (error as Error).message,
      });

      return NextResponse.json(
        {
          success: false,
          error: 'Internal Server Error',
          message: 'An error occurred while getting user schools',
          metadata: {
            timestamp: new Date().toISOString(),
          },
        },
        { status: 500 }
      );
    }
  }

  /**
   * Get primary school
   * GET /api/schools/primary
   */
  async getPrimarySchool(_req: Request, userId: string): Promise<NextResponse> {
    console.log({ msg: 'Getting primary school', userId });
    
    try {
      const school = await this.schoolService.getPrimarySchool(userId);

      const response: ApiResponse = {
        success: true,
        data: school,
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

      console.error({
        msg: 'Error getting primary school',
        userId,
        error: (error as Error).message,
      });

      return NextResponse.json(
        {
          success: false,
          error: 'Internal Server Error',
          message: 'An error occurred while getting primary school',
          metadata: {
            timestamp: new Date().toISOString(),
          },
        },
        { status: 500 }
      );
    }
  }

  /**
   * Get all verified schools (public)
   * GET /api/schools
   */
  async getAllSchools(_req: Request): Promise<NextResponse> {
    console.log({ msg: 'Getting all schools' });
    
    try {
      const schools = await this.schoolService.getAllSchools();

      const response: ApiResponse = {
        success: true,
        data: schools,
        metadata: {
          timestamp: new Date().toISOString(),
        },
      };

      return NextResponse.json(response, { status: 200 });
    } catch (error) {
      console.error({
        msg: 'Error getting all schools',
        error: (error as Error).message,
      });

      return NextResponse.json(
        {
          success: false,
          error: 'Internal Server Error',
          message: 'An error occurred while getting schools',
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
    console.log({ msg: 'Registering new school', userId });
    
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

      console.error({
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
   * Set primary school
   * PUT /api/schools/set-primary/:schoolId
   */
  async setPrimarySchool(_req: Request, userId: string, params: { schoolId: string }): Promise<NextResponse> {
    const { schoolId } = params;
    console.log({ msg: 'Setting primary school', userId, schoolId });
    
    try {
      const school = await this.schoolService.setPrimarySchool(userId, schoolId);

      const response: ApiResponse = {
        success: true,
        data: school,
        message: 'Primary school updated successfully',
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

      console.error({
        msg: 'Error setting primary school',
        userId,
        schoolId,
        error: (error as Error).message,
      });

      return NextResponse.json(
        {
          success: false,
          error: 'Internal Server Error',
          message: 'An error occurred while setting primary school',
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
   * PUT /api/schools/:schoolId/profile
   */
  async updateSchoolProfile(req: Request, userId: string, params: { schoolId: string }): Promise<NextResponse> {
    const { schoolId } = params;
    console.log({ msg: 'Updating school profile', userId, schoolId });
    
    try {
      const data = await req.json();
      
      const school = await this.schoolService.updateSchoolProfile(userId, schoolId, data);

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

      console.error({
        msg: 'Error updating school profile',
        userId,
        schoolId,
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
   * GET /api/schools/:schoolId/verification-requests
   */
  async getVerificationRequests(_req: Request, userId: string, params: { schoolId: string }): Promise<NextResponse> {
    const { schoolId } = await params;
    console.log({ msg: 'Getting verification requests', userId, schoolId });
    
    try {
      const verificationRequests = await this.schoolService.getVerificationRequests(userId, schoolId);

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

      console.error({
        msg: 'Error getting verification requests',
        userId,
        schoolId,
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
    console.log({ msg: 'Responding to verification request', userId, verificationId });
    
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

      console.error({
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
   * GET /api/schools/:schoolId/disbursements
   */
  async getDisbursements(_req: Request, userId: string, params: { schoolId: string }): Promise<NextResponse> {
    const { schoolId } = params;
    console.log({ msg: 'Getting disbursements', userId, schoolId });
    
    try {
      const disbursements = await this.schoolService.getDisbursements(userId, schoolId);

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

      console.error({
        msg: 'Error getting disbursements',
        userId,
        schoolId,
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