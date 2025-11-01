'use client';

import { IconButton, Tag } from '@/components';
import { BookCell } from '@/components/books';
import { BorrowRequestStatus, BorrowRequestWithBook } from '@/types/borrow-request';
import { Box, HStack, Text } from '@chakra-ui/react';
import { useRouter } from 'next/navigation';
import { LuEye } from 'react-icons/lu';

// Component to display status with colors from theme
function StatusCell({ status }: { status: BorrowRequestStatus }) {
  const statusConfig: Record<
    BorrowRequestStatus,
    { variantType: 'active' | 'reserved' | 'borrowed' | 'inactive' | 'lost'; label: string }
  > = {
    [BorrowRequestStatus.PENDING]: { variantType: 'reserved', label: 'Pending' },
    [BorrowRequestStatus.APPROVED]: { variantType: 'active', label: 'Approved' },
    [BorrowRequestStatus.REJECTED]: { variantType: 'inactive', label: 'Rejected' },
    [BorrowRequestStatus.FULFILLED]: { variantType: 'active', label: 'Fulfilled' },
    [BorrowRequestStatus.CANCELLED]: { variantType: 'lost', label: 'Cancelled' },
    [BorrowRequestStatus.EXPIRED]: { variantType: 'inactive', label: 'Expired' },
  };

  const config = statusConfig[status] || statusConfig[BorrowRequestStatus.PENDING];

  return <Tag variantType={config.variantType}>{config.label}</Tag>;
}

// Component to display queue position
function QueuePositionCell({ position }: { position: number | null | undefined }) {
  if (!position) return <Text color="secondaryText.500">—</Text>;
  return (
    <Text fontWeight="medium" color="secondary.500">
      #{position}
    </Text>
  );
}

// Component Actions
function ActionsCell({ borrowRequest }: { borrowRequest: BorrowRequestWithBook }) {
  const router = useRouter();

  const handleView = () => {
    // Navigate to book detail
    const bookId = borrowRequest.items[0]?.bookId;
    if (bookId) {
      router.push(`/books/${bookId}`);
    }
  };

  return (
    <HStack gap={2} justifyContent="center">
      <IconButton aria-label="View book" onClick={handleView}>
        <LuEye />
      </IconButton>
    </HStack>
  );
}

export const BorrowRequestColumns = () => [
  {
    key: 'id',
    header: 'ID',
    sortable: true,
    width: '60px',
    render: (request: BorrowRequestWithBook) => <Text>{request.id}</Text>,
  },
  {
    key: 'book',
    header: 'Book',
    sortable: false,
    render: (request: BorrowRequestWithBook) => {
      const item = request.items[0]; // Each request only has 1 item
      const { title, coverImageUrl, author, isbn, publishYear } = item.book;
      return (
        <Box py={2}>
          <BookCell
            title={title}
            coverImageUrl={coverImageUrl}
            authorName={author.fullName}
            isbn={isbn}
            publishYear={publishYear}
          />
        </Box>
      );
    },
  },
  {
    key: 'quantity',
    header: 'Quantity',
    sortable: false,
    width: '120px',
    textAlign: 'center' as const,
    render: (request: BorrowRequestWithBook) => <Text>{request.items[0]?.quantity || 1}</Text>,
  },
  {
    key: 'startDate',
    header: 'Borrow Date',
    sortable: true,
    width: '150px',
    render: (request: BorrowRequestWithBook) => (
      <Text fontSize="sm">
        {new Date(request.items[0]?.startDate || request.startDate).toLocaleDateString('vi-VN')}
      </Text>
    ),
  },
  {
    key: 'endDate',
    header: 'Return Date',
    sortable: true,
    width: '150px',
    render: (request: BorrowRequestWithBook) => (
      <Text fontSize="sm">
        {new Date(request.items[0]?.endDate || request.endDate).toLocaleDateString('vi-VN')}
      </Text>
    ),
  },
  {
    key: 'status',
    header: 'Status',
    sortable: true,
    width: '120px',
    textAlign: 'center' as const,
    render: (request: BorrowRequestWithBook) => <StatusCell status={request.status} />,
  },
  {
    key: 'queuePosition',
    header: 'Queue Position',
    sortable: false,
    width: '150px',
    textAlign: 'center' as const,
    render: (request: BorrowRequestWithBook) => {
      const item = request.items[0];
      return <QueuePositionCell position={item?.queuePosition} />;
    },
  },
  {
    key: 'createdAt',
    header: 'Requested At',
    sortable: true,
    width: '150px',
    render: (request: BorrowRequestWithBook) => (
      <Text fontSize="sm">{new Date(request.createdAt).toLocaleDateString('vi-VN')}</Text>
    ),
  },
  {
    key: 'actions',
    header: 'Actions',
    sortable: false,
    width: '100px',
    textAlign: 'center' as const,
    render: (request: BorrowRequestWithBook) => <ActionsCell borrowRequest={request} />,
  },
];
