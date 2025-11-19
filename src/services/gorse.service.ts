/**
 * Gorse API Service
 *
 * Service for interacting with Gorse Recommender System API.
 * Gorse API runs on port 8080 (configurable via environment variables).
 *
 * API Documentation: https://gorse.io/docs/master/api/user.html
 */

import 'dotenv/config';

// Gorse API configuration
const GORSE_API_HOST = process.env.GORSE_API_HOST || 'localhost';
const GORSE_API_PORT = process.env.GORSE_API_PORT || '8088';
const GORSE_API_URL = process.env.GORSE_API_URL || `http://${GORSE_API_HOST}:${GORSE_API_PORT}`;
const GORSE_API_KEY = process.env.GORSE_SERVER_API_KEY || '';

/**
 * Gorse User interface
 */
export interface GorseUser {
  UserId: string;
  Labels?: string[];
  Subscribe?: string[];
  Comment?: string;
}

/**
 * Gorse User creation/update payload
 */
export interface GorseUserPayload {
  UserId: string;
  Labels?: string[];
  Subscribe?: string[];
  Comment?: string;
}

/**
 * Gorse API response wrapper
 */
interface GorseApiResponse<T = unknown> {
  RowAffected?: number;
  data?: T;
}

/**
 * Fetch helper for Gorse API
 */
async function gorseFetch<T = unknown>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${GORSE_API_URL}${endpoint}`;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  // Add API key if configured
  if (GORSE_API_KEY) {
    headers['X-API-Key'] = GORSE_API_KEY;
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Gorse API error (${response.status}): ${errorText || response.statusText}`);
  }

  // Gorse API returns empty body for some endpoints (DELETE, PATCH)
  if (response.status === 204 || response.headers.get('content-length') === '0') {
    return {} as T;
  }

  const data: GorseApiResponse<T> = await response.json();
  return (data.data ?? data) as T;
}

/**
 * Gorse API Service
 */
export class GorseService {
  /**
   * Insert a single user
   * POST /api/user
   */
  static async insertUser(user: GorseUserPayload): Promise<void> {
    await gorseFetch('/api/user', {
      method: 'POST',
      body: JSON.stringify(user),
    });
  }

  /**
   * Get a user by ID
   * GET /api/user/{user-id}
   */
  static async getUser(userId: string): Promise<GorseUser | null> {
    try {
      return await gorseFetch<GorseUser>(`/api/user/${encodeURIComponent(userId)}`);
    } catch (error) {
      if (error instanceof Error && error.message.includes('404')) {
        return null;
      }
      throw error;
    }
  }

  /**
   * Delete a user and their feedback
   * DELETE /api/user/{user-id}
   */
  static async deleteUser(userId: string): Promise<void> {
    await gorseFetch(`/api/user/${encodeURIComponent(userId)}`, {
      method: 'DELETE',
    });
  }

  /**
   * Modify a user
   * PATCH /api/user/{user-id}
   */
  static async updateUser(userId: string, user: Partial<GorseUserPayload>): Promise<void> {
    await gorseFetch(`/api/user/${encodeURIComponent(userId)}`, {
      method: 'PATCH',
      body: JSON.stringify(user),
    });
  }

  /**
   * Get users with pagination
   * GET /api/users?cursor={cursor}&n={n}
   */
  static async getUsers(params?: {
    cursor?: string;
    n?: number;
  }): Promise<{ Users: GorseUser[]; Cursor: string }> {
    const searchParams = new URLSearchParams();
    if (params?.cursor) searchParams.set('cursor', params.cursor);
    if (params?.n) searchParams.set('n', params.n.toString());

    const queryString = searchParams.toString();
    const endpoint = queryString ? `/api/users?${queryString}` : '/api/users';

    return await gorseFetch<{ Users: GorseUser[]; Cursor: string }>(endpoint);
  }

  /**
   * Insert multiple users
   * POST /api/users
   */
  static async insertUsers(users: GorseUserPayload[]): Promise<void> {
    await gorseFetch('/api/users', {
      method: 'POST',
      body: JSON.stringify(users),
    });
  }

  /**
   * Convert library user ID to Gorse user ID format
   * Library uses numeric IDs, Gorse uses string IDs with prefix
   */
  static toGorseUserId(libraryUserId: number): string {
    return `user_${libraryUserId}`;
  }

  /**
   * Extract library user ID from Gorse user ID
   */
  static fromGorseUserId(gorseUserId: string): number | null {
    const match = gorseUserId.match(/^user_(\d+)$/);
    return match ? parseInt(match[1], 10) : null;
  }

  /**
   * Create Gorse user payload from library user data
   */
  static createUserPayload(
    userId: number,
    options?: {
      labels?: string[];
      subscribe?: string[];
      comment?: string;
    }
  ): GorseUserPayload {
    return {
      UserId: this.toGorseUserId(userId),
      Labels: options?.labels || [],
      Subscribe: options?.subscribe || [],
      Comment: options?.comment || '',
    };
  }
}

/**
 * Usage Examples:
 *
 * // Insert a single user
 * await GorseService.insertUser({
 *   UserId: 'user_123',
 *   Labels: ['premium', 'reader'],
 *   Comment: 'John Doe',
 * });
 *
 * // Get a user
 * const user = await GorseService.getUser('user_123');
 *
 * // Update a user
 * await GorseService.updateUser('user_123', {
 *   Labels: ['premium', 'vip'],
 * });
 *
 * // Delete a user
 * await GorseService.deleteUser('user_123');
 *
 * // Get all users with pagination
 * const result = await GorseService.getUsers({ n: 100 });
 * console.log(result.Users); // Array of users
 * console.log(result.Cursor); // Cursor for next page
 *
 * // Insert multiple users
 * await GorseService.insertUsers([
 *   { UserId: 'user_1', Comment: 'User 1' },
 *   { UserId: 'user_2', Comment: 'User 2' },
 * ]);
 *
 * // Integration with library system:
 * // After creating a user in the library system, sync to Gorse:
 * const newUser = await prisma.user.create({ ... });
 * await GorseService.insertUser(
 *   GorseService.createUserPayload(newUser.id, {
 *     comment: newUser.fullName,
 *   })
 * );
 */
