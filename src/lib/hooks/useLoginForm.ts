import { ROUTES } from '@/constants';
import { useFormSubmission } from '@/lib/hooks';
import { LoginFormState, LoginFormErrors, validateLogin } from '@/lib/validators';
import { LoginRequest } from '@/types/auth';
import { useAuth } from '@/contexts';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

const initialState: LoginFormState = {
  email: '',
  password: '',
};

export function useLoginForm() {
  const router = useRouter();
  const { login } = useAuth();
  const [form, setForm] = useState<LoginFormState>(initialState);
  const [errors, setErrors] = useState<LoginFormErrors>({});
  const { submit, isSubmitting } = useFormSubmission<LoginFormState, LoginRequest, void>({
    successMessage: 'Login successful',
    errorMessage: 'Login failed',
  });

  const setField = (key: keyof LoginFormState, value: string) => {
    setForm(prev => ({ ...prev, [key]: value }));
    // Clear error when user starts typing
    if (errors[key]) {
      setErrors(prev => ({ ...prev, [key]: undefined }));
    }
  };

  const validate = (): string | null => {
    const { errors: newErrors, firstError } = validateLogin(form);
    setErrors(newErrors);
    return firstError;
  };

  const transformData = (formData: LoginFormState): LoginRequest => ({
    email: formData.email.trim(),
    password: formData.password,
  });

  const resetForm = () => {
    setForm(initialState);
    setErrors({});
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate form first
    const firstError = validate();
    if (firstError) {
      return;
    }

    // Submit form
    await submit(form, {
      validate,
      transformData,
      apiCall: login,
      onSuccess: () => {
        resetForm();
        // Router will be handled by middleware
        router.push(ROUTES.LIBRARIAN.DASHBOARD);
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
  };
}
