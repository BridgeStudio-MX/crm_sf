import { type JSX, createContext } from 'react';

import { persistedColorSchemeState } from '@/ui/theme/states/persistedColorSchemeState';
import { useAtomState } from '@/ui/utilities/state/jotai/hooks/useAtomState';
import { type ColorScheme } from 'twenty-ui/input';
import { ThemeProvider } from 'twenty-ui/theme-constants';

type BaseThemeProviderProps = {
  children: JSX.Element | JSX.Element[];
};

export const ThemeSchemeContext = createContext<(theme: ColorScheme) => void>(
  () => {},
);

export const BaseThemeProvider = ({ children }: BaseThemeProviderProps) => {
  const [persistedColorScheme, setPersistedColorScheme] = useAtomState(
    persistedColorSchemeState,
  );

  // Parks demo default: Light. Explicit Dark still works from Settings.
  const effectiveColorScheme =
    persistedColorScheme === 'Dark' ? 'Dark' : 'Light';

  return (
    <ThemeSchemeContext.Provider value={setPersistedColorScheme}>
      <ThemeProvider
        colorScheme={effectiveColorScheme === 'Dark' ? 'dark' : 'light'}
      >
        {children}
      </ThemeProvider>
    </ThemeSchemeContext.Provider>
  );
};
