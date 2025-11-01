import { fetchWithAuth, getAccessToken, handleJson } from '@/lib/utils';
import { CreateBorrowRecordData, CreateBorrowRecordResponse } from '@/types/borrow-record';

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
}
