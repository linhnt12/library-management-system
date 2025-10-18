'use client';

import { Button } from '@/components/buttons';
import { HStack, Image, Text, VStack } from '@chakra-ui/react';
import { usePathname } from 'next/navigation';
import { IconType } from 'react-icons';
import { IoLogOutOutline, IoSettingsOutline } from 'react-icons/io5';
import { IoChevronDown, IoChevronUp } from 'react-icons/io5';
import { ROUTES } from '@/constants';
import { useState } from 'react';

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
          <VStack key={item.href} gap={0} align="stretch">
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
                {item.children.map(child => (
                  <Button
                    key={child.href}
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

      <Button
        href={ROUTES.SETTINGS}
        label="Settings"
        icon={IoSettingsOutline}
        isActive={pathname === ROUTES.SETTINGS}
        variantType="sidebar"
      />

      <Button href={ROUTES.LOGOUT} label="Logout" icon={IoLogOutOutline} variantType="sidebar" />
    </VStack>
  );
}
