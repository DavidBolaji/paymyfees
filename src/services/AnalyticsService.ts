/**
 * Analytics Service
 * Business logic for analytics operations
 */

import { AnalyticsRepository, IAnalyticsRepository, AnalyticsData } from '@/src/repositories/AnalyticsRepository';
import { NotFoundError } from '@/src/types/errors';

export interface IAnalyticsService {
  getUserAnalytics(userId: string): Promise<AnalyticsData>;
}

/**
 * Analytics Service Implementation
 */
export class AnalyticsService implements IAnalyticsService {
  private analyticsRepository: IAnalyticsRepository;

  constructor(analyticsRepository?: IAnalyticsRepository) {
    this.analyticsRepository = analyticsRepository || new AnalyticsRepository();
  }

  /**
   * Get comprehensive analytics for a user
   */
  async getUserAnalytics(userId: string): Promise<AnalyticsData> {
    console.log({ msg: 'Getting user analytics', userId });

    if (!userId) {
      throw new NotFoundError('User ID is required');
    }

    const analytics = await this.analyticsRepository.getAnalyticsByUserId(userId);

    console.log({ msg: 'User analytics retrieved', userId, analytics });
    return analytics;
  }
}