/**
 * Timeline Controller
 * HTTP request/response handling for timeline endpoints
 */

import { NextResponse } from 'next/server';
import { TimelineService, ITimelineService } from '@/src/services/TimelineService';
import { ApiResponse } from '@/src/types';
import { AuthUser } from '@/src/middleware/auth';

/**
 * Timeline Controller
 * Handles HTTP layer for timeline operations
 */
export class TimelineController {
  private timelineService: ITimelineService;

  constructor(timelineService?: ITimelineService) {
    this.timelineService = timelineService || new TimelineService();
  }

  /**
   * Get timeline data for a loan
   * GET /api/timeline?loanId=xxx (optional loanId)
   */
  async getTimeline(_req: Request, user: AuthUser, loanId?: string): Promise<NextResponse> {
    console.log({ msg: 'Get loan timeline', loanId, userId: user.id });

    const timelineData = await this.timelineService.getTimelineData(user.id, loanId);

    const response: ApiResponse = {
      success: true,
      data: timelineData,
      metadata: {
        timestamp: new Date().toISOString(),
      },
    };

    return NextResponse.json(response, { status: 200 });
  }
}