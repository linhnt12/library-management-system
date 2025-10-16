import { NextRequest, NextResponse } from 'next/server'
import { JWTUtils } from '@/lib/auth-utils'
import { AuthService } from '@/services/auth.service'
import { successResponse, errorResponse } from '@/lib/api-utils'
import { Role } from '@prisma/client'
import { AuthUser } from '@/types/auth'

// Extend NextRequest to include user
declare global {
  namespace Express {
    interface Request {
      user?: AuthUser
    }
  }
}

// Add user to request type
export interface AuthenticatedRequest extends NextRequest {
  user: AuthUser
}

// Authentication middleware
export async function authenticateToken(request: NextRequest): Promise<{
  success: boolean
  user?: AuthUser
  error?: string
}> {
  try {
    // Get token from Authorization header
    const authHeader = request.headers.get('authorization')
    const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null

    if (!token) {
      return {
        success: false,
        error: 'Access token required'
      }
    }

    // Verify token
    const payload = JWTUtils.verifyAccessToken(token)
    
    // Get user from database
    const user = await AuthService.getUserById(payload.userId)
    
    if (!user) {
      return {
        success: false,
        error: 'User not found or inactive'
      }
    }

    return {
      success: true,
      user
    }
  } catch (error) {
    return {
      success: false,
      error: 'Invalid or expired token'
    }
  }
}

// Authorization middleware - check if user has required role
export function authorizeRoles(allowedRoles: Role[]) {
  return (user: AuthUser): boolean => {
    return allowedRoles.includes(user.role)
  }
}

// Middleware wrapper for API routes
export function withAuth(
  handler: (req: AuthenticatedRequest, context?: any) => Promise<NextResponse>,
  options?: {
    roles?: Role[]
    optional?: boolean
  }
) {
  return async (request: NextRequest, context?: any): Promise<NextResponse> => {
    // Authenticate user
    const authResult = await authenticateToken(request)
    
    if (!authResult.success) {
      if (options?.optional) {
        // If auth is optional, continue without user
        return handler(request as AuthenticatedRequest, context)
      }
      
      return errorResponse(authResult.error || 'Authentication failed', 401)
    }

    // Check role authorization if specified
    if (options?.roles && options.roles.length > 0) {
      const hasPermission = authorizeRoles(options.roles)(authResult.user!)
      
      if (!hasPermission) {
        return errorResponse('Insufficient permissions', 403)
      }
    }

    // Add user to request
    ;(request as AuthenticatedRequest).user = authResult.user!
    
    return handler(request as AuthenticatedRequest, context)
  }
}

// Helper functions for common role checks
export const requireAuth = (handler: (req: AuthenticatedRequest, context?: any) => Promise<NextResponse>) =>
  withAuth(handler)

export const requireAdmin = (handler: (req: AuthenticatedRequest, context?: any) => Promise<NextResponse>) =>
  withAuth(handler, { roles: [Role.ADMIN] })

export const requireLibrarian = (handler: (req: AuthenticatedRequest, context?: any) => Promise<NextResponse>) =>
  withAuth(handler, { roles: [Role.ADMIN, Role.LIBRARIAN] })

export const optionalAuth = (handler: (req: AuthenticatedRequest, context?: any) => Promise<NextResponse>) =>
  withAuth(handler, { optional: true })

// Response helpers (using api-utils)
export function unauthorizedResponse(message = 'Authentication required') {
  return errorResponse(message, 401)
}

export function forbiddenResponse(message = 'Insufficient permissions') {
  return errorResponse(message, 403)
}
