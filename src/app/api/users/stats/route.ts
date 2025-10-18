import { handleRouteError, successResponse } from '@/lib/utils';
import { UserService } from '@/services/user.service';
import { NextRequest } from 'next/server';

// GET /api/users/stats - Get user stats
export async function GET(request: NextRequest) {
  try {
    const stats = await UserService.getUserStats();

    return successResponse(stats);
  } catch (error) {
    return handleRouteError(error, 'GET /api/users/stats');
  }
}
