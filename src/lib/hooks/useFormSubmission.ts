import { useState, useCallback } from 'react';
import { handleFormSubmission, FormSubmissionOptions } from '@/lib/utils';

// Custom hook to handle form submission with loading state
export function useFormSubmission<T, TData = unknown, TResult = unknown>(
  options: Omit<FormSubmissionOptions<T, TData, TResult>, 'validate' | 'transformData' | 'apiCall'>
) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const submit = useCallback(
    async (
      formData: T,
      submissionOptions: Pick<
        FormSubmissionOptions<T, TData, TResult>,
        'validate' | 'transformData' | 'apiCall' | 'onSuccess' | 'onError'
      >
    ): Promise<boolean> => {
      setIsSubmitting(true);

      try {
        const success = await handleFormSubmission(formData, {
          ...options,
          ...submissionOptions,
        } as FormSubmissionOptions<T, TData, TResult>);
        return success;
      } finally {
        setIsSubmitting(false);
      }
    },
    [options]
  );

  return {
    submit,
    isSubmitting,
  };
}

// Custom hook to handle book form submission
export function useBookFormSubmission<T, TData = unknown, TResult = unknown>() {
  const { submit, isSubmitting } = useFormSubmission<T, TData, TResult>({
    successMessage: 'Book added successfully',
    errorMessage: 'Failed to add book',
  });

  return {
    submitBook: submit,
    isSubmitting,
  };
}
