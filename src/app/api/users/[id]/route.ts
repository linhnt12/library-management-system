import { NextRequest } from 'next/server';
import { UserService } from '@/api/user.api';
import {
  successResponse,
  handleRouteError,
  parseIntParam,
  isValidEmail,
  sanitizeString,
} from '@/lib/utils';
import { ValidationError, NotFoundError } from '@/lib/errors';

// GET /api/users/[id] - Lấy thông tin user theo ID
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const userId = parseIntParam(params.id);

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
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const userId = parseIntParam(params.id);

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
    const updateData: any = {};
    if (fullName !== undefined) updateData.fullName = sanitizeString(fullName);
    if (email !== undefined) updateData.email = email.toLowerCase().trim();
    if (phoneNumber !== undefined)
      updateData.phoneNumber = phoneNumber ? sanitizeString(phoneNumber) : null;
    if (address !== undefined) updateData.address = address ? sanitizeString(address) : null;
    if (role !== undefined) updateData.role = role;
    if (status !== undefined) updateData.status = status;

    const updatedUser = await UserService.updateUser(userId, updateData);

    return successResponse(updatedUser, 'User updated successfully');
  } catch (error) {
    return handleRouteError(error, 'PUT /api/users/[id]');
  }
}

// DELETE /api/users/[id] - Xóa user (soft delete)
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const userId = parseIntParam(params.id);

    if (userId <= 0) {
      throw new ValidationError('Invalid user ID');
    }

    await UserService.deleteUser(userId);

    return successResponse(null, 'User deleted successfully');
  } catch (error) {
    return handleRouteError(error, 'DELETE /api/users/[id]');
  }
}
