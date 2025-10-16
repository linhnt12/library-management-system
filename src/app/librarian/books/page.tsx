'use client';

import { Button, SearchInput } from '@/components';
import { BookColumns, Table } from '@/components/table';
import { HStack } from '@chakra-ui/react';
import { useState, useEffect, useCallback } from 'react';
import { IoAddSharp } from 'react-icons/io5';
import { ROUTES } from '@/constants';
import { BookService } from '@/services';
import { Book } from '@/types';
import { toaster } from '@/components';

export default function BookPage() {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const [query, setQuery] = useState('');
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<string | null>(null);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc' | null>(null);

  // Fetch books from API
  const fetchBooks = useCallback(async () => {
    try {
      setLoading(true);

      const response = await BookService.getBooks({
        page,
        limit: pageSize,
        search: searchQuery || undefined,
        sortBy: sortBy || undefined,
        sortOrder: sortOrder || undefined,
      });

      setBooks(response.books);
      setTotal(response.pagination.total);
    } catch (err) {
      toaster.create({
        title: 'Failed',
        description: 'Failed to fetch books',
        type: 'error',
      });
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, searchQuery, sortBy, sortOrder]);

  // Fetch books when page, pageSize, or searchQuery changes
  useEffect(() => {
    fetchBooks();
  }, [fetchBooks]);

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

  return (
    <>
      <HStack mb={4} gap={4} justifyContent="space-between" alignItems="center">
        <SearchInput
          width="300px"
          placeholder="Search books"
          value={query}
          onChange={handleSearch}
        />
        <HStack gap={4} alignItems="center">
          <Button
            label="Add Book"
            variantType="primary"
            w="auto"
            h="40px"
            px={2}
            fontSize="sm"
            href={ROUTES.LIBRARIAN.BOOKS_ADD}
            icon={IoAddSharp}
          />
        </HStack>
      </HStack>
      <Table
        columns={BookColumns}
        data={books}
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
