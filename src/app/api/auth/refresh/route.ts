import { NextRequest, NextResponse } from 'next/server'
import { AuthService } from '@/services/auth.service'
import { successResponse, errorResponse } from '@/lib/api-utils'

// POST /api/auth/refresh - Refresh access token
export async function POST(request: NextRequest) {
  try {
    // Get refresh token from cookie
    const refreshToken = request.cookies.get('refreshToken')?.value
    
    if (!refreshToken) {
      return errorResponse('Refresh token not found', 401)
    }

    // Refresh access token
    const result = await AuthService.refreshAccessToken(refreshToken)
    
    return successResponse(result, 'Token refreshed successfully')
  } catch (error) {
    console.error('POST /api/auth/refresh Error:', error)
    
    // Clear invalid refresh token cookie
    const response = errorResponse('Invalid or expired refresh token', 401)
    response.cookies.set('refreshToken', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 0,
      path: '/'
    })
    
    return response
  }
}
