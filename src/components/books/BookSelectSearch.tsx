'use client';

import { FormSelectSearch } from '@/components/forms';
import type { BookOption } from '@/lib/hooks/useBooks';
import { Image } from '@chakra-ui/react';
import React from 'react';

// BookOption component for displaying individual book option
interface BookOptionProps {
  option: BookOption;
}

export function BookOption({ option }: BookOptionProps) {
  const { title, coverImageUrl, authorName, publishYear } = option;

  return (
    <div className="flex items-center gap-3 p-2">
      {/* Cover Image */}
      <div className="flex-shrink-0">
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
          <div className="w-10 h-15 bg-gray-200 rounded flex items-center justify-center">
            <span className="text-xs text-gray-500">No Image</span>
          </div>
        )}
      </div>

      {/* Book Info */}
      <div className="flex-1 min-w-0">
        <div className="font-medium text-sm truncate">{title}</div>
        <div className="text-xs text-gray-600 truncate">{authorName}</div>
        {publishYear && <div className="text-xs text-gray-500">{publishYear}</div>}
      </div>
    </div>
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
    />
  );
};
