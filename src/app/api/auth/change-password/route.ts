import { NextRequest } from 'next/server'
import { AuthService } from '@/services/auth.service'
import { ChangePasswordRequest } from '@/types/auth'
import { requireAuth } from '@/middleware/auth.middleware'
import { successResponse, errorResponse } from '@/lib/api-utils'

// POST /api/auth/change-password - Change user password
export const POST = requireAuth(async (request) => {
  try {
    const body: ChangePasswordRequest = await request.json()
    const userId = request.user.id
    
    // Validate required fields
    const requiredFields = ['currentPassword', 'newPassword', 'confirmNewPassword']
    const missingFields = requiredFields.filter(field => !body[field as keyof ChangePasswordRequest])
    
    if (missingFields.length > 0) {
      return errorResponse(`Missing required fields: ${missingFields.join(', ')}`, 400)
    }

    // Change password
    await AuthService.changePassword(userId, body)
    
    return successResponse(null, 'Password changed successfully')
  } catch (error) {
    console.error('POST /api/auth/change-password Error:', error)
    
    if (error instanceof Error) {
      // Handle specific validation errors
      if (error.message.includes('Password validation failed')) {
        return errorResponse(error.message, 400)
      }
      
      if (error.message.includes('Current password is incorrect')) {
        return errorResponse('Current password is incorrect', 400)
      }
      
      if (error.message.includes('New passwords do not match')) {
        return errorResponse('New passwords do not match', 400)
      }
      
      if (error.message.includes('New password must be different')) {
        return errorResponse('New password must be different from current password', 400)
      }
      
      return errorResponse(error.message, 400)
    }
    
    return errorResponse('Password change failed', 500)
  }
})
