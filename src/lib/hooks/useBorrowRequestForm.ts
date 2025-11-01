import { useDialog } from '@/lib/hooks';
import { useCallback, useEffect, useRef, useState } from 'react';

interface BorrowRequestFormState {
  startDate: string;
  endDate: string;
}

interface BorrowRequestFormErrors {
  startDate?: string;
  endDate?: string;
}

interface UseBorrowRequestFormOptions {
  bookId: number;
  user?: { id: number; fullName: string } | null;
  onCreateBorrowRequest?: (data: {
    userId: number;
    bookId: number;
    startDate: string;
    endDate: string;
  }) => Promise<void>;
}

const initialState: BorrowRequestFormState = {
  startDate: '',
  endDate: '',
};

// Helper to get today's date in YYYY-MM-DD format
const getTodayDate = (): string => {
  const today = new Date();
  return today.toISOString().split('T')[0];
};

// Helper to get date 30 days from start date
const getMaxEndDate = (startDate: string): string => {
  if (!startDate) return '';
  const date = new Date(startDate);
  date.setDate(date.getDate() + 30);
  return date.toISOString().split('T')[0];
};

export function useBorrowRequestForm({
  bookId,
  user,
  onCreateBorrowRequest,
}: UseBorrowRequestFormOptions) {
  const { dialog, openDialog, closeDialog } = useDialog();
  const [form, setForm] = useState<BorrowRequestFormState>(initialState);
  const [errors, setErrors] = useState<BorrowRequestFormErrors>({});
  const formRef = useRef<BorrowRequestFormState>(form);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [hasAttemptedSubmit, setHasAttemptedSubmit] = useState(false);

  // Keep formRef in sync with form state
  useEffect(() => {
    formRef.current = form;
  }, [form]);

  const setField = useCallback(
    (key: keyof BorrowRequestFormState, value: string) => {
      setForm(prev => {
        const newForm = { ...prev, [key]: value };

        // Auto-update endDate max when startDate changes
        if (key === 'startDate' && value) {
          const maxEndDate = getMaxEndDate(value);
          // If current endDate is beyond max, adjust it
          if (newForm.endDate && newForm.endDate > maxEndDate) {
            newForm.endDate = maxEndDate;
          }
        }

        return newForm;
      });

      // Clear error when user starts typing
      if (errors[key]) {
        setErrors(prev => ({ ...prev, [key]: undefined }));
      }
    },
    [errors]
  );

  const validate = useCallback(
    (formData?: BorrowRequestFormState, forceValidation = false): boolean => {
      // Only validate if user has attempted to submit or if forced
      if (!hasAttemptedSubmit && !forceValidation) {
        return true;
      }

      const dataToValidate = formData || formRef.current;
      const newErrors: BorrowRequestFormErrors = {};
      const today = getTodayDate();

      // Validate startDate
      if (!dataToValidate.startDate) {
        newErrors.startDate = 'Please select start date!';
      } else if (dataToValidate.startDate < today) {
        newErrors.startDate = 'Start date cannot be in the past!';
      }

      // Validate endDate
      if (!dataToValidate.endDate) {
        newErrors.endDate = 'Please select return date!';
      } else if (dataToValidate.startDate && dataToValidate.endDate < dataToValidate.startDate) {
        newErrors.endDate = 'Return date must be after start date!';
      } else if (dataToValidate.startDate) {
        const startDate = new Date(dataToValidate.startDate);
        const endDate = new Date(dataToValidate.endDate);
        const diffTime = endDate.getTime() - startDate.getTime();
        const diffDays = diffTime / (1000 * 60 * 60 * 24);

        if (diffDays > 30) {
          newErrors.endDate = 'Borrow period cannot exceed 30 days!';
        }
      }

      setErrors(newErrors);
      return Object.keys(newErrors).length === 0;
    },
    [hasAttemptedSubmit]
  );

  const resetForm = useCallback(() => {
    setForm({
      startDate: '',
      endDate: '',
    });
    setErrors({});
    setHasAttemptedSubmit(false);
  }, []);

  const handleBorrowSubmit = useCallback(
    async (data: BorrowRequestFormState) => {
      if (!user || !onCreateBorrowRequest) return;

      try {
        setSubmitError(null);
        await onCreateBorrowRequest({
          userId: user.id,
          bookId: bookId,
          startDate: data.startDate,
          endDate: data.endDate,
        });
        closeDialog();
        resetForm();
      } catch (error: unknown) {
        console.error('Failed to create borrow request:', error);
        setSubmitError(error instanceof Error ? error.message : 'Failed to create borrow request');
        closeDialog();
      }
    },
    [user, onCreateBorrowRequest, bookId, closeDialog, resetForm]
  );

  const openBorrowDialog = useCallback(() => {
    setSubmitError(null);
    const today = getTodayDate();
    setForm({
      startDate: today,
      endDate: '',
    });
    setErrors({});
    setHasAttemptedSubmit(false);
    openDialog({
      title: 'Borrow Book',
      message: '',
      confirmText: 'Confirm',
      cancelText: 'Cancel',
      onConfirm: () => {
        setHasAttemptedSubmit(true);
        const currentForm = formRef.current;
        if (validate(currentForm, true)) {
          handleBorrowSubmit(currentForm);
        }
      },
    });
  }, [openDialog, validate, handleBorrowSubmit, setHasAttemptedSubmit]);

  return {
    form,
    errors,
    setField,
    validate,
    resetForm,
    openBorrowDialog,
    dialog,
    closeDialog,
    submitError,
    hasAttemptedSubmit,
  };
}
