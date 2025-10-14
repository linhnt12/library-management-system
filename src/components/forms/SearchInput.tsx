'use client';

import { Input, InputGroup, type HTMLChakraProps } from '@chakra-ui/react';
import { LuSearch } from 'react-icons/lu';

export type SearchInputProps = {
  placeholder?: string;
  value?: string;
  width?: HTMLChakraProps<'div'>['w'];
  onChange?: (value: string) => void;
  flex?: HTMLChakraProps<'div'>['flex'];
};

export function SearchInput({
  placeholder = 'Search',
  value,
  onChange,
  flex,
  width,
}: SearchInputProps) {
  return (
    <InputGroup
      flex={flex}
      startElement={<LuSearch />}
      w={width}
      bg="layoutBg.500"
      rounded="lg"
      height="40px"
      fontSize="sm"
    >
      <Input placeholder={placeholder} value={value} onChange={e => onChange?.(e.target.value)} />
    </InputGroup>
  );
}
