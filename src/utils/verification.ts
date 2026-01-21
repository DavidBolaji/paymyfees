/**
 * Verification Utilities
 * Handles token generation, OTP generation, and validation for email verification
 */

import crypto from 'crypto';
import { prisma } from '@/src/database/prisma';
import { logger } from '@/src/utils/logger';

// Constants
const TOKEN_EXPIRY_HOURS = 24; // Link verification token expiry in hours
const OTP_EXPIRY_MINUTES = 10; // OTP expiry in minutes
const OTP_LENGTH = 6; // Length of OTP code

/**
 * Generate a secure random verification token
 */
export const generateVerificationToken = (): string => {
  return crypto.randomBytes(32).toString('hex');
};

/**
 * Generate a numeric OTP code
 */
export const generateOTP = (): string => {
  // Generate a random 6-digit number
  const min = Math.pow(10, OTP_LENGTH - 1);
  const max = Math.pow(10, OTP_LENGTH) - 1;
  return Math.floor(min + Math.random() * (max - min + 1)).toString();
};

/**
 * Save verification token to database
 */
export const saveVerificationToken = async (
  userId: string,
  token: string,
  type: 'link' | 'otp',
  expiresAt: Date
): Promise<void> => {
  try {
    await prisma.verificationToken.create({
      data: {
        userId,
        token,
        type,
        expiresAt,
      },
    });
    logger.info(`Verification ${type} saved for user ${userId}`);
  } catch (error) {
    logger.error(`Error saving verification ${type} for user ${userId}`);
    throw error;
  }
};

/**
 * Create verification token or OTP based on mode
 */
export const createVerification = async (
  userId: string,
  mode: 'link' | 'otp'
): Promise<{ token?: string; otp?: string; expiresAt: Date }> => {
  try {
    // Delete any existing tokens for this user
    await prisma.verificationToken.deleteMany({
      where: { userId },
    });

    // Set expiry time based on verification type
    const expiresAt = new Date();
    if (mode === 'link') {
      expiresAt.setHours(expiresAt.getHours() + TOKEN_EXPIRY_HOURS);
      const token = generateVerificationToken();
      await saveVerificationToken(userId, token, 'link', expiresAt);
      return { token, expiresAt };
    } else {
      expiresAt.setMinutes(expiresAt.getMinutes() + OTP_EXPIRY_MINUTES);
      const otp = generateOTP();
      await saveVerificationToken(userId, otp, 'otp', expiresAt);
      return { otp, expiresAt };
    }
  } catch (error) {
    logger.error(`Error creating verification for user ${userId} with mode ${mode}`);
    throw error;
  }
};

/**
 * Verify token or OTP
 */
export const verifyToken = async (
  userId: string,
  tokenOrOtp: string,
  mode: 'link' | 'otp'
): Promise<boolean> => {
  try {
    // Find token in database
    const verification = await prisma.verificationToken.findFirst({
      where: {
        userId,
        token: tokenOrOtp,
        type: mode,
      },
    });

    // Check if token exists and is not expired
    if (!verification) {
      logger.warn(`Invalid verification ${mode} for user ${userId}`);
      return false;
    }

    if (verification.expiresAt < new Date()) {
      logger.warn(`Expired verification ${mode} for user ${userId}`);
      return false;
    }

    // Delete the token after successful verification
    await prisma.verificationToken.delete({
      where: { id: verification.id },
    });

    // Update user's email verification status
    await prisma.user.update({
      where: { id: userId },
      data: { emailVerified: true },
    });

    logger.info(`Email verification successful for user ${userId}`);
    return true;
  } catch (error) {
    logger.error(`Error verifying token for user ${userId} with mode ${mode}`);
    throw error;
  }
};

/**
 * Check if token is expired
 */
export const isTokenExpired = async (token: string): Promise<boolean> => {
  try {
    const verification = await prisma.verificationToken.findFirst({
      where: { token },
    });

    if (!verification) {
      return true;
    }

    return verification.expiresAt < new Date();
  } catch (error) {
    logger.error(`Error checking token expiration for token ${token.substring(0, 8)}...`);
    throw error;
  }
};