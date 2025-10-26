import { fetchWithAuth, getAccessToken, handleJson } from '@/lib/utils';
import {
  BulkDeleteDigitalLicenseResponse,
  CreateDigitalLicenseData,
  DigitalLicense,
  DigitalLicensesListPayload,
  UpdateDigitalLicenseData,
} from '@/types/digital-license';

export class DigitalLicenseApi {
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
