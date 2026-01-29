/**
 * Wallet Repository
 * Database layer for Wallet entity operations
 * Implements repository pattern with Prisma and PostgreSQL
 */

import { prisma } from '@/src/database/prisma';
import { Wallet } from '@prisma/client';
import { NotFoundError, ValidationError } from '@/src/types/errors';

/**
 * Wallet Repository Interface
 */
export interface IWalletRepository {
  create(userId: string): Promise<Wallet>;
  findByUserId(userId: string): Promise<Wallet | null>;
  findById(id: string): Promise<Wallet | null>;
  updateBalance(userId: string, amount: number, operation: 'increment' | 'decrement'): Promise<Wallet>;
  getBalance(userId: string): Promise<number>;
  setAutoDebit(userId: string, enabled: boolean): Promise<Wallet>;
  getAutoDebitStatus(userId: string): Promise<boolean>;
}

/**
 * Wallet Repository Implementation
 */
export class WalletRepository implements IWalletRepository {
  /**
   * Create a new wallet for a user
   */
  async create(userId: string): Promise<Wallet> {
    return await prisma.wallet.create({
      data: {
        userId,
        balance: 0,
        currency: 'NGN',
      },
    });
  }

  /**
   * Find wallet by user ID
   */
  async findByUserId(userId: string): Promise<Wallet | null> {
    return await prisma.wallet.findUnique({
      where: { userId },
    });
  }

  /**
   * Find wallet by ID
   */
  async findById(id: string): Promise<Wallet | null> {
    return await prisma.wallet.findUnique({
      where: { id },
    });
  }

  /**
   * Update wallet balance atomically
   * Uses PostgreSQL atomic operations to prevent race conditions
   */
  async updateBalance(
    userId: string,
    amount: number,
    operation: 'increment' | 'decrement'
  ): Promise<Wallet> {
    const wallet = await this.findByUserId(userId);
    
    if (!wallet) {
      throw new NotFoundError('Wallet not found');
    }

    // For decrement, check sufficient balance
    if (operation === 'decrement' && Number(wallet.balance) < amount) {
      throw new ValidationError('Insufficient wallet balance');
    }

    return await prisma.wallet.update({
      where: { userId },
      data: {
        balance: {
          [operation]: amount,
        },
      },
    });
  }

  /**
   * Get wallet balance
   */
  async getBalance(userId: string): Promise<number> {
    const wallet = await this.findByUserId(userId);
    
    if (!wallet) {
      throw new NotFoundError('Wallet not found');
    }

    return Number(wallet.balance);
  }

  /**
   * Set auto-debit status for a wallet
   */
  async setAutoDebit(userId: string, enabled: boolean): Promise<Wallet> {
    const wallet = await this.findByUserId(userId);
    
    if (!wallet) {
      throw new NotFoundError('Wallet not found');
    }

    return await prisma.wallet.update({
      where: { userId },
      data: {
        autoDebitEnabled: enabled,
      },
    });
  }

  /**
   * Get auto-debit status for a wallet
   */
  async getAutoDebitStatus(userId: string): Promise<boolean> {
    const wallet = await this.findByUserId(userId);
    
    if (!wallet) {
      throw new NotFoundError('Wallet not found');
    }

    return wallet.autoDebitEnabled || false;
  }
}
