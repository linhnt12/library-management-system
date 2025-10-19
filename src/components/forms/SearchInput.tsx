'use client';

import { Input, InputGroup, type HTMLChakraProps } from '@chakra-ui/react';
import { LuSearch } from 'react-icons/lu';

export type SearchInputProps = {
  placeholder?: string;
  value?: string;
  width?: HTMLChakraProps<'div'>['w'];
  onChange?: (value: string) => void;
  flex?: HTMLChakraProps<'div'>['flex'];
  bg?: HTMLChakraProps<'div'>['bg'];
  border?: HTMLChakraProps<'div'>['border'];
  borderColor?: HTMLChakraProps<'div'>['borderColor'];
};

export function SearchInput({
  placeholder = 'Search',
  value,
  onChange,
  flex,
  width,
  bg = 'layoutBg.500',
  border = 'none',
  borderColor = 'transparent',
}: SearchInputProps) {
  return (
    <InputGroup
      flex={flex}
      startElement={<LuSearch />}
      w={width}
      bg={bg}
      rounded="lg"
      height="40px"
      fontSize="sm"
      border={border}
      borderColor={borderColor}
    >
      <Input placeholder={placeholder} value={value} onChange={e => onChange?.(e.target.value)} />
    </InputGroup>
  );
}
