'use client';

import { Layout, Sidebar } from '@/components/layout';
import { ReactNode } from 'react';
import { ROUTES } from '@/constants';

const sidebarItems = [
  { label: 'Dashboard', href: ROUTES.ADMIN.DASHBOARD },
  { label: 'Users', href: ROUTES.ADMIN.USERS },
  { label: 'Reports', href: ROUTES.ADMIN.REPORTS },
];

export default function AdminLayout({ children }: { children: ReactNode }) {
  return <Layout sidebar={<Sidebar items={sidebarItems} />}>{children}</Layout>;
}
