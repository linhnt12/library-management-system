import { validators } from '@/lib/form-utils';

export type CreateBookFormState = {
  authorId: string;
  title: string;
  isbn: string;
  publishYear: string;
  publisher: string;
  pageCount: string;
  price: string;
  edition: string;
  type: 'PRINT' | 'EBOOK' | 'BOTH';
  description: string;
  coverImageUrl: string;
};

export type FormErrors = {
  authorId?: string;
  title?: string;
  isbn?: string;
  publishYear?: string;
  publisher?: string;
  pageCount?: string;
  price?: string;
  edition?: string;
  type?: string;
  description?: string;
  coverImageUrl?: string;
};

export function validateCreateBook(form: CreateBookFormState): {
  errors: FormErrors;
  firstError: string | null;
} {
  const errors: FormErrors = {};

  const authorIdError = validators.required(form.authorId, 'author ID');
  if (authorIdError) errors.authorId = authorIdError;

  const titleError = validators.required(form.title, 'book title');
  if (titleError) errors.title = titleError;

  const authorIdFormatError = validators.positiveInteger(form.authorId, 'Author ID');
  if (authorIdFormatError) errors.authorId = authorIdFormatError;

  const publishYearError = validators.numeric(form.publishYear, 'The publish year');
  if (publishYearError) errors.publishYear = publishYearError;

  const pageCountError = validators.numeric(form.pageCount, 'The page count');
  if (pageCountError) errors.pageCount = pageCountError;

  const priceError = validators.numeric(form.price, 'The price');
  if (priceError) errors.price = priceError;

  const firstError = Object.values(errors).find(Boolean) || null;

  return { errors, firstError };
}
