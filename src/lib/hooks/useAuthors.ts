import { useQuery } from '@tanstack/react-query';
import { SelectOption } from '@/components';
import { AuthorService } from '@/api';
import { Author } from '@/types';

export function useAuthors() {
  return useQuery({
    queryKey: ['authors'],
    queryFn: async (): Promise<Author[]> => {
      return AuthorService.getAuthors();
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

// Helper function to convert authors to SelectOption format
export function useAuthorOptions(): SelectOption[] {
  const { data: authors } = useAuthors();

  return (
    authors?.map(author => ({
      value: author.id.toString(),
      label: author.fullName,
    })) || []
  );
}
