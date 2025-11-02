'use client';

import { IconButton } from '@/components';
import { formatDate } from '@/lib/utils';
import { BorrowRecordWithDetails } from '@/types/borrow-record';
import { HStack, Text } from '@chakra-ui/react';
import { LuEye } from 'react-icons/lu';
import { BorrowRecordStatusCell } from './BorrowRecordStatusCell';

// Component Actions for Reader
function ReaderActionsCell({ borrowRecord }: { borrowRecord: BorrowRecordWithDetails }) {
  const handleView = () => {
    // TODO: Implement view borrow record functionality
    console.log('View borrow record:', borrowRecord.id);
  };

  return (
    <HStack gap={2} justifyContent="center">
      <IconButton aria-label="View book" onClick={handleView}>
        <LuEye />
      </IconButton>
    </HStack>
  );
}

export const ReaderBorrowRecordColumns = () => [
  {
    key: 'id',
    header: 'ID',
    sortable: true,
    width: '40px',
    render: (record: BorrowRecordWithDetails) => <Text>{record.id}</Text>,
  },
  {
    key: 'quantity',
    header: 'Quantity',
    sortable: false,
    width: '120px',
    textAlign: 'center' as const,
    render: (record: BorrowRecordWithDetails) => <Text>{record.borrowBooks?.length || 0}</Text>,
  },
  {
    key: 'borrowDate',
    header: 'Borrow Date',
    sortable: true,
    width: '180px',
    render: (record: BorrowRecordWithDetails) => (
      <Text fontSize="sm">{formatDate(record.borrowDate)}</Text>
    ),
  },
  {
    key: 'returnDate',
    header: 'Expected Return',
    sortable: true,
    width: '180px',
    render: (record: BorrowRecordWithDetails) => (
      <Text fontSize="sm">{formatDate(record.returnDate)}</Text>
    ),
  },
  {
    key: 'actualReturnDate',
    header: 'Actual Return',
    sortable: true,
    width: '180px',
    render: (record: BorrowRecordWithDetails) => (
      <Text fontSize="sm">{formatDate(record.actualReturnDate)}</Text>
    ),
  },
  {
    key: 'renewalCount',
    header: 'Renewals',
    sortable: true,
    width: '100px',
    textAlign: 'center' as const,
    render: (record: BorrowRecordWithDetails) => <Text>{record.renewalCount || 0}</Text>,
  },
  {
    key: 'status',
    header: 'Status',
    sortable: true,
    width: '120px',
    textAlign: 'center' as const,
    render: (record: BorrowRecordWithDetails) => <BorrowRecordStatusCell status={record.status} />,
  },
  {
    key: 'createdAt',
    header: 'Created At',
    sortable: true,
    width: '150px',
    textAlign: 'center' as const,
    render: (record: BorrowRecordWithDetails) => (
      <Text fontSize="sm">{formatDate(record.createdAt)}</Text>
    ),
  },
  {
    key: 'actions',
    header: 'Actions',
    sortable: false,
    width: '120px',
    textAlign: 'center' as const,
    render: (record: BorrowRecordWithDetails) => <ReaderActionsCell borrowRecord={record} />,
  },
];
