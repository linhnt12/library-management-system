'use client';

import { IconButton, Breadcrumbs } from '@/components';
import { pageHeadings } from '@/constants';
import { Box, Flex, HStack, Heading, Image, Stack, Text } from '@chakra-ui/react';
import { usePathname } from 'next/navigation';
import { FiBell } from 'react-icons/fi';

type HeaderProps = {
  userName?: string;
  userRole?: string;
};

export function Header({ userName = 'Noah Tanaka', userRole = 'Admin' }: HeaderProps) {
  const pathname = usePathname();

  // Find heading for dynamic routes
  const heading =
    pageHeadings[pathname] ||
    pageHeadings[pathname.replace(/\/\d+$/, '')] || // Remove trailing ID
    'Dashboard';

  return (
    <Flex as="header" align="center" justify="space-between" paddingBottom={4} bg="layoutBg.500">
      <Box>
        <Heading fontSize="2xl" fontWeight="semibold" mb={1}>
          {heading}
        </Heading>
        <Breadcrumbs pathname={pathname} headingsMap={pageHeadings} />
      </Box>

      <HStack gap={3}>
        <IconButton>
          <FiBell />
        </IconButton>

        <HStack gap={3} pl={2}>
          <Image
            src="https://i.pravatar.cc/100?img=13"
            alt={userName}
            boxSize="42px"
            borderRadius="full"
          />
          <Stack gap={0}>
            <Text fontSize="lg" fontWeight="semibold">
              {userName}
            </Text>
            <Text color="secondaryText.500" fontSize="md">
              {userRole}
            </Text>
          </Stack>
        </HStack>
      </HStack>
    </Flex>
  );
}
