'use client';

import { FavoriteBookApi } from '@/api';
import {
  BookCard,
  BookFilterDialog,
  Button,
  FormSelect,
  PaginationControls,
  toaster,
} from '@/components';
import { BOOK_SORT_OPTIONS } from '@/constants';
import { useBookFilters, useBooks } from '@/lib/hooks';
import { FavoriteBooksListPayload } from '@/types';
import { Box, Stack, Text } from '@chakra-ui/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useMemo, useState } from 'react';
import { FiFilter } from 'react-icons/fi';

function SearchContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const searchQuery = searchParams.get('q') || '';
  const [sortBy, setSortBy] = useState(searchParams.get('sortBy') || 'newest');
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [favoriteBooks, setFavoriteBooks] = useState<FavoriteBooksListPayload | null>(null);

  const {
    isFilterDialogOpen,
    openFilterDialog,
    closeFilterDialog,
    filterState,
    updateFilterState,
    appliedFilters,
    applyFilters,
    clearFilters,
  } = useBookFilters();

  const getSortParams = (sortValue: string) => {
    const sortMapping: Record<string, { sortBy: string; sortOrder: 'asc' | 'desc' }> = {
      newest: { sortBy: 'createdAt', sortOrder: 'desc' },
      oldest: { sortBy: 'createdAt', sortOrder: 'asc' },
      'title-asc': { sortBy: 'title', sortOrder: 'asc' },
      'title-desc': { sortBy: 'title', sortOrder: 'desc' },
      'year-newest': { sortBy: 'publishYear', sortOrder: 'desc' },
      'year-oldest': { sortBy: 'publishYear', sortOrder: 'asc' },
    };

    return sortMapping[sortValue] || sortMapping['newest'];
  };

  const { sortBy: apiSortBy, sortOrder } = getSortParams(sortBy);

  const { data } = useBooks({
    search: searchQuery,
    sortBy: apiSortBy,
    sortOrder,
    page,
    limit: pageSize,
    authorIds: appliedFilters.authorIds,
    categoryIds: appliedFilters.categoryIds,
    publishYearFrom: appliedFilters.publishYearFrom,
    publishYearTo: appliedFilters.publishYearTo,
    status: appliedFilters.status,
    isDeleted: false,
  });

  // Fetch user's favorite books
  useEffect(() => {
    const fetchFavorites = async () => {
      try {
        const favorites = await FavoriteBookApi.getFavoriteBooks({ limit: 1000 });
        setFavoriteBooks(favorites);
      } catch (err) {
        // Silently fail - user might not be logged in or have no favorites
        console.log('Could not fetch favorites:', err);
      }
    };

    fetchFavorites();
  }, []);

  const books = useMemo(() => {
    if (!data?.books) return [];

    // Create a Set of favorite book IDs for quick lookup
    const favoriteBookIds = new Set(favoriteBooks?.favoriteBooks?.map(fav => fav.bookId) || []);

    return data.books.map(book => ({
      id: book.id.toString(),
      title: book.title,
      isbn: book.isbn || '',
      author: book.author.fullName,
      year: book.publishYear || 0,
      edition: book.edition || undefined,
      rating: book.averageRating || 0,
      categories: book.categories && book.categories.length > 0 ? book.categories : ['General'],
      coverImage: book.coverImageUrl || '',
      availability: {
        hardCopy: (book.bookItemsCount ?? 0) > 0,
        eBook: (book.bookEbookCount ?? 0) > 0,
        audioBook: (book.bookAudioCount ?? 0) > 0,
      },
      isFavorite: favoriteBookIds.has(book.id),
    }));
  }, [data?.books, favoriteBooks]);

  useEffect(() => {
    setPage(1);
  }, [searchQuery, sortBy, appliedFilters]);

  const totalCount = data?.pagination?.total ?? books.length;

  const handleSortChange = (value: string) => {
    setSortBy(value);
    const params = new URLSearchParams(searchParams.toString());
    params.set('sortBy', value);
    router.push(`/search?${params.toString()}`);
  };

  // Handle filter actions
  const handleApplyFilter = () => {
    setPage(1);
    applyFilters();
  };

  const handleClearFilter = () => {
    setPage(1);
    clearFilters();
  };

  // Handle toggle favorite
  const handleToggleFavorite = async (bookId: string) => {
    try {
      await FavoriteBookApi.createFavoriteBook({ bookId: Number(bookId) });

      // Refetch favorites to update the UI
      const favorites = await FavoriteBookApi.getFavoriteBooks({ limit: 1000 });
      setFavoriteBooks(favorites);

      toaster.create({
        title: 'Success',
        description: 'Book added to favorites',
        type: 'success',
      });
    } catch (err) {
      console.error('Error adding favorite:', err);
      toaster.create({
        title: 'Error',
        description: err instanceof Error ? err.message : 'Failed to add book to favorites',
        type: 'error',
      });
    }
  };

  return (
    <Box>
      <Box display="flex" gap={4} justifyContent="space-between" alignItems="center">
        <Button
          label="Filter"
          variantType="ghost"
          w="auto"
          h="40px"
          px={2}
          fontSize="sm"
          icon={FiFilter}
          onClick={openFilterDialog}
        />
        <Box display="flex" alignItems="center">
          <Text fontSize="sm" w="80px">
            Sort by:
          </Text>
          <FormSelect
            items={BOOK_SORT_OPTIONS}
            fontSize="sm"
            value={sortBy}
            bg="white"
            onChange={handleSortChange}
            width="150px"
          />
        </Box>
      </Box>

      {/* Search Results Info */}
      <Box mt={4}>
        <Text fontSize="sm" color="secondaryText.500">
          {searchQuery
            ? `Search results for "${searchQuery}": ${totalCount} books`
            : `All books: ${totalCount} books`}
        </Text>
      </Box>

      <Stack gap={6} mt={4}>
        {books.map(book => (
          <BookCard key={book.id} book={book} onToggleFavorite={handleToggleFavorite} />
        ))}
      </Stack>

      <Box mt={6} display="flex" justifyContent="center">
        <PaginationControls
          page={page}
          pageSize={pageSize}
          total={totalCount}
          onPageChange={setPage}
        />
      </Box>

      {/* Filter Dialog */}
      <BookFilterDialog
        isOpen={isFilterDialogOpen}
        onClose={closeFilterDialog}
        onApply={handleApplyFilter}
        onClear={handleClearFilter}
        filterState={filterState}
        onFilterStateChange={updateFilterState}
      />
    </Box>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SearchContent />
    </Suspense>
  );
}
