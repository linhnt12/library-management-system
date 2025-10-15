import { CreateBookData, PublicBook } from '@/types/book';

export class BookService {
  // Create book
  static async createBook(data: CreateBookData): Promise<PublicBook> {
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
    authorId?: number;
    type?: string;
    publishYear?: number;
  }) {
    const searchParams = new URLSearchParams();

    if (params?.page) searchParams.set('page', params.page.toString());
    if (params?.limit) searchParams.set('limit', params.limit.toString());
    if (params?.search) searchParams.set('search', params.search);
    if (params?.authorId) searchParams.set('authorId', params.authorId.toString());
    if (params?.type) searchParams.set('type', params.type);
    if (params?.publishYear) searchParams.set('publishYear', params.publishYear.toString());

    const response = await fetch(`/api/books?${searchParams.toString()}`);
    const json = await response.json();

    if (!response.ok || json.success === false) {
      const error = json?.error || json?.message || 'Failed to fetch books';
      throw new Error(error);
    }

    return json.data;
  }

  // Get book by id
  static async getBookById(id: number): Promise<PublicBook> {
    const response = await fetch(`/api/books/${id}`);
    const json = await response.json();

    if (!response.ok || json.success === false) {
      const error = json?.error || json?.message || 'Failed to fetch book';
      throw new Error(error);
    }

    return json.data;
  }

  // Update book
  static async updateBook(id: number, data: Partial<CreateBookData>): Promise<PublicBook> {
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
