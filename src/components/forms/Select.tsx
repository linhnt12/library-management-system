'use client';

import { Button, Select, createListCollection, type HTMLChakraProps } from '@chakra-ui/react';

export type FormSelectItem = { value: string; label: string };

export type FormSelectProps = {
  items: FormSelectItem[];
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  fontWeight?: HTMLChakraProps<'div'>['fontWeight'];
  width?: HTMLChakraProps<'div'>['w'];
  height?: HTMLChakraProps<'div'>['h'];
  triggerSize?: 'xs' | 'sm' | 'md';
};

export function FormSelect({
  items,
  value,
  onChange,
  placeholder,
  fontWeight,
  width,
  height,
  triggerSize = 'sm',
}: FormSelectProps) {
  const collection = createListCollection({ items });
  const selected = value ? [value] : [];
  return (
    <Select.Root
      collection={collection}
      value={selected}
      w={width}
      fontSize="sm"
      fontWeight="medium"
      onValueChange={e => onChange?.(e.value[0])}
    >
      <Select.Trigger asChild>
        <Button
          size={triggerSize}
          variant="subtle"
          bg="paginationBg.500"
          px={2}
          rounded="md"
          h={height}
          minH={height}
        >
          <Select.ValueText placeholder={placeholder ?? 'Select'} />
          <Select.Indicator />
        </Button>
      </Select.Trigger>
      <Select.Positioner zIndex={30}>
        <Select.Content
          bg="white"
          borderRadius="lg"
          border="1px solid"
          borderColor="gray.200"
          boxShadow="md"
        >
          {collection.items.map(item => (
            <Select.Item
              key={item.value}
              item={item}
              _hover={{ bg: 'primary.200' }}
              _highlighted={{ bg: 'primary.200' }}
              _selected={{ bg: 'primary.500', color: 'white' }}
            >
              {item.label}
            </Select.Item>
          ))}
        </Select.Content>
      </Select.Positioner>
    </Select.Root>
  );
}
