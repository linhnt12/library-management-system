import { NextRequest, NextResponse } from 'next/server'
import { AuthService } from '@/services/auth.service'
import { successResponse } from '@/lib/api-utils'

// POST /api/auth/logout - Logout user
export async function POST(request: NextRequest) {
  try {
    // Get refresh token from cookie
    const refreshToken = request.cookies.get('refreshToken')?.value

    if (refreshToken) {
      // Logout user (invalidate refresh token)
      await AuthService.logout(refreshToken)
    }

    // Create response
    const response = successResponse(null, 'Logout successful')

    // Clear refresh token cookie
    response.cookies.set('refreshToken', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 0,
      path: '/'
    })

    return response
  } catch (error) {
    console.error('POST /api/auth/logout Error:', error)

    // Even if logout fails, clear the cookie
    const response = successResponse(null, 'Logout successful')
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
