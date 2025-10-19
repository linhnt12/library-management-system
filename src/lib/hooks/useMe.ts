import { AuthApi } from '@/api';
import { AuthUser } from '@/types/auth';
import { useQuery, useQueryClient } from '@tanstack/react-query';

export const meQueryKey = ['me'] as const;

export function useMe() {
  return useQuery({
    queryKey: meQueryKey,
    queryFn: async (): Promise<AuthUser> => {
      try {
        return await AuthApi.me();
      } catch (error) {
        // If token is invalid/expired, try to refresh
        if (error instanceof Error && error.message.includes('Invalid or expired token')) {
          try {
            await AuthApi.refresh();
            return await AuthApi.me();
          } catch (refreshError) {
            // If refresh fails, clear session and redirect to login
            await AuthApi.logout();
            throw refreshError;
          }
        }
        throw error;
      }
    },
    staleTime: 5 * 60 * 1000,
    retry: false,
  });
}

export function prefetchMe(queryClient: ReturnType<typeof useQueryClient>) {
  return queryClient.prefetchQuery({ queryKey: meQueryKey, queryFn: AuthApi.me });
}
