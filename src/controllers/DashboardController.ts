/**
 * Dashboard Controller
 * HTTP request/response handling for dashboard endpoints
 * Implements controller layer with proper status codes and response formatting
 */

import { NextResponse } from 'next/server';
import { DashboardService, IDashboardService } from '@/src/services/DashboardService';
import { ApiResponse } from '@/src/types';
import { logger } from '@/src/utils/logger';
// import { AuthUser } from '@/src/middleware/auth';

/**
 * Dashboard Controller
 * Handles HTTP layer for dashboard operations
 */
export class DashboardController {
  private dashboardService: IDashboardService;

  constructor(dashboardService?: IDashboardService) {
    this.dashboardService = dashboardService || new DashboardService();
  }

  /**
   * Get dashboard statistics
   * GET /api/dashboard/stats
   */
  async getStats(_req: Request, userId: string | undefined): Promise<NextResponse> {
    console.log({ msg: 'Getting dashboard stats', userId });
    
    if (!userId) {
      return NextResponse.json(
        {
          success: false,
          error: 'Authentication required',
          message: 'User ID is required to fetch dashboard stats',
          metadata: {
            timestamp: new Date().toISOString(),
          },
        },
        { status: 401 }
      );
    }
    
    const stats = await this.dashboardService.getStats(userId);

    const response: ApiResponse = {
      success: true,
      data: stats,
      metadata: {
        timestamp: new Date().toISOString(),
      },
    };

    return NextResponse.json(response, { status: 200 });
  }

  /**
   * Get analytics data
   * GET /api/dashboard/analytics
   */
  async getAnalytics(_req: Request, userId: string | undefined): Promise<NextResponse> {
    console.log({ msg: 'Getting analytics data', userId });
    
    if (!userId) {
      return NextResponse.json(
        {
          success: false,
          error: 'Authentication required',
          message: 'User ID is required to fetch analytics data',
          metadata: {
            timestamp: new Date().toISOString(),
          },
        },
        { status: 401 }
      );
    }
    
    const analytics = await this.dashboardService.getAnalytics(userId);

    const response: ApiResponse = {
      success: true,
      data: analytics,
      metadata: {
        timestamp: new Date().toISOString(),
      },
    };

    return NextResponse.json(response, { status: 200 });
  }

  /**
   * Get chart data
   * GET /api/dashboard/chart
   */
  async getChartData(req: Request, userId: string | undefined): Promise<NextResponse> {
    const { searchParams } = new URL(req.url);
    const yearParam = searchParams.get('year');
    const year = yearParam ? parseInt(yearParam) : undefined;
    
    console.log({ msg: 'Getting chart data', userId, year });
    
    if (!userId) {
      return NextResponse.json(
        {
          success: false,
          error: 'Authentication required',
          message: 'User ID is required to fetch chart data',
          metadata: {
            timestamp: new Date().toISOString(),
          },
        },
        { status: 401 }
      );
    }
    
    const chartData = await this.dashboardService.getChartData(userId, year);

    const response: ApiResponse = {
      success: true,
      data: chartData,
      metadata: {
        timestamp: new Date().toISOString(),
      },
    };

    return NextResponse.json(response, { status: 200 });
  }
}