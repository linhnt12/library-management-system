'use client';

import { tablePageSizeOptions } from '@/constants';
import { Box, ButtonGroup, HStack, IconButton, Pagination, Text } from '@chakra-ui/react';
import { FormSelect } from '@/components/forms';
import { LuChevronLeft, LuChevronRight } from 'react-icons/lu';

export type TableFooterProps = {
  page: number;
  pageSize: number;
  total: number;
  onPageChange?: (page: number) => void;
  onPageSizeChange?: (size: number) => void;
  pageSizeOptions?: number[];
  highlightColor?: string;
};

export function TableFooter({
  page,
  pageSize,
  total,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = tablePageSizeOptions,
}: TableFooterProps) {
  const pageSizeItems = pageSizeOptions.map(opt => ({ value: String(opt), label: String(opt) }));
  return (
    <Box mt={4} display="flex" justifyContent="space-between" alignItems="center">
      <HStack gap={2}>
        <Text fontSize="sm" color="secondaryText.500">
          Show
        </Text>
        <FormSelect
          items={pageSizeItems}
          value={String(pageSize)}
          onChange={val => onPageSizeChange?.(Number(val))}
          width="70px"
          height="32px"
          triggerSize="xs"
        />
        <Text fontSize="sm" color="secondaryText.500">
          of {total} results
        </Text>
      </HStack>
      <Pagination.Root
        count={total}
        pageSize={pageSize}
        page={page}
        onPageChange={e => onPageChange?.(e.page)}
      >
        <ButtonGroup size="xs" wrap="wrap">
          <Pagination.PrevTrigger asChild>
            <IconButton
              aria-label="Previous page"
              bg="paginationBg.500"
              _hover={{ bg: 'primary.200' }}
              color="primaryText.500"
              borderRadius="md"
            >
              <LuChevronLeft />
            </IconButton>
          </Pagination.PrevTrigger>

          <Pagination.Items
            render={p => (
              <IconButton
                bg={p.value === page ? 'primary.500' : 'paginationBg.500'}
                color={p.value === page ? 'white' : 'primaryText.500'}
                _hover={{ bg: p.value === page ? 'primary.500' : 'primary.200' }}
                borderRadius="md"
                fontSize="xs"
                onClick={() => onPageChange?.(p.value)}
                aria-label={`Page ${p.value}`}
              >
                {p.value}
              </IconButton>
            )}
          />

          <Pagination.NextTrigger asChild>
            <IconButton
              aria-label="Next page"
              bg="paginationBg.500"
              _hover={{ bg: 'primary.200' }}
              color="primaryText.500"
              borderRadius="md"
            >
              <LuChevronRight />
            </IconButton>
          </Pagination.NextTrigger>
        </ButtonGroup>
      </Pagination.Root>
    </Box>
  );
}
