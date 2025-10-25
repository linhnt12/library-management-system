import { fetchWithAuth, getAccessToken, handleJson } from '@/lib/utils';
import { Book, BookDetail, BookWithAuthor, CreateBookData, UpdateBookData } from '@/types/book';
import {
  BulkDeleteDigitalLicenseResponse,
  CreateDigitalLicenseData,
  DigitalLicense,
  DigitalLicensesListPayload,
  UpdateDigitalLicenseData,
} from '@/types/digital-license';

export class BookApi {
  // Create book
  static async createBook(data: CreateBookData): Promise<Book> {
    const token = getAccessToken();
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (token) headers.Authorization = `Bearer ${token}`;

    const response = await fetchWithAuth('/api/books', {
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
    categoryIds?: number[];
    publishYearFrom?: number;
    publishYearTo?: number;
    status?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
    isDeleted?: boolean;
  }): Promise<{ books: BookWithAuthor[]; pagination: { total: number } }> {
    const searchParams = new URLSearchParams();

    if (params?.page) searchParams.set('page', params.page.toString());
    if (params?.limit) searchParams.set('limit', params.limit.toString());
    if (params?.search) searchParams.set('search', params.search);
    if (params?.authorIds && params.authorIds.length > 0) {
      params.authorIds.forEach(id => searchParams.append('authorIds', id.toString()));
    }
    if (params?.categoryIds && params.categoryIds.length > 0) {
      params.categoryIds.forEach(id => searchParams.append('categoryIds', id.toString()));
    }
    if (params?.publishYearFrom)
      searchParams.set('publishYearFrom', params.publishYearFrom.toString());
    if (params?.publishYearTo) searchParams.set('publishYearTo', params.publishYearTo.toString());
    if (params?.status) searchParams.set('status', params.status);
    if (params?.sortBy) searchParams.set('sortBy', params.sortBy);
    if (params?.sortOrder) searchParams.set('sortOrder', params.sortOrder);
    if (params?.isDeleted !== undefined) searchParams.set('isDeleted', params.isDeleted.toString());

    const token = getAccessToken();
    const headers: Record<string, string> = {};
    if (token) headers.Authorization = `Bearer ${token}`;

    const response = await fetchWithAuth(`/api/books?${searchParams.toString()}`, {
      method: 'GET',
      headers,
    });

    return await handleJson<{ books: BookWithAuthor[]; pagination: { total: number } }>(response);
  }

  // Get book by id
  static async getBookById(id: number): Promise<BookDetail> {
    const token = getAccessToken();
    const headers: Record<string, string> = {};
    if (token) headers.Authorization = `Bearer ${token}`;

    const response = await fetchWithAuth(`/api/books/${id}`, {
      method: 'GET',
      headers,
    });

    return await handleJson<BookDetail>(response);
  }

  // Update book
  static async updateBook(id: number, data: UpdateBookData): Promise<Book> {
    const token = getAccessToken();
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (token) headers.Authorization = `Bearer ${token}`;

    const response = await fetchWithAuth(`/api/books/${id}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify(data),
    });

    return await handleJson<Book>(response);
  }

  // Get all books
  static async getAllBooks(): Promise<Book[]> {
    const token = getAccessToken();
    const headers: Record<string, string> = {};
    if (token) headers.Authorization = `Bearer ${token}`;

    const response = await fetchWithAuth('/api/books/all', {
      method: 'GET',
      headers,
    });

    return await handleJson<Book[]>(response);
  }

  // Delete book (soft delete)
  static async deleteBook(id: number): Promise<void> {
    const token = getAccessToken();
    const headers: Record<string, string> = {};
    if (token) headers.Authorization = `Bearer ${token}`;

    const response = await fetchWithAuth(`/api/books/${id}`, {
      method: 'DELETE',
      headers,
    });

    await handleJson<null>(response);
  }

  // Get digital licenses by book id with pagination
  static async getDigitalLicensesByBookId(
    bookId: number,
    params?: {
      page?: number;
      limit?: number;
      search?: string;
      sortBy?: string;
      sortOrder?: 'asc' | 'desc';
    }
  ): Promise<DigitalLicensesListPayload> {
    const searchParams = new URLSearchParams();

    if (params?.page) searchParams.set('page', params.page.toString());
    if (params?.limit) searchParams.set('limit', params.limit.toString());
    if (params?.search) searchParams.set('search', params.search);
    if (params?.sortBy) searchParams.set('sortBy', params.sortBy);
    if (params?.sortOrder) searchParams.set('sortOrder', params.sortOrder);

    const token = getAccessToken();
    const headers: Record<string, string> = {};
    if (token) headers.Authorization = `Bearer ${token}`;

    const queryString = searchParams.toString();
    const url = `/api/books/${bookId}/digital-licenses${queryString ? `?${queryString}` : ''}`;

    const response = await fetchWithAuth(url, {
      method: 'GET',
      headers,
    });

    return await handleJson<DigitalLicensesListPayload>(response);
  }

  // Create digital license for a book
  static async createDigitalLicense(
    bookId: number,
    data: CreateDigitalLicenseData
  ): Promise<DigitalLicense> {
    const token = getAccessToken();
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (token) headers.Authorization = `Bearer ${token}`;

    const response = await fetchWithAuth(`/api/books/${bookId}/digital-licenses`, {
      method: 'POST',
      headers,
      body: JSON.stringify(data),
    });

    return await handleJson<DigitalLicense>(response);
  }

  // Update digital license for a book
  static async updateDigitalLicense(
    bookId: number,
    data: UpdateDigitalLicenseData
  ): Promise<DigitalLicense> {
    const token = getAccessToken();
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (token) headers.Authorization = `Bearer ${token}`;

    const response = await fetchWithAuth(`/api/books/${bookId}/digital-licenses`, {
      method: 'PATCH',
      headers,
      body: JSON.stringify(data),
    });

    return await handleJson<DigitalLicense>(response);
  }

  // Bulk delete digital licenses (soft delete)
  static async bulkDeleteDigitalLicenses(ids: number[]): Promise<BulkDeleteDigitalLicenseResponse> {
    const token = getAccessToken();
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (token) headers.Authorization = `Bearer ${token}`;

    const response = await fetchWithAuth('/api/digital-licenses/bulk-delete', {
      method: 'DELETE',
      headers,
      body: JSON.stringify({ ids }),
    });

    return await handleJson<BulkDeleteDigitalLicenseResponse>(response);
  }
}
