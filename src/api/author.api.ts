import { fetchWithAuth, handleJson } from '@/lib/utils';
import { Author } from '@/types';

export class AuthorApi {
  // Get authors
  static async getAuthors(): Promise<Author[]> {
    const response = await fetchWithAuth('/api/authors');
    return await handleJson<Author[]>(response);
  }
}
