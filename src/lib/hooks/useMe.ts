import { AuthApi } from '@/api';
import { AuthUser } from '@/types/auth';
import { useQuery } from '@tanstack/react-query';

export const meQueryKey = ['me'] as const;

export function useMe() {
  return useQuery({
    queryKey: meQueryKey,
    queryFn: async (): Promise<AuthUser | undefined> => {
      try {
        return await AuthApi.me();
      } catch {
        // If token is invalid/expired, try to refresh
        try {
          await AuthApi.refresh();
          return await AuthApi.me();
        } catch {
          await AuthApi.logout();
          return undefined;
        }
      }
    },
    staleTime: 5 * 60 * 1000,
    retry: false,
  });
}
