'use client';

import { BorrowRecordApi } from '@/api';
import { FormSelect, ReaderBorrowRecordColumns, Table, toaster } from '@/components';
import { BorrowRecordWithDetails, BorrowStatus } from '@/types/borrow-record';
import { HStack, Stack } from '@chakra-ui/react';
import { useCallback, useEffect, useMemo, useState } from 'react';

export default function MyBorrowRecordsPage() {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const [records, setRecords] = useState<BorrowRecordWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<BorrowStatus | ''>('');

  const fetchBorrowRecords = useCallback(async () => {
    try {
      setLoading(true);

      const response = await BorrowRecordApi.getMyBorrowRecords({
        page,
        limit: pageSize,
        status: statusFilter || undefined,
      });

      setRecords(response.borrowRecords);
      setTotal(response.pagination.total);
    } catch {
      toaster.create({
        title: 'Failed',
        description: 'Failed to fetch borrow records',
        type: 'error',
      });
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, statusFilter]);

  useEffect(() => {
    fetchBorrowRecords();
  }, [fetchBorrowRecords]);

  // Status filter options
  const statusFilterOptions = useMemo(
    () => [
      { value: '', label: 'All Status' },
      { value: BorrowStatus.BORROWED, label: 'Borrowed' },
      { value: BorrowStatus.RETURNED, label: 'Returned' },
      { value: BorrowStatus.OVERDUE, label: 'Overdue' },
    ],
    []
  );

  const handleStatusFilterChange = (value: string) => {
    setStatusFilter(value as BorrowStatus | '');
    setPage(1);
  };

  const borrowRecordColumns = ReaderBorrowRecordColumns();

  return (
    <Stack height="100%" bg="white" p={6} rounded="lg">
      <HStack mb={4} gap={4} justifyContent="flex-start" alignItems="center" flexWrap="wrap">
        <FormSelect
          items={statusFilterOptions}
          value={statusFilter}
          onChange={handleStatusFilterChange}
          placeholder="All Status"
          width="150px"
          variantType="filter"
          fontSize="sm"
          height="40px"
        />
      </HStack>

      <Table
        columns={borrowRecordColumns}
        data={records}
        page={page}
        pageSize={pageSize}
        total={total}
        loading={loading}
        onPageChange={setPage}
        onPageSizeChange={(size: number) => {
          setPageSize(size);
          setPage(1);
        }}
      />
    </Stack>
  );
}
