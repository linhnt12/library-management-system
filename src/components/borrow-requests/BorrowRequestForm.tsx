'use client';

import { FormInput } from '@/components';
import { Box, Text, VStack } from '@chakra-ui/react';

interface BorrowRequestFormProps {
  startDate: string;
  endDate: string;
  onStartDateChange: (date: string) => void;
  onEndDateChange: (date: string) => void;
  startDateError?: string;
  endDateError?: string;
}

export function BorrowRequestForm({
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
  startDateError,
  endDateError,
}: BorrowRequestFormProps) {
  // Calculate max end date (30 days from start date)
  const getMaxEndDate = (): string => {
    if (!startDate) return '';
    const date = new Date(startDate);
    date.setDate(date.getDate() + 30);
    return date.toISOString().split('T')[0];
  };

  // Calculate min start date (today)
  const getMinStartDate = (): string => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  const maxEndDate = getMaxEndDate();
  const minStartDate = getMinStartDate();

  return (
    <VStack gap={6} align="stretch">
      <Box>
        <Text fontSize="md" fontWeight="medium" mb={3}>
          Start Date
        </Text>
        <FormInput
          type="date"
          value={startDate}
          onChange={e => onStartDateChange(e.target.value)}
          min={minStartDate}
          placeholder="Select start date"
        />
        {startDateError && (
          <Text fontSize="sm" color="red.500" mt={1}>
            {startDateError}
          </Text>
        )}
      </Box>

      <Box>
        <Text fontSize="md" fontWeight="medium" mb={3}>
          Return Date
        </Text>
        <FormInput
          type="date"
          value={endDate}
          onChange={e => onEndDateChange(e.target.value)}
          min={startDate || minStartDate}
          max={maxEndDate || undefined}
          placeholder="Select return date"
          disabled={!startDate}
        />
        {endDateError && (
          <Text fontSize="sm" color="red.500" mt={1}>
            {endDateError}
          </Text>
        )}
        {startDate && maxEndDate && (
          <Text fontSize="xs" color="secondaryText.500" mt={1}>
            Maximum borrow period is 30 days (from {startDate} to {maxEndDate})
          </Text>
        )}
      </Box>
    </VStack>
  );
}
