'use client';

import { AuthApi } from '@/api';
import { Breadcrumbs, IconButton } from '@/components';
import { pageHeadings, ROUTES } from '@/constants';
import { USER_ROLES } from '@/constants/user';
import { useMe } from '@/lib/hooks';
import { Box, Flex, Heading, HStack, Image, Menu, Portal, Stack, Text } from '@chakra-ui/react';
import { usePathname, useRouter } from 'next/navigation';
import { FiBell } from 'react-icons/fi';

export function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const { data: user } = useMe();

  // Find heading for dynamic routes
  const heading =
    pageHeadings[pathname] ||
    pageHeadings[pathname.replace(/\/\d+$/, '')] || // Remove trailing ID
    'Dashboard';

  const handleProfile = () => {
    router.push(ROUTES.DASHBOARD.PROFILE);
  };

  const handleChangePassword = () => {
    // TODO: Navigate to change password page
    console.log('Navigate to change password');
  };

  const handleLogout = async () => {
    try {
      await AuthApi.logout();
    } finally {
      router.replace(ROUTES.AUTH.LOGIN);
    }
  };

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

        <Menu.Root>
          <Menu.Trigger asChild>
            <HStack
              gap={3}
              pl={2}
              cursor="pointer"
              _hover={{ opacity: 0.8 }}
              transition="opacity 0.2s"
            >
              <Image
                src="https://i.pravatar.cc/100?img=13"
                alt={user?.fullName || ''}
                boxSize="42px"
                borderRadius="full"
              />
              <Stack gap={0}>
                <Text fontSize="lg" fontWeight="semibold">
                  {user?.fullName || ''}
                </Text>
                <Text color="secondaryText.500" fontSize="md">
                  {user?.role ? USER_ROLES[user.role] : ''}
                </Text>
              </Stack>
            </HStack>
          </Menu.Trigger>
          <Portal>
            <Menu.Positioner>
              <Menu.Content
                bg="white"
                border="1px solid"
                borderColor="gray.200"
                borderRadius="md"
                boxShadow="lg"
                py={1}
              >
                <Menu.Item
                  value="profile"
                  onClick={handleProfile}
                  cursor="pointer"
                  _hover={{ bg: 'primary.200' }}
                >
                  Profile
                </Menu.Item>
                <Menu.Item
                  value="change-password"
                  onClick={handleChangePassword}
                  cursor="pointer"
                  _hover={{ bg: 'primary.200' }}
                >
                  Change Password
                </Menu.Item>
                <Menu.Item
                  value="logout"
                  cursor="pointer"
                  _hover={{ bg: 'primary.200' }}
                  onClick={handleLogout}
                >
                  Logout
                </Menu.Item>
              </Menu.Content>
            </Menu.Positioner>
          </Portal>
        </Menu.Root>
      </HStack>
    </Flex>
  );
}
