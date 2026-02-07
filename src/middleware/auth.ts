/**
 * Authentication Middleware
 * Verifies JWT tokens and extracts user information
 */

import jwt from 'jsonwebtoken';
import { UnauthorizedError, ForbiddenError } from '@/src/types/errors';
import { env } from '@/src/config/env';
import { UserRole } from '@prisma/client';

export interface AuthUser {
  id: string;
  email: string;
  role: UserRole;
}

export interface AuthRequest extends Request {
  user?: AuthUser;
}

/**
 * Extract token from Authorization header
 */
function extractToken(req: Request): string | null {
  const authHeader = req.headers.get('authorization');
  
  if (!authHeader) {
    return null;
  }

  const parts = authHeader.split(' ');
  
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return null;
  }

  return parts[1] || null;
}

/**
 * Verify JWT token and extract payload
 */
function verifyToken(token: string): AuthUser {
  try {
    const decoded = jwt.verify(token, env.get('JWT_SECRET')) as AuthUser;
    return decoded;
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throw new UnauthorizedError('Token has expired');
    }
    if (error instanceof jwt.JsonWebTokenError) {
      throw new UnauthorizedError('Invalid token');
    }
    throw new UnauthorizedError('Authentication failed');
  }
}

/**
 * Verify JWT token (public export for use outside middleware)
 */
export function verifyJwtToken(token: string): AuthUser {
  return verifyToken(token);
}

/**
 * Authentication middleware
 * Requires valid JWT token
 */
export async function requireAuth(req: Request): Promise<AuthUser> {
  const token = extractToken(req);

  if (!token) {
    throw new UnauthorizedError('No authentication token provided');
  }

  const user = verifyToken(token);
  return user;
}

/**
 * Role-based authorization middleware
 * Requires user to have one of the specified roles
 */
export function requireRole(...allowedRoles: UserRole[]) {
  return async (req: Request): Promise<AuthUser> => {
    const user = await requireAuth(req);

    if (!allowedRoles.includes(user.role)) {
      throw new ForbiddenError('Insufficient permissions');
    }

    return user;
  };
}

/**
 * Optional authentication middleware
 * Extracts user if token is present, but doesn't require it
 */
export async function optionalAuth(req: Request): Promise<AuthUser | null> {
  const token = extractToken(req);

  if (!token) {
    return null;
  }

  try {
    return verifyToken(token);
  } catch (error) {
    return null;
  }
}

/**
 * Generate JWT token
 */
export function generateToken(user: AuthUser, expiresIn?: string): string {
  //@ts-ignore
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role,
    },
    env.get('JWT_SECRET'),
    {
      expiresIn: expiresIn || env.get('JWT_EXPIRES_IN'),
    }
  );
}

/**
 * Generate refresh token
 */
export function generateRefreshToken(user: AuthUser): string {
  //@ts-ignore
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role,
    },
    env.get('REFRESH_TOKEN_SECRET'),
    {
      expiresIn: env.get('REFRESH_TOKEN_EXPIRES_IN'),
    }
  );
}

/**
 * Verify refresh token
 */
export function verifyRefreshToken(token: string): AuthUser {
  try {
    const decoded = jwt.verify(token, env.get('REFRESH_TOKEN_SECRET')) as AuthUser;
    return decoded;
  } catch (error) {
    throw new UnauthorizedError('Invalid refresh token');
  }
}

/**
 * Middleware for parent-only routes
 */
export const requireParent = requireRole(UserRole.PARENT);

/**
 * Middleware for student-only routes
 */
export const requireStudent = requireRole(UserRole.STUDENT);

/**
 * Middleware for school-only routes
 */
export const requireSchool = requireRole(UserRole.SCHOOL);

/**
 * Middleware for admin-only routes
 */
export const requireAdmin = requireRole(UserRole.ADMIN);

/**
 * Middleware for parent or admin routes
 */
export const requireParentOrAdmin = requireRole(UserRole.PARENT, UserRole.ADMIN);
