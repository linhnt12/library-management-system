import { UnauthorizedError } from '@/lib/errors';
import { getAccessToken, setAuthSession } from '@/lib/utils/auth-utils';

export type JsonResponse<T = unknown> = {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
};

export async function handleJson<T>(response: Response): Promise<T> {
  const json: JsonResponse<T> = await response.json();
  if (!response.ok || json.success === false) {
    const error = json.error || json.message || 'Request failed';
    throw new Error(error);
  }
  return json.data as T;
}

// Event emitter for session expiry
const sessionExpiredCallbacks = new Set<() => void>();

export function onSessionExpired(callback: () => void) {
  sessionExpiredCallbacks.add(callback);
  return () => sessionExpiredCallbacks.delete(callback);
}

function emitSessionExpired() {
  sessionExpiredCallbacks.forEach(callback => callback());
}

// A lightweight fetch helper that retries once after attempting token refresh on 401
export async function fetchWithAuth(
  input: RequestInfo | URL,
  init: RequestInit = {}
): Promise<Response> {
  const response = await fetch(input, init);

  if (response.status !== 401) return response;

  // Attempt to refresh access token using httpOnly cookie
  try {
    const refreshResponse = await fetch('/api/auth/refresh', {
      method: 'POST',
      credentials: 'include',
    });

    // If refresh response is not ok, throw UnauthorizedError
    if (!refreshResponse.ok) {
      // Call logout API to clear server-side session
      try {
        await fetch('/api/auth/logout', {
          method: 'POST',
          credentials: 'include',
        });
      } catch {
        // Ignore logout errors
      }

      // Emit session expired event for UI to handle
      if (typeof window !== 'undefined') {
        emitSessionExpired();
      }

      throw new UnauthorizedError('Your session has expired. Please login again.');
    }

    // If refresh succeeds, we expect { accessToken }
    const data = await handleJson<{ accessToken: string }>(refreshResponse);

    // Persist new access token for subsequent requests
    setAuthSession(data.accessToken);

    // Retry original request with updated Authorization header (if applicable)
    const token = getAccessToken();

    // Normalize headers to a Headers instance so we can overwrite Authorization
    const headers = new Headers(init.headers as HeadersInit | undefined);
    if (token) headers.set('Authorization', `Bearer ${token}`);

    const retryInit: RequestInit = { ...init, headers };
    return await fetch(input, retryInit);
  } catch (error) {
    // If it's already an UnauthorizedError, re-throw it
    if (error instanceof UnauthorizedError) {
      throw error;
    }

    // On any other refresh failure (network error, etc.), call logout API
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      });
    } catch {
      // Ignore logout errors
    }

    // Emit session expired event for UI to handle
    if (typeof window !== 'undefined') {
      emitSessionExpired();
    }

    throw new UnauthorizedError('Your session has expired. Please login again.');
  }
}
