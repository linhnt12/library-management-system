'use client';

import { Layout, Sidebar } from '@/components/layout';
import { ReactNode } from 'react';

const sidebarItems = [
  { label: 'Dashboard', href: '/admin' },
  { label: 'Users', href: '/admin/users' },
  { label: 'Reports', href: '/admin/reports' },
];

export default function AdminLayout({ children }: { children: ReactNode }) {
  return <Layout sidebar={<Sidebar items={sidebarItems} />}>{children}</Layout>;
}
