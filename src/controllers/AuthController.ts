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
    console.log('Processing registration request');

    const body = await req.json();
    console.log('Registration request body received');

    const validatedData = registerSchema.parse(body);
    console.log('Registration data validated successfully');

    const result = await this.authService.register(validatedData);

    if (!result || !result.user) {
      console.error('Registration failed: Invalid result from auth service');
      throw new Error('Failed to register user');
    }

    console.log({
      message: 'User registration successful',
      userId: result.user.id
    });

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
   * Login user
   * POST /api/auth/login
   */
  async login(req: Request): Promise<NextResponse> {
    const body = await req.json();

    const validatedData = loginSchema.parse(body);

    const result = await this.authService.login(validatedData);
    console.log('User login successful', { userId: result.user.id });

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

    const validatedData = refreshTokenSchema.parse(body);

    const result = await this.authService.refreshToken(validatedData.refreshToken);

    console.log('Token refresh successful');

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
   * POST /api/auth/forgot-password
   */
  async requestPasswordReset(req: Request): Promise<NextResponse> {
    const body = await req.json();

    // Validate input
    const validatedData = resetPasswordRequestSchema.parse(body);
    console.log("passed validation")

    // Execute business logic
    await this.authService.requestPasswordReset(validatedData.email);

    console.log('Password reset requested', { email: validatedData.email });

    // Always return success to prevent email enumeration
    const response: ApiResponse = {
      success: true,
      message: 'If an account exists with this email, a password reset link has been sent',
      metadata: {
        timestamp: new Date().toISOString(),
      },
    };

    return NextResponse.json(response, { status: 200 });
  }

  /**
   * Confirm password reset
   * POST /api/auth/reset-password
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

    const response: ApiResponse = {
      success: true,
      message: 'Password reset successful. You can now login with your new password.',
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
   * Resend verification email
   * POST /api/auth/resend-verification
   */
  async resendVerification(req: Request): Promise<NextResponse> {
    const body = await req.json();

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

    // Normalize email to lowercase for case-insensitive lookup
    const normalizedEmail = email.trim().toLowerCase();

    const user = await this.userRepository.findByEmail(normalizedEmail);

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

    const verificationData = await createVerification(user.id, mode as 'link' | 'otp');

    await this.mailService.sendVerificationEmail(
      user.email,
      user.fullName,
      mode as 'otp' | 'link',
      verificationData
    );

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
  }

  /**
   * Verify email address
   * POST /api/auth/verify
   */
  async verifyEmail(req: Request): Promise<NextResponse> {
    const body = await req.json();

    const { token, mode } = body;
    console.log(token, mode);

    if (!token || !mode) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing required fields",
          message: "Token and mode are required",
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

    const response: ApiResponse = {
      success: true,
      message: "Email verified successfully",
      metadata: {
        timestamp: new Date().toISOString(),
      },
    };

    return NextResponse.json(response, { status: 200 });
  }

  /**
   * Verify 2FA code during login
   * POST /api/auth/verify-2fa
   */
  async verify2FALogin(req: Request): Promise<NextResponse> {
    let body: any;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json(
        {
          success: false,
          error: "invalid_request",
          message: "Invalid request body",
        },
        { status: 400 }
      );
    }

    const tempToken = body?.tempToken;
    const code = body?.code;

    if (!tempToken || typeof tempToken !== "string") {
      return NextResponse.json(
        {
          success: false,
          error: "missing_token",
          message: "Temporary token is required. Please login again.",
        },
        { status: 400 }
      );
    }

    if (!code || typeof code !== "string" || code.length !== 6) {
      return NextResponse.json(
        {
          success: false,
          error: "invalid_code",
          message: "A valid 6-digit 2FA code is required",
        },
        { status: 400 }
      );
    }

    const result = await this.authService.verify2FA(tempToken, code);

    if (!result) {
      return NextResponse.json(
        {
          success: false,
          error: "invalid_code",
          message: "Invalid or expired 2FA code. Please try again.",
        },
        { status: 400 }
      );
    }

    const response: ApiResponse = {
      success: true,
      data: result,
      metadata: {
        timestamp: new Date().toISOString(),
      },
    };

    return NextResponse.json(response, { status: 200 });
  }
}