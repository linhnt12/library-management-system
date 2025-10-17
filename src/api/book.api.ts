import { CreateBookData, Book } from '@/types/book';

export class BookService {
  // Create book
  static async createBook(data: CreateBookData): Promise<Book> {
    const response = await fetch('/api/books', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    const json = await response.json();

    if (!response.ok || json.success === false) {
      const error = json?.error || json?.message || 'Failed to create book';
      throw new Error(error);
    }

    return json.data;
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
  }) {
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

    const response = await fetch(`/api/books?${searchParams.toString()}`);
    const json = await response.json();

    if (!response.ok || json.success === false) {
      const error = json?.error || json?.message || 'Failed to fetch books';
      throw new Error(error);
    }

    return json.data;
  }

  // Get book by id
  static async getBookById(id: number): Promise<Book> {
    const response = await fetch(`/api/books/${id}`);
    const json = await response.json();

    if (!response.ok || json.success === false) {
      const error = json?.error || json?.message || 'Failed to fetch book';
      throw new Error(error);
    }

    return json.data;
  }

  // Update book
  static async updateBook(id: number, data: Partial<CreateBookData>): Promise<Book> {
    const response = await fetch(`/api/books/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    const json = await response.json();

    if (!response.ok || json.success === false) {
      const error = json?.error || json?.message || 'Failed to update book';
      throw new Error(error);
    }

    return json.data;
  }

  // Delete book (soft delete)
  static async deleteBook(id: number): Promise<void> {
    const response = await fetch(`/api/books/${id}`, {
      method: 'DELETE',
    });

    const json = await response.json();

    if (!response.ok || json.success === false) {
      const error = json?.error || json?.message || 'Failed to delete book';
      throw new Error(error);
    }
  }
}
