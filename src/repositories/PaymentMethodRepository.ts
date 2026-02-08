/**
 * Payment Method Repository
 * Database layer for SavedPaymentMethod entity operations
 */

import { prisma } from '@/src/database/prisma';
import { SavedPaymentMethod } from '@prisma/client';
import { NotFoundError } from '@/src/types/errors';

/**
 * Payment Method DTO
 */
export interface PaymentMethodDTO {
  id: string;
  userId: string;
  authorizationCode: string;
  cardType: string;
  last4: string;
  expMonth: string;
  expYear: string;
  bank: string | null;
  brand: string;
  isDefault: boolean;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Create Payment Method Input
 */
export interface CreatePaymentMethodInput {
  userId: string;
  authorizationCode: string;
  cardType: string;
  last4: string;
  expMonth: string;
  expYear: string;
  bank?: string;
  brand: string;
  isDefault?: boolean;
}

/**
 * Payment Method Repository Interface
 */
export interface IPaymentMethodRepository {
  create(input: CreatePaymentMethodInput): Promise<PaymentMethodDTO>;
  findById(id: string): Promise<PaymentMethodDTO | null>;
  findByUserId(userId: string): Promise<PaymentMethodDTO[]>;
  findByAuthorizationCode(authorizationCode: string): Promise<PaymentMethodDTO | null>;
  findDefaultByUserId(userId: string): Promise<PaymentMethodDTO | null>;
  setDefault(id: string, userId: string): Promise<PaymentMethodDTO>;
  delete(id: string, userId: string): Promise<void>;
  deactivate(id: string, userId: string): Promise<PaymentMethodDTO>;
}

/**
 * Payment Method Repository Implementation
 */
export class PaymentMethodRepository implements IPaymentMethodRepository {
  /**
   * Convert Prisma entity to DTO
   */
  private toDTO(entity: SavedPaymentMethod): PaymentMethodDTO {
    return {
      id: entity.id,
      userId: entity.userId,
      authorizationCode: entity.authorizationCode,
      cardType: entity.cardType,
      last4: entity.last4,
      expMonth: entity.expMonth,
      expYear: entity.expYear,
      bank: entity.bank,
      brand: entity.brand,
      isDefault: entity.isDefault,
      isActive: entity.isActive,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    };
  }

  /**
   * Create a new saved payment method
   */
  async create(input: CreatePaymentMethodInput): Promise<PaymentMethodDTO> {
    // If this is set as default, unset other defaults
    if (input.isDefault) {
      await prisma.savedPaymentMethod.updateMany({
        where: {
          userId: input.userId,
          isDefault: true,
        },
        data: {
          isDefault: false,
        },
      });
    }

    const paymentMethod = await prisma.savedPaymentMethod.create({
      data: {
        userId: input.userId,
        authorizationCode: input.authorizationCode,
        cardType: input.cardType,
        last4: input.last4,
        expMonth: input.expMonth,
        expYear: input.expYear,
        bank: input.bank,
        brand: input.brand,
        isDefault: input.isDefault || false,
        isActive: true,
      },
    });

    return this.toDTO(paymentMethod);
  }

  /**
   * Find payment method by ID
   */
  async findById(id: string): Promise<PaymentMethodDTO | null> {
    const paymentMethod = await prisma.savedPaymentMethod.findUnique({
      where: { id },
    });

    return paymentMethod ? this.toDTO(paymentMethod) : null;
  }

  /**
   * Find all payment methods for a user
   */
  async findByUserId(userId: string): Promise<PaymentMethodDTO[]> {
    const paymentMethods = await prisma.savedPaymentMethod.findMany({
      where: {
        userId,
        isActive: true,
      },
      orderBy: [
        { isDefault: 'desc' },
        { createdAt: 'desc' },
      ],
    });

    return paymentMethods.map((pm) => this.toDTO(pm));
  }

  /**
   * Find payment method by authorization code
   */
  async findByAuthorizationCode(authorizationCode: string): Promise<PaymentMethodDTO | null> {
    const paymentMethod = await prisma.savedPaymentMethod.findFirst({
      where: {
        authorizationCode,
        isActive: true,
      },
    });

    return paymentMethod ? this.toDTO(paymentMethod) : null;
  }

  /**
   * Find default payment method for a user
   */
  async findDefaultByUserId(userId: string): Promise<PaymentMethodDTO | null> {
    const paymentMethod = await prisma.savedPaymentMethod.findFirst({
      where: {
        userId,
        isDefault: true,
        isActive: true,
      },
    });

    return paymentMethod ? this.toDTO(paymentMethod) : null;
  }

  /**
   * Set a payment method as default
   */
  async setDefault(id: string, userId: string): Promise<PaymentMethodDTO> {
    // Verify ownership
    const paymentMethod = await this.findById(id);
    if (!paymentMethod || paymentMethod.userId !== userId) {
      throw new NotFoundError('Payment method not found');
    }

    // Unset other defaults
    await prisma.savedPaymentMethod.updateMany({
      where: {
        userId,
        isDefault: true,
      },
      data: {
        isDefault: false,
      },
    });

    // Set this as default
    const updated = await prisma.savedPaymentMethod.update({
      where: { id },
      data: {
        isDefault: true,
      },
    });

    return this.toDTO(updated);
  }

  /**
   * Delete a payment method
   */
  async delete(id: string, userId: string): Promise<void> {
    // Verify ownership
    const paymentMethod = await this.findById(id);
    if (!paymentMethod || paymentMethod.userId !== userId) {
      throw new NotFoundError('Payment method not found');
    }

    await prisma.savedPaymentMethod.delete({
      where: { id },
    });
  }

  /**
   * Deactivate a payment method (soft delete)
   */
  async deactivate(id: string, userId: string): Promise<PaymentMethodDTO> {
    // Verify ownership
    const paymentMethod = await this.findById(id);
    if (!paymentMethod || paymentMethod.userId !== userId) {
      throw new NotFoundError('Payment method not found');
    }

    const updated = await prisma.savedPaymentMethod.update({
      where: { id },
      data: {
        isActive: false,
        isDefault: false,
      },
    });

    return this.toDTO(updated);
  }
}
