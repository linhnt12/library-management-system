import { NextRequest } from 'next/server';
import { UserService } from '@/api/user.api';
import { successResponse, handleRouteError } from '@/lib/utils';

// GET /api/users/stats - Get user stats
export async function GET(request: NextRequest) {
  try {
    const stats = await UserService.getUserStats();

    return successResponse(stats);
  } catch (error) {
    return handleRouteError(error, 'GET /api/users/stats');
  }
}
