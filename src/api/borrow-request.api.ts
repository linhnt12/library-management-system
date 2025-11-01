import { fetchWithAuth, getAccessToken, handleJson } from '@/lib/utils';
import { BorrowRequestResponse, CreateBorrowRequestData } from '@/types/borrow-request';

export const BorrowRequestApi = {
  createBorrowRequest: async (data: CreateBorrowRequestData): Promise<BorrowRequestResponse> => {
    const token = getAccessToken();
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (token) headers.Authorization = `Bearer ${token}`;

    const response = await fetchWithAuth('/api/borrow-requests', {
      method: 'POST',
      headers,
      body: JSON.stringify(data),
    });

    return await handleJson<BorrowRequestResponse>(response);
  },
};
