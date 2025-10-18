import { ValidationError } from '@/lib/errors';
import {
  handleRouteError,
  isValidEmail,
  parsePaginationParams,
  sanitizeString,
  successResponse,
  validateRequiredFields,
} from '@/lib/utils';
import { UserService } from '@/services/user.service';
import { Role, UserStatus } from '@prisma/client';
import { NextRequest } from 'next/server';

// GET /api/users - Lấy danh sách users
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const { page, limit, search } = parsePaginationParams(searchParams);
    const role = searchParams.get('role') as Role | null;
    const status = searchParams.get('status') as UserStatus | null;

    const result = await UserService.getUsers({
      page,
      limit,
      search,
      role: role || undefined,
      status: status || undefined,
    });

    return successResponse(result);
  } catch (error) {
    return handleRouteError(error, 'GET /api/users');
  }
}

// POST /api/users - Tạo user mới
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { fullName, email, password, phoneNumber, address, role } = body;

    // Validate required fields
    const validationError = validateRequiredFields(body, ['fullName', 'email', 'password']);
    if (validationError) {
      throw new ValidationError(validationError);
    }

    // Validate email format
    if (!isValidEmail(email)) {
      throw new ValidationError('Invalid email format');
    }

    const user = await UserService.createUser({
      fullName: sanitizeString(fullName),
      email: email.toLowerCase().trim(),
      password, // Note: Hash this in production
      phoneNumber: phoneNumber ? sanitizeString(phoneNumber) : undefined,
      address: address ? sanitizeString(address) : undefined,
      role: role || undefined,
    });

    return successResponse(user, 'User created successfully', 201);
  } catch (error) {
    return handleRouteError(error, 'POST /api/users');
  }
}
