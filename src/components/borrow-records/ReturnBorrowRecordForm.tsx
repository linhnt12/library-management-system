'use client';

import { BookItemApi, BorrowRecordApi } from '@/api';
import { FormButtons, FormDivider, FormSelect, Table, toaster } from '@/components';
import { BookCell } from '@/components/books/BookCell';
import { createBookItemDetailColumns } from '@/components/table/book/BookItemDetailColumns';
import { formatDate } from '@/lib/utils';
import { Column } from '@/types';
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
  onClose?: () => void;
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

  const columns: Column<(typeof items)[number]['bookItem']>[] = useMemo(() => {
    const base = createBookItemDetailColumns(false).filter(col => col.key !== 'status');

    // Create Book column to insert before code
    const bookColumn: Column<(typeof items)[number]['bookItem']> = {
      key: 'book',
      header: 'Book',
      sortable: false,
      width: '280px',
      render: (item: (typeof items)[number]['bookItem']) => (
        <BookCell
          title={item.book?.title}
          authorName={item.book?.author?.fullName}
          coverImageUrl={(item.book as unknown as { coverImageUrl?: string | null })?.coverImageUrl}
          publishYear={(item.book as unknown as { publishYear?: number | null })?.publishYear}
        />
      ),
    };

    // Find code column index and insert book column before it
    const codeIndex = base.findIndex(col => col.key === 'code');
    const columnsWithBook: Column<(typeof items)[number]['bookItem']>[] = [...base] as Column<
      (typeof items)[number]['bookItem']
    >[];
    if (codeIndex >= 0) {
      columnsWithBook.splice(codeIndex, 0, bookColumn);
    } else {
      columnsWithBook.unshift(bookColumn);
    }

    return columnsWithBook.map(col => {
      if (col.key === 'condition') {
        return {
          ...col,
          header: 'New Condition',
          width: '180px',
          render: (bookItem: (typeof items)[number]['bookItem']) => (
            <FormSelect
              items={conditionOptions}
              value={updates[bookItem.id]?.condition || ''}
              onChange={(val: string) => setItemUpdate(bookItem.id, { condition: val })}
              placeholder="Keep current"
              width="100%"
              fontSize="sm"
            />
          ),
        } as Column<(typeof items)[number]['bookItem']>;
      }
      return col as Column<(typeof items)[number]['bookItem']>;
    });
  }, [updates, conditionOptions]);

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

  const tableData = useMemo(() => items.map(bb => bb.bookItem), [items]);

  return (
    <Stack as="form" onSubmit={handleSubmit} gap={4} maxH="70vh" overflowY="auto" px={1}>
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

      <Box mt={2}>
        <FormButtons
          submitLabel="Confirm Return"
          cancelLabel="Cancel"
          isSubmitting={isSubmitting}
          onCancel={() => onClose?.()}
        />
      </Box>
    </Stack>
  );
}
