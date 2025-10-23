'use client';

import { AuthApi } from '@/api';
import { Button } from '@/components/buttons';
import { ROUTES } from '@/constants';
import { HStack, Image, Text, VStack } from '@chakra-ui/react';
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';
import { IconType } from 'react-icons';
import { IoChevronDown, IoChevronUp, IoLogOutOutline, IoSettingsOutline } from 'react-icons/io5';

type SidebarItem = {
  label: string;
  href: string;
  icon?: IconType;
  children?: SidebarItem[];
};

type SidebarProps = {
  items: SidebarItem[];
};

export function Sidebar({ items = [] }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  // Auto-expand submenus that have active children
  const getInitialExpandedItems = () => {
    const expanded: string[] = [];
    items.forEach(item => {
      if (item.children) {
        const hasActiveChild = item.children.some(
          child => pathname === child.href || pathname.startsWith(`${child.href}/`)
        );
        if (hasActiveChild) {
          expanded.push(item.label);
        }
      }
    });
    return expanded;
  };

  const [expandedItems, setExpandedItems] = useState<string[]>(getInitialExpandedItems);

  // Check if the path is active (exact match only)
  const isPathActive = (currentPath: string, href: string) => {
    if (href === '/') return currentPath === '/';
    return currentPath === href;
  };

  // Toggle submenu
  const toggleSubmenu = (label: string) => {
    setExpandedItems(prev =>
      prev.includes(label) ? prev.filter(item => item !== label) : [...prev, label]
    );
  };

  const handleLogout = async () => {
    try {
      await AuthApi.logout();
    } finally {
      router.replace(ROUTES.AUTH.LOGIN);
    }
  };

  return (
    <VStack gap={4} px={6} py={4} align="stretch" w="full">
      <HStack align="center" gap={2} py={6} px={4}>
        <Image src="/logo.png" alt="Logo" h="28px" />
        <Text fontSize="2xl" fontWeight="semibold" lineHeight="0">
          LIBRA
        </Text>
      </HStack>

      {items.map(item => {
        const isActive = isPathActive(pathname, item.href);
        const hasChildren = item.children && item.children.length > 0;
        const isExpanded = expandedItems.includes(item.label);

        return (
          <VStack key={item.label} gap={0} align="stretch">
            {/* Main item */}
            <Button
              href={hasChildren || !item.href ? undefined : item.href}
              label={item.label}
              icon={item.icon}
              isActive={isActive}
              variantType="sidebar"
              onClick={hasChildren ? () => toggleSubmenu(item.label) : undefined}
              rightIcon={hasChildren ? (isExpanded ? IoChevronUp : IoChevronDown) : undefined}
            />

            {/* Submenu items */}
            {hasChildren && isExpanded && item.children && (
              <VStack gap={1} align="stretch" pl={8} mt={1}>
                {item.children.map((child, index) => (
                  <Button
                    key={`${item.label}-${child.label}-${index}`}
                    href={child.href}
                    label={child.label}
                    isActive={pathname === child.href}
                    variantType="sidebar-submenu"
                  />
                ))}
              </VStack>
            )}
          </VStack>
        );
      })}

      <HStack my={4} h="1px" bg="gray.200" />

      {/* TODO: This will be only displayed for admin and librarian */}
      <Button
        href={ROUTES.SETTINGS}
        label="Settings"
        icon={IoSettingsOutline}
        isActive={pathname === ROUTES.SETTINGS}
        variantType="sidebar"
      />

      <Button onClick={handleLogout} label="Logout" icon={IoLogOutOutline} variantType="sidebar" />
    </VStack>
  );
}
