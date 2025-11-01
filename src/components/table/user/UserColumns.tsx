import { IconButton } from '@/components';
import { UserCell } from '@/components/user';
import { PublicUser } from '@/types/user';
import { Badge, HStack, Text } from '@chakra-ui/react';
import { Role, UserStatus } from '@prisma/client';
import { LuPencil, LuTrash2 } from 'react-icons/lu';

/**
 * User table columns configuration
 */
export const UserColumns = (
  onEdit: (user: PublicUser) => void,
  onDelete: (user: PublicUser) => void
) => [
  {
    key: 'id',
    header: 'ID',
    sortable: true,
    width: '80px',
    render: (user: PublicUser) => (
      <Text fontWeight="medium" color="gray.700">
        #{user.id}
      </Text>
    ),
  },
  {
    key: 'fullName',
    header: 'Full Name',
    sortable: true,
    render: (user: PublicUser) => (
      <UserCell user={{ fullName: user.fullName, email: user.email }} variant="stack" />
    ),
  },
  {
    key: 'role',
    header: 'Role',
    sortable: true,
    width: '120px',
    render: (user: PublicUser) => {
      const roleColors = {
        [Role.ADMIN]: { bg: 'red.100', color: 'red.700' },
        [Role.LIBRARIAN]: { bg: 'blue.100', color: 'blue.700' },
        [Role.READER]: { bg: 'green.100', color: 'green.700' },
      };

      const colors = roleColors[user.role];

      return (
        <Badge
          bg={colors.bg}
          color={colors.color}
          px={2}
          py={1}
          borderRadius="md"
          fontWeight="medium"
          fontSize="xs"
        >
          {user.role}
        </Badge>
      );
    },
  },
  {
    key: 'status',
    header: 'Status',
    sortable: true,
    width: '120px',
    render: (user: PublicUser) => {
      const isActive = user.status === UserStatus.ACTIVE;
      return (
        <Badge
          bg={isActive ? 'green.100' : 'red.100'}
          color={isActive ? 'green.700' : 'red.700'}
          px={2}
          py={1}
          borderRadius="md"
          fontWeight="medium"
          fontSize="xs"
        >
          {isActive ? 'Active' : 'Inactive'}
        </Badge>
      );
    },
  },
  {
    key: 'phoneNumber',
    header: 'Phone',
    width: '140px',
    render: (user: PublicUser) => (
      <Text fontSize="sm" color="gray.600">
        {user.phoneNumber || '-'}
      </Text>
    ),
  },
  {
    key: 'createdAt',
    header: 'Created At',
    sortable: true,
    width: '140px',
    render: (user: PublicUser) => (
      <Text fontSize="sm" color="gray.600">
        {new Date(user.createdAt).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
        })}
      </Text>
    ),
  },
  {
    key: 'actions',
    header: 'Actions',
    sortable: false,
    width: '150px',
    textAlign: 'center' as const,
    render: (user: PublicUser) => (
      <HStack gap={2} justifyContent="center">
        <IconButton aria-label="Edit user" onClick={() => onEdit(user)}>
          <LuPencil />
        </IconButton>
        <IconButton
          aria-label="Delete user"
          onClick={() => onDelete(user)}
          colorScheme="red"
          variant="ghost"
        >
          <LuTrash2 />
        </IconButton>
      </HStack>
    ),
  },
];
