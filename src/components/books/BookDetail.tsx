'use client';

import {
  Avatar,
  BookEditionsTable,
  BookItemDetailColumns,
  BookItemsTable,
  BookReview,
  BorrowRequestForm,
  Button,
  Dialog,
  IconButton,
  Table,
  Tag,
} from '@/components';
import { ROUTES } from '@/constants';
import { useBorrowRequestForm, useMe, useReviewStats } from '@/lib/hooks';
import { BookDetail as BookDetailType } from '@/types';
import { Badge, Box, Flex, Grid, Heading, HStack, Image, Text, VStack } from '@chakra-ui/react';
import { FaChevronDown } from 'react-icons/fa';
import { LuBookCheck, LuHeart, LuHeartOff, LuPencil } from 'react-icons/lu';

// Mock data for reservations and related books
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

const mockBorrowingHistory: BorrowingHistoryItem[] = [
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

import { BorrowType } from '@/components/borrow-requests/BorrowRequestForm';

interface BookDetailProps {
  book: BookDetailType;
  onEditClick?: () => void;
  onAddBookCopyClick?: () => void;
  onBorrowClick?: () => void;
  onCreateBorrowRequest?: (data: {
    userId: number;
    bookId: number;
    startDate: string;
    endDate: string;
    borrowType: BorrowType;
  }) => Promise<void>;
  onAddToFavoriteClick?: () => void;
  onRemoveFromFavoriteClick?: () => void;
  isFavorite?: boolean;
  hasEbook?: boolean;
}

export function BookDetail({
  book,
  onEditClick,
  onAddBookCopyClick,
  onBorrowClick,
  onCreateBorrowRequest,
  onAddToFavoriteClick,
  onRemoveFromFavoriteClick,
  isFavorite = false,
  hasEbook = false,
}: BookDetailProps) {
  // Get current user info
  const { data: user } = useMe();

  // Get review stats for the book
  const { data: reviewStats } = useReviewStats(book.id);

  // Borrow request form hook
  const {
    form: borrowForm,
    errors: borrowErrors,
    setField: setBorrowField,
    dialog: borrowDialog,
    closeDialog: closeBorrowDialog,
    openBorrowDialog,
  } = useBorrowRequestForm({
    bookId: book.id,
    user: user ? { id: user.id, fullName: user.fullName } : null,
    hasEbook,
    onCreateBorrowRequest,
  });

  // Determine what to show based on user role
  const isAdminOrLibrarian = user?.role === 'ADMIN' || user?.role === 'LIBRARIAN';
  const isReader = user?.role === 'READER' || !user;

  // Get book item columns for detail view
  const bookItemColumns = BookItemDetailColumns();

  const bookStats = [
    {
      label: 'Rating',
      value:
        reviewStats?.totalReviews && reviewStats.totalReviews > 0
          ? `${reviewStats.averageRating.toFixed(1)} / 5`
          : 'No ratings yet',
    },
    { label: 'Total Pages', value: book?.pageCount ? `${book.pageCount} pages` : 'N/A' },
    { label: 'Price', value: book?.price ? `$${book.price}` : 'N/A' },
  ];

  const bookMetadata = [
    { label: 'Book ID', value: book?.id || 'N/A' },
    { label: 'ISBN', value: book?.isbn || 'N/A' },
    { label: 'Publisher', value: book?.publisher || 'N/A' },
    { label: 'Publish Year', value: book?.publishYear || 'N/A' },
    { label: 'Edition', value: book?.edition || 'N/A' },
  ];

  return (
    <VStack gap={6} p={4} align="stretch">
      {/* Book Image and Details */}
      <HStack align="stretch" gap={8}>
        <Box flex="5">
          <Grid templateColumns={{ base: '1fr', lg: '2fr 3fr' }} gap={8} mb={6}>
            {/* Book Cover */}
            <Image
              src={book.coverImageUrl ?? ''}
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
                gap={2}
              >
                {isAdminOrLibrarian && (
                  <Tag variantType={book.isDeleted ? 'inactive' : 'active'}>
                    {book.isDeleted ? 'Inactive' : 'Active'}
                  </Tag>
                )}
                {isReader &&
                  !book.isDeleted &&
                  (isFavorite ? onRemoveFromFavoriteClick : onAddToFavoriteClick) && (
                    <Button
                      label={isFavorite ? 'Remove from Favorites' : 'Add to Favorites'}
                      variantType="primaryOutline"
                      onClick={isFavorite ? onRemoveFromFavoriteClick : onAddToFavoriteClick}
                      height="40px"
                      fontSize="sm"
                      p={2}
                      icon={isFavorite ? LuHeartOff : LuHeart}
                    />
                  )}
                {isAdminOrLibrarian && onEditClick && (
                  <IconButton aria-label="Edit book" onClick={onEditClick}>
                    <LuPencil />
                  </IconButton>
                )}
                {isReader && (onBorrowClick || onCreateBorrowRequest) && !book.isDeleted && (
                  <Button
                    label="Borrow Now"
                    variantType="primary"
                    onClick={onCreateBorrowRequest ? openBorrowDialog : onBorrowClick}
                    height="40px"
                    fontSize="sm"
                    p={2}
                    icon={LuBookCheck}
                  />
                )}
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
                templateColumns={{ base: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' }}
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
          <Box borderRadius="lg" border="1px solid #e5e7eb !important" mt={10} p={6}>
            <BookItemsTable
              columns={bookItemColumns}
              bookIds={[book.id]}
              searchPlaceholder="Search book copies by code"
              showFilter={false}
              showAddButton={!book.isDeleted && !!onAddBookCopyClick}
              addButtonHref={
                onAddBookCopyClick
                  ? `${ROUTES.DASHBOARD.BOOKS_COPIES_ADD}?bookId=${book.id}`
                  : ROUTES.DASHBOARD.BOOKS_COPIES_ADD
              }
              addButtonLabel="Add Book Copy"
              searchByCodeOnly={true}
              showHeader={true}
              headerTitle="Book Copies"
              maxHeight="400px"
            />
          </Box>

          {/* Book Editions */}
          {isAdminOrLibrarian && (
            <Box borderRadius="lg" border="1px solid #e5e7eb !important" mt={6} p={6}>
              <BookEditionsTable
                bookId={book.id}
                searchPlaceholder="Search by ISBN, ID, or status..."
                showFilter={false}
                showAddButton={!book.isDeleted}
                addButtonHref={`${ROUTES.DASHBOARD.BOOKS_EDITIONS_ADD}?bookId=${book.id}`}
                addButtonLabel="Add Edition"
                showHeader={true}
                headerTitle="Book Editions"
                maxHeight="400px"
                showBookName={false}
                showId={false}
              />
            </Box>
          )}

          {/* Borrowing History */}
          {isAdminOrLibrarian && (
            <Box borderRadius="lg" border="1px solid #e5e7eb !important" mt={6}>
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
          )}

          {/* Book Reviews */}
          <BookReview bookId={book.id} isReader={isReader} user={user} />

          {/* Borrow Request Dialog */}
          {borrowDialog.isOpen && onCreateBorrowRequest && (
            <Dialog
              isOpen={borrowDialog.isOpen}
              onClose={closeBorrowDialog}
              title={borrowDialog.title || 'Borrow Book'}
              content={
                <BorrowRequestForm
                  startDate={borrowForm.startDate}
                  endDate={borrowForm.endDate}
                  borrowType={borrowForm.borrowType}
                  hasEbook={hasEbook}
                  onStartDateChange={date => setBorrowField('startDate', date)}
                  onEndDateChange={date => setBorrowField('endDate', date)}
                  onBorrowTypeChange={type => setBorrowField('borrowType', type)}
                  startDateError={borrowErrors.startDate}
                  endDateError={borrowErrors.endDate}
                />
              }
              buttons={[
                {
                  label: borrowDialog.cancelText || 'Cancel',
                  variant: 'secondary',
                  onClick: closeBorrowDialog,
                },
                {
                  label: borrowDialog.confirmText || 'Confirm',
                  variant: 'primary',
                  onClick: borrowDialog.onConfirm || (() => {}),
                },
              ]}
            />
          )}
        </Box>

        {/* Right Column - Analytics and Related Books */}
        <Box flex="2">
          {/* Reservations */}
          {isAdminOrLibrarian && (
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
          )}

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
  );
}
