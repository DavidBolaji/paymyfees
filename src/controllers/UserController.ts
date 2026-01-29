import { UserService, IUserService } from '@/src/services/UserService';
import { ValidationError, NotFoundError } from '@/src/types/errors';
import { NextResponse } from 'next/server';
import { ApiResponse } from '@/src/types';

/**
 * User Controller
 * Handles HTTP layer for user operations
 */
export class UserController {
  private userService: IUserService;

  constructor(userService?: IUserService) {
    this.userService = userService || new UserService();
  }

  /**
   * Get user profile
   * GET /api/user/profile
   */
  async getProfile(_req: Request, userId: string): Promise<NextResponse> {
    console.log({ msg: 'Getting user profile', userId });

    try {
      const profile = await this.userService.getUserProfile(userId);

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

      console.error({
        msg: 'Error getting user profile',
        userId,
        error: (error as Error).message,
      });

      return NextResponse.json(
        {
          success: false,
          error: 'Internal Server Error',
          message: 'An error occurred while getting user profile',
          metadata: {
            timestamp: new Date().toISOString(),
          },
        },
        { status: 500 }
      );
    }
  }

  /**
   * Update user profile
   * PUT /api/user/profile
   */
  async updateProfile(req: Request, userId: string): Promise<NextResponse> {
    console.log({ msg: 'Updating user profile', userId });

    try {
      const data = await req.json();

      const updatedProfile = await this.userService.updateUserProfile(userId, data);

      const response: ApiResponse = {
        success: true,
        data: updatedProfile,
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

      console.error({
        msg: 'Error updating user profile',
        userId,
        error: (error as Error).message,
      });

      return NextResponse.json(
        {
          success: false,
          error: 'Internal Server Error',
          message: 'An error occurred while updating user profile',
          metadata: {
            timestamp: new Date().toISOString(),
          },
        },
        { status: 500 }
      );
    }
  }
}