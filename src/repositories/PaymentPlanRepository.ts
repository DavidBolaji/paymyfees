/**
 * Payment Plan Repository
 * Data access layer for payment plans
 */

import { prisma } from '@/src/lib/prisma';
import { logger } from '@/src/utils/logger';
import { NotFoundError } from '@/src/types/errors';

/**
 * Payment Plan Repository Interface
 */
export interface IPaymentPlanRepository {
  getPaymentPlanByUserId(userId: string): Promise<any>;
}

/**
 * Payment Plan Repository Implementation
 */
export class PaymentPlanRepository implements IPaymentPlanRepository {
  /**
   * Get payment plan for a user
   * @param userId User ID
   * @returns Payment plan with installments
   */
  async getPaymentPlanByUserId(userId: string): Promise<any> {
    console.log({ msg: 'Getting payment plan by user ID', userId });

    // Get active loans for the user
    const activeLoan = await prisma.loan.findFirst({
      where: {
        userId,
        status: {
          in: ['ACTIVE', 'DISBURSED']
        }
      },
      include: {
        installments: {
          orderBy: {
            dueDate: 'asc'
          }
        }
      }
    });

    if (!activeLoan) {
      throw new NotFoundError('No active payment plan found');
    }

    // Calculate payment plan statistics
    const totalInstallments = activeLoan.installments.length;
    const paidInstallments = activeLoan.installments.filter(i => i.status === 'PAID').length;
    const nextInstallment = activeLoan.installments.find(i => i.status === 'PENDING');
    
    return {
      loanId: activeLoan.id,
      loanNumber: activeLoan.loanNumber,
      schoolName: activeLoan.schoolName,
      totalAmount: activeLoan.totalAmount,
      amountRepaid: activeLoan.amountRepaid,
      outstandingBalance: activeLoan.outstandingBalance,
      startDate: activeLoan.disbursementDate,
      endDate: activeLoan.firstPaymentDate,
      status: activeLoan.status,
      installments: activeLoan.installments,
      stats: {
        totalInstallments,
        paidInstallments,
        remainingInstallments: totalInstallments - paidInstallments,
        completionPercentage: Math.round((paidInstallments / totalInstallments) * 100),
        nextPaymentAmount: nextInstallment?.amount || 0,
        nextPaymentDate: nextInstallment?.dueDate || null
      }
    };
  }
}