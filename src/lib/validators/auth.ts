import { validators } from '@/lib/utils';

export type LoginFormState = {
  email: string;
  password: string;
};

export type LoginFormErrors = {
  email?: string;
  password?: string;
};

export function validateLogin(form: LoginFormState): {
  errors: LoginFormErrors;
  firstError: string | null;
} {
  const errors: LoginFormErrors = {};

  // Validate email
  const emailRequiredError = validators.required(form.email, 'Email');
  if (emailRequiredError) {
    errors.email = emailRequiredError;
  } else {
    const emailFormatError = validators.email(form.email);
    if (emailFormatError) {
      errors.email = emailFormatError;
    }
  }

  // Validate password
  const passwordError = validators.required(form.password, 'Password');
  if (passwordError) errors.password = passwordError;

  const firstError = Object.values(errors).find(Boolean) || null;

  return { errors, firstError };
}
