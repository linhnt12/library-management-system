'use client';

import { BookApi, FavoriteBookApi } from '@/api';
import { BookDetail, toaster } from '@/components';
import { BookDetail as BookDetailType } from '@/types';
import { Box } from '@chakra-ui/react';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function PublicBookPage() {
  const params = useParams();
  const router = useRouter();
  const bookId = Number(params.id);
  const [book, setBook] = useState<BookDetailType | null>(null);

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

  const handleAddToFavorite = async () => {
    try {
      await FavoriteBookApi.createFavoriteBook({ bookId });

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

  if (!book) {
    return null;
  }

  return (
    <Box bg="white" rounded="lg" p={4}>
      <BookDetail
        book={book}
        onBorrowClick={() => {
          // TODO: Implement borrow functionality
          console.log('Borrow book:', book.id);
        }}
        onAddToFavouriteClick={handleAddToFavorite}
      />
    </Box>
  );
}
