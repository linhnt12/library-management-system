'use client';

import { BookItemApi } from '@/api';
import {
  BookItemColumns,
  Button,
  Dialog,
  FormField,
  FormInput,
  FormSelectSearch,
  SearchInput,
  SelectOption,
  Table,
  toaster,
} from '@/components';
import { BOOK_ITEM_CONDITION_OPTIONS, BOOK_ITEM_STATUS_OPTIONS, ROUTES } from '@/constants';
import { useAuthorOptions, useBookOptions, useDialog } from '@/lib/hooks';
import { BookItemWithBook } from '@/types';
import { HStack, Text, VStack } from '@chakra-ui/react';
import { useCallback, useEffect, useState } from 'react';
import { IoAddSharp, IoFilter } from 'react-icons/io5';

export default function BookCopiesPage() {
  const authorOptions = useAuthorOptions();
  const bookOptions = useBookOptions();
  const { dialog, handleConfirm, handleCancel } = useDialog();
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const [query, setQuery] = useState('');
  const [bookItems, setBookItems] = useState<BookItemWithBook[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<string | null>(null);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc' | null>(null);

  // Filter dialog state
  const [isFilterDialogOpen, setIsFilterDialogOpen] = useState(false);
  const [selectedAuthors, setSelectedAuthors] = useState<SelectOption[]>([]);
  const [selectedBooks, setSelectedBooks] = useState<SelectOption[]>([]);
  const [selectedConditions, setSelectedConditions] = useState<SelectOption[]>([]);
  const [selectedStatuses, setSelectedStatuses] = useState<SelectOption[]>([]);
  const [acquisitionDateFrom, setAcquisitionDateFrom] = useState<string>('');
  const [acquisitionDateTo, setAcquisitionDateTo] = useState<string>('');

  // Current applied filters state
  const [appliedFilters, setAppliedFilters] = useState<{
    authorIds?: number[];
    bookIds?: number[];
    conditions?: string[];
    statuses?: string[];
    acquisitionDateFrom?: string;
    acquisitionDateTo?: string;
  }>({});

  // Fetch book items from API
  const fetchBookItems = useCallback(async () => {
    try {
      setLoading(true);

      const response = await BookItemApi.getBookItems({
        page,
        limit: pageSize,
        search: searchQuery || undefined,
        sortBy: sortBy || undefined,
        sortOrder: sortOrder || undefined,
        authorIds: appliedFilters.authorIds,
        bookIds: appliedFilters.bookIds,
        conditions: appliedFilters.conditions,
        statuses: appliedFilters.statuses,
        acquisitionDateFrom: appliedFilters.acquisitionDateFrom,
        acquisitionDateTo: appliedFilters.acquisitionDateTo,
      });

      setBookItems(response.bookItems as BookItemWithBook[]);
      setTotal(response.pagination.total);
    } catch {
      toaster.create({
        title: 'Failed',
        description: 'Failed to fetch book copies',
        type: 'error',
      });
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, searchQuery, sortBy, sortOrder, appliedFilters]);

  // Fetch book items when page, pageSize, searchQuery, or appliedFilters changes
  useEffect(() => {
    fetchBookItems();
  }, [fetchBookItems]);

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
      bookIds: selectedBooks.length > 0 ? selectedBooks.map(book => Number(book.value)) : undefined,
      conditions:
        selectedConditions.length > 0
          ? selectedConditions.map(condition => String(condition.value))
          : undefined,
      statuses:
        selectedStatuses.length > 0
          ? selectedStatuses.map(status => String(status.value))
          : undefined,
      acquisitionDateFrom: acquisitionDateFrom || undefined,
      acquisitionDateTo: acquisitionDateTo || undefined,
    };

    // Save applied filters
    setAppliedFilters(filterParams);
  };

  const handleClearFilter = () => {
    setSelectedAuthors([]);
    setSelectedBooks([]);
    setSelectedConditions([]);
    setSelectedStatuses([]);
    setAcquisitionDateFrom('');
    setAcquisitionDateTo('');
    setPage(1);
    // Clear applied filters
    setAppliedFilters({});
  };

  // Wrapper functions for FormSelectSearch
  const handleAuthorChange = (value: SelectOption | SelectOption[]) => {
    setSelectedAuthors(Array.isArray(value) ? value : []);
  };

  const handleBookChange = (value: SelectOption | SelectOption[]) => {
    setSelectedBooks(Array.isArray(value) ? value : []);
  };

  const handleConditionChange = (value: SelectOption | SelectOption[]) => {
    setSelectedConditions(Array.isArray(value) ? value : []);
  };

  const handleStatusChange = (value: SelectOption | SelectOption[]) => {
    setSelectedStatuses(Array.isArray(value) ? value : []);
  };

  // Create columns
  const bookItemColumns = BookItemColumns();

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
            placeholder="Search book copies"
            value={query}
            onChange={handleSearch}
          />
        </HStack>
        <Button
          label="Add Book Copy"
          variantType="primary"
          w="auto"
          h="40px"
          px={2}
          fontSize="sm"
          href={ROUTES.DASHBOARD.BOOKS_COPIES_ADD}
          icon={IoAddSharp}
        />
      </HStack>
      <Table
        columns={bookItemColumns}
        data={bookItems}
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
        title="Filter Book Copies"
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

            {/* Book Filter */}
            <FormField label="Book">
              <FormSelectSearch
                value={selectedBooks}
                onChange={handleBookChange}
                options={bookOptions}
                placeholder="Select books..."
                variantType="filter"
                multi={true}
              />
            </FormField>

            {/* Condition Filter */}
            <FormField label="Condition">
              <FormSelectSearch
                value={selectedConditions}
                onChange={handleConditionChange}
                options={BOOK_ITEM_CONDITION_OPTIONS}
                placeholder="Select conditions..."
                variantType="filter"
                multi={true}
              />
            </FormField>

            {/* Status Filter */}
            <FormField label="Status">
              <FormSelectSearch
                value={selectedStatuses}
                onChange={handleStatusChange}
                options={BOOK_ITEM_STATUS_OPTIONS}
                placeholder="Select statuses..."
                variantType="filter"
                multi={true}
              />
            </FormField>

            {/* Acquisition Date Range Filter */}
            <HStack gap={4} align="stretch" w="100%">
              <FormField label="Acquisition Date">
                <HStack gap={4} align="center" w="100%">
                  <Text>From</Text>
                  <FormInput
                    type="date"
                    value={acquisitionDateFrom}
                    onChange={e => setAcquisitionDateFrom(e.target.value)}
                    placeholder="From date"
                  />
                  <Text>To</Text>
                  <FormInput
                    type="date"
                    value={acquisitionDateTo}
                    onChange={e => setAcquisitionDateTo(e.target.value)}
                    placeholder="To date"
                  />
                </HStack>
              </FormField>
            </HStack>
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

      {/* Delete Book Copy Confirmation Dialog */}
      <Dialog
        isOpen={dialog.isOpen}
        onClose={handleCancel}
        title={dialog.title}
        content={dialog.message}
        buttons={[
          {
            label: dialog.cancelText,
            onClick: handleCancel,
            variant: 'secondary',
          },
          {
            label: dialog.confirmText,
            onClick: handleConfirm,
            variant: 'primary',
          },
        ]}
        showCloseButton={false}
      />
    </>
  );
}
