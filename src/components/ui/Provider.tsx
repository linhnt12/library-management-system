'use client';

import { appSystem } from '@/lib/theme';
import { ChakraProvider } from '@chakra-ui/react';
import { ColorModeProvider, type ColorModeProviderProps } from './ColorMode';
import { AuthProvider } from '@/contexts';

export function Provider(props: ColorModeProviderProps) {
  return (
    <ChakraProvider value={appSystem}>
      <AuthProvider>
        <ColorModeProvider {...props} />
      </AuthProvider>
    </ChakraProvider>
  );
}
