import { NextRequest, NextResponse } from 'next/server'
import { AuthService } from '@/services/auth.service'
import { RegisterRequest } from '@/types/auth'
import { errorResponse, successResponse } from '@/lib/api-utils'

// POST /api/auth/register - Register new user
export async function POST(request: NextRequest) {
  try {
    const body: RegisterRequest = await request.json()
    
    // Validate required fields
    const requiredFields = ['fullName', 'email', 'password', 'confirmPassword']
    const missingFields = requiredFields.filter(field => !body[field as keyof RegisterRequest])
    
    if (missingFields.length > 0) {
      return errorResponse(`Missing required fields: ${missingFields.join(', ')}`, 400)
    }

    // Register user
    const result = await AuthService.register(body)
    
    return successResponse(result, 'Account created successfully', 201)
  } catch (error) {
    console.error('POST /api/auth/register Error:', error)
    
    if (error instanceof Error) {
      // Handle specific validation errors
      if (error.message.includes('Validation failed')) {
        return errorResponse(error.message, 400)
      }
      
      if (error.message.includes('Email already registered')) {
        return errorResponse('Email already registered', 409)
      }
      
      if (error.message.includes('Too many registration attempts')) {
        return errorResponse('Too many registration attempts. Please try again later.', 429)
      }
      
      return errorResponse(error.message, 400)
    }
    
    return errorResponse('Registration failed', 500)
  }
}
