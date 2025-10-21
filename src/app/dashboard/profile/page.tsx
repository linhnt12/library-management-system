'use client';

import { Button } from '@/components';
import { toaster } from '@/components/ui/Toaster';
import { USER_ROLES } from '@/constants/user';
import { useMe, useUpdateMe } from '@/lib/hooks';
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
import { useEffect, useRef, useState } from 'react';
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
  const { data: user, isLoading } = useMe();
  const { updateProfile, isLoading: isUpdating } = useUpdateMe();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isEditMode, setIsEditMode] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phoneNumber: '',
    address: '',
    avatarRemoved: false,
  });
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

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
      // Clear avatar preview when user data changes
      setAvatarPreview(null);
      setAvatarFile(null);
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
    // Clear avatar file and preview
    setAvatarFile(null);
    setAvatarPreview(null);
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSave = async () => {
    const result = await updateProfile(
      {
        fullName: formData.fullName,
        phoneNumber: formData.phoneNumber || undefined,
        address: formData.address || undefined,
        avatar: avatarFile,
        removeAvatar: formData.avatarRemoved,
      },
      {
        onSuccess: () => {
          toaster.create({
            title: 'Profile updated',
            description: 'Your profile has been updated successfully',
            type: 'success',
            duration: 3000,
          });

          setIsEditMode(false);
          // Clear avatar file and preview after successful save
          setAvatarFile(null);
          setAvatarPreview(null);
          // Reset file input
          if (fileInputRef.current) {
            fileInputRef.current.value = '';
          }
        },
        onError: error => {
          toaster.create({
            title: 'Update failed',
            description: error.message || 'Failed to update profile',
            type: 'error',
            duration: 5000,
          });
        },
      }
    );

    // You can also check result.success if needed
    if (!result.success && result.error) {
      // Additional error handling if needed
      console.error('Profile update error:', result.error);
    }
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
    setAvatarFile(null);
    setAvatarPreview(null);
    // Reset file input value so the same file can be selected again
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        toaster.create({
          title: 'Invalid file type',
          description: 'Please upload a valid image file (JPG, PNG, GIF, or WebP)',
          type: 'error',
          duration: 5000,
        });
        // Reset file input on validation error
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
        return;
      }

      // Validate file size (5MB max)
      const maxSize = 5 * 1024 * 1024;
      if (file.size > maxSize) {
        toaster.create({
          title: 'File too large',
          description: 'Please upload an image smaller than 5MB',
          type: 'error',
          duration: 5000,
        });
        // Reset file input on validation error
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
        return;
      }

      setAvatarFile(file);
      setFormData(prev => ({ ...prev, avatarRemoved: false }));

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAvatarClick = () => {
    if (isEditMode) {
      fileInputRef.current?.click();
    }
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
                    borderColor="gray.100"
                    opacity={formData.avatarRemoved ? 0.5 : 1}
                  />
                  {isEditMode && (
                    <Box
                      position="absolute"
                      bottom="0"
                      left="0"
                      right="0"
                      bg="blackAlpha.600"
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
                <Box p={3} bg="blue.50" borderRadius="lg" color="blue.600" flexShrink={0}>
                  <FiMail size={24} />
                </Box>
                <Stack gap={1} flex={1}>
                  <Text fontSize="sm" color="gray.500" fontWeight="medium">
                    Email Address
                  </Text>
                  <Text fontSize="md" fontWeight="medium" color="gray.700">
                    {user.email}
                  </Text>
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
