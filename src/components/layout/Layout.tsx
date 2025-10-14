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
      <Box w="280px" bg="white" position="fixed" top={0} left={0} h="100vh" overflowY="auto">
        {sidebar}
      </Box>
      <Box flex="1" bg="layoutBg.500" px={6} py={4} gapY={4} ml="280px" minH="100vh">
        <Header userName={userName} userRole={userRole} />
        <Box p={4} rounded="lg" bg="white" color="text.500">
          {children}
        </Box>
        <Footer />
      </Box>
    </Flex>
  );
}
