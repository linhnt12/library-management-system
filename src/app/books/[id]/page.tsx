'use client';

import { BookApi, FavoriteBookApi } from '@/api';
import { BookDetail, toaster } from '@/components';
import { useCreateBorrowRequest } from '@/lib/hooks';
import { BookDetail as BookDetailType } from '@/types';
import { Box } from '@chakra-ui/react';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function PublicBookPage() {
  const params = useParams();
  const router = useRouter();
  const bookId = Number(params.id);
  const [book, setBook] = useState<BookDetailType | null>(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const createBorrowRequestMutation = useCreateBorrowRequest();

  // Fetch book data
  useEffect(() => {
    const fetchBook = async () => {
      if (!bookId || bookId <= 0) {
        router.push('/');
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
        router.push('/');
      }
    };

    fetchBook();
  }, [bookId, router]);

  // Fetch favorite status
  useEffect(() => {
    const checkFavorite = async () => {
      try {
        const isFav = await FavoriteBookApi.checkFavoriteBook(bookId);
        setIsFavorite(isFav);
      } catch (error) {
        console.error('Error checking favorite:', error);
        setIsFavorite(false);
      }
    };

    if (bookId) {
      checkFavorite();
    }
  }, [bookId]);

  const handleAddToFavorite = async () => {
    try {
      await FavoriteBookApi.createFavoriteBook({ bookId });

      setIsFavorite(true);
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

  const handleRemoveFromFavorite = async () => {
    try {
      await FavoriteBookApi.deleteFavoriteBook({ bookId });

      setIsFavorite(false);
      toaster.create({
        title: 'Success',
        description: 'Book removed from favorites',
        type: 'success',
      });
    } catch (err) {
      console.error('Error removing favorite:', err);
      toaster.create({
        title: 'Error',
        description: err instanceof Error ? err.message : 'Failed to remove book from favorites',
        type: 'error',
      });
    }
  };

  if (!book) {
    return null;
  }

  const handleCreateBorrowRequest = async (data: {
    userId: number;
    bookId: number;
    startDate: string;
    endDate: string;
  }) => {
    // Transform data to match API format
    // Quantity is always 1 (one copy per user)
    await createBorrowRequestMutation.mutateAsync({
      userId: data.userId,
      startDate: data.startDate,
      endDate: data.endDate,
      items: [
        {
          bookId: data.bookId,
          quantity: 1,
          startDate: data.startDate,
          endDate: data.endDate,
        },
      ],
    });
  };

  return (
    <Box bg="white" rounded="lg" p={4}>
      <BookDetail
        book={book}
        onCreateBorrowRequest={handleCreateBorrowRequest}
        onAddToFavoriteClick={handleAddToFavorite}
        onRemoveFromFavoriteClick={handleRemoveFromFavorite}
        isFavorite={isFavorite}
      />
    </Box>
  );
}
