import { BookType } from '@prisma/client';
import { PaginationResponse } from '@/types/api';

export interface PublicBook {
  id: number;
  authorId: number;
  title: string;
  isbn: string | null;
  publishYear: number | null;
  publisher: string | null;
  pageCount: number | null;
  price: number | null;
  edition: string | null;
  type: BookType;
  description: string | null;
  coverImageUrl: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface BooksListPayload {
  books: PublicBook[];
  pagination: PaginationResponse;
}

export interface CreateBookData {
  authorId: number | string;
  title: string;
  isbn?: string | null;
  publishYear?: number | string | null;
  publisher?: string | null;
  pageCount?: number | string | null;
  price?: number | string | null;
  edition?: string | null;
  type?: BookType;
  description?: string | null;
  coverImageUrl?: string | null;
}

export interface UpdateBookData {
  authorId?: number | string;
  title?: string;
  isbn?: string | null;
  publishYear?: number | string | null;
  publisher?: string | null;
  pageCount?: number | string | null;
  price?: number | string | null;
  edition?: string | null;
  type?: BookType;
  description?: string | null;
  coverImageUrl?: string | null;
}
