'use client';

import { BorrowRequestApi } from '@/api';
import { BorrowRequestColumns, FormSelect, SearchInput, Table, toaster } from '@/components';
import { BorrowRequestStatus, BorrowRequestWithBook } from '@/types/borrow-request';
import { HStack, Stack } from '@chakra-ui/react';
import { useCallback, useEffect, useMemo, useState } from 'react';

export default function BorrowRequestsPage() {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const [requests, setRequests] = useState<BorrowRequestWithBook[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<BorrowRequestStatus | ''>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [query, setQuery] = useState('');

  const fetchBorrowRequests = useCallback(async () => {
    try {
      setLoading(true);

      const response = await BorrowRequestApi.getBorrowRequests({
        page,
        limit: pageSize,
        status: statusFilter || undefined,
      });

      setRequests(response.borrowRequests);
      setTotal(response.pagination.total);
    } catch {
      toaster.create({
        title: 'Failed',
        description: 'Failed to fetch borrow requests',
        type: 'error',
      });
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, statusFilter]);

  useEffect(() => {
    fetchBorrowRequests();
  }, [fetchBorrowRequests]);

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchQuery(query);
      setPage(1); // Reset to first page when searching
    }, 500);

    return () => clearTimeout(timer);
  }, [query]);

  // Status filter options
  const statusFilterOptions = useMemo(
    () => [
      { value: '', label: 'All Status' },
      { value: BorrowRequestStatus.PENDING, label: 'Pending' },
      { value: BorrowRequestStatus.APPROVED, label: 'Approved' },
      { value: BorrowRequestStatus.FULFILLED, label: 'Fulfilled' },
      { value: BorrowRequestStatus.REJECTED, label: 'Rejected' },
      { value: BorrowRequestStatus.CANCELLED, label: 'Cancelled' },
      { value: BorrowRequestStatus.EXPIRED, label: 'Expired' },
    ],
    []
  );

  const handleStatusFilterChange = (value: string) => {
    setStatusFilter(value as BorrowRequestStatus | '');
    setPage(1);
  };

  const handleSearch = (value: string) => {
    setQuery(value);
  };

  // Filter requests by search query (client-side filtering for now)
  const filteredRequests = searchQuery
    ? requests.filter(
        request =>
          request.items[0]?.book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          request.items[0]?.book.author.fullName
            .toLowerCase()
            .includes(searchQuery.toLowerCase()) ||
          request.items[0]?.book.isbn?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : requests;

  const borrowRequestColumns = BorrowRequestColumns();

  return (
    <Stack gap={4} bg="white" p={6} rounded="lg" height="100%">
      <HStack mb={4} gap={4} justifyContent="space-between" alignItems="center" flexWrap="wrap">
        <HStack gap={4} alignItems="center" flexWrap="wrap">
          <SearchInput
            width={{ base: '100%', md: '400px' }}
            placeholder="Search requests by book title, author, or ISBN"
            value={query}
            onChange={handleSearch}
          />
        </HStack>
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
        columns={borrowRequestColumns}
        data={filteredRequests}
        page={page}
        pageSize={pageSize}
        total={searchQuery ? filteredRequests.length : total}
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
