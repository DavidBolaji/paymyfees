/**
 * Migration Script: Create Wallets for Existing Users
 * 
 * This script creates wallet accounts for all existing users who don't have one.
 * Run this script to ensure all users have an associated wallet.
 */

import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

// Define types for our script
interface User {
  id: string;
  email: string;
  wallet: any | null;
}

interface MigrationResult {
  userId: string;
  email: string;
  walletId?: string;
  success: boolean;
  error?: string;
}

async function createWalletsForUsers() {
  try {
    console.log('Starting wallet creation for existing users...');
    
    // Find all users
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        wallet: true,
      },
    }) as User[];
    
    console.log(`Found ${users.length} total users`);
    
    // Filter users without wallets
    const usersWithoutWallets = users.filter((user: User) => !user.wallet);
    
    console.log(`Found ${usersWithoutWallets.length} users without wallets`);
    
    if (usersWithoutWallets.length === 0) {
      console.log('All users already have wallets. No action needed.');
      return;
    }
    
    // Create wallets for users who don't have one
    const results = await Promise.all(
      usersWithoutWallets.map(async (user: User) => {
        try {
          const wallet = await prisma.wallet.create({
            data: {
              userId: user.id,
              balance: 0,
              currency: 'NGN',
            },
          });
          
          return {
            userId: user.id,
            email: user.email,
            walletId: wallet.id,
            success: true,
          };
        } catch (error) {
          console.error(`Failed to create wallet for user ${user.id}:`, error);
          return {
            userId: user.id,
            email: user.email,
            success: false,
            error: error instanceof Error ? error.message : String(error),
          };
        }
      })
    );
    
    // Log results
    const successCount = results.filter((r: MigrationResult) => r.success).length;
    const failureCount = results.filter((r: MigrationResult) => !r.success).length;
    
    console.log('Migration completed:');
    console.log(`- Successfully created ${successCount} wallets`);
    console.log(`- Failed to create ${failureCount} wallets`);
    
    if (failureCount > 0) {
      console.log('Failed users:');
      results
        .filter((r: MigrationResult) => !r.success)
        .forEach((r: MigrationResult) => console.log(`- User ${r.email} (${r.userId}): ${r.error}`));
    }
    
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the migration
createWalletsForUsers()
  .then(() => {
    console.log('Wallet migration script completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Wallet migration script failed:', error);
    process.exit(1);
  });