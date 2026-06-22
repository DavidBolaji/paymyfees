import { auth } from '@/auth';
import { prisma } from '@/src/database/prisma';
import { generateToken, generateRefreshToken } from '@/src/middleware/auth';
import { UserRepository } from '@/src/repositories/UserRepository';
import { NextResponse } from 'next/server';
import { asyncHandler } from '@/src/middleware/errorHandler';
import { AppError } from '@/src/types';

/**
 * Exchange NextAuth session for custom JWT tokens
 * Used for existing email users who have linked their Google account
 * (i.e., profile already complete, no Phase 2 needed)
 */
export const GET = asyncHandler(async () => {
  // Get NextAuth session
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json(
      { success: false, error: 'Unauthorized' },
      { status: 401 }
    );
  }

  const userId = session.user.id;

  // Fetch user from DB
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    throw new AppError('User not found', 404);
  }

  // Ensure the user has a wallet (for linked email users)
  await prisma.wallet.upsert({
    where: { userId },
    create: {
      userId,
      currency: 'NGN',
      balance: 0,
    },
    update: {},
  });

  // Generate custom JWT tokens
  const token = generateToken(user);
  const refreshToken = generateRefreshToken(user);

  // Fetch full userDTO with relations
  const userRepository = new UserRepository();
  const userDTO = await userRepository.getUserById(userId);

  if (!userDTO) {
    throw new AppError('User not found', 404);
  }

  return NextResponse.json(
    {
      success: true,
      data: {
        user: userDTO,
        token,
        refreshToken,
      },
    },
    { status: 200 }
  );
});
