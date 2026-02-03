/**
 * Authentication Service
 * Business logic for user authentication and authorization
 * Implements service layer with dependency injection
 */

import bcrypt from 'bcryptjs';
import { UserRepository, IUserRepository } from '@/src/repositories/UserRepository';
import {
  generateToken,
  generateRefreshToken,
  verifyRefreshToken,
  AuthUser
} from '@/src/middleware/auth';
import {
  UnauthorizedError,
} from '@/src/types/errors';
import {
  CreateUserInput,
  LoginInput,
  AuthResponse
} from '@/src/types';
import { executeTransaction } from '@/src/database/prisma';
import { UserRole } from '@prisma/client';
import { MailService, IMailService } from '@/src/services/MailService';
import { createVerification, getUserByToken, verifyToken, createPasswordResetToken, verifyPasswordResetToken } from '@/src/utils/verification';

/**
 * Auth Service Interface
 */
export interface IAuthService {
  register(input: CreateUserInput): Promise<AuthResponse>;
  login(input: LoginInput): Promise<AuthResponse>;
  refreshToken(refreshToken: string): Promise<{ token: string; refreshToken: string }>;
  verifyEmail(tokenOrOtp: string, mode: 'link' | 'otp'): Promise<boolean>;
  requestPasswordReset(email: string): Promise<void>;
  resetPassword(token: string, newPassword: string): Promise<void>;
}

/**
 * Auth Service Implementation
 */
export class AuthService implements IAuthService {
  private userRepository: IUserRepository;
  private mailService: IMailService;

  constructor(userRepository?: IUserRepository, mailService?: IMailService) {
    this.userRepository = userRepository || new UserRepository();
    this.mailService = mailService || new MailService();
  }

  /**
   * Register a new user
   * Creates user account with hashed password and initial profile
   */
  async register(input: CreateUserInput): Promise<AuthResponse> {
    try {
      console.log({
        message: 'User registration started',
        email: input.email,
        role: input.role,
        mode: input.mode
      });
    } catch (loggingError) {
      // Fallback to simple console logging if structured logging fails
      console.info(`User registration started for ${input.email} with role ${input.role} and mode ${input.mode}`);
    }

    // Hash password
    const hashedPassword = await this.hashPassword(input.password);

    // Create user with transaction
    const user = await executeTransaction(async (tx) => {
      // Create user
      const newUser = await tx.user.create({
        data: {
          email: input.email,
          password: hashedPassword,
          country: input.country,
          role: input.role,
          fullName: input.fullName,
          profileImage: input.profileImage,
          emailVerified: false,
        },
      });

      // Create role-specific profile
      if (input.role === UserRole.PARENT) {
        await tx.parentProfile.create({
          data: {
            userId: newUser.id,
          },
        });

        // Create wallet for parent
        await tx.wallet.create({
          data: {
            userId: newUser.id,
          },
        });
      } else if (input.role === UserRole.SCHOOL) {
        // School profile will be created separately with full details
      }

      return newUser;
    });

    try {
      console.log({
        message: 'User registered successfully',
        userId: user.id
      });
    } catch (loggingError) {
      console.info(`User registered successfully with ID ${user.id}`);
    }

    // Generate verification token or OTP based on mode
    try {
      const verificationData = await createVerification(
        user.id,
        input.mode as 'link' | 'otp'
      );

      // Send verification email
      await this.mailService.sendVerificationEmail(
        user.email,
        user.fullName,
        input.mode as 'otp' | 'link',
        verificationData
      );

      try {
        console.log({
          message: 'Verification email sent',
          email: user.email,
          mode: input.mode
        });
      } catch (loggingError) {
        console.info(`Verification email sent to ${user.email} using ${input.mode} mode`);
      }
    } catch (error) {
      try {
        console.error({
          message: 'Failed to send verification email',
          email: user.email,
          errorMessage: error instanceof Error ? error.message : String(error)
        });
      } catch (loggingError) {
        console.error(`Failed to send verification email to ${user.email}: ${error}`);
      }
    }

    // Generate tokens
    const authUser: AuthUser = {
      id: user.id,
      email: user.email,
      role: user.role,
    };

    const token = generateToken(authUser);
    const refreshToken = generateRefreshToken(authUser);

    return {
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        fullName: user.fullName,
        profileImage: user.profileImage,
        emailVerified: user.emailVerified,
        phoneVerified: user.phoneVerified,
        residencyStatus: user.residencyStatus,
        isActive: user.isActive,
        lastLogin: user.lastLogin,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
      token,
      refreshToken,
    };
  }

  /**
   * Login user
   * Validates credentials and returns tokens
   */
  async login(input: LoginInput): Promise<AuthResponse> {
    console.log('User login attempt', { email: input.email });

    // Find user by email
    const user = await this.userRepository.findByEmail(input.email);

    if (!user) {
      console.warn('Login failed: user not found', { email: input.email });
      throw new UnauthorizedError('Invalid email or password');
    }

    // Verify password
    const isPasswordValid = await this.verifyPassword(input.password, user.password);

    if (!isPasswordValid) {
      console.warn('Login failed: invalid password', { email: input.email });
      throw new UnauthorizedError('Invalid email or password');
    }

    // Check if user is active
    if (!user.isActive) {
      console.warn('Login failed: user inactive', { email: input.email });
      throw new UnauthorizedError('Account is inactive');
    }

    // Update last login
    await this.userRepository.updateLastLogin(user.id);
    console.log('User logged in successfully', { userId: user.id });

    // Generate tokens
    const authUser: AuthUser = {
      id: user.id,
      email: user.email,
      role: user.role,
    };

    const token = generateToken(authUser);
    const refreshToken = generateRefreshToken(authUser);

    return {
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        fullName: user.fullName,
        profileImage: user.profileImage,
        emailVerified: user.emailVerified,
        phoneVerified: user.phoneVerified,
        residencyStatus: user.residencyStatus,
        isActive: user.isActive,
        lastLogin: new Date(),
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
      token,
      refreshToken,
    };
  }

  /**
   * Refresh access token
   * Validates refresh token and issues new tokens
   */
  async refreshToken(refreshToken: string): Promise<{ token: string; refreshToken: string }> {
    console.log('Token refresh attempt');

    // Verify refresh token
    const decoded = verifyRefreshToken(refreshToken);

    // Verify user still exists and is active
    const user = await this.userRepository.findById(decoded.id);

    if (!user) {
      throw new UnauthorizedError('User not found');
    }

    if (!user.isActive) {
      throw new UnauthorizedError('Account is inactive');
    }

    // Generate new tokens
    const authUser: AuthUser = {
      id: user.id,
      email: user.email,
      role: user.role,
    };

    const newToken = generateToken(authUser);
    const newRefreshToken = generateRefreshToken(authUser);

    console.log('Token refreshed successfully', { userId: user.id });

    return {
      token: newToken,
      refreshToken: newRefreshToken,
    };
  }

  /**
   * Verify email address
   * Validates token or OTP and updates user's email verification status
   */
  async verifyEmail(
    tokenOrOtp: string,
    mode: 'link' | 'otp'
  ): Promise<boolean> {
    try {
      console.log(`Verifying email using ${mode} mode`);
      
      // Verify token or OTP
      const userId = await getUserByToken(tokenOrOtp, mode);
      const isVerified = await verifyToken(tokenOrOtp, mode);

      console.log(userId, "UserId authservice");
      console.log(isVerified, "isVerified");
      
      if (isVerified) {
        // Send welcome email
        const user = await this.userRepository.findById(userId!);
        if (user) {
          await this.mailService.sendWelcomeEmail(user.email, user.fullName);
          console.log(`Welcome email sent to ${user.email}`);
        }
      }
      
      return isVerified;
    } catch (error) {
      try {
        console.error({
          message: 'Email verification failed',
          errorMessage: error instanceof Error ? error.message : String(error)
        });
      } catch (loggingError) {
        console.error(`Email verification failed: ${error}`);
      }
      return false;
    }
  }

  /**
   * Request password reset
   * Generates reset token and sends email
   */
  async requestPasswordReset(email: string): Promise<void> {
    try {
      console.log('Password reset requested', { email });

      // Find user by email
      const user = await this.userRepository.findByEmail(email);

      if (!user) {
        // Don't reveal if email exists for security
        console.warn('Password reset requested for non-existent email', { email });
        // Still return success to prevent email enumeration
        return;
      }

      // Check if user is active
      if (!user.isActive) {
        console.warn('Password reset requested for inactive user', { email });
        // Still return success to prevent account status enumeration
        return;
      }

      // Generate password reset token
      const resetData = await createPasswordResetToken(user.id);

      // Send password reset email
      await this.mailService.sendResetPasswordEmail(
        user.email,
        user.fullName,
        resetData
      );

      console.log('Password reset email sent successfully', { email });
    } catch (error) {
      console.error('Error in requestPasswordReset', {
        email,
        error: error instanceof Error ? error.message : String(error)
      });
      // Don't throw error to prevent information leakage
    }
  }

  /**
   * Reset password
   * Verifies token and updates password
   */
  async resetPassword(token: string, newPassword: string): Promise<void> {
    try {
      console.log('Password reset attempt');

      // Verify reset token and get user ID
      const userId = await verifyPasswordResetToken(token);

      if (!userId) {
        throw new UnauthorizedError('Invalid or expired reset token');
      }

      // Find user
      const user = await this.userRepository.findById(userId);

      if (!user) {
        throw new UnauthorizedError('User not found');
      }

      if (!user.isActive) {
        throw new UnauthorizedError('Account is inactive');
      }

      // Hash new password
      const hashedPassword = await this.hashPassword(newPassword);

      // Update user password
      await this.userRepository.update(userId, {
        password: hashedPassword,
      });

      console.log('Password reset successful', { userId });
    } catch (error) {
      console.error('Error in resetPassword', {
        error: error instanceof Error ? error.message : String(error)
      });
      throw error;
    }
  }

  /**
   * Hash password using bcrypt
   */
  private async hashPassword(password: string): Promise<string> {
    const saltRounds = 10;
    return await bcrypt.hash(password, saltRounds);
  }

  /**
   * Verify password against hash
   */
  private async verifyPassword(password: string, hash: string): Promise<boolean> {
    return await bcrypt.compare(password, hash);
  }
}