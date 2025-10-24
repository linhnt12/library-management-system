'use client';

import { Button } from '@/components';
import { USER_ROLES } from '@/constants/user';
import { useProfileForm } from '@/lib/hooks';
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
import {
  FiCalendar,
  FiEdit,
  FiMail,
  FiMapPin,
  FiPhone,
  FiUpload,
  FiUser,
  FiX,
} from 'react-icons/fi';

export default function ProfilePage() {
  const {
    user,
    isLoading,
    isUpdating,
    isEditMode,
    formData,
    avatarPreview,
    fileInputRef,
    handleEditClick,
    handleCancelEdit,
    handleSave,
    handleInputChange,
    handleRemoveAvatar,
    handleAvatarChange,
    handleAvatarClick,
  } = useProfileForm();

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
        <Text fontSize="lg" color="secondaryText.500">
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
        return 'secondaryText.500';
    }
  };

  const getStatusLabel = (status: UserStatus) => {
    return status.charAt(0) + status.slice(1).toLowerCase();
  };

  return (
    <Box px={{ base: 4, md: 8, lg: 12, xl: 16 }} py={8}>
      <Stack gap={6}>
        {/* Profile Header Card */}
        <Card.Root bg="white" borderRadius="lg" overflow="hidden">
          <Card.Body p={8}>
            <Flex gap={6} align="start" flexDirection={{ base: 'column', md: 'row' }}>
              {/* Avatar */}
              <Box flexShrink={0} position="relative">
                <Box
                  position="relative"
                  onClick={handleAvatarClick}
                  cursor={isEditMode ? 'pointer' : 'default'}
                  _hover={isEditMode ? { opacity: 0.8 } : {}}
                  transition="opacity 0.2s"
                >
                  <Image
                    src={
                      formData.avatarRemoved
                        ? 'https://via.placeholder.com/150?text=No+Avatar'
                        : avatarPreview ||
                          user.avatarUrl ||
                          'https://via.placeholder.com/150?text=' + user.fullName.charAt(0)
                    }
                    alt={user.fullName}
                    boxSize="150px"
                    borderRadius="full"
                    objectFit="cover"
                    border="4px solid"
                    borderColor="paginationBg.500"
                    opacity={formData.avatarRemoved ? 0.5 : 1}
                  />
                  {isEditMode && (
                    <Box
                      position="absolute"
                      bottom="0"
                      left="0"
                      right="0"
                      bg="secondary.500"
                      opacity={0.8}
                      color="white"
                      py={2}
                      textAlign="center"
                      borderBottomRadius="full"
                      fontSize="sm"
                      fontWeight="medium"
                    >
                      <Flex align="center" justify="center" gap={1}>
                        <FiUpload size={14} />
                        <Text fontSize="xs">Upload</Text>
                      </Flex>
                    </Box>
                  )}
                </Box>
                {isEditMode && !formData.avatarRemoved && (user.avatarUrl || avatarPreview) && (
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
                <Input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                  onChange={handleAvatarChange}
                  display="none"
                />
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
                      borderColor={!isEditMode ? 'transparent' : 'paginationBg.500'}
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
                      bg="primary.200"
                      color="primary.500"
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

                <Text color="secondaryText.500" fontSize="md" lineHeight="1.6">
                  Welcome to your profile page. Here you can view and edit your personal information
                  and account details.
                </Text>

                <HStack gap={3} mt={2}>
                  {isEditMode ? (
                    <>
                      <Button
                        variantType="primary"
                        label={isUpdating ? 'Saving...' : 'Save Changes'}
                        onClick={handleSave}
                        disabled={isUpdating}
                      />
                      <Button
                        variantType="secondary"
                        label="Cancel"
                        onClick={handleCancelEdit}
                        disabled={isUpdating}
                      />
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
                <Box p={3} bg="primary.200" borderRadius="lg" color="primary.500" flexShrink={0}>
                  <FiMail size={24} />
                </Box>
                <Stack gap={1} flex={1}>
                  <Text fontSize="sm" color="secondaryText.500" fontWeight="medium">
                    Email Address
                  </Text>
                  <Text fontSize="md" fontWeight="medium" color="primaryText.500">
                    {user.email}
                  </Text>
                </Stack>
              </HStack>

              {/* Phone */}
              <HStack gap={4} align="start">
                <Box p={3} bg="primary.200" borderRadius="lg" color="primary.500" flexShrink={0}>
                  <FiPhone size={24} />
                </Box>
                <Stack gap={1} flex={1}>
                  <Text fontSize="sm" color="secondaryText.500" fontWeight="medium">
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
                  <Box p={3} bg="primary.200" borderRadius="lg" color="primary.500" flexShrink={0}>
                    <FiMapPin size={24} />
                  </Box>
                  <Stack gap={1} flex={1}>
                    <Text fontSize="sm" color="secondaryText.500" fontWeight="medium">
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
                <Box p={3} bg="primary.200" borderRadius="lg" color="primary.500" flexShrink={0}>
                  <FiUser size={24} />
                </Box>
                <Stack gap={1}>
                  <Text fontSize="sm" color="secondaryText.500" fontWeight="medium">
                    Member ID
                  </Text>
                  <Text fontSize="md" fontWeight="semibold" color="primaryText.500">
                    #{user.id}
                  </Text>
                </Stack>
              </HStack>

              {/* Created Date */}
              <HStack gap={4} align="start">
                <Box p={3} bg="primary.200" borderRadius="lg" color="primary.500" flexShrink={0}>
                  <FiCalendar size={24} />
                </Box>
                <Stack gap={1}>
                  <Text fontSize="sm" color="secondaryText.500" fontWeight="medium">
                    Member Since
                  </Text>
                  <Text fontSize="md" fontWeight="semibold" color="primaryText.500">
                    {formatDate(user.createdAt)}
                  </Text>
                </Stack>
              </HStack>

              {/* Updated Date */}
              <HStack gap={4} align="start">
                <Box p={3} bg="primary.200" borderRadius="lg" color="primary.500" flexShrink={0}>
                  <FiCalendar size={24} />
                </Box>
                <Stack gap={1}>
                  <Text fontSize="sm" color="secondaryText.500" fontWeight="medium">
                    Last Updated
                  </Text>
                  <Text fontSize="md" fontWeight="semibold" color="primaryText.500">
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
