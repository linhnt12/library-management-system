import { requireAuth } from '@/middleware/auth.middleware';
import { successResponse } from '@/lib/utils';

// GET /api/auth/me - Get current user profile
export const GET = requireAuth(async request => {
  // User is already authenticated and attached to request by middleware
  const user = request.user;

  return successResponse(user, 'User profile retrieved successfully');
});
