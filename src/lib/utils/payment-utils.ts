/**
 * Payment Utility Functions
 * Helper functions for payment validation and operations
 */

import { NotFoundError, ValidationError } from '@/lib/errors';
import { prisma } from '@/lib/prisma';

interface PaymentWithBorrowRecord {
  id: number;
  amount: number;
  policyId: string;
  borrowRecordId: number;
  isPaid: boolean;
  borrowRecord: {
    userId: number;
  };
}

/**
 * Validate and get payment with ownership check
 * Throws error if payment not found, doesn't belong to user, or already paid
 */
export async function validatePaymentOwnership(
  paymentId: number,
  userId: number
): Promise<PaymentWithBorrowRecord> {
  const payment = await prisma.payment.findFirst({
    where: { id: paymentId, isDeleted: false },
    include: {
      borrowRecord: {
        select: {
          userId: true,
        },
      },
    },
  });

  if (!payment) {
    throw new NotFoundError('Payment not found');
  }

  if (payment.borrowRecord.userId !== userId) {
    throw new ValidationError('Payment does not belong to current user');
  }

  if (payment.isPaid) {
    throw new ValidationError('Payment has already been paid');
  }

  return payment as PaymentWithBorrowRecord;
}
