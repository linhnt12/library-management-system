'use client';

import { ROUTES } from '@/constants';
import { IoHomeOutline, IoSearchOutline } from 'react-icons/io5';
import { RiBookShelfLine } from 'react-icons/ri';
import { ConditionalLayout } from './ConditionalLayout';

type ClientLayoutWrapperProps = {
  children: React.ReactNode;
};

export function ClientLayoutWrapper({ children }: ClientLayoutWrapperProps) {
  // Sidebar menu items - defined in Client Component
  const sidebarItems = [
    {
      label: 'Home',
      href: ROUTES.HOME,
      icon: IoHomeOutline,
    },
    {
      label: 'Search',
      href: ROUTES.SEARCH,
      icon: IoSearchOutline,
    },
    {
      label: 'My Shelf',
      href: ROUTES.MY_SHELF,
      icon: RiBookShelfLine,
    },
  ];

  return <ConditionalLayout sidebarItems={sidebarItems}>{children}</ConditionalLayout>;
}
