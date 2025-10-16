import { NextRequest } from 'next/server'
import { AuthService } from '@/services/auth.service'
import { LoginRequest } from '@/types/auth'
import { successResponse, handleRouteError } from '@/lib/api-utils'
import { ValidationError } from '@/lib/errors'

// POST /api/auth/login - Login user
export async function POST(request: NextRequest) {
  try {
    const body: LoginRequest = await request.json()

    // Validate required fields
    if (!body.email || !body.password) {
      throw new ValidationError('Email and password are required')
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
    return handleRouteError(error, 'POST /api/auth/login')
  }
}
