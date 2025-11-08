'use client';

import { PaymentApi } from '@/api';
import { PaymentColumns, SearchInput, Table, toaster } from '@/components';
import { PaymentWithDetails } from '@/types';
import { HStack } from '@chakra-ui/react';
import { useCallback, useEffect, useState } from 'react';

export default function ViolationsPage() {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const [query, setQuery] = useState('');
  const [payments, setPayments] = useState<PaymentWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<string | null>(null);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc' | null>(null);

  // Fetch payments from API
  const fetchPayments = useCallback(async () => {
    try {
      setLoading(true);

      const response = await PaymentApi.getPayments({
        page,
        limit: pageSize,
        search: searchQuery || undefined,
        sortBy: sortBy || undefined,
        sortOrder: sortOrder || undefined,
      });

      setPayments(response.payments);
      setTotal(response.pagination.total);
    } catch {
      toaster.create({
        title: 'Failed',
        description: 'Failed to fetch violations',
        type: 'error',
      });
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, searchQuery, sortBy, sortOrder]);

  // Fetch payments when page, pageSize, searchQuery changes
  useEffect(() => {
    fetchPayments();
  }, [fetchPayments]);

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchQuery(query);
      setPage(1); // Reset to first page when searching
    }, 500);

    return () => clearTimeout(timer);
  }, [query]);

  // Handle sort functionality
  const handleSort = (key: string, direction: 'asc' | 'desc' | null) => {
    setSortBy(direction ? key : null);
    setSortOrder(direction);
    setPage(1); // Reset to first page when sorting
  };

  // Handle search input
  const handleSearch = (value: string) => {
    setQuery(value);
  };

  // Create columns
  const paymentColumns = PaymentColumns();

  return (
    <>
      <HStack mb={4} gap={4} justifyContent="space-between" alignItems="center">
        <HStack gap={4} alignItems="center">
          <SearchInput
            width="500px"
            placeholder="Search violations by ID, policy name, or user name/email"
            value={query}
            onChange={handleSearch}
          />
        </HStack>
      </HStack>
      <Table
        columns={paymentColumns}
        data={payments}
        page={page}
        pageSize={pageSize}
        total={total}
        loading={loading}
        onPageChange={setPage}
        onPageSizeChange={(size: number) => {
          setPageSize(size);
          setPage(1);
        }}
        onSort={handleSort}
      />
    </>
  );
}
