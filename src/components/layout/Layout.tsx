'use client';

import { Footer, Header } from '@/components/layout';
import { Box, Flex } from '@chakra-ui/react';
import { ReactNode } from 'react';

type LayoutProps = {
  children: ReactNode;
  sidebar: ReactNode;
  userName?: string;
  userRole?: string;
};

export function Layout({ children, sidebar, userName, userRole }: LayoutProps) {
  return (
    <Flex minH="100vh">
      <Box w="280px" bg="white">
        {sidebar}
      </Box>
      <Box flex="1" bg="layoutBg.500" px={6} py={4} gapY={4}>
        <Header userName={userName} userRole={userRole} />
        <Box px={4} py={6} rounded="lg" bg="white" color="text.500">
          {children}
        </Box>
        <Footer />
      </Box>
    </Flex>
  );
}
