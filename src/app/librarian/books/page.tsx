'use client';

import { BookService } from '@/api';
import {
  BookColumns,
  Button,
  Dialog,
  FormField,
  FormInput,
  FormSelect,
  FormSelectSearch,
  SearchInput,
  SelectOption,
  Table,
  toaster,
} from '@/components';
import { BOOK_STATUS_OPTIONS, PUBLISHER_OPTIONS, ROUTES } from '@/constants';
import { useAuthorOptions } from '@/lib/hooks/useAuthors';
import { Book } from '@/types';
import { HStack, Text, VStack } from '@chakra-ui/react';
import { useCallback, useEffect, useState } from 'react';
import { IoAddSharp, IoFilter } from 'react-icons/io5';

export default function BookPage() {
  const authorOptions = useAuthorOptions();
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const [query, setQuery] = useState('');
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<string | null>(null);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc' | null>(null);

  // Filter dialog state
  const [isFilterDialogOpen, setIsFilterDialogOpen] = useState(false);
  const [selectedAuthors, setSelectedAuthors] = useState<SelectOption[]>([]);
  const [selectedPublishers, setSelectedPublishers] = useState<SelectOption[]>([]);
  const [publishYearFrom, setPublishYearFrom] = useState('');
  const [publishYearTo, setPublishYearTo] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');

  // Current applied filters state
  const [appliedFilters, setAppliedFilters] = useState<{
    authorIds?: number[];
    publishers?: string[];
    publishYearFrom?: number;
    publishYearTo?: number;
    status?: string;
  }>({});

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
        type: 'PRINT',
        authorIds: appliedFilters.authorIds,
        publishers: appliedFilters.publishers,
        publishYearFrom: appliedFilters.publishYearFrom,
        publishYearTo: appliedFilters.publishYearTo,
        status: appliedFilters.status,
      });

      setBooks(response.books);
      setTotal(response.pagination.total);
    } catch {
      toaster.create({
        title: 'Failed',
        description: 'Failed to fetch books',
        type: 'error',
      });
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, searchQuery, sortBy, sortOrder, appliedFilters]);

  // Fetch books when page, pageSize, searchQuery, or appliedFilters changes
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

  // Handle filter dialog
  const handleOpenFilterDialog = () => {
    setIsFilterDialogOpen(true);
  };

  const handleCloseFilterDialog = () => {
    setIsFilterDialogOpen(false);
  };

  const handleApplyFilter = () => {
    // Reset to first page when applying filter
    setPage(1);
    setIsFilterDialogOpen(false);

    // Prepare filter parameters
    const filterParams = {
      authorIds:
        selectedAuthors.length > 0
          ? selectedAuthors.map(author => Number(author.value))
          : undefined,
      publishers:
        selectedPublishers.length > 0
          ? selectedPublishers.map(publisher => publisher.label)
          : undefined,
      publishYearFrom: publishYearFrom ? Number(publishYearFrom) : undefined,
      publishYearTo: publishYearTo ? Number(publishYearTo) : undefined,
      status: selectedStatus || undefined,
    };

    // Save applied filters
    setAppliedFilters(filterParams);
  };

  const handleClearFilter = () => {
    setSelectedAuthors([]);
    setSelectedPublishers([]);
    setPublishYearFrom('');
    setPublishYearTo('');
    setSelectedStatus('');
    setPage(1);
    // Clear applied filters
    setAppliedFilters({});
  };

  // Wrapper functions for FormSelectSearch
  const handleAuthorChange = (value: SelectOption | SelectOption[]) => {
    setSelectedAuthors(Array.isArray(value) ? value : []);
  };

  const handlePublisherChange = (value: SelectOption | SelectOption[]) => {
    setSelectedPublishers(Array.isArray(value) ? value : []);
  };

  return (
    <>
      <HStack mb={4} gap={4} justifyContent="space-between" alignItems="center">
        <HStack gap={4} alignItems="center">
          <Button
            label="Filter"
            variantType="tertiary"
            w="auto"
            h="40px"
            px={2}
            fontSize="sm"
            icon={IoFilter}
            onClick={handleOpenFilterDialog}
          />
          <SearchInput
            width="300px"
            placeholder="Search books"
            value={query}
            onChange={handleSearch}
          />
        </HStack>
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

      {/* Filter Dialog */}
      <Dialog
        isOpen={isFilterDialogOpen}
        onClose={handleCloseFilterDialog}
        title="Filter Books"
        content={
          <VStack gap={4} align="stretch">
            {/* Author Filter */}
            <FormField label="Author">
              <FormSelectSearch
                value={selectedAuthors}
                onChange={handleAuthorChange}
                options={authorOptions}
                placeholder="Select authors..."
                variantType="filter"
                multi={true}
              />
            </FormField>

            {/* Publisher Filter */}
            <FormField label="Publisher">
              <FormSelectSearch
                value={selectedPublishers}
                onChange={handlePublisherChange}
                options={PUBLISHER_OPTIONS}
                placeholder="Select publishers..."
                variantType="filter"
                multi={true}
              />
            </FormField>

            {/* Publish Year Filter */}
            <FormField label="Publish Year">
              <HStack gap={2} align="center">
                <FormInput
                  placeholder="From year"
                  value={publishYearFrom}
                  onChange={e => setPublishYearFrom(e.target.value)}
                  type="number"
                  min="1900"
                  max="2025"
                />
                <Text fontSize="sm" color="gray.500">
                  to
                </Text>
                <FormInput
                  placeholder="To year"
                  value={publishYearTo}
                  onChange={e => setPublishYearTo(e.target.value)}
                  type="number"
                  min="1900"
                  max="2025"
                />
              </HStack>
            </FormField>

            {/* TODO: This will be update later */}
            {/* Status Filter */}
            <FormField label="Status">
              <FormSelect
                items={BOOK_STATUS_OPTIONS}
                value={selectedStatus}
                onChange={setSelectedStatus}
                placeholder="Select status"
                variantType="filter"
                height="50px"
                fontSize="md"
              />
            </FormField>
          </VStack>
        }
        buttons={[
          {
            label: 'Clear',
            variant: 'secondary',
            onClick: handleClearFilter,
          },
          {
            label: 'Apply Filter',
            variant: 'primary',
            onClick: handleApplyFilter,
          },
        ]}
      />
    </>
  );
}
