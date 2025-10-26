'use client';

import { DigitalLicenseApi } from '@/api';
import {
  Button,
  Dialog,
  DigitalLicenseForm,
  IconButton,
  SearchInput,
  Table,
  toaster,
} from '@/components';
import { DigitalLicense } from '@/types';
import { Badge, Box, Flex, Heading, HStack, Text, VStack } from '@chakra-ui/react';
import { useEffect, useState } from 'react';
import { IoAddSharp } from 'react-icons/io5';
import { LuTrash2 } from 'react-icons/lu';

interface DigitalLicensesTableProps {
  bookId: number;
}

const licenseModelLabels: Record<string, string> = {
  ONE_COPY_ONE_USER: 'One Copy One User',
  METERED: 'Metered',
  SIMULTANEOUS: 'Simultaneous',
  OWNED: 'Owned',
  SUBSCRIPTION: 'Subscription',
};

const licenseModelColors: Record<string, string> = {
  ONE_COPY_ONE_USER: 'blue',
  METERED: 'purple',
  SIMULTANEOUS: 'green',
  OWNED: 'orange',
  SUBSCRIPTION: 'cyan',
};

export function DigitalLicensesTable({ bookId }: DigitalLicensesTableProps) {
  const [licenses, setLicenses] = useState<DigitalLicense[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [licenseToDelete, setLicenseToDelete] = useState<DigitalLicense | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [query, setQuery] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<string | null>(null);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc' | null>(null);

  useEffect(() => {
    const fetchLicenses = async () => {
      try {
        setLoading(true);
        const data = await DigitalLicenseApi.getDigitalLicensesByBookId(bookId, {
          page,
          limit: pageSize,
          search: searchQuery || undefined,
          sortBy: sortBy || undefined,
          sortOrder: sortOrder || undefined,
        });
        setLicenses(data.licenses);
        setTotal(data.pagination.total);
        setError(null);
      } catch (err) {
        console.error('Error fetching digital licenses:', err);
        const errorMessage = 'Failed to load digital licenses';
        setError(errorMessage);
        toaster.create({
          title: 'Error',
          description: errorMessage,
          type: 'error',
        });
      } finally {
        setLoading(false);
      }
    };

    if (bookId) {
      fetchLicenses();
    }
  }, [bookId, page, pageSize, searchQuery, sortBy, sortOrder, refreshTrigger]);

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchQuery(query);
      setPage(1); // Reset to first page when searching
    }, 500);

    return () => clearTimeout(timer);
  }, [query]);

  const handleSort = (key: string, direction: 'asc' | 'desc' | null) => {
    setSortBy(direction ? key : null);
    setSortOrder(direction);
    setPage(1); // Reset to first page when sorting
  };

  const handleSearch = (value: string) => {
    setQuery(value);
  };

  const columns = [
    {
      key: 'id',
      header: 'License ID',
      sortable: true,
      render: (license: DigitalLicense) => (
        <Text fontSize="sm" fontWeight="medium">
          #{license.id}
        </Text>
      ),
    },
    {
      key: 'licenseModel',
      header: 'License Model',
      sortable: true,
      render: (license: DigitalLicense) => (
        <Badge
          colorScheme={licenseModelColors[license.licenseModel] || 'gray'}
          variant="subtle"
          px={2}
          py={1}
          borderRadius="md"
        >
          {licenseModelLabels[license.licenseModel] || license.licenseModel}
        </Badge>
      ),
    },
    {
      key: 'totalCopies',
      header: 'Total Copies',
      sortable: true,
      render: (license: DigitalLicense) => (
        <Text fontSize="sm">
          {license.totalCopies !== null ? license.totalCopies : 'Unlimited'}
        </Text>
      ),
    },
    {
      key: 'notes',
      header: 'Notes',
      sortable: true,
      render: (license: DigitalLicense) => (
        <Text
          fontSize="sm"
          color={license.notes ? 'inherit' : 'secondaryText.500'}
          css={{
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}
        >
          {license.notes || '—'}
        </Text>
      ),
    },
    {
      key: 'createdAt',
      header: 'Created At',
      sortable: true,
      render: (license: DigitalLicense) => (
        <Text fontSize="sm" color="secondaryText.500">
          {new Date(license.createdAt).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
          })}
        </Text>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (license: DigitalLicense) => (
        <IconButton
          aria-label="Delete license"
          onClick={() => handleDeleteClick(license)}
          colorScheme="red"
          variant="ghost"
          size="sm"
        >
          <LuTrash2 />
        </IconButton>
      ),
    },
  ];

  const handleRefresh = () => {
    // Force a refresh by incrementing the refresh trigger
    setRefreshTrigger(prev => prev + 1);
    // Also reset to page 1 if not already there
    if (page !== 1) {
      setPage(1);
    }
  };

  const handleDeleteClick = (license: DigitalLicense) => {
    setLicenseToDelete(license);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!licenseToDelete) return;

    setIsDeleting(true);
    try {
      // Call bulk delete API with single ID
      await DigitalLicenseApi.bulkDeleteDigitalLicenses([licenseToDelete.id]);

      toaster.create({
        title: 'Success',
        description: 'Digital license deleted successfully',
        type: 'success',
      });

      // Refresh the table
      handleRefresh();
      setDeleteDialogOpen(false);
      setLicenseToDelete(null);
    } catch (error) {
      console.error('Error deleting digital license:', error);
      toaster.create({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to delete digital license',
        type: 'error',
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setLicenseToDelete(null);
  };

  return (
    <>
      <Box borderRadius="lg" border="1px solid #e5e7eb !important" mt={6} p={6}>
        <Flex justify="space-between" align="center" mb={4}>
          <Heading size="md">Digital Licenses</Heading>
          <HStack gap={2}>
            <SearchInput
              width="300px"
              placeholder="Search licenses by notes..."
              value={query}
              onChange={handleSearch}
            />
            <Button
              label="Add License"
              variantType="primary"
              w="auto"
              h="40px"
              px={3}
              fontSize="sm"
              icon={IoAddSharp}
              onClick={() => setIsFormOpen(true)}
            />
          </HStack>
        </Flex>

        {error ? (
          <Flex justify="center" align="center" py={8}>
            <VStack gap={2}>
              <Text fontSize="md" color="red.500" fontWeight="medium">
                {error}
              </Text>
              <Text fontSize="sm" color="secondaryText.500">
                Please try again later
              </Text>
            </VStack>
          </Flex>
        ) : (
          <Table
            columns={columns}
            data={licenses}
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
        )}
      </Box>

      {/* Create Digital License Form */}
      <DigitalLicenseForm
        bookId={bookId}
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSuccess={handleRefresh}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog
        isOpen={deleteDialogOpen}
        onClose={handleDeleteCancel}
        title="Delete Digital License"
        content={
          <VStack gap={3} align="start">
            <Text>Are you sure you want to delete this digital license?</Text>
            {licenseToDelete && (
              <Box
                p={3}
                bg="gray.50"
                borderRadius="md"
                width="100%"
                border="1px solid"
                borderColor="gray.200"
              >
                <VStack gap={2} align="start">
                  <HStack>
                    <Text fontSize="sm" fontWeight="medium">
                      License ID:
                    </Text>
                    <Text fontSize="sm">#{licenseToDelete.id}</Text>
                  </HStack>
                  <HStack>
                    <Text fontSize="sm" fontWeight="medium">
                      Model:
                    </Text>
                    <Badge colorScheme={licenseModelColors[licenseToDelete.licenseModel] || 'gray'}>
                      {licenseModelLabels[licenseToDelete.licenseModel]}
                    </Badge>
                  </HStack>
                </VStack>
              </Box>
            )}
            <Text fontSize="sm" color="red.500">
              This action cannot be undone.
            </Text>
          </VStack>
        }
        buttons={[
          {
            label: 'Cancel',
            variant: 'secondary',
            onClick: handleDeleteCancel,
          },
          {
            label: isDeleting ? 'Deleting...' : 'Delete',
            variant: 'primary',
            onClick: handleDeleteConfirm,
          },
        ]}
      />
    </>
  );
}
