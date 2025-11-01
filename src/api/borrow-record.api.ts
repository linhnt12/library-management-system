import { fetchWithAuth, getAccessToken, handleJson } from '@/lib/utils';
import {
  BorrowRecordWithDetails,
  BorrowStatus,
  CreateBorrowRecordData,
  CreateBorrowRecordResponse,
} from '@/types/borrow-record';

export class BorrowRecordApi {
  // Create borrow record
  static async createBorrowRecord(
    data: CreateBorrowRecordData
  ): Promise<CreateBorrowRecordResponse> {
    const token = getAccessToken();
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (token) headers.Authorization = `Bearer ${token}`;

    const response = await fetchWithAuth('/api/borrow-records', {
      method: 'POST',
      headers,
      body: JSON.stringify(data),
    });

    return await handleJson<CreateBorrowRecordResponse>(response);
  }

  // Get all borrow records (Librarian only)
  static async getAllBorrowRecords(params?: {
    page?: number;
    limit?: number;
    status?: BorrowStatus;
    userId?: number;
    search?: string;
  }): Promise<{
    borrowRecords: BorrowRecordWithDetails[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  }> {
    const searchParams = new URLSearchParams();

    if (params?.page) searchParams.set('page', params.page.toString());
    if (params?.limit) searchParams.set('limit', params.limit.toString());
    if (params?.status) searchParams.set('status', params.status);
    if (params?.userId) searchParams.set('userId', params.userId.toString());
    if (params?.search) searchParams.set('search', params.search);

    const token = getAccessToken();
    const headers: Record<string, string> = {};
    if (token) headers.Authorization = `Bearer ${token}`;

    const queryString = searchParams.toString();
    const url = queryString ? `/api/borrow-records/all?${queryString}` : '/api/borrow-records/all';

    const response = await fetchWithAuth(url, {
      method: 'GET',
      headers,
    });

    return await handleJson<{
      borrowRecords: BorrowRecordWithDetails[];
      pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
      };
    }>(response);
  }
}
