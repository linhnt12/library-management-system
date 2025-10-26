'use client';

import { AuthApi } from '@/api';
import { Button, SearchInput } from '@/components';
import { ROUTES } from '@/constants';
import { useMe } from '@/lib/hooks';
import { Box, Flex, HStack, Image, Menu, Portal, Text } from '@chakra-ui/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { FiCalendar, FiClock } from 'react-icons/fi';

// Mock data for search and avatar
const mockData = {
  userAvatar: 'https://i.pravatar.cc/100?img=13', // Fallback avatar
  searchCategories: [
    { value: 'all', label: 'All' },
    { value: 'books', label: 'Books' },
    { value: 'authors', label: 'Authors' },
    { value: 'categories', label: 'Categories' },
  ],
};

export function UserHeader() {
  const [currentTime, setCurrentTime] = useState('');
  const [currentDate, setCurrentDate] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const { data: user } = useMe();
  const router = useRouter();

  useEffect(() => {
    const updateDateTime = () => {
      const now = new Date();

      // Format time: HH:MM AM/PM
      const timeOptions: Intl.DateTimeFormatOptions = {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      };
      setCurrentTime(now.toLocaleTimeString('en-US', timeOptions));

      // Format date: DD-MMM-YYYY
      const dateOptions: Intl.DateTimeFormatOptions = {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      };
      setCurrentDate(now.toLocaleDateString('en-US', dateOptions).toUpperCase());
    };

    // Update immediately
    updateDateTime();

    // Update every second
    const interval = setInterval(updateDateTime, 1000);

    return () => clearInterval(interval);
  }, []);

  const handleLogin = () => {
    router.push(ROUTES.AUTH.LOGIN);
  };

  const handleRegister = () => {
    router.push(ROUTES.AUTH.REGISTER);
  };

  const handleSearch = () => {
    if (searchQuery.trim()) {
      router.push(`${ROUTES.SEARCH}?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      handleSearch();
    }
  };

  const handleProfile = () => {
    router.push(ROUTES.PROFILE);
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
    <Flex as="header" mb={8} align="center" justify="space-between" w="full" gap={4}>
      {/* Left side - Search section */}
      <HStack gap={0} flex={1} maxW="600px">
        {/* Category dropdown */}
        <HStack gap={6}>
          <SearchInput
            width="400px"
            placeholder="Search books by title, author, description or ISBN"
            bg="white"
            border="1px solid"
            borderColor="gray.200"
            value={searchQuery}
            onChange={setSearchQuery}
            onKeyDown={handleKeyDown}
          />
        </HStack>
      </HStack>

      {/* Right side - Time, Date, User */}
      <HStack gap={6}>
        {/* Time and Date */}
        <HStack
          bg="white"
          height="40px"
          px={3}
          rounded="lg"
          border="1px solid"
          borderColor="gray.200"
          gap={12}
        >
          <HStack gap={2}>
            <Box color="red.500">
              <FiClock size={16} />
            </Box>
            <Text fontSize="sm" fontWeight="medium" fontFamily="mono">
              {currentTime}
            </Text>
          </HStack>

          <HStack gap={2}>
            <Box color="red.500">
              <FiCalendar size={16} />
            </Box>
            <Text fontSize="sm" fontWeight="medium" fontFamily="mono">
              {currentDate}
            </Text>
          </HStack>
        </HStack>

        {/* User profile or Login button */}
        {user ? (
          <Menu.Root>
            <Menu.Trigger asChild>
              <HStack
                bg="white"
                rounded="lg"
                border="1px solid"
                borderColor="gray.200"
                height="40px"
                px={2}
                justifyContent="center"
                gap={3}
                cursor="pointer"
                _hover={{ bg: 'gray.50' }}
              >
                <Image
                  src={mockData.userAvatar}
                  alt={user.fullName}
                  boxSize="32px"
                  borderRadius="full"
                  objectFit="cover"
                />
                <Text fontSize="sm" fontWeight="medium">
                  {user.fullName}
                </Text>
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
                    Change password
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
        ) : (
          <HStack gap={3}>
            <Button variantType="primary" height="40px" onClick={handleLogin} label="Login" />
            <Button
              variantType="tertiary"
              height="40px"
              onClick={handleRegister}
              label="Register"
              borderColor="gray.200"
            />
          </HStack>
        )}
      </HStack>
    </Flex>
  );
}
