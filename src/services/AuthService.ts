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
  ValidationError,
  NotFoundError
} from '@/src/types/errors';
import {
  UserDTO,
  CreateUserInput,
  LoginInput,
  AuthResponse
} from '@/src/types';
import { executeTransaction } from '@/src/database/prisma';
import { logger } from '@/src/utils/logger';
import { UserRole } from '@prisma/client';
import { MailService, IMailService } from '@/src/services/MailService';
import { createVerification, verifyToken } from '@/src/utils/verification';

/**
 * Auth Service Interface
 */
export interface IAuthService {
  register(input: CreateUserInput): Promise<AuthResponse>;
  login(input: LoginInput): Promise<AuthResponse>;
  refreshToken(refreshToken: string): Promise<{ token: string; refreshToken: string }>;
  verifyEmail(userId: string, tokenOrOtp: string, mode: 'link' | 'otp'): Promise<boolean>;
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
    logger.info(`User registration started for ${input.email} with role ${input.role} and mode ${input.mode}`);

    // Hash password
    const hashedPassword = await this.hashPassword(input.password);

    // Create user with transaction
    const user = await executeTransaction(async (tx) => {
      // Create user
      const newUser = await tx.user.create({
        data: {
          email: input.email,
          phone: input.phone,
          password: hashedPassword,
          role: input.role,
          fullName: input.fullName,
          profileImage: input.profileImage,
          emailVerified: false, // Ensure email is not verified until confirmation
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

    logger.info(`User registered successfully with ID ${user.id}`);

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

      logger.info(`Verification email sent to ${user.email} using ${input.mode} mode`);
    } catch (error) {
      logger.error(`Failed to send verification email to ${user.email}: ${error}`);
      // Continue with registration even if email fails
      // We can implement a resend verification email feature later
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
        phone: user.phone,
        role: user.role,
        fullName: user.fullName,
        profileImage: user.profileImage,
        emailVerified: user.emailVerified,
        phoneVerified: user.phoneVerified,
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
    // @ts-ignore
    logger.info('User login attempt', { email: input.email });

    // Find user by email
    const user = await this.userRepository.findByEmail(input.email);

    if (!user) {
      // @ts-ignore
      logger.warn('Login failed: user not found', { email: input.email });
      throw new UnauthorizedError('Invalid email or password');
    }

    // Verify password
    const isPasswordValid = await this.verifyPassword(input.password, user.password);

    if (!isPasswordValid) {
      // @ts-ignore
      logger.warn('Login failed: invalid password', { email: input.email });
      throw new UnauthorizedError('Invalid email or password');
    }

    // Check if user is active
    if (!user.isActive) {
      // @ts-ignore
      logger.warn('Login failed: user inactive', { email: input.email });
      throw new UnauthorizedError('Account is inactive');
    }

    // Update last login
    await this.userRepository.updateLastLogin(user.id);
    // @ts-ignore
    logger.info('User logged in successfully', { userId: user.id });

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
        phone: user.phone,
        role: user.role,
        fullName: user.fullName,
        profileImage: user.profileImage,
        emailVerified: user.emailVerified,
        phoneVerified: user.phoneVerified,
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
    logger.info('Token refresh attempt');

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

    // @ts-ignore
    logger.info('Token refreshed successfully', { userId: user.id });

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
    userId: string,
    tokenOrOtp: string,
    mode: 'link' | 'otp'
  ): Promise<boolean> {
    try {
      logger.info(`Verifying email for user ${userId} using ${mode} mode`);
      
      // Verify token or OTP
      const isVerified = await verifyToken(userId, tokenOrOtp, mode);
      
      if (isVerified) {
        // Send welcome email
        const user = await this.userRepository.findById(userId);
        if (user) {
          await this.mailService.sendWelcomeEmail(user.email, user.fullName);
          logger.info(`Welcome email sent to ${user.email}`);
        }
      }
      
      return isVerified;
    } catch (error) {
      logger.error(`Email verification failed for user ${userId}: ${error}`);
      return false;
    }
  }

  /**
   * Request password reset
   */
  async requestPasswordReset(email: string): Promise<void> {
    const user = await this.userRepository.findByEmail(email);

    if (!user) {
      // Don't reveal if email exists
      // @ts-ignore
      logger.warn('Password reset requested for non-existent email', { email });
      return;
    }

    // TODO: Generate reset token and send email
    // @ts-ignore
    logger.info('Password reset requested', { userId: user.id });
  }

  /**
   * Reset password
   */
  async resetPassword(token: string, newPassword: string): Promise<void> {
    // TODO: Implement password reset logic
    // 1. Verify reset token
    // 2. Hash new password
    // 3. Update user password
    logger.info('Password reset');
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
