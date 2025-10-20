import { meQueryKey } from '@/lib/hooks/useMe';
import { queryClient } from '@/lib/query-client';
import { clearAuthSession, getAccessToken, setAuthSession } from '@/lib/utils/auth-utils';

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

// Helper function to clear authentication and invalidate user query
function clearAuthAndInvalidateUser(): void {
  clearAuthSession();
  // Invalidate the user query to force it to return undefined
  if (typeof window !== 'undefined') {
    queryClient.setQueryData(meQueryKey, null);
    queryClient.invalidateQueries({ queryKey: meQueryKey });
  }
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

    // If refresh response is not ok, call logout API to clear server-side session
    if (!refreshResponse.ok) {
      try {
        await fetch('/api/auth/logout', {
          method: 'POST',
          credentials: 'include',
        });
      } finally {
        clearAuthAndInvalidateUser();
      }
      return response;
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
  } catch {
    // On any other refresh failure (network error, etc.), call logout API
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      });
    } finally {
      clearAuthAndInvalidateUser();
    }
    return response;
  }
}
