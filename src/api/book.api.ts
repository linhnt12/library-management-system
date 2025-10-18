import { getAccessToken, handleJson } from '@/lib/utils';
import { Book, CreateBookData } from '@/types/book';

export class BookApi {
  // Create book
  static async createBook(data: CreateBookData): Promise<Book> {
    const token = getAccessToken();
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (token) headers.Authorization = `Bearer ${token}`;

    const response = await fetch('/api/books', {
      method: 'POST',
      headers,
      body: JSON.stringify(data),
    });

    return await handleJson<Book>(response);
  }

  // Get books
  static async getBooks(params?: {
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
  }): Promise<{ books: Book[]; pagination: { total: number } }> {
    const searchParams = new URLSearchParams();

    if (params?.page) searchParams.set('page', params.page.toString());
    if (params?.limit) searchParams.set('limit', params.limit.toString());
    if (params?.search) searchParams.set('search', params.search);
    if (params?.authorIds && params.authorIds.length > 0) {
      params.authorIds.forEach(id => searchParams.append('authorIds', id.toString()));
    }
    if (params?.type) searchParams.set('type', params.type);
    if (params?.publishYearFrom)
      searchParams.set('publishYearFrom', params.publishYearFrom.toString());
    if (params?.publishYearTo) searchParams.set('publishYearTo', params.publishYearTo.toString());
    if (params?.publishers && params.publishers.length > 0) {
      params.publishers.forEach(publisher => searchParams.append('publishers', publisher));
    }
    if (params?.status) searchParams.set('status', params.status);
    if (params?.sortBy) searchParams.set('sortBy', params.sortBy);
    if (params?.sortOrder) searchParams.set('sortOrder', params.sortOrder);

    const token = getAccessToken();
    const headers: Record<string, string> = {};
    if (token) headers.Authorization = `Bearer ${token}`;

    const response = await fetch(`/api/books?${searchParams.toString()}`, {
      method: 'GET',
      headers,
    });

    return await handleJson<{ books: Book[]; pagination: { total: number } }>(response);
  }

  // Get book by id
  static async getBookById(id: number): Promise<Book> {
    const token = getAccessToken();
    const headers: Record<string, string> = {};
    if (token) headers.Authorization = `Bearer ${token}`;

    const response = await fetch(`/api/books/${id}`, {
      method: 'GET',
      headers,
    });

    return await handleJson<Book>(response);
  }

  // Update book
  static async updateBook(id: number, data: Partial<CreateBookData>): Promise<Book> {
    const token = getAccessToken();
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (token) headers.Authorization = `Bearer ${token}`;

    const response = await fetch(`/api/books/${id}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify(data),
    });

    return await handleJson<Book>(response);
  }

  // Delete book (soft delete)
  static async deleteBook(id: number): Promise<void> {
    const token = getAccessToken();
    const headers: Record<string, string> = {};
    if (token) headers.Authorization = `Bearer ${token}`;

    const response = await fetch(`/api/books/${id}`, {
      method: 'DELETE',
      headers,
    });

    await handleJson<null>(response);
  }
}
