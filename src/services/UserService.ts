import { UserRepository, IUserRepository } from '@/src/repositories/UserRepository';
import { ValidationError, NotFoundError } from '@/src/types/errors';
import speakeasy from 'speakeasy';
import QRCode from 'qrcode';

/**
 * User Service
 * Business logic for user operations
 */
export interface IUserService {
  getUserProfile(userId: string): Promise<any>;
  updateUserProfile(userId: string, data: any): Promise<any>;
  handle2FASettings(userId: string, data: any): Promise<any>;
  getNotificationSettings(userId: string): Promise<any>;
  updateNotificationSettings(userId: string, data: any): Promise<any>;
}

/**
 * User Service Implementation
 */
export class UserService implements IUserService {
  private userRepository: IUserRepository;

  constructor(userRepository?: IUserRepository) {
    this.userRepository = userRepository || new UserRepository();
  }

  /**
   * Get user profile for a user
   */
  async getUserProfile(userId: string): Promise<any> {
    console.log({ msg: 'Getting user profile', userId });

    const user = await this.userRepository.getUserById(userId);
    if (!user) {
      throw new NotFoundError('User profile not found');
    }

    return user;
  }

  /**
   * Update user profile
   */
  async updateUserProfile(userId: string, data: any): Promise<any> {
    console.log({ msg: 'Updating user profile', userId });

    // Validate required fields
    if (!data.email) {
      throw new ValidationError('Email is required');
    }

    // Normalize email to lowercase if provided
    if (data.email) {
      data.email = data.email.trim().toLowerCase();
    }

    // Update user profile
    const updatedUser = await this.userRepository.updateUser(userId, data);
    return updatedUser;
  }

  /**
   * Handle 2FA settings
   */
  async handle2FASettings(userId: string, data: any): Promise<any> {
    console.log({ msg: 'Handling 2FA settings', userId, action: data.action });

    const user = await this.userRepository.getUserById(userId);
    if (!user) {
      throw new NotFoundError('User not found');
    }

    // Setup 2FA - Generate secret and QR code
    if (data.action === 'setup') {
      // Generate secret
      const secret = speakeasy.generateSecret({
        name: `PayMyFees (${user.email})`,
        issuer: 'PayMyFees',
        length: 32,
      });

      // Generate QR code
      const qrCodeUrl = await QRCode.toDataURL(secret.otpauth_url || '');

      // Store secret temporarily (will be confirmed after verification)
      await this.userRepository.updateUser(userId, {
        twoFactorSecret: secret.base32,
      });

      return {
        secret: secret.base32,
        qrCode: qrCodeUrl,
        message: 'Scan the QR code with your authenticator app',
      };
    }

    // Verify and enable 2FA
    if (data.action === 'enable') {
      if (!data.code) {
        throw new ValidationError('Verification code is required');
      }

      const userWithSecret = await this.userRepository.findById(userId);
      if (!userWithSecret || !userWithSecret.twoFactorSecret) {
        throw new ValidationError('2FA setup not initiated. Please setup first.');
      }

      // Verify the code
      const verified = speakeasy.totp.verify({
        secret: userWithSecret.twoFactorSecret,
        encoding: 'base32',
        token: data.code,
        window: 2, // Allow 2 time steps before/after
      });

      if (!verified) {
        throw new ValidationError('Invalid verification code');
      }

      // Enable 2FA
      await this.userRepository.updateUser(userId, {
        twoFactorEnabled: true,
      });

      return {
        enabled: true,
        message: '2FA has been successfully enabled',
      };
    }

    // Disable 2FA
    if (data.action === 'disable') {
      if (!data.code) {
        throw new ValidationError('Verification code is required to disable 2FA');
      }

      const userWithSecret = await this.userRepository.findById(userId);
      if (!userWithSecret || !userWithSecret.twoFactorSecret) {
        throw new ValidationError('2FA is not enabled');
      }

      // Verify the code before disabling
      const verified = speakeasy.totp.verify({
        secret: userWithSecret.twoFactorSecret,
        encoding: 'base32',
        token: data.code,
        window: 2,
      });

      if (!verified) {
        throw new ValidationError('Invalid verification code');
      }

      // Disable 2FA and remove secret
      await this.userRepository.updateUser(userId, {
        twoFactorEnabled: false,
        twoFactorSecret: null,
      });

      return {
        enabled: false,
        message: '2FA has been successfully disabled',
      };
    }

    throw new ValidationError('Invalid action. Use: setup, enable, or disable');
  }

  /**
   * Get notification settings
   */
  async getNotificationSettings(userId: string): Promise<any> {
    console.log({ msg: 'Getting notification settings', userId });

    const settings = await this.userRepository.getNotificationSettings(userId);
    
    // If no settings exist, return defaults
    if (!settings) {
      return {
        emailNotifications: true,
        inAppNotifications: true,
        walletFunding: true,
        loanApproval: true,
        repaymentReminders: true,
        verificationStatus: true,
        securityAlerts: true,
        promotions: true,
      };
    }

    return settings;
  }

  /**
   * Update notification settings
   */
  async updateNotificationSettings(userId: string, data: any): Promise<any> {
    console.log({ msg: 'Updating notification settings', userId });

    const user = await this.userRepository.getUserById(userId);
    if (!user) {
      throw new NotFoundError('User not found');
    }

    // Update or create notification settings
    const settings = await this.userRepository.updateNotificationSettings(userId, data);

    return settings;
  }
}