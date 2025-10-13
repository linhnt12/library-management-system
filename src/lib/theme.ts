import {
  createSystem,
  defaultConfig,
  defineConfig,
  defineSemanticTokens,
  defineTokens,
} from '@chakra-ui/react';

const tokens = defineTokens({
  colors: {
    primary: { 200: { value: '#ff7b424d' }, 500: { value: '#ff7b42' } },
    secondary: { 500: { value: '#2D3E5C' } },
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
