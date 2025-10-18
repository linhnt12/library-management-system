'use client';

import { BookItemForm } from '@/components';
import { useParams } from 'next/navigation';

export default function EditBookCopyPage() {
  const params = useParams();
  const bookItemId = parseInt(params.id as string);

  return (
    <BookItemForm bookItemId={bookItemId} submitLabel="Update Book Copy" cancelLabel="Cancel" />
  );
}
