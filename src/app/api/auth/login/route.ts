import { NextRequest, NextResponse } from 'next/server'
import { AuthService } from '@/services/auth.service'
import { LoginRequest } from '@/types/auth'
import { errorResponse, successResponse } from '@/lib/api-utils'

// POST /api/auth/login - Login user
export async function POST(request: NextRequest) {
  try {
    const body: LoginRequest = await request.json()
    
    // Validate required fields
    if (!body.email || !body.password) {
      return errorResponse('Email and password are required', 400)
    }

    // Login user
    const result = await AuthService.login(body)
    
    // Set refresh token as httpOnly cookie
    const response = successResponse(
      {
        user: result.user,
        accessToken: result.accessToken,
        expiresIn: result.expiresIn
      },
      'Login successful'
    )
    
    // Set refresh token cookie
    response.cookies.set('refreshToken', result.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: body.rememberMe ? 30 * 24 * 60 * 60 : 7 * 24 * 60 * 60, // 30 days or 7 days
      path: '/'
    })
    
    return response
  } catch (error) {
    console.error('POST /api/auth/login Error:', error)
    
    if (error instanceof Error) {
      // Handle specific authentication errors
      if (error.message.includes('Invalid email or password')) {
        return errorResponse('Invalid email or password', 401)
      }
      
      if (error.message.includes('Account is inactive')) {
        return errorResponse('Account is inactive. Please contact administrator.', 403)
      }
      
      if (error.message.includes('Too many login attempts')) {
        return errorResponse('Too many login attempts. Please try again later.', 429)
      }
      
      return errorResponse(error.message, 400)
    }
    
    return errorResponse('Login failed', 500)
  }
}
