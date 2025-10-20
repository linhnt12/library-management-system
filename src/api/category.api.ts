import { handleJson } from '@/lib/utils';
import { Category } from '@/types';

export class CategoryApi {
  // Get categories
  static async getCategories(): Promise<Category[]> {
    const response = await fetch('/api/categories');

    return await handleJson<Category[]>(response);
  }
}
