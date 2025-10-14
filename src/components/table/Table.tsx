'use client';

import { Box, Table as ChakraTable, HStack, IconButton, Text } from '@chakra-ui/react';
import { useState } from 'react';
import { TiArrowSortedDown, TiArrowSortedUp, TiArrowUnsorted } from 'react-icons/ti';
import { TableFooter } from './TableFooter';

type TableProps<T> = {
  columns: {
    key: keyof T | string;
    header: string;
    render?: (item: T, rowIndex: number) => React.ReactNode;
    sortable?: boolean;
  }[];
  data: T[];
  page: number;
  pageSize: number;
  total: number;
  onPageChange?: (page: number) => void;
  onPageSizeChange?: (size: number) => void;
  onSort?: (key: string, direction: 'asc' | 'desc' | null) => void;
};

export function Table<T>({
  columns,
  data,
  page,
  pageSize,
  total,
  onPageChange,
  onPageSizeChange,
  onSort,
}: TableProps<T>) {
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc' | null>(null);
  const [internalPageSize, setInternalPageSize] = useState<number>(pageSize);

  const effectivePageSize = onPageSizeChange ? pageSize : internalPageSize;

  // Calculate the slice of data to display for the current page
  const startIndex = Math.max(0, (page - 1) * effectivePageSize);
  const endIndex = Math.min(startIndex + effectivePageSize, data.length);
  const paginatedData = data.slice(startIndex, endIndex);

  // Handle sort
  const handleSort = (key: string) => {
    const column = columns.find(col => col.key === key);
    if (!column?.sortable) return;

    let newKey: string | null = key;
    let newDirection: 'asc' | 'desc' | null = 'asc';

    if (sortKey === key) {
      if (sortDirection === 'asc') newDirection = 'desc';
      else if (sortDirection === 'desc') {
        newDirection = null;
        newKey = null;
      }
    }

    setSortKey(newKey);
    setSortDirection(newDirection);
    onSort?.(key, newDirection);
  };

  // Get sort icon
  const getSortIcon = (key: string) => {
    if (sortKey !== key || sortDirection === null) {
      return (
        <Text opacity={0.3}>
          <TiArrowUnsorted />
        </Text>
      );
    }
    return sortDirection === 'asc' ? (
      <Text>
        <TiArrowSortedUp />
      </Text>
    ) : (
      <Text>
        <TiArrowSortedDown />
      </Text>
    );
  };

  return (
    <Box>
      <ChakraTable.Root size="sm">
        <ChakraTable.Header>
          <ChakraTable.Row>
            {columns.map(col => (
              <ChakraTable.ColumnHeader
                key={String(col.key)}
                bg="layoutBg.500"
                _first={{
                  borderTopLeftRadius: 'lg',
                  borderBottomLeftRadius: 'lg',
                }}
                _last={{
                  borderTopRightRadius: 'lg',
                  borderBottomRightRadius: 'lg',
                }}
              >
                <HStack gap={2}>
                  <Text fontWeight="400">{col.header}</Text>
                  {col.sortable && (
                    <IconButton
                      size="xs"
                      variant="ghost"
                      aria-label={`Sort by ${col.header}`}
                      onClick={() => handleSort(String(col.key))}
                    >
                      {getSortIcon(String(col.key))}
                    </IconButton>
                  )}
                </HStack>
              </ChakraTable.ColumnHeader>
            ))}
          </ChakraTable.Row>
        </ChakraTable.Header>
        <ChakraTable.Body>
          {paginatedData.map((item, rowIndex) => (
            <ChakraTable.Row
              key={rowIndex}
              h="80px"
              _hover={{ bg: 'gray.50' }}
              borderBottomWidth={rowIndex === paginatedData.length - 1 ? 0 : '1px'}
              borderColor="gray.200"
            >
              {columns.map(col => (
                <ChakraTable.Cell key={String(col.key)}>
                  {col.render
                    ? col.render(item, startIndex + rowIndex)
                    : ((item as unknown as Record<string, unknown>)[
                        String(col.key)
                      ] as React.ReactNode)}
                </ChakraTable.Cell>
              ))}
            </ChakraTable.Row>
          ))}
        </ChakraTable.Body>
      </ChakraTable.Root>

      <TableFooter
        page={page}
        pageSize={effectivePageSize}
        total={total}
        onPageChange={onPageChange}
        onPageSizeChange={size => {
          if (onPageSizeChange) {
            onPageSizeChange(size);
          } else {
            setInternalPageSize(size);
          }
          onPageChange?.(1);
        }}
      />
    </Box>
  );
}
