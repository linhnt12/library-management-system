'use client';

import { Stack, Text, type StackProps } from '@chakra-ui/react';

export interface FormFieldProps extends Omit<StackProps, 'children'> {
  label: string;
  children: React.ReactNode;
  error?: string;
}

export function FormField({ label, children, error, ...rest }: FormFieldProps) {
  return (
    <Stack gap={0} {...rest}>
      <Text as="label" fontWeight="medium" display="block" mb={2}>
        {label}
      </Text>
      {children}
      {error && (
        <Text color="red.500" fontSize="sm" mt={1} px={1}>
          {error}
        </Text>
      )}
    </Stack>
  );
}
