import { prisma } from '@/lib/prisma';
import { handleRouteError, successResponse } from '@/lib/utils';
import { Category } from '@/types';

// GET /api/categories - Get categories
export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      select: {
        id: true,
        name: true,
        description: true,
        createdAt: true,
        updatedAt: true,
        isDeleted: true,
      },
      where: {
        isDeleted: false,
      },
      orderBy: {
        name: 'asc',
      },
    });

    return successResponse<Category[]>(categories);
  } catch (error) {
    return handleRouteError(error, 'GET /api/categories');
  }
}
