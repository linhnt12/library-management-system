'use client';

import { Layout, Sidebar } from '@/components/layout';
import { ReactNode } from 'react';
import { LuBook } from 'react-icons/lu';
import { SlGrid } from 'react-icons/sl';
import { ROUTES } from '@/constants';

const sidebarItems = [
  { label: 'Dashboard', href: ROUTES.LIBRARIAN.DASHBOARD, icon: SlGrid },
  { label: 'Books', href: ROUTES.LIBRARIAN.BOOKS, icon: LuBook },
  { label: 'Borrowers', href: ROUTES.LIBRARIAN.BORROWERS },
];

export default function LibrarianLayout({ children }: { children: ReactNode }) {
  return <Layout sidebar={<Sidebar items={sidebarItems} />}>{children}</Layout>;
}
