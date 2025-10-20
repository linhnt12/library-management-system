import { handleJson } from '@/lib/utils';
import { Author } from '@/types';

export class AuthorApi {
  // Get authors
  static async getAuthors(): Promise<Author[]> {
    const response = await fetch('/api/authors');
    return await handleJson<Author[]>(response);
  }
}
