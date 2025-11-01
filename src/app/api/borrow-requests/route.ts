import { ValidationError } from '@/lib/errors';
import { prisma } from '@/lib/prisma';
import {
  handleRouteError,
  parseIntParam,
  successResponse,
  validateRequiredFields,
} from '@/lib/utils';
import { AuthenticatedRequest, requireReader } from '@/middleware/auth.middleware';
import { BorrowRequestStatus } from '@/types/borrow-request';

// Helper function to count reserved quantity for a single book
async function countReservedQuantity(bookId: number): Promise<number> {
  const result = await prisma.borrowRequestItem.aggregate({
    where: {
      bookId: bookId,
      borrowRequest: {
        status: 'APPROVED',
        isDeleted: false,
      },
    },
    _sum: {
      quantity: true,
    },
  });
  return result._sum.quantity || 0;
}

// Helper function to count total available book items for a single book
async function countTotalAvailableBookItems(bookId: number): Promise<number> {
  return await prisma.bookItem.count({
    where: {
      bookId: bookId,
      status: 'AVAILABLE',
      isDeleted: false,
    },
  });
}

// Helper function to calculate queue position
async function calculateQueuePosition(bookId: number, borrowRequestId: number): Promise<number> {
  const queue = await prisma.borrowRequestItem.findMany({
    where: {
      bookId: bookId,
      borrowRequest: {
        status: 'PENDING',
        isDeleted: false,
      },
    },
    include: {
      borrowRequest: {
        select: {
          id: true,
          createdAt: true,
        },
      },
    },
    orderBy: {
      createdAt: 'asc',
    },
  });

  const position = queue.findIndex(item => item.borrowRequestId === borrowRequestId) + 1;
  return position > 0 ? position : queue.length + 1;
}

// POST /api/borrow-requests - Create borrow request
export const POST = requireReader(async (request: AuthenticatedRequest) => {
  try {
    const body = await request.json();
    const { userId, startDate, endDate, items } = body;

    // Validate required fields
    const validationError = validateRequiredFields(body, [
      'userId',
      'startDate',
      'endDate',
      'items',
    ]);
    if (validationError) {
      throw new ValidationError(validationError);
    }

    const userIdNum = typeof userId === 'string' ? parseIntParam(userId, 0) : Number(userId);
    if (!userIdNum || userIdNum <= 0) {
      throw new ValidationError('Invalid userId');
    }

    // Verify user exists and is the authenticated user
    if (userIdNum !== request.user.id) {
      throw new ValidationError('User ID does not match authenticated user');
    }

    // Validate items - only 1 item per request
    if (!Array.isArray(items) || items.length === 0) {
      throw new ValidationError('Items array is required and must not be empty');
    }

    if (items.length > 1) {
      throw new ValidationError('Only one book can be requested per borrow request');
    }

    // Parse and validate the single item
    const item = items[0];
    const itemValidationError = validateRequiredFields(item, [
      'bookId',
      'quantity',
      'startDate',
      'endDate',
    ]);
    if (itemValidationError) {
      throw new ValidationError(`Invalid item: ${itemValidationError}`);
    }

    const bookIdNum =
      typeof item.bookId === 'string' ? parseIntParam(item.bookId, 0) : Number(item.bookId);
    const quantityNum =
      typeof item.quantity === 'string' ? parseIntParam(item.quantity, 0) : Number(item.quantity);

    if (!bookIdNum || bookIdNum <= 0) {
      throw new ValidationError('Invalid bookId in items');
    }

    if (!quantityNum || quantityNum <= 0) {
      throw new ValidationError('Quantity must be greater than 0');
    }

    // Verify book exists
    const book = await prisma.book.findFirst({
      where: {
        id: bookIdNum,
        isDeleted: false,
      },
      select: { id: true, title: true },
    });

    if (!book) {
      throw new ValidationError(`Book with id ${bookIdNum} not found`);
    }

    // Check if user already has an active borrow request for this book
    // Active = PENDING or APPROVED (not FULFILLED or REJECTED)
    const existingRequest = await prisma.borrowRequest.findFirst({
      where: {
        userId: userIdNum,
        status: {
          in: [BorrowRequestStatus.PENDING, BorrowRequestStatus.APPROVED],
        },
        isDeleted: false,
        items: {
          some: {
            bookId: bookIdNum,
            isDeleted: false,
          },
        },
      },
      select: { id: true },
    });

    if (existingRequest) {
      throw new ValidationError(
        `You already have an active borrow request for "${book.title}". Please wait for your current request to be fulfilled or rejected.`
      );
    }

    // Parse dates
    const borrowStartDate = new Date(startDate);
    const borrowEndDate = new Date(endDate);

    if (isNaN(borrowStartDate.getTime()) || isNaN(borrowEndDate.getTime())) {
      throw new ValidationError('Invalid date format');
    }

    // Check date validation
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const startDateOnly = new Date(borrowStartDate);
    startDateOnly.setHours(0, 0, 0, 0);

    if (startDateOnly < today) {
      throw new ValidationError('Start date cannot be in the past');
    }

    if (borrowEndDate < borrowStartDate) {
      throw new ValidationError('End date must be after start date');
    }

    // Check 30 days limit
    const diffTime = borrowEndDate.getTime() - borrowStartDate.getTime();
    const diffDays = diffTime / (1000 * 60 * 60 * 24);
    if (diffDays > 30) {
      throw new ValidationError('Borrow period cannot exceed 30 days');
    }

    // Check available books
    // Logic: remainingAvailable = Total AVAILABLE - Total quantity of APPROVED requests
    const [totalAvailable, reservedQuantity] = await Promise.all([
      countTotalAvailableBookItems(bookIdNum),
      countReservedQuantity(bookIdNum),
    ]);

    const remainingAvailable = totalAvailable - reservedQuantity;
    const allBooksAvailable = remainingAvailable >= quantityNum;

    // Use transaction for all database operations
    const result = await prisma.$transaction(async tx => {
      // Create BorrowRequest
      const borrowRequest = await tx.borrowRequest.create({
        data: {
          userId: userIdNum,
          startDate: borrowStartDate,
          endDate: borrowEndDate,
          status: allBooksAvailable ? BorrowRequestStatus.APPROVED : BorrowRequestStatus.PENDING,
          items: {
            create: {
              bookId: bookIdNum,
              quantity: quantityNum,
              startDate: new Date(item.startDate),
              endDate: new Date(item.endDate),
            },
          },
        },
        include: {
          items: true,
          user: {
            select: {
              id: true,
              fullName: true,
              email: true,
            },
          },
        },
      });

      return {
        borrowRequest,
      };
    });

    // Calculate queue position outside transaction (read-only operation)
    const queuePosition = !allBooksAvailable
      ? await calculateQueuePosition(bookIdNum, result.borrowRequest.id)
      : null;

    // Build response message
    let message = '';
    if (allBooksAvailable) {
      message =
        'Borrow request approved successfully. Please visit the library to collect your books.';
    } else {
      const position = queuePosition || 1;
      message = `Borrow request registered. You are in position #${position} in the queue. We will notify you when books are available.`;
    }

    return successResponse(
      {
        borrowRequest: result.borrowRequest,
        borrowRecord: null,
        queuePosition,
        message,
      },
      message,
      201
    );
  } catch (error) {
    return handleRouteError(error, 'POST /api/borrow-requests');
  }
});
