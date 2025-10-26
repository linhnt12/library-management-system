'use client';

import { IconButton, StatusCell } from '@/components';
import { ROUTES } from '@/constants';
import { Author } from '@/types';
import { HStack, Text, VStack } from '@chakra-ui/react';
import { useRouter } from 'next/navigation';
import { LuPencil } from 'react-icons/lu';

// Component to render action buttons
function ActionsCell({ author }: { author: Author }) {
  const router = useRouter();

  const handleEdit = () => {
    router.push(`${ROUTES.DASHBOARD.AUTHORS_EDIT}/${author.id}`);
  };

  return (
    <HStack gap={2} justifyContent="center">
      <IconButton aria-label="Edit author" onClick={handleEdit}>
        <LuPencil />
      </IconButton>
    </HStack>
  );
}

// Component to format date
function DateCell({ date }: { date: Date | null | undefined }) {
  if (!date) return <Text>N/A</Text>;

  const dateObj = new Date(date);
  const day = dateObj.getDate().toString().padStart(2, '0');
  const month = (dateObj.getMonth() + 1).toString().padStart(2, '0');
  const year = dateObj.getFullYear();
  const formattedDate = `${day}/${month}/${year}`;

  return <Text>{formattedDate}</Text>;
}

// Component to render bio with truncation
function BioCell({ bio }: { bio: string | null | undefined }) {
  if (!bio) return <Text>N/A</Text>;

  return (
    <Text title={bio} textAlign="justify">
      {bio}
    </Text>
  );
}

export const AuthorColumns = (onChangeStatus?: (author: Author) => void) => [
  {
    key: 'id',
    header: 'ID',
    sortable: true,
    width: '60px',
    render: (author: Author) => <Text>{author.id}</Text>,
  },
  {
    key: 'fullName',
    header: 'Author',
    width: '280px',
    sortable: true,
    render: (author: Author) => (
      <VStack align="start" gap={1}>
        <Text fontWeight="medium">{author.fullName}</Text>
        <Text fontSize="sm" color="gray.600">
          {author.nationality || 'N/A'}
        </Text>
      </VStack>
    ),
  },
  {
    key: 'bio',
    header: 'Bio',
    sortable: false,
    render: (author: Author) => <BioCell bio={author.bio} />,
  },
  {
    key: 'birthDate',
    header: 'Birth Date',
    sortable: true,
    width: '250px',
    textAlign: 'center' as const,
    render: (author: Author) => <DateCell date={author.birthDate} />,
  },
  {
    key: 'status',
    header: 'Status',
    sortable: true,
    width: '100px',
    render: (author: Author) => (
      <StatusCell item={author} onChangeStatus={onChangeStatus || (() => {})} />
    ),
  },
  {
    key: 'actions',
    header: 'Actions',
    sortable: false,
    width: '100px',
    textAlign: 'center' as const,
    render: (author: Author) => <ActionsCell author={author} />,
  },
];
