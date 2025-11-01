'use client';

import { ROUTES } from '@/constants';
import { IoHeartOutline, IoHomeOutline, IoSearchOutline } from 'react-icons/io5';
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
      label: 'Favorites',
      href: ROUTES.FAVORITE,
      icon: IoHeartOutline,
    },
    {
      label: 'My Shelf',
      href: '',
      icon: RiBookShelfLine,
      children: [
        {
          label: 'Borrow Requests',
          href: ROUTES.MY_BORROW_REQUESTS,
          icon: RiBookShelfLine,
        },
      ],
    },
  ];

  return <ConditionalLayout sidebarItems={sidebarItems}>{children}</ConditionalLayout>;
}
