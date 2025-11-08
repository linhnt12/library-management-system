'use client';

import { Button, FormSelect } from '@/components';
import { BookCell } from '@/components/books/BookCell';
import { Column } from '@/types';
import { HStack, Text } from '@chakra-ui/react';
import { RiFileWarningLine } from 'react-icons/ri';

type BookItem = {
  id: number;
  code: string;
  condition?: string;
  book?: {
    title?: string;
    author?: {
      fullName?: string;
    };
    coverImageUrl?: string | null;
    publishYear?: number | null;
  } | null;
};

type FormSelectItem = { value: string; label: string };

type ReturnBorrowRecordColumnsParams = {
  tableData: BookItem[];
  updates: Record<number, { condition?: string }>;
  conditionOptions: FormSelectItem[];
  onConditionChange: (bookItemId: number, condition: string) => void;
  onCreateViolation: (bookItemId: number) => void;
};

// Component to render No. column
function NoCell({ item, tableData }: { item: BookItem; tableData: BookItem[] }) {
  const index = tableData.findIndex(data => data.id === item.id);
  return <Text fontWeight="medium">{index + 1}</Text>;
}

// Component to render Code column
function CodeCell({ code }: { code: string }) {
  return <Text fontWeight="medium">{code}</Text>;
}

// Component to render Book column
function BookCellComponent({ item }: { item: BookItem }) {
  return (
    <BookCell
      title={item.book?.title || ''}
      authorName={item.book?.author?.fullName || ''}
      coverImageUrl={item.book?.coverImageUrl}
      publishYear={item.book?.publishYear}
    />
  );
}

// Component to render New Condition select
function NewConditionCell({
  bookItem,
  updates,
  conditionOptions,
  onConditionChange,
}: {
  bookItem: BookItem;
  updates: Record<number, { condition?: string }>;
  conditionOptions: FormSelectItem[];
  onConditionChange: (bookItemId: number, condition: string) => void;
}) {
  return (
    <FormSelect
      items={conditionOptions}
      value={updates[bookItem.id]?.condition || ''}
      onChange={(val: string) => onConditionChange(bookItem.id, val)}
      placeholder="Keep current"
      width="100%"
      fontSize="sm"
    />
  );
}

// Component to render Actions column
function ActionsCell({
  bookItem,
  updates,
  onCreateViolation,
}: {
  bookItem: BookItem;
  updates: Record<number, { condition?: string }>;
  onCreateViolation: (bookItemId: number) => void;
}) {
  const updatedCondition = updates[bookItem.id]?.condition;
  const isViolationCondition =
    updatedCondition === 'LOST' || updatedCondition === 'WORN' || updatedCondition === 'DAMAGED';

  return (
    <HStack justifyContent="center">
      <Button
        label="Fine Record"
        icon={RiFileWarningLine}
        variantType="primary"
        onClick={() => onCreateViolation(bookItem.id)}
        disabled={!isViolationCondition}
        fontSize="sm"
        h="32px"
        px={3}
      />
    </HStack>
  );
}

export function createReturnBorrowRecordColumns({
  tableData,
  updates,
  conditionOptions,
  onConditionChange,
  onCreateViolation,
}: ReturnBorrowRecordColumnsParams): Column<BookItem>[] {
  return [
    {
      key: 'no',
      header: 'No.',
      sortable: false,
      width: '70px',
      textAlign: 'center' as const,
      render: (item: BookItem) => <NoCell item={item} tableData={tableData} />,
    },
    {
      key: 'code',
      header: 'Code',
      sortable: true,
      width: '180px',
      textAlign: 'center' as const,
      render: (item: BookItem) => <CodeCell code={item.code} />,
    },
    {
      key: 'book',
      header: 'Book',
      sortable: false,
      render: (item: BookItem) => <BookCellComponent item={item} />,
    },
    {
      key: 'condition',
      header: 'New Condition',
      sortable: true,
      width: '280px',
      textAlign: 'center' as const,
      render: (item: BookItem) => (
        <NewConditionCell
          bookItem={item}
          updates={updates}
          conditionOptions={conditionOptions}
          onConditionChange={onConditionChange}
        />
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      sortable: false,
      width: '200px',
      textAlign: 'center' as const,
      render: (item: BookItem) => (
        <ActionsCell bookItem={item} updates={updates} onCreateViolation={onCreateViolation} />
      ),
    },
  ];
}
