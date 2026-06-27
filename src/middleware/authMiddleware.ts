/**
 * Authentication Middleware for API Routes
 * Verifies JWT tokens and extracts user information
 */

import { NextResponse } from 'next/server';
import { requireAuth, requireParent, requireSchool, requireAdmin, requireStudent, requireTeacherAdmin, requireSchoolAdmin } from '@/src/middleware/auth';
import { UnauthorizedError } from '@/src/types/errors';

/**
 * Authentication middleware result
 */
export type AuthMiddlewareResult =
  | {
      success: true;
      userId: string;
      role: string;
      response?: never;
    }
  | {
      success: false;
      userId?: never;
      role?: never;
      response: NextResponse;
    };

/**
 * General authentication middleware
 * Verifies JWT token and returns user ID if valid
 */
export async function authMiddleware(req: Request): Promise<AuthMiddlewareResult> {
  try {
    const user = await requireAuth(req);
    
    return {
      success: true,
      userId: user.id,
      role: user.role
    };
  } catch (error) {
    console.warn({ msg: 'Authentication failed', error: (error as Error).message });
    
    const response = NextResponse.json(
      {
        success: false,
        error: 'Authentication required',
        message: 'Please log in to access this resource',
        metadata: {
          timestamp: new Date().toISOString(),
        },
      },
      { status: 401 }
    );
    
    return {
      success: false,
      response
    };
  }
}

/**
 * Student authentication middleware
 * Verifies JWT token and ensures user has STUDENT role
 */
export async function studentAuthMiddleware(req: Request): Promise<AuthMiddlewareResult> {
  try {
    const user = await requireStudent(req);
    
    return {
      success: true,
      userId: user.id,
      role: user.role
    };
  } catch (error) {
    console.warn({ msg: 'Student authentication failed', error: (error as Error).message });
    
    const status = error instanceof UnauthorizedError ? 401 : 403;
    const message = error instanceof UnauthorizedError
      ? 'Authentication required'
      : 'Access denied';

    const response = NextResponse.json(
      {
        success: false,
        error: message,
        message: error instanceof UnauthorizedError
          ? 'Please log in to access this resource'
          : 'You do not have permission to access this resource',
        metadata: {
          timestamp: new Date().toISOString(),
        },
      },
      { status }
    );

    return {
      success: false,
      response
    };
  }
}

/**
 * Parent authentication middleware
 * Verifies JWT token and ensures user has PARENT role
 */
export async function parentAuthMiddleware(req: Request): Promise<AuthMiddlewareResult> {
  try {
    const user = await requireParent(req);
    
    return {
      success: true,
      userId: user.id,
      role: user.role
    };
  } catch (error) {
    console.warn({ msg: 'Parent authentication failed', error: (error as Error).message });
    
    const status = error instanceof UnauthorizedError ? 401 : 403;
    const message = error instanceof UnauthorizedError 
      ? 'Authentication required' 
      : 'Parent access required';
    
    const response = NextResponse.json(
      {
        success: false,
        error: message,
        message: error instanceof UnauthorizedError 
          ? 'Please log in to access this resource' 
          : 'This resource is only accessible to parents',
        metadata: {
          timestamp: new Date().toISOString(),
        },
      },
      { status }
    );
    
    return {
      success: false,
      response
    };
  }
}

/**
 * School authentication middleware
 * Verifies JWT token and ensures user has SCHOOL role
 */
export async function schoolAuthMiddleware(req: Request): Promise<AuthMiddlewareResult> {
  try {
    const user = await requireSchool(req);
    
    return {
      success: true,
      userId: user.id,
      role: user.role
    };
  } catch (error) {
    console.warn({ msg: 'School authentication failed', error: (error as Error).message });
    
    const status = error instanceof UnauthorizedError ? 401 : 403;
    const message = error instanceof UnauthorizedError 
      ? 'Authentication required' 
      : 'School access required';
    
    const response = NextResponse.json(
      {
        success: false,
        error: message,
        message: error instanceof UnauthorizedError 
          ? 'Please log in to access this resource' 
          : 'This resource is only accessible to schools',
        metadata: {
          timestamp: new Date().toISOString(),
        },
      },
      { status }
    );
    
    return {
      success: false,
      response
    };
  }
}

/**
 * Admin authentication middleware
 * Verifies JWT token and ensures user has ADMIN role
 */
export async function adminAuthMiddleware(req: Request): Promise<AuthMiddlewareResult> {
  try {
    const user = await requireAdmin(req);
    
    return {
      success: true,
      userId: user.id,
      role: user.role
    };
  } catch (error) {
    console.warn({ msg: 'Admin authentication failed', error: (error as Error).message });
    
    const status = error instanceof UnauthorizedError ? 401 : 403;
    const message = error instanceof UnauthorizedError 
      ? 'Authentication required' 
      : 'Admin access required';
    
    const response = NextResponse.json(
      {
        success: false,
        error: message,
        message: error instanceof UnauthorizedError 
          ? 'Please log in to access this resource' 
          : 'This resource is only accessible to administrators',
        metadata: {
          timestamp: new Date().toISOString(),
        },
      },
      { status }
    );

    return {
      success: false,
      response
    };
  }
}

/**
 * School Admin authentication middleware
 * Verifies JWT token and ensures user has SCHOOL_ADMIN role
 */
export async function schoolAdminAuthMiddleware(req: Request): Promise<AuthMiddlewareResult> {
  try {
    const user = await requireSchoolAdmin(req);
    return {
      success: true,
      userId: user.id,
      role: user.role
    };
  } catch (error) {
    console.warn({ msg: 'School admin authentication failed', error: (error as Error).message });
    const status = error instanceof UnauthorizedError ? 401 : 403;
    const message = error instanceof UnauthorizedError
      ? 'Authentication required'
      : 'School Admin access required';
    const response = NextResponse.json(
      {
        success: false,
        error: message,
        message: error instanceof UnauthorizedError
          ? 'Please log in to access this resource'
          : 'This resource is only accessible to school administrators',
        metadata: { timestamp: new Date().toISOString() },
      },
      { status }
    );
    return { success: false, response };
  }
}

/**
 * Teacher Admin authentication middleware
 * Verifies JWT token and ensures user has TEACHER_ADMIN role
 */
export async function teacherAdminAuthMiddleware(req: Request): Promise<AuthMiddlewareResult> {
  try {
    const user = await requireTeacherAdmin(req);
    return {
      success: true,
      userId: user.id,
      role: user.role
    };
  } catch (error) {
    console.warn({ msg: 'Teacher admin authentication failed', error: (error as Error).message });
    const status = error instanceof UnauthorizedError ? 401 : 403;
    const message = error instanceof UnauthorizedError
      ? 'Authentication required'
      : 'Teacher Admin access required';
    const response = NextResponse.json(
      {
        success: false,
        error: message,
        message: error instanceof UnauthorizedError
          ? 'Please log in to access this resource'
          : 'This resource is only accessible to teacher administrators',
        metadata: { timestamp: new Date().toISOString() },
      },
      { status }
    );
    return { success: false, response };
  }
}