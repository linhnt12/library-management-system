import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { BookService } from '@/services';
import { useBookFormSubmission, useDialog } from '@/lib/hooks';
import { validateCreateBook, CreateBookFormState, FormErrors } from '@/lib/validators';
import { CreateBookData, PublicBook } from '@/types/book';
import { ROUTES } from '@/constants';

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
};

export function useBookForm() {
  const router = useRouter();
  const [form, setForm] = useState<CreateBookFormState>(initialState);
  const [errors, setErrors] = useState<FormErrors>({});
  const { submitBook, isSubmitting } = useBookFormSubmission<
    CreateBookFormState,
    CreateBookData,
    PublicBook
  >();
  const { dialog, openDialog, handleConfirm, handleCancel: handleDialogCancel } = useDialog();

  const setField = (key: keyof CreateBookFormState, value: string) => {
    setForm(prev => ({ ...prev, [key]: value }));
    // Clear error when user starts typing
    if (errors[key]) {
      setErrors(prev => ({ ...prev, [key]: undefined }));
    }
  };

  const validate = (): string | null => {
    const { errors: newErrors, firstError } = validateCreateBook(form);
    setErrors(newErrors as FormErrors);
    return firstError;
  };

  const transformData = (formData: CreateBookFormState): CreateBookData => ({
    authorId: formData.authorId,
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
  });

  const resetForm = () => {
    setForm(initialState);
    setErrors({});
  };

  const handleCancel = () => {
    openDialog({
      title: 'Cancel Add Book',
      message: 'Are you sure you want to cancel? All unsaved changes will be lost.',
      confirmText: 'Yes, Cancel',
      cancelText: 'No, Continue',
      onConfirm: () => {
        router.push(ROUTES.LIBRARIAN.BOOKS);
      },
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate form first
    const firstError = validate();
    if (firstError) {
      return;
    }

    // Open confirmation dialog
    openDialog({
      title: 'Confirm Add Book',
      message: `Do you want to add this book "${form.title}" to the system?`,
      confirmText: 'Add Book',
      cancelText: 'Cancel',
      onConfirm: async () => {
        await submitBook(form, {
          validate,
          transformData,
          apiCall: BookService.createBook,
          onSuccess: () => {
            resetForm();
            router.push(ROUTES.LIBRARIAN.BOOKS);
          },
        });
      },
    });
  };

  return {
    form,
    errors,
    isSubmitting,
    setField,
    handleSubmit,
    resetForm,
    handleCancel,
    dialog,
    handleConfirm,
    handleDialogCancel,
  };
}
