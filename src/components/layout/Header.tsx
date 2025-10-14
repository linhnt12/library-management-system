'use client';

import { IconButton } from '@/components/buttons';
import { adminHeadings, commonHeadings, librarianHeadings } from '@/constants';
import { Box, Flex, HStack, Heading, Image, Stack, Text } from '@chakra-ui/react';
import { usePathname } from 'next/navigation';
import { FiBell } from 'react-icons/fi';
import { Breadcrumbs } from '@/components/layout';

type HeaderProps = {
  userName?: string;
  userRole?: string;
};

export function Header({ userName = 'Noah Tanaka', userRole = 'Admin' }: HeaderProps) {
  const pathname = usePathname();

  const isAdmin = pathname.startsWith('/admin');
  const isLibrarian = pathname.startsWith('/librarian');

  const headingsMap = isAdmin ? adminHeadings : isLibrarian ? librarianHeadings : commonHeadings;
  const heading =
    headingsMap[pathname] || (isAdmin ? 'Admin' : isLibrarian ? 'Librarian' : 'Dashboard');

  return (
    <Flex as="header" align="center" justify="space-between" paddingBottom={4} bg="layoutBg.500">
      <Box>
        <Heading fontSize="2xl" fontWeight="semibold" mb={1}>
          {heading}
        </Heading>
        <Breadcrumbs pathname={pathname} headingsMap={headingsMap} />
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
