import { AuthApi } from '@/api';
import { AuthUser } from '@/types/auth';
import { useQuery, useQueryClient } from '@tanstack/react-query';

export const meQueryKey = ['me'] as const;

export function useMe() {
    return useQuery({
        queryKey: meQueryKey,
        queryFn: async (): Promise<AuthUser> => AuthApi.me(),
        staleTime: 5 * 60 * 1000,
    });
}

export function prefetchMe(queryClient: ReturnType<typeof useQueryClient>) {
    return queryClient.prefetchQuery({ queryKey: meQueryKey, queryFn: AuthApi.me });
}


