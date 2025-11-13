'use client';

import { BorrowRecordApi, PaymentApi } from '@/api';
import { Button, FormField, FormInput, Tag, toaster } from '@/components';
import { ROUTES } from '@/constants';
import { policyIdToCondition } from '@/constants/violation';
import { useViolationPolicyByCondition } from '@/lib/hooks';
import { formatDate } from '@/lib/utils';
import { PaymentWithDetails } from '@/types';
import { BookItemForViolation, BorrowRecordWithDetails } from '@/types/borrow-record';
import { Box, Grid, GridItem, HStack, Text, VStack } from '@chakra-ui/react';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function MyViolationDetailPage() {
  const params = useParams();
  const router = useRouter();
  const paymentId = Number(params.id);
  const [payment, setPayment] = useState<PaymentWithDetails | null>(null);
  const [borrowRecord, setBorrowRecord] = useState<BorrowRecordWithDetails | null>(null);
  const [bookItem, setBookItem] = useState<BookItemForViolation | null>(null);
  const [loading, setLoading] = useState(true);

  // Get violation policy from database - must be called at top level
  // Use condition from bookItem if available, otherwise use empty string
  const condition = bookItem?.condition || '';
  const policy = useViolationPolicyByCondition(condition);

  // Fetch payment and related data
  useEffect(() => {
    const fetchData = async () => {
      if (!paymentId || paymentId <= 0) {
        router.push(ROUTES.MY_VIOLATIONS);
        return;
      }

      try {
        setLoading(true);

        // Fetch payment
        const paymentData = await PaymentApi.getPaymentById(paymentId);
        setPayment(paymentData);

        // Fetch borrow record with book items
        const borrowRecordData = await BorrowRecordApi.getBorrowRecordById(
          paymentData.borrowRecordId
        );
        setBorrowRecord(borrowRecordData);

        // Find bookItem based on policy condition
        const condition = policyIdToCondition(paymentData.policyId);
        const matchingBookItem = borrowRecordData.borrowBooks?.find(
          bb => bb.bookItem.condition === condition
        )?.bookItem;

        // If no matching condition, use first bookItem
        const selectedBookItem = matchingBookItem || borrowRecordData.borrowBooks?.[0]?.bookItem;

        if (selectedBookItem) {
          setBookItem({
            id: selectedBookItem.id,
            code: selectedBookItem.code,
            condition: selectedBookItem.condition,
            book: selectedBookItem.book
              ? {
                  id: selectedBookItem.book.id,
                  title: selectedBookItem.book.title,
                  price: selectedBookItem.book.price,
                  author: selectedBookItem.book.author
                    ? {
                        id: selectedBookItem.book.author.id,
                        fullName: selectedBookItem.book.author.fullName,
                      }
                    : undefined,
                }
              : null,
          });
        }
      } catch (err) {
        console.error('Error fetching violation details:', err);
        toaster.create({
          title: 'Error',
          description: 'Failed to load violation details',
          type: 'error',
        });
        router.push(ROUTES.MY_VIOLATIONS);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [paymentId, router]);

  const handleBack = () => {
    router.push(ROUTES.MY_VIOLATIONS);
  };

  const handlePay = () => {
    console.log('Pay');
  };

  if (loading) {
    return null;
  }

  if (!payment || !borrowRecord || !bookItem) {
    return null;
  }

  if (!policy) {
    return null;
  }

  const bookPrice = bookItem?.book?.price || 0;
  const dueDate = payment.dueDate ? new Date(payment.dueDate).toISOString().split('T')[0] : '';

  return (
    <Box height="100%" bg="white" borderRadius="lg" p={4}>
      <HStack mb={4} justifyContent="space-between" alignItems="center">
        <Text fontSize="xl" fontWeight="bold">
          Violation Details
        </Text>
        <HStack gap={4} alignItems="center">
          {!payment.isPaid && <Button variantType="primary" onClick={handlePay} label="Pay" />}
          <Button variantType="secondary" onClick={handleBack} label="Back" />
        </HStack>
      </HStack>

      <VStack gap={6} align="stretch">
        {/* Borrower Information */}
        <Box>
          <Text fontWeight="semibold" mb={3} fontSize="md">
            Borrower
          </Text>
          <VStack align="start" gap={2} fontSize="sm">
            <HStack>
              <Text fontWeight="medium">Name:</Text>
              <Text>{borrowRecord.user?.fullName || 'N/A'}</Text>
            </HStack>
            <HStack>
              <Text fontWeight="medium">Email:</Text>
              <Text>{borrowRecord.user?.email || 'N/A'}</Text>
            </HStack>
            <HStack>
              <Text fontWeight="medium">Current Violation Points:</Text>
              <Text>{borrowRecord.user?.violationPoints || 0} points</Text>
            </HStack>
          </VStack>
        </Box>

        {/* Book Information */}
        <Box>
          <Text fontWeight="semibold" mb={3} fontSize="md">
            Violated Book
          </Text>
          <VStack align="start" gap={2} fontSize="sm">
            <HStack>
              <Text fontWeight="medium">Book Title:</Text>
              <Text>{bookItem.book?.title || 'N/A'}</Text>
            </HStack>
            <HStack>
              <Text fontWeight="medium">Book Copy Code:</Text>
              <Text>{bookItem.code}</Text>
            </HStack>
            <HStack>
              <Text fontWeight="medium">Price:</Text>
              <Text>{bookPrice.toLocaleString('vi-VN')} VND</Text>
            </HStack>
            <HStack>
              <Text fontWeight="medium">Borrow Record ID:</Text>
              <Text>{borrowRecord.id}</Text>
            </HStack>
          </VStack>
        </Box>

        {/* Violation Information */}
        <Box>
          <Text fontWeight="semibold" mb={3} fontSize="md">
            Violation Information
          </Text>
          <Grid templateColumns="repeat(2, 1fr)" gap={3}>
            <GridItem>
              <FormField label="Violation Type" fontSize="sm" width="100%">
                <FormInput value={policy?.name} fontSize="sm" height="40px" disabled />
              </FormField>
            </GridItem>

            <GridItem>
              <FormField label="Violation Fee" fontSize="sm" width="100%">
                <FormInput
                  type="text"
                  fontSize="sm"
                  value={payment.amount.toLocaleString('vi-VN') + ' VND'}
                  height="40px"
                  disabled
                />
              </FormField>
            </GridItem>

            <GridItem>
              <FormField label="Violation Points" fontSize="sm" width="100%">
                <FormInput
                  value={`+${policy.points} points`}
                  fontSize="sm"
                  height="40px"
                  disabled
                />
              </FormField>
            </GridItem>

            <GridItem>
              <FormField label="Due Date" fontSize="sm" width="100%">
                <FormInput type="date" fontSize="sm" height="40px" value={dueDate} disabled />
              </FormField>
            </GridItem>
          </Grid>
        </Box>

        {/* Payment Information */}
        <Box>
          <Text fontWeight="semibold" mb={3} fontSize="md">
            Payment Information
          </Text>
          <VStack align="start" gap={2} fontSize="sm">
            <HStack>
              <Text fontWeight="medium">Payment ID:</Text>
              <Text>{payment.id}</Text>
            </HStack>
            <HStack>
              <Text fontWeight="medium">Status:</Text>
              <Tag variantType={payment.isPaid ? 'active' : 'inactive'}>
                {payment.isPaid ? 'Paid' : 'Unpaid'}
              </Tag>
            </HStack>
            {payment.isPaid && payment.paidAt && (
              <HStack>
                <Text fontWeight="medium">Paid At:</Text>
                <Text>{formatDate(payment.paidAt)}</Text>
              </HStack>
            )}
            <HStack>
              <Text fontWeight="medium">Created At:</Text>
              <Text>{formatDate(payment.createdAt)}</Text>
            </HStack>
          </VStack>
        </Box>
      </VStack>
    </Box>
  );
}
