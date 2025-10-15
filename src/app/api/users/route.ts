import { NextRequest, NextResponse } from 'next/server'
import { Role, UserStatus } from '@prisma/client'
import { UserService } from '@/services/user.service'
import { 
  successResponse, 
  errorResponse, 
  handleRouteError, 
  parsePaginationParams,
  validateRequiredFields,
  isValidEmail,
  sanitizeString
} from '@/lib/api-utils'

// GET /api/users - Lấy danh sách users
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const { page, limit, search } = parsePaginationParams(searchParams)
    const role = searchParams.get('role') as Role | null
    const status = searchParams.get('status') as UserStatus | null

    const result = await UserService.getUsers({
      page,
      limit,
      search,
      role: role || undefined,
      status: status || undefined,
    })

    return successResponse(result)
  } catch (error) {
    return handleRouteError(error, 'GET /api/users')
  }
}

// POST /api/users - Tạo user mới
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { fullName, email, password, phoneNumber, address, role } = body

    // Validate required fields
    const validationError = validateRequiredFields(body, ['fullName', 'email', 'password'])
    if (validationError) {
      return errorResponse(validationError, 400)
    }

    // Validate email format
    if (!isValidEmail(email)) {
      return errorResponse('Invalid email format', 400)
    }

    const user = await UserService.createUser({
      fullName: sanitizeString(fullName),
      email: email.toLowerCase().trim(),
      password, // Note: Hash this in production
      phoneNumber: phoneNumber ? sanitizeString(phoneNumber) : undefined,
      address: address ? sanitizeString(address) : undefined,
      role: role || undefined,
    })

    return successResponse(user, 'User created successfully', 201)
  } catch (error) {
    if (error instanceof Error && error.message === 'Email already exists') {
      return errorResponse('Email already exists', 409)
    }
    return handleRouteError(error, 'POST /api/users')
  }
}
