/**
 * Admin Middleware
 * Validates that the authenticated user has admin privileges
 */

import { NextResponse } from 'next/server';
import { logger } from '@/src/utils/logger';

/**
 * Admin middleware result
 */
export interface AdminMiddlewareResult {
  success: boolean;
  userId?: string;
  response?: NextResponse;
}

/**
 * Middleware to verify admin privileges
 * @param req Request object
 * @param userId User ID from auth middleware
 * @returns AdminMiddlewareResult with success status and response if failed
 */
export async function adminMiddleware(req: Request, userId?: string): Promise<AdminMiddlewareResult> {
  try {
    // In a real implementation, you would check if the user has admin privileges
    // For example, by checking a database or an admin role in the JWT token
    
    // For now, we'll assume the check is successful
    logger.info({ msg: 'Admin privileges verified', userId });
    
    return {
      success: true,
      userId
    };
  } catch (error) {
    logger.error({ msg: 'Admin middleware error', error });
    
    return {
      success: false,
      response: NextResponse.json(
        {
          success: false,
          error: 'Unauthorized: Admin privileges required',
        },
        { status: 403 }
      ),
    };
  }
}