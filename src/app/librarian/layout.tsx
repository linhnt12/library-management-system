'use client';

import { Layout, Sidebar } from '@/components/layout';
import { ReactNode } from 'react';
import { LuBook } from 'react-icons/lu';
import { SlGrid } from 'react-icons/sl';

const sidebarItems = [
  { label: 'Dashboard', href: '/librarian', icon: SlGrid },
  { label: 'Books', href: '/librarian/books', icon: LuBook },
  { label: 'Borrowers', href: '/librarian/borrowers' },
];

export default function LibrarianLayout({ children }: { children: ReactNode }) {
  return <Layout sidebar={<Sidebar items={sidebarItems} />}>{children}</Layout>;
}
