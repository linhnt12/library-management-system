import { AuthApi } from '@/api';
import { queryClient } from '@/lib/query-client';
import { AuthUser, UpdateMeData } from '@/types';
import { useState } from 'react';
import { meQueryKey } from './useMe';

export function useUpdateMe() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateProfile = async (
    data: UpdateMeData,
    options?: {
      onSuccess?: (user: AuthUser) => void;
      onError?: (error: Error) => void;
    }
  ): Promise<{ success: boolean; user?: AuthUser; error?: string }> => {
    try {
      setIsLoading(true);
      setError(null);

      // Call API to update profile
      const updatedUser = await AuthApi.updateMe(data);

      // Update the cache with the new user data
      queryClient.setQueryData(meQueryKey, updatedUser);
      // Also invalidate to ensure fresh data
      queryClient.invalidateQueries({ queryKey: meQueryKey });

      // Call onSuccess callback if provided
      if (options?.onSuccess) {
        options.onSuccess(updatedUser);
      }

      return { success: true, user: updatedUser };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update profile';
      setError(errorMessage);

      // Call onError callback if provided
      if (options?.onError && err instanceof Error) {
        options.onError(err);
      }

      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  };

  const reset = () => {
    setError(null);
    setIsLoading(false);
  };

  return {
    updateProfile,
    isLoading,
    error,
    reset,
  };
}
