'use client';

import { Book } from '@/types';
import { HStack, Image, Text, VStack } from '@chakra-ui/react';

// TODO: This will be fixed later
export const BookColumns = [
  {
    key: 'id',
    header: 'ID',
    sortable: true,
    render: (book: Book) => <Text>{book.id}</Text>,
  },
  {
    key: 'title',
    header: 'Book',
    sortable: true,
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
    render: (book: Book) => (
      <HStack gap={2}>
        {/* <Image
          src={book.author.avatarUrl}
          alt={book.author.name}
          width="32px"
          height="32px"
          borderRadius="full"
        /> */}
        <Text>{book.authorId}</Text>
      </HStack>
    ),
  },
  {
    key: 'publisher',
    header: 'Publisher',
    sortable: false,
    render: (book: Book) => <Text>{book.publisher ?? 'N/A'}</Text>,
  },
  {
    key: 'publishYear',
    header: 'Publish Year',
    sortable: true,
    render: (book: Book) => <Text>{book.publishYear ?? 'N/A'}</Text>,
  },
  {
    key: 'edition',
    header: 'Edition',
    sortable: false,
    render: (book: Book) => <Text>{book.edition ?? 'N/A'}</Text>,
  },
  {
    key: 'pageCount',
    header: 'Page Count',
    sortable: true,
    render: (book: Book) => <Text>{book.pageCount ?? 'N/A'}</Text>,
  },
  {
    key: 'price',
    header: 'Price',
    sortable: true,
    render: (book: Book) => <Text>{book.price ?? 'N/A'}</Text>,
  },
];
