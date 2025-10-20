'use client';

import {
  Dialog,
  FormField,
  FormInput,
  FormSelect,
  FormSelectSearch,
  SelectOption,
} from '@/components';
import { BOOK_STATUS_OPTIONS } from '@/constants';
import { useAuthorOptions, useCategoryOptions } from '@/lib/hooks';
import { HStack, Text, VStack } from '@chakra-ui/react';

export interface BookFilterState {
  selectedAuthors: SelectOption[];
  selectedCategories: SelectOption[];
  publishYearFrom: string;
  publishYearTo: string;
  selectedStatus: string;
}

export interface BookFilterParams {
  authorIds?: number[];
  categoryIds?: number[];
  publishYearFrom?: number;
  publishYearTo?: number;
  status?: string;
}

export interface BookFilterDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onApply: () => void;
  onClear: () => void;
  filterState: BookFilterState;
  onFilterStateChange: (newState: Partial<BookFilterState>) => void;
}

export function BookFilterDialog({
  isOpen,
  onClose,
  onApply,
  onClear,
  filterState,
  onFilterStateChange,
}: BookFilterDialogProps) {
  const authorOptions = useAuthorOptions();
  const categoryOptions = useCategoryOptions();

  const handleAuthorChange = (value: SelectOption | SelectOption[]) => {
    onFilterStateChange({
      selectedAuthors: Array.isArray(value) ? value : [],
    });
  };

  const handleCategoryChange = (value: SelectOption | SelectOption[]) => {
    onFilterStateChange({
      selectedCategories: Array.isArray(value) ? value : [],
    });
  };

  const handleApplyFilter = () => {
    onApply();
  };

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title="Filter Books"
      content={
        <VStack gap={4} align="stretch">
          {/* Author Filter */}
          <FormField label="Author">
            <FormSelectSearch
              value={filterState.selectedAuthors}
              onChange={handleAuthorChange}
              options={authorOptions}
              placeholder="Select authors..."
              variantType="filter"
              multi={true}
            />
          </FormField>

          {/* Categories Filter */}
          <FormField label="Categories">
            <FormSelectSearch
              value={filterState.selectedCategories}
              onChange={handleCategoryChange}
              options={categoryOptions}
              placeholder="Select categories..."
              variantType="filter"
              multi={true}
            />
          </FormField>

          {/* Publish Year Filter */}
          <FormField label="Publish Year">
            <HStack gap={2} align="center">
              <FormInput
                placeholder="From year"
                value={filterState.publishYearFrom}
                onChange={e => onFilterStateChange({ publishYearFrom: e.target.value })}
                type="number"
                min="1900"
                max="2025"
              />
              <Text fontSize="sm" color="gray.500">
                to
              </Text>
              <FormInput
                placeholder="To year"
                value={filterState.publishYearTo}
                onChange={e => onFilterStateChange({ publishYearTo: e.target.value })}
                type="number"
                min="1900"
                max="2025"
              />
            </HStack>
          </FormField>

          {/* Status Filter */}
          <FormField label="Status">
            <FormSelect
              items={BOOK_STATUS_OPTIONS}
              value={filterState.selectedStatus}
              onChange={value => onFilterStateChange({ selectedStatus: value })}
              placeholder="Select status"
              variantType="filter"
              height="50px"
            />
          </FormField>
        </VStack>
      }
      buttons={[
        {
          label: 'Clear',
          variant: 'secondary',
          onClick: onClear,
        },
        {
          label: 'Apply Filter',
          variant: 'primary',
          onClick: handleApplyFilter,
        },
      ]}
    />
  );
}
