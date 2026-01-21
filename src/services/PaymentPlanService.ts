/**
 * Payment Plan Service
 * Business logic for payment plan operations
 */

import { logger } from '@/src/utils/logger';
import { PaymentPlanRepository, IPaymentPlanRepository } from '@/src/repositories/PaymentPlanRepository';

/**
 * Payment Plan Service Interface
 */
export interface IPaymentPlanService {
  getPaymentPlanByUserId(userId: string): Promise<any>;
}

/**
 * Payment Plan Service Implementation
 */
export class PaymentPlanService implements IPaymentPlanService {
  private paymentPlanRepository: IPaymentPlanRepository;

  constructor(paymentPlanRepository?: IPaymentPlanRepository) {
    this.paymentPlanRepository = paymentPlanRepository || new PaymentPlanRepository();
  }

  /**
   * Get payment plan for a user
   * @param userId User ID
   * @returns Payment plan with installments and statistics
   */
  async getPaymentPlanByUserId(userId: string): Promise<any> {
    logger.info({ msg: 'Getting payment plan for user', userId });
    
    // Delegate to repository
    const paymentPlan = await this.paymentPlanRepository.getPaymentPlanByUserId(userId);
    
    return paymentPlan;
  }
}