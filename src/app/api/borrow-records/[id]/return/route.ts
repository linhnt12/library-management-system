import { NotFoundError, ValidationError } from '@/lib/errors';
import { prisma } from '@/lib/prisma';
import { handleRouteError, parseIntParam, successResponse } from '@/lib/utils';
import { AuthenticatedRequest, requireLibrarian } from '@/middleware/auth.middleware';
import { BorrowStatus } from '@/types/borrow-record';
import { BorrowRequestStatus } from '@/types/borrow-request';
import { ItemStatus, Prisma } from '@prisma/client';

// POST /api/borrow-records/[id]/return - Return books for a borrow record
export const POST = requireLibrarian(async (request: AuthenticatedRequest, context?: unknown) => {
  try {
    const { params } = context as { params: Promise<{ id: string }> };
    const { id } = await params;
    const borrowRecordId = parseIntParam(id);

    if (borrowRecordId <= 0) {
      throw new ValidationError('Invalid borrow record ID');
    }

    // Get borrow record with related data
    const borrowRecord = await prisma.borrowRecord.findFirst({
      where: {
        id: borrowRecordId,
        isDeleted: false,
      },
      include: {
        user: {
          select: { id: true, fullName: true, email: true },
        },
        borrowBooks: {
          where: { isDeleted: false },
          include: {
            bookItem: {
              include: { book: true },
            },
          },
        },
      },
    });

    if (!borrowRecord) {
      throw new NotFoundError('Borrow record not found');
    }

    // Validation: Must be BORROWED and not already returned
    if (borrowRecord.status !== BorrowStatus.BORROWED || borrowRecord.actualReturnDate) {
      throw new ValidationError('This borrow record has already been returned');
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Process return in transaction
    const result = await prisma.$transaction(async tx => {
      // 1. Update BorrowRecord to returned
      const updatedRecord = await tx.borrowRecord.update({
        where: { id: borrowRecordId },
        data: {
          actualReturnDate: today,
          status: BorrowStatus.RETURNED,
          updatedAt: new Date(),
        },
      });

      // 2. Update all BookItems: ON_BORROW -> AVAILABLE
      const bookIdsSet = new Set<number>();
      for (const bb of borrowRecord.borrowBooks) {
        await tx.bookItem.update({
          where: { id: bb.bookItemId },
          data: { status: ItemStatus.AVAILABLE },
        });
        bookIdsSet.add(bb.bookItem.bookId);
      }

      // 3. Trigger hold queue processing per book
      const processedBooks: Array<{ bookId: number; approvedRequests: number[] }> = [];
      for (const bookId of bookIdsSet) {
        const approved = await processHoldQueueForBook(tx, bookId);
        if (approved && approved.length > 0) {
          processedBooks.push({ bookId, approvedRequests: approved });
        }
      }

      return { updatedRecord, processedBooks };
    });

    return successResponse(
      {
        borrowRecord: result.updatedRecord,
        processedBooks: result.processedBooks,
        message: 'Books returned successfully',
      },
      'Books returned successfully'
    );
  } catch (error) {
    return handleRouteError(error, 'POST /api/borrow-records/[id]/return');
  }
});

// Process hold queue for a specific book; returns list of approved request IDs
async function processHoldQueueForBook(
  tx: Prisma.TransactionClient,
  bookId: number
): Promise<number[] | null> {
  // Get first PENDING request item in FIFO order for this book
  const firstRequestItem = await tx.borrowRequestItem.findFirst({
    where: {
      bookId,
      borrowRequest: { status: BorrowRequestStatus.PENDING, isDeleted: false },
    },
    include: {
      borrowRequest: {
        include: {
          items: { where: { isDeleted: false } },
          user: true,
        },
      },
    },
    orderBy: { createdAt: 'asc' },
  });

  if (!firstRequestItem) return null;

  const request = firstRequestItem.borrowRequest;

  // Check all items have enough remaining availability: AVAILABLE - APPROVED
  for (const item of request.items) {
    const [totalAvailable, reservedAgg] = await Promise.all([
      tx.bookItem.count({
        where: { bookId: item.bookId, status: ItemStatus.AVAILABLE, isDeleted: false },
      }),
      tx.borrowRequestItem.aggregate({
        where: {
          bookId: item.bookId,
          borrowRequest: { status: BorrowRequestStatus.APPROVED, isDeleted: false },
        },
        _sum: { quantity: true },
      }),
    ]);

    const reservedQty = reservedAgg._sum.quantity || 0;
    const remainingAvailable = totalAvailable - reservedQty;
    if (remainingAvailable < item.quantity) {
      return null; // Keep in queue
    }
  }

  // Approve request
  await tx.borrowRequest.update({
    where: { id: request.id },
    data: { status: BorrowRequestStatus.APPROVED },
  });

  return [request.id];
}
