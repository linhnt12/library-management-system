import { prisma } from '@/lib/prisma';
import { handleRouteError, successResponse } from '@/lib/utils';
import { Author } from '@/types';

// GET /api/authors - Get authors
export async function GET() {
  try {
    const authors = await prisma.author.findMany({
      select: {
        id: true,
        fullName: true,
        createdAt: true,
        updatedAt: true,
        isDeleted: true,
      },
      where: {
        isDeleted: false,
      },
      orderBy: {
        fullName: 'asc',
      },
    });

    return successResponse<Author[]>(authors);
  } catch (error) {
    return handleRouteError(error, 'GET /api/authors');
  }
}
