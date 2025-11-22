import { prisma } from '@/lib/prisma';

/**
 * Check if a book has ebook (PDF edition)
 */
export async function checkBookHasEbook(bookId: number): Promise<boolean> {
  const book = await prisma.book.findFirst({
    where: {
      id: bookId,
      isDeleted: false,
    },
    include: {
      bookEditions: {
        where: {
          fileFormat: 'PDF',
          isDeleted: false,
        },
        take: 1,
      },
    },
  });

  return book ? book.bookEditions.length > 0 : false;
}

/**
 * Check if user has already borrowed this ebook
 */
export async function checkUserBorrowedEbook(userId: number, bookId: number): Promise<boolean> {
  // Query through BorrowRecord to check if user has active borrow for this book
  const borrowRecord = await prisma.borrowRecord.findFirst({
    where: {
      userId: userId,
      status: 'BORROWED',
      returnDate: { gte: new Date() },
      isDeleted: false,
      borrowEbooks: {
        some: {
          bookId: bookId,
          isDeleted: false,
        },
      },
    },
  });

  return !!borrowRecord;
}

/**
 * Generate a signed URL for ebook access
 * For local files, we'll use a token-based approach with expiry
 */
export async function generateSignedUrl(
  storageUrl: string,
  options: {
    expiresIn: number; // seconds
    userId: number;
    bookId: number;
  }
): Promise<string> {
  // For local file system, we'll create a token-based URL
  // The token will be verified when accessing the file
  const expiresAt = Date.now() + options.expiresIn * 1000;
  const token = Buffer.from(
    JSON.stringify({
      userId: options.userId,
      bookId: options.bookId,
      expiresAt,
      storageUrl,
    })
  ).toString('base64url');

  // Return URL with token as query parameter
  // The file endpoint will verify this token
  return `/api/ebooks/${options.bookId}/file?token=${token}`;
}

/**
 * Log ebook access (optional - can be used for analytics)
 */
export async function logEbookAccess(userId: number, bookId: number): Promise<void> {
  // Optional: Log to database or analytics service
  // For now, we'll just log to console
  console.log(
    `[EbookAccess] User ${userId} accessed book ${bookId} at ${new Date().toISOString()}`
  );
}

/**
 * Verify signed URL token
 */
export function verifySignedUrlToken(token: string): {
  valid: boolean;
  userId?: number;
  bookId?: number;
  storageUrl?: string;
  error?: string;
} {
  try {
    const decoded = JSON.parse(Buffer.from(token, 'base64url').toString());

    if (decoded.expiresAt < Date.now()) {
      return {
        valid: false,
        error: 'Token expired',
      };
    }

    return {
      valid: true,
      userId: decoded.userId,
      bookId: decoded.bookId,
      storageUrl: decoded.storageUrl,
    };
  } catch {
    return {
      valid: false,
      error: 'Invalid token',
    };
  }
}
