'use client';

import { Button } from '@/components/buttons';
import { HStack, Image, Text, VStack } from '@chakra-ui/react';
import { usePathname } from 'next/navigation';
import { IconType } from 'react-icons';
import { IoLogOutOutline, IoSettingsOutline } from 'react-icons/io5';

type SidebarProps = {
  items: {
    label: string;
    href: string;
    icon?: IconType;
  }[];
};

export function Sidebar({ items = [] }: SidebarProps) {
  const pathname = usePathname();

  return (
    <VStack gap={4} px={6} py={4} align="stretch" w="full">
      <HStack align="center" gap={2} py={6} px={4}>
        <Image src="/logo.png" alt="Logo" h="28px" />
        <Text fontSize="2xl" fontWeight="semibold" lineHeight="0">
          LIBRA
        </Text>
      </HStack>

      {items.map(item => {
        const isActive = pathname === item.href;
        return (
          <Button
            key={item.href}
            href={item.href}
            label={item.label}
            icon={item.icon}
            isActive={isActive}
            variantType="sidebar"
          />
        );
      })}

      <HStack my={4} h="1px" bg="gray.200" />

      <Button
        href="/settings"
        label="Settings"
        icon={IoSettingsOutline}
        isActive={pathname === '/settings'}
        variantType="sidebar"
      />

      <Button href="/logout" label="Logout" icon={IoLogOutOutline} variantType="sidebar" />
    </VStack>
  );
}
