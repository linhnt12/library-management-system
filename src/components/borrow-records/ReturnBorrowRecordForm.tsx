'use client';

import { BookItemApi, BorrowRecordApi } from '@/api';
import { FormButtons, FormDivider, Table, toaster } from '@/components';
import { createReturnBorrowRecordColumns } from '@/components/table/borrow-record';
import { formatDate } from '@/lib/utils';
import { BorrowRecordWithDetails } from '@/types/borrow-record';
import { Box, HStack, Stack, Text, VStack } from '@chakra-ui/react';
import { useMemo, useState } from 'react';

type ItemUpdate = {
  status?: string;
  condition?: string;
};

export function ReturnBorrowRecordForm({
  borrowRecord,
  onClose,
  onSuccess,
}: {
  borrowRecord: BorrowRecordWithDetails;
  onClose: () => void;
  onSuccess?: () => void;
}) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [updates, setUpdates] = useState<Record<number, ItemUpdate>>({});

  const items = useMemo(() => borrowRecord.borrowBooks || [], [borrowRecord.borrowBooks]);

  const conditionOptions = useMemo(
    () => [
      { value: '', label: 'Keep current' },
      { value: 'NEW', label: 'NEW' },
      { value: 'GOOD', label: 'GOOD' },
      { value: 'WORN', label: 'WORN' },
      { value: 'DAMAGED', label: 'DAMAGED' },
      { value: 'LOST', label: 'LOST' },
    ],
    []
  );

  const setItemUpdate = (bookItemId: number, patch: ItemUpdate) => {
    setUpdates(prev => ({ ...prev, [bookItemId]: { ...prev[bookItemId], ...patch } }));
  };

  const handleCreateViolation = (bookItemId: number) => {
    // TODO: Navigate to violation creation page or open dialog
    // For now, show a message
    toaster.create({
      title: 'Create Violation',
      description: `Creating violation for book item ${bookItemId}`,
      type: 'info',
    });
  };

  const tableData = useMemo(() => items.map(bb => bb.bookItem), [items]);

  const columns = useMemo(
    () =>
      createReturnBorrowRecordColumns({
        tableData: tableData as Array<{
          id: number;
          code: string;
          condition?: string;
          book?: {
            title?: string;
            author?: { fullName?: string };
            coverImageUrl?: string | null;
            publishYear?: number | null;
          } | null;
        }>,
        updates,
        conditionOptions,
        onConditionChange: (bookItemId: number, condition: string) => {
          setItemUpdate(bookItemId, { condition });
        },
        onCreateViolation: handleCreateViolation,
      }),
    [tableData, updates, conditionOptions]
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);

      // 1) Update condition for each item if changed
      for (const bb of items) {
        const u = updates[bb.bookItem.id];
        if (!u) continue;
        const payload: Record<string, string> = {};
        if (u.condition) payload.condition = u.condition;
        if (Object.keys(payload).length > 0) {
          await BookItemApi.updateBookItem(bb.bookItem.id, payload);
        }
      }

      // 2) Call return API
      await BorrowRecordApi.returnBorrowRecord(borrowRecord.id);

      toaster.create({
        title: 'Success',
        description: 'Book return processed and item condition updated.',
        type: 'success',
      });

      onSuccess?.();
    } catch {
      toaster.create({
        title: 'Error',
        description: 'Failed to process book return',
        type: 'error',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Stack as="form" onSubmit={handleSubmit} height="100%" gap={0} px={1}>
      <Box flex="1" overflowY="auto">
        <Stack gap={4} py={4}>
          <VStack align="stretch" gap={2}>
            <Text fontWeight="bold">Borrow Record ID: {borrowRecord.id}</Text>
            <HStack gap={4} flexWrap="wrap" fontSize="sm">
              <Text>
                <b>Borrower:</b> {borrowRecord.user?.fullName}
              </Text>
              <Text>
                <b>Borrow Date:</b> {formatDate(borrowRecord.borrowDate)}
              </Text>
              <Text>
                <b>Expected Return:</b> {formatDate(borrowRecord.returnDate)}
              </Text>
            </HStack>
          </VStack>

          <FormDivider />

          <Box>
            <Text fontWeight="semibold" mb={3}>
              Books to Return ({items.length})
            </Text>
            <Text fontSize="sm" color="gray.600" mb={4}>
              Review and update condition for each book item if needed
            </Text>
            <Table
              columns={columns}
              data={tableData}
              page={1}
              pageSize={10}
              total={tableData.length}
              loading={false}
              hidePageSizeSelect
            />
          </Box>
        </Stack>
      </Box>

      <Box>
        <FormButtons
          submitLabel="Confirm Return"
          cancelLabel="Cancel"
          isSubmitting={isSubmitting}
          onCancel={onClose}
        />
      </Box>
    </Stack>
  );
}
