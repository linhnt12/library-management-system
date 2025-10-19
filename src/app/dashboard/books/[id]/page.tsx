'use client';

import { BookApi } from '@/api';
import {
  BookItemDetailColumns,
  BookItemsTable,
  IconButton,
  Table,
  Tag,
  toaster,
} from '@/components';
import { ROUTES } from '@/constants';
import { BookWithAuthorAndItems } from '@/types';
import { Badge, Box, Flex, Grid, Heading, HStack, Image, Text, VStack } from '@chakra-ui/react';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { FaChevronDown } from 'react-icons/fa';
import { LuPencil } from 'react-icons/lu';

// Mock data for borrowing history, reservations, and related books
// TODO: Replace with real API calls when available
const mockBorrowingHistory = [
  {
    id: 1,
    memberName: 'Milo Sharp',
    memberId: 'MBR-4112',
    avatar: '/api/placeholder/40/40',
    borrowDate: 'Aug 24, 2035',
    dueDate: 'Aug 24, 2035',
    returnDate: 'Aug 10',
    overdue: null,
    fine: '$0.00',
  },
  {
    id: 2,
    memberName: 'Celine Moore',
    memberId: 'MBR-3095',
    avatar: '/api/placeholder/40/40',
    borrowDate: 'Jul 26, 2035',
    dueDate: 'Jul 30, 2035',
    returnDate: 'Jul 12',
    overdue: '4 Days',
    fine: '$2.00',
  },
  {
    id: 3,
    memberName: 'Ava Lin',
    memberId: 'MBR-3021',
    avatar: '/api/placeholder/40/40',
    borrowDate: 'Jun 15, 2035',
    dueDate: 'Jun 15, 2035',
    returnDate: 'Jun 01',
    overdue: null,
    fine: '$0.00',
  },
  {
    id: 4,
    memberName: 'Leo Finch',
    memberId: 'MBR-2210',
    avatar: '/api/placeholder/40/40',
    borrowDate: 'May 17, 2035',
    dueDate: 'May 17, 2035',
    returnDate: 'May 03',
    overdue: null,
    fine: '$0.00',
  },
];
const mockReservations = [
  { id: 1, name: 'Isla Ray', memberId: 'MBR-2389', avatar: '/api/placeholder/40/40' },
  { id: 2, name: 'Noah Trent', memberId: 'MBR-1643', avatar: '/api/placeholder/40/40' },
  { id: 3, name: 'Ezra Nolan', memberId: 'MBR-1170', avatar: '/api/placeholder/40/40' },
  { id: 4, name: 'Nova Wells', memberId: 'MBR-3678', avatar: '/api/placeholder/40/40' },
];
const mockRelatedBooks = [
  {
    id: 1,
    title: 'My Story',
    author: 'Olivia Wilson',
    coverImage: '/api/placeholder/120/180',
  },
  {
    id: 2,
    title: "Claudia's Life Story",
    author: 'Unknown Author',
    coverImage: '/api/placeholder/120/180',
  },
  {
    id: 3,
    title: 'The Lost Kingdom',
    author: 'Unknown Author',
    coverImage: '/api/placeholder/120/180',
  },
];
interface BorrowingHistoryItem {
  id: number;
  memberName: string;
  memberId: string;
  avatar: string;
  borrowDate: string;
  dueDate: string;
  returnDate: string;
  overdue: string | null;
  fine: string;
}
const borrowingHistoryColumns = [
  {
    key: 'memberInfo',
    header: 'Member Info',
    render: (item: BorrowingHistoryItem) => (
      <HStack gap={3}>
        <Avatar size="sm" src={item.avatar} />
        <VStack align="start" gap={0}>
          <Text fontWeight="medium">{item.memberName}</Text>
          <Text fontSize="sm" color="secondaryText.500">
            {item.memberId}
          </Text>
        </VStack>
      </HStack>
    ),
  },
  {
    key: 'borrowDue',
    header: 'Borrow & Due Date',
    render: (item: BorrowingHistoryItem) => (
      <VStack align="start" gap={0}>
        <Text fontSize="sm">{item.borrowDate}</Text>
        <Text fontSize="sm" color="secondaryText.500">
          {item.dueDate}
        </Text>
      </VStack>
    ),
  },
  {
    key: 'returnDate',
    header: 'Return Date',
    render: (item: BorrowingHistoryItem) => <Text fontSize="sm">{item.returnDate}</Text>,
  },
  {
    key: 'overdue',
    header: 'Overdue',
    render: (item: BorrowingHistoryItem) =>
      item.overdue ? (
        <Badge colorScheme="red" variant="subtle">
          {item.overdue}
        </Badge>
      ) : (
        <Text fontSize="sm" color="secondaryText.500">
          —
        </Text>
      ),
  },
  {
    key: 'fine',
    header: 'Fine',
    render: (item: BorrowingHistoryItem) => <Text fontSize="sm">{item.fine}</Text>,
  },
];
// Simple Avatar component
const Avatar = ({
  size = 'md',
  src,
  ...props
}: {
  size?: string;
  src?: string;
  [key: string]: unknown;
}) => (
  <Box
    width={size === 'sm' ? '32px' : '40px'}
    height={size === 'sm' ? '32px' : '40px'}
    borderRadius="full"
    bg="gray.200"
    backgroundImage={src ? `url(${src})` : undefined}
    backgroundSize="cover"
    backgroundPosition="center"
    {...props}
  />
);

// Reusable components for book details
const MetadataRow = ({ label, value }: { label: string; value: string | number }) => (
  <HStack align="start">
    <Text fontSize="sm" color="secondaryText.500" width="120px">
      {label}
    </Text>
    <Text fontSize="sm" fontWeight="medium">
      {value}
    </Text>
  </HStack>
);

const StatCard = ({ label, value }: { label: string; value: string }) => (
  <VStack align="start" gap={1}>
    <Text fontSize="sm" color="secondaryText.500">
      {label}
    </Text>
    <Text fontSize="sm" fontWeight="medium">
      {value}
    </Text>
  </VStack>
);

export default function BookPage() {
  const params = useParams();
  const router = useRouter();
  const bookId = Number(params.id);
  const [book, setBook] = useState<BookWithAuthorAndItems | null>(null);

  // Get book item columns for detail view
  const bookItemColumns = BookItemDetailColumns();
  const bookStats = useMemo(
    () => [
      { label: 'Rating', value: '4.9/5' }, // TODO: Replace with real data
      { label: 'Total Pages', value: book?.pageCount ? `${book.pageCount} pages` : 'N/A' },
      { label: 'Copies', value: '2 of 4' }, // TODO: Replace with real data
      { label: 'Price', value: book?.price ? `$${book.price}` : 'N/A' },
    ],
    [book?.pageCount, book?.price]
  );

  const bookMetadata = useMemo(
    () => [
      { label: 'Book ID', value: book?.id || 'N/A' },
      { label: 'ISBN', value: book?.isbn || 'N/A' },
      { label: 'Publisher', value: book?.publisher || 'N/A' },
      { label: 'Publish Year', value: book?.publishYear || 'N/A' },
      { label: 'Edition', value: book?.edition || 'N/A' },
    ],
    [book]
  );

  // Fetch book data
  useEffect(() => {
    const fetchBook = async () => {
      if (!bookId || bookId <= 0) {
        router.push(ROUTES.DASHBOARD.BOOKS);
        return;
      }

      try {
        const bookData = await BookApi.getBookById(bookId);
        setBook(bookData);
      } catch (err) {
        console.error('Error fetching book:', err);
        toaster.create({
          title: 'Error',
          description: 'Book not found',
          type: 'error',
        });
        router.push(ROUTES.DASHBOARD.BOOKS);
      }
    };

    fetchBook();
  }, [bookId, router]);

  if (!book) {
    return null;
  }

  return (
    <>
      {/* Main Content */}
      <VStack gap={6} p={4} align="stretch">
        {/* Book Image and Details */}
        <HStack align="stretch" gap={8}>
          <Box flex="2">
            <Grid templateColumns={{ base: '1fr', lg: '2fr 3fr' }} gap={8} mb={6}>
              {/* Book Cover */}
              <Image
                src={book.coverImageUrl || '/api/placeholder/300/400'}
                alt={book.title}
                objectFit="cover"
                borderRadius="lg"
                bg="gray.100"
                boxShadow="md"
              />

              {/* Book Details */}
              <VStack align="start" gap={2}>
                <Box
                  textAlign="right"
                  w="full"
                  display="flex"
                  justifyContent="space-between"
                  alignItems="center"
                >
                  <Tag variantType={book.isDeleted ? 'inactive' : 'active'}>
                    {book.isDeleted ? 'Inactive' : 'Active'}
                  </Tag>
                  <IconButton
                    aria-label="Edit book"
                    onClick={() => router.push(`${ROUTES.DASHBOARD.BOOKS_EDIT}/${book.id}`)}
                  >
                    <LuPencil />
                  </IconButton>
                </Box>

                {/* Title and Author */}
                <VStack align="start" gap={1}>
                  <Text fontWeight="semibold" fontSize="30px">
                    {book.title}
                  </Text>
                  <Text fontSize="lg" color="secondaryText.500">
                    by {book.author?.fullName || 'Unknown Author'}
                  </Text>
                </VStack>

                {/* Stats Grid */}
                <Grid
                  templateColumns={{ base: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' }}
                  gap={4}
                  width="100%"
                  borderBottom="1px solid"
                  borderColor="gray.200"
                  py={4}
                >
                  {bookStats.map(stat => (
                    <StatCard key={stat.label} label={stat.label} value={stat.value} />
                  ))}
                </Grid>

                {/* Metadata */}
                <VStack align="start" gap={3} width="100%">
                  {bookMetadata.map(meta => (
                    <MetadataRow key={meta.label} label={meta.label} value={meta.value} />
                  ))}
                </VStack>

                {/* Description */}
                {book.description && (
                  <Box>
                    <Text fontSize="sm" fontWeight="medium" mb={2}>
                      Description
                    </Text>
                    <Text
                      fontSize="sm"
                      color="secondaryText.500"
                      lineHeight="1.6"
                      textAlign="justify"
                    >
                      {book.description}
                    </Text>
                  </Box>
                )}
              </VStack>
            </Grid>

            {/* Book Copies */}
            <Box borderRadius="lg" border="1px solid #e5e7eb !important" mb={6} p={6}>
              <BookItemsTable
                columns={bookItemColumns}
                bookIds={[bookId]}
                searchPlaceholder="Search book copies by code"
                showFilter={false}
                showAddButton={!book.isDeleted}
                addButtonHref={`${ROUTES.DASHBOARD.BOOKS_COPIES_ADD}?bookId=${bookId}`}
                addButtonLabel="Add Book Copy"
                searchByCodeOnly={true}
                showHeader={true}
                headerTitle="Book Copies"
              />
            </Box>

            {/* TODO: Replace with real API calls when available */}
            {/* Borrowing History */}
            <Box borderRadius="lg" border="1px solid #e5e7eb !important">
              <Flex
                justify="space-between"
                align="center"
                p={6}
                borderBottom="1px"
                borderColor="gray.200"
              >
                <Heading size="md">Borrowing History</Heading>
                <HStack gap={2}>
                  <Text fontSize="sm">This Week</Text>
                  <IconButton size="sm" variant="ghost" aria-label="Dropdown">
                    <FaChevronDown />
                  </IconButton>
                </HStack>
              </Flex>
              <Box p={6}>
                <Table
                  columns={borrowingHistoryColumns}
                  data={mockBorrowingHistory}
                  page={1}
                  pageSize={10}
                  total={mockBorrowingHistory.length}
                />
              </Box>
            </Box>
          </Box>

          {/* TODO: Replace with real API calls when available */}
          {/* Right Column - Analytics and Related Books */}
          <Box flex="1">
            {/* Reservations */}
            <Box borderRadius="lg" border="1px solid #e5e7eb !important" mb={6}>
              <Flex
                justify="space-between"
                align="center"
                p={6}
                borderBottom="1px"
                borderColor="gray.200"
              >
                <Heading size="md">Reservations</Heading>
                <HStack gap={2}>
                  <Text fontSize="sm">This Week</Text>
                  <IconButton size="sm" variant="ghost" aria-label="Dropdown">
                    <FaChevronDown />
                  </IconButton>
                </HStack>
              </Flex>
              <Box p={6}>
                <VStack gap={4}>
                  {mockReservations.map((reservation, index) => (
                    <HStack key={reservation.id} gap={3} width="100%">
                      <Badge
                        colorScheme="blue"
                        variant="solid"
                        borderRadius="full"
                        minWidth="24px"
                        height="24px"
                        display="flex"
                        alignItems="center"
                        justifyContent="center"
                      >
                        #{index + 1}
                      </Badge>
                      <Avatar size="sm" src={reservation.avatar} />
                      <VStack align="start" gap={0}>
                        <Text fontSize="sm" fontWeight="medium">
                          {reservation.name}
                        </Text>
                        <Text fontSize="xs" color="secondaryText.500">
                          {reservation.memberId}
                        </Text>
                      </VStack>
                    </HStack>
                  ))}
                </VStack>
              </Box>
            </Box>

            {/* TODO: This will be updated later */}
            {/* Borrowing Trend */}
            <Box borderRadius="lg" mb={6} border="1px solid #e5e7eb !important">
              <Flex
                justify="space-between"
                align="center"
                p={6}
                borderBottom="1px"
                borderColor="gray.200"
              >
                <Heading size="md">Borrowing Trend</Heading>
                <HStack gap={2}>
                  <Text fontSize="sm">Last 8 Months</Text>
                  <IconButton size="sm" variant="ghost" aria-label="Dropdown">
                    <FaChevronDown />
                  </IconButton>
                </HStack>
              </Flex>
            </Box>

            {/* TODO: Replace with real API calls when available */}
            {/* Related Books */}
            <Box borderRadius="lg" border="1px solid #e5e7eb !important">
              <Flex
                justify="space-between"
                align="center"
                p={6}
                borderBottom="1px"
                borderColor="gray.200"
              >
                <Heading size="md">Related Books</Heading>
                <HStack gap={2}>
                  <Text fontSize="sm">This Week</Text>
                  <IconButton size="sm" variant="ghost" aria-label="Dropdown">
                    <FaChevronDown />
                  </IconButton>
                </HStack>
              </Flex>
              <Box p={6}>
                <VStack gap={4}>
                  {mockRelatedBooks.map(book => (
                    <HStack key={book.id} gap={3} width="100%">
                      <Image
                        src={book.coverImage}
                        alt={book.title}
                        width="60px"
                        height="90px"
                        objectFit="cover"
                        borderRadius="md"
                        bg="gray.100"
                      />
                      <VStack align="start" gap={1}>
                        <Text fontSize="sm" fontWeight="medium">
                          {book.title}
                        </Text>
                        <Text fontSize="xs" color="secondaryText.500">
                          by {book.author}
                        </Text>
                      </VStack>
                    </HStack>
                  ))}
                </VStack>
              </Box>
            </Box>
          </Box>
        </HStack>
      </VStack>
    </>
  );
}
