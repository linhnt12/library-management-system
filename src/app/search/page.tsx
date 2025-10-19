'use client';

import { BookCard, Button, FormSelect } from '@/components';
import { useBooks } from '@/lib/hooks';
import { Box, Stack, Text } from '@chakra-ui/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useMemo, useState } from 'react';
import { FiFilter } from 'react-icons/fi';

function SearchContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const searchQuery = searchParams.get('q') || '';
  const [sortBy, setSortBy] = useState(searchParams.get('sortBy') || 'newest');

  const { data } = useBooks({
    search: searchQuery,
    sortBy: sortBy === 'newest' ? 'createdAt' : 'title',
    sortOrder: sortBy === 'newest' ? 'desc' : 'asc',
    limit: 50,
  });

  const books = useMemo(() => {
    if (!data?.books) return [];

    return data.books.map(book => ({
      id: book.id.toString(),
      title: book.title,
      isbn: book.isbn || '',
      author: book.author.fullName,
      year: book.publishYear || 0,
      edition: book.edition || undefined,
      rating: 4.5, // Mock rating
      categories: book.publisher ? [book.publisher] : ['General'], // Mock
      coverImage: book.coverImageUrl || '',
      availability: {
        hardCopy: true, // Mock availability
        eBook: false,
        audioBook: false,
      },
      isFavorite: false, // Mock favorite status
    }));
  }, [data?.books]);

  const handleSortChange = (value: string) => {
    setSortBy(value);
    // Update URL using Next.js router
    const params = new URLSearchParams(searchParams.toString());
    params.set('sortBy', value);
    router.push(`/search?${params.toString()}`);
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
          onClick={() => {}}
        />
        <Box display="flex" gap={2} alignItems="center">
          <Text fontSize="sm" w="80px">
            Sort by:
          </Text>
          <FormSelect
            items={[
              { label: 'Newest', value: 'newest' },
              { label: 'Oldest', value: 'oldest' },
            ]}
            fontSize="sm"
            value={sortBy}
            bg="white"
            onChange={handleSortChange}
          />
        </Box>
      </Box>

      {/* Search Results Info */}
      <Box mt={4}>
        <Text fontSize="sm" color="secondaryText.500">
          {searchQuery
            ? `Search results for "${searchQuery}": ${books.length} books`
            : `All books: ${books.length} books`}
        </Text>
      </Box>

      <Stack gap={6} mt={4}>
        {books.map(book => (
          <BookCard key={book.id} book={book} />
        ))}
      </Stack>
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
