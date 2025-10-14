'use client';

import { Book } from '@/types';
import { Badge, HStack, Image, Link, Text, VStack } from '@chakra-ui/react';

// TODOD: This will be fixed later
export const BookColumns = [
  {
    key: 'index',
    header: 'No.',
    sortable: false,
    render: (_book: Book, rowIndex: number) => <Text>{rowIndex + 1}</Text>,
  },
  {
    key: 'book',
    header: 'Book',
    sortable: true,
    render: (book: Book) => (
      <HStack gap={3}>
        <Image
          src={book.coverImage}
          alt={book.title}
          width="40px"
          height="60px"
          objectFit="cover"
          borderRadius="sm"
        />
        <VStack align="start" gap={1}>
          <Text fontWeight="medium">{book.title}</Text>
          <Text fontSize="sm" color="gray.600">
            {book.bookCode}
          </Text>
        </VStack>
      </HStack>
    ),
  },
  {
    key: 'author',
    header: 'Author',
    sortable: true,
    render: (book: Book) => (
      <HStack gap={2}>
        <Image
          src={book.author.avatar}
          alt={book.author.name}
          width="32px"
          height="32px"
          borderRadius="full"
        />
        <Text>{book.author.name}</Text>
      </HStack>
    ),
  },
  {
    key: 'publisher',
    header: 'Publisher',
    sortable: true,
    render: (book: Book) => (
      <VStack align="start" gap={0}>
        <Text>{book.publisher.name}</Text>
        <Text fontSize="sm" color="gray.600">
          {book.publisher.year}
        </Text>
      </VStack>
    ),
  },
  {
    key: 'status',
    header: 'Status',
    sortable: true,
    render: (book: Book) => {
      const colors = {
        bg: `{colors.status.${book.status}}`,
        color: `{colors.statusText.${book.status}}`,
      };
      return (
        <Badge
          bg={colors.bg}
          color={colors.color}
          fontWeight="semibold"
          px={3}
          py={1}
          borderRadius="full"
        >
          {book.status}
        </Badge>
      );
    },
  },
  {
    key: 'copies',
    header: 'Copies',
    sortable: true,
    render: (book: Book) => (
      <Text>
        {book.copies.available}/{book.copies.total}
      </Text>
    ),
  },
  {
    key: 'resourceLink',
    header: 'Resource Link',
    sortable: true,
    render: (book: Book) => (
      <HStack gap={2}>
        <Text>🔗</Text>
        <Link href={book.resourceLink} color="blue.500" fontSize="sm">
          {book.resourceLink.length > 30
            ? `${book.resourceLink.substring(0, 30)}...`
            : book.resourceLink}
        </Link>
      </HStack>
    ),
  },
];
