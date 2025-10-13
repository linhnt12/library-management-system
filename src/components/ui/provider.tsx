'use client';

import { appSystem } from '@/lib/theme';
import { ChakraProvider } from '@chakra-ui/react';
import { ColorModeProvider, type ColorModeProviderProps } from './color-mode';

export function Provider(props: ColorModeProviderProps) {
  return (
    <ChakraProvider value={appSystem}>
      <ColorModeProvider {...props} />
    </ChakraProvider>
  );
}
