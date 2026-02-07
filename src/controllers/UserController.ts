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

  /**
   * Update profile info
   * PUT /api/user/profile/info
   */
  async updateProfileInfo(req: Request, userId: string): Promise<NextResponse> {
    return this.updateProfile(req, userId);
  }

  /**
   * Update profile avatar
   * PUT /api/user/profile/avatar
   */
  async updateProfileAvatar(req: Request, userId: string): Promise<NextResponse> {
    return this.updateProfile(req, userId);
  }

  /**
   * Update profile address
   * PUT /api/user/profile/address
   */
  async updateProfileAddress(req: Request, userId: string): Promise<NextResponse> {
    return this.updateProfile(req, userId);
  }

  /**
   * Handle 2FA settings
   * POST /api/user/settings/2fa
   */
  async handle2FA(req: Request, userId: string): Promise<NextResponse> {
    console.log({ msg: 'Handling 2FA settings', userId });

    try {
      const data = await req.json();
      const result = await this.userService.handle2FASettings(userId, data);

      const response: ApiResponse = {
        success: true,
        data: result,
        metadata: {
          timestamp: new Date().toISOString(),
        },
      };

      return NextResponse.json(response, { status: 200 });
    } catch (error) {
      console.error({
        msg: 'Error handling 2FA settings',
        userId,
        error: (error as Error).message,
      });

      return NextResponse.json(
        {
          success: false,
          error: 'Internal Server Error',
          message: 'An error occurred while handling 2FA settings',
          metadata: {
            timestamp: new Date().toISOString(),
          },
        },
        { status: 500 }
      );
    }
  }

  /**
   * Get notification settings
   * GET /api/user/settings/notifications
   */
  async getNotificationSettings(_req: Request, userId: string): Promise<NextResponse> {
    console.log({ msg: 'Getting notification settings', userId });

    try {
      const settings = await this.userService.getNotificationSettings(userId);

      const response: ApiResponse = {
        success: true,
        data: settings,
        metadata: {
          timestamp: new Date().toISOString(),
        },
      };

      return NextResponse.json(response, { status: 200 });
    } catch (error) {
      console.error({
        msg: 'Error getting notification settings',
        userId,
        error: (error as Error).message,
      });

      return NextResponse.json(
        {
          success: false,
          error: 'Internal Server Error',
          message: 'An error occurred while getting notification settings',
          metadata: {
            timestamp: new Date().toISOString(),
          },
        },
        { status: 500 }
      );
    }
  }

  /**
   * Update notification settings
   * PUT /api/user/settings/notifications
   */
  async updateNotificationSettings(req: Request, userId: string): Promise<NextResponse> {
    console.log({ msg: 'Updating notification settings', userId });

    try {
      const data = await req.json();
      const settings = await this.userService.updateNotificationSettings(userId, data);

      const response: ApiResponse = {
        success: true,
        data: settings,
        metadata: {
          timestamp: new Date().toISOString(),
        },
      };

      return NextResponse.json(response, { status: 200 });
    } catch (error) {
      console.error({
        msg: 'Error updating notification settings',
        userId,
        error: (error as Error).message,
      });

      return NextResponse.json(
        {
          success: false,
          error: 'Internal Server Error',
          message: 'An error occurred while updating notification settings',
          metadata: {
            timestamp: new Date().toISOString(),
          },
        },
        { status: 500 }
      );
    }
  }
}