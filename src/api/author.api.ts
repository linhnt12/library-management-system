import { Author } from '@/types';

export class AuthorApi {
  // Get authors
  static async getAuthors(): Promise<Author[]> {
    const response = await fetch('/api/authors');
    const json = await response.json();

    if (!response.ok || json.success === false) {
      const error = json?.error || json?.message || 'Failed to fetch authors';
      throw new Error(error);
    }

    return json;
  }
}
