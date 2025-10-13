import {
  createSystem,
  defaultConfig,
  defineConfig,
  defineSemanticTokens,
  defineTokens,
} from '@chakra-ui/react';

const tokens = defineTokens({
  colors: {
    primary: { 500: { value: '#ff7b42' } },
    layoutBg: { 500: { value: '#f7f6f4' } },
    primaryText: { 500: { value: '#191d26' } },
    secondaryText: { 500: { value: '#62716e' } },
  },
});

const semanticTokens = defineSemanticTokens({
  colors: {
    bg: { value: { _light: 'white', _dark: 'gray.900' } },
  },
});

export const appSystem = createSystem(
  defaultConfig,
  defineConfig({ theme: { tokens, semanticTokens } })
);
