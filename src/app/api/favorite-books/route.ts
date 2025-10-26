import { ValidationError } from '@/lib/errors';
import { prisma } from '@/lib/prisma';
import {
  handleRouteError,
  parseIntParam,
  parsePaginationParams,
  successResponse,
  validateRequiredFields,
} from '@/lib/utils';
import { AuthenticatedRequest, requireAuth } from '@/middleware/auth.middleware';
import {
  CreateFavoriteBookData,
  DeleteFavoriteBookData,
  FavoriteBookResponse,
  FavoriteBookWithBook,
  FavoriteBooksListPayload,
} from '@/types/favorite-book';
import { Prisma } from '@prisma/client';

// GET /api/favorite-books - Get favorite books for current user
export const GET = requireAuth(async (request: AuthenticatedRequest) => {
  try {
    const { searchParams } = new URL(request.url);
    const { page, limit, search } = parsePaginationParams(searchParams);

    // Get userId from authenticated user
    const userId = request.user.id;

    const sortBy = searchParams.get('sortBy');
    const sortOrder = (searchParams.get('sortOrder') as 'asc' | 'desc') || 'desc';

    const where: Prisma.UserFavoriteBookWhereInput = {
      userId,
      isDeleted: false,
    };

    // Add search filter for book title, author, or ISBN
    if (search) {
      where.book = {
        OR: [
          { title: { contains: search } },
          { isbn: { contains: search } },
          { author: { fullName: { contains: search } } },
        ],
        isDeleted: false,
      };
    } else {
      where.book = {
        isDeleted: false,
      };
    }

    const skip = (page - 1) * limit;

    // Build orderBy clause
    let orderBy: Prisma.UserFavoriteBookOrderByWithRelationInput = { createdAt: 'desc' };

    if (sortBy && sortOrder) {
      const sortFieldMap: Record<string, Prisma.UserFavoriteBookOrderByWithRelationInput> = {
        createdAt: { createdAt: sortOrder },
        bookTitle: { book: { title: sortOrder } },
        bookPublishYear: { book: { publishYear: sortOrder } },
        authorName: { book: { author: { fullName: sortOrder } } },
      };

      if (sortFieldMap[sortBy]) {
        orderBy = sortFieldMap[sortBy];
      }
    }

    const [favoriteBooksRaw, total] = await Promise.all([
      prisma.userFavoriteBook.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        select: {
          userId: true,
          bookId: true,
          createdAt: true,
          updatedAt: true,
          book: {
            select: {
              id: true,
              title: true,
              isbn: true,
              publishYear: true,
              publisher: true,
              pageCount: true,
              price: true,
              edition: true,
              description: true,
              coverImageUrl: true,
              author: {
                select: {
                  id: true,
                  fullName: true,
                },
              },
              bookEditions: {
                select: {
                  format: true,
                  id: true,
                },
              },
              _count: {
                select: {
                  bookItems: true,
                },
              },
            },
          },
        },
      }),
      prisma.userFavoriteBook.count({ where }),
    ]);

    const favoriteBooks = favoriteBooksRaw as unknown as FavoriteBookWithBook[];

    return successResponse<FavoriteBooksListPayload>({
      favoriteBooks,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    return handleRouteError(error, 'GET /api/favorite-books');
  }
});

// POST /api/favorite-books - Create favorite book
export const POST = requireAuth(async (request: AuthenticatedRequest) => {
  try {
    const body: CreateFavoriteBookData = await request.json();
    const { bookId } = body;

    // Validate required fields
    const validationError = validateRequiredFields(body as unknown as Record<string, unknown>, [
      'bookId',
    ]);
    if (validationError) {
      throw new ValidationError(validationError);
    }

    // Get userId from authenticated user
    const userId = request.user.id;

    // Parse and validate bookId
    const bookIdNum = typeof bookId === 'string' ? parseIntParam(bookId, 0) : Number(bookId);
    if (!bookIdNum || bookIdNum <= 0) {
      throw new ValidationError('Invalid bookId');
    }

    // Check if book exists
    const book = await prisma.book.findUnique({
      where: { id: bookIdNum, isDeleted: false },
    });

    if (!book) {
      throw new ValidationError('Book not found');
    }

    // Check if already favorited
    const existingFavorite = await prisma.userFavoriteBook.findUnique({
      where: {
        userId_bookId: {
          userId,
          bookId: bookIdNum,
        },
      },
    });

    if (existingFavorite) {
      throw new ValidationError('Book is already in favorites');
    }

    // Create new favorite
    const data: Prisma.UserFavoriteBookUncheckedCreateInput = {
      userId,
      bookId: bookIdNum,
    };

    const created = await prisma.userFavoriteBook.create({
      data,
    });

    return successResponse<FavoriteBookResponse>(
      {
        userId: created.userId,
        bookId: created.bookId,
        createdAt: created.createdAt.toISOString(),
        updatedAt: created.updatedAt.toISOString(),
      },
      'Book added to favorites successfully',
      201
    );
  } catch (error) {
    return handleRouteError(error, 'POST /api/favorite-books');
  }
});

// DELETE /api/favorite-books - Delete favorite book (hard delete)
export const DELETE = requireAuth(async (request: AuthenticatedRequest) => {
  try {
    const body: DeleteFavoriteBookData = await request.json();
    const { bookId } = body;

    // Validate required fields
    const validationError = validateRequiredFields(body as unknown as Record<string, unknown>, [
      'bookId',
    ]);
    if (validationError) {
      throw new ValidationError(validationError);
    }

    // Get userId from authenticated user
    const userId = request.user.id;

    // Parse and validate bookId
    const bookIdNum = typeof bookId === 'string' ? parseIntParam(bookId, 0) : Number(bookId);
    if (!bookIdNum || bookIdNum <= 0) {
      throw new ValidationError('Invalid bookId');
    }

    // Check if favorite exists
    const existingFavorite = await prisma.userFavoriteBook.findUnique({
      where: {
        userId_bookId: {
          userId,
          bookId: bookIdNum,
        },
      },
    });

    if (!existingFavorite) {
      throw new ValidationError('Favorite book not found');
    }

    // Hard delete the favorite
    await prisma.userFavoriteBook.delete({
      where: {
        userId_bookId: {
          userId,
          bookId: bookIdNum,
        },
      },
    });

    return successResponse(null, 'Book removed from favorites successfully', 200);
  } catch (error) {
    return handleRouteError(error, 'DELETE /api/favorite-books');
  }
});
