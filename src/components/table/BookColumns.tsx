'use client';

import { Book } from '@/types';
import { HStack, Image, Text, VStack } from '@chakra-ui/react';
import { IconButton } from '@/components/buttons';
import { LuEye, LuPencil, LuTrash2 } from 'react-icons/lu';
import { useAuthors } from '@/lib/hooks/useAuthors';
import { ROUTES } from '@/constants';
import { useRouter } from 'next/navigation';

// Component to render author name with hook
function AuthorCell({ authorId }: { authorId: number }) {
  const { data: authors } = useAuthors();
  const author = authors?.find(a => a.id === authorId);

  return <Text>{author?.fullName || `Author ID: ${authorId}`}</Text>;
}

// Component to render action buttons
function ActionsCell({ book }: { book: Book }) {
  const router = useRouter();

  const handleEdit = () => {
    router.push(`${ROUTES.LIBRARIAN.BOOKS_EDIT}/${book.id}`);
  };

  const handleView = () => {
    // TODO: Implement view book functionality
    console.log('View book:', book.id);
  };

  const handleDelete = () => {
    // TODO: Implement delete book functionality
    console.log('Delete book:', book.id);
  };

  return (
    <HStack gap={2} justifyContent="center">
      <IconButton aria-label="View book" onClick={handleView}>
        <LuEye />
      </IconButton>
      <IconButton aria-label="Edit book" onClick={handleEdit}>
        <LuPencil />
      </IconButton>
      <IconButton aria-label="Delete book" onClick={handleDelete}>
        <LuTrash2 />
      </IconButton>
    </HStack>
  );
}

// TODO: This will be fixed later
export const BookColumns = [
  {
    key: 'id',
    header: 'ID',
    sortable: true,
    width: '60px',
    render: (book: Book) => <Text>{book.id}</Text>,
  },
  {
    key: 'title',
    header: 'Book',
    sortable: true,
    width: '300px',
    render: (book: Book) => (
      <HStack gap={3}>
        <Image
          src={book.coverImageUrl ?? undefined}
          alt={book.title}
          width="40px"
          height="60px"
          objectFit="cover"
          borderRadius="sm"
        />
        <VStack align="start" gap={1}>
          <Text fontWeight="medium">{book.title}</Text>
          <Text fontSize="sm" color="gray.600">
            {book.isbn}
          </Text>
        </VStack>
      </HStack>
    ),
  },
  {
    key: 'author',
    header: 'Author',
    sortable: false,
    width: '150px',
    render: (book: Book) => <AuthorCell authorId={book.authorId} />,
  },
  {
    key: 'publisher',
    header: 'Publisher',
    sortable: false,
    width: '120px',
    render: (book: Book) => <Text>{book.publisher ?? 'N/A'}</Text>,
  },
  {
    key: 'publishYear',
    header: 'Publish Year',
    sortable: true,
    width: '120px',
    textAlign: 'center',
    render: (book: Book) => <Text>{book.publishYear ?? 'N/A'}</Text>,
  },
  {
    key: 'edition',
    header: 'Edition',
    sortable: false,
    width: '80px',
    textAlign: 'center',
    render: (book: Book) => <Text>{book.edition ?? 'N/A'}</Text>,
  },
  {
    key: 'pageCount',
    header: 'Page Count',
    sortable: true,
    width: '120px',
    textAlign: 'center',
    render: (book: Book) => <Text>{book.pageCount ?? 'N/A'}</Text>,
  },
  {
    key: 'price',
    header: 'Price',
    sortable: true,
    width: '100px',
    textAlign: 'center',
    render: (book: Book) => <Text>{book.price ?? 'N/A'}</Text>,
  },
  {
    key: 'actions',
    header: 'Actions',
    sortable: false,
    width: '120px',
    textAlign: 'center',
    render: (book: Book) => <ActionsCell book={book} />,
  },
];
