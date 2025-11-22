'use client';

import { BookSection, type BookHorizontalCardData } from '@/components/books';
import { ROUTES } from '@/constants';
import { useBooks } from '@/lib/hooks/useBooks';
import { useCategories } from '@/lib/hooks/useCategories';
import { Category } from '@/types';
import { Box, Container, Spinner, Text, VStack } from '@chakra-ui/react';
import { useRouter } from 'next/navigation';
import { useMemo } from 'react';

// Mock data for recommended books
const mockRecommendedBooks: BookHorizontalCardData[] = [
  {
    id: '1',
    title: "Don't Make Me Think",
    author: 'Steve Krug',
    year: 2000,
    rating: 4.5,
    coverImage: 'https://via.placeholder.com/180x240/ffffff/000000?text=Don%27t+Make+Me+Think',
  },
  {
    id: '2',
    title: 'The Design of Everyday Things',
    author: 'Don Norman',
    year: 1988,
    rating: 4.5,
    coverImage: 'https://via.placeholder.com/180x240/ffff00/000000?text=Design+of+Everyday',
  },
  {
    id: '3',
    title: 'Sprint: How to Solve Big Problems and Test New Ideas in Just Five Days',
    author: 'Jake Knapp',
    year: 2016,
    rating: 4.5,
    coverImage: 'https://via.placeholder.com/180x240/00bcd4/ffffff?text=Sprint',
  },
  {
    id: '4',
    title: 'Lean UX: Designing Great Products with Agile Teams',
    author: 'Jeff Gothelf',
    year: 2016,
    rating: 4.5,
    coverImage: 'https://via.placeholder.com/180x240/ffffff/0066cc?text=Lean+UX',
  },
  {
    id: '5',
    title: 'The Road to React',
    author: 'Robin Wieruch',
    year: 2017,
    rating: 4.5,
    coverImage: 'https://via.placeholder.com/180x240/000000/ffffff?text=React',
  },
  {
    id: '6',
    title: 'Rich Dad Poor Dad',
    author: 'Robert T. Kiyosaki',
    year: 1997,
    rating: 5.0,
    coverImage: 'https://via.placeholder.com/180x240/9c27b0/ffff00?text=Rich+Dad',
  },
  {
    id: '7',
    title: "Harry Potter and the Philosopher's Stone",
    author: 'J.K. Rowling',
    year: 2002,
    rating: 4.9,
    coverImage: 'https://via.placeholder.com/180x240/ff5722/ffffff?text=Harry+Potter',
  },
  {
    id: '8',
    title: "You Don't Know JS: Scope & Closures",
    author: 'Kyle Simpson',
    year: 2014,
    rating: 4.9,
    coverImage: 'https://via.placeholder.com/180x240/ffeb3b/000000?text=You+Don%27t+Know+JS',
  },
];

// Target categories to display on homepage
const TARGET_CATEGORY_NAMES = [
  'agriculture',
  'education',
  'computers',
  'technology',
  'program',
  'science',
  'engineering',
];

// Helper function to map BookWithAuthor to BookHorizontalCardData
function mapBookToCardData(book: {
  id: number;
  title: string;
  author: { fullName: string };
  publishYear: number | null;
  coverImageUrl: string | null;
  averageRating?: number;
}): BookHorizontalCardData {
  return {
    id: book.id.toString(),
    title: book.title,
    author: book.author.fullName,
    year: book.publishYear || 0,
    rating: book.averageRating || 0,
    coverImage: book.coverImageUrl || '',
  };
}

// Component to display books by category
function CategoryBookSection({
  category,
  onBookClick,
}: {
  category: Category;
  onBookClick: (bookId: string) => void;
}) {
  const { data, isLoading } = useBooks({
    categoryIds: [category.id],
    limit: 12,
    isDeleted: false,
  });

  const books = useMemo(() => {
    if (!data?.books) return [];
    return data.books.map(mapBookToCardData);
  }, [data]);

  // Display book section
  return (
    <BookSection
      title={category.name}
      showAllLink={`${ROUTES.SEARCH}?category=${encodeURIComponent(category.name.toLowerCase())}`}
      books={isLoading ? [] : books}
      onBookClick={onBookClick}
    />
  );
}

export default function Home() {
  const router = useRouter();
  const { data: categories, isLoading: categoriesLoading } = useCategories();

  // Get specific categories: computer, technology, program, science, engineering
  const topCategories = useMemo(() => {
    if (!categories || categories.length === 0) return [];

    // Filter categories by exact name match (case-insensitive)
    const filtered = categories.filter(category =>
      TARGET_CATEGORY_NAMES.some(name => category.name.toLowerCase() === name.toLowerCase())
    );

    // Sort to maintain order: computer, technology, program, science, engineering
    return filtered.sort((a, b) => {
      const aIndex = TARGET_CATEGORY_NAMES.findIndex(
        name => a.name.toLowerCase() === name.toLowerCase()
      );
      const bIndex = TARGET_CATEGORY_NAMES.findIndex(
        name => b.name.toLowerCase() === name.toLowerCase()
      );
      return aIndex - bIndex;
    });
  }, [categories]);

  const handleBookClick = (bookId: string) => {
    router.push(ROUTES.BOOK_DETAIL.replace(':id', bookId));
  };

  if (categoriesLoading) {
    return (
      <Box minH="100vh" py={8} display="flex" justifyContent="center" alignItems="center">
        <Spinner size="xl" />
      </Box>
    );
  }

  return (
    <Box minH="100vh" py={8}>
      <Container px={0}>
        <VStack align="stretch" gap={8} w="100%">
          {/* Recommended Section */}
          <BookSection
            title="Recommended for You"
            showAllLink={ROUTES.SEARCH}
            books={mockRecommendedBooks}
            onBookClick={handleBookClick}
          />

          {/* Category Sections */}
          {topCategories.map(category => (
            <CategoryBookSection
              key={category.id}
              category={category}
              onBookClick={handleBookClick}
            />
          ))}

          {/* Display message if no categories */}
          {topCategories.length === 0 && (
            <Text fontSize="md" color="secondaryText.500" textAlign="center" py={8}>
              No book categories available
            </Text>
          )}
        </VStack>
      </Container>
    </Box>
  );
}
