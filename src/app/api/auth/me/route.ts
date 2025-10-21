import { ValidationError } from '@/lib/errors';
import { FileUtils } from '@/lib/server-utils';
import { handleRouteError, successResponse } from '@/lib/utils';
import { requireAuth } from '@/middleware/auth.middleware';
import { UserService } from '@/services/user.service';
import path from 'path';

// GET /api/auth/me - Get current user profile
export const GET = requireAuth(async request => {
  // User is already authenticated and attached to request by middleware
  const user = request.user;

  return successResponse(user, 'User profile retrieved successfully');
});

// PUT /api/auth/me - Update current user profile
export const PUT = requireAuth(async request => {
  try {
    const userId = request.user.id;
    const contentType = request.headers.get('content-type');

    // Check if the request is FormData
    if (!contentType?.includes('multipart/form-data')) {
      throw new ValidationError('Content-Type must be multipart/form-data');
    }

    const formData = await request.formData();

    // Extract form fields
    const fullName = formData.get('fullName')?.toString();
    const email = formData.get('email')?.toString();
    const phoneNumber = formData.get('phoneNumber')?.toString() || undefined;
    const address = formData.get('address')?.toString() || undefined;
    const avatar = formData.get('avatar') as File | null;

    // Validate required fields
    if (!fullName || !email) {
      throw new ValidationError('Full name and email are required');
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new ValidationError('Invalid email format');
    }

    // Prepare update data
    const updateData: {
      fullName: string;
      email: string;
      phoneNumber: string | null;
      address: string | null;
      avatarUrl?: string;
    } = {
      fullName,
      email,
      phoneNumber: phoneNumber || null,
      address: address || null,
    };

    // Handle avatar upload (optional)
    if (avatar && avatar.size > 0) {
      // Validate file is an image
      const allowedImageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
      const fileExtension = path.extname(avatar.name).toLowerCase();

      if (!allowedImageExtensions.includes(fileExtension)) {
        throw new ValidationError(
          `Invalid file type. Allowed types: ${allowedImageExtensions.join(', ')}`
        );
      }

      // Check file size (max 5MB for avatars)
      const maxAvatarSize = 5 * 1024 * 1024; // 5MB
      const sizeCheckResult = await FileUtils.checkFileSize(avatar, {
        maxSizeInBytes: maxAvatarSize,
      });

      if (!sizeCheckResult.success) {
        throw new ValidationError(sizeCheckResult.message);
      }

      // Generate unique filename
      const timestamp = Date.now();
      const sanitizedFileName = `avatar-${userId}-${timestamp}${fileExtension}`;

      // Convert File to Buffer
      const arrayBuffer = await avatar.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      // Write file to uploads/avatars directory
      const uploadResult = await FileUtils.writeFileToSystem(buffer, sanitizedFileName, {
        directory: 'uploads/avatars',
        overwrite: true,
        createDirectory: true,
      });

      if (!uploadResult.success) {
        throw new Error(`Failed to upload avatar: ${uploadResult.message}`);
      }

      // Delete old avatar if exists
      if (request.user.avatarUrl) {
        const oldAvatarPath = request.user.avatarUrl.replace('/api/files/', '');
        await FileUtils.deleteFileFromSystem(oldAvatarPath, {
          force: true,
          checkExists: true,
        });
      }

      // Set avatar URL (path to serve via /api/files)
      updateData.avatarUrl = `/api/files/uploads/avatars/${sanitizedFileName}`;
    }

    // Update user in database
    const updatedUser = await UserService.updateUser(userId, updateData);

    return successResponse(updatedUser, 'Profile updated successfully');
  } catch (error) {
    return handleRouteError(error, 'PUT /api/auth/me');
  }
});
