'use client';

import { IconButton, UserCell } from '@/components';
import { BorrowRecordWithDetails } from '@/types/borrow-record';
import { HStack, Text } from '@chakra-ui/react';
import { LuEye } from 'react-icons/lu';
import { BorrowRecordStatusCell } from './BorrowRecordStatusCell';

// Component Actions for Librarian
function LibrarianActionsCell({ borrowRecord }: { borrowRecord: BorrowRecordWithDetails }) {
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

export const LibrarianBorrowRecordColumns = () => [
  {
    key: 'id',
    header: 'ID',
    sortable: true,
    width: '40px',
    render: (record: BorrowRecordWithDetails) => <Text>{record.id}</Text>,
  },
  {
    key: 'user',
    header: 'Borrower',
    sortable: false,
    width: '200px',
    render: (record: BorrowRecordWithDetails) => <UserCell user={record.user} />,
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
      <Text fontSize="sm">{new Date(record.borrowDate).toLocaleDateString('en-US')}</Text>
    ),
  },
  {
    key: 'returnDate',
    header: 'Expected Return',
    sortable: true,
    width: '180px',
    render: (record: BorrowRecordWithDetails) => (
      <Text fontSize="sm">
        {record.returnDate ? new Date(record.returnDate).toLocaleDateString('en-US') : '—'}
      </Text>
    ),
  },
  {
    key: 'actualReturnDate',
    header: 'Actual Return',
    sortable: true,
    width: '180px',
    render: (record: BorrowRecordWithDetails) => (
      <Text fontSize="sm">
        {record.actualReturnDate
          ? new Date(record.actualReturnDate).toLocaleDateString('en-US')
          : '—'}
      </Text>
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
    render: (record: BorrowRecordWithDetails) => (
      <Text fontSize="sm">{new Date(record.createdAt).toLocaleDateString('en-US')}</Text>
    ),
  },
  {
    key: 'actions',
    header: 'Actions',
    sortable: false,
    width: '100px',
    textAlign: 'center' as const,
    render: (record: BorrowRecordWithDetails) => <LibrarianActionsCell borrowRecord={record} />,
  },
];
