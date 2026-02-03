/**
 * Analytics Controller
 * HTTP request/response handling for analytics endpoints
 */

import { NextResponse } from 'next/server';
import { AnalyticsService, IAnalyticsService } from '@/src/services/AnalyticsService';
import { ApiResponse } from '@/src/types';
import { AuthUser } from '@/src/middleware/auth';

/**
 * Analytics Controller
 * Handles HTTP layer for analytics operations
 */
export class AnalyticsController {
  private analyticsService: IAnalyticsService;

  constructor(analyticsService?: IAnalyticsService) {
    this.analyticsService = analyticsService || new AnalyticsService();
  }

  /**
   * Get user analytics
   * GET /api/analytics
   */
  async getUserAnalytics(_req: Request, user: AuthUser): Promise<NextResponse> {
    console.log({ msg: 'Analytics request', userId: user.id });

    const analytics = await this.analyticsService.getUserAnalytics(user.id);

    const response: ApiResponse = {
      success: true,
      data: analytics,
      metadata: {
        timestamp: new Date().toISOString(),
      },
    };

    return NextResponse.json(response, { status: 200 });
  }
}