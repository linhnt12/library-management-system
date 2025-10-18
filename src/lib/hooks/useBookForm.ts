import { BookApi } from '@/api';
import { SelectOption } from '@/components/forms/FormSelectSearch';
import { ROUTES } from '@/constants';
import { useDialog, useFormSubmission } from '@/lib/hooks';
import { CreateBookFormState, FormErrors, validateCreateBook } from '@/lib/validators';
import { Book, CreateBookData, UpdateBookData } from '@/types/book';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';

const initialState: CreateBookFormState = {
  authorId: '',
  title: '',
  isbn: '',
  publishYear: '',
  publisher: '',
  pageCount: '',
  price: '',
  edition: '',
  type: 'PRINT',
  description: '',
  coverImageUrl: '',
  categories: [],
  isDeleted: false,
};

export function useBookForm(bookId?: number) {
  const router = useRouter();
  const [form, setForm] = useState<CreateBookFormState>(initialState);
  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState(!!bookId);
  const isEditMode = !!bookId;

  // Single form submission hook with dynamic messages
  const { submit, isSubmitting } = useFormSubmission<
    CreateBookFormState,
    CreateBookData | UpdateBookData,
    Book
  >({
    successMessage: isEditMode ? 'Book updated successfully' : 'Book added successfully',
    errorMessage: isEditMode ? 'Failed to update book' : 'Failed to add book',
  });

  const { dialog, openDialog, handleConfirm, handleCancel: handleDialogCancel } = useDialog();

  // Load book data when editing
  useEffect(() => {
    if (!bookId) return;

    const loadBook = async () => {
      try {
        setIsLoading(true);
        const book = await BookApi.getBookById(bookId);

        // Transform book data to form state
        setForm({
          authorId: String(book.authorId),
          title: book.title || '',
          isbn: book.isbn || '',
          publishYear: book.publishYear ? String(book.publishYear) : '',
          publisher: book.publisher || '',
          pageCount: book.pageCount ? String(book.pageCount) : '',
          price: book.price ? String(book.price) : '',
          edition: book.edition || '',
          type: book.type,
          description: book.description || '',
          coverImageUrl: book.coverImageUrl || '',
          categories: [], // TODO: This will be update later
          isDeleted: book.isDeleted,
        });
      } catch (error) {
        console.error('Failed to load book:', error);
        // Redirect to books list if book not found
        router.push(ROUTES.DASHBOARD.BOOKS);
      } finally {
        setIsLoading(false);
      }
    };

    loadBook();
  }, [bookId, router]);

  const setField = useCallback(
    (key: keyof CreateBookFormState, value: string | SelectOption[] | boolean) => {
      setForm(prev => ({ ...prev, [key]: value }));
      // Clear error when user starts typing
      if (errors[key]) {
        setErrors(prev => ({ ...prev, [key]: undefined }));
      }
    },
    [errors]
  );

  const validate = useCallback((): string | null => {
    const { errors: newErrors, firstError } = validateCreateBook(form);
    setErrors(newErrors as FormErrors);
    return firstError;
  }, [form]);

  // Memoized transform function
  const transformFormData = useCallback(
    (formData: CreateBookFormState) => ({
      authorId: Number(formData.authorId),
      title: formData.title.trim(),
      isbn: formData.isbn.trim() || null,
      publishYear: formData.publishYear ? Number(formData.publishYear) : null,
      publisher: formData.publisher.trim() || null,
      pageCount: formData.pageCount ? Number(formData.pageCount) : null,
      price: formData.price ? Number(formData.price) : null,
      edition: formData.edition.trim() || null,
      type: formData.type,
      description: formData.description.trim() || null,
      coverImageUrl: formData.coverImageUrl.trim() || null,
      isDeleted: formData.isDeleted,
    }),
    []
  );

  const transformDataForCreate = useCallback(
    (formData: CreateBookFormState): CreateBookData =>
      transformFormData(formData) as CreateBookData,
    [transformFormData]
  );

  const transformDataForUpdate = useCallback(
    (formData: CreateBookFormState): UpdateBookData =>
      transformFormData(formData) as UpdateBookData,
    [transformFormData]
  );

  const resetForm = useCallback(() => {
    setForm(initialState);
    setErrors({});
  }, []);

  const handleCancel = useCallback(() => {
    const action = isEditMode ? 'Edit' : 'Add';
    openDialog({
      title: `Cancel ${action} Book`,
      message: `Are you sure you want to cancel? All unsaved changes will be lost.`,
      confirmText: 'Yes, Cancel',
      cancelText: 'No, Continue',
      onConfirm: () => {
        router.push(ROUTES.DASHBOARD.BOOKS);
      },
    });
  }, [isEditMode, openDialog, router]);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();

      // Validate form first
      const firstError = validate();
      if (firstError) {
        return;
      }

      // Open confirmation dialog
      const action = isEditMode ? 'update' : 'add';
      const actionText = isEditMode ? 'Update' : 'Add';
      openDialog({
        title: `Confirm ${actionText} Book`,
        message: `Do you want to ${action} this book "${form.title}"${isEditMode ? '' : ' to the system'}?`,
        confirmText: `${actionText} Book`,
        cancelText: 'Cancel',
        onConfirm: async () => {
          if (isEditMode) {
            await submit(form, {
              validate,
              transformData: transformDataForUpdate,
              apiCall: (data: UpdateBookData) => BookApi.updateBook(bookId!, data),
              onSuccess: () => {
                router.push(ROUTES.DASHBOARD.BOOKS);
              },
            });
          } else {
            await submit(form, {
              validate,
              transformData: transformDataForCreate,
              apiCall: (data: CreateBookData | UpdateBookData) =>
                BookApi.createBook(data as CreateBookData),
              onSuccess: () => {
                resetForm();
                router.push(ROUTES.DASHBOARD.BOOKS);
              },
            });
          }
        },
      });
    },
    [
      isEditMode,
      validate,
      form,
      openDialog,
      transformDataForUpdate,
      transformDataForCreate,
      submit,
      bookId,
      resetForm,
      router,
    ]
  );

  return {
    form,
    errors,
    isSubmitting,
    isLoading,
    isEditMode,
    setField,
    handleSubmit,
    resetForm,
    handleCancel,
    dialog,
    handleConfirm,
    handleDialogCancel,
  };
}
