'use client';

import { Box, Text } from '@chakra-ui/react';

export function Footer() {
  return (
    <Box as="footer" py={4} bg="subtleBg">
      <Text fontSize="sm" fontWeight="semibold" color="secondaryText.500">
        Copyright © {new Date().getFullYear()} Library Management System
      </Text>
    </Box>
  );
}
