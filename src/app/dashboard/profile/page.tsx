'use client';

import { Button } from '@/components';
import { USER_ROLES } from '@/constants/user';
import { useMe } from '@/lib/hooks';
import {
  Box,
  Card,
  Flex,
  Grid,
  HStack,
  Heading,
  Image,
  Input,
  Separator,
  Spinner,
  Stack,
  Text,
  Textarea,
} from '@chakra-ui/react';
import { UserStatus } from '@prisma/client';
import { useEffect, useState } from 'react';
import { FiCalendar, FiEdit, FiMail, FiMapPin, FiPhone, FiUser, FiX } from 'react-icons/fi';

export default function ProfilePage() {
  const { data: user, isLoading } = useMe();
  const [isEditMode, setIsEditMode] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phoneNumber: '',
    address: '',
    avatarRemoved: false,
  });

  // Initialize form data when user data is loaded
  useEffect(() => {
    if (user) {
      setFormData({
        fullName: user.fullName,
        email: user.email,
        phoneNumber: user.phoneNumber || '',
        address: user.address || '',
        avatarRemoved: false,
      });
    }
  }, [user]);

  if (isLoading) {
    return (
      <Flex justify="center" align="center" minH="400px">
        <Spinner size="xl" />
      </Flex>
    );
  }

  if (!user) {
    return (
      <Flex justify="center" align="center" minH="400px">
        <Text fontSize="lg" color="gray.500">
          No user data available
        </Text>
      </Flex>
    );
  }

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getStatusColor = (status: UserStatus) => {
    switch (status) {
      case UserStatus.ACTIVE:
        return 'green.500';
      case UserStatus.INACTIVE:
        return 'red.500';
      default:
        return 'gray.500';
    }
  };

  const getStatusLabel = (status: UserStatus) => {
    return status.charAt(0) + status.slice(1).toLowerCase();
  };

  const handleEditClick = () => {
    setIsEditMode(true);
  };

  const handleCancelEdit = () => {
    setIsEditMode(false);
    // Reset form data to original user data
    if (user) {
      setFormData({
        fullName: user.fullName,
        email: user.email,
        phoneNumber: user.phoneNumber || '',
        address: user.address || '',
        avatarRemoved: false,
      });
    }
  };

  const handleSave = () => {
    // TODO: Integrate API call here
    console.log('Save profile data:', formData);
    setIsEditMode(false);
  };

  const handleInputChange = (field: keyof typeof formData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleRemoveAvatar = () => {
    setFormData(prev => ({
      ...prev,
      avatarRemoved: true,
    }));
  };

  return (
    <Box maxW="1200px" mx="auto">
      <Stack gap={6}>
        {/* Profile Header Card */}
        <Card.Root bg="white" borderRadius="lg" overflow="hidden">
          <Card.Body p={8}>
            <Flex gap={6} align="start" flexDirection={{ base: 'column', md: 'row' }}>
              {/* Avatar */}
              <Box flexShrink={0} position="relative">
                <Image
                  src={
                    formData.avatarRemoved
                      ? 'https://via.placeholder.com/150?text=No+Avatar'
                      : 'https://i.pravatar.cc/150?img=13'
                  }
                  alt={user.fullName}
                  boxSize="150px"
                  borderRadius="full"
                  objectFit="cover"
                  border="4px solid"
                  borderColor="gray.100"
                  opacity={formData.avatarRemoved ? 0.5 : 1}
                />
                {isEditMode && !formData.avatarRemoved && (
                  <Box
                    as="button"
                    position="absolute"
                    top="0"
                    right="0"
                    bg="red.500"
                    color="white"
                    borderRadius="full"
                    p={2}
                    cursor="pointer"
                    onClick={handleRemoveAvatar}
                    _hover={{ bg: 'red.600' }}
                    transition="background 0.2s"
                    boxShadow="md"
                  >
                    <FiX size={20} />
                  </Box>
                )}
              </Box>

              {/* User Info */}
              <Stack flex={1} gap={3}>
                <Box>
                  <Box mb={3}>
                    <Input
                      value={formData.fullName}
                      onChange={e => handleInputChange('fullName', e.target.value)}
                      size="lg"
                      fontSize="2xl"
                      fontWeight="bold"
                      placeholder="Enter your full name"
                      disabled={!isEditMode}
                      bg={!isEditMode ? 'transparent' : 'white'}
                      border={!isEditMode ? 'none' : '1px solid'}
                      borderColor={!isEditMode ? 'transparent' : 'gray.200'}
                      px={!isEditMode ? 0 : 4}
                      _disabled={{
                        opacity: 1,
                        cursor: 'default',
                      }}
                    />
                  </Box>
                  <HStack gap={3}>
                    <Text
                      fontSize="sm"
                      fontWeight="semibold"
                      px={3}
                      py={1}
                      bg="primary.100"
                      color="primary.700"
                      borderRadius="full"
                    >
                      {USER_ROLES[user.role]}
                    </Text>
                    <Text
                      fontSize="sm"
                      fontWeight="semibold"
                      px={3}
                      py={1}
                      bg={getStatusColor(user.status) + '.100'}
                      color={getStatusColor(user.status)}
                      borderRadius="full"
                    >
                      {getStatusLabel(user.status)}
                    </Text>
                  </HStack>
                </Box>

                <Text color="gray.600" fontSize="md" lineHeight="1.6">
                  Welcome to your profile page. Here you can view your personal information and
                  account details.
                </Text>

                <HStack gap={3} mt={2}>
                  {isEditMode ? (
                    <>
                      <Button variantType="primary" label="Save Changes" onClick={handleSave} />
                      <Button variantType="secondary" label="Cancel" onClick={handleCancelEdit} />
                    </>
                  ) : (
                    <>
                      <Button
                        variantType="primary"
                        label="Edit Profile"
                        onClick={handleEditClick}
                        icon={FiEdit}
                      />
                      <Button variantType="secondary" label="Change Password" disabled />
                    </>
                  )}
                </HStack>
              </Stack>
            </Flex>
          </Card.Body>
        </Card.Root>

        {/* Contact Information Card */}
        <Card.Root bg="white" borderRadius="lg">
          <Card.Body p={6}>
            <Heading fontSize="xl" fontWeight="semibold" mb={4}>
              Contact Information
            </Heading>
            <Separator mb={4} />

            <Grid templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)' }} gap={6}>
              {/* Email */}
              <HStack gap={4} align="start">
                <Box p={3} bg="blue.50" borderRadius="lg" color="blue.600" flexShrink={0}>
                  <FiMail size={24} />
                </Box>
                <Stack gap={1} flex={1}>
                  <Text fontSize="sm" color="gray.500" fontWeight="medium">
                    Email Address
                  </Text>
                  <Input
                    value={formData.email}
                    onChange={e => handleInputChange('email', e.target.value)}
                    type="email"
                    placeholder="Enter your email"
                    size="md"
                    disabled={!isEditMode}
                    _disabled={{
                      opacity: 1,
                      cursor: 'default',
                      bg: 'transparent',
                      border: 'none',
                      px: 0,
                    }}
                  />
                </Stack>
              </HStack>

              {/* Phone */}
              <HStack gap={4} align="start">
                <Box p={3} bg="green.50" borderRadius="lg" color="green.600" flexShrink={0}>
                  <FiPhone size={24} />
                </Box>
                <Stack gap={1} flex={1}>
                  <Text fontSize="sm" color="gray.500" fontWeight="medium">
                    Phone Number
                  </Text>
                  <Input
                    value={formData.phoneNumber}
                    onChange={e => handleInputChange('phoneNumber', e.target.value)}
                    type="tel"
                    placeholder="Not provided"
                    size="md"
                    disabled={!isEditMode}
                    _disabled={{
                      opacity: 1,
                      cursor: 'default',
                      bg: 'transparent',
                      border: 'none',
                      px: 0,
                    }}
                  />
                </Stack>
              </HStack>

              {/* Address */}
              <Box gridColumn={{ base: '1', md: 'span 2' }}>
                <HStack gap={4} align="start">
                  <Box p={3} bg="purple.50" borderRadius="lg" color="purple.600" flexShrink={0}>
                    <FiMapPin size={24} />
                  </Box>
                  <Stack gap={1} flex={1}>
                    <Text fontSize="sm" color="gray.500" fontWeight="medium">
                      Address
                    </Text>
                    <Textarea
                      value={formData.address}
                      onChange={e => handleInputChange('address', e.target.value)}
                      placeholder="Not provided"
                      size="md"
                      rows={3}
                      disabled={!isEditMode}
                      _disabled={{
                        opacity: 1,
                        cursor: 'default',
                        bg: 'transparent',
                        border: 'none',
                        px: 0,
                        resize: 'none',
                      }}
                    />
                  </Stack>
                </HStack>
              </Box>
            </Grid>
          </Card.Body>
        </Card.Root>

        {/* Account Information Card */}
        <Card.Root bg="white" borderRadius="lg">
          <Card.Body p={6}>
            <Heading fontSize="xl" fontWeight="semibold" mb={4}>
              Account Information
            </Heading>
            <Separator mb={4} />

            <Grid templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)' }} gap={6}>
              {/* User ID */}
              <HStack gap={4} align="start">
                <Box p={3} bg="orange.50" borderRadius="lg" color="orange.600" flexShrink={0}>
                  <FiUser size={24} />
                </Box>
                <Stack gap={1}>
                  <Text fontSize="sm" color="gray.500" fontWeight="medium">
                    User ID
                  </Text>
                  <Text fontSize="md" fontWeight="semibold">
                    #{user.id}
                  </Text>
                </Stack>
              </HStack>

              {/* Created Date */}
              <HStack gap={4} align="start">
                <Box p={3} bg="teal.50" borderRadius="lg" color="teal.600" flexShrink={0}>
                  <FiCalendar size={24} />
                </Box>
                <Stack gap={1}>
                  <Text fontSize="sm" color="gray.500" fontWeight="medium">
                    Member Since
                  </Text>
                  <Text fontSize="md" fontWeight="semibold">
                    {formatDate(user.createdAt)}
                  </Text>
                </Stack>
              </HStack>

              {/* Updated Date */}
              <HStack gap={4} align="start">
                <Box p={3} bg="pink.50" borderRadius="lg" color="pink.600" flexShrink={0}>
                  <FiCalendar size={24} />
                </Box>
                <Stack gap={1}>
                  <Text fontSize="sm" color="gray.500" fontWeight="medium">
                    Last Updated
                  </Text>
                  <Text fontSize="md" fontWeight="semibold">
                    {formatDate(user.updatedAt)}
                  </Text>
                </Stack>
              </HStack>
            </Grid>
          </Card.Body>
        </Card.Root>
      </Stack>
    </Box>
  );
}
