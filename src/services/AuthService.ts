/**
 * Authentication Service
 * Business logic for user authentication and authorization
 * Implements service layer with dependency injection
 */

import bcrypt from 'bcryptjs';
import speakeasy from 'speakeasy';
import { UserRepository, IUserRepository } from '@/src/repositories/UserRepository';
import {
  generateToken,
  generateRefreshToken,
  verifyRefreshToken,
  verifyJwtToken,
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
import { prisma } from '@/src/database/prisma';
import { UserRole } from '@prisma/client';
import { MailService, IMailService } from '@/src/services/MailService';
import { createVerification, getUserByToken, verifyToken, createPasswordResetToken, verifyPasswordResetToken } from '@/src/utils/verification';
import { EmbedlyService } from '@/src/services/EmbedlyService';

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
  verify2FA(tempToken: string, code: string): Promise<AuthResponse | null>;
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
   * Creates user account with hashed password and initial profile.
   * Embedly customer + wallet provisioning is awaited synchronously —
   * if it fails, the user record is rolled back and an error is returned.
   */
  async register(input: CreateUserInput): Promise<AuthResponse> {
    console.info(`User registration started for ${input.email} with role ${input.role} and mode ${input.mode}`);

    // Derive fullName for backward compat
    const fullName = `${input.firstName} ${input.lastName}`.trim();

    // Hash password
    const hashedPassword = await this.hashPassword(input.password);

    // Normalize email to lowercase
    const normalizedEmail = input.email.trim().toLowerCase();

    // Create user with transaction
    const user = await executeTransaction(async (tx) => {
      // Create user
      const newUser = await tx.user.create({
        data: {
          email: normalizedEmail,
          phone: input.phone || null,
          password: hashedPassword,
          country: input.country || 'Nigeria',
          role: input.role,
          fullName,
          firstName: input.firstName,
          lastName: input.lastName,
          middleName: input.middleName || null,
          dob: input.dob ? new Date(input.dob) : null,
          address: input.address || null,
          city: input.city || null,
          profileImage: input.profileImage,
          emailVerified: false,
        },
      });

      // Create wallet for all non-ADMIN users
      if (input.role !== UserRole.ADMIN) {
        await tx.wallet.create({
          data: {
            userId: newUser.id,
          },
        });
      }

      // Create role-specific profile
      if (input.role === UserRole.PARENT) {
        await tx.parentProfile.create({
          data: {
            userId: newUser.id,
          },
        });
      } else if (input.role === UserRole.SCHOOL) {
        await tx.schoolProfile.create({
          data: {
            userId: newUser.id,
            schoolName: input.schoolName || fullName,
            isPrimary: true,
          },
        });
      } else if (input.role === UserRole.TEACHER) {
        await tx.teacherProfile.create({
          data: {
            userId: newUser.id,
          },
        });
      }

      return newUser;
    });

    // ── Provision Embedly customer + wallet (synchronous, blocking) ───────────
    // All Embedly steps must succeed before the verification OTP is sent.
    // On failure, the user record is deleted (cascades to wallet + profile).
    if (user.role !== UserRole.ADMIN) {
      try {
        await this.provisionEmbedly({
          id: user.id,
          email: user.email,
          firstName: input.firstName,
          lastName: input.lastName,
          middleName: input.middleName,
          phone: input.phone || null,
          dob: input.dob,
          address: input.address,
          city: input.city,
        });
      } catch (err) {
        // Rollback: delete user (ON DELETE CASCADE removes wallet + profiles)
        await prisma.user.delete({ where: { id: user.id } }).catch(() => {});
        const detail = err instanceof Error ? err.message : String(err);
        console.error({ message: 'Embedly provisioning failed — user rolled back', userId: user.id, detail });
        throw new Error(`Registration failed: could not provision payment account. ${detail}`);
      }
    }

    console.info(`User registered successfully with ID ${user.id}`);

    // Generate verification token or OTP based on mode
    try {
      const verificationData = await createVerification(
        user.id,
        input.mode as 'link' | 'otp'
      );

      // Send verification email
      const emailSent = await this.mailService.sendVerificationEmail(
        user.email,
        user.fullName,
        input.mode as 'otp' | 'link',
        verificationData
      );

      if (emailSent) {
        console.log({
          message: 'Verification email sent',
          email: user.email,
          mode: input.mode
        });
      } else {
        console.error({
          message: 'Failed to send verification email',
          email: user.email,
          mode: input.mode
        });
      }
    } catch (error) {
      console.error({
        message: 'Failed to send verification email',
        email: user.email,
        errorMessage: error instanceof Error ? error.message : String(error)
      });
    }

    // Generate tokens
    const authUser: AuthUser = {
      id: user.id,
      email: user.email,
      role: user.role,
    };

    const token = generateToken(authUser);
    const refreshToken = generateRefreshToken(authUser);

    const userDTO = await this.userRepository.getUserById(user.id);

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
        residencyStatus: user.residencyStatus,
        isActive: user.isActive,
        isFirstTime: user.isFirstTime,
        lastLogin: user.lastLogin,
        country: user.country,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
        parentProfile: userDTO?.parentProfile ?? null,
        schoolProfile: userDTO?.schoolProfile ?? null,
        wallet: userDTO?.wallet ?? null,
        notificationSettings: userDTO?.notificationSettings ?? null,
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
    // Normalize email to lowercase for case-insensitive lookup
    const normalizedEmail = input.email.trim().toLowerCase();
    
    console.log('User login attempt', { email: normalizedEmail });

    // Find user by email
    const user = await this.userRepository.findByEmail(normalizedEmail);

    if (!user) {
      console.warn('Login failed: user not found', { email: normalizedEmail });
      throw new UnauthorizedError('Invalid email or password');
    }

    // Verify password
    const isPasswordValid = await this.verifyPassword(input.password, user.password);

    if (!isPasswordValid) {
      console.warn('Login failed: invalid password', { email: normalizedEmail });
      throw new UnauthorizedError('Invalid email or password');
    }

    // Check if user is active
    if (!user.isActive) {
      console.warn('Login failed: user inactive', { email: normalizedEmail });
      throw new UnauthorizedError('Account is inactive');
    }

    // Check if 2FA is enabled
    if (user.twoFactorEnabled) {
      console.log('2FA required for user', { userId: user.id });
      
      // Generate temporary token for 2FA verification
      const tempToken = generateToken({
        id: user.id,
        email: user.email,
        role: user.role,
      }, '10m'); // 10 minutes expiry
      
      // Return response indicating 2FA is required
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
          twoFactorEnabled: true,
          lastLogin: user.lastLogin,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
        },
        token: tempToken,
        refreshToken: '',
        requires2FA: true,
      } as any;
    }

    // Update last login
    await this.userRepository.updateLastLogin(user.id);
    console.log('User logged in successfully', { userId: user.id });

    // Auto-repair: ensure wallet, role-specific profile, and Embedly provisioning are complete
    const existingUserDTO = await this.userRepository.getUserById(user.id);

    // Ensure local wallet exists for all non-ADMIN roles
    const needsWallet = user.role !== UserRole.ADMIN;
    if (needsWallet && !existingUserDTO?.wallet) {
      await prisma.wallet.upsert({
        where: { userId: user.id },
        create: { userId: user.id, balance: 0, currency: 'NGN' },
        update: {},
      }).catch(() => {});
      console.log({ message: 'Auto-created missing wallet on login', userId: user.id, role: user.role });
    }

    // Ensure school profile exists for school accounts
    if (user.role === UserRole.SCHOOL) {
      const hasSchoolProfile = existingUserDTO?.schoolProfile != null;
      if (!hasSchoolProfile) {
        await prisma.schoolProfile.create({
          data: { userId: user.id, schoolName: user.fullName, isPrimary: true },
        }).catch(() => {});
      }
    }

    // Ensure teacher profile exists for teacher accounts
    if (user.role === UserRole.TEACHER) {
      const hasTeacherProfile = await prisma.teacherProfile.findUnique({ where: { userId: user.id } });
      if (!hasTeacherProfile) {
        await prisma.teacherProfile.create({ data: { userId: user.id } }).catch(() => {});
      }
    }

    // Re-trigger Embedly provisioning only when the virtual account is still missing.
    // provisionEmbedly is idempotent but skipping the call on already-provisioned
    // users avoids two unnecessary DB reads on every login.
    const hasVirtualAccount = !!(existingUserDTO?.wallet as any)?.virtualAccountNumber;
    if (needsWallet && !hasVirtualAccount) {
      this.provisionEmbedly({
        id: user.id,
        email: user.email,
        firstName: (user as any).firstName || user.fullName.split(' ')[0] || 'User',
        lastName: (user as any).lastName || user.fullName.split(' ').slice(1).join(' ') || user.fullName.split(' ')[0] || 'User',
        middleName: (user as any).middleName ?? undefined,
        phone: user.phone,
        dob: (user as any).dob ? new Date((user as any).dob).toISOString().split('T')[0] : undefined,
        address: (user as any).address ?? undefined,
        city: (user as any).city ?? undefined,
        // NIN/BVN will be read from DB inside provisionEmbedly via existing select
      }).catch((err) => {
        console.error({
          message: 'Embedly re-provisioning on login failed (non-blocking)',
          userId: user.id,
          role: user.role,
          error: err instanceof Error ? err.message : String(err),
        });
      });
    }

    // Generate tokens
    const authUser: AuthUser = {
      id: user.id,
      email: user.email,
      role: user.role,
    };

    const token = generateToken(authUser);
    const refreshToken = generateRefreshToken(authUser);

    const userDTO = await this.userRepository.getUserById(user.id);

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
        residencyStatus: user.residencyStatus,
        isActive: user.isActive,
        isFirstTime: user.isFirstTime,
        twoFactorEnabled: user.twoFactorEnabled,
        lastLogin: new Date(),
        country: user.country,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
        parentProfile: userDTO?.parentProfile ?? null,
        schoolProfile: userDTO?.schoolProfile ?? null,
        wallet: userDTO?.wallet ?? null,
        notificationSettings: userDTO?.notificationSettings ?? null,
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
      
      // Get user ID first to check if token exists
      const userId = await getUserByToken(tokenOrOtp, mode);
      
      console.log(userId, "UserId authservice");
      
      // If no user found, token is invalid or expired
      if (!userId) {
        console.log('Token not found or expired');
        return false;
      }
      
      // Verify token or OTP (this also marks email as verified)
      const isVerified = await verifyToken(tokenOrOtp, mode);
      
      console.log(isVerified, "isVerified");
      
      if (isVerified) {
        // Send welcome email and in-app notification
        try {
          const user = await this.userRepository.findById(userId);
          if (user && user.email) {
            await this.mailService.sendWelcomeEmail(user.email, user.fullName);
            console.log(`Welcome email sent to ${user.email}`);
            // In-app welcome notification (don't await — fire and forget)
            const { NotifyService } = await import('@/src/services/NotifyService');
            const notify = new NotifyService();
            notify.send({
              userId: user.id,
              type: 'INFO',
              title: 'Welcome to PayMyFees!',
              message: `Hi ${user.fullName}, your email is verified. You can now apply for a loan.`,
              actionUrl: '/dashboard',
              category: 'general',
            }).catch(() => {});
          }
        } catch (emailError) {
          // Log but don't fail verification if email fails
          console.error('Failed to send welcome email:', emailError);
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
      // Normalize email to lowercase for case-insensitive lookup
      const normalizedEmail = email.trim().toLowerCase();
      
      console.log('Password reset requested', { email: normalizedEmail });

      // Find user by email
      const user = await this.userRepository.findByEmail(normalizedEmail);

      if (!user) {
        // Don't reveal if email exists for security
        console.warn('Password reset requested for non-existent email', { email: normalizedEmail });
        // Still return success to prevent email enumeration
        return;
      }

      // Check if user is active
      if (!user.isActive) {
        console.warn('Password reset requested for inactive user', { email: normalizedEmail });
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

      console.log('Password reset email sent successfully', { email: normalizedEmail });
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
   * Generate a unique placeholder Nigerian phone number from a user ID.
   * Used when the user has no phone — avoids Embedly "already exists" collisions
   * that happen when every phoneless user shares the same fallback number.
   */
  private placeholderPhone(userId: string): string {
    // Take 8 digits from the UUID (strip hyphens, use last 8 hex chars → decimal)
    const hex = userId.replace(/-/g, '').slice(-8);
    const num = parseInt(hex, 16) % 100_000_000; // 8-digit number
    return `080${String(num).padStart(8, '0')}`;  // e.g. 08012345678
  }

  /**
   * Hash password using bcrypt
   */
  private async hashPassword(password: string): Promise<string> {
    const saltRounds = 10;
    return await bcrypt.hash(password, saltRounds);
  }

  /**
   * Provision Embedly customer + virtual wallet for a user.
   * Safe to call multiple times — handles partial provisioning:
   *   - No customer yet         → create customer + wallet
   *   - Customer exists, no VA  → create wallet only (skips customer step)
   *   - Both exist              → no-op
   *
   * Throws on unrecoverable failure so the caller can rollback if needed.
   */
  async provisionEmbedly(user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    middleName?: string;
    phone: string | null;
    dob?: string;
    address?: string;
    city?: string;
  }): Promise<void> {
    // Read current state from DB
    const existing = await prisma.user.findUnique({
      where: { id: user.id },
      select: { embedlyCustomerId: true, fullName: true },
    });
    const existingWallet = await prisma.wallet.findUnique({
      where: { userId: user.id },
      select: { virtualAccountNumber: true },
    });

    const embedlyCustomerId: string | null = (existing as any)?.embedlyCustomerId ?? null;
    const hasVirtualAccount: boolean = !!existingWallet?.virtualAccountNumber;

    // Fully provisioned — nothing to do
    if (embedlyCustomerId && hasVirtualAccount) {
      console.log({ message: 'Embedly already fully provisioned', userId: user.id });
      return;
    }

    const embedlyService = new EmbedlyService();

    // Sanitize names for Embedly (letters only, min 2 chars)
    const sanitizeName = (raw: string): string =>
      raw.replace(/[^a-zA-Z\s-]/g, '').trim().slice(0, 50) || 'User';

    const firstName = sanitizeName(user.firstName).length >= 2
      ? sanitizeName(user.firstName)
      : 'User';
    const lastName = sanitizeName(user.lastName).length >= 2
      ? sanitizeName(user.lastName)
      : firstName;
    const middleName = user.middleName ? sanitizeName(user.middleName) : undefined;
    const fullName = existing?.fullName || `${firstName} ${lastName}`;

    // Resolve lookup IDs dynamically so staging/prod IDs are always correct
    const [customerTypeId, countryId, currencyId] = await Promise.all([
      embedlyService.fetchCustomerTypeId(),
      embedlyService.fetchCountryId(),
      embedlyService.fetchCurrencyId(),
    ]);

    // ── Step 1: Resolve Embedly customer ID ────────────────────────────────────
    let customerId = embedlyCustomerId;
    if (!customerId) {
      try {
        const result = await embedlyService.createCustomer({
          firstName,
          lastName,
          middleName,
          emailAddress: user.email,
          mobileNumber: user.phone ?? this.placeholderPhone(user.id),
          dob: user.dob || '1990-01-01',
          customerTypeId,
          address: user.address || 'Nigeria',
          city: user.city || 'Lagos',
          countryId,
        });
        customerId = result.embedlyCustomerId;
        console.log({ message: 'Embedly customer created', userId: user.id, customerId });
      } catch (err: any) {
        // createCustomer already tries findCustomerByEmail internally.
        // One more direct lookup before giving up.
        console.warn({ message: 'createCustomer threw, attempting direct email lookup', userId: user.id, error: err?.message });
        customerId = await embedlyService.findCustomerByEmail(user.email).catch(() => null);
        if (!customerId) {
          throw new Error(`Embedly customer creation failed and lookup exhausted: ${err?.message ?? 'unknown'}`);
        }
      }

      // Persist the resolved customer ID
      await prisma.user.update({
        where: { id: user.id },
        data: { embedlyCustomerId: customerId },
      });
    } else {
      console.log({ message: 'Embedly customer already in DB, skipping creation', userId: user.id, customerId });
    }

    // ── Step 2: Create Embedly wallet + virtual account if missing ─────────────
    if (!hasVirtualAccount) {
      // Ensure local wallet record exists before updating it
      await prisma.wallet.upsert({
        where: { userId: user.id },
        create: { userId: user.id, balance: 0, currency: 'NGN' },
        update: {},
      });

      let walletResult = null;
      try {
        walletResult = await embedlyService.createWallet({
          customerId,
          currencyId,
          name: `${fullName} Wallet`,
        });
      } catch (err: any) {
        // createWallet already tries findWalletByCustomerId internally.
        // One more direct lookup before giving up.
        console.warn({ message: 'createWallet threw, attempting direct wallet lookup', userId: user.id, error: err?.message });
        walletResult = await embedlyService.findWalletByCustomerId(customerId).catch(() => null);
        if (!walletResult) {
          throw new Error(`Embedly wallet creation failed and lookup exhausted: ${err?.message ?? 'unknown'}`);
        }
      }

      await prisma.wallet.update({
        where: { userId: user.id },
        data: {
          embedlyWalletId: walletResult.embedlyWalletId,
          virtualAccountNumber: walletResult.virtualAccountNumber,
          virtualAccountBank: walletResult.virtualAccountBank,
        } as any,
      });

      console.log({
        message: 'Embedly wallet provisioned',
        userId: user.id,
        customerId,
        virtualAccountNumber: walletResult.virtualAccountNumber,
      });
    }
  }

  /**
   * Verify password against hash
   */
  private async verifyPassword(password: string, hash: string): Promise<boolean> {
    return await bcrypt.compare(password, hash);
  }

  /**
   * Verify 2FA code during login
   * Validates 2FA code and completes authentication
   */
  async verify2FA(tempToken: string, code: string): Promise<AuthResponse | null> {
    try {
      console.log('2FA verification attempt');

      if (!tempToken || typeof tempToken !== 'string') {
        throw new UnauthorizedError('Valid temporary token is required');
      }

      if (!code || typeof code !== 'string' || code.length !== 6) {
        throw new UnauthorizedError('Valid 6-digit 2FA code is required');
      }

      // Verify the temporary token using JWT_SECRET (same key used to generate it)
      let decoded: AuthUser;
      try {
        decoded = verifyJwtToken(tempToken);
      } catch (tokenError) {
        console.error('Failed to verify temp token:', tokenError);
        throw new UnauthorizedError('Invalid or expired session. Please login again.');
      }

      // Get user
      const user = await this.userRepository.findById(decoded.id);

      if (!user) {
        throw new UnauthorizedError('User not found');
      }

      if (!user.twoFactorEnabled) {
        throw new UnauthorizedError('2FA is not enabled for this account');
      }

      if (!user.twoFactorSecret || typeof user.twoFactorSecret !== 'string') {
        console.error('2FA secret is missing or invalid for user:', user.id);
        throw new UnauthorizedError('2FA configuration error. Please contact support.');
      }

      // Verify the 2FA code using speakeasy
      let verified = false;
      try {
        verified = speakeasy.totp.verify({
          secret: user.twoFactorSecret,
          encoding: 'base32',
          token: code,
          window: 2,
        });
      } catch (speakeasyError) {
        console.error('Speakeasy verification error:', speakeasyError);
        throw new UnauthorizedError('Failed to verify 2FA code. Please try again.');
      }

      if (!verified) {
        console.warn('2FA verification failed: invalid code', { userId: user.id });
        throw new UnauthorizedError('Invalid 2FA code');
      }

      // Update last login
      await this.userRepository.updateLastLogin(user.id);
      console.log('2FA verification successful', { userId: user.id });

      // Generate final auth tokens
      const authUser: AuthUser = {
        id: user.id,
        email: user.email,
        role: user.role,
      };

      const token = generateToken(authUser);
      const refreshToken = generateRefreshToken(authUser);

      const userDTO = await this.userRepository.getUserById(user.id);

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
          residencyStatus: user.residencyStatus,
          isActive: user.isActive,
          isFirstTime: user.isFirstTime,
          twoFactorEnabled: user.twoFactorEnabled,
          lastLogin: new Date(),
          country: user.country,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
          parentProfile: userDTO?.parentProfile ?? null,
          schoolProfile: userDTO?.schoolProfile ?? null,
          wallet: userDTO?.wallet ?? null,
          notificationSettings: userDTO?.notificationSettings ?? null,
        },
        token,
        refreshToken,
      };
    } catch (error) {
      console.error('Error in verify2FA', {
        error: error instanceof Error ? error.message : String(error)
      });

      if (error instanceof UnauthorizedError) {
        throw error;
      }

      throw new UnauthorizedError('2FA verification failed. Please try again.');
    }
  }
}