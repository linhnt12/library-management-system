'use client';

import { Layout, Sidebar } from '@/components';
import { ROUTES } from '@/constants';
import { ReactNode } from 'react';
import { LuBook } from 'react-icons/lu';
import { SlGrid } from 'react-icons/sl';

const sidebarItems = [
  { label: 'Dashboard', href: ROUTES.LIBRARIAN.DASHBOARD, icon: SlGrid },
  {
    label: 'Books',
    href: '',
    icon: LuBook,
    children: [
      { label: 'All Books', href: ROUTES.LIBRARIAN.BOOKS },
      { label: 'Add Book', href: ROUTES.LIBRARIAN.BOOKS_ADD },
      { label: 'Book Copies', href: ROUTES.LIBRARIAN.BOOKS_COPIES },
      { label: 'Add Book Copy', href: ROUTES.LIBRARIAN.BOOKS_COPIES_ADD },
      { label: 'Book Editions', href: ROUTES.LIBRARIAN.BOOKS_EDITIONS },
      { label: 'Add Book Edition', href: ROUTES.LIBRARIAN.BOOKS_EDITIONS_ADD },
    ],
  },
  { label: 'Borrowers', href: ROUTES.LIBRARIAN.BORROWERS },
];

export default function LibrarianLayout({ children }: { children: ReactNode }) {
  return <Layout sidebar={<Sidebar items={sidebarItems} />}>{children}</Layout>;
}
