import { NotFoundError, ValidationError } from '@/lib/errors';
import {
  handleRouteError,
  isValidEmail,
  parseIntParam,
  sanitizeString,
  successResponse,
} from '@/lib/utils';
import { UserService } from '@/services/user.service';
import { Prisma } from '@prisma/client';
import { NextRequest } from 'next/server';

// GET /api/users/[id] - Lấy thông tin user theo ID
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const userId = parseIntParam(id);

    if (userId <= 0) {
      throw new ValidationError('Invalid user ID');
    }

    const user = await UserService.getUserById(userId);

    if (!user) {
      throw new NotFoundError('User not found');
    }

    return successResponse(user);
  } catch (error) {
    return handleRouteError(error, 'GET /api/users/[id]');
  }
}

// PUT /api/users/[id] - Cập nhật thông tin user
export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const userId = parseIntParam(id);

    if (userId <= 0) {
      throw new ValidationError('Invalid user ID');
    }

    const body = await request.json();
    const { fullName, email, phoneNumber, address, role, status } = body;

    // Validate email format if provided
    if (email && !isValidEmail(email)) {
      throw new ValidationError('Invalid email format');
    }

    // Prepare sanitized update data
    const updateData: Prisma.UserUpdateInput = {
      fullName: fullName !== undefined ? { set: sanitizeString(fullName) } : undefined,
      email: email !== undefined ? { set: email.toLowerCase().trim() } : undefined,
      phoneNumber:
        phoneNumber !== undefined
          ? { set: phoneNumber ? sanitizeString(phoneNumber) : null }
          : undefined,
      address:
        address !== undefined ? { set: address ? sanitizeString(address) : null } : undefined,
      role: role !== undefined ? { set: role } : undefined,
      status: status !== undefined ? { set: status } : undefined,
    };

    const updatedUser = await UserService.updateUser(userId, updateData);

    return successResponse(updatedUser, 'User updated successfully');
  } catch (error) {
    return handleRouteError(error, 'PUT /api/users/[id]');
  }
}

// DELETE /api/users/[id] - Xóa user (soft delete)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const userId = parseIntParam(id);

    if (userId <= 0) {
      throw new ValidationError('Invalid user ID');
    }

    await UserService.deleteUser(userId);

    return successResponse(null, 'User deleted successfully');
  } catch (error) {
    return handleRouteError(error, 'DELETE /api/users/[id]');
  }
}
