import { BookApi } from '@/api';
import { toaster } from '@/components';
import { DigitalLicenseModel } from '@prisma/client';
import { FormEvent, useState } from 'react';

interface DigitalLicenseFormState {
  licenseModel: DigitalLicenseModel | '';
  totalCopies: string;
  notes: string;
}

interface DigitalLicenseFormErrors {
  licenseModel?: string;
  totalCopies?: string;
  notes?: string;
}

export function useDigitalLicenseForm(bookId: number, onSuccess?: () => void) {
  const [form, setForm] = useState<DigitalLicenseFormState>({
    licenseModel: '',
    totalCopies: '',
    notes: '',
  });

  const [errors, setErrors] = useState<DigitalLicenseFormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const setField = (field: keyof DigitalLicenseFormState, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: DigitalLicenseFormErrors = {};

    // Validate license model (required)
    if (!form.licenseModel) {
      newErrors.licenseModel = 'License model is required';
    }

    // Validate total copies (optional, but must be positive if provided)
    if (form.totalCopies && form.totalCopies.trim() !== '') {
      const copies = Number(form.totalCopies);
      if (isNaN(copies) || copies <= 0 || !Number.isInteger(copies)) {
        newErrors.totalCopies = 'Total copies must be a positive integer';
      }
    }

    // Validate notes (optional, max length)
    if (form.notes && form.notes.length > 1000) {
      newErrors.notes = 'Notes must not exceed 1000 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      await BookApi.createDigitalLicense(bookId, {
        licenseModel: form.licenseModel as DigitalLicenseModel,
        totalCopies: form.totalCopies ? Number(form.totalCopies) : null,
        notes: form.notes || null,
      });

      toaster.create({
        title: 'Success',
        description: 'Digital license created successfully',
        type: 'success',
      });

      // Reset form
      setForm({
        licenseModel: '',
        totalCopies: '',
        notes: '',
      });
      setErrors({});

      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error('Error creating digital license:', error);
      toaster.create({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to create digital license',
        type: 'error',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    setForm({
      licenseModel: '',
      totalCopies: '',
      notes: '',
    });
    setErrors({});
  };

  return {
    form,
    errors,
    isSubmitting,
    setField,
    handleSubmit,
    handleCancel,
  };
}
