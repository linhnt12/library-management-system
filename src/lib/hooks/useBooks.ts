import { BookApi } from '@/api';
import { Book } from '@/types';
import { useQuery } from '@tanstack/react-query';
import { useAuthors } from './useAuthors';

export function useBooks(params?: {
  page?: number;
  limit?: number;
  search?: string;
  authorIds?: number[];
  type?: string;
  publishYearFrom?: number;
  publishYearTo?: number;
  publishers?: string[];
  status?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  isDeleted?: boolean;
}) {
  return useQuery({
    queryKey: ['books', params],
    queryFn: async (): Promise<{ books: Book[]; pagination: { total: number } }> => {
      return BookApi.getBooks(params);
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

// Lightweight book option for dropdown
export interface BookOption {
  value: string;
  label: string;
  title: string;
  coverImageUrl: string | null;
  authorName: string;
  publishYear: number | null;
}

// Hook to get all books for options
export function useAllBooks() {
  return useQuery({
    queryKey: ['books', 'all'],
    queryFn: async (): Promise<Book[]> => {
      return BookApi.getAllBooks();
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

// Helper function to convert books to lightweight SelectOption format
export function useBookOptions(): BookOption[] {
  const { data: books } = useAllBooks();
  const { data: authors } = useAuthors();

  if (!books || !authors) return [];

  // Create a map for quick author lookup
  const authorMap = new Map(authors.map(author => [author.id, author]));

  return books.map(book => ({
    value: book.id.toString(),
    label: book.title,
    title: book.title,
    coverImageUrl: book.coverImageUrl,
    authorName: authorMap.get(book.authorId)?.fullName || 'Unknown Author',
    publishYear: book.publishYear,
  }));
}
