'use client';

import { Layout, Sidebar } from '@/components';
import { ROUTES } from '@/constants';
import { useMe } from '@/lib/hooks';
import { useRouter } from 'next/navigation';
import { ReactNode, useEffect } from 'react';
import { LuBook, LuTrendingUp, LuUsers } from 'react-icons/lu';
import { SlGrid } from 'react-icons/sl';

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const { data: user, isLoading } = useMe();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user) {
      router.replace(ROUTES.LOGIN);
    }
  }, [isLoading, user, router]);

  if (isLoading) return null;

  // TODO: This will be updated later
  // Base sidebar items for all users
  const baseSidebarItems = [
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
    { label: 'Borrowers', href: ROUTES.DASHBOARD.BORROWERS },
  ];

  //  TODO: This will be updated later
  // Admin-only sidebar items
  const adminSidebarItems = [
    { label: 'Users', href: ROUTES.DASHBOARD.USERS, icon: LuUsers },
    { label: 'Reports', href: ROUTES.DASHBOARD.REPORTS, icon: LuTrendingUp },
  ];

  // TODO: This will be updated later
  // Combine sidebar items based on user role
  const sidebarItems =
    user?.role === 'ADMIN' ? [...baseSidebarItems, ...adminSidebarItems] : baseSidebarItems;

  return <Layout sidebar={<Sidebar items={sidebarItems} />}>{children}</Layout>;
}
