/**
 * Authentication Controller
 * HTTP request/response handling for authentication endpoints
 * Implements controller layer with proper status codes and response formatting
 */

import { NextResponse } from 'next/server';
import { AuthService, IAuthService } from '@/src/services/AuthService';
import { MailService } from '@/src/services/MailService';
import {
  registerSchema,
  loginSchema,
  refreshTokenSchema,
  resetPasswordRequestSchema,
  resetPasswordConfirmSchema
} from '@/src/validation/schemas';
import { ApiResponse } from '@/src/types';
import { UserRepository } from '@/src/repositories/UserRepository';
import { createVerification } from '@/src/utils/verification';

/**
 * Auth Controller
 * Handles HTTP layer for authentication operations
 */
export class AuthController {
  private authService: IAuthService;
  private userRepository: UserRepository;
  private mailService: MailService;

  constructor(authService?: IAuthService) {
    this.authService = authService || new AuthService();
    this.userRepository = new UserRepository();
    this.mailService = new MailService();
  }

  /**
   * Register new user
   * POST /api/auth/register
   */
  async register(req: Request): Promise<NextResponse> {
    try {
      // Log incoming request for debugging
      console.log('Processing registration request');

      // Parse request body
      let body;
      try {
        body = await req.json();
        console.log('Registration request body received');
      } catch (error) {
        console.error({
          msg: 'Failed to parse request body:',
          error: (error as Error).message
        });
        return NextResponse.json({
          success: false,
          error: 'invalid_request',
          message: 'Invalid request body',
        }, { status: 400 });
      }
      console.log(body)
      // Validate input
      let validatedData;
      try {
        validatedData = registerSchema.parse(body);
        console.log('Registration data validated successfully');
      } catch (error) {
        console.error({msg:'Registration validation failed:', error: (error as Error).message});
        return NextResponse.json({
          success: false,
          error: 'validation_error',
          message: 'Invalid registration data',
          details: error,
        }, { status: 400 });
      }

      // Execute business logic
      const result = await this.authService.register(validatedData);

      if (!result || !result.user) {
        console.error('Registration failed: Invalid result from auth service');
        return NextResponse.json({
          success: false,
          error: 'registration_failed',
          message: 'Failed to register user',
        }, { status: 500 });
      }

      try {
        console.log({
          message: 'User registration successful',
          userId: result.user.id
        });
      } catch (loggingError) {
        // Fallback to simple console logging if structured logging fails
        console.info(`User registration successful - ID: ${result.user.id}`);
      }

      // Format response
      const response: ApiResponse = {
        success: true,
        data: result,
        metadata: {
          timestamp: new Date().toISOString(),
        },
      };

      return NextResponse.json(response, { status: 201 });
    } catch (error) {
      console.error({msg: 'Unexpected error during registration:', error: (error as Error).message});
      return NextResponse.json({
        success: false,
        error: 'server_error',
        message: 'An unexpected error occurred',
      }, { status: 500 });
    }
  }

  /**
   * Login user
   * POST /api/auth/login
   */
  async login(req: Request): Promise<NextResponse> {
    const body = await req.json();

    // Validate input
    const validatedData = loginSchema.parse(body);

    // Execute business logic
    const result = await this.authService.login(validatedData);
    // @ts-ignore
    console.log('User login successful', { userId: result.user.id });

    // Format response
    const response: ApiResponse = {
      success: true,
      data: result,
      metadata: {
        timestamp: new Date().toISOString(),
      },
    };

    return NextResponse.json(response, { status: 200 });
  }

  /**
   * Refresh access token
   * POST /api/auth/refresh
   */
  async refreshToken(req: Request): Promise<NextResponse> {
    const body = await req.json();

    // Validate input
    const validatedData = refreshTokenSchema.parse(body);

    // Execute business logic
    const result = await this.authService.refreshToken(validatedData.refreshToken);

    console.log('Token refresh successful');

    // Format response
    const response: ApiResponse = {
      success: true,
      data: result,
      metadata: {
        timestamp: new Date().toISOString(),
      },
    };

    return NextResponse.json(response, { status: 200 });
  }

  /**
   * Request password reset
   * POST /api/auth/reset-password
   */
  async requestPasswordReset(req: Request): Promise<NextResponse> {
    const body = await req.json();

    // Validate input
    const validatedData = resetPasswordRequestSchema.parse(body);

    // Execute business logic
    await this.authService.requestPasswordReset(validatedData.email);

    // @ts-ignore
    console.log('Password reset requested', { email: validatedData.email });

    // Format response
    const response: ApiResponse = {
      success: true,
      message: 'Password reset link sent to email',
      metadata: {
        timestamp: new Date().toISOString(),
      },
    };

    return NextResponse.json(response, { status: 200 });
  }

  /**
   * Confirm password reset
   * POST /api/auth/reset-password/confirm
   */
  async resetPasswordConfirm(req: Request): Promise<NextResponse> {
    const body = await req.json();

    // Validate input
    const validatedData = resetPasswordConfirmSchema.parse(body);

    // Execute business logic
    await this.authService.resetPassword(
      validatedData.token,
      validatedData.newPassword
    );

    console.log('Password reset successful');

    // Format response
    const response: ApiResponse = {
      success: true,
      message: 'Password reset successful',
      metadata: {
        timestamp: new Date().toISOString(),
      },
    };

    return NextResponse.json(response, { status: 200 });
  }

  /**
   * Logout user
   * POST /api/auth/logout
   */
  async logout(_req: Request): Promise<NextResponse> {
    // In a stateless JWT system, logout is handled client-side
    // Here we can add token to blacklist if needed

    console.log('User logout');

    const response: ApiResponse = {
      success: true,
      message: 'Logged out successfully',
      metadata: {
        timestamp: new Date().toISOString(),
      },
    };

    return NextResponse.json(response, { status: 200 });
  }

  /**
 * Reset Paaword Confirmation
 * POST /api/auth/reset-password/confirm
 */
  async confirmPasswordReset(req: Request): Promise<NextResponse> {
    const body = await req.json();

    // Validate input
    const validatedData = registerSchema.parse(body);

    // Execute business logic
    const result = await this.authService.register(validatedData);
    // @ts-ignore
    console.log('User registration successful', { userId: result.user.id });

    // Format response
    const response: ApiResponse = {
      success: true,
      data: result,
      metadata: {
        timestamp: new Date().toISOString(),
      },
    };

    return NextResponse.json(response, { status: 201 });
  }

  /**
   * Resend verification email
   * POST /api/auth/resend-verification
   */
  async resendVerification(req: Request): Promise<NextResponse> {
    const body = await req.json();

    // Validate input
    const { email, mode } = body;

    if (!email || !mode) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing required fields",
          message: "Email and mode are required",
        },
        { status: 400 }
      );
    }

    if (mode !== 'link' && mode !== 'otp') {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid mode",
          message: "Verification mode must be either 'link' or 'otp'",
        },
        { status: 400 }
      );
    }

    try {
      // Find user by email
      const user = await this.userRepository.findByEmail(email);

      if (!user) {
        return NextResponse.json(
          {
            success: false,
            error: "user_not_found",
            message: "User not found with the provided email",
          },
          { status: 404 }
        );
      }

      if (user.emailVerified) {
        return NextResponse.json(
          {
            success: false,
            error: "already_verified",
            message: "Email is already verified",
          },
          { status: 400 }
        );
      }

      // Generate new verification token or OTP
      const verificationData = await createVerification(user.id, mode as 'link' | 'otp');

      // Send verification email
      await this.mailService.sendVerificationEmail(
        user.email,
        user.fullName,
        mode as 'otp' | 'link',
        verificationData
      );

      // Format response
      const response: ApiResponse = {
        success: true,
        message: mode === 'link'
          ? "Verification link has been sent to your email"
          : "Verification OTP has been sent to your email",
        metadata: {
          timestamp: new Date().toISOString(),
        },
      };

      return NextResponse.json(response, { status: 200 });
    } catch (error) {
      try {
        console.error({
          message: 'Failed to resend verification',
          errorMessage: error instanceof Error ? error.message : String(error)
        });
      } catch (loggingError) {
        // Fallback to simple console logging if structured logging fails
        console.error(`Failed to resend verification: ${error}`);
      }

      return NextResponse.json(
        {
          success: false,
          error: "verification_failed",
          message: "Failed to send verification email. Please try again.",
        },
        { status: 500 }
      );
    }
  }

  /**
   * Verify email address
   * POST /api/auth/verify
   */
  async verifyEmail(req: Request): Promise<NextResponse> {
    const body = await req.json();

    // Validate input
    const { token, mode } = body;
    console.log(token, mode)

    if (!token || !mode) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing required fields",
          message: "User ID, token/OTP, and mode are required",
        },
        { status: 400 }
      );
    }

    if (mode !== 'link' && mode !== 'otp') {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid mode",
          message: "Verification mode must be either 'link' or 'otp'",
        },
        { status: 400 }
      );
    }

    try {
      // Execute business logic
      const isVerified = await this.authService.verifyEmail(token, mode);

      if (!isVerified) {
        return NextResponse.json(
          {
            success: false,
            error: "invalid_token",
            message: mode === 'link'
              ? "Invalid or expired verification link"
              : "Invalid or expired OTP code",
          },
          { status: 400 }
        );
      }

      // Format response
      const response: ApiResponse = {
        success: true,
        message: "Email verified successfully",
        metadata: {
          timestamp: new Date().toISOString(),
        },
      };

      return NextResponse.json(response, { status: 200 });
    } catch (error) {
      try {
        console.error({
          message: 'Email verification failed',
          errorMessage: error instanceof Error ? error.message : String(error)
        });
      } catch (loggingError) {
        // Fallback to simple console logging if structured logging fails
        console.error(`Email verification failed: ${error}`);
      }

      return NextResponse.json(
        {
          success: false,
          error: "verification_failed",
          message: "Failed to verify email. Please try again.",
        },
        { status: 500 }
      );
    }
  }
}
