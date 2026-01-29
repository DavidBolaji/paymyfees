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
    try {
      console.log({
        message: `Verification ${type} saved for user ${userId}`,
        userId,
        type
      });
    } catch (loggingError) {
      // Fallback to simple console logging if structured logging fails
      console.info(`Verification ${type} saved for user ${userId}`);
    }
  } catch (error) {
    try {
      console.error({
        message: `Error saving verification ${type} for user ${userId}`,
        userId,
        type,
        errorMessage: error instanceof Error ? error.message : String(error)
      });
    } catch (loggingError) {
      // Fallback to simple console logging if structured logging fails
      console.error(`Error saving verification ${type} for user ${userId}: ${error}`);
    }
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
    // Use a safer logging approach to avoid worker thread issues
    try {
      console.error({
        message: `Error creating verification for user ${userId} with mode ${mode}`,
        userId,
        mode,
        errorMessage: error instanceof Error ? error.message : String(error)
      });
    } catch (loggingError) {
      // Fallback to simple string logging if structured logging fails
      console.error(`Error creating verification for user ${userId} with mode ${mode}: ${error}`);
    }
    throw error;
  }
};

/**
 * Verify token or OTP
 */
export const verifyToken = async (
  tokenOrOtp: string,
  mode: 'link' | 'otp'
): Promise<boolean> => {
  try {
    // Find token in database
    const verification = await prisma.verificationToken.findFirst({
      where: {
        token: tokenOrOtp,
        type: mode,
      },

    });

    // Check if token exists and is not expired
    if (!verification) {
      try {
        console.warn({
          message: `Invalid verification ${mode} for user`,
          mode
        });
      } catch (loggingError) {
        // Fallback to simple console logging if structured logging fails
        console.warn(`Invalid verification ${mode} for user }`);
      }
      return false;
    }

    if (verification.expiresAt < new Date()) {
      try {
        console.warn({
          message: `Expired verification ${mode} for user `,
          mode
        });
      } catch (loggingError) {
        // Fallback to simple console logging if structured logging fails
        console.warn(`Expired verification ${mode} for user ${verification.userId}`);
      }
      return false;
    }

    // Delete the token after successful verification
    await prisma.verificationToken.delete({
      where: { id: verification.id },
    });

    // Update user's email verification status
    await prisma.user.update({
      where: { id: verification.userId },
      data: { emailVerified: true },
    });

    try {
      console.log({
        message: `Email verification successful for user ${verification.userId}`,
        userId: verification.userId
      });
    } catch (loggingError) {
      // Fallback to simple console logging if structured logging fails
      console.info(`Email verification successful for user`);
    }
    return true;
  } catch (error) {
    try {
      console.error({
        message: `Error verifying token for user with mode ${mode}`,
        mode,
        errorMessage: error instanceof Error ? error.message : String(error)
      });
    } catch (loggingError) {
      // Fallback to simple console logging if structured logging fails
      console.error(`Error verifying token for user with mode ${mode}: ${error}`);
    }
    throw error;
  }
};

/**
 * Get User By token
 */
export const getUserByToken = async (
  tokenOrOtp: string,
  mode: 'link' | 'otp'
): Promise<string | null> => {
  try {
    // Find token in database
    const verification = await prisma.verificationToken.findFirst({
      where: {
        token: tokenOrOtp,
        type: mode,
      },

    });

    // Check if token exists and is not expired
    if (!verification) {
      try {
        console.warn({
          message: `Invalid verification ${mode} for user`,
          mode
        });
      } catch (loggingError) {
        // Fallback to simple console logging if structured logging fails
        console.warn(`Invalid verification ${mode} for user }`);
      }
      return null;
    }

    if (verification.expiresAt < new Date()) {
      try {
        console.warn({
          message: `Expired verification ${mode} for user `,
          mode
        });
      } catch (loggingError) {
        // Fallback to simple console logging if structured logging fails
        console.warn(`Expired verification ${mode} for user ${verification.userId}`);
      }
      return null;
    }

   
    try {
      console.log({
        message: `Email verification successful for user ${verification.userId}`,
        userId: verification.userId
      });
    } catch (loggingError) {
      // Fallback to simple console logging if structured logging fails
      console.info(`Email verification successful for user`);
    }
    return verification.userId;
  } catch (error) {
    try {
      console.error({
        message: `Error verifying token for user with mode ${mode}`,
        mode,
        errorMessage: error instanceof Error ? error.message : String(error)
      });
    } catch (loggingError) {
      // Fallback to simple console logging if structured logging fails
      console.error(`Error verifying token for user with mode ${mode}: ${error}`);
    }
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
    try {
      console.error({
        message: `Error checking token expiration for token ${token.substring(0, 8)}...`,
        tokenPrefix: token.substring(0, 8),
        errorMessage: error instanceof Error ? error.message : String(error)
      });
    } catch (loggingError) {
      // Fallback to simple console logging if structured logging fails
      console.error(`Error checking token expiration for token ${token.substring(0, 8)}...: ${error}`);
    }
    throw error;
  }
};