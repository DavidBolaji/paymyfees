/**
 * Verification Utilities
 * Handles email verification and password reset token management
 * Uses your existing VerificationToken model
 */

import { prisma } from '@/src/database/prisma';
import crypto from 'crypto';

/**
 * Generate a random token
 */
function generateToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

/**
 * Generate a random 6-digit OTP
 */
function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

/**
 * Create email verification (link or OTP)
 * Uses existing VerificationToken model with type field
 */
export async function createVerification(
  userId: string,
  mode: 'link' | 'otp'
): Promise<{ token?: string; otp?: string; expiresAt: Date }> {
  // Delete any existing email verifications for this user
  await prisma.verificationToken.deleteMany({
    where: { 
      userId,
      type: mode as any, // 'link' or 'otp' matches your VerificationType enum
    },
  });

  const expiresAt = new Date();
  
  if (mode === 'link') {
    // Link expires in 24 hours
    expiresAt.setHours(expiresAt.getHours() + 24);
    
    const token = generateToken();
    
    await prisma.verificationToken.create({
      data: {
        userId,
        token,
        expiresAt,
        type: 'link', // matches VerificationType.link
      },
    });
    
    return { token, expiresAt };
  } else {
    // OTP expires in 10 minutes
    expiresAt.setMinutes(expiresAt.getMinutes() + 10);
    
    const otp = generateOTP();
    
    // Store OTP in the token field (since your schema doesn't have separate otp field)
    await prisma.verificationToken.create({
      data: {
        userId,
        token: otp, // Store OTP in token field
        expiresAt,
        type: 'otp', // matches VerificationType.otp
      },
    });
    
    return { otp, expiresAt };
  }
}

/**
 * Verify token or OTP and mark email as verified
 */
export async function verifyToken(
  tokenOrOtp: string,
  mode: 'link' | 'otp'
): Promise<boolean> {
  try {
    const verification = await prisma.verificationToken.findFirst({
      where: {
        token: tokenOrOtp,
        type: mode as any,
        expiresAt: {
          gt: new Date(),
        },
      },
    });

    if (!verification) {
      return false;
    }

    // Mark email as verified
    await prisma.user.update({
      where: { id: verification.userId },
      data: { emailVerified: true },
    });

    // Delete the verification record
    await prisma.verificationToken.delete({
      where: { id: verification.id },
    });

    return true;
  } catch (error) {
    console.error('Error verifying token:', error);
    return false;
  }
}

/**
 * Get user ID from token or OTP
 */
export async function getUserByToken(
  tokenOrOtp: string,
  mode: 'link' | 'otp'
): Promise<string | null> {
  try {
    const verification = await prisma.verificationToken.findFirst({
      where: {
        token: tokenOrOtp,
        type: mode as any,
        expiresAt: {
          gt: new Date(),
        },
      },
    });

    return verification?.userId || null;
  } catch (error) {
    console.error('Error getting user by token:', error);
    return null;
  }
}

/**
 * Get user email from token or OTP
 */
export async function getUserEmailByToken(
  tokenOrOtp: string,
  mode: 'link' | 'otp'
): Promise<string | null> {
  try {
    const verification = await prisma.verificationToken.findFirst({
      where: {
        token: tokenOrOtp,
        type: mode as any,
        expiresAt: {
          gt: new Date(),
        },
      },
      include: {
        user: {
          select: {
            email: true,
          },
        },
      },
    });

    return verification?.user.email || null;
  } catch (error) {
    console.error('Error getting user email by token:', error);
    return null;
  }
}

/**
 * Create password reset token
 * We'll use a custom type identifier in the token field to distinguish it
 */
export async function createPasswordResetToken(
  userId: string
): Promise<{ token: string; expiresAt: Date }> {
  // Delete any existing password reset tokens for this user
  // We'll identify password reset tokens by checking if they start with 'reset_'
  const existingTokens = await prisma.verificationToken.findMany({
    where: {
      userId,
      token: {
        startsWith: 'reset_',
      },
    },
  });

  // Delete existing reset tokens
  if (existingTokens.length > 0) {
    await prisma.verificationToken.deleteMany({
      where: {
        userId,
        token: {
          startsWith: 'reset_',
        },
      },
    });
  }

  // Token expires in 1 hour
  const expiresAt = new Date();
  expiresAt.setHours(expiresAt.getHours() + 1);
  
  const token = 'reset_' + generateToken(); // Prefix to identify password reset tokens
  
  // Use 'link' type for password reset tokens (since they're sent via link)
  await prisma.verificationToken.create({
    data: {
      userId,
      token,
      expiresAt,
      type: 'link',
    },
  });
  
  return { token, expiresAt };
}

/**
 * Verify password reset token and return user ID
 */
export async function verifyPasswordResetToken(token: string): Promise<string | null> {
  try {
    // Check if it's a password reset token (starts with 'reset_')
    if (!token.startsWith('reset_')) {
      return null;
    }

    const verification = await prisma.verificationToken.findFirst({
      where: {
        token,
        type: 'link',
        expiresAt: {
          gt: new Date(),
        },
      },
    });

    if (!verification) {
      return null;
    }

    // Delete the verification record after use (single-use token)
    await prisma.verificationToken.delete({
      where: { id: verification.id },
    });

    return verification.userId;
  } catch (error) {
    console.error('Error verifying password reset token:', error);
    return null;
  }
}

/**
 * Check if password reset token is valid (without consuming it)
 */
export async function checkPasswordResetToken(token: string): Promise<boolean> {
  try {
    // Check if it's a password reset token (starts with 'reset_')
    if (!token.startsWith('reset_')) {
      return false;
    }

    const verification = await prisma.verificationToken.findFirst({
      where: {
        token,
        type: 'link',
        expiresAt: {
          gt: new Date(),
        },
      },
    });

    return !!verification;
  } catch (error) {
    console.error('Error checking password reset token:', error);
    return false;
  }
}