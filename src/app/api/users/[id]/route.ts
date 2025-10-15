import { NextRequest, NextResponse } from 'next/server'
import { UserService } from '@/services/user.service'
import { 
  successResponse, 
  errorResponse, 
  handleRouteError,
  parseIntParam,
  validateRequiredFields,
  isValidEmail,
  sanitizeString
} from '@/lib/api-utils'

// GET /api/users/[id] - Lấy thông tin user theo ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = parseIntParam(params.id)

    if (userId <= 0) {
      return errorResponse('Invalid user ID', 400)
    }

    const user = await UserService.getUserById(userId)

    if (!user) {
      return errorResponse('User not found', 404)
    }

    return successResponse(user)
  } catch (error) {
    return handleRouteError(error, 'GET /api/users/[id]')
  }
}

// PUT /api/users/[id] - Cập nhật thông tin user
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = parseIntParam(params.id)

    if (userId <= 0) {
      return errorResponse('Invalid user ID', 400)
    }

    const body = await request.json()
    const { fullName, email, phoneNumber, address, role, status } = body

    // Validate email format if provided
    if (email && !isValidEmail(email)) {
      return errorResponse('Invalid email format', 400)
    }

    // Prepare sanitized update data
    const updateData: any = {}
    if (fullName !== undefined) updateData.fullName = sanitizeString(fullName)
    if (email !== undefined) updateData.email = email.toLowerCase().trim()
    if (phoneNumber !== undefined) updateData.phoneNumber = phoneNumber ? sanitizeString(phoneNumber) : null
    if (address !== undefined) updateData.address = address ? sanitizeString(address) : null
    if (role !== undefined) updateData.role = role
    if (status !== undefined) updateData.status = status

    const updatedUser = await UserService.updateUser(userId, updateData)

    return successResponse(updatedUser, 'User updated successfully')
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === 'User not found') {
        return errorResponse('User not found', 404)
      }
      if (error.message === 'Email already exists') {
        return errorResponse('Email already exists', 409)
      }
    }
    return handleRouteError(error, 'PUT /api/users/[id]')
  }
}

// DELETE /api/users/[id] - Xóa user (soft delete)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = parseIntParam(params.id)

    if (userId <= 0) {
      return errorResponse('Invalid user ID', 400)
    }

    await UserService.deleteUser(userId)

    return successResponse(null, 'User deleted successfully')
  } catch (error) {
    if (error instanceof Error && error.message === 'User not found') {
      return errorResponse('User not found', 404)
    }
    return handleRouteError(error, 'DELETE /api/users/[id]')
  }
}
