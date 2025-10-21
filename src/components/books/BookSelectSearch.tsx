'use client';

import { FormSelectSearch } from '@/components/forms';
import type { BookOption } from '@/lib/hooks/useBooks';
import { Box, Flex, Image, Text } from '@chakra-ui/react';
import React from 'react';

// BookOption component for displaying individual book option
interface BookOptionProps {
  option: BookOption;
}

export function BookOption({ option }: BookOptionProps) {
  const { title, coverImageUrl, authorName, publishYear, isbn } = option;

  return (
    <Flex align="center" gap={3} p={2}>
      {/* Cover Image */}
      <Box flexShrink={0}>
        {coverImageUrl ? (
          <Image
            src={coverImageUrl}
            alt={title}
            width="40px"
            height="60px"
            objectFit="cover"
            borderRadius="md"
          />
        ) : (
          <Box
            width="40px"
            height="60px"
            bg="layoutBg.500"
            borderRadius="md"
            display="flex"
            alignItems="center"
            justifyContent="center"
          >
            <Text fontSize="sm" color="secondaryText.500">
              No Image
            </Text>
          </Box>
        )}
      </Box>

      {/* Book Info */}
      <Box flex={1} minWidth={0}>
        <Text fontWeight="medium" fontSize="sm" truncate>
          {title}
        </Text>
        <Text fontSize="sm" color="secondaryText.500" truncate>
          {authorName}, {publishYear ? `(${publishYear})` : ''}
        </Text>
        {isbn && (
          <Text fontSize="sm" color="secondaryText.500">
            ISBN: {isbn}
          </Text>
        )}
      </Box>
    </Flex>
  );
}

// BookOptionDisplay component for displaying selected option
interface BookOptionDisplayProps {
  value: string;
  options: BookOption[];
}

export function BookOptionDisplay({ value, options }: BookOptionDisplayProps) {
  const selectedOption = options.find(option => option.value === value);

  if (!selectedOption) return null;

  return <BookOption option={selectedOption} />;
}

// BookSelectSearch component for select dropdown
export interface BookSelectSearchProps {
  value?: BookOption | BookOption[];
  onChange: (value: BookOption | BookOption[]) => void;
  options: BookOption[];
  placeholder?: string;
  isDisabled?: boolean;
  isLoading?: boolean;
  isClearable?: boolean;
  isRtl?: boolean;
  isSearchable?: boolean;
  name?: string;
  className?: string;
  classNamePrefix?: string;
  variantType?: 'default' | 'filter';
  hideSelectedOptions?: boolean;
  multi?: boolean;
  height?: string;
  width?: string;
  fontSize?: string;
}

export const BookSelectSearch: React.FC<BookSelectSearchProps> = ({
  value,
  onChange,
  options,
  placeholder = 'Select book...',
  isDisabled = false,
  isLoading = false,
  isClearable = true,
  isRtl = false,
  isSearchable = true,
  name,
  className = 'basic-select',
  classNamePrefix = 'select',
  variantType = 'default',
  hideSelectedOptions = false,
  multi = false,
  height = '50px',
  width = '100%',
  fontSize = '16px',
}) => {
  const formatOptionLabel = (option: BookOption) => {
    return <BookOption option={option} />;
  };

  // Function to get searchable text for each option
  const getOptionLabel = (option: BookOption) => {
    const searchText = [
      option.title,
      option.authorName,
      option.publishYear?.toString() || '',
      option.isbn || '',
    ].join(' ');
    return searchText;
  };

  // Custom filter function to search across multiple fields
  const filterOption = (
    option: { data: BookOption; label: string; value: string | number },
    inputValue: string
  ) => {
    if (!inputValue) return true;

    const searchText = getOptionLabel(option.data).toLowerCase();
    const searchValue = inputValue.toLowerCase();

    return searchText.includes(searchValue);
  };

  return (
    <FormSelectSearch<BookOption>
      value={value}
      onChange={onChange}
      options={options}
      placeholder={placeholder}
      isDisabled={isDisabled}
      isLoading={isLoading}
      isClearable={isClearable}
      isRtl={isRtl}
      isSearchable={isSearchable}
      name={name}
      className={className}
      classNamePrefix={classNamePrefix}
      variantType={variantType}
      hideSelectedOptions={hideSelectedOptions}
      multi={multi}
      height={height}
      width={width}
      fontSize={fontSize}
      formatOptionLabel={formatOptionLabel}
      getOptionLabel={getOptionLabel}
      filterOption={filterOption}
    />
  );
};
