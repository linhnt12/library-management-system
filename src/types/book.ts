import { PaginationResponse } from '@/types/api';

export interface Book {
  id: number;
  authorId: number;
  title: string;
  isbn: string | null;
  publishYear: number | null;
  publisher: string | null;
  pageCount: number | null;
  price: number | null;
  edition: string | null;
  description: string | null;
  coverImageUrl: string | null;
  createdAt: Date;
  updatedAt: Date;
  isDeleted: boolean;
}

export interface BookWithAuthor extends Book {
  author: {
    id: number;
    fullName: string;
  };
  categories?: string[];
  bookItemsCount?: number;
  bookEbookCount?: number;
  bookAudioCount?: number;
  averageRating?: number;
}

export interface BookDetail extends BookWithAuthor {
  bookItems: {
    id: number;
    code: string;
    condition: string;
    status: string;
    acquisitionDate: Date | null;
    createdAt: Date;
    updatedAt: Date;
    isDeleted: boolean;
  }[];
  bookCategories: {
    categoryId: number;
  }[];
}

export interface BooksListPayload {
  books: BookWithAuthor[];
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
  description?: string | null;
  coverImageUrl?: string | null;
  isDeleted?: boolean;
  categories?: number[];
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
  description?: string | null;
  coverImageUrl?: string | null;
  isDeleted?: boolean;
  categories?: number[];
}
