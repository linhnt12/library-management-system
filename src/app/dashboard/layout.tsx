'use client';

import { Layout, Sidebar } from '@/components';
import { ROUTES } from '@/constants';
import { ReactNode } from 'react';
import { LuBook, LuTags, LuUserPen } from 'react-icons/lu';
import { SlGrid } from 'react-icons/sl';

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const sidebarItems = [
    { label: 'Dashboard', href: ROUTES.DASHBOARD.HOME, icon: SlGrid },
    {
      label: 'Books',
      href: '',
      icon: LuBook,
      children: [
        { label: 'All Books', href: ROUTES.DASHBOARD.BOOKS },
        { label: 'Add Book', href: ROUTES.DASHBOARD.BOOKS_ADD },
        { label: 'Book Copies', href: ROUTES.DASHBOARD.BOOKS_COPIES },
        { label: 'Add Book Copy', href: ROUTES.DASHBOARD.BOOKS_COPIES_ADD },
        { label: 'Book Editions', href: ROUTES.DASHBOARD.BOOKS_EDITIONS },
        { label: 'Add Book Edition', href: ROUTES.DASHBOARD.BOOKS_EDITIONS_ADD },
      ],
    },
    {
      label: 'Authors',
      href: '',
      icon: LuUserPen,
      children: [
        { label: 'All Authors', href: ROUTES.DASHBOARD.AUTHORS },
        { label: 'Add Author', href: ROUTES.DASHBOARD.AUTHORS_ADD },
      ],
    },
    {
      label: 'Categories',
      href: '',
      icon: LuTags,
      children: [
        { label: 'All Categories', href: ROUTES.DASHBOARD.CATEGORIES },
        { label: 'Add Category', href: ROUTES.DASHBOARD.CATEGORIES_ADD },
      ],
    },
    { label: 'Borrowers', href: ROUTES.DASHBOARD.BORROWERS },
  ];

  return <Layout sidebar={<Sidebar items={sidebarItems} />}>{children}</Layout>;
}
