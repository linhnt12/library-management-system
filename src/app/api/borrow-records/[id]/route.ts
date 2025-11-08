import { NotFoundError, ValidationError } from '@/lib/errors';
import { prisma } from '@/lib/prisma';
import { handleRouteError, parseIntParam, successResponse } from '@/lib/utils';
import { AuthenticatedRequest, requireLibrarian } from '@/middleware/auth.middleware';
import { BorrowStatus } from '@/types/borrow-record';

// GET /api/borrow-records/[id] - Get borrow record by id
export const GET = requireLibrarian(async (request: AuthenticatedRequest, context?: unknown) => {
  try {
    const { params } = context as { params: Promise<{ id: string }> };
    const { id } = await params;
    const borrowRecordId = parseIntParam(id);

    if (borrowRecordId <= 0) {
      throw new ValidationError('Invalid borrow record ID');
    }

    const borrowRecordRaw = await prisma.borrowRecord.findFirst({
      where: {
        id: borrowRecordId,
        isDeleted: false,
      },
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            email: true,
          },
        },
        borrowBooks: {
          where: { isDeleted: false },
          include: {
            bookItem: {
              include: {
                book: {
                  include: {
                    author: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!borrowRecordRaw) {
      throw new NotFoundError('Borrow record not found');
    }

    // Transform borrow record
    const borrowRecord = {
      ...borrowRecordRaw,
      status: borrowRecordRaw.status as BorrowStatus,
      user: borrowRecordRaw.user
        ? {
            id: borrowRecordRaw.user.id,
            fullName: borrowRecordRaw.user.fullName,
            email: borrowRecordRaw.user.email,
          }
        : undefined,
      borrowBooks: borrowRecordRaw.borrowBooks.map(bb => ({
        bookItem: {
          id: bb.bookItem.id,
          code: bb.bookItem.code,
          condition: bb.bookItem.condition,
          status: bb.bookItem.status,
          book: {
            id: bb.bookItem.book.id,
            title: bb.bookItem.book.title,
            isbn: bb.bookItem.book.isbn,
            coverImageUrl: bb.bookItem.book.coverImageUrl,
            publishYear: bb.bookItem.book.publishYear,
            price: bb.bookItem.book.price,
            author: {
              id: bb.bookItem.book.author.id,
              fullName: bb.bookItem.book.author.fullName,
            },
          },
        },
      })),
    };

    return successResponse(borrowRecord);
  } catch (error) {
    return handleRouteError(error, 'GET /api/borrow-records/[id]');
  }
});
